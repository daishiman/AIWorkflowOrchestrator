/**
 * HistoryService - 履歴取得サービス実装
 *
 * @module @repo/shared/services/history
 * @description ファイルバージョン履歴の取得・差分・復元機能を提供
 */

import { ok, err } from "../../types/rag/result";
import type { Result } from "../../types/rag/result";
import type { IConversionLogger } from "../logging/types";
import type {
  IHistoryService,
  VersionHistoryItem,
  VersionDiff,
  HistoryOptions,
  PaginatedResult,
  ConversionRepository,
  FileRepository,
  Conversion,
  MetadataChange,
} from "./types";

/**
 * HistoryService - 履歴取得サービス
 *
 * 責務:
 * - ファイルのバージョン履歴一覧取得
 * - バージョン詳細取得
 * - バージョン間差分取得
 * - バージョン復元
 */
export class HistoryService implements IHistoryService {
  constructor(
    private readonly conversionRepository: ConversionRepository,
    private readonly _fileRepository: FileRepository,
    private readonly logger: IConversionLogger,
  ) {}

  /**
   * ファイルの履歴一覧を取得
   */
  async getFileHistory(
    fileId: string,
    options?: HistoryOptions,
  ): Promise<Result<PaginatedResult<VersionHistoryItem>, Error>> {
    const limit = options?.pagination?.limit ?? 20;
    const offset = options?.pagination?.offset ?? 0;

    // 総件数を取得
    const countResult = await this.conversionRepository.countByFileId(fileId);
    if (!countResult.success) {
      return err(countResult.error);
    }
    const total = countResult.data;

    // 履歴を取得（新しい順）
    const conversionsResult = await this.conversionRepository.findByFileId(
      fileId,
      {
        orderBy: "createdAt",
        orderDirection: "desc",
        limit,
        offset,
        filter: options?.filter,
      },
    );

    if (!conversionsResult.success) {
      return err(conversionsResult.error);
    }

    const conversions = conversionsResult.data;

    // 最新バージョンのIDを特定
    const latestResult = await this.getLatestConversionId(fileId);
    const latestId = latestResult.success ? latestResult.data : null;

    // バージョン番号マップを取得
    const versionMap = await this.getVersionMapForFile(fileId);

    // Conversion を VersionHistoryItem に変換
    const items = conversions.map((conv) =>
      this.toVersionHistoryItem(conv, versionMap, latestId),
    );

    const hasMore = offset + items.length < total;

    return ok({
      items,
      total,
      hasMore,
    });
  }

