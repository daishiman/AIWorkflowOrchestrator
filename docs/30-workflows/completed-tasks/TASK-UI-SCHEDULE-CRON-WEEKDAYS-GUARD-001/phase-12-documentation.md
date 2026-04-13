# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 12                                       |
| タスクID   | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 |
| タスク名   | cronConverter 空曜日ガード処理追加       |
| 前提Phase  | Phase 11                                 |
| 後続Phase  | Phase 13                                 |
| 作成日     | 2026-04-12                               |
| ステータス | 完了                                     |

## 目的

実装ガイド・システム仕様書更新・ドキュメント更新履歴・未タスク検出・スキルフィードバック・準拠チェックの
6タスクを完了させる。

## 実行タスク

- Task 12-1: 実装ガイドを 2 パート構成で作成する
- Task 12-2: システム仕様書更新サマリーを作成する
- Task 12-3: ドキュメント更新履歴を作成する
- Task 12-4: 未タスク検出レポートを作成する
- Task 12-5: スキルフィードバックレポートを作成する
- Task 12-6: Phase 12 準拠チェックを作成する

---

## 必須タスク一覧（Task 12-1〜12-6）

| タスクID  | 内容                                          | 状態 |
| --------- | --------------------------------------------- | ---- |
| Task 12-1 | 実装ガイド作成（Part 1 / Part 2）             | 完了 |
| Task 12-2 | システム仕様書更新（Step 1-A/1-B/1-C/Step 2） | 完了 |
| Task 12-3 | ドキュメント更新履歴作成                      | 完了 |
| Task 12-4 | 未タスク検出レポート                          | 完了 |
| Task 12-5 | スキルフィードバックレポート                  | 完了 |
| Task 12-6 | Phase 12 準拠チェック                         | 完了 |

---

## Task 12-1: 実装ガイド作成（Part 1 / Part 2）

**出力先**: `outputs/phase-12/implementation-guide.md`

### Part 1: 中学生レベルの説明

#### なぜこの修正が必要だったの？

スケジュール機能では「毎週○曜日に実行する」という設定ができます。
でも、曜日を1つも選ばなかったときに、コンピューターが変な命令文を作ってしまう問題がありました。

例えると、**材料がそろっていないのに、無理やり料理名だけ書いたレシピを出してしまう**ようなものです。

#### 料理レシピで例えると

| 状況                                 | レシピ（cron式）の例 | 問題                                   |
| ------------------------------------ | -------------------- | -------------------------------------- |
| 月・水・金を選んだ場合               | `0 9 * * 1,3,5`      | 正しい！月水金の9時に実行              |
| 曜日を何も選ばなかった場合（修正前） | `0 9 * * `           | 末尾に空白があって変！                 |
| 曜日を何も選ばなかった場合（修正後） | `""`                 | 正しい！まだ作れないので、空のまま返す |

#### 解決策

`cronConverter.ts` というファイルに「材料チェック」を追加しました。
曜日リストが空っぽのとき、変な命令文を作る前に空文字を返して止める仕組みです。
これを「ガード処理」と呼びます。

---

### Part 2: 開発者向けの説明

#### 問題の詳細

`visualConfigToCron({ frequency: "weekly", weekdays: [], ... })` を呼び出すと、
`"0 9 * * "` のように末尾にスペースが残った不正なcron式が生成されていた。

UIレベルでは曜日未選択時の送信をバリデーションでブロックしているが、
純粋関数レベルでのガードが存在しなかった。

#### 修正のポイント

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| 対象ファイル | `apps/desktop/src/renderer/utils/cronConverter.ts`   |
| 修正箇所     | `visualConfigToCron` 関数内の `weekly` 分岐          |
| ガード方式   | `weekdays.length === 0` の早期リターンで空文字を返す |
| JSDoc更新    | `@returns` と `@remarks` にガード仕様を明記          |

#### TypeScript型定義の観点

```typescript
// ガード処理の実装例（参考）
if (config.frequency === "weekly" && config.weekdays.length === 0) {
  return "";
}
```

