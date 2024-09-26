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

const restock_dialog = reactive({
    visible: false,
    product_name: "",
    region_name: "",
    product_id: "",
    region_id: "",
    stock_level: 0,
})
const isRestockLoading = ref(false);
function showRestockDialog(
    product_name: string,
    region_name: string,
    product_id: string,
    region_id: string,
    stock_level: number,
) {
    restock_dialog.visible = true
    restock_dialog.product_name = product_name
    restock_dialog.region_name = region_name
    restock_dialog.product_id = product_id
    restock_dialog.region_id = region_id
    restock_dialog.stock_level = stock_level
}
function hideRestockDialog() {
    restock_dialog.visible = false
    restock_dialog.product_name = ""
    restock_dialog.region_name = ""
    restock_dialog.product_id = ""
    restock_dialog.region_id = ""
    restock_dialog.stock_level = 0
}
async function restock() {
    isRestockLoading.value = true
    $fetch("/api/restock", {
        method: "PUT",
        body: {
            product_id: restock_dialog.product_id,
            region_id: restock_dialog.region_id,
            stock_level: restock_dialog.stock_level,
        }
    })
        .finally(() => {
            isRestockLoading.value = false
            hideRestockDialog()
            refresh()
        })
}
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
                <Button rounded size="small" label="Restock"
                    :severity="data.stock_level < StockLevelThreshold ? 'danger' : ''"
                    @click="showRestockDialog(data.product_name, data.region.name, data.product_id, data.region.id, data.stock_level)" />
            </template>
        </Column>
    </DataTable>

    <Dialog v-model:visible="restock_dialog.visible">
        <template #header>
            <h2>Restock {{ restock_dialog.product_name }} in {{ restock_dialog.region_name }}.</h2>
        </template>

        <InputNumber v-model="restock_dialog.stock_level" :min="1" />

        <template #footer>
            <Button label="Confirm" :loading="isRestockLoading" @click="restock" />
        </template>
    </Dialog>
</template>
