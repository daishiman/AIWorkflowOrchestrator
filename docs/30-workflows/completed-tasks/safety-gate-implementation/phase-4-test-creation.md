# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 4                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

`DefaultSafetyGate.evaluate()` の Grade 判定ロジック、5種 SafetyCheckId の評価、および `skill:evaluate-safety` IPC ハンドラの引数バリデーションに対するテストケースをテストファーストで設計・作成する。Phase 5 の実装前にテストが RED 状態であることを確認し、TDD サイクルの起点とする。

## 実行タスク

- タスク1: DefaultSafetyGate のユニットテスト作成（5種チェック + Grade集約）
- タスク2: IPC ハンドラのユニットテスト作成（バリデーション + 送信元検証）
- タスク3: モック構造の設計
- タスク4: 既存テストの PASS 確認
- タスク5: RED 状態の確認

## 参照資料

| 資料名             | パス                                                                                                                                  | 説明                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 2 設計       | `docs/30-workflows/safety-gate-implementation/phase-2-design.md`                                                                      | 擬似コード・DI設計       |
| Phase 3 レビュー   | `docs/30-workflows/safety-gate-implementation/phase-3-design-review.md`                                                               | レビュー結果・MINOR指摘  |
| SafetyGate型定義   | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/safety-gate.ts`                    | SafetyGatePort・型定義   |
| デシジョンテーブル | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md` | リスクレベル判定テーブル |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                | パス                                                                                        | 内容                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| コンポーネントテスト    | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テスト設計パターン                                                |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ基準・TDD方針                                           |
| セキュリティ原則（IPC） | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | IPC セキュリティ原則（validateIpcSender等）                       |
| 実装パターン            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン・モック設計                                           |
| エラーハンドリング      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーコード体系（VALIDATION_ERROR等）                            |
| スキル実行セキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`             | ToolRiskLevel値（critical/high/medium/low）・テストデータ設計基準 |

## 実行手順

### ステップ0: テスト環境の確認

```bash
# 既存テストが全て PASS することを確認（P40準拠: 対象パッケージディレクトリから実行）
cd apps/desktop && pnpm vitest run src/main/permissions/
cd apps/desktop && pnpm vitest run src/main/ipc/handlers/
```

### ステップ0.5: テスト対象ファイルの import 副作用チェック（Phase 4 必須）

テスト対象ファイル（`default-safety-gate.ts`, `safety-gate.ts`）を import した際にトップレベル副作用が実行されないか確認する:

```bash
grep -n "^[^/]*\(app\.\|server\.\|connect\|initialize\|ipcMain\.\|BrowserWindow\)" apps/desktop/src/main/permissions/default-safety-gate.ts
grep -n "^[^/]*\(app\.\|server\.\|connect\|initialize\|ipcMain\.\|BrowserWindow\)" apps/desktop/src/main/ipc/handlers/safety-gate.ts
```

副作用が検出された場合:

1. vi.mock で副作用モジュールをモック化する（副作用が少数の場合）
2. Phase 5 でファイル分離を先行実施する（副作用が広範囲の場合）

### ステップ1: テストファイルの作成

**テストファイル（2件、新規作成）**:

- `apps/desktop/src/main/permissions/default-safety-gate.test.ts`
- `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`

### ステップ2: モック構造の設計（タスク3）

Phase 2 設計の Constructor Injection に基づき、以下のモック構造を定義する:

```typescript
// PermissionStoreInterface モック
const mockPermissionStore = {
  isToolAllowed: vi.fn<(toolName: string, skillName: string) => boolean>(),
};

// SkillMetadataProvider モック
const mockSkillMetadataProvider = {
  getRequiredTools: vi.fn<(skillName: string) => Promise<SkillToolInfo[]>>(),
  getAccessPaths: vi.fn<(skillName: string) => Promise<string[]>>(),
};

// 保護パス（テスト用固定値）
const TEST_PROTECTED_PATHS = ["/etc", "/System", "/private"];
```

**P9注意**: `beforeEach` でモックをリセットし、テスト間で状態が共有されないようにする:

```typescript
beforeEach(() => {
  vi.resetAllMocks();
});
```

### ステップ3: DefaultSafetyGate テストケース実装（タスク1）

#### テストケース一覧

##### 3-1. CRITICAL_TOOL_REQUIRED チェック

| #   | テストケース                                        | 期待結果                                                   |
| --- | --------------------------------------------------- | ---------------------------------------------------------- |
| C-1 | criticalリスクツールが1件以上ある場合               | `status: "blocked"`, `checkId: "CRITICAL_TOOL_REQUIRED"`   |
| C-2 | criticalリスクツールが0件の場合                     | `status: "passed"`, `checkId: "CRITICAL_TOOL_REQUIRED"`    |
| C-3 | criticalリスクツールが複数ある場合（最初の1件のみ） | `status: "blocked"`, `toolName` は最初に見つかったツール名 |

##### 3-2. HIGH_TOOL_REQUIRED チェック

| #   | テストケース                                      | 期待結果                                            |
| --- | ------------------------------------------------- | --------------------------------------------------- |
| H-1 | highリスクツールが1件以上ある場合（criticalなし） | `status: "warned"`, `checkId: "HIGH_TOOL_REQUIRED"` |
| H-2 | highリスクツールが0件の場合                       | `status: "passed"`, `checkId: "HIGH_TOOL_REQUIRED"` |

##### 3-3. NO_PERMANENT_APPROVAL チェック

| #   | テストケース                                    | 期待結果                                               |
| --- | ----------------------------------------------- | ------------------------------------------------------ |
| N-1 | ツールが1件以上あり全て恒久許可されていない場合 | `status: "warned"`, `checkId: "NO_PERMANENT_APPROVAL"` |
| N-2 | 少なくとも1件が恒久許可されている場合           | `status: "passed"`, `checkId: "NO_PERMANENT_APPROVAL"` |
| N-3 | ツールが0件の場合                               | `status: "passed"`, `checkId: "NO_PERMANENT_APPROVAL"` |

##### 3-4. ALL_LOW_TOOLS チェック

| #   | テストケース                             | 期待結果                                                                                                  |
| --- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| L-1 | 全ツールがlowリスクの場合                | `status: "passed"`, `checkId: "ALL_LOW_TOOLS"`, message に low リスクのみを示すメッセージ                 |
| L-2 | 1件でもlow以外のリスクのツールがある場合 | `status: "passed"`, `checkId: "ALL_LOW_TOOLS"`, message に low 以外のツールが含まれることを示すメッセージ |

##### 3-5. PROTECTED_PATH_ACCESS チェック

| #   | テストケース                                                  | 期待結果                                                |
| --- | ------------------------------------------------------------- | ------------------------------------------------------- |
| P-1 | Write ツールがあり保護パス配下へのアクセスパスがある場合      | `status: "blocked"`, `checkId: "PROTECTED_PATH_ACCESS"` |
| P-2 | Edit ツールがあり保護パス配下へのアクセスパスがある場合       | `status: "blocked"`, `checkId: "PROTECTED_PATH_ACCESS"` |
| P-3 | Write/Edit ツールがあり保護パス外のみのアクセスパスがある場合 | `status: "passed"`, `checkId: "PROTECTED_PATH_ACCESS"`  |
| P-4 | Write/Edit ツールがなく保護パスへのアクセスパスがある場合     | `status: "passed"`, `checkId: "PROTECTED_PATH_ACCESS"`  |
| P-5 | 保護パスが空配列（`[]`）の場合                                | `status: "passed"`, `checkId: "PROTECTED_PATH_ACCESS"`  |

##### 3-6. Grade 集約ロジック

| #   | テストケース                                           | 期待 overallGrade          |
| --- | ------------------------------------------------------ | -------------------------- |
| G-1 | details に `blocked` が1件以上ある場合                 | `"UNSAFE"`                 |
| G-2 | details に `blocked` がなく `warned` が1件以上ある場合 | `"SAFE_WITH_WARNINGS"`     |
| G-3 | details が全て `passed` の場合                         | `"SAFE"`                   |
| G-4 | details に `blocked` と `warned` が混在する場合        | `"UNSAFE"` （blocked優先） |

##### 3-7. SafetyGateResult 構造

| #   | テストケース                                      | 期待結果                                                         |
| --- | ------------------------------------------------- | ---------------------------------------------------------------- |
| R-1 | evaluate() の戻り値に必須フィールドが全て含まれる | `skillName`, `overallGrade`, `details`, `evaluatedAt` が存在する |
| R-2 | details の要素数が常に5件である                   | `result.details.length === 5`                                    |
| R-3 | skillName が入力値と一致する                      | `result.skillName === "test-skill"`                              |
| R-4 | evaluatedAt が呼び出し時点のタイムスタンプ以下    | `result.evaluatedAt <= Date.now()`                               |

##### 3-8. エラーケース

| #    | テストケース                                    | 期待結果                                                      |
| ---- | ----------------------------------------------- | ------------------------------------------------------------- |
| ER-1 | スキルが存在しない場合（SKILL_NOT_FOUND）       | Promise が `{ code: "SKILL_NOT_FOUND" }` で reject される     |
| ER-2 | 承認履歴が取得不能の場合（HISTORY_UNAVAILABLE） | Promise が `{ code: "HISTORY_UNAVAILABLE" }` で reject される |

#### テストコード骨格（default-safety-gate.test.ts）

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DefaultSafetyGate } from "./default-safety-gate";

describe("DefaultSafetyGate", () => {
  let gate: DefaultSafetyGate;

  beforeEach(() => {
    vi.resetAllMocks();
    // モック再構築
    gate = new DefaultSafetyGate(
      mockPermissionStore,
      mockSkillMetadataProvider,
      TEST_PROTECTED_PATHS,
    );
  });

  describe("CRITICAL_TOOL_REQUIRED チェック", () => {
    it("criticalリスクツールが1件以上ある場合はblocked", async () => {
      mockSkillMetadataProvider.getRequiredTools.mockResolvedValue([
        { name: "BashExecutor", riskLevel: "critical" },
      ]);
      mockSkillMetadataProvider.getAccessPaths.mockResolvedValue([]);

      const result = await gate.evaluate("test-skill");

      const check = result.details.find(
        (d) => d.checkId === "CRITICAL_TOOL_REQUIRED",
      );
      expect(check?.status).toBe("blocked");
    });
  });

  // 他のテストケース...
});
```

