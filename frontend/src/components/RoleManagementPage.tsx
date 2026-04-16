import React from 'react';
import { StandardLayout } from './StandardLayout';
import RoleManagement from './RoleManagement';
import { useAuthStore } from '../store/useAuthStore';
import { PageTransition, FadeIn } from './PageTransition';

const RoleManagementPage: React.FC = () => {
  const token = useAuthStore.getState().token || '';

  return (
    <PageTransition>
      <FadeIn>
        <StandardLayout 
          title="Role Management"
          description="Manage roles, permissions, and access control"
        >
          <RoleManagement token={token} showHeader={false} />
        </StandardLayout>
      </FadeIn>
    </PageTransition>
  );
};

export default RoleManagementPage;
