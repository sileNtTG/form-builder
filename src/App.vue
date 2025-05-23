﻿<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";
import ThemeSwitcher from "./components/ui/ThemeSwitcher.vue";
import UserMenu from "./components/ui/UserMenu.vue";
import FormSelector from "./components/ui/FormSelector.vue";
import { ToastsWrapper, UnsavedChangesIndicator } from "./components/common";
import { useFormBuilderStore } from "./stores/formBuilder";
import { useToastStore } from "./stores/toast";
import { useAutoSave } from "./composables/useAutoSave";

const router = useRouter();
const route = useRoute();
const formBuilderStore = useFormBuilderStore();
const toastStore = useToastStore();

// Initialize auto-save functionality
const autoSave = useAutoSave();

const goToFieldsetTest = () => {
  router.push("/fieldset-test");
};

const goToForms = () => {
  router.push("/");
};

// Show FormSelector only on the main form builder page
const showFormSelector = computed(() => {
  return route.path === "/";
});

// Unsaved changes handling
const hasUnsavedChanges = computed(() => formBuilderStore.hasUnsavedChanges);

const handleSave = async () => {
  try {
    await formBuilderStore.saveForm();
    toastStore.addToast({
      type: "success",
      text: "Formular wurde erfolgreich gespeichert!",
    });
  } catch (error) {
    toastStore.addToast({
      type: "error",
      text: "Fehler beim Speichern des Formulars",
    });
  }
};

const handleDiscardChanges = () => {
  // Custom discard function for orange banner - doesn't clear all toasts
  if (formBuilderStore.activeFormId) {
    const restored = formBuilderStore.restoreOriginalFormState(
      formBuilderStore.activeFormId
    );

    if (restored) {
      toastStore.addToast({
        type: "info",
        text: "Änderungen wurden verworfen",
      });
    } else {
      // Fallback to reload from saved state
      const currentFormId = formBuilderStore.activeFormId;
      formBuilderStore.setActiveForm(currentFormId);
      formBuilderStore.markFormAsClean();
      toastStore.addToast({
        type: "info",
        text: "Änderungen wurden verworfen",
      });
    }
  }
};
</script>

<template>
  <div class="app">
    <!-- Main Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Form Builder</h1>
        </div>
        <div class="header-right">
          <button @click="goToForms" class="nav-button home-button">
            ← Formulare
          </button>
          <button @click="goToFieldsetTest" class="nav-button">
            Fieldset Test
          </button>
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>

    <!-- Unsaved Changes Indicator -->
    <UnsavedChangesIndicator
      :has-unsaved-changes="hasUnsavedChanges"
      @save="handleSave"
      @discard="handleDiscardChanges"
    />

    <!-- Secondary Navigation (conditional) -->
    <div v-if="showFormSelector" class="app-secondary-nav">
      <FormSelector />
    </div>

    <!-- Router View -->
    <div class="app-main">
      <router-view />
    </div>

    <!-- Global Toasts -->
    <ToastsWrapper />
  </div>
</template>

<style lang="scss">
// Import the main SCSS file which includes theme system
@use "@/assets/scss/main.scss";

// App-specific styles only
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: var(--theme-bg-primary);
  color: var(--theme-text);
  overflow: hidden;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--theme-bg-primary);
}

.app-header {
  background: var(--theme-bg-surface);
  border-bottom: 1px solid var(--theme-border);
  flex-shrink: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  height: 60px;
}

.header-left h1 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-button {
  background: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border);
  color: var(--theme-text);
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--theme-primary);
    color: white;
    border-color: var(--theme-primary);
    transform: translateY(-1px);
  }

  &.home-button {
    background: var(--theme-primary);
    color: white;
    border-color: var(--theme-primary);

    &:hover {
      background: var(--theme-primary-hover);
    }
  }
}

.app-secondary-nav {
  flex-shrink: 0;
  z-index: 90;
}

.app-main {
  flex: 1;
  overflow: hidden;
}
</style>
