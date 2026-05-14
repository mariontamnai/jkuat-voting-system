import { getMockResults } from './results';

export const getMockAdminStats = (phase) => {
  if (phase === 'voting' || phase === 'counting') {
    const results = getMockResults();
    return {
      totalStudents: 2000,
      totalVotes: results.totalVotes,
      totalElections: 1,
      activeElections: phase === 'voting' ? 1 : 0,
      phase: phase === 'voting' ? 'ACTIVE' : 'COUNTING'
    }
  }
  return {
    totalStudents: 2000,
    totalVotes: 0,
    totalElections: 1,
    activeElections: 0,
    phase: "INACTIVE"
  }
}

export const mockStudents = [
  { id: 1, name: "John Kamau", regNo: "SCT111-0111/1900", year: "3rd", email: "john@students.jkuat.ac.ke", hasVoted: true },
  { id: 2, name: "Mary Wambui", regNo: "SCT111-0112/1900", year: "3rd", email: "mary@students.jkuat.ac.ke", hasVoted: false }
]