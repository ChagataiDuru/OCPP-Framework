<template>
  <data-table
    title="Stations"
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
              label="Id, Status, Address or Model"
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
        <v-col class="d-flex justify-end mb-6 mt-3">
          <v-btn color="blue-lighten-1" class="ma-6 pa-2" @click="openModal"
            >add</v-btn
          >
        </v-col>
      </v-row>
    </template>
    <template v-slot:item.status="{ item }">
      <v-chip :color="STATION_STATUS_COLOR[item.columns.status.toLowerCase()]">
        <p class="text-medium-emphasis">
          {{ item.columns.status }}
        </p>
      </v-chip>
    </template>
    <template v-slot:item.action="{ item }">
      <v-hover v-slot="{ isHovering, props }" open-delay="100">
        <v-btn
          v-if="isDeleteAllowed(item)"
          icon
          size="small"
          density="compact"
          :elevation="isHovering ? 12 : 2"
          :class="{ 'on-hover': isHovering }"
          v-bind="props"
          @click="() => removeStation(item)"
        >
          <v-icon color="deep-orange-lighten-3">mdi-trash-can-outline</v-icon>
        </v-btn>
      </v-hover>
    </template>
  </data-table>
  <v-form v-model="isValid">
    <v-container>
      <v-row justify="center">
        <v-dialog v-model="dialog" persistent width="600">
          <v-card>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" class="mt-7">
                    <v-autocomplete
                      :items="locations"
                      v-model="data.location_id"
                      required
                      label="Location"
                      density="compact"
                      variant="underlined"
                      item-title="name"
                      item-value="id"
                    ></v-autocomplete>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      :error="showError && errors.id"
                      :error-messages="errors.id"
                      :rules="rules.station.idRules"
                      label="Id"
                      required
                      v-model="data.id"
                      density="compact"
                      variant="underlined"
                      validate-on="lazy blur"
                      @input="clearError"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      :rules="rules.station.manufacturerRules"
                      label="Manufacturer"
                      required
                      v-model="data.manufacturer"
                      density="compact"
                      variant="underlined"
                      validate-on="lazy blur"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      :rules="rules.station.serialNumberRules"
                      :error="showError && errors.serial_number"
                      :error-messages="errors.serial_number"
                      label="Serial Number"
                      required
                      v-model="data.serial_number"
                      density="compact"
                      variant="underlined"
                      validate-on="lazy blur"
                      @input="clearError"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      :rules="rules.station.modelRules"
                      label="Model"
                      required
                      v-model="data.model"
                      density="compact"
                      variant="underlined"
                      validate-on="lazy blur"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      :rules="rules.station.commentRules"
                      label="Comment"
                      v-model="data.comment"
                      density="compact"
                      variant="underlined"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions class="mb-7">
              <v-spacer></v-spacer>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="closeModal"
                :disabled="loading"
              >
                Close
              </v-btn>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="sendData"
                :loading="loading"
                :disabled="!isValid"
              >
                Add
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
    </v-container>
  </v-form>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { updateEventListener } from "@/store/sse";
import { dateAgo } from "@/filters/date";
import DataTable from "@/components/DataTable";
import { rules } from "@/configs/validation";
import { listSimpleLocations } from "@/services/locations";

import {
  EVENT_NAMES,
  STATION_STATUS,
  STATION_STATUS_COLOR,
} from "@/components/enums";
import { usePagination } from "@/use/pagination";
import { listStations, addStation, deleteStation } from "@/services/stations";
import { useCountersStore } from "@/store/counters";

const loading = ref(false);
const isValid = ref(false);
const dialog = ref(false);
const data = ref({});
const errors = ref({});
const showError = ref(false);
const locations = ref([]);

const { currentPage, lastPage, fetchData, items, search } = usePagination({
  itemsLoader: listStations,
});
const { fetchCounters } = useCountersStore();

const isDeleteAllowed = (station) => {
  return station.columns.status.toLowerCase() === STATION_STATUS.unavailable;
};

const clearError = () => {
  showError.value = false;
  errors.value = {};
};

const openModal = () => {
  listSimpleLocations().then((response) => {
    dialog.value = true;
    locations.value = response;
  });
};

const closeModal = () => {
  dialog.value = false;
  data.value = {};
  clearError();
};

const sendData = () => {
  loading.value = true;
  addStation(data.value)
    .then(() => {
      fetchData();
      fetchCounters();
      loading.value = false;
      closeModal();
    })
    .catch(({ response }) => {
      const { data } = response;
      showError.value = true;
      errors.value[data.key] = data.detail;
      loading.value = false;
    });
};

const removeStation = (item) => {
  deleteStation(item.key).then(() => {
    fetchData();
    fetchCounters();
  });
};

const headers = [
  {
    title: "Id",
    key: "id",
    align: "center",
    sortable: false,
    width: "15%",
  },
  {
    title: "Model",
    key: "model",
    align: "center",
    sortable: false,
    width: "20%",
  },
  {
    title: "Status",
    key: "status",
    align: "center",
    sortable: false,
    width: "12%",
  },
  {
    title: "Location",
    key: "location",
    align: "center",
    sortable: false,
    width: "20%",
    value: (v) => `${v.location.city}/${v.location.name}`,
  },
  {
    title: "Last activity",
    key: "updated_at",
    align: "center",
    sortable: true,
    value: (v) => dateAgo(v.updated_at),
    width: "20%",
  },
  {
    title: "",
    align: "left",
    width: "8%",
    sortable: false,
    key: "action",
  },
];

const refreshStation = ({ id, status }) => {
  items.value.forEach((item) => {
    if (item.id === id) {
      item.updated_at = new Date().toISOString();
      item.status = status !== undefined ? status : item.status;
    }
  });
};

const processSSE = (event) => {
  console.log(`Start process event for stations (event=${event.name}.)`);
  if (event.name === EVENT_NAMES.heartbeat) {
    refreshStation({ id: event.charge_point_id });
    return;
  }
  if (event.name === EVENT_NAMES.status_notification) {
    refreshStation({ id: event.charge_point_id, status: event.meta.status });
    return;
  }
  if (event.name === EVENT_NAMES.lost_connection) {
    refreshStation({
      id: event.charge_point_id,
      status: STATION_STATUS.unavailable,
    });
  }
};

onMounted(() => {
  updateEventListener(processSSE);
});
</script>
