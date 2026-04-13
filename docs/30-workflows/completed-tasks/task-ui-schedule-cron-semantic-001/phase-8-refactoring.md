# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 8                                  |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名     | 意味論的 cron バリデーション追加   |
| タスク種別 | implementation                     |
| 前Phase    | Phase 7: テストカバレッジ確認      |
| 次Phase    | Phase 9: 品質保証                  |
| ステータス | 未実施                             |
| 作成日     | 2026-04-12                         |

---

## 目的

Phase 5 の実装を clean code の観点でレビューし、重複・命名ドリフト・過剰な複雑さを取り除く。

**重要**: リファクタリングはインターフェースを変更しない。`validateCronExpression` のシグネチャ・戻り値型・`ValidateCronOptions` 型定義は変更禁止。既存テスト全件 PASS を維持する。

---

## [Feedback RT-03 対応] 変更内容の記録形式

リファクタリングで変更した内容は以下のテーブルに記録する:

| 対象                          | Before                                                       | After                                                                       | 理由                 |
| ----------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- | -------------------- |
| `options.semantic` 判定の配置 | `validateCronExpression` 内にインライン                      | 独立した private 関数 `_validateCronSemantic` に分離（候補）                | テスタビリティの向上 |
| JSDoc コメント                | 「semantic validation は行わない」                           | 「options.semantic が true の場合のみ意味論的検証を行う」                   | 実装との整合         |
| （例）変数名                  | `result`（汎用的）                                           | `semanticError`（意図明確）                                                 | 命名ドリフト解消     |
| （例）try-catch の粒度        | `CronExpressionParser.parse` と `interval.next()` をまとめる | `interval.next()` のみ catch（`CronExpressionParser.parse` は上位でカバー） | エラー原因の明確化   |

※ 実際の変更内容を記録する。変更がない行は削除または「変更なし」と記録する。

---

## 実行タスク

### タスク1: 重複コードの検出

`cron-parser` 呼び出し箇所が `scheduleConfigValidator.ts` 内で重複していないか確認する。

```bash
# cron-parser の import・呼び出し箇所を確認
grep -n "CronExpressionParser.parse\|cron-parser" \
  apps/desktop/src/renderer/utils/scheduleConfigValidator.ts
```

**確認観点**:

- `CronExpressionParser.parse` が 1 箇所のみで呼ばれているか
- `interval.next()` の呼び出しが重複していないか
- semantic チェックロジックが複数の関数に分散していないか

### タスク2: 命名一貫性の確認

TypeScript / プロジェクトの camelCase 規則に従っているか確認する。

```bash
# 変数・関数名の確認
grep -n "function\|const\|let\|var" \
  apps/desktop/src/renderer/utils/scheduleConfigValidator.ts
```

**確認観点**:

- `ValidateCronOptions` → PascalCase（インターフェース名）
- `validateCronExpression` → camelCase（関数名）
- `_validateCronSemantic` → アンダースコア prefix（private 関数候補）
- semantic 関連の変数名が意味を明確に表しているか

### タスク3: JSDoc 更新確認

AC-5（JSDoc 更新）の要件が満たされているか確認する。

**確認観点**:

- `validateCronExpression` の JSDoc に `@param options.semantic` の説明があるか
- 「options.semantic が true の場合のみ意味論的検証を行う」旨が記述されているか
- 「semantic validation は行わない」等の古い記述が残っていないか
- `ValidateCronOptions` インターフェースの JSDoc が最新の実装と整合しているか

```bash
# JSDoc の確認
grep -A 10 "\/\*\*" \
  apps/desktop/src/renderer/utils/scheduleConfigValidator.ts
```

### タスク4: リファクタリング後のテスト全件 PASS 確認

リファクタリング完了後に全テストが PASS することを確認する。

