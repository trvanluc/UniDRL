import { requireAuth } from "../guards/auth.guard.js";
import { ROLES } from "../config/constants.js";
import { Theme } from "../utils/theme.js";
import { EVENTS } from "../data/events.data.js";
import { Storage } from "../utils/storage.js";
import { setupSettingsDropdown, setupLogout, setupThemeToggle } from "../utils/ui-helpers.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

  if (user.role !== ROLES.STUDENT) {
    window.location.href = "../home.html";
    return;
  }

  Theme.init();
  setupThemeToggle();
  setupSettingsDropdown();
  setupLogout();

  // Render user avatar
  const avatar = document.getElementById("user-avatar-initial");
  if (avatar) {
    avatar.textContent = user.name.charAt(0).toUpperCase();
  }

  // Seeding Sample Data (Visual Restoration)
  seedSampleData(user);

  // Load and render journey
  loadJourney(user);
});

/**
 * INJECT SAMPLE DATA (One-time)
 * Restore the visual "Gold/Silver" badges for the user to see
 * if they have no history yet.
 */
function seedSampleData(user) {
  const existing = JSON.parse(localStorage.getItem("event_registrations")) || [];

  // Only seed if empty to avoid messing up real data
  if (existing.length === 0) {
    const sampleData = [
      {
        mssv: user.studentId,
        email: user.email,
        eventId: "hackathon-2024",
        eventTitle: "Annual Hackathon 2024",
        status: "completed",
        registerTime: new Date(Date.now() - 86400000 * 10).toISOString(),
        checkInTime: new Date(Date.now() - 86400000 * 5).toISOString(),
        checkoutTime: new Date(Date.now() - 86400000 * 2).toISOString(),
        badgeEarned: "gold",
        correctAnswers: 5
      },
      {
        mssv: user.studentId,
        email: user.email,
        eventId: "career-fair",
        eventTitle: "Career Fair Prep Workshop",
        status: "completed",
        registerTime: new Date(Date.now() - 86400000 * 20).toISOString(),
        checkInTime: new Date(Date.now() - 86400000 * 15).toISOString(),
        checkoutTime: new Date(Date.now() - 86400000 * 15 + 7200000).toISOString(),
        badgeEarned: "silver",
        correctAnswers: 3
      }
    ];

    localStorage.setItem("event_registrations", JSON.stringify(sampleData));
    console.log("✅ Sample data seeded for visual verification");
  }
}

// State
let allEvents = [];
let currentFilter = 'All';
let searchQuery = '';
let visibleCount = 5;
const ITEMS_PER_PAGE = 5;

function loadJourney(user) {
  try {
    const allRegistrations = JSON.parse(localStorage.getItem("event_registrations")) || [];

    // Filter registrations for current student that are COMPLETED
    const completedEvents = allRegistrations.filter(reg =>
      (reg.mssv === user.studentId || reg.email === user.email) &&
      reg.status === "completed"
    );

    // Sort by checkout time (newest first)
    completedEvents.sort((a, b) => new Date(b.checkoutTime || 0) - new Date(a.checkoutTime || 0));

    // Enrich data with Event details for searching/filtering
    allEvents = completedEvents.map(reg => {
      // Safe find for event
      const eventDetails = EVENTS.find(e => e.id === reg.eventId) || {
        title: reg.eventTitle || "Unknown Event",
        category: "Unknown",
        date: new Date().toISOString(),
        location: "Unknown Location",
        type: "Event"
      };

      // Ensure category exists for filtering
      if (!eventDetails.category) eventDetails.category = "General";

      return { ...reg, eventDetails };
    });

    setupControls();
    filterAndRender();
    updateStats(completedEvents);
  } catch (error) {
    console.error("Error loading journey:", error);
    // Force remove spinner and show error state
    const container = document.querySelector(".space-y-4");
    if (container) {
      container.innerHTML = `
        <div class="text-center py-12 bg-card-dark rounded-xl border border-[#29382f]">
          <span class="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <h3 class="text-xl font-bold text-white mb-2">An error occurred</h3>
          <p class="text-slate-400">Unable to load journey data. Please try again later.</p>
        </div>
      `;
    }
  }
}

