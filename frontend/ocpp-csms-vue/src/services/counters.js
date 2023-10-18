import { request } from "@/api";
import { useRouterStore } from "@/store/router";

const { getAccountId } = useRouterStore();

export function requestCounters() {
  return request.get(`/${getAccountId()}/counters`).then((response) => {
    return response;
  });
}
