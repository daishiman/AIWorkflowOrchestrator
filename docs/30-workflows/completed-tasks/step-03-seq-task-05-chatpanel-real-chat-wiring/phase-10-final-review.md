# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 10                                                        |
| Phase名    | 最終レビュー                                              |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001                       |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 9（品質検証） |
| 後続Phase  | Phase 11（手動テスト）                                    |
| ステータス | not_started                                               |
| 作成日     | 2026-03-13                                                |
| 更新日     | 2026-03-17                                                |
| 機能名     | chatpanel-real-chat-wiring                                |

## 目的

> **注記**: 本タスクは「設計」タスクであり、本 Phase は実装仕様書として設計内容を記述する。実際のコード実装は後続の実装タスクで行う。

ChatPanel の実 AI チャット配線の release 可否を多角的に最終レビューする。Phase 3 設計レビューの 16 観点（A-1 ~ D-4）を再確認し、さらに実装固有の最終チェック項目を追加して、PASS / MINOR / MAJOR / CRITICAL を判定する。

## 実行タスク

- Task 10-1: Phase 3 設計レビュー 16 観点の再確認（A-1 ~ A-4, B-1 ~ B-4, C-1 ~ C-4, D-1 ~ D-4）
- Task 10-2: placeholder 完全置換確認（3 箇所すべて置換済み: model-selector-slot, message-list-slot, chat-input-slot）
- Task 10-3: 既存テスト回帰確認（スキル統合 26 テスト + AI チャット新規テストが全 PASS）
- Task 10-4: Phase 1 受入基準充足確認（全 FR/NFR が満たされているか）
- Task 10-5: 隣接タスクとの契約矛盾最終チェック（Task01 auth mode、Task02 terminal、Task06 settings）

## レビュー観点

### Phase 3 設計レビュー 16 観点の再確認

#### A. アーキテクチャ観点（4 項目）

| ID  | 観点                                            | 確認内容                                                                                   |
| --- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| A-1 | selected config と access capability の反映経路 | llmSlice -> llm:set-selected-config -> Main setSelectedLLMConfig -> provider 解決が 1 本化 |
| A-2 | Chat Edit との command surface 二重実装防止     | ChatPanel は llm:stream-chat、Chat Edit は chat-edit:send-with-context で分離              |
| A-3 | Main/Renderer 責務境界のレイヤー依存方向        | runtime 解決は Main、表示状態は Renderer の責務                                            |
| A-4 | Store 設計の P31/P48 対策                       | 個別セレクタ使用、useShallow 適用、合成 Hook 非使用                                        |

#### B. IPC/セキュリティ観点（4 項目）

| ID  | 観点                                 | 確認内容                                                |
| --- | ------------------------------------ | ------------------------------------------------------- |
| B-1 | IPC チャンネルのホワイトリスト管理   | 全 10 チャンネルが IPC_CHANNELS 定数で参照されている    |
| B-2 | P42 3-step validation の全引数適用   | typeof -> === "" -> .trim() === "" が全文字列引数に適用 |
| B-3 | Renderer 3 段階防御パターン          | API 存在 -> メソッド存在 -> レスポンス shape の 3 段階  |
| B-4 | API key の Renderer/handoff 漏洩防止 | apiKey:get は Main-only、handoff command に key 不含    |

#### C. UI/UX 観点（4 項目）

| ID  | 観点                                | 確認内容                                                                  |
| --- | ----------------------------------- | ------------------------------------------------------------------------- |
| C-1 | credentials / streaming error の UX | API_KEY_MISSING は Settings 誘導、retryable エラーは retry ボタン表示     |
| C-2 | 全状態での UI 表示定義              | empty/ready/streaming/cancelled/completed/error/blocked/handoff の 8 状態 |
| C-3 | アクセシビリティ（WCAG 2.1 AA）     | role/aria 属性、キーボード操作、コントラスト比 4.5:1                      |
| C-4 | silent fallback 禁止                | capability 不足時は guidance block 表示、DEFAULT_CONFIG fallback なし     |

#### D. 既知の落とし穴チェック（4 項目）

| ID  | 観点                             | 確認内容                                                                                                                    |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| D-1 | P62 DEFAULT_CONFIG fallback 禁止 | Main Process で selected config 未設定時はエラー返却                                                                        |
| D-2 | P31/P48 Zustand 無限ループ対策   | 個別セレクタ + useShallow で安全                                                                                            |
| D-3 | P39 happy-dom テスト互換性       | fireEvent 使用、userEvent.setup() 不使用                                                                                    |
| D-4 | P60 IPC 応答形式統一             | wrapper 形式 `{ success, data?, error? }` で統一                                                                            |
| D-5 | P63 SubAgent インポートパス誤り  | テスト内の import パスが実際のディレクトリ構造と一致していること（`grep -n "^import" src/path/to/existing.test.ts` で確認） |

