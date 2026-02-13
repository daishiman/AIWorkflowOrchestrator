# Phase 4: テスト作成（TODO箇所のテスト実装仕様） - タスク仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 4                                                 |
| Phase名    | テスト作成（既存TODO箇所のテスト実装仕様策定）    |
| 前提Phase  | なし（テスト品質改善タスクのため Phase 1-3 省略） |
| 後続Phase  | Phase 5 (実装)                                    |
| ステータス | 未実施                                            |
| 作成日     | 2026-02-13                                        |
| 機能名     | sdk-test-enablement                               |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT                 |

---

## 目的

TASK-9B-I-SDK-FORMAL-INTEGRATION で SDK 統合が完了した後も、テストファイル内に `// TODO: SDK統合後に実装` として無効化されたまま残っている 17 箇所のテストケースの実装仕様を策定する。本 Phase では各テストケースの期待動作・モック方針・実装パターンを明確化し、Phase 5 での実装に向けた設計ドキュメントを作成する。

## 背景

TASK-9B-I（SDK正式統合）が完了し、Claude Agent SDK がプロジェクトに統合済みである。しかし、テストファイル内には SDK 統合前に「将来の統合後に有効化する」として意図的に無効化されたテストケースが 17 箇所残存している。これらは実際のテスト検証を行っておらず、テストカバレッジとテスト品質の両方を低下させている。

---

## 実行タスク

- テスト仕様化: TODO 17箇所の期待動作・モック方針・実装パターンを定義する
- 整合性確認: 既存テストとの重複・矛盾・モック干渉リスクを確認する
- 実装準備: Phase 5で迷わず実装できる粒度まで設計を具体化する

### Task 1: 17箇所のテストケース仕様策定

対象テストファイル 3 つに散在する 17 箇所の TODO テストケースについて、以下を定義する。

---

## 参照資料

| 参照資料               | パス                                                            | 内容                          |
| ---------------------- | --------------------------------------------------------------- | ----------------------------- |
| skill-executor テスト  | `apps/desktop/src/main/slide/__tests__/skill-executor.test.ts`  | TODO 5 箇所含むテストファイル |
| agent-client テスト    | `apps/desktop/src/main/slide/__tests__/agent-client.test.ts`    | TODO 9 箇所含むテストファイル |
| sdk-integration テスト | `apps/desktop/src/main/slide/__tests__/sdk-integration.test.ts` | TODO 3 箇所含むテストファイル |
| skill-executor 実装    | `apps/desktop/src/main/slide/skill-executor.ts`                 | テスト対象の実装              |
| agent-client 実装      | `apps/desktop/src/main/slide/agent-client.ts`                   | テスト対象の実装              |
| SDK 統合タスク成果物   | `docs/30-workflows/completed-tasks/` 配下の TASK-9B-I 関連      | SDK 統合の設計・実装結果      |

- 依存Phase成果物: `phase-1-requirements.md`, `phase-2-design.md`, `phase-3-design-review.md`

---

## テストケース仕様（17箇所）

### カテゴリ A: スキル名マッピング検証（2箇所）

#### A-1: SDK-SE-01（skill-executor.test.ts L416）

| 項目         | 内容                                                                                                                    |
| ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| テストID     | SDK-SE-01                                                                                                               |
| ファイル     | `skill-executor.test.ts` L416                                                                                           |
| TODOコメント | `// TODO: SDK統合後は以下を有効化`                                                                                      |
| テスト名     | `should call Agent SDK with correct skill name for '${phase}' phase`                                                    |
| 期待動作     | `mockAgentAPI.query` が各フェーズに対応するスキル名を含むプロンプトで呼び出されること                                   |
| 対象フェーズ | hearing → `hearing-facilitator`, structure → `structure-designer`, html → `html-generator`, modifier → `slide-modifier` |
| モック方針   | `mockAgentAPI.query` の呼び出し引数を `expect.objectContaining` で検証する                                              |
| 実装パターン | コメントアウトされた `expect(mockAgentAPI.query).toHaveBeenCalledWith(...)` を有効化                                    |
| 注意事項     | 4 つのフェーズ分のパラメタライズドテスト。各フェーズで正しいスキル名が渡されることを個別に検証                          |

