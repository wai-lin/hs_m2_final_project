<script setup lang="ts">
import type { MenuItem } from 'primevue/menuitem';

const asideMenu = ref<MenuItem[]>([
    {
        key: "aside_dashboard",
        label: "Dashboard",
        to: "/dashboard",
        icon: "i-mynaui-box",
    },
    {
        key: "aside_regions",
        label: "Regions",
        to: "/dashboard/regions",
        icon: "i-mynaui-map",
    },
    {
        key: "aside_products",
        label: "Products",
        to: "/dashboard/products",
        icon: "i-mynaui-package",
    },
    {
        key: "aside_products_in_regions",
        label: "Products in Regions",
        to: "/dashboard/products-in-regions",
        icon: "i-mynaui-location-home",
    },
    {
        key: "aside_customers",
        label: "Customers",
        to: "/dashboard/customers",
        icon: "i-mynaui-users-group",
    },
    {
        key: "aside_orders",
        label: "Orders",
        to: "/dashboard/orders",
        icon: "i-mynaui-list-check",
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
    <section class="relative mx-auto max-w-[1920px] grid grid-cols-[20rem,1fr]">
        <aside class="p-4 h-screen max-h-screen overflow-y-auto border-r border-slate-500">
            <article class="mb-4 border-b border-slate-500 p-4 flex items-end gap-4 h-16">
                <img src="/favicon.png" alt="" class="size-10" />
                <h3 class="text-xl font-bold">Warehouse Manager</h3>
            </article>

            <PanelMenu :model="asideMenu">
                <template #item="{ item }">
                    <NuxtLink v-if="item.to" :to="item.to" class="px-4 py-2 w-full flex items-center gap-2"
                        :activeClass="item.to != '/dashboard' ? 'text-green-600' : ''"
                        :exactActiveClass="item.to == '/dashboard' ? 'text-green-600' : ''">
                        <i v-if="item.icon" :class="item.icon" class="size-8"></i>
                        <span class="font-bold">{{ item.label }}</span>
                    </NuxtLink>

                    <p v-else class="px-4 py-2 w-full flex items-center gap-2">
                        <i v-if="item.icon" :class="item.icon" class="size-8"></i>
                        <span class="font-bold">{{ item.label }}</span>
                    </p>
                </template>
            </PanelMenu>
        </aside>

        <article class="pt-4 px-4 grid grid-cols-1 grid-rows-[4rem_calc(100vh-4rem)]">
            <header class="mb-4 border-b border-slate-500 p-4 flex items-end justify-between h-16">
                <h2 class="text-2xl font-bold">{{ $route.meta.title || "Dashboard" }}</h2>

                <ButtonGroup>
                    <Button v-if="$route.meta.actions == 'orders'" rounded label="New Order" size="small"
                        @click="$router.push('/dashboard/orders/create')" />
                </ButtonGroup>
            </header>

            <main class="overflow-auto pb-10">
                <slot />
            </main>
        </article>
    </section>
</template>

<style>
.p-panelmenu-panel {
    border: 0 !important;
}
</style>