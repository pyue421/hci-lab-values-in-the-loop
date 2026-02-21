export const userHomeCoordinates = {
  lat: 43.4686,
  lng: -80.5417,
}

export const matches = [
  {
    id: "eloi",
    initials: "EC",
    name: "Eloi Champagne",
    term: "2A Aviation Student",
    compatibility: 92,
    distanceKm: 1.1,
    etaMins: 13,
    seats: 4,
    role: "Driver",
    bufferMins: 47,
    aiSummary: "You both prefer rides that feel like a comfortable trip from start to finish.",
    signalProfileA: [78, 62, 55, 30, 60, 88],
    signalProfileB: [80, 90, 42, 26, 48, 72],
    locationLabel: "Aviation Hall, Waterloo",
    interests: [
      { label: "Knitting", emoji: "🧶", tone: "warm" },
      { label: "Video Games", emoji: "🎮", tone: "cool" },
      { label: "Cycling", emoji: "🚴", tone: "bright" },
    ],
    valueMatchScores: {
      Punctuality: 64,
      Kindness: 52,
      Trustworthiness: 46,
    },
    values: ["Punctuality", "Kindness", "Trustworthiness"],
    coordinates: { lat: 43.474, lng: -80.538 },
  },
  {
    id: "maya",
    initials: "ML",
    name: "Maya Liu",
    term: "3B Co-op Student",
    compatibility: 88,
    distanceKm: 2.3,
    etaMins: 18,
    seats: 3,
    role: "Rider",
    bufferMins: 32,
    aiSummary: "You both value predictable schedules and thoughtful communication for smoother pickups.",
    signalProfileA: [70, 58, 66, 41, 72, 64],
    signalProfileB: [74, 54, 60, 48, 67, 70],
    locationLabel: "University Ave, Waterloo",
    interests: [
      { label: "Photography", emoji: "📷", tone: "warm" },
      { label: "Pilates", emoji: "🧘", tone: "cool" },
      { label: "Design", emoji: "🎨", tone: "bright" },
    ],
    valueMatchScores: {
      Efficiency: 68,
      Punctuality: 57,
      Kindness: 44,
    },
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
