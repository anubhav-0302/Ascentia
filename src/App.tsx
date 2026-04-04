import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

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
