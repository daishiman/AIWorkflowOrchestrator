# 型インターフェース設計

## 公開 DTO

```typescript
export type VerifyCheckResult = {
  checkId: string;
  label: string;
  passed: boolean;
  message?: string;
};

export type VerifyResult = {
  skillName: string;
  passed: boolean;
  checkResults: VerifyCheckResult[];
  summary: string;
};
```

## 変換元

- `RuntimeSkillCreatorVerifyCheck[]`
- `SkillCreatorVerificationEngine.verify(skillDir)` の戻り値

## 変換ルール

| 項目                        | 変換           |
| --------------------------- | -------------- |
| `check.id`                  | `checkId`      |
| `check.summary`             | `label`        |
| `check.severity === "info"` | `passed: true` |
| `check.evidenceSummary`     | `message`      |

## summary の方針

- 文字列の固定フォーマットに依存しすぎない
- 最低限、検査件数を含む要約にする
- 例: `${checks.length} checks completed` または同等の簡潔な文

## 補足

- 既存の `SkillCreatorVerifyResult` とは別物
- `SkillCreatorVerifyResult` は workflow state 用、`VerifyResult` は公開 IPC DTO 用
