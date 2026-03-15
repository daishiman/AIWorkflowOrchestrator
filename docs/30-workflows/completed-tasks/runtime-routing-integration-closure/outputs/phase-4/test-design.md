# Phase 4 成果物: テスト設計書

## テストケース一覧

### 1. RuntimeResolver 単体テスト

**ファイル**: `apps/desktop/src/main/services/runtime/__tests__/RuntimeResolver.test.ts`

| #   | テストケース                       | 前提条件                                              | 期待結果                                                                |
| --- | ---------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | authMode=api-key かつ API Key 存在 | getMode()="api-key", hasKey()=true, getKey()="sk-xxx" | `{ type: "integrated" }`                                                |
| 2   | authMode=subscription              | getMode()="subscription"                              | `{ type: "handoff", reason: "subscription mode: use Claude Code CLI" }` |
| 3   | authMode=api-key かつ hasKey=false | getMode()="api-key", hasKey()=false                   | `{ type: "handoff", reason: "API key not configured" }`                 |
| 4   | authMode=api-key かつ getKey=null  | getMode()="api-key", hasKey()=true, getKey()=null     | `{ type: "handoff", reason: "API key unavailable" }`                    |
| 5   | 複数回呼び出し                     | 2回連続呼び出し                                       | 毎回 Service を参照（キャッシュしない）                                 |

### 2. skillHandlers runtime テスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.runtime.test.ts`

| #   | テストケース                              | 前提条件                    | 期待結果                 |
| --- | ----------------------------------------- | --------------------------- | ------------------------ |
| 1   | RuntimeResolver integrated → 既存フロー   | resolve() → integrated      | execute フローが呼ばれる |
| 2   | RuntimeResolver handoff → HandoffGuidance | resolve() → handoff         | HandoffGuidance 応答返却 |
| 3   | RuntimeResolver 未注入 → 後方互換         | runtimeResolver = undefined | 既存フロー維持           |

### 3. agentHandlers runtime テスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`

| #   | テストケース                              | 前提条件               | 期待結果                 |
| --- | ----------------------------------------- | ---------------------- | ------------------------ |
| 1   | RuntimeResolver integrated → 既存フロー   | resolve() → integrated | start フローが呼ばれる   |
| 2   | RuntimeResolver handoff → HandoffGuidance | resolve() → handoff    | HandoffGuidance 応答返却 |

### 4. TerminalHandoffCard テスト

**ファイル**: `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/__tests__/TerminalHandoffCard.test.tsx`

| #   | テストケース                               | 前提条件                     | 期待結果                      |
| --- | ------------------------------------------ | ---------------------------- | ----------------------------- |
| 1   | guidance.reason の表示                     | reason="subscription mode"   | テキスト表示                  |
| 2   | guidance.terminalCommand の monospace 表示 | terminalCommand="claude ..." | monospace フォント表示        |
| 3   | guidance.contextSummary の表示             | contextSummary="skill=test"  | テキスト表示                  |
| 4   | コピーボタン                               | onCopyCommand mock           | コールバック呼び出し          |
| 5   | 閉じるボタン                               | onDismiss mock               | コールバック呼び出し          |
| 6   | ARIA 属性                                  | -                            | role="alert", aria-label 確認 |

注意: P39 対策で `fireEvent` を使用（`userEvent` 禁止）

### 5. useSkillExecution runtime テスト

**ファイル**: `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.runtime.test.ts`

| #   | テストケース                     | 前提条件                       | 期待結果                            |
| --- | -------------------------------- | ------------------------------ | ----------------------------------- |
| 1   | authMode=api-key で execute      | Store: authMode="api-key"      | 既存 IPC execute チャンネル呼び出し |
| 2   | authMode=subscription で handoff | Store: authMode="subscription" | handoffGuidance が Store に設定     |
| 3   | handoff 結果の Store 保存        | subscription モード実行        | setHandoffGuidance 呼び出し         |

