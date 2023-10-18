import { request } from "@/api";
import { useLoaderStore } from "@/store/loader";
import { useRouterStore } from "@/store/router";

const { setLoading, unSetLoading } = useLoaderStore();
const { getAccountId } = useRouterStore();

const endpoint = "charge_points";

export function deleteStation(stationId) {
  return request.delete(`/${getAccountId()}/${endpoint}/${stationId}`);
}

export function addStation(data) {
  return request.post(`/${getAccountId()}/${endpoint}`, data);
}

export function listStations(arg) {
  let { page = 1 } = arg || {};
  let { search = "" } = arg || {};
  return request.get(
    `/${getAccountId()}/${endpoint}?page=${page}&search=${search}`
  );
}

export function requestStatusesCounts() {
  setLoading();
  return request
    .get(`${getAccountId()}/charge_points/counters`)
    .then((response) => {
      unSetLoading();
      return response;
    });
}
