import config from '../config';
import { mockCandidates } from '../mock/candidates';
import { getMockResults } from '../mock/results';

export const getCandidates = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, candidates: mockCandidates }
  }

  const token = sessionStorage.getItem('token');
  const votingToken = sessionStorage.getItem('votingToken');
  const response = await fetch(`${config.API_URL}/api/student/active-election`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'x-voting-token': votingToken
    }
  })
  const data = await response.json()
  if (response.ok) {
    return {
      success: true,
      candidates: data.candidates.map(c => ({
        id: c._id,
        name: c.name,
        faculty: c.position,
        year: c.party
      }))
    }
  }
  return { success: false, message: data.message }
}

export const castVote = async (candidateId) => {
  const authToken = sessionStorage.getItem('token');
  const votingToken = sessionStorage.getItem('votingToken');
  const response = await fetch(`${config.API_URL}/api/vote`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      token: votingToken,
      candidateId
    })
  });
  const data = await response.json();
  if (response.ok) {
    return { 
      success: true, 
      message: data.message,
      allPositionsVoted: data.allPositionsVoted,
      remainingPositions: data.remainingPositions,
      votedPositions: data.votedPositions
    };
  }
  return { success: false, message: data.message };
};

export const getResults = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, results: getMockResults() }
  }

  const token = sessionStorage.getItem('token');
  let electionId = sessionStorage.getItem('electionId');

  // if no electionId, fetch from elections list
  if (!electionId) {
    try {
      const electionsRes = await fetch(`${config.API_URL}/api/admin/elections`);
      const electionsData = await electionsRes.json();
      if (Array.isArray(electionsData) && electionsData.length > 0) {
        const active = electionsData.find(e => e.status === 'active');
        const completed = electionsData.find(e => e.status === 'completed');
        const election = active || completed;
        if (election) {
          electionId = election._id;
          sessionStorage.setItem('electionId', electionId);
        }
      }
    } catch (err) {
      console.error('Failed to fetch elections:', err);
    }
  }

  if (!electionId) {
    return { success: false, message: 'No election found' }
  }

  const response = await fetch(`${config.API_URL}/api/admin/elections/${electionId}/results`, {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  })
  const data = await response.json()
  if (response.ok) {
    return {
      success: true,
      electionStatus: data.election.status,
      results: {
        totalVotes: data.totalCompletedVoters || 0,
        eligibleVoters: data.totalStudents || 0,
        turnout: data.totalStudents > 0 ? parseFloat((((data.totalCompletedVoters || 0) / data.totalStudents) * 100).toFixed(1)) : 0,
        candidates: data.results.map(c => ({
  id: c._id,
  name: c.name,
  faculty: c.position,
  party: c.party,
  votes: c.voteCount,
  percentage: data.totalVotes > 0 
    ? parseFloat(((c.voteCount / data.totalVotes) * 100).toFixed(1)) 
    : 0
})).sort((a, b) => b.votes - a.votes),
candidatesByPosition: (() => {
  const grouped = {};
  data.results.forEach(c => {
    if (!grouped[c.position]) grouped[c.position] = [];
    grouped[c.position].push({
      id: c._id,
      name: c.name,
      faculty: c.position,
      party: c.party,
      votes: c.voteCount,
      percentage: 0
    });
  });
  // calculate percentage per position
  Object.keys(grouped).forEach(position => {
    const positionTotal = grouped[position].reduce((sum, c) => sum + c.votes, 0);
    grouped[position] = grouped[position].map(c => ({
      ...c,
      percentage: positionTotal > 0 ? parseFloat(((c.votes / positionTotal) * 100).toFixed(1)) : 0
    }));
    grouped[position].sort((a, b) => b.votes - a.votes);
  });
  return grouped;
})()
      }
    }
  }
  return { success: false, message: data.message }
}