# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 5                                          |
| タスクID | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| 機能名   | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 作成日   | 2026-02-09                                 |
| 規模     | 小規模                                     |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う（Green状態）。
SKILL_EXECUTEハンドラーがSkillService.executeSkill()ではなくSkillExecutor.execute()を呼び出すように変更する。

## 実行タスク

- バリデーション抽出: 既存のバリデーションロジックを保持
- SkillExecutor.execute()呼び出し: 委譲ロジックの実装
- 型変換実装: params → SkillExecutionRequest, Skill → SkillMetadata
- SkillService.executeSkill() deprecation: 非推奨化またはコメントアウト

## 参照資料

| 資料名           | パス                                                                                | 説明               |
| ---------------- | ----------------------------------------------------------------------------------- | ------------------ |
| Phase 4テスト    | `docs/30-workflows/task-fix-15-1-execute-handler-routing/phase-04-test-creation.md` | テスト仕様         |
| skillHandlers.ts | `apps/desktop/src/main/ipc/skillHandlers.ts`                                        | 現在の実装         |
| SkillExecutor.ts | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                             | 委譲先の実装       |
| SkillService.ts  | `apps/desktop/src/main/services/skill/SkillService.ts`                              | 既存の実行メソッド |
| skill型定義      | `packages/shared/src/types/skill.ts`                                                | 型定義             |

## 実行手順

### ステップ1: 型変換ヘルパー関数の作成

`skillHandlers.ts` に型変換ヘルパー関数を追加する。

```typescript
import type { Skill, SkillExecutionRequest } from "@repo/shared";
import type { SkillMetadata } from "../services/skill/SkillExecutor";

/**
 * Skill を SkillMetadata（SkillExecutor用）に変換する
 *
 * @param skill - 変換元のSkill
 * @returns SkillMetadata
 */
function convertToSkillMetadata(skill: Skill): SkillMetadata {
  return {
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    description: skill.description,
    path: skill.path,
    triggers: skill.triggers,
    anchors: skill.anchors,
    allowedTools: skill.allowedTools,
    category: skill.category,
    environment: skill.environment,
    license: skill.license,
    tags: skill.tags,
    dependencies: skill.dependencies,
  };
}

/**
 * IPC引数を SkillExecutionRequest に変換する
 *
 * @param skillId - スキルID
 * @param params - パラメータ
 * @returns SkillExecutionRequest
 */
function convertToExecutionRequest(
  skillId: string,
  params?: Record<string, unknown>,
): SkillExecutionRequest {
  return {
    prompt: (params?.prompt as string) || "",
    skillId,
    timeout: params?.timeout as number | undefined,
    sessionId: params?.sessionId as string | undefined,
  };
}
```

### ステップ2: SKILL_EXECUTEハンドラーの修正

```typescript
// skill:execute - スキルを実行
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event: IpcMainInvokeEvent,
    args: { skillId: string; params?: Record<string, unknown> },
  ) => {
    // Sender検証
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // skillIdのバリデーション
    if (typeof args?.skillId !== "string" || args.skillId === "") {
      return { success: false, error: "skillId must be a string" };
    }

    // SkillExecutorの初期化確認
    if (!_skillExecutorInstance) {
      return { success: false, error: "SkillExecutor is not initialized" };
    }

    try {
      // スキルの存在確認
      const skill = await skillService.getSkillById(args.skillId);
      if (!skill) {
        return { success: false, error: "スキルが見つかりません" };
      }

      // インポート状態確認
      // Note: SkillService経由でImportManagerにアクセスする必要あり
      // 現在の実装ではskillService.executeSkill()内でチェックしていたが、
      // ここでチェックする必要がある
      const importedSkills = await skillService.getImportedSkills();
      const isImported = importedSkills.some((s) => s.id === args.skillId);
      if (!isImported) {
        return { success: false, error: "スキルがインポートされていません" };
      }

      // 型変換
      const skillMetadata = convertToSkillMetadata(skill);
      const executionRequest = convertToExecutionRequest(
        args.skillId,
        args.params,
      );

      // SkillExecutor.execute() 呼び出し
      const result = await _skillExecutorInstance.execute(
        executionRequest,
        skillMetadata,
      );

      return {
        success: result.success,
        data: {
          executionId: result.executionId,
          success: result.success,
          error: result.error,
        },
        error: result.error?.message,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "スキル実行に失敗しました",
      };
    }
  },
);
```

