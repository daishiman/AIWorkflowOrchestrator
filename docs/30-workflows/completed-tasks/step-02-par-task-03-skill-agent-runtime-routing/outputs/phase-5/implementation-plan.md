# Phase 5 実装計画

## メタ情報

| 項目       | 内容                                                                      |
| ---------- | ------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001                                  |
| Phase      | 5                                                                         |
| 成果物種別 | 実装計画                                                                  |
| 作成日     | 2026-03-14                                                                |
| ステータス | completed                                                                 |
| 前提       | Phase 2 設計サマリー、Phase 3 設計レビュー PASS、Phase 4 テストマトリクス |
| 後続       | Phase 6 回帰計画                                                          |

---

## 1. 実装の基本方針

本タスク（TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001）は **設計タスク** であるため、本 Phase 5 実装計画は、後続の実装担当者が順序を崩さずに着手できる **手順書** として機能する。

### 設計原則

- **後方互換維持**: `SkillExecutor.execute()` / `AgentExecutor.start()` の既存シグネチャは optional パラメータとして拡張し、既存の呼び出し元への破壊的変更を行わない
- **単一責務 (SRP)**: RuntimePolicyResolver は auth-mode と apiKey を受け取って RuntimeDecision を返すだけで、実行はしない
- **DI 原則 (P34 準拠)**: BrowserWindow に依存するコンポーネントは Setter Injection を使用する
- **P42 準拠**: IPC ハンドラの全文字列引数に 3 段バリデーション（型チェック → 空文字列 → `.trim() === ""`）を適用する
- **IPC 契約ドリフト防止 (P44/P45 準拠)**: ハンドラ引数名と実際に渡される値のセマンティクスを一致させる

---

## 2. 実装優先順位と順序

依存関係に基づき、下位レイヤ（shared utility）から上位レイヤ（UI / Hook）へ向かって積み上げる。

### P1（最優先）: コアルーティング基盤

#### Step 1: RuntimePolicyResolver の実装（新規）

| 項目     | 内容                                                                                 |
| -------- | ------------------------------------------------------------------------------------ |
| 目的     | auth-mode と apiKey を受け取り、実行経路を決定する shared utility を作成する         |
| 配置先   | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`                    |
| 依存     | なし（末端ユーティリティ）                                                           |
| 完了条件 | `resolve(authMode, apiKey): RuntimeDecision` が実装され、テスト TC-4-04 が PASS する |

定義する型:

| 型名                    | 定義                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| `RuntimeDecision`       | `{ type: "integrated_api"; apiKey: string } \| { type: "terminal_handoff"; bundle: TerminalHandoffBundle }`  |
| `TerminalHandoffBundle` | `{ launcher: string; promptBundle: string; cwd: string; suggestedCommand: string; manualRetryRule: string }` |
| `AuthMode`              | `"integrated_api" \| "claude_code"`（既存型を参照）                                                          |

ルーティングルール:

| 条件                                                       | `RuntimeDecision.type`           |
| ---------------------------------------------------------- | -------------------------------- |
| `authMode === "integrated_api"` かつ `apiKey` が非空文字列 | `"integrated_api"`               |
| `authMode === "claude_code"`                               | `"terminal_handoff"`             |
| `authMode === "integrated_api"` かつ `apiKey` が空/未設定  | `"terminal_handoff"`（fallback） |

#### Step 2: TerminalHandoffBuilder の実装（新規）

| 項目     | 内容                                                                  |
| -------- | --------------------------------------------------------------------- |
| 目的     | TerminalHandoffBundle を構築する builder を作成する                   |
| 配置先   | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`    |
| 依存     | Step 1（TerminalHandoffBundle 型）                                    |
| 完了条件 | `build(prompt, cwd, options): TerminalHandoffBundle` が実装されている |

#### Step 3: SkillExecutor.execute() に RuntimeDecision パラメータを追加（変更）

