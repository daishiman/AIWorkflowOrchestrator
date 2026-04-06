# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 8                             |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

Phase 5 の実装で機能的に正しくなったコードを、可読性・保守性の観点から整理する。`AuthKeyStatus` ローカル型の完全削除・直接 IPC 呼び出しコードの削除・冗長な状態管理コードの削除・重複テストの統合を行う。変更内容は「対象 / Before / After / 理由」テーブルで記録する。

---

## 実行タスク

### タスク0: Phase 7 完了確認

```bash
# カバレッジ目標が達成されていることを確認
cat docs/30-workflows/rt-04-authkey-component-dedup/outputs/phase-7/coverage-result.md

# 全テストが Green であることを確認
pnpm --filter @repo/desktop test -- --run
```

---

### タスク1: `AuthKeyStatus` ローカル型の完全削除

**対象ファイル:** `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`

**確認コマンド:**

```bash
# 削除漏れがないことを確認
grep -n "AuthKeyStatus" apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx
grep -rn "AuthKeyStatus" apps/desktop/src/ packages/
```

**変更記録:**

| 対象                           | Before                                                                                                  | After                                                                             | 理由                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `AuthKeyStatus` 型定義         | `type AuthKeyStatus = "saved" \| "env-fallback" \| "not-set" \| "check-failed"` が `index.tsx` 内に存在 | 定義なし（`packages/shared` の `ApiKeyStatus` を使用）                            | 型の一元管理（AC-2）。ローカル型が残るとドリフトの原因になる |
| `authKeyStatus` state の型     | `useState<AuthKeyStatus>(...)`                                                                          | `useState<ApiKeyStatus>(...)`（または `useAuthKeyManagement` の `status` を使用） | 型統一による型安全性の確保                                   |
| `AuthKeyStatus` の import 宣言 | `import type { AuthKeyStatus } ...` が存在する場合                                                      | 削除                                                                              | 未使用 import の排除                                         |

**合格基準:**

```bash
# マッチ0件であること
grep -rn "AuthKeyStatus" apps/desktop/src/ | grep -v "\.test\."
```

---

### タスク2: `AuthKeySection/index.tsx` からの直接 IPC 呼び出しコードの削除

**対象ファイル:** `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`

**確認コマンド:**

```bash
grep -n "window.electronAPI.authKey" apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx
grep -n "checkAuthKeyStatus\|electronAPI" apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx
```

**変更記録:**

| 対象                                               | Before                                                                | After                                                       | 理由                                    |
| -------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------- |
| `checkAuthKeyStatus` 関数                          | `async function checkAuthKeyStatus() { ... }` が `index.tsx` 内に存在 | 削除（`useAuthKeyManagement` の `refresh` に統合済み）      | IPC ロジックの単一責任化（AC-1 / AC-6） |
| `window.electronAPI.authKey.exists()` 直接呼び出し | `useEffect` 内に直接記述                                              | `useAuthKeyManagement` フック経由に置き換え済み             | フックへの集約（FR-01）                 |
| `window.electronAPI.authKey.set()` 直接呼び出し    | `handleSave` 関数内に直接記述                                         | `useAuthKeyManagement` の `handleSave` 経由に置き換え済み   | フックへの集約（FR-01）                 |
| `window.electronAPI.authKey.delete()` 直接呼び出し | `handleDelete` 関数内に直接記述                                       | `useAuthKeyManagement` の `handleDelete` 経由に置き換え済み | フックへの集約（FR-01）                 |

**合格基準:**

```bash
# マッチ0件であること
grep -n "window.electronAPI.authKey" apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx
```

---

### タスク3: `ApiKeySettingsPanel.tsx` の冗長な状態管理コードの削除

**対象ファイル:** `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`

**確認コマンド:**

```bash
grep -n "useState\|useEffect\|window.electronAPI" apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx
wc -l apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx
```

**変更記録:**

| 対象                      | Before                                                          | After                                                | 理由                                          |
| ------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `status` state            | `const [status, setStatus] = useState<ApiKeyStatus>("not_set")` | 削除（委譲先 `AuthKeySection` が管理）               | 委譲パターンにより重複状態管理が不要（FR-04） |
| `keySource` state         | `const [keySource, setKeySource] = useState<...>(null)`         | 削除                                                 | 委譲先で管理                                  |
| `inputValue` state        | `const [inputValue, setInputValue] = useState("")`              | 削除                                                 | 委譲先で管理                                  |
| `isSubmitting` state      | `const [isSubmitting, setIsSubmitting] = useState(false)`       | 削除                                                 | 委譲先で管理                                  |
| `useEffect`（初期化処理） | `authKey.exists()` を呼ぶ `useEffect`                           | 削除                                                 | 委譲先で初期化                                |
| IPC 呼び出し関数群        | `handleSave` / `handleDelete` 等の定義                          | 削除                                                 | 委譲先のフックに集約済み（AC-1）              |
| コンポーネント JSX        | フォームUI の全 JSX                                             | `<AuthKeySection onStatusChange={onStatusChange} />` | 委譲パターン（FR-04 / Phase 2 Option A）      |

**委譲後の最小ファイルサイズ確認（目安）:**

```bash
# 委譲後は 20行以内が目安
wc -l apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx
```

**合格基準:**

```bash
# useState / useEffect の残存なし
grep -n "useState\|useEffect\|window.electronAPI" apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx
```

---

### タスク4: 重複テストケースの統合

**対象ファイル:**

- `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`

**確認コマンド:**

```bash
# AuthKeySection テストのケース一覧
grep -n "it\(\|test\(" apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx

# ApiKeySettingsPanel テストのケース一覧
grep -n "it\(\|test\(" apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx

# フックテストのケース一覧
grep -n "it\(\|test\(" apps/desktop/src/renderer/hooks/__tests__/useAuthKeyManagement.test.ts
```

**変更記録:**

| 対象                                                  | Before                                              | After                                              | 理由                                         |
| ----------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| `AuthKeySection.test.tsx` の IPC 呼び出しテスト       | `authKey.exists()` 呼び出しを直接テスト             | 削除（フックテストに集約済み）                     | IPC テストはフック層で一元管理（DRY 原則）   |
| `ApiKeySettingsPanel.test.tsx` の状態管理テスト       | `status` / `keySource` の状態変化を直接テスト       | 削除（委譲後は `AuthKeySection` / フックでテスト） | 委譲後の状態管理は委譲先でテスト済み         |
| `ApiKeySettingsPanel.test.tsx` のバリデーションテスト | `sk-` プレフィックスチェック等のバリデーション確認  | 削除（フックテスト TC-25〜TC-27 に集約済み）       | バリデーションロジックはフック層でテスト済み |
| `AuthKeyStatus` 型を参照しているアサーション          | `"saved"` / `"env-fallback"` 等のローカル型値を使用 | `ApiKeyStatus` の値（`"configured"` 等）に統一     | 型統一後の整合性確保                         |

**統合後の確認:**

```bash
# 重複パターンがないことを確認
# （IPC 呼び出しのテストがコンポーネントテストに残っていないこと）
grep -n "electronAPI.authKey" \
  apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx \
  apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx
```

---

### タスク5: コード品質の最終確認

```bash
# Lint（自動修正）
pnpm --filter @repo/desktop lint --fix
pnpm --filter @repo/shared lint --fix

# 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck

# 未使用 import の確認
grep -rn "AuthKeyStatus" apps/desktop/src/ packages/

# 全テスト実行（退行確認）
pnpm --filter @repo/desktop test -- --run
```

---

### タスク6: AC 最終検証

**全受入条件の最終確認:**

| AC   | 確認コマンド                                                                                       | 合格基準                     | 判定 |
| ---- | -------------------------------------------------------------------------------------------------- | ---------------------------- | ---- |
| AC-1 | `grep -n "electronAPI.authKey" apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx` | マッチ0件                    | [ ]  |
| AC-2 | `grep -rn "type ApiKeyStatus\|interface ApiKeyStatus" packages/ apps/`                             | `packages/shared` のみ1件    | [ ]  |
| AC-3 | `grep -n "onStatusChange" apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`  | props 定義が存在する         | [ ]  |
| AC-4 | `pnpm --filter @repo/desktop test -- --run`                                                        | 全テスト PASS                | [ ]  |
| AC-5 | `pnpm --filter @repo/desktop typecheck && pnpm --filter @repo/desktop lint`                        | エラーなし                   | [ ]  |
| AC-6 | `grep -n "electronAPI.authKey" apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`            | exists / set / delete が存在 | [ ]  |

---

### タスク7: MINOR 指摘の最終確認

| MINOR ID  | 内容                                                   | 解決方法                                                           | 状態           |
| --------- | ------------------------------------------------------ | ------------------------------------------------------------------ | -------------- |
| TECH-M-01 | `ApiKeySettingsPanel` 廃止は委譲後の未タスクとして保留 | Phase 12 にて未タスクとして積む                                    | 保留（意図的） |
| TECH-M-02 | `useAuthModeStatus` store 依存をフックに含めるか       | Phase 5 で判断済み（`outputs/phase-5/tech-m-02-decision.md` 参照） | 解決済み       |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料   | パス                                                                     | 内容               |
| ---------- | ------------------------------------------------------------------------ | ------------------ |
| IPC 仕様   | `.claude/skills/aiworkflow-requirements/references/api-ipc-contracts.md` | IPC チャンネル定義 |
| UI/UX 仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design.md`      | コンポーネント設計 |

### 実装参照ファイル

**リファクタリング対象ファイル:**

| ファイルパス                                                                           | リファクタリング内容                      |
| -------------------------------------------------------------------------------------- | ----------------------------------------- |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`               | AuthKeyStatus 削除・直接 IPC 呼び出し削除 |
| `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`                   | 冗長な状態管理コード削除                  |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx` | 重複テスト削除                            |
| `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`    | 重複テスト削除・委譲後テストに整理        |

### 設計参照

| ドキュメント       | パス                                                                        |
| ------------------ | --------------------------------------------------------------------------- |
| Phase 2 設計       | `docs/30-workflows/rt-04-authkey-component-dedup/phase-2-design.md`         |
| Phase 3 レビュー   | `docs/30-workflows/rt-04-authkey-component-dedup/phase-3-design-review.md`  |
| Phase 7 カバレッジ | `docs/30-workflows/rt-04-authkey-component-dedup/phase-7-coverage-check.md` |

---

## 統合テスト連携【必須】

| 判定項目                                          | 基準                                     | 実施方針                                    |
| ------------------------------------------------- | ---------------------------------------- | ------------------------------------------- |
| `AuthKeyStatus` ローカル型の完全削除              | grep マッチ0件                           | タスク1 確認コマンドで確認                  |
| 直接 IPC 呼び出しの削除（AuthKeySection）         | grep マッチ0件                           | タスク2 確認コマンドで確認                  |
| 冗長な状態管理コードの削除（ApiKeySettingsPanel） | grep マッチ0件（useState 等）            | タスク3 確認コマンドで確認                  |
| 重複テストの統合完了                              | IPC テストがコンポーネント層に残存しない | タスク4 確認コマンドで確認                  |
| AC-1〜AC-6 全達成                                 | 各コマンドが合格基準を満たす             | タスク6 AC 最終検証チェックで確認           |
| 全テスト退行なし                                  | Phase 7 での Green が維持                | `pnpm --filter @repo/desktop test -- --run` |

---

## 成果物

| 成果物               | パス                                 | 説明                            |
| -------------------- | ------------------------------------ | ------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md` | Before/After テーブル・判断記録 |
| AC 最終検証記録      | `outputs/phase-8/ac-final-check.md`  | AC-1〜AC-6 の最終判定結果       |

---

## 完了条件

- [ ] `AuthKeyStatus` ローカル型が `AuthKeySection/index.tsx` から完全に削除されている
- [ ] `AuthKeySection/index.tsx` に `window.electronAPI.authKey` の直接呼び出しが存在しない
- [ ] `ApiKeySettingsPanel.tsx` に `useState` / `useEffect` / 直接 IPC 呼び出しが存在しない
- [ ] 重複テストケースが統合され、コンポーネントテストに IPC 呼び出しテストが残存しない
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `pnpm --filter @repo/desktop test -- --run` が全 PASS
- [ ] AC-1〜AC-6 が全達成
- [ ] MINOR 指摘（TECH-M-01 / TECH-M-02）の状態が記録されている
- [ ] リファクタリング記録が `outputs/phase-8/refactoring-log.md` に保存されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                                                  | 完了 |
| ------------------------------------------------------- | ---- |
| タスク0: Phase 7 完了確認                               | [ ]  |
| タスク1: AuthKeyStatus ローカル型の完全削除             | [ ]  |
| タスク2: AuthKeySection 直接 IPC 呼び出しコードの削除   | [ ]  |
| タスク3: ApiKeySettingsPanel 冗長な状態管理コードの削除 | [ ]  |
| タスク4: 重複テストケースの統合                         | [ ]  |
| タスク5: コード品質最終確認（lint / typecheck / test）  | [ ]  |
| タスク6: AC-1〜AC-6 最終検証                            | [ ]  |
| タスク7: MINOR 指摘の最終確認・記録                     | [ ]  |

## 次のPhase

Phase 9: 統合テスト（[phase-9-integration-test.md](phase-9-integration-test.md)）

**Phase 8 完了・AC-1〜AC-6 全達成後にのみ Phase 9 へ進むこと。**
