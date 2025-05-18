# Form Builder

A Vue 3 + TypeScript application for creating, editing, and managing dynamic forms.

## Features

- Drag-and-drop form builder interface
- Support for multiple form elements (text input, select, checkbox, etc.)
- Property panel for customizing form elements
- Form preview mode
- Form list management

## Tech Stack

- Vue 3 + Composition API
- TypeScript
- Vite as the build tool
- Tailwind CSS for styling
- Pinia for state management
- Vue Router for navigation

## Project Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Project Structure

- `src/components/` - All Vue components
  - `core/` - Core components for the form builder
  - `elements/` - Form element components
  - `ui/` - Reusable UI components
- `src/views/` - Page components
- `src/stores/` - Pinia stores
- `src/models/` - TypeScript interfaces and types
- `src/services/` - API services
- `src/composables/` - Reusable composition functions

## License

MIT
