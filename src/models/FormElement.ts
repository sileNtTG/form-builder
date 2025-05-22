export interface BaseFormElement {
  id: string;
  type: string;
  serverFqn?: string;
  label: string;
  required: boolean;
  order: number;
  x: number;
  y: number;
  width: number;
  height: number;
  validation?: ValidationRule[];
}

export interface TextInputElement extends BaseFormElement {
  type: "input";
  placeholder?: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
}

export interface TextareaElement extends BaseFormElement {
  type: "textarea";
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
  cols?: number;
}

export interface CheckboxElement extends BaseFormElement {
  type: "checkbox";
  checked?: boolean;
}

export interface SelectElement extends BaseFormElement {
  type: "select";
  options: SelectOption[];
  multiple?: boolean;
  defaultValue?: string | string[];
}

export interface NumberElement extends BaseFormElement {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

export interface DateElement extends BaseFormElement {
  type: "date";
  min?: string;
  max?: string;
  defaultValue?: string;
}

export interface FileElement extends BaseFormElement {
  type: "file";
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
}

export interface ButtonElement extends BaseFormElement {
  type: "button";
  buttonType?: "button" | "submit" | "reset";
}

export interface FieldsetElement extends BaseFormElement {
  type: "fieldset";
  children?: FormElement[];
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormElementOption {
  value: string;
  label: string;
  [key: string]: string;
}

export interface RadioElementOption {
  value: string;
  label: string;
}

export interface RadioElement extends BaseFormElement {
  type: "radio";
  options: RadioElementOption[];
  defaultValue?: string; // The value of the default selected radio option
}

export interface ValidationRule {
  type:
    | "required"
    | "minLength"
    | "maxLength"
    | "pattern"
    | "min"
    | "max"
    | "email"
    | "url"
    | "custom";
  value?: any;
  message: string;
  pattern?: string;
  validator?: (value: any) => boolean;
}

export type FormElement =
  | TextInputElement
  | TextareaElement
  | CheckboxElement
  | SelectElement
  | NumberElement
  | DateElement
  | FileElement
  | ButtonElement
  | FieldsetElement
  | RadioElement;
