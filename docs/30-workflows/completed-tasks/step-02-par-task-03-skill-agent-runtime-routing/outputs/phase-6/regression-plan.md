# Phase 6 回帰計画

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001                   |
| Phase      | 6                                                          |
| 成果物種別 | 回帰計画                                                   |
| 作成日     | 2026-03-14                                                 |
| ステータス | completed                                                  |
| 前提       | Phase 5 実装計画（outputs/phase-5/implementation-plan.md） |
| 後続       | Phase 7 カバレッジ計画                                     |

---

## 回帰目的

Phase 5 の実装（RuntimePolicyResolver 導入・SkillExecutor/AgentExecutor への RuntimeDecision パラメータ追加・SkillCreatorService 新規実装）により、以下の既存保証が損なわれていないことを確認する。

- permission dialog の表示・許可・拒否フロー
- PermissionStore によるツール許可永続化
- abort() によるストリーミング中断
- タイムアウト後の execution state 遷移
- streaming completion 後の execution state 遷移
- SkillCreatorService の Improver → Executor handoff 連鎖
- auth-mode 切替後のルーティング再決定

Phase 4 で定義した TC-4-01〜TC-4-15 のうち、回帰性が特に重要な TC を本 Phase で重点的に再確認・拡充する。

---

## 1. execute 回帰テスト

### 1-1. permission remember 回帰

| テストID | 対象                            | テスト内容                                                                              | 期待結果                                                                                                                                                                                        | 参照TC  |
| -------- | ------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| REG-6-01 | SkillExecutor / PermissionStore | permission remember 後、同一ツールへの 2 回目の execute でダイアログが IPC 送信されない | `permissionStore.isToolAllowed(toolName)` が `true` を返す場合、`sendPermissionRequest()` が呼ばれないことを `expect(mockSend).not.toHaveBeenCalledWith(PERMISSION_REQUEST_CHANNEL)` で確認する | TC-4-14 |
| REG-6-02 | SkillExecutor / PermissionStore | rememberChoice=true で許可したツールが PermissionStore に保存される                     | `permissionStore.allowTool(toolName)` が 1 回だけ呼ばれ、`isToolAllowed(toolName)` が `true` を返す                                                                                             | TC-4-06 |

### 1-2. abort 回帰

| テストID | 対象          | テスト内容                                                                          | 期待結果                                                                                                                  | 参照TC  |
| -------- | ------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------- |
| REG-6-03 | SkillExecutor | `abort(executionId)` 後に AbortController がシグナルを発火し stream loop が終了する | `abort()` 呼び出し後、`for await` ループが `AbortError` でキャッチされて終了し、execution state が `"aborted"` に遷移する | TC-4-07 |
| REG-6-04 | SkillExecutor | abort 後の再実行で新しい executionId が生成される（EC-6-03）                        | `abort(executionId1)` 後に `execute()` を再呼び出しすると `executionId2 !== executionId1` であることを確認する            | EC-6-03 |

### 1-3. timeout 回帰

| テストID | 対象          | テスト内容                                                           | 期待結果                                                                                                                                                         | 参照EC  |
| -------- | ------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| REG-6-05 | SkillExecutor | 30 秒タイムアウト後に execution state が `"error"` になる（EC-6-04） | `vi.useFakeTimers()` + `advanceTimersByTime(30_000)` でタイムアウトを発火させ、`updateExecutionState(executionId, "error")` が呼ばれることを確認する（P13 準拠） | EC-6-04 |

### 1-4. streaming completion 回帰

| テストID | 対象          | テスト内容                                                 | 期待結果                                                                                                         | 参照TC  |
| -------- | ------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------- |
| REG-6-06 | SkillExecutor | streaming 完了後に execution state が `"completed"` になる | `for await` ループ完了後に `updateExecutionState(executionId, "completed")` が呼ばれることを確認する             | TC-4-15 |
| REG-6-07 | SkillExecutor | streaming メッセージが IPC 経由で Renderer に届く          | `mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message)` が各チャンク受信ごとに呼ばれることを確認する | TC-4-09 |

### 1-5. 同時実行上限 回帰

| テストID | 対象          | テスト内容                                                              | 期待結果                                                                                                                   | 参照EC  |
| -------- | ------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------- |
| REG-6-08 | SkillExecutor | 同時実行数が MAX_CONCURRENT（= 5）を超えた場合にエラーが返る（EC-6-05） | 6 つの `execute()` を同時に呼び出すと、6 番目が `{ success: false, error: { code: "CONCURRENCY_LIMIT_EXCEEDED" } }` を返す | EC-6-05 |

