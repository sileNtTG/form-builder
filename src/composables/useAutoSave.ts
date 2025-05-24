import { ref, watch } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { useToastStore } from "@/stores/toast";
import { useFormPersistenceIntegration } from "@/examples/useFormPersistenceExample";

export function useAutoSave() {
  const formBuilderStore = useFormBuilderStore();
  const toastStore = useToastStore();
  const persistence = useFormPersistenceIntegration();

  const autoSaveEnabled = ref(false);
  const autoSaveInterval = ref(30000); // 30 seconds default
  const isAutoSaving = ref(false);
  let autoSaveTimer: NodeJS.Timeout | null = null;

  // Watch for unsaved changes and show reminders
  watch(
    () => formBuilderStore.hasUnsavedChanges,
    (hasChanges) => {
      if (hasChanges && !autoSaveEnabled.value) {
        // Show reminder toast after 10 seconds of unsaved changes
        setTimeout(() => {
          if (formBuilderStore.hasUnsavedChanges) {
            toastStore.showWarning(
              "Du hast ungespeicherte Änderungen. Denk daran zu speichern!",
              "Ungespeicherte Änderungen"
            );
          }
        }, 10000);
      }
    }
  );

  const performAutoSave = async () => {
    if (!formBuilderStore.hasUnsavedChanges || isAutoSaving.value) {
      return;
    }

    isAutoSaving.value = true;
    try {
      await persistence.saveCurrentForm();
      formBuilderStore.markFormAsClean();
      toastStore.showInfo("Formular automatisch gespeichert", "Auto-Save");
    } catch (error) {
      toastStore.showError("Auto-Save fehlgeschlagen", "Auto-Save");
    } finally {
      isAutoSaving.value = false;
    }
  };

  const startAutoSave = (intervalMs: number = 30000) => {
    autoSaveInterval.value = intervalMs;
    autoSaveEnabled.value = true;

    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
    }

    autoSaveTimer = setInterval(() => {
      if (formBuilderStore.hasUnsavedChanges) {
        performAutoSave();
      }
    }, intervalMs);

    toastStore.showSuccess(
      `Auto-Save aktiviert (${intervalMs / 1000}s Intervall)`,
      "Auto-Save"
    );
  };

  const stopAutoSave = () => {
    autoSaveEnabled.value = false;

    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }

    toastStore.showInfo("Auto-Save deaktiviert", "Auto-Save");
  };

  const saveNow = async () => {
    if (!formBuilderStore.hasUnsavedChanges) {
      toastStore.showInfo("Keine Änderungen zu speichern");
      return;
    }

    try {
      await persistence.saveCurrentForm();
      formBuilderStore.markFormAsClean();
      toastStore.showSuccess("Formular gespeichert!");
    } catch (error) {
      toastStore.showError("Fehler beim Speichern des Formulars");
    }
  };

  // Show warning if leaving with unsaved changes
  const showUnsavedWarning = () => {
    if (formBuilderStore.hasUnsavedChanges) {
      return "Du hast ungespeicherte Änderungen. Möchtest du diese wirklich verwerfen?";
    }
    return null;
  };

  return {
    autoSaveEnabled,
    autoSaveInterval,
    isAutoSaving,
    startAutoSave,
    stopAutoSave,
    saveNow,
    showUnsavedWarning,
    hasUnsavedChanges: () => formBuilderStore.hasUnsavedChanges,
  };
}
