export const matches = [
  {
    id: "eloi",
    initials: "EC",
    name: "Eloi Champagne",
    subtitle: "2A Aviation Student",
    compatibility: 92,
    distanceKm: 1.1,
    etaMins: 13,
    seats: 4,
    role: "Driver",
    bufferMins: 47,
    locationLabel: "Aviation Hall, Waterloo",
    interests: ["Knitting", "Video Games", "Cycling"],
    values: ["Punctuality", "Kindness", "Trustworthiness"],
    coordinates: { lat: 43.474, lng: -80.538 },
  },
  {
    id: "maya",
    initials: "ML",
    name: "Maya Liu",
    subtitle: "Co-op CS Student",
    compatibility: 88,
    distanceKm: 2.3,
    etaMins: 18,
    seats: 3,
    role: "Rider",
    bufferMins: 32,
    locationLabel: "University Ave, Waterloo",
    interests: ["Photography", "Pilates", "Design"],
    values: ["Efficiency", "Punctuality", "Kindness"],
    coordinates: { lat: 43.4669, lng: -80.53 },
  },
]

export const weekDays = [
  { key: "mon", label: "Mon 9" },
  { key: "tue", label: "Tue 10" },
  { key: "wed", label: "Wed 11" },
  { key: "thu", label: "Thu 12" },
  { key: "fri", label: "Fri 13" },
]

export const timeSlots = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"]

export const events = [
  { id: "e1", title: "Morning Pickup", day: "mon", start: 1, duration: 2, color: "mint" },
  { id: "e2", title: "Lab Ride", day: "tue", start: 2, duration: 2, color: "blue" },
  { id: "e3", title: "Club Meet", day: "wed", start: 3, duration: 2, color: "peach" },
  { id: "e4", title: "Airport Shift", day: "fri", start: 1, duration: 2, color: "gold" },
]

export const valueWeights = [
  { label: "Environmental Impact", weight: 20, tone: "green" },
  { label: "Punctuality", weight: 20, tone: "rose" },
  { label: "Trustworthiness", weight: 20, tone: "amber" },
  { label: "Efficiency", weight: 20, tone: "cyan" },
  { label: "Kindness", weight: 20, tone: "violet" },
]
