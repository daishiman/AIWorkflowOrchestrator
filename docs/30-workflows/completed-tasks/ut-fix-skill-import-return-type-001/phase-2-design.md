# Phase 2: 設計

## メタ情報

| 項目      | 値                                                                           |
| --------- | ---------------------------------------------------------------------------- |
| Phase     | 2                                                                            |
| タスクID  | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名  | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 機能名    | skill-import-return-type-fix                                                 |
| 作成日    | 2026-02-21                                                                   |
| 依存Phase | Phase 1（要件定義）                                                          |

## 目的

Phase 1で定義した要件に基づき、skill:importハンドラの2ステップ呼び出しロジック、エラーハンドリング、IPC契約変更の詳細設計を行う。

## 実行タスク

- 変換ロジック設計: importSkills() → getSkillByName() の2ステップ処理フロー
- エラーハンドリング設計: 各ステップの失敗パターンと対応
- IPC契約確認: 引数・戻り値・エラーの3軸の整合性検証
- テスト修正計画: 既存テストへの影響と修正方針

## 参照資料

| 資料名             | パス                                                                                        | 説明                           |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義   | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-1-requirements.md`             | 本Phase依存元                  |
| IPC Agent仕様書    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC API設計仕様                |
| SDK Skill型仕様書  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill/ImportResult定義 |
| セキュリティ仕様書 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則            |
| 実装パターン集     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P32/P44パターン            |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                        | P23/P32/P42/P44/P45            |

---

## 1. 変換ロジック設計

### 1.1 現在の実装（修正前）

```typescript
// skillHandlers.ts:120-138（現状）
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
    // ... validateIpcSender ...
    // ... バリデーション ...
    return skillService.importSkills(args.skillIds);
    // 戻り値: ImportResult { success, importedCount, errors }
  },
);
```

### 1.2 修正後の設計

```typescript
// skillHandlers.ts（修正後）
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event: IpcMainInvokeEvent, skillName: string) => {
    // Step 0: セキュリティ検証（既存維持）
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // Step 1: P42準拠 3段バリデーション（UT-FIX-SKILL-IMPORT-INTERFACE-001対応）
    if (typeof skillName !== "string" || skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }

    // Step 2: インポート実行
    const importResult = await skillService.importSkills([skillName]);
    if (!importResult.success) {
      throw {
        code: "IMPORT_ERROR",
        message:
          importResult.errors.join(", ") || "スキルのインポートに失敗しました",
      };
    }

    // Step 3: ImportedSkill取得
    const importedSkill = await skillService.getSkillByName(skillName);
    if (!importedSkill) {
      throw {
        code: "SKILL_NOT_FOUND",
        message: `インポート後のスキル '${skillName}' が見つかりません`,
      };
    }

    // Step 4: ImportedSkill返却
    return importedSkill;
  },
);
```

### 1.3 設計判断

| 判断項目                           | 選択                                                | 理由                                                                 |
| ---------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------- |
| 引数形式                           | `skillName: string`                                 | UT-FIX-SKILL-IMPORT-INTERFACE-001との同時修正（Preload側に合わせる） |
| importSkillsへの渡し方             | `[skillName]`（配列ラップ）                         | importSkillsのシグネチャは`string[]`のため                           |
| getSkillByNameの呼び出しタイミング | importSkills成功後                                  | インポートが完了してからでないとキャッシュにスキルが存在しない       |
| エラーコード体系                   | `VALIDATION_ERROR`/`IMPORT_ERROR`/`SKILL_NOT_FOUND` | 障害箇所の特定が容易                                                 |

---

## 2. データフロー設計

### 2.1 正常系フロー

```
Renderer (agentSlice.ts)
  │
  │ window.electronAPI.skill.import("my-skill")
  ▼
Preload (skill-api.ts)
  │
  │ safeInvoke(IPC_CHANNELS.SKILL_IMPORT, "my-skill")
  ▼
Main Process (skillHandlers.ts)
  │
  ├─ validateIpcSender() ─── OK
  ├─ 3段バリデーション ─── OK
  │
  ├─ skillService.importSkills(["my-skill"])
  │   └─ return ImportResult { success: true, importedCount: 1, errors: [] }
  │
  ├─ skillService.getSkillByName("my-skill")
  │   └─ return ImportedSkill {
  │        name: "my-skill",
  │        description: "...",
  │        path: "/path/to/skill",
  │        importedAt: Date,
  │        status: "active",
  │        agents: [], references: [], ...
  │      }
  │
  └─ return importedSkill
      │
      ▼
