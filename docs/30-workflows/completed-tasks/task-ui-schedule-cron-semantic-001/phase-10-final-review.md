# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 10                                 |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名     | 意味論的 cron バリデーション追加   |
| タスク種別 | implementation                     |
| 前Phase    | Phase 9: 品質保証                  |
| 次Phase    | Phase 11: 非視覚的評価             |
| ステータス | 未実施                             |
| 作成日     | 2026-04-12                         |

---

## 目的

AC-1〜AC-5 の受け入れ基準に対して PASS / MINOR / MAJOR の判定を行い、Phase 11 への進入可否を決定する。

Phase 9 の品質保証レポートを基に、機能性・後方互換性・パフォーマンス・コード品質・ドキュメントの各観点を総合的にレビューする。

---

## レビュー観点テーブル

| 観点           | 確認内容                                   | 判定基準                                                                       |
| -------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| 機能性         | semantic=true 時に不正な日付が検出されるか | AC-1: `"0 0 31 2 *"` + `{ semantic: true }` がエラーを返す                     |
| 後方互換性     | semantic 未指定時に既存動作が維持されるか  | AC-2: 正常 cron が null、AC-3: SCV-01〜SCV-12 全件 PASS                        |
| パフォーマンス | cron-parser 呼び出しが必要な場合のみか     | `semantic=false` の場合は cron-parser 不使用（Phase 9 typecheck・lint で確認） |
| コード品質     | lint・typecheck・全テスト PASS             | AC-3: 全テスト PASS、AC-4: カバレッジ Line ≥ 90% / Branch ≥ 85%                |
| ドキュメント   | JSDoc 更新済みか                           | AC-5: `options.semantic` の説明が JSDoc に記述されていること                   |

---

## 判定基準

| 判定  | 条件                                                                |
| ----- | ------------------------------------------------------------------- |
| PASS  | 全 AC（AC-1〜AC-5）・全テスト・lint・typecheck が PASS              |
| MINOR | コードスタイルの細かい指摘（変数名・コメント等）。Phase 12 で修正可 |
| MAJOR | AC 未達・テスト失敗・型エラー → 該当 Phase（主に Phase 5）へ戻る    |

### MAJOR 判定となる条件例

- AC-1: `"0 0 31 2 *"` + `{ semantic: true }` がエラーを返さない場合
- AC-3: 既存テスト SCV-01〜SCV-12 のいずれかが FAIL している場合
- typecheck エラーが残存している場合
- インターフェース（`ValidateCronOptions` 型・`validateCronExpression` シグネチャ）が Phase 2 設計から変更されている場合

---

## MINOR 追跡テーブル（gate-decision.md 用）

Phase 10 で MINOR 判定された指摘を追跡する（指摘がある場合のみ記入）:

| MINOR ID  | 観点         | 指摘内容                       | 解決予定Phase | 解決確認Phase | 備考 |
| --------- | ------------ | ------------------------------ | ------------- | ------------- | ---- |
| SEM-M-10A | （例）コード | エラーメッセージの文言を定数化 | Phase 12      | Phase 12      | -    |
| SEM-M-10B | （例）テスト | テストケースのコメント不足     | Phase 12      | Phase 12      | -    |

※ 指摘がない場合は「MINOR なし」と記録する。

---

## MINOR 判定の自動未タスク化ルール

Phase 12 の未タスク検出で対応する。

- MINOR 追跡テーブルに記録された指摘は `outputs/phase-10/gate-decision.md` に保存する
- Phase 12 では `gate-decision.md` を参照し、MINOR 指摘の解決確認を行う
- 解決済みの場合は「解決確認Phase」列に Phase 番号を記入する
- Phase 12 完了時に MINOR 指摘が全件解決済みであることを確認する

---

## Phase 11 開始条件

以下のいずれかを満たす場合のみ Phase 11 へ進む:

- [ ] 総合判定が「PASS」であること
- [ ] 総合判定が「MINOR のみ」であり、MAJOR 判定が 0 件であること

**MAJOR 判定が存在する場合**: 指摘内容に基づき該当 Phase（主に Phase 5）へ戻り、修正後に Phase 9 から再実施する。

---

## 参照資料

| 資料名                              | パス                                                                    | 説明                                     |
| ----------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| Phase 9 品質保証レポート            | `outputs/phase-9/quality-report.md`                                     | 品質チェック結果・AC-1〜AC-5 確認結果    |
| Phase 8 リファクタリングログ        | `outputs/phase-8/refactoring-log.md`                                    | コード品質改善の記録                     |
| Phase 7 カバレッジレポート          | `outputs/phase-7/coverage-report.md`                                    | カバレッジ数値の参照                     |
| Phase 2 API 設計                    | `outputs/phase-2/api-design.md`                                         | シグネチャ・インターフェース定義（基準） |
| Phase 1 受け入れ基準                | `outputs/phase-1/acceptance-criteria.md`                                | AC-1〜AC-5 の定義                        |
| scheduleConfigValidator 実装        | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | レビュー対象の最終実装                   |
| scheduleConfigValidator テスト      | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | AC-3 確認対象（SCV-01〜SCV-12）          |
| scheduleConfigValidator edge テスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | AC-1, AC-2, AC-4 確認対象                |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Markdown |
| ゲート判定記録   | `outputs/phase-10/gate-decision.md`       | Markdown |

