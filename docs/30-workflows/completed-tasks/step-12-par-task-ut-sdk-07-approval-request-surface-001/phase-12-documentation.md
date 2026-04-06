# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 12                                                                    |
| Phase名    | ドキュメント更新                                                      |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 11: 手動テスト                                                  |
| 次Phase    | Phase 13: PR作成                                                      |
| ステータス | completed                                                             |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

Task 1〜6 の必須成果物を全て完成させ、システム仕様の更新・未タスク検出・スキルフィードバック・テンプレート準拠確認までを同一ターンで完遂する。

> **重要**: 6 つの Task は全て必須。「該当なし」の場合もその旨を記録した成果物を作成すること。

## SubAgent分担

| SubAgent | 担当                                                 | 並列可否   |
| -------- | ---------------------------------------------------- | ---------- |
| A        | Task 1: 実装ガイド作成（Part 1 / Part 2）            | B と並列可 |
| B        | Task 2 Step 1-A/1-B/1-C/1-D（完了記録と正本同期）    | A と並列可 |
| C        | Task 2 Step 2 + Task 3（システム仕様更新と更新履歴） | B 完了後   |
| D        | Task 4: 未タスク検出                                 | E と並列可 |
| E        | Task 5: スキルフィードバック                         | D と並列可 |
| F        | Task 6: phase12-task-spec-compliance-check           | A-E 完了後 |

## 実行タスク

- Task 1: 実装ガイド作成（Part 1 / Part 2）
- Task 2: システム仕様更新（Step 1-A/1-B/1-C/1-D/1-E + Step 2）
- Task 3: ドキュメント更新履歴作成
- Task 4: 未タスク検出（0件でも出力必須）
- Task 5: スキルフィードバック（改善点なしでも出力必須）
- Task 6: phase12-task-spec-compliance-check

## Task 1: 実装ガイド作成（2パート構成）

**出力先**: `outputs/phase-12/implementation-guide.md`

### Part 1: 初学者向け概念説明（中学生レベル）

以下のルールに従い記述する:

- 日常生活での例え話を**必ず**含める（`たとえば` を最低 1 回明示）
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」→「何をするか」の順序を維持
- 作成後に `references/phase12-checklist-definition.md` と `validate-phase12-implementation-guide.js` で内容要件を確認する

**記述すべき内容の例**:

- approval:request とは何か（銀行の送金承認に例える等）
- なぜ危険操作の前に確認が必要か
- approve/reject の違いと結果

### Part 2: 技術者向け詳細

以下のセクションを全て含める:

1. **変更概要**: Before（approval surface なし）→ After（onApprovalRequest + UI 追加）
2. **API シグネチャ**:
   - `onApprovalRequest(callback: (request: ApprovalRequest) => void): () => void`
   - `ApprovalRequest` 型定義
3. **IPC フロー**: Main（ApprovalGate）→ approval:request → Preload → Renderer
4. **使用例**: `SkillLifecyclePanel` での使用例コード
5. **エラーハンドリング**: IPC 失敗・TTL expired 時の動作
6. **エッジケース**: 連続受信・cleanup 忘れ・expired 後の操作
7. **Consumer Contract & IPC Compatibility**: IPC 変更に伴う互換性情報

---

## Task 2: システム仕様更新（2ステップ）

### Step 1: 完了記録【全タスク必須】

#### Step 1-A: タスク完了記録（仕様書更新）

以下のファイルの完了セクションを更新する（もしくは完了記録を追加する）:

- `docs/30-workflows/unassigned-task/task-ut-sdk-07-approval-request-surface-001.md`
  - ステータス: `未実施` → `実装完了`
  - 完了日の追記
  - 成果物リンクの追記

#### Step 1-B: 実装状況テーブル更新

関連する仕様書の実装状況テーブルで当タスクを「未実装」→「完了」に更新:

```bash
grep -rn "UT-SDK-07-APPROVAL-REQUEST-SURFACE-001\|approval-request-surface" \
  .claude/skills/aiworkflow-requirements/references/
```

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "approval:request\|approval request surface\|APPROVAL_REQUEST" \
  .claude/skills/aiworkflow-requirements/references/ | grep -v ".test."
