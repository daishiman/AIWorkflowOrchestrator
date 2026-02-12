# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 値                                     |
| --------- | -------------------------------------- |
| Phase     | 7                                      |
| タスクID  | UT-FIX-5-4                             |
| タスク名  | AgentSDKAPI型定義不一致修正            |
| 機能名    | ut-fix-5-4-agent-sdk-api-type-mismatch |
| 作成日    | 2026-02-10                             |
| 前提Phase | Phase 6（テスト拡充）                  |

## 目的

テストカバレッジが基準を満たしていることを確認する。未達の場合は Phase 6 に戻りテストを追加する。

---

## 実行タスク

### Task 1: カバレッジ計測

**対象ファイル**:

| ファイル                                  | 説明                       |
| ----------------------------------------- | -------------------------- |
| `apps/desktop/src/preload/types.ts`       | 型定義ファイル（修正対象） |
| `packages/shared/src/agent/types.ts`      | 正本型定義ファイル         |
| `apps/desktop/src/preload/agentSDKAPI.ts` | 実装ファイル（参照）       |

**確認コマンド**:

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test:coverage

# または特定ファイルのカバレッジ確認
pnpm --filter @repo/desktop test:coverage -- --grep "agentSDKAPI"
```

### Task 2: カバレッジ基準確認

**カバレッジ基準（プロジェクト標準）**:

| 指標              | 最低基準 | 推奨基準 | 判定             |
| ----------------- | -------- | -------- | ---------------- |
| Line Coverage     | 80%      | 90%      | 最低基準達成必須 |
| Branch Coverage   | 60%      | 70%      | 最低基準達成必須 |
| Function Coverage | 80%      | 90%      | 最低基準達成必須 |

### Task 3: 型定義のテストカバレッジ確認

**注意**: 型定義ファイル（`.d.ts` や インターフェース定義）は実行時コードではないため、
従来のカバレッジ計測対象外。代わりに以下を確認する。

**型レベルテストによる検証**:

| テストID     | 検証対象                          | カバー状況 |
| ------------ | --------------------------------- | ---------- |
| ASDT-TYPE-01 | `AgentSDKAPI["abort"]` の戻り値型 | 型テスト   |
| ASDT-TYPE-02 | 他メソッドとの型一貫性            | 型テスト   |

**ランタイムテストによる検証**:

| テストID    | 検証対象                | カバー状況 |
| ----------- | ----------------------- | ---------- |
| ASDT-01     | Promiseインスタンス返却 | 実行確認   |
| ASDT-02     | await動作               | 実行確認   |
| ASDT-03     | IPC成功時resolve        | 正常系     |
| ASDT-04     | IPC失敗時reject         | 異常系     |
| ASDT-05     | メソッド一貫性          | 統合       |
| ASDT-06〜10 | エラーハンドリング拡張  | 異常系拡張 |
| ASDT-11〜13 | 一貫性テスト            | 統合       |
| ASDT-14〜15 | IPC通信詳細             | 統合       |

### Task 4: agentSDKAPI.ts 実装のカバレッジ確認

**対象コード行**:

```typescript
// apps/desktop/src/preload/agentSDKAPI.ts (該当部分)
export const agentSDKAPI = {
  // ...
  abort: () => safeInvoke(IPC_CHANNELS.AGENT_ABORT), // Line 1
  // ...
};
```

**テストによるカバレッジ対応**:

| コード箇所            | カバーするテスト                         |
| --------------------- | ---------------------------------------- |
| `abort` 関数定義      | ASDT-01 〜 ASDT-15（全テストで呼び出し） |
| `safeInvoke` 呼び出し | ASDT-14（正しいチャネル確認）            |
| 戻り値（Promise）     | ASDT-01, ASDT-03, ASDT-04                |

---

## カバレッジレポート出力

### 期待されるレポート形式

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
agentSDKAPI.ts        |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
  abort method        |   100.0 |    100.0 |   100.0 |   100.0 |
----------------------|---------|----------|---------|---------|
```

### 確認ポイント

