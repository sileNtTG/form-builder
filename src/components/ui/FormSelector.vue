<template>
  <div class="form-selector">
    <div class="form-selector-left">
      <div class="form-dropdown" @click="isOpen = !isOpen">
        <div class="current-form">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10,9 9,9 8,9" />
          </svg>
          <EditableTitle
            :value="activeForm?.name || 'Kein Formular ausgewählt'"
            placeholder="Neues Formular"
            edit-tooltip="Formularnamen bearbeiten"
            @update="handleNameUpdate"
            class="form-name-editable"
          />
          <svg
            class="dropdown-icon"
            :class="{ open: isOpen }"
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div v-show="isOpen" class="dropdown-menu">
          <div class="dropdown-header">
            <span>Formulare</span>
            <button @click.stop="createNewForm" class="create-btn">
              <SvgIcon name="plus" :size="16" />
              Neu
            </button>
          </div>
          <div class="forms-list">
            <div
              v-for="form in forms"
              :key="form.id"
              @click.stop="selectForm(form.id)"
              class="form-item"
              :class="{ active: form.id === activeFormId }"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <div class="form-item-content">
                <div class="form-item-header">
                  <span class="form-item-name">{{ form.name }}</span>
                  <div class="form-item-status">
                    <OrangeIndicator
                      :show="formBuilderStore.formHasUnsavedChanges(form.id)"
                    />
                    <PublishStatus
                      :published="form.published || false"
                      :published-at="form.publishedAt"
                      size="sm"
                      :show-text="false"
                    />
                  </div>
                </div>
                <span class="form-item-elements"
                  >{{ form.visualElements?.length || 0 }} Elemente</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button @click="saveForm" class="action-btn" title="Formular speichern">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
            />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
          </svg>
          Speichern
        </button>
        <button
          @click="duplicateForm"
          class="action-btn"
          title="Formular duplizieren"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Duplizieren
        </button>
      </div>
    </div>

    <div class="form-selector-right">
      <div v-if="activeForm" class="current-form-status">
        <PublishStatus
          :published="activeForm.published || false"
          :published-at="activeForm.publishedAt"
          size="sm"
          :show-text="true"
          :show-date="false"
        />
      </div>

      <button @click="testForm" class="test-btn">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon points="5,3 19,12 5,21" />
        </svg>
        Formular testen
      </button>

      <PublishActions
        v-if="activeForm"
        :published="activeForm.published || false"
        :loading="isPublishing"
        variant="button"
        size="md"
        @publish="handlePublish"
        @unpublish="handlePublish"
      />
    </div>
  </div>

  <!-- Wlad Warning Modal -->
  <Modal
    :show="showWladWarning"
    @close="showWladWarning = false"
    size="md"
    title="⚠️ WARNUNG"
  >
    <div class="wlad-warning">
      <div class="warning-icon">🚫</div>
      <h2>FINGER WEG WLAD!</h2>
      <p>Diese Funktion ist noch nicht fertig implementiert.</p>
      <p>
        Bitte habe etwas Geduld, während wir an der "Formular testen"
        Funktionalität arbeiten.
      </p>
      <div class="warning-emoji">😅</div>
    </div>

    <template #footer>
      <button @click="showWladWarning = false" class="wlad-ok-btn">
        OK, ich verstehe! 😄
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useFormBuilderStore } from "@/stores";
import { useToastStore } from "@/stores/toast";
import { SvgIcon, Modal } from "@/components/common";
import PublishStatus from "@/components/common/PublishStatus.vue";
import PublishActions from "@/components/common/PublishActions.vue";
import EditableTitle from "@/components/common/EditableTitle.vue";
import OrangeIndicator from "@/components/common/OrangeIndicator.vue";
import { useFormPersistenceIntegration } from "@/examples/useFormPersistenceExample";

const formBuilderStore = useFormBuilderStore();
const toastStore = useToastStore();
const persistence = useFormPersistenceIntegration();
const isOpen = ref(false);
const isPublishing = ref(false);
const showWladWarning = ref(false);

const forms = computed(() => formBuilderStore.forms);
const activeFormId = computed(() => formBuilderStore.activeFormId);
const activeForm = computed(() =>
  forms.value.find((f) => f.id === activeFormId.value)
);
const hasUnsavedChanges = computed(() => formBuilderStore.hasUnsavedChanges);

const selectForm = (formId: string) => {
  formBuilderStore.setActiveForm(formId);
  isOpen.value = false;
};

const createNewForm = () => {
  const newId = formBuilderStore.createBlankForm("Neues Formular");
  formBuilderStore.setActiveForm(newId);
  isOpen.value = false;
};

const saveForm = async () => {
  try {
    await persistence.saveCurrentForm();
    formBuilderStore.markFormAsClean();
    toastStore.showSuccess("Formular erfolgreich gespeichert!");
  } catch (error) {
    toastStore.showError("Fehler beim Speichern des Formulars");
  }
};

const duplicateForm = () => {
  if (activeForm.value) {
    const newId = formBuilderStore.createBlankForm(
      `${activeForm.value.name} (Kopie)`
    );
    formBuilderStore.setActiveForm(newId);
  }
};

