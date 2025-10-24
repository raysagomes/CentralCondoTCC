'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// módulos
import { useAuth } from '@/modules/auth';
import { useTheme } from '@/contexts/ThemeContext'; 
import { usePayments } from '@/modules/financeiro';

// layout (import direto do arquivo para não depender de reexport default)
import AppLayout from '@/modules/condominio/components/Layout/AppLayout';

// shared utils
import { getThemeClasses } from '@/shared/lib/utils/themeClasses';
import { getTypeColor, getTypeName } from '@/shared/lib/utils/typeHelpers';

// Tipagem local para garantir que type exista no Payment
type PaymentType = 'condominium' | 'service' | 'maintenance' | 'security' | 'fine' | 'other';
type Payment = {
  id: string;
  title: string;
  description?: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  paidDate?: string;
  link?: string;
  type?: PaymentType;
};

export default function Payments() {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();
  const theme = getThemeClasses(isDark);
  const router = useRouter();

  const {
    payments: allPayments,
    loading: paymentsLoading,
    markAsPaid,
    refetch,
  } = usePayments();

  // Garante tipagem local dos pagamentos
  const all = (allPayments as unknown) as Payment[];

  const [activeTab, setActiveTab] = useState<'pending' | 'paid' | 'overdue'>('pending');
  const [showBoletoModal, setShowBoletoModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [newPayment, setNewPayment] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
  });

  const payments = {
    pending: all.filter((p) => !p.paid && new Date(p.dueDate) >= new Date()),
    paid: all.filter((p) => p.paid),
    overdue: all.filter((p) => !p.paid && new Date(p.dueDate) < new Date()),
  };

  const handlePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowBoletoModal(true);
  };

  const confirmPayment = async () => {
    if (selectedPayment) {
      await markAsPaid(selectedPayment.id);
      setShowBoletoModal(false);
      setSelectedPayment(null);
      await refetch();
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (confirm('Tem certeza que deseja deletar este boleto?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/payments/${paymentId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          await refetch();
        }
      } catch (error) {
        console.error('Erro ao deletar pagamento:', error);
      }
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const paymentData = {
        title: newPayment.title,
        description: newPayment.description,
        amount: parseFloat(newPayment.amount),
        dueDate: newPayment.dueDate,
        type: 'other' as PaymentType,
      };

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        await response.json();
        setShowAddModal(false);
        setNewPayment({ title: '', description: '', amount: '', dueDate: '' });
        await refetch();
      } else {
        let errorMessage = `Erro ${response.status}`;
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        console.error('Erro na resposta:', errorMessage);
        alert('Erro ao adicionar boleto: ' + errorMessage);
      }
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      alert('Erro ao adicionar boleto');
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || paymentsLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className={`${theme.text} text-lg`}>Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const tabs = [
    { id: 'pending', name: 'Pendentes', count: payments.pending.length },
    { id: 'paid', name: 'Pagos', count: payments.paid.length },
    { id: 'overdue', name: 'Atrasados', count: payments.overdue.length },
  ] as const;

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <AppLayout>
        <div className="p-8">
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${theme.text}`}>Pagamentos</h1>
            <p className={`${theme.textSecondary} mt-2`}>Gerencie boletos e pagamentos</p>
          </div>

          <div className={`${theme.cardBg} border ${theme.border} rounded-xl`}>
            <div className={`p-6 border-b ${theme.border}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className={`text-lg font-semibold ${theme.text}`}>Pagamentos</h2>
                  <p className={`text-sm ${theme.textSecondary}`}>Gerencie boletos e pagamentos</p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Boleto
                </button>
              </div>
              <nav className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : `border-transparent ${theme.textSecondary} hover:${theme.text} hover:border-gray-600`
                    }`}
                  >
                    {tab.name} ({tab.count})
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  {payments.pending.map((payment) => (
                    <div
                      key={payment.id}
                      className={`${theme.secondaryBg} border ${theme.border} rounded-lg p-4 hover:border-blue-500/50 transition-all duration-200`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`font-semibold ${theme.text}`}>{payment.title}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                                payment.type ?? 'other'
                              )}`}
                            >
                              {getTypeName(payment.type ?? 'other')}
                            </span>
                          </div>
                          <div className={`text-sm ${theme.textSecondary}`}>Vencimento: {payment.dueDate}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${theme.text}`}>
                            R$ {payment.link ? parseFloat(payment.link.split('|')[0] || '0').toFixed(2) : '0.00'}
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handlePayment(payment)}
                              className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              Pagar
                            </button>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              Deletar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'paid' && (
                <div className="space-y-4">
                  {payments.paid.map((payment) => (
                    <div key={payment.id} className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`font-semibold ${theme.text}`}>{payment.title}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                                payment.type ?? 'other'
                              )}`}
                            >
                              {getTypeName(payment.type ?? 'other')}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                              ✓ Pago
                            </span>
                          </div>
                          <div className={`text-sm ${theme.textSecondary}`}>Pago em: {payment.paidDate}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">
                            R$ {payment.link ? parseFloat(payment.link.split('|')[0] || '0').toFixed(2) : '0.00'}
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              className={`${theme.secondaryBg} ${theme.textSecondary} px-3 py-1 rounded-lg ${theme.hover} transition-colors text-sm`}
                            >
                              Ver Comprovante
                            </button>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              Deletar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'overdue' && (
                <div className="space-y-4">
                  {payments.overdue.map((payment) => (
                    <div key={payment.id} className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`font-semibold ${theme.text}`}>{payment.title}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                                payment.type ?? 'other'
                              )}`}
                            >
                              {getTypeName(payment.type ?? 'other')}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                              ⚠ Atrasado
                            </span>
                          </div>
                          <div className="text-sm text-red-400">Venceu em: {payment.dueDate}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-400">
                            R$ {payment.link ? parseFloat(payment.link.split('|')[0] || '0').toFixed(2) : '0.00'}
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handlePayment(payment)}
                              className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              Pagar Agora
                            </button>
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
                              className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              Deletar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {payments[activeTab].length === 0 && (
                <div className="text-center py-12">
                  <div className={`w-16 h-16 ${theme.secondaryBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>
                    Nenhum pagamento {activeTab === 'pending' ? 'pendente' : activeTab === 'paid' ? 'realizado' : 'atrasado'}
                  </h3>
                  <p className={theme.textSecondary}>
                    {activeTab === 'pending' && 'Todos os pagamentos estão em dia!'}
                    {activeTab === 'paid' && 'Nenhum pagamento foi realizado ainda.'}
                    {activeTab === 'overdue' && 'Não há pagamentos atrasados.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modals */}
          {showBoletoModal && selectedPayment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#1a1d4f] border border-[#2a2d6f] rounded-xl p-6 w-96">
                <h3 className="text-lg font-semibold text-white mb-4">Dados do Pagamento</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Título</p>
                    <p className="font-medium text-white">{selectedPayment.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Valor</p>
                    <p className="font-medium text-lg text-white">
                      R$ {selectedPayment.link ? parseFloat(selectedPayment.link.split('|')[0] || '0').toFixed(2) : '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Vencimento</p>
                    <p className="font-medium text-white">
                      {new Date(selectedPayment.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {selectedPayment.link && (
                    <div>
                      <p className="text-sm text-gray-400">Código do Boleto</p>
                      <p className="font-mono text-sm bg-[#0f1136] p-2 rounded text-gray-300">{selectedPayment.link}</p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => setShowBoletoModal(false)}
                      className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmPayment}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirmar Pagamento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[#1a1d4f] border border-[#2a2d6f] rounded-xl p-6 w-96">
                <h3 className="text-lg font-semibold text-white mb-4">Adicionar Boleto</h3>
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                    <input
                      type="text"
                      value={newPayment.title}
                      onChange={(e) => setNewPayment({ ...newPayment, title: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1136] border border-[#2a2d6f] rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1136] border border-[#2a2d6f] rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento</label>
                    <input
                      type="date"
                      value={newPayment.dueDate}
                      onChange={(e) => setNewPayment({ ...newPayment, dueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-[#0f1136] border border-[#2a2d6f] rounded-lg focus:outline-none focus:border-blue-500 text-white"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setNewPayment({ title: '', description: '', amount: '', dueDate: '' });
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Adicionar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </div>
  );
}
