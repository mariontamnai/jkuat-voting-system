let currentVotes = [40, 38, 36, 34];

export const getMockResults = () => {
  const total = currentVotes.reduce((a, b) => a + b, 0);
  
  if (total < 2000) {
    currentVotes = currentVotes.map(v => v + Math.floor(Math.random() * 15));
  }

  const newTotal = currentVotes.reduce((a, b) => a + b, 0);
  const cappedTotal = Math.min(newTotal, 2000);

  const candidates = [
    { id: 1, name: "Catherine Nyambura", faculty: "Agriculture", votes: currentVotes[0], percentage: parseFloat(((currentVotes[0]/cappedTotal)*100).toFixed(1)) },
    { id: 2, name: "Alice Wanjiku", faculty: "Engineering", votes: currentVotes[1], percentage: parseFloat(((currentVotes[1]/cappedTotal)*100).toFixed(1)) },
    { id: 3, name: "Brian Otieno", faculty: "Business", votes: currentVotes[2], percentage: parseFloat(((currentVotes[2]/cappedTotal)*100).toFixed(1)) },
    { id: 4, name: "David Kipchoge", faculty: "ICT", votes: currentVotes[3], percentage: parseFloat(((currentVotes[3]/cappedTotal)*100).toFixed(1)) },
  ].sort((a, b) => b.votes - a.votes);

  return {
    totalVotes: cappedTotal,
    eligibleVoters: 2000,
    turnout: parseFloat(((cappedTotal / 2000) * 100).toFixed(1)),
    candidates
  }
}