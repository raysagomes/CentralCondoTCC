'use client';
import { useState } from 'react';
import { FaCreditCard, FaTimes } from 'react-icons/fa';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedModules: string[];
  userModules: string[];
}

const moduleNames = {
  projetos: 'Projetos',
  pagamento: 'Pagamentos'
};

export default function PaymentModal({ isOpen, onClose, onConfirm, selectedModules, userModules }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    holderName: '',
    expiry: '',
    cvv: ''
  });
  const [includeAdditional, setIncludeAdditional] = useState(false);

  if (!isOpen) return null;

  const availableModules = [{ id: 'projetos', name: 'Projetos' }, { id: 'pagamento', name: 'Pagamentos' }];
  const optionalModules = selectedModules.filter(m => ['projetos', 'pagamento'].includes(m));
  const additionalModule = availableModules.find(m => !userModules.includes(m.id) && !selectedModules.includes(m.id));
  
  const finalModules = includeAdditional && additionalModule ? [...optionalModules, additionalModule.id] : optionalModules;
  const moduleCount = finalModules.length;
  const price = moduleCount === 2 ? 50 : moduleCount * 30;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      const month = v.substring(0, 2);
      const year = v.substring(2, 4);
      if (parseInt(month) > 12 || parseInt(month) < 1) {
        return v.substring(0, 1);
      }
      return month + (year ? '/' + year : '');
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData({...formData, cardNumber: formatted});
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setFormData({...formData, expiry: formatted});
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 3);
    setFormData({...formData, cvv: value});
  };

  const handleConfirm = () => {
    onConfirm(finalModules);
    onClose();
    setFormData({ cardNumber: '', holderName: '', expiry: '', cvv: '' });
    setIncludeAdditional(false);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <FaCreditCard className="mr-2 text-blue-600" />
            Adicionar método de pagamento
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Módulos selecionados:</h4>
          {optionalModules.map(module => (
            <div key={module} className="text-sm text-gray-600">
              • {moduleNames[module as keyof typeof moduleNames]}
            </div>
          ))}
          
          {additionalModule && (
            <div className="mt-3 p-3 border border-gray-200 rounded-lg">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAdditional}
                  onChange={(e) => setIncludeAdditional(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Deseja assinar também o módulo de {additionalModule.name}? 
                  <span className="text-blue-600 font-medium">+R$ 30,00</span>
                  {optionalModules.length > 0 && (
                    <span className="text-green-600 font-medium"> (Total: R$ 50,00)</span>
                  )}
                </span>
              </label>
            </div>
          )}
          
          <div className="mt-3 text-lg font-bold text-blue-600">
            Total: R$ {price},00/mês
          </div>
          {moduleCount === 2 && (
            <div className="text-sm text-green-600 font-medium">
              ✓ Desconto aplicado! (R$ 60 → R$ 50)
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Número do cartão
            </label>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              value={formData.cardNumber}
              onChange={handleCardNumberChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nome do titular
            </label>
            <input
              type="text"
              placeholder="João Silva"
              value={formData.holderName}
              onChange={(e) => setFormData({...formData, holderName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Validade
              </label>
              <input
                type="text"
                placeholder="MM/AA"
                value={formData.expiry}
                onChange={handleExpiryChange}
                maxLength={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                value={formData.cvv}
                onChange={handleCvvChange}
                maxLength={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="text-xs text-gray-500 mb-4">
          • Cada módulo extra custa R$ 30,00/mês<br/>
          • Assinando dois módulos não obrigatórios: R$ 50,00/mês (desconto automático)
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Confirmar assinatura do módulo
          </button>
        </div>
      </div>
    </div>
  );
}