```bash
pnpm vitest run \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
  apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

**確認観点**:

- 既存テスト SCV-01〜SCV-12 が全件 PASS していること
- Phase 4 で追加した TC-01〜TC-08 の期待値が引き続き維持されていること
- リファクタリングによるリグレッションがないこと

---

## リファクタリング判断基準

| 変更種別               | 実施判断                                                           |
| ---------------------- | ------------------------------------------------------------------ |
| 関数の分離             | 20行以上のインラインブロックかつ独立テストが有効な場合のみ実施     |
| 変数名の変更           | 意図が不明確な場合のみ変更（既存テストの期待値に影響しない範囲で） |
| JSDoc の更新           | 実装と不整合がある場合は必須                                       |
| import の整理          | 未使用 import が存在する場合は必須                                 |
| コメントの追加・削除   | 「何をしているか」ではなく「なぜそうするか」を説明するものに限定   |
| インターフェースの変更 | **禁止**（後方互換性を破壊するため）                               |
| 戻り値型の変更         | **禁止**（シグネチャ変更は Phase 2 確定済み設計の逸脱）            |

---

## 参照資料

| 資料名                              | パス                                                                    | 説明                                     |
| ----------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| Phase 5 実装計画書                  | `outputs/phase-5/implementation-plan.md`                                | リファクタリング対象の実装内容           |
| Phase 7 カバレッジレポート          | `outputs/phase-7/coverage-report.md`                                    | カバレッジ目標達成状況（変更影響確認用） |
| Phase 2 API 設計                    | `outputs/phase-2/api-design.md`                                         | インターフェース定義（変更禁止の基準）   |
| scheduleConfigValidator 実装        | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | リファクタリング対象ファイル             |
| scheduleConfigValidator テスト      | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | 既存テスト SCV-01〜SCV-12                |
| scheduleConfigValidator edge テスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | Phase 4 追加テスト                       |

---

## 成果物

| 成果物               | 配置先                               | 形式     |
| -------------------- | ------------------------------------ | -------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | Markdown |

**`outputs/phase-8/refactoring-log.md` に含める内容**:

- 変更内容の記録テーブル（[Feedback RT-03 対応] 形式）
- 変更なしの場合は「リファクタリング不要：Phase 5 実装は clean code 基準を満たす」と記録
- リファクタリング後のテスト実行結果（全件 PASS 確認）
- カバレッジへの影響（Phase 7 数値から変動がないこと）

---

## 統合テスト連携

- Phase 7 でカバレッジ目標を達成した状態でリファクタリングを開始すること
- リファクタリング後も Phase 7 と同水準のカバレッジを維持していることを確認すること
- Phase 9（品質保証）でのインプットとして: リファクタリング済みの実装・更新済み JSDoc・全テスト PASS の状態を提供する
- NON_VISUAL 評価（Phase 11）：リファクタリングは内部ロジックのみの変更のため、UI 動作確認不要

---

## 完了条件チェックリスト

- [ ] 重複コードの検出が完了し、重複がある場合は解消されていること
- [ ] 命名一貫性の確認が完了し、不整合がある場合は修正されていること
- [ ] JSDoc が実装と整合しており、AC-5 の要件が満たされていること
- [ ] インターフェース（シグネチャ・戻り値型・`ValidateCronOptions`）が変更されていないこと
- [ ] リファクタリング後に全テスト（SCV-01〜SCV-12 + Phase 4 追加分）が PASS していること
- [ ] カバレッジが Phase 7 の目標値（Line ≥ 90%, Branch ≥ 85%）を維持していること
- [ ] `outputs/phase-8/refactoring-log.md` に変更内容または「変更なし」が記録されていること

---

## Phase 末端アクション【必須】

Phase 8 完了時に以下を実行すること:

1. `outputs/phase-8/refactoring-log.md` に変更内容テーブルを記録する（変更なしの場合はその旨を記録）
2. リファクタリング後のテスト全件 PASS を確認し、結果を記録する
3. インターフェースが変更されていないことを明示的に確認する（「シグネチャ変更なし」等）
4. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 9 へ進む

---

## 依存関係

| 依存Phase/タスク | 依存内容                                                       |
| ---------------- | -------------------------------------------------------------- |
| Phase 7 完了     | カバレッジ目標（Line ≥ 90%, Branch ≥ 85%）が達成済みであること |
| Phase 5 完了     | 意味論的バリデーションロジックの実装が完了していること         |

---

## Phase 実行記録テンプレート

```markdown
## Phase 8 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- 重複コード検出: [ ] 重複なし / [ ] 重複あり・解消済み
- 命名一貫性確認: [ ] 問題なし / [ ] 修正あり
- JSDoc 更新確認: [ ] 最新・整合済み / [ ] 更新済み
- インターフェース変更: [ ] 変更なし（正常）/ [ ] 変更あり（要修正）
- テスト全件 PASS: [ ] YES / [ ] NO（失敗テスト: ）
- カバレッジ維持: [ ] 維持（Line X%, Branch X%）/ [ ] 低下（要対応）
- 変更内容の記録: [ ] refactoring-log.md に記録済み
- 完了条件充足状況: X / 7 項目完了
- Phase 9 移行判定: [ ] PASS（Phase 9 へ進む）/ [ ] HOLD（テスト失敗・インターフェース変更あり）
```

---

## 次のPhase案内

**Phase 9: 品質保証** — lint / typecheck / test / coverage の一括判定を行い、Phase 10 レビューゲートへの進入可否を判定する。Phase 8 でリファクタリングが完了した状態で品質チェックを実施し、AC-1〜AC-5 の最終確認を行う。
