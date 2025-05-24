<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, nextTick } from "vue";
import FormCanvas from "../components/core/FormCanvas.vue";
import PropertyPanelWithTabs from "../components/core/PropertyPanelWithTabs.vue";
import JsonPreviewPanel from "../components/core/JsonPreviewPanel.vue";
import CommandPalette from "../components/core/CommandPalette.vue";
import ElementsPanel from "../components/core/ElementsPanel.vue";
import { useFormBuilderStore } from "../stores/formBuilder";
import { useRouter } from "vue-router";

const formBuilderStore = useFormBuilderStore();
const router = useRouter();
const activeTab = ref("properties"); // 'properties' oder 'json'
const activeSidebarTab = ref("forms"); // 'forms' oder 'elements'

// Formularübersicht (aus Sidebar.vue)
const sectionsOpen = ref({
  forms: true,
});
const formNameInputRefs = ref<Record<string, HTMLInputElement>>({});
const newlyCreatedFormId = ref<string | null>(null);
const forms = computed(() => formBuilderStore.formList);
const activeFormId = computed(() => formBuilderStore.activeFormId);

// Formular-Funktionen
const handleCreateForm = async () => {
  const newId = formBuilderStore.createBlankForm("Untitled Form");
  newlyCreatedFormId.value = newId;
  await nextTick();
  if (formNameInputRefs.value[newId]) {
    formNameInputRefs.value[newId].focus();
    formNameInputRefs.value[newId].select();
  }
};

const handleFormNameChange = (formId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  formBuilderStore.updateActiveFormName(target.value);
};

const handleFormNameEnter = (formId: string) => {
  if (formNameInputRefs.value[formId]) {
    formNameInputRefs.value[formId].blur();
  }
  newlyCreatedFormId.value = null;
};

const selectForm = (formId: string) => {
  formBuilderStore.setActiveForm(formId);
  newlyCreatedFormId.value = null;
  router.push({ name: "FormBuilder" });
};

// Tastatur-Events
const handleKeyDown = (event: KeyboardEvent) => {
  if (
    formBuilderStore.selectedElementId &&
    (event.key === "Delete" || event.key === "Backspace")
  ) {
    if (event.key === "Backspace" && !isInputFocused()) {
      event.preventDefault();
    }
    formBuilderStore.removeElement(formBuilderStore.selectedElementId);
  }
};

const isInputFocused = () => {
  return (
    document.activeElement &&
    (document.activeElement.tagName === "INPUT" ||
      document.activeElement.tagName === "TEXTAREA")
  );
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  formBuilderStore.loadInitialForms();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// Drag-and-drop weiterleiten an das Canvas
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = "copy";
  }
};

// Wir entfernen die handleDrop-Funktion, da wir das Drop-Event direkt im FormCanvas verarbeiten
// FormCanvas hat bereits eine eigene Drop-Event-Behandlung und handleCanvasDrop-Funktion
</script>

<template>
  <div class="form-builder-view" @dragover="handleDragOver">
    <!-- Sidebar nur mit Elementen-Tab -->
    <div class="sidebar">
      <div class="sidebar-tabs">
        <button class="sidebar-tab active">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
            <path d="M3 9h6" />
          </svg>
          <span>Elemente</span>
        </button>
      </div>

      <div class="sidebar-content">
        <ElementsPanel />
      </div>
    </div>

    <!-- Rest des Layouts -->
    <div class="canvas-stack">
      <FormCanvas />
      <CommandPalette />
    </div>

    <div class="panels">
      <div class="tabs">
        <button
          class="tab"
          :class="{ active: activeTab === 'properties' }"
          @click="activeTab = 'properties'"
        >
          Properties
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'json' }"
          @click="activeTab = 'json'"
        >
          JSON
        </button>
      </div>
      <!-- <PropertyPanel v-show="activeTab === 'properties'" /> -->
      <PropertyPanelWithTabs v-show="activeTab === 'properties'" />
      <JsonPreviewPanel v-show="activeTab === 'json'" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Anpassung des bestehenden Layouts
.form-builder-view {
  display: grid;
  grid-template-columns: 250px 1fr 280px;
  height: 100%;
  width: 100%;
  background-color: var(--theme-bg);
  color: var(--theme-text);
  overflow: hidden;
}

// Anpassung der bestehenden Komponenten
.sidebar {
  grid-column: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--theme-border);
  background: var(--theme-bg-alt);
  height: 100%;
  overflow: hidden;
}

.canvas-stack {
  grid-column: 2;
  position: relative;
  overflow: auto;
  height: 100%;
  background: var(--theme-bg);
}

.panels {
  grid-column: 3;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 1px solid var(--theme-border);
  background: var(--theme-bg-surface);
  overflow: hidden;
}

// Rest der bestehenden Styles...
.sidebar-tabs {
  display: flex;
  border-bottom: 1px solid var(--theme-border);
}

.sidebar-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.6rem;
  background: none;
  border: none;
  color: var(--theme-text-muted);
  font-size: 0.8rem;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    color: var(--theme-text);
    background: rgba(255, 255, 255, 0.03);
  }

  &.active {
    color: var(--theme-primary);
    background: rgba(26, 188, 156, 0.05);
    border-bottom: 2px solid var(--theme-primary);
  }

  svg {
    width: 20px;
    height: 20px;
    stroke-width: 1.5;
  }
}

.sidebar-content {
  flex: 1;
  overflow: auto;
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--theme-border);
}

.tab {
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  color: var(--theme-text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--theme-text);
    background: rgba(255, 255, 255, 0.03);
  }

  &.active {
    color: var(--theme-primary);
    background: rgba(26, 188, 156, 0.05);
    border-bottom: 2px solid var(--theme-primary);
  }
}
</style>
