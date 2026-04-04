# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目      | 値                                                                                                                                                                                                       |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase     | 12                                                                                                                                                                                                       |
| 機能名    | imp-layer12-spec-definition-004                                                                                                                                                                          |
| 作成日    | 2026-04-03                                                                                                                                                                                               |
| 前提Phase | Phase 11（手動テスト検証）完了                                                                                                                                                                           |
| 後続Phase | Phase 13（PR作成）                                                                                                                                                                                       |
| 成果物    | `outputs/phase-12/`（implementation-guide.md, system-spec-update-summary.md, documentation-changelog.md, unassigned-task-detection.md, skill-feedback-report.md, phase12-task-spec-compliance-check.md） |

## 目的

check ID 体系（19 check ID、Layer 1-4 命名規則、拡張ガイドライン）の追記内容をシステム仕様に反映し、技術ドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12 実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成
   - P29: SKILL.md 変更履歴の更新漏れ

## 実行タスク

- Task 12-1: 実装ガイド作成（2パート構成）
- Task 12-2: システムドキュメント更新（2ステップ）
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出（0件でも出力必須）
- Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）
- Task 12-6: phase12-task-spec-compliance-check（Task 1〜5 の全完了確認）

## SubAgent分担

| SubAgent | 担当                                        | 並列可否           | 依存                    |
| -------- | ------------------------------------------- | ------------------ | ----------------------- |
| A        | Task 12-1: 実装ガイド作成                   | B と並列可         | Phase 11 の成果物       |
| B        | Task 12-2: システムドキュメント更新         | A と並列可         | Phase 11 の成果物       |
| C        | Task 12-3: ドキュメント更新履歴作成         | A/B 完了後に並列可 | Task 12-1/12-2 の成果物 |
| D        | Task 12-4: 未タスク検出                     | A/B 完了後に並列可 | Task 12-1/12-2 の成果物 |
| E        | Task 12-5: スキルフィードバックレポート作成 | A/B 完了後に並列可 | Task 12-1/12-2 の成果物 |

- Task 12-2 の内部では、`aiworkflow-requirements` 側の更新と `task-specification-creator` 側の更新を別 SubAgent に切り分ける。
- Task 12-3〜12-5 は互いに独立しているため、Task 12-1/12-2 の成果物が揃い次第、並列実行する。
- Task 12-6 は Task 12-1〜12-5 の完了後にのみ実行し、Phase 12 の閉鎖条件を最終確認する。

## 参照資料

| 資料名                   | パス                                                                                    | 説明                     |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------ |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                                                | Phase 11成果物           |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`                                             | Phase 11成果物           |
| 撮影計画                 | `outputs/phase-11/screenshot-plan.json`                                                 | NON_VISUAL 補助証跡      |
| プレースホルダー画像     | `outputs/phase-11/screenshots/non-visual-placeholder.png`                               | NON_VISUAL 補助証跡      |
| 発見課題                 | `outputs/phase-11/discovered-issues.md`                                                 | Phase 11発見事項         |
| Phase 1 要件定義         | `phase-1-requirements.md`                                                               | check ID体系の要件       |
| Phase 2 設計             | `phase-2-design.md`                                                                     | check ID体系の設計       |
| Phase 3 設計レビュー     | `phase-3-design-review.md`                                                              | 設計レビュー結果         |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`            | レイヤー構成             |
| タスクワークフロー       | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | 完了記録・残課題更新規約 |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | 検証・証跡記録の品質基準 |
| ディレクトリ構成         | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`              | 参照パスと配置規約       |
| 仕様更新ワークフロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Phase 12更新手順         |
| Phase 11/12ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | ドキュメント更新詳細     |
| 技術ドキュメントガイド   | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | 実装ガイド記述ルール     |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                    | 過去インシデントの教訓   |

---

## Task 12-1: 実装ガイド作成【必須・2パート構成】

### 概要

| パート | 対象読者             | 内容                                                |
| ------ | -------------------- | --------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | check ID体系を日常の例え話で説明（専門用語なし）    |
| Part 2 | 開発者・技術者       | Layer構成、check IDテーブル、実装との対応、拡張手順 |

### Part 1: 概念的説明（中学生レベル）

**記述ルール**:

- 「品質チェックリスト」のたとえで check ID 体系を説明する
- 「なぜ必要か」を先に説明してから「何をするか」を説明する
- 専門用語は使わない（使う場合は即座に説明）
- **validator安定化**: 「たとえば」を最低 1 回含める

**テンプレート**:

```markdown
### check IDとは何か

