<script setup lang="ts">
import FormBuilderView from "./views/FormBuilder.vue";
import ThemeSwitcher from "./components/ui/ThemeSwitcher.vue";
import UserMenu from "./components/ui/UserMenu.vue";
import FormSelector from "./components/ui/FormSelector.vue";
</script>
<template>
  <div class="app">
    <!-- Main Header -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left"><h1>Form Builder</h1></div>
        <div class="header-right"><ThemeSwitcher /> <UserMenu /></div>
      </div>
    </header>
    <!-- Secondary Navigation -->
    <div class="app-secondary-nav"><FormSelector /></div>
    <!-- Original FormBuilderView -->
    <div class="app-main"><FormBuilderView /></div>
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
  gap: 1rem;
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
