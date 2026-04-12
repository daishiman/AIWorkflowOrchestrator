# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 12                                                |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タスク名   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| 前提Phase  | Phase 11                                          |
| 後続Phase  | Phase 13                                          |
| 作成日     | 2026-04-11                                        |
| ステータス | 完了                                              |

## 目的

実装ガイド・システム仕様書更新・更新履歴・未タスク検出・スキルフィードバック・準拠チェックの
6 タスクを完了させる。
ここでは `DescribeStep.tsx` と `DescribeStep.test.tsx` の物理削除、および
Phase 4 で新規作成した `wizard-exports.test.ts` と今回追加した
`wizard-exports.typecheck.ts` を前提に、実装後の current facts をドキュメントへ同期する。

---

## Task 1: 実装ガイド作成（2パート構成）

### Part 1: 中学生レベルの説明

#### どうして古いファイルを消すの？

使わなくなったファイルを残すと、「まだ使うのかな？」と迷いやすくなります。
このタスクでは、画面の古い部品だった `DescribeStep.tsx` と、
それを確認するための古いテスト `DescribeStep.test.tsx` を消します。
あわせて、型だけの公開を見逃さないように `wizard-exports.typecheck.ts` を追加します。

古い部品に「もう使わない」という印をつけただけでは、棚に古い教科書を残しているのと同じです。
本当にもう使わないと分かったら、片付けてしまった方が分かりやすくなります。

#### 日常の例え話

学校のロッカーに、去年の部活で使った道具が残っているとします。
誰も使わないなら、名前札を貼ったまま残すより、きちんと片付けた方が場所も気持ちもすっきりします。
このタスクでは、その片付けにあたる作業をします。

### Part 2: 技術者向け説明

#### 背景

W2-seq-03b で `wizard/index.ts` の `DescribeStep` エクスポートは削除済みで、
`DescribeStep.tsx` には `@deprecated` も付与済みである。
Phase 4 では `wizard-exports.test.ts` を新規作成し、Phase 12 では
`wizard-exports.typecheck.ts` を追加して、runtime / compile-time の両方で
`DescribeStep` の再露出を防ぐ contract guard を固定する。

#### 実装観点

```ts
type WizardExportGuard = {
  missingExports: string[];
  stableExports: string[];
};
```

- `missingExports` には `DescribeStep` を含めない
- `stableExports` には既存の公開 export を含める
- `pnpm --filter @repo/desktop test -- wizard-exports` で contract を検証する

#### 追加の typecheck ガード

`DescribeStepProps` は type-only export なので、runtime の `toHaveProperty` だけでは
再導入を検出できない。`wizard-exports.typecheck.ts` で `@ts-expect-error` を使い、
`wizard/index.ts` への再露出を compile-time でも失敗させる。

#### エラーとエッジケース

- `DescribeStep.tsx` と `DescribeStep.test.tsx` の一方だけが残ると、削除スコープが不完全になる
- `wizard-exports.test.ts` が `DescribeStep` の存在に依存していると、削除後に壊れる
- `typecheck` が通っても、barrel export の contract が壊れていれば未完了扱いにする

#### 設定可能パラメータ・定数

| 項目                                                 | 説明                                    |
| ---------------------------------------------------- | --------------------------------------- |
| `wizard-exports.test.ts`                             | barrel contract のガードテスト          |
| `wizard-exports.typecheck.ts`                        | type-only export の compile-time ガード |
| `pnpm typecheck`                                     | 型の整合確認                            |
| `pnpm --filter @repo/desktop test -- wizard-exports` | barrel contract の回帰確認              |

---

## Task 2: システム仕様書更新（Step 1 + Step 2A/2B）

### Step 1-A: タスク完了記録

| 項目             | 内容                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 完了タスクID     | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001                                                                                                       |
| 完了日           | 2026-04-11                                                                                                                                       |
| 削除対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` / `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx` |
| 追加ガード       | `apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.typecheck.ts`                                                        |
| 関連ドキュメント | `docs/30-workflows/UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001/`                                                                                  |

**LOGS.md 更新対象**:

- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`

### Step 1-B: 実装状況テーブル更新

