# Phase 1 成果物: 要件定義書

## P50チェック結果

| 判定         | 条件                             | 結果                   |
| ------------ | -------------------------------- | ---------------------- |
| **部分実装** | chat-edit のみ適用、他パス未適用 | 通常の実装フローで進行 |

### 調査コマンド実行結果

```
grep -rn "RuntimeResolver" apps/desktop/src/
→ chat-edit/RuntimeResolver.ts, chatEditHandlers.ts, ipc/index.ts のみ

grep -rn "TerminalHandoffBuilder" apps/desktop/src/
→ chat-edit/TerminalHandoffBuilder.ts, chatEditHandlers.ts のみ

grep -rn "authMode|useAuthMode" apps/desktop/src/renderer/hooks/
→ マッチなし

grep -rn "TerminalHandoffCard|HandoffCard" apps/desktop/src/renderer/
→ マッチなし
```

## Gap 棚卸しマトリクス

| 実行パス            | RuntimeResolver 適用 | authMode 参照                         | Handoff UI                                  | Preflight 契約                                | Permission 契約             |
| ------------------- | -------------------- | ------------------------------------- | ------------------------------------------- | --------------------------------------------- | --------------------------- |
| SkillExecutor       | **未適用**           | **未参照**                            | **未実装**                                  | API key 存在チェックのみ（authMode 分岐なし） | PermissionResolver 実装済み |
| AgentExecutor       | **未適用**           | **未参照**                            | **未実装**                                  | **未実装**（API key チェックなし）            | PermissionResolver 実装済み |
| SkillCreatorService | **未適用**           | **未参照**                            | **未実装**                                  | **未実装**                                    | IPC ハンドラ経由            |
| chat-edit（参考）   | 適用済み（L175-191） | 適用済み（RuntimeResolver.resolve()） | guidance 生成済み（TerminalHandoffBuilder） | workspace パス検証済み                        | IPC sender 検証済み         |

## Gap 詳細分析

### GAP-1: SkillExecutor に RuntimeResolver が未適用

- **現状**: `SkillExecutor.callSDKQuery()` (L746-771) が `authKeyService.getKey()` で API キーを直接取得し、`query()` を呼び出す。authMode が "subscription" でも API キーがあれば実行してしまう
- **あるべき姿**: 実行前に `RuntimeResolver.resolve()` を呼び出し、`handoff` の場合は HandoffGuidance を返す
- **影響範囲**: `apps/desktop/src/main/services/skill/SkillExecutor.ts` L746-771

### GAP-2: AgentExecutor に RuntimeResolver が未適用

- **現状**: `AgentExecutor.start()` (L48-110) が `query()` を直接呼び出す。API キーの存在チェックすらない
- **あるべき姿**: 実行前に `RuntimeResolver.resolve()` を呼び出し、`handoff` の場合は HandoffGuidance を返す
- **影響範囲**: `apps/desktop/src/main/services/agent/AgentExecutor.ts` L48-110

### GAP-3: useSkillExecution が authMode を未参照

- **現状**: `useSkillExecution.execute()` (L124-180) が `preflightSkillExecutionAuth()` で API キー存在チェック後、`window.electronAPI.skill.execute()` を呼び出す。authMode 分岐なし
- **あるべき姿**: authMode を参照し、"subscription" の場合は IPC で handoff guidance を要求して TerminalHandoffCard を表示する
- **影響範囲**: `apps/desktop/src/renderer/hooks/useSkillExecution.ts` L124-180

### GAP-4: useAgent が authMode を未参照

- **現状**: `useAgent.query()` (L131-165) が `agentAPI.query()` を直接呼び出す。authMode 参照なし、preflight チェックなし
- **あるべき姿**: authMode を参照し、"subscription" の場合は IPC で handoff guidance を要求して TerminalHandoffCard を表示する
- **影響範囲**: `apps/desktop/src/renderer/hooks/useAgent.ts` L131-165

### GAP-5: TerminalHandoffCard が未実装

- **現状**: Renderer に handoff UI コンポーネントが存在しない。chat-edit は Main Process で HandoffGuidance を生成するが、Renderer での表示コンポーネントがない
- **あるべき姿**: `TerminalHandoffCard` コンポーネントが HandoffGuidance（terminalCommand, contextSummary, reason）を表示する
- **影響範囲**: `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/` (新規)

### GAP-6: Zustand Store に handoff 状態が未実装

- **現状**: agentSlice に handoffGuidance 状態がない
- **あるべき姿**: `handoffGuidance: HandoffGuidance | null` 状態と個別セレクタ `useHandoffGuidance()` が存在する
- **影響範囲**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

## 既存保証抽出

| 保証名                    | 契約内容                                                                                 | 対象実行パス                                                       | 維持必須 |
| ------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------- |
| API Key Preflight         | API キー存在を実行前に確認し、未設定時はエラーを返す                                     | SkillExecutor（skillExecutionAuthPreflight.ts）                    | はい     |
| Permission Dialog         | ツール実行前に PreToolUse Hook でセキュリティチェックし、危険コマンド/保護パスをブロック | SkillExecutor（createHooks FR-001/FR-002）                         | はい     |
| Permission Resolver       | Renderer からの permission 応答を待機し、approved/rejected を処理する                    | SkillExecutor / AgentExecutor                                      | はい     |
| Streaming Completion      | ストリーミング完了時に `type: "complete"` メッセージを送信する                           | SkillExecutor（L552-559）/ AgentExecutor（sendStatus "completed"） | はい     |
| IPC Sender Validation     | `validateIpcSender()` で送信元ウィンドウを検証する                                       | chatEditHandlers（全ハンドラ）                                     | はい     |
| Workspace Path Validation | `isAllowedPath()` でファイルパスがワークスペース外でないことを検証する                   | chatEditHandlers（send-with-context）                              | はい     |
| API Key Non-Exposure      | API キーを HandoffGuidance / TerminalCommand / ログに含めない                            | TerminalHandoffBuilder（セキュリティコメント L8）                  | はい     |

