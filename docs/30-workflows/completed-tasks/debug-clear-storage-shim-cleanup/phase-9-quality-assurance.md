# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 9                                           |
| Phase名    | 品質検証                                    |
| カテゴリ   | 改善                                        |
| ステータス | completed                                   |
| 前提Phase  | Phase 8                                     |
| 後続Phase  | Phase 10                                    |

## 目的

Lint、型チェック、全テスト実行、残存パターン検索、仕様書リンク整合性スクリプトを実行し、修正がプロジェクト全体の品質基準を満たしていることを確認する。

## 実行タスク

- タスク1: ESLint を実行してコード品質基準への準拠を確認する
- タスク2: TypeScript 型チェックを実行して型安全性を確認する
- タスク3: 全テスト実行で既存回帰がないことを確認する
- タスク4: Prettier でフォーマット差分がないことを確認する
- タスク5: `debug-clear-storage` の残存パターン検索を実行する
- タスク6: `verify-unassigned-links.js` を実行する
- タスク7: `audit-unassigned-tasks --target-file` を実行する

### タスク1: ESLint 実行

**目的**: コード品質基準への準拠を確認する

**手順**:

1. `pnpm --filter @repo/desktop lint` を実行する
2. エラー・警告が0件であることを確認する

**期待結果**: エラー0件、警告0件

### タスク2: TypeScript 型チェック

**目的**: 型安全性を確認する

**手順**:

1. `pnpm --filter @repo/desktop exec tsc --noEmit` を実行する
2. 型エラーが0件であることを確認する

**期待結果**: エラー0件

### タスク3: 全テスト実行

**目的**: 修正が既存テストを破壊していないことを確認する（AC-7）

**手順**:

1. `cd apps/desktop && pnpm vitest run` を実行する
2. 全テストが PASS することを確認する
3. 失敗テストがある場合は原因を調査し、Phase 8 または Phase 5 へ差し戻す

**期待結果**: 全テスト PASS

### タスク4: Prettier フォーマット確認

**目的**: コードフォーマットが統一されていることを確認する

**手順**:

1. Phase 5 / Phase 8 で変更した全ファイルに対して Prettier チェックを実行する:
   ```bash
   pnpm --filter @repo/desktop exec prettier --check "src/**/*.{ts,tsx}"
   ```
2. フォーマット違反がないことを確認する

**期待結果**: フォーマット違反0件

### タスク5: `debug-clear-storage` 残存パターン検索

**目的**: `debug-clear-storage` への参照がソースコード・ドキュメント・スキル設定に残存していないことを確認する（AC-1, AC-2）

**手順**:

1. 以下の検索を実行し、残存箇所を確認する:
   ```bash
   rg -n "debug-clear-storage" apps/ docs/ .claude/ scripts/
   ```
2. 検出箇所が以下のいずれかであることを確認する:
   - **許容**: completed workflow docs 内の historical note（降格済み）
   - **許容**: 本タスク自身の仕様書内の記述
   - **NG**: 上記以外の箇所（Phase 5 の対処漏れ）
3. NG 箇所が発見された場合は Phase 5 へ差し戻す

**期待結果**: NG 箇所0件

### タスク6: `verify-unassigned-links.js` の実行

**目的**: 未タスク指示書へのリンクが正しく設定されていることを確認する（AC-4）

**手順**:

1. 以下のスクリプトを実行する:
   ```bash
   node scripts/verify-unassigned-links.js
   ```
2. 全リンクが有効であることを確認する

**期待結果**: PASS（リンク切れ0件）

### タスク7: `audit-unassigned-tasks --target-file` の実行

**目的**: 未タスク管理の整合性を確認する（AC-5）

**手順**:

1. 以下のスクリプトを実行する:
   ```bash
   node scripts/audit-unassigned-tasks.js --target-file
   ```
2. `currentViolations=0` であることを確認する

**期待結果**: `currentViolations=0`

## 参照資料

| 参照資料         | パス                                                                                       | 説明                 |
| ---------------- | ------------------------------------------------------------------------------------------ | -------------------- |
| Phase 5 実装仕様 | `phase-5-implementation.md`                                                                | 実装結果             |
| Phase 8 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-8/refactoring-report.md` | リファクタリング結果 |
| コード品質基準   | `.claude/rules/02-code-quality.md`                                                         | Lint・型・テスト基準 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                         | 内容                             |
| -------------- | ---------------------------------------------------------------------------- | -------------------------------- |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | Lint・型チェック・テスト品質基準 |
| カバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md` | カバレッジ閾値・計測方法         |

## 統合テスト連携

- 全品質チェック PASS で Phase 10（最終レビュー）へ進む
- Lint / 型チェック / テストのいずれかが失敗した場合は Phase 8 または Phase 5 へ差し戻す
- 残存パターン検索で NG 箇所が発見された場合は Phase 5 へ差し戻す

## 成果物

| 成果物       | パス                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------ |
| 品質検証結果 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-9/quality-assurance-result.md` |

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。具体的なチェック項目はAIがタスク内容に応じて判断・適用する。

| 観点               | 適用判断                                                                       |
| ------------------ | ------------------------------------------------------------------------------ |
| ローカルストレージ | localStorage / sessionStorage / Zustand persist が関係する場合（本タスク該当） |
| E2Eテスト          | e2e テストの前提条件が変更される場合（本タスク該当）                           |
| セキュリティ       | 認証バイパス機構が関係する場合（本タスク該当: skipAuth / VITE_E2E_MODE）       |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 完了条件

- [ ] ESLint がエラー0件であること
- [ ] TypeScript 型チェックがエラー0件であること
- [ ] 全テストが PASS すること（AC-7）
- [ ] Prettier フォーマットが統一されていること
- [ ] `debug-clear-storage` の残存パターン検索で NG 箇所が0件であること（AC-1, AC-2）
- [ ] `verify-unassigned-links.js` が PASS であること（AC-4）
- [ ] `audit-unassigned-tasks --target-file` で `currentViolations=0` であること（AC-5）
- [ ] IPC契約ドリフト検証: 該当なし（本タスクはIPC変更を含まない）
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 10: 最終レビューへ進む。
