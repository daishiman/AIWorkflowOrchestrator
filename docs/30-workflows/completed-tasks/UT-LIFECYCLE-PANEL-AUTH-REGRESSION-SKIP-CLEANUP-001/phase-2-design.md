# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| PhaseID    | 2                                                               |
| Phase名    | 設計                                                            |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前Phase    | Phase 1                                                         |
| 次Phase    | Phase 3                                                         |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

Phase 1 で特定した 5 件の `describe.skip` について、各 TC のスキップ原因（廃止済み props / testid 依存・
`fillCreateRequest` no-op 化・`resetAuthModeListenerFlag` の存在有無）を確認し、
具体的な処置内容・処置順序・`auth:login` モックパターンの現行フロー整合設計を確定する。

セキュリティ重要テストの `auth:login` 回帰検出を復活させることを最優先として、
修正可能なテストは現行 UI・props・API に合わせて修正し、
修正不能（代替手段なし）なテストのみ削除する方針とする。

## 実行タスク

- [ ] 各 TC（TC-03/TC-05/TC-06/TC-07）の廃止済み props・testid の確認と修正設計
- [ ] `fillCreateRequest()` no-op 化に伴うテストロジックの再設計
- [ ] TC-08 の `resetAuthModeListenerFlag` export 存在確認と修正設計
- [ ] `auth:login` モックパターンの現行フロー整合設計
- [ ] concern 数による設計判断（単一ファイル確認）
- [ ] 検証マトリクスの定義

## 参照資料

| 資料名                                       | パス                                                                                                | 用途                                     |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Phase 1 成果物                               | `outputs/phase-1/requirements-definition.md`                                                        | 要件・AC 参照                            |
| SkillLifecyclePanel.auth-regression.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | 対象テストファイルの全体構造確認         |
| SkillLifecyclePanel.tsx                      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | 現行 props 定義・testid の実装確認       |
| authModeSlice.ts                             | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                                           | resetAuthModeListenerFlag の export 確認 |
| authSlice.ts                                 | `apps/desktop/src/renderer/store/slices/authSlice.ts`                                               | login() thunk の現行フロー確認           |
| SkillLifecyclePanel.test.tsx                 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`                 | 既存アクティブテストのモックパターン参照 |
| GitHub Issue #2237                           | [#2237](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2237)                            | タスク背景・設計オプション参照           |

## 実行手順

### 1. 各TCのテスト内容確認コマンド

```bash
# TC-03 の全体構造確認（行305から約60行）
sed -n '305,365p' \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# TC-05 の全体構造確認（行431から約65行）
sed -n '431,495p' \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# TC-06 の全体構造確認（行501から約85行）
sed -n '501,585p' \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# TC-07 の全体構造確認（行590から約90行）
sed -n '590,680p' \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# TC-08 の全体構造確認（行686から約85行）
sed -n '686,768p' \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

### 2. SkillLifecyclePanel.tsx の auth:login 関連実装確認

```bash
# SkillLifecyclePanel の現行 props インターフェース確認（isOpen / defaultTab の有無）
grep -n "interface\|type.*Props\|isOpen\|defaultTab\|onOpenWizard\|onOpenSkillWizard" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -30

# skill-lifecycle-prepare-button testid の現行 UI での存在確認
grep -n "skill-lifecycle-prepare-button\|data-testid" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -20

# auth:login 呼び出し箇所の確認（プロダクションコード側に不正呼び出しがないことを確認）
grep -n "auth\|login\|electronAPI" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -20

# skill-lifecycle-open-wizard-button の存在確認（TC-01 で使われる testid）
grep -n "skill-lifecycle-open-wizard-button\|skill-lifecycle-mode-label\|skill-lifecycle-session-log" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

### 3. authModeSlice・useAuthMode 等の現行フロー確認

```bash
# authModeSlice の export 一覧確認（resetAuthModeListenerFlag の存在有無）
grep -n "export\|resetAuthModeListenerFlag\|createAuthModeSlice" \
  apps/desktop/src/renderer/store/slices/authModeSlice.ts | head -30

# authModeSlice の setMode 実装確認（TC-08 のテスト対象）
grep -n "setMode\|mode\|electronAPI.*authMode" \
  apps/desktop/src/renderer/store/slices/authModeSlice.ts | head -30

# authSlice の login thunk 確認（TC-04 で既にアクティブ）
grep -n "export\|login\|createAuthSlice" \
  apps/desktop/src/renderer/store/slices/authSlice.ts | head -20

# useAuthMode フックの有無確認
grep -rn "useAuthMode\|useAuthModeSlice" \
  apps/desktop/src/renderer/store/ | head -10
