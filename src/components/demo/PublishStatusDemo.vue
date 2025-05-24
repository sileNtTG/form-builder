<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { useToastStore } from "@/stores/toast";
import PublishStatus from "@/components/common/PublishStatus.vue";
import PublishActions from "@/components/common/PublishActions.vue";
import { OrangeIndicator, SvgIcon } from "@/components/common";
import { useFormPersistenceIntegration } from "@/examples/useFormPersistenceExample";

const router = useRouter();
const formBuilderStore = useFormBuilderStore();
const toastStore = useToastStore();
const persistence = useFormPersistenceIntegration();

const isLoading = ref<Record<string, boolean>>({});

// Real forms data from store
const forms = computed(() => {
  return formBuilderStore.forms.map((form) => ({
    ...form,
    elementCount: form.visualElements?.length || 0,
    hasUnsavedChanges: formBuilderStore.formHasUnsavedChanges(form.id),
    lastModified:
      form.lastModified || form.createdAt || new Date().toISOString(),
  }));
});

// Form statistics
const stats = computed(() => {
  const total = forms.value.length;
  const published = forms.value.filter((f) => f.published).length;
  const drafts = total - published;
  const withChanges = forms.value.filter((f) => f.hasUnsavedChanges).length;

  return { total, published, drafts, withChanges };
});

// Sort forms by status and modification date
const sortedForms = computed(() => {
  return [...forms.value].sort((a, b) => {
    // Unsaved changes first
    if (a.hasUnsavedChanges && !b.hasUnsavedChanges) return -1;
    if (!a.hasUnsavedChanges && b.hasUnsavedChanges) return 1;

    // Then by published status (drafts first)
    if (!a.published && b.published) return -1;
    if (a.published && !b.published) return 1;

    // Finally by last modified (newest first)
    return (
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    );
  });
});

const handlePublish = async (formId: string) => {
  isLoading.value[formId] = true;
  try {
    // Set current form as active for persistence
    formBuilderStore.setActiveForm(formId);
    await persistence.publishCurrentForm();
    toastStore.showSuccess("Formular erfolgreich veröffentlicht!");
  } catch (error) {
    toastStore.showError("Fehler beim Veröffentlichen des Formulars");
  } finally {
    isLoading.value[formId] = false;
  }
};

const handleUnpublish = async (formId: string) => {
  isLoading.value[formId] = true;
  try {
    formBuilderStore.setActiveForm(formId);
    await persistence.unpublishCurrentForm();
    toastStore.showSuccess("Formular erfolgreich zurückgezogen!");
  } catch (error) {
    toastStore.showError("Fehler beim Zurückziehen des Formulars");
  } finally {
    isLoading.value[formId] = false;
  }
};

const handleSaveForm = async (formId: string) => {
  isLoading.value[formId] = true;
  try {
    formBuilderStore.setActiveForm(formId);
    await persistence.saveCurrentForm();
    formBuilderStore.markFormAsClean();
    toastStore.showSuccess("Formular gespeichert!");
  } catch (error) {
    toastStore.showError("Fehler beim Speichern des Formulars");
  } finally {
    isLoading.value[formId] = false;
  }
};

const openForm = (formId: string) => {
  if (formId) {
    formBuilderStore.setActiveForm(formId);
  }
  // Navigate back to main form builder
  router.push("/");
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFormStatusText = (form: any) => {
  if (form.hasUnsavedChanges) return "Ungespeicherte Änderungen";
  if (form.published) return "Veröffentlicht";
  return "Entwurf";
};

const getFormStatusColor = (form: any) => {
  if (form.hasUnsavedChanges) return "warning";
  if (form.published) return "success";
  return "secondary";
};
</script>

<template>
  <div class="forms-dashboard">
    <!-- Header with Statistics -->
    <div class="dashboard-header">
      <h1>Formular Management</h1>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <SvgIcon name="folder" :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">Formulare gesamt</div>
          </div>
        </div>

        <div class="stat-card published">
          <div class="stat-icon">
            <SvgIcon name="check-circle" :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.published }}</div>
            <div class="stat-label">Veröffentlicht</div>
          </div>
        </div>

        <div class="stat-card drafts">
          <div class="stat-icon">
            <SvgIcon name="file-text" :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.drafts }}</div>
            <div class="stat-label">Entwürfe</div>
          </div>
        </div>

        <div class="stat-card changes" v-if="stats.withChanges > 0">
          <div class="stat-icon">
            <SvgIcon name="info" :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.withChanges }}</div>
            <div class="stat-label">Mit Änderungen</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Forms List -->
    <div class="forms-list">
      <div v-if="forms.length === 0" class="empty-state">
        <SvgIcon name="folder-open" :size="48" />
        <h3>Keine Formulare vorhanden</h3>
        <p>Erstellen Sie Ihr erstes Formular im Form Builder.</p>
        <button @click="openForm('')" class="create-btn">
          <SvgIcon name="plus" :size="16" />
          Neues Formular erstellen
        </button>
      </div>

      <div v-else class="forms-grid">
        <div
          v-for="form in sortedForms"
          :key="form.id"
          class="form-card"
          :class="{
            'has-changes': form.hasUnsavedChanges,
            published: form.published,
          }"
        >
          <!-- Form Header -->
          <div class="form-header">
            <div class="form-title-section">
              <h3 class="form-title" @click="openForm(form.id)">
                {{ form.name }}
                <OrangeIndicator :show="form.hasUnsavedChanges" />
              </h3>
              <div class="form-meta">
                <span class="element-count">
                  <SvgIcon name="square" :size="14" />
                  {{ form.elementCount }} Element{{
                    form.elementCount !== 1 ? "e" : ""
                  }}
                </span>
                <span class="last-modified">
                  <SvgIcon name="calendar" :size="14" />
                  {{ formatDate(form.lastModified) }}
                </span>
              </div>
            </div>

            <div class="form-status-section">
              <PublishStatus
                :published="form.published || false"
                :published-at="form.publishedAt"
                size="sm"
                :show-text="true"
                :show-date="false"
              />
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button
              v-if="form.hasUnsavedChanges"
              @click="handleSaveForm(form.id)"
              :disabled="isLoading[form.id]"
              class="action-btn action-btn--save"
            >
              <SvgIcon name="check" :size="16" />
              Speichern
            </button>

            <button
              @click="openForm(form.id)"
              class="action-btn action-btn--edit"
            >
              <SvgIcon name="edit" :size="16" />
              Bearbeiten
            </button>

            <PublishActions
              :published="form.published || false"
              :loading="isLoading[form.id]"
              variant="button"
              size="sm"
              @publish="handlePublish(form.id)"
              @unpublish="handleUnpublish(form.id)"
            />
          </div>

          <!-- Status Badge -->
          <div class="status-badge" :class="getFormStatusColor(form)">
            {{ getFormStatusText(form) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.forms-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--theme-bg);
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 3rem;

  h1 {
    margin-bottom: 2rem;
    color: var(--theme-text);
    font-size: 2rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-bg-surface);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-primary-light);
    color: var(--theme-primary);
  }

  .stat-content {
    flex: 1;

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--theme-text);
      line-height: 1;
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--theme-text-muted);
      font-weight: 500;
    }
  }

  &.published .stat-icon {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
  }

  &.drafts .stat-icon {
    background: rgba(156, 163, 175, 0.1);
    color: #9ca3af;
  }

  &.changes .stat-icon {
    background: rgba(251, 146, 60, 0.1);
    color: #fb923c;
  }
}

