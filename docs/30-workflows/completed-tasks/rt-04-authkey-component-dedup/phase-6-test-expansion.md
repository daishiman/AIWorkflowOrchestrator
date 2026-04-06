# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 6                             |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

Phase 5 の実装で Green になった基本テストに加え、fail path・境界値・回帰ガードのテストを追加する。IPC 失敗パス・アンマウント時のキャンセル処理・重複テストのクリーンアップを実施する。

---

## 実行タスク

### タスク0: Phase 5 完了確認

```bash
# 全テストが Green であることを確認
pnpm --filter @repo/desktop test -- --run \
  apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts \
  apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx

# 現在のカバレッジ確認（拡充前のベースライン）
pnpm --filter @repo/desktop test -- --coverage --reporter=verbose \
  apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts 2>/dev/null | tail -20
```

---

### タスク1: IPC 失敗パスのテスト追加

**対象ファイル:** `apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts`

#### TC-19: authKey.set 失敗パス

| 項目     | 内容                                                                |
| -------- | ------------------------------------------------------------------- |
| テストID | TC-19                                                               |
| テスト名 | `should set status to error when authKey.set fails`                 |
| 前提条件 | `authKey.set()` が `{ success: false, error: "API error" }` を返す  |
| 操作     | `setInputValue("sk-validkey12345")` → `handleSave()`                |
| 期待結果 | `status === "error"`, `apiError !== null`, `isSubmitting === false` |

#### TC-20: authKey.delete 失敗パス

| 項目     | 内容                                                                     |
| -------- | ------------------------------------------------------------------------ |
| テストID | TC-20                                                                    |
| テスト名 | `should set apiError when authKey.delete fails`                          |
| 前提条件 | `authKey.delete()` が `{ success: false, error: "Delete error" }` を返す |
| 操作     | `handleDelete()`                                                         |
| 期待結果 | `apiError !== null`, `status` は変化しない                               |

#### TC-21: authKey.exists 失敗パス（初期化時）

| 項目     | 内容                                                                   |
| -------- | ---------------------------------------------------------------------- |
| テストID | TC-21                                                                  |
| テスト名 | `should set status to check-failed when authKey.exists throws on init` |
| 前提条件 | `authKey.exists()` が例外を throw する                                 |
| 操作     | `renderHook(() => useAuthKeyManagement())`                             |
| 期待結果 | `status === "check-failed"`                                            |

#### TC-22: authKey.exists 失敗パス（削除後の再確認時）

| 項目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| テストID | TC-22                                                                                          |
| テスト名 | `should set apiError when authKey.exists throws after delete`                                  |
| 前提条件 | `authKey.delete()` が `{ success: true }` を返すが、その後の `authKey.exists()` が例外を throw |
| 操作     | `handleDelete()`                                                                               |
| 期待結果 | `apiError !== null`                                                                            |

---

### タスク2: キャンセル処理のテスト追加

**対象ファイル:** `apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts`

#### TC-23: コンポーネントアンマウント時の状態更新防止

| 項目     | 内容                                                                                          |
| -------- | --------------------------------------------------------------------------------------------- |
| テストID | TC-23                                                                                         |
| テスト名 | `should not update state after component unmount`                                             |
| 前提条件 | `authKey.set()` が Promise を返す（未 resolve 状態）                                          |
| 操作     | `handleSave()` を呼び出し後、Promise resolve 前に `unmount()` を実行                          |
| 期待結果 | アンマウント後に state 更新が呼ばれない（React の "Can't perform state update" 警告が出ない） |

#### TC-24: 連続保存の競合防止

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| テストID | TC-24                                                                      |
| テスト名 | `should prevent duplicate save while isSubmitting is true`                 |
| 前提条件 | `authKey.set()` が遅延 Promise を返す                                      |
| 操作     | `handleSave()` を2回連続で呼び出す                                         |
| 期待結果 | `authKey.set()` が1回のみ呼ばれる（`isSubmitting` フラグで二重送信を防ぐ） |

---

### タスク3: バリデーション境界値テストの追加

**対象ファイル:** `apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts`

#### TC-25: 空文字バリデーション

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| テストID | TC-25                                                    |
| テスト名 | `should set validationError when inputValue is empty`    |
| 前提条件 | フックが初期化されている                                 |
| 操作     | `setInputValue("")` → `handleSave()`                     |
| 期待結果 | `validationError !== null`, `authKey.set()` が呼ばれない |

#### TC-26: 200文字超えバリデーション

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| テストID | TC-26                                                          |
| テスト名 | `should set validationError when key length exceeds 200 chars` |
| 前提条件 | フックが初期化されている                                       |
| 操作     | `setInputValue("sk-" + "a".repeat(200))` → `handleSave()`      |
| 期待結果 | `validationError !== null`, `authKey.set()` が呼ばれない       |

#### TC-27: sk- プレフィックスなしのバリデーション

| 項目     | 内容                                                          |
| -------- | ------------------------------------------------------------- |
| テストID | TC-27                                                         |
| テスト名 | `should set validationError when key does not start with sk-` |
| 前提条件 | フックが初期化されている                                      |
| 操作     | `setInputValue("invalid-prefix-key")` → `handleSave()`        |
| 期待結果 | `validationError !== null`, `authKey.set()` が呼ばれない      |

---

