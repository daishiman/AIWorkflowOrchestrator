# Phase 5: 実装

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 5                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

Phase 4 で作成した RED 状態のテストを GREEN に転換させるため、`DefaultSafetyGate` クラス、`skill:evaluate-safety` IPC ハンドラ、関連する定数・型定義を実装する。

## 実行タスク

- タスク0: `.claude` 正本更新の要否確認と更新実施
- タスク1: `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` 定数を `channels.ts` に追加
- タスク2: `SafetyGateResult` 等の型を `preload/types.ts` に追加
- タスク3: `DefaultSafetyGate` クラスの実装（5種チェック + Grade集約）
- タスク4: `skill:evaluate-safety` IPC ハンドラの実装
- タスク5: ハンドラ登録の組み込み（ハンドラ登録ファイルへの追加）
- タスク6: テスト GREEN 確認

## 参照資料

| 資料名                | パス                                                                                                               | 説明                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Phase 2 設計          | `docs/30-workflows/safety-gate-implementation/phase-2-design.md`                                                   | 擬似コード・DI設計・型定義      |
| Phase 4 テスト        | `apps/desktop/src/main/permissions/default-safety-gate.test.ts`                                                    | RED テスト（実装の目標）        |
| Phase 4 テスト（IPC） | `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`                                                           | IPC ハンドラ RED テスト         |
| SafetyGate 型定義     | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/safety-gate.ts` | SafetyGatePort インターフェース |
| channels.ts           | `apps/desktop/src/preload/channels.ts`                                                                             | IPC チャンネル定数              |
| preload/types.ts      | `apps/desktop/src/preload/types.ts`                                                                                | Preload 型定義                  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                                        | 内容                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| IPC設計                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | ハンドラ登録パターン                                 |
| セキュリティ原則（IPC） | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | validateIpcSender 使用方法                           |
| 実装パターン            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン・Constructor Injection                   |
| エラーハンドリング      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーコード体系                                     |
| スキル実行セキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`             | ToolRiskLevel定義・PROTECTED_PATHS（実装時の参照値） |

## 実行手順

### ステップ0: `.claude` 正本更新（Phase 5 必須）

**phase-template-execution.md 要件**: Phase 5 は `.claude` 正本を先に更新する。

本タスクでは SafetyGate に関連する IPC 設計・Preload API 型が新規追加される。実装前に以下を確認し、必要に応じて更新する:

```bash
# SafetyGatePort に関連する仕様書を確認
grep -rn "SafetyGate\|evaluate-safety" .claude/skills/aiworkflow-requirements/references/ | grep -v ".test."
```

**更新対象の判定**:

| 更新対象仕様書                     | 更新内容                                     | 必要性                             |
| ---------------------------------- | -------------------------------------------- | ---------------------------------- |
| `api-ipc-system.md`                | `skill:evaluate-safety` チャンネルの追加記録 | 新規 IPC チャンネル追加のため必要  |
| `interfaces-agent-sdk-skill.md` 等 | SafetyGateResult 型の追加記録                | 新規インターフェース追加のため必要 |

更新が不要な場合（既に仕様書に記載済みの場合）は「更新不要：既存記録確認済み」とステップ0の成果物に記録する。

### ステップ1: IPC チャンネル定数の追加（タスク1）

**ファイル**: `apps/desktop/src/preload/channels.ts`

既存の `IPC_CHANNELS` オブジェクトに以下を追加する:

```typescript
export const IPC_CHANNELS = {
  // ... 既存チャンネル
  SKILL_EVALUATE_SAFETY: "skill:evaluate-safety",
} as const;
```

**P27確認**: 文字列リテラルではなく定数参照であることを確認する:

```bash
grep -rn "skill:evaluate-safety" apps/desktop/src/ | grep -v "channels.ts"
# → 結果が0件であること（定数以外で文字列が使われていないこと）
```

### ステップ2: Preload 型定義の追加（タスク2）

**ファイル**: `apps/desktop/src/preload/types.ts`

