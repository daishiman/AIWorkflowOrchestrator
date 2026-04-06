# Phase 1: 要件定義

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 1                             |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

`AuthKeySection` と `ApiKeySettingsPanel` の差分を正確に把握し、統合要件・受入条件・スコープを確定する。

---

## 実行タスク

### Step 0: P50チェック（既実装状態の調査）

```bash
# AuthKeySection の現状確認
git log --oneline -10 -- apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx

# ApiKeySettingsPanel の現状確認
git log --oneline -10 -- apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx

# shared 型定義の確認
grep -n "ApiKeyStatus\|AuthKeyStatus" packages/shared/src/types/skillCreator.ts
grep -rn "ApiKeyStatus\|AuthKeyStatus" apps/desktop/src/renderer/
```

**確認済み実装状態（2026-04-06時点）:**

| ファイル                                    | 実装状況                                                          |
| ------------------------------------------- | ----------------------------------------------------------------- |
| `AuthKeySection/index.tsx`                  | 実装済み（ローカル型 AuthKeyStatus を保有）                       |
| `ApiKeySettingsPanel.tsx`                   | 実装済み（shared の ApiKeyStatus を使用）                         |
| `packages/shared/src/types/skillCreator.ts` | ApiKeyStatus 定義済み（4値: not_set/validating/configured/error） |

---

### タスク分類

**タスク分類: リファクタリング（UI task）**

- コンポーネント変更あり（AuthKeySection に props 追加、ApiKeySettingsPanel を委譲に変更）
- 新規フック作成あり（useAuthKeyManagement）
- 型統一あり（ローカル AuthKeyStatus → shared ApiKeyStatus への収束）
- Phase 11 は UI task として評価（screenshot 対象）

---

### タスク1: 差分分析

#### 1-A: 型・状態の差分

| 観点               | AuthKeySection                                     | ApiKeySettingsPanel                                       |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------- |
| ステータス型       | `AuthKeyStatus`（ローカル定義）                    | `ApiKeyStatus`（packages/shared）                         |
| ステータス値       | saved / env-fallback / not-set / check-failed      | not_set / validating / configured / error                 |
| store 依存         | `useAuthModeStatus`（store）                       | なし                                                      |
| IPC 呼び出し       | authKey.exists / authKey.set / authKey.delete      | authKey.exists / authKey.set / authKey.delete             |
| onStatusChange     | なし（Props なし）                                 | あり（`onStatusChange?: (status: ApiKeyStatus) => void`） |
| password 表示切替  | あり（showPassword state）                         | なし                                                      |
| バリデーション関数 | なし（空チェックのみ）                             | あり（sk- プレフィックス・長さチェック）                  |
| keySource 追跡     | authKeyStatus 値に包含（"saved" / "env-fallback"） | keySource state（"saved" / "env-fallback" / null）        |

#### 1-B: IPC フロー差分

| 操作   | AuthKeySection                            | ApiKeySettingsPanel                    |
| ------ | ----------------------------------------- | -------------------------------------- |
| 初期化 | `authKey.exists()` → AuthKeyStatus 設定   | `authKey.exists()` → ApiKeyStatus 設定 |
| 保存   | `authKey.set()` → checkAuthKeyStatus()    | `authKey.set()` → updateStatus()       |
| 削除   | `authKey.delete()` → checkAuthKeyStatus() | `authKey.delete()` → authKey.exists()  |

---

### タスク2: 機能要件（FR）定義

| ID    | 要件                                                             | 優先度 | 受入基準                                                                             |
| ----- | ---------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| FR-01 | `useAuthKeyManagement` カスタムフックの実装                      | 必須   | IPC 呼び出しロジック（exists/set/delete）が共通フックに集約されている                |
| FR-02 | `ApiKeyStatus` 型の `packages/shared` への統一                   | 必須   | `AuthKeyStatus` ローカル型が廃止され、shared の `ApiKeyStatus` に置き換えられている  |
| FR-03 | `AuthKeySection` に `onStatusChange` props を追加                | 必須   | `onStatusChange?: (status: ApiKeyStatus) => void` が受け付けられる                   |
| FR-04 | `ApiKeySettingsPanel` を `AuthKeySection` への委譲に変更         | 必須   | `ApiKeySettingsPanel` が `AuthKeySection` をラップするか廃止されている               |
| FR-05 | バリデーション関数（sk- プレフィックス・長さ）を統合フックに移動 | 必須   | フックまたは共通 util にバリデーションが実装されている                               |
| FR-06 | 重複テストのクリーンアップ                                       | 必須   | AuthKeySection.test.tsx と ApiKeySettingsPanel.test.tsx の重複ケースが整理されている |

---

### タスク3: 非機能要件（NFR）定義

| ID     | 要件                   | 優先度 | 受入基準                                      |
| ------ | ---------------------- | ------ | --------------------------------------------- |
| NFR-01 | 型安全性の維持         | 必須   | `pnpm typecheck` エラーなし                   |
| NFR-02 | リント適合             | 必須   | `pnpm lint` エラーなし                        |
| NFR-03 | テストカバレッジ維持   | 必須   | 既存テスト全 PASS、Line 80%+                  |
| NFR-04 | 後方互換性             | 必須   | `AuthKeySection` の既存利用箇所が壊れない     |
| NFR-05 | IPC 仕様変更コスト削減 | 目標   | IPC 変更時の修正箇所が1ファイル（フック）のみ |