### ステップ3: SkillService.executeSkill()のdeprecation

`SkillService.ts` の `executeSkill()` メソッドにdeprecation注釈を追加する。

```typescript
/**
 * スキルを実行する
 *
 * @deprecated Phase 5: TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING
 * このメソッドはSkillExecutor.execute()に置き換えられました。
 * 今後はskillHandlers.tsから直接SkillExecutorを呼び出してください。
 *
 * @param skillId - スキルID
 * @param params - パラメータ
 * @returns SkillRunResult
 */
async executeSkill(
  skillId: string,
  _params?: Record<string, unknown>,
): Promise<SkillRunResult> {
  // 既存の実装を維持（後方互換性のため）
  // 将来のリリースで削除予定
  console.warn(
    "[SkillService] executeSkill() is deprecated. Use SkillExecutor.execute() instead."
  );
  // ... 既存の実装
}
```

### ステップ4: インポートの追加

```typescript
// skillHandlers.ts の先頭に追加
import type {
  Skill,
  SkillExecutionRequest,
  // ... 既存のインポート
} from "@repo/shared";

import type { SkillMetadata } from "../services/skill/SkillExecutor";
```

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                                         |
| ------------------ | ------------------------------------------------------------ |
| IPC接続            | SKILL_EXECUTEハンドラー → SkillExecutor.execute() 委譲       |
| エラーハンドリング | バリデーションエラー、スキル未発見、未インポートエラーの返却 |
| 型変換             | Skill → SkillMetadata, params → SkillExecutionRequest        |

## アーキテクチャ層別実装

| 層           | 実装観点                                | 実装ファイル配置                        |
| ------------ | --------------------------------------- | --------------------------------------- |
| Main Process | IPCハンドラー修正、型変換ヘルパー追加   | `apps/desktop/src/main/ipc/`            |
| サービス層   | SkillService.executeSkill() deprecation | `apps/desktop/src/main/services/skill/` |

## 変更ファイル一覧

| ファイル                                               | 変更内容                                        |
| ------------------------------------------------------ | ----------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | SKILL_EXECUTEハンドラー修正、型変換ヘルパー追加 |
| `apps/desktop/src/main/services/skill/SkillService.ts` | executeSkill()にdeprecation注釈追加             |

## 多角的チェック観点（AIが判断）

本タスク（SKILL_EXECUTEハンドラーのSkillExecutor委譲）では以下の観点を適用：

| 観点                 | 確認内容                                    | 仕様参照先                                                  |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| セキュリティ         | IPC送信元検証、エラーメッセージのサニタイズ | `aiworkflow-requirements: security-skill-ipc.md`            |
| API設計              | チャンネル定義、入出力型の統一性            | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| エラーハンドリング   | SkillExecutionErrorCode準拠                 | `aiworkflow-requirements: error-handling.md`                |
| Electronセキュリティ | Main Process実装、validateIpcSender使用     | `aiworkflow-requirements: security-api-electron.md`         |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                                        | 仕様参照先                    |
| -------------------- | ----------------------------------------------- | ----------------------------- |
| バックエンド（Main） | SkillExecutor.execute()呼び出し実装、型変換実装 | `architecture-*.md`           |
| IPC通信              | skill:execute ハンドラー修正、レスポンス形式    | `interfaces-*.md`, `api-*.md` |

---

## 成果物

| 成果物     | パス                                                   | 説明               |
| ---------- | ------------------------------------------------------ | ------------------ |
| 実装コード | `apps/desktop/src/main/ipc/skillHandlers.ts`           | 修正済みハンドラー |
| 実装コード | `apps/desktop/src/main/services/skill/SkillService.ts` | deprecation追加    |

## 完了条件

- [ ] すべてのPhase 4テストが成功状態（Green）
- [ ] SKILL_EXECUTEハンドラーがSkillExecutor.execute()を呼び出す
- [ ] params → SkillExecutionRequest の変換が実装されている
- [ ] Skill → SkillMetadata の変換が実装されている
- [ ] スキル存在確認とインポート確認が実装されている
- [ ] SkillService.executeSkill()にdeprecation注釈が追加されている
- [ ] 既存のabort/getStatusハンドラーが引き続き動作する
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test skillHandlers.execute

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
# - [ ] mockSkillExecutor.execute が呼ばれる
# - [ ] mockSkillService.executeSkill が呼ばれない
```

## 次のPhase

Phase 6: テスト拡充
