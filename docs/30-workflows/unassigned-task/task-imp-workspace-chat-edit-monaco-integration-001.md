# Workspace Chat-Edit Monaco Editor統合 - タスク指示書

## メタ情報

```yaml
issue_number: 652
```

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | task-imp-workspace-chat-edit-monaco-integration-001 |
| タスク名     | Workspace Chat-Edit Monaco Editor統合               |
| 分類         | 改善                                                |
| 対象機能     | chatEditHandlers（Main Process）+ Monaco Editor連携 |
| 優先度       | 中                                                  |
| 見積もり規模 | 中規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | Phase 12（システム仕様書横断スキャン）              |
| 発見日       | 2026-02-02                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Workspace Chat-Edit機能の`chatEditHandlers.ts`（`apps/desktop/src/main/handlers/chatEditHandlers.ts`）には以下の3つのTODO項目が残されている:

1. **L77**: `getWorkspacePath()` - 実際のワークスペース管理からパス取得（現在は`process.cwd()`で仮実装）
2. **L302**: `handleGetSelection()` - Monaco Editorとの連携によるエディタ選択範囲取得（現在は`null`を返却）
3. **L344**: `handleSendWithContext()` - 実際のLLM連携による生成処理（現在は仮実装で入力をそのまま返却）

### 1.2 問題点・課題

- エディタ上のテキスト選択がMain Process側で取得できない（`handleGetSelection`が常に`null`）
- LLMによるコード生成が機能しない（`handleSendWithContext`が仮実装）
- ワークスペースパスが`process.cwd()`固定のため、複数ワークスペース切り替え時に不正なパスを返す可能性

### 1.3 放置した場合の影響

- Chat-Edit機能のコア機能（選択範囲へのLLM提案、コンテキスト付きコード生成）が使用不能
- 機能としてUIは表示されるが実質的に動作しないため、ユーザー混乱の原因となる
- ワークスペース安全性チェック（`isWithinWorkspace`）が不完全になる

---

## 2. 何を達成するか（What）

### 2.1 目的

chatEditHandlersの3つのTODO項目を本実装に置き換え、Chat-Edit機能のエンドツーエンドフローを完成させる。

### 2.2 最終ゴール

- Monaco Editorからの選択範囲取得がIPC経由で正常に動作する
- LLMによるコンテキスト付きコード生成が動作する
- ワークスペースパスが実際のワークスペース管理と連携して取得される

### 2.3 スコープ

#### 含むもの

- `getWorkspacePath()` の実装（ワークスペース管理サービスとの連携）
- `handleGetSelection()` の実装（Renderer→Main IPC経由でMonaco Editor選択範囲取得）
- `handleSendWithContext()` の実装（Claude Agent SDK / Anthropic SDK連携）
- 各ハンドラのユニットテスト

#### 含まないもの

- Monaco Editorコンポーネント自体の新規作成（既存のRendererプロセス内で動作前提）
- UIデザインの変更
- 新規IPCチャンネルの定義（既存の`chat-edit:get-selection`等を使用）

### 2.4 成果物

| 成果物                       | 説明                                      |
| ---------------------------- | ----------------------------------------- |
| chatEditHandlers.ts更新      | 3つのTODO実装                             |
| chatEditHandlers.test.ts更新 | 新規テストケース追加                      |
| Monaco連携Preload API        | 選択範囲取得のPreload API（必要に応じて） |
| テスト結果レポート           | 全テストPASS確認                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Monaco Editorがレンダラープロセスで動作していること
- Claude Agent SDK or Anthropic SDK がMain Processで使用可能であること
- IPCチャンネル `chat-edit:get-selection`, `chat-edit:send-with-context` が定義済み

### 3.2 依存タスク

- claude-agent-sdk スキルの実装完了（LLM連携部分）
- ワークスペース管理サービスの基盤実装

### 3.3 必要な知識

- Electron Main Process ↔ Renderer Process IPC通信
- Monaco Editor API（`getSelection`, `getModel`, `getSelectedText`）
- Claude Agent SDK / Anthropic SDK の使用方法
- TypeScript strict mode

### 3.4 推奨アプローチ

**Step 1: getWorkspacePath() 実装**

- Electron `app.getPath('userData')` またはワークスペース設定ストアから取得
- 複数ワークスペース対応の場合、アクティブワークスペースIDから解決

**Step 2: handleGetSelection() 実装**

- Renderer→Main方向のIPC通信パターン:
  1. Main ProcessからRendererへ`webContents.send('request-selection')`
  2. Rendererで`ipcRenderer.on('request-selection', () => editor.getSelection())`
  3. Renderer→Mainへ`ipcRenderer.invoke('selection-response', selection)`
- または `BrowserWindow.webContents.executeJavaScript()` で直接Monaco APIを呼び出し

**Step 3: handleSendWithContext() 実装**

- `.claude/skills/claude-agent-sdk/` スキルのDirect SDKパターンを使用
- `@anthropic-ai/sdk` でコンテキスト付きプロンプトを構築→API呼び出し→結果を返却

---

## 4. 実行手順

### Phase構成

Phase 1-13のタスク仕様書作成スキルに従って実行。中規模タスクのため、3つのサブタスクに分割して段階的に実装。

### Phase 4-5: テスト作成・実装（getWorkspacePath）

#### 目的

ワークスペースパス取得の正確な実装

#### 手順

