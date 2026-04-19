# Phase 3: 設計レビューゲート

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| PhaseID    | 3                                                               |
| Phase名    | 設計レビューゲート                                              |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001             |
| タスク名   | SkillLifecyclePanel auth回帰テスト describe.skip クリーンアップ |
| 前Phase    | Phase 2                                                         |
| 次Phase    | Phase 4（PASS または MINOR の場合） / Phase 2（MAJOR の場合）   |
| 作成日     | 2026-04-18                                                      |
| ステータス | pending                                                         |

## 目的

Phase 1〜2 の要件定義・設計内容をレビューし、5 件の `describe.skip` 処置方針が
現行 `SkillLifecyclePanel.tsx` の実装・現行 `authModeSlice.ts` の export と整合しているか、
AC-1〜AC-5 の達成が設計上保証されているかを判定する。
PASS / MINOR / MAJOR を確定し、Phase 4 の開始可否を決定する。

特に `auth:login` IPC 回帰検出はセキュリティ重要テストであるため、
「削除ではなく修正で有効化する」方針が設計書に明確に反映されていることを重点的にレビューする。

## 実行タスク

- [ ] 設計一貫性チェック: 5件の処置分類（修正優先）に矛盾がないか
- [ ] AC 整合チェック: AC-1〜AC-5 の達成が設計で担保されているか
- [ ] スコープ遵守チェック: プロダクションコードへの変更が含まれていないか
- [ ] props 廃止の修正安全性チェック: `isOpen`/`defaultTab` 除去後の TypeScript 安全性
- [ ] `fillCreateRequest` no-op 対応の妥当性チェック
- [ ] TC-08 の `resetAuthModeListenerFlag` 対応の妥当性チェック
- [ ] MINOR 追跡テーブルの記録（指摘事項がある場合）

## 参照資料

| 資料名                                       | パス                                                                                                | 用途                     |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1 成果物                               | `outputs/phase-1/requirements-definition.md`                                                        | 要件・AC 参照            |
| Phase 2 成果物                               | `outputs/phase-2/design.md`                                                                         | 設計書参照               |
| SkillLifecyclePanel.auth-regression.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | 実際のテスト構造との照合 |
| SkillLifecyclePanel.tsx                      | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | 現行実装との整合確認     |
| authModeSlice.ts                             | `apps/desktop/src/renderer/store/slices/authModeSlice.ts`                                           | TC-08 前提確認           |

## 実行手順

### 1. 設計一貫性チェック

```bash
# SkillLifecyclePanel の props に isOpen / defaultTab が存在しないことを確認
grep -n "isOpen\|defaultTab" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
# 結果が空であれば「廃止済み props 除去」設計の前提が正しい

# skill-lifecycle-prepare-button testid が現行 UI に存在することを確認（TC-03〜TC-07 の修正前提）
grep -n "skill-lifecycle-prepare-button" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# resetAuthModeListenerFlag が authModeSlice.ts に export されているか確認（TC-08 前提）
grep -n "resetAuthModeListenerFlag" \
  apps/desktop/src/renderer/store/slices/authModeSlice.ts

# アクティブな TC-01 で使用されている props を確認（修正方向性の参考）
grep -n "onClose\|onOpenWizard\|onOpenSkillWizard\|skillName" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx | head -10
```

| チェック項目                                                                        | 判定基準                                                              | 結果    |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------- |
| `isOpen`/`defaultTab` が `SkillLifecyclePanel.tsx` に存在しないことが確認されている | grep 結果が空（廃止確認済み）                                         | pending |
| `skill-lifecycle-prepare-button` testid が現行 UI に存在することが確認されている    | grep 結果に testid が含まれている（TC-03〜TC-07 修正の前提）          | pending |
| `resetAuthModeListenerFlag` の存在有無が確認されている                              | grep 結果に基づき TC-08 修正方針が設計書に明記されている              | pending |
| `fillCreateRequest` no-op 化への対応方針が設計書に明記されている                    | 設計書に「削除して prepare ボタン直接クリックに変更」が記載されている | pending |
| プロダクションコード変更がスコープに含まれていない                                  | 設計書の変更対象がテストファイルのみである                            | pending |

