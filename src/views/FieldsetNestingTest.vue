<template>
  <div class="fieldset-test">
    <h1>Fieldset Nesting Test</h1>

    <div class="container">
      <div class="panel">
        <h2>Controls</h2>
        <div class="section">
          <div class="toolbar">
            <button @click="addElement('input')">Add Input</button>
            <button @click="addElement('fieldset')">Add Fieldset</button>
            <button @click="resetElements()" class="reset-btn">Reset</button>
          </div>

          <div class="card">
            <h3>Quick Add At Position</h3>
            <p class="target-info">
              Current target:
              <span class="badge">{{
                dropTargetParentId ? "Fieldset: " + dropTargetParentId : "Root"
              }}</span>
              at position
              <span class="badge">{{ dropTargetIndex }}</span>
            </p>
            <div class="toolbar">
              <button @click="addElementAtPosition('input')">
                Add Input Here
              </button>
              <button @click="addElementAtPosition('fieldset')">
                Add Fieldset Here
              </button>
              <button @click="addElementAtPosition('checkbox')">
                Add Checkbox Here
              </button>
            </div>
          </div>
        </div>

        <div class="section">
          <h3>Move Element</h3>
          <div class="form-group">
            <label for="elementId">Element ID:</label>
            <input id="elementId" v-model="moveOperation.elementId" />

            <label for="toParentId">To Parent ID:</label>
            <input
              id="toParentId"
              v-model="moveOperation.toParentId"
              placeholder="Empty for root"
            />

            <label for="toPosition">To Position:</label>
            <input
              id="toPosition"
              v-model="moveOperation.toPosition"
              type="number"
            />

            <button @click="moveElement()">Move</button>
          </div>
        </div>

        <div class="section">
          <h3>Add to Fieldset</h3>
          <div class="form-group">
            <label for="fieldsetId">Fieldset ID:</label>
            <input
              id="fieldsetId"
              v-model="addToFieldsetOperation.fieldsetId"
            />

            <label for="elementType">Element Type:</label>
            <select
              id="elementType"
              v-model="addToFieldsetOperation.elementType"
            >
              <option value="input">Input</option>
              <option value="textarea">Textarea</option>
              <option value="checkbox">Checkbox</option>
              <option value="fieldset">Nested Fieldset</option>
            </select>

            <label for="position">Position:</label>
            <input
              id="position"
              v-model="addToFieldsetOperation.position"
              type="number"
            />

            <button @click="addToFieldset()">Add to Fieldset</button>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>Visual Representation</h2>
        <div class="panel-content">
          <div v-if="elements.length === 0" class="empty-state">
            No elements yet. Add some elements to see them here.
          </div>

          <div v-else>
            <!-- Drop indicator at top position -->
            <div class="drop-indicator" v-if="dropTargetIndex === 0"></div>

            <!-- Root level elements -->
            <div v-for="(element, index) in elements" :key="element.id">
              <div
                :class="[
                  'element',
                  element.type === 'fieldset' ? 'fieldset' : '',
                  selectedElement === element.id ? 'selected' : '',
                ]"
                @click="selectElement(element.id)"
              >
                <div class="element-header">
                  <span>
                    {{ element.label }}
                    <span class="badge">{{ element.type }}</span>
                    <small class="element-id">ID: {{ element.id }}</small>
                  </span>
                  <span class="badge">Order: {{ element.order }}</span>
                </div>

                <!-- Fieldset content -->
                <div
                  v-if="element.type === 'fieldset' && element.children"
                  class="fieldset-content"
                >
                  <div
                    v-for="(child, childIndex) in element.children"
                    :key="child.id"
                  >
                    <div
                      :class="[
                        'element',
                        child.type === 'fieldset' ? 'fieldset' : '',
                        selectedElement === child.id ? 'selected' : '',
                      ]"
                      @click.stop="selectElement(child.id)"
                    >
                      <div class="element-header">
                        <span>
                          {{ child.label }}
                          <span class="badge">{{ child.type }}</span>
                          <small class="element-id">ID: {{ child.id }}</small>
                        </span>
                        <span class="badge">Order: {{ child.order }}</span>
                      </div>

                      <!-- Nested fieldset content (recursive) -->
                      <div
                        v-if="child.type === 'fieldset' && child.children"
                        class="fieldset-content"
                      >
                        <div
                          v-for="(
                            grandchild, grandchildIndex
                          ) in child.children"
                          :key="grandchild.id"
                        >
                          <div
                            :class="[
                              'element',
                              selectedElement === grandchild.id
                                ? 'selected'
                                : '',
                            ]"
                            @click.stop="selectElement(grandchild.id)"
                          >
                            <div class="element-header">
                              <span>
                                {{ grandchild.label }}
                                <span class="badge">{{ grandchild.type }}</span>
                                <small class="element-id"
                                  >ID: {{ grandchild.id }}</small
                                >
                              </span>
                              <span class="badge"
                                >Order: {{ grandchild.order }}</span
                              >
                            </div>
                          </div>
                          <!-- Drop indicator between grandchildren -->
                          <div
                            class="drop-indicator"
                            v-if="
                              dropTargetParentId === child.id &&
                              dropTargetIndex === grandchildIndex + 1
                            "
                          ></div>
                        </div>
                      </div>
                    </div>
                    <!-- Drop indicator between children -->
                    <div
                      class="drop-indicator"
                      v-if="
                        dropTargetParentId === element.id &&
                        dropTargetIndex === childIndex + 1
                      "
                    ></div>
                  </div>
                </div>
              </div>
              <!-- Drop indicator between root elements -->
              <div
                class="drop-indicator"
                v-if="!dropTargetParentId && dropTargetIndex === index + 1"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2>JSON Data</h2>
        <div class="panel-content">
          <div class="result">
            <h3>Elements Array</h3>
            <pre>{{ JSON.stringify(elements, null, 2) }}</pre>
          </div>

          <div class="result">
            <h3>Selected Element</h3>
            <pre v-if="selectedElementData">{{
              JSON.stringify(selectedElementData, null, 2)
            }}</pre>
            <p v-else class="empty-state">No element selected</p>
          </div>

          <div class="result">
            <h3>Position Info</h3>
            <p>
              <strong>Drop Target Parent:</strong>
              <span class="badge">{{ dropTargetParentId || "root" }}</span>
            </p>
            <p>
              <strong>Drop Target Index:</strong>
              <span class="badge">{{ dropTargetIndex }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

// State
const elements = ref([]);
const selectedElement = ref(null);
const nextId = ref(1);
const dropTargetParentId = ref(null);
const dropTargetIndex = ref(0);

// Operation parameters
const moveOperation = ref({
  elementId: "",
  toParentId: "",
  toPosition: 0,
});

const addToFieldsetOperation = ref({
  fieldsetId: "",
  elementType: "input",
  position: 0,
});

// Helper: Find element by ID
const findElement = (elements, id, parent = null) => {
  const directMatch = elements.find((e) => e.id === id);
  if (directMatch)
    return {
      element: directMatch,
      parent,
      index: elements.indexOf(directMatch),
    };

  for (const element of elements) {
    if (element.type === "fieldset" && element.children) {
      const result = findElement(element.children, id, element);
      if (result) return result;
    }
  }

  return null;
};

// Create element by type
const createElementByType = (type, position = 0, parentId = null) => {
  const id = `elem-${nextId.value++}`;

  const baseProps = {
    id,
    type,
    label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    order: position,
    width: 250,
    height: 48,
  };

  if (type === "fieldset") {
    return {
      ...baseProps,
      children: [],
      width: 400,
      height: 200,
    };
  }

  return baseProps;
};

// Add element to root
const addElement = (type) => {
  const newElement = createElementByType(type, elements.value.length);
  elements.value.push(newElement);
  selectedElement.value = newElement.id;
};

// Add element at current position
const addElementAtPosition = (type) => {
  const parentId = dropTargetParentId.value;
  const position = dropTargetIndex.value;

  if (parentId) {
    const fieldset = findElement(elements.value, parentId);

    if (fieldset && fieldset.element.type === "fieldset") {
      const newElement = createElementByType(type, position, parentId);

      if (!fieldset.element.children) {
        fieldset.element.children = [];
      }

      const safePosition = Math.min(
        Math.max(0, position),
        fieldset.element.children.length
      );
      fieldset.element.children.splice(safePosition, 0, newElement);

      fieldset.element.children.forEach((child, index) => {
        child.order = index;
      });

      selectedElement.value = newElement.id;
    } else {
      console.error("Target fieldset not found:", parentId);
    }
  } else {
    const newElement = createElementByType(type, position);

    const safePosition = Math.min(Math.max(0, position), elements.value.length);
    elements.value.splice(safePosition, 0, newElement);

    elements.value.forEach((elem, index) => {
      elem.order = index;
    });

    selectedElement.value = newElement.id;
  }
};

// Add element to fieldset
const addToFieldset = () => {
  const { fieldsetId, elementType, position } = addToFieldsetOperation.value;

  if (!fieldsetId) {
    alert("Please enter a Fieldset ID");
    return;
  }

  const result = findElement(elements.value, fieldsetId);
  if (!result || result.element.type !== "fieldset") {
    alert("Fieldset not found or element is not a fieldset");
    return;
  }

  const newElement = createElementByType(elementType, position, fieldsetId);

  if (!result.element.children) {
    result.element.children = [];
  }

  const safePosition = Math.min(
    Math.max(0, position),
    result.element.children.length
  );
  result.element.children.splice(safePosition, 0, newElement);

  result.element.children.forEach((child, index) => {
    child.order = index;
  });

  selectedElement.value = newElement.id;
  addToFieldsetOperation.value.position = 0;
};

// Move element
const moveElement = () => {
  const { elementId, toParentId, toPosition } = moveOperation.value;

  if (!elementId) {
    alert("Please enter an Element ID");
    return;
  }

  const sourceResult = findElement(elements.value, elementId);
  if (!sourceResult) {
    alert("Source element not found");
    return;
  }

  let sourceArray;
  if (sourceResult.parent) {
    sourceArray = sourceResult.parent.children;
  } else {
    sourceArray = elements.value;
  }

  const [movedElement] = sourceArray.splice(sourceResult.index, 1);

  let targetArray;
  if (toParentId) {
    const targetFieldset = findElement(elements.value, toParentId);
    if (!targetFieldset || targetFieldset.element.type !== "fieldset") {
      alert("Target fieldset not found or is not a fieldset");
      sourceArray.splice(sourceResult.index, 0, movedElement);
      return;
    }

    if (!targetFieldset.element.children) {
      targetFieldset.element.children = [];
    }

    targetArray = targetFieldset.element.children;
  } else {
    targetArray = elements.value;
  }

  const safePosition = Math.min(Math.max(0, toPosition), targetArray.length);
  targetArray.splice(safePosition, 0, movedElement);

  targetArray.forEach((elem, index) => {
    elem.order = index;
  });

  moveOperation.value = {
    elementId: "",
    toParentId: "",
    toPosition: 0,
  };

  dropTargetParentId.value = null;
  dropTargetIndex.value = 0;
};

// Select element
const selectElement = (id) => {
  selectedElement.value = id;

  const result = findElement(elements.value, id);
  if (result) {
    if (result.parent) {
      dropTargetParentId.value = result.parent.id;
      dropTargetIndex.value = result.index + 1;
    } else {
      dropTargetParentId.value = null;
      dropTargetIndex.value = result.index + 1;
    }
  }
};

// Reset everything
const resetElements = () => {
  elements.value = [];
  selectedElement.value = null;
  nextId.value = 1;
  dropTargetParentId.value = null;
  dropTargetIndex.value = 0;
};

// Selected element details
const selectedElementData = computed(() => {
  if (!selectedElement.value) return null;

  const result = findElement(elements.value, selectedElement.value);
  if (!result) return null;

  return {
    element: result.element,
    parent: result.parent
      ? {
          id: result.parent.id,
          type: result.parent.type,
        }
      : null,
    position: result.index,
  };
});
</script>

<style lang="scss" scoped>
@use "@/assets/scss/abstracts" as *;

.fieldset-test {
  padding: 1.5rem;
  height: 100vh;
  background: var(--theme-bg-primary);
  color: var(--theme-text);
  overflow: hidden;

  h1 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--theme-primary);
  }

  h2 {
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: 1rem;
    color: var(--theme-primary);
  }

  h3 {
    font-size: 1.1rem;
    font-weight: 500;
    margin: 0.6rem 0;
    color: var(--theme-text);
  }
}

