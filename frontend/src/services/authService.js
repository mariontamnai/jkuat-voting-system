import config from '../config';
import { mockUser, mockAdmin } from '../mock/user';

export const loginStudent = async (regNo, password) => {
  if (config.USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (regNo === mockUser.regNo && password === 'password123') {
      return { success: true, user: mockUser }
    }
    return { success: false, message: 'Invalid credentials' }
  }

  const response = await fetch(`${config.API_URL}/api/students/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regNo, password })
  })
  return response.json()
}

export const loginAdmin = async (adminId, password) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (adminId === mockAdmin.adminId && password === 'admin123') {
      return { success: true, user: mockAdmin }
    }
    return { success: false, message: 'Invalid credentials' }
  }

  const response = await fetch(`${config.API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, password })
  })
  return response.json()
}

export const verifyFace = async (imageBlob, studentId) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In mock mode — always pass if blob exists
    if (imageBlob) {
      return { success: true, verified: true, token: 'TOKEN-' + Date.now() }
    }
    return { success: false, verified: false, message: 'No face detected' }
  }

  const formData = new FormData()
  formData.append('face_image', imageBlob, 'face.jpg')
  formData.append('student_id', studentId)

  const response = await fetch(`${config.API_URL}/api/students/verify-face`, {
    method: 'POST',
    body: formData
  })
  return response.json()
}