| タスクID                                   | 変更前 | 変更後 |
| ------------------------------------------ | ------ | ------ |
| UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001 | 未実施 | 完了   |

### Step 1-C: 関連タスクテーブル更新

| 関連タスクID | 変更内容                                       |
| ------------ | ---------------------------------------------- |
| W2-seq-03b   | DescribeStep の export contract 整理完了を記録 |
| Issue #2054  | CLOSED 済み・対応完了を確認                    |

### Step 1-D: index 再生成

Phase 12 で見出しや成果物名を更新した場合は `index.md` を再生成する。

### Step 1-E: 未タスク登録

今回の差分では新規未タスクは 0 件として記録する。

### Step 1-F: 補助更新

必要に応じて lessons learned、cross-skill spec、workflow summary を同期する。

### Step 1-G: 検証

- `quick_validate.js`
- `validate_all.js`
- `verify-all-specs.js`
- `validate-phase-output.js`
- `diff -qr`

結果は `documentation-changelog.md` と `system-spec-update-summary.md` に転記する。

### Step 2A: 計画記録

`system-spec-update-summary.md` に、更新予定ファイルと更新理由を列挙する。
このタスクでは shared/public interface の変更はなく、`aiworkflow-requirements`
側の正本更新は no-op とする。一方で renderer-local の barrel contract を強化するため、
`wizard-exports.typecheck.ts` の追加理由は明記する。

### Step 2B: 実更新

`.claude/skills/` 配下の正本に実更新が必要な場合のみ実施する。
今回は aiworkflow-requirements 側は no-op 判定でよいが、task-specification-creator 側は
runtime / compile-time の二重ガードを維持するため、`wizard-exports.typecheck.ts`
追加の知見を反映する。

---

## Task 3: ドキュメント更新履歴作成

```bash
node scripts/generate-documentation-changelog.js \
  --task UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001 \
  --output outputs/phase-12/documentation-changelog.md
```

| 更新日     | 対象ファイル                                                                              | 変更内容                           |
| ---------- | ----------------------------------------------------------------------------------------- | ---------------------------------- |
| 2026-04-11 | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`                      | 物理削除                           |
| 2026-04-11 | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.test.tsx`                 | 物理削除                           |
| 2026-04-11 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.test.ts`      | 新規作成                           |
| 2026-04-11 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/wizard-exports.typecheck.ts` | 新規作成（compile-time guard）     |
| 2026-04-11 | タスク仕様書（本ディレクトリ）                                                            | Phase 10-13 仕様書の新規作成と修正 |

---

## Task 4: 未タスク検出レポート（0件でも出力必須）

```bash
node scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/renderer/components/skill/wizard \
  --output .tmp/unassigned-candidates.json
```

### 検出結果

| ソース                          | 検出内容                                                   | 対応方針 |
| ------------------------------- | ---------------------------------------------------------- | -------- |
| wizard ディレクトリ内のファイル | 今回差分に由来する新規未タスク候補は検出されないことを確認 | 0件記録  |
| wizard/index.ts                 | 不要な export contract が残存していないことを確認          | 0件記録  |

### 新規未タスク候補

| 未タスクID（候補） | 内容 | 優先度 |
| ------------------ | ---- | ------ |
| なし               | なし | -      |

### 監査サマリー

- current: 0 件
- baseline: 既存違反がある場合は別記録として分離する

---

## Task 5: スキルフィードバックレポート（改善点なしでも出力必須）

### フィードバック内容

| フィードバックID | 内容                                                                                              | 種別     |
| ---------------- | ------------------------------------------------------------------------------------------------- | -------- |
| FB-TASK-01       | `DescribeStep.tsx` / `DescribeStep.test.tsx` の同時削除は、レガシー整理の標準パターンとして扱える | 知見共有 |
| FB-TASK-02       | `wizard-exports.test.ts` の新規作成を削除前に済ませると、barrel contract の回帰を防ぎやすい       | 改善提案 |
| FB-TASK-03       | `DescribeStepProps` のような type-only export は runtime test だけでは検出できない                | 教訓     |

### スキル改善提案

