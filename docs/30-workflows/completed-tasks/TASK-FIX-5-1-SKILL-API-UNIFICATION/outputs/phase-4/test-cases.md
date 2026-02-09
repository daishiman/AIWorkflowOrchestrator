# Phase 4: テストケース一覧

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| Phase    | 4                                  |
| 作成日   | 2026-02-09                         |

## 1. 統一API公開テスト

### TC-001: 13メソッド全て公開確認

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| テストID | TC-001                               |
| カテゴリ | 統一API公開                          |
| テスト名 | should expose all 13 methods         |
| 前提条件 | skillAPIオブジェクトがインポート済み |
| 期待結果 | 13メソッド全てがfunction型として存在 |
| 状態     | GREEN                                |

**対象メソッド:**

| カテゴリ     | メソッド                 | 検証                    |
| ------------ | ------------------------ | ----------------------- |
| 一覧・管理系 | `list`                   | `typeof === 'function'` |
| 一覧・管理系 | `getImported`            | `typeof === 'function'` |
| 一覧・管理系 | `import`                 | `typeof === 'function'` |
| 一覧・管理系 | `remove`                 | `typeof === 'function'` |
| 一覧・管理系 | `rescan`                 | `typeof === 'function'` |
| 実行系       | `execute`                | `typeof === 'function'` |
| 実行系       | `abort`                  | `typeof === 'function'` |
| 実行系       | `getExecutionStatus`     | `typeof === 'function'` |
| イベント系   | `onStream`               | `typeof === 'function'` |
| イベント系   | `onComplete`             | `typeof === 'function'` |
| イベント系   | `onError`                | `typeof === 'function'` |
| 権限系       | `onPermissionRequest`    | `typeof === 'function'` |
| 権限系       | `sendPermissionResponse` | `typeof === 'function'` |

### TC-002: 正確に13メソッドのみ（余分なメソッドなし）

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| テストID | TC-002                                            |
| カテゴリ | 統一API公開                                       |
| テスト名 | should have exactly 13 methods (no extra methods) |
| 前提条件 | skillAPIオブジェクトがインポート済み              |
| 期待結果 | メソッド数が正確に13                              |
| 状態     | GREEN                                             |

## 2. 旧API削除テスト

### TC-003: window.skillAPI未定義確認

| 項目     | 内容                                    |
| -------- | --------------------------------------- |
| テストID | TC-003                                  |
| カテゴリ | 旧API削除                               |
| テスト名 | should not be defined after unification |
| 前提条件 | Phase 5実装完了                         |
| 期待結果 | `globalThis.skillAPI === undefined`     |
| 状態     | **RED**（Phase 5実装後にGREEN）         |

## 3. 型安全性テスト

### TC-004〜TC-016: メソッドシグネチャ検証

| テストID | メソッド                      | 戻り値型                          | 状態  |
| -------- | ----------------------------- | --------------------------------- | ----- |
| TC-004   | `list()`                      | `Promise<SkillMetadata[]>`        | GREEN |
| TC-005   | `getImported()`               | `Promise<ImportedSkill[]>`        | GREEN |
| TC-006   | `import(skillName)`           | `Promise<ImportedSkill>`          | GREEN |
| TC-007   | `remove(skillName)`           | `Promise<void>`                   | GREEN |
| TC-008   | `rescan()`                    | `Promise<SkillMetadata[]>`        | GREEN |
| TC-009   | `execute(request)`            | `Promise<SkillExecutionResponse>` | GREEN |
| TC-010   | `abort(executionId)`          | `Promise<void>`                   | GREEN |
| TC-011   | `getExecutionStatus(id)`      | `Promise<ExecutionInfo \| null>`  | GREEN |
| TC-012   | `onStream(callback)`          | `() => void`                      | GREEN |
| TC-013   | `onComplete(callback)`        | `() => void`                      | GREEN |
| TC-014   | `onError(callback)`           | `() => void`                      | GREEN |
| TC-015   | `onPermissionRequest(cb)`     | `() => void`                      | GREEN |
| TC-016   | `sendPermissionResponse(res)` | `Promise<{ success: boolean }>`   | GREEN |

## 4. 境界値テスト

### TC-017〜TC-021: 境界値処理

| テストID | テスト内容                   | 入力                        | 期待結果  | 状態  |
| -------- | ---------------------------- | --------------------------- | --------- | ----- |
| TC-017   | 空文字列skillName（import）  | `""`                        | IPCに委譲 | GREEN |
| TC-018   | 空文字列skillName（remove）  | `""`                        | IPCに委譲 | GREEN |
| TC-019   | 空文字列executionId（abort） | `""`                        | IPCに委譲 | GREEN |
| TC-020   | 存在しないexecutionId        | `"non-existent"`            | `null`    | GREEN |
| TC-021   | 最小リクエスト（execute）    | `{ skillName, prompt: "" }` | 成功      | GREEN |

## 5. 統合シナリオテスト

### TC-022: スキル発見フロー

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| テストID | TC-022                                       |
| テスト名 | Skill discovery flow: list -> rescan -> list |
| フロー   | 1. list() → 2. rescan() → 3. list()          |
| 期待結果 | 各ステップで正しい結果を取得                 |
| 状態     | GREEN                                        |

### TC-023: スキルインポートフロー

| 項目     | 内容                                             |
| -------- | ------------------------------------------------ |
| テストID | TC-023                                           |
| テスト名 | Skill import flow: list -> import -> getImported |
| フロー   | 1. list() → 2. import() → 3. getImported()       |
| 期待結果 | インポート後にgetImportedで取得可能              |
| 状態     | GREEN                                            |

### TC-024: スキル実行フロー

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| テストID | TC-024                                                  |
| テスト名 | Skill execution flow: execute -> onStream -> onComplete |
| フロー   | 1. execute() → 2. onStream() → 3. onComplete()          |
| 期待結果 | 実行ID取得、リスナー登録、クリーンアップ成功            |
| 状態     | GREEN                                                   |

### TC-025: 権限フロー

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| テストID | TC-025                                                         |
| テスト名 | Permission flow: onPermissionRequest -> sendPermissionResponse |
| フロー   | 1. onPermissionRequest() → 2. sendPermissionResponse()         |
| 期待結果 | リスナー登録、応答送信成功                                     |
| 状態     | GREEN                                                          |

## 6. テストケースサマリ

| カテゴリ     | テスト数 | GREEN  | RED   |
| ------------ | -------- | ------ | ----- |
| 統一API公開  | 2        | 2      | 0     |
| 旧API削除    | 1        | 0      | 1     |
| 型安全性     | 13       | 13     | 0     |
| 境界値       | 5        | 5      | 0     |
| 統合シナリオ | 4        | 4      | 0     |
| **合計**     | **25**   | **24** | **1** |

## 7. Red状態テストの解消条件

| テストID | 解消条件                                             | 担当Phase |
| -------- | ---------------------------------------------------- | --------- |
| TC-003   | `types.d.ts` から `window.skillAPI: SkillAPI` を削除 | Phase 5   |
