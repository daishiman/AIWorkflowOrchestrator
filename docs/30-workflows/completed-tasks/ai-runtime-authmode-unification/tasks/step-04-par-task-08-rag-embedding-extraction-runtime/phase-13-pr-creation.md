# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 13                                               |
| Phase名    | PR作成                                           |
| タスクID   | TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 |
| 前提Phase  | Phase 12（ドキュメント）                         |
| 後続Phase  | なし                                             |
| ステータス | not_started                                      |
| 作成日     | 2026-03-13                                       |
| 更新日     | 2026-03-19                                       |
| 機能名     | rag-embedding-extraction-runtime                 |

## 目的

PR で説明すべき論点を事前に整理し、レビュー用の要約を準備する。user approval がない限り blocked のままとし、commit / PR の自動作成は行わない。

## blocked / user approval ルール

1. user の明示承認がない限り blocked のままにする
2. ローカル確認を省略しない
3. commit / PR を自動で作らない

## 最低限の記録

- なぜ blocked か（user approval 待ち）
- user approval の有無
- Phase 12 までの完了根拠（全 Phase の status が completed であること）

## 実行タスク

- PR 下書き整理: capability matrix / guidance / mock 排除 / spec sync を要約する
- blocked 理由の記録: user approval 待ちであることと自動 commit / PR 未実施を明記する
- 完了根拠の確認: Phase 12 までの status と成果物を突合する

### Task 1: PR 下書き整理

以下の要点を整理してレビュー用の要約を作成する:

- **capability matrix**: RAG / Embedding / Extraction の runtime capability 定義と変更点
- **guidance**: runtime 選択時のガイダンス UI / メッセージの設計
- **mock 排除**: community summary mock 等の排除方針と影響範囲
- **spec sync**: Phase 12 で同期した仕様書のリストと変更サマリー

### Task 2: blocked 理由の記録

- `blocked-status-record.md` に user approval 待ち、commit / PR 未実施、blocked 理由を明記する
- user approval の値を `pending` / `approved` / `rejected` のいずれかで記録する

### Task 3: Phase 12 完了根拠の確認

- 全 Phase の artifacts.json status を確認し、`completed` を基準に記録する
- Phase 12 の 6 Task が全て完了していることを検証する
- Phase 1-12 の完了根拠を `blocked-status-record.md` に記録する

## 実行手順

### ステップ 1: Phase 12 までの根拠を集約する

Phase 1-12 の成果物、status、Phase 9 の品質結果、Phase 10 のレビューゲート、Phase 11 の手動テスト結果を確認する。

### ステップ 2: PR 要約を作成する

レビューで説明すべき capability matrix、guidance、mock 排除、spec sync の 4 観点を `pr-summary-draft.md` に整理する。

### ステップ 3: blocked 状態と完了根拠を明記する

user approval がない限り blocked のままとし、`blocked-status-record.md` に blocked 理由、user approval、Phase 1-12 完了根拠、commit / PR 未実施を明記する。

## 参照資料

| 参照資料                    | パス                                                       | 内容                                        |
| --------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                  | 背景と受入条件を確認する                    |
| Phase 2（設計）             | `phase-2-design.md`                                        | 設計意図を確認する                          |
| Phase 5（実装）             | `phase-5-implementation.md`                                | 変更順序と影響範囲を確認する                |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                | 回帰拡張の要点を確認する                    |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                | coverage 結果を確認する                     |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                   | 最終構造整理の要点を確認する                |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                             | 品質観点の結果を確認する                    |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                 | release 判断の要点を確認する                |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                  | 手動確認結果を確認する                      |
| Phase 12（ドキュメント）    | `phase-12-documentation.md`                                | spec sync と証跡を確認する                  |
| hybrid-rag-engine           | `packages/shared/src/services/search/hybrid-rag-engine.ts` | backend pipeline 変更点の説明素材を確認する |

## 成果物

| 成果物            | パス                                        | 内容                                                                           |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| PR サマリー下書き | `outputs/phase-13/pr-summary-draft.md`      | レビュー用の要約（capability matrix / guidance / mock 排除 / spec sync）       |
| blocked 状態記録  | `outputs/phase-13/blocked-status-record.md` | blocked 理由、user approval、Phase 1-12 完了根拠、commit / PR 未実施を記録する |

## 完了条件

- [ ] 変更意図と影響範囲が短く説明できる
- [ ] Phase 1-12 の全成果物が確認済みである
- [ ] user approval が記録されている（blocked の場合は理由を明記）
- [ ] commit / PR を自動作成していないことが明記されている
- [ ] `blocked-status-record.md` に blocked 理由、user approval、Phase 1-12 完了根拠が記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

| Task | 名称                    | 必須 | 状態        |
| ---- | ----------------------- | ---- | ----------- |
| 1    | PR 下書き整理           | YES  | not_started |
| 2    | blocked 理由の記録      | YES  | not_started |
| 3    | Phase 12 完了根拠の確認 | YES  | not_started |

## タスク 100% 実行確認【必須】

本 Phase の全タスク（Task 1-3）は省略・先送り不可。以下を最終確認すること:

- [ ] Task 1: pr-summary-draft.md が capability matrix / guidance / mock 排除 / spec sync の 4 観点を含んでいる
- [ ] Task 2: blocked-status-record.md に blocked 理由と user approval が明記されている
- [ ] Task 3: 全 Phase の artifacts.json status が completed 基準で確認されている

## 多角的チェック観点（AI が判断）

Phase 13 実行時に AI が以下の観点で自律的にチェックする:

- PR サマリーが非技術者にも変更意図が伝わる粒度か
- breaking change の有無が明示されているか
- rollback 手順が必要な変更を含んでいないか
- Phase 10 MINOR 指摘の未タスク化が完了しているか

## 統合テスト連携

PR 作成前に以下を確認する:

- `pnpm lint` が PASS すること
- `pnpm typecheck` が PASS すること
- 関連テストが全て PASS すること
- Phase 9（品質検証）の結果と差分がないこと
