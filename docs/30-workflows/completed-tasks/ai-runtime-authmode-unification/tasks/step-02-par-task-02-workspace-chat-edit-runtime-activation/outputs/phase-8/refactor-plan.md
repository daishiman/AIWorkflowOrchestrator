# Phase 8 リファクタリング計画: Chat Edit AI Runtime 有効化

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| Phase        | 8 - リファクタリング                                       |
| タスク ID    | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                |
| 作成日       | 2026-03-14                                                 |
| 対象ブランチ | step-02-par-task-02-workspace-chat-edit-runtime-activation |

---

## 1. 責務整理の対象

Phase 5 実装後の現状を踏まえ、以下のコンポーネントについて責務の境界を整理する。

| コンポーネント                       | 現状の問題                                                                                     | 分離後の責務                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `chatEditHandlers.ts`                | `buildPrompt` / runtime resolution / response parse が混在しており、ハンドラが過剰な知識を持つ | IPC チャンネルの受付と委譲のみ。ビジネスロジックは持たない     |
| `handleSendWithContext`              | LLM 呼び出し判断・プロンプト生成・ストリーム管理をハンドラ内で処理しており SRP 違反            | `ChatEditService.sendWithContext` に委譲し、結果を返すだけ     |
| `buildPrompt` 関数（handlers.ts 内） | `ChatEditService` および `prompts.ts` にも同名ロジックが存在し、重複と責務混在が発生している   | handlers.ts からは完全に除去し、`prompts.ts` 経由に一本化      |
| `handleGetSelection`                 | 実装が null 返却のみであり、廃止対象の stub                                                    | 廃止（チャンネル登録ごと削除）                                 |
| `RuntimeResolver`                    | Phase 5 で新規追加。auth mode × API key の判定を担う                                           | handlers.ts から `resolve()` を呼び出すだけの委譲関係を徹底    |
| `TerminalHandoffBuilder`             | Phase 5 で新規追加。guidance 文字列の生成を担う                                                | handlers.ts は生成物を受け取るだけ。構築ロジックを一切知らない |

---

## 2. prompt build 分離

### 現状

`chatEditHandlers.ts` 内に `buildPrompt` 関数が残存している（L415-454 付近）。
一方、`ChatEditService` は内部で `prompts.ts` の `buildPromptFromTemplate` を呼び出す設計となっており、handlers.ts 側の `buildPrompt` は重複実装に相当する。

### 確認コマンド

```bash
grep -n "buildPrompt" apps/desktop/src/main/handlers/chatEditHandlers.ts
```

期待する結果: **0 件**（分離完了後）。1 件以上検出された場合は以下の対応が必要。

### 対応手順

1. `chatEditHandlers.ts` の `buildPrompt` 関数定義を削除する。
2. 削除した呼び出し箇所を `ChatEditService.buildPrompt` の呼び出しに置き換える（既に `ChatEditService` が `prompts.ts` に委譲済みであれば、handlers.ts は何も知る必要がない）。
3. `ChatEditService.buildPrompt` は `prompts.ts` の `buildPromptFromTemplate` を呼ぶ設計を維持する。
4. handlers.ts はプロンプト生成を一切知らない設計に変更する。

### 完了の定義

- `chatEditHandlers.ts` に `buildPrompt` の定義が存在しない。
- `prompts.ts` が唯一のプロンプト生成の起点となっている。
- `ChatEditService.buildPrompt` は `prompts.ts` への委譲のみ行う。

---

## 3. runtime resolution 分離

### 現状

`handleSendWithContext` がどの adapter を使用するかを直接判断しようとしており、Phase 5 実装時点では stub または直接判断コードが混在している可能性がある。

### 分離後の設計

Phase 5 Step 6 の設計に従い、以下の委譲構造とする。

```
handlers.ts
  └─ RuntimeResolver.resolve(authMode, apiKey)
       ├─ 戻り値: { mode: "integrated", adapter }
       └─ 戻り値: { mode: "handoff", guidance }
```

- `handlers.ts` は `RuntimeResolver.resolve()` を呼び出し、戻り値の `mode` に応じて分岐する。
- `handlers.ts` が adapter の種別・選択ロジックを知ることは禁止とする。
- `handlers.ts` が知るのは「integrated か handoff か」の 2 択のみとする。

### 確認コマンド

```bash
grep -n "authMode\|apiKey\|adapter\|AnthropicAdapter\|ClaudeCodeAdapter" \
  apps/desktop/src/main/handlers/chatEditHandlers.ts
```

期待する結果: `RuntimeResolver` への委譲呼び出し以外のロジックが存在しない。

### 完了の定義

- handlers.ts に adapter 選択ロジックが存在しない。
- `RuntimeResolver.resolve()` の呼び出しのみが handlers.ts に存在する。

---

## 4. response parse 分離

### 現状の確認

`ChatEditService.parseResponse` はサービス内に存在しており、現状は適切な配置である。
問題は handlers.ts がレスポンスを直接パースしていないかどうかの確認が必要な点である。

### 確認コマンド

```bash
grep -n "parseResponse\|\.content\|\.text\|\.delta" \
  apps/desktop/src/main/handlers/chatEditHandlers.ts
```

期待する結果: `ChatEditService.sendWithContext` の戻り値をそのまま IPC レスポンスとして返却している呼び出しのみが存在する。

### 対応方針

- handlers.ts は `ChatEditService.sendWithContext` の結果を受け取り、そのまま IPC チャンネルを通じて返すだけとする。
- レスポンスのパース・変換は `ChatEditService` 内で完結させる。
- handlers.ts にレスポンス構造を参照するコードが存在する場合は `ChatEditService` に移動する。

