// ================================
// Form Nodes Index
// ================================
// Central export point for all form node components

// Input Nodes
export { default as TextInputNode } from "./TextInputNode.vue";
export { default as PasswordInputNode } from "./PasswordInputNode.vue";
export { default as EmailInputNode } from "./EmailInputNode.vue";
export { default as TextareaNode } from "./TextareaNode.vue";

// Select Nodes
export { default as CheckboxNode } from "./CheckboxNode.vue";
export { default as SingleSelectNode } from "./SingleSelectNode.vue";

// Container Nodes
export { default as FieldsetNode } from "./FieldsetNode.vue";

// Node Type Map for Dynamic Component Resolution
export const NODE_COMPONENT_MAP = {
  // Input types
  text: "TextInputNode",
  password: "PasswordInputNode",
  email: "EmailInputNode",
  tel: "TelInputNode",
  url: "UrlInputNode",
  number: "NumberInputNode",
  date: "DateInputNode",
  textarea: "TextareaNode",

  // Select types
  checkbox: "CheckboxNode",
  select: "SingleSelectNode",
  multiselect: "MultiSelectNode",
  country: "CountrySelectNode",
  radio: "RadioNode",
  multicheckbox: "MultiCheckboxNode",

  // Advanced types
  hidden: "HiddenNode",
  static: "StaticTextNode",
  file: "FileNode",
  button: "ButtonNode",

  // Container types
  fieldset: "FieldsetNode",
  gridrow: "GridRowNode",
  gridcolumn: "GridColumnNode",
} as const;

export type NodeComponentType = keyof typeof NODE_COMPONENT_MAP;
