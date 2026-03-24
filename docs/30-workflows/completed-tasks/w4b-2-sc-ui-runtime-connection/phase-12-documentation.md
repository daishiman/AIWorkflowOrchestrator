# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                               |
| -------- | -------------------------------- |
| Phase    | 12                               |
| タスクID | TASK-SC-06-UI-RUNTIME-CONNECTION |
| 機能名   | w4b-2-sc-ui-runtime-connection   |
| 作成日   | 2026-03-22                       |
| 更新日   | 2026-03-24                       |

## 目的

UI→Runtime パイプライン接続の実装ガイドを作成し、システム仕様書を更新し、未タスクを検出・記録する。Phase 12 は漏れが最も発生しやすい Phase であるため、全チェック項目を逐次確認してから完了とする（P43 対策）。

## 依存関係

- 前提成果物: Phase 11 手動テスト結果（全シナリオ PASS）

## 注意事項（P43/P51 対策）

- documentation-changelog.md には各 Step の実行結果を「事後記録」する。実行前に「完了」と書かない
- サブエージェントに委譲する場合は 3 ファイル以下/エージェントに分割する
- 全 Step 完了後に `git diff --stat -- .claude/skills/` で実際の変更ファイル数を検証する

## 実行タスク

- Task 1: 実装ガイド作成（Part 1 中学生レベル + Part 2 開発者向け + コンポーネントドキュメント）
- Task 2: システム仕様書更新（Step 1-A〜1-D + 条件付き Step 2）
- Task 3: documentation-changelog.md 作成（全 Step 完了後に記録: P4 対策）
- Task 4: 未タスク検出レポート作成（0件でも出力必須: P3 対策）
- Task 5: スキルフィードバックレポート作成（改善点なしでも出力必須）

---

## Task 1: 実装ガイド

### 1-A: implementation-guide.md Part 1（中学生レベル概念説明）

**作成先**: `docs/30-workflows/w4b-2-sc-ui-runtime-connection/implementation-guide.md`

#### 説明すべき概念

1. **スキル自動生成フローとは（日常の例え）**

   「料理店で注文するイメージ」で説明する:
   - ユーザーが「何を自動化したいか」を自然言語で伝える（= メニューを見ずに「おまかせ」と言う）
   - AI（planSkill）が「こんな手順でやってみましょう」と計画を立てる（= シェフが「今日のおすすめコースはこちら」と提案する）
   - ユーザーが「それでお願い」と承認する（= コース料理を注文する）
   - AI（executePlan）が実際にスキルを生成する（= シェフが料理を作る）
   - 完成したスキルがスキルリストに追加される（= 料理が提供される）

2. **Terminal Handoff とは**

   「料理店が材料切れで、別の店を紹介するイメージ」で説明する:
   - AI が「この要求は自分では対応できないけど、CLI で実行すればできますよ」と案内する
   - TerminalHandoff ガイダンスに CLI コマンドが表示される
   - ユーザーはターミナルでコマンドを手動実行する

3. **フロー図（テキスト形式）**

   ```
   ユーザーが「方針を決める」クリック
         ↓
   detectMode（このタスクはどのモード？）
         ↓
   plan モード → planSkill（AIが計画立案）
         ↓
   ┌─ integrated_api → 計画表示 → ユーザー承認 → executePlan → スキル完成
   └─ terminal_handoff → CLIガイダンス表示 → ユーザーが手動実行
   ```

### 1-B: implementation-guide.md Part 2（開発者向け実装詳細）

#### 説明すべき内容

1. **変更ファイル一覧と変更概要**

   | ファイル                                       | 変更内容                                                                                                                  |
   | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
   | `SkillLifecyclePanel.tsx`                      | `handlePrepare()` 拡張: detectMode 後に planSkill を呼び出す条件分岐追加                                                  |
   | `agentSlice.ts`                                | 5 フィールド追加（isGenerating, generationProgress, generationError, currentPlanId, currentPlanResult）+ 6 アクション追加 |
   | `store/index.ts`                               | 7 個の個別セレクタ追加（P31 対策）                                                                                        |
   | `hooks/useSkillLLMGeneration.ts`（オプション） | plan/execute ロジックを Hook として抽出                                                                                   |

