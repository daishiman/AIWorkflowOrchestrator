# Phase 5 成果物: 設計変更記録

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-9B      |
| Phase      | 5            |
| 成果物     | 設計変更記録 |
| 作成日     | 2026-02-26   |
| ステータス | 完了         |

## 設計変更一覧

### DC-001: executeTasks シグネチャ統合

- **Phase 2 設計**: `executeTasks(tasksDir: string, options: ExecuteTasksOptions)`
- **Phase 5 実装**: `executeTasks(options: ExecuteTasksOptions)`（`tasksDir` は `ExecuteTasksOptions` に統合）
- **理由**: `ExecuteTasksOptions` 型に既に `tasksDir: string` フィールドが定義されていたため、引数の重複を解消。型定義と実装の一致を優先した
- **影響範囲**: 統合テスト（INT-002, INT-003, INT-004）の呼び出しを修正

### DC-002: createSkill 戻り値の型

- **Phase 2 設計**: `Promise<{ skillDir: string }>` （オブジェクト形式）
- **Phase 5 実装**: `Promise<string>` （文字列直接返却）
- **理由**: ScriptExecutor の出力パスをそのまま返す方がシンプル。ラッパーオブジェクトは不要
- **影響範囲**: 統合テスト（INT-001）の戻り値参照を修正

### DC-003: validateWithSchema 戻り値の型

- **Phase 2 設計**: `Promise<object>` （検証結果オブジェクト）
- **Phase 5 実装**: `Promise<boolean>` （検証成否のみ）
- **理由**: ScriptExecutor のバイナリ結果（成功/失敗）をそのまま返すシンプルな設計
- **影響範囲**: 統合テスト（INT-005）の型アサーションを修正

### DC-004: IPC-010 テストアサーション修正

- **Phase 4 設計**: `expect(result.success).toBe(false)` （戻り値チェック）
- **Phase 5 実装**: `expect(...).rejects.toBeDefined()` （例外チェック）
- **理由**: `validateIpcSender` 失敗時は `toIPCValidationError()` で throw されるため、Promise rejection をアサーションする必要がある
- **影響範囲**: IPC-010テストケースのみ

### DC-005: サブコンポーネントの DI パターン

- **Phase 2 設計**: Constructor Injection
- **Phase 5 実装**: Setter Injection（CodeGenerator, ApiIntegrator）
- **理由**: ScriptExecutor への依存を遅延初期化で注入（P34準拠）。HearingFacilitator, TaskGenerator は外部依存なしのため DI 不要

## テスト結果サマリー

| テストファイル                          | テスト数 | 結果                        |
| --------------------------------------- | -------- | --------------------------- |
| SkillCreatorService.test.ts             | 42       | 全PASS                      |
| HearingFacilitator.test.ts              | 6        | 全PASS                      |
| TaskGenerator.test.ts                   | 7        | 全PASS                      |
| CodeGenerator.test.ts                   | 5        | 全PASS                      |
| Validator.test.ts                       | 7        | 全PASS                      |
| skillCreatorHandlers.validation.test.ts | 12       | 全PASS                      |
| SkillCreatorService.integration.test.ts | 15       | 11PASS / 4FAIL（Red-state） |
| **合計**                                | **94**   | **90 PASS / 4 FAIL**        |

### Red-state 統合テスト（Phase 6以降で Green 化予定）

| テストID | 失敗理由                                                           |
| -------- | ------------------------------------------------------------------ |
| INT-001  | createSkill の create モードが実スクリプト（ScriptExecutor）を要求 |
| INT-002  | executeTasks が実タスクファイルの ScriptExecutor 実行を要求        |
| INT-003  | INT-002 と同様（エラーリカバリシナリオ）                           |
| INT-004  | executeTasks のドライラン実行が estimatedTime を未設定で返す       |

## 新規作成ファイル

| ファイル              | 責務                                                         |
| --------------------- | ------------------------------------------------------------ |
| HearingFacilitator.ts | ユーザーインタビュー（MAX_QUESTIONS=10, P42準拠）            |
| TaskGenerator.ts      | タスク生成・依存解決・トポロジカルソート（Kahn's algorithm） |
| CodeGenerator.ts      | テンプレート変数置換・SDK連携コード生成                      |
| ApiIntegrator.ts      | RESTクライアント・Webhook生成・認証設定                      |
| SkillValidator.ts     | 構造検証・セキュリティ検証・スキーマ検証                     |

## 修正ファイル

| ファイル                | 変更内容                               |
| ----------------------- | -------------------------------------- |
| SkillCreatorService.ts  | 入力バリデーション追加 + 7新メソッド   |
| skillCreatorHandlers.ts | 7新IPCハンドラー + unregister更新      |
| skill-creator-api.ts    | 7新Preload APIメソッド                 |
| channels.ts             | 7新チャンネル定数 + ホワイトリスト登録 |
| skillCreator.ts         | 10新型定義 + CreateSkillOptions拡張    |
| types/index.ts          | 新型のre-export追加                    |
