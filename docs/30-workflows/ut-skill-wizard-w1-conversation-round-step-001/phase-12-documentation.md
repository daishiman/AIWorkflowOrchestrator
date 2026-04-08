# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 12                                             |
| Phase名    | ドキュメント更新                               |
| 前提Phase  | Phase 11                                       |
| 後続Phase  | Phase 13                                       |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## Phase 12 記録分離方針

- `実行タスク` は plan、`Phase実行記録` と `outputs/phase-12/*.md` は current fact として扱う
- `task-specification-creator` をタスク仕様の正本、`aiworkflow-requirements` をシステム仕様の正本として扱い、両 skill の `SKILL.md` と `LOGS.md` は同じ結論になるように更新する
- `phase12-task-spec-compliance-check.md` では、`SKILL.md` / `LOGS.md` / `artifacts.json` / `outputs/phase-12/` の対応関係が 1:1 で一致していることを検証する
- `phase12-task-spec-compliance-check.md` は Task / Step / validator / artifacts.json / current-baseline の同値性を集約する root evidence として必ず作成する
- docs-only の current-fact 反映では、Phase 12 の成果物が揃った時点で status を `completed` に更新する
- 仕様更新の有無は `documentation-changelog.md` と `system-spec-update-summary.md` で同じ結論にする

---

## 目的

実装ガイド（Part 1/2）、システム仕様書更新、未タスク検出、スキルフィードバックレポートを完成させる。
6ファイルを全て出力することが完了条件。

---

## Task 12-1: 実装ガイド作成（2パート構成）

### Part 1: 中学生でも理解できる説明【必須】

> スキルを作る時、どんなスキルを作るかを決めるために「6つの質問」に答えます。
> 「誰が使うの？」「何のデータを入力するの？」「いつ動かすの？」といった質問です。
>
> ただ、6つの質問を全部一度に表示すると、画面がごちゃごちゃして見づらいですよね。
> そこで「3問ずつ」の2ページに分けて、少しずつ答えられるようにしました。
>
> また、Step 0（スキル名・目的・カテゴリ入力）で入力した内容をもとに、
> 「このスキルは自分のみが使うものかな？」「Slackと連携するスキルっぽいな」という
> 推測（スマートデフォルト）を自動的に計算して、最初から答えを入れておきます。
> ユーザーはそれを確認・修正するだけでよいので、手入力の手間が減ります。
>
> 推測できないときは、質問の答えを空欄のままにします（無理に答えを入れると逆に混乱するため）。

### Part 2: 技術者向けの詳細説明【Phase 5 実装後に記入】

（Phase 5 実装後に以下の内容を記入する）

**必須記載事項**:

- `ConversationRoundStepProps` インターフェース定義（TypeScript）
- `buildInitialAnswers(defaults: SmartDefaultResult): ConversationAnswers` の API シグネチャと使用例
- ページング設計（`useState<1 | 2>(1)`）の説明
- null フォールバック動作の説明（`selectedOption: null` 統一）
- テストコマンド（`pnpm --filter @repo/desktop vitest run`）

**出力先**: `outputs/phase-12/implementation-guide.md`

---

## Task 12-2: システム仕様書更新（2ステップ）

### Step 1-A: タスク完了記録

- `task-workflow-completed.md` に完了タスクを追記する
- `aiworkflow-requirements/LOGS.md` を更新する
- `task-specification-creator/LOGS.md` を更新する
- `aiworkflow-requirements/references/topic-map.md` を更新する（新規セクション追加時）

### Step 1-B: 実装状況テーブル更新

- `docs/30-workflows/skill-wizard-redesign-lane/index.md` の Wave 1 ステータスを更新する
- 本タスクのステータスを `completed` に変更する

### Step 1-C: 関連タスクテーブル更新

- `task-workflow-backlog.md` のステータスを `open` → `completed` に更新する
- 後続タスクの前提条件ステータスを current fact に更新する

### Step 2: システム仕様更新（条件付き）

