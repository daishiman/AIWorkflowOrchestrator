# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 値                                 |
| ---------- | ---------------------------------- |
| Phase      | 11                                 |
| タスクID   | TASK-UI-SCHEDULE-CRON-SEMANTIC-001 |
| 機能名     | 意味論的 cron バリデーション追加   |
| タスク種別 | implementation                     |
| 視覚評価   | **NON_VISUAL**                     |
| 前Phase    | Phase 10: 最終レビューゲート       |
| 次Phase    | Phase 12: ドキュメント更新         |
| ステータス | 未実施                             |
| 作成日     | 2026-04-12                         |

---

## 目的

Phase 10 の最終レビューゲートを通過した実装の品質を、手動テスト・自動テスト実行・後方互換性確認を通じて最終検証する。

本タスクは **NON_VISUAL** タスクであるため、スクリーンショット証跡は不要。自動テスト結果と既知制限リストを代替記録として残す。

---

## [Feedback BEFORE-QUIT-001 対応] NON_VISUAL タスク宣言

**本タスクは NON_VISUAL タスクのため「実地操作不可」を明記する。**

| 項目                   | 内容                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| 実地操作               | 不可（UIコンポーネントの変更なし）                                    |
| スクリーンショット証跡 | 不要                                                                  |
| 代替証跡               | 自動テスト（vitest）実行結果 + 後方互換性確認ログ                     |
| 記録先                 | `outputs/phase-11/manual-test-result.md` / `manual-test-checklist.md` |

---

## NON_VISUAL 判定理由

- `scheduleConfigValidator.ts` は renderer utility であり、UIコンポーネントを直接変更しない
- UIに表示されるエラーメッセージは既存の仕組みを流用（変更なし）
- `ValidateCronOptions` インターフェースと semantic フラグはバリデーションロジック層のみに影響する
- スクリーンショット証跡はバリデーターロジックの正確性を検証する手段として不適切

**主な証跡ソース**: 自動テスト（vitest）の実行結果

---

## 実行タスク

### タスク1: 自動テスト全件実行と結果記録

以下のコマンドを実行し、全テストが PASS することを確認する。

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts \
              apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts
```

**確認ポイント**:

- [ ] `validateCronExpression("0 0 31 2 *", { semantic: true })` が非 null エラー文字列を返すテストが PASS すること（AC-1）
- [ ] `validateCronExpression("0 0 * * *")` 等の正常ケースが null を返すテストが PASS すること（AC-2）
- [ ] 既存テスト SCV-01〜SCV-12 が全件 PASS すること（AC-3）
- [ ] 新規追加テストケースが全件 PASS し、カバレッジが向上していること（AC-4）

**結果記録先**: `outputs/phase-11/manual-test-result.md`

---

### タスク2: 手動確認チェックリスト（UI呼び出し経路の確認）

`scheduleConfigValidator.ts` を呼び出す UI コンポーネントが `semantic` オプションなしで呼び出していることを確認し、後方互換性の実地確認を行う。

**確認コマンド**:

```bash
# validateCronExpression の呼び出し箇所を確認（後方互換性の実地確認）
grep -rn "validateCronExpression" apps/desktop/src/renderer/
```

**確認ポイント**:

- [ ] `validateCronExpression` を呼び出す UI コンポーネント（ScheduleDialog 等）が `semantic` オプションなしで呼び出していること
- [ ] 既存の呼び出しが変更されていないこと（後方互換性の維持）
- [ ] `validateSkillWizardScheduleConfig` が内部で `validateCronExpression` を呼び出す際に `options` を渡していないこと

**コンポーネントへの影響なし確認**:

```bash
# semantic オプション付きで呼び出している箇所がないことを確認（UIコンポーネントは既存呼び出しのまま）
grep -rn "validateCronExpression.*semantic" apps/desktop/src/renderer/
```

期待結果: 該当なし（UIコンポーネントは semantic オプションを使用しない）

---

### タスク3: 既知制限リスト

以下の制限事項を記録する（`outputs/phase-11/manual-test-checklist.md` 参照）。

| 制限ID  | 内容                                                                                                           | 対応方針       |
| ------- | -------------------------------------------------------------------------------------------------------------- | -------------- |
| LIM-001 | day-of-month と day-of-week の組み合わせは、`cron-parser@5.5.0` の実挙動に合わせて安全側に拒否される場合がある | 仕様として許容 |
| LIM-002 | タイムゾーンによる日付変更は考慮外（UTC基準のバリデーション）                                                  | スコープ外     |
| LIM-003 | `cron-parser` が返すエラーメッセージは英語のみ（i18n未対応）                                                   | 現状許容       |
| LIM-004 | `validateCronExpression` は「到達可能かどうか」を見るため、理由説明は返さない                                  | 現状仕様       |

---

## 成果物の主ソース記録（NON_VISUAL必須）

| 項目                             | 内容                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------ |
| 証跡の主ソース                   | 自動テスト名/件数（scheduleConfigValidator.test.ts + edge.test.ts）                  |
| スクリーンショットを作らない理由 | UIコンポーネントの変更なし、バリデーターロジックのみの変更                           |
| テストファイル                   | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`（SCV-01〜SCV-12） |
| エッジテストファイル             | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`（追加分）    |
| 後方互換性確認                   | `grep -rn "validateCronExpression" apps/desktop/src/renderer/` の実行結果            |

---

## 参照資料

| 資料名                               | パス                                                                    | 説明                             |
| ------------------------------------ | ----------------------------------------------------------------------- | -------------------------------- |
| scheduleConfigValidator 実装         | `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`            | バリデーターロジック（変更対象） |
| scheduleConfigValidator テスト       | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`      | SCV-01〜SCV-12 の既存テスト      |
| scheduleConfigValidator エッジテスト | `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts` | 追加エッジケーステスト           |
| Phase 1 受け入れ基準                 | `outputs/phase-1/acceptance-criteria.md`                                | AC-1〜AC-5 の定義                |
| Phase 10 最終レビュー結果            | `outputs/phase-10/final-review-result.md`                               | 最終レビューゲートの判定結果     |

