# Phase 2: 設計

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 2                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

`DefaultSafetyGate` クラスの内部設計、5種の `SafetyCheckId` 評価ロジック、Grade集約ルール、`skill:evaluate-safety` IPCハンドラの設計を確定する。

## 実行タスク

### Task 1: DefaultSafetyGate クラス設計

#### 1-1. クラス構造

```typescript
// apps/desktop/src/main/permissions/default-safety-gate.ts

import type {
  SafetyGatePort,
  SafetyGateResult,
  SafetyCheckDetail,
  SafetyCheckId,
  SafetyGrade,
} from "./safety-gate";
import type { ToolRiskLevel } from "../constants/security";
import type { PermissionStoreInterface } from "./permission-store-interface";

/**
 * スキルメタデータからツール情報を取得するためのインターフェース。
 * DefaultSafetyGate が直接 SkillService に依存しないように抽象化する。
 */
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
    // 2. 5種チェック実行（全チェック実行、途中打ち切りなし）
    // 3. overallGrade 算出
    // 4. SafetyGateResult 構築・返却
  }
}
```

#### 1-2. DI 設計

| 依存              | インターフェース           | 注入方式              | 根拠                    |
| ----------------- | -------------------------- | --------------------- | ----------------------- |
| PermissionStore   | `PermissionStoreInterface` | Constructor Injection | P34: 生成時点で利用可能 |
| SkillMetadata取得 | `SkillMetadataProvider`    | Constructor Injection | P34: 生成時点で利用可能 |
| 保護パス一覧      | `string[]`                 | Constructor Injection | 定数として注入          |

Constructor Injection を採用する根拠: SafetyGatePort は Task-08 の PublishService 生成時点で全ての依存が利用可能であるため（P34 参照）。

### Task 2: 5種 SafetyCheckId 評価ロジック設計

#### 2-1. チェック実行順序

チェックは以下の順序で実行する。全5チェックを常に実行し、途中で打ち切らない:

1. `CRITICAL_TOOL_REQUIRED`
2. `HIGH_TOOL_REQUIRED`
3. `NO_PERMANENT_APPROVAL`
4. `ALL_LOW_TOOLS`
5. `PROTECTED_PATH_ACCESS`

#### 2-2. 各チェックの擬似コード

