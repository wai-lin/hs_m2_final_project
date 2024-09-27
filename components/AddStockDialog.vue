<script setup lang="ts">
const props = defineProps<{ restockCallback?: () => void }>()

const add_stock_dialog = reactive({
    visible: false,
    product_name: "",
    region_name: "",
    product_id: "",
    region_id: "",
    stock_level: 0,
})
const isAddStockLoading = ref(false);
function showDialog(
    product_name: string,
    region_name: string,
    product_id: string,
    region_id: string,
) {
    add_stock_dialog.visible = true
    add_stock_dialog.product_name = product_name
    add_stock_dialog.region_name = region_name
    add_stock_dialog.product_id = product_id
    add_stock_dialog.region_id = region_id
    add_stock_dialog.stock_level = 0
}
function hideDialog() {
    add_stock_dialog.visible = false
    add_stock_dialog.product_name = ""
    add_stock_dialog.region_name = ""
    add_stock_dialog.product_id = ""
    add_stock_dialog.region_id = ""
    add_stock_dialog.stock_level = 0
}
async function addStock() {
    isAddStockLoading.value = true
    $fetch("/api/add-stock", {
        method: "PUT",
        body: {
            product_id: add_stock_dialog.product_id,
            region_id: add_stock_dialog.region_id,
            stock_level: add_stock_dialog.stock_level,
        }
    })
        .finally(() => {
            isAddStockLoading.value = false
            hideDialog()
            if (props.restockCallback) props.restockCallback()
        })
}

defineExpose({
    showDialog,
    hideDialog,
})
</script>

<template>
    <Dialog v-model:visible="add_stock_dialog.visible" modal>
        <template #header>
            <h2>Add stock {{ add_stock_dialog.product_name }} in {{ add_stock_dialog.region_name }}.</h2>
        </template>

        <InputNumber v-model="add_stock_dialog.stock_level" :min="1" />

        <template #footer>
            <Button label="Confirm" :loading="isAddStockLoading" @click="addStock" />
        </template>
    </Dialog>
</template>
