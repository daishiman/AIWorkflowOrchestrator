# Phase 2 設計サマリー: Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| Phase      | 2 - 設計                                    |
| タスク ID  | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 作成日     | 2026-03-14                                  |
| 依存成果物 | Phase 1 要件定義 (phase-1-requirements.md)  |
| ステータス | ドラフト                                    |

---

## 1. アーキテクチャ概要

### 単方向依存の原則

```
Renderer → Preload (contextBridge) → Main → Services
```

レイヤー間の通信はすべて IPC 経由で行い、Renderer から Node.js API を直接呼び出してはならない。

### 実行経路の分岐

auth mode と API key の状態に応じて、以下の3経路に分岐する。

#### 経路 A: Integrated API Runtime

- 条件: `auth mode = integrated` かつ API key が設定済み
- フロー: ChatEditService → LLMAdapter → 外部 API → diff 返却
- 応答: `{ diff: string, handoff: false }`

#### 経路 B: Terminal Handoff

- 条件: `auth mode = terminal` または API key が未設定
- フロー: TerminalHandoffBuilder → context summary + terminal command 生成
- 応答: `{ handoff: true, guidance: string }`

#### 経路 C: Hybrid (Integrated → Terminal Fallback)

- 条件: integrated を試みたが API エラー（rate limit / timeout）が発生
- フロー: 経路 A の失敗を検出 → 経路 B に自動フォールバック
- 応答: 経路 B と同形式 (`handoff: true`)

---

## 2. 責務境界設計

### Renderer

| 責務           | 詳細                                                          |
| -------------- | ------------------------------------------------------------- |
| selection 管理 | `chatEditSlice` が editor の選択範囲テキストを保持            |
| UI state       | ローディング状態、エラー表示、diff preview の表示制御         |
| diff preview   | 応答が `handoff: false` の場合に diff UI を表示               |
| handoff card   | 応答が `handoff: true` の場合に terminal コマンドカードを表示 |

Renderer は selection を Main に問い合わせない。selection は Renderer 側で取得・管理し、`sendWithContext` の引数として渡す（GAP-01 解決）。

### Preload (chatEditApi)

| 責務                | 詳細                                                             |
| ------------------- | ---------------------------------------------------------------- |
| IPC ブリッジ        | `contextBridge.exposeInMainWorld` で `window.chatEditAPI` を公開 |
| 型安全な転送        | Renderer から受け取った引数を IPC チャンネルに転送               |
| sender 検証サポート | Main 側の sender 検証を阻害しない構造を維持                      |

### Main Handler (chatEditHandlers)

| 責務                 | 詳細                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| workspacePath 検証   | 空文字列・パストラバーサル・存在確認の3段バリデーション（GAP-03 解決） |
| RuntimeResolver 委譲 | auth mode と API key の判定を RuntimeResolver に委譲                   |
| error envelope       | エラーコードを種別ごとに分類して返却（GAP-04 解決）                    |

handleGetSelection は Main の責務ではないため、null 固定の実装を廃止し、Renderer 側の chatEditSlice から提供する構造に変更する。

### RuntimeResolver（新規）

| 責務          | 詳細                                                                |
| ------------- | ------------------------------------------------------------------- |
| adapter 選択  | auth mode × API key の組み合わせで LLMAdapter または handoff を選択 |
| fallback 制御 | 経路 C のフォールバック判定ロジックを集約                           |

stub ベースの注入（GAP-02）を廃止し、RuntimeResolver が auth mode に応じて adapter を動的に選択する（GAP-02 解決）。

### ChatEditService

| 責務                   | 詳細                                                       |
| ---------------------- | ---------------------------------------------------------- |
| LLMAdapter DI ポイント | コンストラクタで LLMAdapter を受け取る（既設計、変更なし） |
| context 組み立て       | ContextBuilder を使用してプロンプトを構築                  |
| API 呼び出し           | LLMAdapter 経由で外部 API にリクエスト                     |

### TerminalHandoffBuilder（新規）

| 責務                  | 詳細                                                        |
| --------------------- | ----------------------------------------------------------- |
| context summary 生成  | 送信コンテキストを terminal コマンド引数に収まる形式に要約  |
| terminal command 生成 | Claude Code CLI や他の terminal AI ツール向けコマンドを生成 |
| guidance フィールド   | handoff 応答の `guidance` フィールドに出力（GAP-05 解決）   |

---

## 3. 依存関係と接続順序

```
1. Renderer が selection を chatEditSlice に保持する
      |
      | (ユーザーが「編集案を生成」CTA をクリック)
      v
2. chatEditSlice が contexts + selection を sendWithContext の引数に付与する
      |
      v
3. Preload (chatEditApi) が IPC 経由で Main に転送する
      |
      v
4. Main Handler が workspacePath を検証する
      | 検証失敗 → INVALID_WORKSPACE_PATH エラー返却
      v
5. RuntimeResolver が auth mode と API key を確認する
      |
      +------ auth mode = integrated かつ API key あり ------+
      |                                                       |
      v                                                       v
   6b. TerminalHandoffBuilder が                         6a. ChatEditService が
       context summary を生成し                              LLMAdapter 経由で
       terminal command を組み立てる                         API 呼び出しを実行する
      |                                                       |
      v                                                       | 失敗 (rate limit / timeout)
   7b. handoff: true 応答を返す                              | → TerminalHandoffBuilder に
      |                                                       |   フォールバック（経路 C）
      |                                                 成功  v
      |                                            7a. diff を返す
      |                                                  |
      +-------------------+------------------------------+
                          |
                          v
8. Renderer が diff preview または handoff card を表示する
```

---

## 4. 新規コンポーネント設計

### RuntimeResolver インターフェース

```typescript
interface RuntimeResolver {
  /**
   * auth mode と API key の状態から実行経路を決定する。
   * @returns 'integrated' | 'handoff'
   */
  resolve(context: RuntimeContext): Promise<RuntimeRoute>;
}

interface RuntimeContext {
  authMode: AuthMode; // 'integrated' | 'terminal'
  hasApiKey: boolean;
  workspacePath: string;
}

type RuntimeRoute = "integrated" | "handoff";
```

### TerminalHandoffBuilder インターフェース

```typescript
interface TerminalHandoffBuilder {
  /**
   * 送信コンテキストから terminal 向けの guidance を生成する。
   * @returns HandoffGuidance
   */
  build(request: SendWithContextRequest): HandoffGuidance;
}

interface HandoffGuidance {
  /** ユーザーが terminal に貼り付けて実行するコマンド文字列 */
  command: string;
  /** コマンドの説明と操作手順 */
  instructions: string;
}
```

---

## 5. 既存コンポーネントの変更点

### handleSendWithContext の変更

| 変更点             | 変更前           | 変更後                            |
| ------------------ | ---------------- | --------------------------------- |
| workspacePath 検証 | なし             | 3段バリデーション追加             |
| adapter 選択       | stub 固定        | RuntimeResolver 委譲              |
| エラーコード       | LLM_ERROR に集約 | 種別ごとに分類（下記参照）        |
| handoff 応答       | 未設計           | `handoff: true, guidance: string` |

### ipc/index.ts の変更

```typescript
// 変更前 (L836-843)
const stubLLMAdapter = new StubLLMAdapter();
const chatEditService = new ChatEditService(stubLLMAdapter);

// 変更後
const runtimeResolver = new RuntimeResolverImpl(authModeService, apiKeyService);
const chatEditService = new ChatEditService(runtimeResolver);
```

### types.ts の追加定義

#### 新エラーコード

| コード                   | 意味                       | 対応 GAP |
| ------------------------ | -------------------------- | -------- |
| `INVALID_WORKSPACE_PATH` | workspacePath が不正       | GAP-03   |
| `API_KEY_MISSING`        | API key が未設定           | GAP-02   |
| `RATE_LIMIT_EXCEEDED`    | API rate limit に到達      | GAP-04   |
| `REQUEST_TIMEOUT`        | API 呼び出しがタイムアウト | GAP-04   |
| `SELECTION_REQUIRED`     | selection が空             | GAP-01   |

#### handoff フィールドの追加

```typescript
interface SendWithContextResponse {
  /** 編集差分テキスト。handoff: false の場合に存在する */
  diff?: string;
  /** Terminal Handoff モードの場合 true */
  handoff: boolean;
  /** handoff: true の場合に存在する。terminal 向けのガイダンス */
  guidance?: HandoffGuidance;
}
```

---

## 6. GAP 解決対応マトリクス

| GAP ID | 内容                                              | 解決コンポーネント               | 解決状態 |
| ------ | ------------------------------------------------- | -------------------------------- | -------- |
| GAP-01 | selection 取得が Main に誤って割り当て            | chatEditSlice (Renderer)         | 設計済み |
| GAP-02 | stubLLMAdapter が注入されており real adapter なし | RuntimeResolver                  | 設計済み |
| GAP-03 | sendWithContext に workspacePath 検証なし         | handleSendWithContext            | 設計済み |
| GAP-04 | エラーコードが LLM_ERROR に集約                   | types.ts, handleSendWithContext  | 設計済み |
| GAP-05 | terminal handoff の応答構造が未設計               | TerminalHandoffBuilder, types.ts | 設計済み |

---

## 7. 完了条件確認

| 確認項目                                                           | 状態                                            |
| ------------------------------------------------------------------ | ----------------------------------------------- |
| Chat Edit の責務分離が明文化されているか                           | 完了（第2節に記載）                             |
| Renderer が selection を管理する設計が確認できるか                 | 完了（GAP-01、第2節 Renderer 欄）               |
| runtime の未配線部分（stub → RuntimeResolver）の設計が確認できるか | 完了（GAP-02、第4節・第5節）                    |
| workspacePath 検証の設計が確認できるか                             | 完了（GAP-03、第2節 Main Handler 欄）           |
| エラーコード種別設計が確認できるか                                 | 完了（GAP-04、第5節 types.ts 欄）               |
| terminal handoff の応答構造が確認できるか                          | 完了（GAP-05、第4節 TerminalHandoffBuilder 欄） |
| 全 GAP が設計レベルで解決されているか                              | 完了（第6節 マトリクス参照）                    |

---

## 8. 次 Phase への引き継ぎ事項

Phase 3（設計レビュー）で以下の観点を検証すること。

1. RuntimeResolver の選択ロジックが auth mode × API key の全組み合わせを網羅しているか
2. TerminalHandoffBuilder が生成するコマンド文字列の長さ上限設計が必要かどうか
3. 経路 C（Integrated → Terminal Fallback）のフォールバック条件（rate limit / timeout 以外にも network error を含めるか）
4. contextBridge 経由で公開する `window.chatEditAPI` のホワイトリスト定義が IPC チャンネル定数と整合しているか
