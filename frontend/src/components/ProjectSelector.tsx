import React from 'react';
import { Briefcase, ChevronDown, User, Users } from 'lucide-react';
import type { MyProject } from '../api/projectApi';

interface ProjectSelectorProps {
  projects: MyProject[];
  currentProjectId: number | null;
  onProjectChange: (projectId: number) => void;
  isLoading?: boolean;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  projects,
  currentProjectId,
  onProjectChange,
  isLoading
}) => {
  // Don't show if user has 0 or 1 projects
  if (projects.length <= 1 && !isLoading) {
    return null;
  }

  const currentProject = projects.find(p => p.id === currentProjectId);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager':
        return <Briefcase className="w-4 h-4 text-teal-400" />;
      case 'lead':
        return <Users className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager':
        return 'Manager';
      case 'lead':
        return 'Team Lead';
      default:
        return 'Member';
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-slate-400" />
        <select
          value={currentProjectId || ''}
          onChange={(e) => onProjectChange(Number(e.target.value))}
          disabled={isLoading}
          className="appearance-none bg-slate-800 border border-slate-600 text-white px-4 py-2 pr-10 rounded-lg focus:outline-none focus:border-teal-500 cursor-pointer min-w-[200px]"
        >
          {isLoading ? (
            <option value="">Loading projects...</option>
          ) : (
            projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name} ({getRoleLabel(project.myRole)})
              </option>
            ))
          )}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
      </div>

      {/* Current Project Badge */}
      {currentProject && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="text-slate-400">Current:</span>
          <span className="flex items-center gap-1 text-teal-400">
            {getRoleIcon(currentProject.myRole)}
            {currentProject.name}
          </span>
          <span className="text-slate-500">
            • {currentProject.teamSize} members
          </span>
        </div>
      )}
    </div>
  );
};

export default ProjectSelector;
