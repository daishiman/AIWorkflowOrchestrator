# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 型重複と adapter 境界の整理     |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

shared transport DTO に統一した後、重複型、冗長 mapping、event 処理の散在を整理し、契約境界を再び壊さない構造へ整える。

## 背景

このタスクは bug fix で始まるが、重複型を残したまま終えると次の auth-mode 変更で再発する。Phase 8 で境界を磨く必要がある。

## SubAgentチーム編成

| SubAgent                | 担当関心               | 実行形態 | Phase 8 の責務                                                |
| ----------------------- | ---------------------- | -------- | ------------------------------------------------------------- |
| SubAgent-Contract-Main  | adapter / helper 整理  | 並列     | Main 内部型から public DTO への変換を 1 箇所へ集約する        |
| SubAgent-Bridge-Preload | preload re-export 整理 | 並列     | 重複型定義をなくし import / export を整理する                 |
| SubAgent-Renderer-State | slice / UI 依存整理    | 並列     | Renderer が shared DTO と selector だけを参照する状態へ寄せる |
| SubAgent-Spec-Sync      | refactor 監査          | 直列統合 | refactoring plan と post-refactor checklist をまとめる        |

## 実行タスク

- 型重複整理: `preload/types.ts` と `authModeSlice.ts` に残る public 型重複をなくす。
- adapter 集約: Main handler の mapping を helper へ寄せる。
- event 経路整理: `changed` event の取り扱いを 1 つの受信経路へ揃える。
- post-refactor 監査: refactor 後に public contract が変わっていないことを確認する。

## 参照資料

### 実装・コード

| 資料名                   | パス                                                      | 用途                                 |
| ------------------------ | --------------------------------------------------------- | ------------------------------------ |
| Phase 1 仕様             | `phase-1-requirements.md`                                 | 要件と非スコープ境界を確認する       |
| Phase 2 仕様             | `phase-2-design.md`                                       | canonical DTO を確認する             |
| Phase 5 仕様             | `phase-5-implementation.md`                               | 実装順序を確認する                   |
| Phase 6 仕様             | `phase-6-test-expansion.md`                               | 回帰ケースを確認する                 |
| Phase 7 仕様             | `phase-7-coverage-check.md`                               | gap を確認する                       |
| Phase 1 成果物           | `outputs/phase-1/`                                        | source-of-truth map を確認する       |
| Phase 2 成果物           | `outputs/phase-2/`                                        | DTO 設計を確認する                   |
| Phase 5 成果物           | `outputs/phase-5/`                                        | changed files と rollback を確認する |
| Phase 6 成果物           | `outputs/phase-6/`                                        | event regression を確認する          |
| Phase 7 成果物           | `outputs/phase-7/`                                        | gap を確認する                       |
| Shared AuthMode 型       | `packages/shared/src/types/auth-mode.ts`                  | 最終正本を確認する                   |
| Preload 型               | `apps/desktop/src/preload/types.ts`                       | 重複型の削除対象を確認する           |
| Renderer Slice           | `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | 重複型の削除対象を確認する           |
| 実装計画                 | `outputs/phase-5/implementation-plan.md`                  | Phase 5 成果物                       |
| 変更ファイル計画         | `outputs/phase-5/changed-files-plan.md`                   | Phase 5 成果物                       |
| 移行順序                 | `outputs/phase-5/migration-order.md`                      | Phase 5 成果物                       |
| ロールバック計画         | `outputs/phase-5/rollback-plan.md`                        | Phase 5 成果物                       |
| coverage目標             | `outputs/phase-7/coverage-targets.md`                     | Phase 7 成果物                       |
| contract coverage matrix | `outputs/phase-7/contract-coverage-matrix.md`             | Phase 7 成果物                       |
| gap log                  | `outputs/phase-7/gap-log.md`                              | Phase 7 成果物                       |

### システム仕様（aiworkflow-requirements）

| 資料名           | パス                                                                         | 用途                                               |
| ---------------- | ---------------------------------------------------------------------------- | -------------------------------------------------- |
| 状態管理         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | slice の依存境界を確認する                         |
| 認証仕様         | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`       | public DTO が変わっていないか確認する              |
| IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | sender / error contract が維持されているか確認する |

## 実行手順

1. Phase 7 の `gap-log.md` を読み、 refactor 対象を確定する。
2. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列で重複と散在を整理する。
3. `type-source-consolidation.md` と `adapter-review.md` に整理後の所有境界を記録する。
4. `post-refactor-checklist.md` で public contract 不変を確認する。

## 統合テスト連携

- refactor 後も Phase 6 の event regression case がそのまま通ることを確認する。
- `get`, `status`, `validate`, `changed` の DTO 名が変わらないことを確認する。
- shared DTO の import 先が Main / Preload / Renderer で一致することを確認する。
- refactor 後に追加した helper が sender 検証順序を壊していないことを確認する。

## 多角的チェック観点

| 観点         | 確認内容                                            |
| ------------ | --------------------------------------------------- |
| 重複削減     | public transport 型の重複定義を消せているか         |
| 境界維持     | Main internal type と public DTO が混ざっていないか |
| event 単純化 | listener の受信経路が 1 つに揃っているか            |
| 監査性       | refactor 後の確認項目が checklist 化されているか    |
| 将来変更耐性 | 次回の auth-mode 変更が shared DTO 起点で済む構造か |

## 成果物

| 成果物                  | パス                                           | 説明                              |
| ----------------------- | ---------------------------------------------- | --------------------------------- |
| refactoring plan        | `outputs/phase-8/refactoring-plan.md`          | 重複削減と helper 集約の計画      |
| 型統合計画              | `outputs/phase-8/type-source-consolidation.md` | public 型の最終 owner 表          |
| adapter 見直し          | `outputs/phase-8/adapter-review.md`            | Main mapping と event path の整理 |
| post-refactor checklist | `outputs/phase-8/post-refactor-checklist.md`   | refactor 後の確認項目             |

## 完了条件

- [x] `type-source-consolidation.md` に public transport 型の owner を shared へ固定する
- [x] `adapter-review.md` に Main mapping helper の配置先を書く
- [x] `post-refactor-checklist.md` に DTO 名、event payload、sender 順序の 3 観点がある
- [x] `refactoring-plan.md` に削除対象の重複型ファイルを明記する
- [x] Phase 6 の regression case を維持する条件を書く
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 重複型整理
2. adapter 集約
3. event 経路整理
4. post-refactor 監査
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 重複型を列挙した
- [x] helper 集約先を決めた
- [x] public contract 不変の確認項目を書いた
- [x] regression case 維持条件を書いた

## 次のPhase

Phase 9: 品質保証
