import { defineStore } from "pinia";
import { requestCounters } from "@/services/counters";

export const useCountersStore = defineStore("counters", {
  state: () => ({
    counters: {
      locations: 0,
      stations: 0,
      transactions: 0,
    },
  }),
  actions: {
    fetchCounters() {
      requestCounters().then((response) => {
        this.counters.locations = response.locations;
        this.counters.stations = response.stations;
        this.counters.transactions = response.transactions;
      });
    },
  },
});