---

## 成果物

| 成果物                 | 配置先                                      | 形式     |
| ---------------------- | ------------------------------------------- | -------- |
| 手動テスト実行結果     | `outputs/phase-11/manual-test-result.md`    | Markdown |
| 手動確認チェックリスト | `outputs/phase-11/manual-test-checklist.md` | Markdown |
| 発見された問題リスト   | `outputs/phase-11/discovered-issues.md`     | Markdown |

---

## 統合テスト連携

**Phase 1〜11 必須の統合テスト連携**。本 Phase での確認内容:

| Phase    | 連携内容                                                                       |
| -------- | ------------------------------------------------------------------------------ |
| Phase 1  | 受け入れ基準 AC-1〜AC-5 の最終検証（全項目が Phase 11 で PASS することを確認） |
| Phase 4  | TDD で作成した TC-01〜TC-08 の期待値が満たされていることを確認                 |
| Phase 6  | 追加テストケースが全件 PASS していることを確認（カバレッジ向上確認）           |
| Phase 9  | 品質保証 Phase での結果との整合性を確認（回帰テストが PASS 継続していること）  |
| Phase 10 | 最終レビューゲートでの MINOR 指摘事項が解決済みであることを確認                |

---

## 完了条件チェックリスト

- [ ] 自動テスト全件（SCV-01〜SCV-12 + 追加分）が PASS していること
- [ ] `validateCronExpression("0 0 31 2 *", { semantic: true })` がエラーを返すことが自動テストで確認済みであること（AC-1）
- [ ] `validateCronExpression("0 0 * * *")` が null を返すことが自動テストで確認済みであること（AC-2）
- [ ] UI コンポーネントからの既存呼び出しが後方互換性を維持していることが確認済みであること（AC-3）
- [ ] カバレッジが Phase 6 以前より向上していることが確認済みであること（AC-4）
- [ ] 既知制限リスト（LIM-001〜LIM-004）が `outputs/phase-11/manual-test-checklist.md` に記録されていること
- [ ] `outputs/phase-11/discovered-issues.md` に発見された問題（または「問題なし」）が記録されていること
- [ ] `outputs/phase-11/` 配下の全成果物が生成されていること

---

## Phase 末端アクション【必須】

Phase 11 完了時に以下を実行すること:

1. `outputs/phase-11/manual-test-result.md` に vitest 実行結果（件数・PASS/FAIL）を記録する
2. `outputs/phase-11/manual-test-checklist.md` に手動確認チェックリスト結果と既知制限リストを記録する
3. `outputs/phase-11/discovered-issues.md` に発見された問題を記録する（問題がない場合は「問題なし」と明記）
4. 全完了条件チェックリストを確認し、未完了項目がある場合は完了させてから Phase 12 へ進む

---

## 依存関係

| 依存Phase/タスク | 依存内容                                                                       |
| ---------------- | ------------------------------------------------------------------------------ |
| Phase 10 完了    | 最終レビューゲートで PASS または MINOR のみと判定されること                    |
| Phase 5 完了     | `validateCronExpression` の semantic 実装が完了していること                    |
| Phase 6 完了     | 追加テストケースが `scheduleConfigValidator.edge.test.ts` に追記されていること |

---

## Phase 実行記録テンプレート

```markdown
## Phase 11 実行記録

- 実行日時: YYYY-MM-DD HH:mm
- 実行者: -
- NON_VISUAL 確認: [x] 実地操作不可・スクリーンショット不要を確認済み
- タスク1（自動テスト）結果:
  - SCV-01〜SCV-12: [ ] 全件 PASS / [ ] FAIL（件数: X）
  - 追加テスト: [ ] 全件 PASS / [ ] FAIL（件数: X）
  - AC-1 確認: [ ] PASS / [ ] FAIL
  - AC-2 確認: [ ] PASS / [ ] FAIL
- タスク2（後方互換性確認）結果:
  - UIコンポーネントへの影響: [ ] なし / [ ] あり（詳細: ）
- タスク3（既知制限リスト）: [ ] 記録済み
- 発見された問題: [ ] なし / [ ] あり（詳細: ）
- 完了条件充足状況: X / 8 項目完了
- Phase 12 移行判定: [ ] PASS / [ ] HOLD（理由: ）
```

---

## 次のPhase案内

**Phase 12: ドキュメント更新** — 実装ガイド（中学生レベル＋技術者レベルの2パート）・システム仕様書更新・変更履歴・未タスク検出レポート・スキルフィードバックレポートを作成する。

**ゲート条件**: Phase 11 の全完了条件を満たさない場合、Phase 12 へ進まないこと。
