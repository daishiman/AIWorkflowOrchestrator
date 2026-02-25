# Phase 10: 最終レビュー（全体品質・整合性の最終検証） - タスク仕様書

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| Phase        | 10                                        |
| Phase名      | 最終レビュー（全体品質・整合性検証）      |
| 機能名       | ut-imp-aiworkflow-spec-reference-sync-001 |
| タスクID     | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 |
| 種別         | 改善（仕様書修正のみ）                    |
| GitHub Issue | #903                                      |
| 前提Phase    | Phase 9（品質保証）                       |
| 後続Phase    | Phase 11（手動テスト検証）                |
| ステータス   | 未実施                                    |
| 作成日       | 2026-02-25                                |

## 目的

Phase 1 の全要件が仕様書更新に反映されているか、Phase 2 の設計から意図しない乖離がないか、Phase 6-7 の検証が全項目をカバーしているか、Phase 9 の品質ゲートが全て達成されているかを多角的に検証し、PASS / MINOR / MAJOR / CRITICAL の判定を下す。

## 背景

本タスクは仕様書修正のみのタスクであり、コードレビューは対象外である。代わりに、仕様書間の参照整合性・3点同期・baseline/current 分離・検証コマンドの実行結果を中心にレビューを実施する。Phase 12 での同期漏れを根本的に防止する運用ガードが機能していることを最終確認する。

## 判定基準

| 判定     | 条件                                                                   | 対応                                                           |
| -------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                                               | Phase 11 へ進行                                                |
| MINOR    | 軽微な指摘あり（表現改善・コメント追加で解決可能）                     | 全指摘を未タスク仕様書に変換後 Phase 11 へ進行（**省略不可**） |
| MAJOR    | 重大な問題あり（要件未達成・3点同期の欠落・参照切れ残存）              | 影響範囲に応じて Phase 1-5 へ戻る                              |
| CRITICAL | 致命的な問題あり（仕様書間の矛盾が運用に影響・検証コマンド自体の欠陥） | Phase 1 へ戻り要件再確認                                       |

### 戻り先決定基準

| 問題の種類                                   | 戻り先                      |
| -------------------------------------------- | --------------------------- |
| 要件の問題（同期ガードの定義不足）           | Phase 1（要件定義）         |
| 設計の問題（チェックリスト配置・構成の問題） | Phase 2（設計）             |
| 実装の問題（仕様書記述の不備・リンク漏れ）   | Phase 5（実装）             |
| テストの問題（検証コマンドのカバレッジ不足） | Phase 6（テスト拡充）       |
| リファクタリングの問題（表現統一の不備）     | Phase 8（リファクタリング） |

### MINOR 判定時の必須アクション

MINOR 指摘が 1 件以上ある場合は、以下の3ステップを全て実行する（P3 準拠、省略不可）:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

## 実行タスク

### タスク1: 要件充足の確認

**目的**: Phase 1 で定義した全要件が仕様書更新に反映されていることを確認する

**実行手順**:

Phase 1 の要件定義書（`outputs/phase-1/requirements-definition.md`）を開き、以下の要件ごとに達成状況を確認する。

#### 要件1: 未タスク参照リンク同期ルール（FR-1）

- [ ] FR-1.1: `verify-unassigned-links.js` 実行時に `unassigned-task/` 配下の参照リンクが全て有効であること（Phase 9 の検証結果を参照）
- [ ] FR-1.2: 未タスク完了時に `task-workflow.md` の残課題テーブルから該当行が削除またはステータス「完了」に更新されるルールが記載されていること
- [ ] FR-1.3: 未タスク完了時に関連仕様書内の参照リンクが「完了タスク」セクションに移動されるルールが記載されていること
- [ ] FR-1.4: `unassigned-task/` ディレクトリ内のファイルと `task-workflow.md` 残課題テーブルの行が 1:1 対応していること

#### 要件2: 3点同期チェックリスト（FR-2）