#### なぜ必要か

[ソフトウェアの品質をチェックするとき、何をチェックしたかを
記録しておかないと、後から「あのチェックはやったっけ？」と
分からなくなる。check IDは「品質チェックリスト」の各項目に
つけた番号のようなもの]

#### 日常生活での例え（品質チェックリスト）

[たとえば、料理を作るときのレシピを想像してください。
レシピには「1. 材料を切る」「2. 鍋で煮る」「3. 味付けする」のように
番号がついています。check IDはこの番号と同じで、
「L1-001」は「レイヤー1の1番目のチェック」という意味です。
レイヤーは「工程」のようなもので、
Layer 1は基本チェック、Layer 2は構造チェック...というように
段階が分かれています]
```

### Part 2: 技術的詳細（開発者向け）

以下を含めること:

- Layer 構成（Layer 1-4 の概要と各 Layer の役割）
- check ID テーブル（全 19 check ID の一覧）
  - Layer 1: 5 個
  - Layer 2: 7 個
  - Layer 3: 4 個
  - Layer 4: 3 個
- SkillCreatorVerificationEngine.ts との対応関係
- check ID の命名規則: `L{N}-{NNN}`（N=Layer番号, NNN=3桁連番）
- 拡張手順（新しい check ID を追加する方法）
  - 該当 Layer の連番の次の番号を割り当て
  - SkillCreatorVerificationEngine.ts への実装追加
  - 仕様書への追記

### 成果物

| 成果物     | パス                                       |
| ---------- | ------------------------------------------ |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` |

---

## Task 12-2: システムドキュメント更新【必須・2ステップ】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1: タスク完了記録【必須】

#### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方必須** -- P1, P25）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新（**P29対策**）
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新（**P29対策**）

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] 本タスクは docs-only タスク（コード実装なし）のため、実装状況テーブルの更新は不要
- [ ] `system-spec-update-summary.md` に「Step 1-B: 該当なし（理由: docs-only タスクでコード実装を伴わない）」を明記

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "imp-layer12-spec-definition-004" references/` で関連仕様書を検索して更新
- [ ] `grep -rn "check ID\|Layer.*spec" references/` で関連パターンを持つ仕様書を検索

#### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** -- P2, P27）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] 再生成された topic-map.md に新規セクションの行番号が正しく反映されていることを確認

### Step 2: システム仕様更新【本タスクは必要】

**更新理由**: docs-only タスクだが、aiworkflow-requirements に check ID 体系の新規セクションを追加するため Step 2 が必要。

**更新判断基準**:

| 更新必要                           | 更新不要                 |
| ---------------------------------- | ------------------------ |
| 新規セクション追加（本タスク該当） | 内部実装の詳細変更のみ   |
| 既存仕様の構造変更                 | バグ修正（仕様変更なし） |

**更新対象**:

| #   | 更新対象                | 更新内容                                                                      | 必須/任意 |
| --- | ----------------------- | ----------------------------------------------------------------------------- | --------- |
| 1   | aiworkflow-requirements | check ID 体系セクション追加（19 check ID + Layer命名規則 + 拡張ガイドライン） | 必須      |
| 2   | task-workflow.md        | 完了タスクセクション追加、残課題テーブル更新                                  | 必須      |

### 成果物

| 成果物           | パス                                             |
| ---------------- | ------------------------------------------------ |
| 仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md` |

---

## Task 12-3: ドキュメント更新履歴作成【必須】

### 目的

Phase 12 で実施した全ドキュメント更新の履歴を記録する。

### 手順

1. Task 12-1 で作成した実装ガイドの内容サマリーを記録
2. Task 12-2 で更新したシステム仕様の変更一覧を記録
3. LOGS.md / SKILL.md / topic-map.md の更新記録を含める

### 記録上の注意

- DON'T: 全 Step 確認前に documentation-changelog.md に「完了」と記載しない（P4対策）
- DO: 各 Step の完了結果を詳細に記録すること

### 成果物

| 成果物               | パス                                          |
| -------------------- | --------------------------------------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` |

---

## Task 12-4: 未タスク検出【0件でも出力必須】

### 確認ソース

| #   | ソース               | 確認項目                      |
| --- | -------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果  | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果 | MINOR判定の指摘事項           |
| 3   | Phase 11発見事項     | discovered-issues.md の内容   |
| 4   | 各Phase成果物        | 「将来対応」「TODO」「FIXME」 |

### 検出方法

```bash
# 関連ディレクトリ内のTODO/FIXMEスキャン
grep -rn "TODO\|FIXME\|HACK\|XXX" .claude/skills/aiworkflow-requirements/references/ --include="*.md" || echo "検出なし"
```

### 未タスク発見時の3ステップ（P3準拠）

1. `docs/30-workflows/unassigned-task/` に指示書を作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に未タスク参照リンクを追加する

### 0件の場合の出力形式

```markdown
## 検出結果サマリー

