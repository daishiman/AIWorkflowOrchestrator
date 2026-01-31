# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 12                             |
| Phase名   | ドキュメント更新               |
| カテゴリ  | 文書化                         |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 11                       |
| 後続Phase | Phase 13                       |

## 目的

TASK-7D の実装完了に伴い、実装ガイド（2パート構成）、システム仕様書更新、ドキュメント更新履歴、未タスク検出レポートを作成する。

## 実行タスク（4タスク - 全て完了必須）

### タスク1: 実装ガイド作成（2パート構成）

**目的**: ChatPanel 統合の実装内容を 2 パート構成で文書化する。

**手順**:

#### Part 1: 初学者・中学生レベルの概念説明

1. 以下の構成で概念説明を記述する:

   **日常生活での例え話**:
   - ChatPanel = 「教室のホワイトボード」に例える
   - SkillSelector = 「筆箱から道具を選ぶ」に例える
   - SkillStreamingView = 「先生が黒板に書いている途中を見ている」に例える
   - PermissionDialog = 「先生に許可をもらう」に例える
   - ToolExecutionHistory = 「ノートに書いた作業メモ」に例える

   **なぜ必要か**:
   - なぜスキルを選べるようにするのか（道具が増えると便利になる）
   - なぜ途中経過を見せるのか（何をしているか分かると安心できる）
   - なぜ許可を求めるのか（安全のため、勝手に行動しない）
   - なぜ停止ボタンがあるのか（いつでもやめられる安心感）

   **専門用語の説明**:
   - ストリーミング = 「データが少しずつ流れてくること。動画を見るときに少しずつ再生されるのと同じ」
   - コンポーネント = 「画面の部品。レゴブロックのように組み合わせて画面を作る」
   - 状態管理（Store） = 「みんなが見られる掲示板。情報を書き込むと、見ている全員に伝わる」

2. 出力先: `outputs/phase-12/implementation-guide-part1.md`

#### Part 2: 技術者レベルの詳細説明

1. 以下の構成で技術的詳細を記述する:

   **インターフェース/型定義**:

   ```typescript
   // SkillStreamingView Props
   interface SkillStreamingViewProps {
     skillName: string;
     messages: SkillStreamMessage[];
     status: SkillExecutionStatus | null;
   }

   // SkillStreamMessage（discriminated union）
   type SkillStreamMessage =
     | {
         type: "assistant";
         content: { text: string; isPartial: boolean };
         timestamp: number;
       }
     | { type: "tool_use"; content: { toolName: string }; timestamp: number }
     | {
         type: "tool_result";
         content: { success: boolean; error?: string };
         timestamp: number;
       }
     | { type: "error"; content: { message: string }; timestamp: number };

   // SkillExecutionStatus
   type SkillExecutionStatus =
     | "idle"
     | "running"
     | "permission_pending"
     | "completed"
     | "cancelled"
     | "error";
   ```

   **コンポーネント構成**:
   - ChatPanel: 統合コンテナ。Store から状態取得、ローカル state で importDialogSkill 管理
   - SkillStreamingView: ストリーミング表示。Props 経由でデータ受け取り
   - StatusBadge: ステータスバッジ。status に応じた色・ラベル表示
   - StreamMessageItem: メッセージアイテム。type に応じた表示分岐
   - ToolExecutionHistory: ツール履歴。details/summary で折りたたみ

   **データフロー**:

   ```
   useAppStore() → {selectedSkillName, streamingMessages, isExecuting, skillExecutionStatus}
        ↓
   ChatPanel
        ├── SkillSelector ←→ onImportRequest → setImportDialogSkill
        ├── SkillStreamingView ← {skillName, messages, status}
        │   ├── StatusBadge ← {status}
        │   ├── StreamMessageItem[] ← {message}
        │   └── ToolExecutionHistory ← {messages}
        ├── SkillImportDialog ← {skill, isOpen, onClose}
        └── PermissionDialog ← Store-direct
   ```

   **エラーハンドリング**:
   - fetchSkills 失敗時: skillError に設定、UI には影響なし（スキル一覧が空のまま）
   - StreamMessageItem で unknown type: default case で null を返す
   - ToolExecutionHistory でツールメッセージ 0 件: null を返し非表示

   **設定可能なパラメータ/定数**:
   - StatusBadge の色・ラベルマッピング（config オブジェクト）
   - ToolExecutionHistory のツール数計算（toolMessages.length / 2）

2. 出力先: `outputs/phase-12/implementation-guide-part2.md`

**期待される成果物**:

- `outputs/phase-12/implementation-guide-part1.md`
- `outputs/phase-12/implementation-guide-part2.md`

### タスク2: システム仕様書更新（2ステップ）

**目的**: タスク完了記録とシステム仕様書の更新を行う。

**手順**:

#### Step 1: タスク完了記録（必須）

1-A: 「完了タスク」セクションに TASK-7D を追加する

- 対象ファイル: タスク管理に使用しているドキュメント
- 記録内容: タスクID、完了日、成果物一覧

1-B: 実装状況テーブルを更新する

- `arch-state-management.md` の skillSlice セクション: TASK-7D 完了を反映
- `ui-ux-feature-skill-stream.md`: SkillStreamingView の実装完了を反映
- `interfaces-agent-sdk-skill.md`: ChatPanel 統合の実装完了を反映

1-C: 関連タスクテーブルのステータスを更新する

- `arch-state-management.md` の関連タスクテーブルで TASK-7D のステータスを「完了」に更新

#### Step 2: システム仕様更新（条件付き）

以下の条件に該当する場合のみ実施:

| 条件                     | 該当 | 更新対象                |
| ------------------------ | ---- | ----------------------- |
| 新規インターフェース追加 | Yes  | SkillStreamingViewProps |
| 新規コンポーネント追加   | Yes  | SkillStreamingView      |
| 既存インターフェース変更 | No   | -                       |
| 新規定数/設定値追加      | Yes  | StatusBadge config      |
| API仕様変更              | No   | -                       |

更新対象ファイル:

- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`: SkillStreamingView の実装詳細を追加
- `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`: ChatPanel 統合パターンを追加（該当する場合）

LOGS.md 更新:

- `.claude/skills/aiworkflow-requirements/LOGS.md` を更新
- `.claude/skills/task-specification-creator/LOGS.md` を更新

**期待される成果物**:

- 更新されたシステム仕様ファイル群

### タスク3: ドキュメント更新履歴作成

**目的**: TASK-7D で行った全ドキュメント変更の履歴を作成する。

**手順**:

1. 以下のコマンドでドキュメント変更履歴を生成する:

```bash
node scripts/generate-documentation-changelog.js --task TASK-7D --workflow docs/30-workflows/skill-import-agent-system
```

2. フォールバック（スクリプトが存在しない場合）: 手動で以下の形式で作成する:

```markdown
# TASK-7D ドキュメント更新履歴

## 更新日: {{DATE}}

### 新規作成ファイル

- outputs/phase-12/implementation-guide-part1.md
- outputs/phase-12/implementation-guide-part2.md

### 更新ファイル

- .claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md
- .claude/skills/aiworkflow-requirements/references/arch-state-management.md
- .claude/skills/aiworkflow-requirements/LOGS.md
- .claude/skills/task-specification-creator/LOGS.md
```

3. artifacts.json を更新する:

```bash
node scripts/complete-phase.js --workflow docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 12 --artifacts "outputs/phase-12/implementation-guide-part1.md:Part 1 初学者向け概念説明" "outputs/phase-12/implementation-guide-part2.md:Part 2 技術者向け詳細説明" "outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴"
```

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

### タスク4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: TASK-7D 実装に伴い、スコープ外の残課題・改善点を検出する。

**手順**:

1. 以下のソースから未タスク候補を検出する:

| ソース                    | 確認項目                                                            |
| ------------------------- | ------------------------------------------------------------------- |
| タスク定義書              | 「スコープ外」として明示された項目（ChatPanel自体の新規デザイン等） |
| Phase 3 設計レビュー結果  | MINOR 判定の指摘事項                                                |
| Phase 10 最終レビュー結果 | MINOR 判定の指摘事項                                                |
| Phase 11 手動テスト結果   | スコープ外の発見事項・改善提案                                      |
| コードコメント            | TODO/FIXME/HACK/XXX                                                 |

2. 未タスク検出スクリプトを実行する:

```bash
node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx --scan apps/desktop/src/renderer/components/chat/ChatPanel.tsx --output .tmp/unassigned-candidates.json
```

3. 検出結果をレポートとして出力する:
   - 0 件の場合も「検出結果: 0 件」として出力する（出力必須）
   - 検出された場合は、各項目に対して未タスク仕様書を生成する

**期待される成果物**:

- 未タスク検出レポート（`outputs/phase-12/unassigned-task-detection.md`）

## 参照資料

| 参照資料                  | パス                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-report.md`                                              |
| Phase 3 設計レビュー結果  | `outputs/phase-3/design-review-report.md`                                             |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-gate-decision.md`                                             |
| タスク定義書              | `docs/30-workflows/skill-import-agent-system/tasks/task-7d-chat-panel-integration.md` |
| 仕様更新ワークフロー      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`        |
| Phase 11/12 ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`           |
| 未タスクガイドライン      | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`  |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点             | 確認項目                                                         |
| ---------------- | ---------------------------------------------------------------- |
| ドキュメント充足 | SkillStreamingView の Props/使い方が Part 2 で文書化されているか |
| 仕様との整合     | 実装が ui-ux-feature-skill-stream.md の仕様と一致しているか      |
| 実装状況テーブル | arch-state-management.md の関連タスクテーブルが更新されているか  |

## 成果物

| 成果物               | パス                                             | 種別     |
| -------------------- | ------------------------------------------------ | -------- |
| 実装ガイド Part 1    | `outputs/phase-12/implementation-guide-part1.md` | document |
| 実装ガイド Part 2    | `outputs/phase-12/implementation-guide-part2.md` | document |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`    | document |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`  | document |

## 完了条件

- [ ] Part 1（初学者・中学生レベル）が作成されている
  - [ ] 日常生活での例え話が含まれている
  - [ ] 専門用語は使われていない（使用時は即座に説明）
  - [ ] 「なぜ必要か」が「何をするか」の前に説明されている
- [ ] Part 2（技術者レベル）が作成されている
  - [ ] インターフェース/型定義が含まれている
  - [ ] データフロー図が含まれている
  - [ ] エラーハンドリングが説明されている
- [ ] システム仕様書が更新されている（Step 1 必須、Step 2 条件付き）
  - [ ] Step 1-A: 完了タスクセクションに TASK-7D が追加されている
  - [ ] Step 1-B: 実装状況テーブルが更新されている
  - [ ] Step 1-C: 関連タスクテーブルのステータスが更新されている
  - [ ] LOGS.md が更新されている（aiworkflow-requirements + task-specification-creator）
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力必須）
- [ ] artifacts.json が更新されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 実装ガイド作成（Part 1 + Part 2）
3. タスク2: システム仕様書更新（Step 1 + Step 2）
4. タスク3: ドキュメント更新履歴作成
5. タスク4: 未タスク検出レポート作成
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 12
```

## 次のPhase

Phase 13: PR作成 → [phase-13-pr-creation.md](phase-13-pr-creation.md)