2. **Zustand 個別セレクタの設計（P31 対策詳細）**

   合成 Hook（`useAgentStore()` 等）の戻り値関数を `useEffect` 依存配列に渡すと無限ループが発生する（P31）。本実装では個別セレクタを使用している:

   ```typescript
   // 正しい使い方（個別セレクタ）
   const isGenerating = useIsSkillGenerating(); // プリミティブ値
   const clearState = useClearGenerationState(); // Zustand 安定参照

   // 禁止（合成 Hook の戻り値関数）
   const { clearGenerationState } = useAgentStore(); // 毎回新しい参照の可能性
   ```

3. **isGenerating ガード（R-1 対応）**

   `handlePlanSkill` 冒頭に二重呼出防止ガードを実装している:

   ```typescript
   const handlePlanSkill = async (description: string) => {
     if (isGenerating) return; // 二重呼出防止（Phase 3 R-1）
     setIsGenerating(true);
     // ...
   };
   ```

4. **clearGenerationState の設計**

   5 フィールドを一括リセットする `clearGenerationState` アクションを実装している。成功後・キャンセル時の両方でこのアクションを呼び出す:

   ```typescript
   clearGenerationState: () => {
     set({
       isGenerating: false,
       generationProgress: null,
       generationError: null,
       currentPlanId: null,
       currentPlanResult: null,
     });
   },
   ```

### 1-C: component-documentation.md

**作成先**: `docs/30-workflows/w4b-2-sc-ui-runtime-connection/component-documentation.md`

記述内容:

- `SkillLifecyclePanel`: 変更した Props/State の説明
- Plan 結果表示セクション: 表示条件（`currentPlanResult && type === "integrated_api"`）
- TerminalHandoff 表示: 表示条件（`handoffGuidance !== null`）
- 「実行する」ボタン: disabled 条件（`isGenerating === true`）
- `useSkillLLMGeneration`（Hook 抽出した場合）: インターフェース説明

---

## Task 2: システム仕様書更新

**重要**: 以下の全 Step を実行してから `documentation-changelog.md` に記録する（P4/P51 対策）。

### Step 1-A: タスク完了記録

以下の 5 ファイルを**全て**更新する（P1/P25/P29 対策）:

#### 対象ファイル

| ファイル                                                                                    | 更新内容                                                       |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-skill-creator.md` または該当仕様書 | TASK-SC-06-UI-RUNTIME-CONNECTION の完了記録を追加              |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                                            | タスク完了エントリを追加（**P1/P25 対策: 必須**）              |
| `.claude/skills/task-specification-creator/LOGS.md`                                         | タスク完了エントリを追加（**P1/P25 対策: 2ファイル目、必須**） |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                                           | 変更履歴テーブルに追加（**P29 対策**）                         |
| `.claude/skills/task-specification-creator/SKILL.md`                                        | 変更履歴テーブルに追加（**P29 対策**）                         |

#### LOGS.md エントリ形式（両ファイル共通）

```markdown
## TASK-SC-06-UI-RUNTIME-CONNECTION（完了: 2026-03-24）

- 概要: SkillLifecyclePanel から RuntimeSkillCreatorFacade の plan→execute フロー接続
- 変更ファイル:
  - SkillLifecyclePanel.tsx（handlePrepare 拡張、handlePlanSkill/handleExecutePlan 追加）
  - agentSlice.ts（isGenerating 等 5 フィールド + 6 アクション追加）
  - store/index.ts（個別セレクタ 7 個追加）