| スキル                     | 改善内容                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| task-specification-creator | ファイル削除タスクの Phase 4 に「barrel contract guard の runtime / compile-time 二重化」を標準追加 |
| aiworkflow-requirements    | 2 ファイル同時削除 + guard test 作成の標準フローをレガシーコード整理パターンとして記録              |

---

## Task 6: phase12-task-spec-compliance-check（最終確認）

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、以下を確認する。

- Task 1〜5 の全完了
- Step 1-A〜1-G と Step 2A/2B の整合
- `documentation-changelog.md` / `system-spec-update-summary.md` / `unassigned-task-detection.md` の値一致
- current / baseline の分離が `unassigned-task-detection.md` に記録されていること
- `task-workflow.md` / `task-workflow-completed.md` / `lane/index.md` / `outputs/artifacts.json` / `.claude/skills/task-specification-creator/outputs/artifacts.json` の parity
- `wizard-exports.typecheck.ts` による compile-time guard が runtime guard とペアで記録されていること
- `planned wording` の残存なし
- `artifacts.json` / `outputs/artifacts.json` の title / type / status / phase artifact parity

---

## 実行タスク

実行確認手順を参照。

## 参照資料

| 資料名                  | パス                                              | 用途            |
| ----------------------- | ------------------------------------------------- | --------------- |
| 手動テスト結果          | `outputs/phase-11/manual-test-result.md`          | Phase 11 成果物 |
| 要件定義書              | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物  |
| 受け入れ基準            | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| 参照確認結果            | `outputs/phase-1/import-search-result.md`         | Phase 1 成果物  |
| 設計書                  | `outputs/phase-2/design-document.md`              | Phase 2 成果物  |
| 参照検索計画            | `outputs/phase-2/reference-search-plan.md`        | Phase 2 成果物  |
| Validation Matrix       | `outputs/phase-2/validation-matrix.md`            | Phase 2 成果物  |
| 参照確認結果            | `outputs/phase-5/reference-check-result.md`       | Phase 5 成果物  |
| 削除実行記録            | `outputs/phase-5/deletion-execution-log.md`       | Phase 5 成果物  |
| typecheck結果           | `outputs/phase-5/typecheck-result.md`             | Phase 5 成果物  |
| テスト実行結果          | `outputs/phase-5/test-execution-result.md`        | Phase 5 成果物  |
| リファクタリング確認    | `outputs/phase-8/refactoring-check-result.md`     | Phase 8 成果物  |
| wizard/index.ts最終状態 | `outputs/phase-8/wizard-index-final-state.md`     | Phase 8 成果物  |
| クリーンアップ判断      | `outputs/phase-8/cleanup-decision.md`             | Phase 8 成果物  |
| 品質レポート            | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| typecheck結果           | `outputs/phase-9/typecheck-result.md`             | Phase 9 成果物  |
| 参照ゼロ確認            | `outputs/phase-9/zero-reference-check.md`         | Phase 9 成果物  |
| AC充足確認              | `outputs/phase-9/ac-fulfillment-check.md`         | Phase 9 成果物  |
| 最終レビュー結果        | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 出荷準備チェック        | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |

## 成果物

| 成果物                       | パス                                                     | 説明                               |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生）+ Part 2（技術者） |
| 仕様更新サマリー             | `outputs/phase-12/system-spec-update-summary.md`         | Step 1/Step 2A/2B の記録           |
| 更新履歴                     | `outputs/phase-12/documentation-changelog.md`            | ドキュメント変更履歴               |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク候補一覧（0件含む）        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | スキル改善提案                     |
| 準拠チェック                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1〜6 の整合確認               |

## 完了条件

- [ ] Task 1（実装ガイド）: Part 1・Part 2 ともに作成済み
- [ ] Task 2（仕様更新）: Step 1-A〜1-G と Step 2A/2B を記録済み
- [ ] Task 3（更新履歴）: ドキュメント変更履歴が記録済み
- [ ] Task 4（未タスク検出）: 0件でも出力済み（候補なし）
- [ ] Task 5（フィードバック）: 改善点も含めて記録済み
- [ ] Task 6（準拠チェック）: Task 1〜5 の整合確認が完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001
```

## 次のPhase

Phase 13: PR作成（ユーザー承認待ち）
