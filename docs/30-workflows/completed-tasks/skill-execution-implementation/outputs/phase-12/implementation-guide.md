# スキル実行機能 実装ガイド

## 作成日

2026-01-18

---

## Part A: 概念ガイド

### 概要

スキル実行機能は、Agent画面からスキルを実行するための機能です。
ユーザーがスキル一覧からスキルを選択し、「実行」ボタンをクリックすることで
スキルが実行されます。

### 機能概要

| 機能       | 説明                                         |
| ---------- | -------------------------------------------- |
| スキル実行 | 選択したスキルをバックエンドで実行           |
| 状態管理   | 実行中はローディング状態を表示、完了後に通知 |
| エラー処理 | エラー発生時はエラーメッセージをトースト表示 |

### アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│ Renderer Process                                                │
│ ┌─────────────────────┐    ┌──────────────────────────────────┐│
│ │     AgentView       │───>│  skillAPI (renderer/preload)     ││
│ │ handleExecute       │    │  execute(skillId, params?)       ││
│ └─────────────────────┘    └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ IPC ("skill:execute")
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Main Process                                                    │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │  skillHandlers.ts                                            ││
│ │  - validateIpcSender (セキュリティ検証)                      ││
│ │  - 入力バリデーション                                        ││
│ │  - SkillService呼び出し                                      ││
│ └──────────────────────────────────────────────────────────────┘│
│                              │                                  │
│                              ▼                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │  SkillService.ts (Facade)                                    ││
│ │  - getSkillById (存在確認)                                   ││
│ │  - isImported (インポート確認)                               ││
│ │  - executeSkill (実行ロジック)                               ││
│ └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### データフロー

#### 正常系

1. ユーザーが「実行」ボタンをクリック
2. `skillAPI.execute(skillId)` が呼び出される
3. IPC経由で `skill:execute` ハンドラーに送信
4. `validateIpcSender` でセキュリティ検証
5. `SkillService.executeSkill()` でスキル実行
6. `OperationResult<SkillRunResult>` が返却される
7. 成功トーストを表示

#### 異常系

1. エラーが発生した場合
2. `{ success: false, error: "エラーメッセージ" }` が返却される
3. エラートーストを表示

### 使用方法

#### Renderer側（AgentView）

```typescript
const handleExecute = async () => {
  if (!selectedSkill) return;

  setIsExecuting(true);
  try {
    const result = await skillAPI.execute(selectedSkill.id);
    if (result.success) {
      showToast("success", "スキルを実行しました");
    } else {
      showToast("error", result.error || "実行に失敗しました");
    }
  } finally {
    setIsExecuting(false);
  }
};
```

#### ボタンの無効化

```tsx
<button disabled={isExecuting} onClick={handleExecute}>
  {isExecuting ? "実行中..." : "実行"}
</button>
```

### 制限事項

| 制限事項                 | 説明                               |
| ------------------------ | ---------------------------------- |
| 並列実行                 | 現在は直列実行のみ対応             |
| タイムアウト             | 未実装（将来の拡張として検討）     |
| 実行結果のストリーミング | 未対応（現在は完了後に結果を返却） |
| 実際のスキル実行ロジック | スタブ実装（成功結果を返却）       |

---

## Part B: 技術ガイド

### API仕様

#### skillAPI.execute

```typescript
/**
 * スキルを実行する
 * @param skillId 実行するスキルのID
 * @param params オプションパラメータ（将来拡張用）
 * @returns 実行結果
 */
execute: (skillId: string, params?: Record<string, unknown>) =>
  Promise<OperationResult<SkillRunResult>>;
```

**実装ファイル**: `apps/desktop/src/renderer/preload/index.ts`

### IPC Channel仕様

#### SKILL_EXECUTE

| 項目           | 値                                                      |
| -------------- | ------------------------------------------------------- |
| チャンネル名   | `skill:execute`                                         |
| 定数           | `IPC_CHANNELS.SKILL_EXECUTE`                            |
| リクエスト形式 | `{ skillId: string, params?: Record<string, unknown> }` |
| レスポンス形式 | `OperationResult<SkillRunResult>`                       |

**実装ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

### SkillService.executeSkill仕様

```typescript
/**
 * スキルを実行する
 * @param skillId 実行するスキルのID
 * @param _params オプションパラメータ（将来拡張用）
 * @returns 実行結果
 * @throws Error スキルが見つからない場合
 * @throws Error スキルがインポートされていない場合
 */
async executeSkill(
  skillId: string,
  _params?: Record<string, unknown>,
): Promise<SkillRunResult>
```

**実装ファイル**: `apps/desktop/src/main/services/skill/SkillService.ts`

### 型定義

#### SkillRunResult

```typescript
interface SkillRunResult {
  /** 実行ID（UUID） */
  executionId: string;

  /** 実行ステータス */
  status: "success" | "failed";

  /** 実行出力（成功時） */
  output?: string;

  /** エラーメッセージ（失敗時） */
  error?: string;

  /** 実行開始時刻 */
  startedAt: Date;

  /** 実行完了時刻 */
  completedAt: Date;
}
```

**定義ファイル**: `packages/shared/src/types/skill.ts`

### エラーハンドリング仕様

#### エラーコード

| エラー                           | 原因                           |
| -------------------------------- | ------------------------------ |
| スキルが見つかりません           | 指定されたskillIdが存在しない  |
| スキルがインポートされていません | スキルがインポートされていない |
| skillId must be a string         | skillIdが文字列でない/空文字   |

#### エラー伝播フロー

```
SkillService.executeSkill()
  → throw new Error("...")
    ↓
skillHandlers (IPC Handler)
  → catch(error)
  → return { success: false, error: error.message }
    ↓
skillAPI.execute()
  → OperationResult<SkillRunResult>
    ↓
AgentView
  → if (!result.success) showToast("error", result.error)
```

### セキュリティ考慮事項

#### IPC Sender検証

すべてのIPCハンドラーで `validateIpcSender` を使用してセキュリティを確保しています。

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

#### 入力バリデーション

```typescript
if (typeof args?.skillId !== "string" || args.skillId === "") {
  return { success: false, error: "skillId must be a string" };
}
```

### 統合テスト情報

#### テストファイル

| ファイル                        | 説明                 |
| ------------------------------- | -------------------- |
| `skillAPI.execute.test.ts`      | Preload API テスト   |
| `skillHandlers.execute.test.ts` | IPC Handler テスト   |
| `SkillService.execute.test.ts`  | Service Layer テスト |

#### 統合テストシナリオ

| TC-ID    | シナリオ             | 結果 |
| -------- | -------------------- | ---- |
| TC-6-010 | 完全な実行フロー     | PASS |
| TC-6-011 | 存在しないスキル実行 | PASS |
| TC-6-012 | 連続実行             | PASS |

---

## 関連ドキュメント

| ドキュメント     | パス                                            |
| ---------------- | ----------------------------------------------- |
| 要件定義         | `outputs/phase-1/functional-requirements.md`    |
| アーキテクチャ   | `outputs/phase-2/architecture.md`               |
| インターフェース | `outputs/phase-2/interface-design.md`           |
| テスト結果       | `outputs/phase-6/integration-test-scenarios.md` |
| 品質レポート     | `outputs/phase-9/quality-report.md`             |