```

### 4. 処置方針設計テーブル

各 TC のスキップ原因と対応策を設計する。

| TC    | スキップ推定原因                                            | 対応策                                                                                                                                                                       | 処置後の状態    |
| ----- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| TC-03 | `isOpen`/`defaultTab` props 廃止・`fillCreateRequest` no-op | props 廃止確認後、廃止済み props を除去し `fillCreateRequest` 呼び出しを削除。現行 props に合わせて修正。`skill-lifecycle-prepare-button` が存在する場合は `describe` に昇格 | 要確認→修正優先 |
| TC-05 | `isOpen`/`defaultTab` props 廃止・`fillCreateRequest` no-op | TC-03 と同様の対応。未認証状態でのモック設定は維持しつつ、現行 props・UI フローに合わせて修正                                                                                | 要確認→修正優先 |
| TC-06 | `isOpen`/`defaultTab` props 廃止・`fillCreateRequest` no-op | TC-03/TC-05 と同様。連続押下テストは `createDeferredPromise` パターンを維持して修正可能性あり                                                                                | 要確認→修正優先 |
| TC-07 | `isOpen`/`defaultTab` props 廃止・`fillCreateRequest` no-op | TC-03〜TC-06 と同様。rerender パターンは現行 props に合わせて修正可能性あり                                                                                                  | 要確認→修正優先 |
| TC-08 | `resetAuthModeListenerFlag` export 廃止の可能性             | export 存在確認後、存在すれば `describe` に昇格。存在しない場合は `resetAuthModeListenerFlag` 呼び出しを除去して修正、または `createAuthModeSlice` の直接テストに書き直し    | 要確認→修正優先 |

### 5. auth:login モックパターンの現行フロー整合設計

TC-03〜TC-07 では `mockAuthLogin` を `window.electronAPI.auth.login` に設定し、
テスト終了後に `delete window.skillCreatorAPI` を行うパターンを採用している。
このパターン自体は TC-01（アクティブ）でも使われており現行フローに整合している。

```bash
# TC-01（アクティブ）のモック設定パターンを確認して TC-03〜TC-07 との差異を分析
grep -n "electronAPI\|skillCreatorAPI\|mockAuthLogin\|mockDetectMode" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx | head -40

# 現行の SkillLifecyclePanel.test.tsx での electronAPI モックパターン確認
grep -n "electronAPI\|skillCreatorAPI\|window\." \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx | head -20
```

モック設計方針:

- `window.electronAPI.auth.login = mockAuthLogin` パターン: 現行フローに整合（維持）
- `window.skillCreatorAPI.detectMode` / `planSkill` の設定: `detectMode` は現行 API、`planSkill` は廃止済みのため設定自体は問題ないが、テスト検証では `mockPlanSkill` not called を維持する
- `fillCreateRequest()` の呼び出し: no-op のため削除またはコメントアウトして、代わりに prepare ボタン直接クリックに変更する

### 6. 検証マトリクスの定義

| テスト対象                         | テストコマンド                                                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 対象テストファイル単体実行         | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx --reporter=verbose` |
| SkillLifecyclePanel 関連テスト全体 | `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel`                                             |
| desktop テスト全体                 | `pnpm --filter @repo/desktop test:run`                                                                                                                |
| 型チェック                         | `pnpm --filter @repo/desktop typecheck`                                                                                                               |
| lint                               | `pnpm --filter @repo/desktop lint`                                                                                                                    |

## concern 数による設計判断

本タスクの変更対象は `SkillLifecyclePanel.auth-regression.test.tsx` の単一ファイルのみである。
concern 数 = 1（テストコードの修正のみ）のため、単一ファイル設計として進める。
サブタスクの分割は不要。

## 多角的チェック観点

| 観点                         | チェック内容                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| props 廃止の修正安全性       | `isOpen` / `defaultTab` を除去した場合に TypeScript エラーが解消されることを確認する                                 |
| fillCreateRequest の代替設計 | no-op 化された `fillCreateRequest()` を削除して prepare ボタン直接クリックに変更しても検証意図が維持されるか確認する |
| resetAuthModeListenerFlag    | TC-08 が依存する export が存在しない場合の代替テスト設計（`createAuthModeSlice` 直接テスト）を検討する               |
| セキュリティ観点の優先度     | 5件すべての `auth:login` 回帰検出テストの有効化を目指し、削除は最終手段とする                                        |
| アクティブテストへの影響     | TC-01/TC-02/TC-04（アクティブ）のテストに修正が影響しないことを確認する                                              |

## 統合テスト連携

| 判定項目               | 基準    | 結果    |
| ---------------------- | ------- | ------- |
| 型チェック（設計段階） | PASS    | pending |
| lint                   | 0 error | pending |
| describe.skip 件数確認 | 5件→0件 | pending |

## サブタスク管理

1. TC-03/TC-05/TC-06/TC-07 の廃止済み props・fillCreateRequest 修正設計
2. TC-08 の `resetAuthModeListenerFlag` 存在確認と修正設計
3. `auth:login` モックパターンの現行フロー整合設計
4. 検証マトリクス定義
5. 成果物の出力

## 成果物

| 成果物 | パス                        | 説明                                          |
| ------ | --------------------------- | --------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | 5件の処置詳細・モック整合設計・検証マトリクス |

## 完了条件

- [ ] TC-03/TC-05/TC-06/TC-07 の廃止済み props・`fillCreateRequest` の修正設計が完了している
- [ ] TC-08 の `resetAuthModeListenerFlag` 存在確認と修正設計が完了している
- [ ] `auth:login` モックパターンの現行フロー整合設計が確定している
- [ ] concern 数（単一ファイル）の確認が完了している
- [ ] 検証マトリクスが定義済み
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

Phase 3（設計レビューゲート）へ進む。
