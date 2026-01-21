/**
 * Clean Architecture レイヤー境界検証テスト
 *
 * @description
 * 各レイヤーのファイルが正しいディレクトリに配置されていることを検証する。
 */

import { describe, it, expect } from "vitest";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FEATURE_ROOT = join(__dirname, "../..");

describe("Layer Boundaries", () => {
  describe("Domain層の配置", () => {
    it("エンティティがdomain/entities/に配置されている", () => {
      const entitiesDir = join(FEATURE_ROOT, "domain/entities");
      expect(existsSync(entitiesDir)).toBe(true);

      // 主要エンティティの存在確認
      expect(existsSync(join(entitiesDir, "ChatSession.ts"))).toBe(true);
      expect(existsSync(join(entitiesDir, "ChatMessage.ts"))).toBe(true);
    });

    it("値オブジェクトがdomain/value-objects/に配置されている", () => {
      const voDir = join(FEATURE_ROOT, "domain/value-objects");
      expect(existsSync(voDir)).toBe(true);

      // 主要値オブジェクトの存在確認
      expect(existsSync(join(voDir, "ChatSessionId.ts"))).toBe(true);
      expect(existsSync(join(voDir, "ChatSessionTitle.ts"))).toBe(true);
      expect(existsSync(join(voDir, "MessageContent.ts"))).toBe(true);
    });

    it("リポジトリインターフェースがdomain/repositories/に配置されている", () => {
      const repoDir = join(FEATURE_ROOT, "domain/repositories");
      expect(existsSync(repoDir)).toBe(true);

      // リポジトリインターフェースの存在確認
      expect(existsSync(join(repoDir, "IChatSessionRepository.ts"))).toBe(true);
      expect(existsSync(join(repoDir, "IChatMessageRepository.ts"))).toBe(true);
    });

    it("ドメインエラーがdomain/errors/に配置されている", () => {
      const errorsDir = join(FEATURE_ROOT, "domain/errors");
      expect(existsSync(errorsDir)).toBe(true);
    });
  });

  describe("Application層の配置", () => {
    it("Use Caseがapplication/use-cases/に配置されている", () => {
      const useCasesDir = join(FEATURE_ROOT, "application/use-cases");
      expect(existsSync(useCasesDir)).toBe(true);

      // 主要Use Caseの存在確認
      expect(existsSync(join(useCasesDir, "CreateChatSessionUseCase.ts"))).toBe(
        true,
      );
      expect(existsSync(join(useCasesDir, "AddUserMessageUseCase.ts"))).toBe(
        true,
      );
    });

    it("DTOがapplication/dto/に配置されている", () => {
      const dtoDir = join(FEATURE_ROOT, "application/dto");
      expect(existsSync(dtoDir)).toBe(true);

      // DTOの存在確認
      expect(existsSync(join(dtoDir, "ChatSessionDTO.ts"))).toBe(true);
      expect(existsSync(join(dtoDir, "ChatMessageDTO.ts"))).toBe(true);
    });

    it("Use Caseエラーがapplication/errors/に配置されている", () => {
      const errorsDir = join(FEATURE_ROOT, "application/errors");
      expect(existsSync(errorsDir)).toBe(true);

      expect(existsSync(join(errorsDir, "UseCaseErrors.ts"))).toBe(true);
    });
  });

  describe("Infrastructure層の配置", () => {
    it("マッパーがinfrastructure/persistence/mappers/に配置されている", () => {
      const mappersDir = join(
        FEATURE_ROOT,
        "infrastructure/persistence/mappers",
      );
      expect(existsSync(mappersDir)).toBe(true);

      // マッパーの存在確認
      expect(existsSync(join(mappersDir, "ChatSessionMapper.ts"))).toBe(true);
      expect(existsSync(join(mappersDir, "ChatMessageMapper.ts"))).toBe(true);
    });
  });

  describe("レイヤー分離の原則", () => {
    it("Domain層はビジネスルールのみを含む", () => {
      // Domain層に含まれるべきファイル種別
      const domainDir = join(FEATURE_ROOT, "domain");
      expect(existsSync(domainDir)).toBe(true);

      // Domain層にUIやDBアクセスのコードがないことを確認
      // （ディレクトリ構造から判断）
      expect(existsSync(join(domainDir, "components"))).toBe(false);
      expect(existsSync(join(domainDir, "drizzle"))).toBe(false);
    });

    it("Application層はユースケースの調整のみを行う", () => {
      // Application層に含まれるべきファイル種別
      const applicationDir = join(FEATURE_ROOT, "application");
      expect(existsSync(applicationDir)).toBe(true);

      // Application層にUIやDBアクセスのコードがないことを確認
      expect(existsSync(join(applicationDir, "components"))).toBe(false);
      expect(existsSync(join(applicationDir, "drizzle"))).toBe(false);
    });
  });
});