- [ ] FR-2.1: `spec-update-workflow.md` に `task-workflow.md` → `SKILL.md`（2ファイル） → `LOGS.md`（2ファイル）の更新順序が明文化されていること
- [ ] FR-2.2: 各ファイルの更新完了をチェックボックスで個別に記録できる形式であること
- [ ] FR-2.3: `LOGS.md` は `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` の2ファイルが明示的にリストされていること
- [ ] FR-2.4: `SKILL.md` は `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の2ファイルが明示的にリストされていること

#### 要件3: 苦戦箇所の未タスク転記手順（FR-3）

- [ ] FR-3.1: 苦戦箇所から未タスク指示書への転記が3ステップで定義されていること（①指示書作成 → ②残課題テーブル登録 → ③関連仕様書リンク追加）
- [ ] FR-3.2: 3ステップ全てが省略不可として明記されていること
- [ ] FR-3.3: 苦戦箇所が「0 件」の場合でも「苦戦箇所なし」と明記する手順が定義されていること

#### 要件4: baseline/current 判定分離ルール（FR-4）

- [ ] FR-4.1: `baseline` 監査結果と `current` 変更差分の判定基準が明文化されていること
- [ ] FR-4.2: `baseline` の問題は「スコープ外・既存課題」として記録するルールが定義されていること
- [ ] FR-4.3: `current` の問題は「修正必須」として記録するルールが定義されていること

---

### タスク2: 設計整合の確認

**目的**: Phase 2 の設計方針から意図しない乖離がないことを確認する

**実行手順**:

Phase 2 の設計書（`outputs/phase-2/architecture-design.md`）を開き、以下を確認する。

- [ ] 同期ルールが `spec-update-workflow.md` の Step 1-A 周辺に配置されていること（Phase 2 の配置方針準拠）
- [ ] 検証コマンドが Phase 12 の実行手順として統合されていること
- [ ] fallback 経路（通常経路以外）の更新手順が明記されていること

---

### タスク3: 検証完全性の確認

**目的**: Phase 6-7 の検証が全項目をカバーしていることを確認する

**実行手順**:

Phase 6 の検証結果（`outputs/phase-6/`）と Phase 7 のカバレッジ確認結果（`outputs/phase-7/coverage-report.md`）を開き、以下を確認する。

- [ ] 5つの検証シナリオ（VS-001〜VS-005）が全て実行されていること
- [ ] 全テストケース（TC-001〜TC-005）で PASS が記録されていること
- [ ] カバレッジ確認で「検証不足」としてフラグされた項目が 0 件であること

---

### タスク4: 品質基準の達成確認

**目的**: Phase 9 の品質ゲートが全て達成されていることを確認する

**実行手順**:

Phase 9 の品質レポート（`outputs/phase-9/quality-report.md`）を開き、以下の品質ゲート結果を確認する。

| 品質項目       | 基準                             | Phase 9 結果 | 判定 |
| -------------- | -------------------------------- | ------------ | ---- |
| Markdown構造   | 全ファイルで見出しレベルが正しい | -            | -    |
| リンク参照切れ | 0 件                             | -            | -    |
| 索引整合性     | 最新状態                         | -            | -    |
| SKILL検証      | 有効判定（2スキル両方）          | -            | -    |
| 全体整合性     | 矛盾 0 件                        | -            | -    |

- [ ] 全品質項目が基準を満たしていること

---

### タスク5: 過去教訓の反映確認

**目的**: P1-P4, P25-P28 の教訓が本タスクの成果物に反映されていることを確認する

**実行手順**:

- [ ] P1（LOGS.md 2ファイル更新漏れ）: 3点同期チェックリストに LOGS.md 2ファイルの更新指示が明示されていること
- [ ] P2（topic-map.md 再生成忘れ）: 検証コマンドに `generate-index.js` の実行が含まれていること
- [ ] P3（未タスク管理の3ステップ不完全）: 転記手順が3ステップ（指示書 → 残課題テーブル → 参照リンク）で定義されていること
- [ ] P4（documentation-changelog への早期「完了」記載）: 全 Step 確認前に「完了」と記載しない注意事項が含まれていること
- [ ] P25（LOGS.md 2ファイル更新漏れ再発）: P1 と同様の対策が強化されていること
- [ ] P26（システム仕様書更新遅延）: Phase 12 完了時点で更新するルールが記載されていること
- [ ] P27（topic-map.md 再生成トリガーの判断ミス）: 仕様書に変更があれば再生成を実行するルールが記載されていること
- [ ] P28（スキルフィードバックレポート未作成）: 改善点がなくても「改善点なし」として記録するルールが記載されていること

---

### タスク6: baseline/current 分離の確認

**目的**: 監査結果の判定が正しく baseline（既存の問題）と current（今回の変更で生じた問題）に分離されていることを確認する

**実行手順**:

- [ ] 仕様書内に baseline/current 判定の分離ルールが明文化されていること
- [ ] baseline の問題が「スコープ外・既存課題として記録」と定義されていること
- [ ] current の問題が「今回のタスクで修正必須」と定義されていること
- [ ] 両者が混同されない判定フローが記載されていること

---

### タスク7: 3点同期の最終確認

**目的**: `task-workflow.md` / `SKILL.md` / `LOGS.md` の同期ルールが一貫していることを確認する

**実行手順**:

- [ ] `task-workflow.md` の残課題テーブルが最新状態であること
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴に本タスクの記録が存在すること
- [ ] `task-specification-creator/SKILL.md` の変更履歴に本タスクの記録が存在すること
- [ ] `aiworkflow-requirements/LOGS.md` に本タスクの記録が存在すること
- [ ] `task-specification-creator/LOGS.md` に本タスクの記録が存在すること

## 参照資料

| 参照資料                      | パス                                                                                                                     | 内容                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| Phase 1 要件定義              | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-1/requirements-definition.md` | 受入基準の原本           |
| Phase 2 設計                  | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-2/architecture-design.md`     | 設計方針の原本           |
| Phase 5 実装記録              | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-5/specification-updates.md`   | 更新内容の一覧           |
| Phase 6 検証結果              | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-6/`                           | テスト実行結果           |
| Phase 7 カバレッジ確認        | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-7/coverage-report.md`         | カバレッジ確認結果       |
| Phase 8 リファクタリング      | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-8/refactoring-report.md`      | リファクタリング変更内容 |
| Phase 9 品質レポート          | `docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/outputs/phase-9/quality-report.md`          | 品質ゲート検証結果       |
| spec-update-workflow.md       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                           | レビュー対象ファイル     |
| task-workflow.md              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                     | レビュー対象ファイル     |
| unassigned-task-guidelines.md | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`                                     | レビュー対象ファイル     |
| 06-known-pitfalls.md          | `.claude/rules/06-known-pitfalls.md`                                                                                     | P1-P4, P25-P28 の教訓    |
| acceptance-criteria           | `outputs/phase-1/acceptance-criteria.md`                                                                                 | Phase 1 成果物           |
| scope-definition              | `outputs/phase-1/scope-definition.md`                                                                                    | Phase 1 成果物           |
| sync-rule-design              | `outputs/phase-2/sync-rule-design.md`                                                                                    | Phase 2 成果物           |
| baseline-current-template     | `outputs/phase-5/baseline-current-template.md`                                                                           | Phase 5 成果物           |
| design-deviation-record       | `outputs/phase-5/design-deviation-record.md`                                                                             | Phase 5 成果物           |
| operation-checklist           | `outputs/phase-5/operation-checklist.md`                                                                                 | Phase 5 成果物           |

