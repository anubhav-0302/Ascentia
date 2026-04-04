class StatCard {
    constructor(title, value, changeText, changeType = 'positive', icon = 'fas fa-chart-line', iconColor = 'text-teal-400') {
        this.title = title;
        this.value = value;
        this.changeText = changeText;
        this.changeType = changeType; // 'positive' or 'negative'
        this.icon = icon;
        this.iconColor = iconColor;
    }

    render() {
        const changeColorClass = this.changeType === 'positive' ? 'text-green-400' : 'text-red-400';
        const changeIcon = this.changeType === 'positive' ? 'fa-arrow-up' : 'fa-arrow-down';
        
        return `
            <div class="bg-slate-800/40 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 shadow-xl shadow-black/20 hover:shadow-2xl hover:shadow-black/30 transition-all duration-300 hover:bg-slate-800/60 group">
                <div class="flex items-center justify-between mb-4">
                    <i class="${this.icon} text-2xl ${this.iconColor} group-hover:scale-110 transition-transform duration-300"></i>
                    <div class="flex items-center space-x-1">
                        <i class="fas ${changeIcon} text-xs ${changeColorClass}"></i>
                        <span class="text-sm ${changeColorClass} font-medium">${this.changeText}</span>
                    </div>
                </div>
                <h3 class="text-3xl font-bold text-white mb-1 group-hover:text-teal-100 transition-colors duration-300">${this.value}</h3>
                <p class="text-gray-400 text-sm">${this.title}</p>
            </div>
        `;
    }
}

export { StatCard };
