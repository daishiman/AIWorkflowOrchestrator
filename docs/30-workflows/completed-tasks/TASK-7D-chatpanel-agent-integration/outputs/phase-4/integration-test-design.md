# 統合テスト設計

## テスト戦略

モックベースのコンポーネント統合テスト。子コンポーネントはvi.mockでモック化し、ChatPanel→子コンポーネントのProps渡しと表示制御を検証する。

## 統合テストシナリオ

### 1. データフローテスト

| シナリオ       | Store状態                      | 検証                                       |
| -------------- | ------------------------------ | ------------------------------------------ |
| スキル名伝搬   | selectedSkillName="test-skill" | SkillStreamingViewに"test-skill"が渡される |
| メッセージ伝搬 | streamingMessages=[...]        | SkillStreamingViewにmessagesが渡される     |
| ステータス伝搬 | skillExecutionStatus="running" | SkillStreamingViewにstatusが渡される       |

### 2. コンポーネント連携テスト

| シナリオ       | トリガー                      | 検証                          |
| -------------- | ----------------------------- | ----------------------------- |
| インポート要求 | SkillSelector.onImportRequest | SkillImportDialogが表示される |
| ダイアログ閉じ | SkillImportDialog.onClose     | ダイアログが非表示になる      |
| 権限ダイアログ | pendingPermission設定         | PermissionDialogが自動表示    |

### 3. 状態遷移テスト

| 初期状態          | 変更                                       | 期待UI                   |
| ----------------- | ------------------------------------------ | ------------------------ |
| isExecuting=false | isExecuting=true, selectedSkillName="test" | SkillStreamingView表示   |
| isExecuting=true  | isExecuting=false                          | SkillStreamingView非表示 |

### 4. エラーハンドリングテスト

| シナリオ         | 状態                       | 検証                     |
| ---------------- | -------------------------- | ------------------------ |
| エラーメッセージ | streamingMessages含error型 | エラーメッセージ赤色表示 |
| tool_result失敗  | success=false              | ❌表示                   |

## モック構成

```typescript
// 子コンポーネントモック
vi.mock("../skill/SkillSelector", () => ({ SkillSelector: vi.fn() }));
vi.mock("../skill/SkillImportDialog", () => ({ SkillImportDialog: vi.fn() }));
vi.mock("../skill/PermissionDialog", () => ({ PermissionDialog: vi.fn() }));
vi.mock("../skill/SkillStreamingView", () => ({ SkillStreamingView: vi.fn() }));

// Storeモック
vi.mock("../../store", () => ({ useAppStore: vi.fn() }));
```
