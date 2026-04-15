# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 3                               |
| Phase名    | 設計レビューゲート              |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | Phase 2: 設計                   |
| 次Phase    | Phase 4: テスト作成             |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

---

## 目的

Phase 2 の設計内容を多角的に検証し、Phase 4（テスト作成）に進むための品質ゲートを通過する。PASS / MINOR / MAJOR の判定を行い、MAJOR の場合は Phase 2 に戻る。

---

## 実行タスク

### Task 1: renderer環境制約の確認

Phase 2 で設計したバリデーション関数がrenderer環境（Electron Renderer / ブラウザ）で動作可能かを確認する。

**確認項目:**

- `validateCronSyntax` が純粋な文字列操作のみを使用しているか
- `validateCronDayOfMonth` が純粋な文字列操作のみを使用しているか
- `getDirectInputErrorMessage` が純粋な文字列操作のみを使用しているか
- Node.jsモジュール（`cron-parser`、`fs`、`path` 等）を使用していないか
- 外部依存の追加がないか

### Task 2: 後方互換性確認

既存の visual モードのバリデーションへの影響を確認する。

**確認項目:**

- `weeklyError` / `monthlyError` の計算ロジックに変更がないか
- `!isAdvancedMode` 条件による制御が維持されるか
- visual モードで `directInputError` が常に false になるか
- `isFormValid` の変更が visual モードの動作を壊さないか

```bash
# 既存のvisualモードバリデーションテストの確認
grep -rn "weeklyError\|monthlyError\|isFormValid" \
  apps/desktop/src/__tests__/components/schedule/
```

### Task 3: AC-1〜AC-8 の設計対応確認

| AC番号 | 設計対応状況                                                                                                      | 確認結果 | 備考 |
| ------ | ----------------------------------------------------------------------------------------------------------------- | -------- | ---- |
| AC-1   | `validateCronSyntax` で空文字を検出 → `directInputError=true` → `role="alert"` 表示 + `onValidationChange(false)` | -        |      |
| AC-2   | `validateCronSyntax` でフィールド数!=5を検出 → `directInputError=true`                                            | -        |      |
| AC-3   | `validateCronDayOfMonth` でdom=0を検出 → `directInputError=true`                                                  | -        |      |
| AC-4   | `validateCronDayOfMonth` でdom>=32を検出 → `directInputError=true`                                                | -        |      |
| AC-5   | 全バリデーションPASS → `directInputError=false` → `onValidationChange(true)`                                      | -        |      |
| AC-6   | `validateCronDayOfMonth` で非数値は `return true`（スキップ）                                                     | -        |      |
| AC-7   | `directInputError` は `isAdvancedMode` / `directInput` の派生状態として計算                                       | -        |      |
| AC-8   | `onValidationChange?.()` のoptional chainingで安全に呼び出し                                                      | -        |      |

### Task 4: 矛盾チェック

#### 矛盾チェック

| チェック項目                                                        | 確認結果 | 備考 |
| ------------------------------------------------------------------- | -------- | ---- |
| バリデーションルール V-1〜V-4 と AC-1〜AC-8 が整合しているか        | -        |      |
| `validateCronSyntax` と `validateCronDayOfMonth` の責務分離が明確か | -        |      |
| エラーメッセージ文言が日本語で統一されているか                      | -        |      |
| `directInputError` の計算が `isAdvancedMode` 条件と矛盾しないか     | -        |      |

#### 漏れチェック

| チェック項目                                                | 確認結果 | 備考 |
| ----------------------------------------------------------- | -------- | ---- |
| AC-1〜AC-8 の全てが設計にカバーされているか                 | -        |      |
| エラーメッセージ表示に `role="alert"` が設計されているか    | -        |      |
| `onValidationChange` のoptional chaining が設計されているか | -        |      |
| モード切替時の再計算が設計されているか                      | -        |      |

#### 整合性チェック

| チェック項目                                                                                     | 確認結果 | 備考 |
| ------------------------------------------------------------------------------------------------ | -------- | ---- |
| `isFormValid` の変更が既存の `useEffect` フローと整合しているか                                  | -        |      |
| エラーメッセージのスタイル（`text-sm text-red-500`）が既存UIと整合しているか                     | -        |      |
| `directInputError` の型が boolean であり、既存の `weeklyError` / `monthlyError` と整合しているか | -        |      |

