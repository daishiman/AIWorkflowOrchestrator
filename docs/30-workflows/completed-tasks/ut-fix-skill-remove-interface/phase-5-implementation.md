# Phase 5: 実装 — skill:remove IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目        | 値                                         |
| ----------- | ------------------------------------------ |
| タスクID    | UT-FIX-SKILL-REMOVE-INTERFACE-001          |
| Phase       | 5（実装 — TDD Green フェーズ）             |
| 前Phase依存 | Phase 4 テスト仕様書（`outputs/phase-4/`） |
| 担当        | Claude Code                                |
| 作成日      | 2026-02-20                                 |

## 目的

Phase 4 で作成した FAIL テストを全て PASS にするため、skill:remove IPCハンドラの引数シグネチャを `{ skillId: string }` から `skillName: string` に変更し、P42準拠の3段バリデーションを実装する。

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

1. `skillHandlers.ts` の skill:remove ハンドラの引数インターフェースを修正
2. テスト実行で GREEN（全テスト PASS）を確認

## 参照資料

> 依存Phase成果物参照: Phase 4

| 資料                                         | 用途                                    |
| -------------------------------------------- | --------------------------------------- |
| `06-known-pitfalls.md#P42`                   | `.trim()` 3段バリデーションパターン     |
| `06-known-pitfalls.md#P44`                   | skill:import 同一パターン（実装の参考） |
| `06-known-pitfalls.md#P11`                   | PostToolUseフックによるEdit失敗リスク   |
| `apps/desktop/src/main/ipc/skillHandlers.ts` | 修正対象ファイル                        |

## 実行手順

### Step 1: ハンドラ修正

修正対象ファイル: `apps/desktop/src/main/ipc/skillHandlers.ts`
修正箇所: 行140-155（skill:remove ハンドラ）

#### 変更前（現行コード）

```typescript
// skill:remove - スキルを削除
ipcMain.handle(
  IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_REMOVE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    if (typeof args?.skillId !== "string") {
      throw { code: "VALIDATION_ERROR", message: "skillId must be a string" };
    }
    return skillService.removeSkill(args.skillId);
  },
);
```

#### 変更後（修正コード）

```typescript
// skill:remove - スキルを削除
ipcMain.handle(
  IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, skillName: string) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_REMOVE, {
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
    return skillService.removeSkill(skillName);
  },
);
```

#### 変更点の詳細

| 変更箇所           | 変更前                                   | 変更後                                                       | 理由                            |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------ | ------------------------------- |
| 引数シグネチャ     | `args: { skillId: string }`              | `skillName: string`                                          | Preload側の文字列引数に合わせる |
| バリデーション条件 | `typeof args?.skillId !== "string"`      | `typeof skillName !== "string" \|\| skillName.trim() === ""` | P42: 3段バリデーション          |
| エラーメッセージ   | `"skillId must be a string"`             | `"skillName must be a non-empty string"`                     | 変数名・条件に整合              |
| サービス呼び出し   | `skillService.removeSkill(args.skillId)` | `skillService.removeSkill(skillName)`                        | 引数アクセス方法の変更          |

### Step 2: Green 確認

テスト実行コマンド（P40準拠）:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
```

期待結果:

- skill:remove の SH-RM-01〜SH-RM-06 が全て **PASS**
- skill:remove 以外のテスト（skill:import, skill:get-detail, skill:scan 等）も全て **PASS**（既存テストのリグレッションなし）

### Step 3: 変更不要ファイルの確認

以下のファイルは変更**不要**であることを確認する:

| ファイル                                               | 理由                                             |
| ------------------------------------------------------ | ------------------------------------------------ |
| `apps/desktop/src/preload/skill-api.ts`                | 行264-265で既に `skillName: string` を渡している |
| `apps/desktop/src/preload/__tests__/skill-api.test.ts` | 既に文字列引数を期待しているテスト               |

確認コマンド:

```bash
cd apps/desktop && grep -n "SKILL_REMOVE" src/preload/skill-api.ts
```

期待出力: `safeInvoke(IPC_CHANNELS.SKILL_REMOVE, skillName)` が文字列引数であることが確認できる。

## 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合する            |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認する                 |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致させる |

## 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                                                                    | 本タスクでの確認ポイント                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `skill:import/remove` チャンネル定義の整合 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill管理API契約（引数・戻り値）整合       |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload間の責務境界と引数契約         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `validateIpcSender` と入力検証の必須要件   |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `safeInvoke` とホワイトリスト制約          |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42に基づく実装整合                    |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` 等の扱い統一            |

## 成果物

| 成果物                   | パス                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| 修正済みハンドラファイル | `apps/desktop/src/main/ipc/skillHandlers.ts`                         |
| テスト実行結果ログ       | `outputs/phase-5/test-green-result.md`（全テスト PASS のログを記録） |
| 実装サマリ               | `outputs/phase-5/implementation-summary.md`（変更内容と理由の記録）  |

## 完了条件

- [ ] `skillHandlers.ts` の skill:remove ハンドラの第2引数が `skillName: string` に変更されている
- [ ] バリデーション条件が `typeof skillName !== "string" || skillName.trim() === ""` になっている（P42: 3段バリデーション）
- [ ] エラーメッセージが `"skillName must be a non-empty string"` になっている
- [ ] `skillService.removeSkill(skillName)` が直接文字列引数で呼ばれている
- [ ] skill:remove の SH-RM-01〜SH-RM-06 が全て PASS
- [ ] skill:remove 以外の全テストが PASS（リグレッションなし）
- [ ] `apps/desktop/src/preload/skill-api.ts` に変更がないこと

## 次Phase

Phase 6（テスト拡充）へ進む。セキュリティ検証・エッジケースのテストを追加してカバレッジを向上させる。
