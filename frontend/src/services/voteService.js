import config from '../config';
import { mockCandidates } from '../mock/candidates';
import { getMockResults } from '../mock/results';

export const getCandidates = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, candidates: mockCandidates }
  }

  const token = sessionStorage.getItem('token');
  const response = await fetch(`${config.API_URL}/api/student/active-election`, {
    headers: { 'Authorization': `Bearer ${token}` }
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

export const castVote = async (candidateId, studentId, token) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Vote cast successfully' }
  }

  const votingToken = sessionStorage.getItem('votingToken');
  const response = await fetch(`${config.API_URL}/api/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: votingToken,
      candidateId
    })
  })
  const data = await response.json()
  if (response.ok) {
    return { success: true, message: data.message }
  }
  return { success: false, message: data.message }
}

export const getResults = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, results: getMockResults() }
  }

  const token = sessionStorage.getItem('token');
  const response = await fetch(`${config.API_URL}/api/admin/results`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  if (response.ok) {
    return { success: true, results: data }
  }
  return { success: false, message: data.message }
}