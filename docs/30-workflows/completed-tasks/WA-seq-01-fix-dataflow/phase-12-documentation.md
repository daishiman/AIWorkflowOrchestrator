# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 12                                                          |
| タスクID   | TASK-SW-FIX-DATAFLOW-001                                    |
| 機能名     | Step 1回答→スキル生成連携（Q1〜Q6コンテキストブリッジ実装） |
| タスク種別 | implementation                                              |
| 前提Phase  | Phase 11（手動テスト完了）                                  |
| 後続Phase  | Phase 13                                                    |
| 作成日     | 2026-04-12                                                  |
| ステータス | completed                                                   |

## 目的

6 つの必須タスクを完了し、タスクのドキュメント更新を完結させる。

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

## Task 12-1: 実装ガイド作成（2パート構成）【必須】

### Part 1（初学者・中学生レベル）

**日常生活での例え話**:

> スキル作成ウィザードは「オーダーメイドのシェフへの注文表」のようなものです。
> たとえば、レストランで「辛め・野菜多め・鶏肉で」と頼むとき、
> 注文内容が料理を作る人にきちんと届くかどうかが大切です。
> あなたがレストランで「辛め・野菜多め・鶏肉で」とオーダーするように、
> Q1〜Q6 で「目的・対象・ツール・タイミング・成果物・制約」を細かく伝えます。
> しかしこれまでは、せっかく書いた注文表がシェフ（AI）に届かず、
> 「何か作ってください」という一言だけが伝わっていた状態でした。
> この修正により、注文表が丸ごとシェフに届くようになります。

**なぜ必要か**:

ウィザードの核心価値は「詳細なコンテキスト情報に基づいた高品質スキル生成」にあります。
Q1〜Q6 を収集しながらも生成に使わないのは、注文を聞いて捨てているのと同じです。

**何をするか**:

`buildSkillContext()` という変換関数を通じて、ウィザードの入力データをスキル生成 AI へ渡す経路を開通させます。

### Part 2（開発者・技術者レベル）

**インターフェース定義**:

```typescript
// packages/shared/src/types/skillCreator.ts
export interface SkillCreationContext {
  skillName?: string; // formData.skillName
  category?: string; // formData.category
  purpose?: string; // formData.purpose
  q1Purpose?: string; // Q1 回答
  q2Target?: string; // Q2 回答
  q3Tools?: string; // Q3 回答
  q4Timing?: string; // Q4 回答
  q5Output?: string; // Q5 回答
  q6Constraints?: string; // Q6 回答
}
```

**変換関数シグネチャ**:

```typescript
function buildSkillContext(
  formData: SkillFormData,
  answers: WizardAnswers,
): SkillCreationContext;
```

**使用例**:

```typescript
const context = buildSkillContext(formData, answers);

await createSkill(formData.purpose, SKILL_GENERATION_OPTIONS, context);
```

**設定/定数一覧**:

| 項目                                 | 内容                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `context`                            | `createSkill` へ渡す `SkillCreationContext`。Step 1 の回答を集約する。 |
| `skillName` / `category` / `purpose` | `formData` 由来の基本情報。生成プロンプトの核になる。                  |
| `q1Purpose`〜`q6Constraints`         | Q1〜Q6 の回答。文脈・制約・期待値を補足する。                          |
| `SKILL_GENERATION_OPTIONS`           | 既存の生成オプション。後方互換を壊さずに利用する。                     |

**データフロー**:

```
WizardAnswers + SkillFormData
  → buildSkillContext()
  → SkillCreationContext
  → createSkill Thunk
  → IPC skill:create
  → buildSkillGenerationPrompt()
  → LLM プロンプト
```

**エラーハンドリング / エッジケース**:

| ケース                       | 期待動作                                          |
| ---------------------------- | ------------------------------------------------- |
| Q1〜Q6 が全て空              | context の全フィールドが undefined・エラーなし    |
| `context` なしの既存呼び出し | 後方互換維持・エラーなし（TC-10・TC-17 で確認）   |
| 長大な入力値（1000 文字超）  | 切り捨てなし・そのまま LLM へ渡す（TC-16 で確認） |

成果物: `outputs/phase-12/implementation-guide.md`

## Task 12-2: システム仕様書更新（2ステップ）【必須】

### Step 1-A: タスク完了記録

- `task-workflow.md` に完了タスク記録を追加
- `task-workflow-completed.md` / `task-workflow-completed-recent-2026-04e.md` / `task-workflow-backlog.md` の該当エントリを current facts に同期
- `SKILL.md` 変更履歴 2 ファイル更新:
  - `.claude/skills/aiworkflow-requirements/SKILL.md`
  - `.claude/skills/task-specification-creator/SKILL.md`
- LOGS.md 2 ファイル更新:
  - `.claude/skills/aiworkflow-requirements/LOGS.md`
  - `.claude/skills/task-specification-creator/LOGS.md`
- `topic-map.md` 更新（`SkillCreationContext` / `buildSkillContext` / `buildSkillGenerationPrompt` 新規セクション追加）