const testForm = () => {
  showWladWarning.value = true;
};

const handlePublish = async () => {
  if (!activeForm.value) return;

  isPublishing.value = true;
  try {
    if (activeForm.value.published) {
      await persistence.unpublishCurrentForm();
    } else {
      await persistence.publishCurrentForm();
    }
  } finally {
    isPublishing.value = false;
  }
};

const handleNameUpdate = (newName: string) => {
  if (activeForm.value) {
    formBuilderStore.updateActiveFormName(newName);
    toastStore.showInfo("Formular wurde geändert. Vergiss nicht zu speichern!");
  }
};

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".form-dropdown")) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  // Load saved forms on mount
  persistence.loadAllSavedForms();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss" scoped>
.form-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: $spacing-md $spacing-xl;
  background: var(--theme-bg-surface);
  border-bottom: 1px solid var(--theme-border);
}

.form-selector-left {
  display: flex;
  align-items: center;
  gap: $spacing-lg;
}

.form-dropdown {
  position: relative;
  cursor: pointer;
}

.current-form {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border);
  border-radius: $border-radius;
  color: var(--theme-text);
  min-width: 200px;
  @include transition(all, $transition-fast);
  &:hover {
    border-color: var(--theme-border-hover);
  }
}

.form-name {
  flex: 1;
  @include text-small;
  font-weight: $font-weight-medium;
}

.dropdown-icon {
  color: var(--theme-text-muted);
  @include transition(transform, $transition-fast);
  flex-shrink: 0;
  &.open {
    transform: rotate(180deg);
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.25rem;
  background: var(--theme-bg-surface, #232834);
  border: 1px solid var(--theme-border, #3a3f4a);
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
  z-index: 50;
  overflow: hidden;
  min-width: 300px;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--theme-bg-elevated, #2a303c);
  border-bottom: 1px solid var(--theme-border, #3a3f4a);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-text, #ffffff);
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: var(--theme-primary, #1abc9c);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--theme-primary-hover, #16a085);
  }
}

.forms-list {
  max-height: 300px;
  overflow-y: auto;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: var(--theme-bg-elevated, #2a303c);
  }

  &.active {
    background: rgba(26, 188, 156, 0.1);
    color: var(--theme-primary, #1abc9c);
  }
}

.form-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.form-item-name {
  @include text-small;
  font-weight: $font-weight-medium;
}

.form-item-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-item-elements {
  font-size: $font-size-xs;
  color: var(--theme-text-muted);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--theme-bg-elevated, #2a303c);
  border: 1px solid var(--theme-border, #3a3f4a);
  border-radius: 0.375rem;
  color: var(--theme-text, #ffffff);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--theme-border-hover, #4a5568);
    background: var(--theme-bg-primary, #1a1e29);
  }
}

.form-selector-right {
  display: flex;
  gap: 0.75rem;
}

.test-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--theme-bg-elevated, #2a303c);
  color: var(--theme-text, #ffffff);
  border: 1px solid var(--theme-border, #3a3f4a);

  &:hover {
    background: var(--theme-bg-primary, #1a1e29);
    border-color: var(--theme-border-hover, #4a5568);
  }
}

.current-form-status {
  display: flex;
  align-items: center;
}

// Clean theme styles
:global(.theme-light) {
  .form-selector {
    background: white;
    border-color: #e2e8f0;
  }

  .current-form {
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #1e293b;

    &:hover {
      border-color: #cbd5e1;
    }
  }

  .dropdown-menu {
    background: white;
    border-color: #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .dropdown-header {
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #1e293b;
  }

  .form-item {
    color: #1e293b;

    &:hover {
      background: #f8fafc;
    }

    &.active {
      background: rgba(5, 150, 105, 0.1);
      color: #059669;
    }
  }

  .form-item-elements {
    color: #64748b;
  }

  .action-btn {
    background: #f8fafc;
    border-color: #e2e8f0;
    color: #1e293b;

    &:hover {
      background: white;
      border-color: #cbd5e1;
    }
  }

  .test-btn {
    background: #f8fafc;
    color: #1e293b;
    border-color: #e2e8f0;

    &:hover {
      background: white;
      border-color: #cbd5e1;
    }
  }

  .dropdown-icon {
    color: #64748b;
  }
}

// Wlad Warning Styles
.wlad-warning {
  text-align: center;
  padding: 1rem 0;
}

.warning-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.wlad-warning h2 {
  font-size: 2rem;
  font-weight: bold;
  color: #ff4444;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.wlad-warning p {
  font-size: 1.1rem;
  margin: 0.5rem 0;
  color: var(--theme-text-muted);
  line-height: 1.6;
}

.warning-emoji {
  font-size: 3rem;
  margin-top: 1.5rem;
}

.wlad-ok-btn {
  padding: 0.75rem 1.5rem;
  background: var(--theme-primary, #1abc9c);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--theme-primary-hover, #16a085);
    transform: translateY(-1px);
  }
}

.form-name-editable {
  flex: 1;
  min-width: 0;
}
</style>
