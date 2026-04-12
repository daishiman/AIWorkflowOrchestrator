# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 12                                             |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | Phase 11                                       |
| 後続Phase  | Phase 13                                       |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |

## 目的

実装ガイド・システム仕様書更新・ドキュメント更新履歴・未タスク検出・スキルフィードバック・
準拠確認の6タスクを完了させる。

## 実行タスク

- Task 1: 実装ガイドを作成して outputs/phase-12/ に出力する
- Task 2: システム仕様書更新サマリーを作成して出力する
- Task 3: ドキュメント更新履歴を作成して出力する（Task 2〜5 は並列下書き可）
- Task 4: 未タスク検出レポートを作成して出力する
- Task 5: スキルフィードバックレポートを作成して出力する
- Task 6: 全成果物を集約した準拠確認レポートを作成する（最終ゲート）

---

## Task 1: 実装ガイド作成（2パート構成）

### Part 1: 中学生レベルの説明

#### なぜこのクリーンアップが必要なの？

ソフトウェアのテストコードには「スキップ」という機能があります。
`describe.skip` を使うと、特定のテストグループを一時的に無視することができます。

スキップしたテストの中に「もう画面に存在しないボタン（`skill-lifecycle-request-input`）」を
探しているコードが残っていました。今は画面が変わってそのボタンはなくなっています。

将来、スキップを解除したとき、このテストは「存在しないものを探す」ので
突然失敗してしまいます。今のうちに削除しておきます。

#### 日常の例え話

お片付けのとき、「もう持っていないおもちゃ」の取り扱い手順が書かれたメモが
引き出しに入っていたとします。そのメモは将来誰かを混乱させるかもしれないので、
捨てたほうがよいです。

---

### Part 2: 技術者向け説明

#### 問題の原因

`UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001` の実装で `skill-lifecycle-request-input` testid が
UI から削除された。しかし `describe.skip` ブロック内のテストは実行されないため CI では検出されず、
以下の2ファイルに参照が残存した。

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`

#### 解決策

対象2ファイルの `describe.skip` ブロック内から `skill-lifecycle-request-input` への参照を
削除または現行 testid に書き換える。

```bash
# 削除対象の確認
grep -n "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

#### 影響範囲

| 項目                 | 内容                                                   |
| -------------------- | ------------------------------------------------------ |
| 変更ファイル数       | 2ファイル（テストファイルのみ）                        |
| 実行時コードへの影響 | なし                                                   |
| CI への影響          | `describe.skip` 内のため現状 CI はスキップ→影響なし    |
| 将来の影響           | スキップ解除時に参照エラーが発生しなくなる（正の影響） |

#### 再発防止

Phase 5 実装完了時に「`describe.skip` 内も含めて testid 参照を一斉更新する」チェックを
チェックリストに追加することを提案する。具体的には以下のコマンドを Phase 5 完了チェックに追加する:

```bash
# Phase 5 完了後チェック（describe.skip 内も含む全 testid 参照の確認）
grep -rn "削除対象の testid" apps/desktop/src/renderer/components/skill/__tests__/
```

---

## Task 2: システム仕様書更新

### Step 1-A: タスク完了記録

| 項目             | 内容                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------- |
| 完了タスクID     | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001                                                  |
| 完了日           | 2026-04-11                                                                                    |
| 変更ファイル     | `SkillLifecyclePanel.llm-generation.test.tsx`, `SkillLifecyclePanel.auth-regression.test.tsx` |
| 関連ドキュメント | `docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001/`                             |

**LOGS.md 更新対象**:

- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/aiworkflow-requirements/LOGS.md`

### Step 1-B: 実装状況テーブル更新

| タスクID                                     | 変更前 | 変更後 |
| -------------------------------------------- | ------ | ------ |
| UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 | 未実装 | 完了   |

### Step 1-C: 関連タスクテーブル更新

| 関連タスクID                                      | 変更内容                                                        |
| ------------------------------------------------- | --------------------------------------------------------------- |
| UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001 | Phase 12 FB-02 対応済み（describe.skip 内残存参照を解消）を記録 |

### Step 2: システム仕様更新（条件付き）

**判定**: 本タスクはテストファイルのみの変更。
新規インターフェース・型・IPC 契約の追加はなし。

**Step 2 更新**: **不要**（テストコードのクリーンアップのみ）

**記録方針**: `documentation-changelog.md` には Step 2 が不要である理由（テストファイルのみ変更）を明記する。

---

## Task 3: ドキュメント更新履歴作成

| 更新日     | 対象ファイル                                   | 変更内容                                                      |
| ---------- | ---------------------------------------------- | ------------------------------------------------------------- |
| 2026-04-11 | `SkillLifecyclePanel.llm-generation.test.tsx`  | `describe.skip` 内の `skill-lifecycle-request-input` 参照削除 |
| 2026-04-11 | `SkillLifecyclePanel.auth-regression.test.tsx` | `describe.skip` 内の `skill-lifecycle-request-input` 参照削除 |
| 2026-04-11 | タスク仕様書（本ディレクトリ）                 | Phase 8-13 仕様書の新規作成                                   |

- Step 2 が不要である判断根拠（テストファイルのみ変更）を documentation-changelog.md に明記する

---

## Task 4: 未タスク検出レポート（0件でも出力必須）

```bash
# 他のテストファイルに同様の describe.skip + 旧 testid 参照が残存していないか確認
grep -rn "skill-lifecycle-request-input" apps/desktop/src/
grep -rn "skill-lifecycle-request-input" apps/desktop/src/renderer/components/
```

### 判定

重大未タスク: 0件

### 補足

- `SkillLifecyclePanel.test.tsx` の `queryByTestId("skill-lifecycle-request-input")` は、削除済み testid の不存在を確認する正常なアサーションであり、未タスクではない
- `describe.skip` 内の testid 監査や Phase 5 チェックリスト追記は有用な改善提案だが、今回の cleanup では問題を生じる大きな課題ではないため未タスク化しない

---

## Task 5: スキルフィードバックレポート（改善点なしでも出力必須）

### フィードバック内容

| フィードバックID | 内容                                                                                   | 種別 |
| ---------------- | -------------------------------------------------------------------------------------- | ---- |
| FB-TASK-01       | `describe.skip` 内の testid は CI で検出されないため、実装タスク完了時に手動確認が必要 | 警告 |
| FB-TASK-02       | testid 削除時に describe.skip ブロックも一括チェックするルールがない                   | 課題 |

### describe.skip 内 testid 管理改善提案

実装タスク完了時に `describe.skip` 内の testid も一括チェックするルールを
Phase 5 チェックリストに追加することを提案する。

具体的な追加内容:

- Phase 5 完了チェックリストに、`describe.skip` ブロック内も含めて旧 testid 参照を確認する項目を追加する
- 確認コマンド例: `grep -rn "削除したtestid" apps/desktop/src/renderer/components/`

### スキル改善提案

| スキル                     | 改善内容                                                                  |
| -------------------------- | ------------------------------------------------------------------------- |
| task-specification-creator | Phase 5 の完了チェックリストに describe.skip 内 testid 確認項目を追加する |
| aiworkflow-requirements    | testid 削除時の describe.skip 内残存参照チェックを標準プロセスとして記録  |

---

## Task 6: phase12-task-spec-compliance-check【必須・最終確認】

### 目的

Task 1〜5 の成果物、Step 1-A〜1-C / Step 2 の実施結果、validator 実測値を 1 ファイルへ集約し、
Phase 12 の最終判定根拠を残す。

### 実施内容

- Task 1〜5 の成果物存在確認
- Task 1〜5 の実質監査
- Step 1-A〜1-G の実更新確認
- Step 2 の current fact / no-op / domain sync 確認
- validator 結果、root parity、artifacts 同期、計画系 wording 0 件の記録
- SubAgent ごとに根拠を分担してよいが、最終的には Task 6 で 1 ファイルへ集約する

### 出力

- `outputs/phase-12/phase12-task-spec-compliance-check.md`

### 最低限の記載要件

| 観点     | 確認内容                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| 実体確認 | Task 1〜5 の成果物が揃っていること                                                                         |
| 実測値   | validator / grep / audit / parity の結果が記録されていること                                               |
| 同期     | `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / outputs の整合が取れていること |
| 完了判定 | PASS は実体 + 実測値 + same-wave sync 証跡が揃った場合のみ                                                 |

