import { getMockResults } from './results';

export const getMockAdminStats = (phase) => {
  if (phase === 'voting') {
    const results = getMockResults();
    return {
      totalVotes: results.totalVotes,
      turnout: results.turnout,
      sessions: 5,
      verified: results.totalVotes,
      phase: "ACTIVE"
    }
  }
  return {
    totalVotes: 0,
    turnout: 0,
    sessions: 0,
    verified: 0,
    phase: "INACTIVE"
  }
}