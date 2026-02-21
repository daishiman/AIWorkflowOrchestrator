# Phase 5: 実装（TDD-Green）

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase      | 5                                                                            |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名   | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 機能名     | skill-import-return-type-fix                                                 |
| 分類       | バグ修正                                                                     |
| 作成日     | 2026-02-21                                                                   |
| 前Phase    | Phase 4: テスト作成（TDD-Red）                                               |
| 関連タスク | UT-FIX-SKILL-IMPORT-INTERFACE-001（引数形式修正）                            |

## 目的

Phase 4 で作成したテスト（SH-IMP-01修正版 + RT-01〜RT-06）を全てPASSさせるため、`skillHandlers.ts` の `skill:import` ハンドラを修正する。ハンドラ内で `importSkills()` 実行後に `getSkillByName()` を呼び出し、`ImportedSkill` 型のオブジェクトを返すように変換ロジックを追加する。

## 実行タスク

- `skillHandlers.ts` の `skill:import` ハンドラロジック修正
- P42準拠3段バリデーション追加（引数を `string` に変更）
- 2ステップ呼び出し（`importSkills()` → `getSkillByName()`）実装
- エラーハンドリング（`IMPORT_ERROR` コード）追加
- テストがGreen状態になることを確認
- `pnpm typecheck` が通ることを確認

## 参照資料

| 資料名               | パス                                                                                        | 説明                           |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義     | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-1-requirements.md`             | FR/NFR/受入基準                |
| Phase 4 テスト仕様書 | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-4-test-creation.md`            | テストケース設計               |
| SDK Skill型仕様書    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill定義              |
| 共有型定義           | `packages/shared/src/types/skill.ts`                                                        | ImportResult/ImportedSkill定義 |
| skillHandlers.ts     | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                | 修正対象ハンドラ               |
| SkillService.ts      | `apps/desktop/src/main/services/skill/SkillService.ts`                                      | getSkillByName() L135-162      |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                                        | P42/P44/P45                    |
| 実装パターン集       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC実装パターン                |

### システム仕様書参照（aiworkflow-requirements）

| 仕様書                                    | 該当セクション                | 参照目的                                     |
| ----------------------------------------- | ----------------------------- | -------------------------------------------- |
| `interfaces-agent-sdk-skill.md`           | IPCチャンネル（スキル管理）   | skill:import 契約 `→ Promise<ImportedSkill>` |
| `api-ipc-agent.md`                        | スキルファイル操作IPC         | ハンドラ内2ステップ呼び出しパターン          |
| `architecture-implementation-patterns.md` | S1: API二重定義の型管理複雑性 | 戻り値型変換レイヤーの設計指針               |
| `security-electron-ipc.md`                | IPCバリデーションパターン     | P42準拠3段バリデーション実装                 |
| `ipc-contract-checklist.md`               | IPC契約チェックリスト         | 引数・戻り値・エラー形式の3軸チェック        |

---

## 実行手順

### Task 1: skill:import ハンドラのロジック修正

#### 1.1 修正対象

**ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`
**対象行**: L120-138（`skill:import` ハンドラ）

#### 1.2 現在のコード

```typescript
// skill:import - スキルをインポート
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event: IpcMainInvokeEvent, args: { skillIds: string[] }) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (!Array.isArray(args?.skillIds)) {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillIds must be an array",
      };
    }
    return skillService.importSkills(args.skillIds);
  },
);
```

#### 1.3 修正後のコード

```typescript
// skill:import - スキルをインポート（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001: ImportedSkill型を返す）
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event: IpcMainInvokeEvent, skillName: string) => {
    // セキュリティ検証
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
    if (typeof skillName !== "string" || skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }

    // Step 1: インポート実行
    const result = await skillService.importSkills([skillName]);

    // Step 2: インポート成功時、ImportedSkill を取得して返す
    if (result.success && result.importedCount > 0) {
      const importedSkill = await skillService.getSkillByName(skillName);
      if (importedSkill) {
        return importedSkill;
      }
    }

    // Step 3: インポート失敗またはスキル取得失敗時はエラー
    throw {
      code: "IMPORT_ERROR",
      message:
        result.errors.length > 0
          ? result.errors.join(", ")
          : `Failed to import skill: ${skillName}`,
    };
  },
);
```

#### 1.4 修正ポイント

| #   | 変更内容                                                           | 理由                                                            | 準拠パターン |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------- | ------------ |
| 1   | 引数を `args: { skillIds: string[] }` → `skillName: string` に変更 | Preload側が `safeInvoke(channel, skillName)` で文字列を渡すため | P44          |
| 2   | P42準拠3段バリデーション追加                                       | スペースのみ入力を早期拒否                                      | P42          |
| 3   | `importSkills([skillName])` で配列ラップ                           | 既存サービスAPIを変更せずに単一スキル名を渡す                   | -            |
| 4   | `getSkillByName(skillName)` で ImportedSkill 取得                  | ImportResult → ImportedSkill への変換                           | FR-2.2       |
| 5   | `IMPORT_ERROR` コードでエラーthrow                                 | 失敗時に明確なエラーコードを返す                                | FR-3.1/3.2   |

### Task 2: 修正箇所の整合性確認

#### 2.1 validateIpcSender の維持確認

修正後もセキュリティ検証（`validateIpcSender`）が最初に実行されることを確認する。

#### 2.2 SkillService.getSkillByName() の存在確認

`SkillService.ts:135` に `getSkillByName()` メソッドが実装されていることを確認する。

```typescript
// SkillService.ts:135
async getSkillByName(name: string): Promise<ImportedSkill | null> {
  // ... 実装済み
}
```

#### 2.3 エラーメッセージのサニタイズ確認

- `result.errors` はサービス内部のエラーメッセージであるが、ユーザーに見せても問題ない内容であることを確認
- 内部パス、APIキー等の機密情報がエラーメッセージに含まれないことを確認

### Task 3: テストがGreenになることを確認

#### 3.1 skill:import テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers
```

