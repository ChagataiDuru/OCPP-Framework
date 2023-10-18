<template>
  <pie-chart
    :collection-data="chartData"
    :options="CHART_CONF.options"
  ></pie-chart>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { ref, watch, onBeforeMount } from "vue";
import PieChart from "@/components/pieChart/PieChart";
import { CHART_CONF } from "@/components/pieChart/helpers";
import { useStationsStore } from "@/store/stations";
import { STATION_STATUS_COLOR } from "@/components/enums";

const sseStore = useStationsStore();
const { getCounters } = sseStore;
const { counters } = storeToRefs(sseStore);

const chartData = ref([]);

watch(counters, () =>
  CHART_CONF.updateData(chartData, getCounters(), STATION_STATUS_COLOR)
);

onBeforeMount(() => {
  CHART_CONF.initialize({ colors: Object.values(STATION_STATUS_COLOR) });
  CHART_CONF.updateData(chartData, getCounters(), STATION_STATUS_COLOR);
});
</script>
