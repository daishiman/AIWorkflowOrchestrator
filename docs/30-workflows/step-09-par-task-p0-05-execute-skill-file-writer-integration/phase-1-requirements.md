# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 1                                     |
| 機能名 | execute-skill-file-writer-integration |
| 作成日 | 2026-03-29                            |

## 目的

`execute()` 内の LLM 応答解析 → `SkillFileWriter.persist()` 連携の要件を固定する。

## タスク分類

| 項目           | 値            |
| -------------- | ------------- |
| タスク種別     | 機能追加      |
| UI task        | No            |
| docs-only task | No            |
| コード変更     | Yes（Main層） |

## P50チェック: 既実装状態の調査

### 対象ファイルの現状

| ファイル                       | 現状                                                                                                                                                                  | TASK-P0-05 での扱い                                                                        |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `RuntimeSkillCreatorFacade.ts` | `execute()` は `SkillExecutor` に委譲後、SDKイベントを正規化して `SkillExecuteResult` を返す。`skillFileWriter` は DI されているが `execute()` 内で一切使われていない | LLM 応答からコードブロック抽出 → `SkillGeneratedContent` 変換 → `persist()` 呼び出しを追加 |
| `SkillFileWriter.ts`           | `persist(skillName, content, options?)` が完成済み。バリデーション + ロールバック + パス横断防止を備える                                                              | 変更不要。呼び出し側のみ実装                                                               |
| `skillCreator.ts`              | `SkillGeneratedContent` 型（`skillMd`, `agents[]`, `scripts[]`, `references[]`）が定義済み。`RuntimeSkillCreatorExecuteResult` に persist 結果フィールドなし          | `ExecuteResult` に書き出し結果フィールドを追加                                             |

### P50判定

| 判定     | 根拠                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| 新規実装 | `execute()` 内で `SkillFileWriter` は一切呼ばれていない。LLM応答パーサーも未実装。型拡張も未実施 |

## 実行タスク

### Task 1-1: execute() の現行フロー確認

**対象**: `RuntimeSkillCreatorFacade.ts` lines 468-580

現行の `execute()` フロー:

1. `SkillExecutionRequest` を生成
2. `skillExecutor.execute(request, skillMeta)` に委譲
3. SDK メッセージを `normalizeSkillCreatorSdkEvents()` で正規化
4. 最終結果/エラーイベントを抽出
5. `SkillExecuteResult` を返す

**未使用箇所**: Step 2 の後、`SkillExecutor` からの応答に含まれる LLM 生成コンテンツがファイルシステムに書き出されないまま、SDKイベントの正規化のみ行われる。

### Task 1-2: LLM 応答フォーマット確認

LLM 応答は SDK メッセージとして返される。`normalizeSkillCreatorSdkEvents()` により以下のイベント型に正規化:

| イベント型  | 説明                                  |
| ----------- | ------------------------------------- |
| `init`      | セッション初期化                      |
| `assistant` | LLM応答テキスト（コードブロック含む） |
| `result`    | 実行完了結果                          |
| `error`     | エラー                                |

コードブロック抽出は `assistant` イベントの `text` フィールドから行う。期待フォーマット:

````
```typescript
// SKILL.md content
```

```typescript
// agents/xxx.md content
```
````

### Task 1-3: SkillGeneratedContent 型の現状と拡張要件

**現行定義** (`skillCreator.ts`):

```typescript
interface SkillGeneratedContent {
  skillMd: string;
  agents: Array<{ name: string; content: string }>;
  scripts: Array<{ name: string; content: string }>;
  references: Array<{ name: string; content: string }>;
}
```

**拡張要件**: 現行の型で十分。LLM 応答パーサーの出力をこの型に変換する。

### Task 1-4: SkillFileWriter.persist() の仕様確認

| 項目           | 内容                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| シグネチャ     | `async persist(skillName: string, content: SkillGeneratedContent, options?: PersistOptions): Promise<PersistResult>` |
| パラメータ     | `skillName`: スキルディレクトリ名, `content`: 生成コンテンツ, `options.overwrite`: 上書き許可                        |
| 戻り値         | `PersistResult { skillPath: string; files: string[] }`                                                               |
| バリデーション | skillName のパス横断チェック、skillMd 空チェック、既存スキル存在チェック                                             |
| エラー         | `SkillFileWriterError { code: SkillFileWriterErrorCode; message: string }`                                           |
| エラーコード   | `VALIDATION_ERROR`, `PATH_TRAVERSAL`, `SKILL_ALREADY_EXISTS`, `WRITE_ERROR`                                          |
| ロールバック   | 書き込み失敗時に書き込み済みファイルを自動削除                                                                       |

### Task 1-5: ExecuteResult 型の拡張要件

**現行** `RuntimeSkillCreatorExecuteResult`:

- `executeId`, `skillName`, `success`, `error?`, `sessionId?`, `resultSubtype?`, `stopReason?`, `permissionDenials?`, `sdkEvents?`, `sourceProvenance?`

