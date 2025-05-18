import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "FormList",
    component: () => import("../views/FormList.vue"),
  },
  {
    path: "/builder",
    name: "FormBuilder",
    component: () => import("../views/FormBuilder.vue"),
  },
  {
    path: "/preview/:id",
    name: "FormPreview",
    component: () => import("../views/FormPreview.vue"),
  },
  {
    path: "/settings/themes",
    name: "ThemesSettings",
    component: () => import("../views/Settings/ThemesPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
