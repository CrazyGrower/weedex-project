export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://api.weedex-project.orb.local; font-src 'self'; connect-src 'self' https://api.weedex-project.orb.local http://localhost:3333;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

export const setSecurityHeaders = (headers: Headers) => {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
}; 