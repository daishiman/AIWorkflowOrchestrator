# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 10                         |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

Phase 5〜9 の全成果物（実装・テスト・リファクタリング・品質検証）を多角的にレビューし、Phase 1 の受入基準が全件充足されていることを検証する。PASS/MINOR/MAJOR/CRITICAL の判定を記録し、MINOR 以上の指摘は後続 Phase に引き継ぐ。

## 実行タスク

### Task 1: 受入基準充足レポートの作成

Phase 1 で確定した全受入基準を1項目ずつ検証し、充足状況をテーブルに記録する:

| 受入基準                                                      | 検証方法                                                                                           | 充足状況 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| `evaluate(skillName)` が動作する                              | `DefaultSafetyGate.evaluate("test-skill")` を呼び出し、`SafetyGateResult` が返ることをテストで確認 | -        |
| SafetyCheckId 5種の評価ロジックが実装されている               | 各チェックIDのテストケースで `status` の値が正しいことを確認                                       | -        |
| Grade集約ルール（UNSAFE優先）が実装されている                 | blocked/warned/passed 組合せテストで `overallGrade` が正しく集約されることを確認                   | -        |
| `CRITICAL_TOOL_REQUIRED` が `UNSAFE` へ集約される             | Critical ツールを含むスキルのテストで `overallGrade === "UNSAFE"` を確認                           | -        |
| `HIGH_TOOL_REQUIRED` が `SAFE_WITH_WARNINGS` へ集約される     | High ツールを含むスキルのテストで `overallGrade === "SAFE_WITH_WARNINGS"` を確認                   | -        |
| `skill:evaluate-safety` IPCハンドラが追加されている           | `channels.ts` に `SKILL_EVALUATE_SAFETY` 定数があり、IPCハンドラテストで登録を確認                 | -        |
| IPC経由で結果取得できる                                       | Preload API `evaluateSafety(skillName)` のシグネチャが `types.ts` に定義されていることを確認       | -        |
| DI境界を維持している                                          | `SafetyGatePort` インターフェースのモック注入テストで、具象クラスへの直接依存がないことを確認      | -        |
| 単体テストでblocked/warned/passedの代表ケースが固定されている | テストファイルで3パターン以上のテストケースが存在し全PASSすることを確認                            | -        |
| 全テストがPASSする                                            | `pnpm --filter @repo/desktop test` でエラー0件                                                     | -        |
| typecheck が通る                                              | `pnpm --filter @repo/desktop typecheck` でエラー0件                                                | -        |

充足状況の記入値: `充足` / `未充足（理由）` / `部分充足（詳細）`

### Task 2: SafetyGatePort 契約との最終整合性確認

Phase 2 で定義した SafetyGate設計契約（`safety-gate-contract.md`）との整合を最終確認する:

| 設計契約                                      | 確認方法                                                                     | 整合状況 |
| --------------------------------------------- | ---------------------------------------------------------------------------- | -------- |
| `details` は常に5要素を含む                   | テストで `result.details.length === 5` を確認                                | -        |
| `evaluatedAt` は呼び出し時点のタイムスタンプ  | テストで `result.evaluatedAt <= Date.now()` を確認                           | -        |
| `overallGrade` は `details` と整合する        | テストで Grade集約関数の出力と `result.overallGrade` の一致を確認            | -        |
| `skillName` は入力値と一致する                | テストで `result.skillName === inputSkillName` を確認                        | -        |
| 全5チェックを常に実行する（途中打ち切りなし） | `evaluate()` 実装で5メソッドが全て呼ばれることを確認（モックの呼び出し回数） | -        |

### Task 3: 多角的品質チェック

#### 3-1. セキュリティチェック

| チェック項目                            | 確認方法                                                                                      | 判定 |
| --------------------------------------- | --------------------------------------------------------------------------------------------- | ---- |
| P42: IPC引数 3段バリデーション          | `typeof skillName !== "string" \|\| skillName === "" \|\| skillName.trim() === ""` の存在確認 | -    |
| P27: チャンネル名ハードコード禁止       | `grep -rn '"skill:evaluate-safety"' apps/desktop/src/main/` で0件確認                         | -    |
| P44: IPC引数型とPreload一致             | ハンドラ引数 `string` と `types.ts` シグネチャの一致確認                                      | -    |
| P45: IPC引数命名 `skillName` 統一       | `grep -n "skillId" apps/desktop/src/main/ipc/handlers/safety-gate.ts` で0件確認               | -    |
| 送信元ウィンドウ検証                    | `validateIpcSender(event)` の呼び出し確認                                                     | -    |
| エラーサニタイズ                        | ハンドラのエラー応答に内部スタックトレースが含まれないことを確認                              | -    |
| P55: 保護パスマッチングで正規表現不使用 | `matchesProtectedPaths()` が `startsWith` で前方一致比較をしていることを確認                  | -    |

