/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores OFICIAIS do Money Legal
        primary: {
          DEFAULT: '#0080FF',  // Azul principal
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CCFF',
          300: '#66B2FF',
          400: '#3399FF',
          500: '#0080FF',       // Cor principal
          600: '#0066CC',
          700: '#004D99',
          800: '#003366',
          900: '#001A33',
        },
        ciano: {
          DEFAULT: '#00BCD4',   // Ciano/Turquesa (destaque)
          50: '#E0F7FA',
          100: '#B2EBF2',
          200: '#80DEEA',
          300: '#4DD0E1',
          400: '#26C6DA',
          500: '#00BCD4',       // Cor principal
          600: '#00ACC1',
          700: '#0097A7',
          800: '#00838F',
          900: '#006064',
        },
        laranja: {
          DEFAULT: '#FF6B35',   // Laranja (ícones)
          500: '#FF6B35',
          600: '#FF5722',
        },
        roxo: {
          DEFAULT: '#8B5CF6',   // Roxo (ícones)
          500: '#8B5CF6',
          600: '#7C3AED',
        },
        // Background
        'bg-azul-claro': '#E8F4F8',
        'bg-azul-gradiente': '#F0F9FC',
        // Texto
        'texto-principal': '#1A1A1A',
        'texto-secundario': '#6B7280',
        'texto-claro': '#9CA3AF',
        // Semânticas
        success: {
          500: '#10B981',
          600: '#059669',
        },
        danger: {
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        'hero': ['3.5rem', { lineHeight: '1.1', fontWeight: '800' }],
        'display': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'button': '0 4px 12px rgba(0, 128, 255, 0.3)',
        'button-hover': '0 6px 20px rgba(0, 128, 255, 0.4)',
      },
      animation: {
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