## 要件定義

### REQ-1: runtime routing 分岐（3パス）

RuntimeResolver を SkillExecutor / AgentExecutor / SkillCreatorService の3実行パスに適用し、authMode × API key の組み合わせから `integrated` / `handoff` を決定する。

**受入基準**:

- [ ] SkillExecutor の execute() 呼び出し前に RuntimeResolver.resolve() が実行される
- [ ] AgentExecutor の start() 呼び出し前に RuntimeResolver.resolve() が実行される
- [ ] SkillCreatorService の plan/execute/improve 呼び出し前に RuntimeResolver.resolve() が実行される
- [ ] resolve() の結果が `handoff` の場合、HandoffGuidance が Renderer に返される
- [ ] resolve() の結果が `integrated` の場合、既存の実行フローが維持される

### REQ-2: authMode 参照（Renderer Hook）

useSkillExecution / useAgent が authMode を参照し、実行前に runtime routing 分岐を行う。

**受入基準**:

- [ ] useSkillExecution が `useAuthMode()` 個別セレクタで authMode を取得する（P31 準拠）
- [ ] useAgent が `useAuthMode()` 個別セレクタで authMode を取得する（P31 準拠）
- [ ] authMode === "subscription" の場合、IPC で handoff guidance を要求する
- [ ] authMode === "api-key" の場合、既存の execute フローを実行する

### REQ-3: TerminalHandoffCard 表示

handoff 時に TerminalHandoffCard コンポーネントが CLI コマンド、コンテキストサマリー、理由を表示する。

**受入基準**:

- [ ] TerminalHandoffCard が HandoffGuidance の全3フィールドを表示する
- [ ] CLI コマンドが monospace フォントで表示される
- [ ] コピーボタンでコマンドがクリップボードにコピーされる
- [ ] 閉じるボタンでカードが非表示になる
- [ ] Apple HIG 準拠（角丸 8-12px、繊細なシャドウ）
- [ ] WCAG 2.1 AA 準拠（コントラスト比 4.5:1 以上）
- [ ] ライト/ダーク両モードで正常表示される

### REQ-4: preflight 契約維持

既存の API Key Preflight チェックが維持され、runtime routing 分岐の追加により既存の preflight が破壊されない。

**受入基準**:

- [ ] skillExecutionAuthPreflight.ts の API キー存在チェックが引き続き動作する
- [ ] runtime routing 分岐が preflight の後に実行される（preflight → routing → execute/handoff）
- [ ] preflight 失敗時は routing に進まずエラーを返す

### REQ-5: permission 契約維持

既存の Permission Dialog / PreToolUse / PostToolUse Hook が維持され、runtime routing 分岐の追加により既存の permission が破壊されない。

**受入基準**:

- [ ] SkillExecutor の PreToolUse / PostToolUse Hook が引き続き動作する
- [ ] AgentExecutor の HooksFactory が引き続き動作する
- [ ] permission 応答フローが変更されない

### REQ-6: streaming 契約維持

既存のストリーミング完了通知が維持され、runtime routing 分岐の追加により既存の streaming が破壊されない。

**受入基準**:

- [ ] SkillExecutor の `type: "complete"` メッセージが引き続き送信される
- [ ] AgentExecutor の `sendStatus("completed")` が引き続き動作する
- [ ] handoff の場合はストリーミングではなく HandoffGuidance を返す

### REQ-7: RuntimeResolver 共通化

RuntimeResolver を chat-edit ドメイン専用から共通サービスに再設計する。

**受入基準**:

- [ ] RuntimeResolver が `services/runtime/` に移動されている
- [ ] chat-edit ドメインへの依存（LLMAdapter / AnthropicLLMAdapter）が解除されている
- [ ] IAuthKeyService / IAuthModeService の DI が維持されている
- [ ] RuntimeResolution 型が変更されていない
- [ ] composition root で1回だけ生成され、全ハンドラに注入される（P5 準拠）

### REQ-8: Zustand Store handoff 状態管理

handoff 状態を Zustand Store で管理する。

**受入基準**:

- [ ] agentSlice に `handoffGuidance: HandoffGuidance | null` が追加されている
- [ ] 個別セレクタ `useHandoffGuidance()` が追加されている（P31 準拠）
- [ ] 派生セレクタが必要な場合は `useShallow` が適用されている（P48 準拠）

### REQ-9: API Key 非漏洩

API キーが TerminalHandoffCard、ログ、IPC メッセージに漏洩しない。

**受入基準**:

- [ ] HandoffGuidance の terminalCommand に API キーが含まれない
- [ ] TerminalHandoffCard の Props に API キーが含まれない
- [ ] console.log / console.error で API キーが出力されない

## system spec 整合確認

| 仕様書                        | 整合状況 | 備考                                                                                                 |
| ----------------------------- | -------- | ---------------------------------------------------------------------------------------------------- |
| interfaces-agent-sdk-executor | 整合     | execute 契約の error code に AUTHENTICATION_ERROR が存在、handoff 分岐の追加で新規 error code は不要 |
| interfaces-agent-sdk-skill    | 整合     | skill lifecycle に runtime routing 分岐を追加しても既存契約を破壊しない                              |
| security-skill-execution      | 整合     | API Key 非漏洩要件（REQ-9）が security-skill-execution.md の trust boundary と一致                   |
| arch-electron-services        | 整合     | RuntimeResolver の DI が composition root パターンに準拠                                             |
| arch-state-management         | 整合     | handoffGuidance の agentSlice 拡張が P31/P48 対策と一致                                              |
