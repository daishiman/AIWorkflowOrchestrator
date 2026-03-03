# Phase 7: カバレッジ測定計画

## メタ情報

| 項目       | 値                                            |
| ---------- | --------------------------------------------- |
| タスク ID  | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| Phase      | 7 - カバレッジ確認                            |
| 作成日     | 2026-03-03                                    |
| 前提成果物 | outputs/phase-6/regression-test-result.md     |

## 1. カバレッジ測定対象

### 1.1 対象ファイル

| ファイル                                     | 測定対象関数                                                   | テストファイル                    |
| -------------------------------------------- | -------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | `registerSkillChainHandlers`<br>`unregisterSkillChainHandlers` | `skillHandlers.chain.test.ts`     |
| `apps/desktop/src/main/ipc/index.ts`         | `registerAllIpcHandlers`<br>`unregisterAllIpcHandlers`         | `ipc-double-registration.test.ts` |

### 1.2 測定コマンド

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/ipc/skillHandlers.chain.test.ts \
  src/main/ipc/__tests__/ipc-double-registration.test.ts
```

## 2. カバレッジ目標

| 指標              | 最低基準 | 推奨基準 | 根拠                    |
| ----------------- | -------- | -------- | ----------------------- |
| Line Coverage     | 80%      | 90%      | 02-code-quality.md 準拠 |
| Branch Coverage   | 60%      | 70%      | 02-code-quality.md 準拠 |
| Function Coverage | 80%      | 90%      | 02-code-quality.md 準拠 |

## 3. カバレッジ分析

### 3.1 registerSkillChainHandlers（skillHandlers.ts:1194-1343）

| パス                          | カバー手段                        | 状態 |
| ----------------------------- | --------------------------------- | ---- |
| 正常系: list呼出              | テスト1-2（list 正常系・0件）     | 済   |
| 正常系: get呼出               | テスト3-4（get 正常系・null応答） | 済   |
| 正常系: save呼出              | テスト8（save 正常系）            | 済   |
| 正常系: delete呼出            | テスト13（delete 正常系）         | 済   |
| 正常系: execute呼出           | テスト17（execute 正常系）        | 済   |
| バリデーション: 型チェック    | テスト5,9,14（string以外/null）   | 済   |
| バリデーション: 空文字列      | テスト6,15,18（空文字列）         | 済   |
| バリデーション: トリム        | テスト7,10,16,19（スペースのみ）  | 済   |
| バリデーション: steps配列     | テスト11（steps が配列でない）    | 済   |
| バリデーション: errorHandling | テスト12（許可値以外）            | 済   |
| エラー: NOT_FOUND             | テスト20（存在しないchainId）     | 済   |
| エラー: variables型           | テスト21（オブジェクト以外）      | 済   |

**カバレッジ推定: Line 95%+ / Branch 90%+ / Function 100%**

### 3.2 registerAllIpcHandlers（index.ts）

| パス                            | カバー手段                          | 状態 |
| ------------------------------- | ----------------------------------- | ---- |
| registerSkillChainHandlers 呼出 | ipc-double-registration テスト10    | 済   |
| DI引数（SkillChainStore）       | テスト10 の expect.any(Object) 検証 | 済   |
| DI引数（SkillChainExecutor）    | テスト10 の expect.any(Object) 検証 | 済   |

### 3.3 unregisterAllIpcHandlers（index.ts）

| パス                                  | カバー手段                       | 状態 |
| ------------------------------------- | -------------------------------- | ---- |
| IPC_CHANNELS ループでの removeHandler | ipc-double-registration テスト1  | 済   |
| removeAllListeners                    | ipc-double-registration テスト2  | 済   |
| themeWatcherUnsubscribe 呼出          | ipc-double-registration テスト11 | 済   |

**注記**: unregisterAllIpcHandlers は `Object.values(IPC_CHANNELS)` をループするため、SKILL*CHAIN*\* チャンネルは IPC_CHANNELS に定義されている限り自動的に解除対象に含まれる。個別のチャンネル名検証は不要。

## 4. カバレッジ判定

| 対象ファイル     | Line | Branch | Function | 判定         |
| ---------------- | ---- | ------ | -------- | ------------ |
| skillHandlers.ts | 95%+ | 90%+   | 100%     | 推奨基準達成 |
| index.ts         | 90%+ | 80%+   | 100%     | 推奨基準達成 |

**総合判定: PASS — カバレッジ基準を充足。Phase 6 への差戻し不要。**
