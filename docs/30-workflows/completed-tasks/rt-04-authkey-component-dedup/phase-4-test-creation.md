# Phase 4: テスト作成

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 4                             |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

TDD Red フェーズとして、実装前にテストケースを設計・記述する。Phase 5 の実装が完了した時点でテストがすべて Green になる状態を目指す。

---

## 実行タスク

### タスク1: 既存テスト命名規則の確認

```bash
# AuthKeySection の既存テスト構造確認
grep -rn "describe\|it\(" apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx | head -20

# ApiKeySettingsPanel の既存テスト構造確認
grep -rn "describe\|it\(" apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx | head -20

# hooks テストディレクトリ確認
ls apps/desktop/src/renderer/hooks/__tests__/ 2>/dev/null || echo "ディレクトリなし"
```

**確認項目:**

| 確認内容              | 期待値                              |
| --------------------- | ----------------------------------- |
| describe ブロック形式 | `describe("コンポーネント名", ...)` |
| it / test 使用状況    | `it("should ...", ...)`             |
| モック方式            | `vi.mock` / `vi.fn()`               |
| renderHook の有無     | `@testing-library/react` 使用確認   |

---

### タスク2: `useAuthKeyManagement` フックのテストケース設計（TC-01〜TC-05）

**テストファイルパス:** `apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts`

#### TC-01: 初期化テスト

| 項目     | 内容                                                                |
| -------- | ------------------------------------------------------------------- |
| テストID | TC-01                                                               |
| テスト名 | `should initialize with not_set status when authKey does not exist` |
| 前提条件 | `window.electronAPI.authKey.exists()` が `{ exists: false }` を返す |
| 操作     | `renderHook(() => useAuthKeyManagement())`                          |
| 期待結果 | `status === "not_set"`, `keySource === null`, `inputValue === ""`   |

#### TC-02: 保存成功テスト

| 項目     | 内容                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| テストID | TC-02                                                                                           |
| テスト名 | `should set status to configured after successful save`                                         |
| 前提条件 | `authKey.exists()` が `{ exists: false }` を返す、`authKey.set()` が `{ success: true }` を返す |
| 操作     | `setInputValue("sk-test123456789012345678901234567890")` の後 `handleSave()` を呼び出す         |
| 期待結果 | `status === "configured"`, `keySource === "saved"`, `inputValue === ""`                         |

#### TC-03: 削除成功テスト

| 項目     | 内容                                                                                                                                                                              |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID | TC-03                                                                                                                                                                             |
| テスト名 | `should set status to not_set after successful delete`                                                                                                                            |
| 前提条件 | `authKey.exists()` が最初 `{ exists: true, source: "saved" }` を返す、`authKey.delete()` が `{ success: true }` を返す、削除後の `authKey.exists()` が `{ exists: false }` を返す |
| 操作     | `handleDelete()` を呼び出す                                                                                                                                                       |
| 期待結果 | `status === "not_set"`, `keySource === null`                                                                                                                                      |

#### TC-04: バリデーションエラーテスト

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| テストID | TC-04                                                                       |
| テスト名 | `should set validationError when key does not start with sk-`               |
| 前提条件 | フックが初期化されている                                                    |
| 操作     | `setInputValue("invalid-key")` の後 `handleSave()` を呼び出す               |
| 期待結果 | `validationError !== null`, `authKey.set()` が呼ばれない, `status` 変化なし |

#### TC-05: onStatusChange コールバックテスト

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| テストID | TC-05                                                                                   |
| テスト名 | `should call onStatusChange when status changes after save`                             |
| 前提条件 | `authKey.set()` が `{ success: true }` を返す                                           |
| 操作     | `onStatusChange` モック関数を渡して `renderHook`、`setInputValue` → `handleSave()` の順 |
| 期待結果 | `onStatusChange` が `"configured"` 引数で1回呼ばれる                                    |

---

### タスク3: `AuthKeySection` コンポーネントのテストケース設計（TC-06〜TC-10）

**テストファイルパス:** `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx`

#### TC-06: onStatusChange props 受け取りテスト

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| テストID | TC-06                                                 |
| テスト名 | `should accept onStatusChange prop without error`     |
| 前提条件 | `useAuthKeyManagement` が適切にモック済み             |
| 操作     | `render(<AuthKeySection onStatusChange={vi.fn()} />)` |
| 期待結果 | レンダリングエラーなし                                |

#### TC-07: フック使用テスト

| 項目     | 内容                                                                        |
| -------- | --------------------------------------------------------------------------- |
| テストID | TC-07                                                                       |
| テスト名 | `should use useAuthKeyManagement hook for state management`                 |
| 前提条件 | `useAuthKeyManagement` が `{ status: "not_set", ... }` を返すようモック済み |
| 操作     | `render(<AuthKeySection />)`                                                |
| 期待結果 | `useAuthKeyManagement` が1回呼ばれている                                    |

#### TC-08: 既存 UI 継続テスト（パスワード表示切替）