- 受入基準: AC-1, AC-3, AC-4, AC-7 全達成
```

#### SKILL.md 変更履歴エントリ形式（両ファイル共通）

```markdown
| 2026-03-24 | TASK-SC-06-UI-RUNTIME-CONNECTION | SkillLifecyclePanel → RuntimeSkillCreatorFacade 接続、Zustand 状態追加 |
```

#### Step 1-B: 実装状況テーブル更新

```bash
# SkillCreator 関連の IPC 実装状況テーブルを検索
grep -rn "SKILL_CREATOR_PLAN\|skill-creator:plan" .claude/skills/aiworkflow-requirements/references/
```

発見したテーブルに `TASK-SC-06-UI-RUNTIME-CONNECTION` の完了ステータスを追記する。

#### Step 1-C: 関連タスクテーブルの更新

```bash
# 関連仕様書の検索
grep -rn "TASK-SC-06" .claude/skills/aiworkflow-requirements/references/
```

発見した仕様書の「関連タスク」または「未タスク」テーブルを更新する。

### Step 1-D: topic-map.md 再生成（P2/P27 対策）

**必須**: 仕様書の追加・更新があった場合は必ず再生成する。セクションの削除・変更も再生成トリガーに含める（P27 対策）。

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260324-174257-wt-1
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

期待される出力:

```
インデックス生成中...
ファイルを分類:
...
1. トピックマップ生成...
   indexes/topic-map.md
2. キーワード索引生成...
   indexes/keywords.json

インデックス生成完了
```

再生成後に以下で差分を確認:

```bash
git diff --stat -- .claude/skills/
```

`.claude/skills/aiworkflow-requirements/indexes/` 配下のファイルに変更があることを確認する。

---

## Task 3: documentation-changelog.md

**重要**: 全 Step の実行が完了してから記録する。実行前に「完了」と記載しない（P4 対策）。

**更新先**: `docs/30-workflows/w4b-2-sc-ui-runtime-connection/documentation-changelog.md`

記録内容:

```markdown
# Documentation Changelog: TASK-SC-06-UI-RUNTIME-CONNECTION

更新日: 2026-03-24

## Task 1: 実装ガイド

- [x] implementation-guide.md Part 1 作成（日常の例え: 料理店での注文）
- [x] implementation-guide.md Part 2 作成（開発者向け詳細）
- [x] component-documentation.md 作成

## Task 2: システム仕様書更新

### Step 1-A

- [x] ui-ux-skill-creator.md（または該当仕様書）にタスク完了記録追加
- [x] aiworkflow-requirements/LOGS.md 更新（1ファイル目）
- [x] task-specification-creator/LOGS.md 更新（2ファイル目、P1/P25 対策）
- [x] aiworkflow-requirements/SKILL.md 変更履歴更新（P29 対策）
- [x] task-specification-creator/SKILL.md 変更履歴更新（P29 対策）

### Step 1-B

- [x] 実装状況テーブル更新（または該当テーブルなしのため省略）

### Step 1-C

- [x] 関連タスクテーブル更新（または該当なしのため省略）

### Step 1-D

- [x] topic-map.md 再生成完了（P2/P27 対策）
  - 実行コマンド: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
  - 変更確認: `git diff --stat -- .claude/skills/` で indexes/ 配下に変更あり

## Task 3: このファイル（全 Step 完了後に記録）

- [x] 全 Step 完了を確認してから本ファイルに記録

## Task 4: 未タスク検出

- 検出件数: X 件（以下参照）
```

---

## Task 4: 未タスク検出

### Phase 3 で特定された未タスク候補

| ID  | 内容                                                | 出典                 |
| --- | --------------------------------------------------- | -------------------- |
| R-2 | SkillCreateWizard への planSkill 接続               | Phase 3 設計レビュー |
| R-3 | onProgress コールバックによるリアルタイムプログレス | Phase 3 設計レビュー |

### 未タスク管理の 3 ステップ（P3 対策: 省略不可）

**Step 1: unassigned-task/ に指示書作成**

以下の 2 つの指示書ファイルを作成する:

**ファイル 1**: `docs/30-workflows/unassigned-task/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION.md`

```markdown
# TASK-SC-07: SkillCreateWizard への LLM 生成フロー接続