function setupControls() {
  // Search
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.toLowerCase();
      visibleCount = ITEMS_PER_PAGE; // Reset pagination on search
      filterAndRender();
    });
  }

  // Filter Buttons
  const filterBtns = document.querySelectorAll("[data-filter]");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Update UI
      filterBtns.forEach(b => {
        b.className = "px-5 py-2.5 rounded-full bg-transparent border border-[#29382f] text-slate-400 font-medium text-sm whitespace-nowrap hover:border-white/20 hover:text-white transition-all";
      });
      btn.className = "px-5 py-2.5 rounded-full bg-primary text-black font-bold text-sm whitespace-nowrap shadow-glow transition-all";

      // Update Logic
      currentFilter = btn.dataset.filter;
      visibleCount = ITEMS_PER_PAGE; // Reset pagination
      filterAndRender();
    });
  });

  // Load More Button
  const loadMoreBtn = document.getElementById("load-more-btn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleCount += ITEMS_PER_PAGE;
      filterAndRender();
    });
  }
}

function filterAndRender() {
  let filtered = allEvents;

  // 1. Filter by Category / Type
  if (currentFilter !== 'All') {
    if (currentFilter === 'Semester') {
      // Filter for current semester (e.g., last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filtered = filtered.filter(item => {
        const itemDate = parseEventDate(item.eventDetails.date);
        return itemDate >= sixMonthsAgo;
      });
    } else if (currentFilter === 'Volunteering') {
      // Filter for Volunteering or Social types (assuming mapping)
      filtered = filtered.filter(item =>
        item.eventDetails.category === 'Volunteering' ||
        item.eventDetails.category === 'Social' // Assuming Social counts roughly as volunteering for now if no explicit category
      );
    } else {
      // Standard category match (e.g. Workshop)
      filtered = filtered.filter(item => item.eventDetails.category.includes(currentFilter));
    }
  }

  // 2. Filter by Search
  if (searchQuery) {
    filtered = filtered.filter(item =>
      item.eventDetails.title.toLowerCase().includes(searchQuery) ||
      (item.badgeEarned && item.badgeEarned.toLowerCase().includes(searchQuery))
    );
  }

  renderJourneyList(filtered, visibleCount);
}