### Task 5: パフォーマンス確認

- バリデーション処理は純粋な文字列操作（`trim`、`split`、`test`、`parseInt`）のみ
- 設計上、処理時間は 1ms 未満であることが保証される
- `directInput` の変更ごとに実行されるが、キーストロークの頻度（〜50ms間隔）に対して十分高速

### Task 6: ゲート判定

| 判定      | 定義                                                       | アクション                          |
| --------- | ---------------------------------------------------------- | ----------------------------------- |
| **PASS**  | 全チェック項目が問題なし                                   | Phase 4 へ進む                      |
| **MINOR** | 軽微な不明点・改善点あり（設計の本質に影響しない）         | 指摘事項を記録しつつ Phase 4 へ進む |
| **MAJOR** | 設計の根幹に関わる問題あり（renderer非対応、AC未カバー等） | Phase 2 に戻り再設計する            |

**MAJOR 判定の例:**

- バリデーション関数がNode.jsモジュールに依存している
- AC-1〜AC-8 のいずれかが設計でカバーされていない
- `isFormValid` の変更が visual モードのバリデーションを壊す

---

## 参照資料

| 参照資料               | パス                                            | 説明           |
| ---------------------- | ----------------------------------------------- | -------------- |
| バリデーション関数設計 | `outputs/phase-2/validation-function-design.md` | Phase 2 成果物 |
| directInputError設計   | `outputs/phase-2/direct-input-error-design.md`  | Phase 2 成果物 |
| エラーメッセージ設計   | `outputs/phase-2/error-message-design.md`       | Phase 2 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`        | AC-1〜AC-8     |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`    | Phase 1 成果物 |
| P50チェック結果        | `outputs/phase-1/p50-check-result.md`           | Phase 1 成果物 |
| トレーサビリティ行列   | `outputs/phase-1/traceability-matrix.md`        | Phase 1 成果物 |

---

## 実行手順

1. Phase 2 成果物（バリデーション関数設計・directInputError設計・エラーメッセージ設計）を読み込む
2. renderer環境制約の確認を実施する
3. 後方互換性確認を実施する
4. AC-1〜AC-8 の設計対応状況を確認する
5. 矛盾チェック・漏れチェック・整合性チェックを実施する
6. パフォーマンス確認を実施する
7. ゲート判定（PASS / MINOR / MAJOR）を決定する
8. 成果物を `outputs/phase-3/` に出力する

---

## 統合テスト連携

- 設計レビューの矛盾チェック・漏れチェック・整合性チェックの結果を記録する
- ゲート判定が MAJOR の場合は Phase 2 に戻り、Phase 3 を再実施する
- 統合ログは `outputs/phase-3/` に保存する

---

## 多角的チェック観点

- **renderer環境適合性**: 設計がRenderer環境で問題なく動作するか
- **後方互換性**: visual モードのバリデーションに影響がないか
- **AC完全網羅**: AC-1〜AC-8 の全てが設計でカバーされているか
- **アクセシビリティ**: `role="alert"` の設計が適切か
- **パフォーマンス**: キーストロークごとのバリデーション実行が問題ないか
- **型安全性**: `directInputError` が boolean 型で既存フラグと整合しているか

---

## 成果物

| 成果物           | パス                                         | 説明                              |
| ---------------- | -------------------------------------------- | --------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md`    | 全チェック項目の確認結果          |
| ゲート判定       | `outputs/phase-3/gate-decision.md`           | PASS / MINOR / MAJOR の判定と根拠 |
| 矛盾チェック表   | `outputs/phase-3/contradiction-checklist.md` | 矛盾・漏れ・整合性チェック表      |

---

## 完了条件

- [ ] renderer環境制約の確認を完了した
- [ ] 後方互換性確認を完了した（visual モードへの影響なし）
- [ ] AC-1〜AC-8 の設計対応状況を全て確認した
- [ ] 矛盾チェック・漏れチェック・整合性チェックを完了した
- [ ] パフォーマンス確認を完了した
- [ ] ゲート判定（PASS / MINOR / MAJOR）を決定し文書化した
- [ ] MAJOR の場合は Phase 2 への戻しを実施した
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] ゲート判定を明示した
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-CRON-CUSTOM-VALIDATION-001
```

---

## 次Phase

Phase 4: テスト作成（PASS / MINOR の場合）
Phase 2: 設計（MAJOR の場合、戻り）
