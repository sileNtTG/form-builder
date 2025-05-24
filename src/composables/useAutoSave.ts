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
  const hasShownUnsavedToast = ref(false); // Prevent duplicate toasts
  let autoSaveTimer: NodeJS.Timeout | null = null;

  // Watch for unsaved changes and show reminders
  watch(
    () => formBuilderStore.hasUnsavedChanges,
    (hasChanges) => {
      // Note: Toast functionality disabled - we now use the orange banner instead
      if (!hasChanges) {
        // Reset the flag when changes are saved/cleared
        hasShownUnsavedToast.value = false;
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
      hasShownUnsavedToast.value = false; // Reset toast flag
      toastStore.showSuccess("Formular gespeichert!");
    } catch (error) {
      toastStore.showError("Fehler beim Speichern des Formulars");
    }
  };

  const discardChanges = () => {
    // Restore original form state
    if (formBuilderStore.activeFormId) {
      const restored = formBuilderStore.restoreOriginalFormState(
        formBuilderStore.activeFormId
      );

      if (restored) {
        hasShownUnsavedToast.value = false; // Reset toast flag

        // Note: Don't clear all toasts here - let individual toasts handle their own lifecycle

        toastStore.showInfo("Änderungen wurden verworfen", "Verworfen");
      } else {
        toastStore.showError("Fehler beim Verwerfen der Änderungen");
      }
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
    discardChanges,
    showUnsavedWarning,
    hasUnsavedChanges: () => formBuilderStore.hasUnsavedChanges,
  };
}
