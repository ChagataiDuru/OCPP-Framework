import { request } from "@/api";


export function listAccounts() {
  return request.get("/accounts").then((response) => {
    return response;
  });
}
