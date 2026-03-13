# Atoms コンポーネント実装パターンガイド / detail specification

> 親仕様書: [ui-ux-atoms-patterns.md](ui-ux-atoms-patterns.md)
> 役割: detail specification

## 5. 後方互換性パターン

### 5.1 Badge拡張（children → content/variant追加）

**既存コード**:
```typescript
<Badge>New</Badge>
<Badge className="bg-red-500">Error</Badge>
```

**拡張後も動作保証**:
```typescript
// 既存テストを変更せず全PASS維持
<Badge>New</Badge> // children優先
<Badge content={42} /> // 新しいcontent props
<Badge variant="error">Error</Badge> // 新しいvariant props
<Badge content={42}>カスタム</Badge> // children が優先される
```

**実装**:
```typescript
const displayContent = children ?? (content !== undefined ? String(content) : undefined);
```

### 5.2 EmptyState拡張（action Node/Object両形式サポート）

**既存コード**:
```typescript
<EmptyState title="データなし" action={<button onClick={handleAdd}>追加</button>} />
```

**拡張後の新形式**:
```typescript
<EmptyState
  title="データなし"
  action={{ label: "追加", onClick: handleAdd, variant: "primary" }}
/>
```

**実装**:
```typescript
{action && (
  <div className="mt-6">
    {typeof action === "object" && "label" in action ? (
      <Button variant={action.variant ?? "primary"} onClick={action.onClick}>
        {action.label}
      </Button>
    ) : (
      action
    )}
  </div>
)}
```

## 6. テスト戦略

### 6.1 テーマ横断テスト（describe.each）

**パターン**: 解決テーマ3種（`light` / `dark` / `kanagawa-dragon`）で同一のテストケースを実行し、`system` は解決結果に委譲する。

```typescript
describe.each(["light", "dark", "kanagawa-dragon"] as const)(
  "%s テーマ",
  (theme) => {
    beforeEach(() => {
      document.documentElement.setAttribute("data-theme", theme);
    });

    it("正しいvariantスタイルを適用する", () => {
      render(<Badge variant="success">Success</Badge>);
      const badge = screen.getByRole("status");
      expect(badge).toHaveClass("bg-[var(--status-success)]");
      // CSS変数の実際の値はthemeによって変わるが、クラス名は同一
    });
  },
);
```

### 6.2 タイマーテスト（useFakeTimers + advanceTimersByTime）

**パターン**: RelativeTime の自動更新テストでセクション3.5の知見を適用。

```typescript
beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-02-23T10:00:00Z") });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it("1分後に表示が更新される", () => {
  render(<RelativeTime timestamp="2026-02-23T09:58:00Z" refreshInterval={60000} />);

  expect(screen.getByText("2分前")).toBeInTheDocument();

  act(() => {
    vi.advanceTimersByTime(60000); // 1分進める
  });

  expect(screen.getByText("3分前")).toBeInTheDocument();
});
```

### 6.3 アクセシビリティテスト（role, aria-label検証）

**パターン**: `getByRole` + `toHaveAttribute` でARIA属性を検証。

```typescript
it("aria-label を正しく設定する", () => {
  render(<StatusIndicator status="running" label="エージェント実行中" />);
  const indicator = screen.getByRole("status");
  expect(indicator).toHaveAttribute("aria-label", "エージェント実行中");
});

it("numberコンテンツの場合、件数をaria-labelに付与する", () => {
  render(<Badge content={42} />);
  const badge = screen.getByRole("status");
  expect(badge).toHaveAttribute("aria-label", "42件");
});
```

## 7. Molecules/Organisms実装への推奨事項

### 7.1 Props駆動を可能な限り維持

Molecules層でもStoreへの直接依存を最小化し、Organisms層に集約する。

```typescript
// ✅ Molecules: Props駆動
const AgentMessageInput: React.FC<{ message: string; onChange: (v: string) => void }> = ({ message, onChange }) => {
  return <Input value={message} onChange={e => onChange(e.target.value)} />;
};

// ✅ Organisms: Store統合
const ChatPanel: React.FC = () => {
  const message = useChatMessage();
  const setMessage = useSetChatMessage();
  return <AgentMessageInput message={message} onChange={setMessage} />;
};
```

### 7.2 Atoms依存はdata props経由で疎結合化

Moleculesは複数のAtomsを組み合わせるが、Atomsの内部実装に依存しない。

```typescript
// ✅ 疎結合
const SkillCard: React.FC<{ name: string; status: StatusType }> = ({ name, status }) => {
  return (
    <div>
      <StatusIndicator status={status} />
      <span>{name}</span>
    </div>
  );
};

// ❌ 密結合（非推奨）
const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
  // Atomsの内部実装（status文字列形式）に依存
  const statusMap = { 0: "idle", 1: "running", 2: "success" };
  return <StatusIndicator status={statusMap[skill.statusCode]} />;
};
```

