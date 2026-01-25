# Phase 1: 要件定義

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| Phase        | 1                                |
| 名称         | 要件定義                         |
| 目的         | 目的・スコープ・受け入れ基準定義 |
| 前提Phase    | なし                             |
| 成果物       | requirements.md                  |
| 成果物配置先 | `outputs/phase-1/`               |

---

## 1. 目的

workspace-chat-edit機能のMain Process側サービス実装に必要な要件を明確に定義する。

---

## 2. 実行タスク

### Task 1: 機能要件の定義

#### 2.1.1 FileService要件

以下の機能を提供する:

| 機能           | 説明                         | 入力                       | 出力               |
| -------------- | ---------------------------- | -------------------------- | ------------------ |
| readFile       | ファイル内容を読み取る       | filePath: string           | FileReadResult     |
| writeFile      | ファイルに内容を書き込む     | filePath, content, options | FileWriteResult    |
| detectLanguage | ファイルパスから言語を検出   | filePath: string           | string             |
| createBackup   | ファイルのバックアップを作成 | filePath: string           | backupPath: string |

**制約条件**:

- 最大ファイルサイズ: 10MB（`MAX_FILE_SIZE`）
- バックアップ形式: `{filename}.{timestamp}.bak`
- 対応エンコーディング: UTF-8

#### 2.1.2 ContextBuilder要件

以下の機能を提供する:

| 機能          | 説明                                       | 入力               | 出力    |
| ------------- | ------------------------------------------ | ------------------ | ------- |
| build         | FileContextからLLMプロンプト用文字列を構築 | FileContextInput[] | string  |
| calculateSize | コンテキスト合計サイズを計算               | FileContextInput[] | number  |
| validateSize  | サイズ制限チェック                         | FileContextInput[] | boolean |

**制約条件**:

- 最大コンテキストサイズ: 100KB（`MAX_CONTEXT_SIZE`）
- Markdown形式で構築
- 選択範囲がある場合はハイライト

#### 2.1.3 ChatEditService要件

以下の機能を提供する:

| 機能            | 説明                                  | 入力                   | 出力                    |
| --------------- | ------------------------------------- | ---------------------- | ----------------------- |
| sendWithContext | コンテキスト付きでLLMにリクエスト送信 | SendWithContextRequest | SendWithContextResponse |
| buildPrompt     | コマンドタイプ別プロンプト生成        | EditCommand, context   | string                  |
| parseResponse   | LLM応答をGeneratedResultに変換        | llmResponse            | GeneratedResult         |

**コマンドタイプ**:

- `continue`: 続きを書く
- `refactor`: リファクタリング
- `generate-test`: テスト生成
- `add-comment`: コメント追加
- `custom`: カスタム指示

#### 2.1.4 IPCハンドラ要件

以下のIPCチャンネルを実装する:

| チャンネル                    | 方向            | 説明                     | 認証    |
| ----------------------------- | --------------- | ------------------------ | ------- |
| `chat-edit:read-file`         | Renderer → Main | ファイル読み取り         | IPC検証 |
| `chat-edit:write-file`        | Renderer → Main | ファイル書き込み         | IPC検証 |
| `chat-edit:get-selection`     | Renderer → Main | エディタ選択範囲取得     | IPC検証 |
| `chat-edit:send-with-context` | Renderer → Main | コンテキスト付きチャット | IPC検証 |

---

### Task 2: 非機能要件の定義

#### 2.2.1 セキュリティ要件

| 要件ID  | 要件                             | 対応方法                    |
| ------- | -------------------------------- | --------------------------- |
| SEC-001 | 全IPCハンドラでsender検証を実施  | validateIpcSender使用       |
| SEC-002 | ファイルパストラバーサル防止     | パス正規化・検証            |
| SEC-003 | ホワイトリストチャンネルのみ許可 | ALLOWED_INVOKE_CHANNELS登録 |
| SEC-004 | 機密ファイルへのアクセス防止     | パス検証ルール              |

#### 2.2.2 パフォーマンス要件

