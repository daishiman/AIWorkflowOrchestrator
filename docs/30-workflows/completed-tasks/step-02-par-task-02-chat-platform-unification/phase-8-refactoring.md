# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| Phase      | 8                                                              |
| Phase名    | リファクタリング                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                        |
| タスク名   | 会話基盤・セッション統合                                       |
| 機能名     | chat-platform-unification                                      |
| 前提Phase  | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       |
| 後続Phase  | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| ステータス | completed                                                      |
| 作成日     | 2026-03-11                                                     |

## 目的

mode ごとの条件分岐過多、重複 hook、状態の二重保持を解消し、Task03 追加時の拡張点を限定する。

## 対象

- duplicated selector
- duplicated streaming handler
- mode 専用分岐の散在
- history / session の二重保持

## 実行タスク

- Task 8-1: duplicated logic を洗い出す
- Task 8-2: common core と mode adapter へ責務を再配置する
- Task 8-3: Task03 拡張点を限定する
- Task 8-4: 技術負債を整理する

## 参照資料

| 参照資料             | パス                                          | 内容                |
| -------------------- | --------------------------------------------- | ------------------- |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`          | coverage gap        |
| 要件トレーサビリティ | `outputs/phase-7/requirement-traceability.md` | AC 対応             |
| 未検証ケース一覧     | `outputs/phase-7/uncovered-cases.md`          | refactor 対象       |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`  | 共通契約の正本      |
| 共通ドメインモデル   | `outputs/phase-2/common-chat-domain-model.md` | core / adapter 境界 |
| 実装ログ             | `outputs/phase-5/implementation-log.md`       | refactor 対象       |
| 境界ケース一覧       | `outputs/phase-6/edge-case-test-matrix.md`    | failure 契約        |

## 実行手順

1. duplicated selector / streaming handler / adapter 条件分岐を洗い出す。
2. common core と mode adapter へ責務を寄せ直す。
3. Task03 が追加 mode を載せても変更箇所が限定される構造へ整理する。

## 統合テスト連携

| 観点             | 連携内容                                                                |
| ---------------- | ----------------------------------------------------------------------- |
| refactor safety  | refactor 後に phase 6/7 の targeted tests を再利用できる構造へ保つ      |
| adapter boundary | `workspace` / `skill-lifecycle` handoff が UI と store で一致するか確認 |
| downstream       | Task03 public contract を壊さないことを Phase 10 へ引き継ぐ             |

## 成果物

| 成果物               | パス                                        | 説明                  |
| -------------------- | ------------------------------------------- | --------------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`        | 対応内容              |
| adapter 境界監査     | `outputs/phase-8/adapter-boundary-audit.md` | mode adapter 整理結果 |
| 技術負債更新         | `outputs/phase-8/technical-debt-update.md`  | 残課題                |

## 完了条件

- [x] 共通基盤と mode adapter の境界が明快
- [x] Task03 追加時の拡張点が限定されている
- [x] duplicated selector / handler が整理されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- 後続: [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)

## サブタスク管理

- [x] duplicated logic 洗い出し
- [x] adapter 境界整理
- [x] 技術負債更新

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] refactor 後も Task03 契約が維持されている
- [x] uncovered cases が解消または残課題化されている

## 次のPhase

Phase 9: [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
