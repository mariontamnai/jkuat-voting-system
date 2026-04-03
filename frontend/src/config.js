const config = {
  USE_MOCK: true, // ← flip to false when backend is ready
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
}

export default config;