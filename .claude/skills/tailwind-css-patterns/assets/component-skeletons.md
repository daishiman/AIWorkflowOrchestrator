# コンポーネント骨組み

## Header
```html
<header class="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
  <div class="text-base font-semibold">Product</div>
  <nav class="flex items-center gap-4 text-sm text-neutral-600">
    <a class="hover:text-neutral-900" href="#">Docs</a>
    <a class="hover:text-neutral-900" href="#">Pricing</a>
  </nav>
</header>
```

## Sidebar
```html
<aside class="w-64 border-r border-neutral-200 bg-neutral-50 p-4">
  <div class="text-xs font-semibold uppercase text-neutral-500">Menu</div>
  <ul class="mt-3 space-y-2 text-sm">
    <li class="text-neutral-900">Dashboard</li>
    <li class="text-neutral-600">Settings</li>
  </ul>
</aside>
```
