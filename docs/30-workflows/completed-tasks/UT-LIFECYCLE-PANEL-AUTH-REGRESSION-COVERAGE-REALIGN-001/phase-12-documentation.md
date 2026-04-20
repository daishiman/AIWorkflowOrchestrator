# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 12                                                      |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001 |
| タスク名   | auth regression coverage realignment                    |
| タスク種別 | NON_VISUAL                                              |
| ステータス | 未実施                                                  |
| 作成日     | 2026-04-19                                              |
| 前Phase    | 11: 手動テスト                                          |
| 次Phase    | 13: PR 作成                                             |

---

## 目的

auth regression coverage realignment の実施結果を、
`task-specification-creator` と `aiworkflow-requirements` の
正本運用フローに沿って `outputs/phase-12/` の canonical 成果物へ同期する。
本 Phase では Phase 11 の証跡を起点に、implementation guide、system spec update summary、
documentation changelog、unassigned-task detection、skill feedback report、
phase12-task-spec-compliance-check の 6 成果物をそろえ、計画系 wording を残さず閉じる。

## 実行タスク

以下の Task 1〜6 を完了し、Phase 12 close-out を行う。

- 6成果物を canonical 名で揃える
- NON_VISUAL 代替証跡を同期する

---

## 必須タスク一覧

| Task | 名称                             | 必須 | 成果物                                                   |
| ---- | -------------------------------- | ---- | -------------------------------------------------------- |
| 1    | 実装ガイド作成（2パート構成）    | ✅   | `outputs/phase-12/implementation-guide.md`               |
| 2    | システム仕様更新サマリー作成     | ✅   | `outputs/phase-12/system-spec-update-summary.md`         |
| 3    | ドキュメント更新履歴作成         | ✅   | `outputs/phase-12/documentation-changelog.md`            |
| 4    | 未タスク検出レポート作成         | ✅   | `outputs/phase-12/unassigned-task-detection.md`          |
| 5    | スキルフィードバックレポート作成 | ✅   | `outputs/phase-12/skill-feedback-report.md`              |
| 6    | Phase 12 準拠チェック            | ✅   | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## SubAgent 編成

| SubAgent | 主担当                                                           | 並列可否              |
| -------- | ---------------------------------------------------------------- | --------------------- |
| A        | Task 1 実装ガイド                                                | Task 2 と並列開始可   |
| B        | Task 2 システム仕様更新サマリー / Task 3 documentation-changelog | Task 1 と並列開始可   |
| C        | Task 4 未タスク検出 / Task 5 スキルフィードバック                | Task 2 完了後に並列可 |
| D        | Task 6 準拠チェック                                              | 全成果物完成後に実施  |

## 実行順序

1. Task 1 と Task 2 を並列開始する。
2. Task 3 は Task 1/2 の確定結果を受けて実施する。
3. Task 4 と Task 5 は Task 2 完了後に並列実行する。
4. Task 6 は Task 1〜5 の成果物と validator 結果が揃ってから実施する。

---

## Task 1: 実装ガイド作成（中学生レベル概念説明を含む）

**成果物**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベルの概念説明（必須）

> 専門知識がない人でも理解できるよう、日常の例え話を使って説明すること。

**rapid click テストとは何か**:

たとえば、自動販売機のボタンを短時間に何度も押したとします。
ちゃんと設計された自動販売機は「1回押した」として扱い、
商品が何個も出てきたり、お金が何重にも引き落とされたりしません。
「rapid click テスト」は、ボタンを素早く連打しても
意図しない動作（この場合は `auth:login` という認証処理の呼び出し）が
起きないことを確かめるテストです。

**rerender テストとは何か**:

たとえば、テレビのチャンネルを変えるとき、テレビは画面を更新（rerender）します。
このとき、ただ画面が変わっただけなのに「電源ボタンを押した」として誤動作しては困ります。
「rerender テスト」は、コンポーネントの props が変わって画面が更新されたとき、
認証処理（`auth:login`）が誤って呼び出されないことを確かめるテストです。

**なぜこのテストが必要か**:

`SkillLifecyclePanel` というコンポーネントは、以前は「prepare フロー」と呼ばれる
準備処理の中で `auth:login` を呼んでいました。
しかし現在の実装ではこの仕組みが変わっています。
古いテスト（TC-06 / TC-07）は旧フローに依存していたため、
現在の UI に合わせた新しいテストを作り直す必要がありました。

#### Part 2: 技術者向け実装ガイド（必須）

**テスト対象と責務**:

- 対象ファイル: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`
- 責務: 現行 `SkillLifecyclePanel.tsx` 実装において `auth:login` が意図しないタイミングで発火しないことを回帰検証する

**削除したテストケース**:

- TC-06: 旧 prepare フロー依存のテストケース
- TC-07: 旧 prepare フロー依存のテストケース
- 削除理由: prepare フロー廃止後も残存していた死んだテストコードであり、現行 UI との乖離があった

**追加したテストケース**:

| テストケース       | 条件                               | 検証内容                      |
| ------------------ | ---------------------------------- | ----------------------------- |
| rapid click テスト | 短時間内に複数回クリック操作を実行 | `auth:login` が発火しないこと |
| rerender テスト    | props 変更による rerender を発生   | `auth:login` が発火しないこと |

**テストコマンド**:

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

**視覚証跡**:

UI/UX 変更なしのため Phase 11 スクリーンショット不要。
代替証跡: `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md`

---

### 視覚証跡

`implementation-guide.md` の `## 視覚証跡` セクションに次を明記する。

- `UI/UX変更なしのため Phase 11 スクリーンショット不要`
- 代替証跡: `outputs/phase-10/final-review-result.md`
- 代替証跡: `outputs/phase-11/manual-test-result.md`

