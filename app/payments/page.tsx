'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaDollarSign } from 'react-icons/fa';

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
  barcode?: string;
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
    barcode: '',
    link: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const handleDeletePayment = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (paymentToDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/payments/${paymentToDelete}`, {
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
    setShowDeleteModal(false);
    setPaymentToDelete(null);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newPayment.title || !newPayment.title.trim()) {
      newErrors.title = 'Campo Título é obrigatório';
    } else if (newPayment.title.trim().length < 3) {
      newErrors.title = 'Campo Título deve ter pelo menos 3 caracteres';
    }
    
    if (!newPayment.amount) {
      newErrors.amount = 'Campo Valor é obrigatório';
    } else {
      const numValue = parseFloat(newPayment.amount);
      if (isNaN(numValue) || numValue <= 0) {
        newErrors.amount = 'Campo Valor deve ser maior que R$ 0,00';
      }
    }
    
    if (!newPayment.dueDate) {
      newErrors.dueDate = 'Campo Data de Vencimento é obrigatório';
    }
    
    const hasBarcode = newPayment.barcode && newPayment.barcode.trim();
    const hasLink = newPayment.link && newPayment.link.trim();
    
    if (!hasBarcode && !hasLink) {
      newErrors.barcode = 'Preencha pelo menos um: Código de Barras ou Link de Pagamento';
      newErrors.link = 'Preencha pelo menos um: Código de Barras ou Link de Pagamento';
    } else {
      if (hasBarcode) {
        const digits = newPayment.barcode.replace(/\D/g, '');
        if (digits.length !== 47) {
          newErrors.barcode = `Campo Código de Barras com formato incorreto. Deve ter 47 dígitos, atual: ${digits.length}`;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const token = localStorage.getItem('token');
      const paymentData = {
        title: newPayment.title,
        amount: parseFloat(newPayment.amount),
        dueDate: newPayment.dueDate,
        barcode: newPayment.barcode || null,
        link: newPayment.link || null,
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
        setShowAddModal(false);
        setNewPayment({ title: '', description: '', amount: '', dueDate: '', barcode: '', link: '' });
        setErrors({});
        await refetch();
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.error || 'Erro ao adicionar pagamento' });
      }
    } catch (error) {
      setErrors({ general: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsSubmitting(false);
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
                          <div className={`text-sm ${theme.textSecondary}`}>Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${theme.text}`}>
                            R$ {payment.amount.toFixed(2)}
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
                              Pago
                            </span>
                          </div>
                          <div className={`text-sm ${theme.textSecondary}`}>Pago em: {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' }) + ' às ' + new Date(payment.paidDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza' }) : 'N/A'}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">
                            R$ {payment.amount.toFixed(2)}
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => {
                                setSelectedReceipt(payment);
                                setShowReceiptModal(true);
                              }}
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
                              Atrasado
                            </span>
                          </div>
                          <div className="text-sm text-red-400">Venceu em: {new Date(payment.dueDate).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-400">
                            R$ {payment.amount.toFixed(2)}
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
                    <FaDollarSign className="text-2xl" />
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
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
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
                      R$ {selectedPayment.amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Vencimento</p>
                    <p className="font-medium text-white">
                      {new Date(selectedPayment.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  {selectedPayment.barcode && (
                    <div>
                      <p className="text-sm text-gray-400">Código de Barras</p>
                      <p className="font-mono text-sm bg-[#0f1136] p-2 rounded text-gray-300">{selectedPayment.barcode}</p>
                    </div>
                  )}
                  {selectedPayment.link && (
                    <div>
                      <p className="text-sm text-gray-400">Link de Pagamento</p>
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
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[#1a1d4f] border border-[#2a2d6f] rounded-xl p-6 w-96">
                <h3 className="text-lg font-semibold text-white mb-4">Adicionar Boleto</h3>
                {errors.general && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {errors.general}
                  </div>
                )}
                <form onSubmit={handleAddPayment} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Título</label>
                    <input
                      type="text"
                      value={newPayment.title}
                      onChange={(e) => {
                        setNewPayment({ ...newPayment, title: e.target.value });
                        if (errors.title) setErrors({ ...errors, title: '' });
                      }}
                      className={`w-full px-3 py-2 bg-[#0f1136] border rounded-lg focus:outline-none text-white ${
                        errors.title ? 'border-red-500 focus:border-red-500' : 'border-[#2a2d6f] focus:border-blue-500'
                      }`}
                      required
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newPayment.amount}
                      onChange={(e) => {
                        setNewPayment({ ...newPayment, amount: e.target.value });
                        if (errors.amount) setErrors({ ...errors, amount: '' });
                      }}
                      className={`w-full px-3 py-2 bg-[#0f1136] border rounded-lg focus:outline-none text-white ${
                        errors.amount ? 'border-red-500 focus:border-red-500' : 'border-[#2a2d6f] focus:border-blue-500'
                      }`}
                      required
                    />
                    {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento</label>
                    <input
                      type="date"
                      value={newPayment.dueDate}
                      onChange={(e) => {
                        setNewPayment({ ...newPayment, dueDate: e.target.value });
                        if (errors.dueDate) setErrors({ ...errors, dueDate: '' });
                      }}
                      className={`w-full px-3 py-2 bg-[#0f1136] border rounded-lg focus:outline-none text-white ${
                        errors.dueDate ? 'border-red-500 focus:border-red-500' : 'border-[#2a2d6f] focus:border-blue-500'
                      }`}
                      required
                    />
                    {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Código de Barras</label>
                    <input
                      type="text"
                      value={newPayment.barcode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/, '$1.$2 $3.$4 $5.$6 $7 $8');
                        setNewPayment({ ...newPayment, barcode: formatted });
                        if (errors.barcode) setErrors({ ...errors, barcode: '' });
                      }}
                      className={`w-full px-3 py-2 bg-[#0f1136] border rounded-lg focus:outline-none font-mono text-white ${
                        errors.barcode ? 'border-red-500 focus:border-red-500' : 'border-[#2a2d6f] focus:border-blue-500'
                      }`}
                      placeholder="00000.00000 00000.000000 00000.000000 0 00000000000000"
                      maxLength={54}
                    />
                    {errors.barcode ? (
                      <p className="text-red-500 text-sm mt-1">{errors.barcode}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Digite apenas os números do código de barras</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Link de Pagamento ou Chave PIX</label>
                    <input
                      type="text"
                      value={newPayment.link}
                      onChange={(e) => {
                        setNewPayment({ ...newPayment, link: e.target.value });
                        if (errors.link) setErrors({ ...errors, link: '' });
                      }}
                      className={`w-full px-3 py-2 bg-[#0f1136] border rounded-lg focus:outline-none text-white ${
                        errors.link ? 'border-red-500 focus:border-red-500' : 'border-[#2a2d6f] focus:border-blue-500'
                      }`}
                      placeholder="https://... ou chave PIX"
                    />
                    {errors.link ? (
                      <p className="text-red-500 text-sm mt-1">{errors.link}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Link de pagamento ou chave PIX (opcional se código de barras preenchido)</p>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setNewPayment({ title: '', description: '', amount: '', dueDate: '', barcode: '', link: '' });
                        setErrors({});
                      }}
                      className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Adicionando...' : 'Adicionar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Confirmação de Exclusão */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[#1a1d4f] border border-[#2a2d6f] rounded-xl p-6 w-96">
                <h3 className="text-lg font-semibold text-white mb-4">Confirmar Exclusão</h3>
                <p className="text-gray-300 mb-6">Você tem certeza que deseja deletar este pagamento? Esta ação não pode ser desfeita.</p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Comprovante */}
          {showReceiptModal && selectedReceipt && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-[#1a1d4f] border border-[#2a2d6f] rounded-xl p-6 w-96 max-w-md">
                <h3 className="text-lg font-semibold text-white mb-4">Comprovante de Pagamento</h3>
                <div className="space-y-4">
                  <div className="text-center border-b border-gray-600 pb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white text-xl">✓</span>
                    </div>
                    <p className="text-green-400 font-semibold">Pagamento Realizado</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Título</p>
                    <p className="font-medium text-white">{selectedReceipt.title}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Valor Pago</p>
                    <p className="font-medium text-lg text-green-400">
                      R$ {selectedReceipt.amount?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Data de Vencimento</p>
                    <p className="font-medium text-white">
                      {new Date(selectedReceipt.dueDate).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Data do Pagamento</p>
                    <p className="font-medium text-white">
                      {selectedReceipt.paidDate ? 
                        new Date(selectedReceipt.paidDate).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' }) + 
                        ' às ' + 
                        new Date(selectedReceipt.paidDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Fortaleza' })
                        : 'N/A'
                      }
                    </p>
                  </div>
                  
                  {selectedReceipt.barcode && (
                    <div>
                      <p className="text-sm text-gray-400">Código de Barras</p>
                      <p className="font-mono text-xs bg-[#0f1136] p-2 rounded text-gray-300 break-all">{selectedReceipt.barcode}</p>
                    </div>
                  )}
                  
                  {selectedReceipt.link && (
                    <div>
                      <p className="text-sm text-gray-400">Link de Pagamento</p>
                      <p className="font-mono text-xs bg-[#0f1136] p-2 rounded text-gray-300 break-all">{selectedReceipt.link}</p>
                    </div>
                  )}
                  
                  <div className="text-center pt-4 border-t border-gray-600">
                    <p className="text-xs text-gray-500">Comprovante gerado automaticamente</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </div>
  );
}
