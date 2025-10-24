'use client';
import { useAuth } from '../../src/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '../../src/components/Layout/Sidebar';
import Header from '../../src/components/Layout/Header';
import { usePayments } from '../../src/hooks/usePayments';

export default function Payments() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { payments: allPayments, loading: paymentsLoading, markAsPaid } = usePayments();
  const [activeTab, setActiveTab] = useState('pending');
  const [showBoletoModal, setShowBoletoModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [newPayment, setNewPayment] = useState({ title: '', amount: '', dueDate: '', barcode: '', link: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payments = {
    pending: allPayments.filter(p => {
      if (p.paid) return false;
      const dueDate = new Date(p.dueDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fim do dia atual
      return dueDate >= today;
    }),
    paid: allPayments.filter(p => p.paid),
    overdue: allPayments.filter(p => {
      if (p.paid) return false;
      const dueDate = new Date(p.dueDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fim do dia atual
      return dueDate < today;
    })
  };

  const handlePayment = (payment: any) => {
    setSelectedPayment(payment);
    setShowBoletoModal(true);
  };

  const confirmPayment = async () => {
    if (selectedPayment) {
      await markAsPaid(selectedPayment.id);
      setShowBoletoModal(false);
      setSelectedPayment(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validação do Título
    if (!newPayment.title || !newPayment.title.trim()) {
      newErrors.title = 'Campo Título é obrigatório';
    } else if (newPayment.title.trim().length < 3) {
      newErrors.title = 'Campo Título deve ter pelo menos 3 caracteres';
    } else if (newPayment.title.trim().length > 100) {
      newErrors.title = 'Campo Título não pode ter mais de 100 caracteres';
    }
    
    // Validação do Valor
    if (!newPayment.amount) {
      newErrors.amount = 'Campo Valor é obrigatório';
    } else {
      const numValue = parseFloat(newPayment.amount);
      if (isNaN(numValue)) {
        newErrors.amount = 'Campo Valor com formato inválido';
      } else if (numValue <= 0) {
        newErrors.amount = 'Campo Valor deve ser maior que R$ 0,00';
      } else if (numValue > 999999.99) {
        newErrors.amount = 'Campo Valor não pode ser maior que R$ 999.999,99';
      }
    }
    
    // Validação da Data
    if (!newPayment.dueDate) {
      newErrors.dueDate = 'Campo Data de Vencimento é obrigatório';
    } else {
      const selectedDate = new Date(newPayment.dueDate);
      if (isNaN(selectedDate.getTime())) {
        newErrors.dueDate = 'Campo Data de Vencimento com formato inválido';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          newErrors.dueDate = 'Campo Data de Vencimento não pode ser anterior a hoje';
        }
      }
    }
    
    // Validação: pelo menos um dos dois deve ser preenchido
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
      if (hasLink && newPayment.link.length < 10) {
        newErrors.link = 'Campo Link de Pagamento deve ter pelo menos 10 caracteres';
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
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newPayment.title,
          amount: parseFloat(newPayment.amount),
          dueDate: newPayment.dueDate,
          barcode: newPayment.barcode || null,
          link: newPayment.link || null,
          type: 'other'
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewPayment({ title: '', amount: '', dueDate: '', barcode: '', link: '' });
        setErrors({});
        window.location.reload();
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
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'condominium': return 'bg-blue-100 text-blue-800';
      case 'service': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'security': return 'bg-purple-100 text-purple-800';
      case 'fine': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'condominium': return 'Condomínio';
      case 'service': return 'Serviço';
      case 'maintenance': return 'Manutenção';
      case 'security': return 'Segurança';
      case 'fine': return 'Multa';
      default: return 'Outro';
    }
  };

  const tabs = [
    { id: 'pending', name: 'Pendentes', count: payments.pending.length },
    { id: 'paid', name: 'Pagos', count: payments.paid.length },
    { id: 'overdue', name: 'Atrasados', count: payments.overdue.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <div className="ml-20 pt-20 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pagamentos</h1>
          <p className="text-gray-600 mt-2">Gerencie boletos e pagamentos</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pagamentos</h2>
                <p className="text-sm text-gray-600">Gerencie boletos e pagamentos</p>
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
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
                  <div key={payment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{payment.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(payment.type)}`}>
                            {getTypeName(payment.type)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Vencimento: {payment.dueDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          R$ {payment.amount.toFixed(2)}
                        </div>
                        <button 
                          onClick={() => handlePayment(payment)}
                          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Pagar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'paid' && (
              <div className="space-y-4">
                {payments.paid.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{payment.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(payment.type)}`}>
                            {getTypeName(payment.type)}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Pago
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Pago em: {payment.paidDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          R$ {payment.amount.toFixed(2)}
                        </div>
                        <button className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                          Ver Comprovante
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'overdue' && (
              <div className="space-y-4">
                {payments.overdue.map((payment) => (
                  <div key={payment.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{payment.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(payment.type)}`}>
                            {getTypeName(payment.type)}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ⚠ Atrasado
                          </span>
                        </div>
                        <div className="text-sm text-red-600">
                          Venceu em: {payment.dueDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          R$ {payment.amount.toFixed(2)}
                        </div>
                        <button 
                          onClick={() => handlePayment(payment)}
                          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Pagar Agora
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {payments[activeTab].length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum pagamento {activeTab === 'pending' ? 'pendente' : activeTab === 'paid' ? 'realizado' : 'atrasado'}
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' && 'Todos os pagamentos estão em dia!'}
                  {activeTab === 'paid' && 'Nenhum pagamento foi realizado ainda.'}
                  {activeTab === 'overdue' && 'Não há pagamentos atrasados.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {showBoletoModal && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Dados do Pagamento</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Título</p>
                  <p className="font-medium">{selectedPayment.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor</p>
                  <p className="font-medium text-lg">R$ {selectedPayment.amount?.toFixed(2) || '0.00'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vencimento</p>
                  <p className="font-medium">{new Date(selectedPayment.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                {selectedPayment.link && (
                  <div>
                    <p className="text-sm text-gray-600">Código do Boleto</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedPayment.link}</p>
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    onClick={() => setShowBoletoModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Adicionar Boleto</h3>
              {errors.general && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {errors.general}
                </div>
              )}
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={newPayment.title}
                    onChange={(e) => {
                      setNewPayment({...newPayment, title: e.target.value});
                      if (errors.title) setErrors({...errors, title: ''});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.title 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newPayment.amount}
                    onChange={(e) => {
                      setNewPayment({...newPayment, amount: e.target.value});
                      if (errors.amount) setErrors({...errors, amount: ''});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.amount 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    value={newPayment.dueDate}
                    onChange={(e) => {
                      setNewPayment({...newPayment, dueDate: e.target.value});
                      if (errors.dueDate) setErrors({...errors, dueDate: ''});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.dueDate 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={newPayment.barcode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const formatted = value.replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/, '$1.$2 $3.$4 $5.$6 $7 $8');
                      setNewPayment({...newPayment, barcode: formatted});
                      if (errors.barcode) setErrors({...errors, barcode: ''});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 font-mono ${
                      errors.barcode 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link de Pagamento ou Chave PIX</label>
                  <input
                    type="text"
                    value={newPayment.link}
                    onChange={(e) => {
                      setNewPayment({...newPayment, link: e.target.value});
                      if (errors.link) setErrors({...errors, link: ''});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.link 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
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
                      setNewPayment({ title: '', amount: '', dueDate: '', barcode: '', link: '' });
                      setErrors({});
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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
      </div>
    </div>
  );
}