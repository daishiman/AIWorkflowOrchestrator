# UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001: Phase 11 画面カバレッジマトリクス必須化ガード

## メタ情報

```yaml
issue_number:
1143
task_name: Phase 11 画面カバレッジマトリクス必須化ガード
category: 改善
target_feature: Phase 11 手動テスト仕様（phase-11-manual-test.md）と screenshot coverage 検証運用
priority: 中
scale: 小規模
status: 未実施
source_phase: UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 Phase 12 再確認
created_date: 2026-03-04
dependencies:
  - UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001
```

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-IMP-PHASE11-SCREENSHOT-COVERAGE-MATRIX-GUARD-001                      |
| タスク名     | Phase 11 画面カバレッジマトリクス必須化ガード                            |
| 分類         | 改善                                                                     |
| 対象機能     | Phase 11 画面証跡の TC-証跡対応表運用                                    |
| 優先度       | 中                                                                       |
| 見積もり規模 | 小規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 Phase 12 再確認 |
| 発見日       | 2026-03-04                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT workflow の再確認で `validate-phase11-screenshot-coverage` は PASS したが、`phase-11-manual-test.md` に画面カバレッジマトリクスがないという警告が継続して出力された。実行可否は満たしていても、レビュー時の読み取りが人依存になっている。

### 1.2 問題点・課題

- `manual-test-result.md` の証跡記法だけでは、テスト設計意図（どの TC を視覚検証すべきか）が `phase-11-manual-test.md` 側に明示されない
- validator が warning 扱いのため、運用上「後回し」のまま残りやすい
- 非視覚TC（`NON_VISUAL:`）と視覚TC（`.png`）の境界がタスクごとに揺れやすい

### 1.3 放置した場合の影響

- 同種タスクで coverage 警告が慢性化し、監査時の説明コストが増える
- UI証跡の「件数整合」はPASSでも「設計整合」が崩れる
- 後続の SubAgent が TC優先度や検証目的を再解釈する必要が生じる

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11 仕様書に TC単位の画面カバレッジマトリクスを必須化し、証跡運用を warning 非依存で安定化する。

### 2.2 最終ゴール

1. `phase-11-manual-test.md` に「画面カバレッジマトリクス」が標準セクションとして存在する
2. 視覚TC/非視覚TCの判定基準と期待証跡が行単位で定義される
3. `validate-phase11-screenshot-coverage` 実行時に matrix 未記載 warning を出さない運用へ移行できる

### 2.3 スコープ

#### 含むもの

- `phase-11-manual-test.md` のマトリクス記法標準化
- `task-specification-creator` ガイドへの matrix 必須チェック追加
- `aiworkflow-requirements` の教訓・残課題・UI仕様への同期

#### 含まないもの

- screenshot 取得スクリプト本体の改修
- Playwright/Vite の実行基盤変更
- 新規 UI 機能の実装

### 2.4 成果物

- 未タスク指示書（本ファイル）
- マトリクス必須化ルールを反映した仕様書更新差分
- 再確認用検証コマンドセット（matrix 記法確認 + coverage 検証）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `docs/30-workflows/*/phase-11-manual-test.md` を更新可能である
- `validate-phase11-screenshot-coverage.js` を実行できる
- 視覚TCと非視覚TCのテスト設計を分類済みである

### 3.2 依存タスク

- `UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001`

### 3.3 必要な知識

- Phase 11 成果物仕様（`phase-11-manual-test.md`, `manual-test-result.md`）
- `NON_VISUAL:` 記法と `screenshots/*.png` 記法
- `verify-all-specs` / `validate-phase-output` の検証観点

### 3.4 推奨アプローチ

1. まず既存 workflow の `phase-11-manual-test.md` から matrix 欠落箇所を抽出する
2. 視覚TC/非視覚TCの分類列を持つ表を標準化し、最小入力項目を固定する
3. 追加した matrix が `manual-test-result.md` と矛盾しないことを機械検証する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                     | 発見経緯                                                       | 解決策                                                                            | 教訓                                                             |
| ------------------------------------------------------------------------ | -------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| coverage validator が PASS でも matrix 未記載 warning が残る             | 2026-03-04 の UT workflow 再検証で warning を確認              | Phase 11 仕様書へ「画面カバレッジマトリクス」節を必須化し、記法チェックを追加する | PASS/FAIL だけでなく warning の継続発生も未タスク化して潰す      |
| `NON_VISUAL:` の許容理由が設計書側に集約されず、レビュー時に再解釈が必要 | 手動テスト結果には記載済みだが、設計意図が Phase 11 仕様に不足 | matrix の列に「視覚/非視覚」「理由」「期待証跡」を追加して設計意図を固定する      | UI証跡は成果物（画像）と設計根拠（マトリクス）をセットで管理する |

