# UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001                      |
| タスク名     | navContract.ts に executionConsole エントリ追加                     |
| 分類         | 実装                                                                |
| 優先度       | 高                                                                  |
| 発見元       | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 Phase 10 前提条件 #7 |
| 作成日       | 2026-03-24                                                          |
| issue_number | 1553                                                                |

## 概要

### 問題

`navContract.ts` の `DockViewType` union および `NAV_SECTIONS` に `executionConsole` エントリが含まれていない。これにより GlobalNavStrip から実行コンソールへのナビゲーションが不可能な状態。

### 背景

TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001（設計タスク）の scope-definition.md で「navContract.ts への項目追加は設計のみ定義、実装は後続の実装タスクに委譲」と定義された。しかし final-gate-decision.md の Task02 前提条件 #7 は「navContract.ts に executionConsole エントリがある」を要求しており、Task02 着手のブロッカーとなる。

### 対応方針

1. `apps/desktop/src/renderer/navigation/navContract.ts` を開く
2. `DockViewType` union に `"executionConsole"` を追加
3. `NAV_SECTIONS` に `{ id: "executionConsole", icon: "play-circle", label: "実行コンソール" }` エントリを追加（shortcut は既存パターンに従い `Cmd+N` 等を割当）
4. TypeScript型チェック通過を確認
5. 関連テスト修正

### 受入基準

- [ ] `grep "executionConsole" apps/desktop/src/renderer/navigation/navContract.ts` が 1 件以上ヒット
- [ ] `pnpm --filter @repo/desktop typecheck` PASS
- [ ] GlobalNavStrip に実行コンソールの nav item が表示される

### 実装課題と解決策（親タスクからの教訓）

| 課題                                           | 発見経緯                                                                                                                                                                                                                                 | 解決策                                                                                                                                    | 教訓                                                                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| scope-definition vs final-gate-decision の矛盾 | Phase 10 レビューで scope-definition.md が「navContract 実装は後続に委譲」と定義しているのに、final-gate-decision.md Task02 前提条件 #7 が「navContract に executionConsole エントリがある」を要求。矛盾が Phase 10 まで検出されなかった | scope-definition.md の「委譲」範囲と downstream 前提条件を Phase 1-2 段階で照合する。委譲項目が downstream blocker になっていないか検証   | 設計タスクの「委譲」宣言は、後続タスクの前提条件と必ず照合すること。Phase 10 で初めて矛盾に気付くと手戻りが大きい |
| サブエージェント権限問題                       | Phase 12 システム仕様書更新をバックグラウンドエージェントに委譲した際、Edit 権限が継承されず更新が失敗。手動リカバリが必要になった                                                                                                       | サブエージェントに委譲する場合は事前に権限設定を確認する。または P43 準拠で3ファイル以下/エージェントに分割し、失敗時のリカバリ手順を準備 | `git diff --stat` で実際の変更ファイルを確認し、サブエージェント完了を鵜呑みにしない（P43/P51 準拠）              |
| DockViewType union 拡張時の型整合              | navContract.ts の `DockViewType` は `ViewType` の部分型。`ViewType` に `executionConsole` を追加済みだが `DockViewType` には未追加。TypeScript の型チェックは通過するが、GlobalNavStrip に表示されない                                   | `DockViewType` と `ViewType` の両方を同時に更新し、`pnpm typecheck` で型整合を確認。P32（型定義の二箇所同時更新必須）準拠                 | ViewType 拡張時は必ず navContract.ts の DockViewType も同時確認すること                                           |

### 参照

- `docs/30-workflows/step-01-seq-task-01-guided-execution-shell-foundation/outputs/phase-2/route-and-action-contract.md` — navContract 設計定義
- `docs/30-workflows/step-01-seq-task-01-guided-execution-shell-foundation/outputs/phase-10/final-gate-decision.md` — Task02 前提条件 #7
- `.claude/rules/06-known-pitfalls.md` — P32（型定義の二箇所同時更新）、P43（サブエージェント中断）、P51（早期完了記載）
