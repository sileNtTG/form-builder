# Form Builder Project Concept

## Overview

This project aims to create a professional form builder application where users can visually construct custom forms through an intuitive drag-and-drop interface. Users will be able to create complex forms with multiple steps, dependencies between fields, and various input types (text fields, checkboxes, selects, etc.).

All form configurations will be stored as JSON, making it easy to integrate with any backend system. The application will focus on user experience, providing a visual building block approach that is both powerful and easy to use.

## Technologies

- **Vue 3**: Framework with Composition API
- **TypeScript**: Type-safe development
- **Axios**: API communication
- **SCSS**: Advanced styling capabilities
- **Tailwind CSS**: Optional utility-first CSS framework (configurable)
- **Vue Router**: Page routing
- **Pinia**: State management
- **Vitest**: Unit and component testing
- **SSR**: Server-side rendering capability (optional)
- **ESLint/Prettier**: Code quality and formatting
- **Docker**: Containerization

## Architecture Overview

```
form-builder/
├── src/
│   ├── assets/                    # Static assets
│   ├── components/                # Reusable components
│   │   ├── core/                  # Core form builder components
│   │   │   ├── FormCanvas.vue     # Main drag-drop canvas
│   │   │   ├── FormElementPanel.vue # Element palette
│   │   │   └── PropertyPanel.vue  # Element configuration
│   │   ├── elements/              # Form elements
│   │   │   ├── Input.vue
│   │   │   ├── Checkbox.vue
│   │   │   ├── Select.vue
│   │   │   ├── FileUpload.vue     # File upload component
│   │   │   └── ...
│   │   └── ui/                    # UI components
│   ├── composables/               # Reusable logic
│   │   ├── useFormBuilder.ts      # Core form building logic
│   │   ├── useElementDrag.ts      # Drag-drop functionality
│   │   ├── useFileUpload.ts       # File upload logic
│   │   └── useElementProperties.ts # Element property management
│   ├── models/                    # TypeScript interfaces/types
│   │   ├── FormElement.ts         # Element definitions
│   │   ├── FormConfig.ts          # Form configuration
│   │   └── ...
│   ├── services/                  # API services
│   │   ├── FormService.ts         # Form CRUD operations
│   │   ├── UploadService.ts       # File upload service
│   │   └── ...
│   ├── stores/                    # Pinia stores
│   │   ├── formBuilder.ts         # Form builder state
│   │   ├── uiState.ts             # UI state
│   │   └── ...
│   ├── views/                     # Main pages
│   │   ├── FormBuilder.vue        # Builder interface
│   │   ├── FormPreview.vue        # Form preview
│   │   └── FormList.vue           # Saved forms
│   ├── router/                    # Vue Router setup
│   ├── App.vue                    # Root component
│   └── main.ts                    # Entry point
├── public/                        # Public assets
├── tests/                         # Test files
│   ├── unit/                      # Unit tests
│   └── e2e/                       # End-to-end tests
├── .github/                       # GitHub Actions
│   └── workflows/                 # CI/CD workflows
├── .vscode/                       # VS Code settings
├── .env                           # Environment variables
├── .env.local                     # Local environment variables (not committed)
├── .gitignore                     # Git ignore file
├── .eslintrc.js                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── tsconfig.json                  # TypeScript configuration
├── env.d.ts                       # Environment variable type definitions
├── shims.d.ts                     # Module declaration shims
├── vite.config.ts                 # Vite configuration
├── vitest.config.ts               # Vitest configuration
├── Dockerfile                     # Docker configuration
├── docker-compose.yml             # Docker Compose configuration
└── package.json                   # Dependencies
```

## Implementation Plan

### 1. Core Features

1. **Canvas System**: Implement drag-drop canvas using Vue Flow for visualizing form structure
2. **Element Library**: Create base components for all form elements
3. **Property Editor**: Build property panel for configuring each element
4. **State Management**: Design state structure for form configuration with Pinia
5. **Dependency System**: Implement conditional logic between elements
6. **File Upload System**: Implement file upload capabilities with preview and validation
7. **Testing Framework**: Set up Vitest for unit and component testing

