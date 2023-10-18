<template>
  <v-card elevation="0">
    <v-card-title>
      <slot name="title" :title="title">
        <v-card-item class="text-center">{{ title }}</v-card-item>
      </slot>
    </v-card-title>
    <v-data-table
      v-if="items?.length"
      :headers="headers"
      :items="items"
      :hover="rowConfig.hover"
      :density="rowConfig.density"
      :class="rowConfig.fontStyle"
    >
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
    </v-data-table>
    <div class="text-center mt-7">
      <v-pagination
        v-if="items?.length"
        :modelValue="currentPage"
        @update:modelValue="updateCurrentPage"
        :length="lastPage"
        total-visible="6"
        density="compact"
      ></v-pagination>
    </div>
  </v-card>
  <empty-data v-if="!items?.length"></empty-data>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import EmptyData from "@/components/EmptyData";

const rowConfig = {
  fontStyle: "text-caption",
  hover: false,
  density: "comfortable",
};

const props = defineProps({
  headers: Array,
  title: String,
  items: Array,
  currentPage: Number,
  lastPage: Number,
});

const emit = defineEmits(["page-updated"]);
const updateCurrentPage = (page) => {
  emit("page-updated", page);
};
</script>
<style>
.v-data-table-footer {
  display: none;
}
</style>
