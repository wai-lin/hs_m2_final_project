<script setup lang="ts">
const props = defineProps<{ transferCallback?: () => void }>()

const transfer_dialog = reactive({
    visible: false,
    product_name: "",
    region_name: "",
    product_id: "",
    from_region_id: "",
    to_region_id: "",
    stock_level: 0,
})

const { data, refresh } = await useFetch("/api/products-regions", {
    immediate: false,
    watch: [transfer_dialog],
    query: {
        page_size: 100,
        over_threshold: true,
        product_id: transfer_dialog.product_id
    },
    transform(res) {
        return res.result?.map(({ product_id, region, stock_level }) => ({
            product_id,
            region_id: region.id,
            label: `${region.name} - (${stock_level})`
        }));
    }
})

const selectedProduct = ref()
watch(selectedProduct, (sp) => {
    if (sp && sp.region_id) transfer_dialog.from_region_id = sp.region_id
})

const isTransferLoading = ref(false);
function showTDialog(
    product_name: string,
    region_name: string,
    product_id: string,
    to_region_id: string,
) {
    console.log("Called", {
        product_name,
        region_name,
        product_id,
        to_region_id,
    })
    transfer_dialog.visible = true
    transfer_dialog.product_name = product_name
    transfer_dialog.region_name = region_name
    transfer_dialog.product_id = product_id
    transfer_dialog.to_region_id = to_region_id
    refresh()
}
function hideDialog() {
    transfer_dialog.product_name = ""
    transfer_dialog.visible = false
    transfer_dialog.region_name = ""
    transfer_dialog.product_id = ""
    transfer_dialog.from_region_id = ""
    transfer_dialog.to_region_id = ""
    transfer_dialog.stock_level = 0
}
async function transfer() {
    isTransferLoading.value = true
    $fetch("/api/transfer-stock", {
        method: "PUT",
        body: {
            product_id: transfer_dialog.product_id,
            from_region_id: transfer_dialog.from_region_id,
            to_region_id: transfer_dialog.to_region_id,
            stock_level: transfer_dialog.stock_level,
        }
    })
        .finally(() => {
            isTransferLoading.value = false
            hideDialog()
            if (props.transferCallback) props.transferCallback()
        })
}

defineExpose({
    showTDialog,
    hideDialog,
})
</script>

<template>
    <Dialog v-model:visible="transfer_dialog.visible" modal>
        <template #header>
            <h2>Transfer {{ transfer_dialog.product_name }} in {{ transfer_dialog.region_name }} from.</h2>
        </template>

        <article class="flex flex-col gap-4">
            <div class="flex flex-col gap-2">
                <label>Select region to transfer from.</label>
                <Select v-model="selectedProduct" :options="data || []" optionLabel="label" showClear />
            </div>


            <div class="flex flex-col gap-2">
                <label>No of stocks to transfer.</label>
                <InputNumber v-model="transfer_dialog.stock_level" :min="1" />
            </div>
        </article>

        <template #footer>
            <Button label="Confirm" :loading="isTransferLoading" @click="transfer" />
        </template>
    </Dialog>
</template>