.container {
  display: flex;
  gap: 1.5rem;
  height: 80vh;
}

.panel {
  flex: 1;
  border: 1px solid var(--theme-border);
  border-radius: $border-radius-lg;
  padding: 1.2rem;
  background: var(--theme-bg-surface);
  box-shadow: $shadow-lg;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  h2 {
    margin-bottom: 1rem;
    flex-shrink: 0;
  }

  // Specific styling for the visual and JSON panels
  &:nth-child(2),
  &:nth-child(3) {
    .panel-content {
      flex: 1;
      overflow-y: auto;
      padding-right: 0.5rem;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: var(--theme-bg-primary);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--theme-border);
        border-radius: 4px;

        &:hover {
          background: var(--theme-text-muted);
        }
      }
    }
  }
}

.section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--theme-border);

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.2rem;

  button {
    background: var(--theme-primary);
    border: none;
    color: white;
    padding: 0.5rem 0.8rem;
    border-radius: $border-radius;
    font-size: 0.9rem;
    cursor: pointer;
    @include transition(all, $transition-fast);

    &:hover {
      background: var(--theme-primary-hover);
    }

    &.reset-btn {
      background: var(--theme-danger);

      &:hover {
        background: #c0392b;
      }
    }
  }
}

.card {
  background: var(--theme-bg-elevated);
  border: 1px solid var(--theme-border);
  border-radius: $border-radius;
  padding: 1.2rem;

  .target-info {
    margin-bottom: 0.8rem;
    font-size: 0.9rem;
  }
}

