# スキルフィードバックレポート - TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase    | 12 - Task 5                                    |
| 記録日   | 2026-03-10                                     |

## task-specification-creator へのフィードバック

### 1. ユーザー明示の screenshot 要求時は P53 代替で閉じない

- 現象: 既存成果物に「CLI環境なのでコード検証で代替」と残りやすい
- 改善案: 明示 screenshot 要求がある場合は、専用 harness route、`screenshot-plan.json`、`phase11-capture-metadata.json`、`validate-phase11-screenshot-coverage` までを完了条件へ昇格させる

### 2. bypass 仕様には reset guard まで含める

- 現象: `currentView === "settings"` の bypass を実装しても、未認証時 reset が `settings` を潰すと仕様が相殺される
- 改善案: Phase 2/11/12 テンプレートに「公開ビュー一覧」と「未認証 reset 除外条件」を明示する欄を追加する

### 3. worktree preflight を明文化する

- 現象: Rollup optional dependency 欠落で vitest / Playwright が不安定になる
- 改善案: worktree で Phase 11/12 を開始する前に `pnpm install --frozen-lockfile` を preflight に含める

## aiworkflow-requirements へのフィードバック

### 1. 認証 UI 修正は cross-cutting 入口を強制したい

- 現象: 認証 UI の修正は `architecture-auth-security`、`arch-state-management`、`ui-ux-navigation`、`ui-ux-feature-components` に分散する
- 改善案: 認証 UI タスクの quick-reference に「最低参照 4 文書」を固定する

### 2. Settings bypass の判定基準は shell 公開だけでは不十分

- 現象: security 観点では shell 公開が妥当でも、state reset が別レイヤーで破壊しうる
- 改善案: 「公開ビューは security 境界 + state reset 境界 + nav 到達性」の 3 条件で定義する

### 3. workflow 本文の status 同期を check 対象にしたい

- 現象: `artifacts.json` は completed でも `index.md` や `phase-12-documentation.md` が pending のまま残りやすい
- 改善案: Phase 12 で `index.md` / `phase-11-manual-test.md` / `phase-12-documentation.md` の status 同期を必須チェックに加える
