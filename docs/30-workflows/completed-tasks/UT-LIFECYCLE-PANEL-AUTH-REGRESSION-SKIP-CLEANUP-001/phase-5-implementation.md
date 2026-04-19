# Phase 5: 実装（describe.skip クリーンアップ実施）

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| PhaseID    | 5                                                               |
| Phase名    | 実装（describe.skip クリーンアップ実施）                        |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前Phase    | Phase 4                                                         |
| 次Phase    | Phase 6                                                         |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

Phase 4 の失敗分析結果（`outputs/phase-4/failure-analysis.md`）を基に、
`SkillLifecyclePanel.auth-regression.test.tsx` に対して実際のクリーンアップを実施する。

TC-03/TC-05/TC-06/TC-07/TC-08 の5件の `describe.skip` に対して、

- 分類A（IPCモック不整合）: `window.electronAPI.auth.login` と `skillCreatorAPI` のモックを現行仕様に更新して `describe` に昇格
- 分類B（コンポーネントAPI変更）: 現行フローへのアサーション更新後に `describe` に昇格
- 分類C（フロー廃止）: ブロックを削除し、削除理由を記録

を順序立てて実施し、最終的に `describe.skip` を 0件にする。

## 実行タスク

- [ ] Step 1: 分類A の TC に対して `window.electronAPI.auth.login` / `skillCreatorAPI` モックを更新する
- [ ] Step 2: 分類B の TC に対して現行フローへのアサーションを更新する
- [ ] Step 3: 分類C の TC に対してブロックを削除し理由を記録する
- [ ] Step 4: 全処置後に `describe.skip` 残存数が 0件であることを確認する
- [ ] Step 5: クリーンアップ後の vitest 実行で全アクティブテストが PASS することを確認する
- [ ] Step 6: 型チェック・lint を実行してエラーがないことを確認する

## 参照資料

| 資料名                                       | パス                                                                                                | 用途                          |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 4 テスト実行結果（Red）                | `outputs/phase-4/test-results-red.md`                                                               | 各 TC の分類と処置方針の確認  |
| Phase 4 失敗分析                             | `outputs/phase-4/failure-analysis.md`                                                               | 失敗ログ原文と処置方針の確認  |
| Phase 3 レビュー結果                         | `outputs/phase-3/gate-decision.md`                                                                  | 処置分類の最終確定内容        |
| SkillLifecyclePanel.auth-regression.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | 実装対象ファイル              |
| SkillLifecyclePanel.tsx                      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | 現行コンポーネント API の確認 |

## 実行手順

### Step 1: 分類A — IPCモック不整合の修正（`window.electronAPI.auth.login` / `skillCreatorAPI` 更新）

`auth:login` が呼ばれないことを検証するテストでは、現行テスト実装に合わせて
`window.electronAPI.auth.login` と `skillCreatorAPI` のモックパターンを統一する。

```typescript
// auth:login が呼ばれないことを検証する現行パターン
const mockAuthLogin = vi.fn();
(window as Window & { electronAPI?: unknown }).electronAPI = {
  auth: {
    login: mockAuthLogin,
  },
};
expect(mockAuthLogin).not.toHaveBeenCalled();
```

```bash
# 現行の IPC モックパターンを確認
grep -n "auth:login\|electronAPI\|skillCreatorAPI\|vi\.mock" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx | \
  head -30

# 現行の auth:login / runtime API の利用点を確認
grep -n "auth:login\|electronAPI\|skillCreatorAPI" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

#### Step 1 後の確認

```bash
# 分類A の TC を describe に昇格後のテスト実行
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.auth-regression \
  2>&1 | grep -E "✓|✗|PASS|FAIL"
```

### Step 2: 分類B — コンポーネントAPI変更対応（現行フローへのアサーション更新）

コンポーネントの props / state / イベント API 変更によって失敗している TC に対して、
現行の `SkillLifecyclePanel.tsx` の実装に合わせてアサーションを更新する。

```bash
# 現行コンポーネントの testid 一覧を確認
grep -n "data-testid" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# 現行コンポーネントのスキル生成フローのエントリポイントを確認
grep -n "onClick\|onSubmit\|handleGenerate\|handleStart" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -20

# Redux store の authModeSlice 関連の state 確認
grep -rn "authMode\|authModeSlice" \
  apps/desktop/src/renderer/store/ 2>/dev/null | head -20
```

#### 更新パターン例（TC-07: re-render 時の auth:login 非発火確認）

```typescript
// 旧: コンポーネントの再レンダリングを旧 API で引き起こす場合
// rerender(<SkillLifecyclePanel {...oldProps} />);

// 新: 現行 props 型に合わせた rerender
rerender(<SkillLifecyclePanel {...currentProps} newProp={updatedValue} />);
expect(mockAuthLogin).not.toHaveBeenCalled();
```

#### Step 2 後の確認

```bash
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.auth-regression \
  2>&1 | grep -E "✓|✗|PASS|FAIL"
