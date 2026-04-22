# Phase 4: テスト作成（targeted regression test仕様）

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| タスクID   | TASK-RALLY-002                          |
| 機能名     | restored-pending-request-clarification  |
| タスク名   | restoredPendingRequest合成ルール明確化  |
| 前提Phase  | Phase 3（Gate PASS 確認済み）           |
| 後続Phase  | Phase 5                                 |
| 作成日     | 2026-04-21                              |
| ステータス | pending                                 |
| 実装モード | verify_existing                         |
| タスク種別 | renderer / NON_VISUAL / verify_existing |

## 目的

verify_existing タスクであるため、RED→GREEN TDD ではなく「targeted regression test 仕様」を作成する。既存の `restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput` 合成ロジックとクリア条件 `useEffect` の現在の挙動を固定するテストケースを定義し、Phase 5 の変更作業（コメント追加）が既存動作を破壊しないことを保証できる状態にする。

## 実行タスク

1. `ConversationalInterview.tsx` に関連する既存テストファイルを棚卸しし、`restoredPendingRequest`・`pendingRequest`・`awaitingUserInput` を対象とするテストの有無と網羅状況を記録する
2. Phase 2 の targeted regression test スコープ（3シナリオ）を基に、各シナリオのテストケース仕様（前提条件・操作・期待結果）を具体的に定義する
3. 新規テストファイルの命名規則・配置ディレクトリ・テストフレームワーク（Vitest）の設定を決定し、test-specification.md に記録する

## 実行手順

### ステップ1: 既存テスト棚卸し

以下のコマンドで関連テストファイルを特定する。

```bash
# ConversationalInterview に関連するテストファイルを検索
find apps/desktop/src -name "*.test.*" | xargs grep -l "ConversationalInterview\|restoredPendingRequest\|pendingRequest" 2>/dev/null

# restoredPendingRequest を参照するテストを直接検索
grep -rn "restoredPendingRequest" apps/desktop/src --include="*.test.*"

# awaitingUserInput を対象とするテストを確認
grep -rn "awaitingUserInput" apps/desktop/src --include="*.test.*"
```

上記の結果を `outputs/phase-4/existing-test-inventory.md` に記録する。

### ステップ2: テストカバレッジギャップ分析

棚卸し結果を以下の3シナリオと照合し、カバーされていないシナリオを特定する。

| シナリオID | シナリオ説明                                                                                                                | 既存テストの有無 |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| S-1        | セッション復元時に `restoredPendingRequest` が非 null の場合、`pendingRequest` が `restoredPendingRequest` を返すこと       | 要確認           |
| S-2        | `workflowSnapshot?.awaitingUserInput?.requestId` が更新されたとき、`restoredPendingRequest` が null にクリアされること      | 要確認           |
| S-3        | 通常フロー（`restoredPendingRequest` が null）において `pendingRequest` が `workflowSnapshot?.awaitingUserInput` を返すこと | 要確認           |

### ステップ3: テスト仕様策定

各シナリオのテストケース仕様を以下の形式で定義する。

```
テストケースID: TC-S1-01
対象シナリオ: S-1
前提条件:
  - restoredPendingRequest が { requestId: "restore-001", ... } として設定済み
  - workflowSnapshot が null または awaitingUserInput が null
期待結果:
  - pendingRequest === restoredPendingRequest（restoredPendingRequest の値が返る）
```

### ステップ4: テストファイル命名決定

テストファイルの命名・配置を以下の基準で決定する。

- ファイル名: `ConversationalInterview.restoredPendingRequest.test.tsx`
- 配置: 対象コードと同一ディレクトリ（`apps/desktop/src/renderer/components/skill/`）または `__tests__` サブディレクトリ
- テストフレームワーク: Vitest（`@testing-library/react` 使用）
- 既存テストファイルの命名規則に合わせること

## targeted regression test 設計原則

本フェーズは verify_existing の特性から以下の原則を遵守する。

- 新規ロジックを検証するテストは作成しない
- `pendingRequest` 合成式のロジック変更を前提とするテストは作成しない
- 既存のコード挙動を「固定」するテストのみ定義する（挙動を変えるテストではない）
- テスト仕様はコード変更なしで通過することを前提とする（Phase 5 後に改めて実行し確認する）

## 統合テスト連携

- verify_existing モードのため RED → GREEN TDD は行わず、既存挙動を固定する targeted regression test を作成する
- 通常フロー / 復元フロー / 復元後切替の3シナリオは Phase 11 の手動確認と重複しないよう自動テストで担保する
- `packages/shared` の型変更が生じた場合は `@repo/shared` の統合テストも対象に含める

## 参照資料

| 資料名                     | パス                                                                                     | 用途                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Phase 3 Gate 判定          | `outputs/phase-3/gate-decision.md`                                                       | Phase 4 移行許可の確認                                                 |
| Phase 2 検証設計           | `outputs/phase-2/verification-design.md`                                                 | targeted regression test スコープ（3シナリオ）の参照                   |
| Phase 2 責務境界マトリクス | `outputs/phase-2/responsibility-boundary-matrix.md`                                      | clear condition verification の対象・完了条件の参照                    |
| 対象コード                 | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                 | 合成式・useEffect クリア条件の行番号・シグネチャ確認                   |
| 上流解決策設計書           | `docs/30-workflows/completed-tasks/00-task-spec-design-docs-2/rally-phase-2-solution.md` | RALLY-002 検証方針（コードレビューで優先ルールが読み取れること）の確認 |

## 成果物

- `outputs/phase-4/existing-test-inventory.md`（既存テスト棚卸し結果：ファイルパス・テスト対象・カバー済みシナリオ・カバーギャップ）
- `outputs/phase-4/test-specification.md`（targeted regression test 仕様：テストケースID・シナリオ・前提条件・操作・期待結果・テストファイル命名決定）

## 完了条件

- [ ] 既存テストファイルの棚卸しが完了し、`existing-test-inventory.md` に結果が記録されている
- [ ] S-1・S-2・S-3 の3シナリオに対してテストケース仕様が定義され、`test-specification.md` に記録されている
- [ ] 新規テストファイルの命名・配置・フレームワーク設定が `test-specification.md` に決定されている
- [ ] targeted regression test の設計原則（新規ロジック検証なし・ロジック変更前提なし）が全成果物に反映されている
- [ ] 2成果物（existing-test-inventory.md / test-specification.md）が outputs/phase-4/ に定義されている
- [ ] Phase 4 完了前に Phase 5 へ進まないことを確認した

## タスク100%実行確認【必須】

- [ ] 実行タスク1（既存テスト棚卸し）完了
- [ ] 実行タスク2（テストケース仕様策定）完了
- [ ] 実行タスク3（テストファイル命名決定）完了
- [ ] 成果物2件（existing-test-inventory.md / test-specification.md）定義済み
- [ ] verify_existing 原則（RED テストなし）が全成果物に反映されていることを確認した

## 次のPhase

Phase 5: 実装（diff確認とコメント追加）
