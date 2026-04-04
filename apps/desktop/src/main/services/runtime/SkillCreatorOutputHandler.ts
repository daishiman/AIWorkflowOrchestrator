/**
 * SkillCreatorOutputHandler - スキル出力捕捉・保存・登録・通知ハンドラー
 * TASK-SDK-SC-04: Skill Output Integration
 *
 * SDK セッション完了時に skill-creator が生成したスキル出力を捕捉し、
 * `.claude/skills/{skill-name}/SKILL.md` に保存、SkillRegistry に登録、
 * UI に skill-creator:output-ready IPC で通知するまでのパイプラインを担う。
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { WebContents } from "electron";
import { SKILL_CREATOR_OUTPUT_READY } from "@repo/shared/ipc/channels";
import type {
  ParsedSkillOutput,
  SkillOutputReadyPayload,
} from "@repo/shared/types/skillCreator";
import type { SkillRegistry } from "./SkillRegistry";

export class SkillCreatorOutputHandler {
  constructor(
    private readonly projectRoot: string,
    private readonly skillRegistry: SkillRegistry,
    private readonly webContents: WebContents,
  ) {}

  /**
   * SDK セッション出力テキストからスキル定義を抽出する。
   *
   * 戦略A（正常系）: `<!-- SKILL_START: {skillName} -->` / `<!-- SKILL_END: {skillName} -->` マーカーを検出
   * 戦略B（フォールバック）: マーカーが存在しない場合はアシスタントメッセージ全体をスキル内容として扱う
   *   （name: フィールドが見つからない場合は null）
   */
  extractSkillFromOutput(sessionOutput: string): ParsedSkillOutput | null {
    const startMatch = sessionOutput.match(/<!-- SKILL_START:\s*(.+?)\s*-->/);
    const endMatch = sessionOutput.match(/<!-- SKILL_END:\s*(.+?)\s*-->/);

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

    const nameMatch = content.match(/^name:\s*(.+)$/m);
    const markerName = hasValidMarkers ? startMatch?.[1]?.trim() : undefined;
    const name = nameMatch?.[1]?.trim() ?? markerName;
    if (!name) {
      return null;
    }

    const dirName = name.toLowerCase().replace(/\s+/g, "-");

    return { name, content, dirName };
  }

  /**
   * 抽出したスキル定義をファイルシステムに保存する。
   * @returns 保存先のフルパス
   */
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

  /**
   * 保存済みスキルを SkillRegistry に登録する。
   */
  async registerToRegistry(skillPath: string): Promise<void> {
    await this.skillRegistry.registerFromPath(skillPath);
  }

  /**
   * スキル保存・登録完了後に IPC 通知を送信する。
   */
  notifyOutputReady(payload: SkillOutputReadyPayload): void {
    this.webContents.send(SKILL_CREATOR_OUTPUT_READY, payload);
  }

  /**
   * 上書き確認後に保存・登録を再開する。
   * UI 側でユーザーが「上書きして保存」を承認した際に呼ぶ。
   */
  async handleOverwriteApproved(
    payload: SkillOutputReadyPayload,
  ): Promise<void> {
    const skill: ParsedSkillOutput = {
      name: payload.skillName,
      content: payload.content,
      dirName: payload.skillName.toLowerCase().replace(/\s+/g, "-"),
    };

    let savedPath: string;
    try {
      savedPath = await this.saveSkill(skill);
    } catch (err) {
      console.error("[SkillCreatorOutputHandler] スキル保存失敗:", err);
      return;
    }

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

  /**
   * SDK セッション完了時のメインエントリポイント。
   * extract → 上書き確認判定 → save/register/notify
   *
   * @param sessionOutput SDK セッションの出力テキスト
   */
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

    // 上書き確認が必要な場合は通知して UI 側の確認を待つ
    if (requiresOverwriteConfirm) {
      this.notifyOutputReady({
        skillName: skill.name,
        savedPath: targetPath,
        content: skill.content,
        requiresOverwriteConfirm: true,
      });
      return;
    }

    let savedPath: string;
    try {
      savedPath = await this.saveSkill(skill);
    } catch (err) {
      console.error("[SkillCreatorOutputHandler] スキル保存失敗:", err);
      return;
    }

    try {
      await this.registerToRegistry(savedPath);
    } catch (err) {
      console.error("[SkillCreatorOutputHandler] Registry 登録失敗:", err);
      // Registry 登録失敗でも UI 通知は継続する（ファイル保存優先）
    }

    this.notifyOutputReady({
      skillName: skill.name,
      savedPath,
      content: skill.content,
      requiresOverwriteConfirm: false,
    });
  }
}
