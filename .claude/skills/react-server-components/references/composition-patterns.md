# コンポジションパターン

> **相対パス**: `references/composition-patterns.md`
> **読み込み条件**: RSCコンポーネント構成設計時

---

## 1. Children Pattern

### 1.1 基本形

Server ComponentをClient Componentのchildrenとして渡す。

```tsx
// Server Component
async function Page() {
  const data = await fetchData();

  return (
    <Accordion>
      {/* Server Componentがchildrenとして渡される */}
      <DataDisplay data={data} />
    </Accordion>
  );
}

// Client Component
("use client");
function Accordion({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Toggle</button>
      {isOpen && children}
    </div>
  );
}

// Server Component（childrenとして渡される）
function DataDisplay({ data }) {
  return <div>{JSON.stringify(data)}</div>;
}
```

---

## 2. Slot Pattern

### 2.1 複数スロット

```tsx
// Server Component
async function Page() {
  const user = await fetchUser();
  const notifications = await fetchNotifications();

  return (
    <Layout
      header={<UserHeader user={user} />}
      sidebar={<NotificationList items={notifications} />}
      content={<MainContent />}
    />
  );
}

// Client Component
("use client");
function Layout({ header, sidebar, content }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="layout">
      <header>{header}</header>
      {sidebarOpen && <aside>{sidebar}</aside>}
      <main>{content}</main>
    </div>
  );
}
```

---

## 3. Render Props（制限付き）

### 3.1 Server → Clientでは使用不可

```tsx
// ❌ これは動かない
async function Page() {
  return (
    <ClientComponent
      render={(data) => <ServerContent data={data} />} // 関数は渡せない
    />
  );
}
```

### 3.2 Client内での使用は可

```tsx
// ✅ Client同士なら可能
"use client";
function Parent() {
  return (
    <Dropdown
      trigger={<Button>Open</Button>}
      content={(close) => <Menu onClose={close} />}
    />
  );
}
```

---

## 4. Provider Pattern

### 4.1 Context Provider配置

```tsx
// Client Component（Provider）
"use client";
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Layout（Server Component）
async function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children} {/* Server Componentsも含む */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 5. Composition vs Props

### 5.1 Props Drilling回避

```tsx
// ❌ Props Drilling
async function Page() {
  const user = await fetchUser();
  return (
    <Layout user={user}>
      <Content user={user} />
    </Layout>
  );
}

// ✅ Composition
async function Page() {
  const user = await fetchUser();
  return (
    <Layout>
      <UserInfo user={user} />
      <Content>
        <UserActions user={user} />
      </Content>
    </Layout>
  );
}
```

---

## 関連リソース

- **境界設計**: See [server-client-boundaries.md](server-client-boundaries.md)
- **基礎**: See [basics.md](basics.md)
