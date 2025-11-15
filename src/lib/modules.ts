export const getSelectedModulesClient = (): string[] => {
  try {
    // Primeiro tenta do cookie user_data
    const cookie = document.cookie.split('; ').find(c => c.startsWith('user_data='));
    if (cookie) {
      const value = cookie.split('=')[1];
      const userData = JSON.parse(atob(value));
      if (userData.modules && Array.isArray(userData.modules)) {
        return userData.modules;
      }
    }
  } catch {}

  // Fallback para localStorage
  try {
    const email = localStorage.getItem('userEmail');
    const key = email ? `modules_${email}` : 'modules';
    const ls = localStorage.getItem(key);

    if (ls) {
      const parsed = JSON.parse(ls);
      if (Array.isArray(parsed) && parsed.length) {
        const required = ['avisos', 'calendario', 'equipe'];
        const combined = [...new Set([...parsed, ...required])];
        return combined;
      }
    }
  } catch {}

  return ['avisos'];
};
