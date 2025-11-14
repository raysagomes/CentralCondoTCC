'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ModuleOption = { id: string; label: string; required?: boolean };

const MODULES: ModuleOption[] = [
  { id: 'avisos', label: 'Avisos (obrigatório)', required: true },
  { id: 'projetos', label: 'Projetos' },
  { id: 'calendario', label: 'Calendário' },
  { id: 'equipe', label: 'Membros' },
  { id: 'pagamento', label: 'Pagamentos' },
];

export default function SetupModulesPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(['avisos']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  //carrega modulos salvos para o usuario atual
  useEffect(() => {
    try {
      const email = localStorage.getItem('userEmail');
      const key = email ? `modules_${email}` : 'modules';
      const saved = localStorage.getItem(key);

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const ensureAvisos = parsed.includes('avisos')
            ? parsed
            : [...parsed, 'avisos'];
          setSelected(ensureAvisos);
        }
      }
    } catch (err) {
      console.warn('Erro ao carregar módulos locais:', err);
    }
  }, []);

  //Marca/desmarca um modulo
  const toggle = (id: string, required?: boolean) => {
    if (required) return; //nao desmarca obrigatorios
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Confirma e salva no localStorage/backend
  const handleConfirm = async () => {
    setSaving(true);
    setError(null);

    try {
      const modules = Array.from(new Set(['avisos', ...selected]));
      console.log('Salvando módulos selecionados:', modules);

      const email = localStorage.getItem('userEmail');
      const key = email ? `modules_${email}` : 'modules';

      localStorage.setItem(key, JSON.stringify(modules));

      const token = localStorage.getItem('token');

      if (token) {
        await fetch('/api/user/modules', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ modules }),
        });
      }

      router.replace('/dashboard');
    } catch (err) {
      console.error('Erro ao salvar módulos:', err);
      setError('Erro ao salvar módulos');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1136] text-white px-4">
      <div className="w-full max-w-xl bg-[#141852] border border-[#2a2d6f] rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Escolha seus módulos</h1>
        <p className="text-sm text-gray-300 mb-6">
          Selecione os módulos que você deseja ativar no seu painel.
        </p>

        <div className="flex flex-col gap-3">
          {MODULES.map((m) => (
            <label key={m.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 accent-blue-500"
                checked={selected.includes(m.id) || !!m.required}
                onChange={() => toggle(m.id, m.required)}
                disabled={!!m.required}
              />
              <span className="select-none">{m.label}</span>
            </label>
          ))}
        </div>

        {error && (
          <div className="mt-4 text-red-400 text-sm">{error}</div>
        )}

        <button
          onClick={handleConfirm}
          disabled={saving}
          className="mt-6 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {saving ? 'Salvando...' : 'Continuar para o painel'}
        </button>
      </div>
    </div>
  );
}