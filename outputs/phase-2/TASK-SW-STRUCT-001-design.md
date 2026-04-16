# TASK-SW-STRUCT-001 Phase 2: 設計

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | TASK-SW-STRUCT-001 |
| Phase      | 2                  |
| 作成日     | 2026-04-16         |
| ステータス | 完了               |

## Task 1: 修正箇所の特定と変更内容設計

**変更対象**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts` 行 630-653

### 変更前

```typescript
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
      purpose: extractPurposeAgent,                   // 誤り: エージェントプロンプト文字列
      features: [],
      agents: [extractPurposeAgent, planStructureAgent], // 誤り: プロンプト文字列2本
    };
    return structurePlan;
  } catch {
    return null;
  }
}
```

### 変更後

```typescript
/**
 * createモードのワークフロー実行
 * AC-1: purpose に options.description を使用（エージェントプロンプト文字列でない）
 * AC-2: agents にエージェント名リストを設定
 * AC-3: features は空配列（LLM統合は別タスク）
 * AC-4: エラー時は null を返しフォールバック
 * NOTE: LLM による purpose 抽出は別タスクで実装する
 */
private async runCreateWorkflow(
  options: CreateSkillOptions,
): Promise<StructurePlanJson | null> {
  try {
    const structurePlan: StructurePlanJson = {
      skillName: options.name,
      description: options.description,
      purpose: options.description,                    // AC-1: LLM統合は別タスク
      features: [],                                    // AC-3: LLM統合は別タスク
      agents: ["extract-purpose", "plan-structure"],  // AC-2: エージェント名リスト
    };
    return structurePlan;
  } catch {
    // AC-4: 将来の処理追加に備えてフォールバックを維持
    return null;
  }
}
```

## Task 2: loadAgent 呼び出しの扱い設計

**採用方針: 方針B（loadAgent 呼び出しを削除）**

理由:

- `purpose` / `agents` の値は `options.description` とエージェント名定数で構成するため、`loadAgent` の戻り値が不要
- 不要なファイルI/Oを排除することで副作用を減らす
- フォールバック（`null` 返却）は `try/catch` で維持するが、実質的にエラー発生ルートが消える

## Task 3: フォールバック設計

`try/catch` 構造は将来の処理追加に備えて維持する。現時点では `try` ブロック内は失敗しない。

## Task 4: concern 数と設計書分割基準確認

- concern 数: 1（`runCreateWorkflow` の出力仕様修正のみ）
- 単一ファイル修正で完結

## Task 5: IPC 4層整合性チェック

本タスクは `SkillCreatorService` 内部メソッドの修正であり、IPC チャンネルの変更なし。
4層整合性チェックは不要。

## 既存テストの更新計画

以下のテストが新実装と乖離するため更新が必要:

| テストID                | 問題                                          | 更新方針                                   |
| ----------------------- | --------------------------------------------- | ------------------------------------------ |
| TC-01（create モード）  | `loadAgent` 呼び出しを期待                    | loadAgent 不要なため別の観点のテストに更新 |
| TC-04（create モード）  | `purpose: "mock-agent-content"` を期待        | `purpose: description` に更新              |
| TC-05（create モード）  | `loadAgent("extract-purpose")` 呼び出しを期待 | `loadAgent` 呼び出しなしに更新             |
| TC-B01（create モード） | `loadAgent` 2回呼び出しを期待                 | `loadAgent` 呼び出しなしに更新             |
| TC-B06（モード分岐）    | `loadAgent("plan-structure")` 呼び出しを期待  | `loadAgent` 呼び出しなしに更新             |

## 完了確認

- [x] 変更前/後のコードが設計書に明記されている
- [x] `loadAgent` 呼び出し削除の方針（方針B）が確定している
- [x] フォールバック設計（`try/catch` 維持）が完了している
- [x] IPC 4層整合性チェックが不要と判断されている
- [x] 既存テストの更新計画が明記されている
