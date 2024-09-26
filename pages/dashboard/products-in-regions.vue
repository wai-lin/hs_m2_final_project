<script setup lang="ts">
import type { DataTablePageEvent } from 'primevue/datatable';

definePageMeta({
    title: "Products in Regions",
    actions: "products_regions",
})

const pagination = reactive({
    page: 1,
    page_size: BaseDataTableProps.rowsPerPageOptions?.at(0) || 10,
})

function onPage(e: DataTablePageEvent) {
    pagination.page = e.page + 1
    pagination.page_size = e.rows
}

const { data, status, refresh } = await useFetch("/api/products-regions", { query: pagination });
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
        <Column field="product_name" header="Product Name"></Column>
        <Column field="region.name" header="Region"></Column>
        <Column field="region.timezone" header="Timezone"></Column>
        <Column field="price" header="Price"></Column>
        <Column field="region.currency" header="Currency"></Column>
        <Column field="stock_level" header="Stock Level"></Column>
    </DataTable>
</template>
