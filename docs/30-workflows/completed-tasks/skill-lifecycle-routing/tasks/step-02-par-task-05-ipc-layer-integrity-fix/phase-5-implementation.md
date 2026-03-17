# Phase 5: 実装

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 5                                                 |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001              |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix |
| 作成日   | 2026-03-17                                        |
| 前Phase  | [Phase 4: テスト作成](./phase-4-test-creation.md) |

## 目的

Phase 4 で作成したテストを Green にするためのプロダクションコードを実装する。3つのLane（Main Process / Preload API / チャンネル定数確認）を並列に実施し、SKILL_UPDATE デッドチャンネルと SKILL_GET_DETAIL Preload API 未公開の2件の Critical 不整合を解消する。

## 参照資料

| 資料名                | パス                                                                          | 説明                                |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------------------- |
| Phase 2 設計書        | `outputs/phase-2/design.md`                                                   | IPC契約設計・バリデーション設計     |
| Phase 4 テスト結果    | `outputs/phase-4/test-run-result.md`                                          | Red 状態のテスト確認                |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | Phase 2-4 実施                      |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                          | P5/P23/P32/P42/P44/P45 の詳細       |
| skillHandlers.ts      | `apps/desktop/src/main/ipc/skillHandlers.ts`                                  | Lane 1 の変更対象（L242, L773付近） |
| skill-api.ts          | `apps/desktop/src/preload/skill-api.ts`                                       | Lane 2 の変更対象                   |
| channels.ts (preload) | `apps/desktop/src/preload/channels.ts`                                        | Lane 3 の確認対象                   |
| channels.ts (shared)  | `packages/shared/src/ipc/channels.ts`                                         | Lane 3 の確認対象（P32準拠）        |
| types.ts              | `apps/desktop/src/preload/types.ts`                                           | Lane 2 の型定義更新対象（P32準拠）  |

## 重要: 実装前の確認事項

### IPC契約チェックリスト Phase 2 実施（変更前の4箇所確認）

以下のコマンドで変更前の状態を記録する:

```bash
# 1. Main Process ハンドラ確認（SKILL_UPDATE が存在しないことを確認）
grep -n "SKILL_UPDATE\|skill:update" apps/desktop/src/main/ipc/skillHandlers.ts

# 2. Preload API 確認（getDetail/update が存在しないことを確認）
grep -n "getDetail\|update" apps/desktop/src/preload/skill-api.ts

# 3. channels.ts でチャンネル定数値を確認
grep -n "SKILL_UPDATE\|SKILL_GET_DETAIL" apps/desktop/src/preload/channels.ts
grep -n "SKILL_UPDATE\|SKILL_GET_DETAIL" packages/shared/src/ipc/channels.ts

# 4. types.ts で SkillAPI 型定義を確認
grep -n "getDetail\|update\|SkillAPI" apps/desktop/src/preload/types.ts
```

### IPC契約チェックリスト Phase 3 実施（バリデーション設計確認）

Phase 2 設計書の P42準拠バリデーションパターンが全引数に適用されていることを確認する。

## 実行タスク

### Lane 1: Main Process ハンドラ実装