```typescript
// チェック1: CRITICAL_TOOL_REQUIRED
private checkCriticalToolRequired(
  skillName: string,
  tools: SkillToolInfo[],
): SafetyCheckDetail {
  const criticalTool = tools.find(t => t.riskLevel === 'critical');
  if (criticalTool) {
    return {
      checkId: 'CRITICAL_TOOL_REQUIRED',
      toolName: criticalTool.name,
      riskLevel: 'critical',
      status: 'blocked',
      message: `スキル '${skillName}' はシステム破壊的な操作 '${criticalTool.name}' を要求します。公開できません。`,
    };
  }
  return {
    checkId: 'CRITICAL_TOOL_REQUIRED',
    toolName: '',
    riskLevel: 'low',
    status: 'passed',
    message: `スキル '${skillName}' には Critical リスクツールは含まれていません。`,
  };
}

// チェック2: HIGH_TOOL_REQUIRED
private checkHighToolRequired(
  skillName: string,
  tools: SkillToolInfo[],
): SafetyCheckDetail {
  const highTool = tools.find(t => t.riskLevel === 'high');
  if (highTool) {
    return {
      checkId: 'HIGH_TOOL_REQUIRED',
      toolName: highTool.name,
      riskLevel: 'high',
      status: 'warned',
      message: `スキル '${skillName}' は高リスク操作 '${highTool.name}' を要求します。公開時に利用者への警告が表示されます。`,
    };
  }
  return {
    checkId: 'HIGH_TOOL_REQUIRED',
    toolName: '',
    riskLevel: 'low',
    status: 'passed',
    message: `スキル '${skillName}' には High リスクツールは含まれていません。`,
  };
}

// チェック3: NO_PERMANENT_APPROVAL
private checkNoPermanentApproval(
  skillName: string,
  tools: SkillToolInfo[],
): SafetyCheckDetail {
  const allNotPermanent = tools.every(
    t => !this.permissionStore.isToolAllowed(t.name, skillName),
  );
  if (allNotPermanent && tools.length > 0) {
    return {
      checkId: 'NO_PERMANENT_APPROVAL',
      toolName: '',
      riskLevel: 'low',
      status: 'warned',
      message: `スキル '${skillName}' のツールは恒久許可されていません。「未検証」ラベルが付与されます。`,
    };
  }
  return {
    checkId: 'NO_PERMANENT_APPROVAL',
    toolName: '',
    riskLevel: 'low',
    status: 'passed',
    message: `スキル '${skillName}' のツールには恒久許可が付与されています。`,
  };
}

// チェック4: ALL_LOW_TOOLS
private checkAllLowTools(
  skillName: string,
  tools: SkillToolInfo[],
): SafetyCheckDetail {
  const allLow = tools.every(t => t.riskLevel === 'low');
  return {
    checkId: 'ALL_LOW_TOOLS',
    toolName: '',
    riskLevel: 'low',
    status: allLow ? 'passed' : 'passed', // ALL_LOW_TOOLS は情報提供のみ
    message: allLow
      ? `スキル '${skillName}' は低リスク操作のみを使用します。`
      : `スキル '${skillName}' には低リスク以外の操作が含まれています。`,
  };
}

// チェック5: PROTECTED_PATH_ACCESS
private checkProtectedPathAccess(
  skillName: string,
  tools: SkillToolInfo[],
  accessPaths: string[],
): SafetyCheckDetail {
  const writeTools = tools.filter(
    t => t.name === 'Write' || t.name === 'Edit',
  );
  if (writeTools.length > 0) {
    const matchedPath = accessPaths.find(p => this.matchesProtectedPaths(p));
    if (matchedPath) {
      return {
        checkId: 'PROTECTED_PATH_ACCESS',
        toolName: writeTools[0].name,
        riskLevel: 'critical',
        status: 'blocked',
        message: `スキル '${skillName}' は保護パス '${matchedPath}' への書き込みを要求します。公開できません。`,
      };
    }
  }
  return {
    checkId: 'PROTECTED_PATH_ACCESS',
    toolName: '',
    riskLevel: 'low',
    status: 'passed',
    message: `スキル '${skillName}' は保護パスへのアクセスを要求していません。`,
  };
}
```

#### 2-3. 保護パスマッチングロジック

```typescript
private matchesProtectedPaths(path: string): boolean {
  const normalizedPath = path.endsWith('/') ? path : path + '/';
  return this.protectedPaths.some(pp => {
    const normalizedPP = pp.endsWith('/') ? pp : pp + '/';
    return normalizedPath.startsWith(normalizedPP);
  });
}
```

保護パスの正規化: 末尾 `/` の有無を統一してから前方一致で比較する（設計契約 セクション3-1 準拠）。

### Task 3: Grade集約ロジック設計

```typescript
function calculateOverallGrade(details: SafetyCheckDetail[]): SafetyGrade {
  if (details.some((d) => d.status === "blocked")) return "UNSAFE";
  if (details.some((d) => d.status === "warned")) return "SAFE_WITH_WARNINGS";
  return "SAFE";
}
```

| 優先度    | 条件                             | 結果                 |
| --------- | -------------------------------- | -------------------- |
| 1（最高） | `details` に `blocked` が1件以上 | `UNSAFE`             |
| 2         | `details` に `warned` が1件以上  | `SAFE_WITH_WARNINGS` |
| 3（最低） | 全て `passed`                    | `SAFE`               |

### Task 4: IPC ハンドラ設計

#### 4-1. チャンネル定義

```typescript
// apps/desktop/src/preload/channels.ts に追加
export const IPC_CHANNELS = {
  // ... 既存チャンネル
  SKILL_EVALUATE_SAFETY: "skill:evaluate-safety",
} as const;
```

#### 4-2. ハンドラ実装設計

