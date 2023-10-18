import { defineStore } from "pinia";
import { requestStatusesCounts } from "@/services/stations";

export const useStationsStore = defineStore("stations", {
  state: () => ({
    counters: null,
    stations: [],
  }),
  actions: {
    fetchStatusesCounts() {
      requestStatusesCounts().then((response) => {
        this.counters = response;
      });
    },
    getCounters() {
      return this.counters;
    },
    updateCounters(value) {
      this.counters = value;
    },
  },
});
