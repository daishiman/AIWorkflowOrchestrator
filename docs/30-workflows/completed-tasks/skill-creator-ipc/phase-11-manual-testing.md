# Phase 11: 手動テスト検証

## メタ情報

| 項目    | 値                         |
| ------- | -------------------------- |
| Phase   | 11                         |
| 機能名  | skill-creator-ipc          |
| 作成日  | 2026-02-12                 |
| 次Phase | Phase 12: ドキュメント更新 |

## 目的

自動テストでは検証できないIPC通信の実環境動作を手動で確認する。Electron開発モードで実際にRenderer → Preload → Main → SkillCreatorServiceの全フローが正常に動作すること、セキュリティ要件（DevToolsからのIPC呼び出し拒否、エラーサニタイズ）が満たされていること、既存skill:\*チャンネルへの影響がないことを検証する。

## 実行タスク

### Task 1: IPC通信テスト — 6チャンネル全ての手動疎通確認

Electron開発モード（`pnpm --filter @repo/desktop dev`）を起動し、DevToolsコンソールから6チャンネル全てのIPC通信を確認する。

#### 1-1. invokeチャンネル疎通確認（5チャンネル）

| チャンネル                      | 呼び出しコード                                                                        | 期待レスポンス                                                                        | 実行結果   |
| ------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| `skill-creator:detect-mode`     | `window.electronAPI.skillCreator.detectMode("test-request")`                          | `{ success: true, data: SkillCreatorMode }` または `{ success: false, error: "..." }` | {{RESULT}} |
| `skill-creator:create`          | `window.electronAPI.skillCreator.create({ name: "test-skill", description: "test" })` | `{ success: true, data: "..." }` または `{ success: false, error: "..." }`            | {{RESULT}} |
| `skill-creator:execute-tasks`   | `window.electronAPI.skillCreator.executeTasks({ skillDir: "/tmp/test", tasks: [] })`  | `{ success: true, data: ExecutionReport }` または `{ success: false, error: "..." }`  | {{RESULT}} |
| `skill-creator:validate`        | `window.electronAPI.skillCreator.validate("/tmp/test-skill")`                         | `{ success: true, data: boolean }` または `{ success: false, error: "..." }`          | {{RESULT}} |
| `skill-creator:validate-schema` | `window.electronAPI.skillCreator.validateSchema("skill-schema", {})`                  | `{ success: true, data: boolean }` または `{ success: false, error: "..." }`          | {{RESULT}} |

#### 1-2. onチャンネル疎通確認（1チャンネル）

| 確認項目                              | 操作手順                                                                                      | 期待結果                                            | 実行結果   |
| ------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------- |
| `skill-creator:progress` リスナー登録 | `window.electronAPI.skillCreator.onProgress((data) => console.log('progress:', data))` を実行 | リスナー登録成功（エラーなし）                      | {{RESULT}} |
| 進捗データ受信確認                    | `skill-creator:create` を実行して進捗が発火するか確認                                         | コンソールに `progress: { ... }` が出力される       | {{RESULT}} |
| 複数回の進捗通知順序                  | 長時間タスクを実行し、進捗通知の順序が保証されるか確認                                        | 進捗値が単調増加（0% → 50% → 100%のように順序通り） | {{RESULT}} |

### Task 2: DevToolsセキュリティテスト — DevToolsからのIPC呼び出し拒否確認

#### 2-1. API公開形式の確認

DevToolsコンソールで以下を実行し、API命名統一を検証する。

| 確認項目                     | 実行コード                                              | 期待結果      | 実行結果   |
| ---------------------------- | ------------------------------------------------------- | ------------- | ---------- |
| 統一APIが存在する            | `typeof window.electronAPI.skillCreator`                | `"object"`    | {{RESULT}} |
| 旧APIが存在しない（P28対策） | `typeof window.skillCreatorAPI`                         | `"undefined"` | {{RESULT}} |
| detectModeが関数             | `typeof window.electronAPI.skillCreator.detectMode`     | `"function"`  | {{RESULT}} |
| createが関数                 | `typeof window.electronAPI.skillCreator.create`         | `"function"`  | {{RESULT}} |
| executeTasksが関数           | `typeof window.electronAPI.skillCreator.executeTasks`   | `"function"`  | {{RESULT}} |
| validateが関数               | `typeof window.electronAPI.skillCreator.validate`       | `"function"`  | {{RESULT}} |
| validateSchemaが関数         | `typeof window.electronAPI.skillCreator.validateSchema` | `"function"`  | {{RESULT}} |
| onProgressが関数             | `typeof window.electronAPI.skillCreator.onProgress`     | `"function"`  | {{RESULT}} |