### タスク4: env-fallback 状態のテスト追加

**対象ファイル:** `apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts`

#### TC-28: env-fallback 初期化テスト

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| テストID | TC-28                                                                   |
| テスト名 | `should initialize with configured status and env-fallback keySource`   |
| 前提条件 | `authKey.exists()` が `{ exists: true, source: "env-fallback" }` を返す |
| 操作     | `renderHook(() => useAuthKeyManagement())`                              |
| 期待結果 | `status === "configured"`, `keySource === "env-fallback"`               |

---

### タスク5: 重複テストのクリーンアップ

**対象ファイル:**

- `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`

**手順:**

```bash
# AuthKeySection のテストケース一覧確認
grep -n "it\(\|test\(" apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx

# ApiKeySettingsPanel のテストケース一覧確認
grep -n "it\(\|test\(" apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx

# フックテストとコンポーネントテストの重複確認
# （例：IPC呼び出しのテストがコンポーネントとフックで二重になっていないか）
```

**クリーンアップ方針:**

| 重複パターン                                           | 対応方針                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| IPC 呼び出し（authKey.exists 等）のテスト              | フックテスト（TC-01〜TC-28）に集約。コンポーネントテストからは削除 |
| バリデーションのテスト                                 | フックテスト（TC-25〜TC-27）に集約                                 |
| `ApiKeySettingsPanel` の状態管理テスト（委譲前の残骸） | 委譲後テスト（TC-11〜TC-15）に置き換え                             |
| `AuthKeySection` の `AuthKeyStatus` ローカル型参照     | `ApiKeyStatus` 参照に統一                                          |

---

### タスク6: テスト拡充後の全体実行

```bash
# 拡充後の全テスト実行
pnpm --filter @repo/desktop test -- --run \
  apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts \
  apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx

# 拡充後のカバレッジ確認（Phase 7 の事前確認）
pnpm --filter @repo/desktop test -- --coverage --reporter=verbose \
  apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts \
  apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx \
  apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx 2>/dev/null | tail -30
```

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                     | 内容                   |
| -------- | ------------------------------------------------------------------------ | ---------------------- |
| IPC 仕様 | `.claude/skills/aiworkflow-requirements/references/api-ipc-contracts.md` | authKey チャンネル定義 |

### 実装参照ファイル

| ファイル                                                                               | 目的                             |
| -------------------------------------------------------------------------------------- | -------------------------------- |
| `apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts`               | 拡充対象テスト                   |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx` | クリーンアップ対象テスト         |
| `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`    | クリーンアップ対象テスト         |
| `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`                              | テスト対象フック                 |
| `docs/30-workflows/rt-04-authkey-component-dedup/phase-4-test-creation.md`             | 基本テストケース（TC-01〜TC-18） |

---

## 統合テスト連携【必須】

| 判定項目                             | 基準            | 実施方針                                                |
| ------------------------------------ | --------------- | ------------------------------------------------------- |
| TC-19〜TC-22（IPC 失敗パス）         | 全 Green        | `authKey.*` を `vi.fn().mockRejectedValueOnce` でモック |
| TC-23〜TC-24（キャンセル・競合防止） | 全 Green        | `renderHook` + `unmount` / タイミング制御               |
| TC-25〜TC-27（バリデーション境界値） | 全 Green        | 各境界値でフックを呼び出し確認                          |
| TC-28（env-fallback 状態）           | 全 Green        | `authKey.exists` モックの source 変更                   |
| 重複テストクリーンアップ             | 重複テストが0件 | grep で重複パターンがないことを確認                     |
| 全テスト実行（既存 Green 維持）      | 退行なし        | Phase 5 で Green だったテストが引き続き Green           |

---

## 成果物

| 成果物         | パス                                | 説明                   |
| -------------- | ----------------------------------- | ---------------------- |
| テスト拡充記録 | `outputs/phase-6/test-expansion.md` | 追加テストケースの記録 |

---

## 完了条件

- [ ] TC-19〜TC-22（IPC 失敗パス 4件）が追加されている
- [ ] TC-23〜TC-24（キャンセル・競合防止 2件）が追加されている
- [ ] TC-25〜TC-27（バリデーション境界値 3件）が追加されている
- [ ] TC-28（env-fallback 状態）が追加されている
- [ ] 重複テストのクリーンアップが完了している
- [ ] 全テスト（TC-01〜TC-28）が Green
- [ ] Phase 5 で Green だったテストが退行していない
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                                            | 完了 |
| ------------------------------------------------- | ---- |
| タスク0: Phase 5 完了確認                         | [ ]  |
| タスク1: IPC 失敗パス（TC-19〜TC-22）追加         | [ ]  |
| タスク2: キャンセル処理（TC-23〜TC-24）追加       | [ ]  |
| タスク3: バリデーション境界値（TC-25〜TC-27）追加 | [ ]  |
| タスク4: env-fallback テスト（TC-28）追加         | [ ]  |
| タスク5: 重複テストクリーンアップ                 | [ ]  |
| タスク6: 全体実行・カバレッジ事前確認             | [ ]  |

## 次のPhase

Phase 7: カバレッジ確認（[phase-7-coverage-check.md](phase-7-coverage-check.md)）

**Phase 6 完了・全テスト Green 後にのみ Phase 7 へ進むこと。**
