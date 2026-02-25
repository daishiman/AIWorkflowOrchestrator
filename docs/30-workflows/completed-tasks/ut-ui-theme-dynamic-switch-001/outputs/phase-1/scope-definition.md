# Phase 1 スコープ定義

- タスクID: UT-UI-THEME-DYNAMIC-SWITCH-001
- 作成日: 2026-02-25
- 担当: SubAgent-D

## スコープ内

- `apps/desktop/src/renderer/store/slices/settingsSlice.ts` のテーマ状態管理
- `apps/desktop/src/main/ipc/themeHandlers.ts` のテーマIPC
- `apps/desktop/src/preload/types.ts` の型契約
- `apps/desktop/src/renderer/views/SettingsView/index.tsx` のテーマ設定導線
- `apps/desktop/src/renderer/components/molecules/ThemeSelector/*`
- 関連ユニットテスト/コンポーネントテスト

## スコープ外

- `tokens.css` の配色再設計
- 新規テーマ種別の追加
- Tailwind統合
- PR作成・コミット

## 依存関係

- 先行成果: TASK-UI-00-TOKENS（テーマトークン）
- 規約: P31（Store合成Hook由来の無限ループ）

## リスクと境界条件

- 実行環境がCLI中心のため、実機GUI手動テストは限定的。
- グローバルカバレッジ閾値は別モジュール含みで低値になるため、変更対象ファイル中心で評価する。
