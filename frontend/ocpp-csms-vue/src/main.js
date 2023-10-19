/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

// Plugins
import { registerPlugins } from "@/plugins";

// Vuetify
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { VDataTable } from "vuetify/labs/VDataTable";
import { createVuetify } from "vuetify";

const vuetify = createVuetify({
  components: {
    VDataTable,
  },
});

const app = createApp(App);

registerPlugins(app);

app.use(vuetify);
app.mount("#app");