.form-group {
  label {
    display: block;
    margin: 0.5rem 0 0.2rem;
    font-size: 0.9rem;
    color: var(--theme-text-muted);
  }

  input,
  select {
    background: var(--theme-bg-primary);
    border: 1px solid var(--theme-border);
    color: var(--theme-text);
    padding: 0.4rem 0.6rem;
    border-radius: $border-radius;
    font-size: 0.9rem;
    margin: 0.3rem 0;
    width: 100%;

    &:focus {
      outline: none;
      border-color: var(--theme-primary);
      box-shadow: 0 0 0 2px rgba(26, 188, 156, 0.3);
    }
  }

  select {
    cursor: pointer;
  }
}

.element {
  margin: 0.6rem 0;
  padding: 0.8rem 1rem;
  border: 1px solid var(--theme-border);
  border-radius: $border-radius;
  background: var(--theme-bg-elevated);
  @include transition(all, $transition-fast);
  cursor: pointer;

  &.fieldset {
    border: 2px solid var(--theme-border);
    background: rgba(60, 65, 92, 0.3);
  }

  &.selected {
    border: 2px solid var(--theme-primary);
    box-shadow: 0 0 0 2px rgba(26, 188, 156, 0.3);
  }

  &:hover {
    border-color: var(--theme-primary);
  }
}

.element-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.element-id {
  color: var(--theme-text-muted);
}

.fieldset-content {
  padding: 0.5rem 0 0 1.2rem;
  border-left: 2px solid rgba(137, 147, 177, 0.2);
  margin-top: 0.5rem;
}

.badge {
  background: rgba(26, 188, 156, 0.2);
  color: var(--theme-primary);
  padding: 0.2rem 0.5rem;
  border-radius: $border-radius-sm;
  font-size: 0.8rem;
  margin-left: 0.5rem;
}

.drop-indicator {
  height: 4px;
  background: var(--theme-primary);
  border-radius: 2px;
  margin: 4px 0;
  animation: pulse 2s infinite;
}

.result {
  background: var(--theme-bg-primary);
  border: 1px solid var(--theme-border);
  padding: 1rem;
  border-radius: $border-radius;
  margin-top: 1rem;

  pre {
    white-space: pre-wrap;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
    font-size: 0.9rem;
    line-height: 1.4;
    color: var(--theme-text);
  }
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--theme-text-muted);
  font-style: italic;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