#### JSDoc記述仕様（AC-5）

```typescript
/**
 * スケジュール設定をcron式に変換する
 *
 * @param config - スケジュール設定オブジェクト
 * @returns cron式文字列。frequency が "weekly" かつ weekdays が空配列の場合は空文字を返す。
 * @remarks 空曜日は有効な cron 式にできないため、呼び出し元のバリデーションで無効入力として扱う。
 *
 * @example
 * // 正常ケース
 * visualConfigToCron({ frequency: 'weekly', weekdays: [1, 3, 5], hour: 9, minute: 0 })
 * // => "0 9 * * 1,3,5"
 *
 * // ガード処理
 * visualConfigToCron({ frequency: 'weekly', weekdays: [], hour: 9, minute: 0 })
 * // => ""
 */
```

#### 影響範囲

- `apps/desktop/src/renderer/utils/cronConverter.ts` のみ
- UIコンポーネントへの影響なし（ガード処理はUI側と独立）
- 既存の正常ケース（weekdaysあり）への影響なし

---

## Task 12-2: システム仕様書更新（Step 1-A/1-B/1-C/Step 2）

### Step 1-A: 完了タスク記録

| 項目             | 内容                                                          |
| ---------------- | ------------------------------------------------------------- |
| 完了タスクID     | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001                      |
| 完了日           | 2026-04-12                                                    |
| 実装ファイル     | `apps/desktop/src/renderer/utils/cronConverter.ts`            |
| テストファイル   | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` |
| 関連ドキュメント | `docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001/` |

**LOGS.md 更新対象**:

- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`

### Step 1-B: 実装状況テーブル更新

| タスクID                                 | 変更前 | 変更後 |
| ---------------------------------------- | ------ | ------ |
| TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 | 未実装 | 完了   |

### Step 1-C: 関連タスクテーブル更新

| 関連タスクID                               | 変更内容                                                |
| ------------------------------------------ | ------------------------------------------------------- |
| スケジュール機能関連タスク（存在する場合） | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 対応済みを記録 |

### Step 2: 新規インターフェース追加の確認

**判定**: 本タスクは `cronConverter.ts` の内部ガード処理修正のみ。
新規インターフェース・型定義の追加はなし。

**Step 2 更新**: **N/A**（内部ロジック修正のみ）

---

## Task 12-3: ドキュメント更新履歴

**出力先**: `outputs/phase-12/documentation-changelog.md`

| 更新日     | 対象ファイル                                                  | 変更内容                        |
| ---------- | ------------------------------------------------------------- | ------------------------------- |
| 2026-04-12 | `apps/desktop/src/renderer/utils/cronConverter.ts`            | 空曜日ガード処理追加・JSDoc更新 |
| 2026-04-12 | `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` | 空曜日ケースのテスト追加        |
| 2026-04-12 | タスク仕様書（本ディレクトリ）                                | Phase 1-13 仕様書の新規作成     |

---

## Task 12-4: 未タスク検出レポート

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

**検出対象**: 本タスクのスコープ外だが関連する潜在的な問題

### 検出結果

| ソース                             | 検出内容                                                            | 対応方針                         |
| ---------------------------------- | ------------------------------------------------------------------- | -------------------------------- |
| cronConverter.ts の他frequency種別 | `monthly` のような他 frequency 種別での同様の空値ガード漏れの可能性 | 新規未タスクとして記録           |
| UIバリデーションとの二重ガード設計 | 空文字退避とUIバリデーションの責務境界が明文化されていない可能性    | アーキテクチャドキュメントに記録 |

### 新規未タスク候補

| 未タスクID（候補）                | 内容                                                         | 優先度 |
| --------------------------------- | ------------------------------------------------------------ | ------ |
| TASK-CRON-ALL-FREQUENCY-GUARD-001 | 全frequency種別（monthly等）での空値ガード適用               | LOW    |
| TASK-CRON-VALIDATION-BOUNDARY-001 | UIバリデーションと空文字退避ガードの責務境界をドキュメント化 | LOW    |