#### A-2: SDK-SE-02（skill-executor.test.ts L437）

| 項目         | 内容                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------- |
| テストID     | SDK-SE-02                                                                                           |
| ファイル     | `skill-executor.test.ts` L437                                                                       |
| TODOコメント | `// TODO: SDK統合後は以下を有効化`                                                                  |
| テスト名     | `should pass projectPath as context to Agent SDK`                                                   |
| 期待動作     | `mockAgentAPI.query` の `options.systemPrompt` にカスタム `projectPath` が含まれること              |
| モック方針   | `mockAgentAPI.query` の呼び出し引数から `options.systemPrompt` を抽出して `stringContaining` で検証 |
| 実装パターン | コメントアウトされた `expect` を有効化し、`customProjectPath` が systemPrompt に含まれることを検証  |
| 注意事項     | projectPath がどの形式で systemPrompt に埋め込まれるか、実装側を確認する必要がある                  |

---

### カテゴリ B: タイムアウト検証（1箇所）

#### B-1: SDK-SE-05（skill-executor.test.ts L487）

| 項目         | 内容                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| テストID     | SDK-SE-05                                                                                                                             |
| ファイル     | `skill-executor.test.ts` L487                                                                                                         |
| TODOコメント | `// TODO: SDK統合後、実際の30秒タイムアウトをテスト`                                                                                  |
| テスト名     | `should handle SDK timeout error (30s)`                                                                                               |
| 期待動作     | 30 秒のタイムアウト後、`result.success === false` かつ `result.error` にタイムアウトメッセージが含まれること                          |
| モック方針   | `mockAgentAPI.query` を決して resolve しないモックに差し替え、`vi.advanceTimersByTimeAsync(30000)` でタイムアウトを発火               |
| 実装パターン | コメントアウトされたタイムアウトテストロジックを有効化。ただし SkillExecutor 内部のタイムアウト実装に依存するため、実装側の確認が必要 |
| 注意事項     | P13（タイマーテスト無限ループ）を回避するため `advanceTimersByTime` を使用し、`runAllTimers` は使わない                               |

---

### カテゴリ C: エラーハンドリング（4箇所）

#### C-1: SDK-SE-13（skill-executor.test.ts L623）

| 項目         | 内容                                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID     | SDK-SE-13                                                                                                                                                  |
| ファイル     | `skill-executor.test.ts` L623                                                                                                                              |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                                                                                 |
| テスト名     | `should handle API key not found error`                                                                                                                    |
| 期待動作     | API キーが未設定の場合、`result.success === false` かつ `result.error` に「API key」関連メッセージが含まれること                                           |
| モック方針   | `mockAgentAPI.query` を `mockRejectedValue(new Error('API key not configured'))` に設定                                                                    |
| 実装パターン | 現在の「成功を返す」テストを、API キーエラーを返すモックに変更。`expect(result.success).toBe(false)` と `expect(result.error).toContain('API key')` を追加 |
| 注意事項     | `agent-client.ts` の EDGE-AC-08 テストと整合性を保つ                                                                                                       |

#### C-2: SDK-SE-14（skill-executor.test.ts L636）

| 項目         | 内容                                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID     | SDK-SE-14                                                                                                                                       |
| ファイル     | `skill-executor.test.ts` L636                                                                                                                   |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                                                                      |
| テスト名     | `should handle SDK call failed error`                                                                                                           |
| 期待動作     | SDK 呼び出しが失敗した場合、`result.success === false` かつ `result.error` にエラーメッセージが含まれること                                     |
| モック方針   | `mockAgentAPI.query` を `mockRejectedValue(new Error('SDK call failed'))` に設定                                                                |
| 実装パターン | 現在の「成功を返す」テストを、SDK エラーを返すモックに変更。`expect(result.success).toBe(false)` と `expect(result.error).toBeDefined()` を追加 |
| 注意事項     | エラーメッセージのフォーマットは実装側の `catch` ブロックに依存                                                                                 |

