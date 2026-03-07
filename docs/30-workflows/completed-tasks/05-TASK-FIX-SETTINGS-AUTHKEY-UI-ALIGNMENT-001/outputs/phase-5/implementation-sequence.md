# Phase 5: 実装順序

## メタ情報

| 項目   | 内容                                          |
| ------ | --------------------------------------------- |
| Phase  | 5                                             |
| 機能名 | 05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| 作成日 | 2026-03-06                                    |

## 実装順序

### Step 1: AuthKeySection コンポーネント作成

- ファイル: `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`
- 内容: authKey 専用入力・保存・削除・4状態表示
- 依存: window.electronAPI.authKey (既存 Preload API)

### Step 2: AuthKeySection テスト作成

- ファイル: `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx`
- 内容: 10テストケース（TC-AKS-001〜010）

### Step 3: SettingsView 統合

- ファイル: `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- 変更: AuthKeySection の import と条件付き表示追加
- 条件: `authMode === "api-key"` の時のみ表示

### Step 4: SettingsView 統合テスト追加

- ファイル: `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`
- 追加: 3テストケース（TC-SV-INT-001〜003）
