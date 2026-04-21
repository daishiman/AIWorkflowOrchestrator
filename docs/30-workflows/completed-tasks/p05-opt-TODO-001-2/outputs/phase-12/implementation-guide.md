# Phase 12: 実装ガイド

## Part 1: 中学生レベルの説明

なぜ必要かというと、もう終わった作業のメモが残っていると、次に見る人が「まだやるのかな」と勘違いするからです。

たとえば、教室の黒板に「月曜日に体育着を持ってくる」と書いてあって、月曜日が終わったあともそのまま残っていたら混乱します。コードの未処理メモも同じで、終わったら消えているべきです。

今回の task は、そのメモを新しく消す作業ではありません。すでに別の作業で消えていたことを確認して、「もう終わっている」と仕様書の方も正しく書き直した task です。

## Part 2: 技術者向け詳細

| 項目                | 内容                                                 |
| ------------------- | ---------------------------------------------------- |
| workflow            | current workflow directory                           |
| implementation_mode | verify_existing                                      |
| cleanup 完了根拠    | PR #2199 / commit `2fcca99de`                        |
| 対象コード          | `ConversationRoundStep.tsx`, `SkillCreateWizard.tsx` |
| 変更の主眼          | code change ではなく workflow contract 正規化        |

### current contract

- `ConversationRoundStep.tsx` に cleanup 対象 symbol はない
- `SkillCreateWizard.tsx` は `resolveExternalIntegration(toolNames)` を使う
- 外部 API / IPC / 型 export の追加変更はない

### 型定義 / interface

```ts
type ResolveExternalIntegration = (
  toolNames: string[],
) => Promise<ExternalIntegrationSummary | null>;
```

- 新規型定義追加: N/A
- 既存 interface 変更: N/A
- current contract は既存コードの確認に留まる

### API シグネチャ

```ts
resolveExternalIntegration(toolNames: string[]): Promise<ExternalIntegrationSummary | null>
```

### 使用例

```ts
const integration = await resolveExternalIntegration(toolNames);
```

### エラーハンドリング

- 今回 wave で新規ハンドリング追加なし
- verify_existing task のため、既存実装の例外経路を改変しない

### エッジケース

- cleanup 対象 symbol が 0件であること
- `toolNames` が空でも今回 task のスコープでは code change しない

### 設定可能パラメータ / 定数

- 新規追加なし
- cleanup task 固有の設定値追加なし

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

- primary evidence: `outputs/phase-11/TASK-SW-TODO-001-manual-test-report.md`
- supplementary evidence: `outputs/phase-11/manual-test-result.md`
- supplementary evidence: `outputs/phase-11/manual-test-checklist.md`
- supplementary evidence: `outputs/phase-10/final-review-result.md`
