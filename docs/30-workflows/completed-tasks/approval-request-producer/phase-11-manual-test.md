# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 11                        |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

Phase 10（最終レビューゲート）PASS 後に、実際の Electron アプリを起動して危険コマンドが Claude CLI スクリプト経由で送信された際に Approval Sheet（承認 UI）が Renderer に表示されることを確認する。自動テストが NON_VISUAL であるのに対し、本 Phase では runtime evidence（実発火ログまたは IPC イベントキャプチャ）付きの動作確認を行う。

---

## 実行タスク

- アプリ起動: `pnpm --filter @repo/desktop dev` でアプリを起動する
- 危険コマンド送信: Claude CLI スクリプト経由で危険コマンドを含む入力を送信する
- Approval Sheet 表示確認: Renderer に承認 UI が表示されることを確認する
- 承認/拒否動作確認: Approval Sheet の承認・拒否ボタンの動作を確認する
- エビデンス記録: console.log または IPC イベントキャプチャを記録する

---

## 事前準備

### 前提条件

| 項目                                  | 要件                                             |
| ------------------------------------- | ------------------------------------------------ |
| Phase 10（最終レビューゲート）が PASS | 本 Phase 開始前に確認済みであること              |
| Electron アプリのビルド               | `pnpm --filter @repo/desktop build` が通ること   |
| 開発環境のネットワーク                | Claude API に接続できること（テスト用 API キー） |

---

## テスト手順

### Step 1: アプリ起動

```bash
# デスクトップアプリを開発モードで起動
pnpm --filter @repo/desktop dev
```

**確認事項**:

- Electron ウィンドウが正常に開く
- コンソールにエラーが表示されない
- IPC チャンネルが正常に初期化される（`registerApprovalHandlers` のログ確認）

---

### Step 2: Claude CLI スクリプト実行（危険コマンドを含む）

`DANGEROUS_PATTERNS.BASH_COMMANDS` に含まれる危険コマンドを Claude に実行させる。例:

```bash
# 例1: rm -rf に相当するパターン（実際のパターンは HooksFactory.ts を参照）
# アプリ内のチャットUIから、Claudeに以下のような指示を送信する:
# "以下のコマンドを実行してください: rm -rf /tmp/test"
```

**危険コマンドの例（テスト用）**:

危険コマンドパターンは `apps/desktop/src/main/services/agent/HooksFactory.ts` 内の `DANGEROUS_PATTERNS.BASH_COMMANDS` を参照すること。テスト時は実際に危険な操作が行われないよう、安全なディレクトリを対象にすること。

---

### Step 3: Approval Sheet 表示の確認

**期待される動作**:

1. Claude が危険コマンドを実行しようとした時点で `createPreToolUseHook()` が発火する
2. `pushApprovalRequest(this.mainWindow, {...})` が呼ばれ、IPC チャンネル `APPROVAL_REQUEST` を通じて Renderer へペイロードが送信される
3. Renderer の承認 UI（Approval Sheet）が表示される

**確認ポイント**:

| 確認項目                                     | 期待値                                                                |
| -------------------------------------------- | --------------------------------------------------------------------- |
| Approval Sheet が画面に表示される            | モーダルまたはサイドパネルとして表示                                  |
| `sessionId` がログに記録されている           | UUID 形式の文字列（実行セッションと一致）                             |
| `operationId` がログに記録されている         | UUID 形式の文字列（`uuidv4()` で生成）                                |
| `operationType` が表示・ログに記録されている | `"dangerous_bash_command"` または UI 上の表示文言                     |
| コマンドの説明が表示されている               | `description: "Dangerous command blocked: ${pattern}"` に相当する表示 |

---

### Step 4: 承認動作の確認

**承認（Approve）の場合**:

| 確認項目             | 期待値                                     |
| -------------------- | ------------------------------------------ |
| 承認ボタンを押す     | Approval Sheet が閉じる                    |
| Claude の処理が継続  | コマンド実行が試みられる（または別の制御） |
| IPC レスポンスのログ | 承認レスポンスが Main プロセスに届く       |

**拒否（Reject）の場合**:

| 確認項目             | 期待値                                        |
| -------------------- | --------------------------------------------- |
| 拒否ボタンを押す     | Approval Sheet が閉じる                       |
| Claude の処理が停止  | コマンドが実行されない                        |
| エラーメッセージ表示 | Claude に拒否を通知するメッセージが表示される |

