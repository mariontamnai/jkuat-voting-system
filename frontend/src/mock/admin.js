import { getMockResults } from './results';

export const getMockAdminStats = (phase) => {
  if (phase === 'voting' || phase === 'counting') {
    const results = getMockResults();
    return {
      totalVotes: results.totalVotes,
      turnout: results.turnout,
      sessions: 5,
      verified: results.totalVotes,
      phase: phase === 'voting' ? 'ACTIVE' : 'COUNTING'
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

export const mockStudents = [
  { id: 1, name: "John Kamau", regNo: "SCT111-0111/1900", year: "3rd", email: "john@students.jkuat.ac.ke", hasVoted: true },
  { id: 2, name: "Mary Wambui", regNo: "SCT111-0112/1900", year: "3rd", email: "mary@students.jkuat.ac.ke", hasVoted: false }
]