# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 9                                   |
| Phase名    | 品質検証                            |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | Phase 8（リファクタリング）         |
| 後続Phase  | Phase 10（最終レビュー）            |
| ステータス | not_started                         |
| 作成日     | 2026-03-13                          |
| 更新日     | 2026-03-17                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

> **注記**: 本タスクは「設計」タスクであり、本 Phase は実装仕様書として設計内容を記述する。実際のコード実装は後続の実装タスクで行う。

ChatPanel の実 AI チャット配線の品質を横断的に検証する。UX、セキュリティ、lint/typecheck、テスト全 PASS、IPC 契約整合の 5 領域で品質ゲートをクリアし、Phase 10（最終レビュー）へ進む準備を完了させる。

## 実行タスク

- Task 9-1 UX 確認: streaming UX（パルスカーソル、蓄積コンテンツ表示、キャンセル後の状態復帰）、error guidance（LLMErrorCode 全 10 値の分岐表示）、selected config drift（Renderer と Main の設定不一致検出）を確認する
- Task 9-2 セキュリティ確認: secret masking（API key が Renderer や handoff command に漏洩しないこと）、error surface 整合（内部情報がエラーメッセージに含まれないこと）、XSS 防止（React auto-escape + IPC string-only 伝送）を確認する
- Task 9-3 lint/typecheck: `pnpm lint` と `pnpm --filter @repo/desktop exec tsc --noEmit` でエラー 0 件を確認する
- Task 9-4 全テスト実行: `cd apps/desktop && pnpm vitest run` で全テスト PASS を確認する
- Task 9-5 IPC 契約整合: P60 準拠で wrapper 形式（`{ success: boolean, data?: T, error?: { code, message } }`）が統一されていること、P42 準拠で全文字列引数に 3-step validation が適用されていることを確認する

## 参照資料

| 参照資料                    | パス                                                      | 内容                                          |
| --------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                 | FR/NFR 分類、受入基準                         |
| Phase 2（設計）             | `phase-2-design.md`                                       | UX 設計、セキュリティ設計、IPC 契約マトリクス |
| Phase 3（設計レビュー）     | `phase-3-design-review.md`                                | レビュー観点の判定結果                        |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                  | リファクタリング結果                          |
| code research               | `outputs/code-research-report.md`                         | コード調査レポート                            |
| spec research               | `outputs/spec-research-report.md`                         | システム仕様調査レポート                      |
| ChatPanel                   | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx` | 検証対象                                      |
| useStreamingChat            | `apps/desktop/src/renderer/hooks/useStreamingChat.ts`     | streaming hook                                |
| aiHandlers                  | `apps/desktop/src/main/ipc/aiHandlers.ts`                 | AI_CHAT ハンドラ                              |
| llm handlers                | `apps/desktop/src/main/handlers/llm.ts`                   | LLM streaming ハンドラ                        |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                              | 内容                                                      |
| --------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| interfaces-llm        | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`             | LLM と chat contract の正本                               |
| api-ipc-system        | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | AI_CHAT と selected config の IPC 正本                    |
| llm-ipc-types         | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`              | LLMErrorCode、AIChatRequest/Response 型定義               |
| llm-streaming         | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`              | StreamChunk、StreamingState、キャンセル契約               |
| security-api-electron | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | Electron IPC セキュリティ・API key 保護                   |
| arch-state-management | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Store品質確認・P31/P48準拠検証の参照元                    |
| security-electron-ipc | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPCセキュリティ品質確認の参照元                           |
| ui-ux-settings        | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md`        | blocked状態UI品質確認・auth-key存在チェック後のUI表示検証 |

## 実行手順

### ステップ 1: 参照資料を確認する

Phase 2 の設計成果物（UX 設計、セキュリティ設計）と Phase 8 のリファクタリング結果を確認し、品質検証の対象範囲を固定する。

### ステップ 2: Task 9-1 UX 確認

以下の UX 品質項目を確認する:

| 確認項目                  | 確認方法                                                             | 期待結果                                       |
| ------------------------- | -------------------------------------------------------------------- | ---------------------------------------------- |
| streaming パルスカーソル  | StreamingMessage の `isStreaming` props 確認                         | streaming 中はパルスカーソルが表示される       |
| 蓄積コンテンツ保持        | cancel 後の `streamingContent` state 確認                            | cancel 後も途中までのコンテンツが保持される    |
| error guidance 分岐       | LLMErrorCode 全 10 値に対する ErrorGuidance 表示確認                 | 各エラーコードに応じたガイダンスが表示される   |
| selected config drift     | Renderer 側 `selectedProviderId` と Main 側 `getSelectedLLMConfig()` | 不一致時にエラー表示（silent fallback しない） |
| blocked 状態の CTA        | API key 未設定時の blocked 状態確認                                  | 「設定を開く」CTA が表示される                 |
| empty state の capability | capability 4 値に応じた empty state 表示確認                         | 各 capability に適切なガイダンスが表示される   |

### ステップ 3: Task 9-2 セキュリティ確認

```bash
# API key の Renderer 漏洩チェック
grep -rn "apiKey\|api_key\|API_KEY" apps/desktop/src/renderer/ | grep -v "test" | grep -v "__tests__" | grep -v "node_modules"