新規 Props インターフェース (`ConversationRoundStepProps`) を追加するため、Step 2 は**必須**:

- `aiworkflow-requirements/references/ui-ux-feature-components-core.md` に `ConversationRoundStep` の Props / ページング / `InterviewProgressBar` 再利用方針を追記する
- `aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` を含む `interfaces-*.md` に Wave 1 コンポーネントの型定義を記録する
- `ConfigureStep.tsx` 削除と `wizard/index.ts` export 更新（`ConversationRoundStep` / `buildInitialAnswers` / `QUESTIONS`）を current fact として同期する

**出力先**: `outputs/phase-12/system-spec-update-summary.md`

---

## Task 12-3: ドキュメント更新履歴作成

全 Step（1-A/1-B/1-C/Step 2）の結果を個別に明記する（「該当なし」も記録）。

**出力先**: `outputs/phase-12/documentation-changelog.md`

---

## Task 12-4: 未タスク検出レポート作成【0件でも出力必須】

**検出ソース**:

- 元タスク仕様書の「スコープ外」項目:
  - Q3 スケジュール設定 UI の詳細実装
  - アニメーション・トランジション効果
  - Wave 2 との統合テスト
- Phase 10 MINOR 指摘事項
- Phase 11 で発見した事項
- コードコメント（TODO/FIXME）

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx \
  --output .tmp/unassigned-candidates.json
```

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

---

## Task 12-5: スキルフィードバックレポート作成【改善点なしでも出力必須】

| 観点             | 記録内容                                              |
| ---------------- | ----------------------------------------------------- |
| テンプレート改善 | Phase テンプレートの漏れや曖昧さ（NON_VISUAL 対応等） |
| ワークフロー改善 | 機械検証や手順分岐の改善余地                          |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補                |

**出力先**: `outputs/phase-12/skill-feedback-report.md`

---

## Task 12-6: Phase 12 準拠チェック作成

`phase12-task-spec-compliance-check.md` に以下を集約する:

- 全 5 Task の完了状態
- `artifacts.json` と `outputs/phase-12/` の 1対1 突合
- `task-workflow-completed.md` / `task-workflow-backlog.md` の ledger parity
- `index.md` と `artifacts.json` の status 同値確認

**出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

| 資料名                            | パス                                                                                        | 説明                     |
| --------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 12 ガイド                   | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | 詳細手順                 |
| spec-update-workflow              | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1/2 手順            |
| implementation-guide テンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`         | Part 1/2 テンプレート    |
| phase12-compliance テンプレート   | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 準拠チェックテンプレート |

---

## 成果物

| ファイル                                                 | 内容                                               |
| -------------------------------------------------------- | -------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド Part1（中学生レベル）+ Part2（技術者）  |
| `outputs/phase-12/system-spec-update-summary.md`         | システム仕様書更新サマリー                         |
| `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴（全 Step 記録）               |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート（0件でも出力必須）            |
| `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバックレポート（改善点なしでも必須） |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック（root evidence）             |

---

## 完了条件

- [ ] 上記 6ファイルが全て作成されている
- [ ] `implementation-guide.md` が Part 1（中学生レベル）と Part 2（技術者）の両方を含む
- [ ] `system-spec-update-summary.md` が Step 1-A〜1-C と Step 2 の全結果を記録している
- [ ] `documentation-changelog.md` が全 Step の結果を個別に明記している
- [ ] `unassigned-task-detection.md` が 0 件でも出力されている
- [ ] `skill-feedback-report.md` が改善点なしでも出力されている
- [ ] `artifacts.json` と `outputs/phase-12/` が同期されている
- [ ] `index.md` と `artifacts.json` の status が実装状況と一致している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（Task 12-1〜12-6）を100%実行完了
- [ ] 6成果物ファイルが全て生成されていることを確認
- [ ] `artifacts.json` の Phase 12 ステータスを `completed` に更新

---

## 次Phase

**Phase 13: PR作成** — ユーザーの明示的な承認後のみ実施する。