| ソース               | 検出数  |
| -------------------- | ------- |
| Phase 3レビュー結果  | 0件     |
| Phase 10レビュー結果 | 0件     |
| Phase 11発見事項     | 0件     |
| TODO/FIXME           | 0件     |
| **合計**             | **0件** |

## 検出タスク一覧

**検出タスクなし**
```

### 成果物

| 成果物               | パス                                            |
| -------------------- | ----------------------------------------------- |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` |

---

## Task 12-5: スキルフィードバックレポート作成【改善点なしでも出力必須】

### 確認観点

| 観点             | 確認内容                                            |
| ---------------- | --------------------------------------------------- |
| テンプレート改善 | check ID体系の記述テンプレートを標準化すべきか      |
| ワークフロー改善 | check ID突き合わせを自動検証スクリプト化できるか    |
| ドキュメント改善 | Layer命名規則の説明を他のスキル仕様にも展開すべきか |
| 新規Pitfall候補  | 06-known-pitfalls.md に追加すべき新規パターン       |

### 成果物

| 成果物                       | パス                                        |
| ---------------------------- | ------------------------------------------- |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md` |

---

## Task 12-6: phase12-task-spec-compliance-check【必須】

### 確認目的

Task 12-1〜12-5 の成果物が Phase 12 の完了条件を満たしているかを、1 ファイルに集約して最終確認する。

### 確認観点

- 6 つの Phase 12 成果物が存在する
- `validate-phase12-implementation-guide.js` が PASS している
- `artifacts.json` と `outputs/artifacts.json` が一致している
- `phase-12-documentation.md` の Task 1〜6 と成果物一覧が一致している
- docs-only / NON_VISUAL のため、実 UI/スクリーンショット証跡は不要で、補助証跡を配置している
- 将来対応を示す表現が残っていない

### 成果物

| 成果物   | パス                                                     |
| -------- | -------------------------------------------------------- |
| 準拠確認 | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

---

## 統合テスト連携

N/A -- docs-only タスクのため統合テストは不要。

## 成果物

| 成果物                       | パス                                                     | 必須 | 説明                         |
| ---------------------------- | -------------------------------------------------------- | ---- | ---------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | ✅   | 2パート構成（中学生+技術者） |
| 仕様更新サマリー             | `outputs/phase-12/system-spec-update-summary.md`         | ✅   | Step 1-2の実施結果           |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | ✅   | 全更新の記録                 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | ✅   | 0件でも出力                  |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | ✅   | 改善点なしでも出力           |
| 準拠確認レポート             | `outputs/phase-12/phase12-task-spec-compliance-check.md` | ✅   | Task 12-1〜12-5 の全完了確認 |

## 完了条件

- [ ] Task 12-1: 実装ガイドが 2 パート構成で作成されている
- [ ] Task 12-1: Part 1 に「たとえば」が最低 1 回含まれている
- [ ] Task 12-1: Part 1 で「なぜ必要か」を先に説明している
- [ ] Task 12-2 Step 1-A: `aiworkflow-requirements/LOGS.md` を更新した
- [ ] Task 12-2 Step 1-A: `task-specification-creator/LOGS.md` を更新した（**P1, P25対策: 2ファイル両方**）
- [ ] Task 12-2 Step 1-A: `aiworkflow-requirements/SKILL.md` 変更履歴を更新した（**P29対策**）
- [ ] Task 12-2 Step 1-A: `task-specification-creator/SKILL.md` 変更履歴を更新した（**P29対策**）
- [ ] Task 12-2 Step 1-D: topic-map.md を再生成した（**P2, P27対策**）
- [ ] Task 12-2 Step 2: aiworkflow-requirements に check ID 体系セクションを追記した
- [ ] Task 12-3: `documentation-changelog.md` を作成した
- [ ] Task 12-4: `unassigned-task-detection.md` を作成した（0件でも出力）
- [ ] Task 12-5: `skill-feedback-report.md` を作成した（改善点なしでも出力）
- [ ] Task 12-6: `phase12-task-spec-compliance-check.md` を作成した（Task 1〜5 の全完了確認）
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 13: PR作成（`phase-13-pr-creation.md`）