```

### Step 3: 分類C — フロー廃止ケースの削除と理由記録

現行コードに対象フローが存在しない TC は、ブロックごと削除する。
削除する前に `outputs/phase-5/implementation-summary.md` に削除理由を記録する。

```bash
# 削除対象 TC の行範囲を確認
grep -n "TC-XX\|describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# 削除後の行数変化を確認（削除前後でカウント）
wc -l apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

削除は `Edit` ツールで各 `describe.skip` ブロック（開始の `// ===` コメントから
終端の `});` まで）をまとめて削除する。

#### Step 3 後の確認

```bash
# 削除後の describe.skip 残存確認
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.auth-regression \
  2>&1 | grep -E "✓|✗|PASS|FAIL"
```

### Step 4: describe.skip 残存確認

```bash
# describe.skip が 0件であることを確認
grep -c "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
# → 0 が返ること

# 念のため grep の存在確認（0件の場合は "No such line" ではなくカウント 0 を確認）
grep -n "describe\.skip" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx || \
  echo "describe.skip: 0件（クリーンアップ完了）"
```

### Step 5: クリーンアップ後の全体テスト確認

```bash
# auth-regression テスト全件実行（全 TC が PASS することを確認）
pnpm --filter @repo/desktop test -- --reporter=verbose SkillLifecyclePanel.auth-regression

# SkillLifecyclePanel 関連テスト全体確認
pnpm --filter @repo/desktop test -- --reporter=verbose \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel
```

### Step 6: 型チェック・lint 実行

```bash
# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

## 変更ファイル一覧

実装時に記録する（実行後に埋める）。

| ファイル                                       | 変更種別    | 変更概要               |
| ---------------------------------------------- | ----------- | ---------------------- |
| `SkillLifecyclePanel.auth-regression.test.tsx` | 修正 / 削除 | 詳細は実装サマリー参照 |

## 実装サマリー

実行後に `outputs/phase-5/implementation-summary.md` に以下の形式で記録する。

| TC ID | テスト名（省略）                                      | 処置      | 理由 |
| ----- | ----------------------------------------------------- | --------- | ---- |
| TC-03 | skill generation completes without auth:login timeout | 修正/昇格 |      |
| TC-05 | does not call auth:login when user is unauthenticated | 修正/昇格 |      |
| TC-06 | rapid clicks do not trigger multiple auth:login       | 修正/昇格 |      |
| TC-07 | auth:login not triggered on re-render                 | 修正/昇格 |      |
| TC-08 | authModeSlice changes do not trigger auth:login       | 修正/昇格 |      |

**削除件数**: 0件（予定） / **修正件数**: 5件（予定） / **有効化件数**: 5件（予定）

※ Phase 4 の分析結果によって上記件数は変動する。分類C（フロー廃止）の TC があれば
削除件数が増え、有効化件数が減る。

## 多角的チェック観点

| 観点                                    | チェック内容                                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| IPC モックの完全性                      | `window.electronAPI.auth.login` と `skillCreatorAPI` の両方が現行テスト実装と一致しているか          |
| アクティブテスト（TC-01/02/04）への影響 | Step 1〜3 の各変更後に TC-01/TC-02/TC-04 が引き続き PASS していることを確認しているか                |
| フロー廃止判断の根拠                    | 「フロー廃止」と判断した TC は、コンポーネント本体コードの調査で廃止が裏付けられているか             |
| モック宣言の整合性                      | 修正後に未使用の `vi.fn()` 宣言や `beforeEach` 内の不要な設定コードが残っていないか                  |
| `authModeSlice` テストの独立性          | TC-08 の Redux store 操作が他のテストに副作用を与えていないか（beforeEach/afterEach のリセット確認） |

## 統合テスト連携

| 判定項目                                                 | 基準                            | 結果    |
| -------------------------------------------------------- | ------------------------------- | ------- |
| `describe.skip` 残存数が 0件                             | `grep -c` の結果が 0            | pending |
| TC-03/TC-05/TC-06/TC-07/TC-08 が全件 PASS または削除済み | vitest が全 PASS または削除記録 | pending |
| TC-01/TC-02/TC-04（既存アクティブ）が引き続き PASS       | vitest が全 PASS                | pending |
| `pnpm --filter @repo/desktop typecheck` が PASS          | TypeScript エラーなし           | pending |
| `pnpm --filter @repo/desktop lint` が 0 error            | lint エラーなし                 | pending |

## 成果物

| 成果物           | パス                                        | 説明                                                           |
| ---------------- | ------------------------------------------- | -------------------------------------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 各 TC の処置結果・削除件数・修正件数・有効化件数               |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイルと変更内容の概要（行数変化・モック修正内容等） |

## 完了条件

- [ ] 分類A の TC に対して `window.electronAPI.auth.login` / `skillCreatorAPI` 更新が完了
- [ ] 分類B の TC に対して現行フローへのアサーション更新が完了
- [ ] 分類C の TC（フロー廃止）のブロックが削除済み
- [ ] `describe.skip` 残存数が 0件（`grep -c` で 0 を確認）
- [ ] `pnpm --filter @repo/desktop test -- SkillLifecyclePanel.auth-regression` が全 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が 0 error
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

Phase 6（テスト拡充）へ進む。