---

## 2. creator 回帰テスト

### 2-1. Improver → Executor handoff 回帰

| テストID | 対象                | テスト内容                                                              | 期待結果                                                                                                                          | 参照TC  |
| -------- | ------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------- |
| REG-6-09 | SkillCreatorService | Improver が改善後に Planner を経由せず直接 Executor に渡せる（EC-6-07） | `improve()` の戻り値を `execute()` に直接渡すと、`plan()` が呼ばれないことを `expect(mockPlan).not.toHaveBeenCalled()` で確認する | EC-6-07 |
| REG-6-10 | SkillCreatorService | Planner → Executor → Improver の 3 role 連鎖が正しく呼ばれる            | `plan()` → `execute()` → `improve()` の呼び出し順が InOrder mock で確認できる                                                     | TC-4-10 |

### 2-2. Creator terminal handoff 回帰

| テストID | 対象                | テスト内容                                                                    | 期待結果                                                                                                                                                     | 参照TC  |
| -------- | ------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| REG-6-11 | SkillCreatorService | `claude_code` モードで Creator の `execute()` が TerminalHandoffBundle を返す | `RuntimeDecision.type === "terminal_handoff"` が検出され、TerminalHandoffBundle が含まれた success レスポンスが返る                                          | TC-4-11 |
| REG-6-12 | SkillCreatorService | internal role 名（Planner/Executor/Improver）が IPC payload に露出しない      | `creator:plan` / `creator:execute` / `creator:improve` のレスポンスオブジェクトに `"Planner"` / `"Executor"` / `"Improver"` 文字列が含まれないことを確認する | TC-4-12 |

---

## 3. auth-mode 切替 回帰テスト

### 3-1. integrated_api ↔ claude_code 切替後の動作確認

| テストID | 対象                            | テスト内容                                                                                          | 期待結果                                                                                                                                        | 参照EC  |
| -------- | ------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| REG-6-13 | RuntimePolicyResolver           | `claude_code` → `integrated_api` に切替後、次回 `resolve()` が `"integrated_api"` を返す（EC-6-08） | `resolve("claude_code", apiKey)` が `terminal_handoff` を返した後、`resolve("integrated_api", apiKey)` が `integrated_api` を返すことを確認する | EC-6-08 |
| REG-6-14 | SkillExecutor / PermissionStore | auth-mode 切替後も PermissionStore のキャッシュが維持される（EC-6-01）                              | `integrated_api` → `claude_code` に切替えても `permissionStore.isToolAllowed(toolName)` の戻り値が変化しないことを確認する                      | EC-6-01 |
| REG-6-15 | SkillExecutor                   | streaming 中の auth-mode 変更は現在のストリームに影響しない（EC-6-02）                              | streaming 実行中に auth-mode を変更しても、進行中の stream loop が `AbortError` なしで完了し、次回 execute からのみ新 mode が反映される         | EC-6-02 |

---

## 4. IPC セキュリティ 回帰テスト

### 4-1. sender 検証・credential 非送信・P42 バリデーション

| テストID | 対象                        | テスト内容                                                                                           | 期待結果                                                                                                                        |
| -------- | --------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| REG-6-16 | creatorHandlers             | `validateIpcSender` が `creator:plan` / `creator:execute` / `creator:improve` の全ハンドラで呼ばれる | 各ハンドラで `validateIpcSender(event)` が 1 回呼ばれることを確認する                                                           |
| REG-6-17 | skill:execute / agent:query | `RuntimeDecision.apiKey` が Renderer 側 IPC payload に含まれない                                     | `mainWindow.webContents.send()` の引数オブジェクトに `apiKey` フィールドが存在しないことを確認する                              |
| REG-6-18 | creator:plan ハンドラ       | P42 3 段バリデーション（型チェック → 空文字列 → `.trim() === ""`）が `prompt` 引数に適用される       | `prompt = undefined`・`""`・`"   "` それぞれで `VALIDATION_ERROR` が返ることを確認する                                          |
| REG-6-19 | TerminalHandoffBuilder      | launcher が shell injection に安全か（EC-6-06）                                                      | `build()` に `;rm -rf /`・`$(evil)` を含む文字列を渡しても、`suggestedCommand` のシェルメタ文字がエスケープされることを確認する |

---

## 5. edge case 一覧