#### 3-2. アーキテクチャチェック

| チェック項目                              | 確認方法                                                                     | 判定 |
| ----------------------------------------- | ---------------------------------------------------------------------------- | ---- |
| レイヤー依存方向（Renderer→Preload→Main） | `default-safety-gate.ts` がRenderer層・Preload層をimportしていないことを確認 | -    |
| `SafetyGatePort` インターフェース準拠     | `DefaultSafetyGate implements SafetyGatePort` の宣言確認                     | -    |
| Constructor Injection（P34準拠）          | コンストラクタ引数として全依存が渡されていることを確認                       | -    |
| SkillService への直接依存がない           | `default-safety-gate.ts` の import に `SkillService` がないことを確認        | -    |
| IPC ハンドラ二重登録防止（P5準拠）        | `registerSafetyGateHandlers()` が複数回呼ばれた場合の安全性を確認            | -    |

#### 3-3. テスト品質チェック

| チェック項目                            | 確認方法                                                                              | 判定 |
| --------------------------------------- | ------------------------------------------------------------------------------------- | ---- |
| テスト間状態リーク防止（P9準拠）        | `beforeEach` でモックがリセットされていることを確認                                   | -    |
| v8カバレッジのインライン関数対策（P41） | コールバック引数を持つ関数が明示的にテストで呼ばれていることを確認                    | -    |
| Line Coverage 80%以上                   | Phase 9 品質検証レポートの数値確認                                                    | -    |
| Function Coverage 80%以上               | Phase 9 品質検証レポートの数値確認                                                    | -    |
| 境界値テストの存在                      | `details.length === 0` の場合、ツールが空配列の場合のテストケースが存在することを確認 | -    |

#### 3-4. コード品質チェック

| チェック項目                     | 確認方法                                                               | 判定 |
| -------------------------------- | ---------------------------------------------------------------------- | ---- |
| `any` 型使用0件                  | Phase 9 品質検証レポートの確認                                         | -    |
| non-null assertion (`!`) 使用0件 | Phase 9 品質検証レポートの確認                                         | -    |
| 未使用import 0件                 | Phase 9 Lint結果の確認                                                 | -    |
| boolean変数名のプレフィックス    | `is` / `has` / `can` / `should` プレフィックスが使われていることを確認 | -    |
| 曖昧表現がコメントにないか       | 「適切に」「必要に応じて」「など」がコードコメントにないことを確認     | -    |

### Task 4: レビュー判定の記録

以下のテンプレートにレビュー結果を記録する:

```markdown
## 最終レビュー判定レポート

実行日時: YYYY-MM-DD HH:MM

### 判定: [PASS / MINOR / MAJOR / CRITICAL]

### 受入基準充足状況: [充足件数] / [全件数] 件充足

### 指摘事項一覧

| #   | 指摘内容 | 重大度 | 対応方針 | 対応予定Phase |
| --- | -------- | ------ | -------- | ------------- |
| -   | -        | -      | -        | -             |

### 判定理由

[判定に至った理由を記載]
```

## レビューゲート判定基準

| 判定     | 条件                                                                                    | 対応                                               |
| -------- | --------------------------------------------------------------------------------------- | -------------------------------------------------- |
| PASS     | 全受入基準が充足し、多角的チェックで重大な問題がない                                    | Phase 11 へ                                        |
| MINOR    | 機能・セキュリティに影響しない軽微な問題（コメント品質、テストの補足など）が1件以上ある | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 受入基準の未充足・セキュリティ問題・アーキテクチャ違反のいずれかがある                  | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | `SafetyGatePort` 契約の破壊・データ漏洩リスク・システム破壊的な問題がある               | Phase 1 へ戻り要件再確認                           |

### MINOR判定時の必須対応

MINOR判定の指摘事項は、機能影響がなくても全て未タスク仕様書に変換する（省略不可。05-task-execution.md 参照）:

1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する
2. `docs/30-workflows/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

### MAJOR判定時の差し戻し先

| 問題の種別                 | 差し戻し先 |
| -------------------------- | ---------- |
| 受入基準に漏れ・矛盾がある | Phase 1    |
| 設計・アーキテクチャの問題 | Phase 2    |
| テストケースの不足         | Phase 4    |
| 実装の誤り                 | Phase 5    |
| カバレッジ不足             | Phase 6    |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                        | 内容                    |
| ---------------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | IPC セキュリティ原則    |
| IPC設計          | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | IPCハンドラ設計パターン |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DIパターン・テスト戦略  |

### タスク固有参照

| 参照資料                 | パス                                                                                                                        |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 受入基準         | `docs/30-workflows/safety-gate-implementation/phase-1-requirements.md`                                                      |
| Phase 2 設計書           | `docs/30-workflows/safety-gate-implementation/phase-2-design.md`                                                            |
| Phase 9 品質検証レポート | `outputs/phase-9/quality-assurance-report.md`                                                                               |
| SafetyGate設計契約       | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-2/safety-gate-contract.md` |
| SafetyGate型定義         | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/safety-gate.ts`          |
| タスク実行ルール         | `.claude/rules/05-task-execution.md`                                                                                        |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md` (P5, P9, P27, P41, P42, P44, P45, P48, P52, P55)                                       |

