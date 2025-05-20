import { ref, computed } from "vue";
import { useFormBuilderStore } from "@/stores/formBuilder";
import { useServerFormImporter } from "@/composables/useServerFormImporter";
import type { FormElement } from "@/models/FormElement";

// Vite's import.meta.glob for raw JSON content
// This imports all .json files from the specified directory as raw strings.
const userJsonModules = import.meta.glob("/src/test-files/user/**/*.json", {
  eager: true,
  as: "raw",
});

export interface UserFormListItem {
  displayName: string;
  fileName: string; // Original file name, used as an identifier
}

export function useUserForms() {
  const formBuilderStore = useFormBuilderStore();
  const { transformServerFormToVisual } = useServerFormImporter();

  const userFormList = computed<UserFormListItem[]>(() => {
    const forms: UserFormListItem[] = [];
    for (const path in userJsonModules) {
      try {
        const rawJson = userJsonModules[path];
        const serverJson = JSON.parse(rawJson);
        const displayName =
          serverJson.attributes?.name ||
          path.split("/").pop()?.replace(".json", "") ||
          "Unnamed Form";
        const fileName = path.split("/").pop() || "unknown.json";
        forms.push({ displayName, fileName });
      } catch (error) {
        console.error(`Error parsing user form JSON from ${path}:`, error);
      }
    }
    return forms.sort((a, b) => a.displayName.localeCompare(b.displayName));
  });

  async function loadAndSetUserForm(fileName: string): Promise<boolean> {
    const pathKey = `/src/test-files/user/${fileName}`;
    const rawJson = userJsonModules[pathKey];

    if (!rawJson) {
      console.error(
        `User form JSON not found for file name: ${fileName} (searched path: ${pathKey})`
      );
      formBuilderStore.setFormElements([]); // Clear form if not found
      return false;
    }

    try {
      const serverJson = JSON.parse(rawJson);

      const visualElements: FormElement[] = transformServerFormToVisual({
        children: serverJson.children,
      });

      if (visualElements && visualElements.length > 0) {
        formBuilderStore.setFormElements(visualElements);
      } else {
        console.warn("No visual elements were transformed. Clearing form.");
        formBuilderStore.setFormElements([]);
      }
      return true;
    } catch (error) {
      console.error(`Error processing user form ${fileName}:`, error);
      formBuilderStore.setFormElements([]); // Clear form on error
      return false;
    }
  }

  return {
    userFormList,
    loadAndSetUserForm,
  };
}
