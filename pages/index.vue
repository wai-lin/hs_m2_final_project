<template>
    <main class="grid place-items-center h-screen">
        <article class="px-8 py-10 rounded-xl bg-slate-100 space-y-4">
            <h1 class="text-3xl font-bold flex items-end gap-4">
                <img src="/sustainable.png" class="size-10" />
                <span>Warehouse Management</span>
            </h1>

            <h2 class="text-2xl font-medium">
                This is the demo of realtime stock level tracker.
            </h2>

            <ol class="list-decimal list-inside">
                <li>Go to Orders page and click New Order.</li>
                <li>Open Dashboard in new tab.</li>
                <li>Try creating a new order to reduce the stock_level of the product below threshold limit.</li>
                <li>Try to restock the product over threshold limit.</li>
            </ol>

            <Button rounded label="Get Started" @click="$router.push('/dashboard')" />
        </article>
    </main>
</template>