function renderJourneyList(events, limit) {
  const container = document.querySelector(".space-y-4");
  const loadMoreBtn = document.getElementById("load-more-btn");
  if (!container) return;

  if (events.length === 0) {
    // Check if it's because of filters/search or empty history
    const isGlobalEmpty = allEvents.length === 0;

    if (isGlobalEmpty) {
      container.innerHTML = `
        <div class="text-center py-16 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-[#29382f] animate-fade-in">
          <div class="w-20 h-20 mx-auto bg-slate-100 dark:bg-[#29382f] rounded-full flex items-center justify-center mb-6">
            <span class="material-symbols-outlined text-4xl text-slate-500 dark:text-slate-400">rocket_launch</span>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Your journey starts here</h3>
          <p class="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">You haven't participated in any events yet. Explore and register for exciting activities now!</p>
          <a href="../home.html#events" class="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-black font-bold hover:bg-emerald-400 hover:scale-105 transition-all shadow-glow">
            <span class="material-symbols-outlined">explore</span>
            Explore activities
          </a>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="text-center py-12 bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-[#29382f]">
          <span class="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-600 mb-4">search_off</span>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">No results found</h3>
          <p class="text-slate-500 dark:text-slate-400">Try changing the filter or search keyword</p>
          <button onclick="document.getElementById('search-input').value=''; currentFilter='All'; setupControls(); filterAndRender();" 
            class="mt-4 text-primary font-medium hover:underline">
            Clear filters
          </button>
        </div>
      `;
    }
    if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
    return;
  }

  const eventsToShow = events.slice(0, limit);
  const hasMore = events.length > limit;

  // Keep header
  const headerHtml = `
    <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
      <span class="material-symbols-outlined text-primary">history</span>
      Activity History <span class="text-slate-400 text-sm font-normal">(${events.length})</span>
    </h3>
  `;

  const eventsHtml = eventsToShow.map(reg => {
    const eventDetails = reg.eventDetails;
    const eventDate = parseEventDate(eventDetails.date);
    const month = eventDate.toLocaleString('en-US', { month: 'short' });
    const day = eventDate.getDate();
    const startTime = eventDetails.startTime || "08:00";
    const endTime = eventDetails.endTime || "17:00";

    const badgeName = reg.badgeEarned ?
      (reg.badgeEarned.charAt(0).toUpperCase() + reg.badgeEarned.slice(1) + " Badge") :
      "Completion Badge";

    // Define premium styles for badges
    const badgeStyles = {
      gold: "bg-gradient-to-r from-yellow-900/40 to-yellow-600/20 border-yellow-500/50 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]",
      silver: "bg-gradient-to-r from-slate-700/40 to-slate-500/20 border-slate-400/50 text-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.2)]",
      bronze: "bg-gradient-to-r from-orange-900/40 to-orange-700/20 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
      default: "bg-primary/10 border-primary/20 text-primary"
    };

    const badgeIcons = {
      gold: "workspace_premium",
      silver: "military_tech",
      bronze: "stars",
      default: "bolt"
    };

    const badgeKey = reg.badgeEarned || 'default';
    const currentStyle = badgeStyles[badgeKey] || badgeStyles.default;
    const currentIcon = badgeIcons[badgeKey] || badgeIcons.default;

    return `
      <div class="animate-fade-in event-item group relative bg-white dark:bg-card-dark rounded-xl p-5 border border-slate-200 dark:border-[#29382f] hover:border-primary/50 dark:hover:border-primary/30 transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(54,226,123,0.05)]">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 shrink-0">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">${month}</span>
              <span class="text-lg font-bold text-slate-900 dark:text-white">${day}</span>
            </div>
            <div>
              <h4 class="event-title text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">
                ${eventDetails.title}
              </h4>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">schedule</span>
                  ${startTime} - ${endTime}
                </span>
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">location_on</span>
                  ${eventDetails.location}
                </span>
                <span class="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-full">
                  ${eventDetails.category}
                </span>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none border-slate-100 dark:border-white/5">
            <!-- Badge Pill -->
            <div class="flex items-center gap-2 px-4 py-2 rounded-full border ${currentStyle} transition-transform group-hover:scale-105">
              <span class="material-symbols-outlined text-[20px] icon-filled animate-pulse">${currentIcon}</span>
              <span class="text-sm font-bold uppercase tracking-wide">${badgeName}</span>
            </div>

            <!-- Completed Status -->
            <div class="flex items-center gap-2 text-primary animate-fade-in" style="animation-delay: 200ms">
              <span class="material-symbols-outlined icon-filled">check_circle</span>
              <span class="font-bold">Completed</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = headerHtml + eventsHtml;

  // Toggle Load More button
  if (loadMoreBtn) {
    if (hasMore) {
      loadMoreBtn.classList.remove('hidden');
      loadMoreBtn.innerHTML = `Load earlier events (${events.length - eventsToShow.length} remaining) <span class="material-symbols-outlined text-sm">expand_more</span>`;
    } else {
      loadMoreBtn.classList.add('hidden');
    }
  }
}

function updateStats(registrations) {
  // Can be implemented later if we add a stats section
}

/**
 * Helper to parse complex date strings
 * Handles formats like: "March 15–17, 2024" or "April 2, 2024"
 */
function parseEventDate(dateStr) {
  if (!dateStr) return new Date();

  // 1. Try standard parse
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;

  // 2. Handle ranges (convert en-dash to hyphen)
  const cleanStr = dateStr.replace(/–/g, '-');

  // Regex to extract: Month DD... YYYY
  // Matches: "March 15-17, 2024" -> Month="March", Day="15", Year="2024"
  const match = cleanStr.match(/([a-zA-Z]+)\s+(\d+)(?:-\d+)?,\s+(\d{4})/);

  if (match) {
    // Construct "March 15, 2024"
    const [_, month, day, year] = match;
    const constructedDateStr = `${month} ${day}, ${year}`;
    date = new Date(constructedDateStr);
    if (!isNaN(date.getTime())) return date;
  }

  // 3. Last resort fallback
  console.warn("Could not parse date:", dateStr);
  return new Date();
}
