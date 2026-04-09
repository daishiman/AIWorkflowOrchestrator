# Phase 5: 実装

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 5                                        |
| Phase名    | 実装                                     |
| 前提Phase  | Phase 4                                  |
| 後続Phase  | Phase 6                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

TDD の Green フェーズとして、`skill-creator:verify` チャネルの4層実装を行い、
Phase 4 で作成した全テストを PASS させる。

**実装計画（新規作成 / 修正 ファイルパス一覧）**:

| ファイル                                                              | 種別 | 変更内容                                              |
| --------------------------------------------------------------------- | ---- | ----------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                           | 修正 | `VerifyResult` 型・`VerifyCheckResult` 型を追加       |
| `packages/shared/src/ipc/channels.ts`                                 | 修正 | `SKILL_CREATOR_VERIFY` 定数を追加                     |
| `apps/desktop/src/preload/channels.ts`                                | 修正 | `IPC_CHANNELS` / `ALLOWED_INVOKE_CHANNELS` に追加     |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正 | `verify(skillName, authMode, apiKey)` メソッドを追加  |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | 修正 | verify ハンドラ追加・unregister に removeHandler 追加 |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | 修正 | `verifySkill` メソッドを追加                          |

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-5/` へ記録する。

### タスク1: VerifyResult 型の追加（packages/shared）

**目的**: `packages/shared/src/types/skillCreator.ts` に `VerifyResult` 型を追加する

**実行手順**:

1. `packages/shared/src/types/skillCreator.ts` を読み、既存型定義の末尾を確認する
2. Phase 2 で設計した `VerifyResult` 型を追加する
3. `@repo/shared/types/skillCreator` subpath export を確認し、root barrel との衝突がないことを確認する
4. `pnpm --filter @repo/shared typecheck` で型エラーがないことを確認する

**実装内容**:

```typescript
// packages/shared/src/types/skillCreator.ts に追加
export type VerifyCheckResult = {
  checkId: string;
  label: string;
  passed: boolean;
  message?: string;
};

export type VerifyResult = {
  skillName: string;
  passed: boolean;
  checkResults: VerifyCheckResult[];
  summary: string;
};
```

---

### タスク2: SKILL_CREATOR_VERIFY 定数の追加（channels.ts）

**目的**: `packages/shared/src/ipc/channels.ts` に `SKILL_CREATOR_VERIFY` 定数を追加する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts` を読み、既存定数の配置パターンを確認する
2. `SKILL_CREATOR_VERIFY = "skill-creator:verify"` を追加する（既存 SKILL*CREATOR*\* 定数の近くに配置）
3. `pnpm --filter @repo/shared typecheck` で型エラーがないことを確認する

**実装内容**:

```typescript
// packages/shared/src/ipc/channels.ts に追加（既存定数の近くへ）
export const SKILL_CREATOR_VERIFY = "skill-creator:verify" as const;
```

---

### タスク3: RuntimeSkillCreatorFacade.verify() の実装

**目的**: `RuntimeSkillCreatorFacade` に `verify()` メソッドを追加する

**実行手順**:

1. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` を読む
2. 既存 `plan()` メソッドのシグネチャと実装パターンを確認する
3. `verify(skillName: string, authMode: AuthMode, apiKey: string | null): Promise<IpcResult<VerifyResult>>` を実装する
4. `SkillCreatorVerificationEngine`（TASK-P0-01 実装済み）の呼び出し方を確認し、統合する
5. `skillName` を `skillDir` に解決してから検証エンジンを呼ぶ

**実装パターン**:

```typescript
// plan/execute/improve パターンに従う
async verify(
  skillName: string,
  authMode: AuthMode,
  apiKey: string | null
): Promise<IpcResult<VerifyResult>> {
  // authMode / apiKey は runtime surface の引数整合のため受ける
  // 実際の verify はローカル検証のため LLM 呼び出しを行わない
  const skillDir = SkillLocator.resolveSkillDir(skillName, process.cwd());
  const checks = await this.verificationEngine.verify(skillDir);
  return {
    success: true,
    data: {
      skillName,
      passed: checks.every((check) => check.severity === "info"),
      checkResults: checks.map((check) => ({
        checkId: check.id,
        label: check.summary,
        passed: check.severity === "info",
        message: check.evidenceSummary,
      })),
      summary: `${checks.length} checks completed`,
    },
  };
}
```

---

### タスク4: preload/channels.ts の更新

**目的**: `preload/channels.ts` に verify surface を追加し、preload の安全制約と整合させる

**実行手順**:

1. `apps/desktop/src/preload/channels.ts` を読み、runtime 系チャンネル定義の並びを確認する
2. `IPC_CHANNELS.SKILL_CREATOR_VERIFY` を追加する
3. `ALLOWED_INVOKE_CHANNELS` に同チャンネルを追加する

### タスク4: verify ハンドラの追加（creatorHandlers.ts）

**目的**: `creatorHandlers.ts` に verify ハンドラを追加し、`unregisterRuntimeSkillCreatorHandlers` に `removeHandler` を追加する

**実行手順**:

1. `apps/desktop/src/main/ipc/creatorHandlers.ts` を読み、`registerRuntimeSkillCreatorHandlers` と `unregisterRuntimeSkillCreatorHandlers` の構造を確認する
2. verify ハンドラを `validateSender + isBlank + sanitizeErrorMessage` パターンで実装する
3. `unregisterRuntimeSkillCreatorHandlers` に `removeHandler(SKILL_CREATOR_VERIFY)` を追加する

**実装パターン**:

```typescript
// registerRuntimeSkillCreatorHandlers 内に追加
registerHandler(
  SKILL_CREATOR_VERIFY,
  async (event, skillName, authMode, apiKey) => {
    validateSender(event);
    if (isBlank(skillName)) {
      return { success: false, error: "skillName is required" };
    }
    try {
      return await facade.verify(skillName, authMode, apiKey);
    } catch (err) {
      return { success: false, error: sanitizeErrorMessage(err) };
    }
  },
);

// unregisterRuntimeSkillCreatorHandlers 内に追加
removeHandler(SKILL_CREATOR_VERIFY);
```

**重要**: `error` は `string` 型（`sanitizeErrorMessage()` 適用済み）。`{ code, message }` オブジェクトではない（P60 知見）。

---

### タスク5: Preload API verifySkill の追加（skill-creator-api.ts）

**目的**: `skill-creator-api.ts` に `verifySkill` メソッドを追加する

**実行手順**:

1. `apps/desktop/src/preload/skill-creator-api.ts` を読み、既存 `safeInvoke` パターンを確認する
2. `verifySkill` メソッドを既存パターンに従い追加する

**実装内容**:

```typescript
// skill-creator-api.ts に追加
verifySkill: (skillName: string, authMode: AuthMode, apiKey: string | null) =>
  safeInvoke<VerifyResult>(IPC_CHANNELS.SKILL_CREATOR_VERIFY, {
    skillName,
    authMode,
    apiKey,
  }),
```

---

### タスク6: Green 確認

**目的**: Phase 4 で作成した全テストが PASS（Green）になっていることを確認する

**実行手順**:

```bash
# 1. UT テスト（verify ハンドラ）
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts

# 2. E2E テスト
pnpm --filter @repo/desktop test apps/desktop/src/test/skill-creator-integration.test.ts

# 3. 既存テストへの非影響確認（全件 PASS）
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/

# 4. TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

**確認項目**:

- [ ] verify UT（TC-V-01〜TC-V-07）全件 PASS
- [ ] E2E verify テスト（TC-E2E-V-01/02）PASS
- [ ] 既存 plan/execute/improve テスト全件 PASS（非影響確認）
- [ ] TypeScript 型チェック PASS

