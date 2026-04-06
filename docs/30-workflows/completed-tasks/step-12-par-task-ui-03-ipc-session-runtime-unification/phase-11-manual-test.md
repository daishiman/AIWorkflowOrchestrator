# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 11                              |
| Phase名    | 手動テスト                      |
| 機能名     | ipc-session-runtime-unification |
| 対象機能   | TASK-UI-03 IPC 二重経路統合     |
| 前提Phase  | Phase 10: 最終レビュー          |
| 次Phase    | Phase 12: ドキュメント更新      |
| ステータス | pending                         |
| 作成日     | 2026-04-06                      |

## 目的

IPC 統合後の動作確認をデスクトップアプリ上で手動実行し、自動テストでは検出できない通信上の問題を観測する。

## 実行タスク

### Task 1: Session IPC 動作確認

- 手順 1: デスクトップアプリを起動する
- 手順 2: SkillCreatorConversationPanel を開く
- 手順 3: `startSession` でセッションを開始する
- 手順 4: `onQuestion` で質問を受信できることを確認する
- 手順 5: `sendAnswer` で回答を送信できることを確認する

### Task 2: Runtime IPC 動作確認

- 手順 1: SkillLifecyclePanel を開く
- 手順 2: `planSkill` でスキル計画を作成できることを確認する
- 手順 3: `executePlan` で計画を実行できることを確認する
- 手順 4: `getWorkflowState` でワークフロー状態を取得できることを確認する
- 手順 5: `onWorkflowStateChanged` で状態変更通知を受信できることを確認する
- 手順 6: `submitUserInput` でユーザー入力を送信できることを確認する
- 手順 7: `listSessions` でセッション一覧が取得できることを確認する
- 手順 8: `getSessionDetail` でセッション詳細を取得できることを確認する
- 手順 9: `resumeSession` でセッションを再開できることを確認する
- 手順 10: `deleteSession` でセッションを削除できることを確認する

### Task 3: 経路間の動作確認

- Session IPC と Runtime IPC を交互に使用して問題が発生しないことを確認する
- 同時並行で両経路の操作を行い競合が発生しないことを確認する
- エラー発生時に適切なエラーメッセージが表示されることを確認する

### Task 4: DevTools による IPC 通信監視

- DevTools の Console で IPC メッセージを監視する
- 統合後のチャネル名が正しく使用されていることを確認する
- 不要な IPC メッセージが送信されていないことを確認する
- エラーレスポンスのフォーマットが統一されていることを確認する

### Task 5: 非視覚証跡方針の定義

- 現時点は `NON_VISUAL` として PNG 証跡を要求しないことを記録する
- 実装完了後に再実施すべき手順を残す
- DevTools の Console ログで IPC 通信を間接的に検証する方針を定義する

## 参照資料

| 資料名               | パス                                            | 説明           |
| -------------------- | ----------------------------------------------- | -------------- |
| テスト拡充仕様       | `outputs/phase-6/test-expansion.md`             | 手動確認観点   |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`            | 退行確認の基準 |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`            | 変更内容の確認 |
| 品質保証結果         | `outputs/phase-9/qa-report.md`                  | 最終保証の参照 |
| 設計成果物           | `outputs/phase-2/design-document.md`            | 統合方針と設計 |
| 実装記録             | `outputs/phase-5/implementation-record.md`      | 実装内容       |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`       | 手動確認対象   |
| skill-creator-api    | `apps/desktop/src/preload/skill-creator-api.ts` | 操作対象       |
| creatorHandlers      | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | IPC 経路確認   |

## 適用判断

| タスク種別               | スクリーンショット | 判断基準                          |
| ------------------------ | ------------------ | --------------------------------- |
| IPC 通信の統合確認       | 推奨               | DevTools Console エビデンスとして |
| preload API surface 確認 | 不要               | UT で十分                         |
| 画面コンポーネントの動作 | 必須               | 視覚的な回帰検出に不可欠          |

## 統合テスト連携

- 手動テストは自動テストで代替しない観測点だけを扱う
- `manual-test-result.md` の status は workflow 進捗に合わせて更新する
- `manual-test-checklist.md` に TC-11-01〜TC-11-04 を固定し、`screenshot-plan.json` に NON_VISUAL 判定と placeholder PNG を 1 点だけ記録する
- 画面差分の証跡ではなく、validator 互換の補助証跡として `outputs/phase-11/screenshots/non-visual-placeholder.png` を保持する

## 成果物

| 成果物                   | パス                                        | 説明                              |
| ------------------------ | ------------------------------------------- | --------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | TC-11-01〜TC-11-04 の事前確認項目 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | Session/Runtime IPC 動作確認結果  |
| 証跡計画                 | `outputs/phase-11/screenshot-plan.json`     | NON_VISUAL 判定 / placeholder PNG |

## 画面カバレッジマトリクス

| TC-ID    | 確認観点              | 証跡                                                      |
| -------- | --------------------- | --------------------------------------------------------- |
| TC-11-01 | Session IPC 基本動作  | `outputs/phase-11/screenshots/non-visual-placeholder.png` |
| TC-11-02 | Runtime IPC 基本動作  | `outputs/phase-11/screenshots/non-visual-placeholder.png` |
| TC-11-03 | 経路分離と重複なし    | `outputs/phase-11/screenshots/non-visual-placeholder.png` |
| TC-11-04 | DevTools / 非視覚証跡 | `outputs/phase-11/screenshots/non-visual-placeholder.png` |

- 上記 PNG は実画面証跡ではなく、NON_VISUAL タスクであることを明示する placeholder である。
- MTC-01〜MTC-04 は上記 TC-11-01〜TC-11-04 に対応する内部ラベルとして扱う。

## 完了条件

- [ ] Session IPC の全チャネルが動作確認されている
- [ ] Runtime IPC の全チャネルが動作確認されている
- [ ] 経路間の相互干渉がないことが確認されている
- [ ] DevTools による IPC 通信監視が実施されている
- [ ] 非視覚証跡計画が存在する
- [ ] 実施可否と理由が記録されている
- [ ] Phase 12 へ渡す evidence 状態が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 12: ドキュメント更新](./phase-12-documentation.md)