#### 2-2. ホワイトリスト外チャンネル拒否

| 確認項目                     | 操作手順                                                               | 期待結果                     | 実行結果   |
| ---------------------------- | ---------------------------------------------------------------------- | ---------------------------- | ---------- |
| 未登録チャンネルへのアクセス | DevToolsから `window.electronAPI` 経由で存在しないチャンネルを呼び出す | エラー返却またはメソッド不在 | {{RESULT}} |

#### 2-3. パストラバーサル拒否

| 確認項目             | 操作手順                                                              | 期待結果                                     | 実行結果   |
| -------------------- | --------------------------------------------------------------------- | -------------------------------------------- | ---------- |
| パストラバーサル引数 | `window.electronAPI.skillCreator.validate("../../etc/passwd")` を実行 | バリデーションエラー（パストラバーサル検出） | {{RESULT}} |
| 相対パス引数         | `window.electronAPI.skillCreator.validate("../secret")` を実行        | バリデーションエラー（不正パス検出）         | {{RESULT}} |

### Task 3: エラー表示テスト — 不正引数、タイムアウト、サービスエラー時のRenderer側表示

#### 3-1. 不正引数エラー

| No  | テスト項目    | 操作手順                                                | 期待結果                           | 実行結果   |
| --- | ------------- | ------------------------------------------------------- | ---------------------------------- | ---------- |
| 1   | null引数      | `window.electronAPI.skillCreator.detectMode(null)`      | バリデーションエラーメッセージ返却 | {{RESULT}} |
| 2   | undefined引数 | `window.electronAPI.skillCreator.detectMode(undefined)` | バリデーションエラーメッセージ返却 | {{RESULT}} |
| 3   | 空文字列      | `window.electronAPI.skillCreator.detectMode("")`        | バリデーションエラーメッセージ返却 | {{RESULT}} |
| 4   | 型不一致引数  | `window.electronAPI.skillCreator.detectMode(12345)`     | バリデーションエラーメッセージ返却 | {{RESULT}} |

#### 3-2. エラーサニタイズ確認

| No  | テスト項目             | 確認内容                                                           | 期待結果                     | 実行結果   |
| --- | ---------------------- | ------------------------------------------------------------------ | ---------------------------- | ---------- |
| 1   | 内部ファイルパス非露出 | エラーメッセージに `/Users/` や `C:\` で始まるパスが含まれないこと | パス情報が含まれない         | {{RESULT}} |
| 2   | スタックトレース非露出 | エラーメッセージに `at ` で始まる行が含まれないこと                | スタックトレースが含まれない | {{RESULT}} |
| 3   | 内部状態非露出         | エラーメッセージにサービス内部変数名やクラス名が含まれないこと     | 内部情報が含まれない         | {{RESULT}} |

#### 3-3. タイムアウト動作

| No  | テスト項目             | 操作手順                                              | 期待結果                       | 実行結果   |
| --- | ---------------------- | ----------------------------------------------------- | ------------------------------ | ---------- |
| 1   | 長時間処理タイムアウト | SkillCreatorServiceが応答しない状態をシミュレートする | タイムアウトエラーが返却される | {{RESULT}} |

### Task 4: 進捗通知テスト — 長時間タスクの進捗がRendererに到達するか確認

| No  | テスト項目       | 操作手順                                              | 期待結果                                     | 実行結果   |
| --- | ---------------- | ----------------------------------------------------- | -------------------------------------------- | ---------- |
| 1   | 進捗リスナー登録 | `onProgress` でリスナーを登録する                     | エラーなくリスナー登録完了                   | {{RESULT}} |
| 2   | 進捗イベント受信 | `create` または `executeTasks` を実行する             | コンソールに進捗イベントが出力される         | {{RESULT}} |
| 3   | 進捗データ形式   | 受信した進捗データの構造を確認する                    | `{ progress: number, message: string }` 形式 | {{RESULT}} |
| 4   | 複数リスナー     | 2つのリスナーを登録して両方にイベントが届くか確認する | 両方のリスナーにイベント到達                 | {{RESULT}} |

### Task 5: アクセシビリティ検証 — Preload APIのレスポンス遅延測定（500ms以内）

| No  | テスト項目             | 操作手順                                                                                                           | 期待結果  | 実行結果   |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------ | --------- | ---------- |
| 1   | detectMode応答速度     | `console.time('dm'); window.electronAPI.skillCreator.detectMode("test").then(() => console.timeEnd('dm'))`         | 500ms以内 | {{RESULT}} |
| 2   | validate応答速度       | `console.time('v'); window.electronAPI.skillCreator.validate("/tmp/test").then(() => console.timeEnd('v'))`        | 500ms以内 | {{RESULT}} |
| 3   | validateSchema応答速度 | `console.time('vs'); window.electronAPI.skillCreator.validateSchema("test", {}).then(() => console.timeEnd('vs'))` | 500ms以内 | {{RESULT}} |

## 参照資料

| 資料名                   | パス                                                                              | 説明                                             |
| ------------------------ | --------------------------------------------------------------------------------- | ------------------------------------------------ |
| スキルIPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | validatePath、safeInvoke/safeOn、3層セキュリティ |
| SkillCreatorService仕様  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | API仕様、型定義、SkillCreatorMode                |
| IPC・永続化パターン      | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`       | Pattern 3、registerAllIpcHandlers                |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender検証、CSP、BrowserWindow設定               |
| Agent Dashboard IPC      | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | 既存チャンネル命名一貫性                         |
| Phase 10 成果物          | `docs/30-workflows/skill-creator-ipc/outputs/phase-10/`                           | 最終レビュー結果                                 |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                              | P28: 手動テストでの削除確認忘れ                  |

