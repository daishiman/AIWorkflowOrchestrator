# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 1                         |
| Phase名    | 要件定義                  |
| 前提Phase  | なし（最初のPhase）       |
| 後続Phase  | Phase 2                   |
| ステータス | 完了                      |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

`SkillLifecyclePanel.tsx` の `onWorkflowStateChanged` コールバックにおける `setWorkflowError(null)` 無条件呼び出しバグの受入条件（AC）を定義し、修正スコープを確定する。

## 背景

`SKILL_CREATOR_WORKFLOW_STATE_CHANGED` IPC イベントが fire-and-forget 方式で連続配信されるようになると、`currentPhase: 'handoff'` スナップショット直後に別スナップショットが届き、エラーメッセージが即座にゼロクリアされる。修正は1行の条件分岐追加のみだが、依存タスク（fire-and-forget化）との関係を正しく把握した上で受入条件を定義する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存コードの精読と命名規則分析

**目的**: 修正対象コードと周辺のコンテキストを把握し、命名規則を記録する。

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` を開き、`onWorkflowStateChanged` コールバック全体を読む
2. `setWorkflowError` の呼び出し箇所を全て洗い出す（特に539行目周辺）
3. `snapshot.currentPhase` の型定義を確認する（`'handoff'` が有効な値か検証）
4. `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` IPC チャンネルのペイロード型を確認する
5. 既存テストファイルのファイル名命名規則（kebab-case / camelCase）を記録する

**期待される成果物**:

- コールバック処理の現状把握メモ（次タスクで使用）
- 命名規則記録（テストファイル名の決定に使用）

---

### タスク2: 受入条件（AC）の定義

**目的**: 修正が満たすべき条件を明確化する。

**実行手順**:

1. 以下のAC-1〜AC-5を定義し、outputs/phase-1/acceptance-criteria.md に記録する

**受入条件（Acceptance Criteria）**:

| ID   | 条件                                                                                                                    | 検証方法           |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------------------ |
| AC-1 | `currentPhase: 'handoff'` のスナップショットが届いた後、`setWorkflowError(null)` が呼ばれない                           | ユニットテスト     |
| AC-2 | `currentPhase: 'handoff'` 以外のスナップショット（例: `'execute'`, `'verify'`）では `setWorkflowError(null)` が呼ばれる | ユニットテスト     |
| AC-3 | `currentPhase: 'handoff'` 後に別スナップショットが届いてもエラーメッセージが消えない                                    | ユニットテスト     |
| AC-4 | 既存の正常系テストが引き続きGREENであること                                                                             | テストスイート実行 |
| AC-5 | TypeScript型エラーなし、ESLintエラーなし                                                                                | 静的解析ツール     |

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

### タスク3: P50チェック（修正規模の確認）

**目的**: 修正が50行以内の小規模変更であることを確認する。

**実行手順**:

1. `SkillLifecyclePanel.tsx:539` 周辺を確認し、変更行数を見積もる
2. 追加するのは `if (snapshot.currentPhase !== 'handoff')` の条件ラップ1行のみであることを確認する
3. テストファイルの追加行数を見積もる（新規ファイル作成）
4. 合計変更行数がP50（50行以内）を満たしていることを確認する

**期待される成果物**:

- P50チェック結果（acceptance-criteria.md に記録）

---

## 参照資料

| 参照資料           | パス                                                                      | 内容                                              |
| ------------------ | ------------------------------------------------------------------------- | ------------------------------------------------- |
| 修正対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | onWorkflowStateChanged コールバック               |
| IPC チャンネル定義 | `packages/shared/src/ipc/channels.ts`                                     | SKILL_CREATOR_WORKFLOW_STATE_CHANGED ペイロード型 |
| 関連タスク仕様     | `docs/30-workflows/unassigned-task/TASK-FIX-LIFECYCLE-PANEL-ERROR-001.md` | 元のunassigned task仕様                           |
| Issue #1844        | https://github.com/daishiman/AIWorkflowOrchestrator/issues/1844           | バグ報告詳細                                      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                  | 内容                  |
| ---------------------- | --------------------------------------------------------------------- | --------------------- |
| UI/UX仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-*.md`        | UI状態管理の設計方針  |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md` | エラー表示の設計方針  |
| IPC仕様                | `.claude/skills/aiworkflow-requirements/references/api-*.md`          | IPC通信の設計パターン |

---

## 成果物

| 成果物                 | パス                                     | 内容                        |
| ---------------------- | ---------------------------------------- | --------------------------- |
| 受入条件チェックリスト | `outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-5、P50チェック結果 |

---

## 統合テスト連携

- `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` IPC イベントペイロード構造（`{ phase: string, ... }`）を要件に明記する
- fire-and-forget 配信による連続スナップショットシナリオを統合テスト要件として記載する

---

## 完了条件

- [ ] `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の `onWorkflowStateChanged` コールバックを精読済み
- [ ] `snapshot.currentPhase` の型と有効値（`'handoff'` 含む）を確認済み
- [ ] AC-1〜AC-5が `outputs/phase-1/acceptance-criteria.md` に記録されている
- [ ] P50チェック完了（変更行数50行以内であることを確認）
- [ ] 既存コードの命名規則（テストファイル名のケース等）を記録済み

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（`outputs/phase-1/acceptance-criteria.md`）が生成されていることを確認

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/phase-2-design.md`
