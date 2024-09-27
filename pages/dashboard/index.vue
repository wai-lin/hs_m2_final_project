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

const addStockDialog = useTemplateRef("addStockDialog")
const transferDialog = useTemplateRef("transferDialog")
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

                            <div class="flex items-center gap-2">
                                <Button rounded icon="i-mynaui-plus" title="Add Stock"
                                    @click="addStockDialog?.showDialog(product.name, region.name, product.id, region.id)" />

                                <Button rounded icon="i-mynaui-share" title="Add Stock" severity="warn"
                                    @click="() => transferDialog?.showTDialog(product.name, region.name, product.id, region.id)" />
                            </div>
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

        <AddStockDialog ref="addStockDialog" />

        <TransferDialog ref="transferDialog" />

    </section>
</template>
