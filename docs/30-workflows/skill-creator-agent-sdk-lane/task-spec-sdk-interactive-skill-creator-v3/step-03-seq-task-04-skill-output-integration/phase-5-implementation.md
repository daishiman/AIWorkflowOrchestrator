# Phase 5: 実装（Green） -- Skill Output Integration

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 5                        |
| 機能名     | skill-output-integration |
| タスクID   | TASK-SDK-SC-04           |
| 作成日     | 2026-04-02               |
| 依存 Phase | Phase 4（テスト作成）    |

## 目的

TDD の Green フェーズとして、Phase 4 で定義した T-01 から T-06 が全て PASS するように `SkillCreatorOutputHandler` / `SkillCreatorResultPanel` / `SkillRegistry` / `channels.ts` を実装する。

## 実行タスク

### Task 5-1: `channels.ts` へのチャネル定数追加

`packages/shared/src/ipc/channels.ts` に以下を追記する。

```typescript
// --- Skill Creator: 出力統合 ---
export const SKILL_CREATOR_OUTPUT_READY = "skill-creator:output-ready" as const;
```

追記箇所: 既存の `skill-creator:*` 定数グループの末尾。

### Task 5-2: `skillCreator.ts` への型定義追加

`packages/shared/src/types/skillCreator.ts` に以下を追加する。

```typescript
/**
 * SDK セッション出力から抽出されたスキル定義
 */
export interface ParsedSkillOutput {
  /** スキル名（SKILL.md の name フィールドから取得） */
  name: string;
  /** SKILL.md の全内容 */
  content: string;
  /** 保存先ディレクトリ名（スキル名をスラッグ化したもの） */
  dirName: string;
}

/**
 * skill-creator:output-ready IPC ペイロード
 */
export interface SkillOutputReadyPayload {
  /** スキル名 */
  skillName: string;
  /** 保存先のフルパス */
  savedPath: string;
  /** SKILL.md 内容（プレビュー用） */
  content: string;
  /** 既存スキルの上書き確認が必要か */
  requiresOverwriteConfirm: boolean;
}
```

### Task 5-3: `SkillRegistry.ts` への `registerFromPath()` 追加

```typescript
// apps/desktop/src/main/services/runtime/SkillRegistry.ts
// 既存クラスに追加

/**
 * SKILL.md のファイルパスからスキルを登録（または更新）する
 * 既存スキルが存在する場合は上書きする
 * @param skillPath SKILL.md のフルパス
 */
async registerFromPath(skillPath: string): Promise<void> {
  const content = await fs.readFile(skillPath, "utf-8");
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  if (!nameMatch) {
    throw new Error(
      `[SkillRegistry] SKILL.md に name フィールドが見つかりません: ${skillPath}`,
    );
  }
  const skillName = nameMatch[1].trim();
  // 既存エントリを削除して再登録
  this.unregister(skillName);
  this.register({ name: skillName, path: skillPath, content });
}
```

### Task 5-4: `SkillCreatorOutputHandler.ts` の新規実装

