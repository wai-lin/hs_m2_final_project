<script setup lang="ts">
import type { DataTablePageEvent } from 'primevue/datatable';

definePageMeta({
    title: "Products in Regions",
    actions: "products_regions",
})

const pagination = reactive({
    page: 1,
    page_size: BaseDataTableProps.rowsPerPageOptions?.at(0) || 10,
    over_treshold: false
})

function onPage(e: DataTablePageEvent) {
    pagination.page = e.page + 1
    pagination.page_size = e.rows
}

const { data, status, refresh } = await useFetch("/api/products-regions", { query: pagination });

const addStockDialog = useTemplateRef("addStockDialog")
const transferDialog = useTemplateRef("transferDialog")
</script>

<template>
    <DataTable v-bind="BaseDataTableProps" :value="data?.result || [] as any" :loading="status == 'pending'"
        :rows="pagination.page_size" :totalRecords="data?.total_rows || 0" @page="onPage">
        <template #empty>
            <p class="text-center">No data.</p>
        </template>

        <template #paginatorstart>
            <Button rounded icon="i-mynaui-refresh" size="small" :loading="status == 'pending'"
                @click="() => refresh()" />
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
        <Column field="stock_level" header="Stock Level">
            <template #body="{ data }">
                <span v-if="data.stock_level < StockLevelThreshold" class="font-bold text-rose-500">{{ data.stock_level
                    }}</span>
                <span v-else>{{ data.stock_level }}</span>
            </template>
        </Column>
        <Column>
            <template #body="{ data }">
                <div class="flex items-center gap-4">
                    <Button rounded size="small" label="Add stock" icon="i-mynaui-plus"
                        :severity="data.stock_level < StockLevelThreshold ? 'danger' : ''"
                        @click="addStockDialog?.showDialog(data.product_name, data.region.name, data.product_id, data.region.id)"
                    />

                    <Button rounded size="small" label="Transfer from" icon="i-mynaui-share"
                        :severity="data.stock_level < StockLevelThreshold ? 'warn' : 'help'"
                        @click="transferDialog?.showTDialog(data.product_name, data.region.name, data.product_id, data.region.id)"
                    />
                </div>
            </template>
        </Column>
    </DataTable>

    <!-- Add stock Dialog -->
    <AddStockDialog ref="addStockDialog" :restockCallback="refresh" />

    <!-- Transfer Dialog -->
    <TransferDialog ref="transferDialog" :transferCallback="refresh" />
</template>