### 2. Technical Implementation

```typescript
// models/FormElement.ts
export interface FormElement {
  id: string;
  type:
    | "input"
    | "select"
    | "checkbox"
    | "radio"
    | "textarea"
    | "date"
    | "number"
    | "file"; // Added file type
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validations?: ValidationRule[];
  conditions?: Condition[];
  classes?: string[];
  attributes?: Record<string, string>;
  // File upload specific properties
  accept?: string; // MIME types or file extensions to accept
  multiple?: boolean; // Allow multiple file uploads
  maxSize?: number; // Maximum file size in bytes
  maxFiles?: number; // Maximum number of files (if multiple)
}

// stores/formBuilder.ts (Pinia store)
import { defineStore } from "pinia";
import type { FormElement } from "@/models/FormElement";

export const useFormBuilderStore = defineStore("formBuilder", {
  state: () => ({
    elements: [] as FormElement[],
    selectedElementId: null as string | null,
    canvasConfig: {
      width: 1200,
      height: 800,
      zoom: 1,
    },
  }),

  getters: {
    selectedElement: (state) =>
      state.selectedElementId
        ? state.elements.find((el) => el.id === state.selectedElementId)
        : null,
  },

  actions: {
    addElement(element: FormElement) {
      this.elements.push(element);
    },

    updateElement(id: string, updates: Partial<FormElement>) {
      const index = this.elements.findIndex((el) => el.id === id);
      if (index !== -1) {
        this.elements[index] = { ...this.elements[index], ...updates };
      }
    },

    removeElement(id: string) {
      this.elements = this.elements.filter((el) => el.id !== id);
      if (this.selectedElementId === id) {
        this.selectedElementId = null;
      }
    },

    selectElement(id: string | null) {
      this.selectedElementId = id;
    },

    async saveForm() {
      // Save to backend via API service
    },
  },
});

// composables/useFileUpload.ts
export function useFileUpload() {
  const files = ref<File[]>([]);
  const uploadProgress = ref<number>(0);
  const uploadStatus = ref<"idle" | "uploading" | "success" | "error">("idle");

  const uploadFiles = async (elementId: string, formFiles: FileList | null) => {
    if (!formFiles || formFiles.length === 0) return;

    uploadStatus.value = "uploading";
    files.value = Array.from(formFiles);

    try {
      // File upload logic using FormData and Axios
      const formData = new FormData();
      files.value.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("elementId", elementId);

      // Upload with progress tracking
      const response = await UploadService.uploadFiles(formData, (progress) => {
        uploadProgress.value = progress;
      });

      uploadStatus.value = "success";
      return response.data;
    } catch (error) {
      uploadStatus.value = "error";
      throw error;
    }
  };

  return {
    files,
    uploadProgress,
    uploadStatus,
    uploadFiles,
  };
}
```

### 3. UI Components

The form builder will have three main panels:

1. **Element Panel**: List of available form elements to drag onto canvas
2. **Canvas**: Visual editor showing form structure and flow
3. **Property Panel**: Configure selected element's properties

### 4. Dependency Management

```typescript
// models/Condition.ts
export interface Condition {
  sourceElementId: string; // Element ID this condition depends on
  operator: "equals" | "notEquals" | "contains" | "greaterThan" | "lessThan";
  value: string | number | boolean;
  action: "show" | "hide" | "enable" | "disable" | "setValue";
  actionValue?: any;
}

// In the form rendering logic
const evaluateConditions = (
  element: FormElement,
  formValues: Record<string, any>
) => {
  if (!element.conditions?.length) return true;

  return element.conditions.every((condition) => {
    const sourceValue = formValues[condition.sourceElementId];
    switch (condition.operator) {
      case "equals":
        return sourceValue === condition.value;
      case "notEquals":
        return sourceValue !== condition.value;
      // Additional operators...
    }
  });
};
```