```typescript
// SafetyGate 関連型（SkillAPI インターフェースに追加）
export interface SkillAPI {
  // ... 既存メソッド
  evaluateSafety(skillName: string): Promise<SafetyGateResult>;
}

// SafetyGateResult 型（既存の SafetyGate 型定義から参照、または再定義）
export interface SafetyGateResult {
  skillName: string;
  overallGrade: "SAFE" | "SAFE_WITH_WARNINGS" | "UNSAFE";
  details: SafetyCheckDetail[];
  evaluatedAt: number;
}

export interface SafetyCheckDetail {
  checkId: SafetyCheckId;
  toolName: string;
  riskLevel: ToolRiskLevel;
  status: "passed" | "warned" | "blocked";
  message: string;
}

export type SafetyCheckId =
  | "CRITICAL_TOOL_REQUIRED"
  | "HIGH_TOOL_REQUIRED"
  | "NO_PERMANENT_APPROVAL"
  | "ALL_LOW_TOOLS"
  | "PROTECTED_PATH_ACCESS";
```

**P32確認**: `packages/shared/src` に共有型定義がある場合は、そちらから import して二重定義を避ける。

### ステップ3: DefaultSafetyGate クラスの実装（タスク3）

**ファイル**: `apps/desktop/src/main/permissions/default-safety-gate.ts`（新規作成）

Phase 2 の擬似コードを実装コードに変換する:

```typescript
import type {
  SafetyGatePort,
  SafetyGateResult,
  SafetyCheckDetail,
  SafetyGrade,
} from "./safety-gate";
import type { ToolRiskLevel } from "../constants/security";
import type { PermissionStoreInterface } from "./permission-store-interface";

interface SkillToolInfo {
  name: string;
  riskLevel: ToolRiskLevel;
}

interface SkillMetadataProvider {
  getRequiredTools(skillName: string): Promise<SkillToolInfo[]>;
  getAccessPaths(skillName: string): Promise<string[]>;
}

export class DefaultSafetyGate implements SafetyGatePort {
  constructor(
    private readonly permissionStore: PermissionStoreInterface,
    private readonly skillMetadataProvider: SkillMetadataProvider,
    private readonly protectedPaths: string[],
  ) {}

  async evaluate(skillName: string): Promise<SafetyGateResult> {
    // 1. スキルメタデータ取得
    const tools = await this.skillMetadataProvider.getRequiredTools(skillName);
    const accessPaths =
      await this.skillMetadataProvider.getAccessPaths(skillName);

    // 2. 全5チェック実行（途中打ち切りなし）
    const details: SafetyCheckDetail[] = [
      this.checkCriticalToolRequired(skillName, tools),
      this.checkHighToolRequired(skillName, tools),
      this.checkNoPermanentApproval(skillName, tools),
      this.checkAllLowTools(skillName, tools),
      this.checkProtectedPathAccess(skillName, tools, accessPaths),
    ];

    // 3. overallGrade 算出
    const overallGrade = this.calculateOverallGrade(details);

    // 4. SafetyGateResult 構築・返却
    return {
      skillName,
      overallGrade,
      details,
      evaluatedAt: Date.now(),
    };
  }

  // チェック1: CRITICAL_TOOL_REQUIRED
  private checkCriticalToolRequired(
    skillName: string,
    tools: SkillToolInfo[],
  ): SafetyCheckDetail {
    /* Phase 2 擬似コード参照 */
  }

  // チェック2: HIGH_TOOL_REQUIRED
  private checkHighToolRequired(
    skillName: string,
    tools: SkillToolInfo[],
  ): SafetyCheckDetail {
    /* Phase 2 擬似コード参照 */
  }

  // チェック3: NO_PERMANENT_APPROVAL
  private checkNoPermanentApproval(
    skillName: string,
    tools: SkillToolInfo[],
  ): SafetyCheckDetail {
    /* Phase 2 擬似コード参照 */
  }

  // チェック4: ALL_LOW_TOOLS
  private checkAllLowTools(
    skillName: string,
    tools: SkillToolInfo[],
  ): SafetyCheckDetail {
    /* Phase 2 擬似コード参照 */
  }

  // チェック5: PROTECTED_PATH_ACCESS
  private checkProtectedPathAccess(
    skillName: string,
    tools: SkillToolInfo[],
    accessPaths: string[],
  ): SafetyCheckDetail {
    /* Phase 2 擬似コード参照 */
  }

  // 保護パスマッチングロジック（末尾スラッシュ正規化 + 前方一致）
  private matchesProtectedPaths(path: string): boolean {
    /* Phase 2 擬似コード参照 */
  }

  // Grade 集約ロジック
  private calculateOverallGrade(details: SafetyCheckDetail[]): SafetyGrade {
    if (details.some((d) => d.status === "blocked")) return "UNSAFE";
    if (details.some((d) => d.status === "warned")) return "SAFE_WITH_WARNINGS";
    return "SAFE";
  }
}
```

