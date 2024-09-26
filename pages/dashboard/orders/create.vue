<script setup lang="ts">
definePageMeta({
    title: "Create new Order"
})
const router = useRouter();

const selectedRegion = ref()
const { data: regions } = await useFetch("/api/regions", {
    query: { page_size: 100 },
    default: () => [],
    transform(resp) {
        return resp.result?.map((r) => ({ region_id: r.id, region_name: r.name }))
    },
})

const selectedCustomer = ref()
const { data: customers } = useFetch("/api/customers", {
    query: { page_size: 100 },
    default: () => [],
    transform(resp) {
        return resp.result?.map((c) => ({ customer_id: c.id, customer_name: c.name }))
    },
})

const selectedProduct = ref()
const { data: products } = useFetch("/api/products", {
    query: { page_size: 100 },
    default: () => [],
    transform(resp) {
        return resp.result?.map((p) => ({ product_id: p.id, product_name: p.name }))
    },
})

const selectedProducts = reactive(new Map<string, { name: string, quantity: number }>())
watch(selectedProduct, (p) => {
    if (p && p.product_id) {
        const eV = selectedProducts.get(p.product_id)
        const v = { name: p.product_name, quantity: 1 }
        selectedProducts.set(p.product_id, { ...v, ...eV })
    }
})

const requestData = computed(() => {
    const order_list: Array<{ product_id: string, quantity: number }> = []
    for (const [id, { quantity }] of selectedProducts.entries()) {
        order_list.push({ product_id: id, quantity })
    }
    return {
        region_id: selectedRegion.value?.region_id,
        customer_id: selectedCustomer.value?.customer_id,
        order_list,
    }
})
const isCreateOrderLoading = ref(false);
async function createOrder() {
    isCreateOrderLoading.value = true
    $fetch("/api/orders", { method: "POST", body: requestData.value })
        .then((res) => {
            if (res.msg == "Successfully received order.")
                router.push("/dashboard/orders")
        })
        .finally(() => isCreateOrderLoading.value = false)
}
</script>

<template>
    <article class="max-w-[50%] mx-auto mt-4 space-y-4">
        <div class="flex flex-col gap-2">
            <label>Region</label>
            <Select v-model="selectedRegion" :options="regions" optionLabel="region_name" />
        </div>
        <div class="flex flex-col gap-2">
            <label>Customer</label>
            <Select v-model="selectedCustomer" :options="customers" optionLabel="customer_name" />
        </div>
        <div class="flex flex-col gap-2">
            <label>Products</label>
            <Select v-model="selectedProduct" :options="products" optionLabel="product_name" showClear editable />

            <section class="flex flex-col gap-4 p-4 bg-slate-100 rounded-xl">
                <article v-for="[id, { name }] in selectedProducts" :key="id" class="py-2 border-b border-slate-300">
                    <h3 class="text-base font-bold">{{ name }}</h3>
                    <div class="flex items-center gap-4">
                        <InputNumber :modelValue="selectedProducts.get(id)?.quantity" v-on:update:modelValue="(v) => {
                            const eV = selectedProducts.get(id)
                            if (!eV) return
                            selectedProducts.set(id, { ...eV, quantity: v })
                        }" />
                        <Button icon="i-mynaui-trash" rounded @click="selectedProducts.delete(id)" />
                    </div>
                </article>
            </section>
        </div>

        <Button label="Create Order" :loading="isCreateOrderLoading" @click="() => createOrder()" />
    </article>
</template>
