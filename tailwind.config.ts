import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores base do Design "CentralCondo"
        'background': '#222147', // O fundo azul-escuro principal
        'surface': '#302E5D',   // O roxo mais escuro dos cards e da sidebar
        'foreground': '#FFFFFF', // Texto principal (branco)
        'muted': '#BDBDBD',     // Texto secundário (cinza claro, "User")
        'text-dark': '#333333',  // Texto para fundos claros (ex: o post-it)
        
        // Cores de Acento (ícones, botões, avisos)
        'accent': {
          'yellow': '#F9E79F',   // O "post-it" de avisos
          'blue': '#25B9D7',     // Círculo do ícone de Finanças ($)
          'calendar': '#F5C84C', // Círculo do ícone de Calendário
          'members': '#A569BD',  // Círculo do ícone de Membros
          'pink': '#E84F8E',     // Círculo do ícone de Documentos (rosa)
          'red': '#EF4444',      // Para alertas (ex: pagamento atrasado $)
        }
      },
      borderRadius: {
        'xl': '1.0rem', // O design usa bordas bem arredondadas
        '2xl': '1.5rem',
      }
    },
  },
  plugins: [],
};

export default config;