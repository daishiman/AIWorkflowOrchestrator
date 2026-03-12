# Phase 8: リファクタリング

## メタ情報

| 項目       | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| Phase      | 8                                                              |
| Phase名    | リファクタリング                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                        |
| タスク名   | 会話基盤・セッション統合                                       |
| 前提Phase  | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       |
| 後続Phase  | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| ステータス | completed                                                      |
| 作成日     | 2026-03-12                                                     |

## 目的

mode ごとの条件分岐過多、重複 hook、状態の二重保持を解消する。

## 実行タスク

- duplicated selector: 整理する
- duplicated streaming handler: 整理する
- mode 分岐: adapter へ寄せる
- state ownership: general / workspace の境界を整理する
- archive/current 比較: 不要になった旧案を削る

## 参照資料

| 参照資料           | パス                                         | 内容           |
| ------------------ | -------------------------------------------- | -------------- |
| requirements       | `outputs/phase-1/requirements-definition.md` | 要件正本       |
| session model      | `outputs/phase-2/session-model.md`           | session 契約   |
| coverage report    | `outputs/phase-7/coverage-report.md`         | coverage 結果  |
| coverage gaps      | `outputs/phase-7/coverage-gaps.md`           | 穴の一覧       |
| implementation log | `outputs/phase-5/implementation-log.md`      | 実装構造       |
| mode adapter log   | `outputs/phase-5/mode-adapter-log.md`        | adapter 構造   |
| test expansion     | `outputs/phase-6/test-expansion-result.md`   | 追加テスト結果 |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                             | 内容               |
| ------------------------- | -------------------------------------------------------------------------------- | ------------------ |
| arch-state-management     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`     | ownership 正本     |
| architecture-chat-history | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | history 境界       |
| lessons learned           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`           | prior attempt 教訓 |

## 統合テスト連携

| 観点            | 連携内容                                               |
| --------------- | ------------------------------------------------------ |
| ownership       | state ownership の整理結果を品質監査へ渡す             |
| adapter         | adapter へ寄せた分岐が回帰テストで検証済みかを確認する |
| archive cleanup | archive/current 分離を壊さない削除だけを許可する       |

## 成果物

| 成果物          | パス                                 | 説明                   |
| --------------- | ------------------------------------ | ---------------------- |
| refactoring log | `outputs/phase-8/refactoring-log.md` | 構造整理内容           |
| ownership diff  | `outputs/phase-8/ownership-diff.md`  | state ownership の差分 |

## 完了条件

- [x] 共通基盤と mode adapter の境界が明快になっている
- [x] state ownership の二重保持が整理されている
- [x] archive/current split を壊す変更が除外されている
- [x] Task03 追加時の拡張点が限定されている
