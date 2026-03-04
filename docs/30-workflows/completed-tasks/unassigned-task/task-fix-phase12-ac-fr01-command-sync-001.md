# UT-FIX-PHASE12-AC-FR01-COMMAND-SYNC-001 - タスク指示書

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | UT-FIX-PHASE12-AC-FR01-COMMAND-SYNC-001               |
| タスク名     | AC-FR-01検証コマンドの見出し名同期                    |
| 分類         | 改善                                                  |
| 対象機能     | Phase 12 SubAgent成果物固定ガード（受入基準文書整合） |
| 優先度       | 低                                                    |
| 見積もり規模 | 小規模                                                |
| ステータス   | 未実施                                                |
| 発見元       | Phase 10 最終レビュー [10-7-M2]                       |
| 発見日       | 2026-03-04                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`phase12-subagent-artifact-guard` の Phase 1 受入基準 `AC-FR-01` は、テンプレート見出し検証コマンドを保持している。テンプレート側は見出し形式を「番号付き」から「見出し名ベース」へ更新済み。
加えて、Phase 11 画面証跡検証では `validate-phase11-screenshot-coverage` が `TC-XX` 抽出を前提としており、workflowによっては検証コマンドと実体確認の運用差分が発生する。

### 1.2 問題点・課題

`outputs/phase-1/acceptance-criteria.md` に残っている旧コマンド（`^## [1-7]\.`）は、現行テンプレート見出しへ一致しないため、検証の再現性が低い。

### 1.3 放置した場合の影響

- Phase 11/12 の再監査で AC-FR-01 の検証結果が不安定になる。
- 「受入基準は満たしているのにコマンドだけ失敗する」状態が継続し、監査ノイズを生む。

---

## 2. 何を達成するか（What）

### 2.1 目的

AC-FR-01 の検証コマンドを現行テンプレート見出し形式へ同期し、同一コマンドで常に同一結果が得られる状態にする。

### 2.2 最終ゴール

- AC-FR-01 が見出し名ベースの `rg` コマンドを使用している。
- 実行結果で summary テンプレートの全必須見出し（8件）が検出される。
- 画面証跡（`tc-01` と `tc-10`）が同一画像でないことを確認し、検証ログへ残す。

### 2.3 スコープ

#### 含むもの

- `docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard/outputs/phase-1/acceptance-criteria.md` の AC-FR-01 検証コマンド更新
- 検証証跡の記録（Phase 10/11/12 成果物の必要箇所）

#### 含まないもの

- テンプレート本体の構造変更
- Phase 12 ワークフロー全体の再設計

### 2.4 成果物

- 更新済み `outputs/phase-1/acceptance-criteria.md`
- 実行証跡（該当 workflow の `outputs/phase-10` または `outputs/phase-12`）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 対象 workflow: `docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard/`
- summary テンプレートの見出しが見出し名ベースであること

### 3.2 依存タスク

- `UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001`（完了）

### 3.3 必要な知識

- `rg` による見出し検証
- Phase 12 受入基準とテンプレート整合

### 3.4 推奨アプローチ

1. AC-FR-01 の旧コマンドを見出し名ベースへ差し替える。
2. コマンドを実行し、8件検出を確認する。
3. 検証結果を成果物へ記録し、未タスク台帳とシステム仕様書（`task-workflow.md` / `lessons-learned.md`）との整合を確認する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                      | 発見経緯                     | 解決策                                                                                 | 教訓                                                      |
| ------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| テンプレート見出し形式と検証コマンドのドリフト                            | 親タスク Phase 10 [10-7-M2]  | 見出し名ベースの正規表現へ統一                                                         | テンプレート変更時は検証コマンドを同時更新する            |
| 受入基準と実運用の不一致                                                  | Phase 11 再確認              | AC-FR-01 を実行可能コマンドに更新                                                      | 「文書は正しいがコマンドが古い」状態を残さない            |
| `validate-phase11-screenshot-coverage` の TC 抽出失敗（`expected TC: 0`） | 親タスク再監査（2026-03-04） | `screenshots/` 実体確認 + 代表画像目視確認（`tc-01`,`tc-10`）をフォールバック運用化    | 画面検証は「TC抽出」と「実体確認」の二段ガードで判定する  |
| `audit-unassigned-tasks` の baseline 値を差分違反と誤読                   | 親タスク再監査（2026-03-04） | 合否判定を `currentViolations=0` 固定にし、`baselineViolations` は監視値として分離記録 | 監査結果は `current=合否 / baseline=監視` の2軸で記録する |