#### C-3: AC-06（agent-client.test.ts L200）

| 項目         | 内容                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| テストID     | AC-06                                                                                                                              |
| ファイル     | `agent-client.test.ts` L200                                                                                                        |
| TODOコメント | `// TODO: SDK統合後、実際のAPIエラーをシミュレートする`                                                                            |
| テスト名     | `should reject with SDK error when API call fails`                                                                                 |
| 期待動作     | SDK の API 呼び出しが失敗した場合、Promise が reject され、エラーメッセージが適切であること                                        |
| モック方針   | `mockCreate.mockRejectedValue(new Error('SDK API error'))` を使用                                                                  |
| 実装パターン | 現在の「成功を返す」テストを、`mockCreate` でエラーを発生させるモックに変更。`await expect(queryPromise).rejects.toThrow()` で検証 |
| 注意事項     | `mockCreate` は `vi.hoisted` で定義済みのため、テスト内でモック動作を上書き可能                                                    |

#### C-4: INT-05（sdk-integration.test.ts L197）

| 項目         | 内容                                                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------------------------------- |
| テストID     | INT-05                                                                                                                     |
| ファイル     | `sdk-integration.test.ts` L197                                                                                             |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                                                 |
| テスト名     | `should display error message on SDK failure`                                                                              |
| 期待動作     | SDK 障害時に `result.success === false` かつ `result.error` にエラーメッセージが含まれること                               |
| モック方針   | `mockCreate.mockRejectedValue(new Error('SDK internal error'))` を使用して SDK 障害を再現                                  |
| 実装パターン | 現在のキャンセルシミュレーションを実際の SDK エラーモックに差し替え。`result.error` にエラーメッセージが含まれることを検証 |
| 注意事項     | `executor.cancel()` による疑似テストではなく、`mockCreate` のエラーモックで再現する                                        |

---

### カテゴリ D: 認証・APIキー管理（3箇所）

#### D-1: SDK-AC-01（agent-client.test.ts L525）

| 項目         | 内容                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| テストID     | SDK-AC-01                                                                                                                           |
| ファイル     | `agent-client.test.ts` L525                                                                                                         |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                                                          |
| テスト名     | `should retrieve API key from safeStorage`                                                                                          |
| 期待動作     | `safeStorage` から API キーが取得され、SDK クライアント初期化に使用されること                                                       |
| モック方針   | `electron` モジュールの `safeStorage.decryptString` モックが呼び出されることを検証。`electron-store` モックから暗号化キーを返す設定 |
| 実装パターン | safeStorage モックの `decryptString` 呼び出しを検証。`mockCreate` が API キー付きで呼ばれることを間接的に確認                       |
| 注意事項     | 既存の electron モックは `safeStorage` を含んでいる。`electron-store` の `get` モックで暗号化キーを返すように調整が必要             |

#### D-2: SDK-AC-02（agent-client.test.ts L539）

| 項目         | 内容                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| テストID     | SDK-AC-02                                                                                                           |
| ファイル     | `agent-client.test.ts` L539                                                                                         |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                                          |
| テスト名     | `should fallback to environment variable if safeStorage fails`                                                      |
| 期待動作     | safeStorage 取得が失敗した場合、`process.env.ANTHROPIC_API_KEY` にフォールバックすること                            |
| モック方針   | `electron-store` の `get` モックを `undefined` 返却に設定し、`process.env.ANTHROPIC_API_KEY` が使用されることを検証 |
| 実装パターン | safeStorage を無効にした状態で query 実行し、環境変数経由でSDKが正常動作することを検証                              |
| 注意事項     | `beforeEach` で `process.env.ANTHROPIC_API_KEY = 'test-api-key'` が設定済み                                         |