**実装時の注意事項**:

| Pitfall | 内容                           | 対策                                |
| ------- | ------------------------------ | ----------------------------------- |
| P34     | Constructor Injection の妥当性 | 全依存を constructor で受け取ること |
| P5      | リスナー二重登録               | IPC ハンドラは一度のみ登録すること  |

### ステップ4: IPC ハンドラの実装（タスク4）

**ファイル**: `apps/desktop/src/main/ipc/handlers/safety-gate.ts`（新規作成）

```typescript
import { ipcMain } from "electron";
import type { SafetyGatePort } from "../../permissions/safety-gate";
import { IPC_CHANNELS } from "../../../preload/channels";
import { validateIpcSender } from "../../utils/validate-ipc-sender";

export function registerSafetyGateHandlers(safetyGate: SafetyGatePort): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_EVALUATE_SAFETY,
    async (event, skillName: string) => {
      // P42 準拠3段バリデーション
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

      // 送信元ウィンドウ検証（P27 チャンネル名定数管理済み）
      validateIpcSender(event);

      return safetyGate.evaluate(skillName.trim());
    },
  );
}
```

**P42確認**: 3段バリデーションが揃っていること（typeof → 空文字列 → trim空文字列）。

### ステップ5: ハンドラ登録への組み込み（タスク5）

既存のハンドラ登録ファイルを特定して、`registerSafetyGateHandlers` を追加する:

```bash
# ハンドラ登録ファイルを特定
grep -rn "registerAllIpcHandlers\|ipc/handlers" apps/desktop/src/main/ | grep -v ".test.ts" | head -10
```

特定したファイルに `registerSafetyGateHandlers(safetyGate)` の呼び出しを追加する。

**P5確認**: `ipcMain.handle()` への同一チャンネルの二重登録を防ぐため、ハンドラ登録が一度のみ行われることを確認する。

### ステップ6: テスト GREEN 確認（タスク6）

```bash
# DefaultSafetyGate のテストが全て GREEN であることを確認
cd apps/desktop && pnpm vitest run src/main/permissions/default-safety-gate.test.ts

# IPC ハンドラのテストが全て GREEN であることを確認
cd apps/desktop && pnpm vitest run src/main/ipc/handlers/safety-gate.test.ts

# 既存テストが破壊されていないことを確認（AC-12相当）
cd apps/desktop && pnpm vitest run src/main/permissions/
cd apps/desktop && pnpm vitest run src/main/ipc/handlers/
```

## 統合テスト連携【必須】

DefaultSafetyGate と IPC ハンドラ間の接続を確立し、統合テスト観点での動作を検証する。

| 統合ポイント                     | 実装内容                                               | 検証方法                                 |
| -------------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| IPC → DefaultSafetyGate          | IPC ハンドラが `safetyGate.evaluate()` を呼ぶ          | モック検証 + 引数検証（trim後の値）      |
| DefaultSafetyGate → PermStore    | `isToolAllowed()` 呼び出し                             | モック検証 + 戻り値（boolean）の影響確認 |
| DefaultSafetyGate → MetaProvider | `getRequiredTools()` / `getAccessPaths()` 呼び出し     | モック検証 + 返却値の加工確認            |
| Grade 集約ルール                 | blocked/warned/passed → UNSAFE/SAFE_WITH_WARNINGS/SAFE | `calculateOverallGrade` の出力検証       |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                                         | 仕様参照先                                                         |
| -------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| セキュリティ   | P42 準拠の IPC バリデーション実装が必要          | `aiworkflow-requirements: architecture-auth-security.md`           |
| アーキテクチャ | DI 境界（SafetyGatePort インターフェース）を維持 | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| IPC 契約       | チャンネル名は IPC_CHANNELS 定数で管理           | `.claude/rules/04-electron-security.md`                            |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                             | 仕様参照先                                                         |
| -------------------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| バックエンド（Main） | DefaultSafetyGate の Constructor Injection で実装    | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| IPC通信              | `skill:evaluate-safety` ハンドラの Main Process 実装 | `aiworkflow-requirements: api-ipc-system.md`                       |
| Preload              | `evaluateSafety()` の型定義追加                      | `aiworkflow-requirements: architecture-auth-security.md`           |

