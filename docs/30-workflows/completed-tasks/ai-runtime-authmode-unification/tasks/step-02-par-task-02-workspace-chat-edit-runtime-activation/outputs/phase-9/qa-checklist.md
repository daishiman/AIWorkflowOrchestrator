# Phase 9 品質検証チェックリスト - Workspace Chat Edit AI runtime 有効化

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 9（品質検証）                               |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 作成日     | 2026-03-14                                  |
| 前提Phase  | Phase 5（実装）                             |
| 後続Phase  | Phase 10（最終レビュー）                    |
| ステータス | 確認中                                      |

---

## 品質 blocker 判定方針

| 分類             | blocker 扱い | 判定タイミング                                       |
| ---------------- | ------------ | ---------------------------------------------------- |
| セキュリティ確認 | blocker      | 全項目 PASS でないと Phase 10 へ進めない             |
| 契約整合確認     | blocker      | 全項目 PASS でないと Phase 10 へ進めない             |
| UX 確認          | MINOR        | 一部（マイクロコピー文言微調整等）は Phase 10 で判定 |

---

## 1. セキュリティ確認チェックリスト

### 1-1. path traversal 防止

| #    | 確認項目                                                                                               | テストケース  | 結果 |
| ---- | ------------------------------------------------------------------------------------------------------ | ------------- | ---- |
| S-01 | `..` を含むパスが `PERMISSION_DENIED` を返すこと                                                       | TC-WS-04      | [ ]  |
| S-02 | `//` を含むパスが `PERMISSION_DENIED` を返すこと                                                       | TC-WS-04 派生 | [ ]  |
| S-03 | 絶対パスでないパスが `PERMISSION_DENIED` を返すこと                                                    | TC-WS-04 派生 | [ ]  |
| S-04 | `sendWithContext` の `contexts[].filePath` にも path traversal チェックが適用されること（GAP-03 対応） | TC-SEND-07    | [ ]  |

確認コード（`chatEditHandlers.ts` 内の既実装パターン）:

```typescript
// ".." / "//" を含むパスを拒否する検証が sendWithContext にも追加されていること
if (
  args.contexts?.some(
    (ctx) => ctx.filePath.includes("..") || ctx.filePath.includes("//"),
  )
) {
  return {
    success: false,
    error: { code: "PERMISSION_DENIED", retryable: false, message: "..." },
  };
}
```

### 1-2. sender 検証

| #    | 確認項目                                                                       | テストケース | 結果 |
| ---- | ------------------------------------------------------------------------------ | ------------ | ---- |
| S-05 | 全 `chat-edit:*` チャンネルで `mainWindow` の `webContentsId` と照合されること | TC-PREL-03   | [ ]  |
| S-06 | 不正な sender から呼び出した場合に拒否されること                               | TC-PREL-03   | [ ]  |

確認コード（全ハンドラに以下パターンが存在することを確認）:

```typescript
validateIpcSender(event, { getAllowedWindows: () => [mainWindow] });
```

対象チャンネル一覧:

- `chat-edit:read-file`
- `chat-edit:write-file`
- `chat-edit:detect-language`
- `chat-edit:send-with-context`
- `chat-edit:stream-output`

### 1-3. secret masking

| #    | 確認項目                                                                                                      | テストケース | 結果 |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------------ | ---- |
| S-07 | API key が `sendWithContext` のエラーメッセージに含まれないこと                                               | TC-SEND-08   | [ ]  |
| S-08 | `guidance.terminalCommand` に API key が含まれないこと                                                        | TC-SEND-08   | [ ]  |
| S-09 | `guidance.contextSummary` にユーザーの認証情報が含まれないこと                                                | TC-SEND-08   | [ ]  |
| S-10 | ホームディレクトリパスがエラーメッセージでマスクされること（`sanitizeRegistrationErrorMessage` 実装済み確認） | TC-WS-07     | [ ]  |

`ACCESS_NOT_CONFIGURED` エラーメッセージの許容例・禁止例:

```
良い例: "API key is not configured for integrated mode"
禁止例: "API key sk-ant-xxxxxxxxx is invalid"  # キー値を含めてはならない
```

`guidance.terminalCommand` の許容例・禁止例:

```
良い例: "claude --workspace /path/to/project 'refactor selection'"
禁止例: "ANTHROPIC_API_KEY=sk-ant-xxx claude ..."  # API key を埋め込んではならない
```

### 1-4. contextBridge

