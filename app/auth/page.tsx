'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/modules/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaPuzzlePiece, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Auth() {
const [isLogin, setIsLogin] = useState(true);
const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const { login, register } = useAuth();
const router = useRouter();
const searchParams = useSearchParams();

useEffect(() => {
const mode = searchParams.get('mode');
if (mode === 'register') setIsLogin(false);
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

    // Cria conta
    const result = await register(formData.name, formData.email, formData.password, 'default-security-word');

    if (result.success) {
      // 🔹 NOVO: Redireciona para tela de módulos, não para dashboard
      router.replace('/setup-modules');
    } else {
      setError(result.error || 'Erro no registro');
    }
  }
} finally {
  setLoading(false);
}

};

return ( <div className="min-h-screen bg-[#0f1136] flex items-center justify-center p-4"> <div className="bg-[#1a1d4f] border border-[#2a2d6f] p-8 rounded-xl w-full max-w-md"> <div className="text-center mb-8"> <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6"> <FaPuzzlePiece className="text-white text-3xl" /> </div> <h1 className="text-3xl font-bold text-white mb-2">CentralCondo</h1> <p className="text-gray-400">
{isLogin ? 'Entre na sua conta' : 'Crie sua conta'} </p> </div>

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
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
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
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
          placeholder="seu@email.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 pr-12 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {!isLogin && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Senha</label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 bg-[#0f1136] border border-[#2a2d6f] rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-gray-500"
            placeholder="••••••••"
            required
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors font-semibold disabled:opacity-50 mt-6"
      >
        {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
      </button>
    </form>

    <div className="mt-6 text-center space-y-2">
      <button
        onClick={() => setIsLogin(!isLogin)}
        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
      >
        {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
      </button>
    </div>
  </div>
</div>
);
}