```typescript
// apps/desktop/src/main/ipc/handlers/safety-gate.ts

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

      // 送信元ウィンドウ検証
      validateIpcSender(event);

      return safetyGate.evaluate(skillName.trim());
    },
  );
}
```

#### 4-3. Preload API 設計

```typescript
// apps/desktop/src/preload/types.ts に追加
export interface SkillAPI {
  // ... 既存メソッド
  evaluateSafety(skillName: string): Promise<SafetyGateResult>;
}
```

#### 4-4. IPC セキュリティチェックリスト

| 項目                            | 対応状況                             |
| ------------------------------- | ------------------------------------ |
| チャンネル名は定数で管理（P27） | `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` |
| 送信元ウィンドウ検証            | `validateIpcSender(event)`           |
| 引数バリデーション（P42）       | 3段バリデーション実装                |
| エラーサニタイズ                | 内部エラーをサニタイズして返却       |

### Task 5: エラーハンドリング設計

| エラーケース         | エラーコード          | 挙動                                             |
| -------------------- | --------------------- | ------------------------------------------------ |
| スキルが存在しない   | `SKILL_NOT_FOUND`     | Promise を reject                                |
| 承認履歴が取得不能   | `HISTORY_UNAVAILABLE` | Promise を reject                                |
| ツール情報が不完全   | -                     | `deniedRatio=0.0`、`hasOnlyOncePerm=true` で続行 |
| バリデーションエラー | `VALIDATION_ERROR`    | IPC層で即座にreject                              |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                                        | 内容                                               |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | IPC セキュリティ原則                               |
| IPC設計                | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | ハンドラ登録パターン                               |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI・エラーハンドリング                             |
| スキル実行セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`             | ToolRiskLevel定義・PROTECTED_PATHS（保護パス基準） |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ・エラーコード体系                   |

### タスク固有参照

| 参照資料                      | パス                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| SafetyGate設計契約（Phase 2） | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-2/safety-gate-contract.md`           |
| SafetyGate型定義（Phase 5）   | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/safety-gate.ts`                    |
| デシジョンテーブル（Phase 4） | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md` |

## 実行手順

### ステップ1: DefaultSafetyGate クラス設計（Task 1）

1. クラス構造を定義する（`SafetyGatePort` を implements）
2. DI 設計を確定する（Constructor Injection、3つの依存）
3. `SkillMetadataProvider` インターフェースを定義する

### ステップ2: 5種 SafetyCheckId 評価ロジック設計（Task 2）

1. チェック実行順序を確定する（5チェック全実行、途中打ち切りなし）
2. 各チェックの擬似コードを記述する
3. 保護パスマッチングロジック（前方一致、末尾 `/` 正規化）を設計する

### ステップ3: Grade集約ロジック設計（Task 3）

1. `calculateOverallGrade()` の条件式を定義する
2. 優先度テーブル（blocked→UNSAFE、warned→SAFE_WITH_WARNINGS、全passed→SAFE）を記録する

### ステップ4: IPC ハンドラ設計（Task 4）

1. チャンネル定義（`IPC_CHANNELS.SKILL_EVALUATE_SAFETY`）を追加する
2. ハンドラ実装設計（P42準拠3段バリデーション、validateIpcSender）を記述する
3. Preload API 設計（`evaluateSafety(skillName: string)`）を記述する
4. IPC セキュリティチェックリストを作成する

### ステップ5: エラーハンドリング設計（Task 5）

1. エラーケース（SKILL_NOT_FOUND、HISTORY_UNAVAILABLE、VALIDATION_ERROR）を定義する
2. 各エラーの挙動を記述する

### ステップ6: バリデーション実行

1. `pnpm --filter @repo/desktop typecheck` で型整合を確認する

### 設計レーン定義

