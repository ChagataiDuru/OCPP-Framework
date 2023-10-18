<template>
  <v-app id="inspire">
    <v-app-bar class="px-3" flat density="compact">
      <v-spacer></v-spacer>

      <v-tabs centered color="grey-darken-1">
        <v-tab
          v-for="link in links"
          :key="link.name"
          :to="link.path"
          density="comfortable"
        >
          {{ link.name }}
          <v-chip v-if="showCounters(link)" class="ml-2">{{
            counters[link.name]
          }}</v-chip>
        </v-tab>
      </v-tabs>

      <v-spacer></v-spacer>

      <v-avatar
        class="hidden-sm-and-down"
        color="grey-darken-3"
        size="32"
      ></v-avatar>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <v-progress-linear
        :indeterminate="loading"
        color="blue-lighten-3"
      ></v-progress-linear>
      <v-container>
        <v-row>
          <v-col cols="12" sm="12">
            <v-sheet min-height="90vh">
              <router-view></router-view>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { onBeforeMount } from "vue";
import { initEventSource } from "@/store/sse";
import { useLoaderStore } from "@/store/loader";
import { useCountersStore } from "@/store/counters";
import { useRouter } from "vue-router";

const { counters } = storeToRefs(useCountersStore());
const { loading } = storeToRefs(useLoaderStore());
const { fetchCounters } = useCountersStore();

const router = useRouter();
const accountId = router.currentRoute.value.params.accountId;

const showCounters = (link) => {
  return counters.value[link.name] !== undefined;
};

onBeforeMount(() => {
  initEventSource();
  fetchCounters();
});

const links = [
  {
    name: "dashboard",
    path: `/${accountId}/dashboard`,
  },
  {
    name: "locations",
    path: `/${accountId}/locations`,
  },
  {
    name: "stations",
    path: `/${accountId}/stations`,
  },
  {
    name: "transactions",
    path: `/${accountId}/transactions`,
  },
  {
    name: "settings",
    path: `/${accountId}/settings`,
  },
];
</script>
