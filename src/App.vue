<script setup lang="ts">
import { ref, watchEffect, onMounted } from "vue";
import { useLocalStorage } from "@/composables/useLocalStorage";
import { useFormBuilderStore } from "@/stores/formBuilder";
import Header from "@/components/layout/Header.vue";
import Navi from "@/components/layout/Navi.vue";

// Store für Form Builder
const formBuilderStore = useFormBuilderStore();

// Theme management
const { getItem, setItem } = useLocalStorage();
const themeStorageKey = "form-builder-theme";

// Initialize currentTheme from localStorage or default to 'dark'
const storedTheme = getItem<"light" | "dark">(themeStorageKey);
const currentTheme = ref<"light" | "dark">(storedTheme || "dark");

watchEffect(() => {
  document.body.setAttribute("data-theme", currentTheme.value);
  setItem(themeStorageKey, currentTheme.value);
});

// Function to set theme
const setTheme = (themeName: "light" | "dark") => {
  currentTheme.value = themeName;
};

// Lade Formulare beim Start der Anwendung
onMounted(async () => {
  await formBuilderStore.loadInitialForms();

  // Setze das erste Formular als aktiv, wenn kein aktives Formular gesetzt ist
  if (formBuilderStore.formList.length > 0 && !formBuilderStore.activeFormId) {
    formBuilderStore.setActiveForm(formBuilderStore.formList[0].id);
  }
});
</script>

<template>
  <div class="app-layout">
    <div class="app-header-container">
      <Header @change-theme="setTheme" />
      <Navi />
    </div>
    <div class="app-content">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">
@use "assets/scss/abstracts" as *; // Ensure variables and mixins are available

// Globale Styles für HTML und Body
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

// App-wide standard layout styles
.app-layout {
  height: 100vh;
  height: 100dvh; // Dynamische Viewport-Höhe für mobile Browser
  display: flex;
  flex-direction: column;
  background-color: var(--theme-bg);
  color: var(--theme-text);
  overflow: hidden;
}

.app-header-container {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  z-index: 100; // Damit Header immer über dem Inhalt ist
}

.app-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

// Stelle sicher, dass das Router-View den gesamten verfügbaren Platz einnimmt
router-view {
  width: 100%;
  height: 100%;
}
</style>
