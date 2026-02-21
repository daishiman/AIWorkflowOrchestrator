# Phase 5: 実装 — skill:import IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目     | 値                                   |
| -------- | ------------------------------------ |
| Phase    | 5（実装）                            |
| 機能名   | skill:import IPCインターフェース修正 |
| タスクID | UT-FIX-SKILL-IMPORT-INTERFACE-001    |
| 作成日   | 2026-02-21                           |

## 目的

TDD Green段階として、Phase 4で作成したテスト（SH-IMP-01〜SH-IMP-07）を全てPASSさせる最小実装を行う。skill:importハンドラの引数を `{ skillIds: string[] }` から `skillName: string` に変更し、P42準拠の3段バリデーションを追加する。

## 実行タスク

- ハンドラ修正: `skillHandlers.ts` の skill:import 引数を `skillName: string` 直接受け取りへ変更する
- バリデーション追加: P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を実装する
- サービス呼び出し整合: `skillService.importSkills([skillName])` で配列ラップして渡す
- テスト確認: SH-IMP-01〜SH-IMP-07 を含む関連テストがPASSすることを確認する

## 参照資料

| 資料                                     | パス / 説明                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------ |
| Phase 4テスト仕様                        | `docs/30-workflows/ut-fix-skill-import-interface-001/phase-4-test-creation.md` |
| 修正対象ファイル                         | `apps/desktop/src/main/ipc/skillHandlers.ts:120-138`                           |
| skill:remove修正済み実装                 | `apps/desktop/src/main/ipc/skillHandlers.ts:140-158`（パターン参考）           |
| Preload側（変更不要）                    | `apps/desktop/src/preload/skill-api.ts:261-262`                                |
| P42: .trim()バリデーション               | `.claude/rules/06-known-pitfalls.md` — 3段バリデーション標準                   |
| P44: import/removeインターフェース不整合 | `.claude/rules/06-known-pitfalls.md` — 本タスクの根本原因                      |
| P5: リスナー二重登録                     | `.claude/rules/06-known-pitfalls.md` — unregisterSkillHandlers連携確認         |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                              | 内容                          |
| ---------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| API設計          | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | `skill:import` 契約の実装修正 |
| インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill API型・戻り値整合       |
| アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`     | Main/Preload責務境界          |
| セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | sender検証・入力検証          |
| IPC契約チェック  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | P23/P32/P42/P44 統合確認      |

## 実行手順

### Step 1: 修正箇所の特定

修正対象は `apps/desktop/src/main/ipc/skillHandlers.ts` の1箇所のみ。

**修正前（行120-138）:**

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

**修正後:**

```typescript
// skill:import - スキルをインポート
ipcMain.handle(
  IPC_CHANNELS.SKILL_IMPORT,
  async (event: IpcMainInvokeEvent, skillName: string) => {
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
    return skillService.importSkills([skillName]);
  },
);
```

### Step 2: 変更内容の詳細

| 変更項目                       | 修正前                                     | 修正後                                                       |
| ------------------------------ | ------------------------------------------ | ------------------------------------------------------------ |
| ハンドラ引数の型               | `args: { skillIds: string[] }`             | `skillName: string`                                          |
| バリデーション条件             | `!Array.isArray(args?.skillIds)`           | `typeof skillName !== "string" \|\| skillName.trim() === ""` |
| バリデーションエラーメッセージ | `"skillIds must be an array"`              | `"skillName must be a non-empty string"`                     |
| サービス呼び出し               | `skillService.importSkills(args.skillIds)` | `skillService.importSkills([skillName])`                     |

### Step 3: 4層防御パターンの確認

修正後のコードが以下の4層防御を維持していることを確認する。

| 層    | 防御内容                         | 該当コード                                                                                       |
| ----- | -------------------------------- | ------------------------------------------------------------------------------------------------ |
| 第1層 | Sender検証                       | `validateIpcSender(event, IPC_CHANNELS.SKILL_IMPORT, { getAllowedWindows: () => [mainWindow] })` |
| 第2層 | 引数バリデーション（P42準拠3段） | `typeof skillName !== "string" \|\| skillName.trim() === ""`                                     |
| 第3層 | 内部検証                         | `skillService.importSkills` 内部のバリデーション                                                 |
| 第4層 | エラーサニタイズ                 | サービスエラーがそのまま伝播（try/catchなし）                                                    |

### Step 4: 既知Pitfall対策の確認

| Pitfall | 対策内容                                                                   | 確認方法                                                           |
| ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| P5      | `unregisterSkillHandlers()` で `SKILL_IMPORT` が解除されること（変更不要） | `ipcMain.removeHandler(IPC_CHANNELS.SKILL_IMPORT)` が既に存在する  |
| P42     | `.trim() === ""` チェックが含まれていること                                | コードレビューで目視確認                                           |
| P44     | ハンドラ引数がPreload側（`string`）と一致していること                      | Preload: `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` と整合 |
| P45     | 引数名が `skillName`（実際のセマンティクスと一致）であること               | `skillIds` → `skillName` に命名変更                                |

### Step 5: テスト実行

修正完了後、以下のコマンドで全テストがPASSすることを確認する。

```bash
# skill:importハンドラのテスト（修正したテスト + 既存テスト）
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers

# Preload側テスト（変更なし・回帰確認）
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api
```

期待結果:

- SH-IMP-01〜SH-IMP-07: 全7テストPASS
- skill:import以外の既存テスト: 全PASS（回帰なし）
- Preload側テスト: 全PASS（変更なし）

### Step 6: skill:removeとの対称性確認

修正後のskill:importハンドラが、既に修正済みのskill:removeハンドラ（行140-158）と以下の点で対称であることを確認する。

| 確認項目           | skill:import                                                 | skill:remove                                                 |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 引数型             | `skillName: string`                                          | `skillName: string`                                          |
| バリデーション条件 | `typeof skillName !== "string" \|\| skillName.trim() === ""` | `typeof skillName !== "string" \|\| skillName.trim() === ""` |
| エラーコード       | `VALIDATION_ERROR`                                           | `VALIDATION_ERROR`                                           |
| エラーメッセージ   | `skillName must be a non-empty string`                       | `skillName must be a non-empty string`                       |
| サービス呼び出し   | `skillService.importSkills([skillName])`                     | `skillService.removeSkill(skillName)`                        |

skill:importのみ `[skillName]` と配列ラップする点が異なるが、これは `importSkills` メソッドが配列を期待する既存仕様に合わせたものである。

## 統合テスト連携

| 連携テスト            | 確認内容                                                    |
| --------------------- | ----------------------------------------------------------- |
| skillHandlers.test.ts | skill:importの7テスト全PASSかつ、他ハンドラテストが回帰なし |
| skill-api.test.ts     | Preload側テストが全PASS（変更なし）                         |

## 多角的チェック観点

| 観点                     | 確認内容                                                                            |
| ------------------------ | ----------------------------------------------------------------------------------- |
| インターフェース整合性   | ハンドラ引数 `skillName: string` とPreload `safeInvoke(channel, skillName)` が一致  |
| バリデーション網羅性     | `undefined`, `null`, 数値, 空文字列, スペースのみ, タブ/改行のみ が全て拒否される   |
| 後方互換性               | Preload側・Renderer側に変更不要であること                                           |
| セキュリティ             | sender検証 → 引数バリデーション → サービス内部検証 の順序が維持されていること       |
| P23準拠（3箇所同時更新） | 本タスクではハンドラ1箇所のみ修正（Preload変更不要、テストは別途Phase 4で対応済み） |

## 成果物

| 成果物                 | 配置先                                                                       |
| ---------------------- | ---------------------------------------------------------------------------- |
| 修正済みハンドラコード | `apps/desktop/src/main/ipc/skillHandlers.ts`（skill:importハンドラのみ修正） |

## 完了条件

- [ ] `skillHandlers.ts` の skill:import ハンドラ引数が `skillName: string` に変更されていること
- [ ] P42準拠3段バリデーション（`typeof skillName !== "string" || skillName.trim() === ""`）が追加されていること
- [ ] エラーメッセージが `"skillName must be a non-empty string"` であること
- [ ] `skillService.importSkills([skillName])` で配列ラップして渡していること
- [ ] SH-IMP-01〜SH-IMP-07の全7テストがPASSすること
- [ ] skill:import以外の既存テストが全てPASSすること（回帰なし）
- [ ] Preload側テスト（skill-api.test.ts）が全てPASSすること（変更なし）
- [ ] `unregisterSkillHandlers` の `SKILL_IMPORT` 解除が維持されていること（変更不要の確認）

## 次のPhase

Phase 6（テスト拡充）へ進む。カバレッジ不足箇所のテスト追加を検討する。
