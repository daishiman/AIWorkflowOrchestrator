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
  this.unregister(skillName);
  this.register({ name: skillName, path: skillPath, content });
}
```

### Task 5-4: `SkillCreatorOutputHandler.ts` の実装

`SkillCreatorOutputHandler` は `SkillCreatorIpcBridge` から呼ばれる別系統パイプラインとして実装する。マーカー付き SDK 出力を抽出し、path-safe な `dirName` に変換して保存・登録・IPC 通知までを担う。

```typescript
// apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts

import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { WebContents } from "electron";
import { SKILL_CREATOR_OUTPUT_READY } from "@repo/shared/ipc/channels";
import type {
  ParsedSkillOutput,
  SkillOutputReadyPayload,
} from "@repo/shared/types/skillCreator";
import type { SkillRegistry } from "./SkillRegistry";

export const SKILL_START_MARKER_RE = /<!-- SKILL_START:\s*(.+?)\s*-->/;
export const SKILL_END_MARKER_RE = /<!-- SKILL_END:\s*(.+?)\s*-->/;
const NAME_PATTERN = /^name:\s*(.+)$/m;

export class SkillCreatorOutputHandler {
  constructor(
    private readonly projectRoot: string,
    private readonly skillRegistry: SkillRegistry,
    private readonly webContents: WebContents,
  ) {}

  private toSlug(name: string): string {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[\\/]+/g, "-")
      .replace(/\.\.+/g, "-")
      .replace(/\0/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    return slug || "unnamed-skill";
  }

  extractSkillFromOutput(sessionOutput: string): ParsedSkillOutput | null {
    const startMatch = sessionOutput.match(SKILL_START_MARKER_RE);
    const endMatch = sessionOutput.match(SKILL_END_MARKER_RE);

    const startIndex = startMatch?.index;
    const endIndex = endMatch?.index;
    const hasValidMarkers =
      !!startMatch &&
      !!endMatch &&
      startIndex !== undefined &&
      endIndex !== undefined &&
      endIndex > startIndex;

    const content = hasValidMarkers
      ? sessionOutput.slice(startIndex + startMatch[0].length, endIndex).trim()
      : sessionOutput.trim();

    const nameMatch = content.match(NAME_PATTERN);
    const markerName = hasValidMarkers ? startMatch?.[1]?.trim() : undefined;
    const name = nameMatch?.[1]?.trim() ?? markerName;
    if (!name) {
      return null;
    }

    return { name, content, dirName: this.toSlug(name) };
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

### Task 5-5: `SkillCreatorResultPanel.tsx` の実装

`SkillCreatorResultPanel` は `SkillOutputReadyPayload` を受け取り、スキル名と SKILL.md プレビューを表示する。
`requiresOverwriteConfirm` が `true` の場合は上書き確認ボタンを表示する。

### Task 5-6: 実装確認

`SkillCreatorOutputHandler.test.ts` と `SkillCreatorResultPanel.test.tsx` が T-01 から T-06 で Green になることを確認する。

## 参照資料

| 資料名         | パス                                                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-4-test-creation.md` |

## 成果物

| 成果物               | パス                                                                                                                                                               | 形式     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 実装書（本ファイル） | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-5-implementation.md` | Markdown |

## 完了条件

- [ ] `SKILL_CREATOR_OUTPUT_READY` を追加した
- [ ] `ParsedSkillOutput` / `SkillOutputReadyPayload` を追加した
- [ ] `SkillRegistry.registerFromPath()` を追加した
- [ ] `SkillCreatorOutputHandler` を path-safe かつ current facts で実装した
- [ ] `SkillCreatorResultPanel` を実装した
- [ ] T-01 から T-06 が PASS することを確認した

## 次の Phase: Phase 6 (phase-6-test-expansion.md)