### 2. AC 整合チェック

```bash
# Phase 2 設計書の AC 対応確認
grep -A 3 "AC-[1-5]" outputs/phase-2/design.md
```

| AC ID | 設計対応                                                                       | 充足判定 |
| ----- | ------------------------------------------------------------------------------ | -------- |
| AC-1  | 5件の describe.skip を修正または削除する設計になっている                       | pending  |
| AC-2  | 修正後のテストが PASS する見込みが設計書に記載されている                       | pending  |
| AC-3  | auth:login IPC を検証するテストが最低 1 件有効化される設計になっている         | pending  |
| AC-4  | `pnpm --filter @repo/desktop test:run` が PASS するように設計されている        | pending  |
| AC-5  | `pnpm --filter @repo/desktop typecheck` が PASS するように型安全が保たれる設計 | pending  |

### 3. スコープ遵守チェック

```bash
# 設計書の変更対象ファイル記載を確認
grep -A 5 "変更ファイル\|変更対象\|修正対象\|concern" outputs/phase-2/design.md
```

| チェック項目                                       | 期待状態                              | 結果    |
| -------------------------------------------------- | ------------------------------------- | ------- |
| `SkillLifecyclePanel.tsx` への変更が含まれていない | 変更対象ファイルに含まれていない      | pending |
| `authModeSlice.ts` への変更が含まれていない        | 変更対象ファイルに含まれていない      | pending |
| 新しいテストケースの追加がスコープ外になっている   | 既存の describe.skip の処置のみに限定 | pending |

### 4. props 廃止修正の安全性チェック

```bash
# TC-01（アクティブ）で使用されている現行 props を確認
grep -n "onClose\|onOpenWizard\|onOpenSkillWizard\|skillName" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx | \
  grep -v "describe\.skip"

# SkillLifecyclePanel の現行 props 型定義を確認
grep -n -A 10 "interface.*Props\|type.*Props" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -30
```

| チェック項目                                                              | 判定基準                                                                 | 結果    |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------- |
| TC-01 のアクティブな props（`onClose`/`onOpenWizard` 等）が確認されている | TC-01 の render 呼び出しの props が設計書の修正方向と一致している        | pending |
| 廃止済み `isOpen`/`defaultTab` 除去後に TypeScript エラーが出ない設計     | 現行 props のみで render 可能なことが TC-01 のパターンから確認されている | pending |

### 5. fillCreateRequest no-op 対応チェック

```bash
# fillCreateRequest の現行実装確認（no-op であることの確認）
grep -n -A 5 "fillCreateRequest" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# clickPrepareButton の現行実装確認（skill-lifecycle-prepare-button を使用）
grep -n -A 3 "clickPrepareButton" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

| チェック項目                                                                            | 判定基準                                                     | 結果    |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------- |
| `fillCreateRequest()` が no-op であることが設計書に反映されている                       | 設計書に「fillCreateRequest 呼び出しを削除」が明記されている | pending |
| `fillCreateRequest()` 削除後もテストの検証意図（auth:login 非呼び出し）が維持される設計 | prepare ボタン直接クリックで同等の検証が成立する設計         | pending |

### 6. TC-08 の resetAuthModeListenerFlag 対応チェック

```bash
# TC-08 の依存 export 一覧確認
grep -n "resetAuthModeListenerFlag\|createAuthModeSlice" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx

# authModeSlice の現行 export 一覧
grep -n "^export" \
  apps/desktop/src/renderer/store/slices/authModeSlice.ts
