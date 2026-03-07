# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 12                     |
| 機能名 | agent-view-enhancement |
| 作成日 | 2026-03-07             |

## 目的

実装したAIアシスタント画面リデザイン（Tap & Discover）の内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成

## 実行タスク

| Task      | 内容                                                   | 主成果物                                      |
| --------- | ------------------------------------------------------ | --------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`    |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/spec-update-summary.md`     |
| Task 12-3 | ドキュメント更新履歴作成                               | `outputs/phase-12/documentation-changelog.md` |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-report.md`  |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`   |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

## 参照資料

| 資料名                         | パス                                                                                                                                  | 説明                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| タスク仕様書                   | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-058a-ui-03-agent-view-enhancement.md` | 元タスク仕様書                  |
| Phase 2 設計成果物             | `outputs/phase-2/architecture-design.md`                                                                                              | 依存Phase 2成果物               |
| Phase 5 実装成果物             | `outputs/phase-5/implementation-report.md`                                                                                            | 依存Phase 5成果物               |
| Phase 6 テスト拡充成果物       | `outputs/phase-6/test-expansion-report.md`                                                                                            | 依存Phase 6成果物               |
| Phase 7 カバレッジ成果物       | `outputs/phase-7/coverage-report.md`                                                                                                  | 依存Phase 7成果物               |
| Phase 8 リファクタリング成果物 | `outputs/phase-8/refactoring-report.md`                                                                                               | 依存Phase 8成果物               |
| Phase 9 品質成果物             | `outputs/phase-9/quality-report.md`                                                                                                   | 依存Phase 9成果物               |
| Phase 10 最終レビュー          | `outputs/phase-10/final-review-result.md`                                                                                             | Phase 10成果物（MINOR指摘含む） |
| Phase 11 手動テスト            | `outputs/phase-11/manual-test-result.md`                                                                                              | Phase 11成果物                  |
| Phase 11 発見課題              | `outputs/phase-11/discovered-issues.md`                                                                                               | Phase 11で発見した課題          |
| Phase 11/12 ガイド             | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                                           | Phase 12詳細ガイド              |
| spec-update-workflow           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                                                        | システム仕様書更新手順          |
| UIコンポーネント仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                               | コンポーネント設計仕様          |
| UI機能コンポーネント仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                       | 機能コンポーネント仕様          |
| UIデザイン原則                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                                        | デザイン原則仕様                |
| UIアーキテクチャ               | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                                                             | UIアーキテクチャ仕様            |
| 状態管理仕様                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                          | Zustand Store設計               |
| タスクワークフロー仕様         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                  | 完了タスク/未タスク同期先       |
| 教訓仕様                       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                | 苦戦箇所/再発防止同期先         |
| 仕様更新ガイドライン           | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`                                                                | 命名・更新手順                  |

## 依存Phase成果物参照

依存の正本は `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/requirements-traceability-matrix.md` の「依存関係トレース」を参照する。

## 実行手順

### Task 1: 実装ガイド作成

**2パート構成**の実装ガイドを作成する:

| パート     | 対象読者                 | 内容                                            |
| ---------- | ------------------------ | ----------------------------------------------- |
| **Part 1** | **初学者・中学生レベル** | **概念的説明（日常の例え話、専門用語なし）**    |
| Part 2     | 開発者・技術者           | 技術的詳細（型定義・コンポーネントAPI・使用例） |

#### Part 1（中学生レベル）記述ルール

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 図表より文章での説明を優先
- 「なぜ必要か」を先に説明してから「何をするか」を説明

#### Part 1 で扱うべきトピック

1. **「Tap & Discover」体験とは何か**
   - 日常の例え: 「お店のショーケース」に例える。ショーケース（Level 1）には人気商品だけが並んでいて、詳しい情報が知りたければ店員に聞く（Level 2の詳細設定パネル）
   - Level 1 / Level 2 の情報階層の説明: 最初に見える画面は「何ができるか」と「実行する」だけ
