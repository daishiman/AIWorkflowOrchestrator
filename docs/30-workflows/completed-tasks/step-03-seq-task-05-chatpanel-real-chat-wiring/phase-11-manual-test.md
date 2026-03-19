# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 11                                  |
| Phase名    | 手動テスト                          |
| タスクID   | TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 |
| 前提Phase  | Phase 10（最終レビュー）            |
| 後続Phase  | Phase 12（ドキュメント）            |
| ステータス | not_started                         |
| 作成日     | 2026-03-13                          |
| 更新日     | 2026-03-17                          |
| 機能名     | chatpanel-real-chat-wiring          |

## 目的

> **注記**: 本タスクは「設計」タスクであり、本 Phase は実装仕様書として設計内容を記述する。実際のコード実装は後続の実装タスクで行う。

自動テストでは検証できないユーザー体験、UI/UX、実環境動作を手動で確認する。ChatPanel の全状態（empty, streaming, error, blocked, handoff, cancelled）を代表シナリオで検証し、Phase 2 設計との一致をスクリーンショット証跡で記録する。

## 実行タスク

- Task 11-1 チャット送信シナリオ: メッセージ入力 -> 送信 -> streaming 表示（パルスカーソル） -> 完了 -> メッセージ一覧表示を確認する
- Task 11-2 エラーシナリオ: API key 未設定 -> blocked 表示 -> 設定誘導 CTA -> 設定画面遷移を確認する
- Task 11-3 キャンセルシナリオ: streaming 中 -> キャンセルボタン -> accumulated content 保持を確認する
- Task 11-4 terminal handoff シナリオ: PersistentTerminalLauncher -> TerminalDock 表示を確認する
- Task 11-5 capability 切替シナリオ: integratedRuntime -> terminalSurface -> both -> none の各状態表示を確認する
- Task 11-6 アクセシビリティ確認: スクリーンリーダー対応（role/aria 属性）、キーボードナビゲーション（Enter/Escape/Tab）、コントラスト比を確認する
- Task 11-7 旧 API 削除確認: P28 準拠で旧 placeholder API が残っていないことを DevTools コンソールで確認する

## テストケース

### 設計タスクにおける NON_VISUAL 判定

本タスクは「設計」タスクであり、Phase 5 でプロダクションコードを実装しない。そのため手動テストは以下の方針で実施する:

| 判定       | 条件                                               |
| ---------- | -------------------------------------------------- |
| NON_VISUAL | Phase 5 実装が未完了で UI が存在しない場合         |
| VISUAL     | 後続の実装タスク完了後に Phase 11 を再実行する場合 |

NON_VISUAL 判定の場合:

1. テストケースの「操作手順」を「設計書レビュー手順」に読み替える
2. 「期待結果」を「設計仕様に記載されていること」に読み替える
3. スクリーンショットは「設計図（Phase 2 成果物の画面構成図）」で代替する
4. `outputs/phase-11/manual-test-result.md` に NON_VISUAL 判定であることを明記する

| テストケース | カテゴリ         | 目的                                | 前提条件                  | 操作手順                                                          | 期待結果                                                         |
| ------------ | ---------------- | ----------------------------------- | ------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- |
| TC-11-01     | 機能テスト       | チャット送信と streaming 表示       | API key 設定済み          | 1. メッセージ入力 2. 送信ボタンクリック 3. streaming 完了待ち     | パルスカーソル表示 -> 完了メッセージ表示 -> メッセージ一覧に追加 |
| TC-11-02     | エラーテスト     | API key 未設定時の blocked 表示     | API key 未設定            | 1. ChatPanel を開く 2. blocked 表示確認 3. CTA クリック           | blocked ガイダンス + 「設定を開く」CTA -> Settings 画面遷移      |
| TC-11-03     | 機能テスト       | streaming キャンセルと content 保持 | API key 設定済み          | 1. メッセージ送信 2. streaming 中に cancel クリック               | accumulated content 保持、composer 入力可能に復帰                |
| TC-11-04     | 機能テスト       | terminal handoff                    | terminal surface 利用可能 | 1. Terminal ボタンクリック 2. TerminalDock 表示確認               | TerminalDock が表示される                                        |
| TC-11-05     | 機能テスト       | capability 切替                     | 各 capability 状態を再現  | 1. integratedRuntime 確認 2. terminalSurface 確認 3. both 4. none | 各 capability に応じた RuntimeBanner と empty state が表示される |
| TC-11-06     | アクセシビリティ | スクリーンリーダー / キーボード操作 | 任意                      | 1. Tab でフォーカス移動 2. Enter で送信 3. Escape でキャンセル    | フォーカス順序が正しい、キーボード操作で全機能にアクセス可能     |
| TC-11-07     | リグレッション   | 旧 placeholder API 削除確認         | DevTools コンソール       | 1. DevTools で placeholder data-testid 検索                       | model-selector-slot, message-list-slot, chat-input-slot が 0 件  |

## 画面カバレッジマトリクス

### 変更コンポーネント一覧

