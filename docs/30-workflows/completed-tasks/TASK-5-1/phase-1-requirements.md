# Phase 1: 要件定義

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 1                         |
| タスクID | TASK-5-1                  |
| タスク名 | SkillAPI 実装（Preload）  |
| 機能名   | skill-import-agent-system |
| 作成日   | 2026-01-27                |

## 目的

Renderer プロセスから安全に IPC 通信を行うための Preload API を定義し、要件・受け入れ基準を明確化する。

## 実行タスク

- 要件抽出: タスク仕様書から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名            | パス                                                                                        | 説明              |
| ----------------- | ------------------------------------------------------------------------------------------- | ----------------- |
| タスク仕様書      | `docs/30-workflows/skill-import-agent-system/tasks/task-5-1-skill-api.md`                   | 元タスク仕様      |
| システム仕様書    | `docs/30-workflows/skill-import-agent-system/specification.md`                              | システム全体仕様  |
| TASK-4-1          | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-4-1-ipc-channels.md` | IPCチャネル定義   |
| TASK-4-2          | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-4-2-ipc-handlers.md` | IPCハンドラー実装 |
| 既存Preload API   | `apps/desktop/src/preload/index.ts`                                                         | 既存パターン参照  |
| IPC永続化パターン | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | IPC実装パターン   |

---

## 機能要件（FR）

### FR-1: SkillAPI インターフェース定義

| ID     | 要件                                          | 優先度 |
| ------ | --------------------------------------------- | ------ |
| FR-1.1 | `SkillAPI` インターフェースが型定義されている | 高     |
| FR-1.2 | 全APIメソッドが `SkillAPI` に定義されている   | 高     |
| FR-1.3 | TypeScript の型安全性が確保されている         | 高     |

### FR-2: スキル実行API

| ID     | 要件                                                    | 優先度 |
| ------ | ------------------------------------------------------- | ------ |
| FR-2.1 | `execute(request)`: スキル実行を開始できる              | 高     |
| FR-2.2 | `abort(executionId)`: 実行中のスキルを中断できる        | 高     |
| FR-2.3 | `getExecutionStatus(executionId)`: 実行状態を取得できる | 中     |

### FR-3: ストリーミングイベント

| ID     | 要件                                                       | 優先度 |
| ------ | ---------------------------------------------------------- | ------ |
| FR-3.1 | `onStream(callback)`: ストリーミングメッセージを受信できる | 高     |
| FR-3.2 | イベントリスナーのクリーンアップ関数を返す                 | 高     |

### FR-4: 権限確認API

| ID     | 要件                                                            | 優先度 |
| ------ | --------------------------------------------------------------- | ------ |
| FR-4.1 | `onPermissionRequest(callback)`: 権限確認リクエストを購読できる | 高     |
| FR-4.2 | `sendPermissionResponse(response)`: 権限確認応答を送信できる    | 高     |

### FR-5: window.electronAPI への公開

| ID     | 要件                                               | 優先度 |
| ------ | -------------------------------------------------- | ------ |
| FR-5.1 | `window.skillAPI` としてグローバルに公開されている | 高     |
| FR-5.2 | `contextBridge.exposeInMainWorld` を使用している   | 高     |

---

## 非機能要件（NFR）

### NFR-1: セキュリティ

| ID      | 要件                                                | 優先度 |
| ------- | --------------------------------------------------- | ------ |
| NFR-1.1 | 許可されたIPCチャネルのみアクセス可能（safeInvoke） | 高     |
| NFR-1.2 | 許可されたイベントチャネルのみ購読可能（safeOn）    | 高     |
| NFR-1.3 | `contextIsolation: true` 環境で動作する             | 高     |

### NFR-2: 品質

| ID      | 要件                                          | 優先度 |
| ------- | --------------------------------------------- | ------ |
| NFR-2.1 | TypeScript コンパイルエラーがない             | 高     |
| NFR-2.2 | 既存の `safeInvoke` / `safeOn` パターンに準拠 | 高     |
| NFR-2.3 | 単体テストカバレッジ 80% 以上                 | 中     |

### NFR-3: 互換性

| ID      | 要件                                         | 優先度 |
| ------- | -------------------------------------------- | ------ |
| NFR-3.1 | 既存の `electronAPI` パターンとの整合性      | 高     |
| NFR-3.2 | Electron Preload Script として正しく動作する | 高     |

---

## アーキテクチャ層別要件

| 層               | 要件                                        |
| ---------------- | ------------------------------------------- |
| Preload          | `contextBridge` を使用してセキュアにAPI公開 |
| IPC通信          | TASK-4-1で定義されたチャネルを使用          |
| Renderer Process | `window.skillAPI` からAPIを呼び出し可能     |
| Main Process     | TASK-4-2で実装されたハンドラーと通信        |

---

## 受け入れ基準（AC）

### AC-1: SkillAPI インターフェース

```gherkin
Scenario: SkillAPIインターフェースが正しく定義されている
  Given SkillAPI インターフェースが定義されている
  When TypeScript コンパイルを実行する
  Then コンパイルエラーがないこと
  And 全APIメソッドが型定義されていること
```

### AC-2: スキル実行

```gherkin
Scenario: スキルを実行できる
  Given Renderer プロセスが起動している
  When window.skillAPI.execute(request) を呼び出す
  Then IPC経由でMain Processに実行リクエストが送信されること
  And executionId を含むレスポンスが返ること
```

### AC-3: ストリーミング受信

```gherkin
Scenario: ストリーミングメッセージを受信できる
  Given スキルが実行中である
  When Main ProcessからストリーミングメッセージがIPCで送信される
  Then onStream で登録したコールバックが呼び出されること
```

### AC-4: 権限確認

```gherkin
Scenario: 権限確認リクエストを受信・応答できる
  Given スキル実行中に権限確認が必要になった
  When Main Processから権限確認リクエストが送信される
  Then onPermissionRequest で登録したコールバックが呼び出されること
  And sendPermissionResponse で応答を送信できること
```

### AC-5: セキュリティ

```gherkin
Scenario: 許可されていないチャネルへのアクセスが拒否される
  Given 許可リストにないチャネルがある
  When そのチャネルに対してinvokeを試みる
  Then エラーが返されること
```

---

## 接続要件

| カテゴリ     | 内容                                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| API接続      | IPC Channels: `skill:execute`, `skill:abort`, `skill:stream`, `skill:permission:*` |
| データフロー | Renderer → Preload → IPC → Main → Service                                          |
| セキュリティ | `ALLOWED_INVOKE_CHANNELS`, `ALLOWED_ON_CHANNELS` でホワイトリスト制御              |

---

## 成果物

| 成果物       | パス                                         | 説明           |
| ------------ | -------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 本ドキュメント |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC一覧         |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲       |

---

## 完了条件

- [ ] 全要件が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] 接続要件（IPC/データフロー）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 2: 設計