2. **AIアシスタント画面の3つの要素**
   - できること（ツール選択チップ）: ショーケースに並ぶ商品のように、できることが大きなアイコンで並んでいる
   - 実行ボタン: レジのように、選んだものを「実行する」
   - 最近の実行: レシートのように、最近やったことがわかる
3. **詳細設定パネル（Level 2）**
   - 歯車アイコン = 「お店の裏側」。普段は見えないけど、AIの種類や許可設定を変更できる

#### Part 2 で扱うべきトピック

1. **TypeScript 型定義**: SkillChipProps, ExecuteButtonProps, FloatingExecutionBarProps, AdvancedSettingsPanelProps, RecentExecutionListProps
2. **コンポーネントAPI**: 各コンポーネントのProps・使用例・配置パターン
3. **状態管理パターン**: agentSlice 拡張（recentExecutions, isAdvancedSettingsOpen）、個別セレクタパターン（P31対策）
4. **マイクロインタラクション実装詳細**: CSS keyframes定義、アニメーションタイミング統一ルール（ホバー200ms / タップ100-150ms / スライドイン300ms / スライドアウト200ms）
5. **z-index管理**: GlobalNavStrip(z-20) / AdvancedSettingsPanel(z-40/41) / FloatingExecutionBar(z-50)

#### Part 1 検証

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement \
  --json
```

**成果物**: `outputs/phase-12/implementation-guide.md`

---

### Task 2: システムドキュメント更新

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

#### Step 1-A: タスク完了記録

- [ ] `ui-ux-feature-components.md` にAgentViewリデザイン完了タスクセクションを追加
- [ ] `ui-ux-components.md` に新規コンポーネント（SkillChip, ExecuteButton, FloatingExecutionBar, AdvancedSettingsPanel, RecentExecutionList）を追加
- [ ] `arch-state-management.md` にagentSlice拡張（recentExecutions, isAdvancedSettingsOpen, 個別セレクタ4件）を追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方必須** -- P1, P25）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴テーブルを更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴テーブルを更新
- [ ] 変更履歴へ追記した Version が既存行と重複していないことを確認（同日追補時は最大値 + 0.0.1 で採番）

#### Step 1-B: 実装状況テーブル更新

- [ ] `ui-ux-feature-components.md` のAgentView実装ステータスを「リデザイン完了（Tap & Discover）」に更新

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-UI-03" references/` で関連仕様書を検索して更新
- [ ] 関連仕様書のタスクテーブルのステータスを「完了」に更新

#### Step 1-D: topic-map.md 再生成

本タスクは新規コンポーネント5件の追加を含むため、topic-map.md の再生成が**必須**:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

#### Step 2: システム仕様更新

本タスクは新規コンポーネント5件（SkillChip, ExecuteButton, FloatingExecutionBar, AdvancedSettingsPanel, RecentExecutionList）の追加とAgentViewレイアウト変更を含むため、システム仕様更新が**必要**:

| 更新対象ファイル              | 更新内容                                                                               |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| `ui-ux-components.md`         | 新規コンポーネント5件の追加（Props型定義・マイクロインタラクション仕様含む）           |
| `ui-ux-feature-components.md` | AgentViewリデザイン（シングルカラム・Tap & Discover体験）の完了記録                    |
| `ui-ux-design-principles.md`  | マイクロインタラクション統一ルール（ホバー200ms / タップ100-150ms等）の追加            |
| `arch-state-management.md`    | agentSlice拡張（recentExecutions, isAdvancedSettingsOpen, 個別セレクタ4件）            |
| `arch-ui-components.md`       | AgentViewコンポーネント階層の更新（Atomic Design: organisms配下に5コンポーネント追加） |

**成果物**: `outputs/phase-12/spec-update-summary.md`

---

### Task 3: ドキュメント更新履歴 & artifacts.json更新

```bash
# Step 1: ドキュメント更新履歴生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement

# Step 2: Phase 12完了登録（artifacts.json更新）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-report.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート,outputs/phase-12/spec-update-summary.md:仕様書更新サマリー"
```

**documentation-changelog.md 記載ルール**:

- 各 Step（1-A/1-B/1-C/1-D/Step 2）の結果を個別に明記する
- 「該当なし」の場合もその旨と判断根拠を記録する
- **全Step確認前に「完了」と記載しない**（P4対策）

**artifacts.json 必須項目**:

- Phase 12のステータスが `completed` に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics` セクションに品質指標が記録されていること

**成果物**: `outputs/phase-12/documentation-changelog.md`

---

### Task 4: 未タスク検出

| #   | ソース                    | 確認項目                                                                                      |
| --- | ------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | Phase 10 レビュー結果     | MINOR判定の指摘事項（全て未タスク化必須）                                                     |
| 2   | Phase 11 手動テスト結果   | `discovered-issues.md` の修正困難な問題                                                       |
| 3   | Phase 11 アクセシビリティ | WCAG違反があれば未タスク化                                                                    |
| 4   | コードベース              | `grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/components/organisms/AgentView/` |

**未タスク検出時の3ステップ**（P3準拠 -- 全ステップ完了必須）:

1. `docs/30-workflows/unassigned-task/` に指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

**0件の場合**も以下の形式で出力:

```markdown
## 検出結果サマリー

| ソース            | 検出数  |
| ----------------- | ------- |
| Phase 10 レビュー | 0件     |
| Phase 11 発見課題 | 0件     |
| アクセシビリティ  | 0件     |
| コードベース      | 0件     |
| **合計**          | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

**成果物**: `outputs/phase-12/unassigned-task-report.md`

---

### Task 5: スキルフィードバックレポート作成

**改善点がなくても「改善点なし」としてレポートを作成する（省略不可）。**

| セクション         | 記載内容                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------ |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案                                                    |
| 技術的教訓         | Tap & Discover リデザイン実装中に得られた技術的な知見（マイクロインタラクション、z-index管理等） |
| スキル改善提案     | task-specification-creator / skill-creator への改善提案                                          |
| 新規Pitfall候補    | 06-known-pitfalls.md に追加すべき新規Pitfall                                                     |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

## 統合テスト連携

Phase 12 では直接的な統合テストは実施しないが、以下を確認する:

| 確認項目                     | 内容                                                            |
| ---------------------------- | --------------------------------------------------------------- |
| 実装ガイドのコード例動作確認 | Part 2 に記載したコード例が実際のコードベースと整合していること |
| 仕様書と実装の整合           | 更新した仕様書の型定義・Props が実際の実装と一致していること    |

## 多角的チェック観点

| 観点               | 確認内容                                                            |
| ------------------ | ------------------------------------------------------------------- |
| 日本語品質         | Part 1 が中学生でも理解できる平易な日本語で書かれている             |
| コード例の正確性   | Part 2 のTypeScript型定義が実装コードと一致している                 |
| 仕様書の自己完結性 | 更新した仕様書が依存パス・完了条件を明記している                    |
| 未タスク網羅性     | Phase 10 MINOR指摘が全て未タスク化されている                        |
| P4 対策            | documentation-changelog.md に全Step確認前に「完了」を記載していない |

## Phase 12 自動化コマンド

```bash
# topic-map.md再生成（Step 1-D）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement \
  --regenerate

# 実装ガイド内容要件（Task 1）
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement \
  --json

# SKILL検証（全3スキル）
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done

# 未タスク監査（対象監査: current）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

# 全体監査（baseline監視）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# ESLintキャッシュクリア
rm -rf node_modules/.cache/eslint-*
pnpm lint --cache=false

# スクリーンショットカバレッジ検証（Phase 11成果物確認）
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement \
  --allow-non-visual-tc TC-10
```

## 成果物

