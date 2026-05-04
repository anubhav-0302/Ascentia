import React from 'react';
import PageTransition, { FadeIn } from './PageTransition';
import StandardLayout from './StandardLayout';
import ProjectManagement from './ProjectManagement';

const ProjectManagementPage: React.FC = () => {
  return (
    <PageTransition>
      <FadeIn>
        <StandardLayout 
          title="Project Management"
          description="Create and manage projects, assign team members"
        >
          <ProjectManagement />
        </StandardLayout>
      </FadeIn>
    </PageTransition>
  );
};

export default ProjectManagementPage;