| No  | 確認項目                                     | 判定基準    |
| --- | -------------------------------------------- | ----------- |
| 1   | Line Coverage が 80% 以上                    | PASS / FAIL |
| 2   | Branch Coverage が 60% 以上                  | PASS / FAIL |
| 3   | Function Coverage が 80% 以上                | PASS / FAIL |
| 4   | `abort` メソッドの呼び出しがカバーされている | PASS / FAIL |
| 5   | 型テスト（ASDT-TYPE-\*）が PASS している     | PASS / FAIL |
| 6   | 新規追加コードのカバレッジ低下がない         | PASS / FAIL |

---

## 参照資料

| 資料名           | パス                                                                         | 説明               |
| ---------------- | ---------------------------------------------------------------------------- | ------------------ |
| Phase 6成果物    | `docs/30-workflows/UT-FIX-5-4/phase-6-test-expansion.md`                     | テスト拡充仕様     |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                           | カバレッジ基準     |
| Agent IPC仕様    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`         | IPCチャネル設計    |
| IPCセキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | safeInvokeパターン |

---

## 統合テスト連携【必須】

IPC通信の型契約を検証する:

| 統合ポイント | 確認項目                           |
| ------------ | ---------------------------------- |
| IPC契約      | `agent:abort` チャンネルの型一貫性 |
| 型安全性     | Preload/Shared 間の型契約維持      |
| safeInvoke   | Promise<void> 戻り値型の検証       |

---

## アーキテクチャ層別カバレッジ観点

| 層      | カバレッジ確認観点                           |
| ------- | -------------------------------------------- |
| Preload | `abort()` メソッドのLine/Branch/Function確認 |
| Shared  | 型定義関連コードのカバレッジ確認             |

---

## ゲート判定

### カバレッジ基準達成の場合

**判定**: PASS -> Phase 8（リファクタリング）へ進む

### カバレッジ基準未達の場合

**判定**: FAIL -> Phase 6（テスト拡充）に戻る

**未達時の対応**:

1. 未カバーの行・分岐を特定
2. 追加テストケースを設計
3. Phase 6 でテストを追加
4. Phase 7 で再度カバレッジ確認

---

## 型定義修正固有の確認事項

本タスクは型定義の修正が主目的であるため、以下の追加確認を行う。

### 型整合性チェック

| チェック項目                            | 確認コマンド                        | 期待結果 |
| --------------------------------------- | ----------------------------------- | -------- |
| TypeScriptコンパイルエラーなし          | `pnpm typecheck`                    | 0 errors |
| 型定義ファイルの変更がビルドに影響なし  | `pnpm --filter @repo/desktop build` | success  |
| shared パッケージの型エクスポートが正常 | `pnpm --filter @repo/shared build`  | success  |

### 型テスト確認

```bash
# 型レベルテスト実行
pnpm --filter @repo/desktop test -- --grep "型定義テスト"

# 確認項目
# - [ ] ASDT-TYPE-01: abort() → Promise<void> の型テスト PASS
# - [ ] ASDT-TYPE-02: 他メソッドとの一貫性テスト PASS
```

---

## 成果物

| 成果物             | パス                                   | 説明                       |
| ------------------ | -------------------------------------- | -------------------------- |
| カバレッジレポート | `coverage/lcov-report/index.html`      | HTMLレポート               |
| カバレッジサマリー | `outputs/phase-07/coverage-summary.md` | 本ドキュメント（結果追記） |

---

## 完了条件

- [ ] カバレッジ計測コマンドが実行されている
- [ ] Line Coverage が 80% 以上を達成
- [ ] Branch Coverage が 60% 以上を達成
- [ ] Function Coverage が 80% 以上を達成
- [ ] `abort` メソッドの全コードパスがカバーされている
- [ ] TypeScriptコンパイルが成功している
- [ ] 型テスト（ASDT-TYPE-\*）がすべて PASS している
- [ ] 未カバー行がある場合、Phase 6 に戻り対応済み
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 確認コマンド

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test:coverage

# 特定ファイルのカバレッジ詳細確認
pnpm --filter @repo/desktop test:coverage -- --reporter=verbose

# HTMLレポート確認（ブラウザで開く）
open apps/desktop/coverage/lcov-report/index.html

# TypeScript型チェック
pnpm typecheck
```

---

## 次のPhase

- **カバレッジ基準達成**: Phase 8: リファクタリング
- **カバレッジ基準未達**: Phase 6: テスト拡充（再実施）
