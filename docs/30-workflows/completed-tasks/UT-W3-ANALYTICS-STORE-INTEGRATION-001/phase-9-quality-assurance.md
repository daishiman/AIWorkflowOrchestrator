# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 9                                              |
| タスクID   | UT-W3-ANALYTICS-STORE-INTEGRATION-001          |
| 機能名     | renderer analytics slice / SkillAnalytics 連携 |
| 前提Phase  | Phase 8                                        |
| 後続Phase  | Phase 10                                       |
| 作成日     | 2026-04-13                                     |
| ステータス | pending                                        |

## 目的

line budget・link・mirror parity を一括判定する。
Phase 1〜8 の成果物を横断的に検証し、Phase 10 への進行可否を決定する。

## 実行タスク

### T-09-1: 全体 lint / typecheck 実行

```bash
# 型チェック
pnpm typecheck

# lint
pnpm lint
```

| チェック項目          | 基準      | 結果    |
| --------------------- | --------- | ------- |
| TypeScript 型チェック | エラー0件 | pending |
| ESLint                | エラー0件 | pending |

### T-09-2: 全体テスト実行（targeted run）

```bash
pnpm --filter @repo/desktop test -- --run \
  apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
```

| チェック項目                    | 基準    | 結果    |
| ------------------------------- | ------- | ------- |
| analyticsSlice テスト全件       | 全 PASS | pending |
| trackSkillStart テスト          | PASS    | pending |
| trackSkillComplete テスト       | PASS    | pending |
| trackSkillError テスト          | PASS    | pending |
| trackEvent シグネチャ互換性確認 | PASS    | pending |

### T-09-3: ファイル削除確認（削除したファイルが live import ゼロであること）

本タスクでファイルを削除した場合、live import が存在しないことを確認する。
ファイル削除がない場合は「削除ファイルなし」と記録する。

```bash
# 削除ファイルの live import 確認（削除がある場合のみ実行）
grep -rn "<削除ファイル名>" apps/ packages/ --include="*.ts" --include="*.tsx"
```

| 確認項目                        | 基準             | 結果    |
| ------------------------------- | ---------------- | ------- |
| 削除ファイルの live import なし | import 参照 0 件 | pending |

### T-09-4: 成果物確認（outputs/ と artifacts.json の同期）

```bash
# outputs ディレクトリの確認
ls docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/outputs/

# artifacts.json の確認
cat docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001/artifacts.json 2>/dev/null || \
  echo "artifacts.json が存在しない場合は作成が必要"
```

| 確認項目                                    | 基準        | 結果    |
| ------------------------------------------- | ----------- | ------- |
| outputs/ 内の成果物が artifacts.json と同期 | parity 一致 | pending |
| Phase 1〜8 の成果物が全件存在               | 全件確認    | pending |

### T-09-5: QA結果記録

T-09-1〜T-09-4 の実行結果を `outputs/phase-9/qa-result.md` に記録する。

## QA実行コマンド

```bash
pnpm typecheck
pnpm lint
pnpm --filter @repo/desktop test -- --run \
  apps/desktop/src/renderer/store/slices/__tests__/analyticsSlice.test.ts
```

## 品質ゲートチェックリスト

| チェック項目                           | 基準            | 結果    |
| -------------------------------------- | --------------- | ------- |
| TypeScript 型チェック                  | エラー0件       | pending |
| ESLint                                 | エラー0件       | pending |
| analyticsSlice テスト全件              | 全 PASS         | pending |
| SkillAnalyticsEvent 型エクスポート確認 | export 確認済み | pending |
| analyticsSlice Zustand slice 確認      | 実装確認済み    | pending |
| trackEvent 公開 API シグネチャ不変確認 | 変更なし        | pending |
| Phase 10 ブロッカーなし                | なし            | pending |

## 参照資料

| 資料名         | パス                                                       | 用途                     |
| -------------- | ---------------------------------------------------------- | ------------------------ |
| Phase 7 成果物 | `outputs/phase-7/coverage-report.md`                       | カバレッジ結果確認       |
| Phase 8 成果物 | `outputs/phase-8/refactoring-result.md`                    | リファクタリング結果確認 |
| 実装ファイル   | `apps/desktop/src/renderer/store/slices/analyticsSlice.ts` | 最終コード確認           |
| 型定義ファイル | `packages/shared/src/types/skill-analytics.ts`             | 型定義確認               |

## 成果物

| 成果物         | パス                           | 説明                                        |
| -------------- | ------------------------------ | ------------------------------------------- |
| QA結果レポート | `outputs/phase-9/qa-result.md` | 静的解析・テスト結果・Phase 10 進行可否判定 |

## 完了条件

- [ ] T-09-1: 型チェック（`pnpm typecheck`）がエラー0件
- [ ] T-09-1: lint（`pnpm lint`）がエラー0件
- [ ] T-09-2: analyticsSlice テスト全件が PASS
- [ ] T-09-3: 削除ファイルの live import が0件（削除なしの場合は「削除ファイルなし」と記録）
- [ ] T-09-4: outputs/ と artifacts.json の parity 確認済み
- [ ] T-09-5: `outputs/phase-9/qa-result.md` が作成済み
- [ ] Phase 10 ブロッカーなし
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. T-09-1: 全体 lint / typecheck 実行
2. T-09-2: 全体テスト実行（targeted run）
3. T-09-3: ファイル削除確認
4. T-09-4: 成果物確認（parity チェック）
5. T-09-5: QA結果記録（`outputs/phase-9/qa-result.md`）

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビューゲート
