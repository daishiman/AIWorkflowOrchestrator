# Phase 1: 要件定義

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 1                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

UT-06-003 タスクのスコープ、受入基準、前提条件、制約を確定し、Phase 2 以降の設計・実装の基盤を固定する。

## 実行タスク

### Task 1: スコープ確認と前提条件の棚卸し

#### 1-1. 実装対象の確認

以下のファイルを読み、SafetyGatePort の契約仕様を確認する:

| 参照資料                      | パス                                                                                                                                  | 確認項目                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| SafetyGate型定義（Phase 5）   | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/safety-gate.ts`                    | SafetyGatePort インターフェース定義  |
| SafetyGate設計契約（Phase 2） | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-2/safety-gate-contract.md`           | 5種チェックルール・Grade集約ロジック |
| デシジョンテーブル（Phase 4） | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-4/decision-table-risk-permission.md` | リスクレベル x 権限状態 16組合せ     |

#### 1-2. 前提タスクの依存確認

| 前提タスク | 提供する成果物                  | 本タスクでの利用方法                          |
| ---------- | ------------------------------- | --------------------------------------------- |
| UT-06-001  | `TOOL_RISK_CONFIG` 定数         | 各ツールの `ToolRiskLevel` をルックアップする |
| UT-06-002  | `PermissionStoreInterface` 実装 | `isToolAllowed()` で恒久許可の有無を確認する  |

UT-06-001/002 が未実装の場合、本タスク内でモック実装を使用して開発を進め、実装完了後に差し替える方針とする。

### Task 2: インベントリ（実装対象ファイル一覧）

#### スコープ内（本タスクで実装する対象）

| ファイル                                                        | 種別     | 責務                                              |
| --------------------------------------------------------------- | -------- | ------------------------------------------------- |
| `apps/desktop/src/main/permissions/default-safety-gate.ts`      | 新規作成 | `SafetyGatePort` の具象クラス `DefaultSafetyGate` |
| `apps/desktop/src/main/ipc/handlers/safety-gate.ts`             | 新規作成 | `skill:evaluate-safety` IPCハンドラ               |
| `apps/desktop/src/main/permissions/default-safety-gate.test.ts` | 新規作成 | DefaultSafetyGate 単体テスト                      |
| `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        | 新規作成 | IPCハンドラ 単体テスト                            |
| `apps/desktop/src/preload/channels.ts`                          | 修正     | `SKILL_EVALUATE_SAFETY` チャンネル定数追加        |
| `apps/desktop/src/preload/types.ts`                             | 修正     | Preload API型定義に `evaluateSafety` 追加         |

#### スコープ外（本タスクでは変更しない対象）

| 対象                                  | 理由                                                            |
| ------------------------------------- | --------------------------------------------------------------- |
| `SafetyGatePort` インターフェース定義 | TASK-SKILL-LIFECYCLE-06 で確定済み（変更禁止）                  |
| `TOOL_RISK_CONFIG` 定数               | UT-06-001 で定義済み（変更禁止）                                |
| `PermissionStoreInterface` 実装       | UT-06-002 で定義済み（本タスクは消費のみ）                      |
| Task-08 スキル公開フロー              | SafetyGate の消費側。本タスクでは SafetyGatePort の実装のみ担当 |

### Task 3: 受入基準の検証可能性確認

各受入基準を検証するための具体的な手段:

| 受入基準                                            | 検証方法                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `evaluate(skillName)` が動作する                    | `DefaultSafetyGate.evaluate("test-skill")` を呼び出し、`SafetyGateResult` が返ることを確認 |
| SafetyCheckId 5種の評価ロジックが実装されている     | 各チェックIDに対応するテストケースで `status` の値を検証                                   |
| Grade集約ルール（UNSAFE優先）が実装されている       | blocked/warned/passed の組合せで `overallGrade` を検証                                     |
| `CRITICAL_TOOL_REQUIRED` が `UNSAFE` へ集約される   | Critical ツールを含むスキルで `overallGrade === "UNSAFE"` を検証                           |
| `HIGH_TOOL_REQUIRED` が `SAFE_WITH_WARNINGS` へ集約 | High ツールを含むスキルで `overallGrade === "SAFE_WITH_WARNINGS"` を検証                   |
| `skill:evaluate-safety` IPCハンドラが追加されている | IPCハンドラテストで `ipcMain.handle` の登録を検証                                          |
| IPC経由で結果取得できる                             | Preload API経由で `evaluateSafety(skillName)` を呼び出し結果を検証                         |
| DI境界を維持                                        | `SafetyGatePort` インターフェースのモック注入テストで検証                                  |
| 単体テストでblocked/warned/passedの代表ケースが固定 | テストファイルで3パターンのテストケースが存在し全PASSすることを確認                        |
| 全テストがPASSする                                  | `pnpm --filter @repo/desktop test` でエラー0件                                             |
| typecheck が通る                                    | `pnpm --filter @repo/desktop typecheck` でエラー0件                                        |

### Task 4: 制約の明文化

