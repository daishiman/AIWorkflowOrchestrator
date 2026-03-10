# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 8                                           |
| Phase名    | リファクタリング                            |
| カテゴリ   | 改善                                        |
| ステータス | not_started                                 |
| 前提Phase  | Phase 7                                     |
| 後続Phase  | Phase 9                                     |

## 目的

Phase 5 の削除/降格実装後のコード品質を改善する。e2e setup / screenshot script の認証バイパス方式を統一し、不要な import / 変数 / historical note のフォーマットを整理する。テストを壊さない範囲でリファクタリングを実施する。

## 実行タスク

- タスク1: e2e setup / screenshot script の認証バイパス統一
- タスク2: 削除後に不要になった import / 変数の整理
- タスク3: `localStorage.clear()` の残存箇所再確認
- タスク4: historical note のフォーマット統一

### タスク1: e2e setup / screenshot script の認証バイパス統一

**目的**: `debug-clear-storage` 前提を除去した後の認証バイパス方式が `skipAuth` / `VITE_E2E_MODE` に統一されていることを確認し、不統一箇所があればリファクタリングする

**手順**:

1. 以下のパターンで認証バイパス関連コードを検索する:
   ```bash
   rg -n "skipAuth|dev-skip-auth|VITE_E2E_MODE" apps/desktop/e2e/ apps/desktop/scripts/
   ```
2. 検出箇所が Phase 2 設計で想定した `skipAuth` / `VITE_E2E_MODE` パターンに統一されているか確認する
3. 不統一箇所がある場合、設計方針に合わせてリファクタリングする
4. リファクタリング後にテストが PASS することを確認する

**チェック項目**:

| 項目                     | 確認内容                                                     | 判定         |
| ------------------------ | ------------------------------------------------------------ | ------------ |
| e2e global-setup.ts      | `debug-clear-storage` 参照が除去され、`VITE_E2E_MODE` に統一 | (実行時記入) |
| screenshot script        | storage clear 前提が除去され、`skipAuth` に統一              | (実行時記入) |
| 認証バイパス方式の一貫性 | 複数の認証バイパスパターンが混在していないか                 | (実行時記入) |

### タスク2: 不要な import / 変数の整理

**目的**: Phase 5 の削除により不要になった import 文や変数定義を除去する

**手順**:

1. Phase 5 で変更した全ファイルを対象に、未使用 import / 未使用変数を検出する:
   ```bash
   pnpm --filter @repo/desktop lint -- --rule 'no-unused-vars: error' --rule '@typescript-eslint/no-unused-imports: error'
   ```
2. 検出箇所を修正する
3. 修正後にテストが PASS することを確認する

**注意**: ESLint の自動修正を使用する場合は、修正範囲が Phase 5 変更ファイルに限定されていることを確認する。スコープ外のファイルは修正しない。

### タスク3: `localStorage.clear()` の残存箇所再確認

**目的**: Phase 5 の削除対象外で、不要な `localStorage.clear()` が残存していないかを最終確認する

**手順**:

1. 以下の検索を実行する:
   ```bash
   rg -n "localStorage\.clear\(" apps/ scripts/
   ```
2. 検出箇所が以下のいずれかに該当するか判定する:
   - **正当な使用**: テスト用ヘルパー、ユーザー操作によるキャッシュクリア機能
   - **不要な残存**: `debug-clear-storage` に由来する workaround
3. 不要な残存が見つかった場合は、Phase 5 の対処漏れとして修正する

### タスク4: historical note のフォーマット統一

**目的**: 降格対象として historical note 化した記述のフォーマットを統一する

**手順**:

1. Phase 5 で降格した全箇所を確認する
2. 以下のフォーマットに統一されているかチェックする:
   ```markdown
   > **Historical Note** (TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001, 2026-03):
   > (記述内容)
   ```
3. フォーマットが不統一な箇所を修正する

**チェック項目**:

| 項目                 | 確認内容                                       | 判定         |
| -------------------- | ---------------------------------------------- | ------------ |
| 日付の記載           | 全 historical note に年月が記載されていること  | (実行時記入) |
| 親タスクIDの記載     | 元のタスクIDが参照されていること               | (実行時記入) |
| マークアップの統一性 | blockquote + bold の統一フォーマットであること | (実行時記入) |

## 参照資料

| 参照資料       | パス                                                                           | 説明                         |
| -------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| Phase 1 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/`          | 棚卸し結果・受入基準         |
| Phase 2 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-2/`          | 変更計画・副作用分析・設計書 |
| Phase 5 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-5/`          | 実装結果                     |
| Phase 7 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-7/`          | カバレッジ確認結果           |
| 親タスク成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/` | 親タスクの全Phase成果物      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                          | 内容                                                |
| ---------------- | ----------------------------------------------------------------------------- | --------------------------------------------------- |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | コード品質基準・リファクタリング指針                |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | debug-clear-storage / screenshot harness 分離の教訓 |

## 統合テスト連携

- リファクタリング後に全テスト PASS を確認する
- e2e / screenshot script の変更はテスト実行で動作検証する
- Phase 9 で Lint / 型チェック / 全テストの品質検証を実施する

## 成果物

| 成果物                 | パス                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| リファクタリング報告書 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-8/refactoring-report.md` |

## 完了条件

- [ ] e2e setup / screenshot script の認証バイパス方式が `skipAuth` / `VITE_E2E_MODE` に統一されていること
- [ ] Phase 5 変更ファイルに未使用 import / 未使用変数が残存していないこと
- [ ] 不要な `localStorage.clear()` が残存していないこと
- [ ] historical note のフォーマットが統一されていること
- [ ] 全テストが PASS すること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 9: 品質検証へ進む。
