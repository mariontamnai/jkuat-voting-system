import config from '../config';
import { getMockAdminStats, mockStudents } from '../mock/admin';
import { startMockSession, endMockSession } from '../mock/results';

export const getAdminStats = async (phase) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, stats: getMockAdminStats(phase) }
  }

  const response = await fetch(`${config.API_URL}/api/admin/stats`)
  return response.json()
}

export const addStudent = async (studentData) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      success: true, 
      message: 'Student added successfully',
      student: { id: Date.now(), ...studentData }
    }
  }

  const response = await fetch(`${config.API_URL}/api/admin/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(studentData)
  })
  return response.json()
}

export const getStudents = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, students: mockStudents }
  }

  const response = await fetch(`${config.API_URL}/api/admin/students`)
  return response.json()
}

export const startSession = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    startMockSession();
    return { success: true, message: 'Session started' }
  }

  const response = await fetch(`${config.API_URL}/api/admin/session/start`, {
    method: 'POST'
  })
  return response.json()
}

export const endSession = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    endMockSession();
    return { success: true, message: 'Session ended' }
  }

  const response = await fetch(`${config.API_URL}/api/admin/session/end`, {
    method: 'POST'
  })
  return response.json()
}

export const publishResults = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Results published' }
  }

  const response = await fetch(`${config.API_URL}/api/admin/results/publish`, {
    method: 'POST'
  })
  return response.json()
}