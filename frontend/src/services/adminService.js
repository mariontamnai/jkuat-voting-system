import config from '../config';
import { getMockAdminStats, mockStudents } from '../mock/admin';
import { startMockSession, endMockSession } from '../mock/results';

export const getAdminStats = async (phase) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, stats: getMockAdminStats(phase) }
  }

  const token = sessionStorage.getItem('token');
  const response = await fetch(`${config.API_URL}/api/admin/dashboard`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  if (response.ok) {
    return { success: true, stats: data }
  }
  return { success: false, message: data.message }
}

export const getElections = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      elections: [
        { id: '69df74ee57baca2277b339fb', title: 'University Sports Director', status: 'active' },
        { id: '69df744457baca2277b339f6', title: 'Arts and Humanities', status: 'active' },
        { id: '69df743557baca2277b339f1', title: 'Computer Science Governor', status: 'active' },
        { id: '69df742657baca2277b339ec', title: 'School of Engineering Rep', status: 'active' },
        { id: '69df73e957baca2277b339e7', title: 'University President', status: 'active' },
      ]
    }
  }

  const token = sessionStorage.getItem('token');
  const response = await fetch(`${config.API_URL}/api/admin/elections`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  if (response.ok) {
    return {
      success: true,
      elections: data.map(e => ({
        id: e._id,
        title: e.title,
        status: e.status
      }))
    }
  }
  return { success: false, message: data.message }
}

export const getStudents = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, students: mockStudents }
  }

  const token = sessionStorage.getItem('token');
  const response = await fetch(`${config.API_URL}/api/admin/students`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  if (response.ok) {
    return {
      success: true,
      students: data.map(s => ({
        id: s._id,
        name: s.fullName,
        regNo: s.regNumber,
        year: s.year,
        email: s.email,
        hasVoted: s.hasVoted
      }))
    }
  }
  return { success: false, message: data.message }
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

  const token = sessionStorage.getItem('token');
  const response = await fetch(`${config.API_URL}/api/admin/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      regNumber: studentData.regNo,
      fullName: studentData.name,
      email: studentData.email,
      year: studentData.year
    })
  })
  const data = await response.json()
  if (response.ok) {
    return {
      success: true,
      message: data.message,
      student: {
        id: data._id,
        name: data.fullName,
        regNo: data.regNumber,
        year: data.year,
        email: data.email,
        hasVoted: false
      }
    }
  }
  return { success: false, message: data.message }
}

export const updateStudent = async (studentId, studentData) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Student updated successfully' }
  }

  const token = sessionStorage.getItem('token');
  const response = await fetch(`${config.API_URL}/api/admin/students/${studentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ fullName: studentData.name })
  })
  const data = await response.json()
  if (response.ok) {
    return { success: true, message: 'Student updated successfully' }
  }
  return { success: false, message: data.message }
}

export const deleteStudent = async (studentId) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Student deleted successfully' }
  }

  const token = sessionStorage.getItem('token');
  const response = await fetch(`${config.API_URL}/api/admin/students/${studentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  const data = await response.json()
  if (response.ok) {
    return { success: true, message: 'Student deleted successfully' }
  }
  return { success: false, message: data.message }
}

export const startSession = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    startMockSession();
    return { success: true, message: 'Session started' }
  }

  const token = sessionStorage.getItem('token');
  const electionId = sessionStorage.getItem('electionId');
  const response = await fetch(`${config.API_URL}/api/admin/elections/${electionId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'active' })
  })
  const data = await response.json()
  if (response.ok) {
    return { success: true, message: 'Session started' }
  }
  return { success: false, message: data.message }
}

export const endSession = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    endMockSession();
    return { success: true, message: 'Session ended' }
  }

  const token = sessionStorage.getItem('token');
  const electionId = sessionStorage.getItem('electionId');
  const response = await fetch(`${config.API_URL}/api/admin/elections/${electionId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'completed' })
  })
  const data = await response.json()
  if (response.ok) {
    return { success: true, message: 'Session ended' }
  }
  return { success: false, message: data.message }
}

export const publishResults = async () => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Results published' }
  }

  const token = sessionStorage.getItem('token');
  const electionId = sessionStorage.getItem('electionId');
  const response = await fetch(`${config.API_URL}/api/admin/elections/${electionId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'completed' })
  })
  const data = await response.json()
  if (response.ok) {
    return { success: true, message: 'Results published' }
  }
  return { success: false, message: data.message }
}