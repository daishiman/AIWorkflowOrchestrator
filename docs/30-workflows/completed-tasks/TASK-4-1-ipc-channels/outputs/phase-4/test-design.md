# TASK-4-1: IPCチャネル定義 - テスト設計書

## メタ情報

| 項目           | 内容                                                               |
| -------------- | ------------------------------------------------------------------ |
| タスクID       | TASK-4-1                                                           |
| Phase          | 4                                                                  |
| 作成日         | 2026-01-25                                                         |
| テストファイル | `apps/desktop/src/preload/__tests__/channels.skill-import.test.ts` |
| TDD状態        | **Red（テスト失敗）**                                              |

---

## 1. テスト設計概要

### 1.1 テスト方針

本タスクは静的定数定義のみのため、以下の検証アプローチを採用:

1. **ユニットテスト**: チャネル定数の存在・値・型を検証
2. **静的解析**: TypeScript型チェック、ESLint検証
3. **重複チェック**: チャネル値のユニーク性を検証

### 1.2 テスト対象

| 対象                     | テスト内容               |
| ------------------------ | ------------------------ |
| 新規チャネル定義（8件）  | 存在確認、値確認         |
| ホワイトリスト（invoke） | 5チャネルの登録確認      |
| ホワイトリスト（on）     | 3チャネルの登録確認      |
| 型安全性                 | IpcChannel型への含有確認 |
| 重複チェック             | チャネル値のユニーク性   |

---

## 2. テストケース一覧

### 2.1 チャネル定義テスト

| テストID | テスト名                      | 期待値                        |
| -------- | ----------------------------- | ----------------------------- |
| CH-001   | SKILL_LIST定義                | `"skill:list"`                |
| CH-002   | SKILL_SCAN定義                | `"skill:scan"`                |
| CH-003   | SKILL_GET_IMPORTED定義        | `"skill:getImported"`         |
| CH-004   | SKILL_UPDATE定義              | `"skill:update"`              |
| CH-005   | SKILL_COMPLETE定義            | `"skill:complete"`            |
| CH-006   | SKILL_ERROR定義               | `"skill:error"`               |
| CH-007   | SKILL_PERMISSION_REQUEST定義  | `"skill:permission:request"`  |
| CH-008   | SKILL_PERMISSION_RESPONSE定義 | `"skill:permission:response"` |

### 2.2 ホワイトリストテスト（Invoke）

| テストID | テスト名                                                 | 期待値 |
| -------- | -------------------------------------------------------- | ------ |
| WL-I-001 | SKILL_LISTがALLOWED_INVOKE_CHANNELSに登録                | true   |
| WL-I-002 | SKILL_SCANがALLOWED_INVOKE_CHANNELSに登録                | true   |
| WL-I-003 | SKILL_GET_IMPORTEDがALLOWED_INVOKE_CHANNELSに登録        | true   |
| WL-I-004 | SKILL_UPDATEがALLOWED_INVOKE_CHANNELSに登録              | true   |
| WL-I-005 | SKILL_PERMISSION_RESPONSEがALLOWED_INVOKE_CHANNELSに登録 | true   |

### 2.3 ホワイトリストテスト（On）

| テストID | テスト名                                            | 期待値 |
| -------- | --------------------------------------------------- | ------ |
| WL-O-001 | SKILL_COMPLETEがALLOWED_ON_CHANNELSに登録           | true   |
| WL-O-002 | SKILL_ERRORがALLOWED_ON_CHANNELSに登録              | true   |
| WL-O-003 | SKILL_PERMISSION_REQUESTがALLOWED_ON_CHANNELSに登録 | true   |

### 2.4 型安全性テスト

| テストID | テスト名                                          | 期待値         |
| -------- | ------------------------------------------------- | -------------- |
| TS-001   | SKILL_LISTがIpcChannel型に含まれる                | コンパイル成功 |
| TS-002   | SKILL_SCANがIpcChannel型に含まれる                | コンパイル成功 |
| TS-003   | SKILL_GET_IMPORTEDがIpcChannel型に含まれる        | コンパイル成功 |
| TS-004   | SKILL_UPDATEがIpcChannel型に含まれる              | コンパイル成功 |
| TS-005   | SKILL_COMPLETEがIpcChannel型に含まれる            | コンパイル成功 |
| TS-006   | SKILL_ERRORがIpcChannel型に含まれる               | コンパイル成功 |
| TS-007   | SKILL_PERMISSION_REQUESTがIpcChannel型に含まれる  | コンパイル成功 |
| TS-008   | SKILL_PERMISSION_RESPONSEがIpcChannel型に含まれる | コンパイル成功 |

### 2.5 重複チェックテスト

| テストID | テスト名                       | 期待値   |
| -------- | ------------------------------ | -------- |
| DUP-001  | 全チャネル値がユニーク         | 重複なし |
| DUP-002  | スキル関連チャネル値がユニーク | 重複なし |

### 2.6 命名規則テスト

| テストID | テスト名                                            | 期待値 |
| -------- | --------------------------------------------------- | ------ |
| NM-001   | 全チャネルがskill:プレフィックスを使用              | true   |
| NM-002   | 権限チャネルがskill:permission:プレフィックスを使用 | true   |

### 2.7 ホワイトリスト排他性テスト

| テストID | テスト名                       | 期待値 |
| -------- | ------------------------------ | ------ |
| EX-001   | OnチャネルがINVOKEに含まれない | false  |
| EX-002   | InvokeチャネルがONに含まれない | false  |

---

## 3. TDD Red Phase 確認

### 3.1 テスト実行結果

```
テスト実行: pnpm --filter @repo/desktop test -- --run channels.skill-import.test.ts

結果:
- Test Files: 1 failed (1)
- Tests: 35 failed | 9 passed (44)
```

### 3.2 失敗理由

```
1. SKILL_LIST, SKILL_SCAN等が未定義（undefined）
2. ホワイトリストに新規チャネルが未登録
3. 型チェックテストは通過（コンパイル時検証）
```

### 3.3 TDD状態確認

- [x] テストが失敗することを確認（Red状態）
- [x] 失敗理由が「チャネル未定義」であることを確認
- [x] Phase 5で実装後にGreen状態になる見込み

---

## 4. 静的解析テスト手順

### 4.1 型チェック

```bash
# TypeScriptコンパイルエラーがないことを確認
pnpm --filter @repo/desktop typecheck
```

### 4.2 Lint

```bash
# ESLintエラーがないことを確認
pnpm --filter @repo/desktop lint
```

### 4.3 重複チェック（手動）

```bash
# チャネル値の重複確認
grep -o '"skill:[^"]*"' apps/desktop/src/preload/channels.ts | sort | uniq -d
# 結果が空であれば重複なし
```

---

## 5. Phase完了確認

### タスク実行状況

- [x] タスク1: 型チェックテストの設計 - 完了
- [x] タスク2: テストファイルの作成 - 完了
- [x] タスク3: 静的解析テストの設計 - 完了

### 成果物生成状況

- [x] `apps/desktop/src/preload/__tests__/channels.skill-import.test.ts` - 生成完了
- [x] `outputs/phase-4/test-design.md` - 生成完了

### TDD確認

- [x] テストが失敗することを確認（Red状態）

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
