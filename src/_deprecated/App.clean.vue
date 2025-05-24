<script setup lang="ts">
import FormCanvas from "./components/core/FormCanvas.vue";
import ElementsSidebar from "./components/sidebar/ElementsSidebar.vue";
</script>

<template>
  <div class="app">
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="app-sidebar">
        <ElementsSidebar />
      </aside>

      <!-- Main content -->
      <main class="app-main">
        <header class="app-header">
          <h1>🏗️ Clean Form Builder</h1>
          <p>Drag elements from the sidebar to build your form</p>
        </header>

        <FormCanvas />
      </main>
    </div>
  </div>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #f1f5f9;
}

.app {
  height: 100vh;
  overflow: hidden;
}

.app-layout {
  display: flex;
  height: 100%;
}

.app-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;

  h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 0.25rem;
  }

  p {
    color: #64748b;
    font-size: 0.875rem;
  }
}
</style>
