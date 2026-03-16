# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 11                         |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

DefaultSafetyGate の評価ロジックとIPCハンドラが、Phase 10 最終レビューで承認された仕様通りに動作することを手動テストで検証する。

本タスクはUI実装を含まないため、「設計文書ウォークスルー + 自動テスト結果の間接検証」方式を採用する（P53: CLI環境でのスクリーンショット取得制約 準拠）。

## 実行タスク

### Task 1: 事前確認（前提条件チェック）

以下がすべて満たされている状態で手動テストを開始する:

| 確認項目                           | コマンド / 確認手段                                             | 期待結果                   |
| ---------------------------------- | --------------------------------------------------------------- | -------------------------- |
| Phase 9 品質検証が PASS している   | `pnpm --filter @repo/desktop test` の最終実行結果               | 全テストPASS               |
| Phase 10 最終レビューが PASS/MINOR | `outputs/phase-10/final-review-report.md` を確認                | PASS または MINOR 対応済み |
| DefaultSafetyGate 実装ファイル存在 | `apps/desktop/src/main/permissions/default-safety-gate.ts`      | ファイル存在               |
| IPCハンドラ実装ファイル存在        | `apps/desktop/src/main/ipc/handlers/safety-gate.ts`             | ファイル存在               |
| 単体テストファイル存在             | `apps/desktop/src/main/permissions/default-safety-gate.test.ts` | ファイル存在               |
| IPCハンドラテストファイル存在      | `apps/desktop/src/main/ipc/handlers/safety-gate.test.ts`        | ファイル存在               |

### Task 2: 自動テスト結果の間接検証（NON_VISUAL）

UI を伴わないため、以下のコマンドでテスト出力を直接確認する。

#### 2-1. DefaultSafetyGate 単体テスト

```bash
pnpm --filter @repo/desktop test src/main/permissions/default-safety-gate.test.ts -- --reporter=verbose
```

**期待出力に含まれるテストケース:**

| テストシナリオ ID | テスト説明                                       | 期待結果                         |
| ----------------- | ------------------------------------------------ | -------------------------------- |
| MT-01             | Critical ツールを含むスキルの evaluate()         | overallGrade: UNSAFE             |
| MT-02             | High ツールのみを含むスキルの evaluate()         | overallGrade: SAFE_WITH_WARNINGS |
| MT-03             | Low ツールのみを含むスキルの evaluate()          | overallGrade: SAFE               |
| MT-04             | details 配列が常に5要素を返す                    | details.length === 5             |
| MT-05             | CRITICAL_TOOL_REQUIRED チェックが blocked を返す | status: blocked                  |
| MT-06             | HIGH_TOOL_REQUIRED チェックが warned を返す      | status: warned                   |
| MT-07             | ALL_LOW_TOOLS チェックが passed を返す           | status: passed                   |
| MT-08             | 保護パスへの書き込みが blocked を返す            | status: blocked                  |
| MT-09             | 恒久許可なしが warned を返す                     | status: warned                   |

**発見事項分類:**

- `Blocker`: テストが失敗しており仕様通りに動作しない
- `Note`: テストは通過しているが改善の余地がある
- `Info`: 情報提供のみ（対応不要）

#### 2-2. IPCハンドラ単体テスト

```bash
pnpm --filter @repo/desktop test src/main/ipc/handlers/safety-gate.test.ts -- --reporter=verbose
```

**期待出力に含まれるテストケース:**

| テストシナリオ ID | テスト説明                                            | 期待結果                |
| ----------------- | ----------------------------------------------------- | ----------------------- |
| MT-10             | 有効な skillName でハンドラが正常応答する             | evaluate() の結果が返る |
| MT-11             | 空文字列で VALIDATION_ERROR が返る                    | code: VALIDATION_ERROR  |
| MT-12             | スペースのみの文字列で VALIDATION_ERROR が返る（P42） | code: VALIDATION_ERROR  |
| MT-13             | undefined で VALIDATION_ERROR が返る                  | code: VALIDATION_ERROR  |
| MT-14             | safetyGate.evaluate() がモック注入で呼ばれる          | mock が1回呼ばれること  |

### Task 3: 設計文書ウォークスルー検証

Phase 2 設計書（`phase-2-design.md`）の設計と実装コードの差異を確認する。

#### 3-1. Grade集約ルール検証

Phase 2 Task 3 の Grade集約ロジックと実装コードを照合する:

| 確認観点                                                | Phase 2 設計書の記述 | 実装コードの確認方法                   |
| ------------------------------------------------------- | -------------------- | -------------------------------------- |
| `blocked` が1件以上 → `UNSAFE`                          | Task 3 条件式        | `calculateOverallGrade` 関数の読み取り |
| `warned` が1件以上（blockedなし）→ `SAFE_WITH_WARNINGS` | Task 3 条件式        | `calculateOverallGrade` 関数の読み取り |
| 全て `passed` → `SAFE`                                  | Task 3 条件式        | `calculateOverallGrade` 関数の読み取り |

#### 3-2. DI 境界の確認

`DefaultSafetyGate` が `SafetyGatePort` インターフェースのみを介して利用できることを確認する:

```bash
# SafetyGatePort の import が使われているか確認
grep -n "SafetyGatePort" apps/desktop/src/main/permissions/default-safety-gate.ts
grep -n "SafetyGatePort" apps/desktop/src/main/ipc/handlers/safety-gate.ts
```

**期待結果:** 両ファイルで `SafetyGatePort` が `import type` で参照されている。

#### 3-3. P42 バリデーション3段チェックの確認

```bash
# 3段バリデーションが実装されているか確認
grep -n "trim" apps/desktop/src/main/ipc/handlers/safety-gate.ts
```

**期待結果:** `.trim() === ""` による第3段バリデーションが存在する。

#### 3-4. IPC チャンネル名定数管理の確認（P27）

```bash
# ハードコード文字列が使われていないか確認
grep -n '"skill:evaluate-safety"' apps/desktop/src/main/ipc/handlers/safety-gate.ts
```

**期待結果:** 文字列リテラル `"skill:evaluate-safety"` が直接記述されておらず、`IPC_CHANNELS.SKILL_EVALUATE_SAFETY` が使われている。

### Task 4: 型チェックによる契約整合性確認

```bash
pnpm --filter @repo/desktop typecheck
```

**期待結果:** エラー 0 件。特に以下の型整合性が保証されること:

- `DefaultSafetyGate` が `SafetyGatePort` インターフェースを完全に実装している
- `SafetyGateResult` の返却型が型定義と一致している

### Task 5: 発見事項の記録

各テストシナリオと手動確認の結果を以下のテーブルに記録する:

| テストシナリオ ID | タイトル                          | 結果               | 分類                  | 備考 |
| ----------------- | --------------------------------- | ------------------ | --------------------- | ---- |
| MT-01             | Critical ツール evaluate()        | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-02             | High ツール evaluate()            | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-03             | Low ツール evaluate()             | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-04             | details 配列5要素                 | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-05             | CRITICAL_TOOL_REQUIRED blocked    | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-06             | HIGH_TOOL_REQUIRED warned         | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-07             | ALL_LOW_TOOLS passed              | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-08             | 保護パス blocked                  | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-09             | 恒久許可なし warned               | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-10             | IPCハンドラ正常応答               | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-11             | 空文字列バリデーション            | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-12             | スペースのみバリデーション（P42） | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-13             | undefined バリデーション          | PASS / FAIL / SKIP | Blocker / Note / Info |      |
| MT-14             | モック注入確認                    | PASS / FAIL / SKIP | Blocker / Note / Info |      |

