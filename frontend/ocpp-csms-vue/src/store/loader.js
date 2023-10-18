// Utilities
import { defineStore } from "pinia";

export const useLoaderStore = defineStore("loader", {
  state: () => ({
    loading: false,
  }),
  actions: {
    setLoading() {
      this.loading = true;
    },
    unSetLoading() {
      this.loading = false;
    },
  },
});
