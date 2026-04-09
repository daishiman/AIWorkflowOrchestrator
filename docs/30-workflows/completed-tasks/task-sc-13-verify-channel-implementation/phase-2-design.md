# Phase 2: 設計

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 2                                        |
| Phase名    | 設計                                     |
| 前提Phase  | Phase 1                                  |
| 後続Phase  | Phase 3                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-04-08                               |
| 機能名     | task-sc-13-verify-channel-implementation |

---

## 目的

`skill-creator:verify` チャネル実装の型定義・IPC フロー・4層実装設計を確定する。
既存の `plan/execute/improve` パターンとの整合性を保ちながら、`VerifyResult` 型と
`IpcResult<VerifyResult>` インターフェースを設計する。

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果・判定・取得値は `outputs/phase-2/` へ記録する。

### タスク1: VerifyResult 型設計

**目的**: `@repo/shared/types` に追加する `VerifyResult` 型を設計する

**実行手順**:

1. 既存の `IpcResult` ジェネリック型の定義を確認する
2. TASK-P0-01 で実装済みの `SkillCreatorVerificationEngine` の出力型を確認する
3. `RuntimeSkillCreatorVerifyCheck` から公開 DTO `VerifyResult` への変換形を設計する

**設計案**:

```typescript
// packages/shared/src/types/skillCreator.ts に追加
export type VerifyResult = {
  skillName: string;
  passed: boolean;
  checkResults: VerifyCheckResult[];
  summary: string;
};

export type VerifyCheckResult = {
  checkId: string;
  label: string;
  passed: boolean;
  message?: string;
};
```

**DTO 変換方針**:

- `RuntimeSkillCreatorVerifyCheck.id` → `VerifyCheckResult.checkId`
- `RuntimeSkillCreatorVerifyCheck.summary` → `VerifyCheckResult.label`
- `RuntimeSkillCreatorVerifyCheck.severity === "info"` → `VerifyCheckResult.passed = true`
- `RuntimeSkillCreatorVerifyCheck.evidenceSummary` → `VerifyCheckResult.message`
- `VerifyResult.passed` は全 check が `passed === true` のときのみ true

**確認事項**:

- `SkillCreatorVerificationEngine` の実際の出力型と一致しているか（TASK-P0-01 成果物を参照）
- 既存 `IpcResult<T>` の `success: boolean; data?: T; error?: string` 構造と整合しているか
- `@repo/shared/types/skillCreator` subpath export が既存 root barrel と衝突しないか（`SkillCategory` 衝突を避けるルール）

**期待される成果物**:

- `outputs/phase-2/type-interface-design.md`

---

### タスク2: IPC チャネル定数の設計

**目的**: `SKILL_CREATOR_VERIFY` 定数を `channels.ts` に追加する設計を確定する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts` の現在の定数定義パターンを確認する
2. 既存定数（`SKILL_CREATOR_PLAN`, `SKILL_CREATOR_EXECUTE` 等）の命名規則を確認する
3. `SKILL_CREATOR_VERIFY = "skill-creator:verify"` の追加位置を決定する
4. `apps/desktop/src/preload/channels.ts` の `IPC_CHANNELS` / `ALLOWED_INVOKE_CHANNELS` 反映方針を決定する

**設計**:

```typescript
// packages/shared/src/ipc/channels.ts
export const SKILL_CREATOR_VERIFY = "skill-creator:verify" as const;
```

```typescript
// apps/desktop/src/preload/channels.ts
IPC_CHANNELS.SKILL_CREATOR_VERIFY = "skill-creator:verify";
ALLOWED_INVOKE_CHANNELS.push(IPC_CHANNELS.SKILL_CREATOR_VERIFY);
```

**期待される成果物**:

- `outputs/phase-2/design-decisions.md` に定数設計を記載

---

### タスク3: 4層実装フロー設計

**目的**: shared channels → preload channels → Facade → handlers → preload API の実装フローを設計する

**実行手順**:

1. 既存 `plan` ハンドラの実装フローを解析し、`verify` 版の設計を作成する
2. `RuntimeSkillCreatorFacade.verify()` の内部で `skillName -> skillDir` 解決方針を決める
3. `validateSender + isBlank + sanitizeErrorMessage` パターンを `verify` ハンドラに適用する
4. `unregisterRuntimeSkillCreatorHandlers` への `removeHandler` 追加位置を決定する

**設計**:

#### Layer 1: channels.ts

```typescript
export const SKILL_CREATOR_VERIFY = "skill-creator:verify" as const;
```

#### Layer 2: RuntimeSkillCreatorFacade.ts

```typescript
async verify(
  skillName: string,
  authMode: AuthMode,
  apiKey: string | null
): Promise<IpcResult<VerifyResult>> {
  // authMode/apiKey は improve/plan と同じ surface に揃える
  // 現実の verify 処理はローカル検証なので integrated_api / terminal_handoff 分岐は持たない
  // skillName を skillDir に解決する
  // verificationEngine.verify(skillDir) の戻り値を VerifyResult に変換する
}
```

**skillName → skillDir 解決方針**:

- `SkillFileManager` の private 実装へ依存しない
- `SkillLocator.resolveSkillDir(skillName, process.cwd())` を優先し、SKILL.md の `name:` フィールドを正本に解決する
- 解決失敗時は handler 側ではなく Facade 内で例外にし、handler の `sanitizeErrorMessage` で統一的に返す

#### Layer 3: creatorHandlers.ts

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_CREATOR_VERIFY, async (event, args) => {
  validateSender(event, IPC_CHANNELS.SKILL_CREATOR_VERIFY, mainWindow);
  if (isBlank(args?.skillName)) {
    return { success: false, error: "skillName が指定されていません" };
  }
  if (!runtimeSkillCreatorService) {
    return validationError(RUNTIME_SKILL_CREATOR_UNAVAILABLE);
  }
  try {
    return await runtimeSkillCreatorService.verify(
      args.skillName.trim(),
      args.authMode ?? "api-key",
      args.apiKey ?? null,
    );
  } catch (error) {
    return {
      success: false,
      error: sanitizeErrorMessage(error, "verify の実行に失敗しました"),
    };
  }
});
```