```

ヒットしたファイルの関連タスクステータスを更新する。

#### Step 1-D: topic-map.md 再生成（Phase 12 完了前に必須）

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

- 再生成後の `indexes/topic-map.md` に新規セクション行番号が反映されていることを確認する
- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の 4 点同期を崩さない

#### Step 1-E: LOGS.md 更新（4ファイル同時更新・必須）

canonical は `.claude/skills/...`。更新後は mirror の `.agents/skills/...` を同波で同期する。

以下の 4 ファイルに変更履歴エントリを追加する:

| ファイル                                             | 更新内容         |
| ---------------------------------------------------- | ---------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | 完了タスク記録   |
| `.claude/skills/task-specification-creator/LOGS.md`  | 完了タスク記録   |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 変更履歴テーブル |
| `.claude/skills/task-specification-creator/SKILL.md` | 変更履歴テーブル |

### Step 2: システム仕様更新【条件付き】

以下の変更があるため、システム仕様の更新が必要:

- 新規インターフェース `onApprovalRequest` の追加
- `SkillCreatorAPI` interface の変更

更新前に `ipc-contract-checklist.md` を確認し、Main / Preload / 型定義 / Renderer の 4 層整合性を崩さないこと。

更新対象（変更がある場合のみ）:

| ファイル                                                                                    | 更新内容                            |
| ------------------------------------------------------------------------------------------- | ----------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | `onApprovalRequest` API 定義の追記  |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | approval:request チャネル情報の更新 |

---

## Task 3: ドキュメント更新履歴

**出力先**: `outputs/phase-12/documentation-changelog.md`

記録すべき内容:

- 変更ファイル一覧（コード・ドキュメント）
- `artifacts.json` と `outputs/artifacts.json` の同期確認（4点同期）
- 各 Step の結果（「該当なし」も記録）

---

## Task 4: 未タスク検出（0件でも出力必須）

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

以下のソースを確認する:

| ソース                              | 確認コマンド                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------- |
| Phase 3/10 の MINOR 指摘事項        | `outputs/phase-3/design-review-result.md` / `outputs/phase-10/final-review-result.md` |
| Phase 11 手動テストのスコープ外発見 | `outputs/phase-11/manual-test-result.md`                                              |
| コードコメント（TODO/FIXME/HACK）   | `grep -rn "TODO\|FIXME\|HACK" apps/desktop/src/` （変更ファイルのみ）                 |
| スコープ外として明示された項目      | `docs/30-workflows/unassigned-task/task-ut-sdk-07-approval-request-surface-001.md`    |

未タスクが検出された場合は `docs/30-workflows/unassigned-task/` にタスク仕様書を作成する。

---

## Task 5: スキルフィードバック（改善点なしでも出力必須）

**出力先**: `outputs/phase-12/skill-feedback-report.md`

以下の観点で改善点を記録する:

| 観点             | 記録内容                         |
| ---------------- | -------------------------------- |
| テンプレート改善 | Phase テンプレートの漏れや曖昧さ |
| ワークフロー改善 | 機械検証や手順分岐の改善余地     |
| ドキュメント改善 | 再利用しやすい横断ガイドの候補   |

---

## Task 6: phase12-task-spec-compliance-check（必須）

**出力先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

以下を確認する:

- `task-specification-creator` の Phase 12 必須タスクが 6 件すべて定義されている
- `index.md` に SubAgent 分担、30思考法、正しい親パス、成果物一覧が反映されている
- `.claude` を正本として参照しており、`.agents` への依存が残っていない
- `phase-12-documentation.md` に `ipc-contract-checklist.md` と `api-ipc-agent.md` の参照がある
- `outputs/phase-12/` の成果物ファイル名がテンプレートと一致している
- Phase 13 が blocked / local-check / change-summary の記録を前提にしている

`phase12-task-spec-compliance-check.md` には PASS / FAIL と不足項目を明記する。

---

## 参照資料

| 参照資料              | パス                                                                                   | 用途                   |
| --------------------- | -------------------------------------------------------------------------------------- | ---------------------- |
| Phase 11 成果物       | `outputs/phase-11/manual-test-result.md`                                               | 直前の証跡             |
| Phase 12 ガイド       | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task 1〜6 の要件確認   |
| 仕様更新ワークフロー  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1/2 の実行フロー  |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`          | 4層整合性確認          |
| IPC エージェント仕様  | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`              | 変更対象チャネルの正本 |

## 統合テスト連携

- Phase 12 の compliance check は Phase 13 の blocked / PR 可否判断に引き継ぐ。
- `artifacts.json` / `outputs/artifacts.json` / `topic-map.md` / `keywords.json` の同期結果は Phase 13 の事前確認に引き継ぐ。

## 成果物

| Task   | 成果物                   | パス                                                     |
| ------ | ------------------------ | -------------------------------------------------------- |
| Task 1 | 実装ガイド               | `outputs/phase-12/implementation-guide.md`               |
| Task 2 | システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 3 | ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`            |
| Task 4 | 未タスク検出結果         | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 5 | スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              |
| Task 6 | 準拠確認                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [ ] Task 1: 実装ガイド（Part 1 + Part 2）が作成されている
- [ ] Task 2 Step 1: 4 ファイル（LOGS.md × 2・SKILL.md × 2）が更新されている
- [ ] Task 2 Step 2: 関連システム仕様が更新されている（または「更新不要」が明記）
- [ ] Task 3: ドキュメント更新履歴が作成されている（artifacts.json 同期確認含む）
- [ ] Task 4: 未タスク検出結果が作成されている（0件でも出力）
- [ ] Task 5: スキルフィードバックが作成されている（改善点なしでも出力）
- [ ] Task 6: phase12-task-spec-compliance-check が作成されている
- [ ] 6 つの成果物ファイルが全て `outputs/phase-12/` に存在する
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
