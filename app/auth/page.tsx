'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', securityWord: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({ email: '', securityWord: '', newPassword: '', confirmNewPassword: '' });
  const { login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          router.push('/dashboard');
        } else {
          setError(result.error || 'Erro no login');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Senhas não coincidem');
          return;
        }
        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          router.push('/dashboard');
        } else {
          setError(result.error || 'Erro no registro');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1136] flex items-center justify-center p-4">
      <div className="bg-[#1a1d4f] border border-[#2a2d6f] p-8 rounded-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">🧩</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CentralCondo</h1>
          <p className="text-gray-400">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
                placeholder="Seu nome completo"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Palavra de Segurança</label>
                <input
                  type="text"
                  value={formData.securityWord}
                  onChange={(e) => setFormData({...formData, securityWord: e.target.value})}
                  className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
                  placeholder="Para recuperar sua senha"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors font-semibold disabled:opacity-50 mt-6"
          >
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {isLogin && (
            <div>
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          )}
          <div>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
            >
              {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Esqueci Senha */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1d4f] border border-[#2a2d6f] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Recuperar Senha</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (forgotPasswordData.newPassword !== forgotPasswordData.confirmNewPassword) {
                setError('Senhas não coincidem');
                return;
              }
              try {
                const response = await fetch('/api/auth/reset-password', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    email: forgotPasswordData.email,
                    securityWord: forgotPasswordData.securityWord,
                    newPassword: forgotPasswordData.newPassword
                  })
                });
                if (response.ok) {
                  alert('Senha alterada com sucesso!');
                  setShowForgotPassword(false);
                  setForgotPasswordData({ email: '', securityWord: '', newPassword: '', confirmNewPassword: '' });
                } else {
                  const data = await response.json();
                  setError(data.error || 'Erro ao alterar senha');
                }
              } catch (error) {
                setError('Erro ao alterar senha');
              }
            }} className="space-y-4">
              <input
                type="email"
                placeholder="Seu email"
                value={forgotPasswordData.email}
                onChange={(e) => setForgotPasswordData({...forgotPasswordData, email: e.target.value})}
                className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
                required
              />
              <input
                type="text"
                placeholder="Palavra de segurança"
                value={forgotPasswordData.securityWord}
                onChange={(e) => setForgotPasswordData({...forgotPasswordData, securityWord: e.target.value})}
                className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
                required
              />
              <input
                type="password"
                placeholder="Nova senha"
                value={forgotPasswordData.newPassword}
                onChange={(e) => setForgotPasswordData({...forgotPasswordData, newPassword: e.target.value})}
                className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
                required
              />
              <input
                type="password"
                placeholder="Confirmar nova senha"
                value={forgotPasswordData.confirmNewPassword}
                onChange={(e) => setForgotPasswordData({...forgotPasswordData, confirmNewPassword: e.target.value})}
                className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-white placeholder-gray-500"
                required
              />
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors"
                >
                  Alterar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}