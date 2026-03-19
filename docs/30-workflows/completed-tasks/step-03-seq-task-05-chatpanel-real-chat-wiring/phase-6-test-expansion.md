# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 6                                   |
| Phase名    | テスト拡充                          |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | Phase 5（実装）                     |
| 後続Phase  | Phase 7（カバレッジ確認）           |
| ステータス | not_started                         |
| 作成日     | 2026-03-13                          |
| 更新日     | 2026-03-17                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

> **注記**: 本タスクは「設計」タスクであり、本 Phase は実装仕様書として設計内容を記述する。実際のコード実装は後続の実装タスクで行う。

Phase 5 の実装完了後、Phase 4 のテストマトリクスでカバーしきれなかった edge case、境界値、連続操作、エラー回帰、Store 安定性のテストを追加し、カバレッジ基準（Line 80%, Branch 60%, Function 80%）の達成に向けてテスト網を拡充する。

## 実行タスク

- Task 6-1 長文入力テスト: 10,000 文字以上の入力、マルチバイト文字（日本語・絵文字）、空白のみの入力（P42 .trim() 準拠）、XSS 試行文字列のテストを追加する
- Task 6-2 連続送信テスト: 前回ストリーミング中の再送信（auto-cancel 確認）、高速連打送信（debounce 確認）、cancel 直後の再送信のテストを追加する
- Task 6-3 mode 切替テスト: streaming 中の view 切替（ChatPanel -> Settings -> ChatPanel）、streaming 中の設定変更（provider/model 変更）、capability 変化時の状態遷移のテストを追加する
- Task 6-4 streaming 中断テスト: キャンセルボタン連打、Escape キー連打、コンポーネント unmount（React StrictMode 二重実行対応 P5）、ネットワーク切断シミュレーションのテストを追加する
- Task 6-5 エラー回帰テスト: NETWORK_ERROR（retryable -> retry ボタン）、API_KEY_INVALID（non-retryable -> Settings 誘導）、RATE_LIMIT（auto-retry + 待機時間表示）、SERVICE_UNAVAILABLE（retryable -> retry ボタン）、UNKNOWN エラーの回帰テストを追加する
- Task 6-6 Store 安定性テスト: useAppStore 個別セレクタの参照安定性（P31 対策）、派生セレクタの useShallow 適用確認（P48 対策）、chatPanelStatus 遷移の atomicity テストを追加する

## Edge Case リスト

### 入力系 Edge Case

| #     | Edge Case                  | 前提条件   | 操作                                     | 期待結果                                   |
| ----- | -------------------------- | ---------- | ---------------------------------------- | ------------------------------------------ |
| EC-01 | 10,000 文字入力            | ready 状態 | 10,000 文字を ComposerInput に入力し送信 | 正常に送信、UI がフリーズしない            |
| EC-02 | マルチバイト文字（日本語） | ready 状態 | 日本語テキストを入力し送信               | 正常に送信、文字化けなし                   |
| EC-03 | 絵文字入力                 | ready 状態 | 絵文字を含むテキストを送信               | 正常に送信、絵文字が正しく表示             |
| EC-04 | 空白のみの入力             | ready 状態 | スペースのみを入力し送信を試行           | 送信されない（P42 .trim() バリデーション） |
| EC-05 | XSS 試行文字列             | ready 状態 | `<script>alert(1)</script>` を入力し送信 | React auto-escape で安全にレンダリング     |

### 連続操作系 Edge Case

| #     | Edge Case            | 前提条件       | 操作                                       | 期待結果                                |
| ----- | -------------------- | -------------- | ------------------------------------------ | --------------------------------------- |
| EC-06 | streaming 中の再送信 | streaming 状態 | 前のストリーミング中に新しいメッセージ送信 | 前の streaming が auto-cancel、新規開始 |
| EC-07 | 高速連打送信         | ready 状態     | 送信ボタンを 100ms 間隔で 5 回連打         | debounce により 1 回のみ送信            |
| EC-08 | cancel 直後の再送信  | cancelled 状態 | cancel 直後（50ms 以内）にメッセージ送信   | 新しい streaming が正常に開始           |
| EC-09 | done 直後の即座送信  | completed 状態 | done signal 直後にメッセージ送信           | 新しい streaming が正常に開始           |

### 状態遷移系 Edge Case

| #     | Edge Case                           | 前提条件       | 操作                                      | 期待結果                                      |
| ----- | ----------------------------------- | -------------- | ----------------------------------------- | --------------------------------------------- |
| EC-10 | streaming 中の view 切替            | streaming 状態 | ChatPanel -> Settings -> ChatPanel に切替 | streaming は cleanup で abort、復帰後は ready |
| EC-11 | streaming 中の provider 変更        | streaming 状態 | Settings で provider を変更               | 現在の streaming には影響なし、次回送信に反映 |
| EC-12 | capability 変化（blocked -> ready） | blocked 状態   | API key を Settings で設定                | blocked -> ready に遷移、composer 有効化      |
| EC-13 | capability 変化（ready -> blocked） | ready 状態     | API key を Settings で削除                | ready -> blocked に遷移、guidance 表示        |

