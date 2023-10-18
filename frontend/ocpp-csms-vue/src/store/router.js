import { defineStore } from "pinia";
import { useRoute } from "vue-router";

export const useRouterStore = defineStore("router", {
  state: () => ({
    router: null,
  }),
  actions: {
    getAccountId() {
      if (!this.router) {
        this.router = useRoute();
      }
      return this.router.params.accountId;
    },
  },
});