| 要件ID   | 要件                     | 目標値                   |
| -------- | ------------------------ | ------------------------ |
| PERF-001 | ファイル読み取り応答時間 | 1秒以内（10MBファイル）  |
| PERF-002 | LLMリクエスト応答時間    | 30秒以内（タイムアウト） |
| PERF-003 | コンテキスト構築時間     | 100ms以内（10ファイル）  |

#### 2.2.3 品質要件

| 要件ID | 要件              | 目標値 |
| ------ | ----------------- | ------ |
| QA-001 | Line Coverage     | ≥ 80%  |
| QA-002 | Branch Coverage   | ≥ 60%  |
| QA-003 | Function Coverage | ≥ 80%  |
| QA-004 | 型エラー          | 0件    |
| QA-005 | Lintエラー        | 0件    |

---

### Task 3: 受け入れ基準の定義

#### 2.3.1 FileService受け入れ基準

- [ ] 存在するファイルの内容を読み取れる
- [ ] 存在しないファイルでエラーを返す
- [ ] 10MBを超えるファイルでTOO_LARGEエラーを返す
- [ ] ファイルに内容を書き込める
- [ ] バックアップが正しく作成される
- [ ] 言語検出が拡張子に基づいて動作する

#### 2.3.2 ContextBuilder受け入れ基準

- [ ] 複数のFileContextからMarkdown形式で構築できる
- [ ] 選択範囲がハイライトされる
- [ ] コンテキストサイズが正しく計算される
- [ ] 100KBを超える場合にfalseを返す

#### 2.3.3 ChatEditService受け入れ基準

- [ ] 各コマンドタイプで適切なプロンプトが生成される
- [ ] LLM Adapterと統合できる
- [ ] LLM応答をGeneratedResultに変換できる
- [ ] エラー時に適切なエラーレスポンスを返す

#### 2.3.4 IPCハンドラ受け入れ基準

- [ ] 全チャンネルがホワイトリストに登録されている
- [ ] 全ハンドラでvalidateIpcSenderが使用されている
- [ ] 不正なsenderからのリクエストを拒否する
- [ ] 正常なリクエストで期待される結果を返す

---

## 3. 参照資料

### 3.1 システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                         | 内容                                        |
| ------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------- |
| APIエンドポイント        | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | chat-edit IPC チャネル仕様                  |
| インターフェース（LLM）  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`        | FileContext、EditCommand、GeneratedResult型 |
| セキュリティ（Electron） | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC セキュリティパターン                    |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | テストカバレッジ目標                        |

### 3.2 既存実装参照

| 実装                  | パス                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| 型定義                | `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts` |
| LLM Adapter           | `apps/desktop/src/main/adapters/llm/`                                   |
| skillHandlers（参考） | `apps/desktop/src/main/ipc/skillHandlers.ts`                            |
| channels.ts           | `apps/desktop/src/preload/channels.ts`                                  |

---

## 4. 成果物

| 成果物          | 配置先             | 説明       |
| --------------- | ------------------ | ---------- |
| requirements.md | `outputs/phase-1/` | 要件定義書 |

---

## 5. 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                          |
| ---------------- | ----------------------------------------------------------------- |
| IPC接続          | chat-edit:read-file, write-file, get-selection, send-with-context |
| 認証フロー       | validateIpcSenderによる送信元検証                                 |
| データフロー     | Renderer → IPC → Main Process → FileSystem/LLMAdapter             |

---

## 6. 完了条件

- [ ] 機能要件が明確に定義されている
- [ ] 非機能要件（セキュリティ、パフォーマンス、品質）が定義されている
- [ ] 受け入れ基準がチェックリスト形式で定義されている
- [ ] システム仕様との整合性が確認されている
- [ ] 接続要件（IPC/認証/データフロー）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 7. サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. 機能要件の定義（Task 1）
3. 非機能要件の定義（Task 2）
4. 受け入れ基準の定義（Task 3）
5. 統合テスト連携の記載
6. 成果物の作成・配置
7. 完了条件の検証

---

## 8. タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/workspace-chat-edit-main-process --phase 1
```

---

## 9. 次のPhase

Phase 2: 設計
