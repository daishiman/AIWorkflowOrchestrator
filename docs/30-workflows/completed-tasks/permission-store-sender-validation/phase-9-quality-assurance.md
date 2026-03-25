# Phase 9: 品質検証

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 9                                  |
| 機能名   | permission-store-sender-validation |
| タスクID | UT-06-002-UT-1                     |
| Issue    | #1527                              |
| 作成日   | 2026-03-24                         |

## 目的

Lint・型チェック・全テスト実行を行い、品質基準を満たすことを確認する。

## 参照資料

| 資料名         | パス                               | 説明                 |
| -------------- | ---------------------------------- | -------------------- |
| コード品質基準 | `.claude/rules/02-code-quality.md` | Lint・型チェック基準 |

## 実行タスク

### Task 1: ESLint 実行

```bash
pnpm lint
```

### Task 2: TypeScript 型チェック

```bash
pnpm typecheck
```

### Task 3: 全テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/permission-store-handlers.test.ts
```

### Task 4: 関連テスト確認

呼び出し元を変更したため、以下の関連テストも PASS することを確認:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/permission-store-handlers.test.ts src/main/ipc/__tests__/register-conversation-handlers.test.ts src/main/ipc/__tests__/ipc-graceful-degradation.test.ts src/main/ipc/__tests__/ipc-double-registration.test.ts src/main/ipc/__tests__/fallback-handlers.test.ts
```

### Task 5: IPC契約ドリフト検証【Phase 9 品質ゲート】

本タスクは IPC ハンドラのシグネチャ変更を含むため、以下の IPC 契約ドリフト検証を実施する:

| チェック項目                                                                           | 検証方法                                                       | 期待結果                                            |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| ハンドラ引数形式と Preload 側の呼び出し形式が一致                                      | `grep -rn "PERMISSION_" apps/desktop/src/preload/`             | sender 検証は内部変更のため Preload 側に影響なし    |
| `withValidation` のエラー応答形式が Preload の `safeInvoke` で正しくハンドリングされる | コードレビュー                                                 | `safeInvoke` は `{ success: false }` 形式を処理可能 |
| `registerPermissionStoreHandlers` の呼び出し元が全て更新されている                     | `grep -rn "registerPermissionStoreHandlers" apps/desktop/src/` | 呼び出し元は `ipc/index.ts` の1箇所のみ             |

## 実行手順

### ステップ1: Lint 実行・修正

ESLint エラーがあれば修正。

### ステップ2: TypeScript 型チェック

型エラーがあれば修正。特に `ipc/index.ts` の引数変更が型エラーを起こしていないか確認。

### ステップ3: テスト実行

対象テスト + 関連テストを実行。

## 統合テスト連携

- Lint PASS
- TypeCheck PASS
- 全テスト PASS

## 多角的チェック観点

- **品質**: ESLint・TypeScript 型チェックの厳格適用
- **回帰**: 関連テストの PASS 確認

## 成果物

| 成果物       | パス                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| 品質検証結果 | `docs/30-workflows/permission-store-sender-validation/outputs/phase-9/quality-report.md` |

## 完了条件

- [ ] ESLint エラーなし
- [ ] TypeScript 型チェック PASS
- [ ] permission-store-handlers テスト全 PASS
- [ ] 関連テスト全 PASS

## 次のPhase

Phase 10: 最終レビュー

## タスク100%実行確認【必須】

- [ ] 全ての実行タスクが完了している
- [ ] 完了条件の全項目がチェック済み
- [ ] 成果物が全て生成されている

## サブタスク管理

本Phaseのサブタスク:

- なし（単一タスクとして実行）
