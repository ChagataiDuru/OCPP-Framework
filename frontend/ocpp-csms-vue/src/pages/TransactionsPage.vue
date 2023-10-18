<template>
  <data-table
    title="Transactions"
    :items="items"
    :headers="headers"
    :current-page="currentPage"
    :last-page="lastPage"
    @page-updated="(newPage) => (currentPage = newPage)"
  >
    <template v-slot:title="{ title }">
      <v-row>
        <v-col>
          <v-card-item class="ma-6 pa-2">
            <v-text-field
              label="City, Address, Vehicle or Station"
              density="compact"
              variant="outlined"
              append-inner-icon="mdi-magnify"
              v-model="search"
            >
            </v-text-field>
          </v-card-item>
        </v-col>
        <v-col class="d-flex justify-center mb-6">
          <v-card-item>{{ title }}</v-card-item>
        </v-col>
        <v-col class="d-flex justify-center mb-6"> </v-col>
      </v-row>
    </template>
    <template v-slot:item.status="{ item }">
      <v-chip :color="getTransactionColor(item)">
        <p class="text-medium-emphasis">
          {{ item.columns.status }}
        </p>
      </v-chip>
    </template>
  </data-table>
</template>

<script setup>
import {
  TRANSACTION_STATUS,
  TRANSACTION_STATUS_COLOR,
  EVENT_NAMES,
} from "@/components/enums";
import { date } from "@/filters/date";
import DataTable from "@/components/DataTable";
import { listTransactions } from "@/services/transactions";
import { onMounted } from "vue";
import { usePagination } from "@/use/pagination";
import { updateEventListener } from "@/store/sse";
import { useCountersStore } from "@/store/counters";

const { fetchCounters } = useCountersStore();

const { currentPage, lastPage, items, fetchData, search } = usePagination({
  itemsLoader: listTransactions,
});

const getTransactionColor = (item) => {
  return item.columns.status === TRANSACTION_STATUS.completed
    ? TRANSACTION_STATUS_COLOR.completed
    : TRANSACTION_STATUS_COLOR.in_progress;
};

const headers = [
  {
    title: "Station",
    key: "charge_point",
    align: "center",
    sortable: false,
    width: "15%",
  },
  {
    title: "Vehicle",
    key: "vehicle",
    align: "center",
    sortable: false,
    width: "15%",
  },
  {
    title: "Location",
    key: "location",
    align: "left",
    sortable: false,
    width: "20%",
    value: (v) => `${v.city}/${v.address}`,
  },
  {
    title: "Status",
    key: "status",
    align: "center",
    sortable: false,
    value: (v) => {
      return v.updated_at !== null
        ? TRANSACTION_STATUS.completed
        : TRANSACTION_STATUS.in_progress;
    },
    width: "15%",
  },
  {
    title: "Start",
    key: "created_at",
    align: "left",
    sortable: false,
    value: (v) => date(v.created_at),
    width: "8%",
  },
  {
    title: "Finish",
    key: "updated_at",
    align: "left",
    sortable: false,
    value: (v) => date(v.updated_at),
    width: "8%",
  },
  {
    title: "",
    key: "",
    align: "center",
    sortable: false,
    width: "5%",
  },
];

const processSSE = (event) => {
  console.log(
    `Start process event for transactions (event=${event.name}, transaction=${event.meta.id})`
  );
  if (currentPage.value === 1 && event.name === EVENT_NAMES.start_transaction) {
    items.value.pop();
    items.value.unshift(event.meta);
    fetchCounters();
  }
  if (event.name === EVENT_NAMES.stop_transaction) {
    items.value = [
      event.meta,
      ...items.value.filter((item) => item.id !== event.meta.id),
    ];
  }
};

onMounted(() => {
  updateEventListener(processSSE);
});
</script>