| 成果物                       | パス                                          | 必須 | 説明                       |
| ---------------------------- | --------------------------------------------- | ---- | -------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`    | 必須 | 概念的+技術的ドキュメント  |
| 仕様書更新サマリー           | `outputs/phase-12/spec-update-summary.md`     | 必須 | Step 1-A〜Step 2の実施結果 |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md` | 必須 | 更新履歴                   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-report.md`  | 必須 | 検出結果（0件でも出力）    |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`   | 必須 | 改善点（0件でも出力必須）  |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`      | 条件 | 検出時のみ作成             |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 中学生レベル概念説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] `validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement` が PASS
- [ ] 【Step 1-A】システム仕様書に「完了タスク」セクションを追加した
- [ ] 【Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] 【Step 1-A】LOGS.md **2ファイル両方**（aiworkflow-requirements + task-specification-creator）を更新した
- [ ] 【Step 1-A】SKILL.md **2ファイル両方**の変更履歴テーブルにバージョンを追記した（P29対策）
- [ ] 【Step 1-A】変更履歴へ追記した Version が既存行と重複していないことを確認した
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件
- [ ] 【Step 1-C】`grep -rn "TASK-UI-03" references/` で関連タスクテーブルを全件確認した
- [ ] 【Step 1-D】topic-map.md 再生成を実行した
- [ ] 【Step 2】システム仕様更新の要否を判断し、documentation-changelog.md に記録した
- [ ] 【Step 2】システム仕様を更新した（新規コンポーネント5件 + agentSlice拡張 + レイアウト変更のため必須）
- [ ] 【Step 2】`spec-update-summary.md` と `documentation-changelog.md` の両方が「更新あり」で一致していることを確認した
- [ ] 【Step 2】苦戦箇所をシステム仕様書（`lessons-learned.md` 等）に記録した
- [ ] `outputs/phase-12/spec-update-summary.md` を作成し、Step 1-A〜Step 2 の実施結果を記録した
- [ ] `outputs/phase-12` の必須5成果物実体と `artifacts.json` の `phases.12.status=completed` が同期している
- [ ] 未タスク検出レポートが出力されている（0件でも必須）
- [ ] スキルフィードバックレポートが出力されている（改善点なしでも必須）
- [ ] 未タスク検出時、関連ファイル調査（同様パターンの他ファイル）を実施した（P24対策）
- [ ] 未タスク検出時、3ステップ全完了（①指示書作成 → ②task-workflow.md登録 → ③関連仕様書リンク）
- [ ] 未タスク検出時、指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/`）
- [ ] 未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている（P3派生対策）
- [ ] テスト数が実際の `it()` ブロック数と一致すること（Phase 4 の想定値ではなく実測値を使用）
- [ ] `audit-unassigned-tasks.js --json --diff-from HEAD` を実行し、`currentViolations.total = 0` を確認した
- [ ] `artifacts.json` が更新されている
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement --regenerate` を実行し、`index.md` が `artifacts.json` と一致
- [ ] UI/UX変更タスクのため: Phase 11のスクリーンショットがコミットに含まれる状態である
- [ ] UI/UX変更タスクのため: `validate-phase11-screenshot-coverage.js` が PASS であることを記録した
- [ ] Phase 13（`/ai:diff-to-pr`）で参照する `TARGET_WORKFLOW_DIR` が `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement` を指すことを確認した
- [ ] PR本文 `## その他` に Phase 12 実装ガイド反映元パスと要点を記載する準備ができている
- [ ] **本Phase内の全タスクを100%実行完了**

## 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID     | ポイント                                     | 対策                                                          |
| ------ | -------------------------------------------- | ------------------------------------------------------------- |
| P1     | LOGS.md 2ファイル更新漏れ                    | aiworkflow-requirements + task-specification-creator 両方更新 |
| P2     | topic-map.md 再生成忘れ                      | セクション変更時は必ず `generate-index.js` を実行             |
| P3     | 未タスク管理の3ステップ不完全                | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク           |
| P4     | documentation-changelog への早期「完了」記載 | 全Step確認前に「完了」と書かない                              |
| P27    | topic-map.md 再生成トリガー判断ミス          | 追加だけでなく削除・更新も再生成トリガー                      |
| P29    | SKILL.md 変更履歴の更新漏れ                  | LOGS.md とは別にSKILL.md の変更履歴テーブルも更新             |
| P3派生 | 未タスク配置ディレクトリの間違い             | 必ず `unassigned-task/` に配置。親タスクの `tasks/` ではない  |

## 次のPhase

Phase 13: PR作成
