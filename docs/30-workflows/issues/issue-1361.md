# [#1361] "[UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001] useWorkspaceChatController リファクタリング（フック抽出）"

## メタ情報

```yaml
task_id: UT-REFACTOR-WORKSPACE-CHAT-CONTROLLER-HOOK-001
task_name: useWorkspaceChatController リファクタリング（フック抽出）
category: リファクタリング
target_feature: WorkspaceView / useWorkspaceChatController
priority: Medium
scale: 中規模
status: 未実施
source_phase: TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 Phase 10 (MINOR-01, FR-02)
created_date: 2026-03-18
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-refactor-workspace-chat-controller-hook-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | Medium |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`useWorkspaceChatController.ts` が 640行に肥大化しており、単一責務原則（SRP）違反の状態にある。TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 の Phase 10 最終レビューで MINOR-01 として指摘された。目標行数は 300行以下。

### 1.2 問題点・課題

- 640行の単一フックに、ストリーミング状態管理・キャンセル処理・会話永続化の3つの責務が混在している
- ファイルが大きすぎて可読性・テスト容易性が低い
- 将来的な機能追加時に変更コストが高い

### 1.3 放置した場合の影響

- 技術的負債の累積により、WorkspaceChatController 関連の変更コストが増加し続ける
- テストカバレッジの維持が困難になる
- 新規開発者がコードを理解するのに時間がかかる

---

## 2. 何を達成するか（What）

### 2.1 目的

`useWorkspaceChatController.ts` から責務ごとにカスタムフックを抽出し、各フックを 300行以下に収める。

### 2.2 最終ゴール

- `useWorkspaceChatController.ts` が 300行以下になること
- 抽出された各フックに個別テストが存在すること
- 既存テスト 38件が全 PASS を維持すること

### 2.3 スコープ

**含むもの:**

- `useWorkspaceChatController.ts` からの下記フック抽出
  - `useStreamingState`（streamContent/isStreaming/ref 管理）
  - `useCancelStream`（cancelStream ロジック）
  - `useConversationPersistence`（ensureConversation/persist ロジック）
- 抽出フックの個別テスト作成

**含まないもの:**

- WorkspaceChatPanel のレイアウト変更
- IPC ハンドラの変更
- 既存の型定義・インターフェースの変更

### 2.4 成果物

| 種別   | 成果物                                               | 配置先                                                           |
| ------ | ---------------------------------------------------- | ---------------------------------------------------------------- |
| 実装   | リファクタリング済み `useWorkspaceChatController.ts` | `apps/desktop/src/renderer/views/WorkspaceView/hooks/`           |
| 実装   | `useStreamingState.ts`                               | `apps/desktop/src/renderer/views/WorkspaceView/hooks/`           |
| 実装   | `useCancelStream.ts`                                 | `apps/desktop/src/renderer/views/WorkspaceView/hooks/`           |
| 実装   | `useConversationPersistence.ts`                      | `apps/desktop/src/renderer/views/WorkspaceView/hooks/`           |
| テスト | 抽出フックの個別テストファイル                       | `apps/desktop/src/renderer/views/WorkspaceView/hooks/__tests__/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- vitest 実行環境が利用可能であること（esbuild アーキテクチャ一致環境）
- 既存テスト（31 + 7 = 38件）が全 PASS の状態であること

### 3.2 依存タスク

| タスクID                                     | 関係性                           | ステータス |
| -------------------------------------------- | -------------------------------- | ---------- |
| TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 | 親タスク（リファクタリング対象） | 完了       |

### 3.3 抽出候補フック

| フック名                     | 推定行数 | 責務                                |
| ---------------------------- | -------- | ----------------------------------- |
| `useStreamingState`          | ~120     | streamContent/isStreaming/ref 管理  |
| `useCancelStream`            | ~30      | cancelStream ロジック               |
| `useConversationPersistence` | ~60      | ensureConversation/persist ロジック |

### 3.4 推奨アプローチ

1. 現行の `useWorkspaceChatController.ts` を読み込み、責務境界を特定する
2. 責務ごとにフックを抽出し、インターフェースを定義する
3. 抽出したフックを `useWorkspaceChatController.ts` から呼び出す形に変更する
4. 既存テストが全 PASS することを都度確認しながら進める
5. 抽出フックの個別テストを作成する

---

## 4. 実行手順

### Phase 構成

| Phase | 名称                           | 内容                                     |
| ----- | ------------------------------ | ---------------------------------------- |
| 1-3   | 要件・設計・レビュー           | 責務境界分析・フックインターフェース設計 |
| 4     | テスト作成                     | 抽出フック用テストケース設計             |
| 5     | 実装                           | フック抽出・既存テスト PASS 確認         |
| 6-7   | テスト拡充・カバレッジ         | 個別フックテスト追加・カバレッジ確認     |
| 8-10  | リファクタリング〜最終レビュー | コード品質検証                           |
| 11-13 | 手動テスト〜完了               | 動作確認・ドキュメント更新・PR           |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `useWorkspaceChatController.ts` が 300行以下になること
- [ ] `useStreamingState` フックが抽出されていること
- [ ] `useCancelStream` フックが抽出されていること
- [ ] `useConversationPersistence` フックが抽出されていること

### 品質要件

