<script setup lang="ts">
import { ref, watchEffect, onMounted, provide } from "vue";
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

// Provide global drag state for cross-component communication
provide("isDragging", ref(false));

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
@use "./assets/scss/main.scss";

.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: var(--theme-bg);
}

.app-header-container {
  flex-shrink: 0;
}

.app-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}
</style>
