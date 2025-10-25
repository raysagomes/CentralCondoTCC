'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    router.push('/auth');
  };

  const handleCadastro = () => {
    router.push('/auth?mode=register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1136] via-[#1a1d4f] to-[#2d1b69] text-white overflow-x-hidden">
      {/* Header Fixo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1d4f]/90 backdrop-blur-lg border-b border-[#2a2d6f] shadow-xl">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                🏢
              </div>
              <h1 className="text-xl md:text-2xl font-bold">CentralCondo</h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={handleCadastro}
                className="px-3 md:px-6 py-2 text-sm md:text-base text-gray-300 hover:text-white transition-colors"
              >
                cadastre-se
              </button>
              <button 
                onClick={handleLogin}
                disabled={isLoading}
                className="px-4 md:px-6 py-2 text-sm md:text-base bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 shadow-lg"
              >
                {isLoading ? '⏳' : 'login'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Texto Principal */}
            <div className="space-y-4 md:space-y-6">
              <div className="inline-flex items-center space-x-2 bg-yellow-500/20 border border-yellow-500/50 rounded-full px-4 py-2 shadow-lg">
                <span className="text-2xl md:text-3xl">😊</span>
                <span className="text-yellow-300 font-medium text-sm md:text-base">Bem-vindo!</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Já faz parte da nossa{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                  comunidade?
                </span>
              </h2>
              
              <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                Nosso sistema foi desenvolvido para facilitar sua rotina e ajudar você e sua equipe a se organizarem de forma simples e eficiente. Aqui você encontra ferramentas para gerenciar projetos, acompanhar o calendário de eventos, controlar pagamentos e gerenciar membros da equipe.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4">
                <button 
                  onClick={handleLogin}
                  className="group px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold text-base md:text-lg transition-all hover:scale-105 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center space-x-2"
                >
                  <span>login</span>
                  <span className="group-hover:translate-x-1 transition-transform text-xl">→</span>
                </button>
                <button 
                  onClick={handleCadastro}
                  className="px-6 md:px-8 py-3 md:py-4 border-2 border-gray-600 hover:border-blue-500 hover:bg-blue-500/10 rounded-xl font-semibold text-base md:text-lg transition-all hover:scale-105"
                >
                  cadastre-se
                </button>
              </div>
            </div>

            {/* Ilustração */}
            <div className="relative mt-8 md:mt-0">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-2xl">
                  <div className="text-center">
                    <div className="text-6xl md:text-8xl mb-4">👨‍💻</div>
                    <div className="w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-4"></div>
                    <p className="text-gray-300 text-sm md:text-base">Gerencie tudo em um só lugar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="py-12 md:py-20 px-4 md:px-6 bg-[#0a0d2e]/50">
        <div className="container mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              conheça nossas funcionalidades
            </h3>
            <p className="text-gray-400 text-base md:text-lg">
              Tudo que você precisa para gerenciar seu condomínio
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="group bg-[#1a1d4f] border border-[#2a2d6f] rounded-2xl p-6 md:p-8 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 group-hover:rotate-12 transition-transform shadow-lg">
                💳
              </div>
              <h4 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Pagamentos</h4>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Controle todos os pagamentos do condomínio de forma simples e organizada. Receba notificações de vencimento.
              </p>
            </div>

            <div className="group bg-[#1a1d4f] border border-[#2a2d6f] rounded-2xl p-6 md:p-8 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
              <div className="w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 group-hover:rotate-12 transition-transform shadow-lg">
                📅
              </div>
              <h4 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Calendário</h4>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Organize eventos, reuniões e reservas de áreas comuns. Nunca mais perca um compromisso importante.
              </p>
            </div>

            <div className="group bg-[#1a1d4f] border border-[#2a2d6f] rounded-2xl p-6 md:p-8 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl sm:col-span-2 lg:col-span-1">
              <div className="w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center text-3xl md:text-4xl mb-4 md:mb-6 group-hover:rotate-12 transition-transform shadow-lg">
                👥
              </div>
              <h4 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Membros</h4>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                Gerencie moradores, colaboradores e visitantes. Mantenha o cadastro sempre atualizado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">
              Pronto para começar?
            </h3>
            <p className="text-base md:text-xl text-blue-100 mb-6 md:mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de condomínios que já usam o CentralCondo
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
              <button 
                onClick={handleCadastro}
                className="px-8 md:px-10 py-3 md:py-4 bg-white text-blue-600 hover:bg-gray-100 rounded-xl font-bold text-base md:text-lg transition-all hover:scale-105 shadow-xl"
              >
                Cadastre-se grátis
              </button>
              <button 
                onClick={handleLogin}
                className="px-8 md:px-10 py-3 md:py-4 border-2 border-white hover:bg-white/10 rounded-xl font-bold text-base md:text-lg transition-all hover:scale-105"
              >
                Fazer login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2a2d6f] py-6 md:py-8 px-4 md:px-6 bg-[#0a0d2e]/50">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-3 md:mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-lg md:text-xl shadow-lg">
              🏢
            </div>
            <span className="text-lg md:text-xl font-bold">CentralCondo</span>
          </div>
          <p className="text-gray-500 text-sm md:text-base">
            © 2025 CentralCondo. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
