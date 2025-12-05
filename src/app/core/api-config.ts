export const API_BASE_URL: string = 
  (typeof process !== 'undefined' && process.env['API_BASE_URL'])
    ? String(process.env['API_BASE_URL'])
    : 'https://smartpoint-api.onrender.com';