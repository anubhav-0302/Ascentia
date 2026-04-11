import React from 'react';
import { Construction, Clock, Bell } from 'lucide-react';
import { PageTransition } from './PageTransition';
import Card from './Card';

interface ComingSoonProps {
  title?: string;
  description?: string;
  feature?: string;
  icon?: React.ReactNode;
  showNotifyButton?: boolean;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  description = "We're working hard to bring you this feature. Stay tuned for updates!",
  feature,
  icon = <Construction className="w-12 h-12" />,
  showNotifyButton = true
}) => {
  return (
    <PageTransition>
      <div className="min-h-96 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center p-8">
          <div className="flex items-center justify-center w-20 h-20 bg-slate-700/50 rounded-2xl mb-6 text-teal-400">
            {icon}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-3">
            {title}
          </h1>
          
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            {description}
          </p>

          {feature && (
            <div className="mb-6 p-4 bg-slate-700/30 rounded-xl border border-slate-600/50">
              <p className="text-teal-400 text-sm font-medium mb-1">Feature Preview</p>
              <p className="text-gray-300 text-xs">{feature}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            {showNotifyButton && (
              <button className="inline-flex items-center px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200 active:scale-95">
                <Bell className="w-4 h-4 mr-2" />
                Notify Me
              </button>
            )}
            
            <button className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-all duration-200 active:scale-95">
              <Clock className="w-4 h-4 mr-2" />
              Check Status
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-gray-500 text-xs">
              This feature is currently under development. 
              Expected release: Q2 2024
            </p>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
};

export default ComingSoon;