  /**
   * バージョン詳細を取得
   */
  async getVersionDetail(
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>> {
    const result = await this.conversionRepository.findById(conversionId);

    if (!result.success) {
      return err(result.error);
    }

    const conversion = result.data;
    if (!conversion) {
      return err(new Error(`Conversion not found: ${conversionId}`));
    }

    // 最新バージョンIDを取得
    const latestResult = await this.getLatestConversionId(conversion.fileId);
    const latestId = latestResult.success ? latestResult.data : null;

    // バージョン番号マップを取得
    const versionMap = await this.getVersionMapForFile(conversion.fileId);

    return ok(this.toVersionHistoryItem(conversion, versionMap, latestId));
  }

  /**
   * バージョン間の差分を取得
   */
  async getVersionDiff(
    conversionIdA: string,
    conversionIdB: string,
  ): Promise<Result<VersionDiff, Error>> {
    // ソースバージョン（比較元）を取得
    const sourceResult =
      await this.conversionRepository.findById(conversionIdA);
    if (!sourceResult.success) {
      return err(sourceResult.error);
    }
    if (!sourceResult.data) {
      return err(new Error(`Source conversion not found: ${conversionIdA}`));
    }

    // ターゲットバージョン（比較先）を取得
    const targetResult =
      await this.conversionRepository.findById(conversionIdB);
    if (!targetResult.success) {
      return err(targetResult.error);
    }
    if (!targetResult.data) {
      return err(new Error(`Target conversion not found: ${conversionIdB}`));
    }

    const sourceConversion = sourceResult.data;
    const targetConversion = targetResult.data;

    // 差分を計算
    const sizeChange = targetConversion.sizeBytes - sourceConversion.sizeBytes;
    const contentChanged =
      sourceConversion.contentHash !== targetConversion.contentHash;
    const metadataChanges = this.computeMetadataChanges(
      sourceConversion.metadata ?? {},
      targetConversion.metadata ?? {},
    );

    return ok({
      conversionIdA,
      conversionIdB,
      sizeChange,
      metadataChanges,
      contentChanged,
    });
  }

  /**
   * 指定バージョンに復元
   */
  async restoreToVersion(
    fileId: string,
    conversionId: string,
  ): Promise<Result<VersionHistoryItem, Error>> {
    // 元の変換を取得
    const result = await this.conversionRepository.findById(conversionId);
    if (!result.success) {
      return err(result.error);
    }

    const originalConversion = result.data;
    if (!originalConversion) {
      return err(new Error(`Conversion not found: ${conversionId}`));
    }

    // ファイルIDが一致するか確認
    if (originalConversion.fileId !== fileId) {
      return err(
        new Error(
          `Conversion ${conversionId} does not belong to file ${fileId}`,
        ),
      );
    }

    // ログを記録
    await this.logger.info({
      fileId,
      fileName: originalConversion.fileName,
      conversionId,
      action: "restore",
      message: `Restoring to version ${conversionId}`,
    });

    // 新しいバージョンを作成
    const createResult = await this.conversionRepository.create({
      fileId: originalConversion.fileId,
      fileName: originalConversion.fileName,
      mimeType: originalConversion.mimeType,
      content: originalConversion.content ?? "",
      metadata: {
        ...originalConversion.metadata,
        restoredFrom: conversionId,
        restoredAt: new Date().toISOString(),
      },
    });

    if (!createResult.success) {
      return err(createResult.error);
    }

    const newConversion = createResult.data;

    // バージョン番号マップを取得
    const versionMap = await this.getVersionMapForFile(fileId);

    // 新しく作成されたバージョンが最新
    return ok(
      this.toVersionHistoryItem(newConversion, versionMap, newConversion.id),
    );
  }

  /**
   * 最新バージョンを取得
   */
  async getLatestVersion(
    fileId: string,
  ): Promise<Result<VersionHistoryItem | null, Error>> {
    const result = await this.conversionRepository.findByFileId(fileId, {
      orderBy: "createdAt",
      orderDirection: "desc",
      limit: 1,
    });

    if (!result.success) {
      return err(result.error);
    }

    const conversions = result.data;
    if (conversions.length === 0) {
      return ok(null);
    }

    const latestConversion = conversions[0];

    // バージョン番号マップを取得
    const versionMap = await this.getVersionMapForFile(fileId);

    // 最新バージョンなので latestId は自身のID
    return ok(
      this.toVersionHistoryItem(
        latestConversion,
        versionMap,
        latestConversion.id,
      ),
    );
  }

  /**
   * バージョン数を取得
   */
  async getVersionCount(fileId: string): Promise<Result<number, Error>> {
    return this.conversionRepository.countByFileId(fileId);
  }

  // ==========================================================================
  // Private Helper Methods
  // ==========================================================================

  /**
   * 最新変換IDを取得
   */
  private async getLatestConversionId(
    fileId: string,
  ): Promise<Result<string | null, Error>> {
    const result = await this.conversionRepository.findByFileId(fileId, {
      orderBy: "createdAt",
      orderDirection: "desc",
      limit: 1,
    });

    if (!result.success) {
      return err(result.error);
    }

    if (result.data.length === 0) {
      return ok(null);
    }

    return ok(result.data[0].id);
  }

  /**
   * バージョン番号付与用に全変換を取得
   */
  private async getAllConversionsForVersioning(
    fileId: string,
  ): Promise<Result<Conversion[], Error>> {
    return this.conversionRepository.findByFileId(fileId, {
      orderBy: "createdAt",
      orderDirection: "asc",
      limit: 10000, // 実務上の上限
    });
  }

  /**
   * 変換IDからバージョン番号へのマップを構築
   */
  private buildVersionMap(conversions: Conversion[]): Map<string, number> {
    const map = new Map<string, number>();
    conversions.forEach((conv, index) => {
      map.set(conv.id, index);
    });
    return map;
  }

  /**
   * メタデータの変更を計算
   */
  private computeMetadataChanges(
    sourceMeta: Record<string, unknown>,
    targetMeta: Record<string, unknown>,
  ): MetadataChange[] {
    const changes: MetadataChange[] = [];
    const allKeys = new Set([
      ...Object.keys(sourceMeta),
      ...Object.keys(targetMeta),
    ]);

    for (const key of allKeys) {
      const oldValue = sourceMeta[key];
      const newValue = targetMeta[key];

      // JSON.stringifyで比較することで深いオブジェクトも比較可能
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({ key, oldValue, newValue });
      }
    }

    return changes;
  }

  /**
   * Conversion を VersionHistoryItem に変換
   *
   * @param conversion - 変換データ
   * @param versionMap - バージョン番号マップ
   * @param latestId - 最新バージョンのID
   */
  private toVersionHistoryItem(
    conversion: Conversion,
    versionMap: Map<string, number>,
    latestId: string | null,
  ): VersionHistoryItem {
    return {
      conversionId: conversion.id,
      fileId: conversion.fileId,
      fileName: conversion.fileName,
      version: versionMap.get(conversion.id) ?? 0,
      createdAt: conversion.createdAt,
      mimeType: conversion.mimeType,
      contentHash: conversion.contentHash,
      sizeBytes: conversion.sizeBytes,
      metadata: conversion.metadata,
      isCurrentVersion: conversion.id === latestId,
    };
  }

  /**
   * ファイルのバージョンマップを取得
   *
   * @param fileId - ファイルID
   */
  private async getVersionMapForFile(
    fileId: string,
  ): Promise<Map<string, number>> {
    const allConversions = await this.getAllConversionsForVersioning(fileId);
    return this.buildVersionMap(
      allConversions.success ? allConversions.data : [],
    );
  }
}