### システム仕様（aiworkflow-requirements + task-specification-creator）参照

| 仕様書                  | 参照セクション                       | 参照理由           |
| ----------------------- | ------------------------------------ | ------------------ |
| task-workflow.md        | 残課題テーブル、完了タスクセクション | 3点同期の最終確認  |
| spec-update-workflow.md | Step 1-A 〜 Step 1-E                 | 設計整合確認       |
| lessons-learned.md      | P1-P4, P25-P28                       | 過去教訓の反映確認 |
| 05-task-execution.md    | Phase 12 チェックリスト              | 要件充足確認の基準 |

## 実行手順

### Step 1: 要件充足レビュー（タスク1）

1. Phase 1 の要件定義書を開く
2. FR-1（参照リンク同期）の全要件（FR-1.1〜FR-1.4）の達成状況を確認する
3. FR-2（3点同期チェックリスト）の全要件（FR-2.1〜FR-2.4）の達成状況を確認する
4. FR-3（苦戦箇所転記手順）の全要件（FR-3.1〜FR-3.3）の達成状況を確認する
5. FR-4（baseline/current判定分離）の全要件（FR-4.1〜FR-4.3）の達成状況を確認する
6. 各要件の達成/未達成をレビュー結果に記録する

### Step 2: 設計準拠レビュー（タスク2）

1. Phase 2 の設計書を開く
2. 同期ルールの配置位置が設計方針に準拠していることを確認する
3. 検証コマンドの統合状況を確認する
4. fallback 経路の記載を確認する

### Step 3: 検証完全性レビュー（タスク3）

1. Phase 6 の検証結果を開く
2. 5つの検証シナリオの実行状況を確認する
3. Phase 7 のカバレッジ確認結果を開く
4. カバレッジ不足項目がないことを確認する

### Step 4: 品質基準レビュー（タスク4）

1. Phase 9 の品質レポートを開く
2. 全品質ゲートの結果を確認する
3. 基準未達の項目がないことを確認する