| 項目     | 内容                                                                                        |
| -------- | ------------------------------------------------------------------------------------------- |
| 目的     | SkillExecutor が RuntimeDecision を受け取り、SDK query() か terminal handoff かを切り替える |
| 配置先   | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                                     |
| 依存     | Step 1（RuntimePolicyResolver / RuntimeDecision）                                           |
| 完了条件 | TC-4-01、TC-4-02、TC-4-03、TC-4-07、TC-4-09、TC-4-14、TC-4-15 が全て PASS する              |

変更内容:

| 変更箇所               | 変更前                                                     | 変更後                                                                                 |
| ---------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `execute()` シグネチャ | `execute(request, skill): Promise<SkillExecutionResponse>` | `execute(request, skill, decision?: RuntimeDecision): Promise<SkillExecutionResponse>` |
| `getApiKey()` 呼び出し | 内部で `this.authKeyService.getKey()` を直接呼ぶ           | `decision.type === "integrated_api"` の場合 `decision.apiKey` を使用                   |
| terminal handoff 分岐  | 存在しない                                                 | `decision.type === "terminal_handoff"` の場合 bundle を含む success レスポンスを返す   |

注意事項:

- `decision` が未指定（`undefined`）の場合は既存の `getApiKey()` フローを維持し、後方互換を保つ
- `getApiKey()` メソッド自体は削除しない（後方互換 + テスト互換）

#### Step 4: AgentExecutor.start() に RuntimeDecision パラメータを追加（変更）

| 項目     | 内容                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| 目的     | AgentExecutor が RuntimeDecision を受け取り、SDK query() の認証キーを動的に解決する |
| 配置先   | `apps/desktop/src/main/services/agent/AgentExecutor.ts`                             |
| 依存     | Step 1（RuntimeDecision）                                                           |
| 完了条件 | TC-4-05 が PASS し、`agentClient.apiKey` が `decision.apiKey` 経由で設定される      |

変更内容:

| 変更箇所              | 変更前                                                           | 変更後                                                                                |
| --------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `start()` シグネチャ  | `start(): Promise<void>`                                         | `start(decision?: RuntimeDecision): Promise<void>`                                    |
| SDK query 認証        | `AgentHandlerConfig.apiKey` 静的注入（コンストラクタ時点で固定） | `decision.type === "integrated_api"` の場合 `decision.apiKey` を SDK env に渡す       |
| terminal handoff 分岐 | 存在しない                                                       | `decision.type === "terminal_handoff"` の場合 bundle を status として Renderer に通知 |

#### Step 5: AgentHandler の apiKey 動的解決（変更）

| 項目     | 内容                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 目的     | `AgentHandler` の `apiKey` を静的コンストラクタ注入から AuthKeyService 経由の動的解決に移行する                                        |
| 配置先   | `apps/desktop/src/main/agent/agent-handler.ts`                                                                                         |
| 依存     | Step 1（RuntimePolicyResolver）、既存 `IAuthKeyService`                                                                                |
| 完了条件 | `AgentHandlerConfig.apiKey` を廃止し、各 `handleQuery()` 実行時に `authKeyService.getKey()` + `RuntimePolicyResolver.resolve()` を呼ぶ |

変更内容:

| 変更箇所                    | 変更前                             | 変更後                                                                     |
| --------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| `AgentHandlerConfig.apiKey` | `{ apiKey: string; ... }`          | `apiKey` を削除し `authKeyService: IAuthKeyService` に変更                 |
| `handleQuery()` 内部処理    | `AgentClient` に静的 apiKey を渡す | 実行ごとに `RuntimePolicyResolver.resolve()` を呼び RuntimeDecision を取得 |

---

### P2: Renderer 層への反映

