<script setup lang="ts">
import { ref, watchEffect } from "vue";
import Sidebar from "@/components/core/Sidebar.vue"; // Import Sidebar
import { useLocalStorage } from "@/composables/useLocalStorage"; // Import useLocalStorage

// LocalStorage setup for theme
const { getItem, setItem } = useLocalStorage();
const themeStorageKey = "form-builder-theme";

// Theme management
// Initialize currentTheme from localStorage or default to 'dark'
const storedTheme = getItem<"light" | "dark">(themeStorageKey);
const currentTheme = ref<"light" | "dark">(storedTheme || "dark");

watchEffect(() => {
  document.body.setAttribute("data-theme", currentTheme.value);
  // Also save to localStorage whenever currentTheme changes from any source
  // This handles direct manipulation of currentTheme if it ever happens elsewhere,
  // though setTheme is the primary way.
  setItem(themeStorageKey, currentTheme.value);
});

// Function to set theme, now also saves to localStorage explicitly
const setTheme = (themeName: "light" | "dark") => {
  currentTheme.value = themeName;
};

// App.vue is the main component that will include the router view
</script>

<template>
  <div class="app-layout">
    <Sidebar />
    <main class="app-content">
      <!-- Pass setTheme function as a prop or use provide/inject or an event bus -->
      <router-view @change-theme="setTheme"></router-view>
    </main>
  </div>
</template>

<style lang="scss">
@use "assets/scss/abstracts" as *; // Ensure variables and mixins are available

// App-wide standard layout styles
.app-layout {
  // Changed from .app to .app-layout to avoid conflict if .app is used elsewhere
  min-height: 100vh;
  display: flex;
  background-color: var(--theme-bg);
  color: var(--theme-text);
}

// Sidebar will have its own styles, assuming it takes up a fixed width
// .app-sidebar is a placeholder if you need to style the Sidebar container here

.app-content {
  // Renamed from .app-main
  flex: 1;
  padding: $spacing-lg; // Add some padding to the content area
  overflow-y: auto; // If content overflows
}

// Remove old .app-header and .app-nav styles as they are no longer used
// Remove .app styles if it was solely for the old flex-direction: column layout
// It's better to be specific with class names like .app-layout

// Ensure global styles or resets are still in effect if they were part of the old structure.
// For instance, if you had html, body styles, make sure they are still applied,
// possibly in a global SCSS file imported elsewhere or here if appropriate.
</style>
