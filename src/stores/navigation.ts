import { defineStore } from "pinia";

export type TabType = "properties" | "json" | "structure";
export type SidebarTabType = "forms" | "elements";

export const useNavigationStore = defineStore("navigation", {
  state: () => ({
    // Panel tabs (right side)
    activeTab: "properties" as TabType,

    // Sidebar tabs (left side)
    activeSidebarTab: "elements" as SidebarTabType,

    // Other UI states we might need later
    sidebarCollapsed: false,
    panelCollapsed: false,
    commandPaletteOpen: false,
  }),

  getters: {
    isPropertiesTabActive: (state) => state.activeTab === "properties",
    isJsonTabActive: (state) => state.activeTab === "json",
    isStructureTabActive: (state) => state.activeTab === "structure",
  },

  actions: {
    setActiveTab(tab: TabType) {
      this.activeTab = tab;
    },

    switchToPropertiesTab() {
      this.activeTab = "properties";
    },

    switchToJsonTab() {
      this.activeTab = "json";
    },

    switchToStructureTab() {
      this.activeTab = "structure";
    },

    setSidebarTab(tab: SidebarTabType) {
      this.activeSidebarTab = tab;
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },

    togglePanel() {
      this.panelCollapsed = !this.panelCollapsed;
    },

    openCommandPalette() {
      this.commandPaletteOpen = true;
    },

    closeCommandPalette() {
      this.commandPaletteOpen = false;
    },
  },
});