### 6. useAgent runtime テスト

**ファイル**: `apps/desktop/src/renderer/hooks/__tests__/useAgent.runtime.test.ts`

| #   | テストケース                     | 前提条件                       | 期待結果                        |
| --- | -------------------------------- | ------------------------------ | ------------------------------- |
| 1   | authMode=api-key で query        | Store: authMode="api-key"      | 既存 agentAPI.query 呼び出し    |
| 2   | authMode=subscription で handoff | Store: authMode="subscription" | handoffGuidance が Store に設定 |

### 7. agentSlice handoff 状態テスト

**ファイル**: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.handoff.test.ts`

| #   | テストケース                | 前提条件                     | 期待結果               |
| --- | --------------------------- | ---------------------------- | ---------------------- |
| 1   | setHandoffGuidance          | HandoffGuidance オブジェクト | Store に保存           |
| 2   | clearHandoffGuidance        | guidance 設定済み            | null にリセット        |
| 3   | 初期状態                    | Store 初期化                 | handoffGuidance = null |
| 4   | useHandoffGuidance セレクタ | guidance 設定済み            | guidance を返す        |

## 統合テストシナリオ

### E2E シナリオ 1: subscription モードの handoff フロー

```
1. Renderer: authMode を "subscription" に設定
2. Renderer: useSkillExecution.execute("prompt") を呼び出し
3. Preload: IPC invoke で skill:execute を Main Process に送信
4. Main: RuntimeResolver.resolve() → { type: "handoff", reason: "subscription mode" }
5. Main: HandoffGuidance を生成して IPC 応答として返却
   - terminalCommand: 'claude "prompt"'
   - contextSummary: "skill=skillName"
   - reason: "subscription mode: use Claude Code CLI"
6. Renderer: IPC 応答から handoff=true を検出
7. Renderer: setHandoffGuidance(guidance) で Store に保存
8. Renderer: TerminalHandoffCard が handoffGuidance を表示
9. User: コピーボタンクリック → clipboard にコマンドコピー
10. User: 閉じるボタン → clearHandoffGuidance() → カード非表示
```

### E2E シナリオ 2: api-key モードの integrated フロー

```
1. Renderer: authMode を "api-key" に設定
2. Renderer: API Key preflight チェック → 成功
3. Renderer: useSkillExecution.execute("prompt") を呼び出し
4. Preload: IPC invoke で skill:execute を Main Process に送信
5. Main: RuntimeResolver.resolve() → { type: "integrated" }
6. Main: 既存の SkillExecutor.execute() フローを実行
7. Main: ストリーミングレスポンスを Renderer に送信
8. Renderer: 既存の execute response 処理が動作
9. Renderer: TerminalHandoffCard は表示されない（handoffGuidance = null）
```

### E2E シナリオ 3: Agent 実行の handoff フロー

```
1. Renderer: authMode を "subscription" に設定
2. Renderer: useAgent.query("prompt") を呼び出し
3. Preload: IPC invoke で agent:start を Main Process に送信
4. Main: RuntimeResolver.resolve() → { type: "handoff" }
5. Main: HandoffGuidance を生成して IPC 応答として返却
6. Renderer: setHandoffGuidance(guidance) で Store に保存
7. Renderer: TerminalHandoffCard が表示される
```

## テスト品質基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## Pitfall 対策チェックリスト

| Pitfall | 対策                             | テストでの適用                      |
| ------- | -------------------------------- | ----------------------------------- |
| P9      | beforeEach でモックリセット      | 全テストファイルで適用              |
| P31     | 個別セレクタ使用                 | useAuthMode(), useHandoffGuidance() |
| P39     | fireEvent 使用（userEvent 禁止） | TerminalHandoffCard テスト          |
| P42     | 3段バリデーション                | skillHandlers テスト                |
| P48     | useShallow（該当なし）           | handoffGuidance は単一オブジェクト  |
