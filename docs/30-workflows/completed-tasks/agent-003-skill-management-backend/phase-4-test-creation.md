# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 4                      |
| Phase名    | テスト作成             |
| 前提Phase  | Phase 3                |
| 後続Phase  | Phase 5                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-11             |
| 機能名     | スキル管理バックエンド |

---

## 目的

TDDのRed段階として、Phase 2で設計した機能のテストを実装より先に作成する。受け入れ基準に基づき、失敗するテストを作成してから実装に進む。

## 背景

設計レビューが完了し、設計の妥当性が確認された。TDDのプラクティスに従い、まずテストを作成して期待される動作を明確にしてから実装に進む。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: SkillScannerのテスト作成

**目的**: SkillScannerクラスのユニットテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "fs/promises";
import * as path from "path";
import { SkillScanner } from "../SkillScanner";

describe("SkillScanner", () => {
  const testBasePath = "/test/skills";

  describe("scanDirectory", () => {
    it("should find directories with SKILL.md", async () => {
      // SKILL.mdを持つディレクトリのみ返すことを確認
    });

    it("should ignore directories without SKILL.md", async () => {
      // SKILL.mdがないディレクトリは除外されることを確認
    });

    it("should ignore hidden directories starting with dot", async () => {
      // .で始まる隠しディレクトリは除外されることを確認
    });

    it("should handle empty directory", async () => {
      // 空ディレクトリでは空配列を返すことを確認
    });

    it("should handle non-existent base path", async () => {
      // 存在しないパスではエラーをスローすることを確認
    });

    it("should return absolute paths to SKILL.md", async () => {
      // 戻り値がSKILL.mdへの絶対パスであることを確認
    });
  });

  describe("setBasePath", () => {
    it("should update the base path", async () => {
      // ベースパスが更新されることを確認
    });
  });

  describe("getBasePath", () => {
    it("should return the current base path", () => {
      // 現在のベースパスが返されることを確認
    });
  });

  describe("path validation", () => {
    it("should prevent path traversal attack", async () => {
      // パストラバーサル攻撃が防止されることを確認
    });

    it("should reject paths outside base directory", async () => {
      // ベースディレクトリ外のパスが拒否されることを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`

---

### タスク2: SkillParserのテスト作成

**目的**: SkillParserクラスのユニットテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/main/services/skill/__tests__/SkillParser.test.ts`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillParser.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SkillParser } from "../SkillParser";

describe("SkillParser", () => {
  let parser: SkillParser;

  beforeEach(() => {
    parser = new SkillParser();
  });

  describe("parse", () => {
    it("should parse skill name from YAML frontmatter", async () => {
      // nameフィールドが正しく抽出されることを確認
    });

    it("should parse description from YAML frontmatter", async () => {
      // descriptionフィールドが正しく抽出されることを確認
    });

    it("should parse license from YAML frontmatter", async () => {
      // licenseフィールドが正しく抽出されることを確認
    });

    it("should parse allowed-tools from YAML frontmatter", async () => {
      // allowed-toolsフィールドが正しく抽出されることを確認
    });

    it("should parse tags from YAML frontmatter", async () => {
      // tagsフィールドが正しく抽出されることを確認
    });

    it("should parse dependencies from YAML frontmatter", async () => {
      // dependenciesフィールドが正しく抽出されることを確認
    });

    it("should generate consistent id from path using SHA-256", async () => {
      // 同じパスから同じIDが生成されることを確認
    });

    it("should extract slug from directory name", async () => {
      // ディレクトリ名がslugとして抽出されることを確認
    });

    it("should set lastModified from file stats", async () => {
      // ファイルの更新日時がlastModifiedに設定されることを確認
    });
  });

  describe("parseAnchors", () => {
    it("should parse anchors from description", async () => {
      // Anchors:セクションが正しく解析されることを確認
    });

    it("should parse multiple anchors", async () => {
      // 複数のアンカーが正しく解析されることを確認
    });

    it("should handle missing anchors section", async () => {
      // Anchors:セクションがない場合は空配列を返すことを確認
    });

    it("should extract source, application, and purpose", async () => {
      // source, application, purposeが正しく抽出されることを確認
    });
  });

  describe("parseTriggers", () => {
    it("should parse triggers from description", async () => {
      // Trigger:セクションが正しく解析されることを確認
    });

    it("should handle comma-separated triggers", async () => {
      // カンマ区切りのトリガーが正しく解析されることを確認
    });

    it("should handle missing triggers section", async () => {
      // Trigger:セクションがない場合は空配列を返すことを確認
    });

    it("should trim whitespace from triggers", async () => {
      // トリガーの前後の空白が除去されることを確認
    });
  });

  describe("error handling", () => {
    it("should use fallback values for missing required fields", async () => {
      // 必須フィールドがない場合はfallback値が使用されることを確認
    });

    it("should handle invalid YAML frontmatter", async () => {
      // 無効なYAMLの場合はエラーをスローまたはfallbackを使用
    });

    it("should handle file read errors", async () => {
      // ファイル読み取りエラーの場合は適切にエラーをスロー
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillParser.test.ts`

---

### タスク3: SkillImportManagerのテスト作成

**目的**: SkillImportManagerクラスのユニットテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SkillImportManager } from "../SkillImportManager";

describe("SkillImportManager", () => {
  let manager: SkillImportManager;
  let mockStore: any;

  beforeEach(() => {
    mockStore = {
      get: vi.fn(),
      set: vi.fn(),
    };
    manager = new SkillImportManager(mockStore);
  });

  describe("importSkills", () => {
    it("should import specified skills", async () => {
      // 指定されたスキルがインポートされることを確認
    });

    it("should persist imported skill ids to store", async () => {
      // インポートされたスキルIDがストアに永続化されることを確認
    });

    it("should return success result with imported count", async () => {
      // 成功結果にインポート数が含まれることを確認
    });

    it("should handle duplicate imports gracefully", async () => {
      // 重複インポートが適切に処理されることを確認
    });

    it("should accumulate imports across multiple calls", async () => {
      // 複数回の呼び出しでインポートが累積されることを確認
    });
  });

  describe("removeSkill", () => {
    it("should remove specified skill from imports", async () => {
      // 指定されたスキルがインポートから削除されることを確認
    });

    it("should persist removal to store", async () => {
      // 削除がストアに永続化されることを確認
    });

    it("should return success with removed=true when skill existed", async () => {
      // スキルが存在した場合はremoved=trueを返すことを確認
    });

    it("should return success with removed=false when skill not found", async () => {
      // スキルが存在しなかった場合はremoved=falseを返すことを確認
    });
  });

  describe("getImportedSkillIds", () => {
    it("should return empty array when no skills imported", () => {
      // インポートがない場合は空配列を返すことを確認
    });

    it("should return all imported skill ids", () => {
      // 全インポート済みスキルIDを返すことを確認
    });

    it("should load imported ids from store on initialization", () => {
      // 初期化時にストアからインポートIDを読み込むことを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts`

---

### タスク4: SkillServiceのテスト作成

**目的**: SkillServiceクラス（Facade）のユニットテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SkillService } from "../SkillService";
import { SkillScanner } from "../SkillScanner";
import { SkillParser } from "../SkillParser";
import { SkillImportManager } from "../SkillImportManager";

describe("SkillService", () => {
  let service: SkillService;
  let mockScanner: any;
  let mockParser: any;
  let mockImportManager: any;

  beforeEach(() => {
    mockScanner = {
      scanDirectory: vi.fn(),
      setBasePath: vi.fn(),
      getBasePath: vi.fn(),
    };
    mockParser = {
      parse: vi.fn(),
    };
    mockImportManager = {
      importSkills: vi.fn(),
      removeSkill: vi.fn(),
      getImportedSkillIds: vi.fn(),
    };
    service = new SkillService(mockScanner, mockParser, mockImportManager);
  });

  describe("scanAvailableSkills", () => {
    it("should return all skills with metadata", async () => {
      // 全スキルがメタデータ付きで返されることを確認
    });

    it("should cache skills after first fetch", async () => {
      // 初回取得後にスキルがキャッシュされることを確認
    });

    it("should use cache on subsequent calls", async () => {
      // 2回目以降の呼び出しでキャッシュが使用されることを確認
    });

    it("should force refresh when forceRefresh=true", async () => {
      // forceRefresh=trueの場合はキャッシュを無視することを確認
    });

    it("should collect errors for invalid skills", async () => {
      // 無効なスキルのエラーが収集されることを確認
    });

    it("should include scannedAt timestamp", async () => {
      // 結果にscannedAtタイムスタンプが含まれることを確認
    });
  });

  describe("getImportedSkills", () => {
    it("should return only imported skills", async () => {
      // インポート済みスキルのみ返されることを確認
    });

    it("should return empty array when no skills imported", async () => {
      // インポートがない場合は空配列を返すことを確認
    });

    it("should return full skill objects (not just ids)", async () => {
      // 完全なSkillオブジェクトが返されることを確認
    });
  });

  describe("importSkills", () => {
    it("should delegate to import manager", async () => {
      // インポートマネージャーに委譲されることを確認
    });

    it("should return import result", async () => {
      // インポート結果が返されることを確認
    });
  });

  describe("removeSkill", () => {
    it("should delegate to import manager", async () => {
      // インポートマネージャーに委譲されることを確認
    });

    it("should return remove result", async () => {
      // 削除結果が返されることを確認
    });
  });

  describe("getSkillById", () => {
    it("should return skill when found", async () => {
      // スキルが見つかった場合はSkillオブジェクトを返すことを確認
    });

    it("should return null when skill not found", async () => {
      // スキルが見つからなかった場合はnullを返すことを確認
    });

    it("should use cache for lookup", async () => {
      // キャッシュが検索に使用されることを確認
    });
  });

  describe("clearCache", () => {
    it("should clear the internal cache", () => {
      // 内部キャッシュがクリアされることを確認
    });

    it("should cause next scanAvailableSkills to re-scan", async () => {
      // キャッシュクリア後の呼び出しで再スキャンされることを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`

---

### タスク5: IPCハンドラーのテスト作成

**目的**: agentHandlers IPCハンドラーのユニットテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ipcMain } from "electron";
import { registerAgentHandlers } from "../agentHandlers";

vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

describe("agentHandlers", () => {
  let mockSkillService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSkillService = {
      scanAvailableSkills: vi.fn(),
      getImportedSkills: vi.fn(),
      importSkills: vi.fn(),
      removeSkill: vi.fn(),
      getSkillById: vi.fn(),
    };
  });

  describe("registerAgentHandlers", () => {
    it("should register all agent IPC handlers", () => {
      // 全agentハンドラーが登録されることを確認
    });
  });

  describe("agent:scan-available-skills", () => {
    it("should call skillService.scanAvailableSkills", async () => {
      // skillService.scanAvailableSkillsが呼び出されることを確認
    });

    it("should validate IPC sender", async () => {
      // IPC senderが検証されることを確認
    });

    it("should reject invalid sender", async () => {
      // 無効なsenderが拒否されることを確認
    });
  });

  describe("agent:get-imported-skills", () => {
    it("should call skillService.getImportedSkills", async () => {
      // skillService.getImportedSkillsが呼び出されることを確認
    });
  });

  describe("agent:import-skills", () => {
    it("should call skillService.importSkills with skillIds", async () => {
      // skillService.importSkillsがskillIdsで呼び出されることを確認
    });

    it("should validate skillIds is an array", async () => {
      // skillIdsが配列であることが検証されることを確認
    });

    it("should throw VALIDATION_ERROR for invalid skillIds", async () => {
      // 無効なskillIdsでVALIDATION_ERRORがスローされることを確認
    });
  });

  describe("agent:remove-skill", () => {
    it("should call skillService.removeSkill with skillId", async () => {
      // skillService.removeSkillがskillIdで呼び出されることを確認
    });

    it("should validate skillId is a string", async () => {
      // skillIdが文字列であることが検証されることを確認
    });
  });

  describe("agent:get-skill-detail", () => {
    it("should call skillService.getSkillById with skillId", async () => {
      // skillService.getSkillByIdがskillIdで呼び出されることを確認
    });

    it("should return null for unknown skillId", async () => {
      // 不明なskillIdでnullが返されることを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`

---

### タスク6: IPC統合テストシナリオ作成

**目的**: Main Process↔Renderer間のIPC統合テストシナリオを作成する

**実行手順**:

1. 統合テストシナリオを設計する:

| シナリオカテゴリ   | テスト項目                                    |
| ------------------ | --------------------------------------------- |
| IPC接続テスト      | 各チャネルの疎通確認                          |
| データフローテスト | Renderer→Main→ファイルI/O→Main→Rendererの往復 |
| エラーハンドリング | IPC障害時のエラーレスポンス                   |
| 認証連携テスト     | IPC sender検証                                |
| 状態同期テスト     | キャッシュ更新・インポート状態の同期          |

2. 統合テストファイルを作成する:
   - `apps/desktop/src/main/services/skill/__tests__/integration.test.ts`

```typescript
// apps/desktop/src/main/services/skill/__tests__/integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";

describe("Skill Management Integration", () => {
  describe("IPC Connection", () => {
    it("should respond to agent:scan-available-skills", async () => {});
    it("should respond to agent:get-imported-skills", async () => {});
    it("should respond to agent:import-skills", async () => {});
    it("should respond to agent:remove-skill", async () => {});
    it("should respond to agent:get-skill-detail", async () => {});
  });

  describe("Data Flow", () => {
    it("should scan skills from file system and return to renderer", async () => {});
    it("should import skills and persist to store", async () => {});
    it("should remove skills and update store", async () => {});
  });

  describe("Error Handling", () => {
    it("should return VALIDATION_ERROR for invalid input", async () => {});
    it("should return AUTH_ERROR for invalid sender", async () => {});
    it("should return NOT_FOUND for unknown skill", async () => {});
  });

  describe("State Synchronization", () => {
    it("should update cache after scan", async () => {});
    it("should reflect import changes immediately", async () => {});
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/skill/__tests__/integration.test.ts`

---

### タスク7: テスト実行確認（Red状態）

**目的**: 全テストが失敗状態（Red）であることを確認する

**実行手順**:

1. テストを実行する:

```bash
pnpm --filter @repo/desktop test src/main/services/skill/
pnpm --filter @repo/desktop test src/main/ipc/
```

2. 全テストが失敗することを確認する（実装がないため）

3. テスト失敗結果を記録する:

```markdown
## テスト実行結果（Red状態）

### SkillScanner.test.ts

- ✗ should find directories with SKILL.md (実装なし)
- ✗ should ignore directories without SKILL.md (実装なし)
  ...

### SkillParser.test.ts

- ✗ should parse skill name from YAML frontmatter (実装なし)
  ...

### 総計

- テスト数: XX
- 失敗: XX
- 成功: 0
```

**期待される成果物**:

- `outputs/phase-4/test-red-status.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容             |
| ---------------------- | ---------------------------------------------------------------------------- | ---------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | テストパターン   |
| Phase 2設計            | `outputs/phase-2/design.md`                                                  | テスト対象の設計 |

---

## 成果物

| 成果物                   | パス                                                                        | 内容           |
| ------------------------ | --------------------------------------------------------------------------- | -------------- |
| SkillScannerテスト       | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`       | ユニットテスト |
| SkillParserテスト        | `apps/desktop/src/main/services/skill/__tests__/SkillParser.test.ts`        | ユニットテスト |
| SkillImportManagerテスト | `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | ユニットテスト |
| SkillServiceテスト       | `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`       | ユニットテスト |
| IPCハンドラーテスト      | `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`                 | ユニットテスト |
| 統合テスト               | `apps/desktop/src/main/services/skill/__tests__/integration.test.ts`        | 統合テスト     |
| Red状態確認              | `outputs/phase-4/test-red-status.md`                                        | テスト失敗確認 |

---

## 統合テスト連携

**Phase 4での必須アクション**: IPC統合テストシナリオを全カテゴリで作成

- [ ] IPC接続テストシナリオを作成
- [ ] データフローテストシナリオを作成
- [ ] エラーハンドリングテストシナリオを作成
- [ ] 認証連携テストシナリオを作成
- [ ] 状態同期テストシナリオを作成

---

## 完了条件

- [ ] SkillScannerのユニットテストが作成されている
- [ ] SkillParserのユニットテストが作成されている
- [ ] SkillImportManagerのユニットテストが作成されている
- [ ] SkillServiceのユニットテストが作成されている
- [ ] IPCハンドラーのユニットテストが作成されている
- [ ] 統合テストシナリオが作成されている
- [ ] 全テストが失敗状態（Red）であることが確認されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.json を更新

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test src/main/services/skill/
pnpm --filter @repo/desktop test src/main/ipc/
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-003-skill-management-backend/phase-5-implementation.md`