---

## Task 2: システム仕様更新サマリー作成

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

### Step 1: 完了記録（全 task で必須）

- Step 1-A: 完了タスク記録の対象ファイルと更新内容を列挙する
- Step 1-B: 実装状況を `completed` として記録する理由を明記する
- Step 1-C: 関連タスク / 未タスク候補 / 依存関係の更新要否を整理する
- Step 1-D: `topic-map.md` / `keywords.json` 再生成の要否を判断する
- Step 1-E: `.claude` / `.agents` mirror 影響範囲を整理する
- Step 1-F: `LOGS.md` 更新有無を整理する
- Step 1-G: validation / verify 系コマンドの結果を要約する

### Step 2: domain spec sync（条件付き）

- interface / API / architecture / state / security 契約に変更がある場合のみ `aiworkflow-requirements` 正本へ同期する
- 本 task はテスト追加と traceability 更新が中心のため、原則 no-op 判定を想定する
- Step 2 を実施しない場合も、根拠を `system-spec-update-summary.md` と `documentation-changelog.md` の両方に記録する

---

## Task 3: ドキュメント更新履歴作成

**成果物**: `outputs/phase-12/documentation-changelog.md`

### 必須記録

- current wave で変更したファイル一覧
- Step 1-A〜1-G / Step 2 の結果要約
- validator / verify コマンドの実行結果
- current / baseline の区別
- 計画系 wording 残存確認結果
- MINOR 指摘の解消方法または未タスク化結果

### 作成ルール

- 全 Step の判断後に記録する
- 更新なしの項目も `未更新` / `再生成のみ` / `内容変更あり` のどれかで残す
- `system-spec-update-summary.md` と判断内容を一致させる

---

## Task 4: 未タスク（unassigned tasks）の記録

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

**実行手順**:

1. 本タスク実施中に発見された以下の観点の残課題を記録する
   - 旧 TC-06 / TC-07 以外にも残存する prepare フロー依存テストがあるか
   - `SkillLifecyclePanel` の他の auth 関連シナリオでカバーされていないケースがあるか
   - リファクタリング中に発見した技術的負債
2. 残課題がゼロの場合も「残課題なし」として記録すること（0 件でも必須）
3. 残課題がある場合は `docs/30-workflows/unassigned-task/` への配置先を明記する

**記録フォーマット**:

```markdown
# 未タスク検出レポート

## 発見日

2026-04-19

## 検出元タスク

UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001（Phase 12）

## 未タスク一覧

<!-- 残課題がない場合は「残課題なし」と記載 -->

| No. | タイトル   | 優先度 | 登録先 |
| --- | ---------- | ------ | ------ |
| -   | 残課題なし | -      | -      |
```

---

## Task 5: スキルフィードバックレポート作成

**成果物**: `outputs/phase-12/skill-feedback-report.md`

- `task-specification-creator` に対する改善提案
- `aiworkflow-requirements` に対する改善提案
- 改善点がない場合も「なし」と理由を記載する

---

## Task 6: Phase 12 準拠チェック

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

- 6 成果物の存在確認
- canonical ファイル名一致確認
- 計画系 wording 残存確認
- `manual-test-result.md` / `final-review-result.md` 参照整合
- Step 1-A〜1-G / Step 2 の記録有無確認
- MINOR 追跡表の close 方法確認

---

## 参照資料

| 参照資料               | パス                                                                             | 内容                                      |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| Phase 12 テンプレート  | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | canonical 成果物・Task 1〜6 の正本        |
| システム仕様更新フロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | Step 1 / Step 2 / validation の正本フロー |
| 仕様記述ガイド         | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`           | 仕様書の命名・記述ルール                  |
| Phase 11 成果物        | `outputs/phase-11/manual-test-result.md`                                         | 手動テスト結果（代替証跡）                |
| Phase 10 成果物        | `outputs/phase-10/final-review-result.md`                                        | MINOR / 残課題 / 最終判定                 |

---

## 成果物一覧

| ファイル                                                 | 説明                                                             | ステータス |
| -------------------------------------------------------- | ---------------------------------------------------------------- | ---------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド（Part 1 中学生レベル + Part 2 技術者向け + 視覚証跡） | 未作成     |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の判断結果                                       | 未作成     |
| `outputs/phase-12/documentation-changelog.md`            | current / baseline / validator 結果 / Step 結果                  | 未作成     |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート（0 件でも必須）                             | 未作成     |
| `outputs/phase-12/skill-feedback-report.md`              | 2 skill への改善提案（なしでも必須）                             | 未作成     |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック                                            | 未作成     |

---

## 完了条件

- [ ] `implementation-guide.md` が Part 1（中学生レベル）と Part 2（技術者向け）と視覚証跡を含んでいる
- [ ] `implementation-guide.md` に rapid click / rerender テストの概念説明が日常の例え話を使って記述されている
- [ ] `system-spec-update-summary.md` に Step 1 / Step 2 の判断結果が記録されている
- [ ] `documentation-changelog.md` が current / baseline と validator 結果を記録している
- [ ] `unassigned-task-detection.md` が残課題ゼロの場合も出力されている
- [ ] `skill-feedback-report.md` が改善点なしでも出力されている
- [ ] `phase12-task-spec-compliance-check.md` が Task 1〜6 の完了を検証している
- [ ] 計画系 wording が残っていない

---

## タスク100%実行確認【必須】

- [ ] Task 1〜6 の成果物が全て存在する
- [ ] 全成果物が空でない
- [ ] `docs/30-workflows/unassigned-task/` への配置要否が `unassigned-task-detection.md` に記録されている
- [ ] `.claude` / `.agents` / `outputs/phase-12` の整合判断が記録されている

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001/phase-13-pr.md`
