import { v4 as uuidv4 } from "uuid";
import type {
  BaseFormElement,
  FormElement,
  TextInputElement,
  TextareaElement,
  CheckboxElement,
  SelectElement,
  NumberElement,
  DateElement,
  FileElement,
  ButtonElement,
  SelectOption,
  FieldsetElement,
  RadioElement,
} from "../models/FormElement";

// TODO: Consider importing default dimensions from formBuilderStore or a shared config
const DEFAULT_INPUT_WIDTH = 250;
const DEFAULT_INPUT_HEIGHT = 85;
const DEFAULT_TEXTAREA_WIDTH = 300;
const DEFAULT_TEXTAREA_HEIGHT = 120;
const DEFAULT_CHECKBOX_WIDTH = 200;
const DEFAULT_CHECKBOX_HEIGHT = 40;
const DEFAULT_SELECT_WIDTH = 250;
const DEFAULT_SELECT_HEIGHT = 48;
const DEFAULT_NUMBER_WIDTH = 150;
const DEFAULT_NUMBER_HEIGHT = 48;
const DEFAULT_DATE_WIDTH = 200;
const DEFAULT_DATE_HEIGHT = 48;
const DEFAULT_FILE_WIDTH = 300;
const DEFAULT_FILE_HEIGHT = 48;
const DEFAULT_BUTTON_HEIGHT = 40; // Added for buttons
const DEFAULT_RADIO_GROUP_WIDTH = 250;
const DEFAULT_RADIO_GROUP_HEIGHT = 80; // Placeholder, might auto-adjust

const Y_SPACING = 20; // Vertical spacing between elements
const INITIAL_X_OFFSET = 50;
const INITIAL_Y_OFFSET = 50;

// Constants for Fieldset layout
const FIELDSET_LABEL_ESTIMATED_HEIGHT = 30; // Estimated height for the label area (text + margins)
const FIELDSET_CONTENT_PADDING_TOP = 10; // Padding between label area and first child
const FIELDSET_CONTENT_PADDING_BOTTOM = 10; // Padding after last child
const FIELDSET_CONTENT_PADDING_HORIZONTAL = 15; // Horizontal padding for content within fieldset

interface ServerAttribute {
  [key: string]: any;
}

interface ServerProcessor {
  fqn: string;
  name?: string;
  minimum?: number;
  maximum?: number;
  initial?: number;
  addButton?: string;
  removeButton?: any;
  [key: string]: any;
}

interface ServerElement {
  fqn: string;
  attributes?: ServerAttribute;
  children?: ServerElement[];
  html?: string; // For Markup elements
  processors?: ServerProcessor[]; // Processors für Multiple usw.
}

// Helper to try and find a label for an input, typically a sibling Markup with a Label child
function findAssociatedLabel(
  inputNode: ServerElement,
  siblings: ServerElement[]
): string | undefined {
  const inputId = inputNode.attributes?.id || inputNode.attributes?.name;
  if (!inputId) return undefined;

  for (const sibling of siblings) {
    if (
      sibling.fqn === "Easy\\\\Form\\\\Support\\\\Label" &&
      sibling.attributes?.for === inputId
    ) {
      if (
        sibling.children &&
        sibling.children[0]?.fqn === "Easy\\\\Form\\\\Markup" &&
        sibling.children[0]?.html
      ) {
        return sibling.children[0].html.trim();
      }
    }
    // Check for common pattern: div > label + input
    if (sibling.fqn === "Easy\\\\Form\\\\Markup" && sibling.children) {
      const labelChild = sibling.children.find(
        (c) =>
          c.fqn === "Easy\\\\Form\\\\Support\\\\Label" &&
          c.attributes?.for === inputId
      );
      if (
        labelChild &&
        labelChild.children &&
        labelChild.children[0]?.fqn === "Easy\\\\Form\\\\Markup" &&
        labelChild.children[0]?.html
      ) {
        return labelChild.children[0].html.trim();
      }
    }
  }
  return undefined;
}