| 項目     | 内容                                      |
| -------- | ----------------------------------------- |
| テストID | TC-08                                     |
| テスト名 | `should render password toggle button`    |
| 前提条件 | `useAuthKeyManagement` のモック設定済み   |
| 操作     | `render(<AuthKeySection />)`              |
| 期待結果 | パスワード表示切替ボタンが DOM に存在する |

#### TC-09: AuthKeyStatus ローカル型が使用されていないことの確認

| 項目     | 内容                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| テストID | TC-09                                                                                            |
| テスト名 | `should not reference local AuthKeyStatus type (static check)`                                   |
| 前提条件 | Phase 5 実装完了後                                                                               |
| 操作     | `grep -n "AuthKeyStatus" apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` |
| 期待結果 | マッチ0件（ローカル型定義・使用なし）                                                            |

#### TC-10: `configured` 状態での表示テスト

| 項目     | 内容                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------- |
| テストID | TC-10                                                                                          |
| テスト名 | `should show configured state UI when status is configured`                                    |
| 前提条件 | `useAuthKeyManagement` が `{ status: "configured", keySource: "saved", ... }` を返すようモック |
| 操作     | `render(<AuthKeySection />)`                                                                   |
| 期待結果 | 設定済みを示すUIが表示されている（削除ボタンなど）                                             |

---

### タスク4: `ApiKeySettingsPanel` コンポーネントのテストケース設計（TC-11〜TC-15）

**テストファイルパス:** `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`

#### TC-11: 委譲動作テスト

| 項目     | 内容                                         |
| -------- | -------------------------------------------- |
| テストID | TC-11                                        |
| テスト名 | `should render AuthKeySection as delegate`   |
| 前提条件 | `AuthKeySection` がモック済み                |
| 操作     | `render(<ApiKeySettingsPanel />)`            |
| 期待結果 | `AuthKeySection` が1回レンダリングされている |

#### TC-12: onStatusChange 伝播テスト

| 項目     | 内容                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| テストID | TC-12                                                                             |
| テスト名 | `should pass onStatusChange prop to AuthKeySection`                               |
| 前提条件 | `AuthKeySection` がモック済み                                                     |
| 操作     | `const mockFn = vi.fn(); render(<ApiKeySettingsPanel onStatusChange={mockFn} />)` |
| 期待結果 | `AuthKeySection` が `onStatusChange={mockFn}` props を受け取っている              |

#### TC-13: 独立 IPC 呼び出しがないことの確認

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| テストID | TC-13                                                      |
| テスト名 | `should not call IPC directly (delegation only)`           |
| 前提条件 | `window.electronAPI.authKey` のモック設定済み              |
| 操作     | `render(<ApiKeySettingsPanel />)` — 初期レンダリングのみ   |
| 期待結果 | `window.electronAPI.authKey.exists()` が直接呼ばれていない |

#### TC-14: 既存の props インターフェース互換テスト

| 項目     | 内容                                                                    |
| -------- | ----------------------------------------------------------------------- |
| テストID | TC-14                                                                   |
| テスト名 | `should accept same props interface as before (backward compatibility)` |
| 前提条件 | `ApiKeySettingsPanelProps` 定義を確認                                   |
| 操作     | `render(<ApiKeySettingsPanel onStatusChange={vi.fn()} />)`              |
| 期待結果 | レンダリングエラーなし、型エラーなし                                    |

#### TC-15: スナップショット/回帰テスト

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| テストID | TC-15                                                    |
| テスト名 | `should match snapshot after delegation refactor`        |
| 前提条件 | `AuthKeySection` モック設定済み                          |
| 操作     | `render(<ApiKeySettingsPanel />)` → スナップショット取得 |
| 期待結果 | スナップショットが保存・一致する                         |

---

### タスク5: 型統一テスト設計（TC-16〜TC-18）

**テストファイルパス:** `packages/shared/src/types/__tests__/skillCreator.test.ts`（新規または既存）

#### TC-16: ApiKeyStatus 値セットテスト

| 項目     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| テストID | TC-16                                                                              |
| テスト名 | `ApiKeyStatus should include all required values`                                  |
| 前提条件 | `packages/shared/src/types/skillCreator.ts` の型定義読み込み                       |
| 操作     | 型チェック（`const status: ApiKeyStatus = "check-failed"` がコンパイルエラーなし） |
| 期待結果 | `not_set / validating / configured / error / check-failed` の全5値が有効           |

#### TC-17: check-failed 追加後の互換テスト

| 項目     | 内容                                                                         |
| -------- | ---------------------------------------------------------------------------- |
| テストID | TC-17                                                                        |
| テスト名 | `should not break existing ApiKeyStatus consumers after adding check-failed` |
| 前提条件 | `packages/shared/src/types/skillCreator.ts` に `"check-failed"` が追加済み   |
| 操作     | `pnpm --filter @repo/shared typecheck`                                       |
| 期待結果 | 型チェックエラーなし                                                         |