- [ ] 抽出されたフックに個別テストがあること
- [ ] 既存テスト 38件が全 PASS を維持すること
- [ ] TypeScript 型エラーが 0件
- [ ] ESLint エラーが 0件

---

## 6. 検証方法

### 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/views/WorkspaceView/hooks
```

### 検証手順

1. 既存テスト 38件が全 PASS すること
2. 新規抽出フックのテストが PASS すること
3. `wc -l useWorkspaceChatController.ts` で 300行以下を確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                         |
| ------------------------------ | ------ | -------- | ------------------------------------------------------------ |
| フック抽出による既存動作の破壊 | 高     | 中       | 既存テスト 38件を都度実行し、PASS を維持しながら進める       |
| フック間の状態共有が複雑       | 中     | 中       | 抽出前に依存関係グラフを作成し、インターフェースを設計       |
| P31 Zustand 無限ループ再発     | 中     | 低       | 個別セレクタを使用し、合成 Hook の戻り値を依存配列に入れない |

---

## 8. 参照情報

### 関連ドキュメント

| 参照資料                  | パス                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| WorkspaceChatPanel 仕様書 | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-panel.md`                                       |
| 状態管理ルール            | `.claude/rules/03-state-management.md`                                                                                |
| P31 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md#P31`                                                                              |
| 親タスク成果物            | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment/` |

---

## 10. 実装時の苦戦箇所と教訓（親タスクからの知見）

> 以下は親タスク（TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001）の Phase 5-10 実行時に得られた教訓。同様の課題を回避するために参照すること。

### 10.1 P53 worktree 環境制約による vitest 実行不可

- **問題**: esbuild のネイティブモジュールバイナリが worktree 環境で不一致となり、vitest / Electron が起動しない
- **影響**: Phase 7（カバレッジ確認）・Phase 9（品質検証）・Phase 11（手動テスト）が DEFERRED になった
- **対策**: worktree 作成時に `pnpm install --force` を実行するか、メインリポジトリで vitest を実行する。Hook 抽出後のテストは **必ず esbuild 互換環境で実行** すること
- **参照**: `.claude/rules/06-known-pitfalls.md#P53`

### 10.2 P31 Zustand Store Hooks 無限ループリスク

- **問題**: フック抽出時に `useAppStore()` 等の合成 Hook を useEffect 依存配列に含めると無限ループが発生する
- **影響**: 抽出した `useStreamingState` が Store のアクション参照を持つ場合、再レンダーの無限ループに陥る
- **対策**: 個別セレクタ（`useSelectedModelId()`, `useSelectedProviderId()` 等）を使用し、合成 Hook の戻り値関数を依存配列に含めない
- **参照**: `.claude/rules/06-known-pitfalls.md#P31`, `.claude/rules/03-state-management.md`

### 10.3 streaming / cancel の race condition

- **問題**: `sendMessage` 中に `cancelStream` が呼ばれた場合、`isStreamingRef` による stale chunk 排除が必要
- **影響**: cancel 後に遅延到着した chunk が `streamContent` に蓄積され、UI に不整合が生じる
- **対策**: `isStreamingRef.current` ガードを各フック内でも一貫して使用する。抽出時にガードロジックが分散しないよう注意
- **参照**: 親タスク Phase 10 FR-09（データ整合性）、テストケース R-06/R-07/R-08

### 10.4 構造的カバレッジ分析の必要性

- **問題**: vitest 実行不可環境では `--coverage` が使えず、手動でテストケース→ソースコード行のマッピングが必要
- **影響**: カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の検証に工数がかかる
- **対策**: 抽出したフックごとにテストケース ID（例: R-01）とソースコード行番号の対応表を Phase 4 で設計し、Phase 7 で照合する

---

## 11. システム仕様書参照（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                            | 確認内容                                                          |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | state 配置基準（Zustand / local useState）を確認する              |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | streaming / cancel 契約を確認し、Hook 境界と一致させる            |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | WorkspaceChatPanel の5領域構成を確認する                          |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | IPC 契約のインデックスを確認する                                  |
| error-handling           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | error policy（fail-fast/guidance/silent/blocked）の分類を確認する |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | IPC sender 検証 / error masking の要件を確認する                  |

### Hook 抽出時の仕様整合チェックリスト

- [ ] `useStreamingState` が `llm-streaming.md` の chunk format / cancel protocol に準拠する
- [ ] `useCancelStream` が `llm-streaming.md` の AbortController 管理と一致する
- [ ] `useConversationPersistence` が `interfaces-llm.md` の conversation CRUD 契約に準拠する
- [ ] 抽出後も `arch-state-management.md` の state 配置基準（panel 固有は local、共有は Store）を維持する
- [ ] error handling が `error-handling.md` の 4 分類（fail-fast / guidance / silent / blocked）と一致する

---

## 12. 備考

### 関連タスク

| タスクID                                              | 関係性                                |
| ----------------------------------------------------- | ------------------------------------- |
| UT-INTEGRATE-COMPACT-LAYOUT-WORKSPACE-CHAT-001        | 並行実施可（CompactLayout 統合）      |
| UT-INTEGRATE-ACCESS-CAPABILITY-RESOLVER-WORKSPACE-001 | 本タスク完了後に着手推奨（Hook 依存） |