### 中断系 Edge Case

| #     | Edge Case            | 前提条件       | 操作                                      | 期待結果                                 |
| ----- | -------------------- | -------------- | ----------------------------------------- | ---------------------------------------- |
| EC-14 | キャンセルボタン連打 | streaming 状態 | cancel ボタンを 3 回連打                  | 1 回目で cancel、2-3 回目は no-op        |
| EC-15 | Escape キー連打      | streaming 状態 | Escape キーを 3 回連打                    | 1 回目で cancel、2-3 回目は no-op        |
| EC-16 | StrictMode 二重実行  | (mount 時)     | React StrictMode でコンポーネントマウント | リスナーが 1 回だけ登録される（P5 対策） |
| EC-17 | ネットワーク切断     | streaming 状態 | ネットワーク切断をシミュレート            | NETWORK_ERROR、蓄積コンテンツ保持        |

## 参照資料

### 前提 Phase 成果物

| 参照資料              | パス                              | 内容                                             |
| --------------------- | --------------------------------- | ------------------------------------------------ |
| Phase 2（設計）       | `phase-2-design.md`               | 状態機械、コンポーネント階層、IPC 契約マトリクス |
| Phase 4（テスト作成） | `phase-4-test-creation.md`        | テストマトリクス 52 ケース、モック戦略           |
| Phase 5（実装）       | `phase-5-implementation.md`       | 実装順序、変更ファイル一覧                       |
| コード調査レポート    | `outputs/code-research-report.md` | ChatPanel 現行コード・GAP 分析                   |
| 仕様調査レポート      | `outputs/spec-research-report.md` | 型定義・IPC 契約・セキュリティ要件               |

### コードベース

| 参照資料                  | パス                                                                                      | 内容                                  |
| ------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------- |
| ChatPanel                 | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                                 | Phase 5 で更新済み                    |
| ChatPanel chat-wiring     | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.chat-wiring.test.tsx`      | Phase 4 で作成した新規テストファイル  |
| ChatPanel accessibility   | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.accessibility.test.tsx`    | Phase 4 で作成した新規テストファイル  |
| ChatPanel settings-sync   | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.settings-sync.test.tsx`    | Phase 4 で作成した新規テストファイル  |
| ChatPanel tests           | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx`                  | 既存 UI テスト（313 行、12 テスト）   |
| ChatPanel skill-mgmt test | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx` | スキル管理テスト（375 行、14 テスト） |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                              | 内容                                        |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`             | LLM と chat contract の正本                 |
| llm-ipc-types            | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`              | LLMErrorCode 型定義                         |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`              | ストリーミングエラー状態                    |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Workspace Chat Panel UI 状態                |
| ui-ux-panels             | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`               | ChatPanel 統合パターン                      |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | エッジケーステスト（state遷移異常）の参照元 |
| llm-workspace-chat-edit  | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | handoff状態遷移エッジケースの参照元         |

## 実行手順

### ステップ 1: Phase 5 実装の確認と Phase 4 テスト結果の確認

Phase 5 完了後のコードベースを確認し、Phase 4 テスト（52 ケース）の実行結果を確認する。カバレッジの GAP を特定する。

```bash
# Phase 4 テストの実行とカバレッジ確認
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/chat/__tests__/
```

### ステップ 2: Task 6-1 から Task 6-6 を上から順に実施する

6 つの実行タスクを上から順に処理する。各タスクで Edge Case テストを実装し、テストが PASS することを確認する。

### ステップ 3: 全テスト実行と回帰確認

新規テスト + 既存テストを全て実行し、回帰がないことを確認する。

```bash
# 全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/

