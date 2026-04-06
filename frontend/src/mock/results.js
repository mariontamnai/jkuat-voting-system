let currentVotes = [40, 38, 36, 34];

export const getMockResults = () => {
  const total = currentVotes.reduce((a, b) => a + b, 0);
  
  if (total < 2000) {
    currentVotes = currentVotes.map(v => v + Math.floor(Math.random() * 15));
  }

  const newTotal = currentVotes.reduce((a, b) => a + b, 0);
  const cappedVotes = currentVotes.map(v => Math.round((v / newTotal) * Math.min(newTotal, 2000)));
  const finalTotal = cappedVotes.reduce((a, b) => a + b, 0);
  const candidates = [
    { id: 1, name: "Catherine Nyambura", faculty: "Agriculture", votes: currentVotes[0], percentage: parseFloat(((currentVotes[0]/finalTotal)*100).toFixed(1)) },
    { id: 2, name: "Alice Wanjiku", faculty: "Engineering", votes: currentVotes[1], percentage: parseFloat(((currentVotes[1]/finalTotal)*100).toFixed(1)) },
    { id: 3, name: "Brian Otieno", faculty: "Business", votes: currentVotes[2], percentage: parseFloat(((currentVotes[2]/finalTotal)*100).toFixed(1)) },
    { id: 4, name: "David Kipchoge", faculty: "ICT", votes: currentVotes[3], percentage: parseFloat(((currentVotes[3]/finalTotal)*100).toFixed(1)) },
  ].sort((a, b) => b.votes - a.votes);

  return {
    totalVotes: finalTotal,
    eligibleVoters: 2000,
    turnout: parseFloat(((finalTotal / 2000) * 100).toFixed(1)),
    candidates
  }
}