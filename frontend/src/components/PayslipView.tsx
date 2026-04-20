import React, { useState, useEffect } from 'react';
import { DollarSign, Download, AlertCircle } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import { getEmployeeSalaries, type EmployeeSalary } from '../api/payrollApi';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

interface PayslipViewProps {
  employeeId: number;
  employeeName: string;
}

const PayslipView: React.FC<PayslipViewProps> = ({ employeeId, employeeName }) => {
  const { user } = useAuthStore();
  const [salaryData, setSalaryData] = useState<EmployeeSalary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSalaryData();
  }, [employeeId]);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getEmployeeSalaries({ employeeId });
      // getEmployeeSalaries returns the array directly (response.data from API)
      setSalaryData(Array.isArray(response) ? response : response?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch salary data');
      toast.error('Failed to load salary information');
    } finally {
      setLoading(false);
    }
  };

  // Calculate salary breakdown
  const calculateSalary = () => {
    let baseSalary = 0;
    let totalEarnings = 0;
    let totalDeductions = 0;

    salaryData.forEach((salary) => {
      if (salary.component?.type === 'Earning') {
        totalEarnings += salary.amount;
        if (salary.component?.category === 'Basic') {
          baseSalary = salary.amount;
        }
      } else if (salary.component?.type === 'Deduction') {
        totalDeductions += salary.amount;
      }
    });

    const netSalary = totalEarnings - totalDeductions;

    return {
      baseSalary,
      totalEarnings,
      totalDeductions,
      netSalary
    };
  };

  const salary = calculateSalary();

  // Check if user can view this salary
  const canView = () => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'hr' || user.role === 'teamlead') return true;
    if (user.id === employeeId) return true;
    // Manager can view team members (would need manager relationship check)
    return false;
  };

  if (!canView()) {
    return (
      <Card className="p-6 border-l-4 border-red-500 bg-red-500/10">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-300">Access Denied</h3>
            <p className="text-sm text-red-200 mt-1">You don't have permission to view this salary information.</p>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          <span className="ml-3 text-gray-400">Loading salary details...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-l-4 border-yellow-500 bg-yellow-500/10">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-300">Unable to Load Salary</h3>
            <p className="text-sm text-yellow-200 mt-1">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (salaryData.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <DollarSign className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No salary information available</p>
          <p className="text-gray-500 text-sm mt-2">Salary details will appear here once configured</p>
        </div>
      </Card>
    );
  }

  const handleDownloadPayslip = () => {
    // Generate simple payslip
    const payslipContent = `
PAYSLIP
=======
Employee: ${employeeName}
Employee ID: ${employeeId}
Generated: ${new Date().toLocaleDateString()}

EARNINGS:
${salaryData
  .filter(s => s.component?.type === 'Earning')
  .map(s => `${s.component?.name}: ${s.amount.toFixed(2)}`)
  .join('\n')}

Total Earnings: ${salary.totalEarnings.toFixed(2)}

DEDUCTIONS:
${salaryData
  .filter(s => s.component?.type === 'Deduction')
  .map(s => `${s.component?.name}: ${s.amount.toFixed(2)}`)
  .join('\n')}

Total Deductions: ${salary.totalDeductions.toFixed(2)}

NET SALARY: ${salary.netSalary.toFixed(2)}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(payslipContent));
    element.setAttribute('download', `payslip_${employeeId}_${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Payslip downloaded successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-teal-400" />
            Salary Details
          </h3>
          <p className="text-sm text-gray-400 mt-1">{employeeName}</p>
        </div>
        <Button
          onClick={handleDownloadPayslip}
          icon={<Download className="w-4 h-4" />}
          size="sm"
          variant="secondary"
        >
          Download
        </Button>
      </div>

      {/* Net Salary Highlight */}
      <Card className="p-6 bg-gradient-to-r from-teal-600/20 to-teal-500/10 border border-teal-500/30">
        <div className="text-center">
          <p className="text-gray-300 text-sm mb-2">NET SALARY</p>
          <p className="text-4xl font-bold text-teal-400">
            ₹{salary.netSalary.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            {salary.totalEarnings.toFixed(2)} - {salary.totalDeductions.toFixed(2)}
          </p>
        </div>
      </Card>

      {/* Earnings & Deductions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earnings */}
        <Card className="p-6 bg-slate-800/60">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Earnings
          </h4>
          <div className="space-y-3">
            {salaryData
              .filter(s => s.component?.type === 'Earning')
              .map((salary) => (
                <div key={salary.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{salary.component?.name}</span>
                  <span className="text-sm font-medium text-green-400">
                    ₹{salary.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            <div className="border-t border-slate-700/50 pt-3 mt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-white">Total Earnings</span>
              <span className="text-sm font-semibold text-green-400">
                ₹{salary.totalEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Deductions */}
        <Card className="p-6 bg-slate-800/60">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
            Deductions
          </h4>
          <div className="space-y-3">
            {salaryData.length > 0 && salaryData.filter(s => s.component?.type === 'Deduction').length === 0 ? (
              <p className="text-sm text-gray-400">No deductions</p>
            ) : (
              <>
                {salaryData
                  .filter(s => s.component?.type === 'Deduction')
                  .map((salary) => (
                    <div key={salary.id} className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">{salary.component?.name}</span>
                      <span className="text-sm font-medium text-red-400">
                        -₹{salary.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                <div className="border-t border-slate-700/50 pt-3 mt-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-white">Total Deductions</span>
                  <span className="text-sm font-semibold text-red-400">
                    -₹{salary.totalDeductions.toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Salary Components Details */}
      <Card className="p-6 bg-slate-800/60">
        <h4 className="text-sm font-semibold text-white mb-4">Salary Components</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-2 px-3 text-gray-300 font-medium">Component</th>
                <th className="text-left py-2 px-3 text-gray-300 font-medium">Type</th>
                <th className="text-left py-2 px-3 text-gray-300 font-medium">Amount</th>
                <th className="text-left py-2 px-3 text-gray-300 font-medium">Effective Date</th>
              </tr>
            </thead>
            <tbody>
              {salaryData.map((salary) => (
                <tr key={salary.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                  <td className="py-3 px-3 text-white">{salary.component?.name}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      salary.component?.type === 'Earning'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {salary.component?.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-white font-medium">₹{salary.amount.toFixed(2)}</td>
                  <td className="py-3 px-3 text-gray-400">
                    {new Date(salary.effectiveDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="text-xs text-gray-500 text-center">
        <p>This is a summary view of your salary structure. For detailed payslips, please contact HR.</p>
      </div>
    </div>
  );
};

export default PayslipView;