#### D-3: SDK-AC-03（agent-client.test.ts L553）

| 項目         | 内容                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| テストID     | SDK-AC-03                                                                                            |
| ファイル     | `agent-client.test.ts` L553                                                                          |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                           |
| テスト名     | `should throw error if API key not found`                                                            |
| 期待動作     | safeStorage と環境変数の両方が未設定の場合、`API key not configured` エラーが発生すること            |
| モック方針   | `delete process.env.ANTHROPIC_API_KEY` + `resetAgentAPI()` で API キー未設定状態を作成               |
| 実装パターン | EDGE-AC-08 テストと同じパターン: 環境変数削除 → resetAgentAPI → getAgentAPI → query で reject を検証 |
| 注意事項     | 既存の EDGE-AC-08 テストが同じシナリオを検証している。重複を避けるか、異なる観点を追加する           |

---

### カテゴリ E: リクエスト設定検証（3箇所）

#### E-1: SDK-AC-04（agent-client.test.ts L570）

| 項目         | 内容                                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------------------- |
| テストID     | SDK-AC-04                                                                                                |
| ファイル     | `agent-client.test.ts` L570                                                                              |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                               |
| テスト名     | `should use correct model (claude-sonnet-4-20250514)`                                                    |
| 期待動作     | `mockCreate` が `model: 'claude-sonnet-4-20250514'` パラメータで呼び出されること                         |
| モック方針   | `mockCreate` の呼び出し引数を `expect.objectContaining({ model: 'claude-sonnet-4-20250514' })` で検証    |
| 実装パターン | query 実行後に `expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: ... }))` を追加 |
| 注意事項     | モデル名は実装側のハードコードまたは設定値に依存。実装コードを確認して正確なモデル名を特定する必要がある |

#### E-2: SDK-AC-05（agent-client.test.ts L584）

| 項目         | 内容                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| テストID     | SDK-AC-05                                                                                                      |
| ファイル     | `agent-client.test.ts` L584                                                                                    |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                                     |
| テスト名     | `should set max_tokens to 8192`                                                                                |
| 期待動作     | `mockCreate` が `max_tokens: 8192` パラメータで呼び出されること                                                |
| モック方針   | `mockCreate` の呼び出し引数を `expect.objectContaining({ max_tokens: 8192 })` で検証                           |
| 実装パターン | query 実行後に `expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ max_tokens: 8192 }))` を追加 |
| 注意事項     | 実装側の `max_tokens` 設定値を確認。値が異なる場合はテスト側を実装に合わせて調整                               |

#### E-3: SDK-AC-06（agent-client.test.ts L598）

| 項目         | 内容                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| テストID     | SDK-AC-06                                                                                                             |
| ファイル     | `agent-client.test.ts` L598                                                                                           |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                                            |
| テスト名     | `should pass systemPrompt to SDK`                                                                                     |
| 期待動作     | `mockCreate` が `system: 'You are a slide designer.'` パラメータで呼び出されること                                    |
| モック方針   | `mockCreate` の呼び出し引数を `expect.objectContaining({ system: expect.stringContaining('slide designer') })` で検証 |
| 実装パターン | query 実行後に `mockCreate` の呼び出し引数内の `system` フィールドを検証                                              |
| 注意事項     | systemPrompt がどのフィールド名で SDK に渡されるか（`system` or 他のフィールド名）を実装側で確認                      |

---

### カテゴリ F: HTTPエラーハンドリング（2箇所）

#### F-1: SDK-AC-09（agent-client.test.ts L643）