## 実行手順

### 手順 1: テスト環境セットアップ

1. `pnpm --filter @repo/desktop dev` でElectron開発モードを起動する
2. DevToolsコンソールを開く（`Cmd+Option+I`）
3. テスト結果記録用テンプレートを準備する

### 手順 2: 機能テスト実行（Task 1）

1. invokeチャンネル5つの正常系疎通を確認する
2. onチャンネル1つの進捗通知受信を確認する
3. 全チャンネルのレスポンス形式が仕様通りか確認する

### 手順 3: セキュリティテスト実行（Task 2）

1. API命名統一確認（`window.electronAPI.skillCreator` 存在、`window.skillCreatorAPI` 不在）
2. ホワイトリスト外チャンネル拒否確認
3. パストラバーサル拒否確認

### 手順 4: エラーハンドリングテスト実行（Task 3）

1. 不正引数（null、undefined、空文字列、型不一致）のエラーレスポンスを確認する
2. エラーメッセージのサニタイズを確認する
3. タイムアウト動作を確認する

### 手順 5: 進捗通知テスト実行（Task 4）

1. リスナー登録・イベント受信・データ形式を確認する
2. 複数リスナーの動作を確認する

### 手順 6: パフォーマンス測定実行（Task 5）

1. 各APIの応答速度を測定する（500ms以内が基準）

### 手順 7: リグレッションテスト実行

1. 既存skill:\*チャンネル（`skill:list`, `skill:execute`, `skill:import`）が正常動作することを確認する
2. 既存Agent SDK IPC通信が正常動作することを確認する

### 手順 8: テスト結果レポート作成

1. 全テスト結果をまとめて `manual-test-result.md` に記録する
2. 発見された課題を `discovered-issues.md` に記録する

## テストカテゴリ別テストケース一覧

### カテゴリ 1: 機能テスト

| No   | カテゴリ | テスト項目             | 前提条件                   | 操作手順                                                                       | 期待結果                                    | 実行結果   | 備考 |
| ---- | -------- | ---------------------- | -------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------- | ---------- | ---- |
| F-01 | 正常系   | detectMode正常応答     | Electron開発モード起動済み | DevToolsで `window.electronAPI.skillCreator.detectMode("test")` 実行           | `{ success: true, data: ... }` が返却される | {{RESULT}} | -    |
| F-02 | 正常系   | create正常応答         | Electron開発モード起動済み | DevToolsで `window.electronAPI.skillCreator.create({...})` 実行                | `{ success: true, data: ... }` が返却される | {{RESULT}} | -    |
| F-03 | 正常系   | executeTasks正常応答   | Electron開発モード起動済み | DevToolsで `window.electronAPI.skillCreator.executeTasks({...})` 実行          | `{ success: true, data: ... }` が返却される | {{RESULT}} | -    |
| F-04 | 正常系   | validate正常応答       | Electron開発モード起動済み | DevToolsで `window.electronAPI.skillCreator.validate("/path")` 実行            | `{ success: true, data: ... }` が返却される | {{RESULT}} | -    |
| F-05 | 正常系   | validateSchema正常応答 | Electron開発モード起動済み | DevToolsで `window.electronAPI.skillCreator.validateSchema("schema", {})` 実行 | `{ success: true, data: ... }` が返却される | {{RESULT}} | -    |
| F-06 | 正常系   | progress受信           | onProgressリスナー登録済み | createまたはexecuteTasksを実行                                                 | 進捗イベントがリスナーに到達                | {{RESULT}} | -    |
| F-07 | 異常系   | null引数               | Electron開発モード起動済み | `detectMode(null)` 実行                                                        | バリデーションエラー返却                    | {{RESULT}} | -    |
| F-08 | 異常系   | undefined引数          | Electron開発モード起動済み | `detectMode(undefined)` 実行                                                   | バリデーションエラー返却                    | {{RESULT}} | -    |
| F-09 | 境界値   | 空文字列               | Electron開発モード起動済み | `detectMode("")` 実行                                                          | バリデーションエラー返却                    | {{RESULT}} | -    |
| F-10 | 状態遷移 | 複数回連続呼び出し     | Electron開発モード起動済み | 同一チャンネルを5回連続呼び出し                                                | 全て正常応答                                | {{RESULT}} | -    |