## 参照資料

| 資料名               | パス                                         | 用途            |
| -------------------- | -------------------------------------------- | --------------- |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`     | Phase 11 成果物 |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物  |
| 設計書               | `outputs/phase-2/design-document.md`         | Phase 2 成果物  |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物  |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md`      | Phase 8 成果物  |
| 品質レポート         | `outputs/phase-9/quality-report.md`          | Phase 9 成果物  |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`    | Phase 10 成果物 |

## 実行手順

1. Task 1（実装ガイド）を作成して outputs/phase-12/implementation-guide.md に出力する
2. Task 2（システム仕様書更新）を実施して outputs/phase-12/system-spec-update-summary.md に出力する
3. Task 3（ドキュメント更新履歴）を作成して outputs/phase-12/documentation-changelog.md に出力する
4. Task 4（未タスク検出）を実施して outputs/phase-12/unassigned-task-detection.md に出力する
5. Task 5（スキルフィードバック）を作成して outputs/phase-12/skill-feedback-report.md に出力する
6. Task 6（準拠確認）を実施して outputs/phase-12/phase12-task-spec-compliance-check.md に出力する

## 多角的チェック観点

| 観点                 | 確認内容                                                        |
| -------------------- | --------------------------------------------------------------- |
| 実装ガイド完全性     | Part 1（中学生向け）と Part 2（技術者向け）が両方あること       |
| 仕様書更新正確性     | Step 1-A〜1-C が全て記録されていること                          |
| 未タスク検出網羅性   | 0件でも出力されていること                                       |
| フィードバック具体性 | 改善提案が具体的なアクションを含んでいること                    |
| 準拠確認完全性       | Task 6 で Task 1〜5 / Step 1-A〜1-G / Step 2 を集約していること |

## 成果物

| 成果物                       | パス                                                     | 説明                               |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生）+ Part 2（技術者） |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C の記録               |
| 更新履歴                     | `outputs/phase-12/documentation-changelog.md`            | ドキュメント変更履歴               |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク候補一覧（0件含む）        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | スキル改善提案                     |
| 準拠確認レポート             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終判定根拠                       |

## 完了条件

- [ ] Task 1（実装ガイド）: Part 1・Part 2 ともに作成済み
- [ ] Task 2（仕様更新）: Step 1-A〜1-C 完了、Step 2 は N/A 判定済み
- [ ] Task 3（更新履歴）: ドキュメント変更履歴が記録済み
- [ ] Task 4（未タスク検出）: 0件でも出力済み（候補2件を記録）
- [ ] Task 5（フィードバック）: 改善提案も含めて記録済み
- [ ] Task 6（準拠確認）: Task 1〜5 と Step 1-A〜1-G / Step 2 の root evidence が集約済み

## サブタスク管理

| サブタスクID | 内容                             | 状態   |
| ------------ | -------------------------------- | ------ |
| ST-12-1      | Task 1: 実装ガイド作成           | 未実施 |
| ST-12-2      | Task 2: システム仕様書更新       | 未実施 |
| ST-12-3      | Task 3: ドキュメント更新履歴作成 | 未実施 |
| ST-12-4      | Task 4: 未タスク検出レポート作成 | 未実施 |
| ST-12-5      | Task 5: スキルフィードバック作成 | 未実施 |
| ST-12-6      | Task 6: 準拠確認レポート作成     | 未実施 |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 13: PR作成
