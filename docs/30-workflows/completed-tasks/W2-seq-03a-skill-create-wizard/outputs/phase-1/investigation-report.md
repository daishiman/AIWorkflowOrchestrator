# Phase 1 調査結果レポート - UT-VERIFY-DOC-CONSOLIDATION-001

## 対象ファイル現状調査

### 1. task-workflow.md

**インデックステーブル列構成:**

| ファイル | 役割 | 主な見出し |

- 「役割」列は存在するが「区分」列は**存在しない**
- 各エントリに `> 役割:` 形式のラベルは付与されていない（テーブル値のみ）
- インデックステーブルには 25+ エントリが存在する

**改善必要箇所:**

- インデックステーブルに「区分」列を追加し、正本/履歴/契約仕様を明記する

---

### 2. task-workflow-completed.md

**冒頭5行:**

```
# タスク実行仕様書生成ガイド / completed records

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records

## 完了タスク
```

**現状:**

- `> 役割: completed records` は存在する
- `> 区分:` ラベルは**存在しない**

**改善必要箇所:**

- `> 役割: completed records` の直後に `> 区分: 履歴記録（history record）` を追記

---

### 3. task-workflow-active.md

**冒頭5行:**

```
# タスク実行仕様書生成ガイド / active guide

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: active guide

## 概要
```

**現状:**

- `> 役割: active guide` は存在する
- `> 区分:` ラベルは**存在しない**

**改善必要箇所:**

- `> 役割: active guide` の直後に `> 区分: 正本（current contract）` を追記

---

### 4. interfaces-skill-verify-contract.md

**概要セクション冒頭:**

```
# FR-04 verify 契約 — Check ID 体系

## 概要

`SkillCreatorVerificationEngine` は、スキル定義の品質を保証する検証エンジンである。
```

**現状:**

- `> 区分:` ラベルは**存在しない**
- current contract としての位置づけが明示されていない
- Check ID 体系（L1-001〜L4-003、19件）は確定している

**改善必要箇所:**

- H1 タイトルの直後に `> 区分: 契約仕様（current contract / Check ID 体系）` を追記
- 責務分離セクション `## verify エンジン責務分離` を追加

---

### 5. RuntimeSkillCreatorFacade.ts シグネチャ確認

**verifySkill() — 294行目:**

```typescript
async verifySkill(
  skillDir: string,
): Promise<import("@repo/shared").RuntimeSkillCreatorVerifyCheck[]>
```

- 内部で `this.verificationEngine.verify(skillDir)` を呼び出す
- ガバナンスフック（`onSessionStart` / `onSessionEnd`）付きで結果を中継する

**verifyAndImproveLoop() — 352行目:**

```typescript
async verifyAndImproveLoop(
  planId: string,
  skillDir: string,
  skillName: string,
  authMode: string,
  apiKey?: string,
): Promise<RuntimeSkillCreatorVerifyAndImproveResult>
```

- `verifySkill()` を内部で繰り返し呼び出す
- `checks` の severity に基づいて improve ループを制御する

---

### 6. SkillCreatorVerificationEngine.ts verify() シグネチャ確認

**verify() メソッド:**

- 実装ファイル: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
- 返却型: `RuntimeSkillCreatorVerifyCheck[]`
- 責務: 19 件の Check を 4 Layer（構造→コンテンツ→詳細→参照整合性）で実行

---

## 調査サマリー

| ファイル                              | 現状の問題                                   | 改善アクション                            |
| ------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| `task-workflow.md`                    | 「区分」列なし                               | インデックステーブルに「区分」列追加      |
| `task-workflow-completed.md`          | `> 区分:` ラベルなし                         | `> 区分: 履歴記録（history record）` 追記 |
| `task-workflow-active.md`             | `> 区分:` ラベルなし                         | `> 区分: 正本（current contract）` 追記   |
| `interfaces-skill-verify-contract.md` | `> 区分:` ラベルなし、責務分離セクションなし | ラベル追記＋責務分離セクション追加        |
