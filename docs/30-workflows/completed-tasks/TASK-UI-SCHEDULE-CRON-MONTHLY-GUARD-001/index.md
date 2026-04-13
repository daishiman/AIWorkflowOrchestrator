# TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 - タスク実行仕様書

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001         |
| 機能名       | cronConverter monthly dayOfMonth ガード処理追加 |
| 分類         | バグ修正                                        |
| 対象機能     | スケジュール設定 / cron式変換                   |
| 優先度       | 中                                              |
| 見積もり規模 | 小規模                                          |
| 作成日       | 2026-04-13                                      |
| ステータス   | Phase 12 完了 / Phase 13 保留                   |
| 総Phase数    | 13                                              |
| 関連Issue    | #2108                                           |

---

## 重点論点

- 真の論点: `monthly` の `dayOfMonth` が整数 1-31 以外でも不正な cron 式を生成しないこと
- 依存関係・責務境界: UI の入力制御、`visualConfigToCron`、cron 解析の責務を分離すること
- 価値とコスト: 1 つの小さなガードと少数のテストで、不正 cron 生成という高コスト障害を防ぐこと
- 改善優先順位: 1) converter の最小ガード 2) parser の誤分類防止 3) テスト追加 4) ドキュメント同期 5) 最終ゲート
- 4条件評価: 矛盾なし・漏れなし・整合性あり・依存関係整合の全件 PASS をゴールにする

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了       |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了       |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了       |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了       |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了       |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了       |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了       |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了       |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了       |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了       |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了       |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了       |
| 13    | PR作成（承認待ち）   | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 保留       |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

※ Phase 13 はユーザー承認後のみ実施する。

---

## 概要

`cronConverter.ts` の `monthly` frequency において、`dayOfMonth` が有効範囲（1-31）外の値（0, 32等）の場合に
不正なcron式が生成される問題のガード処理追加タスク。

`weekly` 分岐の空 `weekdays` ガード（TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 で対処済み）と
対称パターンで早期リターンを追加する。

追加で `cronParser.ts` の monthly 逆変換も補強し、`0 9 0 * *` のような不正な cron は
`custom` フォールバックへ落ちるようにした。`cronToHumanReadable` と `VisualCronPicker` の
初期化/プレビュー経路でも不正な monthly 値を誤分類しないことを確認している。

### 対象ファイル

- `apps/desktop/src/renderer/utils/cronConverter.ts`
- `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`

### 受け入れ条件（Acceptance Criteria）

| AC番号 | 条件                                                               | 検証方法       |
| ------ | ------------------------------------------------------------------ | -------------- |
| AC-1   | `dayOfMonth=0` のとき `""` を返す                                  | 単体テスト     |
| AC-2   | `dayOfMonth=32` のとき `""` を返す                                 | 単体テスト     |
| AC-3   | `dayOfMonth=-1` のとき `""` を返す                                 | 単体テスト     |
| AC-4   | `dayOfMonth=1` のとき `"0 9 1 * *"` を返す（正常ケース）           | 単体テスト     |
| AC-5   | `dayOfMonth=31` のとき `"0 9 31 * *"` を返す（正常ケース・境界値） | 単体テスト     |
| AC-6   | 既存テスト（`cronConverter.edge.test.ts` 全件）が引き続きパスする  | vitest 実行    |
| AC-7   | JSDoc の `@returns` にガード仕様が追記されている                   | コードレビュー |

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: Phase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                   |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1     | 要件定義書, 受け入れ基準一覧, spec-extraction-map.md                                                                         |
| 2     | 設計書（ガード処理設計, テスト設計）                                                                                         |
| 3     | 設計レビュー結果, ゲート判定書                                                                                               |
| 4     | テストケース仕様書, Red状態確認結果                                                                                          |
| 5     | 実装サマリー, 変更ファイル一覧                                                                                               |
| 6     | 拡張テストケース, 回帰テスト結果                                                                                             |
| 7     | カバレッジレポート                                                                                                           |
| 8     | リファクタリング計画書, 再テスト結果                                                                                         |
| 9     | 品質保証レポート                                                                                                             |
| 10    | 最終レビュー結果, 出荷準備チェックリスト                                                                                     |
| 11    | 手動テスト結果, 証跡インデックス                                                                                             |
| 12    | 実装ガイド, システム仕様更新サマリー, ドキュメント更新ログ, 未タスク検出レポート, スキルフィードバック, Phase 12準拠チェック |
| 13    | PR作成記録                                                                                                                   |

---

## 参照情報

| 資料名                | パス                                                                                   | 用途                 |
| --------------------- | -------------------------------------------------------------------------------------- | -------------------- |
| 対象実装ファイル      | `apps/desktop/src/renderer/utils/cronConverter.ts`                                     | ガード処理追加対象   |
| 関連実装ファイル      | `apps/desktop/src/renderer/utils/cronParser.ts`                                        | monthly 逆変換補強   |
| 関連表示ファイル      | `apps/desktop/src/renderer/utils/cronHumanizer.ts`                                     | 逆変換結果の表示     |
| テストファイル        | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`                          | テスト追加対象       |
| テストファイル        | `apps/desktop/src/__tests__/utils/cronParser.test.ts`                                  | monthly 逆変換補強   |
| テストファイル        | `apps/desktop/src/__tests__/utils/cronHumanizer.test.ts`                               | 表示補強の回帰確認   |
| テストファイル        | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.test.tsx`             | UI 初期化の回帰確認  |
| 型定義ファイル        | `apps/desktop/src/renderer/types/visualCronConfig.ts`                                  | dayOfMonth型定義確認 |
| 発見元タスク仕様書    | `docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/`                          | 実装パターン参考     |
| unassigned-task仕様書 | `docs/30-workflows/unassigned-task/TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001.md`         | 元仕様書             |
| 関連 backlog          | `docs/30-workflows/unassigned-task/TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001.md`         | UI 検証の残課題      |
| Phase 12 検証基準     | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md` | Phase 12 完了条件    |
| GitHub Issue          | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2108                        | Issue #2108          |

---

_このファイルは 2026-04-13 に作成されました。_
