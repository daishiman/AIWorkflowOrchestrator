# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 7                                                       |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001 |
| ステータス | 未実施                                                  |
| 作成日     | 2026-04-19                                              |
| タスク種別 | NON_VISUAL（UI変更なし）                                |
| 前Phase    | 6: テスト拡充                                           |
| 次Phase    | 8: リファクタリング                                     |

---

## 目的

Phase 4〜6 で追加・拡充したテストが、旧 TC-06 / TC-07 の責務を過不足なくカバーしていることを確認する。具体的には以下の 3 点を達成する。

1. **旧 TC-06 / TC-07 の責務カバー確認**: 削除された旧テストケースが保証していた `auth:login` 非発火の保証が、新テストケースによって再現されていることをトレーサビリティマトリクスで確認する
2. **テスト実行結果の記録**: 全テストケースの PASS を確認し、カバレッジ結果を記録する
3. **ゲート判定**: カバレッジが十分か判定し、不足がある場合は Phase 6 へ戻る

---

## 実行タスク

### タスク1: 旧 TC-06 / TC-07 の責務と新テストケースの対応確認

**目的**: 削除された旧テストが保証していた条件が、新テストケースで網羅されていることを確認する

**実行手順**:

1. 旧 TC-06 / TC-07 が保証していた条件を以下の観点で整理する
   - TC-06（旧）: prepare フロー中の rapid click で `auth:login` が呼ばれないこと
   - TC-07（旧）: prepare フロー中の rerender で `auth:login` が呼ばれないこと
2. 新テストケース（Phase 4〜6 で追加）が上記条件をカバーしているかを確認する
3. カバーされていない条件がある場合は Phase 6 へ戻り追加テストを実装する

**旧テストと新テストのマッピング**:

| 旧テストID  | 旧テストが保証していた条件                                     | 新テストID                           | カバー状況 |
| ----------- | -------------------------------------------------------------- | ------------------------------------ | ---------- |
| TC-06（旧） | prepare フロー中 rapid click で auth:login が呼ばれないこと    | AUTH-REGRESS-RAPID-CLICK-06          | 要確認     |
| TC-06（旧） | rapid click の回数（3回・5回）でも auth:login が呼ばれないこと | AUTH-REGRESS-RAPID-CLICK-06（5回）   | 要確認     |
| TC-07（旧） | prepare フロー中 rerender で auth:login が呼ばれないこと       | AUTH-REGRESS-RERENDER-07             | 要確認     |
| TC-07（旧） | state/props 変化種別を問わず auth:login が呼ばれないこと       | AUTH-REGRESS-RERENDER-07（全ケース） | 要確認     |

確認後、カバー状況列を「カバー済み」または「未カバー（要追加）」に更新して `outputs/phase-7/traceability-matrix.md` に記録する。

---

### タスク2: 全テストケースの PASS 確認と結果記録

**目的**: `auth-regression.test.tsx` の全テストケースが PASS していることを確認し、カバレッジ結果を記録する

**実行手順**:

1. 以下のコマンドで全テストを実行する

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

2. 実行結果を以下の形式で `outputs/phase-7/coverage-result.md` に記録する

**テストケース一覧と期待結果**:

| テストID                                          | 対応旧テスト | 期待結果 | 実際の結果 |
| ------------------------------------------------- | ------------ | -------- | ---------- |
| TC-01: wizard flow で auth:login 非発火           | —（新規）    | PASS     |            |
| TC-02: AccountSection で auth:login 正常呼び出し  | —（新規）    | PASS     |            |
| TC-04: authSlice.login デバッグコード非残存       | —（新規）    | PASS     |            |
| TC-08: authModeSlice 状態変化で auth:login 非発火 | —（新規）    | PASS     |            |
| AUTH-REGRESS-RAPID-CLICK-06（3回）                | TC-06（旧）  | PASS     |            |
| AUTH-REGRESS-RAPID-CLICK-06（5回）                | TC-06（旧）  | PASS     |            |
| AUTH-REGRESS-RERENDER-07（skillName 変更）        | TC-07（旧）  | PASS     |            |
| AUTH-REGRESS-RERENDER-07（onOpenWizard 変更）     | TC-07（旧）  | PASS     |            |
| AUTH-REGRESS-RERENDER-07（store 状態変化）        | TC-07（旧）  | PASS     |            |
| AUTH-REGRESS-HANDLER-GUARANTEE                    | —（新規）    | PASS     |            |
| AUTH-REGRESS-INTEGRATION-01（wizard 起動境界）    | TC-06/07補完 | PASS     |            |
| AUTH-REGRESS-INTEGRATION-02（マウント境界）       | TC-06/07補完 | PASS     |            |
| AUTH-REGRESS-EDGE-01（skillError 状態）           | TC-07補完    | PASS     |            |
| AUTH-REGRESS-EDGE-02（isGenerating + rapid）      | TC-06補完    | PASS     |            |
| AUTH-REGRESS-EDGE-03（noop handler）              | TC-06/07補完 | PASS     |            |
| AUTH-REGRESS-EDGE-04（複数回 rerender）           | TC-07補完    | PASS     |            |

3. FAIL したテストケースがある場合は原因を記録し、Phase 6 へ戻って修正する

---

### タスク3: traceability マトリクスの更新

**目的**: 旧 TC-06 / TC-07 の責務と新テストケースの対応関係を正式に記録する

**実行手順**:

1. タスク1 の確認結果をもとに `outputs/phase-7/traceability-matrix.md` を作成する
2. 以下の形式でマトリクスを記述する

**traceability-matrix.md の構成**:

