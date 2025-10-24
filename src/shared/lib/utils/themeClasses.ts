export const getThemeClasses = (isDark: boolean) => ({
  bg: isDark ? 'bg-[#0f1136]' : 'bg-slate-50',
  cardBg: isDark ? 'bg-[#1a1d4f]' : 'bg-white',
  secondaryBg: isDark ? 'bg-[#0f1136]' : 'bg-blue-50/50',
  border: isDark ? 'border-[#2a2d6f]' : 'border-blue-200/60',
  text: isDark ? 'text-white' : 'text-slate-800',
  textSecondary: isDark ? 'text-gray-400' : 'text-slate-600',
  hover: isDark ? 'hover:bg-[#2a2d6f]/30' : 'hover:bg-blue-50',
  input: isDark 
    ? 'bg-[#0f1136] border-[#2a2d6f] focus:border-blue-500 text-white' 
    : 'bg-white border-blue-200 focus:border-blue-400 text-slate-800'
});