**追加フィールド**:

| フィールド       | 型                                               | 説明                                       |
| ---------------- | ------------------------------------------------ | ------------------------------------------ |
| `persistResult?` | `{ skillPath: string; files: string[] } \| null` | persist 成功時の結果（skillPath, files[]） |
| `persistError?`  | `string \| null`                                 | persist 失敗時のエラーメッセージ           |

### Task 1-6: エラーハンドリング要件

| エラーケース                         | 発生箇所                   | ハンドリング                                                                   |
| ------------------------------------ | -------------------------- | ------------------------------------------------------------------------------ |
| LLM 応答にコードブロックなし         | パーサー                   | `success: true` のまま `persistResult: null`（LLM が生成しなかった場合は正常） |
| コードブロックのパース失敗           | パーサー                   | `error` に詳細メッセージ、`persistResult: null`                                |
| `skillMd` が空文字                   | パーサー出力検証           | `VALIDATION_ERROR` として `persistError` に記録                                |
| `skillName` が不正                   | `persist()` バリデーション | `PATH_TRAVERSAL` or `VALIDATION_ERROR` として `persistError` に記録            |
| スキルが既存（overwrite=false）      | `persist()`                | `SKILL_ALREADY_EXISTS` として `persistError` に記録                            |
| ファイル書き込み失敗                 | `persist()`                | `WRITE_ERROR` として `persistError` に記録、ロールバック自動実行               |
| `skillFileWriter` が DI されていない | `execute()`                | persist をスキップ、`persistResult: null`（graceful degradation）              |

### Task 1-7: AC-1〜AC-5 写像確認

| AC   | 要件                                           | 実現手段                                                        | 検証方法                                                       |
| ---- | ---------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------- |
| AC-1 | LLM 応答を解析しコードブロックを抽出           | `parseLlmResponseToContent()` ユーティリティ                    | UT: 各種フォーマットの応答をパースし正しいブロック数を確認     |
| AC-2 | 抽出結果が `SkillGeneratedContent` 型に変換    | パーサーの戻り値を `SkillGeneratedContent` に型変換             | UT: 変換後の各フィールドが正しく設定されていることを確認       |
| AC-3 | `SkillFileWriter.persist()` でファイル書き出し | `execute()` 内で `this.deps.skillFileWriter.persist()` 呼び出し | UT: persist が正しい引数で呼ばれることをモック検証             |
| AC-4 | 書き出し結果が `ExecuteResult` に含まれる      | `persistResult` フィールドに `{ skillPath, files[] }` を格納    | UT: ExecuteResult に skillPath, files[] が含まれることを確認   |
| AC-5 | パース失敗時にエラーハンドリング               | try-catch + `persistError` フィールド                           | UT: 不正応答時にエラーが記録され、全体は fail しないことを確認 |

## 参照資料

| 資料名                | パス                                                                  | 説明                 |
| --------------------- | --------------------------------------------------------------------- | -------------------- |
| 要件草案              | `../requirements-draft.md`                                            | 全体要件             |
| Facade                | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | execute() の現行実装 |
| SkillFileWriter       | `apps/desktop/src/main/services/skill/SkillFileWriter.ts`             | persist() の仕様     |
| 型定義                | `packages/shared/src/types/skillCreator.ts`                           | 現行型定義           |
| SkillGeneratedContent | `packages/shared/src/types/skillCreator.ts` L683-692                  | 生成コンテンツ型     |
| ExecuteResult         | `packages/shared/src/types/skillCreator.ts` L556-567                  | 実行結果型           |

## 統合テスト連携

| 観点           | 内容                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| ユニットテスト | パーサー単体テスト + Facade の persist 連携テスト（モック）            |
| 結合テスト     | `SkillFileWriter` の実ファイルシステム書き出しは既存テストでカバー済み |

## 多角的チェック観点

| 観点               | 適用 | 理由                                                                         |
| ------------------ | ---- | ---------------------------------------------------------------------------- |
| セキュリティ       | ✅   | `SkillFileWriter` のパス横断防止に依存。LLM 応答由来のファイル名を信頼しない |
| エラーハンドリング | ✅   | パース失敗、persist 失敗の2段階エラーハンドリング                            |
| アーキテクチャ     | ✅   | Main Process 層。Facade → Writer の責務分離を維持                            |

## 完了条件

- [x] execute() の SkillFileWriter 未使用箇所が特定されている
- [x] LLM 応答フォーマットが確認されている
- [x] SkillGeneratedContent 型の拡張要件が定義されている（拡張不要と判断）
- [x] ExecuteResult 型の拡張要件が定義されている（`persistResult`, `persistError` 追加）
- [x] エラーハンドリング要件が定義されている（6ケース）
- [x] AC-1〜AC-5 への写像が確認されている
- [x] P50チェックで新規実装と判定
- [x] タスク分類を記録（Non-UI, Non-docs-only, Main層コード変更）
- [x] **本Phase内の全タスクを100%実行完了**
