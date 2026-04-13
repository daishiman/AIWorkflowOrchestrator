# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 12                                                            |
| タスクID   | TASK-SW-FIX-MODE-MGMT-001                                     |
| 機能名     | generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正 |
| 前提Phase  | Phase 11                                                      |
| 後続Phase  | Phase 13                                                      |
| 作成日     | 2026-04-12                                                    |
| ステータス | completed                                                     |

## 目的

task-specification-creator / aiworkflow-requirements の正本に照らして、Phase 12 canonical 6成果物を揃え、Step 1-A〜1-G と Step 2 の結果を記録し、ドキュメントとシステム仕様を最新状態に維持する。

## 実行オーケストレーション

| SubAgent | 主担当                                  | 並列条件                        |
| -------- | --------------------------------------- | ------------------------------- |
| A        | `implementation-guide.md` Part 1 草案   | B と並列可                      |
| B        | `implementation-guide.md` Part 2 草案   | A と並列可                      |
| C        | `system-spec-update-summary.md`         | Part 2 の更新対象確定後に並列可 |
| D        | `documentation-changelog.md`            | C と並列可                      |
| E        | `unassigned-task-detection.md`          | D と並列可                      |
| F        | `skill-feedback-report.md`              | E と並列可                      |
| G        | `phase12-task-spec-compliance-check.md` | 全成果物固定後に実行            |

## 必須6タスク

### Task 12-1: 実装ガイド作成

Part 1（中学生向け）と Part 2（技術者向け）の2部構成で作成する。

#### Part 1: 中学生向け説明

**generationModeラジオボタン廃止・LLM専用化とは何か？**

スキルを作るための「ウィザード（案内役）」を修正した話です。

たとえば、案内板に「AかBかを選んでください」と書いてあっても、実際にはAしか使わないなら、その選択肢はかえって迷いの元になります。

以前は、スキルウィザードを開くと「テンプレートから作る」か「AIに考えてもらう」か、どちらか選ぶボタン（ラジオボタン）が表示されていました。でも本当はAIに考えてもらう方法だけを使うことが決まっていたので、このボタンは不要でした。今回はこのボタンを削除しました。

また、もう1つ問題がありました。「AIに考えてもらう」を選んだとき、本来はQ1〜Q6の6つの質問に答えてもらうページ（Step 1）を通るはずなのに、そのページを飛ばして直接生成ページ（Step 2）に移動してしまっていました。これを修正し、必ずStep 1の質問を通るようにしました。

これで、ウィザードは「スキル情報入力（Step 0）→ 質問（Step 1）→ 生成（Step 2）→ 完了（Step 3）」という正しい順番で動くようになりました。

**例えば：**

- 修正前：ウィザードを開くと「テンプレートで作る / AIで作る」の選択肢が表示されていた
- 修正後：選択肢がなく、すぐにスキル名・目的・カテゴリの入力フォームが表示される
- 修正前：AIモードを選ぶとQ1〜Q6をスキップして生成が始まってしまっていた
- 修正後：必ずQ1〜Q6の質問を経由してから生成が始まる

**専門用語の説明：**

- **ラジオボタン**：複数の選択肢から1つを選ぶUI部品（丸いボタン）
- **ウィザード**：複数の画面を順番に案内してくれる入力フォームのこと
- **state（ステート）**：コンポーネントが持っている「今の状態」の情報
- **LLM専用化**：AIによる生成のみに一本化すること

#### Part 2: 技術者向け説明

**変更概要：**

`SkillCreateWizard.tsx` から `generationMode`（`"template" | "llm"`）state と `hasActivatedLlmMode` state、および関連する全 `template` 条件分岐を除去し、LLM専用化した。`handleLlmGenerate` 内の `goToStep(2)` 直接呼び出しを除去し、`handleStep0Next` が常に `goToStep(1)` を呼ぶよう修正した。`SkillInfoStep.tsx` からラジオボタンUIと関連 props（`generationMode` / `onGenerationModeChange`）を削除した。

**修正後フロー：**

```
Step 0（SkillInfoStep）→ handleStep0Next → goToStep(1)
→ Step 1（ConversationRoundStep）→ handleGenerate → goToStep(2)
→ Step 2（GenerateStep）→ goToStep(3)
→ Step 3（CompleteStep）
```

**API シグネチャ変更：**

