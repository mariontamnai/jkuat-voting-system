export const mockResults = {
  totalVotes: 200,
  eligibleVoters: 500,
  turnout: 40,
  status: "live",
  lastUpdated: new Date().toISOString(),
  candidates: [
    { id: 1, name: "Catherine Nyambura", faculty: "Agriculture", votes: 61, percentage: 30.5 },
    { id: 2, name: "Alice Wanjiku", faculty: "Engineering", votes: 52, percentage: 26.0 },
    { id: 3, name: "Brian Otieno", faculty: "Business", votes: 48, percentage: 24.0 },
    { id: 4, name: "David Kipchoge", faculty: "ICT", votes: 39, percentage: 19.5 }
  ]
}