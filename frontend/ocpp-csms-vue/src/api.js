import axios from "axios";
import router from "@/router";

const API_URL = import.meta.env.VITE_API_URL;

export function request(
  path,
  data,
  {
    // eslint-disable-next-line no-unused-vars
    include,
    // eslint-disable-next-line no-unused-vars
    page,
    // eslint-disable-next-line no-unused-vars
    size,
    // eslint-disable-next-line no-unused-vars
    sort,
    // eslint-disable-next-line no-unused-vars
    filter,
    raw = false,
    // eslint-disable-next-line no-unused-vars
    handle4xx = true,
    ...options
  } = {}
) {
  let url = API_URL + (path.startsWith("/") ? path : `/${path}`);
  return axios({
    url,
    method: "get",
    data,
    ...options,
  })
    .then((response) => {
      return raw ? response : response?.data;
    })
    .catch((err) => {
      if (import.meta.env.MODE === "development") {
        console.error("HTTP error:", err);
      }

      let status = err?.response?.status;

      if (status == null || status === 500) {
        // Displaying error popup
      }

      if (status === 204) {
        return Promise.resolve({});
      }
      if (status === 404) {
        router.push({ name: "404" });
      }

      throw err;
    });
}

request.generateFullUrl = (url) => API_URL + url;
request.get = (url, options = {}) =>
  request(url, {}, { ...options, method: "get" });
request.post = (url, data, options = {}) =>
  request(url, data, { ...options, method: "post" });
request.patch = (url, data, options = {}) =>
  request(url, data, { ...options, method: "patch" });
request.put = (url, data, options = {}) =>
  request(url, data, { ...options, method: "put" });
request.delete = (url, data, options = {}) =>
  request(url, data, { ...options, method: "delete" });