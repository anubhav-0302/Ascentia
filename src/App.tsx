import { useState } from 'react'
import './App.css'

// Placeholder components - these will be replaced with actual imports later
const Sidebar = () => (
  <div className="w-64 bg-gradient-to-b from-teal-600 to-black h-screen fixed left-0 top-0 flex flex-col border-r border-slate-700/50 backdrop-blur-sm">
    <div className="p-6 border-b border-slate-700/50 backdrop-blur-sm">
      <h1 className="text-2xl font-bold text-white">Ascentia</h1>
    </div>
    <nav className="flex-1 p-4">
      <ul className="space-y-2">
        <li>
          <a href="#" className="flex items-center p-3 rounded-xl bg-white/10 text-white shadow-lg shadow-teal-500/20 border border-teal-500/30">
            <i className="fas fa-home w-5 mr-3"></i>
            <span>Dashboard</span>
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
            <i className="fas fa-tachometer-alt w-5 mr-3"></i>
            <span>Command Center</span>
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
            <i className="fas fa-tasks w-5 mr-3"></i>
            <span>Workflow Hub</span>
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
            <i className="fas fa-users w-5 mr-3"></i>
            <span>My Team</span>
          </a>
        </li>
        <li>
          <a href="#" className="flex items-center p-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-gray-300 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 border border-transparent hover:border-slate-600/50">
            <i className="fas fa-address-book w-5 mr-3"></i>
            <span>Directory</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
)

const Header = () => (
  <header className="fixed top-0 left-64 right-0 bg-slate-800/40 backdrop-blur-xl border-b border-slate-700/50 z-10">
    <div className="px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-white">Dashboard</h2>
      </div>
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-gray-300 hover:text-white transition-colors duration-200">
          <i className="fas fa-bell text-xl"></i>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3">
          <img src="https://picsum.photos/seed/user/40/40.jpg" alt="User" className="w-10 h-10 rounded-full border-2 border-slate-600" />
          <div>
            <p className="text-white font-medium">John Doe</p>
            <p className="text-gray-400 text-sm">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  </header>
)

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar />
      <Header />
      
      {/* Main Content Area */}
      <main className="ml-64 mt-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Ascentia</h1>
            <p className="text-gray-400">Your HR Management Platform</p>
          </div>
          
          {/* Dashboard Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <i className="fas fa-users text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-200"></i>
                <span className="text-sm text-gray-400">+12%</span>
              </div>
              <h3 className="text-2xl font-bold text-white">156</h3>
              <p className="text-gray-400 text-sm">Total Employees</p>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <i className="fas fa-tasks text-2xl text-teal-400 group-hover:scale-110 transition-transform duration-200"></i>
                <span className="text-sm text-gray-400">Active</span>
              </div>
              <h3 className="text-2xl font-bold text-white">42</h3>
              <p className="text-gray-400 text-sm">Pending Tasks</p>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <i className="fas fa-calendar-alt text-2xl text-purple-400 group-hover:scale-110 transition-transform duration-200"></i>
                <span className="text-sm text-gray-400">This Week</span>
              </div>
              <h3 className="text-2xl font-bold text-white">8</h3>
              <p className="text-gray-400 text-sm">Leave Requests</p>
            </div>
            
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 transition-all duration-200 hover:bg-slate-800/50 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <i className="fas fa-chart-line text-2xl text-green-400 group-hover:scale-110 transition-transform duration-200"></i>
                <span className="text-sm text-gray-400">+5%</span>
              </div>
              <h3 className="text-2xl font-bold text-white">94%</h3>
              <p className="text-gray-400 text-sm">Productivity</p>
            </div>
          </div>
          
          {/* Main Content Placeholder */}
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl p-8 border border-slate-700/50 text-center">
            <i className="fas fa-th-large text-4xl text-teal-400 mb-4"></i>
            <h2 className="text-xl font-bold text-white mb-2">Dashboard Content</h2>
            <p className="text-gray-400">This is the main content area where dashboard widgets and components will be displayed.</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