**変更ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts`

#### Lane 1-1: SKILL_UPDATE ハンドラを追加する

既存の `skill:remove` ハンドラ（L220-239付近）と `skill:get-detail` ハンドラ（L241-273付近）の間、または `skill:get-detail` の直後に追加する。

**実装コード**:

```typescript
// skill:update - スキルを更新（TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001）
ipcMain.handle(
  IPC_CHANNELS.SKILL_UPDATE,
  async (
    event: IpcMainInvokeEvent,
    skillName: string,
    updates: Record<string, unknown>,
  ) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_UPDATE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // P42準拠 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
    if (
      typeof skillName !== "string" ||
      skillName === "" ||
      skillName.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }

    // updates のバリデーション
    if (
      updates === null ||
      typeof updates !== "object" ||
      Array.isArray(updates)
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "updates must be a non-null object",
      };
    }

    try {
      const result = await skillService.updateSkill(skillName, updates);
      return { success: true, data: result };
    } catch (error) {
      log.error("[skillHandlers] skill:update failed:", error);
      return {
        success: false,
        error: sanitizeErrorMessage(error),
      };
    }
  },
);
```

**注意事項**:

- P45準拠: 引数名は `skillName`（セマンティクスに一致、`skillId` ではない）
- P42準拠: `skillName === ""` の空文字列チェックを必ず含める（`trim()` のみでは不十分）
- `skillService.updateSkill()` が未実装の場合は、Phase 5 内でスタブを追加する

#### Lane 1-2: `skillService.updateSkill()` スタブ確認・追加

```bash
# SkillService に updateSkill メソッドが存在するか確認
grep -n "updateSkill" apps/desktop/src/main/services/skill/SkillService.ts
```

存在しない場合は、SkillService にスタブを追加する:

```typescript
// SkillService.ts への追加（スタブ実装）
async updateSkill(
  skillName: string,
  updates: Record<string, unknown>,
): Promise<void> {
  // TODO: 実際の更新ロジックを実装する（後続タスクで対応）
  log.info(`[SkillService] updateSkill: ${skillName}`, updates);
}
```

#### Lane 1-3: `unregisterSkillHandlers()` に SKILL_UPDATE を追加する

`unregisterSkillHandlers()` 関数（L773付近）の既存 `removeHandler` 群に追加する。P5準拠の二重登録防止。

```typescript
// 追加位置: ipcMain.removeHandler(IPC_CHANNELS.SKILL_GET_DETAIL); の直後
ipcMain.removeHandler(IPC_CHANNELS.SKILL_UPDATE); // TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001
```

### Lane 2: Preload API 実装

**変更ファイル**: `apps/desktop/src/preload/skill-api.ts`、`apps/desktop/src/preload/types.ts`

#### Lane 2-1: SkillAPI インターフェースに getDetail / update を追加する（skill-api.ts）

`skill-api.ts` の `SkillAPI` インターフェース（L78付近）に追加する。
`remove` メソッド定義の後、または `onComplete` の前に追記する。

```typescript
// SkillAPI インターフェースへの追加（L157付近の remove の後）

/**
 * スキル詳細を取得する（TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001）
 * @param skillId - スキルID
 * @returns スキル詳細（見つからない場合は null）
 */
getDetail: (skillId: string) => Promise<unknown>;

/**
 * スキルを更新する（TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001）
 * @param skillName - スキル名
 * @param updates - 更新内容
 */
update: (skillName: string, updates: Record<string, unknown>) => Promise<void>;
```

> 戻り値型 `unknown` は、skillHandlers.ts L242 の `getSkillById` の戻り値型を確認してから具体的な型（`SkillMetadata | null` 等）に変更すること（P23準拠）。

#### Lane 2-2: skillAPI オブジェクトに getDetail / update を実装する（skill-api.ts）

`skillAPI` オブジェクト（L440付近）に実装を追加する。
`remove` 実装の後に追記する。

```typescript
// skillAPI オブジェクトへの追加（remove: の後）

// === Skill Detail & Update Operations (TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001) ===

getDetail: (skillId: string): Promise<unknown> => {
  // P42準拠 3段バリデーション（Preload層での早期拒否）
  if (
    typeof skillId !== "string" ||
    skillId === "" ||
    skillId.trim() === ""
  ) {
    return Promise.reject({
      code: "VALIDATION_ERROR",
      message: "skillId must be a non-empty string",
    });
  }
  return safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId });
},

update: (skillName: string, updates: Record<string, unknown>): Promise<void> => {
  // P42準拠 3段バリデーション（Preload層での早期拒否）
  if (
    typeof skillName !== "string" ||
    skillName === "" ||
    skillName.trim() === ""
  ) {
    return Promise.reject({
      code: "VALIDATION_ERROR",
      message: "skillName must be a non-empty string",
    });
  }
  if (updates === null || typeof updates !== "object" || Array.isArray(updates)) {
    return Promise.reject({
      code: "VALIDATION_ERROR",
      message: "updates must be a non-null object",
    });
  }
  return safeInvoke(IPC_CHANNELS.SKILL_UPDATE, skillName, updates);
},
```

**重要**: `getDetail` は既存ハンドラ（L242）が `args: { skillId: string }` を期待するため、`safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId })` とオブジェクト形式で渡すこと（P44対策）。

#### Lane 2-3: types.ts の SkillAPI 型定義を確認・更新する（P32準拠）

`apps/desktop/src/preload/types.ts` で SkillAPI の参照方法を確認し、必要に応じて `getDetail` / `update` のシグネチャを追加する。

```bash
# types.ts での SkillAPI 参照確認
grep -n "SkillAPI\|skill:" apps/desktop/src/preload/types.ts
```

`types.ts` L1203 付近で `skill: import("./skill-api").SkillAPI` という形式で参照している場合は、`skill-api.ts` の `SkillAPI` インターフェースを更新するだけで自動的に反映される。明示的な型定義が別途ある場合のみ `types.ts` を更新する。

### Lane 3: チャンネル定数確認・同期

**確認ファイル**: `apps/desktop/src/preload/channels.ts`、`packages/shared/src/ipc/channels.ts`

#### Lane 3-1: チャンネル定数値の整合確認

```bash
# preload 側のチャンネル定数値を確認
grep -n "SKILL_UPDATE\|SKILL_GET_DETAIL" apps/desktop/src/preload/channels.ts

