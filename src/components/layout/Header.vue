<script setup lang="ts">
import { ref, watchEffect, onMounted, onUnmounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useLocalStorage } from "@/composables";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { SvgIcon } from "@/components/common";

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
    icon: "settings",
  },
  {
    name: "API Keys",
    path: "/api-key",
    icon: "key",
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
        <SvgIcon name="arrow-up" :size="20" />
        <span>Formular-Builder</span>
      </button>

      <button @click="toggleTheme" class="theme-toggle">
        <SvgIcon v-if="currentTheme === 'dark'" name="sun" :size="20" />
        <SvgIcon v-else name="moon" :size="20" />
      </button>

      <!-- Settings Dropdown -->
      <div class="settings-container">
        <button @click="toggleSettingsDropdown" class="settings-toggle">
          <SvgIcon name="user" :size="20" />
        </button>

        <div v-if="showSettingsDropdown" class="settings-dropdown">
          <div
            v-for="item in settingsItems"
            :key="item.name"
            class="settings-item"
            @click="navigateTo(item.path)"
          >
            <SvgIcon :name="item.icon" :size="16" />
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