# handoff command への secret 混入チェック
grep -rn "getApiKey\|apiKey" apps/desktop/src/main/services/chat-edit/ | grep -v "test"

# エラーメッセージへの内部情報漏洩チェック
grep -rn "stack\|trace\|internal" apps/desktop/src/main/ipc/aiHandlers.ts apps/desktop/src/main/handlers/llm.ts
```

| 確認項目                       | 判定基準                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------- |
| API key の Renderer 非公開     | `apiKey:get` / `auth-key:getKey` が Preload に公開されていない                |
| handoff command の secret 排除 | terminal handoff の guidance に API key が含まれない                          |
| エラーメッセージのサニタイズ   | stack trace、内部パスがエラーメッセージに含まれない                           |
| IPC sender 検証                | 全ハンドラで `withValidation()` または `validateIpcSender()` が使用されている |

### ステップ 4: Task 9-3 lint/typecheck

```bash
# TypeScript 型チェック（エラー 0 件）
pnpm --filter @repo/desktop exec tsc --noEmit

# ESLint チェック（警告 0 件）
pnpm lint

# Prettier フォーマットチェック
pnpm prettier --check "apps/desktop/src/**/*.{ts,tsx}"
```

| ツール     | 期待結果       |
| ---------- | -------------- |
| TypeScript | エラー 0 件    |
| ESLint     | 警告 0 件      |
| Prettier   | フォーマット済 |

### ステップ 5: Task 9-4 全テスト実行

> **P13 対策**: `setTimeout` + `Promise` + 再スケジュールのパターンを持つテスト（streaming タイマーテスト等）では `runAllTimers` 系が無限ループする可能性がある。そのようなテストでは `advanceTimersByTime` を使用して 1 ステップずつ進めること。

```bash
# ChatPanel 関連テスト
cd apps/desktop && pnpm vitest run src/renderer/components/chat/

# useStreamingChat テスト
cd apps/desktop && pnpm vitest run src/renderer/hooks/