```typescript
// apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts

import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { WebContents } from "electron";
import { SKILL_CREATOR_OUTPUT_READY } from "@repo/shared/src/ipc/channels";
import type {
  ParsedSkillOutput,
  SkillOutputReadyPayload,
} from "@repo/shared/src/types/skillCreator";
import type { SkillRegistry } from "./SkillRegistry";

export class SkillCreatorOutputHandler {
  constructor(
    private readonly projectRoot: string,
    private readonly skillRegistry: SkillRegistry,
    private readonly webContents: WebContents,
  ) {}

  extractSkillFromOutput(sessionOutput: string): ParsedSkillOutput | null {
    const startMarker = "<!-- SKILL_START -->";
    const endMarker = "<!-- SKILL_END -->";
    const startIdx = sessionOutput.indexOf(startMarker);
    const endIdx = sessionOutput.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
      return null;
    }

    const content = sessionOutput
      .slice(startIdx + startMarker.length, endIdx)
      .trim();

    const nameMatch = content.match(/^name:\s*(.+)$/m);
    if (!nameMatch) {
      return null;
    }
    const name = nameMatch[1].trim();
    const dirName = name.toLowerCase().replace(/\s+/g, "-");

    return { name, content, dirName };
  }

  async saveSkill(skill: ParsedSkillOutput): Promise<string> {
    const dirPath = path.join(
      this.projectRoot,
      ".claude",
      "skills",
      skill.dirName,
    );
    const filePath = path.join(dirPath, "SKILL.md");

    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(filePath, skill.content, "utf-8");

    return filePath;
  }

  async registerToRegistry(skillPath: string): Promise<void> {
    await this.skillRegistry.registerFromPath(skillPath);
  }

  notifyOutputReady(payload: SkillOutputReadyPayload): void {
    this.webContents.send(SKILL_CREATOR_OUTPUT_READY, payload);
  }

  async handleSessionComplete(sessionOutput: string): Promise<void> {
    const skill = this.extractSkillFromOutput(sessionOutput);
    if (!skill) {
      return;
    }

    const targetPath = path.join(
      this.projectRoot,
      ".claude",
      "skills",
      skill.dirName,
      "SKILL.md",
    );

    let requiresOverwriteConfirm = false;
    try {
      await fs.access(targetPath);
      requiresOverwriteConfirm = true;
    } catch {
      // ファイルが存在しない場合は上書き確認不要
    }

    // 上書き確認が必要な場合は通知して処理を一時停止
    // （UI 側でユーザー確認後に保存再開する設計）
    if (requiresOverwriteConfirm) {
      this.notifyOutputReady({
        skillName: skill.name,
        savedPath: targetPath,
        content: skill.content,
        requiresOverwriteConfirm: true,
      });
      return;
    }

    const savedPath = await this.saveSkill(skill);

    try {
      await this.registerToRegistry(savedPath);
    } catch (err) {
      console.error("[SkillCreatorOutputHandler] Registry 登録失敗:", err);
      // Registry 登録失敗でも UI 通知は続行する
    }

    this.notifyOutputReady({
      skillName: skill.name,
      savedPath,
      content: skill.content,
      requiresOverwriteConfirm: false,
    });
  }
}
```

### Task 5-5: `SkillCreatorResultPanel.tsx` の新規実装

```typescript
// apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx

import React from "react";
import type { SkillOutputReadyPayload } from "@repo/shared/src/types/skillCreator";

interface SkillCreatorResultPanelProps {
  payload: SkillOutputReadyPayload | null;
  onOpenSkill: (savedPath: string) => void;
}

export const SkillCreatorResultPanel: React.FC<
  SkillCreatorResultPanelProps
> = ({ payload, onOpenSkill }) => {
  if (!payload) {
    return null;
  }

  return (
    <div className="skill-creator-result-panel">
      <h2>スキルを生成しました: {payload.skillName}</h2>
      {payload.requiresOverwriteConfirm && (
        <div className="overwrite-warning">
          同名のスキルが既に存在します。上書きしますか？
        </div>
      )}
      <p className="saved-path">{payload.savedPath}</p>
      <pre className="skill-preview">
        <code>{payload.content}</code>
      </pre>
      <button onClick={() => onOpenSkill(payload.savedPath)}>
        スキルを開く
      </button>
    </div>
  );
};
```

## 参照資料

| 資料名         | パス                                                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計   | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-2-design.md`        |
| Phase 4 テスト | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-4-test-creation.md` |

## 成果物

| 成果物                       | パス                                                                             | 形式       |
| ---------------------------- | -------------------------------------------------------------------------------- | ---------- |
| 実装書（本ファイル）         | `docs/.../phase-5-implementation.md`                                             | Markdown   |
| SkillCreatorOutputHandler.ts | `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`            | TypeScript |
| SkillCreatorResultPanel.tsx  | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` | TypeScript |
| SkillRegistry.ts（更新）     | `apps/desktop/src/main/services/runtime/SkillRegistry.ts`                        | TypeScript |
| channels.ts（追記）          | `packages/shared/src/ipc/channels.ts`                                            | TypeScript |
| skillCreator.ts（型追加）    | `packages/shared/src/types/skillCreator.ts`                                      | TypeScript |

## 完了条件

- [ ] `SKILL_CREATOR_OUTPUT_READY` 定数を `channels.ts` に追記した
- [ ] `ParsedSkillOutput` / `SkillOutputReadyPayload` 型を `skillCreator.ts` に追加した
- [ ] `SkillRegistry.registerFromPath()` を実装した
- [ ] `SkillCreatorOutputHandler` の全メソッドを実装した
- [ ] `SkillCreatorResultPanel` コンポーネントを実装した
- [ ] T-01 から T-06 が全件 PASS した（Green 状態）

## 次の Phase: Phase 6 (phase-6-test-expansion.md)
