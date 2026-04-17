# 実装ガイド: TASK-SW-STREAM-001

## 概要

`SkillCreatorService.createSkill()` に `onProgress?` コールバック引数を追加した。
5段階（planning/generating-skill/generating-agents/validating/done）で呼び出す。
コールバックはオプショナルのため既存の呼び出し元に影響しない。

## 型定義

```typescript
type SkillCreatorProgressData = {
  phase: string; // "planning" | "generating-skill" | "generating-agents" | "validating" | "done"
  percentage: number; // 10 | 40 | 70 | 90 | 100
  message: string; // 日本語の進捗メッセージ
};

type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;
```

## 利用方法（TASK-SW-STREAM-002向け）

```typescript
// skillCreatorHandlers.ts での使用例
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

## 5段階の進捗フロー

| Phase             | percentage | message                          |
| ----------------- | ---------- | -------------------------------- |
| planning          | 10         | 構造を計画しています             |
| generating-skill  | 40         | SKILL.md を生成しています        |
| generating-agents | 70         | エージェント定義を生成しています |
| validating        | 90         | スキルを検証しています           |
| done              | 100        | 完了しました                     |

## 注意事項

- callback例外は伝播する（main processの内部APIは失敗を握りつぶさない設計）
- `SkillCreatorProgressData` はローカル定義。TASK-SW-STREAM-002接続後、shared移動を検討
- モード差異（collaborative/orchestrate）は現状なし。後続タスクFUP-03で対応予定
