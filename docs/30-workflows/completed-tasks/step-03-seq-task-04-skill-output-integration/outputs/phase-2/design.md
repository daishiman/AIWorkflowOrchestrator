# Phase 2 成果物: 設計書 — TASK-SDK-SC-04

## 変更ファイル一覧

| ファイルパス                                                                     | 変更種別 | 内容                                                                 |
| -------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| `packages/shared/src/ipc/channels.ts`                                            | 更新     | `SKILL_CREATOR_OUTPUT_READY` 定数追記・`IPC_CHANNELS` スプレッド追加 |
| `packages/shared/src/types/skillCreator.ts`                                      | 更新     | `ParsedSkillOutput` / `SkillOutputReadyPayload` 追加                 |
| `apps/desktop/src/main/services/runtime/SkillRegistry.ts`                        | 新規作成 | スキルレジストリクラス（`registerFromPath()` 含む）                  |
| `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`            | 新規作成 | スキル出力捕捉・保存・登録・通知ハンドラー                           |
| `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` | 新規作成 | スキル生成完了通知・プレビュー表示コンポーネント                     |

## 型定義

```typescript
interface ParsedSkillOutput {
  name: string;
  content: string;
  dirName: string;
}

interface SkillOutputReadyPayload {
  skillName: string;
  savedPath: string;
  content: string;
  requiresOverwriteConfirm: boolean;
}
```

## パース戦略フロー

```
セッション出力 → SKILL_START マーカー検出
  ├─ 存在 → マーカー間の内容を抽出 → ParsedSkillOutput
  └─ 不存在 → name: フィールド正規表現 → 取得失敗なら null
```

## 上書き確認フロー

```
saveSkill() 前 → .claude/skills/{dirName}/SKILL.md 存在確認
  ├─ 未存在 → requiresOverwriteConfirm: false → 保存・登録・通知
  └─ 存在   → requiresOverwriteConfirm: true → UI確認 → ユーザー承認後に再開
```

## IPC チャネル定数

```typescript
export const SKILL_CREATOR_OUTPUT_READY = "skill-creator:output-ready" as const;
```