## 概要

SkillCreateWizard の4段階フローに planSkill/executePlan を接続する。
Phase 2 設計でスコープ外とした未タスク（R-2）。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION で SkillLifecyclePanel への接続を完了した。
SkillCreateWizard（GenerateStep）への接続は独立した別タスクで対応する。

## 変更対象ファイル

- apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
- apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx

## 受入基準

- DescribeStep で「LLM で生成」を選択した場合、planSkill が呼ばれる
- GenerateStep で plan 結果が表示される
- 既存の「テンプレートから作成」フローは非破壊

## 参照

- Phase 3 設計レビュー（R-2）
- TASK-SC-06-UI-RUNTIME-CONNECTION 実装ガイド
```

**ファイル 2**: `docs/30-workflows/unassigned-task/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE.md`

```markdown
# TASK-SC-08: onProgress コールバックによるリアルタイムプログレス更新

## 概要

SkillCreatorAPI.onProgress(callback) を接続し、executePlan 実行中に
リアルタイムプログレスメッセージを表示する。
Phase 3 設計レビューで特定した未タスク（R-3）。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION では `generationProgress` に静的テキスト
（「計画を生成中...」「スキルを生成中...」）を設定している。
onProgress コールバックを接続することで AI の進捗状況をリアルタイム表示できる。

## 変更対象ファイル

- apps/desktop/src/renderer/hooks/useSkillLLMGeneration.ts（または SkillLifecyclePanel.tsx）
- preload/skill-creator-api.ts（onProgress の型確認）

## 受入基準

- executePlan 実行中に onProgress コールバックが呼ばれる
- `generationProgress` がリアルタイム更新される
- UI のプログレステキストが動的に変化する

## 参照

- Phase 3 設計レビュー（R-3）
- TASK-SC-06-UI-RUNTIME-CONNECTION 実装ガイド
```

**Step 2: task-workflow.md 残課題テーブルに登録**

`.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに以下を追加する:

```markdown
| TASK-SC-07 | SkillCreateWizard への LLM 生成フロー接続 | 未着手 | R-2 由来（TASK-SC-06 Phase 3） |
| TASK-SC-08 | onProgress コールバックリアルタイムプログレス | 未着手 | R-3 由来（TASK-SC-06 Phase 3） |
```

**Step 3: 関連仕様書に参照リンク追加**

```bash
# 関連仕様書を検索
grep -rn "SkillCreateWizard\|onProgress" .claude/skills/aiworkflow-requirements/references/ | grep -v ".json"
```

発見した仕様書（`ui-ux-skill-creator.md` 等）の該当セクションに以下を追記する:

```markdown
### 未タスク（後続対応）

- [TASK-SC-07](../../../../docs/30-workflows/unassigned-task/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION.md): SkillCreateWizard への LLM 生成フロー接続
- [TASK-SC-08](../../../../docs/30-workflows/unassigned-task/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE.md): onProgress コールバックによるリアルタイムプログレス更新
```

### 再評価クローズ対応（P56 対策）

TASK-SC-07 / TASK-SC-08 は新規未タスクのため GitHub Issue が存在しない。Issue 作成は `auto-create-issue.sh` フックで自動化されるため、手動での Issue 作成は不要。

ただし、Phase 10 最終レビューで MINOR 指摘事項が未タスク化され、対応する GitHub Issue が既に存在する場合は以下を実行する:

```bash
# 再評価クローズした未タスクの GitHub Issue を Close
gh issue close <issue_number> --comment "再評価クローズ: MINOR 指摘として未タスク仕様書に変換済み (TASK-SC-06 Phase 12)"
```

### unassigned-task-detection.md の更新

```bash
grep -rn "unassigned-task-detection" docs/30-workflows/
```

発見した場合、検出件数と TASK-SC-07/TASK-SC-08 のステータスを更新する。

---

