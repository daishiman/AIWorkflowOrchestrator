# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 4                                  |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-05                         |

## 目的

統一SkillAPIの期待動作を定義するテストを先に作成する（Red状態）。

## 参照資料

| 資料名        | パス                                      | 説明          |
| ------------- | ----------------------------------------- | ------------- |
| 統一API設計書 | `outputs/phase-2/unified-api-design.md`   | Phase 2成果物 |
| レビュー結果  | `outputs/phase-3/design-review-result.md` | Phase 3成果物 |

## 実行タスク

### Task 1: 統一SkillAPIメソッドのユニットテスト作成

#### 目的

統一API全13メソッドの期待動作をテストとして定義する。

#### テスト対象ファイル

- `apps/desktop/src/preload/skill-api.ts`

#### テストファイル配置

- `apps/desktop/src/preload/__tests__/skill-api.test.ts`

#### テストケース一覧

| カテゴリ   | テストケース                                            | 期待結果                  |
| ---------- | ------------------------------------------------------- | ------------------------- |
| 一覧・管理 | `list()` が `SkillMetadata[]` を返す                    | 配列型で返却              |
| 一覧・管理 | `getImported()` が `ImportedSkill[]` を返す             | 配列型で返却              |
| 一覧・管理 | `import(skillIds)` が配列を受け取る                     | void で正常完了           |
| 一覧・管理 | `remove(skillId)` が成功する                            | void で正常完了           |
| 一覧・管理 | `rescan()` が更新リストを返す                           | `SkillMetadata[]` 返却    |
| 実行       | `execute(request)` が `SkillExecutionResponse` を返す   | executionId 含む          |
| 実行       | `abort(executionId)` が成功する                         | `true` 返却               |
| 実行       | `getExecutionStatus(executionId)` がステータスを返す    | `ExecutionInfo` or `null` |
| イベント   | `onStream(callback)` がunsubscribe関数を返す            | `() => void` 返却         |
| イベント   | `onComplete(callback)` がunsubscribe関数を返す          | `() => void` 返却         |
| イベント   | `onError(callback)` がunsubscribe関数を返す             | `() => void` 返却         |
| 権限       | `onPermissionRequest(callback)` がunsubscribe関数を返す | `() => void` 返却         |
| 権限       | `sendPermissionResponse(response)` が成功を返す         | `{ success: true }`       |

### Task 2: エラーハンドリングテスト

#### テストケース一覧

| テストケース                                   | 期待結果                                     |
| ---------------------------------------------- | -------------------------------------------- |
| `execute()` でIPC通信エラー発生時              | エラーがthrowされる（OperationResult不使用） |
| `abort()` で無効なexecutionId指定時            | `false` が返る                               |
| `getExecutionStatus()` で存在しないexecutionId | `null` が返る                                |
| `import()` で存在しないskillId指定時           | エラーがthrowされる                          |
| `remove()` で未インポートskillId指定時         | エラーがthrowされる                          |

### Task 3: 呼び出し元の移行テスト

#### 目的

移行後の呼び出し元が正しく新APIを使用することをテストする。

#### テストケース一覧

| 対象ファイル            | テストケース                                            | 期待結果                |
| ----------------------- | ------------------------------------------------------- | ----------------------- |
| `useSkillExecution.ts`  | `window.electronAPI.skill.execute` を呼び出す           | 新パス経由でIPC呼び出し |
| `useSkillPermission.ts` | `window.electronAPI.skill.onPermissionRequest` を使用   | 新パス経由              |
| `skillSlice.ts`         | `list()` が直接型（非OperationResult）を返す            | `SkillMetadata[]`       |
| `skillSlice.ts`         | `execute()` が `SkillExecutionRequest` オブジェクト引数 | 型一致                  |

## テスト実行方法

```bash
# テスト実行（Red状態で失敗することを確認）
pnpm --filter @repo/desktop test -- --run apps/desktop/src/preload/__tests__/skill-api.test.ts
```

## Electronデスクトップアプリ観点

| 層       | テスト考慮事項                                    |
| -------- | ------------------------------------------------- |
| Preload  | `ipcRenderer.invoke` のモック                     |
| Renderer | `window.electronAPI.skill` のモック               |
| IPC通信  | チャンネル名が `channels.ts` の定義と一致すること |

## TDD検証

```bash
# Red状態の確認
pnpm --filter @repo/desktop test -- --run apps/desktop/src/preload/__tests__/skill-api.test.ts
# 期待: テストがFAIL（まだ実装していない）
```

## 統合テスト連携【必須】

| カテゴリ           | テストシナリオ                                        | 検証内容                     |
| ------------------ | ----------------------------------------------------- | ---------------------------- |
| API接続テスト      | 全13メソッドがIPC通信で正しいチャンネルを呼び出すこと | SKILL_CHANNELS定数との一致   |
| データフロー       | execute→onStream→onCompleteのイベントフロー           | ストリーミングデータの型一致 |
| エラーハンドリング | IPC通信失敗時にErrorがthrowされること                 | OperationResult不使用の確認  |
| 認証連携           | onPermissionRequest→sendPermissionResponseのフロー    | 権限チェックフローの整合性   |
| 状態同期           | import/remove後の一覧更新                             | リアルタイム反映のテスト設計 |

### テストパターン参照

| パターン                  | 参照先                                              | 用途                     |
| ------------------------- | --------------------------------------------------- | ------------------------ |
| Handler Map方式           | `architecture-implementation-patterns.md` 行600-610 | ipcMain.handleのモック化 |
| SkillService Partial Mock | `architecture-implementation-patterns.md` 行621-632 | 依存サービスの隔離テスト |
| validateIpcSender検証     | `architecture-implementation-patterns.md` 行647-657 | セキュリティ検証テスト   |

## 成果物

| 成果物            | パス                                                   | 説明                    |
| ----------------- | ------------------------------------------------------ | ----------------------- |
| APIテストファイル | `apps/desktop/src/preload/__tests__/skill-api.test.ts` | 統一APIのユニットテスト |
| テスト結果（Red） | `outputs/phase-4/test-red-result.md`                   | Red状態のテスト結果     |

## 完了条件

- [ ] 統一API全13メソッドのテストが作成されている
- [ ] エラーハンドリングテスト（5ケース以上）が作成されている
- [ ] 呼び出し元移行テスト（4ケース以上）が作成されている
- [ ] テストがRed状態（失敗）であることを確認
- [ ] テストファイルがTypeScriptコンパイルを通過する
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装（TDD: Green）
