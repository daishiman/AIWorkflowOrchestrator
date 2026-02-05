# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 10                                 |
| 機能名 | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| 作成日 | 2026-02-05                         |

## 目的

実装完了後、全体的な品質・整合性を検証する。最終レビューとして、全Phaseの成果物が基準を満たしていることを確認し、リリース可否を判定する。

## 参照資料

| 資料名        | パス                                    | 説明          |
| ------------- | --------------------------------------- | ------------- |
| 品質レポート  | `outputs/phase-9/quality-report.md`     | Phase 9成果物 |
| 統一API設計書 | `outputs/phase-2/unified-api-design.md` | Phase 2成果物 |
| 仕様書        | `specification.md §4`                   | API仕様定義   |

## 実行タスク

### Task 1: レビュー観点別評価

#### 目的

全てのレビュー観点について評価を行い、最終判定を下す。

#### レビュー判定基準

| 判定     | 説明                                       |
| -------- | ------------------------------------------ |
| PASS     | 基準を完全に満たしている                   |
| MINOR    | 軽微な改善点あり（リリースは可能）         |
| MAJOR    | 重要な問題あり（修正が必要）               |
| CRITICAL | 致命的な問題あり（リリース不可、即時修正） |

#### レビュー結果

| レビュー観点               | 確認内容                                                            | 判定     | 備考     |
| -------------------------- | ------------------------------------------------------------------- | -------- | -------- |
| API統一の完全性            | 2つのskillAPI定義が `window.electronAPI.skill` に完全統一されている | {{判定}} | {{備考}} |
| 型安全性                   | 全メソッドが `@repo/shared` の統一型定義を使用している              | {{判定}} | {{備考}} |
| 仕様書§4との一致           | 統一APIが `specification.md §4` の定義と一致している                | {{判定}} | {{備考}} |
| 呼び出し元の完全移行       | 全hooks・store・sliceが新API経由でアクセスしている                  | {{判定}} | {{備考}} |
| `window.skillAPI` 廃止確認 | `window.skillAPI` の公開・参照が完全に削除されている                | {{判定}} | {{備考}} |
| テスト結果の確認           | 全テストがPASSし、カバレッジ基準を満たしている                      | {{判定}} | {{備考}} |

### Task 2: 変更ファイル一覧の最終確認

#### 目的

変更された全ファイルを一覧化し、意図しない変更がないことを確認する。

#### 変更ファイル確認

| ファイルパス                                             | 変更種別  | 変更内容                  | 確認       |
| -------------------------------------------------------- | --------- | ------------------------- | ---------- |
| `apps/desktop/src/preload/skill-api.ts`                  | 修正      | 統一インターフェース実装  | {{RESULT}} |
| `apps/desktop/src/preload/index.ts`                      | 修正      | 公開ポイント統一          | {{RESULT}} |
| `apps/desktop/src/renderer/hooks/useSkillExecution.ts`   | 修正      | API呼び出しパス変更       | {{RESULT}} |
| `apps/desktop/src/renderer/hooks/useSkillPermission.ts`  | 修正      | API呼び出しパス変更       | {{RESULT}} |
| `apps/desktop/src/renderer/hooks/usePermissionDialog.ts` | 修正      | API呼び出しパス変更       | {{RESULT}} |
| `apps/desktop/src/renderer/store/slices/skillSlice.ts`   | 修正      | 新APIインターフェース対応 | {{RESULT}} |
| `apps/desktop/src/renderer/preload/index.ts`             | 修正      | skillAPI定義削除          | {{RESULT}} |
| `apps/desktop/src/preload/__tests__/skill-api.test.ts`   | 追加/修正 | テストコード              | {{RESULT}} |

### Task 3: 統合テスト最終確認

#### 目的

最終レビュー時点での統合テスト結果を記録する。

#### 実行コマンド

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:coverage
```

#### 統合テスト結果

| 判定項目               | 基準    | 結果       | 判定          |
| ---------------------- | ------- | ---------- | ------------- |
| TypeScript型チェック   | エラー0 | {{RESULT}} | {{PASS/FAIL}} |
| ESLintチェック         | エラー0 | {{RESULT}} | {{PASS/FAIL}} |
| ユニットテスト         | 全PASS  | {{RESULT}} | {{PASS/FAIL}} |
| ユニットテストLine     | 80%+    | {{RESULT}} | {{PASS/FAIL}} |
| ユニットテストBranch   | 60%+    | {{RESULT}} | {{PASS/FAIL}} |
| ユニットテストFunction | 80%+    | {{RESULT}} | {{PASS/FAIL}} |

### Task 4: 最終判定

#### 目的

全レビュー結果を総合し、リリース可否を判定する。

#### 判定ルール

| 条件                                 | 判定結果                               |
| ------------------------------------ | -------------------------------------- |
| 全観点がPASS                         | リリース可 → Phase 11へ                |
| MINORが1件以上（MAJOR/CRITICALなし） | リリース可（改善点を記録）→ Phase 11へ |
| MAJORが1件以上                       | リリース不可 → 該当Phaseへ差し戻し     |
| CRITICALが1件以上                    | リリース不可 → 即時修正対応            |

#### 最終判定結果

| 項目            | 結果                 |
| --------------- | -------------------- |
| 総合判定        | {{RESULT}}           |
| PASS数          | {{NUM}}/6            |
| MINOR数         | {{NUM}}              |
| MAJOR数         | {{NUM}}              |
| CRITICAL数      | {{NUM}}              |
| 差し戻し先Phase | {{N/A or Phase番号}} |

## 成果物

| 成果物           | パス                                      | 説明                 |
| ---------------- | ----------------------------------------- | -------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 最終レビュー判定結果 |

## 完了条件

- [ ] 全6レビュー観点の評価が完了している
- [ ] 変更ファイル一覧が確認されている
- [ ] 統合テスト（typecheck, lint, test, coverage）が全てPASSしている
- [ ] API統一の完全性が確認されている
- [ ] 仕様書§4との一致が確認されている
- [ ] `window.skillAPI` の廃止が確認されている
- [ ] 呼び出し元の完全移行が確認されている
- [ ] 最終判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている
- [ ] 最終レビュー結果が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト検証
