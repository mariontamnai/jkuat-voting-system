import config from '../config';
import { mockUser, mockAdmin } from '../mock/user';

export const loginStudent = async (regNo, password) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (regNo === mockUser.regNo && password === 'password123') {
      return { success: true, user: mockUser, token: 'MOCK-TOKEN' }
    }
    return { success: false, message: 'Invalid credentials' }
  }

  const response = await fetch(`${config.API_URL}/api/auth/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regNumber: regNo, password })
  })
  const data = await response.json()
  if (data.token) {
    sessionStorage.removeItem('votingToken');
    return {
      success: true,
      token: data.token,
      user: {
        id: data.studentId,
        name: data.fullName,
        regNo,
        hasVoted: false,
        role: 'student',
        isFirstLogin: data.isFirstLogin
      }
    }
  }
  return { success: false, message: data.message || 'Invalid credentials' }
}


export const loginAdmin = async (adminId, password) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (adminId === mockAdmin.adminId && password === 'admin123') {
      return { success: true, otpSent: true, adminId: 'MOCK-ADMIN-ID' }
    }
    return { success: false, message: 'Invalid credentials' }
  }

  const response = await fetch(`${config.API_URL}/api/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ regNumber: adminId, password })
  })
  const data = await response.json()

  if (data.otpSent) {
    return {
      success: true,
      otpSent: true,
      adminId: data.adminId
    }
  }
  return { success: false, message: data.message || 'Invalid credentials' }
}


export const verifyAdminOtp = async (adminId, otp) => {
  const response = await fetch(`${config.API_URL}/api/auth/admin/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminId, otp })
  })
  const data = await response.json()

  if (data.token) {
    return {
      success: true,
      token: data.token,
      user: {
        id: data.adminId,
        name: 'Admin User',
        role: data.role
      }
    }
  }
  return { success: false, message: data.message || 'Invalid OTP' }
}

export const verifyFace = async (faceDescriptor, studentId) => {
  if (config.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (faceDescriptor) {
      return { success: true, verified: true, token: 'TOKEN-' + Date.now() }
    }
    return { success: false, verified: false, message: 'No face detected' }
  }

  const token = sessionStorage.getItem('token');
  const response = await fetch(`${config.API_URL}/api/student/verify-face`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ faceDescriptor: faceDescriptor })
  })
  const data = await response.json()
  if (data.verified) {
    return { success: true, verified: true, token: data.token }
  }
  return { success: false, verified: false, message: data.message }
}

export const changePassword = async (newPassword) => {
  const token = sessionStorage.getItem('token');
  const response = await fetch(`${config.API_URL}/api/auth/student/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ newPassword })
  });
  const data = await response.json();
  if (response.ok) {
    return { success: true, message: data.message };
  }
  return { success: false, message: data.message };
};