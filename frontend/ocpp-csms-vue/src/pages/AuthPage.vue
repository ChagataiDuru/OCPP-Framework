<template>
  <div class="text-center">
    <v-progress-circular
      :size="50"
      color="blue-lighten-2"
      class="mt-16"
      indeterminate
    ></v-progress-circular>
    <v-btn color="primary" class="mt-16" @click="goToDashboard">
      Go to Dashboard
    </v-btn>
  </div>
</template>
<script setup>
import router from "@/router";
import { onBeforeMount } from "vue";
import { useAuthStore } from "@/store/auth";

const { fetchAccounts } = useAuthStore();

/*onBeforeMount(() => {
  fetchAccounts().then((response) => {
    setTimeout(() => {
      router.push({ name: "Dashboard", params: { accountId: response[0].id } });
    }, 2000);
  });
});*/

const goToDashboard = () => {
  router.push({ name: "Dashboard", params: { accountId: '1' } });
};

goToDashboard();

</script>
