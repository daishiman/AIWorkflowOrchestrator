# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 11                                          |
| Phase名    | 手動テスト                                  |
| カテゴリ   | 改善                                        |
| ステータス | completed                                   |
| 前提Phase  | Phase 10（最終レビュー PASS）               |
| 後続Phase  | Phase 12                                    |

## 目的

Phase 5〜10 で実施した `debug-clear-storage` 残骸のクリーンアップが、本番相当の環境で正しく機能することを手動テストにより最終検証する。自動テストでは検出困難な副作用（e2e 前提崩壊、screenshot script 動作不良、Zustand persist 回帰）を網羅的に確認する。

## 実行タスク

- タスク1: 残骸完全除去の確認（AC-1, AC-2 検証）
- タスク2: e2e テスト正常動作の確認（AC-3 検証）
- タスク3: screenshot script 正常動作の確認（AC-3 検証）
- タスク4: Zustand persist 回帰テスト（親タスク回帰検証）
- タスク5: システム仕様−コード整合性の確認（AC-6 検証）
- タスク6: リンク整合性・全テスト PASS の確認（AC-4, AC-5, AC-7 検証）

### タスク1: 残骸完全除去の確認

**目的**: `debug-clear-storage` を前提としたコード・コメントが repo から完全に除去されていることを確認する

**手順**:

1. 以下の検索コマンドを実行し、検出件数が 0 であることを確認する:
   ```bash
   rg -n "debug-clear-storage" apps/ scripts/
   rg -n "localStorage\.clear\(" apps/desktop/src/renderer/App.tsx
   rg -n "window\.location\.reload\(" apps/desktop/src/renderer/App.tsx
   rg -n "sessionStorage\.setItem.*debug" apps/desktop/e2e/
   ```
2. docs/ および .claude/skills/ 内の検出箇所が historical note に降格済みであることを確認する:

   ```bash
   rg -n "debug-clear-storage" docs/ .claude/skills/
   ```

   - 検出された場合、過去形・注記形式（「削除済み」「廃止」等）であることを目視確認する

3. stale な workaround コメントが残っていないことを確認する

**合否基準**:

- apps/ および scripts/ 配下で `debug-clear-storage` の検出件数が 0
- docs/ および .claude/skills/ 配下の検出箇所が全て historical note 形式

### タスク2: e2e テスト正常動作の確認

**目的**: `debug-clear-storage` の sessionStorage 設定を除去した後も、e2e テストが正常に動作することを確認する

**手順**:

1. `apps/desktop/e2e/global-setup.ts` を確認し、`debug-clear-storage` 関連コードが除去されていることを確認する
2. 認証バイパス機構（`VITE_E2E_MODE` / `skipAuth` / `dev-skip-auth`）が引き続き正常に機能することを確認する
3. e2e テストを実行する:

   ```bash
   cd apps/desktop && pnpm exec playwright test --reporter=list 2>&1 | head -50
   ```

   - テスト環境の制約で実行不可の場合、`global-setup.ts` のコードレビューで代替する

4. テスト結果を記録する

**合否基準**:

- e2e テストが PASS、または global-setup.ts のコードレビューで認証バイパスが正常であることを確認済み

### タスク3: screenshot script 正常動作の確認

**目的**: screenshot script が `debug-clear-storage` 前提を外した状態で正常動作することを確認する

**手順**:

1. screenshot script のコードを確認し、storage clear 前提のコードが除去または更新済みであることを確認する
2. script を実行して正常終了することを確認する（P53: CLI 環境での制約を考慮）:
   - 実行可能な場合: script を実行し出力を記録する
   - CLI 環境制約がある場合: コードレビューと lint チェックで代替する
3. 結果を記録する

**合否基準**:

- screenshot script が正常終了する、またはコードレビューで storage clear 前提が除去済みであることを確認済み

### タスク4: Zustand persist 回帰テスト

**目的**: 親タスク（TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001）の修正が引き続き有効であること、すなわち Zustand persist 状態がアプリ再起動後も保持されることを確認する

**手順**:

1. `apps/desktop/src/renderer/App.tsx` に `localStorage.clear()` / `window.location.reload()` が存在しないことを確認する:
   ```bash
   rg -n "localStorage\.clear\|window\.location\.reload" apps/desktop/src/renderer/App.tsx
   ```