#### TC-18: AuthKeyStatus ローカル型廃止後の全ファイル型チェック

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| テストID | TC-18                                                           |
| テスト名 | `should pass typecheck after removing AuthKeyStatus local type` |
| 前提条件 | Phase 5 実装完了・`AuthKeyStatus` ローカル型削除済み            |
| 操作     | `pnpm --filter @repo/desktop typecheck`                         |
| 期待結果 | 型チェックエラーなし                                            |

---

### タスク6: テストファイルの雛形作成

以下のコマンドでテストファイル雛形の存在確認を行い、必要に応じて新規作成する。

```bash
# フック用テストディレクトリ確認
ls apps/desktop/src/renderer/hooks/__tests__/ 2>/dev/null

# 型定義テストの確認
ls packages/shared/src/types/__tests__/ 2>/dev/null

# 既存の ApiKeySettingsPanel テストの確認
cat apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx | head -30
```

**新規作成が必要なファイル:**

| ファイルパス                                                             | 理由                 |
| ------------------------------------------------------------------------ | -------------------- |
| `apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts` | フック新規作成のため |

**既存テストファイルの更新:**

| ファイルパス                                                                           | 更新内容                |
| -------------------------------------------------------------------------------------- | ----------------------- |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx` | TC-06〜TC-10 を追加     |
| `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`    | TC-11〜TC-15 に置き換え |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                     | 内容                |
| ---------- | ------------------------------------------------------------------------ | ------------------- |
| IPC 仕様   | `.claude/skills/aiworkflow-requirements/references/api-ipc-contracts.md` | IPC チャンネル定義  |
| UI/UX 仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design.md`      | コンポーネント設計  |
| 型定義仕様 | `packages/shared/src/types/skillCreator.ts`                              | 共有型 ApiKeyStatus |

### 実装参照ファイル

| ファイル                                                                               | 目的                       |
| -------------------------------------------------------------------------------------- | -------------------------- |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`               | テスト対象コンポーネント   |
| `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`                   | テスト対象コンポーネント   |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx` | 更新対象テスト             |
| `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`    | 更新対象テスト             |
| `docs/30-workflows/rt-04-authkey-component-dedup/phase-2-design.md`                    | フックインターフェース設計 |
| `docs/30-workflows/rt-04-authkey-component-dedup/phase-3-design-review.md`             | ゲート判定・MINOR 指摘     |

---

## 統合テスト連携【必須】

| 判定項目                                   | 基準                   | 実施方針                                     |
| ------------------------------------------ | ---------------------- | -------------------------------------------- |
| TC-01〜TC-05（フックテスト）               | Phase 5 実装後に Green | `renderHook` を使用、IPC はすべてモック      |
| TC-06〜TC-10（AuthKeySection テスト）      | Phase 5 実装後に Green | `useAuthKeyManagement` を `vi.mock` でモック |
| TC-11〜TC-15（ApiKeySettingsPanel テスト） | Phase 5 実装後に Green | `AuthKeySection` を `vi.mock` でモック       |
| TC-16〜TC-18（型テスト）                   | Phase 5 実装後に Green | `pnpm typecheck` で検証                      |
| ユニットテスト Line                        | 80%+                   | Phase 7 で計測                               |
| ユニットテスト Branch                      | 60%+                   | Phase 7 で計測                               |
| ユニットテスト Function                    | 80%+                   | Phase 7 で計測                               |

---

## 成果物

| 成果物           | パス                                 | 説明                      |
| ---------------- | ------------------------------------ | ------------------------- |
| テスト作成記録   | `outputs/phase-4/test-creation.md`   | TC-01〜TC-18 の設計記録   |
| フックテスト雛形 | `outputs/phase-4/hook-test-draft.ts` | TC-01〜TC-05 の雛形コード |

---

## 完了条件

- [ ] 既存テストの命名規則が確認されている
- [ ] TC-01〜TC-05（フックテスト）が設計されている
- [ ] TC-06〜TC-10（AuthKeySection テスト）が設計されている
- [ ] TC-11〜TC-15（ApiKeySettingsPanel テスト）が設計されている
- [ ] TC-16〜TC-18（型統一テスト）が設計されている
- [ ] テストファイルの新規作成・更新計画が明示されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                                               | 完了 |
| ---------------------------------------------------- | ---- |
| タスク1: 既存テスト命名規則確認                      | [ ]  |
| タスク2: TC-01〜TC-05 フックテスト設計               | [ ]  |
| タスク3: TC-06〜TC-10 AuthKeySection テスト設計      | [ ]  |
| タスク4: TC-11〜TC-15 ApiKeySettingsPanel テスト設計 | [ ]  |
| タスク5: TC-16〜TC-18 型統一テスト設計               | [ ]  |
| タスク6: テストファイル雛形作成                      | [ ]  |

## 次のPhase

Phase 5: 実装（[phase-5-implementation.md](phase-5-implementation.md)）

**Phase 4 完了後にのみ Phase 5 へ進むこと。**
