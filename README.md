# Form Builder

A Vue 3 + TypeScript application for creating, editing, and managing dynamic forms. This project features a professional SASS architecture with BEM, a flexible theming system, and a clean, component-based structure.

## Features

- Drag-and-drop form builder interface
- Customizable form elements (Text Input, Textarea, Checkbox, Select, etc.)
- Dynamic property panel for element configuration
- Live JSON preview of the form structure
- Interactive form canvas with zoom/pan capabilities
- Themeable UI with Dark (default) and Light themes
- Keyboard shortcuts for common actions (e.g., delete element)
- Pinia store for robust state management

## Tech Stack

- **Vue 3** (Composition API)
- **TypeScript**
- **Vite** as the build tool
- **SASS (SCSS)** for styling, following a 7-1 like pattern and BEM naming convention
- **CSS Custom Properties** for a flexible theming system
- **Pinia** for state management
- **Vue Router** for navigation
- **Vue Flow** for the draggable canvas interface

## Project Setup

1.  **Clone the repository:**

    ```sh
    git clone <repository-url>
    cd form-builder
    ```

2.  **Install dependencies:**
    Make sure you have Node.js (v16+) and npm installed.

    ```sh
    npm install
    ```

    This will install Vue, Vite, Pinia, SASS, and other necessary packages.

3.  **Run the development server:**

    ```sh
    npm run dev
    ```

    The application will typically be available at `http://localhost:5173`.

4.  **Build for production:**
    ```sh
    npm run build
    ```
    This creates a `dist` folder with the optimized production assets.

<!-- Placeholder for test command if tests are added -->
<!--
5.  **Run tests:**
    ```sh
    npm run test
    ```
-->

## Project Structure

```
form-builder/
├── public/             # Static assets
├── src/
│   ├── assets/
│   │   └── scss/       # SASS/SCSS stylesheets
│   │       ├── abstracts/  # Variables, functions, mixins, themes, fonts (_index.scss forwards all)
│   │       ├── base/       # Base HTML element styles, global form styles, typography
│   │       ├── components/ # Styles for very generic components (e.g., .builder-form-element)
│   │       └── main.scss   # Main SASS entry point, imports all other layers
│   ├── components/
│   │   ├── common/     # Truly reusable UI components (e.g., Button.vue)
│   │   ├── core/       # Core application components (Sidebar, Panels, Canvas)
│   │   └── elements/   # Form element components (e.g., TextInput.vue as a canvas node)
│   ├── models/         # TypeScript interfaces and type definitions (e.g., FormElement.ts)
│   ├── router/         # Vue Router configuration (index.ts)
│   ├── services/       # API service integrations (currently placeholder)
│   ├── stores/         # Pinia state management stores (formBuilder.ts)
│   ├── views/          # Page-level components mapped to routes (FormBuilder.vue, ThemesPage.vue)
│   ├── App.vue         # Root Vue component
│   └── main.ts         # Application entry point
├── index.html          # Main HTML file
├── package.json
├── vite.config.ts      # Vite configuration (includes SASS global injection)
└── README.md           # This file
```

## Styling & Theming

The project employs a robust SASS architecture and a CSS custom property-based theming system.

### SASS Architecture

- Styles are organized in `src/assets/scss/` following a structure similar to the 7-1 pattern:
  - **`abstracts/`**: Contains SASS tools and helpers like variables (`_variables.scss`), functions, mixins (`_mixins.scss`), font imports (`_fonts.scss`), and theme definitions (`_themes.scss`). An `_index.scss` file forwards all these partials, so only `@use "abstracts" as *;` is needed to access them.
  - **`base/`**: Holds boilerplate code for the project, including global resets, base HTML element styling (like typography, links), and common form element base styles (`.form__input`, etc.).
  - **`components/`**: Contains styles for specific, globally-styled components if any (e.g., `.builder-form-element`). Most component styles are co-located within their respective `.vue` files in `<style lang="scss" scoped>` blocks.
  - **`main.scss`**: The main SASS file that imports all other layers and is itself imported in `src/main.ts`.
- **Global SASS Injection**: Variables and mixins from `src/assets/scss/abstracts/_index.scss` are globally available in all Vue components and SCSS files thanks to the `additionalData` option in `vite.config.ts` (via `css.preprocessorOptions.scss`). This means you don't need to explicitly import them in every component style block.
- **BEM Naming**: A BEM-like naming convention (e.g., `.block__element--modifier`) is encouraged for clarity and maintainability.

### Theming System

- **CSS Custom Properties**: Theming is primarily driven by CSS custom properties (e.g., `var(--theme-text)`, `var(--theme-bg)`).
- **Theme Definition**: Base color palettes and theme-specific variables are defined as SASS maps (`$dark-theme-variables`, `$light-theme-variables`) in `src/assets/scss/abstracts/_variables.scss`.
- **Theme Application**: The `src/assets/scss/abstracts/_themes.scss` file contains a mixin (`apply-theme`) that takes a theme map and generates the corresponding CSS custom properties.
- **Switching Themes**: In `src/assets/scss/base/_base.scss`, the default (dark) theme is applied to the `<body>` tag. The light theme is applied when `body[data-theme="light"]` is present. Theme switching is managed in `App.vue` by updating this `data-theme` attribute.
- **Adding New Themes**:
  1. Define a new theme palette map (e.g., `$my-new-theme-palette`) and a corresponding theme variable map (e.g., `$my-new-theme-variables`) in `_variables.scss`.
  2. Add your new theme map key (e.g., `"my-new-theme": vars.$my-new-theme-variables`) to the `$themes` map in `_themes.scss`.
  3. Add CSS rules in `_base.scss` to apply your theme, e.g., `body[data-theme="my-new-theme"] { @include themes.apply-theme(my-new-theme); }`.
  4. Update the theme switching logic in `App.vue` (or a dedicated theme settings component) to allow selecting the new theme.

## License

MIT