**Blocker 発見時の対応:** 即座に Phase 5（実装）または Phase 9（品質検証）に差し戻す。Phase 11 を完了させない。

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                                        | 内容                             |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`           | IPC セキュリティ・バリデーション |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | DI パターン・テスト戦略          |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 手動テスト基準・発見事項分類定義 |

### ルール参照

| 参照資料     | パス                                    |
| ------------ | --------------------------------------- |
| タスク実行   | `.claude/rules/05-task-execution.md`    |
| セキュリティ | `.claude/rules/04-electron-security.md` |

### タスク固有参照

| 参照資料              | パス                                                                        |
| --------------------- | --------------------------------------------------------------------------- |
| Phase 2 設計書        | `docs/30-workflows/safety-gate-implementation/phase-2-design.md`            |
| Phase 9 品質検証      | `docs/30-workflows/safety-gate-implementation/phase-9-quality-assurance.md` |
| Phase 10 最終レビュー | `docs/30-workflows/safety-gate-implementation/phase-10-final-review.md`     |

## 実行手順

### ステップ1: 事前確認（Task 1）

1. Phase 9 品質検証が PASS していることを確認する
2. Phase 10 最終レビューが PASS/MINOR であることを確認する
3. 4つの実装・テストファイルが存在することを確認する

### ステップ2: DefaultSafetyGate テスト実行（Task 2-1）

1. `pnpm --filter @repo/desktop test src/main/permissions/default-safety-gate.test.ts -- --reporter=verbose` を実行する
2. MT-01〜MT-09 の結果を発見事項テーブルに記録する

### ステップ3: IPCハンドラテスト実行（Task 2-2）

1. `pnpm --filter @repo/desktop test src/main/ipc/handlers/safety-gate.test.ts -- --reporter=verbose` を実行する
2. MT-10〜MT-14 の結果を発見事項テーブルに記録する

### ステップ4: 設計文書ウォークスルー（Task 3）

1. Grade集約ルール（Phase 2 Task 3）と実装の照合を行う
2. DI 境界（SafetyGatePort の import 確認）を確認する
3. P42 バリデーション3段チェックを確認する
4. P27 チャンネル名定数管理を確認する

### ステップ5: 型チェック（Task 4）

1. `pnpm --filter @repo/desktop typecheck` を実行し、0エラーを確認する

### ステップ6: 発見事項の記録（Task 5）

1. MT-01〜MT-14 の結果を Blocker/Note/Info で分類する
2. Blocker が0件であることを確認する

## 統合テスト連携

- MT-14（モック注入確認）の結果は、TASK-SKILL-LIFECYCLE-08（PermissionDialog）での DI 利用可否の前提となる
- Blocker が検出された場合、TASK-SKILL-LIFECYCLE-08 の着手を保留する

## 多角的チェック観点（AIが判断）

| 観点           | 確認項目                                                                     | 仕様参照先                                                         |
| -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ   | P42 3段バリデーション（MT-12）、P27 チャンネル定数管理（Task 3-4）の動作確認 | `aiworkflow-requirements: architecture-auth-security.md`           |
| アーキテクチャ | DI 境界維持（MT-14: SafetyGatePort インターフェース経由のモック注入可能性）  | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| テスタビリティ | NON_VISUAL タスク種別として自動テスト結果を間接検証する方式を採用（P53準拠） | `aiworkflow-requirements: testing-component-patterns.md`           |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                                                                       | 仕様参照先                                          |
| -------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| バックエンド（Main） | DefaultSafetyGate の Grade 集約ロジックが仕様通りに動作すること（MT-01〜MT-09）                | `aiworkflow-requirements: architecture-overview.md` |
| IPC通信              | `skill:evaluate-safety` ハンドラのバリデーション・モック注入が正常動作すること（MT-10〜MT-14） | `aiworkflow-requirements: api-ipc-system.md`        |

**NON_VISUAL タスク種別判定:** 本 Phase は UI 実装を含まないため、スクリーンショット取得は不要。自動テスト結果（`--reporter=verbose` 出力）で代替する（P53 準拠）。

**発見事項分類基準:**

| 分類    | 条件                                     | 対応                                     |
| ------- | ---------------------------------------- | ---------------------------------------- |
| Blocker | テストが失敗しており仕様通りに動作しない | 即座に Phase 5 または Phase 9 に差し戻す |
| Note    | テストは通過しているが改善の余地がある   | Phase 12 未タスク候補として記録          |
| Info    | 情報提供のみ（対応不要）                 | 発見事項レポートに記録のみ               |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Task 1: 事前確認（前提条件チェック全6項目）
2. Task 2: 自動テスト結果の間接検証（MT-01〜MT-14）
3. Task 3: 設計文書ウォークスルー検証（Grade集約・DI境界・P42・P27）
4. Task 4: 型チェックによる契約整合性確認
5. Task 5: 発見事項の記録
6. 成果物の作成・配置
7. 完了条件の検証

## 成果物

| 成果物                 | パス                                     |
| ---------------------- | ---------------------------------------- |
| 手動テスト結果レポート | `outputs/phase-11/manual-test-result.md` |
| 発見事項一覧           | `outputs/phase-11/discovered-issues.md`  |

## 完了条件

- [ ] Task 1 の前提条件が全項目クリアされている
- [ ] MT-01〜MT-14 の全テストシナリオを実行し結果を記録している
- [ ] Blocker 分類の発見事項がゼロである
- [ ] 設計文書ウォークスルー（Task 3）の全確認項目が完了している
- [ ] 型チェックが 0 エラーで通過している
- [ ] 発見事項レポート（`outputs/phase-11/discovered-issues.md`）が作成されている
- [ ] Note / Info 分類の発見事項は Phase 12 未タスク候補として記録されている

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 11
```

## 次Phase

Phase 12: ドキュメント → `phase-12-documentation.md`
