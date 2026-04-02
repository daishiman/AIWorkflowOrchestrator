# Phase 2: GovernanceSummaryPanel UI 設計書

作成日: 2026-04-02

## コンポーネント仕様

**ファイル**: `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`

### Props

```typescript
// Props なし（自己完結型コンポーネント）
// データは IPC ポーリングで取得
```

### 内部状態

```typescript
const [state, setState] = useState<SkillCreatorGovernanceState | null>(null);
const [error, setError] = useState<string | null>(null);
```

### データ取得方法

- `window.electronAPI.skillCreator.getGovernanceState()` を IPC 経由で呼び出す
- `useEffect` + `setInterval(fetchState, 5_000)` でポーリング
- クリーンアップ: `return () => clearInterval(id)`

### 表示要素

| 要素               | data-testid                  | 説明                                |
| ------------------ | ---------------------------- | ----------------------------------- |
| コンテナ           | `governance-panel`           | 全体ラッパー                        |
| フェーズ           | `governance-phase`           | `state.phase`                       |
| 許可モード         | `governance-permission-mode` | `state.activePolicy.permissionMode` |
| 拒否リスト         | `governance-denials`         | `recentDenials` 最大5件             |
| 拒否なし表示       | `governance-no-denials`      | "No recent denials"                 |
| セッションサマリー | `governance-session-summary` | audit event 数                      |
| ローディング       | `governance-loading`         | データ未取得時                      |
| エラー             | `governance-error`           | IPC 取得失敗時                      |

### 配置先

`AdvancedSettingsPanel.tsx` のパネル末尾に `<GovernanceSummaryPanel />` を追加。

- 既存 Props に変更なし
- `GovernanceSummaryPanel` は自己完結型のため統合が容易

### POLL_INTERVAL_MS 定数

```typescript
const POLL_INTERVAL_MS = 5_000;
```
