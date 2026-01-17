# 受け入れ基準書 - slide-agent-sdk-integration

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | task-imp-slide-agent-sdk-integration-001 |
| Phase      | 1                                        |
| 作成日     | 2026-01-17                               |
| ステータス | 完了                                     |

---

## 概要

本ドキュメントは、各機能要件（FR）および非機能要件（NFR）に対する検証可能な受け入れ基準を定義する。
各基準はGiven-When-Then形式で記述し、テスト実装時の参照とする。

---

## 機能要件の受け入れ基準

### AC-01: skill-executor.executeによるAgent SDK呼び出し

| 項目   | 内容                                                                     |
| ------ | ------------------------------------------------------------------------ |
| 要件ID | FR-01                                                                    |
| 説明   | skill-executor.executeを呼び出すと、Agent SDKのqueryメソッドが実行される |

**Given-When-Then**:

```gherkin
Given Agent SDKが初期化されている
  And APIキーがsafeStorageに保存されている
When skill-executor.execute('html', '/path/to/project') を呼び出す
Then Agent SDKのqueryメソッドが呼び出される
  And スキル名 'html-generator' がプロンプトに含まれる
  And projectPath '/path/to/project' がコンテキストとして渡される
```

**検証方法**: ユニットテスト（モック使用）

---

### AC-02: agent-client.queryによる実HTTPS通信

| 項目   | 内容                                                                                  |
| ------ | ------------------------------------------------------------------------------------- |
| 要件ID | FR-02                                                                                 |
| 説明   | agent-client.queryを呼び出すと、実際のHTTPS通信がClaude Agent SDKサーバーに送信される |

**Given-When-Then**:

```gherkin
Given Agent SDKクライアントが初期化されている
  And 有効なAPIキーが設定されている
When agent-client.query({ prompt: "test", options: {} }) を呼び出す
Then Anthropic APIサーバーへのHTTPS POSTリクエストが送信される
  And レスポンスがModifierAgentQueryResponse形式で返却される
```

**検証方法**: 統合テスト（実APIまたはモックサーバー）

---

### AC-03: スキルフェーズのマッピング

| 項目   | 内容                                                                  |
| ------ | --------------------------------------------------------------------- |
| 要件ID | FR-03                                                                 |
| 説明   | 各スキルフェーズがAgent SDKスキル名に正しくマッピングされて実行される |

**Given-When-Then**:

```gherkin
Given スキルフェーズが以下のいずれかである
  | phase     | expectedSkillName    |
  | hearing   | hearing-facilitator  |
  | structure | structure-designer   |
  | html      | html-generator       |
  | modifier  | slide-modifier       |
When skill-executor.execute(phase, projectPath) を呼び出す
Then 対応するスキル名がAgent SDKに渡される
```

**検証方法**: ユニットテスト

---

### AC-04: projectPathパラメータの伝播

| 項目   | 内容                                                                   |
| ------ | ---------------------------------------------------------------------- |
| 要件ID | FR-04                                                                  |
| 説明   | projectPathパラメータがAgent SDKリクエストのコンテキストとして含まれる |

**Given-When-Then**:

```gherkin
Given プロジェクトパスが '/home/user/slides' である
When skill-executor.execute('html', '/home/user/slides') を呼び出す
Then Agent SDKリクエストのsystemPromptまたはコンテキストに
     '/home/user/slides' が含まれる
```

**検証方法**: ユニットテスト（モック使用）

---

### AC-05: 進捗コールバックによるUI反映

| 項目   | 内容                                                                      |
| ------ | ------------------------------------------------------------------------- |
| 要件ID | FR-05                                                                     |
| 説明   | スキル実行中に進捗（0%, 25%, 50%, 100%）がSyncStatusIndicatorに反映される |

**Given-When-Then**:

```gherkin
Given 進捗コールバックが登録されている
When skill-executor.execute('html', projectPath) を実行する
Then 進捗コールバックが以下の順で呼び出される
  | progress |
  | 0        |
  | 25       |
  | 50       |
  | 100      |
  And 各進捗値がSyncStatusIndicatorコンポーネントに反映される
```

**検証方法**: ユニットテスト + UIテスト

---

### AC-06: キャンセル機能の動作

| 項目   | 内容                                                                        |
| ------ | --------------------------------------------------------------------------- |
| 要件ID | FR-06                                                                       |
| 説明   | cancel()呼び出しでAbortController.abortが発火し、実行中のクエリが中断される |

**Given-When-Then**:

```gherkin
Given skill-executor.execute() が実行中である
When skill-executor.cancel() を呼び出す
Then AbortController.abort() が発火する
  And 実行中のAgent SDKクエリが中断される
  And execute()の戻り値に error: "Cancelled" が含まれる
  And isExecuting() が false を返す
```

