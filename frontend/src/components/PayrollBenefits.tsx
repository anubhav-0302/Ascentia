import React from 'react';
import { StandardLayout } from './StandardLayout';
import { ComingSoon } from './ComingSoon';
import { DollarSign } from 'lucide-react';

const PayrollBenefits: React.FC = () => {
  return (
    <StandardLayout 
      title="Payroll & Benefits"
      description="Manage payroll, salaries, and employee benefits."
    >
      <ComingSoon
        title="Payroll & Benefits"
        description="We're developing a comprehensive payroll and benefits management system to handle salary calculations, benefits administration, and compliance."
        feature="Payroll processing, benefits enrollment, tax calculations, and compliance reporting"
        icon={<DollarSign className="w-12 h-12" />}
      />
    </StandardLayout>
  );
};

export default PayrollBenefits;