### ステップ4: IPC ハンドラ テストケース実装（タスク2）

#### テストケース一覧

| #   | テストケース                                              | 期待結果                                                 |
| --- | --------------------------------------------------------- | -------------------------------------------------------- |
| I-1 | skillName が string 以外（number）の場合                  | `{ code: "VALIDATION_ERROR" }` で reject される          |
| I-2 | skillName が空文字列の場合                                | `{ code: "VALIDATION_ERROR" }` で reject される          |
| I-3 | skillName がスペースのみの場合（`"   "`）                 | `{ code: "VALIDATION_ERROR" }` で reject される          |
| I-4 | skillName が前後スペース付き文字列（`"  skill  "`）の場合 | `safetyGate.evaluate("skill")` が呼ばれる（trim後の値）  |
| I-5 | 正常な skillName の場合                                   | `safetyGate.evaluate(skillName)` が1回呼ばれ、結果が返る |
| I-6 | validateIpcSender が送信元検証を行うことを確認            | validateIpcSender が正常リクエストで呼ばれる             |
| I-7 | safetyGate.evaluate が SKILL_NOT_FOUND を reject した場合 | IPC ハンドラが同エラーをそのまま throw する              |

#### テストコード骨格（safety-gate.test.ts）

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerSafetyGateHandlers } from "./safety-gate";
import { ipcMain } from "electron";

