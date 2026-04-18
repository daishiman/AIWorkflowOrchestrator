# TASK-SW-STREAM-FUP-03: モード別 onProgress 進捗フロー詳細化

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-SW-STREAM-FUP-03                              |
| タイトル   | モード別 onProgress 進捗フロー詳細化               |
| ステータス | Phase 12 完了 / PR待ち                             |
| 優先度     | medium                                             |
| 規模       | medium                                             |
| 種別       | enhancement                                        |
| タスク種別 | NON_VISUAL                                         |
| Issue      | #2208                                              |
| 作成日     | 2026-04-17                                         |
| 依存タスク | TASK-SW-STREAM-001（完了）, FUP-02（推奨事前完了） |

## 概要

`SkillCreatorService.createSkill()` の進捗通知を mode 別に詳細化する。

TASK-SW-STREAM-001 で実装した 5 段階フロー（planning → generating-skill → generating-agents → validating → done）は `create` モードに最適化されており、他モードでは不正確なメッセージが表示される。

## 実装方針

- progress flow の正本は `SkillCreatorService.ts` 内の単一定義に置く
- `createSkill()` が mode ごとの progress orchestration を担う
- private workflow methods は progress literal を持たず、業務ロジックに集中する
- テストは `createSkill()` を public boundary として、mode ごとの順序・安全性・回帰を確認する

### モード別フェーズ設計

| モード           | フェーズ構成                                                                     |
| ---------------- | -------------------------------------------------------------------------------- |
| `create`         | planning → generating-skill → generating-agents → validating → done              |
| `collaborative`  | interview → consensus → generating-skill → generating-agents → validating → done |
| `orchestrate`    | engine-selection → generating-skill → generating-agents → validating → done      |
| `update`         | loading-skill → analyzing → generating-skill → validating → done                 |
| `improve-prompt` | loading-skill → analyzing → improving → validating → done                        |

## 変更対象ファイル

| ファイル                                                                              | 変更種別 |
| ------------------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         | 修正     |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` | 新規作成 |

## 受入基準

| ID   | 条件                                                               |
| ---- | ------------------------------------------------------------------ |
| AC-1 | `create` モードの5段階フローが既存通り動作する（回帰なし）         |
| AC-2 | `collaborative` モードでインタビュー・合意形成フェーズが通知される |
| AC-3 | `orchestrate` モードで実行エンジン選択フェーズが通知される         |
| AC-4 | `update` モードでスキル読み込み・分析フェーズが通知される          |
| AC-5 | `improve-prompt` モードでプロンプト改善フェーズが通知される        |
| AC-6 | 既存14テストケースが全てpass（回帰なし）                           |
| AC-7 | 各モードの `percentage` 値が単調増加し 0〜100 の範囲に収まる       |
| AC-8 | `onProgress` が未指定の場合（`undefined`）でもエラーが発生しない   |

## Phase 一覧

| Phase | 名称             | 仕様書                                                         | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | 完了       |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | 完了       |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | 完了       |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | 完了       |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | 完了       |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | 完了       |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | 完了       |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | 完了       |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md)       | 完了       |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |

## 参照

- 未タスク仕様: `docs/30-workflows/unassigned-task/TASK-SW-STREAM-FUP-03-MODE-SPECIFIC-PROGRESS.md`
- 依存実装: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- 依存タスク: TASK-SW-STREAM-001（onProgress引数追加）
- GitHub Issue: #2208
