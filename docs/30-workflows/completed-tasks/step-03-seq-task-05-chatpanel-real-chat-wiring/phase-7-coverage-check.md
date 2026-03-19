# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 7                                      |
| Phase名    | カバレッジ確認                         |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001    |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充） |
| 後続Phase  | Phase 8（リファクタリング）            |
| ステータス | not_started                            |
| 作成日     | 2026-03-13                             |
| 更新日     | 2026-03-17                             |
| 機能名     | chatpanel-real-chat-wiring             |

## 目的

> **注記**: 本タスクは「設計」タスクであり、本 Phase は実装仕様書として設計内容を記述する。実際のコード実装は後続の実装タスクで行う。

Phase 5 で実装し Phase 6 でテストを拡充した ChatPanel の実 AI チャット配線について、02-code-quality.md の品質基準（Line 80%, Branch 60%, Function 80%）を満たしているかファイル単位で計測・検証する。基準未達のファイルを特定し、Phase 6 への差戻し判定を行う。

## 実行タスク

- Task 7-1 カバレッジ目標定義: 対象ファイルごとの Line / Branch / Function カバレッジ目標を定義する（02-code-quality.md 準拠: Line 80%, Branch 60%, Function 80%）
- Task 7-2 カバレッジ計測実行: `cd apps/desktop && pnpm vitest run --coverage` で v8 プロバイダによるカバレッジを計測する（P41 準拠: インライン arrow function もカウント対象）
- Task 7-3 GAP 特定: 基準未達ファイルを特定し、不足しているテストケースの種類（分岐、関数、行）を分析する
- Task 7-4 差戻し判定: GAP がある場合は Phase 6 へ戻りテスト追加、全基準達成の場合は Phase 8 へ進む

## カバレッジ目標テーブル

### 対象ファイル一覧

| #   | ファイル                         | 種別 | Line 目標 | Branch 目標 | Function 目標 | 備考                                      |
| --- | -------------------------------- | ---- | --------- | ----------- | ------------- | ----------------------------------------- |
| 1   | `ChatPanel.tsx`                  | 変更 | 80%       | 60%         | 80%           | 主対象（8 状態の条件レンダリング）        |
| 2   | `RuntimeBanner.tsx`              | 新規 | 80%       | 60%         | 80%           | capability 4 値の分岐                     |
| 3   | `ComposerInput.tsx`              | 新規 | 80%       | 60%         | 80%           | Enter/Shift+Enter/disabled 分岐           |
| 4   | `SendButton.tsx`                 | 新規 | 80%       | 60%         | 80%           | disabled/streaming 分岐                   |
| 5   | `ErrorGuidance.tsx`              | 新規 | 80%       | 60%         | 80%           | LLMErrorCode 10 値の分岐（Branch 重点）   |
| 6   | `HandoffBlock.tsx`               | 新規 | 80%       | 60%         | 80%           | terminal handoff 分岐                     |
| 7   | `PersistentTerminalLauncher.tsx` | 新規 | 80%       | 60%         | 80%           | launcher 表示分岐                         |
| 8   | `ChatMessageList.tsx`            | 新規 | 80%       | 60%         | 80%           | メッセージ表示 + streaming 統合           |
| 9   | `ChatMessage.tsx`                | 新規 | 80%       | 60%         | 80%           | user/assistant 分岐                       |
| 10  | `ComposerAttachmentChip.tsx`     | 新規 | 80%       | 60%         | 80%           | 添付チップ表示/削除                       |
| 11  | `TranscriptProvenanceLabel.tsx`  | 新規 | 80%       | 60%         | 80%           | 出所ラベル表示                            |
| 12  | `chatSlice.ts`（拡張部分）       | 変更 | 80%       | 60%         | 80%           | chatPanelStatus / chatMessages の状態遷移 |
| 13  | `useStreamingChat.ts`（統一後）  | 変更 | 80%       | 60%         | 80%           | useStore -> useAppStore 統一後の hook     |

### Branch カバレッジ重点ファイル