describe("registerSafetyGateHandlers", () => {
  const mockSafetyGate = {
    evaluate: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // ipcMain.handle モックを設定
  });

  describe("P42準拠3段バリデーション", () => {
    it("skillName が空文字列の場合は VALIDATION_ERROR", async () => {
      // ...
    });

    it("skillName がスペースのみの場合は VALIDATION_ERROR", async () => {
      // ...
    });
  });
});
```

### ステップ5: RED 状態の確認（タスク5）

全テストが RED 状態（FAIL）であることを確認する。Phase 5 の実装により GREEN に転換させる。

```bash
# RED 状態確認（実装前なのでファイルが存在せず FAIL が期待値）
cd apps/desktop && pnpm vitest run src/main/permissions/default-safety-gate.test.ts 2>&1 | tail -20
cd apps/desktop && pnpm vitest run src/main/ipc/handlers/safety-gate.test.ts 2>&1 | tail -20
```

## 統合テスト連携【必須】

DefaultSafetyGate と IPC ハンドラ間の統合テストシナリオを設計する。

| 統合テストシナリオ             | テストケース                                      | 検証ポイント                                      |
| ------------------------------ | ------------------------------------------------- | ------------------------------------------------- |
| critical → UNSAFE 統合         | IPC 経由で criticalツールを持つスキルを評価       | overallGrade が UNSAFE になること                 |
| high → SAFE_WITH_WARNINGS 統合 | IPC 経由で highツールのみを持つスキルを評価       | overallGrade が SAFE_WITH_WARNINGS になること     |
| 保護パス blocked 統合          | IPC 経由で保護パスへのWrite要求があるスキルを評価 | overallGrade が UNSAFE になること                 |
| DI 差し替え可能性              | MockSafetyGate で IPC ハンドラを動作確認          | SafetyGatePort インターフェースでの差し替えが可能 |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                              | 仕様参照先                                                         |
| -------------- | ------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ   | IPC バリデーション（P42）テストが必要 | `aiworkflow-requirements: architecture-auth-security.md`           |
| アーキテクチャ | DI モック注入パターンを確認           | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| テスト設計     | P9/P41 準拠のテスト設計が必要         | `.claude/rules/06-known-pitfalls.md`                               |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                              | 仕様参照先                                               |
| -------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| バックエンド（Main） | DefaultSafetyGate の全 checkId に対するユニットテスト | `aiworkflow-requirements: quality-requirements.md`       |
| IPC通信              | IPC 引数バリデーションの P42 準拠テスト               | `aiworkflow-requirements: architecture-auth-security.md` |

**テスト環境の注意事項**:

| Pitfall | 内容                                   | 対策                                                       |
| ------- | -------------------------------------- | ---------------------------------------------------------- |
| P9      | モジュールスコープ変数のテスト間リーク | `beforeEach` で全モックを `vi.resetAllMocks()` でリセット  |
| P40     | テスト実行ディレクトリ依存（モノレポ） | `cd apps/desktop` してから実行                             |
| P41     | v8 カバレッジのインライン関数カウント  | `isToolAllowed` 等のコールバック実行を明示的にテストで検証 |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. テスト環境の確認（既存テスト PASS）
2. モック構造の設計（タスク3）
3. DefaultSafetyGate テスト作成（タスク1: checkId別）
4. IPC ハンドラ テスト作成（タスク2: バリデーション）
5. RED 状態の確認（タスク5）
6. 成果物の作成・配置
7. 完了条件の検証

## 成果物

| 成果物                   | パス                                                            | 説明                     |
| ------------------------ | --------------------------------------------------------------- | ------------------------ |
| DefaultSafetyGate テスト | `apps/desktop/src/main/permissions/default-safety-gate.test.ts` | 新規テストファイル       |
| IPC ハンドラ テスト      | `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        | 新規テストファイル       |
| RED 状態確認ログ         | `outputs/phase-4/red-state-confirmation.md`                     | RED 状態の確認結果       |
| 既存テスト PASS ログ     | `outputs/phase-4/existing-tests-pass.md`                        | 既存テスト PASS 確認結果 |

## 完了条件

- [ ] `default-safety-gate.test.ts` が作成されている
- [ ] `safety-gate.test.ts` が作成されている
- [ ] タスク1（C-1〜C-3, H-1〜H-2, N-1〜N-3, L-1〜L-2, P-1〜P-5, G-1〜G-4, R-1〜R-4, ER-1〜ER-2）の全テストケースが実装されている
- [ ] タスク2（I-1〜I-7）の全テストケースが実装されている
- [ ] テスト間で状態を共有していない（P9 準拠: `beforeEach` で `vi.resetAllMocks()` を呼び出し）
- [ ] テストが `cd apps/desktop` から実行可能（P40 準拠）
- [ ] P41 対策: `isToolAllowed` / `find` / `every` / `some` 等のインライン関数コールバックを明示的に実行するテストが含まれている
- [ ] 新規テストが RED 状態（FAIL）であることが確認されている
- [ ] 既存テストが全て PASS している（タスク4）
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 4
```

## 次のPhase

Phase 5: 実装 - RED 状態のテストを GREEN に転換させる実装を行う。