1. ワークスペース管理の現状確認（設定ストア構造）
2. テスト作成: getWorkspacePath()のモック・境界値テスト
3. 実装: 設定ストアからアクティブワークスペースパスを取得

#### 成果物

- getWorkspacePath()の本実装
- 対応テスト

#### 完了条件

- ワークスペースパスが設定ストアから正しく取得される
- テストがPASS

### Phase 4-5: テスト作成・実装（handleGetSelection）

#### 目的

Monaco Editor選択範囲のIPC経由取得

#### 手順

1. IPC通信パターン選定（executeJavaScript vs 双方向IPC）
2. テスト作成: IPCモックを使用したselection取得テスト
3. 実装: Renderer側のselection取得ロジック + Main側のIPC呼び出し

#### 成果物

- handleGetSelection()の本実装
- Preload API追加（必要に応じて）
- 対応テスト

#### 完了条件

- エディタ上の選択範囲がMain Processで取得できる
- 選択がない場合はnullが返る
- テストがPASS

### Phase 4-5: テスト作成・実装（handleSendWithContext）

#### 目的

LLM連携によるコンテキスト付きコード生成

#### 手順

1. Claude Agent SDK / Anthropic SDKの利用方法確認
2. テスト作成: SDKモックを使用した生成テスト、エラーハンドリングテスト
3. 実装: プロンプト構築→API呼び出し→結果パース→レスポンス返却

#### 成果物

- handleSendWithContext()の本実装
- 対応テスト

#### 完了条件

- コンテキスト付きリクエストがLLMに送信され、生成結果が返る
- コンテキストサイズ超過時にエラーが返る
- APIエラー時に適切なエラーレスポンスが返る
- テストがPASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] getWorkspacePath()がアクティブワークスペースのパスを返す
- [ ] handleGetSelection()がMonaco Editorの選択範囲を返す
- [ ] handleGetSelection()が選択なし時にnullを返す
- [ ] handleSendWithContext()がLLM APIを呼び出して生成結果を返す
- [ ] handleSendWithContext()がコンテキストサイズ超過時にエラーを返す

### 品質要件

- [ ] TypeScript strict モードでエラーなし
- [ ] ESLint PASS
- [ ] テストカバレッジ 80% 以上
- [ ] 既存テストにリグレッションなし

### ドキュメント要件

- [ ] Phase 12 実装ガイド作成（Part 1/Part 2）
- [ ] システム仕様書更新（api-ipc-agent.md のステータス更新）

---

## 6. 検証方法

### テストケース

| #   | テストケース                       | 期待結果                                       |
| --- | ---------------------------------- | ---------------------------------------------- |
| 1   | getWorkspacePath() 正常取得        | 設定ストアのアクティブワークスペースパスが返る |
| 2   | getWorkspacePath() 未設定時        | デフォルトパス（cwd）が返る                    |
| 3   | handleGetSelection() 選択あり      | TextSelection型の選択範囲が返る                |
| 4   | handleGetSelection() 選択なし      | nullが返る                                     |
| 5   | handleSendWithContext() 正常生成   | LLM生成結果がresultフィールドに格納される      |
| 6   | handleSendWithContext() サイズ超過 | CONTEXT_TOO_LARGEエラーが返る                  |
| 7   | handleSendWithContext() API失敗    | エラーレスポンスが返る（retryable判定付き）    |

### 検証手順

1. ワークスペースを開いた状態でChat-Edit機能を起動
2. エディタでテキストを選択し、Chat-Editでコード生成をリクエスト
3. 選択範囲がコンテキストとしてLLMに送信され、生成結果が返ることを確認
4. 大量コンテキスト時のサイズ制限エラーを確認

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                               |
| --------------------------------------- | ------ | -------- | -------------------------------------------------- |
| Monaco Editor APIがRendererプロセス専用 | 高     | 高       | IPC通信またはexecuteJavaScript()でRenderer経由取得 |
| LLM APIレート制限                       | 中     | 中       | リトライロジック（Exponential Backoff）を実装      |
| ワークスペース設定ストアの構造変更      | 低     | 低       | インターフェース経由でアクセスし、直接参照を避ける |

---

## 8. 参照情報

### 関連ドキュメント

- システム仕様書: `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- Claude Agent SDK: `.claude/skills/claude-agent-sdk/`
- セキュリティ: `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`
- 既存ハンドラ: `apps/desktop/src/main/handlers/chatEditHandlers.ts`

### 参考資料

- TODO参照: `chatEditHandlers.ts:77` - `// TODO: 実際のワークスペース管理から取得`
- TODO参照: `chatEditHandlers.ts:302` - `// TODO: Monaco Editorとの連携を実装`
- TODO参照: `chatEditHandlers.ts:344` - `// TODO: 実際のLLM連携を実装`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
// L77: TODO: 実際のワークスペース管理から取得
// L302: TODO: Monaco Editorとの連携を実装
// L344: TODO: 実際のLLM連携を実装
```

### 補足事項

- このタスクは3つの独立したTODO項目をまとめているが、それぞれ独立して実装可能。依存関係は `getWorkspacePath` → `handleGetSelection` → `handleSendWithContext` の順。
- handleSendWithContextのLLM連携部分は、Claude Agent SDKスキルの実装状況に依存する。SDKが未実装の場合は、Direct SDKパターン（`@anthropic-ai/sdk`直接呼び出し）をフォールバックとして使用する。
- 既存テスト `chatEditHandlers.test.ts` の `// TODO` コメント（L290: 30秒タイムアウト）もこのタスクのスコープに含める。
