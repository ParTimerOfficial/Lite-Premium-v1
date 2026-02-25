import React, { createContext, useContext, useEffect, useState } from 'react';

// Theme context for managing dark/light mode
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Get initial theme from localStorage or default to dark
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // Set specific theme
  const setThemeMode = (themeMode) => {
    setTheme(themeMode);
  };

  // Theme styles for components
  const getThemeStyles = () => {
    if (theme === 'dark') {
      return {
        // Dark theme colors
        background: '#0a0a0a',
        surface: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#b0b0b0',
        primary: '#00f3ff',
        primaryHover: '#00d4e6',
        secondary: '#ffd700',
        secondaryHover: '#ffb800',
        accent: '#ff0055',
        border: '#333333',
        card: '#202020',
        shadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        glow: '0 0 10px rgba(0, 243, 255, 0.3)',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        overlay: 'rgba(0, 0, 0, 0.8)'
      };
    } else {
      return {
        // Light theme colors
        background: '#ffffff',
        surface: '#f8f9fa',
        text: '#000000',
        textSecondary: '#6c757d',
        primary: '#007bff',
        primaryHover: '#0056b3',
        secondary: '#28a745',
        secondaryHover: '#1e7e34',
        accent: '#dc3545',
        border: '#dee2e6',
        card: '#ffffff',
        shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        glow: '0 0 10px rgba(0, 123, 255, 0.2)',
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
        overlay: 'rgba(255, 255, 255, 0.8)'
      };
    }
  };

  // CSS-in-JS styles for common components
  const getComponentStyles = () => {
    const colors = getThemeStyles();
    
    return {
      button: {
        background: colors.primary,
        color: colors.text,
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: colors.shadow,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        position: 'relative',
        overflow: 'hidden'
      },
      buttonHover: {
        background: colors.primaryHover,
        transform: 'translateY(-2px)',
        boxShadow: colors.glow
      },
      buttonSecondary: {
        background: colors.secondary,
        color: colors.text,
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: colors.shadow
      },
      buttonSecondaryHover: {
        background: colors.secondaryHover,
        transform: 'translateY(-2px)'
      },
      card: {
        background: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '20px',
        boxShadow: colors.shadow,
        transition: 'all 0.3s ease'
      },
      input: {
        background: colors.surface,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px',
        width: '100%',
        transition: 'all 0.3s ease'
      },
      inputFocus: {
        borderColor: colors.primary,
        boxShadow: colors.glow,
        outline: 'none'
      },
      text: {
        color: colors.text
      },
      textSecondary: {
        color: colors.textSecondary
      },
      container: {
        background: colors.background,
        minHeight: '100vh',
        color: colors.text,
        transition: 'background-color 0.3s ease'
      }
    };
  };

  // Charge meter styles for collection button
  const getChargeMeterStyles = (progressPercent) => {
    const colors = getThemeStyles();
    
    let intensityClass = 'normal';
    if (progressPercent > 70) intensityClass = 'urgent';
    if (progressPercent >= 100) intensityClass = 'critical';

    const baseStyles = {
      normal: {
        filter: 'none',
        boxShadow: `0 0 5px ${colors.border}`,
        border: `2px solid ${colors.border}`
      },
      urgent: {
        filter: `drop-shadow(0 0 10px ${colors.primary})`,
        boxShadow: `0 0 15px ${colors.primary}`,
        border: `2px solid ${colors.primary}`,
        animation: 'pulse 2s infinite'
      },
      critical: {
        filter: `drop-shadow(0 0 15px ${colors.accent}) drop-shadow(0 0 25px ${colors.secondary})`,
        boxShadow: `0 0 20px ${colors.accent}, 0 0 30px ${colors.secondary}`,
        border: `3px solid ${colors.accent}`,
        animation: 'shake 0.5s infinite'
      }
    };

    return {
      ...baseStyles[intensityClass],
      background: colors.card,
      color: colors.text,
      transition: 'all 0.3s ease'
    };
  };

  // Electric hammer animation styles
  const getElectricHammerStyles = () => {
    const colors = getThemeStyles();
    
    return {
      hammerContainer: {
        position: 'relative',
        display: 'inline-block'
      },
      hammer: {
        animation: 'hammerStrike 0.5s ease-out',
        transformOrigin: 'top center'
      },
      particles: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        animation: 'particleExplosion 1s ease-out forwards'
      },
      spark: {
        position: 'absolute',
        background: colors.primary,
        borderRadius: '50%',
        animation: 'sparkAnimation 0.5s ease-out forwards'
      }
    };
  };

  const value = {
    theme,
    toggleTheme,
    setThemeMode,
    getThemeStyles,
    getComponentStyles,
    getChargeMeterStyles,
    getElectricHammerStyles,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// CSS-in-JS animations
export const themeStyles = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  @keyframes shake {
    0% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    50% { transform: translateX(5px); }
    75% { transform: translateX(-5px); }
    100% { transform: translateX(0); }
  }
  
  @keyframes hammerStrike {
    0% { transform: rotate(-30deg) scale(1); }
    50% { transform: rotate(0deg) scale(1.1); }
    100% { transform: rotate(0deg) scale(1); }
  }
  
  @keyframes particleExplosion {
    0% { transform: scale(0); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
  
  @keyframes sparkAnimation {
    0% { transform: scale(0); opacity: 1; }
    50% { transform: scale(2); opacity: 0.5; }
    100% { transform: scale(0); opacity: 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  
  /* Theme-specific CSS variables */
  :root[data-theme="dark"] {
    --bg-primary: #0a0a0a;
    --bg-secondary: #1a1a1a;
    --text-primary: #ffffff;
    --text-secondary: #b0b0b0;
    --primary-color: #00f3ff;
    --secondary-color: #ffd700;
    --accent-color: #ff0055;
    --border-color: #333333;
    --card-bg: #202020;
    --shadow-color: rgba(0, 0, 0, 0.3);
    --glow-color: rgba(0, 243, 255, 0.3);
  }
  
  :root[data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f8f9fa;
    --text-primary: #000000;
    --text-secondary: #6c757d;
    --primary-color: #007bff;
    --secondary-color: #28a745;
    --accent-color: #dc3545;
    --border-color: #dee2e6;
    --card-bg: #ffffff;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --glow-color: rgba(0, 123, 255, 0.2);
  }
  
  /* Global theme transitions */
  * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  }
  
  /* Performance optimization for animations */
  .will-change-transform {
    will-change: transform;
  }
  
  .will-change-opacity {
    will-change: opacity;
  }
  
  /* Mobile-specific optimizations */
  @media (max-width: 768px) {
    .theme-switcher {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
  }
`;

export default ThemeProvider;