## Task 5: スキルフィードバックレポート

**重要**: 改善点なしでも出力必須（SKILL.md Phase 12 仕様準拠）。

**作成先**: `docs/30-workflows/w4b-2-sc-ui-runtime-connection/outputs/phase-12/skill-feedback-report.md`

### 評価観点

| 観点             | 記録内容                               |
| ---------------- | -------------------------------------- |
| テンプレート改善 | Phase テンプレートの漏れや曖昧さの指摘 |
| ワークフロー改善 | 機械検証や手順分岐の改善余地           |
| ドキュメント改善 | 再利用しやすい横断ガイドライン化の候補 |

### 検討すべき改善点

- skill-creator スキルの plan→execute フロー設計パターンの再利用可能性
- SkillLifecyclePanel の Hook 抽出パターン（useSkillLLMGeneration）のスキル横断テンプレート化
- Phase 2 設計の「IPC レスポンス wrapper 形式（P60 対策）」のチェックリスト追加
- Phase 4 テストの「モック状態型 + リセットパターン」のテストテンプレート化

## 参照資料

- `.claude/rules/05-task-execution.md`（Phase 12 必須チェックリスト）
- `.claude/rules/06-known-pitfalls.md`（P1, P2, P3, P4, P25, P27, P29, P43, P51, P56, P59）
- Phase 11 手動テスト結果
- Phase 3 設計レビュー（R-2, R-3 の出典）

## 実行手順

### ステップ1: Task 1 実行（実装ガイド作成）

implementation-guide.md（Part 1 + Part 2）と component-documentation.md を作成する。

### ステップ2: Task 2 実行（システム仕様書更新）

Step 1-A（タスク完了記録 5 ファイル）→ Step 1-B（実装状況テーブル）→ Step 1-C（関連タスクテーブル）→ Step 1-D（topic-map.md 再生成）を順次実行する。

### ステップ3: Task 4 実行（未タスク検出）

R-2（TASK-SC-07）、R-3（TASK-SC-08）の指示書作成 → task-workflow.md 登録 → 関連仕様書リンク追加の3ステップを実行する。

### ステップ4: Task 5 実行（スキルフィードバックレポート）

テンプレート改善・ワークフロー改善・ドキュメント改善の3観点でレポートを作成する。

### ステップ5: Task 3 実行（documentation-changelog.md）

全 Step 完了を確認してから documentation-changelog.md に結果を記録する（P4/P51 対策）。

### ステップ6: 成果物検証

`git diff --stat -- .claude/skills/` で実際の変更ファイル数を検証する（P43 対策）。

## 統合テスト連携

