<script setup lang="ts">
import { ref, watchEffect, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useLocalStorage } from "../../composables/useLocalStorage";
import { useFormBuilderStore } from "../../stores/formBuilder";

// Router und Route
const router = useRouter();
const route = useRoute();
const formBuilderStore = useFormBuilderStore();

// Komponente für den Header mit Themenverwaltung
const { getItem, setItem } = useLocalStorage();
const themeStorageKey = "form-builder-theme";

// Theme management
const storedTheme = getItem<"light" | "dark">(themeStorageKey);
const currentTheme = ref<"light" | "dark">(storedTheme || "dark");

// Prüfen, ob wir uns in der Formular-Ansicht befinden
const isFormViewActive = computed(() => {
  return route.name === "FormBuilder" || route.name === "FormBuilderEditor";
});

// Settings dropdown
const showSettingsDropdown = ref(false);
const settingsItems = [
  {
    name: "Preferences",
    path: "/preferences",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>`,
  },
  {
    name: "API Keys",
    path: "/api-key",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L9 19l-1 1v-1.243a6 6 0 111.06-10.638" />
            <path d="M9 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>`,
  },
];

watchEffect(() => {
  document.body.setAttribute("data-theme", currentTheme.value);
  setItem(themeStorageKey, currentTheme.value);
});

// Function to set theme
const setTheme = (themeName: "light" | "dark") => {
  currentTheme.value = themeName;
};

// Event emitter für Theme-Änderungen
const emit = defineEmits(["change-theme"]);

function toggleTheme() {
  const newTheme = currentTheme.value === "light" ? "dark" : "light";
  setTheme(newTheme);
  emit("change-theme", newTheme);
}

function toggleSettingsDropdown() {
  showSettingsDropdown.value = !showSettingsDropdown.value;
}

function navigateTo(path: string) {
  router.push(path);
  showSettingsDropdown.value = false;
}

function backToFormBuilder() {
  // Wenn ein aktives Formular existiert, zurück dorthin
  if (formBuilderStore.activeFormId) {
    // Formular auswählen und zur Builder-Ansicht wechseln
    formBuilderStore.setActiveForm(formBuilderStore.activeFormId);
    router.push({ name: "FormBuilder" });
  } else if (formBuilderStore.formList.length > 0) {
    // Wenn kein aktives Formular, aber Formulare existieren, wähle das erste
    formBuilderStore.setActiveForm(formBuilderStore.formList[0].id);
    router.push({ name: "FormBuilder" });
  } else {
    // Wenn keine Formulare existieren, einfach zur Builder-Ansicht
    router.push({ name: "FormBuilder" });
  }
}

// Schließen beim Klick außerhalb
function closeDropdownOnClickOutside(event: MouseEvent) {
  if (showSettingsDropdown.value && event.target instanceof HTMLElement) {
    const dropdown = document.querySelector(".settings-dropdown");
    const button = document.querySelector(".settings-toggle");

    if (
      dropdown &&
      button &&
      !dropdown.contains(event.target) &&
      !button.contains(event.target)
    ) {
      showSettingsDropdown.value = false;
    }
  }
}

onMounted(() => {
  document.addEventListener("click", closeDropdownOnClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", closeDropdownOnClickOutside);
});
</script>

<template>
  <header class="app-header">
    <div class="app-header__logo">
      <router-link to="/" class="logo-link">Form Builder</router-link>
    </div>
    <div class="app-header__actions">
      <!-- Zurück zur Formular-Ansicht Button -->
      <button
        v-if="!isFormViewActive"
        @click="backToFormBuilder"
        class="form-view-button"
        title="Zurück zum Formular-Builder"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span>Formular-Builder</span>
      </button>

      <button @click="toggleTheme" class="theme-toggle">
        <svg
          v-if="currentTheme === 'dark'"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>

      <!-- Settings Dropdown -->
      <div class="settings-container">
        <button @click="toggleSettingsDropdown" class="settings-toggle">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        <div v-if="showSettingsDropdown" class="settings-dropdown">
          <div
            v-for="item in settingsItems"
            :key="item.name"
            class="settings-item"
            @click="navigateTo(item.path)"
          >
            <span v-html="item.icon"></span>
            <span>{{ item.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  background: linear-gradient(to right, #232834, #2c313c);
  border-bottom: 1px solid var(--theme-border);
  padding: 0 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 100;

  &__logo {
    font-weight: 600;
    font-size: 1.1rem;
    color: var(--theme-primary);

    .logo-link {
      color: var(--theme-primary);
      text-decoration: none;
      transition: color 0.2s;

      &:hover {
        color: var(--theme-primary-light, #1dd1af);
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.8rem;
  }
}

.form-view-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--theme-primary, #1abc9c);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--theme-primary-light, #1dd1af);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.theme-toggle,
.settings-toggle {
  background: none;
  border: none;
  color: var(--theme-text);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

.settings-container {
  position: relative;
}

.settings-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  width: 180px;
  background: var(--theme-bg-surface);
  border: 1px solid var(--theme-border);
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 200;
  overflow: hidden;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  color: var(--theme-text);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}
</style>
