# AgentView設計 - スキル実行機能

## Phase 2 - タスク5: AgentView設計

### 作成日

2026-01-18

---

## handleExecute 実装設計

### 現状の実装（未実装）

```typescript
// apps/desktop/src/renderer/views/AgentView/index.tsx

const handleExecute = useCallback((skill: Skill) => {
  // TODO: Implement skill execution
  console.log("Execute skill:", skill.name);
}, []);
```

### 実装後の設計

```typescript
const handleExecute = useCallback(
  async (skill: Skill) => {
    // 1. 実行中状態をセット
    setExecutingSkillId(skill.id);

    try {
      // 2. スキル実行API呼び出し
      const result = await skillAPI.execute(skill.id);

      // 3. 結果に応じてトースト表示
      if (result.success) {
        showToast("success", `${skill.name} を実行しました`);
      } else {
        showToast("error", `実行に失敗しました: ${result.error}`);
      }
    } catch (error) {
      // 4. 例外発生時のエラーハンドリング
      showToast(
        "error",
        error instanceof Error
          ? `実行に失敗しました: ${error.message}`
          : "実行に失敗しました",
      );
    } finally {
      // 5. 実行中状態をクリア
      setExecutingSkillId(null);
    }
  },
  [showToast],
);
```

---

## 実行中状態管理

### 新規State追加

```typescript
// 実行中のスキルIDを管理
const [executingSkillId, setExecutingSkillId] = useState<string | null>(null);
```

### 状態遷移

```
┌──────────────────┐
│ executingSkillId │
│      = null      │
└────────┬─────────┘
         │ handleExecute(skill)
         ▼
┌──────────────────┐
│ executingSkillId │
│   = skill.id     │
└────────┬─────────┘
         │ 実行完了（成功/失敗/例外）
         ▼
┌──────────────────┐
│ executingSkillId │
│      = null      │
└──────────────────┘
```

---

## UI状態とトースト通知

### 実行ボタンの状態

| 状態   | ボタン表示       | disabled |
| ------ | ---------------- | -------- |
| 通常   | "実行"           | false    |
| 実行中 | ローディング表示 | true     |

### トースト通知パターン

| 結果 | トースト種別 | メッセージ例                           |
| ---- | ------------ | -------------------------------------- |
| 成功 | success      | "{スキル名} を実行しました"            |
| 失敗 | error        | "実行に失敗しました: {エラー詳細}"     |
| 例外 | error        | "実行に失敗しました: {例外メッセージ}" |

---

## SkillDetailPanel への Props 変更

### 現状のProps

```typescript
interface SkillDetailPanelProps {
  skill: Skill;
  onExecute: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
  onClose: () => void;
  className?: string;
}
```

### 変更後のProps（isExecuting追加）

```typescript
interface SkillDetailPanelProps {
  skill: Skill;
  onExecute: (skill: Skill) => void;
  onDelete: (skill: Skill) => void;
  onClose: () => void;
  isExecuting?: boolean; // 【追加】実行中状態
  className?: string;
}
```

---

## AgentView からの呼び出し変更

### 現状

```tsx
<SkillDetailPanel
  skill={selectedSkill}
  onExecute={handleExecute}
  onDelete={handleDelete}
  onClose={handleCloseDetail}
  className={...}
/>
```

### 変更後

```tsx
<SkillDetailPanel
  skill={selectedSkill}
  onExecute={handleExecute}
  onDelete={handleDelete}
  onClose={handleCloseDetail}
  isExecuting={executingSkillId === selectedSkill.id}  // 【追加】
  className={...}
/>
```

---

## SkillDetailPanel 内の実行ボタン設計

### 実行ボタンコンポーネント

```tsx
// 実行ボタン
<button
  type="button"
  onClick={() => onExecute(skill)}
  disabled={isExecuting}
  className={clsx(
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
    isExecuting
      ? "bg-gray-600 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700",
  )}
>
  {isExecuting ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      実行中...
    </>
  ) : (
    <>
      <Play className="h-4 w-4" />
      実行
    </>
  )}
</button>
```

---

## 完全なフロー図

```
┌──────────────────────────────────────────────────────────────────┐
│                        AgentView                                 │
│                                                                  │
│  ┌────────────────┐                                              │
│  │ スキル選択     │                                              │
│  │ selectedSkill  │─────────────────────────┐                    │
│  └────────────────┘                         │                    │
│                                             ▼                    │
│                                  ┌──────────────────────┐        │
│                                  │ SkillDetailPanel     │        │
│                                  │                      │        │
│                                  │ ┌────────────────┐   │        │
│                                  │ │ 実行ボタン    │   │        │
│                                  │ │ disabled=     │   │        │
│                                  │ │ isExecuting   │   │        │
│                                  │ └───────┬────────┘   │        │
│                                  └─────────┼────────────┘        │
│                                            │ click               │
│                                            ▼                     │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ handleExecute(skill)                                    │     │
│  │ 1. setExecutingSkillId(skill.id)                        │     │
│  │ 2. await skillAPI.execute(skill.id)                     │     │
│  │ 3. showToast(result)                                    │     │
│  │ 4. setExecutingSkillId(null)                            │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌────────────────┐                                              │
│  │ Toast          │ ← 成功: "スキルを実行しました"               │
│  │ (success/error)│ ← 失敗: "実行に失敗しました: ..."            │
│  └────────────────┘                                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 必要なインポート追加

```typescript
// lucide-react のアイコン（必要に応じて）
import { Loader2, Play } from "lucide-react";
```

---

## テスト観点

| テストケース       | 期待される結果                     |
| ------------------ | ---------------------------------- |
| 実行ボタンクリック | handleExecute が呼ばれる           |
| 実行中のボタン状態 | disabled になる                    |
| 実行中のボタン表示 | ローディングアイコン + "実行中..." |
| 実行成功時         | 成功トーストが表示される           |
| 実行失敗時         | エラートーストが表示される         |
| 実行完了後         | ボタンが再度有効化される           |

---

## 完了確認

- [x] handleExecute の実装設計
- [x] executingSkillId 状態管理の設計
- [x] トースト通知パターンの設計
- [x] SkillDetailPanel への Props 変更設計
- [x] 実行ボタンUIの設計
- [x] フロー図の作成
- [x] テスト観点の定義
- [x] outputs/phase-2/agent-view-design.md に出力
