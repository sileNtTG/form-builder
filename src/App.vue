<script setup lang="ts">
import { ref, watchEffect } from "vue";

// Theme management
const currentTheme = ref<"light" | "dark">("dark"); // Default to dark theme

watchEffect(() => {
  document.body.setAttribute("data-theme", currentTheme.value);
});

// Function to set theme
const setTheme = (themeName: "light" | "dark") => {
  currentTheme.value = themeName;
};

// Provide theme management to child components if needed via provide/inject
// import { provide } from 'vue';
// provide('theme', { currentTheme, setTheme }); // Updated to setTheme

// App.vue is the main component that will include the router view
</script>

<template>
  <div class="app">
    <header class="app-header">
      <div class="app-header__container">
        <h1 class="app-header__title">Form Builder</h1>
        <nav class="app-nav">
          <router-link to="/" class="app-nav__link">Forms</router-link>
          <router-link to="/builder" class="app-nav__link"
            >Create Form</router-link
          >
          <!-- Theme toggle button removed -->
        </nav>
      </div>
    </header>

    <main class="app-main">
      <!-- Pass setTheme function as a prop or use provide/inject or an event bus -->
      <router-view @change-theme="setTheme"></router-view>
    </main>
  </div>
</template>

<style lang="scss">
@use "assets/scss/abstracts" as *; // Ensure variables and mixins are available
// App-wide standard layout styles
.app {
  min-height: 100vh;
  // background-color: $gray-100; // Now handled by var(--theme-bg)
  display: flex;
  flex-direction: column;
  background-color: var(--theme-bg);
  color: var(--theme-text);
}

.app-header {
  background-color: var(--theme-bg-surface); // Use themed surface color
  box-shadow: $shadow; // This shadow might need theme-specific adjustments later

  &__container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: $spacing-md;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--theme-text); // Use themed text color
  }
}

.app-nav {
  display: flex;
  align-items: center; // Align items for button

  &__link {
    color: var(--theme-text-muted); // Use themed muted text
    margin: 0 $spacing-sm;
    text-decoration: none;
    @include transition;

    &:hover {
      color: var(--theme-primary); // Use themed primary color
    }

    &.router-link-active {
      color: var(--theme-primary); // Use themed primary color
      font-weight: 600;
    }
  }
}

.app-main {
  flex: 1;
}
</style>
