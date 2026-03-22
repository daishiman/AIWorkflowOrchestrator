# Phase 4: テストケース仕様 - Runtime Policy Centralization

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 作成日   | 2026-03-21                                 |
| 前提     | Phase 2 validation-matrix.md               |

---

## 1. Unit テストケース仕様

### 1-1. runtime 実行可否（Ownership 1-1）

| TC-ID   | テスト対象               | 入力                                         | 期待出力                                             | 対応 FR/AC  |
| ------- | ------------------------ | -------------------------------------------- | ---------------------------------------------------- | ----------- |
| U-1-001 | `resolve()`              | `authMode="api-key"`, `apiKey="sk-valid123"` | `{ type: "integrated_api", apiKey: "sk-valid123" }`  | FR-1, FR-2  |
| U-1-002 | `resolve()`              | `authMode="subscription"`, `apiKey=null`     | `{ type: "terminal_handoff", bundle: {...} }`        | FR-1, FR-2  |
| U-1-003 | `resolve()`              | `authMode="api-key"`, `apiKey=""`            | `{ type: "terminal_handoff" }`（空文字列は無効）     | FR-1, P42   |
| U-1-004 | `resolve()`              | `authMode="api-key"`, `apiKey="   "`         | `{ type: "terminal_handoff" }`（スペースのみは無効） | FR-1, P42   |
| U-1-005 | `resolve()`              | `authMode="api-key"`, `apiKey=null`          | `{ type: "terminal_handoff" }`（null は無効）        | FR-1        |
| U-1-006 | `resolve()` IPC sanitize | `integrated_api` の結果                      | IPC レスポンスに `apiKey` フィールドが含まれないこと | NFR-2, DD-2 |
| U-1-007 | `resolve()` IPC sanitize | `terminal_handoff` の結果                    | IPC レスポンスに `bundle` フィールドが含まれないこと | NFR-2, DD-2 |

### 1-2. health check（Ownership 1-2）

| TC-ID   | テスト対象             | 入力                  | 期待出力                                                                   | 対応 FR/AC |
| ------- | ---------------------- | --------------------- | -------------------------------------------------------------------------- | ---------- |
| U-2-001 | `llm:check-health`     | `providerId="openai"` | `HealthCheckResult { status, providerId, errorMessage, checkedAt }` を返す | FR-3, AC-2 |
| U-2-002 | `llm:check-health`     | `providerId="openai"` | `checkedAt` が現在時刻付近の Unix timestamp であること                     | FR-7       |
| U-2-003 | `AI_CHECK_CONNECTION`  | なし                  | `{ status: "disconnected" }` を固定返却すること（legacy 動作確認）         | FR-3       |
| U-2-004 | `HealthCheckResult` 型 | 任意                  | `status` が `"healthy"` / `"unhealthy"` / `"unknown"` のいずれかであること | FR-7       |

### 1-3. handoff bundle 構築（Ownership 1-3）

| TC-ID   | テスト対象           | 入力                                             | 期待出力                                                         | 対応 FR/AC |
| ------- | -------------------- | ------------------------------------------------ | ---------------------------------------------------------------- | ---------- |
| U-3-001 | `buildForSurface()`  | `surfaceType="agent"`, `prompt`, `cwd`, `reason` | `HandoffGuidance` の3必須フィールドが全て存在すること            | FR-6, AC-3 |
| U-3-002 | `buildForSurface()`  | `surfaceType="skill"`, `prompt`, `cwd`, `reason` | `contextSummary` に `surface=skill` が含まれること               | FR-6, AC-1 |
| U-3-003 | `buildForSurface()`  | `surfaceType="agent"`, `prompt`, `cwd`, `reason` | `contextSummary` に `surface=agent` が含まれること               | FR-6, AC-1 |
| U-3-004 | `buildForSurface()`  | `surfaceType="chat"`, `prompt`, `cwd`, `reason`  | `contextSummary` に `surface=chat` が含まれること                | FR-6       |
| U-3-005 | `buildForSurface()`  | `surfaceType="skill-creator"`                    | `contextSummary` に `surface=skill-creator` が含まれること       | FR-6       |
| U-3-006 | `buildForSurface()`  | 存在しない `surfaceType`                         | 型エラーまたは実行時エラーが返ること                             | FR-6       |
| U-3-007 | `HandoffGuidance` 型 | 任意                                             | `terminalCommand` / `contextSummary` / `reason` が全て string 型 | FR-6, AC-3 |

### 1-4. authMode 参照権限（Ownership 1-4）