以下のファイルは分岐が多いため、Branch カバレッジの達成に特に注意が必要:

| ファイル            | 分岐の種類                                    | 推定分岐数 |
| ------------------- | --------------------------------------------- | ---------- |
| `ChatPanel.tsx`     | 8 状態の条件レンダリング + 既存スキル統合条件 | 15+        |
| `ErrorGuidance.tsx` | LLMErrorCode 10 値 x retryable/non-retryable  | 12+        |
| `RuntimeBanner.tsx` | capability 4 値 x 表示内容                    | 6+         |
| `ComposerInput.tsx` | Enter/Shift+Enter/disabled + streaming 状態   | 8+         |
| `chatSlice.ts`      | 8 状態間の遷移 + アクション分岐               | 10+        |

## 参照資料

### 前提 Phase 成果物

| 参照資料              | パス                              | 内容                                        |
| --------------------- | --------------------------------- | ------------------------------------------- |
| Phase 2（設計）       | `phase-2-design.md`               | 状態機械、コンポーネント階層                |
| Phase 4（テスト作成） | `phase-4-test-creation.md`        | テストマトリクス 52 ケース                  |
| Phase 5（実装）       | `phase-5-implementation.md`       | 変更ファイル一覧                            |
| Phase 6（テスト拡充） | `phase-6-test-expansion.md`       | Edge Case 17 ケース + エラー回帰 5 パターン |
| コード調査レポート    | `outputs/code-research-report.md` | ChatPanel 現行コード                        |

### 品質基準

| 参照資料         | パス                               | 内容                                    |
| ---------------- | ---------------------------------- | --------------------------------------- |
| コード品質ルール | `.claude/rules/02-code-quality.md` | Line 80%, Branch 60%, Function 80% 基準 |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                              | 内容                                                               |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`             | LLM と chat contract の正本                                        |
| llm-ipc-types            | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`              | LLMErrorCode 型定義・useStreamingChat/aiHandlers のIPC型定義参照元 |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Workspace Chat Panel UI 正本                                       |
| ui-ux-panels             | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`               | ChatPanel 統合パターン                                             |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Store関連カバレッジ対象の参照元                                    |
| llm-workspace-chat-edit  | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | HandoffBlockコンポーネントのカバレッジ対象参照元                   |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`              | ストリーミングフロー仕様の参照元                                   |

## 実行手順

### ステップ 1: カバレッジ目標を確認する

カバレッジ目標テーブルの全ファイルが Phase 5 で作成/変更されていることを確認する。

### ステップ 2: カバレッジを計測する

v8 プロバイダでカバレッジを計測する。

```bash
# カバレッジ計測（v8 プロバイダ）
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/components/chat/__tests__/ \
  src/renderer/hooks/__tests__/useStreamingChat.test.ts \
  src/renderer/store/slices/__tests__/chatSlice.test.ts

# 個別ファイルのカバレッジ確認
cd apps/desktop && pnpm vitest run --coverage \
  --coverage.include='src/renderer/components/chat/**' \
  --coverage.include='src/renderer/hooks/useStreamingChat.ts' \
  --coverage.include='src/renderer/store/slices/chatSlice.ts'
```

### ステップ 3: GAP を特定する

カバレッジレポートからファイル単位で Line / Branch / Function を確認し、基準未達のファイルを特定する。

### ステップ 4: 差戻し判定

| 判定     | 条件                                               | アクション                                 |
| -------- | -------------------------------------------------- | ------------------------------------------ |
| PASS     | 全ファイルが Line 80%+, Branch 60%+, Function 80%+ | Phase 8 へ進む                             |
| PARTIAL  | 一部ファイルが基準未達                             | Phase 6 へ戻り、未達ファイルのテストを追加 |
| CRITICAL | 主要ファイル（ChatPanel.tsx）が大幅未達            | Phase 6 へ戻り、テスト設計を見直し         |

### ステップ 5: 成果物を作成する

カバレッジレポートと統合テスト結果を成果物として作成する。

## カバレッジ結果テーブル（テンプレート）

