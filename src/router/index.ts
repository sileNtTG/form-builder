import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    name: "FormBuilder",
    component: () => import("../views/FormBuilder.vue"),
  },
  {
    path: "/builder",
    name: "FormBuilderEditor",
    component: () => import("../views/FormBuilder.vue"),
  },
  {
    path: "/preview/:id",
    name: "FormPreview",
    component: () => import("../views/FormPreview.vue"),
  },
  {
    path: "/preferences",
    name: "Preferences",
    component: () => import("../views/PreferencesView.vue"),
  },
  {
    path: "/api-key",
    name: "ApiKey",
    component: () => import("../views/ApiKeyView.vue"),
  },
  {
    path: "/fieldset-test",
    name: "FieldsetTest",
    component: () => import("../views/FieldsetNestingTest.vue"),
  },
  {
    path: "/publish-demo",
    name: "PublishDemo",
    component: () => import("../components/demo/PublishStatusDemo.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