# shared 側のチャンネル定数値を確認
grep -n "SKILL_UPDATE\|SKILL_GET_DETAIL" packages/shared/src/ipc/channels.ts

# 値が一致することを確認（どちらも "skill:update" と "skill:get-detail" のはず）
```

**期待する値**:

- `SKILL_UPDATE`: `"skill:update"`（両ファイルで一致）
- `SKILL_GET_DETAIL`: `"skill:get-detail"`（両ファイルで一致）

不整合がある場合は P32準拠で両ファイルを同時に修正する。

#### Lane 3-2: ALLOWED_INVOKE_CHANNELS への登録確認

```bash
# SKILL_UPDATE と SKILL_GET_DETAIL がホワイトリストに含まれているか確認
grep -n "SKILL_UPDATE\|SKILL_GET_DETAIL" apps/desktop/src/preload/channels.ts | grep -v "^.*:.*SKILL"
```

既に `channels.ts` L483 に `SKILL_GET_DETAIL`、L491 に `SKILL_UPDATE` が登録済みであることを確認する。登録済みの場合は変更不要。

### IPC契約チェックリスト Phase 4 実施（テストとの整合確認）

実装完了後、以下を確認する:

```bash
# 実装後の状態確認
grep -n "SKILL_UPDATE" apps/desktop/src/main/ipc/skillHandlers.ts
grep -n "getDetail\|update" apps/desktop/src/preload/skill-api.ts

# テストを実行して Green になることを確認
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.update.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api.getDetail-update.test.ts
```

## 統合テスト連携

- 本Phaseの変更点が受入基準（AC）と追跡可能であることを確認する
- 前Phase成果物と本Phaseテスト（単体・統合・手動）の対応関係を記録する
- 未達・差分がある場合は戻り先Phaseと再実行条件を明記する

## 成果物

| 成果物                       | パス                                         | 説明                                   |
| ---------------------------- | -------------------------------------------- | -------------------------------------- |
| skillHandlers.ts（更新）     | `apps/desktop/src/main/ipc/skillHandlers.ts` | SKILL_UPDATE ハンドラ追加 + unregister |
| skill-api.ts（更新）         | `apps/desktop/src/preload/skill-api.ts`      | getDetail() / update() メソッド追加    |
| types.ts（更新、必要時のみ） | `apps/desktop/src/preload/types.ts`          | SkillAPI 型定義更新（P32準拠）         |
| 実装完了報告                 | `outputs/phase-5/implementation-report.md`   | 変更内容・テスト結果の記録             |

## 完了条件

- [ ] Lane 1: `skillHandlers.ts` に `ipcMain.handle(IPC_CHANNELS.SKILL_UPDATE, ...)` が追加されている（AC-1）
- [ ] Lane 1: `unregisterSkillHandlers()` に `ipcMain.removeHandler(IPC_CHANNELS.SKILL_UPDATE)` が含まれている（AC-2）
- [ ] Lane 1: SKILL_UPDATE ハンドラに P42準拠3段バリデーションが実装されている（AC-5）
- [ ] Lane 2: `skill-api.ts` に `getDetail()` メソッドが追加され、`SKILL_GET_DETAIL` チャンネルを invoke する（AC-3）
- [ ] Lane 2: `skill-api.ts` に `update()` メソッドが追加され、`SKILL_UPDATE` チャンネルを invoke する（AC-4）
- [ ] Lane 2: `getDetail()` / `update()` に P42準拠3段バリデーションが実装されている（AC-5）
- [ ] Lane 3: `SKILL_UPDATE` / `SKILL_GET_DETAIL` のチャンネル定数値が preload/shared で一致している（AC-8）
- [ ] Phase 4 で作成した全テストが Green（PASS）になっている
- [ ] 既存テストが引き続き全件 PASS している（AC-7）
- [ ] `pnpm typecheck` でエラーが 0 件（P32準拠の型整合）
- [ ] `outputs/phase-5/implementation-report.md` が作成済み
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 5
```

## 次Phase

Phase 6: テスト拡充（[phase-6-test-expansion.md](./phase-6-test-expansion.md)）

> **Gate**: Phase 4 の全テストが Green、既存テストが全件 PASS、`pnpm typecheck` エラー 0 件を確認してから Phase 6 へ進む。
