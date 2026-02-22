# Phase 4: テスト作成（TDD-Red）

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase      | 4                                                                            |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名   | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 機能名     | skill-import-return-type-fix                                                 |
| 分類       | バグ修正                                                                     |
| 作成日     | 2026-02-21                                                                   |
| 前Phase    | Phase 3: 設計レビュー                                                        |
| 関連タスク | UT-FIX-SKILL-IMPORT-INTERFACE-001（引数形式修正）                            |

## 目的

skill:import IPCハンドラの戻り値が `ImportedSkill` 型であることを検証するテストケースを作成する。TDD-Redフェーズとして、現在の実装（`ImportResult` を返す）ではテストが失敗することを確認する。

## 実行タスク

- `skillHandlers.test.ts` の既存テスト（SH-IMP-01）を `ImportedSkill` 型プロパティ検証に修正
- 新規テストケース RT-01〜RT-06 を追加
- `agentSlice.skill-integration.test.ts` のモック戻り値を `ImportedSkill` 型に修正
- mockSkillService に `getSkillByName` モックを追加
- Red状態（テスト失敗）を確認

## 参照資料

| 資料名                            | パス                                                                                        | 説明                           |
| --------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義                  | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-1-requirements.md`             | FR/NFR/受入基準                |
| SDK Skill型仕様書                 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill/ImportResult定義 |
| 共有型定義                        | `packages/shared/src/types/skill.ts`                                                        | ImportResult/ImportedSkill定義 |
| skillHandlers.ts                  | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                | 修正対象ハンドラ               |
| skillHandlers.test.ts             | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                                 | 修正対象テスト                 |
| agentSlice.skill-integration.test | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts`     | モック修正対象テスト           |
| SkillService.ts                   | `apps/desktop/src/main/services/skill/SkillService.ts`                                      | getSkillByName()実装済み       |
| 既知の落とし穴                    | `.claude/rules/06-known-pitfalls.md`                                                        | P41/P42/P44                    |
| 実装パターン集                    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | テストパターン参照             |

### 依存Phase成果物

- Phase 2: `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-2-design.md`
- Phase 3: `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-3-design-review.md`

### システム仕様書参照（aiworkflow-requirements）

| 仕様書                                    | 該当セクション                         | 参照目的                                    |
| ----------------------------------------- | -------------------------------------- | ------------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | IPCチャンネル（スキル管理）            | skill:import の戻り値契約 `→ ImportedSkill` |
| `api-ipc-agent.md`                        | スキルファイル操作IPC                  | ハンドラ戻り値パターン                      |
| `architecture-implementation-patterns.md` | fireEvent vs userEvent使い分けパターン | happy-dom環境テスト設計（P39準拠）          |
| `security-electron-ipc.md`                | セキュリティ検証パターン               | validateIpcSenderテストパターン（P41準拠）  |
| `ipc-contract-checklist.md`               | IPC契約チェックリスト                  | 戻り値型チェックの検証項目                  |

---

## 実行手順

### Task 1: mockSkillService への getSkillByName 追加

#### 1.1 既存モック確認

`skillHandlers.test.ts` の mockSkillService に `getSkillByName` が未定義であることを確認する。

**対象ファイル**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`
**対象行**: L101-111（mockSkillService定義部分）

#### 1.2 getSkillByName モック追加

```typescript
const mockSkillService = {
  scanAvailableSkills: vi.fn(),
  getImportedSkills: vi.fn(),
  importSkills: vi.fn(),
  removeSkill: vi.fn(),
  getSkillById: vi.fn(),
  getSkillByName: vi.fn(), // ← 追加
  setSkillExecutor: vi.fn(),
  getSkillsDirectory: vi.fn().mockReturnValue("/mock/skills/dir"),
};
```

#### 1.3 ImportedSkill型定義追加

テストファイルのType Definitions部分（L22-64）に `ImportedSkill` インターフェースを追加する。

```typescript
interface SkillSubResource {
  name: string;
  path: string;
}

interface SkillOtherFile {
  name: string;
  path: string;
  type: string;
}

