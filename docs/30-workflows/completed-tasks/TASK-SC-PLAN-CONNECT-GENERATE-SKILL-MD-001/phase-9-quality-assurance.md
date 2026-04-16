# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 9                                            |
| タスクID   | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001   |
| 機能名     | runCreateWorkflow-to-generateSkillMd-connect |
| 前提Phase  | Phase 8                                      |
| 後続Phase  | Phase 10                                     |
| 作成日     | 2026-04-16                                   |
| ステータス | pending                                      |

## 目的

全品質指標を確認し、Phase 10 に進む品質基準を満たしていることを保証する。
静的解析・型チェック・lint・テスト・セキュリティを一括実行し、品質ゲートを通過していることを確認する。

## 実行タスク

### タスク1: 機能検証

```bash
# 全ユニットテスト実行
pnpm --filter @repo/desktop test

# 統合テスト実行（存在する場合）
pnpm --filter @repo/desktop test --reporter=verbose 2>&1 | grep -E "runCreateWorkflow|generateSkillMd|SkillCreator"
```

### タスク2: コード品質チェック

```bash
# lint（desktop パッケージ）
pnpm --filter @repo/desktop lint

# 型チェック（desktop パッケージ）
pnpm --filter @repo/desktop typecheck

# フォーマット確認（Prettier 適用済みか確認）
pnpm --filter @repo/desktop format --check 2>/dev/null || echo "format コマンドが定義されていない場合はスキップ"
```

### タスク3: テスト網羅性確認

```bash
# カバレッジ計測
pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/services/skill/__tests__/SkillCreatorService.test.ts 2>&1 | tail -20
```

| カバレッジ指標    | 目標値 | 確認コマンド               |
| ----------------- | ------ | -------------------------- |
| Line Coverage     | 80%+   | vitest --coverage 結果参照 |
| Branch Coverage   | 60%+   | vitest --coverage 結果参照 |
| Function Coverage | 80%+   | vitest --coverage 結果参照 |

### タスク4: セキュリティ確認

- `tmpPlanPath` の一時ファイル管理（cleanup 確認）
  - `generateSkillMd` 内で一時ファイルが確実に削除されることを確認
  - try/finally ブロックによる cleanup の確認
- JSON シリアライズの安全性確認
  - `structurePlan` のシリアライズ（`JSON.stringify`）が安全に行われているか
  - 循環参照や巨大オブジェクトへの対処
- パストラバーサル防止の確認
  - `skillDir` パスに対するバリデーションが実施されているか
  - `--output` オプションへ渡すパスが正規化されているか

```bash
# 一時ファイル cleanup の確認
grep -n "finally\|cleanup\|unlink\|rm\|tmpPlanPath" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts

# パストラバーサル対策確認
grep -n "path\.resolve\|path\.normalize\|\.\./" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

## 参照資料

| 資料名                   | パス                                                          | 用途                     |
| ------------------------ | ------------------------------------------------------------- | ------------------------ |
| Phase 7 カバレッジ       | `outputs/phase-7/coverage-report.md`                          | カバレッジ結果確認       |
| Phase 8 リファクタ記録   | `outputs/phase-8/refactoring-notes.md`                        | リファクタリング結果確認 |
| 対象実装ファイル         | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | 最終コード確認           |
| 変更内容・判断理由の記録 | `outputs/phase-5/implementation-notes.md`                     | Phase 5 成果物           |

## 統合テスト連携【必須】

| 判定項目                         | 基準        | 結果 |
| -------------------------------- | ----------- | ---- |
| 全ユニットテスト PASS            | PASS        | -    |
| 統合テスト PASS                  | PASS        | -    |
| TypeScript 型チェック（desktop） | エラー 0 件 | -    |
| ESLint（desktop）                | エラー 0 件 | -    |
| Line Coverage                    | 80%+        | -    |
| Branch Coverage                  | 60%+        | -    |
| Function Coverage                | 80%+        | -    |
| tmpPlanPath cleanup 確認         | 確認済み    | -    |
| JSON シリアライズ安全性確認      | 確認済み    | -    |
| パストラバーサル防止確認         | 確認済み    | -    |

## 多角的チェック観点

| 観点     | 確認内容                                                                         |
| -------- | -------------------------------------------------------------------------------- |
| 矛盾     | 品質ゲート判定テーブルの各項目が実際の計測結果と矛盾していないか                 |
| 漏れ     | desktop パッケージの型チェック・lint・テストが網羅されているか                   |
| 整合性   | Phase 5〜8 の成果物が品質ゲートの全項目を満たしていることが確認されているか      |
| 依存関係 | generate_skill_md.js の `--plan` / `--output` オプションとの整合が保たれているか |

## 成果物

| 成果物           | パス                                      | 説明                                        |
| ---------------- | ----------------------------------------- | ------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-check-result.md` | 静的解析・テスト結果・Phase 10 進行可否判定 |

## 完了条件

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] lint（desktop）がエラー 0 件
- [ ] 型チェック（desktop）がエラー 0 件
- [ ] カバレッジ目標達成（Line 80%+）
- [ ] カバレッジ目標達成（Branch 60%+）
- [ ] カバレッジ目標達成（Function 80%+）
- [ ] セキュリティ確認完了（tmpPlanPath cleanup / JSON シリアライズ / パストラバーサル）
- [ ] `outputs/phase-9/quality-check-result.md` 作成済み
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 全ユニットテスト・統合テスト実行
2. 型チェック・lint 実行
3. カバレッジ計測
4. セキュリティ確認
5. Phase 10 ブロッカー確認
6. 品質保証レポート作成

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 10: 最終レビューゲート
