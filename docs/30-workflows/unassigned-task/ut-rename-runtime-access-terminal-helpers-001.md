# UT-RENAME-RUNTIME-ACCESS-TERMINAL-HELPERS-001

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-RENAME-RUNTIME-ACCESS-TERMINAL-HELPERS-001              |
| タスク名     | runtimeAccess.ts の terminal helper 関数名リネーム         |
| 分類         | リファクタリング                                           |
| 優先度       | 低                                                         |
| 発見元       | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 Phase 3 M-1 |
| 作成日       | 2026-03-24                                                 |
| issue_number | 1554                                                       |

## 概要

### 問題

`apps/desktop/src/renderer/utils/runtimeAccess.ts` の `launchMainlineTerminal` 関数名が旧命名のまま残存。front label は `実行コンソール` に統一されたが、内部関数名に `Terminal` が残っている。

### 対応方針

1. `launchMainlineTerminal` → `launchMainlineExecutionConsole` にリネーム
2. `getTerminalLauncherDisabledReason` → `getExecutionConsoleLauncherDisabledReason` にリネーム
3. 全呼び出し元（SettingsView 等）のインポートを更新
4. 関連テスト修正

### 受入基準

- [ ] `grep -rn "launchMainlineTerminal" apps/desktop/src/renderer/` が 0 件
- [ ] `grep -rn "getTerminalLauncherDisabledReason" apps/desktop/src/renderer/` が 0 件
- [ ] `pnpm --filter @repo/desktop typecheck` PASS
- [ ] 関連テスト全 PASS

### 実装課題と解決策（親タスクからの教訓）

| 課題                                | 発見経緯                                                                                                                                          | 解決策                                                                                                                                                                                                              | 教訓                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| リネーム影響範囲の見落とし          | Phase 3 MINOR M-1 で `launchMainlineTerminal` のリネーム優先度が不明確と指摘。Phase 5 実装時に設計文書のみで実コード改名は実施されなかった        | リネーム前に `grep -rn "launchMainlineTerminal\|getTerminalLauncherDisabledReason" apps/desktop/src/renderer/` で全呼び出し元をリストアップ。一括リネームは IDE のリファクタ機能か `sed` で実施し、手動変更を最小化 | P30（関連ファイル調査不足）準拠。修正対象だけでなく、同パターンを持つ関連ファイルも調査すべき                 |
| SettingsView 等の呼び出し元更新漏れ | `runtimeAccess.ts` 内の関数名を変更すると、SettingsView や useMainlineExecutionAccess hook からのインポートが壊れる。変更箇所が複数ファイルに散在 | P35（DI追加時のテストモック大規模修正）に準じ、事前に `grep -rn` で影響範囲を特定。1コミットで全呼び出し元を同時更新                                                                                                | インポート元変更は必ず全呼び出し元の同時更新が必要。TypeScript の型チェック（`pnpm typecheck`）で漏れ検出可能 |

### 参照

- `docs/30-workflows/step-01-seq-task-01-guided-execution-shell-foundation/outputs/phase-3/design-review-report.md` — M-1 リネーム指摘
- `.claude/rules/06-known-pitfalls.md` — P30（関連ファイル調査不足）、P35（DI追加時のテストモック修正）
