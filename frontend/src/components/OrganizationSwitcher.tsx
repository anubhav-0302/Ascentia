import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronDown, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAvailableOrganizations, switchOrganization } from '../api/orgApi';
import { useOrganizationStore } from '../store/useOrganizationStore';
import { useEmployeeStore } from '../store/useEmployeeStore';

interface OrganizationSwitcherProps {
  token: string;
}

const OrganizationSwitcher: React.FC<OrganizationSwitcherProps> = ({ token }) => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { currentOrgId, setCurrentOrgId, setCurrentOrg, clearOrg } = useOrganizationStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Refresh org list when dropdown opens to catch deletions
  useEffect(() => {
    if (isOpen) {
      fetchOrganizations();
    }
  }, [isOpen]);

  // Check if current org still exists in the list, if not clear it
  useEffect(() => {
    if (currentOrgId && organizations.length > 0) {
      const currentOrgExists = organizations.find(o => o.id === currentOrgId);
      if (!currentOrgExists) {
        clearOrg();
        setCurrentOrgId(null);
      }
    }
  }, [organizations, currentOrgId, clearOrg, setCurrentOrgId]);

  const fetchOrganizations = async () => {
    try {
      const data = await getAvailableOrganizations(token);
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  // Reset client-side caches whose data is tenant-scoped. Anything that fetches
  // on mount (Dashboard, Directory, etc.) will re-fetch with the new
  // X-Organization-Id header the next time it's rendered.
  const invalidateTenantCaches = () => {
    useEmployeeStore.getState().reset();
  };

  const handleSwitch = async (orgId: number) => {
    try {
      const org = await switchOrganization(orgId, token);
      setCurrentOrgId(orgId);
      setCurrentOrg(org);
      invalidateTenantCaches();
      setIsOpen(false);
      toast.success(`Switched to ${org.name}`);
      // Navigate to dashboard so all mounted views refetch cleanly under the new org context.
      navigate('/dashboard');
    } catch (error) {
      console.error('Error switching organization:', error);
      toast.error('Failed to switch organization');
    }
  };

  const handleClearContext = () => {
    clearOrg();
    invalidateTenantCaches();
    setIsOpen(false);
    toast.success('Exited organization context — now viewing platform-wide data');
    navigate('/superadmin');
  };

  const currentOrg = organizations.find(o => o.id === currentOrgId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition"
      >
        <Building2 size={18} />
        <span>{currentOrg?.name || 'Select Organization'}</span>
        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          <div className="p-2">
            <button
              onClick={handleClearContext}
              className={`w-full text-left px-3 py-2 rounded transition flex items-center gap-2 mb-1 ${
                !currentOrgId ? 'bg-teal-500/20 text-teal-300' : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <Globe size={16} />
              <div>
                <div className="font-medium text-sm">Platform view</div>
                <div className="text-xs text-slate-400">All organizations</div>
              </div>
            </button>
            <div className="border-t border-slate-700 my-1" />
            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSwitch(org.id)}
                className={`w-full text-left px-3 py-2 rounded transition ${
                  currentOrgId === org.id ? 'bg-teal-500/20 text-teal-300' : 'hover:bg-slate-700 text-slate-300'
                }`}
              >
                <div className="font-medium">{org.name}</div>
                <div className="text-xs text-slate-400">{org.code}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSwitcher;
