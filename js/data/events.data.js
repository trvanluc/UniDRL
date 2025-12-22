/**
 * ==========================================
 * EVENTS DATA - ES6 MODULE EXPORT
 * ==========================================
 * Mock database for UniDRL event system
 * Used by: home.page.js, event-detail.page.js
 * ==========================================
 */

export const EVENTS = [
  {
    id: "hackathon-2024",
    title: "Annual Hackathon 2024",
    category: "Academic",
    status: "upcoming",
    points: 50,
    date: "March 15–17, 2024",
    time: "All Day",
    location: "Innovation Hall",
    room: "Main Auditorium",
    seats: { total: 60, left: 12 },
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
    description: `
      <p>The Annual Hackathon 2024 brings together students to solve real-world problems using technology.</p>
      <p>Teams will compete over 48 hours with mentorship from industry experts.</p>
    `,
    organizer: "Tech Innovation Club",
    organizerDept: "Faculty of Engineering",
    organizerAvatar: "https://ui-avatars.com/api/?name=Tech+Club&background=36e27b&color=fff"
  },

  {
    id: "career-fair",
    title: "Career Fair Prep Workshop",
    category: "Workshop",
    status: "upcoming",
    points: 20,
    date: "April 2, 2024",
    time: "9:00 AM – 12:00 PM",
    location: "Career Center",
    room: "Room 201",
    seats: { total: 40, left: 20 },
    image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800",
    description: `
      <p>Prepare your CV, LinkedIn, and interview skills before the Career Fair.</p>
    `,
    organizer: "Career Services",
    organizerDept: "Department of Computer Science",
    organizerAvatar: "https://ui-avatars.com/api/?name=Career+Services&background=3b82f6&color=fff"
  },

  {
    id: "jazz-night",
    title: "Campus Jazz Night",
    category: "Social",
    status: "closed",
    points: 10,
    date: "April 10, 2024",
    time: "6:30 PM – 9:00 PM",
    location: "Student Plaza",
    room: "Outdoor Stage",
    seats: { total: 0, left: 0 },
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
    description: `
      <p>Enjoy a relaxing night of live jazz performed by student bands.</p>
    `,
    organizer: "Music Club",
    organizerDept: "Student Affairs",
    organizerAvatar: "https://ui-avatars.com/api/?name=Music+Club&background=8b5cf6&color=fff"
  },

  {
    id: "robotics",
    title: "Intro to Robotics",
    category: "Academic",
    status: "upcoming",
    points: 30,
    date: "April 18, 2024",
    time: "2:00 PM – 5:00 PM",
    location: "Engineering Lab",
    room: "Lab 3",
    seats: { total: 30, left: 15 },
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800",
    description: `
      <p>Hands-on introduction to robotics and automation.</p>
    `,
    organizer: "Robotics Society",
    organizerDept: "Faculty of Engineering",
    organizerAvatar: "https://ui-avatars.com/api/?name=Robotics&background=f59e0b&color=fff"
  },

  {
    id: "yoga-week",
    title: "Wellness Week: Yoga",
    category: "Sports",
    status: "upcoming",
    points: 15,
    date: "April 22, 2024",
    time: "7:00 AM – 8:00 AM",
    location: "Sports Complex",
    room: "Yoga Room",
    seats: { total: 25, left: 10 },
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
    description: `
      <p>Start your day refreshed with guided yoga sessions.</p>
    `,
    organizer: "Wellness Center",
    organizerDept: "Student Support Services",
    organizerAvatar: "https://ui-avatars.com/api/?name=Wellness&background=10b981&color=fff"
  },

  {
    id: "leadership-summit",
    title: "Student Leadership Summit",
    category: "Academic",
    status: "upcoming",
    points: 40,
    date: "May 5, 2024",
    time: "8:30 AM – 4:30 PM",
    location: "Conference Hall",
    room: "Hall A",
    seats: { total: 50, left: 5 },
    image: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800",
    description: `
      <p>Develop leadership skills with keynote speakers and workshops.</p>
    `,
    organizer: "Student Affairs",
    organizerDept: "University Administration",
    organizerAvatar: "https://ui-avatars.com/api/?name=Leadership&background=ef4444&color=fff"
  },
  
  {
     id: "blockchain-workshop",
    title: "Blockchain & Web3 Workshop",
    category: "Workshop",
    status: "upcoming",
    points: 35,
    date: "May 15, 2024",
    time: "1:00 PM – 5:00 PM",
    location: "Tech Hub",
    room: "Innovation Lab",
    seats: { total: 35, left: 18 },
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800",
    description: `
      <p>Explore the fundamentals of blockchain technology and Web3 development.</p>
      <p>Learn about smart contracts, decentralized applications, and the future of the internet.</p>
    `,
    organizer: "Blockchain Club",
    organizerDept: "Faculty of Computer Science",
    organizerAvatar: "https://ui-avatars.com/api/?name=Blockchain+Club&background=6366f1&color=fff"
  }
];
