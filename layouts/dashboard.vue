<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';

const asideMenu = ref<MenuItem[]>([
    {
        key: "aside_regions",
        label: "Regions",
        to: "/dashboard/regions",
        icon: "i-mynaui-location-home",
    },
    {
        key: "aside_products",
        label: "Products",
        to: "/dashboard/products",
        icon: "i-mynaui-package",
    },
    {
        key: "aside_orders",
        label: "Orders",
        to: "/dashboard/orders",
        icon: "i-mynaui-list-check",
    },
    {
        key: "aside_customers",
        label: "Customers",
        to: "/dashboard/customers",
        icon: "i-mynaui-users-group",
    },
    {
        key: "aside_stock_logs",
        label: "Stock Logs",
        to: "/dashboard/stock-logs",
        icon: "i-mynaui-file-text",
    },
])
</script>

<template>
    <section class="mx-auto max-w-[1920px] grid grid-cols-[20rem,1fr]">
        <aside class="p-4 h-screen max-h-screen overflow-y-auto border-r border-slate-500">
            <article class="mb-4 border-b border-slate-500 p-4 flex items-end gap-4 h-16">
                <img src="/favicon.png" alt="" class="size-10" />
                <h3 class="text-xl font-bold">Warehouse Manager</h3>
            </article>

            <PanelMenu :model="asideMenu">
                <template #item="{ item }">
                    <NuxtLink v-if="item.to" :to="item.to" class="px-4 py-2 w-full flex items-center gap-2"
                        active-class="text-blue-700">
                        <i v-if="item.icon" :class="item.icon" class="size-8"></i>
                        <span>{{ item.label }}</span>
                    </NuxtLink>

                    <p v-else class="px-4 py-2 w-full flex items-center gap-2">
                        <i v-if="item.icon" :class="item.icon" class="size-8"></i>
                        <span>{{ item.label }}</span>
                    </p>
                </template>
            </PanelMenu>
        </aside>

        <article class="pt-4 px-4">
            <header class="mb-4 border-b border-slate-500 p-4 flex items-end justify-between h-16">
                <h2 class="text-2xl font-bold">Hola !</h2>

                <Avatar src="https://picsum.photos/200" size="large" shape="circle" />
            </header>

            <slot />
        </article>
    </section>
</template>

<style>
.p-panelmenu-panel {
    border: 0 !important;
}
</style>