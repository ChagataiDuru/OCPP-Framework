import { createRouter, createWebHistory } from "vue-router";

const PATTERNS = {
  uuid: "\\b[0-9a-f]{8}\\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\\b[0-9a-f]{12}\\b",
};

const routes = [
  {
    path: "/not-found",
    name: "404",
    component: () =>
      import(/* webpackChunkName: "home" */ "@/pages/NotFoundPage.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "home" */ "@/pages/AuthPage.vue"),
  },
  {
    path: "/",
    redirect: { name: "login" },
  },
  {
    path: "/",
    component: () => import("@/layouts/AppLayout.vue"),
    children: [
      {
        path: `/:accountId(${PATTERNS.uuid})/dashboard`,
        name: "Dashboard",
        component: () =>
          import(
            /* webpackChunkName: "home" */ "@/pages/Dashboard/DashboardPage.vue"
          ),
      },
      {
        path: `/:accountId(${PATTERNS.uuid})/locations`,
        name: "Locations",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/pages/LocationsPage.vue"),
      },
      {
        path: `/:accountId(${PATTERNS.uuid})/stations`,
        name: "Stations",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/pages/StationsPage.vue"),
      },
      {
        path: `/:accountId(${PATTERNS.uuid})/transactions`,
        name: "Transactions",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/pages/TransactionsPage.vue"),
      },
      {
        path: `/:accountId(${PATTERNS.uuid})/settings`,
        name: "Settings",
        component: () =>
          import(/* webpackChunkName: "home" */ "@/pages/SettingsPage.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
