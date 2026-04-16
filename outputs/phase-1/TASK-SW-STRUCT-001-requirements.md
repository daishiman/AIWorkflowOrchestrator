# TASK-SW-STRUCT-001 Phase 1: 要件定義

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-SW-STRUCT-001 |
| Phase      | 1                  |
| 作成日     | 2026-04-16         |
| ステータス | 完了               |

## Step 0: P50チェック（現状確認）

### 実装対象確認（SkillCreatorService.ts 行 630-653）

```typescript
// 現状（問題のある実装）
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    const extractPurposeAgent =
      await this.resourceLoader.loadAgent("extract-purpose");
    const planStructureAgent =
      await this.resourceLoader.loadAgent("plan-structure");

    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: extractPurposeAgent,  // 問題: エージェントプロンプト文字列が入っている
      features: [],
      agents: [extractPurposeAgent, planStructureAgent],  // 問題: プロンプト文字列2本が入っている
    };
    return structurePlan;
  } catch {
    return null;
  }
}
```

### StructurePlanJson インターフェース（行 35-43）

```typescript
interface StructurePlanJson {
  skillName: string;
  description: string;
  purpose: string; // スキルの目的を表す説明文字列
  features: string[]; // スキルの機能リスト
  agents: string[]; // エージェント識別名のリスト
  triggers?: string[];
  anchors?: string[];
}
```

### 既存テストの現状

"create モード" describe ブロック（TC-01〜TC-B06）が以下の古い動作をテストしている：

- TC-01: `loadAgent` が呼ばれることを確認（古い動作）
- TC-04: `runCreateWorkflow` が内部エラー時に `null` を返すことを確認（新しい値）
- TC-05: `loadAgent` が呼ばれないことを確認（create モードでの不要呼び出し防止）
- TC-B01: `loadAgent` が一切呼ばれないことを確認（create モードの回帰防止）
- TC-B06: `loadAgent` が呼ばれないことを確認（create モードと他モードの分離確認）

## Task 1: 問題特定と影響範囲調査

### 問題の根本原因

| 問題                       | 現状                                                               | 正しい値                                                            |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| `purpose` フィールドの誤り | `extractPurposeAgent`（エージェントプロンプト本文文字列）          | `options.description`（スキルの説明文）                             |
| `agents` フィールドの誤り  | `[extractPurposeAgent, planStructureAgent]`（プロンプト文字列2本） | `["extract-purpose", "plan-structure"]`（エージェント識別名リスト） |

`StructurePlanJson.purpose` は「スキルの目的を表す説明文字列」であるべきだが、
現状ではエージェントへの命令文（数百〜数千文字）が入っている。

### 後続利用の確認

- 行 126: `void structurePlan;` — 現時点では未使用
- TASK-SW-STRUCT-002 で `generate_skill_md.js` に渡す予定（本タスク完了後に接続）

### LLM統合の分離方針

- 実際の `purpose` 抽出（LLM呼び出し）は **TASK-SW-STRUCT-002 以降の別タスク** で実装
- 本タスクでは `options.description` を `purpose` に使用する最小修正に留める

### 影響範囲

- 変更対象: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（1ファイル）
- 外部API変更: なし（`createSkill()` のシグネチャ変更なし）
- IPC/Preload 層への影響: なし

## Task 2: 受入条件の策定

| ID   | 条件                                                                                                       | テストID |
| ---- | ---------------------------------------------------------------------------------------------------------- | -------- |
| AC-1 | `structurePlan.purpose` に `options.description` が設定される（エージェントプロンプト文字列でない）        | TC-01    |
| AC-2 | `structurePlan.agents` に `["extract-purpose", "plan-structure"]` というエージェント名リストが設定される   | TC-02    |
| AC-3 | `structurePlan.features` が空配列で維持されている                                                          | TC-03    |
| AC-4 | `runCreateWorkflow` の内部エラーが発生した場合でも `createSkill()` は成功する（フォールバック：null 返却） | TC-04    |
| AC-5 | `collaborative` モードの既存テストが全てパスし続ける                                                       | TC-R01   |

## 完了確認

- [x] Step 0（P50チェック）を実行し、現状コードを確認した
- [x] Task 1（問題特定と影響範囲調査）を100%実行した
- [x] Task 2（受入条件の策定）を100%実行した
- [x] LLM統合を別タスクに分離する方針が明記されている
- [x] 後続タスク TASK-SW-STRUCT-002 との接続点が確認されている