### 3.6 同種課題の簡潔解決手順

1. 未タスク仕様書の見出しを `## メタ情報` + `## 1..9` で作成し、`rg` で10見出しを機械確認する。
2. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --target-file` を固定順で実行する。
3. `validate-phase11-screenshot-coverage` が TC 抽出不可で失敗した場合は、`screenshots` 実体確認と代表画像目視確認へフォールバックする。
4. `task-workflow.md` と `lessons-learned.md` を同一ターンで更新し、苦戦箇所と再利用手順を残す。

---

## 4. 実行手順

### Phase構成

- Phase A: 差分更新
- Phase B: 検証
- Phase C: 台帳同期

### Phase A: 差分更新

#### 目的

AC-FR-01 コマンドを現行仕様へ同期する。

#### 手順

1. `outputs/phase-1/acceptance-criteria.md` の AC-FR-01 旧コマンドを特定する。
2. 見出し名ベースコマンドへ置換する。
3. 差分を確認する。

#### 成果物

- 更新済み `acceptance-criteria.md`

#### 完了条件

- 旧コマンド（`^## [1-7]\.`）が残っていない。

### Phase B: 検証

#### 目的

更新コマンドで再現可能に検証できることを確認する。

#### 手順

1. 更新後のコマンドを実行する。
2. 8見出し検出を確認する。
3. 実行結果を記録する。

#### 成果物

- 検証結果ログ

#### 完了条件

- 8件検出が確認できる。

### Phase C: 台帳同期

#### 目的

未タスク台帳と検証結果の整合を保つ。

#### 手順

1. `task-workflow.md` 残課題テーブルの当該行を確認する。
2. `lessons-learned.md` の該当教訓へ苦戦箇所を同期する。
3. 必要なら関連成果物への参照を追記する。
4. `verify-unassigned-links` を実行する。

#### 成果物

- 台帳整合記録

#### 完了条件

- 参照切れ 0 件

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-FR-01 コマンドが見出し名ベースへ更新されている
- [ ] 8見出しが検出される

### 品質要件

- [ ] 旧コマンドが残存していない
- [ ] 検証結果が再実行可能

### ドキュメント要件

- [ ] 検証結果が成果物に記録されている
- [ ] 未タスク台帳との整合が取れている
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` と `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` に同一ターンで反映されている

---

## 6. 検証方法

### テストケース

- TC-1: AC-FR-01 コマンド実行で8件検出される
- TC-2: `verify-unassigned-links` で missing=0
- TC-3: `validate-phase11-screenshot-coverage` が TC 抽出不可の場合でも、`screenshots/` 実体確認 + 代表画像目視確認で検証継続できる
- TC-4: `tc-01-skill-list.png` と `tc-10-dark-mode.png` のハッシュが一致しない

### 検証手順

1. `rg -n '^## メタ情報$|^## 実装内容|^## 仕様書別|^## 仕様反映|^## 苦戦|^## 同種|^## 検証|^## Phase 12' .claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
2. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
3. `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard`（失敗時は `docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard/outputs/phase-11/screenshots/` の実体確認へフォールバック）
4. `shasum -a 256 docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard/outputs/phase-11/screenshots/tc-01-skill-list.png docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard/outputs/phase-11/screenshots/tc-10-dark-mode.png`（同値なら再撮影タスク化）

---

## 7. リスクと対策

| リスク                                                                 | 影響度 | 発生確率 | 対策                                                                             |
| ---------------------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------- |
| 更新漏れで旧コマンドが残る                                             | 低     | 中       | `rg "\^## \[1-7\\]\\."` で再確認する                                             |
| 参照先ファイル変更で件数が変動                                         | 低     | 低       | テンプレート見出し変更時は受入基準も同ターン更新する                             |
| ダークモード証跡が通常表示と同一画像になり、画面検証の信頼性が低下する | 中     | 中       | `tc-01`/`tc-10` のハッシュ比較を検証手順へ追加し、同値時は再撮影を未タスク化する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard/outputs/phase-10/final-review-result.md`（[10-7-M2]）
- `docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard/outputs/phase-1/acceptance-criteria.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
[10-7-M2] summaryテンプレートのAC-FR-01検証コマンドとセクション見出しの不整合
```

### 補足事項

本タスクは運用整合の補修であり、プロダクションコード変更は含まない。