**検証方法**: ユニットテスト

---

### AC-07: ModifierSkillによる逆同期

| 項目   | 内容                                                              |
| ------ | ----------------------------------------------------------------- |
| 要件ID | FR-07                                                             |
| 説明   | HTML変更検知時にModifierSkillが実行され、structure.mdが更新される |

**Given-When-Then**:

```gherkin
Given index.html（Reveal.js）が存在する
  And structure.mdが存在する
  And FileWatcherがindex.htmlを監視している
When index.htmlに変更が発生する（ユーザー編集）
Then FileWatcherがonHtmlChangeを発火する
  And SyncManagerがreverseSync()を呼び出す
  And SkillExecutorがModifierSkillを実行する
  And Agent SDKがHTML解析を行う
  And structure.mdが更新される
```

**検証方法**: 統合テスト + 手動テスト

---

## 非機能要件の受け入れ基準

### AC-08: 30秒タイムアウト

| 項目   | 内容                                                                       |
| ------ | -------------------------------------------------------------------------- |
| 要件ID | NFR-01                                                                     |
| 説明   | 30秒経過後にタイムアウトエラーが発生し、適切なエラーメッセージが表示される |

**Given-When-Then**:

```gherkin
Given Agent SDKの応答が30秒以上かかる状況である（モック）
When agent-client.query() を呼び出す
Then 30000ms経過後にタイムアウトエラーが発生する
  And エラーメッセージに "Request timeout" が含まれる
  And 実行状態が 'error' に変更される
```

**検証方法**: ユニットテスト（タイマーモック使用）

---

### AC-09: APIキーのsafeStorage暗号化

| 項目   | 内容                                                  |
| ------ | ----------------------------------------------------- |
| 要件ID | NFR-02                                                |
| 説明   | APIキーがElectron safeStorageで暗号化されて保存される |

**Given-When-Then**:

```gherkin
Given Electron safeStorageが利用可能である
When APIキーを保存する
Then safeStorage.encryptString() が呼び出される
  And 暗号化されたデータが永続化される
When APIキーを取得する
Then safeStorage.decryptString() が呼び出される
  And 復号化されたAPIキーが返却される
```

**検証方法**: 手動テスト（Phase 11）

---

### AC-10: エラーメッセージ表示

| 項目   | 内容                                                  |
| ------ | ----------------------------------------------------- |
| 要件ID | NFR-03                                                |
| 説明   | SDK呼び出し失敗時に、UIにエラーメッセージが表示される |

**Given-When-Then**:

```gherkin
Given Agent SDK呼び出しが失敗する状況である
When skill-executor.execute() を呼び出す
Then 実行結果に success: false が含まれる
  And error フィールドに具体的なエラーメッセージが含まれる
  And slide:sync-error IPCイベントが発火する
  And UIにエラーメッセージが表示される
```

**検証方法**: ユニットテスト + UIテスト

---

### AC-11: メモリリーク防止

| 項目   | 内容                                               |
| ------ | -------------------------------------------------- |
| 要件ID | NFR-04                                             |
| 説明   | 繰り返しスキル実行後もメモリ使用量が増加し続けない |

**Given-When-Then**:

```gherkin
Given 初期メモリ使用量を記録する
When skill-executor.execute() を100回連続で実行する
Then 終了時のメモリ使用量が初期値の105%以下である
  And 保留中のPromiseが0件である
  And 登録されたリスナーがリークしていない
```

**検証方法**: パフォーマンステスト

---

## 受け入れ基準サマリー

| AC ID | 要件ID | 検証方法                  | 優先度 |
| ----- | ------ | ------------------------- | ------ |
| AC-01 | FR-01  | ユニットテスト            | 高     |
| AC-02 | FR-02  | 統合テスト                | 高     |
| AC-03 | FR-03  | ユニットテスト            | 高     |
| AC-04 | FR-04  | ユニットテスト            | 中     |
| AC-05 | FR-05  | ユニットテスト + UIテスト | 中     |
| AC-06 | FR-06  | ユニットテスト            | 高     |
| AC-07 | FR-07  | 統合テスト + 手動テスト   | 高     |
| AC-08 | NFR-01 | ユニットテスト            | 高     |
| AC-09 | NFR-02 | 手動テスト                | 高     |
| AC-10 | NFR-03 | ユニットテスト + UIテスト | 中     |
| AC-11 | NFR-04 | パフォーマンステスト      | 中     |

---

## 次のステップ

Phase 2: 設計 - 受け入れ基準を満たすためのアーキテクチャ設計・API設計を実施

---

**作成日**: 2026-01-17
**Phase 1 タスク2 完了**