interface ImportedSkill {
  name: string;
  description: string;
  allowedTools?: string[];
  path: string;
  updatedAt: Date;
  agents: SkillSubResource[];
  references: SkillSubResource[];
  scripts: SkillSubResource[];
  assets: SkillSubResource[];
  schemas: SkillSubResource[];
  indexes: SkillSubResource[];
  otherFiles: SkillOtherFile[];
  importedAt: Date;
  status: "active" | "disabled";
  content?: string;
}
```

#### 1.4 テスト用モックデータ定義

`describe("skill:import")` の先頭にモックデータを定義する。

```typescript
const mockImportedSkill: ImportedSkill = {
  name: "test-skill",
  description: "A test skill for import",
  path: "/test/skills/test-skill/SKILL.md",
  updatedAt: new Date("2026-02-21T00:00:00Z"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
  importedAt: new Date("2026-02-21T01:00:00Z"),
  status: "active",
};
```

### Task 2: 既存テスト SH-IMP-01 の修正

#### 2.1 SH-IMP-01 修正（ImportedSkill型プロパティ検証）

**変更前**: `ImportResult` の `importedCount` を検証
**変更後**: `ImportedSkill` のプロパティを検証

```typescript
it("SH-IMP-01: should return ImportedSkill from skill:import handler", async () => {
  // Given: importSkills 成功、getSkillByName が ImportedSkill を返す
  mockSkillService.importSkills.mockResolvedValue({
    success: true,
    importedCount: 1,
    errors: [],
  });
  mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) {
    throw new Error("skill:import handler not registered");
  }

  // When: スキル名を渡してハンドラーを呼び出す
  const result = await handler({}, "test-skill");

  // Then: ImportedSkill型のオブジェクトが返される
  const imported = result as ImportedSkill;
  expect(imported.name).toBe("test-skill");
  expect(imported.description).toBe("A test skill for import");
  expect(imported.importedAt).toBeDefined();
  expect(imported.status).toBe("active");
  expect(imported.path).toBeDefined();
  expect(imported.agents).toBeInstanceOf(Array);
});
```

#### 2.2 既存テスト SH-IMP-02〜06 の引数形式調整

既存テスト SH-IMP-02〜06 は引数形式が `{ skillIds: [...] }` オブジェクト形式のままであるため、
新しい引数形式（単一文字列 `skillName`）に対応するテストに修正する。

> **注意**: UT-FIX-SKILL-IMPORT-INTERFACE-001（引数形式修正）が同時実施される場合、
> SH-IMP-02〜06 の修正はそちらのタスクのスコープとなる。
> 本タスクでは SH-IMP-01 の戻り値型検証修正と RT-01〜RT-06 の追加に集中する。

### Task 3: 新規テストケース RT-01〜RT-06 の追加

#### テストケース設計

| テストID | テストケース名                                            | 検証対象     | 期待結果                                        |
| -------- | --------------------------------------------------------- | ------------ | ----------------------------------------------- |
| RT-01    | ハンドラが ImportedSkill 型を返す                         | 戻り値型     | name, importedAt, status プロパティが存在する   |
| RT-02    | ImportResult のプロパティが含まれない                     | 型排他性     | success, importedCount, errors が含まれない     |
| RT-03    | インポート失敗時にエラーがthrowされる                     | エラー処理   | `{ code: "IMPORT_ERROR" }` がthrowされる        |
| RT-04    | getSkillByName() が null を返した場合のエラー処理         | null安全性   | `{ code: "IMPORT_ERROR" }` がthrowされる        |
| RT-05    | importedAt が Date互換の値として返る                      | 型変換       | importedAt が truthy（Date互換）                |
| RT-06    | importSkills() と getSkillByName() が正しい引数で呼ばれる | メソッド呼出 | importSkills([skillName]), getSkillByName(name) |

#### RT-01: ハンドラが ImportedSkill 型を返す

```typescript
it("RT-01: should return ImportedSkill type from handler", async () => {
  // Given: インポート成功、スキル取得成功
  mockSkillService.importSkills.mockResolvedValue({
    success: true,
    importedCount: 1,
    errors: [],
  });
  mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When: ハンドラを呼び出す
  const result = await handler({}, "test-skill");

  // Then: ImportedSkill型のプロパティが存在する
  const imported = result as ImportedSkill;
  expect(imported).toHaveProperty("name");
  expect(imported).toHaveProperty("importedAt");
  expect(imported).toHaveProperty("status");
  expect(imported).toHaveProperty("path");
  expect(imported).toHaveProperty("description");
  expect(imported).toHaveProperty("agents");
  expect(imported).toHaveProperty("references");
});
```

#### RT-02: ImportResult のプロパティが含まれない

```typescript
it("RT-02: should not contain ImportResult properties", async () => {
  // Given: インポート成功、スキル取得成功
  mockSkillService.importSkills.mockResolvedValue({
    success: true,
    importedCount: 1,
    errors: [],
  });
  mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When: ハンドラを呼び出す
  const result = await handler({}, "test-skill");

  // Then: ImportResult型のプロパティが含まれない
  expect(result).not.toHaveProperty("importedCount");
  expect(result).not.toHaveProperty("errors");
  // Note: ImportedSkill は success プロパティを持たないが、
  // ImportResult.success と混同しないことを確認
});
```

#### RT-03: インポート失敗時にエラーがthrowされる

```typescript
it("RT-03: should throw IMPORT_ERROR when import fails", async () => {
  // Given: インポート失敗
  mockSkillService.importSkills.mockResolvedValue({
    success: false,
    importedCount: 0,
    errors: ["Skill not found in available skills"],
  });

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When & Then: IMPORT_ERROR がthrowされる
  try {
    await handler({}, "nonexistent-skill");
    throw new Error("Expected IMPORT_ERROR to be thrown");
  } catch (error) {
    expect((error as { code: string }).code).toBe("IMPORT_ERROR");
    expect((error as { message: string }).message).toContain(
      "Skill not found in available skills",
    );
  }
});
```

#### RT-04: getSkillByName() が null を返した場合のエラー処理

```typescript
it("RT-04: should throw IMPORT_ERROR when getSkillByName returns null", async () => {
  // Given: インポート成功だが、getSkillByName が null を返す
  mockSkillService.importSkills.mockResolvedValue({
    success: true,
    importedCount: 1,
    errors: [],
  });
  mockSkillService.getSkillByName.mockResolvedValue(null);

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When & Then: IMPORT_ERROR がthrowされる
  try {
    await handler({}, "ghost-skill");
    throw new Error("Expected IMPORT_ERROR to be thrown");
  } catch (error) {
    expect((error as { code: string }).code).toBe("IMPORT_ERROR");
    expect((error as { message: string }).message).toContain("ghost-skill");
  }
});
```

#### RT-05: importedAt が Date互換の値として返る

```typescript
it("RT-05: should return importedAt as Date-compatible value", async () => {
  // Given: インポート成功、importedAt が Date オブジェクト
  const skillWithDate = {
    ...mockImportedSkill,
    importedAt: new Date("2026-02-21T01:00:00Z"),
  };
  mockSkillService.importSkills.mockResolvedValue({
    success: true,
    importedCount: 1,
    errors: [],
  });
  mockSkillService.getSkillByName.mockResolvedValue(skillWithDate);

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When: ハンドラを呼び出す
  const result = await handler({}, "test-skill");

  // Then: importedAt が Date 互換の値
  const imported = result as ImportedSkill;
  expect(imported.importedAt).toBeDefined();
  expect(imported.importedAt).toBeTruthy();
  // Date オブジェクトまたは ISO 文字列として有効
  const dateValue = new Date(imported.importedAt);
  expect(dateValue.getTime()).not.toBeNaN();
});
```

#### RT-06: importSkills() と getSkillByName() が正しい引数で呼ばれる

```typescript
it("RT-06: should call importSkills and getSkillByName with correct args", async () => {
  // Given: インポート成功
  mockSkillService.importSkills.mockResolvedValue({
    success: true,
    importedCount: 1,
    errors: [],
  });
  mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);

  const handler = handlers.get(SKILL_CHANNELS.IMPORT);
  if (!handler) throw new Error("skill:import handler not registered");

  // When: ハンドラを呼び出す
  await handler({}, "my-skill");

  // Then: importSkills が配列ラップされたスキル名で呼ばれる
  expect(mockSkillService.importSkills).toHaveBeenCalledWith(["my-skill"]);
  // Then: getSkillByName が同じスキル名で呼ばれる
  expect(mockSkillService.getSkillByName).toHaveBeenCalledWith("my-skill");
});
```

### Task 4: agentSlice.skill-integration.test.ts のモック修正

#### 4.1 現在のモック確認

`agentSlice.skill-integration.test.ts` の `setupMockElectronAPI()` 関数内（L122-130付近）で
`skill.import` モックが既に `ImportedSkill` 型の値を返すようになっていることを確認する。

```typescript
// 現在のモック（L122-130）— 既にImportedSkill型を返している
import: options.skillImportError
  ? vi.fn().mockRejectedValue(options.skillImportError)
  : vi.fn().mockResolvedValue(
      options.skillImport ?? {
        ...mockAvailableSkills[0],
        importedAt: new Date(),
        status: "active",
      },
    ),