| 項目         | 内容                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| テストID     | SDK-AC-09                                                                                 |
| ファイル     | `agent-client.test.ts` L643                                                               |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                |
| テスト名     | `should handle SDK 401 Unauthorized error`                                                |
| 期待動作     | 401 エラー時に Promise が reject され、認証エラーメッセージが含まれること                 |
| モック方針   | `mockCreate.mockRejectedValue(Object.assign(new Error('Unauthorized'), { status: 401 }))` |
| 実装パターン | `mockCreate` で 401 エラーをモック → query 実行 → `rejects.toThrow` で検証                |
| 注意事項     | エラーオブジェクトに `status` プロパティを付与して HTTP ステータスコードを再現する        |

#### F-2: SDK-AC-10（agent-client.test.ts L657）

| 項目         | 内容                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| テストID     | SDK-AC-10                                                                                          |
| ファイル     | `agent-client.test.ts` L657                                                                        |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                         |
| テスト名     | `should handle SDK 500 Internal Server Error`                                                      |
| 期待動作     | 500 エラー時に Promise が reject され、サーバーエラーメッセージが含まれること                      |
| モック方針   | `mockCreate.mockRejectedValue(Object.assign(new Error('Internal Server Error'), { status: 500 }))` |
| 実装パターン | `mockCreate` で 500 エラーをモック → query 実行 → `rejects.toThrow` で検証                         |
| 注意事項     | 500 エラーは External Service Error（コード 3000-3999）に分類され、リトライ可能                    |

---

### カテゴリ G: SDK統合シナリオ（2箇所）

#### G-1: INT-02（sdk-integration.test.ts L137）

| 項目         | 内容                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID     | INT-02                                                                                                                                         |
| ファイル     | `sdk-integration.test.ts` L137                                                                                                                 |
| TODOコメント | `// TODO: SDK統合後に実装`                                                                                                                     |
| テスト名     | `should fail with invalid API key`                                                                                                             |
| 期待動作     | 無効な API キーで `result.success === false` かつ `result.error` に「API key」関連メッセージが含まれること                                     |
| モック方針   | `mockCreate.mockRejectedValue(Object.assign(new Error('Invalid API key'), { status: 401 }))` で認証失敗を再現                                  |
| 実装パターン | 現在の「成功を返す」テストを、`mockCreate` で 401 エラーを返すモックに変更。コメントアウトされた `expect(result.success).toBe(false)` を有効化 |
| 注意事項     | SkillExecutor レベルでのエラーハンドリングが正しく動作するか、AgentClient のエラーが意図どおりに伝播するかを検証                               |

#### G-2: SDK-INT-01（sdk-integration.test.ts L451）

| 項目         | 内容                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| テストID     | SDK-INT-01                                                                                                                |
| ファイル     | `sdk-integration.test.ts` L451                                                                                            |
| TODOコメント | `// TODO: SDK統合後、パラメータが正しく渡されることを検証`                                                                |
| テスト名     | `should execute skill with correct SDK parameters`                                                                        |
| 期待動作     | `mockCreate` が正しいモデル名・max_tokens・system パラメータで呼び出されること                                            |
| モック方針   | `mockCreate` の呼び出し引数を `expect.objectContaining` で検証。モデル・max_tokens・prompt を包括的にチェック             |
| 実装パターン | query 実行後に `expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ model: ..., max_tokens: ... }))` を追加 |
| 注意事項     | 統合テストレベルでの検証のため、SkillExecutor → AgentClient → mockCreate の呼び出しチェーンを通して検証                   |

---

## 既存テストとの整合性確認

| 確認項目                                             | 対象テスト                       | 確認内容                                            |
| ---------------------------------------------------- | -------------------------------- | --------------------------------------------------- |
| EDGE-AC-08 と SDK-AC-03 の重複回避                   | agent-client.test.ts             | 同じシナリオを異なる describe で2回検証していないか |
| SDK-SE-13/14 と INT-05 のエラーモック整合性          | skill-executor / sdk-integration | 同じエラーパターンを異なるレベルで検証              |
| SDK-AC-04/05/06 と SDK-INT-01 のパラメータ検証整合性 | agent-client / sdk-integration   | 同じパラメータを単体・統合の両方で検証              |
| mockCreate と mockAgentAPI の使い分け                | 全テストファイル                 | 各ファイルのモックパターンに従った実装              |