---

## 4. 実行手順

### Phase構成

- Phase A: 現状差分の抽出
- Phase B: マトリクステンプレート定義
- Phase C: 検証ルール追加
- Phase D: 仕様同期と監査

### Phase A: 現状差分の抽出

#### 手順

1. 対象 workflow の `phase-11-manual-test.md` を収集する
2. matrix セクション有無を `rg` で確認する
3. warning が出ている workflow を一覧化する

#### 成果物

- matrix 欠落 workflow 一覧

#### 完了条件

- 欠落対象と優先度が定義されている

### Phase B: マトリクステンプレート定義

#### 手順

1. matrix の必須列（TC-ID/検証区分/期待証跡/理由）を定義する
2. `phase-11-manual-test.md` に追記する
3. `manual-test-result.md` との対応を確認する

#### 成果物

- 更新済み `phase-11-manual-test.md`

#### 完了条件

- 視覚TC/非視覚TCの分類と期待証跡が表形式で記録されている

### Phase C: 検証ルール追加

#### 手順

1. ガイドラインへ matrix 記法チェックを追加する
2. coverage validator の warning 低減条件を明文化する
3. 必要に応じて未タスク検出ルールへ追補する

#### 成果物

- 更新済みガイドライン

#### 完了条件

- matrix 欠落を再発防止できるチェック項目が存在する

### Phase D: 仕様同期と監査

#### 手順

1. `task-workflow.md` 残課題テーブルへ登録する
2. `lessons-learned.md` と `ui-ux-feature-components.md` に教訓を同期する
3. `verify-unassigned-links` と `audit --target-file` を実行する

#### 成果物

- 同期済み仕様書と検証ログ

#### 完了条件

- 未タスク仕様書・台帳・教訓の3点が整合している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `phase-11-manual-test.md` に画面カバレッジマトリクスが追加されている
- [ ] matrix に視覚TC/非視覚TCの区分がある
- [ ] `manual-test-result.md` の証跡記法と矛盾がない

### 品質要件

- [ ] `validate-phase11-screenshot-coverage` 実行時に matrix 未記載 warning が解消される
- [ ] `verify-all-specs` / `validate-phase-output` で回帰がない
- [ ] 再確認時に SubAgent 間で同じ判定が再現できる

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] `lessons-learned.md` / `ui-ux-feature-components.md` に苦戦箇所が反映されている

---

## 6. 検証方法

### テストケース

- Case 1: matrix 未記載の workflow を更新後、warning が消える
- Case 2: 非視覚TCの理由記載が matrix と `manual-test-result.md` で一致する
- Case 3: 検証スクリプト群（links/audit/spec）が全て PASS する

### 検証手順

```bash
rg -n "画面カバレッジマトリクス|TC-ID|視覚TC|非視覚TC" docs/30-workflows/*/phase-11-manual-test.md
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase11-screenshot-coverage-matrix-guard-001.md
```

---

## 7. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                                                                        |
| ---------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------- |
| matrix 定義を増やしすぎて記入コストが上がる    | 中     | 中       | 必須列を最小化（TC-ID/区分/証跡/理由）し、任意列は分離する                  |
| 既存 workflow で表記揺れが発生する             | 中     | 中       | `rg` ベースの機械チェックをチェックリストへ固定する                         |
| validator warning 仕様の変更で運用が再度揺れる | 低     | 中       | `task-specification-creator` 側ガイドに判定基準を明文化して追従しやすくする |

---

## 8. 参照情報

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001/outputs/phase-11/manual-test-result.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
⚠️  警告:
  - phase-11-manual-test.md に画面カバレッジマトリクスが見つかりません（任意だが推奨）
```

### 補足事項

- 本タスクは「証跡実体の配置」問題を解消した次段として、設計意図（TC設計）を固定するための運用ガードである。
- 完了判定は `currentViolations` を基準とし、`baselineViolations` は監視値として扱う。
