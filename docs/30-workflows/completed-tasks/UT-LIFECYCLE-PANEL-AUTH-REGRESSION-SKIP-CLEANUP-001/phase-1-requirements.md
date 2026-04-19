# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| PhaseID    | 1                                                               |
| Phase名    | 要件定義                                                        |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前Phase    | なし                                                            |
| 次Phase    | Phase 2                                                         |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

`SkillLifecyclePanel.auth-regression.test.tsx` に残存する 5 件の `describe.skip` を精査し、
スキップ原因（廃止済み props / testid / 旧フロー依存）を特定して「修正」または「削除」の処置方針を確定する。
受け入れ基準 AC-1〜AC-5 を固定し、後続 Phase への入力を確定する。

## 背景

`auth-regression.test.tsx` はウィザード起動時・スキル生成フロー中に `auth:login` IPC が不正に呼ばれないことを検証する
セキュリティ重要な回帰テストスイートである。

現状では以下の 5 件が `describe.skip` の状態であり、`auth:login` IPC の回帰検出が機能していない:

- TC-03（行305）: skill generation completes without auth:login timeout
- TC-05（行431）: skill generation does not call auth:login when user is unauthenticated
- TC-06（行501）: rapid skill generation clicks do not trigger multiple auth:login
- TC-07（行590）: auth:login is not triggered on component re-render during skill flow
- TC-08（行686）: authModeSlice state changes do not trigger unexpected auth:login

テストコードを観察すると、TC-03/TC-05/TC-06/TC-07 は `SkillLifecyclePanel` に対して
`isOpen={true}` / `defaultTab="create"` という props を渡しており、現行コンポーネントに
これらの props が存在しない場合は TypeScript エラーでテストが通らない（skip 原因の有力候補）。
また `fillCreateRequest()` が no-op 化されており、旧テキストエリア入力フローに依存するテストは
prepare ボタン押下前の状態を正しく設定できない。

TC-08 は `authModeSlice` の `resetAuthModeListenerFlag` を使用しており、
現行 `authModeSlice.ts` に当該 export は存在するため、主因は listener API そのものより
テスト側の状態操作手順や周辺前提のドリフトにある可能性が高い。

## Step 0: P50チェック

対象ファイルの現在状態を確認する。