**`outputs/phase-10/final-review-result.md` に含める内容**:

- レビュー観点テーブルの判定結果（各観点の PASS / MINOR / MAJOR）
- AC-1〜AC-5 の最終判定結果
- 総合判定（PASS / MINOR のみ / MAJOR あり）
- MINOR 追跡テーブル（指摘がある場合）
- Phase 11 開始条件の充足確認

**`outputs/phase-10/gate-decision.md` に含める内容**:

- 総合判定
- MINOR 追跡テーブル（Phase 12 での解決追跡用）
- Phase 11 移行判定（PASS / HOLD）

---

## 統合テスト連携

- Phase 9 の品質保証レポートを必須インプットとする
- PASS または MINOR のみの場合、Phase 11（非視覚的評価）へ進む
- Phase 11 では `scheduleConfigValidator.ts` の変更がバリデーターロジックのみであることを確認する（UI スクリーンショット不要）
- Phase 12 では MINOR 追跡テーブルの指摘を未タスクとして対応する
- Phase 13 blocked 条件: MAJOR 判定が最終的に残存している場合は PR 作成不可

---

## 完了条件チェックリスト

- [ ] 機能性レビュー（AC-1）が完了し、判定が記録されていること
- [ ] 後方互換性レビュー（AC-2, AC-3）が完了し、判定が記録されていること
- [ ] パフォーマンスレビュー（semantic=false 時の cron-parser 不使用）が確認されていること
- [ ] コード品質レビュー（lint・typecheck・AC-3・AC-4）が完了し、判定が記録されていること
- [ ] ドキュメントレビュー（AC-5・JSDoc 更新）が完了し、判定が記録されていること
- [ ] 総合判定（PASS / MINOR のみ / MAJOR あり）が確定していること
- [ ] MINOR 追跡テーブルが記録済みであること（指摘なしの場合は「MINOR なし」と記録）
- [ ] `outputs/phase-10/final-review-result.md` に全レビュー結果が記録されていること
- [ ] `outputs/phase-10/gate-decision.md` に総合判定と Phase 11 移行判定が記録されていること
- [ ] MAJOR がある場合は戻り先 Phase が特定されていること

---

## Phase 末端アクション【必須】

Phase 10 完了時に以下を実行すること:

1. `outputs/phase-10/final-review-result.md` に各観点のレビュー結果と判定を記録する
2. `outputs/phase-10/gate-decision.md` に総合判定と MINOR 追跡テーブルを記録する
3. MINOR が存在する場合は MINOR 追跡テーブルに追記し、Phase 12 での解決を予定する
4. MAJOR が存在する場合は指摘内容に基づく戻り先 Phase を特定し、Phase 9 からの再実施を計画する
5. 判定が「PASS」または「MINOR のみ」の場合は Phase 11 開始条件を明示的に確定する（「PASS: Phase 11 へ進む」等）
6. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 11 へ進む

---

## 依存関係

| 依存Phase/タスク | 依存内容                                                                |
| ---------------- | ----------------------------------------------------------------------- |
| Phase 9 完了     | 全品質チェック（typecheck・lint・test・coverage）が PASS 済みであること |
| Phase 8 完了     | リファクタリング完了・JSDoc 更新済みであること                          |
| Phase 7 完了     | カバレッジ目標（Line ≥ 90%, Branch ≥ 85%）が達成済みであること          |

---

## Phase 実行記録テンプレート

```markdown
## Phase 10 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- レビュー観点別判定:
  - 機能性（AC-1）: [ ] PASS / [ ] MINOR / [ ] MAJOR
  - 後方互換性（AC-2, AC-3）: [ ] PASS / [ ] MINOR / [ ] MAJOR
  - パフォーマンス: [ ] PASS / [ ] MINOR / [ ] MAJOR
  - コード品質（AC-3, AC-4）: [ ] PASS / [ ] MINOR / [ ] MAJOR
  - ドキュメント（AC-5）: [ ] PASS / [ ] MINOR / [ ] MAJOR
- 総合判定: [ ] PASS / [ ] MINOR のみ / [ ] MAJOR あり
- MINOR 件数: X 件
- MAJOR 件数: X 件
- MAJOR がある場合の戻り先: Phase X（理由: ）
- 完了条件充足状況: X / 10 項目完了
- Phase 11 移行判定: [ ] PASS（Phase 11 へ進む）/ [ ] HOLD（Phase X へ戻る）
```

---

## 次のPhase案内

**PASS / MINOR のみの場合**: **Phase 11: 非視覚的評価** — `scheduleConfigValidator.ts` の変更はバリデーターロジックのみのため、UI スクリーンショットは不要。コード動作確認（コマンド出力）のみで評価を完了する。MINOR 追跡テーブルの指摘は Phase 12 で対応する。

**MAJOR あり（戻る場合）**: 指摘内容に基づき該当 Phase（主に Phase 5: 実装）へ戻り、修正後に Phase 9（品質保証）から再実施する。Phase 13 blocked 条件として、MAJOR 判定が残存している場合は PR 作成不可。