```

| チェック項目                                                                   | 判定基準                                                                | 結果    |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------- |
| `resetAuthModeListenerFlag` の存在有無に応じた処置方針が設計書に記載されている | 存在する→除去不要、存在しない→代替テスト設計 のいずれかが明記されている | pending |
| TC-08 の修正後に `auth:login` 回帰検出の意図が維持される設計になっている       | `assertNoLogin` パターンが維持された設計になっている                    | pending |

### 7. ゲート判定表

| 判定  | 条件                                                                                                 | 次のアクション         |
| ----- | ---------------------------------------------------------------------------------------------------- | ---------------------- |
| PASS  | 全チェック項目でリスクなし、AC-1〜AC-5 の設計対応が充足                                              | Phase 4 へ進む         |
| MINOR | 小さな指摘事項あり（実装時に並行解消可能）                                                           | Phase 4 へ進む（追跡） |
| MAJOR | 設計の根本的な問題（処置分類未確定・AC 未充足・auth:login 回帰検出の有効化が設計で担保されていない） | Phase 2 へ戻る         |

**MAJOR 判定となる条件の例**:

- TC-03〜TC-08 のいずれかの処置方針が「調査中」のまま Phase 4 へ進もうとしている
- `isOpen`/`defaultTab` 廃止確認が未実施のまま設計が進んでいる
- `auth:login` を検証するテストが 1 件も有効化されない設計になっている
- `fillCreateRequest` no-op への対応が設計書に記載されていない

**総合判定**: （実行時に PASS / MINOR / MAJOR を記録）

### 8. MINOR 追跡テーブル

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------- | -------- | ------------- | ------------- | ---- |
| （実行時に記録） | -        | -             | -             | -    |

### 9. Phase 4 開始条件

Phase 4（テスト作成）を開始できる条件:

- [ ] 総合判定が PASS または MINOR であること
- [ ] MAJOR 判定の場合は Phase 2 へ戻り再設計を行うこと
- [ ] 5件の処置分類が最終確定していること
- [ ] MINOR の指摘事項が追跡テーブルに記録されていること

## 多角的チェック観点

| 観点                     | チェック内容                                                                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| セキュリティ優先度の反映 | auth:login 回帰検出テストの「削除より修正を優先」という方針が設計書全体に一貫して反映されているか                                                      |
| props 廃止の修正整合性   | TC-01（アクティブ）の props パターンが TC-03〜TC-07 の修正方向の参考として設計書に明示されているか                                                     |
| TC-08 の独立性           | TC-08 は `SkillLifecyclePanel` コンポーネントを render せず `authModeSlice` を直接テストしており、修正範囲が限定的であることが設計書に反映されているか |
| 依存整合                 | UT-W2-03A（完了済み先行タスク）で行った SkillCreateWizard 側の変更との整合                                                                             |
| スコープ遵守の確認       | 設計変更がプロダクションコードに触れず、テストファイルのみに閉じているか                                                                               |

## 統合テスト連携

| 判定項目               | 基準    | 結果    |
| ---------------------- | ------- | ------- |
| 型チェック（設計段階） | PASS    | pending |
| lint                   | 0 error | pending |

## 成果物

| 成果物           | パス                               | 説明                                                                          |
| ---------------- | ---------------------------------- | ----------------------------------------------------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | 処置分類最終確定・PASS/MINOR/MAJOR 判定・指摘事項・Phase 4 開始条件の充足確認 |

## 完了条件

- [ ] 設計一貫性チェック（5 項目）が完了
- [ ] AC-1〜AC-5 の設計対応が確認済み
- [ ] スコープ遵守チェック（3 項目）が完了
- [ ] props 廃止修正の安全性チェックが完了
- [ ] `fillCreateRequest` no-op 対応の妥当性チェックが完了
- [ ] TC-08 の `resetAuthModeListenerFlag` 対応の妥当性チェックが完了
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 判定の指摘事項があれば追跡テーブルに記録済み
- [ ] Phase 4 開始条件（PASS or MINOR）が充足されている
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

Phase 4（テスト作成）へ進む（PASS または MINOR の場合）。
Phase 2（設計）へ戻る（MAJOR の場合）。
