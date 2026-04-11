import React from 'react';
import { StandardLayout } from './StandardLayout';
import { ComingSoon } from './ComingSoon';
import { GitBranch } from 'lucide-react';

const WorkflowHub: React.FC = () => {
  return (
    <StandardLayout 
      title="Workflow Hub"
      description="Manage and automate your HR workflows efficiently."
    >
      <ComingSoon
        title="Workflow Hub"
        description="We're creating a powerful workflow automation system to streamline your HR processes and improve efficiency."
        feature="Visual workflow builder, automation rules, and process analytics"
        icon={<GitBranch className="w-12 h-12" />}
      />
    </StandardLayout>
  );
};

export default WorkflowHub;