### カテゴリ 2: セキュリティテスト

| No   | カテゴリ             | テスト項目                 | 前提条件                   | 操作手順                                             | 期待結果                   | 実行結果   | 備考    |
| ---- | -------------------- | -------------------------- | -------------------------- | ---------------------------------------------------- | -------------------------- | ---------- | ------- |
| S-01 | DevTools拒否         | 旧API不在確認              | Electron開発モード起動済み | `typeof window.skillCreatorAPI` を確認               | `"undefined"`              | {{RESULT}} | P28対策 |
| S-02 | 未登録チャンネル拒否 | 存在しないメソッド呼び出し | Electron開発モード起動済み | `window.electronAPI.skillCreator.nonExistent()` 実行 | TypeError（メソッド不在）  | {{RESULT}} | -       |
| S-03 | パストラバーサル拒否 | 相対パス引数               | Electron開発モード起動済み | `validate("../../etc/passwd")` 実行                  | バリデーションエラー       | {{RESULT}} | -       |
| S-04 | エラーサニタイズ     | 内部パス非露出             | エラーレスポンス取得済み   | エラーメッセージ内容を確認                           | `/Users/` パスが含まれない | {{RESULT}} | -       |
| S-05 | エラーサニタイズ     | スタックトレース非露出     | エラーレスポンス取得済み   | エラーメッセージ内容を確認                           | `at ` 行が含まれない       | {{RESULT}} | -       |

### カテゴリ 3: 統合テスト

| No   | カテゴリ     | テスト項目      | 前提条件                   | 操作手順                        | 期待結果                     | 実行結果   | 備考 |
| ---- | ------------ | --------------- | -------------------------- | ------------------------------- | ---------------------------- | ---------- | ---- |
| I-01 | IPC往復      | 全チャンネルE2E | Electron開発モード起動済み | 6チャンネル全てを順次実行       | 全チャンネルでレスポンス返却 | {{RESULT}} | -    |
| I-02 | 進捗リスナー | onProgress受信  | リスナー登録済み           | createを実行して進捗を確認      | 進捗イベント到達             | {{RESULT}} | -    |
| I-03 | 応答速度     | 500ms以内       | Electron開発モード起動済み | console.timeで各API呼び出し計測 | 全API 500ms以内              | {{RESULT}} | -    |

### カテゴリ 4: リグレッションテスト

| No   | カテゴリ | テスト項目              | 前提条件                   | 操作手順                   | 期待結果             | 実行結果   | 備考 |
| ---- | -------- | ----------------------- | -------------------------- | -------------------------- | -------------------- | ---------- | ---- |
| R-01 | 既存機能 | skill:listチャンネル    | Electron開発モード起動済み | 既存スキル一覧取得を実行   | 正常動作（変化なし） | {{RESULT}} | -    |
| R-02 | 既存機能 | skill:executeチャンネル | Electron開発モード起動済み | 既存スキル実行を試行       | 正常動作（変化なし） | {{RESULT}} | -    |
| R-03 | 既存機能 | skill:importチャンネル  | Electron開発モード起動済み | 既存スキルインポートを試行 | 正常動作（変化なし） | {{RESULT}} | -    |
| R-04 | 既存機能 | Agent SDK IPC           | Electron開発モード起動済み | Agent関連IPCを実行         | 正常動作（変化なし） | {{RESULT}} | -    |

## 統合テスト連携【必須】