```bash
# 対象ファイルの存在確認
test -e apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx \
  && echo "present" || echo "deleted"

# describe.skip 件数確認
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# describe.skip の全箇所を確認
grep -n "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# SkillLifecyclePanel の現行 props 定義確認（isOpen / defaultTab が存在するか）
grep -n "isOpen\|defaultTab\|onOpenWizard\|onOpenSkillWizard" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -20

# fillCreateRequest / skill-lifecycle-prepare-button の現行テスト側記述確認
grep -n "fillCreateRequest\|skill-lifecycle-prepare-button\|clickPrepareButton" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# authModeSlice に resetAuthModeListenerFlag が export されているか確認
grep -n "resetAuthModeListenerFlag\|export" \
  apps/desktop/src/renderer/store/slices/authModeSlice.ts | head -20

# 最近のコミット履歴確認
git log --oneline -15 -- \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

## 実行タスク

- [ ] P50チェック: 対象ファイルの describe.skip 件数・スキップ原因の確認
- [ ] 5件の describe.skip を「修正」「削除」に分類する
- [ ] 問題点の整理: auth回帰検出不能・セキュリティリスク・スキップ理由不明・保守コスト増大の4点を明示
- [ ] 受け入れ基準 AC-1〜AC-5 の固定
- [ ] タスク分類の宣言: CLEANUPタスク / テストファイルのみ変更 / NON_VISUAL

## 5件の describe.skip 初期分類

| ID    | describe 名                                                            | 行番号 | 推定スキップ原因                                            | 分類方針    |
| ----- | ---------------------------------------------------------------------- | ------ | ----------------------------------------------------------- | ----------- |
| TC-03 | skill generation completes without auth:login timeout                  | 305    | `isOpen`/`defaultTab` props 廃止・`fillCreateRequest` no-op | 要調査→修正 |
| TC-05 | skill generation does not call auth:login when user is unauthenticated | 431    | `isOpen`/`defaultTab` props 廃止・`fillCreateRequest` no-op | 要調査→修正 |
| TC-06 | rapid skill generation clicks do not trigger multiple auth:login       | 501    | `isOpen`/`defaultTab` props 廃止・`fillCreateRequest` no-op | 要調査→修正 |
| TC-07 | auth:login is not triggered on component re-render during skill flow   | 590    | `isOpen`/`defaultTab` props 廃止・`fillCreateRequest` no-op | 要調査→修正 |
| TC-08 | authModeSlice state changes do not trigger unexpected auth:login       | 686    | `resetAuthModeListenerFlag` export 廃止の可能性             | 要調査→修正 |

## 問題点の整理

| 問題               | 詳細                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| auth回帰検出不能   | `auth:login` IPC の不正呼び出しを検証するテスト5件がスキップ状態のため、リグレッションが発生しても検出できない                       |
| セキュリティリスク | スキル生成フロー中に `auth:login` が不正に呼ばれても検知されない状態が続いており、認証フローの安全性保証が欠落している               |
| スキップ理由不明   | `describe.skip` にコメントが付いておらず、なぜスキップされているのか・いつ有効化するのかが明示されていないため、保守コストが増大する |
| CI信頼性低下       | skip されたテストはカバレッジに算入されず、CI の「全テスト PASS」表示がミスリーディングになる                                        |

## 受け入れ基準

| ID   | 受け入れ基準                                                 | 検証方法                                                              |
| ---- | ------------------------------------------------------------ | --------------------------------------------------------------------- |
| AC-1 | 5件の `describe.skip` が 0 件になっている                    | `grep -c "describe\.skip"` の結果が 0 件                              |
| AC-2 | 修正したテストが全て PASS する                               | `pnpm --filter @repo/desktop exec vitest run` で対象ファイルが全 PASS |
| AC-3 | `auth:login` IPC を検証するテストが最低 1 件有効化されている | TC-03〜TC-07 のうち最低 1 件が `describe` 状態で PASS する            |
| AC-4 | `pnpm --filter @repo/desktop test:run` が PASS する          | CI 相当のテスト実行が全件 PASS                                        |
| AC-5 | TypeScript 型チェックが 0 error である                       | `pnpm --filter @repo/desktop typecheck` が PASS                       |

## スコープ定義

### 含む

- `describe.skip` の解消（修正・削除）
- 廃止済み props（`isOpen` / `defaultTab`）の使用箇所の修正または削除
- `fillCreateRequest()` no-op 化に伴うテストロジックの修正または削除
- `resetAuthModeListenerFlag` の存在確認と TC-08 の処置

### 含まない

- プロダクションコード（`SkillLifecyclePanel.tsx` / `authModeSlice.ts`）の変更
- 新しいテストケースの追加
- `SkillLifecyclePanel.llm-generation.test.tsx` のスキップ処理（別タスク対象）
- auth 関連の仕様変更

## タスク分類の宣言

| 分類項目   | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスク種別 | CLEANUPタスク                                      |
| 変更範囲   | テストファイルのみ（プロダクションコード変更なし） |
| UIタスク   | 非UIタスク（UIの見た目変更なし）                   |
| 可視性     | NON_VISUAL（テストコードのみ変更）                 |
| テスト種別 | コンポーネントテスト（desktop renderer 層）        |

## 統合テスト連携

| 判定項目               | 基準 | 結果    |
| ---------------------- | ---- | ------- |
| ユニットテストLine     | 80%+ | pending |
| ユニットテストBranch   | 60%+ | pending |
| ユニットテストFunction | 80%+ | pending |
| ユニットテストLines    | 80%+ | pending |

## 多角的チェック観点

| 観点                      | チェック内容                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------------- |
| props 廃止の影響確認      | `SkillLifecyclePanel.tsx` に `isOpen` / `defaultTab` が存在しないことを確認し、修正の方向性を決める |
| fillCreateRequest の影響  | no-op 化された `fillCreateRequest()` を使用するテストが正しく動作する形に修正可能かを確認する       |
| resetAuthModeListenerFlag | `authModeSlice.ts` にこの export が存在するか確認し、TC-08 の修正可能性を判断する                   |
| セキュリティ観点の優先度  | auth:login 回帰検出テストはセキュリティ重要度が高いため、削除より修正を優先して検討する             |
| CI 整合性                 | describe.skip 除去後に CI が正常動作し、カバレッジが正確に計測されることを確認する                  |

## 参照資料

| 資料名                                       | パス                                                                                                | 用途                                     |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| SkillLifecyclePanel.auth-regression.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | describe.skip 件数・スキップ原因の確認   |
| SkillLifecyclePanel.tsx                      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | 現行 props 定義・testid の確認           |
| authModeSlice.ts                             | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                                           | resetAuthModeListenerFlag の export 確認 |
| authSlice.ts                                 | `apps/desktop/src/renderer/store/slices/authSlice.ts`                                               | login() thunk の現行実装確認             |
| SkillLifecyclePanel.test.tsx                 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                 | 既存テスト構造・モックパターン参照       |
| UT-W2-03A 仕様書                             | `docs/30-workflows/completed-tasks/UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001/`                      | 先行タスクの設計パターン参照             |
| GitHub Issue #2237                           | [#2237](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2237)                            | タスク背景・要件原本                     |
| aiworkflow-requirements refs                 | `.claude/skills/aiworkflow-requirements/references/`                                                | プロジェクト共通仕様参照                 |

## 成果物

| 成果物       | パス                                         | 説明                                    |
| ------------ | -------------------------------------------- | --------------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 問題点・5件分類・受け入れ基準・スコープ |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC-1〜AC-5 の検証可能な定義             |

## 完了条件

- [ ] P50チェック実施済み（describe.skip 件数・スキップ原因の確認を完了）
- [ ] 5件の describe.skip を「修正」「削除」に分類済み
- [ ] 問題点（4点: auth回帰検出不能・セキュリティリスク・スキップ理由不明・CI信頼性低下）を整理済み
- [ ] AC-1〜AC-5 が検証可能な形で定義されている
- [ ] タスク分類（CLEANUP / テストファイルのみ / NON_VISUAL）を宣言済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001
```

## 次Phase

Phase 2（設計）へ進む。