### Step 5: 過去教訓レビュー（タスク5）

1. `06-known-pitfalls.md` の P1-P4, P25-P28 を確認する
2. 各教訓が本タスクの成果物に反映されていることを確認する

### Step 6: baseline/current 分離レビュー（タスク6）

1. 仕様書内の baseline/current 判定分離ルールを確認する
2. 判定フローが明確に分離されていることを確認する

### Step 7: 3点同期レビュー（タスク7）

1. `task-workflow.md` / `SKILL.md`（2ファイル） / `LOGS.md`（2ファイル）の同期状態を確認する

### Step 8: 判定

1. タスク1〜7の全レビュー結果を集約する
2. PASS / MINOR / MAJOR / CRITICAL の判定を下す
3. 判定根拠を明記する
4. MINOR 指摘がある場合は3ステップ（指示書 → 残課題テーブル → 参照リンク）で未タスク化する
5. 最終レビュー結果を `outputs/phase-10/final-review-result.md` に記録する

## 統合テスト連携

最終レビューで全検証結果を横断確認する。Phase 11（手動テスト検証）では、本 Phase の判定結果を踏まえ、更新後の仕様書に従った運用手順の手動実行を行う。

| 統合検証項目     | 検証方法                            | 期待結果                         |
| ---------------- | ----------------------------------- | -------------------------------- |
| 要件充足         | Phase 1 要件定義書との突合          | FR-1〜FR-4 の全要件が達成        |
| 設計整合         | Phase 2 設計書との突合              | 意図しない乖離 0 件              |
| 検証完全性       | Phase 6-7 の検証結果確認            | 全シナリオ・テストケース PASS    |
| 品質基準         | Phase 9 の品質ゲート結果確認        | 全品質ゲート PASS                |
| 過去教訓反映     | P1-P4, P25-P28 の反映確認           | 全教訓が成果物に反映されている   |
| baseline/current | 判定分離ルールの確認                | 判定フローが明確に分離されている |
| 3点同期          | task-workflow/SKILL/LOGS の突合確認 | 5ファイル全て同期完了            |

## 多角的チェック観点

| 観点             | 確認内容                                                         | 判定基準                     |
| ---------------- | ---------------------------------------------------------------- | ---------------------------- |
| 要件充足         | Phase 1 の全要件（FR-1〜FR-4）が反映されている                   | 全 FR の達成率 100%          |
| 設計整合         | Phase 2 の設計方針から乖離していない                             | 乖離 0 件                    |
| 検証完全性       | Phase 6-7 の全検証シナリオがカバーされている                     | 未カバーシナリオ 0 件        |
| 品質基準         | Phase 9 の品質ゲートが全て PASS                                  | FAIL 0 件                    |
| 過去教訓         | P1-P4, P25-P28 の教訓が全て反映されている                        | 未反映教訓 0 件              |
| baseline/current | 監査結果の判定が正しく分離されている                             | 分離ルールが明文化されている |
| 3点同期          | task-workflow.md / SKILL.md / LOGS.md の同期ルールが一貫している | 5ファイル全てで同期完了      |

## 成果物

| 成果物           | パス                                      | 内容                                       |
| ---------------- | ----------------------------------------- | ------------------------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果・指摘事項・判定根拠・教訓反映状況 |

## 完了条件

- [ ] Phase 1 の全要件（FR-1〜FR-4）の達成確認が完了している
- [ ] Phase 2 の設計方針への準拠が確認されている
- [ ] Phase 6-7 の検証が全項目をカバーしていることが確認されている
- [ ] Phase 9 の品質ゲート全項目が基準を満たしている
- [ ] P1-P4, P25-P28 の教訓が全て成果物に反映されていることが確認されている
- [ ] baseline/current の判定分離ルールが明確に記載されていることが確認されている
- [ ] `task-workflow.md` / `SKILL.md`（2ファイル） / `LOGS.md`（2ファイル）の3点同期が完了している
- [ ] 判定結果（PASS / MINOR / MAJOR / CRITICAL）が記録されている
- [ ] 判定根拠が明記されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている（3ステップ完了）
- [ ] 最終レビュー結果（`outputs/phase-10/final-review-result.md`）が作成されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜7 + 判定）を100%実行完了
- [ ] 各タスクの完了を明記
- [ ] 成果物（final-review-result.md）が生成されていることを確認
- [ ] `artifacts.json` の Phase 10 ステータスを `completed` に更新

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/phase-11-manual-test.md`
