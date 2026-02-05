# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 8                                  |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-05                         |

## 目的

動作を変えずにコード品質を改善する。TDDサイクルのRefactorフェーズとして、Phase 7で確認したテストがパスし続けることを保証しながらリファクタリングを行う。

## 参照資料

| 資料名             | パス                                    | 説明          |
| ------------------ | --------------------------------------- | ------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`    | Phase 7成果物 |
| 統一API設計書      | `outputs/phase-2/unified-api-design.md` | Phase 2成果物 |

## 実行タスク

### Task 1: コード重複の排除

#### 目的

`preload/skill-api.ts` 内の重複したIPC呼び出しパターンを共通化する。

#### 手順

1. `apps/desktop/src/preload/skill-api.ts` を開く
2. 重複したIPC呼び出しパターンを特定する:
   - `ipcRenderer.invoke(SKILL_CHANNELS.*)` の呼び出しが類似パターンで繰り返されている箇所
   - エラーハンドリングが重複している箇所
3. 共通パターンをヘルパー関数として抽出する
4. 各メソッドがヘルパー関数を使用するようにリファクタリングする

#### 確認事項

| 確認項目                              | 結果       |
| ------------------------------------- | ---------- |
| IPC呼び出しパターンが共通化されている | {{RESULT}} |
| エラーハンドリングが統一されている    | {{RESULT}} |
| 不要な重複コードが排除されている      | {{RESULT}} |

### Task 2: 命名の改善

#### 目的

APIメソッド名とIPCチャンネル名の整合性を確認し、一貫した命名規則を適用する。

#### 手順

1. 以下の対応表を作成し、命名の一貫性を検証する:

| APIメソッド名              | IPCチャンネル名                      | 整合性     |
| -------------------------- | ------------------------------------ | ---------- |
| `list()`                   | `SKILL_CHANNELS.LIST_AVAILABLE`      | {{RESULT}} |
| `getImported()`            | `SKILL_CHANNELS.GET_IMPORTED`        | {{RESULT}} |
| `execute()`                | `SKILL_CHANNELS.EXECUTE`             | {{RESULT}} |
| `import()`                 | `SKILL_CHANNELS.IMPORT`              | {{RESULT}} |
| `remove()`                 | `SKILL_CHANNELS.REMOVE`              | {{RESULT}} |
| `abort()`                  | `SKILL_CHANNELS.ABORT`               | {{RESULT}} |
| `rescan()`                 | `SKILL_CHANNELS.RESCAN`              | {{RESULT}} |
| `getExecutionStatus()`     | `SKILL_CHANNELS.GET_STATUS`          | {{RESULT}} |
| `sendPermissionResponse()` | `SKILL_CHANNELS.PERMISSION_RESPONSE` | {{RESULT}} |

2. 不整合がある場合は命名を統一する（APIメソッド名を基準とする）
3. 変数名・引数名が明確で一貫性のある命名であることを確認する

### Task 3: 不要コードの削除

#### 目的

統一後に不要となったコードを完全に削除する。

#### 手順

1. `OperationResult` 関連の参照を検索し、残存していないことを確認する:

```bash
grep -rn "OperationResult" apps/desktop/src/
```

2. `renderer/preload/index.ts` から削除されたskillAPI定義に関連するデッドコードを確認する:

```bash
grep -rn "window\.skillAPI" apps/desktop/src/
```

3. 以下の削除対象チェックリストを確認する:

| 削除対象                                             | 確認結果   |
| ---------------------------------------------------- | ---------- |
| `OperationResult` 型の参照が残存していない           | {{RESULT}} |
| `window.skillAPI` の参照が残存していない             | {{RESULT}} |
| `renderer/preload/index.ts` のskillAPI定義が削除済み | {{RESULT}} |
| 未使用のimport文が残存していない                     | {{RESULT}} |
| コメントアウトされたコードが残存していない           | {{RESULT}} |

## TDD検証

リファクタリング後、全テストが引き続きパスすることを確認する。

```bash
# リファクタリング後のテスト実行（Green状態維持）
pnpm --filter @repo/desktop test
```

| 確認項目                                 | 結果       |
| ---------------------------------------- | ---------- |
| リファクタリング前と同じテストがPASSする | {{RESULT}} |
| 新たなテスト失敗が発生していない         | {{RESULT}} |
| カバレッジが低下していない               | {{RESULT}} |

## 統合テスト連携【必須】

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint

# テスト実行
pnpm --filter @repo/desktop test

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage
```

| 判定項目               | 基準    | 結果       |
| ---------------------- | ------- | ---------- |
| 型チェック             | エラー0 | {{RESULT}} |
| リント                 | エラー0 | {{RESULT}} |
| ユニットテストLine     | 80%+    | {{RESULT}} |
| ユニットテストBranch   | 60%+    | {{RESULT}} |
| ユニットテストFunction | 80%+    | {{RESULT}} |

## 成果物

| 成果物               | パス                                    | 説明                 |
| -------------------- | --------------------------------------- | -------------------- |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md` | リファクタリング結果 |

## 完了条件

- [ ] IPC呼び出しパターンの重複が排除されている
- [ ] APIメソッド名とIPCチャンネル名の命名が一貫している
- [ ] `OperationResult` 関連の参照が完全に削除されている
- [ ] `window.skillAPI` の参照が完全に削除されている
- [ ] `renderer/preload/index.ts` のskillAPI関連デッドコードが削除されている
- [ ] リファクタリング後も全テストがPASS（Green状態維持）
- [ ] カバレッジがPhase 7の水準を維持している
- [ ] `pnpm typecheck` がエラーなし
- [ ] `pnpm lint` がエラーなし
- [ ] リファクタリング報告が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証
