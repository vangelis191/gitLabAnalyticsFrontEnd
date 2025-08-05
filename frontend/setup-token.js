// Quick setup script for development token
// Run this in browser console at http://localhost:5174

console.log('Setting up development token...');

// Set the development token
localStorage.setItem('clerk-token', 'dev-test-token-12345');

console.log('Token set successfully!');
console.log('Reloading page...');

// Reload the page to apply the token
location.reload(); 