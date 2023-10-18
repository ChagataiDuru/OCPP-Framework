<template>
  <v-container>
    <v-row v-if="counters">
      <v-col cols="12" sm="6">
        <v-sheet rounded="lg" min-height="20vh">
          <statuses-pie-chart></statuses-pie-chart>
        </v-sheet>
      </v-col>
    </v-row>
    <empty-data v-else></empty-data>
  </v-container>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { updateEventListener } from "@/store/sse";
import { useStationsStore } from "@/store/stations";
import StatusesPieChart from "@/pages/Dashboard/components/StatusesPieChart";
import EmptyData from "@/components/EmptyData";
import { EVENT_NAMES } from "@/components/enums";

const store = useStationsStore();
const { fetchStatusesCounts, updateCounters } = store;
const { counters } = storeToRefs(store);

const processSSE = (event) => {
  console.log("Start process event for dashboard.");
  if (
    [EVENT_NAMES.new_connection, EVENT_NAMES.lost_connection].includes(
      event.name
    )
  ) {
    updateCounters(event.meta.count);
  }
};

onMounted(() => {
  fetchStatusesCounts();
  updateEventListener(processSSE);
});
</script>