# 全テスト実行
cd apps/desktop && pnpm vitest run
```

| テストスイート                    | 期待結果 |
| --------------------------------- | -------- |
| ChatPanel 既存テスト（26 テスト） | 全 PASS  |
| ChatPanel 新規テスト              | 全 PASS  |
| useStreamingChat テスト           | 全 PASS  |
| StreamingMessage テスト           | 全 PASS  |
| 全テスト                          | 全 PASS  |

### ステップ 6: Task 9-5 IPC 契約整合

以下の契約整合を確認する:

**P60 準拠 wrapper 形式チェック**:

```bash
# IPC レスポンス形式の統一確認
grep -rn "success:" apps/desktop/src/main/ipc/aiHandlers.ts apps/desktop/src/main/handlers/llm.ts
```

**P42 準拠 3-step validation チェック**:

```bash
# .trim() バリデーションの適用確認
grep -rn "\.trim()" apps/desktop/src/main/ipc/aiHandlers.ts apps/desktop/src/main/handlers/llm.ts
```

| 確認項目                                   | 判定基準                                                     |
| ------------------------------------------ | ------------------------------------------------------------ |
| AI_CHAT レスポンス wrapper 形式            | `{ success: true/false, data?: {...}, error?: string }` 形式 |
| LLM_STREAM_CHAT レスポンス                 | requestId 返却 + chunk/end/error イベント形式                |
| llm:set-selected-config レスポンス         | `{ success: boolean, error?: string }` 形式                  |
| AIChatRequest.message の 3-step validation | `typeof -> === "" -> .trim() === ""` の 3 ステップ           |
| providerId / modelId の部分設定禁止        | 両方同時に設定されるか両方とも未設定のいずれかのみ許可       |

### ステップ 7: 成果物と完了条件を確認する

品質チェックリストの全項目の結果を記録し、blocker が 0 件であることを確認する。

## 統合テスト連携

品質検証で以下の統合テスト結果を確認する:

| 品質項目     | 確認内容                              | 期待結果    |
| ------------ | ------------------------------------- | ----------- |
| 機能検証     | 全自動テスト成功                      | 全 PASS     |
| コード品質   | lint/typecheck クリア                 | エラー 0 件 |
| セキュリティ | API key 漏洩なし、IPC sender 検証あり | 脆弱性 0 件 |
| UX 品質      | 全状態の UI 表示が Phase 2 設計と一致 | 不一致 0 件 |
| IPC 契約     | wrapper 形式統一、3-step validation   | 違反 0 件   |

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                          |
| ------------------ | ---- | --------------------------------------------------------------------- |
| セキュリティ       | 該当 | API key 漏洩防止、IPC sender 検証、error surface サニタイズ           |
| UI/UX              | 該当 | streaming UX、error guidance 分岐、empty state、blocked CTA           |
| IPC 通信           | 該当 | P42 3-step validation、P60 wrapper 形式統一、チャンネルホワイトリスト |
| パフォーマンス     | 該当 | streaming chunk 受信時の最小再レンダー                                |
| アクセシビリティ   | 該当 | role/aria 属性の維持、キーボード操作の維持                            |
| エラーハンドリング | 該当 | LLMErrorCode 全 10 値のガイダンス分岐、retryable/non-retryable の区別 |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | チェック内容                                              |
| -------------------------- | ---- | --------------------------------------------------------- |
| フロントエンド（Renderer） | 該当 | コンポーネント state 分離、P31/P48 対策維持               |
| バックエンド（Main）       | 該当 | provider 解決ロジック、API key 保護                       |
| IPC 通信                   | 該当 | 10 チャンネルの契約整合、wrapper 形式、P42 バリデーション |
| Preload/セキュリティ       | 該当 | 3 段階防御パターン、チャンネルホワイトリスト              |

## 成果物

| 成果物             | パス                                | 内容                                                 |
| ------------------ | ----------------------------------- | ---------------------------------------------------- |
| 品質チェックリスト | `outputs/phase-9/qa-checklist.md`   | UX、セキュリティ、lint/typecheck、テスト、IPC の結果 |
| 品質レポート       | `outputs/phase-9/quality-report.md` | 品質ゲート判定結果（blocker 有無）                   |

## 完了条件

- [ ] streaming UX（パルスカーソル、蓄積コンテンツ保持、キャンセル後復帰）が Phase 2 設計と一致している
- [ ] LLMErrorCode 全 10 値の error guidance 分岐が定義どおり動作している
- [ ] API key が Renderer や handoff command に漏洩していないことを確認した
- [ ] `pnpm --filter @repo/desktop exec tsc --noEmit` がエラー 0 件である
- [ ] `pnpm lint` が警告 0 件である
- [ ] `cd apps/desktop && pnpm vitest run` で全テスト PASS である
- [ ] P60 準拠の wrapper 形式が全 IPC レスポンスで統一されている
- [ ] P42 準拠の 3-step validation が全文字列引数に適用されている
- [ ] 品質 blocker が 0 件である
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2 設計、Phase 8 リファクタリング結果）
2. Task 9-1: UX 確認（streaming、error guidance、selected config drift）
3. Task 9-2: セキュリティ確認（secret masking、error surface）
4. Task 9-3: lint/typecheck（エラー 0 件確認）
5. Task 9-4: 全テスト実行（全 PASS 確認）
6. Task 9-5: IPC 契約整合（P60 wrapper、P42 validation）
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 9-1 ~ 9-5）を 100% 実行完了
- [ ] 各タスクの結果が品質レポートに記録されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 9
```

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