| #    | 確認項目                                                                              | テストケース | 結果 |
| ---- | ------------------------------------------------------------------------------------- | ------------ | ---- |
| S-11 | `chatEditApi.ts` が `contextBridge.exposeInMainWorld` を使用していること（M-01 対応） | TC-PREL-01   | [ ]  |
| S-12 | `contextIsolation: true` 環境で `window.chatEditAPI` がアクセス可能であること         | TC-PREL-01   | [ ]  |

修正後の期待コード（`preload/chatEditApi.ts`）:

```typescript
// 修正前（直接代入 - 禁止）
(window as unknown as Record<string, unknown>).chatEditAPI = chatEditAPI;

// 修正後（contextBridge 経由 - 必須）
contextBridge.exposeInMainWorld("chatEditAPI", chatEditAPI);
```

---

## 2. UX 確認チェックリスト

### 2-1. missing credentials（API key 未設定）

| #    | 確認項目                                                                                       | 対応エラーコード        | 結果 |
| ---- | ---------------------------------------------------------------------------------------------- | ----------------------- | ---- |
| U-01 | API key 未設定時に「この画面では自動実行せず terminal で続ける」旨のメッセージが表示されること | `ACCESS_NOT_CONFIGURED` | [ ]  |
| U-02 | `guidance.terminalCommand` が handoff card に表示されること                                    | `ACCESS_NOT_CONFIGURED` | [ ]  |
| U-03 | handoff card の「terminal で続ける」CTA が有効（disabled でない）状態であること                | `ACCESS_NOT_CONFIGURED` | [ ]  |

### 2-2. timeout

| #    | 確認項目                                                                           | 対応エラーコード | 結果 |
| ---- | ---------------------------------------------------------------------------------- | ---------------- | ---- |
| U-04 | TIMEOUT エラー時に「応答がタイムアウトしました。再試行できます」旨が表示されること | `TIMEOUT`        | [ ]  |
| U-05 | `TIMEOUT` エラーが `retryable: true` であること                                    | `TIMEOUT`        | [ ]  |
| U-06 | 「編集案を生成」CTA が再試行可能状態に戻ること（disabled が解除されること）        | `TIMEOUT`        | [ ]  |

### 2-3. rate limit

| #    | 確認項目                                                                      | 対応エラーコード | 結果 |
| ---- | ----------------------------------------------------------------------------- | ---------------- | ---- |
| U-07 | RATE_LIMIT エラー時に「しばらくしてから再試行してください」旨が表示されること | `RATE_LIMIT`     | [ ]  |
| U-08 | `RATE_LIMIT` エラーが `retryable: true` であること                            | `RATE_LIMIT`     | [ ]  |

### 2-4. selection なし

| #    | 確認項目                                                                     | 対応エラーコード     | 結果 |
| ---- | ---------------------------------------------------------------------------- | -------------------- | ---- |
| U-09 | `selection` が `null` の場合「選択範囲を決めてから続ける」旨が表示されること | `SELECTION_REQUIRED` | [ ]  |
| U-10 | `selection === null` のとき「編集案を生成」CTA が `disabled` 状態であること  | `SELECTION_REQUIRED` | [ ]  |
| U-11 | `SELECTION_REQUIRED` エラーが `retryable: false` であること                  | `SELECTION_REQUIRED` | [ ]  |

### 2-5. handoff card のアクセシビリティ

| #    | 確認項目                                                                  | 基準        | 結果 |
| ---- | ------------------------------------------------------------------------- | ----------- | ---- |
| U-12 | keyboard だけで handoff card の「terminal で続ける」CTA に到達できること  | WCAG 2.1 AA | [ ]  |
| U-13 | handoff card の CTA に `aria-label` が設定されていること                  | WCAG 2.1 AA | [ ]  |
| U-14 | `aria-live="polite"` でエラー状態変化がスクリーンリーダーに通知されること | WCAG 2.1 AA | [ ]  |

---

## 3. 契約整合確認チェックリスト

### 3-1. IPC 契約

