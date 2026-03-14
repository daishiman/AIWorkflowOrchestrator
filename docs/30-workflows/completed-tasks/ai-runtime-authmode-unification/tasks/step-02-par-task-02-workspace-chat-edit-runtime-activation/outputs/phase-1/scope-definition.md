# Phase 1 スコープ定義 - workspace-chat-edit-runtime-activation

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 作成日     | 2026-03-14                                  |
| ステータス | completed                                   |

---

## 1. 対象範囲

### 1-1. 対象ファイル（設計変更対象）

| ファイル                                                                        | 変更種別 | 理由                                                                |
| ------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`                            | 修正     | `handleSendWithContext` に workspacePath 検証追加、エラーコード整理 |
| `apps/desktop/src/main/ipc/index.ts`                                            | 修正     | stub adapter を RuntimeResolver 経由に置換                          |
| `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`                   | 既存維持 | DI ポイントは設計済み                                               |
| `apps/desktop/src/main/services/chat-edit/ContextBuilder.ts`                    | 既存維持 | selection 対応は既に `buildFileSection` に実装済み                  |
| `apps/desktop/src/main/services/chat-edit/` (新規)                              | 新規追加 | `RuntimeResolver.ts`, `TerminalHandoffBuilder.ts`                   |
| `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts` | 修正     | selection state 管理の確認・強化                                    |
| `apps/desktop/src/renderer/features/workspace-chat-edit/types.ts`               | 修正     | `handoff` フィールド / 新エラーコード追加                           |
| `apps/desktop/src/preload/chatEditApi.ts`                                       | 確認     | contextBridge 経由の公開状態を確認                                  |

### 1-2. 対象 IPC チャンネル

| チャンネル                    | 変更種別 | 内容                                                   |
| ----------------------------- | -------- | ------------------------------------------------------ |
| `chat-edit:send-with-context` | 修正     | workspacePath 検証追加、エラーコード整理、handoff 対応 |
| `chat-edit:read-file`         | 既存維持 | workspacePath 制約済み                                 |
| `chat-edit:write-file`        | 既存維持 | workspacePath 制約済み                                 |
| `chat-edit:get-selection`     | 廃止候補 | renderer 側 selection 管理に移行するため廃止検討       |
| `chat-edit:detect-language`   | 既存維持 | 変更なし                                               |
| `chat-edit:stream-output`     | 既存維持 | 変更なし                                               |

---

## 2. 除外範囲

| 項目                                    | 理由                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------- |
| 実際の LLM API 接続実装                 | 本タスクは設計フェーズ。実際の API 呼び出しコードは後続タスクで実装する |
| Monaco Editor の直接改修                | Electron renderer 層の Monaco API 統合は別タスクで扱う                  |
| streaming LLM 応答の実装                | streaming は Phase 5 実装計画に含めるが、本タスクは設計まで             |
| OAuth / Supabase 認証フロー             | auth は `AuthKeyService` / `AuthModeService` が担当済み                 |
| `chat-edit:stream-output` の詳細設計    | streaming 設計は streaming 専用タスクで扱う                             |
| SkillExecutor や AgentExecutor との統合 | Chat Edit は独立した runtime 経路を持つ                                 |

---

## 3. 依存関係

### 3-1. 本タスクが依存するもの

| 依存先                                                   | 参照理由                               |
| -------------------------------------------------------- | -------------------------------------- |
| Task01 foundation: `RuntimeResolver` 契約                | auth mode 判定ロジックの共通契約を継承 |
| `AuthKeyService` (`apps/desktop/src/main/services/auth`) | API key の存在確認                     |
| `AuthModeService` (同上)                                 | auth mode の現在値取得                 |
| `ContextBuilder` (既実装)                                | selection text セクション生成          |

### 3-2. 本タスクの成果物が影響するもの

| 影響先                                | 影響内容                               |
| ------------------------------------- | -------------------------------------- |
| `chatEditSlice` の renderer state     | selection state の管理方式変更         |
| UI コンポーネント（Chat Edit パネル） | handoff guidance カードの表示条件      |
| 後続タスク: Integrated API 実装タスク | `RuntimeResolver` の設計を継承して実装 |

---

## 4. 設計境界の確認事項

### 4-1. contextBridge 確認

現在の `chatEditApi.ts` は `window.chatEditAPI` に直接代入している（L138）。`contextBridge.exposeInMainWorld` を使用していない可能性があり、セキュリティ上の確認が必要。

**確認アクション**: Phase 2 の設計で Preload の公開方式を確認・修正方針を定める。

### 4-2. selection の IPC 経路

`chat-edit:get-selection` で Main から selection を取得するアーキテクチャは誤り。
正しい経路: renderer → Monaco selection → chatEditSlice → sendWithContext request の `contexts[].selection`

**確認アクション**: Phase 2 の設計でこの経路変更を契約に明記する。

---

## 5. 完了条件の確認

- [x] selection、context、runtime の要件が分離されている（requirements-definition.md §2 参照）
- [x] 既存 TODO の吸収範囲が明確になっている（GAP-01〜05 参照）