| レーン               | 責務                                                    | 対象ファイル                                |
| -------------------- | ------------------------------------------------------- | ------------------------------------------- |
| Lane 1: 評価エンジン | DefaultSafetyGate クラス本体（5種チェック + Grade集約） | `default-safety-gate.ts`                    |
| Lane 2: IPC ブリッジ | IPC ハンドラ + Preload API                              | `safety-gate.ts`, `channels.ts`, `types.ts` |
| Lane 3: テスト基盤   | モック構造 + テストケース                               | `*.test.ts`                                 |

### バリデーションマトリックス

| 検証コマンド                                              | 対象           | 期待結果   |
| --------------------------------------------------------- | -------------- | ---------- |
| `pnpm --filter @repo/desktop typecheck`                   | 全ファイル     | エラー 0件 |
| `pnpm --filter @repo/desktop lint`                        | 全ファイル     | エラー 0件 |
| `pnpm --filter @repo/desktop test src/main/permissions/`  | テストファイル | 全PASS     |
| `pnpm --filter @repo/desktop test src/main/ipc/handlers/` | テストファイル | 全PASS     |

## 統合テスト連携

- `DefaultSafetyGate` は `SafetyGatePort` インターフェースを実装するため、Task-08 のテストで `MockSafetyGate` と差し替え可能
- IPC ハンドラテストでは `safetyGate.evaluate` をモック化し、IPC 層の責務のみを検証する

## 多角的チェック観点

| 観点           | 確認項目                                                   | 仕様参照先                |
| -------------- | ---------------------------------------------------------- | ------------------------- |
| セキュリティ   | IPC引数バリデーション（P42）、送信元検証、エラーサニタイズ | `04-electron-security.md` |
| アーキテクチャ | DI境界（Portインターフェース）、レイヤー依存方向           | `01-architecture.md`      |
| テスト容易性   | モック注入パターン、テスト間状態リーク防止（P9）           | `02-code-quality.md`      |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. DefaultSafetyGate クラス構造と DI 設計の確定
2. 5種 SafetyCheckId 評価ロジックの擬似コード作成
3. Grade集約ロジックの条件式定義
4. IPC ハンドラ設計（チャンネル定義・バリデーション・セキュリティチェックリスト）
5. エラーハンドリング設計（全ケース網羅）
6. 成果物の作成・配置
7. 完了条件の検証

## 成果物

| 成果物                   | パス                                       | 説明                                                    |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------- |
| クラス設計書             | `outputs/phase-2/class-design.md`          | DefaultSafetyGate クラス構造・DI設計・5種評価ロジック   |
| IPC設計書                | `outputs/phase-2/ipc-design.md`            | チャンネル定義・ハンドラ設計・Preload API・セキュリティ |
| エラーハンドリング設計書 | `outputs/phase-2/error-handling-design.md` | エラーケース4種・各エラーの挙動定義                     |

## 完了条件

- [ ] DefaultSafetyGate のクラス構造が確定している（`SafetyGatePort` を implements した具象クラスが定義されている）
- [ ] 5種の SafetyCheckId 評価ロジックの擬似コードが全チェック（CRITICAL_TOOL_REQUIRED/HIGH_TOOL_REQUIRED/NO_PERMANENT_APPROVAL/ALL_LOW_TOOLS/PROTECTED_PATH_ACCESS）について記載されている
- [ ] Grade 集約ルールが条件式で定義されている（blocked→UNSAFE、warned→SAFE_WITH_WARNINGS、全passed→SAFE の優先度順）
- [ ] IPC ハンドラの設計（チャンネル名・P42準拠3段バリデーション・validateIpcSender）が確定している
- [ ] DI 設計（Constructor Injection、3つの依存）が明記されている
- [ ] エラーハンドリング方針が4ケース（SKILL_NOT_FOUND/HISTORY_UNAVAILABLE/VALIDATION_ERROR/ツール情報不完全）すべて網羅されている
- [ ] 保護パスマッチングロジック（末尾 `/` 正規化・前方一致比較）が定義されている
- [ ] 設計レーン定義（Lane 1-3）が記載されている
- [ ] バリデーションマトリックスの全4コマンドが定義されている

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 2
```

## 次Phase

Phase 3: 設計レビュー → `phase-3-design-review.md`
