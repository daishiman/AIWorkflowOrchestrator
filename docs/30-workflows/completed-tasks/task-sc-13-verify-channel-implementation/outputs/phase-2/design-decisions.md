# 設計決定書

## 1. VerifyResult 型設計

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

- `RuntimeSkillCreatorVerifyCheck` をラップして IPC 向けに簡略化した型
- `passed` は全チェックが severity === "info" の場合に true
- `label` には `summary` をそのまま載せ、`message` には `evidenceSummary` を使う

## 1.1 DTO 変換ルール

| 内部型                                               | 公開型                            |
| ---------------------------------------------------- | --------------------------------- |
| `RuntimeSkillCreatorVerifyCheck.id`                  | `VerifyCheckResult.checkId`       |
| `RuntimeSkillCreatorVerifyCheck.summary`             | `VerifyCheckResult.label`         |
| `RuntimeSkillCreatorVerifyCheck.severity === "info"` | `VerifyCheckResult.passed = true` |
| `RuntimeSkillCreatorVerifyCheck.evidenceSummary`     | `VerifyCheckResult.message`       |

## 2. IPC チャネル定数

```typescript
// packages/shared/src/ipc/channels.ts
export const SKILL_CREATOR_VERIFY = "skill-creator:verify" as const;
```

- preload/channels.ts の IPC_CHANNELS にも追加
- ALLOWED_INVOKE_CHANNELS にも追加

## 3. skillName 解決方針

- 公開 IPC surface は `skillName` を受ける
- `verificationEngine.verify()` は `skillDir` を要求する
- そのため Facade で `SkillLocator.resolveSkillDir(skillName, process.cwd())` を使って解決する
- `SkillFileManager.findSkillDir()` は private のため直接利用しない

## 4. 4層実装フロー

shared channels.ts → preload/channels.ts → RuntimeSkillCreatorFacade → creatorHandlers.ts → skill-creator-api.ts

## 5. エラー契約

- `error: string`（sanitizeErrorMessage() 適用後）
- `{ code, message }` オブジェクトではない（P60 知見）

## 6. テスト方針

- UT: `creatorHandlers.verify.test.ts`（新規作成）
- E2E: `skill-creator-integration.test.ts` に verify シナリオ追加
- assertIpcError(result, "string") で error: string 型を確認