計測後に以下のテーブルを埋める:

| #   | ファイル                         | Line    | Branch  | Function | 判定   | GAP 内容 |
| --- | -------------------------------- | ------- | ------- | -------- | ------ | -------- |
| 1   | `ChatPanel.tsx`                  | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 2   | `RuntimeBanner.tsx`              | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 3   | `ComposerInput.tsx`              | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 4   | `SendButton.tsx`                 | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 5   | `ErrorGuidance.tsx`              | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 6   | `HandoffBlock.tsx`               | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 7   | `PersistentTerminalLauncher.tsx` | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 8   | `ChatMessageList.tsx`            | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 9   | `ChatMessage.tsx`                | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 10  | `ComposerAttachmentChip.tsx`     | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 11  | `TranscriptProvenanceLabel.tsx`  | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 12  | `chatSlice.ts`（拡張部分）       | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |
| 13  | `useStreamingChat.ts`            | \_\_\_% | \_\_\_% | \_\_\_%  | \_\_\_ | \_\_\_   |

## 統合テスト連携

カバレッジ確認ゲートとしての統合テスト結果:

| 判定項目                | 基準 | 結果       |
| ----------------------- | ---- | ---------- |
| ユニットテスト Line     | 80%+ | {{RESULT}} |
| ユニットテスト Branch   | 60%+ | {{RESULT}} |
| ユニットテスト Function | 80%+ | {{RESULT}} |
| 全テスト PASS           | 100% | {{RESULT}} |
| 既存回帰テスト PASS     | 100% | {{RESULT}} |

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                   |
| ------------------ | ---- | -------------------------------------------------------------- |
| UI/UX              | 該当 | ChatPanel の全 8 状態がテストでカバーされていること            |
| セキュリティ       | 該当 | セキュリティ関連コードパス（P42 バリデーション等）のカバレッジ |
| IPC 通信           | 該当 | IPC 呼び出しパス（stream-chat/chunk/done/cancel）のカバレッジ  |
| エラーハンドリング | 該当 | ErrorGuidance の 10 値分岐の Branch カバレッジ                 |
| パフォーマンス     | 該当 | v8 プロバイダのインライン function カウント対策（P41）         |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | チェック内容                                         |
| -------------------------- | ---- | ---------------------------------------------------- |
| フロントエンド（Renderer） | 該当 | 新規 10 コンポーネント + 変更 3 ファイルのカバレッジ |
| バックエンド（Main）       | N/A  | Main Process ハンドラは変更なし（カバレッジ対象外）  |
| IPC 通信                   | 該当 | useStreamingChat の IPC 接続パスのカバレッジ         |
| Preload/セキュリティ       | 該当 | Renderer 3 段階防御パスのカバレッジ                  |

## 成果物

| 成果物             | パス                                  | 内容                                |
| ------------------ | ------------------------------------- | ----------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | ファイル別カバレッジ結果と GAP 分析 |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト実行結果とゲート判定      |

## 完了条件

- [ ] 全対象ファイル（13 ファイル）のカバレッジが計測されている
- [ ] Line カバレッジが全ファイルで 80% 以上を達成している
- [ ] Branch カバレッジが全ファイルで 60% 以上を達成している
- [ ] Function カバレッジが全ファイルで 80% 以上を達成している
- [ ] 基準未達ファイルがある場合、Phase 6 への差戻し判定が記録されている
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成されている
- [ ] 統合テスト結果（`outputs/phase-7/integration-test.md`）が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. カバレッジ目標の確認（13 ファイル一覧）
2. Task 7-2: カバレッジ計測実行
3. Task 7-3: GAP 特定と分析
4. Task 7-4: 差戻し判定
5. カバレッジレポートの作成
6. 統合テスト結果の作成
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 7-1〜7-4）を 100% 実行完了
- [ ] カバレッジレポートが生成されている
- [ ] 統合テスト結果が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 7
```

## 次のPhase

- [Phase 8（リファクタリング）](./phase-8-refactoring.md) に進む
