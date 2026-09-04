import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User as UserIcon, PlusCircle, Scan, Download } from 'lucide-react';
import { statementService } from '../../services/ocrService';

interface HeaderProps {
  onOpenAddTransaction?: () => void;
  onOpenScanReceipt?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddTransaction, onOpenScanReceipt }) => {
  const { user, logout } = useAuth();
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportStatement = async () => {
    try {
      setIsExporting(true);
      await statementService.downloadPdf();
    } catch (e) {
      console.error(e);
      alert('Failed to generate PDF statement');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 sm:px-8 bg-[#FAF8F5]/80 backdrop-blur-md border-b border-brand-100">
      <div className="flex items-center space-x-3">
        <div>
          <h2 className="text-xl font-bold text-espresso-900 tracking-tight">
            Welcome back, <span className="text-copper">{user?.firstName || 'Financier'}</span>
          </h2>
          <p className="text-xs font-medium text-espresso-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {onOpenScanReceipt && (
          <button
            onClick={onOpenScanReceipt}
            className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-espresso-700 bg-white hover:bg-beige-50 border border-brand-200 rounded-xl shadow-soft-sm transition-all active:scale-95"
            title="Scan paper receipt using OCR"
          >
            <Scan className="w-4 h-4 text-copper" />
            <span>Scan Receipt</span>
          </button>
        )}

        <button
          onClick={handleExportStatement}
          disabled={isExporting}
          className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-espresso-700 bg-white hover:bg-beige-50 border border-brand-200 rounded-xl shadow-soft-sm transition-all active:scale-95 disabled:opacity-50"
          title="Export verified PDF financial statement"
        >
          <Download className="w-4 h-4 text-espresso-500" />
          <span>{isExporting ? 'Exporting...' : 'PDF Statement'}</span>
        </button>

        {onOpenAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-copper to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-soft-sm hover:shadow-soft-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        )}

        <div className="h-6 w-[1px] bg-brand-200 mx-1 hidden sm:block" />

        {/* User profile avatar & logout */}
        <div className="flex items-center space-x-2 pl-1">
          <div className="w-9 h-9 rounded-xl bg-brand-100 border border-brand-300 flex items-center justify-center text-copper font-bold text-sm shadow-soft-sm">
            {user?.firstName?.[0] || 'U'}
          </div>
          <button
            onClick={logout}
            className="p-2 text-espresso-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
