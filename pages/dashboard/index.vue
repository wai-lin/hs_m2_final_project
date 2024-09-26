<script setup lang="ts">
// Realtime with SSE
</script>

<template>
    <section class="p-4">
        <h3 class="my-4 text-2xl font-bold">Products below Threshold</h3>
        
        <article class="grid grid-cols-3 gap-4 bg-slate-100 p-4 rounded-lg">
            <Card>
                <template #title>OK</template>
                <template #subtitle>123</template>
            </Card>
            <Card>
                <template #title>GE</template>
                <template #subtitle>341</template>
            </Card>
            <Card>
                <template #title>LEF</template>
                <template #subtitle>523</template>
            </Card>
            <Card>
                <template #title>FEE</template>
                <template #subtitle>4314</template>
            </Card>
        </article>
    </section>
</template>
