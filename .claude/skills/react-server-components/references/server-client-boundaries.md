# Server/Client境界設計

> **相対パス**: `references/server-client-boundaries.md`
> **読み込み条件**: コンポーネント境界設計時

---

## 1. 境界の原則

### 1.1 `'use client'` ディレクティブ

| 配置場所     | 影響範囲                               |
| ------------ | -------------------------------------- |
| ファイル先頭 | そのファイル内全コンポーネントがClient |
| 親に配置     | 子コンポーネントも全てClient化         |

### 1.2 境界の決定基準

```
Server Component (デフォルト)
       │
       ▼
┌──────────────────┐
│  'use client'    │  ← ここで境界を引く
│  ディレクティブ   │
└──────────────────┘
       │
       ▼
Client Component以降
```

---

## 2. パターン

### 2.1 境界を下げる

できるだけ末端でClient化し、Server Componentの範囲を最大化。

```tsx
// ❌ 悪い例：親でClient化
"use client";
function Page() {
  const [filter, setFilter] = useState("");
  return (
    <div>
      <Header /> {/* 本当はServerでいい */}
      <FilterInput value={filter} onChange={setFilter} />
      <List filter={filter} />
    </div>
  );
}

// ✅ 良い例：必要な部分のみClient化
function Page() {
  return (
    <div>
      <Header /> {/* Server Component */}
      <FilterableList /> {/* この中だけClient */}
    </div>
  );
}

("use client");
function FilterableList() {
  const [filter, setFilter] = useState("");
  return (
    <>
      <FilterInput value={filter} onChange={setFilter} />
      <List filter={filter} />
    </>
  );
}
```

### 2.2 Children Pattern

Server ComponentをClient Componentの子として渡す。

```tsx
// Server Component
async function Page() {
  const data = await fetchData();

  return (
    <ClientWrapper>
      {/* Server Componentをchildrenとして渡す */}
      <ServerContent data={data} />
    </ClientWrapper>
  );
}

// Client Component
("use client");
function ClientWrapper({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && children}
    </div>
  );
}
```

---

## 3. 避けるべきパターン

### 3.1 Propsとしての関数渡し

```tsx
// ❌ Server → Client に関数は渡せない
async function Page() {
  async function handleSubmit() {
    // サーバーの関数
  }

  return <ClientForm onSubmit={handleSubmit} />; // エラー
}

// ✅ Server Actionsを使う
async function Page() {
  async function handleSubmit(formData: FormData) {
    "use server";
    // Server Action
  }

  return <ClientForm action={handleSubmit} />;
}
```

### 3.2 不必要なClient化

```tsx
// ❌ 静的コンテンツをClient化
"use client";
function StaticInfo() {
  return <p>This is static content</p>; // Clientにする必要なし
}

// ✅ Server Componentのまま
function StaticInfo() {
  return <p>This is static content</p>;
}
```

---

## 関連リソース

- **基礎**: See [basics.md](basics.md)
- **構成パターン**: See [composition-patterns.md](composition-patterns.md)
