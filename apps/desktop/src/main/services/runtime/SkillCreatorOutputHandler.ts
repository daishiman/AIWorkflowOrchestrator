/**
 * SkillCreatorOutputHandler - スキル出力捕捉・保存・登録・通知ハンドラー
 * TASK-SDK-SC-04: Skill Output Integration
 *
 * SDK セッション完了時に skill-creator が生成したスキル出力を捕捉し、
 * `.claude/skills/{skill-name}/SKILL.md` に保存、SkillRegistry に登録、
 * UI に skill-creator:output-ready IPC で通知するまでのパイプラインを担う。
 *
 * NOTE: 本クラスは SkillCreatorIpcBridge 経由の別系統パイプライン。
 * RuntimeSkillCreatorFacade の正式経路は parseLlmResponseToContent + SkillFileWriter.persist。
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

/** SKILL_START マーカー正規表現（属性付き） */
export const SKILL_START_MARKER_RE = /<!-- SKILL_START:\s*(.+?)\s*-->/;
/** SKILL_END マーカー正規表現（属性付き） */
export const SKILL_END_MARKER_RE = /<!-- SKILL_END:\s*(.+?)\s*-->/;
/** SKILL.md 内の name フィールド抽出パターン */
const NAME_PATTERN = /^name:\s*(.+)$/m;

export class SkillCreatorOutputHandler {
  constructor(
    private readonly projectRoot: string,
    private readonly skillRegistry: SkillRegistry,
    private readonly webContents: WebContents,
  ) {}

  /**
   * スキル名をディレクトリ名用スラッグに変換する。
   * 小文字化 + 空白をハイフンに置換し、パス区切りや `..` を無効化する。
   */
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

  /**
   * SDK セッション出力テキストからスキル定義を抽出する。
   *
   * マーカー付き出力を優先し、見つからない場合はアシスタントメッセージ全体を
   * スキル内容として扱うフォールバックを持つ。
   */
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
      dirName: this.toSlug(payload.skillName),
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
    }

    this.notifyOutputReady({
      skillName: skill.name,
      savedPath,
      content: skill.content,
      requiresOverwriteConfirm: false,
    });
  }
}
