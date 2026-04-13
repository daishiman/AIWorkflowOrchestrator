# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 8                                              |
| タスクID   | UT-W3-ANALYTICS-STORE-INTEGRATION-001          |
| 機能名     | renderer analytics slice / SkillAnalytics 連携 |
| 前提Phase  | Phase 7                                        |
| 後続Phase  | Phase 9                                        |
| 作成日     | 2026-04-13                                     |
| ステータス | pending                                        |

## 目的

実装コードとテストコードを精査し、重複・命名ドリフト・品質上の問題を解消する。
変更内容は 対象/Before/After/理由 テーブル形式で記録する。
変更がない場合は「リファクタリング不要」と明記する。

## 実行タスク

### T-08-1: コードレビュー（重複コード・不要な抽象化の検出）

以下を確認する：

- `analyticsSlice.ts` 内の命名一貫性（camelCase / UPPER_SNAKE_CASE）
- `SkillAnalyticsEvent` 型定義が `packages/shared/src/types/skill-analytics.ts` に正しく配置されているか
- `trackEvent` の公開 API シグネチャが既存コントラクトと一致しているか
- 重複した型定義・定数が他ファイルに存在しないか

```bash
# 重複定義の検索
grep -rn "SkillAnalyticsEvent\|useAnalyticsStore\|AnalyticsStore\|trackSkillStart\|trackSkillComplete\|trackSkillError" \
  apps/desktop/src/renderer/store/slices/ \
  packages/shared/src/types/ \
  --include="*.ts"

# trackEvent シグネチャの確認
grep -n "export function trackEvent\|export type SkillWizardEvents" \
  apps/desktop/src/renderer/utils/trackEvent.ts
```

**チェックリスト**:

| 確認項目                                           | 期待値                   | 結果    |
| -------------------------------------------------- | ------------------------ | ------- |
| Zustand slice の命名が camelCase                   | `useAnalyticsStore`      | pending |
| アクション名が動詞+名詞形式                        | `trackSkillStart` 等     | pending |
| `SkillAnalyticsEvent` が shared に配置済み         | types/skill-analytics.ts | pending |
| `trackEvent` 公開 API シグネチャが変更されていない | 変更なし                 | pending |
| JSDocコメントが主要エクスポートに付与されている    | `/**` から始まるコメント | pending |

### T-08-2: リファクタリング実施（必要な場合のみ）

T-08-1 のレビュー結果に基づき、必要なリファクタリングのみ実施する。
小規模タスクのため、大幅な構造変更は行わない。

**変更記録フォーマット**:

| 対象                  | Before       | After        | 理由     |
| --------------------- | ------------ | ------------ | -------- |
| （例）trackSkillStart | 旧実装コード | 新実装コード | 重複排除 |
| （実行時に記録）      | -            | -            | -        |

リファクタリングが不要な場合は以下を記録する：

```
変更なし: 実装コードは仕様どおりであり、リファクタリングは不要と判断した。
```

### T-08-3: テスト実行（PASS確認）

リファクタリング実施後（または不要確認後）に全テストを再実行する。

```bash
# analyticsSlice のテスト実行
  pnpm --filter @repo/desktop test -- --run \
  apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts

# 型チェック
pnpm typecheck

# lint
pnpm lint
```

## 参照資料

| 資料名         | パス                                                                      | 用途               |
| -------------- | ------------------------------------------------------------------------- | ------------------ |
| 実装ファイル   | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts`                | コードレビュー対象 |
| 型定義ファイル | `packages/shared/src/types/skill-analytics.ts`                            | 型定義確認         |
| テストファイル | `apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts` | テストコード確認   |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`                                      | カバレッジ結果確認 |

## 成果物

| 成果物               | パス                                    | 説明                                    |
| -------------------- | --------------------------------------- | --------------------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-result.md` | Before/After/理由テーブル・変更なし記録 |

## 完了条件

- [ ] T-08-1: コードレビュー完了（命名・JSDoc・型注釈・重複確認）
- [ ] T-08-2: リファクタリング実施（または「リファクタリング不要」と記録済み）
- [ ] T-08-3: リファクタ後のテスト・型チェック・lint が全 PASS
- [ ] 変更内容が Before/After/理由テーブルに記録済み
- [ ] `outputs/phase-8/refactoring-result.md` が作成済み
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. T-08-1: コードレビュー（命名・JSDoc・型注釈・重複確認）
2. T-08-2: リファクタリング実施（必要な場合のみ）
3. T-08-3: テスト・型チェック・lint 再実行
4. リファクタリング記録作成（`outputs/phase-8/refactoring-result.md`）

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 9: 品質保証