#### Layer 4: skill-creator-api.ts

```typescript
verifySkill: (skillName: string, authMode: AuthMode, apiKey: string | null) =>
  safeInvoke<VerifyResult>(IPC_CHANNELS.SKILL_CREATOR_VERIFY, {
    skillName,
    authMode,
    apiKey,
  }),
```

**期待される成果物**:

- `outputs/phase-2/design-decisions.md`
- `outputs/phase-2/ipc-flow-diagram.md`

---

### タスク4: テスト設計方針の確立

**目的**: Phase 4 で作成するテストの方針を事前に設計する

**実行手順**:

1. 既存の `creatorHandlers.plan.test.ts`（または相当ファイル）のテストパターンを確認する
2. `verify` ハンドラのテスト境界を決定する
3. E2E テストへの追加方針を設計する

**テスト設計方針**:

- UT ファイル: `creatorHandlers.verify.test.ts`（新規作成）
- テストパターン: `validateSender` 呼び出し確認 / `isBlank` ガード確認 / 正常系 / エラー系
- エラー応答確認: `assertIpcError(result, "expected string")` を使用（`error: string` 形式）
- E2E: `skill-creator-integration.test.ts` に verify シナリオを追加

**期待される成果物**:

- `outputs/phase-2/design-decisions.md` にテスト方針を記載

---

## 参照資料

| 参照資料                     | パス                                                                  | 内容                               |
| ---------------------------- | --------------------------------------------------------------------- | ---------------------------------- |
| channels.ts                  | `packages/shared/src/ipc/channels.ts`                                 | 既存定数定義パターン               |
| creatorHandlers.ts           | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | plan/execute/improve パターン参照  |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 既存メソッド設計参照               |
| skill-creator-api.ts         | `apps/desktop/src/preload/skill-creator-api.ts`                       | safeInvoke パターン                |
| VerificationEngine 実装      | TASK-P0-01 成果物（interfaces-skill-verify-contract.md）              | VerifyResult 元型の確認            |
| skillCreator.ts (shared)     | `packages/shared/src/types/skillCreator.ts`                           | 既存型定義・SkillCategory 衝突確認 |

---

## 成果物

| 成果物                 | パス                                       | 内容                             |
| ---------------------- | ------------------------------------------ | -------------------------------- |
| 設計決定書             | `outputs/phase-2/design-decisions.md`      | 4層設計・型定義・命名方針        |
| 型インターフェース設計 | `outputs/phase-2/type-interface-design.md` | VerifyResult 型の完全定義        |
| IPC フロー図           | `outputs/phase-2/ipc-flow-diagram.md`      | channels→Facade→handlers→preload |

---

## 統合テスト連携

- 統合ポイント: `verifySkill(skillName, authMode, apiKey)` → preload invoke whitelist → IPC handler → `verify()` → `SkillLocator.resolveSkillDir()` → `VerificationEngine`
- 型契約: `IpcResult<VerifyResult>` を Phase 4 統合テスト設計に引き継ぐ
- エラー契約: `error: string`（`sanitizeErrorMessage()` 適用後）

---

## 完了条件

- [ ] `VerifyResult` 型の完全な定義が設計されていること
- [ ] `SKILL_CREATOR_VERIFY` 定数の追加位置と値が確定していること
- [ ] `preload/channels.ts` の `IPC_CHANNELS` / `ALLOWED_INVOKE_CHANNELS` 反映方針が設計されていること
- [ ] 4層実装フロー（shared channels → Facade → handlers → preload API）が設計されていること
- [ ] `skillName -> skillDir` 解決方針が明記されていること
- [ ] `unregisterRuntimeSkillCreatorHandlers` への `removeHandler` 追加が設計されていること
- [ ] テスト設計方針（UT / E2E）が文書化されていること
- [ ] `outputs/phase-2/` に全成果物が生成されていること

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## 次Phase

**Phase 3: 設計レビューゲート** — Phase 2 の設計内容をレビューし、Phase 4 へ進行可否を判定する。