| 制約                                             | 根拠                                                   |
| ------------------------------------------------ | ------------------------------------------------------ |
| `SafetyGatePort` インターフェースは変更禁止      | TASK-SKILL-LIFECYCLE-06 で確定済み、Task-08 が消費する |
| `TOOL_RISK_CONFIG` 定数の構造は変更禁止          | UT-06-001 で定義済み、不変条件 TC-T-001 で検証される   |
| IPC チャンネル名は `IPC_CHANNELS` 定数で管理する | P27（ハードコード文字列禁止）準拠                      |
| 文字列引数は P42 準拠3段バリデーション必須       | 型チェック → 空文字列 → トリム空文字列                 |
| `details` 配列は常に5要素を返す                  | SafetyGate設計契約 セクション6-3 で保証                |

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                                                                | 内容                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`                                   | Electron 3プロセスモデル・IPC セキュリティ原則                     |
| IPC設計                | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                               | IPCハンドラ設計パターン                                            |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                         | DIパターン・テスト戦略                                             |
| スキル実行セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                     | ToolRiskLevel定義・DANGEROUS_PATTERNS・PROTECTED_PATHS             |
| SafetyGatePort契約     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                        | SafetyGatePort インターフェース定義・evaluate()シグネチャ（L221+） |
| 権限ガバナンス         | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | 権限・インポートライフサイクル                                     |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                               | エラーカテゴリ（VALIDATION_ERROR等）・Result<T,E>パターン          |

## 実行手順

### ステップ1: スコープ確認と前提条件の棚卸し（Task 1）

1. SafetyGate型定義（Phase 5）を読み取り、`SafetyGatePort` インターフェース定義を確認する
2. SafetyGate設計契約（Phase 2）を読み取り、5種チェックルール・Grade集約ロジックを確認する
3. デシジョンテーブル（Phase 4）を読み取り、リスクレベル×権限状態の16組合せを確認する
4. 前提タスク（UT-06-001/002）の依存関係を整理する

### ステップ2: インベントリ作成（Task 2）

1. 実装対象ファイル一覧を作成する（新規作成4件、修正2件）
2. 各ファイルの種別・責務を記録する

### ステップ3: 受入基準の検証可能性確認（Task 3）

1. 各受入基準に対する検証方法を定義する
2. 検証コマンドを具体的に記載する

### ステップ4: 制約の明文化（Task 4）

1. 変更禁止対象を明記する
2. P27/P42 準拠要件を記録する

## 統合テスト連携

- Phase 4 でテストケース設計時に、統合テスト用のモック定義を先行作成する
- Phase 5 で実装完了後、Task-08 の消費コードとの接続テストを実施する

## 多角的チェック観点（AIが判断）

| 観点           | 確認項目                                    | 仕様参照先                                                         |
| -------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ   | IPC バリデーション要件（P42）、送信元検証   | `aiworkflow-requirements: architecture-auth-security.md`           |
| アーキテクチャ | DI 境界（SafetyGatePort）、レイヤー依存方向 | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| テスタビリティ | モック注入パターン、テスト間状態リーク防止  | `aiworkflow-requirements: testing-component-patterns.md`           |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                               | 仕様参照先                                          |
| -------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| バックエンド（Main） | DefaultSafetyGate の実装場所として Main Process が対象 | `aiworkflow-requirements: architecture-overview.md` |
| IPC通信              | `skill:evaluate-safety` チャンネルの設計               | `aiworkflow-requirements: api-ipc-system.md`        |
| Preload Script       | evaluateSafety API の公開                              | `aiworkflow-requirements: security-api-electron.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. SafetyGate型定義・設計契約・デシジョンテーブルの読み取り確認
2. 前提タスク依存関係の整理
3. インベントリ（実装対象ファイル一覧）の作成
4. 受入基準の検証可能性確認
5. 制約の明文化
6. 成果物の作成・配置
7. 完了条件の検証

## 成果物

| 成果物             | パス                                          | 説明                             |
| ------------------ | --------------------------------------------- | -------------------------------- |
| 要件定義レポート   | `outputs/phase-1/requirements-report.md`      | スコープ・前提条件・制約の記録   |
| インベントリ一覧   | `outputs/phase-1/implementation-inventory.md` | 実装対象ファイル一覧（6件）      |
| 受入基準検証マップ | `outputs/phase-1/acceptance-criteria-map.md`  | 受入基準11項目と検証方法の対応表 |

## 完了条件

- [ ] スコープ内・スコープ外が明確に定義されている
- [ ] 前提タスク（UT-06-001/002）の依存関係が整理されている
- [ ] 実装対象ファイル一覧が完成している（新規作成4件、修正2件の全6件が記録されている）
- [ ] 受入基準の全11項目に検証方法が1対1で対応している
- [ ] 制約が明文化されている（変更禁止対象・P27/P42 準拠要件が全て記録されている）
- [ ] 参照資料のパスが全て存在する
- [ ] Phase 1-3 が完了するまで Phase 4 には進まない（Phase 3 の PASS 判定を確認してから Phase 4 へ移行する）

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 1
```

## 次Phase

Phase 2: 設計 → `phase-2-design.md`
