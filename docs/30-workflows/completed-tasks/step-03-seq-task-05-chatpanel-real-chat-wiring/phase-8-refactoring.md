# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 8                                                                                                                                                       |
| Phase名    | リファクタリング（TDD: Refactor）                                                                                                                       |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001                                                                                                                     |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー）、Phase 4（テスト作成）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認） |
| 後続Phase  | Phase 9（品質検証）                                                                                                                                     |
| ステータス | not_started                                                                                                                                             |
| 作成日     | 2026-03-13                                                                                                                                              |
| 更新日     | 2026-03-17                                                                                                                                              |
| 機能名     | chatpanel-real-chat-wiring                                                                                                                              |

## 目的

> **注記**: 本タスクは「設計」タスクであり、本 Phase は実装仕様書として設計内容を記述する。実際のコード実装は後続の実装タスクで行う。

Phase 5-7 で配線した ChatPanel の実 AI チャット機能について、動作を変えずにコード品質を改善する。state 分離、コンポーネント分離、重複コード削除、命名統一の 4 領域でリファクタリングを実施し、保守性と可読性を向上させる。

## 実行タスク

- Task 8-1 state 分離: UI state（ChatPanel local）、transport state（useStreamingChat）、workspace context state（Store）を明確に分離し、各 state の責務境界を整理する
- Task 8-2 コンポーネント分離: ChatPanel から RuntimeBanner, ComposerInput, ErrorGuidance 等を独立コンポーネントとして抽出する（Atomic Design 準拠: atoms -> molecules -> organisms）
- Task 8-3 重複コード削除: SkillStreamingView と StreamingMessage の重複部分を共通化し、streaming 表示ロジックの Single Source of Truth を確立する
- Task 8-4 命名統一: P45 準拠で IPC チャンネル名と Store action 名の命名をセマンティクスに一致させる。引数名と実際の値の乖離を解消する

## 参照資料

| 参照資料                  | パス                                                                     | 内容                                             |
| ------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| Phase 1（要件定義）       | `phase-1-requirements.md`                                                | FR/NFR 分類、受入基準                            |
| Phase 2（設計）           | `phase-2-design.md`                                                      | 状態機械、コンポーネント階層、IPC 契約マトリクス |
| Phase 3（設計レビュー）   | `phase-3-design-review.md`                                               | レビュー観点 A-1 ~ D-4 の判定結果                |
| Phase 5（実装）           | `phase-5-implementation.md`                                              | 実装成果物                                       |
| Phase 6（テスト拡充）     | `phase-6-test-expansion.md`                                              | テスト拡充成果物                                 |
| Phase 7（カバレッジ確認） | `phase-7-coverage-check.md`                                              | カバレッジ基準達成確認                           |
| code research             | `outputs/code-research-report.md`                                        | コード調査レポート（GAP 分析含む）               |
| ChatPanel                 | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                | リファクタリング対象                             |
| useStreamingChat          | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`                    | transport state の現状                           |
| StreamingMessage          | `apps/desktop/src/renderer/components/chat/StreamingMessage.tsx`         | streaming 表示コンポーネント                     |
| ChatPanel tests           | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` | 既存テスト（リファクタリング後も全 PASS 維持）   |

### システム仕様（aiworkflow-requirements）

> リファクタリング後も以下の正本仕様との整合性を維持する。

| 参照資料                 | パス                                                                              | 内容                                           |
| ------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`             | LLM と chat contract の正本                    |
| api-ipc-system           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | AI_CHAT と selected config の IPC 正本         |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Workspace Chat Panel と ChatPanel 関連 UI 正本 |
| ui-ux-panels             | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`               | ChatPanel 統合パターンの正本                   |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | state分離リファクタリングの参照元              |
| llm-ipc-types            | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`              | IPC契約適合確認の参照元                        |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`              | ストリーミングフロー仕様の参照元               |

## 実行手順

### ステップ 1: 参照資料を確認する

Phase 2 の設計成果物（コンポーネント階層、state 設計）と Phase 5 の実装成果物を確認し、リファクタリング対象範囲を固定する。

### ステップ 2: Task 8-1 state 分離

ChatPanel 内の state を以下の 3 カテゴリに分離する:

| カテゴリ          | 責務                                   | 配置先            |
| ----------------- | -------------------------------------- | ----------------- |
| UI state          | importDialogSkill, showSkillManagement | ChatPanel local   |
| Transport state   | isStreaming, streamingContent, error   | useStreamingChat  |
| Workspace context | chatPanelStatus, chatMessages          | chatSlice (Store) |

**P31/P48 対策**: 個別セレクタパターンを適用し、合成 Hook の戻り値を useEffect 依存配列に含めない。`.filter()` / `.map()` で配列を返す派生セレクタには `useShallow` を適用する。

### ステップ 3: Task 8-2 コンポーネント分離

Phase 2 設計のコンポーネント階層に従い、ChatPanel から以下を独立コンポーネントとして抽出する:

```
ChatPanel (organism)
  +-- RuntimeBanner (molecule)
  +-- ChatMessageList (molecule)
  |     +-- ChatMessage (atom)
  |     +-- StreamingMessage (atom, 既存)
  |     +-- ErrorGuidance (molecule)
  +-- HandoffBlock (molecule)
  +-- ComposerArea (molecule)
  |     +-- ComposerInput (atom)
  |     +-- SendButton (atom)
  +-- SkillStreamingView (既存維持)
  +-- SkillManagementPanel (既存維持)
```

**抽出基準**: 1 コンポーネントあたり 50 行以上のレンダリングロジックがある場合は独立コンポーネントとして分離する。

### ステップ 4: Task 8-3 重複コード削除

SkillStreamingView と StreamingMessage の共通ロジック（streaming 表示、パルスカーソル、キャンセルボタン）を確認し、重複を排除する。StreamingMessage を Single Source of Truth として、SkillStreamingView は StreamingMessage を内部で使用する構成に統一する。

### ステップ 5: Task 8-4 命名統一

P45 準拠で以下の命名不一致を検出・修正する:

```bash
# 命名不一致箇所の検出
grep -rn "skillId" apps/desktop/src/main/ | grep -v "test" | grep -v "__tests__"
grep -rn "skillName" apps/desktop/src/renderer/ | grep -v "test" | grep -v "__tests__"
```

IPC チャンネル名、Store action 名、関数引数名が実際に渡される値のセマンティクスと一致することを確認する。

### ステップ 6: リファクタリング後のテスト実行

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/chat/
```

既存テスト（スキル統合 26 テスト + AI チャット新規テスト）が全て PASS することを確認する。

### ステップ 7: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

リファクタリング後に以下の統合テストが継続成功することを確認する:

```bash
# ChatPanel 全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/

# useStreamingChat テスト実行
cd apps/desktop && pnpm vitest run src/renderer/hooks/

# 全テスト実行（回帰確認）
cd apps/desktop && pnpm vitest run
```

| 確認項目                          | 基準                |
| --------------------------------- | ------------------- |
| ChatPanel 既存テスト（26 テスト） | 全 PASS（回帰なし） |
| ChatPanel 新規テスト              | 全 PASS             |
| useStreamingChat テスト           | 全 PASS             |
| StreamingMessage テスト           | 全 PASS             |

## 多角的チェック観点

| 観点           | 適用 | チェック内容                                                       |
| -------------- | ---- | ------------------------------------------------------------------ |
| アーキテクチャ | 該当 | Atomic Design 準拠のコンポーネント階層、Main/Renderer 責務境界維持 |
| UI/UX          | 該当 | リファクタリング後も画面表示・遷移に変化がないこと                 |
| セキュリティ   | 該当 | API key 隔離、IPC sender 検証がリファクタリングで崩れていないこと  |
| IPC 通信       | 該当 | P45 命名統一後もチャンネル定数参照が維持されていること             |
| パフォーマンス | 該当 | memo/forwardRef 最適化が維持されていること                         |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | チェック内容                                           |
| -------------------------- | ---- | ------------------------------------------------------ |
| フロントエンド（Renderer） | 該当 | コンポーネント分離後の props 契約が Phase 2 設計と一致 |
| IPC 通信                   | 該当 | 命名統一後のチャンネル名がホワイトリストと一致         |

## 成果物

| 成果物               | パス                                   | 内容                                                               |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------ |
| リファクタリング計画 | `outputs/phase-8/refactor-plan.md`     | state 分離、コンポーネント分離、重複削除、命名統一の方針と実施結果 |
| テスト回帰結果       | `outputs/phase-8/regression-result.md` | リファクタリング前後のテスト結果比較                               |

## 完了条件

- [ ] UI state / transport state / workspace context state が明確に分離されている
- [ ] ChatPanel から RuntimeBanner, ComposerInput, ErrorGuidance 等が独立コンポーネントとして抽出されている（Atomic Design 準拠）
- [ ] SkillStreamingView と StreamingMessage の重複が排除されている
- [ ] P45 準拠で IPC チャンネル名・Store action 名・引数名の命名がセマンティクスと一致している
- [ ] リファクタリング後に既存テスト（26 テスト）が全 PASS している（回帰なし）
- [ ] リファクタリング後に新規テストが全 PASS している
- [ ] memo/forwardRef 等のパフォーマンス最適化が維持されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2 設計、Phase 5 実装成果物）
2. Task 8-1: state 分離（UI / transport / workspace context）
3. Task 8-2: コンポーネント分離（Atomic Design 準拠）
4. Task 8-3: 重複コード削除（SkillStreamingView / StreamingMessage 共通化）
5. Task 8-4: 命名統一（P45 準拠）
6. リファクタリング後のテスト全 PASS 確認
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 8-1 ~ 8-4）を 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
cd apps/desktop && pnpm vitest run src/renderer/components/chat/
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 8
```

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md) に進む
