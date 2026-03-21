# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 10                                          |
| Phase名    | 最終レビュー                                |
| カテゴリ   | 改善                                        |
| ステータス | completed                                   |
| 前提Phase  | Phase 9                                     |
| 後続Phase  | Phase 11                                    |

## 目的

修正内容の多角的品質・整合性を検証し、AC-1〜AC-7 の充足を最終確認して、レビュー判定を行う。

## 実行タスク

- タスク1: AC-1〜AC-7 の最終検証結果を確定する
- タスク2: スコープ外の変更が混入していないかを検証する
- タスク3: 既存テストへの影響を確認する
- タスク4: system spec / docs との整合性を確認する
- タスク5: 最終判定と差し戻し条件を明文化する

### タスク1: 受入基準の最終検証

**目的**: 全受入基準が満たされていることを最終確認する

**チェックリスト**:

| AC   | 基準                                                                                | 検証方法                                                | Phase 9 結果 | 最終判定     |
| ---- | ----------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------ | ------------ |
| AC-1 | `rg "debug-clear-storage"` の全検出箇所が分類済み                                   | Phase 1 棚卸し結果 + Phase 9 タスク5 残存検索           | (記入)       | (実行時記入) |
| AC-2 | 不要な workaround / stale comment が削除または降格済み                              | Phase 5 diff + Phase 8 historical note フォーマット確認 | (記入)       | (実行時記入) |
| AC-3 | e2e global-setup / screenshot script が現行前提で正常動作                           | Phase 9 タスク3 全テスト PASS（e2e 含む）               | (記入)       | (実行時記入) |
| AC-4 | `verify-unassigned-links.js` が PASS                                                | Phase 9 タスク6 実行結果                                | (記入)       | (実行時記入) |
| AC-5 | `audit-unassigned-tasks --target-file` で `currentViolations=0`                     | Phase 9 タスク7 実行結果                                | (記入)       | (実行時記入) |
| AC-6 | task-workflow backlog/history・lessons learned・関連 product/system spec が同期済み | Phase 5 変更 diff + Phase 12 で最終同期予定             | (記入)       | (実行時記入) |
| AC-7 | 全既存テストが PASS                                                                 | Phase 9 タスク3 実行結果                                | (記入)       | (実行時記入) |

### タスク2: スコープ外変更の混入検証

**目的**: 本タスクのスコープ（`debug-clear-storage` 残骸クリーンアップ）以外の変更が混入していないことを確認する

**手順**:

1. `git diff --stat` で変更ファイル一覧を取得する
2. 全変更ファイルが以下のいずれかに該当することを確認する:
   - Phase 1 棚卸しで検出された対象ファイル
   - Phase 2 変更計画に記載されたファイル
   - Phase 8 リファクタリングで正当に変更されたファイル（import 整理等）
   - 本タスクの仕様書・成果物ファイル
3. 上記に該当しない変更がある場合はスコープ外混入として記録する

**判定基準**:

| 分類           | 対応                                   |
| -------------- | -------------------------------------- |
| スコープ内変更 | 問題なし                               |
| 軽微な波及変更 | 正当性を確認し、レビュー報告に記録する |
| スコープ外変更 | MAJOR 判定、該当変更を revert する     |

### タスク3: 既存テストへの影響確認

**目的**: Phase 5 / Phase 8 の変更が既存テストに悪影響を与えていないことを確認する

**手順**:

1. Phase 9 の全テスト結果を確認し、失敗テストが0件であることを再確認する
2. e2e テストの実行結果を確認し、`debug-clear-storage` 関連の preflight 削除後も正常動作していることを確認する
3. screenshot script が変更後も正常に動作することを確認する（テスト結果または手動確認）

### タスク4: system spec / docs との整合性確認

**目的**: 修正内容が system spec およびドキュメントと整合していることを確認する（AC-6）

**手順**:

1. 以下のファイルが Phase 5 の変更内容と整合しているか確認する:

| ファイル                                                                                                      | 確認内容                                               | 判定         |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------ |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                                  | 完了済み backlog 行が単一エントリで維持されているか    | (実行時記入) |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-history.md`                                  | 今回の cleanup が履歴へ記録されているか                | (実行時記入) |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-ui-agent-view-nav-notification-history.md` | `debug-clear-storage` 廃止後の教訓が最新化されているか | (実行時記入) |
| `apps/desktop/docs/development/clear-storage.md`                                                              | historical note が current behavior と一致するか       | (実行時記入) |

2. 不整合が見つかった場合は Phase 12 での修正対象として記録する

### タスク5: 最終判定

**目的**: 最終レビューの判定を行う

**判定基準**:

| 判定     | 条件                                             | 対応                                           |
| -------- | ------------------------------------------------ | ---------------------------------------------- |
| PASS     | AC-1〜AC-7 全充足 + スコープ外変更なし           | Phase 11 へ                                    |
| MINOR    | AC 充足だが軽微な改善点あり                      | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | AC 未充足またはスコープ外変更の混入              | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | 要件レベルの問題（棚卸し不足、設計方針の誤り等） | Phase 1 へ戻り要件再確認                       |

**MINOR 判定時の必須対応**:

- 全ての MINOR 指摘を未タスク仕様書に変換する（「機能影響なし」でも省略不可）
- `docs/30-workflows/debug-clear-storage-shim-cleanup/unassigned-task/` に指示書を作成する
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` に登録する
- 関連仕様書に参照リンクを追加する

## 参照資料

| 参照資料         | パス                                                                                             | 説明                 |
| ---------------- | ------------------------------------------------------------------------------------------------ | -------------------- |
| Phase 1 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/`                            | 棚卸し結果・受入基準 |
| Phase 2 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-2/`                            | 変更計画・副作用分析 |
| Phase 5 実装仕様 | `phase-5-implementation.md`                                                                      | 実装結果             |
| Phase 9 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-9/quality-assurance-result.md` | 品質検証結果         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                           | 内容                                                   |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| 開発ガイドライン | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`  | コード品質基準・リファクタリング指針                   |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | Lint・型チェック・テスト品質基準                       |
| 教訓集           | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | reload / storage 初期化の再発防止                      |
| レビュー基準     | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | Phase 10 レビュー判定基準（PASS/MINOR/MAJOR/CRITICAL） |

## 統合テスト連携

- PASS 判定後、Phase 11 で手動テストを実施する
- MINOR 判定の場合は未タスク仕様書を必ず作成する（省略不可）
- MAJOR / CRITICAL 判定の場合は指定 Phase へ差し戻す

## 成果物

| 成果物             | パス                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------- |
| 最終レビュー報告書 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-10/final-review-report.md` |

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

- [ ] AC-1〜AC-7 の最終検証が完了し、全基準が充足されていること
- [ ] スコープ外の変更が混入していないことが確認されていること
- [ ] 既存テストへの影響が確認され、問題がないこと
- [ ] system spec / docs との整合性が確認されていること
- [ ] 判定結果（PASS / MINOR / MAJOR / CRITICAL）が記録されていること
- [ ] MINOR 判定の場合、未タスク仕様書が作成されていること（省略不可）
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 11: 手動テストへ進む。