```markdown
# Traceability Matrix: 旧 TC-06/TC-07 → 新テストケース

## 対象タスク

UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001

## 旧テストケースと新テストケースの対応

| 旧TC  | 保証条件                             | 新テストID                  | カバー状況 | 備考                                    |
| ----- | ------------------------------------ | --------------------------- | ---------- | --------------------------------------- |
| TC-06 | rapid click で auth:login 非発火     | AUTH-REGRESS-RAPID-CLICK-06 | カバー済み | 3回・5回の連続クリックで検証            |
| TC-06 | prepare フロー依存条件の代替保証     | AUTH-REGRESS-INTEGRATION-01 | カバー済み | 現行 wizard 起動フローで検証            |
| TC-06 | エラー状態での rapid click           | AUTH-REGRESS-EDGE-02        | カバー済み | isGenerating + rapid click で検証       |
| TC-07 | rerender で auth:login 非発火        | AUTH-REGRESS-RERENDER-07    | カバー済み | skillName/onOpenWizard/store 変化で検証 |
| TC-07 | 複数回 rerender での状態安定性       | AUTH-REGRESS-EDGE-04        | カバー済み | 3回以上の rerender で検証               |
| TC-07 | マウント・アンマウント境界での非発火 | AUTH-REGRESS-INTEGRATION-02 | カバー済み | cleanup 前後で検証                      |

## カバー状況サマリー

- 旧 TC-06 保証条件: X件 / X件 カバー済み
- 旧 TC-07 保証条件: X件 / X件 カバー済み
- 合計: X件 / X件 カバー済み

## 未カバー条件（ある場合）

（未カバー条件があれば記載。なければ「なし」と記載）
```

---

### タスク4: ゲート判定

**目的**: カバレッジが十分かを判定し、Phase 8 への進行可否を決定する

**判定基準**:

| 判定基準                                          | 条件         | 次のアクション               |
| ------------------------------------------------- | ------------ | ---------------------------- |
| 旧 TC-06 の全保証条件が新テストでカバーされている | カバー済み   | Phase 8 へ進む               |
| 旧 TC-07 の全保証条件が新テストでカバーされている | カバー済み   | Phase 8 へ進む               |
| 全テストケースが PASS している                    | 全 PASS      | Phase 8 へ進む               |
| いずれかの保証条件が未カバー                      | 未カバーあり | Phase 6 へ戻り追加テスト実装 |
| いずれかのテストが FAIL している                  | FAIL あり    | Phase 5/6 へ戻り修正         |

---

## 参照資料

| 参照資料           | パス                                                                                                | 内容                                |
| ------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------- |
| 回帰テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | Phase 4〜6 で追加した全テストケース |
| Phase 6 成果物     | `outputs/phase-6/coverage-report.md`                                                                | テスト拡充結果の参照元              |
| Phase 5 成果物     | `outputs/phase-5/changed-files.md`                                                                  | Green 化で変更したファイルの確認    |

---

## 成果物

| 成果物                  | パス                                     | 内容                                                              |
| ----------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| traceability マトリクス | `outputs/phase-7/traceability-matrix.md` | 旧 TC-06/TC-07 の責務と新テストケースの対応表・カバー状況サマリー |
| カバレッジ結果          | `outputs/phase-7/coverage-result.md`     | 全テストケースの実行結果（PASS/FAIL）・ゲート判定結果             |

---

## 統合テスト連携

**Phase 7 の統合テスト連携アクション**:

- traceability マトリクスにより、旧 TC-06 / TC-07 の責務が新テストで網羅されていることを可視化し、テスト責務の欠落がないことを保証する
- 全テストケースの PASS 確認により、`auth:login` 非発火の回帰保護が完全に再整備されたことを記録する
- ゲート判定により、Phase 8 への進行可否を明確に決定する
- カバー状況の可視化により、将来のテスト変更（旧テスト削除・新テスト追加）時の影響範囲を把握しやすくする

---

## 多角的チェック観点

| 観点                  | チェック内容                                                                        |
| --------------------- | ----------------------------------------------------------------------------------- |
| traceability の正確性 | 旧 TC-06/TC-07 の保証条件と新テストの対応が正確に記録されているか                   |
| カバー漏れの検出      | prepare フロー依存で削除された旧テストの保証条件が現行フローで再現されているか      |
| 結果記録の完全性      | 全テストケースの PASS/FAIL が `coverage-result.md` に記録されているか               |
| ゲート判定の適切さ    | カバー不足の場合に Phase 6 への差し戻しが正しく判定されているか                     |
| 回帰保護の継続性      | 既存テスト（TC-01/TC-02/TC-04/TC-08）が引き続き PASS していることが確認されているか |

---

## サブタスク管理

| サブタスクID | 内容                                      | ステータス |
| ------------ | ----------------------------------------- | ---------- |
| ST-7-01      | 旧 TC-06/TC-07 の責務と新テストの対応確認 | 未実施     |
| ST-7-02      | 全テストケースの PASS 確認と結果記録      | 未実施     |
| ST-7-03      | traceability マトリクスの作成             | 未実施     |
| ST-7-04      | ゲート判定の実施と Phase 8 進行可否の決定 | 未実施     |

---

## 完了条件

- [ ] 旧 TC-06 の全保証条件が新テストでカバーされていることを確認した
- [ ] 旧 TC-07 の全保証条件が新テストでカバーされていることを確認した
- [ ] 全テストケースが PASS している
- [ ] `outputs/phase-7/traceability-matrix.md` が生成されている
- [ ] `outputs/phase-7/coverage-result.md` が生成されている
- [ ] ゲート判定が実施され、Phase 8 への進行可否が決定されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後（ゲート判定: Phase 8 へ進む）、以下のファイルを実行してください:

`docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001/phase-8-refactoring.md`
