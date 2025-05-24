import { ref, computed } from "vue";
import type { ManagedForm } from "@/stores/formBuilder";
import type { FormElement } from "@/models/FormElement";

interface PersistenceError {
  code: string;
  message: string;
  details?: unknown;
}

interface SaveResult {
  success: boolean;
  id?: string;
  error?: PersistenceError;
}

interface LoadResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: PersistenceError;
}

interface DeleteResult {
  success: boolean;
  error?: PersistenceError;
}

export function useFormPersistence() {
  const isLoading = ref(false);
  const lastError = ref<PersistenceError | null>(null);

  // Storage keys
  const STORAGE_PREFIX = "form-builder-";
  const FORMS_KEY = `${STORAGE_PREFIX}forms`;
  const METADATA_KEY = `${STORAGE_PREFIX}metadata`;

  // Helper function to generate unique IDs
  const generateId = (): string => {
    return `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to handle localStorage errors
  const withErrorHandling = async <T>(
    operation: () => T | Promise<T>,
    errorContext: string
  ): Promise<{ success: boolean; data?: T; error?: PersistenceError }> => {
    try {
      isLoading.value = true;
      lastError.value = null;

      const data = await operation();
      return { success: true, data };
    } catch (error) {
      const persistenceError: PersistenceError = {
        code: "STORAGE_ERROR",
        message: `${errorContext}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        details: error,
      };

      lastError.value = persistenceError;
      console.error(`Form Persistence Error [${errorContext}]:`, error);

      return { success: false, error: persistenceError };
    } finally {
      isLoading.value = false;
    }
  };

  // Get all stored forms metadata
  const getFormsMetadata = (): Record<
    string,
    { name: string; lastModified: string; version: string }
  > => {
    try {
      const metadata = localStorage.getItem(METADATA_KEY);
      return metadata ? JSON.parse(metadata) : {};
    } catch {
      return {};
    }
  };

  // Update forms metadata
  const updateFormsMetadata = (
    formId: string,
    metadata: { name: string; lastModified: string; version: string }
  ): void => {
    try {
      const allMetadata = getFormsMetadata();
      allMetadata[formId] = metadata;
      localStorage.setItem(METADATA_KEY, JSON.stringify(allMetadata));
    } catch (error) {
      console.warn("Failed to update forms metadata:", error);
    }
  };

  // Save a form
  const saveForm = async (form: ManagedForm): Promise<SaveResult> => {
    return withErrorHandling(async () => {
      const formId = form.id || generateId();
      const storageKey = `${STORAGE_PREFIX}form_${formId}`;

      // Create form data with version info
      const formData = {
        ...form,
        id: formId,
        version: "1.0.0",
        lastModified: new Date().toISOString(),
        createdAt: form.createdAt || new Date().toISOString(),
      };

      // Save form data
      localStorage.setItem(storageKey, JSON.stringify(formData));

      // Update metadata
      updateFormsMetadata(formId, {
        name: form.name,
        lastModified: formData.lastModified,
        version: formData.version,
      });

      return formId;
    }, "Save Form").then((result) => ({
      success: result.success,
      id: result.data,
      error: result.error,
    }));
  };

  // Load a specific form
  const loadForm = async (formId: string): Promise<LoadResult<ManagedForm>> => {
    return withErrorHandling(async () => {
      const storageKey = `${STORAGE_PREFIX}form_${formId}`;
      const formData = localStorage.getItem(storageKey);

      if (!formData) {
        throw new Error(`Form with ID ${formId} not found`);
      }

      const form: ManagedForm = JSON.parse(formData);

      // Validate form structure
      if (!form.id || !form.name || !Array.isArray(form.visualElements)) {
        throw new Error(`Invalid form data structure for ID ${formId}`);
      }

      return form;
    }, "Load Form");
  };

  // Load all forms
  const loadAllForms = async (): Promise<LoadResult<ManagedForm[]>> => {
    return withErrorHandling(async () => {
      const metadata = getFormsMetadata();
      const forms: ManagedForm[] = [];

      for (const formId of Object.keys(metadata)) {
        const loadResult = await loadForm(formId);
        if (loadResult.success && loadResult.data) {
          forms.push(loadResult.data);
        }
      }

      // Sort by last modified (newest first)
      forms.sort((a, b) => {
        const aTime = new Date(a.lastModified || 0).getTime();
        const bTime = new Date(b.lastModified || 0).getTime();
        return bTime - aTime;
      });

      return forms;
    }, "Load All Forms");
  };

  // Delete a form
  const deleteForm = async (formId: string): Promise<DeleteResult> => {
    return withErrorHandling(async () => {
      const storageKey = `${STORAGE_PREFIX}form_${formId}`;

      // Remove form data
      localStorage.removeItem(storageKey);

      // Remove from metadata
      const metadata = getFormsMetadata();
      delete metadata[formId];
      localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));

      return true;
    }, "Delete Form").then((result) => ({
      success: result.success,
      error: result.error,
    }));
  };

  // Update a form (alias for saveForm with existing ID)
  const updateForm = async (
    formId: string,
    updates: Partial<ManagedForm>
  ): Promise<SaveResult> => {
    return withErrorHandling(async () => {
      const loadResult = await loadForm(formId);
      if (!loadResult.success || !loadResult.data) {
        throw new Error(`Cannot update form ${formId}: Form not found`);
      }

      const updatedForm: ManagedForm = {
        ...loadResult.data,
        ...updates,
        id: formId, // Ensure ID doesn't change
        lastModified: new Date().toISOString(),
      };

      const saveResult = await saveForm(updatedForm);
      return saveResult.id || formId;
    }, "Update Form").then((result) => ({
      success: result.success,
      id: result.data,
      error: result.error,
    }));
  };

  // Export form as JSON
  const exportForm = async (formId: string): Promise<LoadResult<string>> => {
    return withErrorHandling(async () => {
      const loadResult = await loadForm(formId);
      if (!loadResult.success || !loadResult.data) {
        throw new Error(`Cannot export form ${formId}: Form not found`);
      }

      return JSON.stringify(loadResult.data, null, 2);
    }, "Export Form");
  };

  // Import form from JSON
  const importForm = async (formJson: string): Promise<SaveResult> => {
    return withErrorHandling(async () => {
      const formData: ManagedForm = JSON.parse(formJson);

      // Generate new ID for imported form
      const newId = generateId();
      const importedForm: ManagedForm = {
        ...formData,
        id: newId,
        name: `${formData.name} (Imported)`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      const saveResult = await saveForm(importedForm);
      return saveResult.id || newId;
    }, "Import Form").then((result) => ({
      success: result.success,
      id: result.data,
      error: result.error,
    }));
  };

  // Clear all stored forms (useful for testing/reset)
  const clearAllForms = async (): Promise<DeleteResult> => {
    return withErrorHandling(async () => {
      const metadata = getFormsMetadata();

      // Remove all form data
      for (const formId of Object.keys(metadata)) {
        const storageKey = `${STORAGE_PREFIX}form_${formId}`;
        localStorage.removeItem(storageKey);
      }

      // Clear metadata
      localStorage.removeItem(METADATA_KEY);

      return true;
    }, "Clear All Forms").then((result) => ({
      success: result.success,
      error: result.error,
    }));
  };

  // Get storage statistics
  const getStorageStats = () => {
    const metadata = getFormsMetadata();
    const formCount = Object.keys(metadata).length;

    // Calculate approximate storage usage
    let totalSize = 0;
    try {
      for (const formId of Object.keys(metadata)) {
        const storageKey = `${STORAGE_PREFIX}form_${formId}`;
        const formData = localStorage.getItem(storageKey);
        if (formData) {
          totalSize += formData.length;
        }
      }
    } catch {
      totalSize = 0;
    }

    return {
      formCount,
      totalSize,
      formattedSize: `${(totalSize / 1024).toFixed(2)} KB`,
    };
  };

  // Publish a form
  const publishForm = async (formId: string): Promise<SaveResult> => {
    return withErrorHandling(async () => {
      const loadResult = await loadForm(formId);
      if (!loadResult.success || !loadResult.data) {
        throw new Error(`Cannot publish form ${formId}: Form not found`);
      }

      const publishedForm: ManagedForm = {
        ...loadResult.data,
        published: true,
        publishedAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      const saveResult = await saveForm(publishedForm);
      return saveResult.id || formId;
    }, "Publish Form").then((result) => ({
      success: result.success,
      id: result.data,
      error: result.error,
    }));
  };

  // Unpublish a form
  const unpublishForm = async (formId: string): Promise<SaveResult> => {
    return withErrorHandling(async () => {
      const loadResult = await loadForm(formId);
      if (!loadResult.success || !loadResult.data) {
        throw new Error(`Cannot unpublish form ${formId}: Form not found`);
      }

      const unpublishedForm: ManagedForm = {
        ...loadResult.data,
        published: false,
        publishedAt: undefined,
        lastModified: new Date().toISOString(),
      };

      const saveResult = await saveForm(unpublishedForm);
      return saveResult.id || formId;
    }, "Unpublish Form").then((result) => ({
      success: result.success,
      id: result.data,
      error: result.error,
    }));
  };

  // Get published forms only
  const loadPublishedForms = async (): Promise<LoadResult<ManagedForm[]>> => {
    return withErrorHandling(async () => {
      const allFormsResult = await loadAllForms();
      if (!allFormsResult.success || !allFormsResult.data) {
        throw new Error("Failed to load forms for filtering published");
      }

      const publishedForms = allFormsResult.data.filter(
        (form) => form.published === true
      );

      // Sort by published date (newest first)
      publishedForms.sort((a, b) => {
        const aTime = new Date(a.publishedAt || 0).getTime();
        const bTime = new Date(b.publishedAt || 0).getTime();
        return bTime - aTime;
      });

      return publishedForms;
    }, "Load Published Forms");
  };

  // Get draft forms only (unpublished)
  const loadDraftForms = async (): Promise<LoadResult<ManagedForm[]>> => {
    return withErrorHandling(async () => {
      const allFormsResult = await loadAllForms();
      if (!allFormsResult.success || !allFormsResult.data) {
        throw new Error("Failed to load forms for filtering drafts");
      }

      const draftForms = allFormsResult.data.filter(
        (form) => form.published !== true
      );

      // Sort by last modified (newest first)
      draftForms.sort((a, b) => {
        const aTime = new Date(a.lastModified || 0).getTime();
        const bTime = new Date(b.lastModified || 0).getTime();
        return bTime - aTime;
      });

      return draftForms;
    }, "Load Draft Forms");
  };

  return {
    // State
    isLoading: computed(() => isLoading.value),
    lastError: computed(() => lastError.value),

    // Storage stats
    getStorageStats,

    // Core operations
    saveForm,
    loadForm,
    loadAllForms,
    updateForm,
    deleteForm,

    // Import/Export
    exportForm,
    importForm,

    // Utility
    clearAllForms,

    // Helper for generating IDs (useful for testing)
    generateId,

    // Publish/Unpublish
    publishForm,
    unpublishForm,
    loadPublishedForms,
    loadDraftForms,
  };
}
