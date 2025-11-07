// src/utils/getSelectedModules.ts

/**
 * Retorna os módulos selecionados do usuário no cliente (navegador).
 * Compatível com tanto "modules" quanto "selectedModules" no localStorage.
 */
export function getSelectedModulesClient(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    // tenta ler os módulos do localStorage
    const stored =
      localStorage.getItem('modules') ||
      localStorage.getItem('selectedModules');

    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Erro ao ler módulos do localStorage:', error);
    return [];
  }
}