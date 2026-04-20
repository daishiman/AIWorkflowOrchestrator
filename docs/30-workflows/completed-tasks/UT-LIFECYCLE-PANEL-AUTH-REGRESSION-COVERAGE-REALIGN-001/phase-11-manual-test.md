# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 11                                                      |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001 |
| タスク名   | auth regression coverage realignment                    |
| タスク種別 | NON_VISUAL                                              |
| ステータス | 未実施                                                  |
| 作成日     | 2026-04-19                                              |
| 前Phase    | 10: 最終レビュー                                        |
| 次Phase    | 12: ドキュメント更新                                    |

---

## 目的

NON_VISUAL タスクのため、UI スクリーンショットによる手動テストは N/A とする。
代わりに、テスト実行結果の目視確認手順を実施し、全テストケースの PASS を証跡として記録する。
また、テスト出力の可読性（テスト名・アサーションメッセージ）を目視で確認する。

---

## N/A 理由の明文化

**UI 手動テストが N/A である理由**:

本タスク（UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001）は NON_VISUAL タスクであり、
UI の表示・レイアウト・インタラクションに変更を加えない。
変更内容はテストコード（`SkillLifecyclePanel.auth-regression.test.tsx`）のみであり、
エンドユーザーが視認できる変更は発生しない。

したがって、以下は全て N/A とする:

- ブラウザ・アプリ上での目視確認
- スクリーンショットの撮影
- UI コンポーネントの動作確認

**代替証跡**:

- `outputs/phase-9/quality-check-result.md`（テスト実行ログ）
- `outputs/phase-10/final-review-result.md`（AC 照合結果）
- `outputs/phase-11/manual-test-result.md`（本 Phase のテスト実行ログ）

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト実行結果の目視確認

**目的**: verbose モードでテスト実行し、全テストケース名と PASS / FAIL 状態を目視で確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop exec vitest run --reporter=verbose src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

2. 出力された各テストケース名を目視で確認し、以下を記録する
   - `describe` ブロックの階層が意図した構造になっているか
   - `it` のテスト名が期待する振る舞いを表しているか
   - PASS / FAIL の状態

3. FAIL があった場合はエラーメッセージを記録し、原因を特定する

**確認観点**:

| 観点                    | 確認内容                                              |
| ----------------------- | ----------------------------------------------------- |
| rapid click テスト      | テスト名に「rapid click」または同等の表現が含まれるか |
| rerender テスト         | テスト名に「rerender」または同等の表現が含まれるか    |
| auth:login 非発火の検証 | アサーション失敗時のエラーメッセージが分かりやすいか  |
| 旧 TC-06 / TC-07 の削除 | prepare フロー依存のテストケースが出力に現れないか    |

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md` のテスト実行ログセクション

---

### タスク2: 全テストスイートでの回帰確認

**目的**: auth-regression テスト追加による既存テストへの回帰を最終確認する

**実行手順**:

1. 以下のコマンドを実行する

```bash
pnpm --filter @repo/desktop exec vitest run --reporter=verbose
```

2. 新規追加テスト以外で FAIL が発生していないことを確認する
3. 確認結果を記録する

**確認項目**:

- [ ] 新規追加テストケースが全て PASS
- [ ] 既存テストへの回帰がない（FAIL 件数: 0 件）
- [ ] テスト失敗件数: 0 件

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md` の全スイート確認セクション

---

### タスク3: docs-only 整合ウォークスルー

**目的**: フェーズ仕様書と実際の成果物が整合していることを確認する

**実行手順**:

1. 以下を `manual-test-result.md` に記録する
   - 各 Phase の成果物ファイルが `outputs/phase-X/` に存在するか（Phase 8〜10）
   - `outputs/phase-10/final-review-result.md` と `outputs/phase-10/release-readiness-checklist.md` の存在確認
   - フェーズ仕様書に記載された成果物と実際のファイルが一致しているか
   - `docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001/` 配下の仕様書構成が完全か

2. 不整合がある場合は原因を記録し、修正方針を記録する

**確認チェックリスト**:

- [ ] `outputs/phase-8/refactoring-summary.md` が存在する
- [ ] `outputs/phase-9/quality-check-result.md` が存在する
- [ ] `outputs/phase-10/final-review-result.md` が存在する
- [ ] `outputs/phase-10/release-readiness-checklist.md` が存在する
- [ ] フェーズ仕様書（phase-8〜phase-13.md）が全て存在する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md` の docs-only 整合ウォークスルーセクション

---

## 参照資料

| 参照資料                  | パス                                                                                                | 内容                    |
| ------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------- |
| テスト対象ファイル        | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | 手動確認対象テスト      |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                                           | AC 照合結果             |
| Phase 9 品質チェック結果  | `outputs/phase-9/quality-check-result.md`                                                           | CI シミュレーション結果 |

---

## 成果物

| 成果物         | パス                                     | 内容                                                             |
| -------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | テスト実行ログ・全スイート確認・docs-only 整合ウォークスルー結果 |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 11 の統合テスト連携アクション**:

- NON_VISUAL タスクのため UI 手動テストは N/A とし、テスト実行ログを代替証跡として使用する
- verbose モードでの出力を目視確認することで、テスト名の可読性と PASS / FAIL 状態を保証する
- 全スイートでの回帰確認により、auth-regression テスト追加が既存機能に影響を与えないことを最終確認する
- docs-only 整合ウォークスルーにより、フェーズ仕様書と成果物の整合性を確認する

---

## 多角的チェック観点（AIが判断）

| 観点                         | チェック内容                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| N/A 理由の明文化             | UI 手動テストが N/A である理由が具体的に記述されているか                               |
| テスト名の可読性確認         | verbose 出力のテスト名が「rapid click」「rerender」「auth:login 非発火」を示しているか |
| 旧テスト削除の目視確認       | TC-06 / TC-07 に相当するテストケース名が出力に現れないことを確認しているか             |
| 代替証跡の完全性             | UI スクリーンショットの代わりにテスト実行ログが証跡として十分か                        |
| docs-only 整合ウォークスルー | 全 Phase の成果物ファイルが存在し、仕様書記載と一致しているか                          |

---

## サブタスク管理

| サブタスクID | 内容                         | ステータス |
| ------------ | ---------------------------- | ---------- |
| ST-11-01     | テスト実行結果の目視確認     | 未実施     |
| ST-11-02     | 全テストスイートでの回帰確認 | 未実施     |
| ST-11-03     | docs-only 整合ウォークスルー | 未実施     |

---

## 完了条件

- [ ] UI 手動テストが N/A である理由が `manual-test-result.md` に明文化されている
- [ ] verbose モードでのテスト実行結果が目視確認されている
- [ ] 全テストケースが PASS していることが確認されている
- [ ] 全スイートでの回帰確認が完了している（FAIL 件数: 0 件）
- [ ] docs-only 整合ウォークスルーが完了している
- [ ] `outputs/phase-11/manual-test-result.md` が生成されている

---

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001/phase-12-documentation.md`