---

## TDD検証

```bash
# Green 確認コマンド
pnpm --filter @repo/desktop test apps/desktop/src/main/ipc/__tests__/creatorHandlers.verify.test.ts
pnpm --filter @repo/desktop test apps/desktop/src/test/skill-creator-integration.test.ts
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 参照資料

| 参照資料                     | パス                                                                  | 内容                          |
| ---------------------------- | --------------------------------------------------------------------- | ----------------------------- |
| creatorHandlers.ts           | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | plan/execute/improve パターン |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 既存メソッド実装パターン      |
| skill-creator-api.ts         | `apps/desktop/src/preload/skill-creator-api.ts`                       | safeInvoke パターン           |
| skillCreator.ts (shared)     | `packages/shared/src/types/skillCreator.ts`                           | 既存型定義                    |
| channels.ts                  | `packages/shared/src/ipc/channels.ts`                                 | 既存定数定義                  |
| VerificationEngine 実装      | TASK-P0-01 成果物                                                     | verify 内部ロジック           |

---

## 成果物

| 成果物                       | パス                                                                          | 内容                                |
| ---------------------------- | ----------------------------------------------------------------------------- | ----------------------------------- |
| VerifyResult 型追加          | `packages/shared/src/types/skillCreator.ts`（修正）                           | VerifyResult / VerifyCheckResult 型 |
| SKILL_CREATOR_VERIFY 定数    | `packages/shared/src/ipc/channels.ts`（修正）                                 | verify チャネル定数                 |
| preload チャンネル公開       | `apps/desktop/src/preload/channels.ts`（修正）                                | IPC_CHANNELS / invoke whitelist     |
| Facade.verify() メソッド     | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（修正） | verify 実装                         |
| verify ハンドラ              | `apps/desktop/src/main/ipc/creatorHandlers.ts`（修正）                        | ハンドラ登録・解除                  |
| Preload verifySkill メソッド | `apps/desktop/src/preload/skill-creator-api.ts`（修正）                       | safeInvoke 経由公開                 |
| 実装結果                     | `outputs/phase-5/implementation-result.md`                                    | 変更内容サマリー                    |
| Green 確認証跡               | `outputs/phase-5/green-confirmation.md`                                       | テスト PASS ログ                    |

---

## 統合テスト連携

- フロント/バック接続の実装（Preload → IPC → Facade）が完成
- テスト支援コード（verifySkill モック）を `skill-creator-test-helpers.ts` に追加検討

---

## 完了条件

- [ ] `VerifyResult` / `VerifyCheckResult` 型が `packages/shared/src/types/skillCreator.ts` に追加されていること
- [ ] `SKILL_CREATOR_VERIFY` 定数が `channels.ts` に追加されていること
- [ ] `preload/channels.ts` に verify surface と invoke whitelist が追加されていること
- [ ] `RuntimeSkillCreatorFacade.verify()` が実装されていること
- [ ] verify ハンドラが `creatorHandlers.ts` に登録されていること（validateSender + isBlank + sanitizeErrorMessage パターン）
- [ ] `unregisterRuntimeSkillCreatorHandlers` に `removeHandler(SKILL_CREATOR_VERIFY)` が追加されていること
- [ ] `skill-creator-api.ts` に `verifySkill` が追加されていること
- [ ] verify UT（TC-V-01〜TC-V-07）全件 PASS（Green）であること
- [ ] E2E verify テスト PASS であること
- [ ] 既存 plan/execute/improve テスト全件 PASS であること
- [ ] TypeScript 型チェック PASS であること
- [ ] `outputs/phase-5/` に全成果物が生成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4 が完了していること（TDD Red 状態のテスト一式）
- **後続**: Phase 6 へ進む

---

## 次Phase

**Phase 6: テスト拡充** — fail path / 境界値 / 回帰 guard を追加し、テストの堅牢性を高める。
