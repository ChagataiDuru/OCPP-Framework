// Utilities
import { defineStore } from "pinia";
import { useRouterStore } from "@/store/router";

const { getAccountId } = useRouterStore();

const API_URL = import.meta.env.VITE_API_URL;

const useSSEStore = defineStore("sse", {
  state: () => ({
    sseEventSource: null,
    listener: null,
    eventType: "message",
  }),
  actions: {
    initEventSource() {
      if (!this.sseEventSource) {
        let url = API_URL + `/${getAccountId()}/stream`;
        this.sseEventSource = new EventSource(url);
      }
    },

    updateEventListener(func) {
      if (this.listener) {
        this.sseEventSource.removeEventListener(this.eventType, this.listener);
      }
      this.listener = (event) => {
        let response = JSON.parse(event.data);
        func(response.data);
      };
      this.sseEventSource.addEventListener(this.eventType, this.listener);
    },
  },
});

export const { initEventSource, updateEventListener } = useSSEStore();
