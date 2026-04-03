# Phase 11: 手動テスト -- SDK Session Bridge 実装

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 11                       |
| 機能名     | sdk-session-bridge       |
| タスクID   | TASK-SDK-SC-01           |
| 作成日     | 2026-04-02               |
| 依存 Phase | Phase 10（最終レビュー） |

## 目的

自動テストでは検証しにくい実際の動作（SDK 呼び出し・IPC 通信・UI 連携）を手動で確認する。
このタスクは renderer surface の追加・変更を含まないため、Phase 11 の screenshot capture は不要である。
視覚証跡ではなく、SDK / IPC / ログの実行証跡を確認対象とする。

## 実行タスク

### Task 11-1: 事前準備

```bash
# 環境変数の確認
echo $ANTHROPIC_API_KEY  # 設定されていることを確認

# ビルド確認
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build
```

### Task 11-2: MT-01 — CLI で skill-creator を呼び出してインタビュー開始

**目的**: `SkillCreatorSdkSession` が正しく SDK を呼び出し、`skill-creator` スキルが UserInput を発行することを確認する。

**手順**:

1. Electron アプリを開発モードで起動する:

   ```bash
   pnpm --filter @repo/desktop dev
   ```

2. DevTools のコンソールから IPC を直接呼び出す:

   ```javascript
   // DevTools Console で実行
   window.electronAPI.skillCreatorSession.startSession(
     "新しいスキルを作りたい",
   );
   ```

3. DevTools の Network または IPC ログで `skill-creator:start-session` が送信されることを確認する

4. Main プロセスのログで `SkillCreatorSdkSession` が SDK `query()` を呼び出したことを確認する

**期待する結果**:

- [ ] Main プロセスのログで SDK `query()` が開始されたことが確認できる（例: skill-creator 実行ログ、SDK 側のログなど）
- [ ] 数秒後に `skill-creator:question-received` IPC イベントが Renderer に届く

### Task 11-3: MT-02 — Electron アプリでセッション開始・質問受信・回答送信フロー

**目的**: `SkillCreatorIpcBridge` が IPC メッセージを正しく中継し、End-to-End のフローが動作することを確認する。

**手順**:

1. Electron アプリを起動した状態で、DevTools コンソールから IPC イベントリスナーを設定する:

   ```javascript
   // DevTools Console で実行
   window.electronAPI.skillCreatorSession.onQuestion((question) => {
     console.log("Question received:", question);
   });
   window.electronAPI.skillCreatorSession.onComplete(({ result }) => {
     console.log("Session complete:", result);
   });
   window.electronAPI.skillCreatorSession.onError(({ error }) => {
     console.error("Session error:", error);
   });
   ```

2. セッションを開始する:

   ```javascript
   window.electronAPI.skillCreatorSession.startSession(
     "テスト用スキルを作りたい",
   );
   ```

3. `question-received` イベントを受信したら、回答を送信する:

   ```javascript
   // 受信した question の toolCallId を使って回答する
   window.electronAPI.skillCreatorSession.sendAnswer({
     toolCallId: "<受信した toolCallId>",
     value: "回答内容",
   });
   ```

4. 全質問に回答し、`session-complete` イベントが届くまで繰り返す

**期待する結果**:

- [ ] `skill-creator:question-received` イベントで `UserInputQuestion` が正しい形式（type / question / options）で届く
- [ ] 回答送信後に次の質問または完了イベントが届く
- [ ] `skill-creator:session-complete` イベントで `{ result: string }` が届く
- [ ] セッション全体を通じて API キーが DevTools のログに表示されない

### Task 11-4: MT-03 — タイムアウト動作確認

**目的**: 30秒間回答しない場合に `session-error` イベントが発行されることを確認する。

**手順**:

1. セッションを開始し、質問を受信する
2. 回答を送信せずに 31 秒待機する
3. `skill-creator:session-error` イベントが届くことを確認する

**期待する結果**:

- [ ] 30秒後に `skill-creator:session-error` イベントが届く
- [ ] エラーメッセージに "timeout" が含まれる
- [ ] タイムアウト後に新しいセッションを開始できる

### Task 11-5: MT-04 — エラーリカバリー確認

**目的**: セッションエラー後に正常なセッションを再開始できることを確認する。

**手順**:

1. 無効なリクエストでセッションを開始し、エラーを発生させる
2. `session-error` イベントを受信する
3. 正常なリクエストで新しいセッションを開始する

**期待する結果**:

- [ ] エラー後にセッション状態がリセットされる
- [ ] 新しいセッションが正常に開始できる

## 参照資料

| 資料名          | パス                                                                                 |
| --------------- | ------------------------------------------------------------------------------------ |
| Phase 5 実装    | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-5-implementation.md` |
| IpcBridge 実装  | `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`                    |
| SdkSession 実装 | `apps/desktop/src/main/services/runtime/SkillCreatorSdkSession.ts`                   |

## 成果物

| 成果物                       | パス                                                                                  | 形式     |
| ---------------------------- | ------------------------------------------------------------------------------------- | -------- |
| 手動テスト記録（本ファイル） | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/phase-11-manual-testing.md` | Markdown |

## 完了条件

- [ ] 事前準備（ビルド・API キー確認）を完了した
- [ ] MT-01（SDK 呼び出し確認）が PASS した
- [ ] MT-02（End-to-End フロー確認）が PASS した
- [ ] MT-03（タイムアウト動作確認）が PASS した
- [ ] MT-04（エラーリカバリー確認）が PASS した
- [ ] 全手動テストを通じて API キーがログに表示されないことを確認した

## 次の Phase

Phase 12: ドキュメント（`phase-12-documentation.md`）