### Step 1-B: 実装状況テーブル更新

`TASK-SW-FIX-DATAFLOW-001` のステータスを `completed` として記録する。

### Step 1-C: 関連タスクテーブル更新

- `WA-seq-01-fix-dataflow` 配下の他タスクとの関連を記録する
- `TASK-SW-FIX-DATAFLOW-001` のステータスを current facts へ反映する

### Step 2: システム仕様更新

`SkillCreationContext` は新規インターフェースの追加であるため、以下のシステム仕様ファイルを更新する：

- IPC チャンネル契約仕様（`skill:create` チャンネルの引数型更新）
- 型定義仕様（`SkillCreationContext` の追加記録）

成果物: `outputs/phase-12/system-spec-update-summary.md`

## Task 12-3: ドキュメント更新履歴作成【必須】

全 Step（1-A/1-B/1-C/Step 2）の結果を個別に明記する（「該当なし」も記録）。
`artifacts.json` / `outputs/artifacts.json` の parity と current/baseline の差分も記録する。

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js
```

成果物: `outputs/phase-12/documentation-changelog.md`

## Task 12-4: 未タスク検出レポート作成【必須・0件でも出力必須】

### 検出ソース

| ソース                       | 確認項目                         |
| ---------------------------- | -------------------------------- |
| Phase 3 レビュー MINOR 指摘  | 未タスク化対象                   |
| Phase 10 レビュー MINOR 指摘 | 未タスク化対象                   |
| Phase 11 発見事項            | スコープ外発見事項               |
| コードコメント               | TODO/FIXME（実装ファイル追加分） |

候補として想定される未タスク:

- プロンプトトークン数制限チェック（Phase 9 リスク評価で指摘）
- `buildSkillGenerationPrompt` のラベル文字列定数化
- `buildSkillContext` の utils ファイル分離（再利用性向上）

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan docs/30-workflows/WA-seq-01-fix-dataflow \
  --output .tmp/unassigned-candidates.json
```

成果物: `outputs/phase-12/unassigned-task-detection.md`

## Task 12-5: スキルフィードバックレポート作成【必須・改善点なしでも出力必須】

| 観点             | 記録内容                                                   |
| ---------------- | ---------------------------------------------------------- |
| テンプレート改善 | handleGenerate テストの難易度・Redux mock パターンの統一化 |
| ワークフロー改善 | IPC 経路テストの自動化余地                                 |
| ドキュメント改善 | SkillCreationContext のフィールド増加時のガイドライン追加  |

成果物: `outputs/phase-12/skill-feedback-report.md`

## Task 12-6: phase12-task-spec-compliance-check【必須・最終確認】

Phase 12 の Task 12-1〜12-5 と Step 1-A/1-B/1-C/Step 2 を 1 ファイルへ集約した root evidence。

- `outputs/phase-12/*.md` の成果物存在確認
- Task 12-1〜12-5 の実質監査
- Step 1-A〜1-C の実更新確認
- Step 2 の current fact / no-op / domain sync 確認
- validator 結果、root parity、artifacts 同期、planned wording 0 件の記録
- 未充足が 1 つでもある場合は `PASS` を断言しない

成果物: `outputs/phase-12/phase12-task-spec-compliance-check.md`

## Phase 12 事前チェックリスト【着手前確認】

- [ ] `outputs/artifacts.json` と各 `phase-*.md` の artifact 名が 1 対 1 で照合済み
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` を含む 6 成果物の出力先が揃っている
- [ ] Phase 1 で記録したタスク分類（implementation）が現状と一致している
- [ ] LOGS.md 2 ファイル更新対象が特定されている

## 参照資料

| 資料名                       | パス                                                                                   | 用途                |
| ---------------------------- | -------------------------------------------------------------------------------------- | ------------------- |
| Phase 11 手動テスト結果      | `outputs/phase-11/manual-test-result.md`                                               | 証跡確認            |
| Phase 11 チェックリスト      | `outputs/phase-11/manual-test-checklist.md`                                            | NON_VISUAL 実施記録 |
| Phase 11 発見事項            | `outputs/phase-11/discovered-issues.md`                                                | スコープ外記録      |
| spec-update-workflow         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 手順確認       |
| phase-12-documentation-guide | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task 詳細手順       |

## 成果物

| 成果物                       | パス                                                     | 説明                               |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------- |
| 実装ガイド（Part 1/2）       | `outputs/phase-12/implementation-guide.md`               | 初学者向け + 技術者向けの 2 パート |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C + Step 2 の更新記録  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 全 Step 結果の記録                 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0 件でも出力必須                   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須             |
| 準拠チェック                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 の最終確認         |

## 完了条件

- [ ] Task 12-1〜12-6 が全件完了していること
- [ ] 6 成果物が全件作成されていること
- [ ] LOGS.md 2 ファイルが更新されていること（aiworkflow-requirements + task-specification-creator）
- [ ] `outputs/artifacts.json` が root `artifacts.json` と同期されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR 作成（ユーザーの明示的承認後のみ実施）
