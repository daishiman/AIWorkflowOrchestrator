/**
 * 依存関係管理
 * @module slide/dependency-manager
 */

import * as fs from "fs/promises";
import * as crypto from "crypto";

/**
 * ファイルのハッシュを計算する
 * @param filePath ファイルパス
 * @returns MD5ハッシュ値
 */
export const calculateHash = async (filePath: string): Promise<string> => {
  const content = await fs.readFile(filePath, "utf-8");
  return crypto.createHash("md5").update(content).digest("hex");
};

/**
 * 依存関係をチェックする（タイムスタンプベース）
 * structure.mdがindex.htmlより新しい場合、同期が必要
 * @param structurePath structure.mdのパス
 * @param htmlPath index.htmlのパス
 * @returns 同期済みの場合true、同期が必要な場合false
 */
export const checkDependency = async (
  structurePath: string,
  htmlPath: string,
): Promise<boolean> => {
  try {
    const [structureStat, htmlStat] = await Promise.all([
      fs.stat(structurePath),
      fs.stat(htmlPath),
    ]);
    // structure.mdの更新日時がindex.htmlの更新日時以前なら同期済み
    return structureStat.mtime <= htmlStat.mtime;
  } catch {
    // ファイルが存在しない場合などは同期が必要
    return false;
  }
};

/**
 * ファイルが存在するかチェックする
 * @param filePath ファイルパス
 * @returns 存在する場合true
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * 両方のファイルが存在するかチェックする
 * @param structurePath structure.mdのパス
 * @param htmlPath index.htmlのパス
 * @returns 両方存在する場合true
 */
export const bothFilesExist = async (
  structurePath: string,
  htmlPath: string,
): Promise<boolean> => {
  const [structureExists, htmlExists] = await Promise.all([
    fileExists(structurePath),
    fileExists(htmlPath),
  ]);
  return structureExists && htmlExists;
};