function transformServerElementsRecursive(
  serverNodes: ServerElement[],
  parentSiblings: ServerElement[] // Pass siblings for label association
): { visualElements: FormElement[]; nextY: number } {
  const visualElements: FormElement[] = [];
  let currentY = INITIAL_Y_OFFSET; // Start Y for each new recursive call context if needed, or manage globally

  function processNode(
    node: ServerElement,
    siblings: ServerElement[],
    currentX: number,
    yOffset: number,
    parentId?: string // Added parentId
  ): number {
    let feElement: FormElement | null = null;
    const generatedId = uuidv4();
    const elementId =
      node.attributes?.id || node.attributes?.name || generatedId;

    let labelText = node.attributes?.label || node.attributes?.name;
    if (!labelText) {
      // Try to find an associated label first
      const associatedLabel = findAssociatedLabel(node, siblings);
      if (associatedLabel) {
        labelText = associatedLabel;
      } else {
        // For inputs, don't add "Untitled" prefix when inside a fieldset
        if (
          parentId &&
          (node.fqn.includes("\\Input\\") ||
            node.fqn.includes("\\Textarea") ||
            node.fqn.endsWith("\\Input"))
        ) {
          // For inputs inside fieldsets, use name as label if present
          labelText =
            node.attributes?.name ||
            node.fqn.split("\\").pop()?.replace("Input", "") ||
            "Field";
        } else {
          // Regular untitled prefix for top-level elements
          labelText = `Untitled ${
            node.fqn.split("\\").pop()?.replace("Input", "") || "Element"
          }`;
        }
      }
    }

    const baseComponentTypeFromAttributesCleaned =
      (node.attributes?.base_fqn as string)?.trim() ||
      (node.attributes?.base_component_type as string)?.trim();
    // If normalize is available, use it. Some environments might not have it or have different levels.
    const normalizedBaseComponentType =
      baseComponentTypeFromAttributesCleaned &&
      typeof baseComponentTypeFromAttributesCleaned.normalize === "function"
        ? baseComponentTypeFromAttributesCleaned.normalize()
        : baseComponentTypeFromAttributesCleaned;

    let cleanedFqn = node.fqn.trim();
    if (typeof cleanedFqn.normalize === "function") {
      cleanedFqn = cleanedFqn.normalize();
    }

    const typeKeyForSwitch = normalizedBaseComponentType || cleanedFqn;

    const serverFqnValue = node.fqn; // Keep original fqn for serverFqn prop

    const commonProps: Omit<BaseFormElement, "type" | "width" | "height"> & {
      id: string;
      x: number;
      y: number;
    } = {
      id: elementId,
      label: labelText,
      x: currentX,
      y: yOffset,
      required: node.attributes?.required || false,
      order: visualElements.length,
      serverFqn: serverFqnValue,
    };

    // Prüfe auf Multiple Processor, der zu duplizierenden Fieldsets führen könnte
    if (node.fqn === "Easy\\Form\\Fieldset" && node.processors) {
      const multipleProcessor = node.processors.find(
        (p) => p.fqn === "Easy\\Form\\Support\\Processor\\Multiple"
      );

      // Wenn ein Multiple Processor gefunden wurde, merken wir uns das in den Attributen
      // damit wir es später im UI speziell behandeln können, aber nicht duplizieren
      if (multipleProcessor) {
        // Wir fügen den Processor als Flag hinzu, aber stellen sicher, dass wir ihn nur einmal verarbeiten
        if (!node.attributes) node.attributes = {};
        node.attributes["_hasMultipleProcessor"] = true;
        node.attributes["_multipleProcessorData"] =
          JSON.stringify(multipleProcessor);
        console.log(
          "Multiple processor found in fieldset, marked for special handling",
          multipleProcessor
        );
      }
    }

    switch (typeKeyForSwitch) {
      case "Easy\\Form\\Item\\Input\\Text":
      case "InputText":
      case "input":
        feElement = {
          ...commonProps,
          type: "input",
          width: node.attributes?.width || DEFAULT_INPUT_WIDTH,
          height: node.attributes?.height || DEFAULT_INPUT_HEIGHT,
          placeholder: node.attributes?.placeholder || "",
          minLength: node.attributes?.minlength,
          maxLength: node.attributes?.maxlength,
        } as TextInputElement;
        break;
      case "Easy\\Form\\Item\\Textarea":
      case "Textarea":
      case "textarea":
        feElement = {
          ...commonProps,
          type: "textarea",
          width: node.attributes?.width || DEFAULT_TEXTAREA_WIDTH,
          height: node.attributes?.height || DEFAULT_TEXTAREA_HEIGHT,
          placeholder: node.attributes?.placeholder || "",
          rows: node.attributes?.rows || 4,
        } as TextareaElement;
        break;
      case "Easy\\Form\\Item\\Input\\Checkbox":
      case "Checkbox":
      case "checkbox":
        feElement = {
          ...commonProps,
          type: "checkbox",
          width: node.attributes?.width || DEFAULT_CHECKBOX_WIDTH,
          height: node.attributes?.height || DEFAULT_CHECKBOX_HEIGHT,
          checked: node.attributes?.checked || false,
        } as CheckboxElement;
        break;
      case "Easy\\Form\\Item\\Select":
      case "Select":
      case "select":
        feElement = {
          ...commonProps,
          type: "select",
          width: node.attributes?.width || DEFAULT_SELECT_WIDTH,
          height: node.attributes?.height || DEFAULT_SELECT_HEIGHT,
          options:
            node.attributes?.options?.map((opt: any) => ({
              value: opt.value,
              label: opt.label || opt.text || opt.value,
            })) || [],
          multiple: node.attributes?.multiple || false,
        } as SelectElement;
        break;
      case "Easy\\Form\\Item\\Input\\Number":
      case "NumberInput":
      case "number":
        feElement = {
          ...commonProps,
          type: "number",
          width: node.attributes?.width || DEFAULT_NUMBER_WIDTH,
          height: node.attributes?.height || DEFAULT_NUMBER_HEIGHT,
          placeholder: node.attributes?.placeholder || "",
          min: node.attributes?.min,
          max: node.attributes?.max,
          step: node.attributes?.step,
        } as NumberElement;
        break;
      case "Easy\\Form\\Item\\Input\\Date":
      case "DateInput":
      case "date":
        feElement = {
          ...commonProps,
          type: "date",
          width: node.attributes?.width || DEFAULT_DATE_WIDTH,
          height: node.attributes?.height || DEFAULT_DATE_HEIGHT,
          min: node.attributes?.min,
          max: node.attributes?.max,
        } as DateElement;
        break;
      case "Easy\\Form\\Item\\Input\\File":
      case "FileInput":
      case "file":
        feElement = {
          ...commonProps,
          type: "file",
          width: node.attributes?.width || DEFAULT_FILE_WIDTH,
          height: node.attributes?.height || DEFAULT_FILE_HEIGHT,
          accept: node.attributes?.accept || "",
          multiple: node.attributes?.multiple || false,
        } as FileElement;
        break;
      case "Easy\\Form\\Item\\Input\\Radio":
      case "RadioGroup":
      case "radio":
        feElement = {
          ...commonProps,
          type: "radio",
          width: node.attributes?.width || DEFAULT_RADIO_GROUP_WIDTH,
          height: node.attributes?.height || DEFAULT_RADIO_GROUP_HEIGHT,
          options: node.attributes?.options?.map((opt: any) => ({
            value: opt.value,
            label: opt.label || opt.text || opt.value,
          })) || [
            { value: "default1", label: "Default Option 1" },
            { value: "default2", label: "Default Option 2" },
          ],
          defaultValue: node.attributes?.defaultValue,
        } as RadioElement;
        break;
      case "Easy\\Form\\Item\\Button":
      case "Button":
      case "button":
        let buttonLabel = commonProps.label; // Start with label from commonProps
        // If the label is still generic (like "Untitled Easy\\Form\\Item\\Button"), try to find text from children
        if (
          buttonLabel.startsWith("Untitled") &&
          node.children &&
          node.children.length > 0
        ) {
          const firstChild = node.children[0];
          if (firstChild.fqn === "Easy\\Form\\Markup" && firstChild.html) {
            buttonLabel = firstChild.html.trim();
          }
        }

        const tempButtonElement = {
          ...commonProps,
          label: buttonLabel, // Use the potentially updated label
          type: "button",
          width: node.attributes?.width || DEFAULT_INPUT_WIDTH, // Or calculate based on label length?
          height: node.attributes?.height || DEFAULT_BUTTON_HEIGHT, // Use new default button height
          buttonType: node.attributes?.buttonType || "button",
        };
        feElement = tempButtonElement as ButtonElement;
        break;

      case "Easy\\Form\\Fieldset":
        // Prüfe auf Multiple Processor und vermeide doppelte Darstellung
        const hasMultipleProcessor = node.processors?.some(
          (p) => p.fqn === "Easy\\Form\\Support\\Processor\\Multiple"
        );

        if (hasMultipleProcessor) {
          console.log(
            "Processing fieldset with Multiple processor - ensuring single instance"
          );
          // Wir fügen eine besondere Eigenschaft hinzu, um dieses Fieldset zu kennzeichnen
          if (!node.attributes) {
            node.attributes = {};
          }

          // Markiere das Fieldset mit einem speziellen Attribut
          node.attributes._hasMultipleProcessor = true;

          // Finde den Multiple Processor und speichere dessen Daten
          const multipleProcessor = node.processors?.find(
            (p) => p.fqn === "Easy\\Form\\Support\\Processor\\Multiple"
          );

          if (multipleProcessor) {
            node.attributes._multipleProcessorData =
              JSON.stringify(multipleProcessor);
          }
        }

        const fieldsetInitialX = commonProps.x;
        const fieldsetInitialY = commonProps.y;
        const fieldsetLabelValue = commonProps.label;

        const defaultTextForHiddenLabel = "Untitled Fieldset"; // Specific default to hide
        const isLabelConsideredHidden =
          !fieldsetLabelValue ||
          fieldsetLabelValue === defaultTextForHiddenLabel;

        const actualLabelRenderedHeight = !isLabelConsideredHidden
          ? FIELDSET_LABEL_ESTIMATED_HEIGHT
          : 0;

        const fieldsetElementBase: Omit<FieldsetElement, "width" | "height"> = {
          id: commonProps.id,
          label: commonProps.label,
          x: fieldsetInitialX,
          y: fieldsetInitialY,
          required: commonProps.required,
          order: commonProps.order,
          serverFqn: commonProps.serverFqn,
          type: "fieldset",
          children: [], // Initialize the children array
        };

        // Add a placeholder for the fieldset; dimensions will be updated later.
        const fieldsetPlaceholder: FieldsetElement = {
          ...fieldsetElementBase,
          width: DEFAULT_INPUT_WIDTH, // Temporary placeholder
          height: DEFAULT_INPUT_HEIGHT, // Temporary placeholder
        };

        // Track the index where we'll place the fieldset
        const fieldsetIndex = visualElements.length;

        // Create temporary array to collect child elements
        const childElements: FormElement[] = [];

        let childRelativeYOffset = 0; // Y offset for children, relative to fieldset's content area start (below label and top content padding)

        const contentAreaStartX =
          fieldsetInitialX + FIELDSET_CONTENT_PADDING_HORIZONTAL;
        const contentAreaStartY =
          fieldsetInitialY +
          actualLabelRenderedHeight + // Use actual conditional height
          FIELDSET_CONTENT_PADDING_TOP;

        // Process child elements and collect them
        if (node.children && node.children.length > 0) {
          const childVisualElements: FormElement[] = [];

          node.children.forEach((child, index) => {
            const childAbsoluteX = contentAreaStartX; // Children align at the start of the content area X
            const childAbsoluteY = contentAreaStartY + childRelativeYOffset;

            // Get the length before processing to track new elements
            const preProcessLength = visualElements.length;

            const yAfterChildProcessing = processNode(
              child,
              node.children || [], // Siblings for label association (within this fieldset)
              childAbsoluteX,
              childAbsoluteY,
              fieldsetElementBase.id // parentId is this fieldset
            );

            // Collect new elements added during processing - these are our child elements
            for (let i = preProcessLength; i < visualElements.length; i++) {
              childElements.push(visualElements[i]);
            }

            // Reset visualElements to remove the children (they'll be added to the fieldset instead)
            visualElements.splice(preProcessLength);

            const consumedHeightByChild =
              yAfterChildProcessing - childAbsoluteY;
            childRelativeYOffset += consumedHeightByChild;
          });
        }

        let actualContentWidth = 0; // Width spanned by children elements
        let actualContentBlockHeight = 0; // Height spanned by children elements including their Y_SPACING

        if (childElements.length > 0) {
          const minChildX = Math.min(...childElements.map((c) => c.x));
          const maxChildXPlusWidth = Math.max(
            ...childElements.map((c) => c.x + c.width)
          );
          actualContentWidth = Math.max(0, maxChildXPlusWidth - minChildX); // Width of the block formed by children

          // Recalculate vertical span based on processed children relative Y positions
          if (childRelativeYOffset > 0) {
            actualContentBlockHeight = childRelativeYOffset - Y_SPACING; // Subtract last Y_SPACING
          } else {
            actualContentBlockHeight = 0;
          }
        } else {
          actualContentBlockHeight = 0;
        }

        const finalFieldsetWidth =
          childElements.length > 0
            ? actualContentWidth + 2 * FIELDSET_CONTENT_PADDING_HORIZONTAL
            : DEFAULT_INPUT_WIDTH;

        // Calculate height based on whether children exist
        let calculatedHeightBasedOnContent;
        if (childElements.length > 0) {
          calculatedHeightBasedOnContent =
            actualLabelRenderedHeight +
            FIELDSET_CONTENT_PADDING_TOP +
            actualContentBlockHeight +
            FIELDSET_CONTENT_PADDING_BOTTOM;
        } else {
          // If no children, height is just label area (if visible) + top/bottom padding for some minimal presence
          calculatedHeightBasedOnContent =
            actualLabelRenderedHeight +
            FIELDSET_CONTENT_PADDING_TOP +
            FIELDSET_CONTENT_PADDING_BOTTOM; // No actualContentBlockHeight
        }

        const finalFieldsetHeight = Math.max(
          DEFAULT_INPUT_HEIGHT,
          calculatedHeightBasedOnContent
        );

        // Create the final fieldset with collected children
        const finalFieldset: FieldsetElement = {
          ...fieldsetElementBase,
          width: finalFieldsetWidth,
          height: finalFieldsetHeight,
          children: childElements,
        };

        // Add the fieldset with its children to visualElements
        visualElements.push(finalFieldset);

        // The next element after this fieldset should start after its total height + spacing.
        return fieldsetInitialY + finalFieldsetHeight + Y_SPACING;

      case "Easy\\Form\\Markup":
      case "Easy\\Form\\Support\\Label":
        if (node.children && node.children.length > 0) {
          let nestedY = yOffset;
          const containerOwnX = currentX;
          node.children.forEach((child) => {
            nestedY = processNode(
              child,
              node.children || [],
              containerOwnX,
              nestedY,
              parentId
            );
          });
          return nestedY;
        }
        return yOffset;

      default:
        break;
    }

    if (feElement) {
      visualElements.push(feElement);
      const elementHeight =
        (feElement as FormElement).height > 0
          ? (feElement as FormElement).height
          : DEFAULT_INPUT_HEIGHT;
      return yOffset + elementHeight + Y_SPACING;
    }

    return yOffset;
  }

  let currentGlobalY = INITIAL_Y_OFFSET;
  serverNodes.forEach((node) => {
    currentGlobalY = processNode(
      node,
      serverNodes,
      INITIAL_X_OFFSET,
      currentGlobalY
    );
  });

  return { visualElements, nextY: currentGlobalY };
}

export function useServerFormImporter() {
  const transformServerFormToVisual = (serverJson: {
    children?: ServerElement[];
  }): FormElement[] => {
    if (
      !serverJson ||
      !serverJson.children ||
      serverJson.children.length === 0
    ) {
      console.warn(
        "transformServerFormToVisual: No children found in serverJson or serverJson is null/undefined."
      );
      return [];
    }
    const result = transformServerElementsRecursive(
      serverJson.children,
      serverJson.children
    );
    return result.visualElements;
  };

  return {
    transformServerFormToVisual,
  };
}