---

## Task 12-5: スキルフィードバックレポート

**出力先**: `outputs/phase-12/skill-feedback-report.md`

### フィードバック内容

| フィードバックID | 内容                                                                                                        | 種別     |
| ---------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| FB-CRON-01       | UIバリデーションが存在する場合でも純粋関数レベルの空文字退避ガードが必要というパターンは再利用可能な知見    | 知見     |
| FB-CRON-02       | `visualConfigToCron` のようなコンバーター関数は、不正入力に対するテストケースを仕様書作成時点で洗い出すべき | 改善提案 |

### スキル改善提案

| スキル                     | 改善内容                                                                        |
| -------------------------- | ------------------------------------------------------------------------------- |
| task-specification-creator | Phase 4（テスト設計）のチェック項目に「変換関数の不正入力ケース」を標準追加する |
| aiworkflow-requirements    | cronConverter関連の仕様に「ガード処理の責務」を記録する                         |

---

## Task 12-6: Phase 12 準拠チェック

**出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

### チェック項目

| チェック項目                                              | 状態   |
| --------------------------------------------------------- | ------ |
| Task 12-1（実装ガイド）: Part 1（中学生レベル）が作成済み | 未確認 |
| Task 12-1（実装ガイド）: Part 2（開発者向け）が作成済み   | 未確認 |
| Task 12-2（仕様更新）: Step 1-A〜1-C 完了済み             | 未確認 |
| Task 12-2（仕様更新）: Step 2 の要否判定済み（N/A判定）   | 未確認 |
| Task 12-3（更新履歴）: ドキュメント変更履歴が記録済み     | 未確認 |
| Task 12-4（未タスク検出）: 0件でも出力済み（候補記録）    | 未確認 |
| Task 12-5（フィードバック）: 改善点が記録済み             | 未確認 |
| 全6成果物が `outputs/phase-12/` に存在する                | 未確認 |

## 実行コマンド

```bash
# LOGS.md 更新確認
grep -n "TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001" \
  .claude/skills/task-specification-creator/LOGS.md

# 成果物の存在確認
ls outputs/phase-12/

# 準拠チェック実行
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
```

## 参照資料

| 資料名                   | パス                                      | 用途                       |
| ------------------------ | ----------------------------------------- | -------------------------- |
| Phase 2 設計             | `phase-2-design.md`                       | ガード方針の前提           |
| Phase 5 実装             | `phase-5-implementation.md`               | 実装内容の確認             |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`               | テスト拡充の確認           |
| Phase 7 カバレッジ確認   | `phase-7-coverage-check.md`               | カバレッジ結果の確認       |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                  | リファクタリング有無の確認 |
| Phase 9 品質保証         | `phase-9-quality-assurance.md`            | 品質ゲート結果の確認       |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`  | Phase 11 成果物            |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md` | AC確認                     |

## 成果物

| 成果物                       | パス                                                     | 説明                                 |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------ |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生）+ Part 2（開発者）   |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C の記録・Step 2 N/A判定 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | ドキュメント変更履歴                 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク候補一覧（0件含む）          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | スキル改善提案                       |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 全タスク完了確認                     |

## 完了条件

- [ ] Task 12-1（実装ガイド）: Part 1・Part 2 ともに作成済み
- [ ] Task 12-2（仕様更新）: Step 1-A〜1-C 完了、Step 2 は N/A 判定済み
- [ ] Task 12-3（更新履歴）: ドキュメント変更履歴が記録済み
- [ ] Task 12-4（未タスク検出）: 0件でも出力済み（候補を記録）
- [ ] Task 12-5（フィードバック）: 改善点が記録済み
- [ ] Task 12-6（準拠チェック）: 全チェック項目が確認済み
- [ ] 全6成果物が `outputs/phase-12/` に存在する

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001
```

## 次Phase

Phase 13: PR作成
