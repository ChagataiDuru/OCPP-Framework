<template>
  <data-table
    title="Locations"
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
              label="Name, City or Address"
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
          @click="() => removeLocation(item)"
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
                    <v-text-field
                      :error="showError"
                      :error-messages="errors.name"
                      :rules="rules.location.nameRules"
                      label="Name"
                      required
                      v-model="data.name"
                      density="compact"
                      variant="underlined"
                      validate-on="lazy blur"
                      @input="clearError"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      :rules="rules.location.cityRules"
                      label="City"
                      required
                      v-model="data.city"
                      density="compact"
                      variant="underlined"
                      validate-on="lazy blur"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      :rules="rules.location.addressRules"
                      label="Address"
                      required
                      v-model="data.address1"
                      density="compact"
                      variant="underlined"
                      validate-on="lazy blur"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      :rules="rules.location.commentRules"
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
import DataTable from "@/components/DataTable";
import {
  listLocations,
  addLocation,
  deleteLocation,
} from "@/services/locations";
import { ref } from "vue";
import { usePagination } from "@/use/pagination";
import { rules } from "@/configs/validation";
import { useCountersStore } from "@/store/counters";

const dialog = ref(false);
const loading = ref(false);
const isValid = ref(false);
const data = ref({});
const errors = ref({});
const showError = ref(false);

const { currentPage, lastPage, fetchData, items, search } = usePagination({
  itemsLoader: listLocations,
});
const { fetchCounters } = useCountersStore();

const isDeleteAllowed = (location) => {
  return !location.columns.charge_points_count;
};

const removeLocation = (item) => {
  deleteLocation(item.key).then(() => {
    fetchData();
    fetchCounters();
  });
};

const clearError = () => {
  showError.value = false;
  errors.value = {};
};

const openModal = () => (dialog.value = true);
const closeModal = () => {
  dialog.value = false;
  data.value = {};
  clearError();
};
const sendData = () => {
  loading.value = true;
  addLocation(data.value)
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

const headers = [
  {
    title: "Name",
    key: "name",
    align: "center",
    sortable: false,
    width: "15%",
  },
  {
    title: "Stations",
    key: "charge_points_count",
    align: "center",
    sortable: false,
    width: "5%",
  },
  {
    title: "City",
    key: "city",
    align: "center",
    sortable: false,
    width: "20%",
  },
  {
    title: "Address",
    key: "address1",
    align: "center",
    sortable: false,
    width: "20%",
  },
  {
    title: "Comment",
    key: "comment",
    align: "center",
    sortable: false,
    width: "30%",
  },
  {
    title: "",
    align: "left",
    width: "8%",
    sortable: false,
    key: "action",
  },
];
</script>
