<script setup lang="ts">
import { computed, ref } from "vue";
import { useFormBuilderStore } from "../../stores/formBuilder";

const formBuilderStore = useFormBuilderStore();
const copySuccess = ref(false);
const showServerFormat = ref(false);
const isMaximized = ref(false);

const formJson = computed(() => {
  if (showServerFormat.value) {
    // Server format
    const serverFormat = {
      version: "0.0.1",
      fqn: "Easy\\Form",
      attributes: {
        name: "form",
        class: "formi",
        method: "post",
      },
      processors: [
        {
          fqn: "Easy\\Form\\Support\\Processor\\FormIdentifier",
        },
        {
          fqn: "Easy\\Form\\Support\\Processor\\CsrfToken",
        },
      ],
      children: formBuilderStore.elements.map(transformToServerFormat),
    };
    return JSON.stringify(serverFormat, null, 2);
  }
  // Internal format
  return JSON.stringify(formBuilderStore.elements, null, 2);
});

function transformToServerFormat(element: any): any {
  let serverElement: any = {
    fqn: getServerFqn(element.type),
    attributes: {},
  };

  // Handle common attributes
  if (element.label) {
    serverElement.attributes.title = element.label;
  }
  if (element.required) {
    serverElement.attributes.required = "required";
  }
  if (element.placeholder) {
    serverElement.attributes.placeholder = element.placeholder;
  }

  // Type specific transformations
  switch (element.type) {
    case "input":
      serverElement.fqn = "Easy\\Form\\Item\\Input\\Text";
      serverElement.attributes.type = "text";
      break;
    case "textarea":
      serverElement.fqn = "Easy\\Form\\Item\\Textarea";
      if (element.rows) {
        serverElement.attributes.rows = element.rows;
      }
      break;
    case "checkbox":
      serverElement.fqn = "Easy\\Form\\Item\\Input\\Checkbox";
      serverElement.attributes.type = "checkbox";
      if (element.checked) {
        serverElement.attributes.checked = "checked";
      }
      break;
    case "fieldset":
      serverElement.fqn = "Easy\\Form\\Fieldset";
      if (element.children && element.children.length > 0) {
        serverElement.children = element.children.map(transformToServerFormat);
      }
      break;
    case "button":
      serverElement.fqn = "Easy\\Form\\Item\\Button";
      serverElement.children = [
        {
          fqn: "Easy\\Form\\Markup",
          html: element.label || "Button",
        },
      ];
      break;
  }

  return serverElement;
}

function getServerFqn(type: string): string {
  const fqnMap: { [key: string]: string } = {
    input: "Easy\\Form\\Item\\Input\\Text",
    textarea: "Easy\\Form\\Item\\Textarea",
    checkbox: "Easy\\Form\\Item\\Input\\Checkbox",
    select: "Easy\\Form\\Item\\Select",
    radio: "Easy\\Form\\Item\\Radio",
    button: "Easy\\Form\\Item\\Button",
    fieldset: "Easy\\Form\\Fieldset",
  };
  return fqnMap[type] || `Easy\\Form\\Item\\${type}`;
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(formJson.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
}

function toggleMaximize() {
  isMaximized.value = !isMaximized.value;
}
</script>

<template>
  <div class="json-preview-panel">
    <div class="panel__header">
      <div class="panel__actions">
        <label class="format-switch">
          <input type="checkbox" v-model="showServerFormat" />
          <span class="format-switch__label">Server Format</span>
        </label>
        <button
          class="icon-button"
          @click="toggleMaximize"
          :title="isMaximized ? 'Minimize' : 'Maximize'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"
            ></path>
          </svg>
        </button>
        <button
          class="icon-button"
          @click="copyToClipboard"
          :class="{ 'copy-success': copySuccess }"
          :title="copySuccess ? 'Copied!' : 'Copy to clipboard'"
        >
          <svg
            v-if="!copySuccess"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            ></path>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
        </button>
      </div>
    </div>
    <div class="panel__body">
      <pre><code>{{ formJson }}</code></pre>
    </div>

    <!-- Full screen modal -->
    <div
      v-if="isMaximized"
      class="json-modal-overlay"
      @click.self="toggleMaximize"
    >
      <div class="json-modal">
        <div class="json-modal__header">
          <h2>
            JSON Preview
            {{ showServerFormat ? "(Server Format)" : "(Internal Format)" }}
          </h2>
          <div class="json-modal__actions">
            <label class="format-switch format-switch--light">
              <input type="checkbox" v-model="showServerFormat" />
              <span class="format-switch__label">Server Format</span>
            </label>
            <button
              class="icon-button"
              @click="copyToClipboard"
              :class="{ 'copy-success': copySuccess }"
              :title="copySuccess ? 'Copied!' : 'Copy to clipboard'"
            >
              <svg
                v-if="!copySuccess"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                ></path>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </button>
            <button
              class="icon-button icon-button--close"
              @click="toggleMaximize"
              title="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 6L6 18"></path>
                <path d="M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        <div class="json-modal__body">
          <pre><code>{{ formJson }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "../../assets/scss/abstracts" as *;

.json-preview-panel {
  display: flex;
  flex-direction: column;
  background: var(--theme-bg-surface);
  width: 100%;
  height: 100%;
}

.panel__header {
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--theme-border);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.panel__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.format-switch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--theme-text-muted);
  font-size: 0.875rem;
  cursor: pointer;

  input[type="checkbox"] {
    appearance: none;
    width: 2.5rem;
    height: 1.25rem;
    background-color: var(--theme-bg-alt);
    border-radius: 999px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 1px solid var(--theme-border);

    &:checked {
      background-color: var(--theme-primary);
      border-color: var(--theme-primary);
    }

    &::before {
      content: "";
      position: absolute;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background-color: white;
      top: 1px;
      left: 2px;
      transition: transform 0.3s ease;
    }

    &:checked::before {
      transform: translateX(1.25rem);
    }
  }

  &__label {
    user-select: none;
  }

  &--light {
    color: #fff;
  }
}

.panel__body {
  padding: 0;
  flex-grow: 1;
  overflow: auto;
  background-color: var(--theme-bg-alt);
  height: 500px;

  pre {
    margin: 0;
    padding: 1rem;
    font-family: $font-mono;
    font-size: $font-size-sm;
    color: var(--theme-text-code);
    white-space: pre-wrap;
    word-break: break-all;

    code {
      font-family: inherit;
    }
  }
}

.icon-button {
  background: none;
  border: none;
  color: var(--theme-text-muted);
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: var(--theme-bg-alt);
    color: var(--theme-primary);
  }

  &.copy-success {
    color: var(--theme-success, #10b981);
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
    stroke-width: 2;
  }

  &--close {
    &:hover {
      color: #f43f5e;
    }
  }
}

/* Modal styles */
.json-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.json-modal {
  width: 90%;
  max-width: 1200px;
  height: 80%;
  background-color: var(--theme-bg-surface);
  border-radius: $border-radius-lg;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;

  &__header {
    padding: $spacing-lg;
    border-bottom: 1px solid var(--theme-border);
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
      @include heading-3;
      margin: 0;
      color: var(--theme-text);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__body {
    flex: 1;
    overflow: auto;
    padding: $spacing-lg;
    background-color: var(--theme-bg-alt);

    pre {
      margin: 0;
      font-family: $font-mono;
      font-size: 1rem;
      color: var(--theme-text-code);
      white-space: pre-wrap;
      word-break: break-all;

      code {
        font-family: inherit;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
