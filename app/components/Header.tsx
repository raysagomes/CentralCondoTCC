export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🧩</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">CentralCondo</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Projetos</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Equipes</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Calendário</a>
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Pagamentos</a>
          </nav>
          <a href="/auth" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block">
            Entrar
          </a>
        </div>
      </div>
    </header>
  );
}