import { EVENTS } from "../data/events.data.js";

const EVENT_KEY = "events";

export function getEvents() {
  const data = localStorage.getItem(EVENT_KEY);
  if (data) return JSON.parse(data);

  localStorage.setItem(EVENT_KEY, JSON.stringify(EVENTS));
  return EVENTS;
}

export function saveEvents(events) {
  localStorage.setItem(EVENT_KEY, JSON.stringify(events));
}

export function getEventById(id) {
  return getEvents().find(e => e.id === id);
}
