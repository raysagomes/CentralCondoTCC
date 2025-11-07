export const getSelectedModulesClient = (): string[] => {
  try {
    const email = localStorage.getItem('userEmail');
    const key = email ? `modules_${email}` : 'modules';
    const ls = localStorage.getItem(key);

    if (ls) {
      const parsed = JSON.parse(ls);
      if (Array.isArray(parsed) && parsed.length) {
        return parsed.includes('avisos') ? parsed : [...parsed, 'avisos'];
      }
    }
  } catch {}

  // fallback para cookie (mantido)
  try {
    const cookie = document.cookie.split('; ').find(c => c.startsWith('modules='));
    if (cookie) {
      const val = decodeURIComponent(cookie.split('=')[1] || '');
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.includes('avisos') ? parsed : [...parsed, 'avisos'];
      }
    }
  } catch {}

  return ['avisos'];
};
