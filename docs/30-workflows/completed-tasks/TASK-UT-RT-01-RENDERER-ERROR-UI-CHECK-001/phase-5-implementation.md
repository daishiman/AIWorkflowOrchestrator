# Phase 5: 実装

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 5                                            |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 4                                      |
| 後続Phase  | Phase 6                                      |
| 作成日     | 2026-04-13                                   |
| ステータス | pending                                      |

## 目的

Phase 4 で作成した Red テストを Green にする。
`SkillLifecyclePanel.tsx` のエラー表示が動作していれば実装変更は不要。
動作していない場合はエラー表示ロジックを修正し、テストを PASS させる。

## 実装方針

### ケース1: エラー表示が既に正常動作している場合

テストが Green になれば実装変更は不要。
`SkillLifecyclePanel.tsx` のモックへの接続が適切であることを確認するだけでよい。

### ケース2: エラー表示が動作していない場合

以下の箇所を修正する:

```typescript
// SkillLifecyclePanel.tsx のエラー表示経路
// 1. onWorkflowStateChanged コールバックで errorMessage を受け取る
skillCreatorApi.onWorkflowStateChanged((snapshot, errorMessage) => {
  applyWorkflowSnapshot(snapshot);
  if (errorMessage) {
    setWorkflowError(errorMessage);  // ← この配線が欠如している場合
  }
});

// 2. currentSurfaceError の定義
const currentSurfaceError = localError ?? workflowError ?? skillError;

// 3. エラー表示のレンダリング
{currentSurfaceError && (
  <div role="alert" data-testid="skill-lifecycle-error">
    {currentSurfaceError}
  </div>
)}
```

### スコープ外（実装禁止）

- Main 層（`RuntimeSkillCreatorFacade.ts`・`creatorHandlers.ts`）の変更
- IPC ブリッジ（preload）の変更
- `SkillCreateWizard.tsx` など他コンポーネントの変更

## 実装計画

| 対象                           | アクション                             | 種別      |
| ------------------------------ | -------------------------------------- | --------- |
| `SkillLifecyclePanel.tsx`      | エラー表示配線の確認・必要に応じて修正 | 修正      |
| `SkillLifecyclePanel.test.tsx` | UT-01〜UT-05 の実装を完成させる        | 新規/修正 |

**注意（[Feedback RT-03]）**: 「新規作成」「修正」ファイルパス一覧を本 Phase 成果物に必須記載する。

## テスト実行

```bash
# Green 確認
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx

# 全テストが通ることを確認
pnpm --filter @repo/desktop exec vitest run --reporter=verbose 2>&1 | tail -20
```

## 参照資料

| 参照資料     | パス                                    | 説明           |
| ------------ | --------------------------------------- | -------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4 成果物 |
| Red 結果     | `outputs/phase-4/red-test-result.md`    | Phase 4 成果物 |
| 調査メモ     | `outputs/phase-1/investigation-memo.md` | Phase 1 成果物 |

## 成果物

| 成果物           | パス                                        | 説明                                   |
| ---------------- | ------------------------------------------- | -------------------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 変更概要・Green 結果                   |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更ファイルパス一覧（新規/修正の別）  |
| 修正差分記録     | `outputs/phase-5/fix-diff-record.md`        | 修正した場合の差分記録（なければ N/A） |

## 完了条件

- [ ] UT-01〜UT-05 が全て Green（PASS）になっている
- [ ] 変更ファイル一覧が記録されている（変更なしの場合も「変更なし」と記録）
- [ ] Main 層・IPC ブリッジの変更がスコープ外として除外されている
- [ ] 実装サマリーが作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] Green 結果が記録されている
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001 --phase 5 \
  --artifacts "outputs/phase-5/implementation-summary.md:実装サマリー"
```

## 次のPhase

Phase 6: テスト拡充
