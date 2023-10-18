import { defineStore } from "pinia";
import { listAccounts } from "@/services/accounts";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    currentAccountId: null,
    accounts: [],
  }),
  actions: {
    fetchAccounts() {
      return listAccounts().then((response) => {
        this.accounts = response;
        this.currentAccountId = response[0].id;
        return response;
      });
    },
  },
});
