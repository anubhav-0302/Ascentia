/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {     
  colors: {
    primary: '#0f766e',     // Deep teal
    primaryLight: '#14b8a6',
    background: '#0f172a',  // Slate dark
    surface: '#1e293b',
    border: '#334155',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
  }
}
} 
}