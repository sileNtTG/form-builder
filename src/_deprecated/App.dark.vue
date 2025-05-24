<script setup lang="ts">
import FormBuilderView from "./views/FormBuilder.vue";
</script>

<template>
  <div class="app">
    <FormBuilderView />
  </div>
</template>

<style lang="scss">
// CSS Variables for dark theme
:root {
  --theme-bg-primary: #1a1e29;
  --theme-bg-surface: #232834;
  --theme-bg-elevated: #2a303c;
  --theme-bg: #1a1e29;
  --theme-bg-alt: #232834;
  --theme-border: #3a3f4a;
  --theme-border-hover: #4a5568;
  --theme-border-muted: #2d3748;
  --theme-text: #ffffff;
  --theme-text-muted: #a0aec0;
  --theme-text-secondary: #e2e8f0;
  --theme-primary: #1abc9c;
  --theme-primary-hover: #16a085;
  --theme-danger: #e53e3e;
  --theme-warning: #dd6b20;
  --theme-success: #38a169;
  --theme-sidebar-bg: #232834;
  --theme-sidebar-heading-text: #ffffff;
  --theme-sidebar-section-text: #ffffff;
  --theme-sidebar-section-icon: #a0aec0;
  --theme-sidebar-item-text: #ffffff;
  --theme-sidebar-item-icon: #a0aec0;
  --theme-sidebar-item-hover-text: #ffffff;
  --theme-sidebar-item-hover-icon: #1abc9c;
  --theme-sidebar-item-active-text: #ffffff;
  --theme-sidebar-item-active-icon: #1abc9c;
  --theme-sidebar-item-active-bg: rgba(26, 188, 156, 0.2);
  --theme-sidebar-toggle-icon: #a0aec0;
  --theme-item-hover-bg: rgba(255, 255, 255, 0.05);
}

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
  background: var(--theme-bg-primary);
}

.app-header {
  padding: 1.5rem 2rem;
  background: var(--theme-bg-surface);
  border-bottom: 1px solid var(--theme-border);
  flex-shrink: 0;

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--theme-text);
    margin-bottom: 0.25rem;
  }

  p {
    color: var(--theme-text-muted);
    font-size: 0.875rem;
  }
}

.app-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.app-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: #f8fafc;
  border-right: 1px solid var(--theme-border);
}

.app-main {
  flex: 1;
  overflow: hidden;
  background: var(--theme-bg-primary);
}
</style>
