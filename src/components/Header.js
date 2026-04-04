class Header {
    render() {
        return `
            <header class="h-16 bg-gray-800 border-b border-gray-700 fixed top-0 left-64 right-0 flex items-center justify-between px-6 z-10">
                <!-- Search Bar -->
                <div class="flex-1 max-w-xl">
                    <div class="relative">
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            class="w-full bg-gray-700 text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all duration-200"
                        >
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
                
                <!-- Right Side Actions -->
                <div class="flex items-center space-x-4">
                    <!-- Notifications -->
                    <button class="relative p-2 rounded-xl hover:bg-gray-700 transition-colors duration-200">
                        <i class="fas fa-bell text-gray-300 hover:text-white"></i>
                        <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    
                    <!-- User Avatar -->
                    <div class="flex items-center space-x-3">
                        <img 
                            src="https://picsum.photos/seed/user-avatar/40/40.jpg" 
                            alt="User Avatar" 
                            class="w-10 h-10 rounded-full border-2 border-gray-600"
                        >
                        <div class="hidden md:block">
                            <p class="text-sm font-medium text-white">John Doe</p>
                            <p class="text-xs text-gray-400">Administrator</p>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }
}