---

### タスク4: 受入条件（AC）定義

AC-1: `ApiKeySettingsPanel` の IPC 呼び出しロジックが `AuthKeySection`（または共通フック）に統合されている

AC-2: `ApiKeyStatus` 型が `packages/shared` に唯一定義され、両コンポーネントが共有している

AC-3: `AuthKeySection` が `onStatusChange` props を受け取れるよう拡張されている

AC-4: 既存テストが全 PASS（`pnpm --filter @repo/desktop test` が PASS）

AC-5: `pnpm lint` / `pnpm typecheck` がエラーなし

AC-6: `useAuthKeyManagement` フックに `exists / set / delete` IPC 呼び出しが統合されている

---

### タスク5: スコープ定義

**含む:**

- `useAuthKeyManagement` フックの新規実装
- `ApiKeyStatus` 型の統一（AuthKeyStatus → ApiKeyStatus への移行）
- `AuthKeySection` への `onStatusChange` props 追加
- `ApiKeySettingsPanel` の委譲実装または廃止
- 重複テストのクリーンアップ

**含まない:**

- IPC チャネルの新規追加（既存 authKey.{exists, set, delete} を使用）
- AuthKeySection の UI 変更（password 表示切替などの既存 UI は維持）
- SettingsView/SkillLifecyclePanel の構造変更
- 新規 IPC ハンドラの追加

---

### タスク6: 命名規則確認

```bash
# 既存命名規則の確認
grep -rn "use[A-Z]" apps/desktop/src/renderer/hooks/ | head -20
grep -rn "AuthKeyStatus\|ApiKeyStatus" apps/desktop/src/renderer/ | head -20
```

**確認済み命名規則:**

| 対象           | 規則         | 例                        |
| -------------- | ------------ | ------------------------- |
| フック         | camelCase    | `useAuthKeyManagement`    |
| 型名           | PascalCase   | `ApiKeyStatus`            |
| コンポーネント | PascalCase   | `AuthKeySection`          |
| ファイル名     | camelCase.ts | `useAuthKeyManagement.ts` |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                     | 内容                           |
| ---------- | ------------------------------------------------------------------------ | ------------------------------ |
| IPC 仕様   | `.claude/skills/aiworkflow-requirements/references/api-ipc-contracts.md` | IPC チャネル定義               |
| UI/UX 仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design.md`      | コンポーネント設計ガイドライン |
| 型定義仕様 | `packages/shared/src/types/skillCreator.ts`                              | 共有型 ApiKeyStatus            |

### 実装参照ファイル

| ファイル                                                                               | 目的                           |
| -------------------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`               | 主導線コンポーネント（現行）   |
| `apps/desktop/src/renderer/components/skill/ApiKeySettingsPanel.tsx`                   | 補助導線コンポーネント（現行） |
| `packages/shared/src/types/skillCreator.ts`                                            | 共有 ApiKeyStatus 型           |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.test.tsx` | 既存テスト                     |
| `apps/desktop/src/renderer/components/skill/__tests__/ApiKeySettingsPanel.test.tsx`    | 既存テスト                     |

---

## 統合テスト連携【必須】

| 判定項目               | 基準 | 実施方針                              |
| ---------------------- | ---- | ------------------------------------- |
| ユニットテストLine     | 80%+ | フック・コンポーネント両方で計測      |
| ユニットテストBranch   | 60%+ | IPC 成功/失敗パスをカバー             |
| ユニットテストFunction | 80%+ | useAuthKeyManagement の全関数をカバー |

---

## 成果物

| 成果物     | パス                              | 説明                |
| ---------- | --------------------------------- | ------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本 Phase の実行記録 |

---

## 完了条件

- [x] 2コンポーネントの差分分析が完了している
- [x] 機能要件 FR-01〜FR-06 が定義されている
- [x] 非機能要件 NFR-01〜NFR-05 が定義されている
- [x] 受入条件 AC-1〜AC-6 が検証可能な形で定義されている
- [x] スコープ（含む/含まない）が明確に定義されている
- [x] タスク分類（UI task）が記録されている
- [x] 命名規則が確認されている
- [x] **本 Phase 内の全タスクを 100% 実行完了**

## タスク100%実行確認【必須】

| タスク                | 完了 |
| --------------------- | ---- |
| Step 0: P50 チェック  | ✅   |
| タスク分類記録        | ✅   |
| タスク1: 差分分析     | ✅   |
| タスク2: FR 定義      | ✅   |
| タスク3: NFR 定義     | ✅   |
| タスク4: AC 定義      | ✅   |
| タスク5: スコープ定義 | ✅   |
| タスク6: 命名規則確認 | ✅   |

## 次のPhase

Phase 2: 設計（[phase-2-design.md](phase-2-design.md)）

**Phase 1 完了後にのみ Phase 2 へ進むこと。**