| TC-ID   | テスト対象               | 入力                 | 期待出力                                                               | 対応 FR/AC |
| ------- | ------------------------ | -------------------- | ---------------------------------------------------------------------- | ---------- |
| U-4-001 | authMode 表示許容確認    | `authModeSlice.mode` | UI ラベル表示目的で `mode` を参照できること                            | FR-4       |
| U-4-002 | authMode 判定禁止確認    | Renderer コード      | `authMode` を参照して runtime 実行経路を分岐するコードが存在しないこと | FR-4, AC-1 |
| U-4-003 | `createFallbackStatus()` | fallback 状態生成後  | 生成した `isValid` を実行可否判定に流用していないこと                  | FR-4       |

---

## 2. Integration テストケース仕様

| TC-ID   | テスト対象                      | シナリオ                                                                                | 期待結果                                                              | 対応 FR/AC  |
| ------- | ------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------- |
| I-1-001 | AI Chat + RuntimePolicyResolver | AI Chat ハンドラーが `resolve()` を呼び出し、`integrated_api` の場合に LLM を実行する   | `resolve()` の戻り値に基づいて正しい経路が選択されること              | FR-1, AC-4  |
| I-1-002 | AI Chat + RuntimePolicyResolver | AI Chat ハンドラーが `resolve()` を呼び出し、`terminal_handoff` の場合に Handoff を返す | `HandoffGuidance` が IPC レスポンスに含まれること                     | FR-1, FR-6  |
| I-2-001 | Agent + RuntimePolicyResolver   | Agent ハンドラーが `resolve()` を呼び出し経路を決定する                                 | `integrated_api` / `terminal_handoff` の正しい分岐                    | FR-1, AC-4  |
| I-3-001 | Skill + RuntimePolicyResolver   | Skill ハンドラーが `resolve()` を呼び出し経路を決定する                                 | `integrated_api` / `terminal_handoff` の正しい分岐                    | FR-1, AC-4  |
| I-4-001 | IPC レスポンス sanitize         | `integrated_api` の IPC レスポンスを検証                                                | `apiKey` フィールドが含まれないこと                                   | NFR-2, AC-3 |
| I-4-002 | IPC レスポンス sanitize         | `terminal_handoff` の IPC レスポンスを検証                                              | `TerminalHandoffBundle` が含まれず `HandoffGuidance` のみ含まれること | NFR-2, AC-3 |
| I-5-001 | Chat -> Agent -> Skill 横断     | 3 surface を連続実行し、各 surface で `resolve()` が独立して呼ばれること                | 各 surface の `RuntimeDecision` が独立して生成されること              | FR-1, AC-4  |

---

## 3. Manual テストケース仕様

| TC-ID   | テスト対象                               | 確認方法                                                                                | 期待結果                                             | 対応 AC |
| ------- | ---------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------- |
| M-1-001 | `AI_CHECK_CONNECTION` 呼び出し元ゼロ確認 | `grep -rn "AI_CHECK_CONNECTION" apps/desktop/src/renderer/`                             | 0 件であること                                       | AC-2    |
| M-1-002 | `RuntimeResolver` 呼び出し元ゼロ確認     | `grep -rn "RuntimeResolver" apps/desktop/src/` （移行後）                               | 0 件であること（deprecated 後）                      | AC-1    |
| M-1-003 | `TerminalHandoffBundle` Renderer 未参照  | `grep -rn "TerminalHandoffBundle" apps/desktop/src/renderer/`                           | 0 件であること                                       | AC-3    |
| M-1-004 | `RuntimeResolution` Renderer 未参照      | `grep -rn "RuntimeResolution" apps/desktop/src/renderer/`                               | 0 件であること                                       | AC-3    |
| M-1-005 | authMode runtime 判定禁止                | `grep -rn "authMode.*=.*subscription\|authMode.*=.*api-key" apps/desktop/src/renderer/` | 0 件であること（実行可否判定目的の分岐が存在しない） | AC-1    |

---

## 4. 統合テスト連携

### Phase 4 で定義した Integration 観点の Phase 5 以降への引き継ぎ

- Unit テスト: `RuntimePolicyResolver` / `TerminalHandoffBuilder` の単体入出力検証は Phase 5 実装計画で test-first のスコープに含める
- Integration テスト: Chat -> Agent -> Skill の surface 横断シナリオは Phase 6 テスト拡充で回帰観点を追加する
- Manual テスト: grep ベースの静的確認は Phase 11 手動テスト計画で TC-ID と紐付ける