### 実装固有の最終チェック項目

| ID  | 観点                 | 確認内容                                                                                                 |
| --- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| E-1 | placeholder 完全置換 | model-selector-slot, message-list-slot, chat-input-slot の 3 箇所すべてが実コンポーネントに置換済み      |
| E-2 | 既存テスト回帰       | スキル統合 26 テストが全 PASS のまま（回帰なし）                                                         |
| E-3 | 新規テスト PASS      | AI チャット関連の新規テストが全 PASS                                                                     |
| E-4 | Phase 1 受入基準充足 | 全 FR（メッセージ送信、streaming、cancel、表示、永続化）と全 NFR（a11y、security、perf）が満たされている |
| E-5 | 隣接タスク契約矛盾   | Task01（auth mode）、Task02（terminal）、Task06（settings）との契約が整合                                |

## レビューゲート

最終レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定     | 条件                         | 次のアクション                                     |
| -------- | ---------------------------- | -------------------------------------------------- |
| PASS     | 重大な問題がない             | Phase 11 に進む                                    |
| MINOR    | 軽微な指摘がある             | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 戻り先が必要な問題がある     | 影響範囲に応じて Phase 1-5 へ戻す                  |
| CRITICAL | 要件再確認が必要な問題がある | Phase 1 へ戻り要件再確認                           |

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 1（要件定義）         |
| 設計の問題       | Phase 2（設計）             |
| テスト設計の問題 | Phase 4（テスト作成）       |
| 実装の問題       | Phase 5（実装）             |
| 品質の問題       | Phase 8（リファクタリング） |

**MINOR 指摘の扱い**: MINOR 判定の指摘は**全て**未タスク仕様書に変換する。「機能影響なし」でも省略不可（05-task-execution.md 準拠）。

## 参照資料

| 参照資料                    | パス                                                                     | 内容                                             |
| --------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------ |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                | FR/NFR 分類、受入基準                            |
| Phase 2（設計）             | `phase-2-design.md`                                                      | 状態機械、コンポーネント階層、IPC 契約マトリクス |
| Phase 3（設計レビュー）     | `phase-3-design-review.md`                                               | 16 観点のレビュー結果                            |
| Phase 5（実装）             | `phase-5-implementation.md`                                              | 実装成果物                                       |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                 | リファクタリング結果                             |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                           | 品質ゲート判定結果                               |
| code research               | `outputs/code-research-report.md`                                        | コード調査レポート（GAP 分析含む）               |
| spec research               | `outputs/spec-research-report.md`                                        | システム仕様調査レポート                         |
| ChatPanel                   | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                | レビュー対象                                     |
| ChatPanel tests             | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx` | テスト回帰確認                                   |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                              | 内容                                           |
| ------------------------ | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`             | LLM と chat contract の正本                    |
| api-ipc-system           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`             | AI_CHAT と selected config の IPC 正本         |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Workspace Chat Panel と ChatPanel 関連 UI 正本 |
| ui-ux-panels             | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`               | ChatPanel 統合パターンの正本                   |
| security-api-electron    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | Electron IPC セキュリティ                      |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Store設計最終レビューの参照元                  |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPCセキュリティ最終レビューの参照元            |
| llm-workspace-chat-edit  | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | handoff UIレビュー観点の参照元                 |

## 実行手順

### ステップ 1: 参照資料と Phase 1-9 成果物を確認する

Phase 3 の設計レビュー報告と Phase 9 の品質レポートを読み込み、既知の指摘事項を把握する。

### ステップ 2: Task 10-1 Phase 3 設計レビュー 16 観点の再確認

A-1 ~ D-4 の 16 観点を実装コードに対して再確認する。Phase 3 で PASS だった項目が実装後も維持されているか検証する。

### ステップ 3: Task 10-2 placeholder 完全置換確認

```bash
# placeholder 残存チェック
grep -rn "model-selector-slot\|message-list-slot\|chat-input-slot" apps/desktop/src/renderer/components/chat/ChatPanel.tsx
# 期待: 0 件（全て置換済み）
```

