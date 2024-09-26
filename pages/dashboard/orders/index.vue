<script setup lang="ts">
import dayjs from 'dayjs';
import type { DataTablePageEvent } from 'primevue/datatable';

definePageMeta({
    title: "Orders",
    actions: "orders"
})

const pagination = reactive({
    page: 1,
    page_size: BaseDataTableProps.rowsPerPageOptions?.at(0) || 10,
})

function onPage(e: DataTablePageEvent) {
    pagination.page = e.page + 1
    pagination.page_size = e.rows
}

const { data, status, refresh } = await useFetch("/api/orders", { query: pagination });
</script>

<template>
    <DataTable v-bind="BaseDataTableProps" :value="data?.result || [] as any" :loading="status == 'pending'"
        :rows="pagination.page_size" :totalRecords="data?.total_rows || 0" @page="onPage">
        <template #empty>
            <p class="text-center">No data.</p>
        </template>

        <template #paginatorstart>
            <Button rounded icon="i-mynaui-refresh" size="small" :loading="status == 'pending'" @click="() => refresh()" />
        </template>

        <Column header="#">
            <template #body="{ index }">
                {{ ((pagination.page - 1) * pagination.page_size) + index + 1 }}
            </template>
        </Column>
        <Column field="order_date" header="Order Date">
            <template #body="{data}">
                {{ dayjs(data.order_date).format("DD, MMM YYYY(HH:mm:ss)") }}
            </template>
        </Column>
        <Column field="total_price" header="Total Price"></Column>
        <Column field="currency" header="Currency"></Column>
        <Column field="region.name" header="Region"></Column>
        <Column field="region.timezone" header="Timezone"></Column>
        <Column field="customer.name" header="Customer Name"></Column>
        <Column field="customer.email" header="Customer Email"></Column>
        <Column field="customer.address" header="Customer Address"></Column>
        <Column field="customer.phone" header="Customer Phone"></Column>
    </DataTable>
</template>