Preload (skill-api.ts)
  │ Promise<ImportedSkill> 解決
  ▼
Renderer (agentSlice.ts)
  │ const imported = await window.electronAPI.skill.import(skillName);
  │ set((state) => ({ importedSkills: [...state.importedSkills, imported] }))
  └─ importedSkills配列にImportedSkillが正しく格納される
```

### 2.2 異常系フロー

```
エラーパターン1: importSkills失敗
  skillService.importSkills(["invalid-skill"])
    → ImportResult { success: false, errors: ["Skill not found"] }
    → throw { code: "IMPORT_ERROR", message: "Skill not found" }
    → Renderer catch: skillError = "スキルのインポートに失敗しました: Skill not found"

エラーパターン2: getSkillByNameがnull
  skillService.importSkills(["my-skill"]) → success: true
  skillService.getSkillByName("my-skill") → null
    → throw { code: "SKILL_NOT_FOUND", message: "インポート後のスキル 'my-skill' が見つかりません" }
    → Renderer catch: skillError = "スキルのインポートに失敗しました: ..."

エラーパターン3: バリデーション失敗
  skillName === "" || typeof skillName !== "string"
    → throw { code: "VALIDATION_ERROR", message: "skillName must be a non-empty string" }
```

---

## 3. IPC契約設計

### 3.1 修正前の契約（不整合状態）

| 軸     | Handler側                                  | Preload側                | 状態   |
| ------ | ------------------------------------------ | ------------------------ | ------ |
| 引数   | `args: { skillIds: string[] }`             | `skillName: string`      | 不整合 |
| 戻り値 | `ImportResult`                             | `Promise<ImportedSkill>` | 不整合 |
| エラー | なし（importSkillsのエラーがそのまま伝播） | 型未定義                 | 不整合 |

### 3.2 修正後の契約（整合状態）

| 軸     | Handler側                                                                      | Preload側                | 状態 |
| ------ | ------------------------------------------------------------------------------ | ------------------------ | ---- |
| 引数   | `skillName: string`                                                            | `skillName: string`      | 整合 |
| 戻り値 | `ImportedSkill`                                                                | `Promise<ImportedSkill>` | 整合 |
| エラー | `{ code: "VALIDATION_ERROR" \| "IMPORT_ERROR" \| "SKILL_NOT_FOUND", message }` | reject(Error)            | 整合 |

---

## 4. Date型シリアライゼーション考慮

### 4.1 問題

Electron IPCは`structuredClone`アルゴリズムでデータをシリアライズする。`Date`オブジェクトは`structuredClone`でサポートされているため、IPC通信後もDateオブジェクトとして維持される。

### 4.2 設計判断

| 項目           | 判断                                               | 理由                                                        |
| -------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| importedAt     | `new Date()`をそのまま返す                         | Electron IPCはstructuredCloneでDateを正しくシリアライズする |
| updatedAt      | `skill.lastModified`（既存のDate値）をそのまま返す | getSkillByName()の既存実装で変換済み                        |
| テストでの検証 | `expect(result.importedAt).toBeInstanceOf(Date)`   | Date型であることを明示的に検証                              |

---

## 5. P42準拠3段バリデーション設計

### 5.1 バリデーションフロー

```typescript
// Step 1: 型チェック
if (typeof skillName !== "string") → VALIDATION_ERROR

