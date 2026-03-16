# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 7                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

Phase 4-6 で作成したテストのカバレッジを計測し、プロジェクト基準（Line 80%+, Branch 60%+, Function 80%+）の達成を確認する。未達の場合は Phase 6 へ戻りテストを追加する。

## 実行タスク

- タスク1: カバレッジ計測の実行
- タスク2: カバレッジ結果の分析
- タスク3: 未達時の対応計画（Phase 6 へのフィードバック）
- タスク4: 達成判定

## 参照資料

| 資料名                | パス                                                            | 説明                     |
| --------------------- | --------------------------------------------------------------- | ------------------------ |
| Phase 4 テスト        | `apps/desktop/src/main/permissions/default-safety-gate.test.ts` | DefaultSafetyGate テスト |
| Phase 4 テスト（IPC） | `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        | IPC ハンドラ テスト      |
| Phase 5 実装          | `apps/desktop/src/main/permissions/default-safety-gate.ts`      | 対象実装ファイル         |
| Phase 5 実装（IPC）   | `apps/desktop/src/main/ipc/handlers/safety-gate.ts`             | IPC ハンドラ実装ファイル |
| Phase 6 拡充ログ      | `outputs/phase-6/coverage-report.md`                            | Phase 6 カバレッジ       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容               |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | カバレッジ基準     |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テスト設計パターン |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン        |

## 実行手順

### ステップ1: カバレッジ計測の実行（タスク1）

**P40準拠**: 対象パッケージディレクトリから実行する。

```bash
# DefaultSafetyGate のカバレッジを計測
cd apps/desktop && pnpm vitest run --coverage src/main/permissions/default-safety-gate.test.ts

# IPC ハンドラのカバレッジを計測
cd apps/desktop && pnpm vitest run --coverage src/main/ipc/handlers/safety-gate.test.ts

# permissions + handlers ディレクトリ全体のカバレッジを計測（既存テスト含む）
cd apps/desktop && pnpm vitest run --coverage src/main/permissions/ src/main/ipc/handlers/
```

### ステップ2: カバレッジ結果の分析（タスク2）

#### カバレッジ基準テーブル

| 指標              | 最低基準 | 推奨基準 | 計測結果 | 判定 |
| ----------------- | -------- | -------- | -------- | ---- |
| Line Coverage     | 80%      | 90%      | -        | -    |
| Branch Coverage   | 60%      | 70%      | -        | -    |
| Function Coverage | 80%      | 90%      | -        | -    |

#### カバレッジ対象ファイル

| ファイル                 | 対象範囲                                                                                 | 備考                 |
| ------------------------ | ---------------------------------------------------------------------------------------- | -------------------- |
| `default-safety-gate.ts` | `evaluate()`, `check*` メソッド5種, `matchesProtectedPaths()`, `calculateOverallGrade()` | 全て新規作成メソッド |
| `safety-gate.ts`（IPC）  | `registerSafetyGateHandlers()`, バリデーション分岐                                       | 新規作成ファイル     |

#### P41注意: v8 カバレッジプロバイダのインライン関数カウント

Vitest の v8 カバレッジプロバイダは、インライン arrow function を独立した関数としてカウントする。以下のパターンに注意:

- `tools.find(t => t.riskLevel === 'critical')` の `t =>` 部分
- `tools.every(t => !this.permissionStore.isToolAllowed(...))` の `t =>` 部分
- `this.protectedPaths.some(pp => ...)` の `pp =>` 部分
- `details.some(d => d.status === "blocked")` の `d =>` 部分

これらのコールバックが Function Coverage を低下させる場合、Phase 6 でコールバックを明示的に実行するテストを追加する。

#### 分岐カバレッジ確認ポイント

| 分岐箇所                                         | テストケース                                  | カバレッジ状態 |
| ------------------------------------------------ | --------------------------------------------- | -------------- |
| `criticalTool` が存在する / しない               | C-1（blocked）, C-2（passed）                 | -              |
| `highTool` が存在する / しない                   | H-1（warned）, H-2（passed）                  | -              |
| `allNotPermanent && tools.length > 0` の複合条件 | N-1（warned）, N-2（passed）, N-3（length=0） | -              |
| `allLow` が true / false                         | L-1（true）, L-2（false）                     | -              |
| `writeTools.length > 0` の true / false          | P-1（true）, P-4（false）                     | -              |
| `matchedPath` が存在する / しない                | P-1（存在）, P-3（存在しない）                | -              |
| `details.some(blocked)` の true / false          | G-1（true）, G-2/G-3（false）                 | -              |
| `details.some(warned)` の true / false           | G-2（true）, G-3（false）                     | -              |
| IPC バリデーション: typeof check                 | I-1（fail）, I-5（pass）                      | -              |
| IPC バリデーション: 空文字チェック               | I-2（fail）, I-5（pass）                      | -              |
| IPC バリデーション: trim 空文字チェック          | I-3（fail）, I-4（pass-after-trim）           | -              |

### ステップ3: 未達時の対応計画（タスク3）

カバレッジが基準未達の場合、以下の手順で Phase 6 へフィードバックする:

| 判定 | 条件                         | 対応                                       |
| ---- | ---------------------------- | ------------------------------------------ |
| 達成 | 全指標が最低基準以上         | Phase 8 へ進行                             |
| 未達 | いずれかの指標が最低基準未満 | Phase 6 へ戻り、未カバー箇所のテストを追加 |

#### 未カバー箇所の特定手順

```bash
# カバレッジレポートの詳細を確認
cd apps/desktop && pnpm vitest run --coverage --coverage.reporter=text src/main/permissions/

