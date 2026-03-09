# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 3                                         |
| Phase名    | 設計レビュー                              |
| カテゴリ   | fix                                       |
| ステータス | completed                                 |
| 前提Phase  | Phase 2                                   |
| 後続Phase  | Phase 4                                   |

## 目的

Phase 2 の設計内容を検証し、削除対象の範囲が正確であること、副作用がないことを確認する。

## 実行タスク

- タスク1: 要件と設計の整合性をレビューする
- タスク2: 技術的妥当性と副作用なしの根拠をレビューする
- タスク3: レビュー判定を確定し、次Phaseへの進行条件を固定する

### タスク1: 要件-設計整合性レビュー

**目的**: Phase 1 の受入基準が Phase 2 の設計で全てカバーされていることを検証する

**手順**:

1. AC-1〜AC-6 の各基準について、設計での対応を確認
2. スコープ外の項目が誤って設計に含まれていないことを確認
3. 削除対象行（L45-61）の正確性を検証

**レビューチェックリスト**:

| AC   | 設計での対応                                                    | 判定             |
| ---- | --------------------------------------------------------------- | ---------------- |
| AC-1 | L45-61 削除                                                     | 対応済み         |
| AC-2 | localStorage.clear() を含むコード全体が削除される               | 対応済み         |
| AC-3 | persist hardening が復活する（localStorage が破壊されなくなる） | 対応済み         |
| AC-4 | window.location.reload() が削除される                           | 対応済み         |
| AC-5 | VITE_E2E_MODE/skipAuth=true はデバッグコード内のみ → 影響なし   | 対応済み         |
| AC-6 | テスト実行で確認                                                | Phase 4-9 で対応 |

### タスク2: 技術的妥当性レビュー

**目的**: 設計の技術的妥当性を検証する

**手順**:

1. `useEffect` import の維持判断が正しいことを確認（L71, L87, L100 で使用）
2. 削除後のコードが構文的に正しいことを確認
3. React StrictMode での二重実行による問題がないことを確認（削除なので問題なし）
4. 他のファイルからの依存がないことを確認（App.tsx は export default のみ）

### タスク3: レビュー判定

**目的**: 設計レビューの最終判定を行う

**判定基準**:

| 判定              | 条件                                   |
| ----------------- | -------------------------------------- |
| PASS              | 全チェック項目が OK                    |
| MINOR             | 軽微な改善点あり（Phase 4 へ進行可能） |
| MAJOR（要件問題） | Phase 1 へ戻る                         |
| MAJOR（設計問題） | Phase 2 へ戻る                         |

**期待される判定**: PASS（単純なコード削除のため、設計上の問題は想定されない）

## 参照資料

| 参照資料       | パス                                                                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Phase 1 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-1-requirements.md` |
| Phase 2 成果物 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-2-design.md`       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                          | 内容                                                                      |
| ------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| IPC永続化設計      | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`   | storage 破壊が persist 契約へ与える影響                                   |
| 状態管理設計       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`  | Zustand persist ミドルウェア設計・localStorage 永続化戦略                 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`         | エラーカテゴリ・リトライ戦略・BROWSER_GET_LAST_WEB_PREFERENCES エラー対処 |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` | デバッグコード管理・ロギング規約・TODO コメント運用                       |
| 教訓集             | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`        | `window.location.reload()` と証跡不整合の再発条件                         |

## 統合テスト連携

- レビュー PASS 後、Phase 4 でテスト作成に着手
- MINOR 判定の場合は指摘対応後 Phase 4 へ

## 成果物

| 成果物             | パス                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| 設計レビュー報告書 | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-3-design-review.md` |

## 完了条件

- [ ] 要件-設計整合性レビューが完了していること
- [ ] 技術的妥当性レビューが完了していること
- [ ] レビュー判定が PASS または MINOR であること
- [ ] MINOR の場合、指摘事項が明記されていること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 4: テスト作成へ進む。