2. Zustand persist の `customStorage` が正常に定義されていることを確認する
3. 関連するユニットテストを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/store/ --reporter=verbose 2>&1 | tail -30
   ```
4. テスト結果を記録する

**合否基準**:

- App.tsx に debug storage clear コードが存在しないこと
- Store 関連のユニットテストが全て PASS

### タスク5: システム仕様−コード整合性の確認

**目的**: system spec の記述と実際のコードが整合していることを確認する

**手順**:

1. 以下のシステム仕様書を確認し、`debug-clear-storage` 関連の記述が実態と整合していることを確認する:
   - `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
   - `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`
   - `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
2. 仕様書内で「削除済み」「廃止」として記録されている箇所が、実際にコードから除去されていることを突合する
3. 不整合がある場合は記録する

**合否基準**:

- 仕様書の記述と実際のコード状態に不整合がないこと

### タスク6: リンク整合性・全テスト PASS の確認

**目的**: リンク整合性スクリプトの PASS と全テストスイートの PASS を確認する

**手順**:

1. リンク整合性チェックを実行する:
   ```bash
   node scripts/verify-unassigned-links.js 2>&1 | tail -20
   ```
2. 未タスク監査を実行する（該当する場合）:
   ```bash
   node scripts/audit-unassigned-tasks.js 2>&1 | tail -20
   ```
3. 全テストスイートを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run --reporter=verbose 2>&1 | tail -50
   ```
4. テスト結果を記録する

**合否基準**:

- `verify-unassigned-links.js` が PASS
- 全テストスイートが PASS（AC-7）

## 参照資料

| 参照資料         | パス                                                                                        | 説明                    |
| ---------------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 2 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-2/`                       | 変更計画・副作用分析    |
| Phase 5 実装仕様 | `phase-5-implementation.md`                                                                 | 実装対象・修正方針      |
| Phase 6 成果物   | `phase-6-test-expansion.md`                                                                 | 拡充テスト仕様          |
| Phase 7 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-7/`                       | カバレッジ判定          |
| Phase 8 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-8/`                       | リファクタリング結果    |
| Phase 10 成果物  | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-10/`                      | 最終レビュー結果        |
| Phase 9 成果物   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-9/`                       | 品質検証結果            |
| Phase 1 受入基準 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-7 定義         |
| 親タスク成果物   | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/`              | 親タスクの全Phase成果物 |

### システム仕様（aiworkflow-requirements）

> テスト実行前に以下のシステム仕様を確認し、検証観点の漏れがないことを確認してください。

| 参照資料           | パス                                                                          | 内容                                  |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------- |
| 状態管理設計       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`  | Zustand persist 回帰テストの観点      |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | debug コード管理ルールとの整合性検証  |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | reload / storage 初期化の再発条件確認 |
| Phase 11-12 ガイド | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`   | 手動テスト実行ガイドライン            |

## 統合テスト連携

- タスク2（e2e テスト）で不具合が検出された場合、Phase 5 に差し戻して修正する
- タスク4（Zustand persist 回帰）で問題が検出された場合、親タスクの修正が損なわれていないか調査する
- タスク6（全テスト PASS）で失敗がある場合、Phase 9 の品質検証結果と照合して原因を特定する

## 成果物

| 成果物                   | パス                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| 手動テストチェックリスト | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-11/manual-test-checklist.md`     |
| 手動テスト結果           | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-11/manual-test-result.md`        |
| スクリーンショット計画   | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-11/screenshot-plan.json`         |
| 画面証跡                 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-11/screenshots/README.md`        |
| 画面証跡PNG              | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-11/screenshots/phase11-pass.png` |
| 手動テスト結果報告書     | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-11/manual-test-report.md`        |
| テスト実行ログ           | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-11/test-execution-log.md`        |

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

- [ ] タスク1: `rg "debug-clear-storage"` で apps/ scripts/ の検出件数が 0 であること
- [ ] タスク1: docs/ .claude/skills/ の検出箇所が全て historical note 形式であること
- [ ] タスク2: e2e テストが正常動作すること（またはコードレビューで確認済み）
- [ ] タスク3: screenshot script が正常動作すること（またはコードレビューで確認済み）
- [ ] タスク4: App.tsx に debug storage clear コードが存在しないこと
- [ ] タスク4: Store 関連ユニットテストが全て PASS
- [ ] タスク5: システム仕様書とコードに不整合がないこと
- [ ] タスク6: `verify-unassigned-links.js` が PASS
- [ ] タスク6: 全テストスイートが PASS
- [ ] 手動テスト結果報告書が作成されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 12: ドキュメントへ進む。