.forms-list {
  margin-bottom: 3rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  border: 2px dashed var(--theme-border);
  border-radius: 12px;
  background: var(--theme-bg-surface);

  h3 {
    margin: 1rem 0 0.5rem 0;
    color: var(--theme-text);
    font-size: 1.5rem;
    font-weight: 600;
  }

  p {
    margin-bottom: 2rem;
    color: var(--theme-text-muted);
    font-size: 1rem;
  }

  .create-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    background: var(--theme-primary);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: var(--theme-primary-dark);
      transform: translateY(-1px);
    }
  }
}

.forms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.form-card {
  position: relative;
  padding: 1.5rem;
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-bg-surface);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  &.has-changes {
    border-left: 4px solid #fb923c;
    background: linear-gradient(
      90deg,
      rgba(251, 146, 60, 0.05) 0%,
      var(--theme-bg-surface) 8%
    );
  }

  &.published {
    border-left: 4px solid #22c55e;
    background: linear-gradient(
      90deg,
      rgba(34, 197, 94, 0.05) 0%,
      var(--theme-bg-surface) 8%
    );
  }

  .form-header {
    margin-bottom: 1.5rem;

    .form-title-section {
      flex: 1;

      .form-title {
        margin: 0 0 0.75rem 0;
        color: var(--theme-text);
        font-size: 1.25rem;
        font-weight: 600;
        cursor: pointer;
        transition: color 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:hover {
          color: var(--theme-primary);
        }
      }

      .form-meta {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .element-count,
        .last-modified {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--theme-text-muted);

          svg {
            opacity: 0.7;
          }
        }
      }
    }

    .form-status-section {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }
  }

  .form-actions {
    margin-top: 1.5rem;
    display: flex;
    gap: 0.75rem;
    align-items: center;
    flex-wrap: wrap;

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--theme-bg-surface);
      border: 1px solid var(--theme-border);
      border-radius: 8px;
      color: var(--theme-text);
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        background: var(--theme-bg-surface-hover);
        border-color: var(--theme-border-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &--save {
        background: var(--theme-primary);
        border-color: var(--theme-primary);
        color: white;

        &:hover:not(:disabled) {
          background: var(--theme-primary-dark);
          border-color: var(--theme-primary-dark);
        }
      }

      &--edit {
        background: var(--theme-bg-surface);
        border-color: var(--theme-border);

        &:hover:not(:disabled) {
          background: var(--theme-bg-surface-hover);
          border-color: var(--theme-border-hover);
        }
      }
    }
  }

  .status-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &.warning {
      background: rgba(251, 146, 60, 0.1);
      color: #fb923c;
      border: 1px solid rgba(251, 146, 60, 0.3);
    }

    &.success {
      background: rgba(34, 197, 94, 0.1);
      color: #22c55e;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }

    &.secondary {
      background: rgba(156, 163, 175, 0.1);
      color: #9ca3af;
      border: 1px solid rgba(156, 163, 175, 0.3);
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .forms-dashboard {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .forms-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .form-card {
    padding: 1rem;

    .form-actions {
      flex-direction: column;
      align-items: stretch;

      .action-btn {
        justify-content: center;
      }
    }
  }
}
</style>
