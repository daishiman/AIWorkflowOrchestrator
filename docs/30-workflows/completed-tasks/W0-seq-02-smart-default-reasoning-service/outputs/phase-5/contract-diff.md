# API 差分記録（契約差分）

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 5                                              |

## 新規公開 API

### `@repo/shared` からの新規エクスポート

```typescript
// packages/shared/index.ts に追加
export { inferSmartDefaults } from "./src/services/skillCreator";
```

### 関数シグネチャ

```typescript
export function inferSmartDefaults(
  input: SkillInfoFormData,
): SmartDefaultResult;
```

### 引数型（変更なし・W0-seq-01 成果物）

```typescript
interface SkillInfoFormData {
  skillName?: string;
  purpose: string;
  category: SkillCategory | null;
}
```

### 返り値型（変更なし・W0-seq-01 成果物）

```typescript
interface SmartDefaultResult {
  who: string | null;
  input: string | null;
  timing: string | null;
  output: string | null;
  tool: string | null;
  format: string | null;
  inferenceLog?: string[]; // 実装では常に string[] を返す
}
```

## 破壊的変更

なし（新規 API の追加のみ）

## W2-seq-03a 向け利用例

```typescript
import { inferSmartDefaults } from "@repo/shared";

const result = inferSmartDefaults({
  skillName: "通知スキル",
  purpose: "毎日Slackに通知を送る",
  category: "automation",
});
// result.tool === "slack"
// result.timing === "scheduled"
// result.format === null
// result.inferenceLog === ["purpose に 'Slack' を検出 → tool = 'slack'", "定期実行キーワードを検出 → timing = 'scheduled'"]
```
