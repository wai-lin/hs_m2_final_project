<script setup lang="ts">
import dayjs from 'dayjs';
import type { Threshold } from '~/utils/threshold';

const thresholds = ref<Threshold[]>([])
const { data: th } = await useFetch("/api/threshold")
onMounted(() => {
    thresholds.value = th.value as Threshold[]
})

// Realtime with SSE
onMounted(() => {
    const eventSource = new EventSource('/threshold-sse')

    eventSource.onmessage = (event) => {
        const th = JSON.parse(event.data || []) as Threshold[]
        thresholds.value = th
    }
})

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
        })
}
</script>

<template>
    <section class="p-4">
        <h3 class="my-4 text-2xl font-bold">
            <span>Products below Threshold</span>

            <span class="text-rose-500">
                ({{ StockLevelThreshold }})
            </span>
        </h3>


        <ClientOnly>
            <article class="grid grid-cols-3 gap-4 bg-slate-100 p-4 rounded-lg">
                <Card v-for="{ product, region, stock_level, updated_at } in thresholds"
                    :key="`${product.id}||${region.id}`">
                    <template #title>
                        <div class="flex items-center justify-between">
                            <span>{{ product.name }}</span>

                            <Button rounded icon="i-mynaui-corner-right-up"
                                @click="showRestockDialog(product.name, region.name, product.id, region.id, stock_level)" />
                        </div>
                    </template>

                    <template #subtitle>
                        <p class="text-base">
                            <span>Stock Level: </span>
                            <span class="font-bold text-rose-500">{{ stock_level }}</span>
                        </p>
                    </template>

                    <template #content>
                        <p>
                            <span class="text-rose-500 font-bold">
                                {{ region.name }}
                            </span>
                            <span> ({{ region.timezone }})</span>
                        </p>
                        <p>
                            <span class="text-slate-500">Updated At : </span>
                            <span>{{ dayjs(updated_at).format("DD, MMM YYYY (HH:mm:ss)") }}</span>
                        </p>
                    </template>
                </Card>
            </article>
        </ClientOnly>

        <Dialog v-model:visible="restock_dialog.visible">
            <template #header>
                <h2>Restock {{ restock_dialog.product_name }} in {{ restock_dialog.region_name }}.</h2>
            </template>

            <InputNumber v-model="restock_dialog.stock_level" :min="1" />

            <template #footer>
                <Button label="Confirm" :loading="isRestockLoading" @click="restock" />
            </template>
        </Dialog>

    </section>
</template>