| テスト項目         | 確認内容                   | 期待結果                                                                              | 実行結果   |
| ------------------ | -------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| IPC接続            | 6チャンネル疎通            | 全チャンネルレスポンス返却                                                            | {{RESULT}} |
| セキュリティ       | DevToolsからの呼び出し     | `window.electronAPI.skillCreator` 経由のみ許可、`window.skillCreatorAPI` は undefined | {{RESULT}} |
| 進捗通知           | skill-creator:progress受信 | Rendererにイベント到達                                                                | {{RESULT}} |
| エラーハンドリング | 不正引数送信               | サニタイズされたエラーメッセージ（内部パス・スタックトレース非露出）                  | {{RESULT}} |
| 既存機能           | skill:\*チャンネル動作     | 変化なし                                                                              | {{RESULT}} |

## 多角的チェック観点

| 観点           | 確認内容                                                                    | 判定基準                                     |
| -------------- | --------------------------------------------------------------------------- | -------------------------------------------- |
| 機能完全性     | 6チャンネル全ての正常系・異常系が手動確認済みか                             | 全テストケースが PASS                        |
| セキュリティ   | API命名統一、ホワイトリスト、パストラバーサル、エラーサニタイズが確認済みか | セキュリティテスト全 PASS                    |
| パフォーマンス | 全APIの応答時間が500ms以内か                                                | 計測値が基準内                               |
| リグレッション | 既存skill:\*チャンネルに影響がないか                                        | リグレッションテスト全 PASS                  |
| ユーザビリティ | エラーメッセージがユーザーに理解可能な内容か                                | エラーメッセージが具体的で対処方法が推測可能 |

## 成果物

| 成果物           | パス                                     | 説明                               |
| ---------------- | ---------------------------------------- | ---------------------------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md` | 全テストケースの実行結果記録       |
| 発見課題レポート | `outputs/phase-11/discovered-issues.md`  | テスト中に発見された課題の詳細記録 |

## 完了条件

- [ ] 全invokeチャンネル（5チャンネル）の正常系・異常系が手動確認済み
- [ ] onチャンネル（skill-creator:progress）の受信が手動確認済み
- [ ] API命名統一確認済み（`window.electronAPI.skillCreator` 存在、`window.skillCreatorAPI` は undefined）
- [ ] DevToolsからのホワイトリスト外チャンネルアクセス拒否確認済み
- [ ] パストラバーサル引数の拒否確認済み
- [ ] エラーサニタイズ確認済み（内部パス非露出、スタックトレース非露出）
- [ ] 不正引数（null, undefined, 空文字列, 型不一致）のエラーレスポンス確認済み
- [ ] 進捗通知のリスナー登録・イベント受信・データ形式確認済み
- [ ] 全APIの応答速度が500ms以内であることを計測確認済み
- [ ] 既存skill:\*チャンネルへの影響がないことを確認済み
- [ ] 手動テスト結果レポート（`manual-test-result.md`）が作成済み
- [ ] 発見課題レポート（`discovered-issues.md`）が作成済み
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスクID | タスク名                             | 依存関係                           | ステータス |
| ------------ | ------------------------------------ | ---------------------------------- | ---------- |
| 11-1         | IPC通信テスト（6チャンネル疎通）     | なし                               | 未着手     |
| 11-2         | DevToolsセキュリティテスト           | 11-1                               | 未着手     |
| 11-3         | エラー表示テスト                     | 11-1                               | 未着手     |
| 11-4         | 進捗通知テスト                       | 11-1                               | 未着手     |
| 11-5         | アクセシビリティ検証（応答速度測定） | 11-1                               | 未着手     |
| 11-6         | リグレッションテスト                 | 11-1                               | 未着手     |
| 11-7         | テスト結果レポート作成               | 11-1, 11-2, 11-3, 11-4, 11-5, 11-6 | 未着手     |

## タスク100%実行確認【必須】

| 確認項目                                                   | ステータス |
| ---------------------------------------------------------- | ---------- |
| Task 1（IPC通信テスト）全テストケース実行完了              | [ ]        |
| Task 2（DevToolsセキュリティテスト）全テストケース実行完了 | [ ]        |
| Task 3（エラー表示テスト）全テストケース実行完了           | [ ]        |
| Task 4（進捗通知テスト）全テストケース実行完了             | [ ]        |
| Task 5（アクセシビリティ検証）全測定完了                   | [ ]        |
| リグレッションテスト全テストケース実行完了                 | [ ]        |
| 手動テスト結果レポート作成完了                             | [ ]        |
| 発見課題レポート作成完了                                   | [ ]        |

## 次のPhase

[Phase 12: ドキュメント更新](phase-12-documentation.md)