```typescript
// SkillInfoStep props（変更前）
interface SkillInfoStepProps {
  generationMode: "template" | "llm";
  onGenerationModeChange: (mode: "template" | "llm") => void;
  onNext: () => void;
}

// SkillInfoStep props（変更後）
interface SkillInfoStepProps {
  onNext: () => void;
  // generationMode関連prop除去済み
}
```

**使用例**:

```typescript
<SkillInfoStep onNext={handleStep0Next} />
```

**設定/定数一覧**:

| 項目                  | 内容                                                      |
| --------------------- | --------------------------------------------------------- |
| `onNext`              | Step 0 から Step 1 へ進むための callback。                |
| `goToStep(1)`         | 正規フローへ進める固定遷移。Step 1 スキップを防ぐ。       |
| `generationMode`      | 削除対象の state。LLM 専用化により不要。                  |
| `hasActivatedLlmMode` | 削除対象の補助 state。`generationMode` と二重管理しない。 |

**エッジケース：**

- `generationMode` 参照箇所の削除漏れ: `pnpm typecheck` で検出可能
- `hasActivatedLlmMode` 参照箇所の削除漏れ: ESLint未使用変数チェックで検出可能
- Step 1スキップ再発: Phase 4/6の自動テストで検出可能

### Task 12-2: システム仕様更新

#### Step 1-A: 完了タスク記録・関連リンク更新

- `docs/30-workflows/WB-par-02a-fix-mode-mgmt/index.md` のステータスを `phase12_completed`（Phase 13 blocked）へ更新
- `task-workflow.md` / `task-workflow-completed.md` / `task-workflow-backlog.md` の current facts を同期
- `.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md` に完了エントリを追加
- `.claude/skills/aiworkflow-requirements/SKILL.md` と `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` / `.claude/skills/aiworkflow-requirements/indexes/keywords.json` を再生成し、Step 0 の LLM 専用化と state 削除の current facts を反映する

#### Step 1-B: 実装状況テーブル更新

- TASK-SW-FIX-MODE-MGMT-001 は implementation タスクのため、実装状況を `completed` として更新する
- `arch-ui-components-core.md` の SkillCreateWizard current facts を LLM 専用フローへ更新
- `arch-state-management-skill-creator.md` の `generationMode` / `hasActivatedLlmMode` 記述を current facts と historical facts に分離

#### Step 1-C: 関連タスクテーブル確認

| タスク                       | 依存関係               | ステータス更新                   |
| ---------------------------- | ---------------------- | -------------------------------- |
| TASK-SW-FIX-STATE-DETAIL-001 | Wave B完了後（Wave C） | `ready` 判定（実着手は別タスク） |
| TASK-SW-FIX-UI-001           | Wave B完了後（Wave C） | `ready` 判定（実着手は別タスク） |

- Wave B 内の sibling task と current facts が衝突していないことを確認し、必要なら `task-workflow*.md` 側の関連タスク表も更新する

#### Step 2: 新規 I/F 追加の仕様更新判定

`SkillInfoStep` の props 契約変更（`generationMode` / `onGenerationModeChange` 除去）は renderer の current facts 同期として扱う。`system-spec-update-summary.md` に props 変更内容と更新対象を記録し、`arch-ui-components-core.md` / `ui-ux-feature-components-skill-analysis.md` / `arch-state-management-skill-creator.md` の current facts を整合させる。

**更新対象候補**

| #   | 更新対象ファイル                                                                               | 変更内容                                                                  | 必須/任意 |
| --- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------- |
| 1   | `.claude/skills/aiworkflow-requirements/references/arch-ui-components-core.md`                 | SkillCreateWizard current facts を LLM 専用へ更新                         | 必須      |
| 2   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-skill-analysis.md` | SkillCreateWizard の併存記述を LLM 専用へ更新                             | 必須      |
| 3   | `.claude/skills/aiworkflow-requirements/references/arch-state-management-skill-creator.md`     | generationMode / hasActivatedLlmMode の state 記述を current facts へ整理 | 必須      |
| 4   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                           | 完了タスク・残課題テーブルの同期                                          | 必須      |
| 5   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                 | 完了タスク記録の追加                                                      | 必須      |
| 6   | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                   | 未処理候補の有無を再整理                                                  | 必須      |

### Task 12-3: 更新履歴作成【Step 1-D 兼務】

`documentation-changelog.md` を生成し、Step 1-D の topic-map 再生成結果も含めて全 Step 結果を記録する。

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/WB-par-02a-fix-mode-mgmt
```

