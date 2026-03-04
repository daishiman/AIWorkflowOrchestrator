# Phase 1 スコープ定義

## 1. 対象スコープ（In Scope）

- `apps/desktop/src/renderer/styles/tokens.css` の3テーマ整備
- Atomic Designの共通コンポーネント整備
- テストヘルパー/コンポーネントテスト整備
- レスポンシブ/A11y/エラー表示方針をコンポーネント実装へ反映
- フェーズ成果物（Phase 1〜12）の `outputs/` 生成

## 2. 除外スコープ（Out of Scope）

- `kanagawa-wave` / `kanagawa-lotus` のCSS実装
- `settingsSlice` のテーマ制約解除
- 本タスク外画面の全面リニューアル
- Phase 13（PR作成/コミット/PR提出）

## 3. 境界条件

- UI基盤は `props` 受け取り中心（P31対策: store直参照を避ける）
- テスト実行は `apps/desktop` 起点（P40対策）
- コンポーネント操作試験は `fireEvent` 優先（P39対策）

## 4. 成果物境界

- フェーズ成果物はすべて `docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation/outputs/phase-N/` に出力
- 実装コードは `apps/desktop/src/renderer/components/**` と `views/**` に限定
