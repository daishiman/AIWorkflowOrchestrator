# Phase 5: 実装（diff確認とコメント追加）

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 5                                       |
| タスクID   | TASK-RALLY-002                          |
| 機能名     | restored-pending-request-clarification  |
| タスク名   | restoredPendingRequest合成ルール明確化  |
| 前提Phase  | Phase 4                                 |
| 後続Phase  | Phase 6                                 |
| 作成日     | 2026-04-21                              |
| ステータス | pending                                 |
| 実装モード | verify_existing                         |
| タスク種別 | renderer / NON_VISUAL / verify_existing |

## 目的

verify_existing タスクであるため、コード変更は主作業ではない。Phase 2 の設計（コメント追加による意味固定）と現在のコードの差分を確認し、不一致があった場合に限り最小限の変更（コメント追加）を行う。変更要否の判断とその根拠を成果物として記録することが本フェーズの主作業である。

## 実行タスク

1. `ConversationalInterview.tsx` の `restoredPendingRequest` 合成式周辺とクリア条件 `useEffect` 周辺を `git diff` および直接参照で確認し、Phase 2 の設計（コメント案）との差分を記録する
2. 差分確認結果を基に「変更不要（設計と一致）」または「変更必要（設計と不一致）」の判定を下し、判定根拠を `diff-check-result.md` に記録する
3. 「変更必要」の判定が出た箇所のみ、Phase 2 設計書の `comment semantics` 責務に従ったコメント追加を実施し、変更内容を `changed-files.md` に記録する。変更後に検証コマンドを実行し、結果を `verification-result.md` に記録する

## 実行手順

### ステップ1: 現状コード確認（diff確認が主作業）

```bash
# 対象ファイルの現在の差分を確認（ブランチ分岐点から）
git diff main -- apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# 合成式周辺の現状を確認
grep -n "restoredPendingRequest\|pendingRequest\|awaitingUserInput" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

# クリア条件 useEffect 周辺を確認
grep -n "setRestoredPendingRequest\|requestId" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx
```

### ステップ2: 設計との差分評価

以下の評価観点で現状コードと Phase 2 設計の差分を判定する。

| 評価観点                                                                                     | 確認内容                                                                                           | 判定   |
| -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------ |
| 合成式に優先ルールを説明するコメントが存在するか                                             | `restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput` の直上または同行にコメントがあるか | 要確認 |
| クリア条件 `useEffect` に動作説明コメントが存在するか                                        | `workflowSnapshot?.awaitingUserInput?.requestId` を依存とする useEffect にコメントがあるか         | 要確認 |
| Phase 2 の `downstream handoff` 契約が参照できるコメントまたはドキュメントリンクが存在するか | RALLY-010 以降が前提とする契約への言及があるか                                                     | 要確認 |

### ステップ3: 変更要否の判定と記録

- **変更不要の場合**: `diff-check-result.md` に「設計と一致、変更なし」と記録し、`changed-files.md` には「変更なし」と記録する
- **変更必要の場合**: `diff-check-result.md` に不一致箇所と変更内容を記録し、Phase 2 設計書（`verification-design.md`）のコメント案に従ってコメントを追加する

変更する場合は以下の制約を厳守する。

- 追加するのはコメントのみ（`//` または `/* */` 形式）
- `pendingRequest` 合成式の null 合体順を変更しない
- `useEffect` のロジック（依存配列・本体）を変更しない
- ファイルスコープ外（他ファイル）に変更を加えない

### ステップ4: 検証コマンド実行

変更の有無にかかわらず以下のコマンドを実行し、結果を `verification-result.md` に記録する。

```bash
# TypeScript コンパイルエラーがないことを確認
pnpm typecheck

# ESLint 警告がないことを確認（react-hooks/exhaustive-deps 含む）
pnpm lint

# targeted regression test の実行（Phase 4 で定義したテストケース）
pnpm --filter @repo/desktop test -- --testPathPattern=ConversationalInterview
```

各コマンドの終了コード・出力結果・エラーがあった場合の内容を `verification-result.md` に記録する。

## 統合テスト連携

- diff 確認が主作業であり、コード変更は不一致があった場合に限定する
- コード変更が発生した場合は Phase 4 の targeted regression test を再実行し、すべて GREEN であることを確認する
- コメント追加のみの場合は型チェック（`pnpm typecheck`）と lint（`pnpm lint`）の通過で十分とする

## 参照資料

| 資料名                     | パス                                                                                     | 用途                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Phase 4 テスト仕様         | `outputs/phase-4/test-specification.md`                                                  | targeted regression test の実行対象シナリオの確認             |
| Phase 2 検証設計           | `outputs/phase-2/verification-design.md`                                                 | コメント案・変更種別（コメントのみ）の参照                    |
| Phase 2 責務境界マトリクス | `outputs/phase-2/responsibility-boundary-matrix.md`                                      | comment semantics / clear condition verification の対象行確認 |
| Phase 2 検証コマンド       | `outputs/phase-2/validation-command-matrix.md`                                           | 実行コマンドと期待結果の参照                                  |
| 対象コード                 | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                 | diff 確認の対象                                               |
| 上流解決策設計書           | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-2-solution.md` | 「ロジック変更なし、コメント追加のみ」方針の確認              |

## 成果物

- `outputs/phase-5/diff-check-result.md`（差分確認結果：評価観点ごとの判定・不一致箇所・変更要否の根拠）
- `outputs/phase-5/changed-files.md`（変更内容の記録：変更したファイル・変更箇所・変更内容。変更なしの場合は「変更なし」と明記）
- `outputs/phase-5/verification-result.md`（検証コマンド実行結果：コマンド・終了コード・出力サマリー・全テスト PASS の確認）

## 完了条件

- [ ] `git diff` による差分確認が完了し、`diff-check-result.md` に全評価観点の判定と根拠が記録されている
- [ ] 変更要否の判定が確定し、`changed-files.md` に変更内容（または「変更なし」）が記録されている
- [ ] 変更があった場合、追加したのはコメントのみであり、合成式のロジック・useEffect のロジックが変更されていないことが確認されている
- [ ] `pnpm typecheck`・`pnpm lint`・targeted regression test がすべて PASS し、結果が `verification-result.md` に記録されている
- [ ] 3成果物（diff-check-result.md / changed-files.md / verification-result.md）が outputs/phase-5/ に定義されている
- [ ] Phase 5 完了前に Phase 6 へ進まないことを確認した

## タスク100%実行確認【必須】

- [ ] 実行タスク1（diff確認）完了
- [ ] 実行タスク2（変更要否判定）完了
- [ ] 実行タスク3（変更実施または変更なし記録 + 検証コマンド実行）完了
- [ ] 成果物3件（diff-check-result.md / changed-files.md / verification-result.md）定義済み
- [ ] verify_existing 原則（コード変更は不一致があった場合のみ・コメントのみ）が遵守されていることを確認した

## 次のPhase

Phase 6: テスト拡張（異常系・追加回帰ケース）
