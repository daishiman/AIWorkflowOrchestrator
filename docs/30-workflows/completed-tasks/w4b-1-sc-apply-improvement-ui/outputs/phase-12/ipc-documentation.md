# IPC ドキュメント: skill-creator:apply-improvement

## チャンネル情報

| 項目                | 値                                              |
| ------------------- | ----------------------------------------------- |
| チャンネル名        | `skill-creator:apply-improvement`               |
| 定数名              | `IPC_CHANNELS.SKILL_CREATOR_APPLY_IMPROVEMENT`  |
| メソッド            | invoke                                          |
| ハンドラファイル    | `apps/desktop/src/main/ipc/creatorHandlers.ts`  |
| Preload APIファイル | `apps/desktop/src/preload/skill-creator-api.ts` |

## 引数

```typescript
{
  skillName: string;
  suggestions: RuntimeSkillCreatorImproveSuggestion[];
}
```

各 suggestion の構造:

```typescript
{
  section: string; // セクション名（例: "## 目的"）
  before: string; // 変更前テキスト
  after: string; // 変更後テキスト
  reason: string; // 変更理由
}
```

## 戻り値

```typescript
IpcResult<ApplyImprovementResult>;
// = { success: true, data: ApplyImprovementResult }
// | { success: false, error: string }
```

ApplyImprovementResult:

```typescript
{
  applied: number;
  skipped: number;
  skippedDetails: { section: string; reason: string }[];
  errors: string[];
}
```

## バリデーション

| 条件                             | エラーメッセージ                             |
| -------------------------------- | -------------------------------------------- |
| skillName が未指定/空/空白のみ   | "skillName が指定されていません"             |
| suggestions が配列でない         | "suggestions が配列ではありません"           |
| suggestions が空                 | "suggestions が空です"                       |
| suggestions が101件以上          | "suggestions が上限（100件）を超えています"  |
| suggestion要素のフィールド不正   | "suggestions[N] の構造が不正です"            |
| RuntimeSkillCreatorService未注入 | "Runtime Skill Creator は現在利用できません" |

## セキュリティ

- `validateIpcSender()` による送信元検証
- `sanitizeErrorMessage()` によるエラーサニタイズ
- P42準拠3段バリデーション
- DoS防御: suggestions上限100件