### 5. Data Storage and API Integration

Forms will be serialized to JSON for storage and sharing:

```typescript
// services/FormService.ts
import axios from "axios";

export const FormService = {
  async saveForm(formData: any) {
    return axios.post("/api/forms", formData);
  },

  async getForm(id: string) {
    return axios.get(`/api/forms/${id}`);
  },

  async getForms() {
    return axios.get("/api/forms");
  },
};

// services/UploadService.ts
import axios from "axios";

export const UploadService = {
  async uploadFiles(
    formData: FormData,
    onProgress?: (progress: number) => void
  ) {
    return axios.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  async deleteFile(fileId: string) {
    return axios.delete(`/api/upload/${fileId}`);
  },
};
```

### 6. File Upload Implementation

The file upload system will be implemented using a custom component with the following features:

- Drag-and-drop file upload zone
- File type validation
- File size validation
- Multiple file support
- Progress tracking
- Preview capability for images and documents
- Error handling
- Resumable uploads for large files

Rather than using a third-party package, we'll implement the file upload capability ourselves to ensure maximum flexibility and control over the implementation. This approach allows us to:

1. Customize the UI to match our application
2. Implement specific validation rules
3. Control file handling on both client and server sides
4. Optimize performance for our specific use case

The implementation will use HTML5 File API and FormData for file handling, Axios for upload requests with progress tracking, and custom Vue components for the UI.

### 7. Testing Strategy

Testing will be implemented using Vitest for unit and component testing:

```typescript
// tests/unit/components/elements/FileUpload.test.ts
import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import FileUpload from "@/components/elements/FileUpload.vue";

describe("FileUpload.vue", () => {
  it("renders file upload component", () => {
    const wrapper = mount(FileUpload, {
      props: {
        element: {
          id: "test-upload",
          type: "file",
          label: "Test Upload",
          name: "test-upload",
          required: true,
          accept: "image/*",
          multiple: false,
          maxSize: 5000000,
        },
      },
    });

    expect(wrapper.find('input[type="file"]').exists()).toBe(true);
    expect(wrapper.find(".upload-zone").exists()).toBe(true);
    expect(wrapper.text()).toContain("Test Upload");
  });

  // Additional tests for drag-drop, file validation, etc.
});
```

### 8. Docker and CI/CD Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18.x"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18.x"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist
```

### 9. Environment Configuration

```typescript
// env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_UPLOAD_MAX_SIZE: string;
  readonly VITE_ENABLE_TAILWIND: string;
  // Add additional env variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Features Expansion Roadmap

1. **Core Builder**: Drag-drop interface, basic elements, properties
2. **Advanced Elements**: File uploads, rich text, signature, etc.
3. **Logic & Workflow**: Conditional logic, multi-page forms
4. **Validation System**: Built-in and custom validation rules
5. **Theming System**: Customizable themes and styling
6. **Templates**: Pre-built form templates for common scenarios
7. **Import/Export**: Exchange formats with other systems
8. **Analytics**: Form usage statistics and insights
9. **Accessibility**: WCAG compliance for form elements
10. **Internationalization**: Multi-language support

## Visual Approach

The form builder will draw inspiration from Vue Flow's drag-and-drop functionality, providing an intuitive visual interface where users can:

- Drag elements from a panel onto a canvas
- Connect elements to establish relationships
- Configure element properties through a side panel
- Preview the form in real-time
- Export the form configuration as JSON

## Security Considerations

1. **File Upload Security**:

   - MIME type validation
   - File size restrictions
   - Malware scanning capability
   - Secure storage solutions

2. **Data Validation**:

   - Input sanitization
   - XSS prevention
   - CSRF protection
   - API request validation

3. **Authentication & Authorization**:
   - User role management
   - Form access controls
   - Audit logging

The architecture prioritizes extensibility and maintainability while creating a professional, user-friendly form builder that can be easily extended with new features.
