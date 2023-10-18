import { watch, ref } from "vue";
import { useLoaderStore } from "@/store/loader";
import { rules } from "@/configs/validation";

const { setLoading, unSetLoading } = useLoaderStore();

export function usePagination({ itemsLoader }) {
  const currentPage = ref(1);
  const lastPage = ref(0);
  const items = ref([]);
  const search = ref("");
  let timeout = null;

  const fetchData = () => {
    setLoading();
    itemsLoader({ page: currentPage.value, search: search.value }).then(
      (response) => {
        if (!response.items.length && currentPage.value > 1) {
          currentPage.value--;
        }
        items.value = response.items;
        lastPage.value = response.pagination.last_page;
        unSetLoading();
      }
    );
  };
  fetchData();
  watch(currentPage, () => fetchData());
  watch(search, (newValue, oldValue) => {
    let newValueLength = newValue.trim().length;
    let oldValueLength = oldValue.trim().length;
    if (
      newValueLength >= rules.minLength ||
      (!newValueLength && oldValueLength)
    ) {
      clearTimeout(timeout);
      timeout = setTimeout(fetchData, 500, newValue);
    }
  });
  return { currentPage, lastPage, fetchData, items, search };
}
