import config from '../config';
import { mockCandidates } from '../mock/candidates';
import { mockResults } from '../mock/results';

export const getCandidates = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, candidates: mockCandidates }
  }

  const response = await fetch(`${config.API_URL}/api/candidates`)
  return response.json()
}

export const castVote = async (candidateId, studentId, token) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Vote cast successfully' }
  }

  const response = await fetch(`${config.API_URL}/api/votes/cast`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ candidateId, studentId })
  })
  return response.json()
}

export const getResults = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, results: mockResults }
  }

  const response = await fetch(`${config.API_URL}/api/results`)
  return response.json()
}