---

## カテゴリ別サマリ

| カテゴリ                  | 箇所数 | テストID                            | ファイル        |
| ------------------------- | ------ | ----------------------------------- | --------------- |
| A. スキル名マッピング検証 | 2      | SDK-SE-01, SDK-SE-02                | skill-executor  |
| B. タイムアウト検証       | 1      | SDK-SE-05                           | skill-executor  |
| C. エラーハンドリング     | 4      | SDK-SE-13, SDK-SE-14, AC-06, INT-05 | 全3ファイル     |
| D. 認証・APIキー管理      | 3      | SDK-AC-01, SDK-AC-02, SDK-AC-03     | agent-client    |
| E. リクエスト設定検証     | 3      | SDK-AC-04, SDK-AC-05, SDK-AC-06     | agent-client    |
| F. HTTPエラーハンドリング | 2      | SDK-AC-09, SDK-AC-10                | agent-client    |
| G. SDK統合シナリオ        | 2      | INT-02, SDK-INT-01                  | sdk-integration |
| **合計**                  | **17** |                                     |                 |

---

## 成果物

| 成果物                 | パス                                                             | 内容                      |
| ---------------------- | ---------------------------------------------------------------- | ------------------------- |
| Phase 4 仕様書（本書） | `docs/30-workflows/sdk-test-enablement/phase-4-test-creation.md` | 17 箇所のテストケース仕様 |

---

## 統合テスト連携（Phase 1-11は必須）

- [ ] `sdk-integration.test.ts` の INT 系テスト（INT-02 / INT-05 / SDK-INT-01）が既存統合シナリオと矛盾しないことを確認
- [ ] 統合テスト観点で必要なモック前提（APIキー、HTTPエラー、タイムアウト）を Phase 5 実装手順へ反映
- [ ] 統合観点の確認結果を Phase 4 実行記録に残す

---

## 完了条件

- [ ] 17 箇所すべてのテストケース仕様が策定されている（テストID、テスト名、期待動作、モック方針、実装パターン）
- [ ] 7 カテゴリに分類され、各カテゴリの目的が明確である
- [ ] 既存テストとの整合性が確認されている（重複・矛盾がない）
- [ ] モックパターン（`mockCreate` / `mockAgentAPI` の使い分け）が各ファイルごとに明確である
- [ ] P13（タイマーテスト無限ループ）の回避方針が記載されている
- [ ] 本 Phase 内の全タスクを 100% 完了

---

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 本タスクでの適用判断                                      | 仕様参照先                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | APIキー・認証情報・エラー表示を扱うため適用               | `.claude/skills/aiworkflow-requirements/references/security-principles.md`, `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                                                                                      |
| インターフェース   | SkillExecutor と Agent SDK の接続仕様確認が必要なため適用 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`                                                                             |
| エラーハンドリング | timeout/API key not configured/SDK failure を扱うため適用 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                                                                                                                                         |
| テスト品質         | TODO有効化・回帰防止・カバレッジ判定が必要なため適用      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`, `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` |
| タスク運用         | 未タスク発生時の記録・追跡が必要なため適用                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成して進捗管理する。

1. 参照資料の確認
2. 実行タスクの実施（各タスクごと）
3. 統合テスト連携の実施（Phase 1-11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] `artifacts.json` が更新されている
- [ ] Phase末端アクションで完了を明記している

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: TASK-9B-I-SDK-FORMAL-INTEGRATION が完了していること（完了済み）
- **後続**: Phase 5 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### テストケース仕様策定結果

- 策定済みテストケース数: {{数}}/17
- カテゴリ数: 7

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/sdk-test-enablement/phase-5-implementation.md`