### ステップ 4: Task 10-3 既存テスト回帰確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/chat/
# 期待: 26 テスト（スキル統合）+ 新規テスト = 全 PASS
```

### ステップ 5: Task 10-4 Phase 1 受入基準充足確認

Phase 1 の完了条件（7 項目 + P50 チェック）を逐次確認し、全て満たされていることをレビュー報告に記録する。

### ステップ 6: Task 10-5 隣接タスク契約矛盾最終チェック

| 依存先タスク | 確認内容                                                              |
| ------------ | --------------------------------------------------------------------- |
| Task01       | auth mode 判定と capability 解決が ChatPanel 設計と整合するか         |
| Task02       | terminal launcher / handoff の契約が ChatPanel の導線設計と整合するか |
| Task06       | selected config 同期と access card の契約が ChatPanel と整合するか    |

### ステップ 7: レビューゲート判定

全観点（A-1 ~ E-5 の 21 項目）の結果を集計し、PASS / MINOR / MAJOR / CRITICAL を判定する。

### ステップ 8: 成果物と完了条件を確認する

最終レビュー報告を作成し、判定結果を記録する。

## 統合テスト連携

最終レビューで以下の統合テスト結果を確認する:

| レビュー項目             | 確認内容                               |
| ------------------------ | -------------------------------------- |
| 全テスト結果             | ユニット + 統合テスト全 PASS           |
| カバレッジ               | Line 80%+、Branch 60%+、Function 80%+  |
| placeholder 置換         | 3 箇所すべて実コンポーネントに置換済み |
| Phase 1 受入基準         | 全 FR/NFR が充足                       |
| Phase 3 設計レビュー観点 | 16 観点が維持                          |

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                           |
| ------------------ | ---- | ------------------------------------------------------ |
| セキュリティ       | 該当 | API key 漏洩防止、IPC sender 検証、P42 バリデーション  |
| UI/UX              | 該当 | 全 8 状態の UI 表示、error guidance、empty state、CTA  |
| アーキテクチャ     | 該当 | Main/Renderer 責務境界、Store 統一、コンポーネント階層 |
| API 設計           | 該当 | IPC 契約マトリクス 10 チャンネル、P60 wrapper 形式     |
| エラーハンドリング | 該当 | LLMErrorCode 全 10 値のガイダンス分岐                  |
| アクセシビリティ   | 該当 | WCAG 2.1 AA、role/aria 属性、キーボード操作            |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | チェック内容                                       |
| -------------------------- | ---- | -------------------------------------------------- |
| フロントエンド（Renderer） | 該当 | コンポーネント階層、state 分離、P31/P48 対策       |
| バックエンド（Main）       | 該当 | runtime 解決、provider 解決、streaming 実行        |
| IPC 通信                   | 該当 | 10 チャンネルの契約定義、wrapper 形式、P60 準拠    |
| Preload/セキュリティ       | 該当 | 3 段階防御、API key 隔離、チャンネルホワイトリスト |

## 成果物

| 成果物           | パス                                      | 内容                                                             |
| ---------------- | ----------------------------------------- | ---------------------------------------------------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | 全 21 観点（A-1 ~ E-5）の判定結果と release blocker の有無を記録 |

## 完了条件

- [ ] Phase 3 設計レビュー 16 観点（A-1 ~ D-4）の再確認が完了している
- [ ] placeholder が 0 箇所になっている（3 箇所すべて置換済み）
- [ ] 既存 26 テスト（スキル統合）が全 PASS のまま（回帰なし）
- [ ] 新規テストが全 PASS
- [ ] Phase 1 の受入基準が全て満たされている
- [ ] Task01, Task02, Task06 との契約矛盾がない
- [ ] MAJOR / CRITICAL 判定が 0 件
- [ ] MINOR 判定の指摘は全て未タスク仕様書に変換されている（省略不可）
- [ ] 最終レビュー報告（`outputs/phase-10/final-review-report.md`）が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料と Phase 1-9 成果物の確認
2. Task 10-1: Phase 3 設計レビュー 16 観点の再確認
3. Task 10-2: placeholder 完全置換確認
4. Task 10-3: 既存テスト回帰確認
5. Task 10-4: Phase 1 受入基準充足確認
6. Task 10-5: 隣接タスク契約矛盾最終チェック
7. レビューゲート判定（PASS/MINOR/MAJOR/CRITICAL）
8. 最終レビュー報告の作成

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 10-1 ~ 10-5）を 100% 実行完了
- [ ] 全 21 観点の判定結果が最終レビュー報告に記録されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 10
```

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md) に進む