#### Step 6: preflight の auth-mode 分岐追加（変更）

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| 目的     | `preflightSkillExecutionAuth()` に auth-mode 分岐を追加し、TC-4-13 を満たす |
| 配置先   | `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`            |
| 依存     | Step 1〜5 完了（Main 側統一完了後）、auth-mode store（既存 Zustand Slice）  |
| 完了条件 | TC-4-13 が PASS する                                                        |

変更内容:

| 変更箇所                                       | 変更前               | 変更後                                                                                              |
| ---------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------- |
| `preflightSkillExecutionAuth()` の内部ロジック | API key 存在確認のみ | `authMode` を store から取得し、`claude_code` の場合は API key 確認をスキップして `ok: true` を返す |
| store 参照                                     | 参照なし             | `useAuthModeStore` の個別セレクタ（P31 準拠）経由で `authMode` を取得                               |

注意事項:

- `preflightSkillExecutionAuth()` は React Hook ではないため、store 参照は Hook として分離し、呼び出し元から `authMode` を引数として渡す設計を検討すること（P31 対策）
- 具体的な関数シグネチャ変更は実装担当者が Phase 4 テストを先行して確認してから決定する

#### Step 7: useAgent Hook の auth-mode store 参照追加（変更）

| 項目     | 内容                                                                                |
| -------- | ----------------------------------------------------------------------------------- |
| 目的     | `useAgent` Hook から `authMode` を参照し、agent 実行前に RuntimeDecision を決定する |
| 配置先   | `apps/desktop/src/renderer/hooks/useAgent.ts`                                       |
| 依存     | Step 6（preflight 変更）、既存 auth-mode store 個別セレクタ                         |
| 完了条件 | `useAgent` が `authMode` を参照して `query()` 前に適切な分岐を実施する              |

変更内容:

| 変更箇所                  | 変更前 | 変更後                                                                          |
| ------------------------- | ------ | ------------------------------------------------------------------------------- |
| `query()` 関数の前処理    | なし   | `useAuthMode()` 個別セレクタで `authMode` を取得し、`query()` の options に渡す |
| 無限ループ対策 (P31 準拠) | N/A    | 合成 Hook（`useAuthModeStore()`）ではなく個別セレクタ（`useAuthMode()`）を使用  |

#### Step 8: TerminalHandoffBundle の UI 反映（新規コンポーネント）

| 項目     | 内容                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| 目的     | Skill / Agent 実行結果として `terminal_handoff` が返った場合に UI で案内カードを表示する |
| 配置先   | `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx`（新規）   |
| 依存     | Step 3〜5（IPC 経由で TerminalHandoffBundle が届く前提）                                 |
| 完了条件 | `TerminalHandoffBundle` の `suggestedCommand` が UI に表示され、コピーボタンが動作する   |

---

### P3: SkillCreatorService の実装（新規）

#### Step 9: SkillCreatorService の Planner / Executor / Improver 実装（新規）

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| 目的     | Skill 作成の 3 role（Planner / Executor / Improver）を持つ新規サービスを実装する |
| 配置先   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                    |
| 依存     | Step 1（RuntimePolicyResolver / RuntimeDecision）、Step 3（SkillExecutor）       |
| 完了条件 | TC-4-10、TC-4-11、TC-4-12 が全て PASS する                                       |

設計概要:

| role     | 責務                                                   | 内部実装                                      |
| -------- | ------------------------------------------------------ | --------------------------------------------- |
| Planner  | ユーザー要求から Skill 仕様（SKILL.md 草稿）を生成する | SDK query() を直接呼ぶか RuntimeDecision 経由 |
| Executor | Planner 出力を受け取り Skill ファイルを生成・配置する  | SkillExecutor に委譲（`execute()` 呼び出し）  |
| Improver | 生成した Skill をレビューし改善提案を返す              | SDK query() または terminal handoff           |

注意事項:

- internal role 名（Planner/Executor/Improver）は IPC payload に **絶対に** 含めない（TC-4-12、P44 準拠）
- IPC レスポンスの `type` フィールドは `"plan_result"` / `"execute_result"` / `"improve_result"` などの外部向け名称を使用する