```

#### 4.2 修正判断

既存モックが `ImportedSkill` 型（`SkillMetadata + { importedAt, status }`）を既に返しているため、
`agentSlice.skill-integration.test.ts` 自体への修正は不要または最小限となる見込み。

ただし、以下の確認を行う:

- モックデータに `agents`, `references`, `scripts` 等の全サブリソース配列が含まれていること
- `content` プロパティの扱いが一貫していること

修正が必要な場合のみ変更する。

### Task 5: Red状態の確認

#### 5.1 テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
```

#### 5.2 期待される失敗

以下のテストが **失敗** することを確認する（Red状態）:

| テストID  | 失敗理由                                                                         |
| --------- | -------------------------------------------------------------------------------- |
| SH-IMP-01 | 現在のハンドラは `ImportResult` を返すため、`imported.name` が `undefined`       |
| RT-01     | `ImportResult` には `name`, `importedAt`, `status` プロパティが存在しない        |
| RT-02     | `ImportResult` には `importedCount`, `errors` が含まれる（含まれないことが期待） |
| RT-03     | 現在のハンドラはインポート失敗時に `ImportResult` を返し、throwしない            |
| RT-04     | 現在のハンドラは `getSkillByName()` を呼び出していない                           |
| RT-05     | `ImportResult` には `importedAt` プロパティが存在しない                          |
| RT-06     | 現在のハンドラは `getSkillByName()` を呼び出していない（呼び出し検証が失敗）     |

