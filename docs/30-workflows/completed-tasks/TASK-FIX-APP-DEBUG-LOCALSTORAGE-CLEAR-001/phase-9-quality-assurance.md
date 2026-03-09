# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 9                                         |
| Phase名    | 品質検証                                  |
| カテゴリ   | fix                                       |
| ステータス | completed                                 |
| 前提Phase  | Phase 8                                   |
| 後続Phase  | Phase 10                                  |

## 目的

Lint、型チェック、全テスト実行を行い、修正がプロジェクト全体の品質基準を満たしていることを確認する。

## 実行タスク

- タスク1: Lint を実行してコード品質基準への準拠を確認する
- タスク2: TypeScript 型チェックを実行して型安全性を確認する
- タスク3: 全テスト実行で既存回帰がないことを確認する
- タスク4: Prettier でフォーマット差分がないことを確認する

### タスク1: ESLint 実行

**目的**: コード品質基準への準拠を確認する

**手順**:

1. `pnpm --filter @repo/desktop lint`
2. エラー・警告が0件であることを確認

**期待結果**: エラー0件、警告0件

### タスク2: TypeScript 型チェック

**目的**: 型安全性を確認する

**手順**:

1. `pnpm --filter @repo/desktop exec tsc --noEmit`
2. 型エラーが0件であることを確認

**期待結果**: エラー0件

### タスク3: 全テスト実行

**目的**: 修正が既存テストを破壊していないことを確認する

**手順**:

1. `cd apps/desktop && pnpm vitest run`
2. 全テストが PASS することを確認
3. 失敗テストがある場合は原因を調査

**期待結果**: 全テスト PASS（AC-6）

### タスク4: Prettier フォーマット確認

**目的**: コードフォーマットが統一されていることを確認する

**手順**:

1. `pnpm --filter @repo/desktop exec prettier --check src/renderer/App.tsx`
2. フォーマット違反がないことを確認

**期待結果**: フォーマット違反0件

## 参照資料

| 参照資料       | パス                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------- |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-5-implementation.md` |
| Phase 8 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-8-refactoring.md`    |
| コード品質基準 | `.claude/rules/02-code-quality.md`                                                                      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容                             |
| -------- | --------------------------------------------------------------------------- | -------------------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | Lint・型チェック・テスト品質基準 |

## 統合テスト連携

- 全品質チェック PASS で Phase 10（最終レビュー）へ進む
- 失敗がある場合は Phase 5 または Phase 8 へ戻って修正

## 成果物

| 成果物       | パス                                          |
| ------------ | --------------------------------------------- |
| 品質検証結果 | `outputs/phase-9/quality-assurance-result.md` |

## 完了条件

- [ ] ESLint がエラー0件であること
- [ ] TypeScript 型チェックがエラー0件であること
- [ ] 全テストが PASS すること
- [ ] Prettier フォーマットが統一されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 10: 最終レビューへ進む。