---

### Step 5: エビデンス記録

手動テストの実施証拠として以下を記録する。

**エビデンス要件（NON_VISUAL → runtime evidence 昇格）**:

| エビデンス種別                    | 内容                                                                                  | 必須/任意 |
| --------------------------------- | ------------------------------------------------------------------------------------- | --------- |
| console.log キャプチャ            | `pushApprovalRequest` 呼び出し時のログ（`sessionId`, `operationId`, `operationType`） | 必須      |
| IPC イベントキャプチャ            | Electron DevTools の IPC ログ（`APPROVAL_REQUEST` チャンネルへの送信記録）            | 必須      |
| Approval Sheet スクリーンショット | Renderer に表示された承認 UI の画面キャプチャ                                         | 推奨      |

**console.log の確認方法**:

```bash
# Electron メインプロセスのログを標準出力で確認（dev モード起動時）
# ターミナルに出力される以下の形式のログを確認:
# [HooksFactory] pushApprovalRequest called: { sessionId: "...", operationId: "...", operationType: "dangerous_bash_command" }
```

---

## テスト結果記録

Phase 11 実施時に記入する。

| テストケース                             | 実施結果 | エビデンス                   |
| ---------------------------------------- | -------- | ---------------------------- |
| アプリ起動・IPC チャンネル初期化         | 要確認   | -                            |
| 危険コマンド送信後の Approval Sheet 表示 | 要確認   | console.log / IPC キャプチャ |
| Approval Sheet の承認動作                | 要確認   | -                            |
| Approval Sheet の拒否動作                | 要確認   | -                            |
| `mainWindow` 破棄後の例外なし（異常系）  | 要確認   | -                            |

---

## 既知の制限・注意事項

| 項目                           | 内容                                                                                            |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| 実際の危険コマンドは実行しない | テスト用の安全なパターン（`/tmp` 以下への `rm` と同種の操作）を使うか、モック環境で確認すること |
| `approvalGate` の動作          | 現段階では承認待ちの実装が未完成の場合、`return { proceed: false }` のみで動作する場合がある    |
| CI 環境では手動テスト不可      | 本 Phase は開発機の Electron 環境でのみ実施する                                                 |

---

## 参照資料

| 資料名                   | パス                                                   | 説明                            |
| ------------------------ | ------------------------------------------------------ | ------------------------------- |
| phase-2-design.md        | `./phase-2-design.md`                                  | IPC 4 層整合性・シーケンス図    |
| phase-10-final-review.md | `./phase-10-final-review.md`                           | 最終レビューゲート結果          |
| HooksFactory.ts          | `apps/desktop/src/main/services/agent/HooksFactory.ts` | 危険コマンド検出・producer 接続 |
| approvalHandlers.ts      | `apps/desktop/src/main/ipc/approvalHandlers.ts`        | `pushApprovalRequest()` 実装    |

---

## 成果物

| 成果物         | パス                      | 説明       |
| -------------- | ------------------------- | ---------- |
| 手動テスト記録 | `phase-11-manual-test.md` | 本ファイル |

---

## 完了条件

- [ ] アプリが正常に起動し、IPC チャンネルが初期化されている
- [ ] 危険コマンド送信後に Approval Sheet が Renderer に表示されることを確認した
- [ ] Approval Sheet の承認・拒否動作が期待通りであることを確認した
- [ ] runtime evidence（console.log または IPC イベントキャプチャ）が記録されている
- [ ] テスト結果が上記テスト結果記録テーブルに記入されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## Phase 12 開始条件

**Phase 12 への進行は本 Phase（手動テスト）の全テストケースが PASS 判定を得た後のみ許可される。**

| 条件                                | 状態   |
| ----------------------------------- | ------ |
| Approval Sheet 表示が確認されている | 要確認 |
| runtime evidence が記録されている   | 要確認 |
| 承認・拒否動作が確認されている      | 要確認 |

## 次の Phase

Phase 12: ドキュメント更新 → [phase-12-documentation.md](phase-12-documentation.md)

## 統合テスト連携

- Phase 12 へ current facts と検証結果を渡す
- Phase 13 が blocked のままであることを維持する
