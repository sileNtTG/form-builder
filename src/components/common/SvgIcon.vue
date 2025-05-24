<script setup lang="ts">
import { computed, ref, onMounted } from "vue";

// Import all icons statically
import arrowUpIcon from "@/assets/icons/arrow-up.svg?raw";
import atSignIcon from "@/assets/icons/at-sign.svg?raw";
import buttonIcon from "@/assets/icons/button.svg?raw";
import calendarIcon from "@/assets/icons/calendar.svg?raw";
import checkIcon from "@/assets/icons/check.svg?raw";
import checkboxIcon from "@/assets/icons/checkbox.svg?raw";
import checkCircleIcon from "@/assets/icons/check-circle.svg?raw";
import checkSquareIcon from "@/assets/icons/check-square.svg?raw";
import chevronDownIcon from "@/assets/icons/chevron-down.svg?raw";
import circleIcon from "@/assets/icons/circle.svg?raw";
import copyIcon from "@/assets/icons/copy.svg?raw";
import editIcon from "@/assets/icons/edit.svg?raw";
import eyeIcon from "@/assets/icons/eye.svg?raw";
import eyeOffIcon from "@/assets/icons/eye-off.svg?raw";
import fieldsetIcon from "@/assets/icons/fieldset.svg?raw";
import fileTextIcon from "@/assets/icons/file-text.svg?raw";
import folderIcon from "@/assets/icons/folder.svg?raw";
import folderOpenIcon from "@/assets/icons/folder-open.svg?raw";
import gripVerticalIcon from "@/assets/icons/grip-vertical.svg?raw";
import hashIcon from "@/assets/icons/hash.svg?raw";
import infoIcon from "@/assets/icons/info.svg?raw";
import inputIcon from "@/assets/icons/input.svg?raw";
import keyIcon from "@/assets/icons/key.svg?raw";
import loaderIcon from "@/assets/icons/loader.svg?raw";
import maximizeIcon from "@/assets/icons/maximize.svg?raw";
import menuIcon from "@/assets/icons/menu.svg?raw";
import moonIcon from "@/assets/icons/moon.svg?raw";
import plusIcon from "@/assets/icons/plus.svg?raw";
import plusCircleIcon from "@/assets/icons/plus-circle.svg?raw";
import radioIcon from "@/assets/icons/radio.svg?raw";
import sadFaceIcon from "@/assets/icons/sad-face.svg?raw";
import searchIcon from "@/assets/icons/search.svg?raw";
import selectIcon from "@/assets/icons/select.svg?raw";
import settingsIcon from "@/assets/icons/settings.svg?raw";
import squareIcon from "@/assets/icons/square.svg?raw";
import sunIcon from "@/assets/icons/sun.svg?raw";
import textareaIcon from "@/assets/icons/textarea.svg?raw";
import trashIcon from "@/assets/icons/trash.svg?raw";
import typeIcon from "@/assets/icons/type.svg?raw";
import uploadIcon from "@/assets/icons/upload.svg?raw";
import userIcon from "@/assets/icons/user.svg?raw";
import xIcon from "@/assets/icons/x.svg?raw";

// Icon registry
const iconRegistry: Record<string, string> = {
  "arrow-up": arrowUpIcon,
  "at-sign": atSignIcon,
  button: buttonIcon,
  calendar: calendarIcon,
  check: checkIcon,
  checkbox: checkboxIcon,
  "check-circle": checkCircleIcon,
  "check-square": checkSquareIcon,
  "chevron-down": chevronDownIcon,
  circle: circleIcon,
  copy: copyIcon,
  edit: editIcon,
  eye: eyeIcon,
  "eye-off": eyeOffIcon,
  fieldset: fieldsetIcon,
  "file-text": fileTextIcon,
  folder: folderIcon,
  "folder-open": folderOpenIcon,
  "grip-vertical": gripVerticalIcon,
  hash: hashIcon,
  info: infoIcon,
  input: inputIcon,
  key: keyIcon,
  loader: loaderIcon,
  maximize: maximizeIcon,
  menu: menuIcon,
  moon: moonIcon,
  plus: plusIcon,
  "plus-circle": plusCircleIcon,
  radio: radioIcon,
  "sad-face": sadFaceIcon,
  search: searchIcon,
  select: selectIcon,
  settings: settingsIcon,
  square: squareIcon,
  sun: sunIcon,
  textarea: textareaIcon,
  trash: trashIcon,
  type: typeIcon,
  upload: uploadIcon,
  user: userIcon,
  x: xIcon,
};

interface Props {
  name: string;
  size?: number | string;
  color?: string;
  class?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 20,
  color: "currentColor",
  class: "",
});

const svgContent = ref<string>("");
const isLoaded = ref(false);

const sizeStyle = computed(() => {
  const size = typeof props.size === "number" ? `${props.size}px` : props.size;
  return {
    width: size,
    height: size,
    color: props.color,
  };
});

onMounted(() => {
  const iconContent = iconRegistry[props.name];

  if (iconContent) {
    svgContent.value = iconContent;
    isLoaded.value = true;
  } else {
    isLoaded.value = false;
  }
});
</script>

<template>
  <div
    v-if="isLoaded"
    :class="['svg-icon', props.class]"
    :style="sizeStyle"
    v-html="svgContent"
  />
  <div
    v-else
    :class="['svg-icon-missing', props.class]"
    :style="sizeStyle"
    :title="`Icon '${props.name}' not found`"
  >
    ?
  </div>
</template>

<style scoped>
.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.svg-icon :deep(svg) {
  width: 100%;
  height: 100%;
  color: inherit;
}

.svg-icon-missing {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #ff4444;
  color: white;
  font-size: 10px;
  border-radius: 2px;
  padding: 2px 4px;
  font-weight: bold;
}
</style>