| EC-ID   | カテゴリ              | 内容                                                                                                                   | 対応テストID |
| ------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------ |
| EC-6-01 | PermissionStore       | permission remember 後に auth-mode を切替えた場合、PermissionStore のキャッシュは維持されるか                          | REG-6-14     |
| EC-6-02 | streaming / auth-mode | streaming 中に auth-mode が変わった場合の挙動（ストリームは維持。次回 execute から反映）                               | REG-6-15     |
| EC-6-03 | abort / executionId   | abort 後の再実行で新しい executionId が生成されるか                                                                    | REG-6-04     |
| EC-6-04 | timeout               | timeout（30 秒）後の execution state が `"error"` になるか                                                             | REG-6-05     |
| EC-6-05 | 同時実行              | 同時実行上限（MAX_CONCURRENT = 5）超過時のエラーが返るか                                                               | REG-6-08     |
| EC-6-06 | shell injection       | TerminalHandoffBundle の launcher が shell injection に安全か                                                          | REG-6-19     |
| EC-6-07 | Creator handoff       | Improver → 再 execute 時に Planner を経由せず直接 Executor に渡せるか                                                  | REG-6-09     |
| EC-6-08 | auth-mode 切替        | claude_code モードで RuntimePolicyResolver が handoff を返した後、integrated_api に切替えたら次回から SDK 実行になるか | REG-6-13     |

---

## 6. 確認順序

以下の順序で回帰テストを実施する。依存関係の低いものから実施し、失敗した場合は後続をブロックして原因を特定する。

```
Step 1: REG-6-01, REG-6-02 — permission remember 基本動作
   ↓
Step 2: REG-6-03, REG-6-04 — abort と executionId 再生成
   ↓
Step 3: REG-6-05 — タイムアウト（P13 準拠: advanceTimersByTime 使用）
   ↓
Step 4: REG-6-06, REG-6-07 — streaming completion と IPC 伝達
   ↓
Step 5: REG-6-08 — 同時実行上限
   ↓
Step 6: REG-6-09, REG-6-10, REG-6-11, REG-6-12 — Creator 3 role 連鎖
   ↓
Step 7: REG-6-13, REG-6-14, REG-6-15 — auth-mode 切替後の動作
   ↓
Step 8: REG-6-16, REG-6-17, REG-6-18, REG-6-19 — IPC セキュリティ
```

---

## 7. テスト実装上の注意事項

| 落とし穴 | 内容                                                                                                                          | 該当テストID        |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| P13      | `setTimeout` + `Promise` + 再スケジュールのパターンでは `runAllTimers` 系が無限ループする。`advanceTimersByTime` を使う       | REG-6-05            |
| P39      | happy-dom 環境では `userEvent` 禁止。`fireEvent` を使い、非同期ハンドラは `await act(async () => { fireEvent.xxx() })` で包む | Renderer 層全テスト |
| P40      | `cd apps/desktop && pnpm vitest run` で実行する。プロジェクトルートからの実行は config が読み込まれない                       | 全テスト            |
| P9       | テスト間で `PermissionStore` のモジュールスコープ変数がリークしないよう `beforeEach` でリセットする                           | REG-6-01, REG-6-02  |
| P42      | IPC ハンドラの全文字列引数に 3 段バリデーションを実装・確認する                                                               | REG-6-18            |

---

## 8. テストファイル配置

| ファイルパス（apps/desktop/src/ 配下）                                     | 対応テストID                 |
| -------------------------------------------------------------------------- | ---------------------------- |
| `main/services/skill/__tests__/SkillExecutor.regression.test.ts`           | REG-6-01〜REG-6-08           |
| `main/services/skill/__tests__/SkillCreatorService.regression.test.ts`     | REG-6-09〜REG-6-12           |
| `main/services/runtime/__tests__/RuntimePolicyResolver.regression.test.ts` | REG-6-13〜REG-6-15           |
| `main/ipc/__tests__/creatorHandlers.security.test.ts`                      | REG-6-16, REG-6-17, REG-6-18 |
| `main/services/runtime/__tests__/TerminalHandoffBuilder.security.test.ts`  | REG-6-19                     |

---

## 9. 完了条件

- [x] execute 回帰テスト（REG-6-01〜REG-6-08）が全て定義されている
- [x] creator 回帰テスト（REG-6-09〜REG-6-12）が全て定義されている
- [x] auth-mode 切替回帰テスト（REG-6-13〜REG-6-15）が全て定義されている
- [x] IPC セキュリティ回帰テスト（REG-6-16〜REG-6-19）が全て定義されている
- [x] edge case EC-6-01〜EC-6-08 が全て対応テストIDと紐付けられている
- [x] 確認順序（Step 1〜8）が記述されている
- [x] 落とし穴（P13/P39/P40/P9/P42）が記載されている
- [x] テストファイル配置が記載されている
