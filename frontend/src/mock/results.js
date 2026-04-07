let currentVotes = [40, 38, 36, 34];
let sessionActive = false;
let frozenResults = null;

export const startMockSession = () => {
  sessionActive = true;
  frozenResults = null;
  currentVotes = [40, 38, 36, 34];
}

export const endMockSession = () => {
  sessionActive = false;
  frozenResults = buildResults();
}

const buildResults = () => {
  const total = currentVotes.reduce((a, b) => a + b, 0);
  const cappedVotes = currentVotes.map(v =>
    Math.round((v / total) * Math.min(total, 2000))
  );
  const finalTotal = cappedVotes.reduce((a, b) => a + b, 0);

  return {
    totalVotes: finalTotal,
    eligibleVoters: 2000,
    turnout: parseFloat(((finalTotal / 2000) * 100).toFixed(1)),
    candidates: [
      { id: 1, name: "Catherine Nyambura", faculty: "Agriculture", votes: cappedVotes[0], percentage: parseFloat(((cappedVotes[0]/finalTotal)*100).toFixed(1)) },
      { id: 2, name: "Alice Wanjiku", faculty: "Engineering", votes: cappedVotes[1], percentage: parseFloat(((cappedVotes[1]/finalTotal)*100).toFixed(1)) },
      { id: 3, name: "Brian Otieno", faculty: "Business", votes: cappedVotes[2], percentage: parseFloat(((cappedVotes[2]/finalTotal)*100).toFixed(1)) },
      { id: 4, name: "David Kipchoge", faculty: "ICT", votes: cappedVotes[3], percentage: parseFloat(((cappedVotes[3]/finalTotal)*100).toFixed(1)) },
    ].sort((a, b) => b.votes - a.votes)
  }
}

export const getMockResults = () => {
  if (frozenResults) return frozenResults;
  if (!sessionActive) return buildResults();

  const total = currentVotes.reduce((a, b) => a + b, 0);
  if (total < 2000) {
    currentVotes = currentVotes.map(v => v + Math.floor(Math.random() * 15));
  }

  return buildResults();
}