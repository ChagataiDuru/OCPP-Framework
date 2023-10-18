import { request } from "@/api";
import { useRouterStore } from "@/store/router";

const { getAccountId } = useRouterStore();
const endpoint = "locations";

export function deleteLocation(locationId) {
  return request.delete(`/${getAccountId()}/${endpoint}/${locationId}`);
}

export function addLocation(data) {
  return request.post(`/${getAccountId()}/${endpoint}`, data);
}

export function listLocations(arg) {
  let { page = 1 } = arg || {};
  let { search = "" } = arg || {};
  let url = `/${getAccountId()}/${endpoint}?page=${page}&search=${search}`;
  return request.get(url);
}

export function listSimpleLocations() {
  return request.get(`/${getAccountId()}/${endpoint}/autocomplete`);
}
