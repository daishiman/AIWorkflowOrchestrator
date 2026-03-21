# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 1                                           |
| Phase名    | 要件定義                                    |
| カテゴリ   | 改善                                        |
| 優先度     | 中                                          |
| ステータス | completed                                   |
| 前提Phase  | なし                                        |
| 後続Phase  | Phase 2                                     |

## 目的

`debug-clear-storage` に依存する repo-wide の残骸を棚卸しし、削除・降格・再分割の判断基準を定義する。受入基準（AC-1〜AC-7）を確定する。

## 背景

### 問題の概要

`TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` で `App.tsx` L46-61 のデバッグコード本体は削除済みだが、repo 全体に以下が残存している:

1. `apps/desktop/e2e/global-setup.ts` の `sessionStorage.setItem("debug-clear-storage", "done")`
2. screenshot script 内の storage clear 前提のコード
3. completed workflow docs 内の stale な前提記述
4. `.claude/skills/` 内の workaround 説明

### なぜこのタスクが必要か

- 新しい不具合調査で「まだ本番で storage clear している」と誤読されるリスク
- screenshot / e2e preflight が不要な前提を引きずり、false positive / false negative を生むリスク
- system spec と code の整合が再び崩れるリスク

## 実行タスク

- Step 0: P50チェック（既実装状態の調査）を実施する
- タスク1: repo-wide 横断検索を実行し、`debug-clear-storage` 関連の全箇所を列挙する
- タスク2: 検出箇所を分類し、削除/降格/維持の判断基準を定義する
- タスク3: 受入基準（AC-1〜AC-7）と検証方法を確定する

### Step 0: P50チェック（既実装状態の調査）

**目的**: Phase 1 開始前に対象ファイルの実装状態を確認し、既実装コードの重複作成を防止する（P50 準拠）

**手順**:

1. 対象ファイルの最近のコミット履歴を確認する:
   ```bash
   git log --oneline -20 -- apps/desktop/e2e/global-setup.ts
   git log --oneline -20 -- apps/desktop/src/renderer/App.tsx
   ```
2. `debug-clear-storage` 関連の修正が既に実施されているか確認する:
   ```bash
   rg -n "debug-clear-storage" apps/ scripts/
   ```
3. 親タスク（TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001）の成果物を確認し、既に対処済みの箇所を把握する

| 判定       | 条件                                   | 対応                                             |
| ---------- | -------------------------------------- | ------------------------------------------------ |
| 未実装     | `debug-clear-storage` 残骸が検出される | タスク1 以降を通常実行する                       |
| 一部実装済 | 一部の箇所で既に修正済み               | 残りの箇所のみを対象としてタスク1 以降を実行する |
| 全実装済   | 全箇所が既に対処済み                   | Phase 4-5 を「検証・補完」モードに切り替える     |

### タスク1: repo-wide 横断検索

**目的**: `debug-clear-storage` とその周辺パターンの全使用箇所を列挙する

**手順**:

1. 以下の検索を実行し、全検出箇所を記録する:
   ```bash
   rg -n "debug-clear-storage" apps/ docs/ .claude/ scripts/
   rg -n "localStorage\.clear\(" apps/ docs/ .claude/ scripts/
   rg -n "window\.location\.reload\(" apps/ docs/ .claude/ scripts/
   rg -n "sessionStorage\.setItem.*debug" apps/ docs/ .claude/ scripts/
   ```
2. 検出箇所をファイルパス・行番号・コンテキストとともにリスト化する
3. App.tsx の修正済み箇所は対象外であることを確認する

**期待される成果物**:

- 検出箇所一覧テーブル（ファイルパス / 行番号 / コンテキスト / 用途推定）

### タスク2: 分類と判断基準定義

**目的**: 検出箇所を3カテゴリに分類し、対処方法を決定する

**分類基準**:

| カテゴリ           | 定義                                  | 対処方法                       |
| ------------------ | ------------------------------------- | ------------------------------ |
| runtime dependency | 本番/テスト実行時に必要なコード       | 役割を再確認し、不要なら削除   |
| test helper        | e2e / screenshot 用の検証コード       | 現行前提に合わせて更新 or 削除 |
| historical doc     | 完了タスクの docs / workflow 内の記述 | historical note に降格         |

**手順**:

1. タスク1の一覧に対して、各検出箇所のカテゴリを判定する
2. `skipAuth` / `dev-skip-auth` / `VITE_E2E_MODE` との関係を整理する
3. 各カテゴリの対処方法を確定する

### タスク3: 受入基準の確定

**目的**: 修正完了の判定基準を定義する

**受入基準**:

| ID   | 基準                                                                                | 検証方法              |
| ---- | ----------------------------------------------------------------------------------- | --------------------- |
| AC-1 | `rg "debug-clear-storage"` の全検出箇所が分類済み                                   | 棚卸し結果レビュー    |
| AC-2 | 不要な workaround / stale comment が削除または降格済み                              | コードレビュー / diff |
| AC-3 | e2e global-setup / screenshot script が現行前提で正常動作                           | テスト実行            |
| AC-4 | `verify-unassigned-links.js` が PASS                                                | スクリプト実行        |
| AC-5 | `audit-unassigned-tasks --target-file` で `currentViolations=0`                     | スクリプト実行        |
| AC-6 | task-workflow backlog/history・lessons learned・関連 product/system spec が同期済み | diff レビュー         |
| AC-7 | 全既存テストが PASS                                                                 | `pnpm test` 実行      |

## 参照資料

| 参照資料       | パス                                                                                                                                           | 説明                     |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 親タスク仕様書 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/`                                                                 | 親タスクの全Phase成果物  |
| 未タスク指示書 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/unassigned-task/task-fix-debug-clear-storage-shim-cleanup-001.md` | 本タスクの元となる指示書 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                              | 内容                                                   |
| -------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| 状態管理設計         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Zustand persist / localStorage 永続化戦略・DD-04/DD-05 |
| IPC永続化設計        | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`       | localStorage/electron-store 永続化パターン             |
| 開発ガイドライン     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | デバッグコード管理・shared app shell 禁止ルール        |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | reload / storage 初期化の再発条件・再発防止策          |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom / localStorage polyfill / E2E前提            |

## 統合テスト連携

- Phase 4 で `debug-clear-storage` 残存有無を自動検証するテストを作成する
- Phase 5 で検出箇所の削除/降格を実施する
- Phase 6 で e2e / screenshot script の動作を統合テストで確認する
- Phase 11 で手動テストにより全体の整合性を最終確認する

## 成果物

| 成果物     | パス                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 要件定義書 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/requirements-definition.md` |
| 棚卸し結果 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/inventory-result.md`        |
| 受入基準   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/acceptance-criteria.md`     |

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

- [ ] P50チェック（既実装状態の調査）が実行され、判定結果が記録されていること
- [ ] repo-wide 横断検索が実行され、全検出箇所がリスト化されていること
- [ ] 検出箇所が3カテゴリに分類され、対処方法が確定していること
- [ ] 受入基準（AC-1〜AC-7）が定義され、検証方法が明確であること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 2: 設計へ進む。