### Task 12-4: 未タスク検出【Step 1-E 兼務】

プロジェクト全体で TASK-SW-FIX-MODE-MGMT-001 に関連する未着手タスクを検出し、0件でも `unassigned-task-detection.md` を出力する。検出があれば `docs/30-workflows/unassigned-task/` へ正式登録し、`task-workflow*.md` と関連仕様へ反映する。

### Task 12-5: スキルフィードバック作成【Step 1-F 兼務】

実装・テスト・設計を通じて発見した改善点を記録する。改善点が0件でも `skill-feedback-report.md` を出力する。`lessons-learned-skill-wizard-redesign.md` に本タスク由来の苦戦箇所・再発条件・再利用手順を同一内容で転記し、`task-specification-creator` と `aiworkflow-requirements` の原文と、適用した思考法を根拠として明示する。

### Task 12-6: phase12-task-spec-compliance-check【Step 1-G 兼務】

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-5 が task-specification-creator と aiworkflow-requirements の両方に対して準拠しているかを最終確認する。`implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` の 6 成果物を突合し、`task-workflow.md` / `task-workflow-completed.md` / `task-workflow-backlog.md` / `docs/30-workflows/WB-par-02a-fix-mode-mgmt/index.md` / `artifacts.json` / `outputs/artifacts.json` の parity も同時に確認したうえで、4 条件（矛盾なし・漏れなし・整合性あり・依存関係整合）を明記する。

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/WB-par-02a-fix-mode-mgmt
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/WB-par-02a-fix-mode-mgmt
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/WB-par-02a-fix-mode-mgmt --phase 12
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
```

## 参照資料

| 資料名           | パス                                                 | 用途              |
| ---------------- | ---------------------------------------------------- | ----------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`             | Phase 11 成果物   |
| 証跡インデックス | `outputs/phase-11/evidence-index.md`                 | Phase 11 成果物   |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`            | Phase 10 成果物   |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`          | Phase 5 成果物    |
| task-spec 正本   | `.claude/skills/task-specification-creator/SKILL.md` | Phase 12 判定基準 |
| system spec 正本 | `.claude/skills/aiworkflow-requirements/SKILL.md`    | 更新対象基準      |

## 実行手順

1. Task 12-1: `implementation-guide.md` を Part 1/Part 2 で作成する。
2. Task 12-2 Step 1-A: 完了タスク記録と関連リンクを更新する。
3. Task 12-2 Step 1-B: TASK-SW-FIX-MODE-MGMT-001 実装状況を `completed` へ更新する。
4. Task 12-2 Step 1-C: Wave C タスクの着手条件を `ready` 判定として記録する。
5. Task 12-2 Step 2: `SkillInfoStep` の props 変更内容を `system-spec-update-summary.md` に記録する。
6. Task 12-3: `documentation-changelog.md` を作成する。
7. Task 12-4: `unassigned-task-detection.md` を作成する。
8. Task 12-5: `skill-feedback-report.md` を作成する。
9. Task 12-6: `phase12-task-spec-compliance-check.md` を作成する。

## 成果物

| 成果物                   | パス                                                     | 説明                         |
| ------------------------ | -------------------------------------------------------- | ---------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1/Part 2 構成           |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C/Step 2 記録 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴         |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも作成）      |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0件でも作成）        |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物の整合確認            |

## Phase 12 実装ガイド要件

- Part 1: 中学生向け説明・日常例・専門用語の即時説明を含む。
- Part 2: TypeScript 型・API シグネチャ変更・エッジケース・設定値一覧を含む。
- 未タスク検出レポートは 0件でも必ず出力する。
- スキルフィードバックは改善点 0件でも必ず出力する。

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] Task 12-1 実装ガイドが Part 1/Part 2 で完成していること
- [ ] Task 12-2 Step 1-A/1-B/1-C が全て実施されていること
- [ ] Task 12-3 更新履歴が作成されていること
- [ ] Task 12-4 未タスク検出レポートが作成されていること（0件でも）
- [ ] Task 12-5 フィードバックレポートが作成されていること（0件でも）
- [ ] Task 12-6 仕様準拠チェックが PASS であること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成
3. Task 12-2: システム仕様更新（Step 1-A/1-B/1-C/Step 2）
4. Task 12-3/12-4/12-5/12-6: changelog・未タスク・フィードバック・準拠チェック出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR 作成