#### Step 10: Creator IPC チャンネル登録（新規）

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| 目的     | SkillCreatorService の 3 role を IPC チャンネルとして公開する          |
| 配置先   | `apps/desktop/src/main/ipc/creatorHandlers.ts`（新規）                 |
| 依存     | Step 9（SkillCreatorService）                                          |
| 完了条件 | 以下の IPC チャンネルが登録され、P42 3段バリデーションが実装されている |

IPC チャンネル定義:

| チャンネル名      | 定数名                         | 引数                                      | 戻り値                   |
| ----------------- | ------------------------------ | ----------------------------------------- | ------------------------ |
| `creator:plan`    | `IPC_CHANNELS.CREATOR_PLAN`    | `{ prompt: string }`                      | `{ planResult: ... }`    |
| `creator:execute` | `IPC_CHANNELS.CREATOR_EXECUTE` | `{ planId: string }`                      | `{ executeResult: ... }` |
| `creator:improve` | `IPC_CHANNELS.CREATOR_IMPROVE` | `{ skillName: string; feedback: string }` | `{ improveResult: ... }` |

---

## 3. DI 順序整理

初期化時の DI 注入は以下の順序で行う。各コンポーネントは前段の完了を前提とする。

```
1. IAuthKeyService（既存の DI パターン維持、Setter Injection, P34 準拠）
   ↓
2. RuntimePolicyResolver（新規、Main Process のシングルトンとして作成）
   ↓
3. TerminalHandoffBuilder（新規、RuntimePolicyResolver と共に初期化）
   ↓
4. SkillExecutor（既存 + RuntimeDecision パラメータ追加）
   ↓ SkillService.setSkillExecutor() パターンで RuntimePolicyResolver を設定
5. AgentExecutor（既存 + RuntimeDecision パラメータ追加）
   ↓
6. SkillCreatorService（新規、SkillExecutor を委譲として注入）
   ↓
7. AgentHandler（既存 apiKey 静的注入 → AuthKeyService 動的解決に変更）
```

DI パターン選択:

| コンポーネント         | DI パターン           | 理由                                                     |
| ---------------------- | --------------------- | -------------------------------------------------------- |
| RuntimePolicyResolver  | Constructor Injection | 依存（AuthMode 型のみ）が起動時に利用可能                |
| TerminalHandoffBuilder | Constructor Injection | 依存なし（pure function に近い）                         |
| SkillExecutor          | Setter Injection      | BrowserWindow 依存のため遅延注入（P34 準拠）             |
| AgentExecutor          | Setter Injection      | BrowserWindow 依存のため遅延注入（P34 準拠）             |
| SkillCreatorService    | Constructor Injection | SkillExecutor が Setter 注入完了後にコンストラクタを呼ぶ |

---

## 4. 設定経路整理（mode 切替と engine 切替のフロー）

### auth-mode 切替フロー

```
ユーザーが Settings で auth-mode を変更
    ↓
auth-mode:set IPC → AuthModeService.setMode()
    ↓
auth-mode:changed IPC broadcast → Renderer Store 更新（useSetAuthMode()）
    ↓
次回 skill:execute / agent:query 呼び出し時
    ↓
RuntimePolicyResolver.resolve(authMode, apiKey)
    ↓
RuntimeDecision.type が "integrated_api" または "terminal_handoff" に決定
```

### engine 切替フロー（integrated_api → terminal_handoff）

```
RuntimeDecision.type === "terminal_handoff"
    ↓
TerminalHandoffBuilder.build(prompt, cwd, options)
    ↓
SkillExecutionResponse / AgentStreamMessage に TerminalHandoffBundle を添付
    ↓
IPC 経由で Renderer に通知
    ↓
TerminalHandoffCard コンポーネントが suggestedCommand を表示
```

