import { request } from "@/api";
import { useRouterStore } from "@/store/router";

const { getAccountId } = useRouterStore();
const endpoint = "transactions";

export function listTransactions(arg) {
  let { page = 1 } = arg || {};
  let { search = "" } = arg || {};
  let url = `/${getAccountId()}/${endpoint}?page=${page}&search=${search}`;
  return request.get(url);
}