**既知の落とし穴チェック**:

| Pitfall | 内容                       | 対策                                                      |
| ------- | -------------------------- | --------------------------------------------------------- |
| P5      | リスナー二重登録           | ハンドラ登録が一度のみ実行されることを確認                |
| P27     | ハードコード文字列         | `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` 定数で参照           |
| P42     | .trim() バリデーション漏れ | 3段バリデーション（typeof → 空文字 → trim空文字）を確認   |
| P44     | IPC インターフェース不整合 | ハンドラ引数（string）と Preload 呼び出し形式の一致を確認 |
| P45     | IPC 引数命名の契約ドリフト | 引数名 `skillName` でセマンティクスを統一                 |

## 成果物

| 成果物                 | パス                                                       | 説明                           |
| ---------------------- | ---------------------------------------------------------- | ------------------------------ |
| DefaultSafetyGate 実装 | `apps/desktop/src/main/permissions/default-safety-gate.ts` | SafetyGatePort の具象クラス    |
| IPC ハンドラ実装       | `apps/desktop/src/main/ipc/handlers/safety-gate.ts`        | skill:evaluate-safety ハンドラ |
| チャンネル定数追加     | `apps/desktop/src/preload/channels.ts`（追加分）           | SKILL_EVALUATE_SAFETY 定数     |
| Preload 型定義追加     | `apps/desktop/src/preload/types.ts`（追加分）              | evaluateSafety メソッド型      |
| GREEN 確認ログ         | `outputs/phase-5/green-state-confirmation.md`              | テスト GREEN 確認結果          |

## 完了条件

- [ ] ステップ0: `.claude` 正本更新の要否を確認し、必要な仕様書が更新（または更新不要と記録）されている
- [ ] `apps/desktop/src/main/permissions/default-safety-gate.ts` が作成されている
- [ ] `apps/desktop/src/main/ipc/handlers/safety-gate.ts` が作成されている
- [ ] `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` が `channels.ts` に追加されている
- [ ] `evaluateSafety()` の型が `preload/types.ts` に追加されている
- [ ] 5種チェック（CRITICAL_TOOL_REQUIRED / HIGH_TOOL_REQUIRED / NO_PERMANENT_APPROVAL / ALL_LOW_TOOLS / PROTECTED_PATH_ACCESS）が全て実装されている
- [ ] Grade 集約ロジック（blocked優先 → warned → passed）が実装されている
- [ ] 保護パスマッチングロジック（末尾スラッシュ正規化 + 前方一致）が実装されている
- [ ] P42 準拠: IPC ハンドラで3段バリデーションが実装されている
- [ ] P27 準拠: チャンネル名が定数で管理されている（文字列リテラル不使用）
- [ ] P5 準拠: ハンドラ登録が一度のみ行われている
- [ ] Phase 4 のテストが全て GREEN（PASS）になっている
- [ ] 既存テストが全て PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. `.claude` 正本更新の要否確認（タスク0）
2. 参照資料の確認（Phase 2 設計書 + システム仕様）
3. IPC チャンネル定数追加（タスク1）
4. Preload 型定義追加（タスク2）
5. DefaultSafetyGate クラス実装（タスク3）
6. IPC ハンドラ実装（タスク4）
7. ハンドラ登録への組み込み（タスク5）
8. テスト GREEN 確認（タスク6）
9. 成果物の作成・配置
10. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 5
```

## 次のPhase

Phase 6: テスト拡充 - カバレッジ不足箇所のテストを追加する。