# HTML レポートで視覚的に確認（ローカル環境）
cd apps/desktop && pnpm vitest run --coverage --coverage.reporter=html src/main/permissions/
```

未カバー箇所が判明した場合、以下の情報を Phase 6 フィードバックに含める:

1. 未カバーのファイル名・行番号
2. 未カバーの分岐条件
3. 追加すべきテストケースの概要

### ステップ4: 達成判定（タスク4）

全指標が最低基準を満たしている場合、以下を記録して Phase 8 へ進行する:

- 最終カバレッジ数値（DefaultSafetyGate + IPC ハンドラの各ファイル）
- カバレッジレポートのスナップショット
- 既存テストの PASS 確認結果

```bash
# 既存テストの PASS 最終確認（P40準拠）
cd apps/desktop && pnpm vitest run src/main/permissions/
cd apps/desktop && pnpm vitest run src/main/ipc/handlers/
```

## 統合テスト連携【必須】

カバレッジ計測結果から、統合ポイントのテスト漏れを検出する。

| 統合ポイント                       | カバレッジ確認項目                                                       | 未カバー時の対応 |
| ---------------------------------- | ------------------------------------------------------------------------ | ---------------- |
| `evaluate()` の全分岐              | 5種チェックの全ステータス分岐（blocked/warned/passed）が Line に含まれる | Phase 6 で追加   |
| `calculateOverallGrade()` の全分岐 | UNSAFE / SAFE_WITH_WARNINGS / SAFE の3分岐が Branch に含まれる           | Phase 6 で追加   |
| `matchesProtectedPaths()` の全分岐 | 一致 / 不一致の両分岐が Branch に含まれる                                | Phase 6 で追加   |
| IPC バリデーション全分岐           | 3段バリデーション（typeof / 空文字 / trim空文字）の全分岐                | Phase 6 で追加   |
| コールバック系インライン関数       | `find` / `every` / `some` の各コールバックが Function に含まれる         | Phase 6 で追加   |

## 多角的チェック観点（AIが判断）

| 観点       | 適用判断                                    | 仕様参照先                                         |
| ---------- | ------------------------------------------- | -------------------------------------------------- |
| テスト品質 | カバレッジ基準の達成確認が必要              | `aiworkflow-requirements: quality-requirements.md` |
| P41 対策   | v8 プロバイダのインライン関数カウントに注意 | `.claude/rules/06-known-pitfalls.md`               |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                      | 仕様参照先                                         |
| -------------------- | --------------------------------------------- | -------------------------------------------------- |
| バックエンド（Main） | Main Process 実装コードのカバレッジ計測       | `aiworkflow-requirements: quality-requirements.md` |
| IPC通信              | IPC バリデーション分岐の Branch Coverage 確認 | `aiworkflow-requirements: api-ipc-system.md`       |

## 成果物

| 成果物             | パス                                   | 説明                |
| ------------------ | -------------------------------------- | ------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`   | 計測結果と分析      |
| 達成判定           | `outputs/phase-7/coverage-decision.md` | 達成/未達の判定結果 |

## 完了条件

- [ ] カバレッジ計測が実行されている
- [ ] `default-safety-gate.ts` の変更部分: Line 80%+, Branch 60%+, Function 80%+
- [ ] `safety-gate.ts`（IPC）の変更部分: Line 80%+, Branch 60%+, Function 80%+
- [ ] P41 対策: コールバック系インライン関数のカバレッジが確認されている
- [ ] 未達の場合: Phase 6 へのフィードバック情報が記録されている
- [ ] 達成の場合: 最終カバレッジ数値が記録されている
- [ ] 既存テストが全て PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. カバレッジ計測の実行（タスク1）
2. カバレッジ結果の分析（タスク2）
3. 未達時の対応計画（タスク3、該当時のみ）
4. 達成判定（タスク4）
5. 成果物の作成・配置
6. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 7
```

## 次のPhase

Phase 8: リファクタリング（カバレッジ基準達成の場合）。未達の場合は Phase 6 へ戻る。
