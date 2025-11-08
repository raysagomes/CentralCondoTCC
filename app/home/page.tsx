import { FaUsers, FaTasks, FaDollarSign, FaBell, FaCalendarAlt, FaBolt } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Gestão de <span className="text-blue-400">Equipes</span> e <span className="text-purple-400">Projetos</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Plataforma completa para planejamento, execução e acompanhamento de tarefas em tempo real.
            Organize seus fluxos de trabalho e garanta o cumprimento de prazos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            // amazonq-ignore-next-line
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Começar Agora
            </button>
            <button className="border border-[#2a2d6f] text-gray-300 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#1a1d4f] transition-colors">
              Ver Demo
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-[#1a1d4f] border border-[#2a2d6f] p-6 rounded-xl hover:border-blue-500/50 transition-all duration-200">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <FaUsers className="text-2xl text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Gerenciamento de Equipes</h3>
            <p className="text-gray-400">Criação de perfis, atribuição de funções e controle de acesso com comunicação interna.</p>
          </div>

          <div className="bg-[#1a1d4f] border border-[#2a2d6f] p-6 rounded-xl hover:border-purple-500/50 transition-all duration-200">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <FaTasks className="text-2xl text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Projetos e Atividades</h3>
            <p className="text-gray-400">Estruturação de projetos com etapas, prazos, responsáveis e status de progresso.</p>
          </div>

          <div className="bg-[#1a1d4f] border border-[#2a2d6f] p-6 rounded-xl hover:border-green-500/50 transition-all duration-200">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <FaDollarSign className="text-2xl text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sistema de Pagamentos</h3>
            <p className="text-gray-400">Controle de valores por tarefa e registro de pagamentos realizados e pendentes.</p>
          </div>

          <div className="bg-[#1a1d4f] border border-[#2a2d6f] p-6 rounded-xl hover:border-yellow-500/50 transition-all duration-200">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
              <FaBell className="text-2xl text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Avisos e Notificações</h3>
            <p className="text-gray-400">Envio automático de alertas sobre prazos, atualizações e mensagens internas.</p>
          </div>

          <div className="bg-[#1a1d4f] border border-[#2a2d6f] p-6 rounded-xl hover:border-pink-500/50 transition-all duration-200">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
              <FaCalendarAlt className="text-2xl text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Calendário Personalizável</h3>
            <p className="text-gray-400">Visualização de tarefas e eventos com filtros por equipe, projeto ou usuário.</p>
          </div>

          <div className="bg-[#1a1d4f] border border-[#2a2d6f] p-6 rounded-xl hover:border-red-500/50 transition-all duration-200">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
              <FaBolt className="text-2xl text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Tempo Real</h3>
            <p className="text-gray-400">Acompanhamento e atualizações instantâneas para toda a equipe.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1d4f] border-t border-[#2a2d6f] mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 CentralCondo. Plataforma de Gestão de Equipes e Projetos.</p>
          </div>
        </div>
      </footer>
    </div>
  );}