# カバレッジ計測
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/chat/
```

### ステップ 4: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、Edge Case テストがシステム仕様の制約を正しくテストしていることを確認する。

### ステップ 5: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## テスト環境の注意事項

| 注意事項               | 対策                                                                             | 関連 Pitfall |
| ---------------------- | -------------------------------------------------------------------------------- | ------------ |
| happy-dom 環境         | `fireEvent` を使用、`userEvent.setup()` は使用禁止                               | P39          |
| テスト実行ディレクトリ | `cd apps/desktop && pnpm vitest run` で実行                                      | P40          |
| Store モックの安定性   | 個別セレクタ + `useShallow` 適用の派生セレクタをテスト                           | P31, P48     |
| IPC 応答形式           | wrapper 形式 `{success, data?, error?}` で統一                                   | P60          |
| StrictMode 二重実行    | リスナー登録はモジュールレベルでガード                                           | P5           |
| タイマーテスト         | `advanceTimersByTime` で 1 ステップずつ進める。`runAllTimers` は無限ループリスク | P13          |

## 統合テスト連携

Phase 6 で追加するテストは、以下の統合テスト観点を強化する:

| テスト観点         | Edge Case 対応 | 強化内容                                          |
| ------------------ | -------------- | ------------------------------------------------- |
| 入力バリデーション | EC-01 〜 EC-05 | 長文、マルチバイト、空白のみ、XSS 防止            |
| 連続操作の堅牢性   | EC-06 〜 EC-09 | auto-cancel、debounce、タイミング競合             |
| 状態遷移の一貫性   | EC-10 〜 EC-13 | view 切替、capability 動的変化                    |
| 中断操作の堅牢性   | EC-14 〜 EC-17 | 連打耐性、StrictMode 互換、ネットワーク切断       |
| エラー回帰         | Task 6-5       | LLMErrorCode 5 パターンの retryable/non-retryable |
| Store 安定性       | Task 6-6       | P31/P48 対策の個別セレクタ安定性                  |

## 多角的チェック観点

| 観点               | 適用 | チェック内容                                                   |
| ------------------ | ---- | -------------------------------------------------------------- |
| UI/UX              | 該当 | 長文入力時の UI フリーズ防止、マルチバイト文字の正常表示       |
| セキュリティ       | 該当 | XSS 試行文字列の安全なレンダリング、P42 .trim() バリデーション |
| IPC 通信           | 該当 | 連続送信時の IPC 呼び出し順序、auto-cancel の IPC キャンセル   |
| アクセシビリティ   | 該当 | 長文コンテンツの aria-live 通知、エラー復帰時の role="alert"   |
| エラーハンドリング | 該当 | 5 パターンのエラー回帰、retry/non-retry の適切な分岐           |
| パフォーマンス     | 該当 | 10,000 文字入力時のレンダリング性能、高速連打時の debounce     |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | チェック内容                                               |
| -------------------------- | ---- | ---------------------------------------------------------- |
| フロントエンド（Renderer） | 該当 | Store 安定性、StrictMode 互換、view 切替時のクリーンアップ |
| バックエンド（Main）       | 該当 | IPC ハンドラの連続呼び出し耐性（モック経由）               |
| IPC 通信                   | 該当 | auto-cancel の IPC キャンセルフロー、タイミング競合        |
| Preload/セキュリティ       | 該当 | XSS 防止の Renderer 側テスト                               |

## 成果物

| 成果物                 | パス                                 | 内容                                               |
| ---------------------- | ------------------------------------ | -------------------------------------------------- |
| Edge Case 回帰計画     | `outputs/phase-6/regression-plan.md` | Edge Case 一覧と追加テスト方針                     |
| テストコード（拡充分） | プロジェクト該当ディレクトリ         | 既存テストファイルへの追加 + 新規 Edge Case テスト |

## 完了条件

- [ ] 長文入力テスト（10,000 文字、マルチバイト、空白のみ、XSS 試行）が追加されている
- [ ] 連続送信テスト（auto-cancel、高速連打、cancel 直後再送信）が追加されている
- [ ] mode 切替テスト（view 切替、設定変更、capability 変化）が追加されている
- [ ] streaming 中断テスト（連打耐性、StrictMode、ネットワーク切断）が追加されている
- [ ] エラー回帰テスト（NETWORK_ERROR, API_KEY_INVALID, RATE_LIMIT, SERVICE_UNAVAILABLE, UNKNOWN）が追加されている
- [ ] Store 安定性テスト（P31 個別セレクタ安定性、P48 useShallow 確認）が追加されている
- [ ] 全テスト（Phase 4 + Phase 6 + 既存 26）が PASS している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. Phase 5 実装の確認と Phase 4 テスト結果の確認
2. Task 6-1: 長文入力テスト追加（EC-01 〜 EC-05）
3. Task 6-2: 連続送信テスト追加（EC-06 〜 EC-09）
4. Task 6-3: mode 切替テスト追加（EC-10 〜 EC-13）
5. Task 6-4: streaming 中断テスト追加（EC-14 〜 EC-17）
6. Task 6-5: エラー回帰テスト追加（5 パターン）
7. Task 6-6: Store 安定性テスト追加（P31/P48）
8. 全テスト実行と回帰確認
9. system spec との整合確認
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 6-1〜6-6）を 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 6

# テスト全体実行 + カバレッジ
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/chat/
```

## 次のPhase

- [Phase 7（カバレッジ確認）](./phase-7-coverage-check.md) に進む
