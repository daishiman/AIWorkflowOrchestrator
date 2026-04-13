# Phase 13: PR 作成

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 13                                       |
| タスクID   | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001   |
| 機能名     | cronConverter weekdays=[] ガード処理追加 |
| 前提Phase  | Phase 12                                 |
| 後続Phase  | なし                                     |
| 作成日     | 2026-04-12                               |
| ステータス | blocked（PR未作成・ユーザー承認待ち）    |

## 目的

提出準備を完了し、ユーザー承認後のみ PR 作成へ進む。

## PR 提出差分サマリー

### 変更ファイル

| ファイル                                                          | 変更種別  | 概要                                                |
| ----------------------------------------------------------------- | --------- | --------------------------------------------------- |
| `apps/desktop/src/renderer/utils/cronConverter.ts`                | 修正      | InvalidConfigError 定義追加・ガード追加・JSDoc 更新 |
| `apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts` | 新規/修正 | TDD テストケース追加                                |

### 変更概要

1. `InvalidConfigError` クラスを `cronConverter.ts` 内に定義
2. `visualConfigToCron()` に `weekdays: []` ガードを追加
3. `visualConfigToCron()` の JSDoc に `@throws {InvalidConfigError}` を追記
4. テストケース追加（weekdays: [], [0], [1,2,3,4,5], [0,1,2,3,4,5,6]）

### レビュー観点

| 観点             | 確認内容                                         |
| ---------------- | ------------------------------------------------ |
| 機能要件         | weekdays=[] → InvalidConfigError / 正常系の維持  |
| 型安全性         | InvalidConfigError が Error サブクラスであること |
| テストカバレッジ | ガード処理ブランチ 100% / 全 AC カバー           |
| スコープ         | cronConverter.ts と test ファイルのみの変更      |
| 後続タスク       | TASK-CRON-SEMANTIC-VALIDATION-001 への引き継ぎ   |

## 承認条件

**ユーザーの明示承認がある場合のみ PR 作成へ進む。**

承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する。

## PR タイトル案

```
fix(cronConverter): weekdays=[] のとき InvalidConfigError をスローするガードを追加
```

## PR 本文テンプレート

```markdown
## 概要

`cronConverter.ts` の `visualConfigToCron()` に `weekdays: []` ガードを追加し、不正な cron 式 `"0 9 * * "` の生成を防ぐ。

Closes #2081

## 変更内容

- `InvalidConfigError` クラスを `cronConverter.ts` 内に定義
- `visualConfigToCron()` で `frequency === "weekly"` かつ `weekdays: []` の場合に `InvalidConfigError` をスロー
- JSDoc に `@throws {InvalidConfigError}` を追記
- テストケース追加: weekdays=[] / [0] / [1,2,3,4,5] / [0,1,2,3,4,5,6]

## 背景

UI レベル（VisualCronPicker）のバリデーションに依存していたが、API を直接呼び出すケースでガードが存在しなかった（単一責任原則違反）。

## テスト

- `pnpm --filter @repo/desktop test:run -- apps/desktop/src/renderer/utils/__tests__/cronConverter.test.ts` で全テスト Green
- ガード処理ブランチ 100% カバー

## 後続タスク

- TASK-CRON-SEMANTIC-VALIDATION-001: より包括的な cron セマンティクス検証（本タスク完了後に着手推奨）
```

## 参照資料

| 資料名                   | パス                                             | 用途            |
| ------------------------ | ------------------------------------------------ | --------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`       | Phase 12 成果物 |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md` | Phase 12 成果物 |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`        | Phase 10 成果物 |

## 成果物

| 成果物           | パス                                     | 説明                                           |
| ---------------- | ---------------------------------------- | ---------------------------------------------- |
| PR 準備メモ      | `outputs/phase-13/pr-preparation.md`     | 提出準備情報                                   |
| 引き継ぎサマリー | `outputs/phase-13/handoff-summary.md`    | TASK-CRON-SEMANTIC-VALIDATION-001 への引き継ぎ |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | ユーザー承認確認                               |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] PR 準備メモが作成されていること
- [ ] 引き継ぎサマリーに TASK-CRON-SEMANTIC-VALIDATION-001 への引き継ぎ情報が記載されていること
- [ ] 承認チェックが記録されていること
- [ ] 矛盾・漏れがないこと
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 12 成果物確認
2. 差分要約の整理
3. 承認条件チェック
4. PR 作成（承認時のみ）
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## PR 作成制約

- ユーザーの明示承認がある場合だけ PR 作成へ進む。
- 明示承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する。

## 次のPhase

なし（TASK-CRON-SEMANTIC-VALIDATION-001 へ引き継ぎ）