---

## 5. 変更対象ファイル一覧

### 新規作成

| ファイル                                                                       | 理由                                                   | Step |
| ------------------------------------------------------------------------------ | ------------------------------------------------------ | ---- |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`              | auth-mode / apiKey からルーティング決定を行う utility  | 1    |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`             | TerminalHandoffBundle 生成 builder                     | 2    |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                  | Planner / Executor / Improver 3 role サービス          | 9    |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                                 | Creator IPC チャンネル（creator:plan/execute/improve） | 10   |
| `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx` | terminal handoff 案内カード UI コンポーネント          | 8    |

### 変更（既存ファイル）

| ファイル                                                         | 変更内容                                                    | Step |
| ---------------------------------------------------------------- | ----------------------------------------------------------- | ---- |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`          | `execute()` に `RuntimeDecision` optional パラメータ追加    | 3    |
| `apps/desktop/src/main/services/agent/AgentExecutor.ts`          | `start()` に `RuntimeDecision` optional パラメータ追加      | 4    |
| `apps/desktop/src/main/agent/agent-handler.ts`                   | `apiKey` 静的注入 → AuthKeyService 動的解決に移行           | 5    |
| `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts` | auth-mode 分岐追加（claude_code 時は API key 確認スキップ） | 6    |
| `apps/desktop/src/renderer/hooks/useAgent.ts`                    | auth-mode store 個別セレクタ参照追加                        | 7    |

---

## 6. 依存タスクと接続点

### 前提タスクからの受け取り

| 提供元タスク                              | 受け取る契約                                       | 使用箇所  |
| ----------------------------------------- | -------------------------------------------------- | --------- |
| step-01（AI Runtime AuthMode Foundation） | `authMode` IPC 通知 / Zustand Slice の個別セレクタ | Step 6, 7 |
| TASK-FIX-16-1（AuthKeyService）           | `IAuthKeyService.getKey()` インターフェース        | Step 1, 5 |

### 後続タスクへの提供契約

| 後続タスク                                          | 接続点                                       | 提供する契約                                                  |
| --------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| skill-lifecycle Task03（Skill ドキュメント生成）    | `RuntimePolicyResolver`                      | `resolve(authMode, apiKey): RuntimeDecision` の決定結果を提供 |
| step-02-par-task-10（Claude Code Terminal Surface） | `TerminalHandoffBundle` 型                   | terminal handoff の共通 bundle 型を提供                       |
| step-03（統合テスト）                               | `SkillExecutor.execute()` の変更後シグネチャ | optional `RuntimeDecision` パラメータの後方互換確認           |

### IPC チャンネル新規追加

| チャンネル名      | 定数名                         | 用途                                |
| ----------------- | ------------------------------ | ----------------------------------- |
| `creator:plan`    | `IPC_CHANNELS.CREATOR_PLAN`    | Skill 仕様生成（Planner role）      |
| `creator:execute` | `IPC_CHANNELS.CREATOR_EXECUTE` | Skill ファイル生成（Executor role） |
| `creator:improve` | `IPC_CHANNELS.CREATOR_IMPROVE` | Skill 改善提案（Improver role）     |

---

## 7. 完了条件チェックリスト

- [x] P1（Step 1〜5）の実装順序と完了条件が定義されている
- [x] P2（Step 6〜8）の実装順序と完了条件が定義されている
- [x] P3（Step 9〜10）の実装順序と完了条件が定義されている
- [x] DI 順序が図として記述されている
- [x] 設定経路（mode 切替 / engine 切替）のフローが記述されている
- [x] 変更対象ファイル（新規 / 変更）が全て列挙されている
- [x] 後方互換維持の方針（optional パラメータ）が明記されている
- [x] P31・P34・P42・P44・P45 の落とし穴対策が各 Step に記載されている
- [x] 依存タスクと接続点（提供元 / 後続）が整理されている
