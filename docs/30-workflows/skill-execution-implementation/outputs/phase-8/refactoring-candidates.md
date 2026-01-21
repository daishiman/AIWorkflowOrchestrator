# Phase 8: リファクタリング候補リスト

## 実行日時

2026-01-18

## 評価対象

| #   | 対象                      | リファクタリング内容         | 優先度 | 実施判定 |
| --- | ------------------------- | ---------------------------- | ------ | -------- |
| 1   | SkillService.executeSkill | エラーハンドリングの共通化   | 中     | 見送り   |
| 2   | skillHandlers             | 検証ロジックの抽出           | 低     | 見送り   |
| 3   | AgentView.handleExecute   | ローディング状態管理のhook化 | 低     | 見送り   |

## 詳細分析

### 1. SkillService.executeSkill - エラーハンドリングの共通化

**現状**:

```typescript
if (!skill) {
  throw new Error("スキルが見つかりません");
}
if (!this.importManager.isImported(skillId)) {
  throw new Error("スキルがインポートされていません");
}
```

**リファクタリング案**:

```typescript
// エラーファクトリーパターン
class SkillError extends Error {
  constructor(code: "NOT_FOUND" | "NOT_IMPORTED", skillId: string) {
    const messages = {
      NOT_FOUND: "スキルが見つかりません",
      NOT_IMPORTED: "スキルがインポートされていません",
    };
    super(messages[code]);
    this.name = "SkillError";
  }
}
```

**判定: 見送り**

- 理由: 現時点ではエラーパターンが2種類のみで、共通化による効果が限定的
- 今後のエラーパターン増加時に再検討

### 2. skillHandlers - 検証ロジックの抽出

**現状**:

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
if (typeof args?.skillId !== "string" || args.skillId === "") {
  return { success: false, error: "skillId must be a string" };
}
```

**リファクタリング案**:

```typescript
// 検証ユーティリティ
function validateSkillExecuteArgs(
  args: unknown,
): args is { skillId: string; params?: Record<string, unknown> } {
  return (
    typeof args === "object" &&
    args !== null &&
    "skillId" in args &&
    typeof (args as Record<string, unknown>).skillId === "string" &&
    (args as Record<string, unknown>).skillId !== ""
  );
}
```

**判定: 見送り**

- 理由: 検証ロジックは他のハンドラーと同じパターンを維持しており、変更リスクが高い
- 将来的に Zod などのバリデーションライブラリ導入時に再検討

### 3. AgentView.handleExecute - ローディング状態管理のhook化

**現状**:

```typescript
const handleExecute = useCallback(
  async (skill: Skill) => {
    try {
      const result = await skillAPI.execute(skill.id);
      // ...
    } catch (err) {
      // ...
    }
  },
  [showToast],
);
```

**リファクタリング案**:

```typescript
// カスタムフック
function useSkillExecution() {
  const [isExecuting, setIsExecuting] = useState(false);
  const { showToast } = useToast();

  const execute = useCallback(
    async (skill: Skill) => {
      setIsExecuting(true);
      try {
        // ...
      } finally {
        setIsExecuting(false);
      }
    },
    [showToast],
  );

  return { execute, isExecuting };
}
```

**判定: 見送り**

- 理由: 現時点ではローディング状態は使用されておらず、過度な抽象化となる
- 将来的にローディングインジケーター追加時に再検討

## 結論

現時点では全てのリファクタリング候補を**見送り**とする。

**理由**:

1. コードは既に Clean Code の原則に従っている
2. 過度な抽象化は複雑性を増す
3. 将来の要件追加時に再検討する

**YAGNI原則**: You Aren't Gonna Need It - 現時点で必要のない機能は実装しない
