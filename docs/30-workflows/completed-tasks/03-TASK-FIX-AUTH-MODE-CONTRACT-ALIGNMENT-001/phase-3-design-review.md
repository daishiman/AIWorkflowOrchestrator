# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 3                                         |
| 機能名     | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 |
| タスク名   | auth-mode 契約整合設計のレビューゲート    |
| 作成日     | 2026-03-06                                |
| ステータス | completed                                 |

## 目的

Phase 2 の設計が P23 / P32 / P42 / P44、sender 検証順序、system spec 同期要件を満たすかを Gate 判定する。

## 背景

このタスクは公開契約そのものを変える。設計段階で review gate を抜ける条件を固定しないと、Phase 5 で型整理と UI 修正が同時に膨らむ。

## SubAgentチーム編成

| SubAgent                | 担当関心              | 実行形態 | Phase 3 の責務                                            |
| ----------------------- | --------------------- | -------- | --------------------------------------------------------- |
| SubAgent-Contract-Main  | Main adapter 設計監査 | 並列     | service 内部型の漏出がないか判定する                      |
| SubAgent-Bridge-Preload | Preload 公開面監査    | 並列     | `safeInvoke` / `safeOn` の契約が DTO と一致するか判定する |
| SubAgent-Renderer-State | Renderer 受信契約監査 | 並列     | slice と UI が event payload だけで整合するか判定する     |
| SubAgent-Spec-Sync      | Gate 統合判定         | 直列統合 | PASS / MINOR / MAJOR と戻り先を記録する                   |

## 実行タスク

- 設計レビュー: DTO、adapter、責務境界、テスト戦略、system spec 同期計画をレビューする。
- 判定記録: PASS / MINOR / MAJOR の基準で gate decision を記録する。
- 未解決論点整理: 直ちに実装へ進めない論点を `open-questions.md` に記録する。

## 参照資料

### 実装・コード

| 資料名                 | パス                                                      | 用途                                    |
| ---------------------- | --------------------------------------------------------- | --------------------------------------- |
| Phase 1 仕様           | `phase-1-requirements.md`                                 | 要件との整合確認                        |
| Phase 1 成果物         | `outputs/phase-1/`                                        | drift inventory と AC を確認する        |
| Phase 2 仕様           | `phase-2-design.md`                                       | レビュー対象の設計書を確認する          |
| Phase 2 成果物         | `outputs/phase-2/`                                        | canonical contract と移行順序を確認する |
| Main IPC handler       | `apps/desktop/src/main/ipc/authModeHandlers.ts`           | adapter 位置を確認する                  |
| Preload 型             | `apps/desktop/src/preload/types.ts`                       | 重複型の削除対象を確認する              |
| Renderer Slice         | `apps/desktop/src/renderer/store/slices/authModeSlice.ts` | event 依存箇所を確認する                |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`              | Phase 1 成果物                          |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                  | Phase 1 成果物                          |
| 契約ドリフト台帳       | `outputs/phase-1/drift-inventory.md`                      | Phase 1 成果物                          |
| 公開型正本マップ       | `outputs/phase-1/source-of-truth-map.md`                  | Phase 1 成果物                          |
| スコープ境界           | `outputs/phase-1/scope-boundary.md`                       | Phase 1 成果物                          |
| canonical contract設計 | `outputs/phase-2/canonical-contract-design.md`            | Phase 2 成果物                          |
| 層責務マトリクス       | `outputs/phase-2/layer-responsibility-matrix.md`          | Phase 2 成果物                          |
| error envelope設計     | `outputs/phase-2/error-envelope-design.md`                | Phase 2 成果物                          |
| shared型移行計画       | `outputs/phase-2/shared-type-migration-plan.md`           | Phase 2 成果物                          |
| テスト戦略             | `outputs/phase-2/test-strategy.md`                        | Phase 2 成果物                          |

### システム仕様（aiworkflow-requirements）

| 資料名             | パス                                                                           | 用途                                         |
| ------------------ | ------------------------------------------------------------------------------ | -------------------------------------------- |
| IPC 契約チェック   | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | 契約ドリフト防止観点を確認する               |
| IPC セキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | sender 検証順序と error transport を確認する |
| 認証仕様           | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`         | AuthMode 正本仕様の粒度を確認する            |
| システム IPC       | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`          | channel 記載方針を確認する                   |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | error code 記載方針を確認する                |
| レビュー基準       | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PASS / MINOR / MAJOR の戻り先を確認する      |

## 実行手順

1. Phase 1 と Phase 2 の成果物を読み、要件と設計の対応を確認する。
2. SubAgent-Contract-Main、SubAgent-Bridge-Preload、SubAgent-Renderer-State が並列でレビュー観点ごとの指摘を作る。
3. SubAgent-Spec-Sync が `review-checklist.md` と `design-review-result.md` に統合し、`gate-decision.md` を記録する。
4. MAJOR がある場合は戻り先を Phase 1 または Phase 2 に固定する。

## 統合テスト連携

- Phase 4 に渡す Red テストが channel 単位で 1 対 1 に対応しているか確認する。
- event payload の設計が `set -> changed -> status` の直列検証に使えるか確認する。
- invalid sender と invalid mode の異常系が同じ fixture から作れるか確認する。
- system spec 更新対象が Phase 12 の成果物へ接続されているか確認する。

## 多角的チェック観点

| 観点         | 確認内容                                                           |
| ------------ | ------------------------------------------------------------------ |
| 要件整合     | Phase 1 の AC が Phase 2 の DTO に結び付いているか                 |
| 型整合       | Main 内部型が public transport と分離されているか                  |
| セキュリティ | sender 検証順序が `sender -> 構造 -> P42 -> 許可値` になっているか |
| 回帰性       | Main / Preload / Renderer の変更順序がテスト戦略に書かれているか   |
| 文書同期     | Phase 12 で更新する references が確定しているか                    |

## 成果物

| 成果物             | パス                                      | 説明                               |
| ------------------ | ----------------------------------------- | ---------------------------------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | 指摘事項の総覧                     |
| レビュー checklist | `outputs/phase-3/review-checklist.md`     | P23 / P32 / P42 / P44 と Gate 観点 |
| Gate 判定          | `outputs/phase-3/gate-decision.md`        | PASS / MINOR / MAJOR と戻り先      |
| 未解決論点台帳     | `outputs/phase-3/open-questions.md`       | 残論点と owner                     |

## 完了条件

- [x] `review-checklist.md` に P23, P32, P42, P44, sender 順序, system spec 同期の 6 観点がある
- [x] `gate-decision.md` に PASS / MINOR / MAJOR のいずれか 1 つが書かれている
- [x] MAJOR の場合は戻り先 Phase を 1 つだけ書いている
- [x] `open-questions.md` の各論点に owner と解消期限を書く
- [x] Phase 4 に引き継ぐ Red テスト対象が channel 単位で確定している
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. レビュー観点準備
2. Main / Preload / Renderer の並列レビュー
3. Gate 判定
4. 未解決論点整理
5. 完了条件確認

## タスク100%実行確認【必須】

- [x] 設計の PASS 条件を文書化した
- [x] MAJOR 発生時の戻り先を固定した
- [x] Phase 4 の Red テスト対象を確定した
- [x] system spec 更新対象を Gate 観点へ含めた

## 次のPhase

Phase 4: テスト作成
