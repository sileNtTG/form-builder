/**
 * Example: How to integrate useFormPersistence with FormBuilder Store
 *
 * This shows how you can use the persistence composable to save/load forms
 * and later easily switch from localStorage to API calls.
 */

import { useFormPersistence } from "@/composables/useFormPersistence";
import { useFormBuilderStore } from "@/stores/formBuilder";
import type { ManagedForm } from "@/stores/formBuilder";

export function useFormPersistenceIntegration() {
  const formBuilderStore = useFormBuilderStore();
  const persistence = useFormPersistence();

  // Save current active form
  const saveCurrentForm = async () => {
    const activeForm = formBuilderStore.activeForm;
    if (!activeForm) {
      console.warn("No active form to save");
      return {
        success: false,
        error: { code: "NO_ACTIVE_FORM", message: "No active form selected" },
      };
    }

    // Sync current canvas state to the form
    formBuilderStore.syncActiveFormVisualsFromCanvas();

    const result = await persistence.saveForm(activeForm);

    if (result.success) {
      console.log(
        `Form "${activeForm.name}" saved successfully with ID: ${result.id}`
      );
    } else {
      console.error("Failed to save form:", result.error);
    }

    return result;
  };

  // Load a form and set it as active
  const loadAndActivateForm = async (formId: string) => {
    const result = await persistence.loadForm(formId);

    if (result.success && result.data) {
      // Add to store forms list if not already there
      const existingFormIndex = formBuilderStore.forms.findIndex(
        (f) => f.id === formId
      );
      if (existingFormIndex === -1) {
        formBuilderStore.forms.push(result.data);
      } else {
        // Update existing form
        formBuilderStore.forms[existingFormIndex] = result.data;
      }

      // Set as active
      formBuilderStore.setActiveForm(formId);
      console.log(`Form "${result.data.name}" loaded and activated`);
    } else {
      console.error("Failed to load form:", result.error);
    }

    return result;
  };

  // Load all saved forms into the store
  const loadAllSavedForms = async () => {
    const result = await persistence.loadAllForms();

    if (result.success && result.data) {
      // Merge with existing forms (avoid duplicates)
      result.data.forEach((savedForm) => {
        const existingIndex = formBuilderStore.forms.findIndex(
          (f) => f.id === savedForm.id
        );
        if (existingIndex === -1) {
          formBuilderStore.forms.push(savedForm);
        } else {
          // Update if saved version is newer
          const existing = formBuilderStore.forms[existingIndex];
          const savedTime = new Date(savedForm.lastModified || 0).getTime();
          const existingTime = new Date(existing.lastModified || 0).getTime();

          if (savedTime > existingTime) {
            formBuilderStore.forms[existingIndex] = savedForm;
          }
        }
      });

      console.log(`Loaded ${result.data.length} saved forms`);
    } else {
      console.error("Failed to load saved forms:", result.error);
    }

    return result;
  };

  // Delete a form from both store and persistence
  const deleteForm = async (formId: string) => {
    const result = await persistence.deleteForm(formId);

    if (result.success) {
      // Also remove from store
      formBuilderStore.deleteForm(formId);
      console.log(`Form ${formId} deleted successfully`);
    } else {
      console.error("Failed to delete form:", result.error);
    }

    return result;
  };

  // Publish current active form
  const publishCurrentForm = async () => {
    const activeForm = formBuilderStore.activeForm;
    if (!activeForm) {
      console.warn("No active form to publish");
      return {
        success: false,
        error: { code: "NO_ACTIVE_FORM", message: "No active form selected" },
      };
    }

    // First save current changes
    await saveCurrentForm();

    // Then publish
    const result = await persistence.publishForm(activeForm.id);

    if (result.success) {
      // Update the form in store
      await loadAndActivateForm(activeForm.id);
      console.log(`Form "${activeForm.name}" published successfully`);
    } else {
      console.error("Failed to publish form:", result.error);
    }

    return result;
  };

  // Unpublish current active form
  const unpublishCurrentForm = async () => {
    const activeForm = formBuilderStore.activeForm;
    if (!activeForm) {
      console.warn("No active form to unpublish");
      return {
        success: false,
        error: { code: "NO_ACTIVE_FORM", message: "No active form selected" },
      };
    }

    const result = await persistence.unpublishForm(activeForm.id);

    if (result.success) {
      // Update the form in store
      await loadAndActivateForm(activeForm.id);
      console.log(`Form "${activeForm.name}" unpublished successfully`);
    } else {
      console.error("Failed to unpublish form:", result.error);
    }

    return result;
  };

  // Publish a specific form by ID
  const publishForm = async (formId: string) => {
    const result = await persistence.publishForm(formId);

    if (result.success) {
      // Update the form in store if it's currently active
      if (formBuilderStore.activeFormId === formId) {
        await loadAndActivateForm(formId);
      } else {
        // Update the form in the forms list
        const formIndex = formBuilderStore.forms.findIndex(
          (f) => f.id === formId
        );
        if (formIndex !== -1) {
          const loadResult = await persistence.loadForm(formId);
          if (loadResult.success && loadResult.data) {
            formBuilderStore.forms[formIndex] = loadResult.data;
          }
        }
      }
      console.log(`Form ${formId} published successfully`);
    } else {
      console.error("Failed to publish form:", result.error);
    }

    return result;
  };

  // Unpublish a specific form by ID
  const unpublishForm = async (formId: string) => {
    const result = await persistence.unpublishForm(formId);

    if (result.success) {
      // Update the form in store if it's currently active
      if (formBuilderStore.activeFormId === formId) {
        await loadAndActivateForm(formId);
      } else {
        // Update the form in the forms list
        const formIndex = formBuilderStore.forms.findIndex(
          (f) => f.id === formId
        );
        if (formIndex !== -1) {
          const loadResult = await persistence.loadForm(formId);
          if (loadResult.success && loadResult.data) {
            formBuilderStore.forms[formIndex] = loadResult.data;
          }
        }
      }
      console.log(`Form ${formId} unpublished successfully`);
    } else {
      console.error("Failed to unpublish form:", result.error);
    }

    return result;
  };

  // Auto-save functionality
  const setupAutoSave = (intervalMs: number = 30000) => {
    const autoSaveInterval = setInterval(async () => {
      const activeForm = formBuilderStore.activeForm;
      if (activeForm && formBuilderStore.elements.length > 0) {
        console.log("Auto-saving form...");
        await saveCurrentForm();
      }
    }, intervalMs);

    // Return cleanup function
    return () => clearInterval(autoSaveInterval);
  };

  // Export form for download
  const exportFormAsFile = async (formId: string) => {
    const result = await persistence.exportForm(formId);

    if (result.success && result.data) {
      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form-${formId}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(`Form ${formId} exported as file`);
    } else {
      console.error("Failed to export form:", result.error);
    }

    return result;
  };

  // Import form from file
  const importFormFromFile = async (file: File) => {
    return new Promise<{ success: boolean; id?: string; error?: any }>(
      (resolve) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            const formJson = e.target?.result as string;
            const result = await persistence.importForm(formJson);

            if (result.success && result.id) {
              // Load the imported form into the store
              await loadAndActivateForm(result.id);
              console.log(`Form imported successfully with ID: ${result.id}`);
            }

            resolve(result);
          } catch (error) {
            const importError = {
              success: false,
              error: {
                code: "IMPORT_ERROR",
                message: "Failed to parse form file",
                details: error,
              },
            };
            console.error("Failed to import form:", error);
            resolve(importError);
          }
        };

        reader.readAsText(file);
      }
    );
  };

  return {
    // State from persistence
    isLoading: persistence.isLoading,
    lastError: persistence.lastError,

    // Storage stats
    getStorageStats: persistence.getStorageStats,

    // Core operations
    saveCurrentForm,
    loadAndActivateForm,
    loadAllSavedForms,
    deleteForm,

    // Publish/Unpublish
    publishCurrentForm,
    unpublishCurrentForm,
    publishForm,
    unpublishForm,

    // Auto-save
    setupAutoSave,

    // Import/Export
    exportFormAsFile,
    importFormFromFile,

    // Direct access to persistence if needed
    persistence,
  };
}

// Example usage in a component:
/*
import { useFormPersistenceIntegration } from '@/examples/useFormPersistenceExample';

export default {
  setup() {
    const { saveCurrentForm, loadAllSavedForms, setupAutoSave, isLoading } = useFormPersistenceIntegration();
    
    // Setup auto-save every 30 seconds
    const cleanup = setupAutoSave(30000);
    
    // Load saved forms on mount
    onMounted(() => {
      loadAllSavedForms();
    });
    
    // Cleanup auto-save on unmount
    onUnmounted(() => {
      cleanup();
    });
    
    return {
      saveCurrentForm,
      isLoading
    };
  }
};
*/