// Step 2: 空文字列チェック（暗黙的に Step 1 通過後）
// Step 3: トリム空文字列チェック
if (skillName.trim() === "") → VALIDATION_ERROR
```

### 5.2 注意事項

- UT-FIX-SKILL-IMPORT-INTERFACE-001で引数形式が`{ skillIds: string[] }`から`skillName: string`に変更される前提
- 引数修正と戻り値修正は同一ハンドラ内で同時に行う（P23準拠: 関連変更は一括修正）

---

## 6. テスト修正計画

### 6.1 skillHandlers.test.ts

| テストID  | 現在の検証内容                           | 修正後の検証内容                                            |
| --------- | ---------------------------------------- | ----------------------------------------------------------- |
| SH-IMP-01 | `importedCount`が2であることを検証       | `ImportedSkill`のプロパティ（name, importedAt, status）検証 |
| SH-IMP-02 | skillIdsが配列でない場合のバリデーション | skillNameが文字列でない場合の3段バリデーション              |
| SH-IMP-03 | VALIDATION_ERROR（skillIdsがnull）       | VALIDATION_ERROR（skillNameが空文字列）                     |
| SH-IMP-04 | skillIds配列に無効な値                   | 削除または修正（単一string引数のため不要）                  |
| SH-IMP-05 | skillIdフォーマット検証                  | 削除、または skillName 検証に置き換えて維持                 |
| SH-IMP-06 | skillId長さ検証                          | 削除、または skillName 長さ検証に置き換えて維持             |
| 新規      | -                                        | importSkills失敗時のIMPORT_ERRORテスト                      |
| 新規      | -                                        | getSkillByNameがnull時のSKILL_NOT_FOUNDテスト               |

### 6.2 agentSlice.skill-integration.test.ts

| 修正箇所                  | 修正内容                                               |
| ------------------------- | ------------------------------------------------------ |
| mockSkillImport戻り値     | `ImportResult`→`ImportedSkill`型のモックデータに変更   |
| importSkillテストの期待値 | `importedSkills`配列に正しいプロパティが格納される検証 |

### 6.3 モック設計

```typescript
// skillHandlers.test.ts用モック
const mockImportResult: ImportResult = {
  success: true,
  importedCount: 1,
  errors: [],
};

const mockImportedSkill: ImportedSkill = {
  name: "test-skill",
  description: "Test skill description",
  path: "/path/to/test-skill",
  allowedTools: [],
  updatedAt: new Date("2026-02-21"),
  agents: [],
  references: [],
  scripts: [],
  assets: [],
  schemas: [],
  indexes: [],
  otherFiles: [],
  importedAt: new Date("2026-02-21"),
  status: "active",
};

mockSkillService.importSkills.mockResolvedValue(mockImportResult);
mockSkillService.getSkillByName.mockResolvedValue(mockImportedSkill);
```

---

## 7. 変更影響範囲

### 7.1 直接修正ファイル

| ファイル                                                                                | 変更種別     | 変更概要                           |
| --------------------------------------------------------------------------------------- | ------------ | ---------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                            | ロジック修正 | 2ステップ呼び出し + 引数形式変更   |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             | テスト修正   | SH-IMP-01〜06修正 + 新規テスト追加 |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | モック修正   | 戻り値型をImportedSkillに変更      |

### 7.2 変更不要ファイル（整合性確認のみ）

| ファイル                                               | 確認内容                                   |
| ------------------------------------------------------ | ------------------------------------------ |
| `apps/desktop/src/preload/skill-api.ts`                | 型宣言`Promise<ImportedSkill>`が正しいこと |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts` | importSkillロジックが変更不要であること    |
| `packages/shared/src/types/skill.ts`                   | ImportedSkill型定義が正しいこと            |
| `apps/desktop/src/main/services/skill/SkillService.ts` | getSkillByName()が正しく実装されていること |

---

## 統合テスト連携

| 観点         | 確認内容                                                                         | 参照仕様                                                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPC契約      | `skill:import` の引数・戻り値・エラー形式の整合を確認                            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` / `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` / `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| セキュリティ | `validateIpcSender` と入力バリデーション（`skillName` / `skillIds`）の整合を確認 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` / `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                          |
| E2E整合      | Main → Preload → Renderer で `ImportedSkill` が破綻なく流れることを確認          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                                                                                 |

## 成果物

| 成果物         | パス                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| Phase 2 設計書 | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-2-design.md` |

## 完了条件

- [x] 変換ロジックの2ステップ設計が完了している
- [x] エラーハンドリング設計（3パターン）が定義されている
- [x] データフロー図（正常系・異常系）が作成されている
- [x] IPC契約の修正前後が明確化されている
- [x] Date型シリアライゼーションの考慮事項が記載されている
- [x] P42準拠3段バリデーション設計が含まれている
- [x] テスト修正計画が詳細に定義されている
- [x] 変更影響範囲が特定されている

## 次Phase

→ Phase 3: 設計レビューゲート（phase-3-design-review.md）