#### 3.2 期待結果

Phase 4 で追加・修正した全テストがPASSする:

| テストID  | 期待結果 | 検証内容                                              |
| --------- | -------- | ----------------------------------------------------- |
| SH-IMP-01 | PASS     | ImportedSkill型のプロパティが返される                 |
| RT-01     | PASS     | name, importedAt, status プロパティが存在する         |
| RT-02     | PASS     | importedCount, errors プロパティが含まれない          |
| RT-03     | PASS     | インポート失敗時に IMPORT_ERROR がthrowされる         |
| RT-04     | PASS     | getSkillByName null 時に IMPORT_ERROR がthrowされる   |
| RT-05     | PASS     | importedAt が Date互換の値                            |
| RT-06     | PASS     | importSkills([name]), getSkillByName(name) が呼ばれる |

#### 3.3 全テストの影響確認

skill:import 以外のテストが影響を受けていないことを確認:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
```

### Task 4: TypeScript型チェック

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
```

#### 4.1 型チェック確認ポイント

- `skillService.getSkillByName(skillName)` の戻り値型 `Promise<ImportedSkill | null>` との整合性
- `skillService.importSkills([skillName])` の戻り値型 `Promise<ImportResult>` との整合性
- ハンドラの暗黙的な戻り値型が `ImportedSkill`（`getSkillByName` の非null戻り値）に推論されること

### Task 5: Lint確認

```bash
pnpm --filter @repo/desktop lint
```

---

## 統合テスト連携

| 観点         | 確認内容                                                                         | 参照仕様                                                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPC契約      | `skill:import` の引数・戻り値・エラー形式の整合を確認                            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` / `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` / `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| セキュリティ | `validateIpcSender` と入力バリデーション（`skillName` / `skillIds`）の整合を確認 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` / `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                          |
| E2E整合      | Main → Preload → Renderer で `ImportedSkill` が破綻なく流れることを確認          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                                                                                 |

## 成果物

| 成果物                     | パス                                                                              |
| -------------------------- | --------------------------------------------------------------------------------- |
| Phase 5 実装仕様書         | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-5-implementation.md` |
| skillHandlers.ts（修正後） | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      |

## 完了条件

- [ ] `skillHandlers.ts` の `skill:import` ハンドラが修正されている
- [ ] 引数が `skillName: string` 形式に変更されている
- [ ] P42準拠3段バリデーションが実装されている
- [ ] `importSkills()` → `getSkillByName()` の2ステップ呼び出しが実装されている
- [ ] インポート失敗時に `IMPORT_ERROR` コードでエラーがthrowされる
- [ ] `getSkillByName()` が null を返した場合にエラーがthrowされる
- [ ] Phase 4 で作成した全テスト（SH-IMP-01修正版 + RT-01〜RT-06）がPASSする
- [ ] `pnpm typecheck` が通る
- [ ] `pnpm lint` が通る
- [ ] skill:import 以外のテスト（skill:list, skill:scan 等）に影響がない

## 次Phase

→ Phase 6: テスト拡充（phase-6-test-expansion.md）