| #    | 確認項目                                                                                 | 参照箇所                | 結果 |
| ---- | ---------------------------------------------------------------------------------------- | ----------------------- | ---- |
| C-01 | `chat-edit:send-with-context` の引数型が Preload と Main で一致していること              | `contract-matrix.md §1` | [ ]  |
| C-02 | `SendWithContextResponse` に `handoff?: boolean` フィールドが追加されていること          | `contract-matrix.md §3` | [ ]  |
| C-03 | `SendWithContextResponse` に `guidance?: HandoffGuidance` フィールドが追加されていること | `contract-matrix.md §3` | [ ]  |
| C-04 | 新エラーコード `SELECTION_REQUIRED` が `types.ts` に定義されていること                   | `contract-matrix.md §4` | [ ]  |
| C-05 | 新エラーコード `ACCESS_NOT_CONFIGURED` が `types.ts` に定義されていること                | `contract-matrix.md §4` | [ ]  |
| C-06 | 新エラーコード `RATE_LIMIT` が `types.ts` に定義されていること                           | `contract-matrix.md §4` | [ ]  |
| C-07 | 新エラーコード `TIMEOUT` が `types.ts` に定義されていること                              | `contract-matrix.md §4` | [ ]  |
| C-08 | `CHAT_EDIT_CHANNELS` 定数と IPC 登録チャンネルが一致していること                         | `chatEditHandlers.ts`   | [ ]  |

### 3-2. workspacePath 制約

| #    | 確認項目                                                                                                      | 適用チャンネル                             | 結果 |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ---- |
| C-09 | `read-file`: `workspacePath` 制約が適用されていること（既実装・維持確認）                                     | `chat-edit:read-file`                      | [ ]  |
| C-10 | `write-file`: `workspacePath` 制約が適用されていること（既実装・維持確認）                                    | `chat-edit:write-file`                     | [ ]  |
| C-11 | `send-with-context`: `contexts` の全 `filePath` に `workspacePath` 制約が適用されていること（新実装・GAP-03） | `chat-edit:send-with-context`              | [ ]  |
| C-12 | terminal handoff 経路でも `workspacePath` 制約が適用されていること                                            | `chat-edit:send-with-context` handoff パス | [ ]  |

### 3-3. RuntimeResolver

| #    | 確認項目                                                                      | 期待戻り値                                             | 結果 |
| ---- | ----------------------------------------------------------------------------- | ------------------------------------------------------ | ---- |
| C-13 | `integrated` × API key あり → `integrated` adapter が返ること                 | `{ type: 'integrated', adapter }`                      | [ ]  |
| C-14 | `integrated` × API key なし → `handoff` が返ること                            | `{ type: 'handoff' }`                                  | [ ]  |
| C-15 | `terminal` × API key 任意 → `handoff` が返ること                              | `{ type: 'handoff' }`                                  | [ ]  |
| C-16 | `hybrid` × API key あり → `integrated` + `fallbackToHandoff: true` が返ること | `{ type: 'hybrid', adapter, fallbackToHandoff: true }` | [ ]  |
| C-17 | `hybrid` × API key なし → `handoff` が返ること                                | `{ type: 'handoff' }`                                  | [ ]  |

---

## 4. 品質 blocker 判定まとめ

### blocker 項目（全て PASS でないと Phase 10 へ進めない）

**セキュリティ確認（S-01 〜 S-12）**:

- [ ] S-01 〜 S-04: path traversal 防止（4件）
- [ ] S-05 〜 S-06: sender 検証（2件）
- [ ] S-07 〜 S-10: secret masking（4件）
- [ ] S-11 〜 S-12: contextBridge（2件）

**契約整合確認（C-01 〜 C-17）**:

- [ ] C-01 〜 C-08: IPC 契約（8件）
- [ ] C-09 〜 C-12: workspacePath 制約（4件）
- [ ] C-13 〜 C-17: RuntimeResolver（5件）

### MINOR 項目（Phase 10 で判定）

**UX 確認（U-01 〜 U-14）**:

- [ ] U-01 〜 U-03: missing credentials（3件）
- [ ] U-04 〜 U-06: timeout（3件）
- [ ] U-07 〜 U-08: rate limit（2件）
- [ ] U-09 〜 U-11: selection なし（3件）
- [ ] U-12 〜 U-14: handoff card アクセシビリティ（3件）

> UX 確認のうちマイクロコピーの文言微調整等は MINOR として記録し、Phase 10 最終レビューで判定する。
> ただし `retryable` フラグの誤り（U-05, U-08, U-11）はデータ契約に関わるため blocker として扱う。

---

## 5. 完了条件

- [ ] 品質 blocker 0 件（セキュリティ確認・契約整合確認の全項目が PASS）
- [ ] MINOR 項目は Phase 10 最終レビューに申し送り記録済み

---

## 次の Phase

[Phase 10（最終レビュー）](../../phase-10-final-review.md) に進む。
