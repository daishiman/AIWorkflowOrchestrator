# UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001 - 要件定義書

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001                      |
| 機能名     | SkillCreateWizard / LLM生成テスト describe.skip クリーンアップ |
| Phase      | 1                                                              |
| 作成日     | 2026-04-16                                                     |
| ステータス | completed                                                      |

---

## P0チェック結果: 対象ファイル存在確認

```
SkillCreateWizard.llm-generation.test.tsx: deleted
```

**結論**: current worktree にて削除済みを確認。

---

## P50チェック結果: 詳細状態確認

### describe.skip 件数

- 対象ファイル (`SkillCreateWizard.llm-generation.test.tsx`): 削除済みのため 0 件（N/A）
- companion test (`SkillCreateWizard.test.tsx`): 0 件（describe.skip なし）

### generationMode / planSkill / executePlan の除去確認

```
grep 結果: "- 旧 generationMode 分岐を廃止し、LLM専用フローへ統一"（コメントのみ残存）
実装上の generationMode / planSkill / executePlan: 削除済み確認
```

### TODO(W2-seq-03a) の残存確認

```
grep 結果: 0 件（全 SkillCreateWizard 関連ファイルで未検出）
```

### git 履歴確認

```
f92d0433d fix(skill-wizard): generationModeラジオボタン廃止・LLM専用化（TASK-SW-FIX-MODE-MGMT-001）
476dfede9 feat(skill-wizard): UT-SKILL-WIZARD-W2-seq-03a LLM専用化
8971cc333 feat(skill-wizard): TASK-SC-07 planSkill/executePlan 接続
```

→ `SkillCreateWizard.llm-generation.test.tsx` は最後の変更コミット `f92d0433d` で削除（`D` マーク）

---

## 問題点の整理

| 問題             | 現状                                                                     | 判定     |
| ---------------- | ------------------------------------------------------------------------ | -------- |
| デッドコード蓄積 | 削除済みのため存在しない                                                 | 解消済み |
| CI 信頼性低下    | 削除済みのため describe.skip が CI に影響しない                          | 解消済み |
| 新規参入者の混乱 | 削除済みのため不要なコードが残っていない                                 | 解消済み |
| エッジケース欠落 | SkillCreateWizard.test.tsx がエラー・lockRef・キャンセル相当をカバー済み | 解消済み |

---

## 選択肢の評価と方針決定

### 選択肢 A: ファイル削除（既定採用）

- **採用理由**: current worktree ですでに削除済みのため
- **評価**: 対象ファイルは存在せず、追加作業不要
- **判定**: 既定採用（実施済み扱い）

### 選択肢 B: 部分再利用（N/A）

- **不採用理由**: SkillCreateWizard.test.tsx が F-2/F-3/E-4/W-8b 相当のエッジケースをカバー済みのため
  - F-2相当（API undefined ガード）: `IPC 失敗時にエラーカードが表示される`
  - F-3相当（例外スロー処理）: `mockCreateSkill.mockRejectedValue(new Error("生成失敗"))`
  - E-4相当（失敗後 isGenerating(false)）: `generationLockRef` 境界テスト群
  - W-8b相当（非同期競合防止）: `TC-08/09`, `TC-10`, `TC-13` の lockRef 解放テスト

---

## 受け入れ基準（AC-1〜AC-5）の固定

| ID   | 受け入れ基準                                                    | 判定方法                             | 結果                          |
| ---- | --------------------------------------------------------------- | ------------------------------------ | ----------------------------- |
| AC-1 | `describe.skip` 状態のテストが 0 件（削除または書き直し済み）   | `grep -c "describe.skip"` の結果が 0 | PASS（N/A: ファイル削除済み） |
| AC-2 | 選択肢B 採用時のエッジケーステスト追加（N/A: 選択肢A 既定採用） | 対象外                               | N/A                           |
| AC-3 | `pnpm --filter @repo/desktop test:run` が PASS                  | CI 全件 PASS                         | pending                       |
| AC-4 | `pnpm --filter @repo/desktop typecheck` が PASS                 | TypeScript 0 error                   | PASS                          |
| AC-5 | `TODO(W2-seq-03a)` コメントが削除されている                     | `grep -rn "TODO.*W2-seq-03a"` → 0 件 | PASS（0 件確認済み）          |

---

## タスク分類の宣言

| 分類項目   | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスク種別 | CLEANUPタスク                                      |
| 変更範囲   | テストファイルのみ（プロダクションコード変更なし） |
| UIタスク   | 非UIタスク（UIの見た目変更なし）                   |
| 可視性     | NON_VISUAL（テストコードのみ変更）                 |
| テスト種別 | コンポーネントテスト（desktop renderer 層）        |

---

## 完了確認

- [x] P0チェック実施済み（削除済みを確認）
- [x] P50チェック実施済み（describe.skip 0 件、generationMode 削除済み確認）
- [x] 問題点（4点）整理済み（全て解消済み）
- [x] 選択肢A 既定採用、選択肢B N/A を宣言
- [x] AC-1〜AC-5 が定義・一部確認済み
- [x] タスク分類（CLEANUP / テストファイルのみ / NON_VISUAL）を宣言済み