#### 5.3 既存テストの影響確認

RT-01〜06 以外の既存テストが引き続きPASSすることを確認する:

```bash
# skill:list, skill:scan, skill:getImported, skill:remove, skill:get-detail のテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

---

## 統合テスト連携

| 観点         | 確認内容                                                                         | 参照仕様                                                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPC契約      | `skill:import` の引数・戻り値・エラー形式の整合を確認                            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` / `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` / `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| セキュリティ | `validateIpcSender` と入力バリデーション（`skillName` / `skillIds`）の整合を確認 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` / `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                          |
| E2E整合      | Main → Preload → Renderer で `ImportedSkill` が破綻なく流れることを確認          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                                                                                 |

## 成果物

| 成果物                               | パス                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| Phase 4 テスト仕様書                 | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-4-test-creation.md`        |
| skillHandlers.test.ts（修正後）      | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             |
| agentSlice.skill-integration.test.ts | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` |

## 完了条件

- [ ] mockSkillService に `getSkillByName` モックが追加されている
- [ ] `ImportedSkill` 型がテストファイルに定義されている
- [ ] SH-IMP-01 テストが `ImportedSkill` プロパティを検証するように修正されている
- [ ] RT-01〜RT-06 の6つの新規テストが追加されている
- [ ] テスト実行でRT-01〜RT-06が全て **失敗** する（Red状態）
- [ ] 既存テスト（skill:list, skill:scan, skill:getImported, skill:remove, skill:get-detail）がPASSする
- [ ] agentSlice.skill-integration.test.ts のモック戻り値が `ImportedSkill` 型と一致している

## 次Phase

→ Phase 5: 実装 TDD-Green（phase-5-implementation.md）