Phase 12（ドキュメント）では統合テストの直接実施はない。以下の間接的な検証を行う:

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` の正常完了確認
- 未タスク指示書のパスが実在することを `ls` で確認
- documentation-changelog.md の件数と unassigned-task-detection.md の件数が一致することを確認（P59 対策）

## 多角的チェック観点

| 観点               | 確認内容                                                                | 確認方法                                |
| ------------------ | ----------------------------------------------------------------------- | --------------------------------------- |
| ドキュメント完全性 | Task 1〜5 の全成果物が作成されている                                    | `ls` による存在確認                     |
| 仕様書整合性       | LOGS.md 2ファイル + SKILL.md 2ファイルが更新されている                  | `git diff --stat`                       |
| 未タスク管理       | 3ステップ（指示書 + 残課題テーブル + 参照リンク）が全完了               | P3 チェックリスト                       |
| インデックス最新化 | topic-map.md が再生成されている                                         | `git diff -- .claude/skills/*/indexes/` |
| changelog 整合性   | documentation-changelog の件数と unassigned-task-detection の件数が一致 | P59 対策                                |

## サブタスク管理

| サブタスク                      | 担当                                      | ステータス | 備考                            |
| ------------------------------- | ----------------------------------------- | ---------- | ------------------------------- |
| Task 1: 実装ガイド作成          | メインエージェント                        | 未着手     | Part 1 + Part 2 + component-doc |
| Task 2: システム仕様書更新      | サブエージェント可（3ファイル以下/agent） | 未着手     | P43 対策                        |
| Task 3: documentation-changelog | メインエージェント                        | 未着手     | 全 Step 完了後に記録（P4 対策） |
| Task 4: 未タスク検出            | メインエージェント                        | 未着手     | P3 3ステップ必須                |
| Task 5: スキルフィードバック    | メインエージェント                        | 未着手     | 改善点なしでも出力必須          |

## 成果物

| 成果物                     | パス                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| 実装ガイド Part 1 + Part 2 | `docs/30-workflows/w4b-2-sc-ui-runtime-connection/implementation-guide.md`                   |
| コンポーネントドキュメント | `docs/30-workflows/w4b-2-sc-ui-runtime-connection/component-documentation.md`                |
| 未タスク指示書 (R-2)       | `docs/30-workflows/unassigned-task/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION.md`         |
| 未タスク指示書 (R-3)       | `docs/30-workflows/unassigned-task/TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE.md`                |
| スキルフィードバック       | `docs/30-workflows/w4b-2-sc-ui-runtime-connection/outputs/phase-12/skill-feedback-report.md` |
| ドキュメント変更ログ       | `docs/30-workflows/w4b-2-sc-ui-runtime-connection/documentation-changelog.md`                |

## 完了条件

### Task 1

- [ ] implementation-guide.md Part 1 を作成した（日常的比喩: 料理店での注文）
- [ ] implementation-guide.md Part 2 を作成した（開発者向け詳細）
- [ ] component-documentation.md を作成した

### Task 2（全 Step 完了前に「完了」と記載しない: P4 対策）

- [ ] Step 1-A: ui-ux-skill-creator.md（または該当仕様書）を更新した
- [ ] Step 1-A: aiworkflow-requirements/LOGS.md を更新した（P1/P25 対策: 1ファイル目）
- [ ] Step 1-A: task-specification-creator/LOGS.md を更新した（P1/P25 対策: 2ファイル目）
- [ ] Step 1-A: aiworkflow-requirements/SKILL.md の変更履歴を更新した（P29 対策）
- [ ] Step 1-A: task-specification-creator/SKILL.md の変更履歴を更新した（P29 対策）
- [ ] Step 1-B: 実装状況テーブルを更新した（または該当なし確認済み）
- [ ] Step 1-C: 関連タスクテーブルを更新した（または該当なし確認済み）
- [ ] Step 1-D: `node generate-index.js` を実行して topic-map.md を再生成した（P2/P27 対策）
- [ ] Step 1-D: `git diff --stat -- .claude/skills/` で indexes/ 配下の変更を確認した

### Task 3

- [ ] documentation-changelog.md を全 Step 完了後に記録した（P4 対策）

### Task 4（P3 対策: 3 ステップ全完了）

- [ ] TASK-SC-07 指示書を `docs/30-workflows/unassigned-task/` に作成した
- [ ] TASK-SC-08 指示書を `docs/30-workflows/unassigned-task/` に作成した
- [ ] task-workflow.md 残課題テーブルに TASK-SC-07/SC-08 を登録した
- [ ] 関連仕様書に TASK-SC-07/SC-08 の参照リンクを追加した
- [ ] 再評価クローズした未タスクの GitHub Issue を Close した（P56 対策）

### Task 5

- [ ] skill-feedback-report.md を作成した（改善点なしでも出力必須）
- [ ] テンプレート改善・ワークフロー改善・ドキュメント改善の3観点を記録した

## タスク100%実行確認【必須】

- [x] 上記の完了条件を全てチェックした
- [x] 実行手順の全ステップ（ステップ1〜6）を実行した
- [x] 多角的チェック観点の全項目を確認した
- [x] サブタスク管理テーブルのステータスを全て更新した
- [x] 統合テスト連携の全項目を確認した

## 次のPhase

Phase 13: PR 作成
