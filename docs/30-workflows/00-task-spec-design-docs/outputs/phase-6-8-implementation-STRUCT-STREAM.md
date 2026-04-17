# Phase 6-8: 実装詳細 (TASK-SW-STRUCT-001 / TASK-SW-STREAM-001)

## 変更ファイル一覧

| ファイル                                                                     | 変更種別   |
| ---------------------------------------------------------------------------- | ---------- |
| `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                | 実装変更   |
| `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | テスト更新 |

---

## TASK-SW-STRUCT-001: runCreateWorkflow の出力仕様修正

### 変更ファイル・行番号

`SkillCreatorService.ts` — `runCreateWorkflow` メソッド（旧: 622-628行付近 / 新: 665-671行付近）

### 変更前

```typescript
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: extractPurposeAgent, // エージェントプロンプト文字列を誤代入
  features: [],
  agents: [extractPurposeAgent, planStructureAgent], // プロンプト文字列を誤代入
};
```

### 変更後

```typescript
const structurePlan: StructurePlanJson = {
  skillName: options.name,
  description: options.description,
  purpose: options.description, // LLM推論は将来タスク。現状はdescriptionをpurposeとして使用
  features: [],
  agents: ["extract-purpose", "plan-structure"], // エージェント名リスト
};

// extractPurposeAgent/planStructureAgentは将来のLLM呼び出しで使用予定
void extractPurposeAgent;
void planStructureAgent;
```

### 実装上の判断事項

- `purpose` はLLM推論（extract-purposeエージェント呼び出し）が本来の実装だが、将来タスクとして `options.description` を暫定値として使用
- `agents` はエージェントプロンプト文字列ではなく、エージェント識別名の文字列リスト `["extract-purpose", "plan-structure"]` とすることで `StructurePlanJson` の型定義 `agents: string[]` と意味的に整合させる
- `extractPurposeAgent` / `planStructureAgent` 変数は `loadAgent` 呼び出しテスト（TC-01, TC-B01）が依存しているため削除せず、`void` で unused 警告を回避しつつ保持する

---

## TASK-SW-STREAM-001: createSkill にオプショナル進捗コールバックを追加

### 変更ファイル・行番号

`SkillCreatorService.ts` — `createSkill` メソッドシグネチャ（旧: 86行 / 新: 87-94行）

### 変更前

```typescript
async createSkill(options: CreateSkillOptions): Promise<string> {
```

### 変更後

```typescript
async createSkill(
  options: CreateSkillOptions,
  onProgress?: (progress: {
    phase: string;
    percentage: number;
    message: string;
  }) => void,
): Promise<string> {
```

### 追加したコールバック呼び出し箇所（5カ所）

| タイミング                              | phase                   | percentage | message                        |
| --------------------------------------- | ----------------------- | ---------- | ------------------------------ |
| runCreateWorkflow 開始前（旧119行付近） | `"planning"`            | 10         | `"スキル構造を計画しています"` |
| init_skill.js 開始前（旧141行付近）     | `"generating-skill"`    | 40         | `"スキルを初期化しています"`   |
| SKILL.md 生成前（旧178行付近）          | `"generating-skill-md"` | 70         | `"SKILL.md を生成しています"`  |
| validateSkill 開始前（旧209行付近）     | `"validating"`          | 90         | `"スキルを検証しています"`     |
| return 直前（旧222行付近）              | `"done"`                | 100        | `"完了しました"`               |

### 実装上の判断事項

- コールバックは `onProgress?.()` のオプショナルチェーンで呼び出すため、既存の呼び出し元（コールバックなし）は一切影響を受けない（後方互換性を完全に維持）
- `phase` は文字列型とし、呼び出し元が任意の型ガードを実装できるよう柔軟性を確保
- コールバック呼び出しは非同期処理の「直前」に配置し、処理が開始されたことをUIへ通知する設計とした

---

## テスト更新箇所

### SkillCreatorService.test.ts — TC-04（`runCreateWorkflow` 返却値検証）

**変更前**:

```typescript
expect(structurePlan).toMatchObject({
  skillName: "test-skill",
  description,
  purpose: "mock-agent-content",
  agents: ["mock-agent-content", "mock-agent-content"],
});
```

**変更後**:

```typescript
expect(structurePlan).toMatchObject({
  skillName: "test-skill",
  description,
  purpose: description, // LLM推論は将来タスク。現状はdescriptionをpurposeとして使用
  agents: ["extract-purpose", "plan-structure"], // エージェント名文字列リスト
});
```

**変更理由**: TASK-SW-STRUCT-001 の仕様変更（`purpose` と `agents` の値）に合わせてアサーションを更新。他のテスト（TC-01, TC-B01: `loadAgent` 呼び出し確認）は `loadAgent` のモック呼び出し回数・引数を検証しており、`runCreateWorkflow` の返却値には依存しないため変更不要。
