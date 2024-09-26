import type { DataTableProps } from "primevue/datatable";

export const BaseDataTableProps = reactive<DataTableProps >({
    lazy: true,
    rowHover: true,
    stripedRows: true,
    scrollable: true,
    scrollHeight: "flex",
    paginator: true,
    rowsPerPageOptions: [10, 20, 50, 100],
});