```bash
# Phase 5 で追加・変更されたコンポーネントファイルを特定
git diff main --name-only -- '*.tsx' '*.jsx' | grep -E '(components|views|pages)/'
```

| #   | コンポーネント             | 種別 | 配置ルート | 表示トリガー                |
| --- | -------------------------- | ---- | ---------- | --------------------------- |
| 1   | ChatPanel                  | 変更 | /chat      | 常時表示                    |
| 2   | RuntimeBanner              | 新規 | /chat      | 常時表示                    |
| 3   | ChatMessageList            | 新規 | /chat      | メッセージ存在時            |
| 4   | StreamingMessage           | 変更 | /chat      | streaming 中                |
| 5   | ErrorGuidance              | 新規 | /chat      | エラー発生時                |
| 6   | ComposerInput              | 新規 | /chat      | 常時表示                    |
| 7   | SendButton                 | 新規 | /chat      | 常時表示                    |
| 8   | HandoffBlock               | 新規 | /chat      | handoff 状態時              |
| 9   | PersistentTerminalLauncher | 新規 | /chat      | terminal surface 利用可能時 |

### UI 状態 x テーマ マトリクス

| テストケース | コンポーネント | 状態               | テーマ | ファイル名                               |
| ------------ | -------------- | ------------------ | ------ | ---------------------------------------- |
| TC-11-01a    | ChatPanel      | streaming          | light  | TC-11-01a-chatpanel-streaming-light.png  |
| TC-11-01b    | ChatPanel      | streaming          | dark   | TC-11-01b-chatpanel-streaming-dark.png   |
| TC-11-02a    | ChatPanel      | blocked            | light  | TC-11-02a-chatpanel-blocked-light.png    |
| TC-11-03a    | ChatPanel      | cancelled          | light  | TC-11-03a-chatpanel-cancelled-light.png  |
| TC-11-04a    | ChatPanel      | terminal handoff   | light  | TC-11-04a-chatpanel-handoff-light.png    |
| TC-11-05a    | ChatPanel      | empty (integrated) | light  | TC-11-05a-chatpanel-empty-integrated.png |
| TC-11-05b    | ChatPanel      | empty (terminal)   | light  | TC-11-05b-chatpanel-empty-terminal.png   |
| TC-11-05c    | ChatPanel      | empty (none)       | light  | TC-11-05c-chatpanel-empty-none.png       |

### Screenshot 契約

- **UX-03**: ChatPanel - empty / streaming / terminal handoff の 3 スクリーンショット
- **P53 対策**: CLI 環境では `webContents.capturePage()` スクリプト化、または Playwright `page.screenshot()` で取得する

### 撮影コマンド

```bash
# 推奨: 撮影計画から一括撮影
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring \
  --plan outputs/phase-11/screenshot-plan.json
```

### 撮影不可時の代替（P53）

CLI 環境で Electron を起動できない場合:

1. `outputs/phase-11/screenshots/NOTE.txt` に理由を記載
2. DevTools ログまたはテスト実行結果をエビデンスとして記録
3. 自動テスト結果を「間接的な視覚検証」として代替記録する

## 参照資料

| 参照資料                 | パス                                                                     | 内容                                                |
| ------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------- |
| Phase 1（要件定義）      | `phase-1-requirements.md`                                                | FR/NFR 分類、受入基準                               |
| Phase 2（設計）          | `phase-2-design.md`                                                      | UX 設計、コンポーネント階層、状態別 UI 表示         |
| Phase 3（設計レビュー）  | `phase-3-design-review.md`                                               | レビュー観点の判定結果                              |
| Phase 10（最終レビュー） | `phase-10-final-review.md`                                               | 最終レビュー報告                                    |
| code research            | `outputs/code-research-report.md`                                        | ChatPanel 画面構成図、状態遷移図                    |
| ChatPanel                | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                | テスト対象                                          |
| pack UI/UX 正本          | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md` | ChatPanel の empty / streaming / handoff 状態の正本 |
| pack UI/UX 図解          | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`    | 画面構成図、状態遷移図                              |

### システム仕様（aiworkflow-requirements）

| 参照資料                     | パス                                                                                            | 内容                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| ui-ux-feature-components     | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                 | ChatPanel 関連 UI 正本                                            |
| ui-ux-panels                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`                             | ChatPanel 統合パターンの正本                                      |
| workflow-ai-runtime-authmode | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | TC-11-05 capability切替シナリオの参照元                           |
| llm-workspace-chat-edit      | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                  | TC-11-04 terminal handoff手動テストの参照元                       |
| interfaces-llm               | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                           | LLMError型・LLMErrorCode定義の参照元（TC-11-06 a11y）             |
| api-ipc-system               | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                           | llm:stream-chat IPC契約の参照元（TC-11-01 チャット送信）          |
| llm-streaming                | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                            | ストリーミングチャンク形式の参照元（TC-11-02 ストリーミング表示） |

## 実行手順

### ステップ 1: 参照資料と Phase 2 UX 設計を確認する

Phase 2 の状態別 UI 表示テーブルと画面構成図を確認し、手動テストの期待結果を固定する。

### ステップ 2: テストケースを順に実行する

TC-11-01 から TC-11-07 を順に実行し、各テストケースの結果を記録する。

### ステップ 3: スクリーンショット撮影

画面カバレッジマトリクスに基づいて撮影を実行する。P53 対策として CLI 環境での代替手段を用意する。

### ステップ 4: 仕様照合チェックリスト

- [ ] レイアウトが Phase 2 設計書の画面構成図と一致
- [ ] カラーパレットが Apple HIG 準拠（`.claude/rules/01-architecture.md` 参照）
- [ ] スペーシングが 8px グリッドに従っている
- [ ] ダークモード / ライトモード両方で確認
- [ ] エラー状態の UI 表示が Phase 2 設計書と一致

### ステップ 5: 成果物と完了条件を確認する

手動テスト結果と撮影証跡を記録し、全テストケースが PASS であることを確認する。

## 統合テスト連携

手動統合テスト（UI/API 接続）を確認する:

| テスト項目         | 確認内容                                      | 期待結果                      |
| ------------------ | --------------------------------------------- | ----------------------------- |
| IPC 接続           | ChatPanel -> useStreamingChat -> Main Process | streaming 正常動作            |
| Selected config    | LLMSelectorPanel -> llm:set-selected-config   | provider/model 同期成功       |
| 会話永続化         | メッセージ送信 -> conversation:addMessage     | メッセージが永続化される      |
| エラーハンドリング | API key 削除 -> チャット送信                  | ErrorGuidance + Settings 誘導 |
| Terminal handoff   | Terminal ボタン -> TerminalDock               | TerminalDock 表示             |

## 多角的チェック観点

| 観点             | 適用 | チェック内容                                               |
| ---------------- | ---- | ---------------------------------------------------------- |
| UI/UX            | 該当 | 全 8 状態の UI 表示、empty state、error guidance、CTA 導線 |
| セキュリティ     | 該当 | P28 旧 API 削除確認、DevTools での API key 非表示確認      |
| アクセシビリティ | 該当 | キーボード操作、スクリーンリーダー対応、コントラスト比     |
| パフォーマンス   | 該当 | streaming 中のフレームレート、入力遅延                     |

**Electron デスクトップアプリ観点**:

| 層                         | 適用 | チェック内容                                   |
| -------------------------- | ---- | ---------------------------------------------- |
| フロントエンド（Renderer） | 該当 | 全コンポーネントの視覚確認、状態遷移の手動検証 |
| IPC 通信                   | 該当 | DevTools Network タブでの IPC 通信確認         |

## 成果物

| 成果物             | パス                                      | 必須 | 説明                         |
| ------------------ | ----------------------------------------- | ---- | ---------------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md`  | 必須 | 全 TC の結果記録             |
| 発見課題一覧       | `outputs/phase-11/discovered-issues.md`   | 必須 | 発見した課題（0 件でも出力） |
| 撮影計画           | `outputs/phase-11/screenshot-plan.json`   | 必須 | UI/UX 変更のため必須         |
| スクリーンショット | `outputs/phase-11/screenshots/`           | 必須 | 全 TC の証跡（P53 代替含む） |
| カバレッジレポート | `outputs/phase-11/screenshot-coverage.md` | 必須 | 画面カバレッジ算出結果       |

## 完了条件

- [ ] 全テストケース（TC-11-01 ~ TC-11-07）が実行済み
- [ ] 全テストケースが PASS
- [ ] チャット送信 -> streaming -> 完了のシナリオが正常動作
- [ ] エラーシナリオ（API key 未設定）で blocked 表示 + Settings 誘導が動作
- [ ] キャンセルシナリオで accumulated content が保持される
- [ ] terminal handoff で TerminalDock が表示される
- [ ] capability 4 値の切替で適切な RuntimeBanner と empty state が表示される
- [ ] キーボード操作（Enter/Escape/Tab）で全機能にアクセス可能
- [ ] 旧 placeholder API（model-selector-slot, message-list-slot, chat-input-slot）が 0 件
- [ ] UX-03 スクリーンショット契約（empty / streaming / terminal handoff）の証跡がある
- [ ] 画面カバレッジレポートの必須項目が 100%
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料と Phase 2 UX 設計の確認
2. Task 11-1: チャット送信シナリオ
3. Task 11-2: エラーシナリオ
4. Task 11-3: キャンセルシナリオ
5. Task 11-4: terminal handoff シナリオ
6. Task 11-5: capability 切替シナリオ
7. Task 11-6: アクセシビリティ確認
8. Task 11-7: 旧 API 削除確認
9. スクリーンショット撮影と証跡整理
10. 成果物の作成・配置
11. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスク（Task 11-1 ~ 11-7）を 100% 実行完了
- [ ] 全テストケースの結果が手動テスト結果に記録されている
- [ ] 画面カバレッジレポートが作成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring --phase 11

# スクリーンショットカバレッジ検証
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-seq-task-05-chatpanel-real-chat-wiring
```

## 次のPhase

- [Phase 12（ドキュメント）](./phase-12-documentation.md) に進む