### 完了の定義

- handlers.ts がレスポンス内部構造（`.content`, `.text`, `.delta` 等）にアクセスしていない。
- `ChatEditService.sendWithContext` が完成したレスポンス形式を返す。

---

## 5. 重複責務の洗い出し

| 重複箇所                   | 場所 A                                                           | 場所 B                                       | 統合先                                               | 優先度 |
| -------------------------- | ---------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------- | ------ |
| `buildPrompt` 関数         | `chatEditHandlers.ts` L415 付近                                  | `ChatEditService.buildPrompt` → `prompts.ts` | `prompts.ts`（`ChatEditService` 経由）               | 高     |
| `workspacePath` 検証       | `handleReadFile` / `handleWriteFile` の実装                      | `handleSendWithContext` の新実装             | `isWithinWorkspace` ユーティリティ（既実装・再利用） | 中     |
| ストリームコールバック管理 | `chatEditHandlers.ts` モジュールスコープの `streamCallbacks` Map | （将来の `ChatEditStreamManager`）           | 現状維持（Phase 8 スコープ外）                       | 低     |

### `workspacePath` 検証の統一方針

- `isWithinWorkspace` ユーティリティが既に実装済みであることを確認する。
- `handleSendWithContext` の新実装でも同ユーティリティを使用し、重複したパス検証コードを持たない。

確認コマンド:

```bash
grep -rn "isWithinWorkspace" apps/desktop/src/main/
```

---

## 6. 再配置方針

| 対象                  | 現在の場所                                            | 移動先                                | 優先度 | 理由                                                                 |
| --------------------- | ----------------------------------------------------- | ------------------------------------- | ------ | -------------------------------------------------------------------- |
| `buildPrompt` 関数    | `chatEditHandlers.ts` L415 付近                       | `prompts.ts`（または削除）            | 高     | SRP 違反。handlers.ts がプロンプト生成を知る必要はない               |
| `streamCallbacks` Map | `chatEditHandlers.ts` L459 付近（モジュールスコープ） | `ChatEditStreamManager`（将来タスク） | 低     | 現状の機能影響を避けるため現状維持。将来の専用マネージャーに委譲予定 |
| `handleGetSelection`  | `chatEditHandlers.ts` L328 付近                       | 廃止（チャンネル登録ごと削除）        | 高     | 実装が null 返却のみ。廃止済み機能として整理する                     |

### `handleGetSelection` 廃止手順

1. `chatEditHandlers.ts` の `handleGetSelection` 関数を削除する。
2. 対応する IPC チャンネル登録（`ipcMain.handle` または `ipcMain.on`）を削除する。
3. `IPC_CHANNELS` 定数から `CHAT_EDIT_GET_SELECTION`（または対応する定数名）を削除する。
4. Preload 側の contextBridge 公開から対応するメソッドを削除する。
5. 削除後、型チェックを実行して参照が残っていないことを確認する。

確認コマンド:

```bash
grep -rn "getSelection\|GET_SELECTION" apps/desktop/src/
```

---

## 7. 完了条件確認

### 責務境界の検証チェックリスト

- [ ] `chatEditHandlers.ts` に `buildPrompt` の定義が存在しない（`grep -n "function buildPrompt" chatEditHandlers.ts` が 0 件）
- [ ] `chatEditHandlers.ts` に adapter 選択ロジックが存在しない（`RuntimeResolver` への委譲のみ）
- [ ] `chatEditHandlers.ts` がレスポンス内部構造にアクセスしていない
- [ ] `handleGetSelection` が廃止されており、チャンネル登録も削除されている
- [ ] `workspacePath` 検証が `isWithinWorkspace` ユーティリティに統一されている
- [ ] `streamCallbacks` Map は現状維持（将来タスクとして未タスク化済み）
- [ ] `pnpm typecheck` がエラーなしで通過する
- [ ] `pnpm lint` がエラーなしで通過する
- [ ] 既存テストが全て PASS する

### アーキテクチャ境界の確認

リファクタリング完了後の理想的な依存関係:

```
chatEditHandlers.ts（IPC 受付・委譲のみ）
  ├─ ChatEditService.sendWithContext()
  │    ├─ prompts.ts（buildPromptFromTemplate）
  │    ├─ ChatEditService.parseResponse()
  │    └─ ChatEditService.calculateDiff()
  └─ RuntimeResolver.resolve()
       ├─ AnthropicAdapter（integrated モード時）
       └─ TerminalHandoffBuilder（handoff モード時）
```

handlers.ts が知ること: IPC チャンネル名、委譲先サービス・リゾルバーの呼び出しインターフェース
handlers.ts が知らないこと: プロンプト構造、adapter の種別・選択ロジック、レスポンスの内部形式

---

## 8. Phase 8 スコープ外の事項（将来タスク）

以下は本 Phase のスコープ外とし、未タスクとして管理する。

| 項目                                                  | 理由                                                                | 対応タスク                        |
| ----------------------------------------------------- | ------------------------------------------------------------------- | --------------------------------- |
| `streamCallbacks` の `ChatEditStreamManager` への移動 | ストリーム管理の設計は独立したタスクとして実施すべき                | 別途未タスク化                    |
| `calculateDiff` の LCS アルゴリズム移行               | アルゴリズム改善は機能影響が大きく、独立したテスト設計が必要        | 別途未タスク化                    |
| Preload 側の `getSelection` 型定義の削除              | handlers 廃止と同時に実施するが、型定義削除による影響範囲調査を伴う | 本 Phase で実施（廃止手順に含む） |
