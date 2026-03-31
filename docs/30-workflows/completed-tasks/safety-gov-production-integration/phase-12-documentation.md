# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 12                                |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

実装ガイド作成・システム仕様書更新・ドキュメント更新履歴作成・未タスク検出・スキルフィードバックの5タスクを完了する。

## 実行タスク（5タスク - 全て必須）

### Task 12-1: 実装ガイド作成（2パート構成）

**出力先**: `outputs/phase-12/implementation-guide.md`

#### Part 1（中学生レベル）

- 「SafetyGatewayとは何か」を日常の例え話で説明（例: 危険な作業をする前に上司に許可を取るように...）
- IPC 通信を「アプリの部屋同士の会話」として説明
- なぜ production 統合が必要か → 「設計図は完成したが、建物に配線されていなかった」

#### Part 2（技術者レベル）

- `ExecutionAPI` インターフェース定義
- IPC 4層整合性テーブル
- ApprovalGate DI パターンのコード例
- Push 通知実装パターン
- revokeAll() の呼び出しタイミング

### Task 12-2: システム仕様書更新（4サブステップ）

#### Step 1-A: タスク完了記録

以下のファイルを更新:

- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` に完了記録を追加
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` の該当未タスクを current facts へ更新
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` に苦戦箇所または no-op 判定を記録
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` / `keywords.json` を再生成
- `.claude/skills/aiworkflow-requirements/LOGS.md` に完了記録を追加
- `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新
- `.claude/skills/task-specification-creator/LOGS.md` に完了記録を追加
- `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新
- `.agents/skills/` mirror を同期し、`diff -qr .claude/skills/ .agents/skills/` の結果を記録する

#### Step 1-B: 実装状況テーブル更新

| ステータス変更    | 対象                            |
| ----------------- | ------------------------------- |
| `未実装` → `完了` | ApprovalGate production 統合    |
| `未実装` → `完了` | execution namespace Preload API |

#### Step 1-C: 関連タスクテーブル更新

元タスク `TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001` の関連タスクテーブルを更新:

- `UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001` のステータスを `completed` に更新
- UT-6〜UT-9 の raw backlog 行は、この workflow pack に集約された current fact へ更新する

#### Step 2: 新規インターフェース追加（条件付き）

`ExecutionAPI` インターフェースは新規追加のため Step 2 更新が必要:

- `.claude/skills/aiworkflow-requirements/references/` の IPC 仕様に `ExecutionAPI` を追加

### Task 12-3: ドキュメント更新履歴作成

**出力先**: `outputs/phase-12/documentation-changelog.md`

| Step     | 内容                                                                         | 結果 |
| -------- | ---------------------------------------------------------------------------- | ---- |
| Step 1-A | completed/backlog/lessons/indexes + LOGS.md x2 + SKILL.md x2 + mirror parity | -    |
| Step 1-B | 実装状況テーブル更新                                                         | -    |
| Step 1-C | 関連タスクテーブル更新                                                       | -    |
| Step 2   | ExecutionAPI 仕様追加                                                        | -    |

### Task 12-4: 未タスク検出レポート（0件でも出力必須）

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

調査対象:

- Phase 5 実装の TODO コメント
- Phase 3/10 の MINOR 指摘
- Phase 11 手動テストの発見事項
- revokeAll() の統合が期待通りか

```bash
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/ipc/ \
  --output .tmp/unassigned-candidates.json
```

### Task 12-5: スキルフィードバックレポート（改善点なしでも出力必須）

**出力先**: `outputs/phase-12/skill-feedback-report.md`

| 観点             | 記録内容                                                 |
| ---------------- | -------------------------------------------------------- |
| テンプレート改善 | IPC 4層整合性チェックがより早い Phase で定型化できるか   |
| ワークフロー改善 | production 統合タスク向けの Phase テンプレート追加を検討 |
| ドキュメント改善 | DI パターンのベストプラクティスガイドとして横断化        |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                 | 内容                  |
| -------------------- | ------------------------------------------------------------------------------------ | --------------------- |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`       | Step 1-A〜Step 2 手順 |
| 未タスクガイドライン | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` | 未タスク検出基準      |

## 成果物（5ファイル - 全て必須）

| 成果物                   | パス                                             | 説明                   |
| ------------------------ | ------------------------------------------------ | ---------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`       | Part 1 + Part 2        |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md` | Step 1-A〜Step 2 結果  |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`    | 全 Step の結果         |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`  | 0件でも出力必須        |
| スキルFBレポート         | `outputs/phase-12/skill-feedback-report.md`      | 改善点なしでも出力必須 |

## 完了条件

- [ ] Task 12-1: 実装ガイドが Part 1（中学生レベル）と Part 2（技術者レベル）を含む
- [ ] Task 12-2: Step 1-A/1-B/1-C/Step 2 の結果が全て記録されている
- [ ] Task 12-3: `documentation-changelog.md` に全 Step の結果が記録されている
- [ ] Task 12-4: `unassigned-task-detection.md` が出力されている（0件でも必須）
- [ ] Task 12-5: `skill-feedback-report.md` が出力されている（改善点なしでも必須）
- [ ] aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md の両方が更新されている
- [ ] **本Phase内の全タスク（5タスク）を100%実行完了**

## 次のPhase

Phase 13: PR作成（ユーザー明示承認後のみ）
