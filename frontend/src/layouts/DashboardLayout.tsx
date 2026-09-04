import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { ReceiptScannerModal } from '../components/transactions/ReceiptScannerModal';
import { accountService, categoryService } from '../services/accountService';
import { Account, Category } from '../types';

export const DashboardLayout: React.FC = () => {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [initialTxData, setInitialTxData] = useState<any>(null);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [accs, cats] = await Promise.all([
          accountService.getAccounts(),
          categoryService.getCategories(),
        ]);
        setAccounts(accs);
        setCategories(cats);
      } catch (e) {
        console.error('Failed to load accounts/categories', e);
      }
    }
    loadMeta();
  }, [refreshTrigger]);

  const handleReceiptParsed = (parsed: {
    description: string;
    amount: number;
    date: string;
    suggestedCategory: string;
  }) => {
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === parsed.suggestedCategory.toLowerCase()
    );
    setInitialTxData({
      description: parsed.description,
      amount: parsed.amount,
      date: parsed.date,
      categoryId: matchedCategory ? matchedCategory.id : undefined,
      type: 'EXPENSE',
    });
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    // Trigger window event for pages to update
    window.dispatchEvent(new Event('transaction-updated'));
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
        <Header
          onOpenAddTransaction={() => {
            setInitialTxData(null);
            setIsTransactionModalOpen(true);
          }}
          onOpenScanReceipt={() => setIsReceiptModalOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Quick Add Modals */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={handleTransactionSuccess}
        accounts={accounts}
        categories={categories}
        initialData={initialTxData}
      />

      <ReceiptScannerModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        onReceiptParsed={handleReceiptParsed}
      />
    </div>
  );
};