## 実行手順

### ステップ1: 受入基準充足レポート作成（Task 1）

1. Phase 1 の受入基準11項目を1項目ずつ検証する
2. 充足状況を `充足` / `未充足（理由）` / `部分充足（詳細）` で記録する

### ステップ2: SafetyGatePort 契約との最終整合性確認（Task 2）

1. `details` 5要素、`evaluatedAt` タイムスタンプ、`overallGrade` 整合、`skillName` 一致、全5チェック実行の5項目を確認する

### ステップ3: 多角的品質チェック（Task 3）

1. セキュリティチェック7項目（P42, P27, P44, P45, 送信元検証, エラーサニタイズ, P55）を確認する
2. アーキテクチャチェック5項目を確認する
3. テスト品質チェック5項目を確認する
4. コード品質チェック5項目を確認する

### ステップ4: レビュー判定の記録（Task 4）

1. PASS / MINOR / MAJOR / CRITICAL を判定する
2. MINOR 指摘は全て未タスク仕様書に変換する（省略不可）
3. 判定レポートを `outputs/phase-10/final-review-report.md` に記録する

## 統合テスト連携

- PASS判定の場合、`DefaultSafetyGate` の `SafetyGatePort` インターフェース準拠が保証され、Task-08 の PublishService が消費可能な状態になる
- MINOR判定で検出した追加テストケース要求は Phase 6 差し戻しではなく、未タスク仕様書として後続タスクに引き継ぐ

## 多角的チェック観点（観点別サマリー）

| 観点           | 観点別判定 | 主な確認項目                                                                   |
| -------------- | ---------- | ------------------------------------------------------------------------------ |
| セキュリティ   | -          | P42 3段バリデーション、P27 チャンネル定数、P44/P45 IPC引数、P55 パスマッチング |
| アーキテクチャ | -          | レイヤー依存方向、DI境界（SafetyGatePort）、Constructor Injection              |
| テスト品質     | -          | Line/Function Coverage、状態リーク防止、境界値テスト                           |
| コード品質     | -          | `any` 型0件、non-null assertion 0件、未使用import 0件                          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Task 1: 受入基準充足レポートの作成（全11項目）
2. Task 2: SafetyGatePort 契約との最終整合性確認（全5項目）
3. Task 3: 多角的品質チェック（セキュリティ・アーキテクチャ・テスト・コード品質）
4. Task 4: レビュー判定の記録（PASS/MINOR/MAJOR/CRITICAL）
5. MINOR 指摘がある場合: 未タスク仕様書への変換（3ステップ全完了）
6. 成果物の作成・配置
7. 完了条件の検証

## 成果物

| 成果物                   | パス                                             |
| ------------------------ | ------------------------------------------------ |
| 受入基準充足レポート     | `outputs/phase-10/acceptance-criteria-report.md` |
| 最終レビュー判定レポート | `outputs/phase-10/final-review-report.md`        |
| MINOR指摘未タスク一覧    | `outputs/phase-10/minor-unassigned-tasks.md`     |

## 完了条件

- [ ] 受入基準の全11項目について充足状況が記録されている
- [ ] SafetyGatePort 契約との整合性が全5項目で確認されている
- [ ] セキュリティ多角的チェックが全7項目で完了している
- [ ] アーキテクチャ多角的チェックが全5項目で完了している
- [ ] テスト品質多角的チェックが全5項目で完了している
- [ ] コード品質多角的チェックが全5項目で完了している
- [ ] PASS/MINOR/MAJOR/CRITICAL の判定が記録されている
- [ ] MINOR判定がある場合、全指摘が未タスク仕様書に変換されている（省略不可）
- [ ] MAJOR/CRITICAL判定がある場合、差し戻し先 Phase が明記されている
- [ ] `outputs/phase-10/acceptance-criteria-report.md` が作成されている
- [ ] `outputs/phase-10/final-review-report.md` が作成されている

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 10
```

## 次Phase

- **PASS / MINOR**: Phase 11 → `phase-11-manual-test.md`
- **MAJOR（要件問題）**: Phase 1 → `phase-1-requirements.md`
- **MAJOR（設計問題）**: Phase 2 → `phase-2-design.md`
- **MAJOR（テストケース不足）**: Phase 4 → `phase-4-test-creation.md`
- **MAJOR（実装問題）**: Phase 5 → `phase-5-implementation.md`
- **MAJOR（カバレッジ不足）**: Phase 6 → `phase-6-test-coverage.md`
- **CRITICAL**: Phase 1 → `phase-1-requirements.md`（要件再確認）
