import { ref, computed, watch } from "vue";

export type Theme = "dark" | "light" | "original";

const STORAGE_KEY = "form-builder-theme";

// Global reactive theme state
const currentTheme = ref<Theme>("dark");

// Load theme from localStorage on initial load
const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme;
if (savedTheme && ["dark", "light", "original"].includes(savedTheme)) {
  currentTheme.value = savedTheme;
}

export function useTheme() {
  const theme = computed({
    get: () => currentTheme.value,
    set: (value: Theme) => {
      currentTheme.value = value;
      localStorage.setItem(STORAGE_KEY, value);
      applyTheme(value);
    },
  });

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme;
  };

  const toggleTheme = () => {
    const themes: Theme[] = ["dark", "light", "original"];
    const currentIndex = themes.indexOf(currentTheme.value);
    const nextIndex = (currentIndex + 1) % themes.length;
    theme.value = themes[nextIndex];
  };

  const getThemeLabel = (themeKey: Theme): string => {
    const labels = {
      dark: "🌙 Dark",
      light: "☀️ Light",
      original: "🎨 Original",
    };
    return labels[themeKey];
  };

  const applyTheme = (themeKey: Theme) => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove("theme-dark", "theme-light", "theme-original");

    // Add current theme class
    root.classList.add(`theme-${themeKey}`);
  };

  // Apply theme on initial load
  applyTheme(currentTheme.value);

  // Watch for theme changes and apply them
  watch(currentTheme, (newTheme) => {
    applyTheme(newTheme);
  });

  return {
    theme,
    setTheme,
    toggleTheme,
    getThemeLabel,
  };
}
