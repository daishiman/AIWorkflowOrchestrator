# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 9                                                            |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001                    |
| 機能名     | SkillCreateWizard LLM生成テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 8                                                      |
| 後続Phase  | Phase 10                                                     |
| 作成日     | 2026-04-16                                                   |
| ステータス | pending                                                      |

## 目的

静的解析・型チェック・lint・テストを一括実行し、品質ゲートを通過していることを確認する。
Phase 1〜8 の成果物を横断的に検証し、Phase 10 への進行可否を判定する。
特に、対象テストファイルが削除済みである前提を確認したうえで、
`describe.skip` 残存ゼロおよび `TODO(W2-seq-03a)` コメント残存ゼロを確認する。

## 実行タスク

- `pnpm --filter @repo/desktop test:run` 全テスト PASS 確認
- `pnpm --filter @repo/desktop typecheck` PASS 確認
- `pnpm --filter @repo/desktop lint` PASS 確認
- 対象テストファイル削除済み確認
- `describe.skip` 残存確認（対象テストファイルが存在する場合のみ grep）
- `TODO(W2-seq-03a)` 残存確認（対象テストファイルが存在する場合のみ grep / 0件確認）
- 品質ゲート判定テーブルの確認
- Phase 10 ブロッカー確認

## 参照資料

| 資料名             | パス                                                                                             | 用途                       |
| ------------------ | ------------------------------------------------------------------------------------------------ | -------------------------- |
| Phase 7 成果物     | `outputs/phase-7/coverage-report.md`                                                             | カバレッジ結果確認         |
| Phase 8 成果物     | `outputs/phase-8/refactoring-log.md`                                                             | リファクタリング結果確認   |
| 対象テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 削除済み確認・残存参照確認 |

## 実行手順

### 1. 全テスト実行

```bash
# desktop パッケージのテスト全件実行
pnpm --filter @repo/desktop test:run
```

### 2. 型チェック実行

```bash
# 型チェック（desktop パッケージ）
pnpm --filter @repo/desktop typecheck
```

### 3. lint 実行

```bash
# lint（desktop パッケージ）
pnpm --filter @repo/desktop lint
```

### 4. describe.skip 残存確認

```bash
# describe.skip が残っていないことを確認
if test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; then
  grep -r "describe\.skip" \
    apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
else
  echo "N/A: target file deleted"
fi
# 期待: 出力なし、または N/A（対象ファイル削除済み）
```

### 5. TODO コメント残存確認

```bash
# TODO(W2-seq-03a) が残っていないことを確認
if test -e apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx; then
  grep -r "TODO(W2-seq-03a)" \
    apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx
else
  echo "N/A: target file deleted"
fi
# 期待: 出力なし、または N/A（対象ファイル削除済み）

# プロジェクト全体でも確認
grep -r "TODO(W2-seq-03a)" apps/desktop/src/
# 期待: 出力なし（0件）
```

### 6. 品質ゲート判定テーブル

| チェック項目                                  | 基準        | 結果    |
| --------------------------------------------- | ----------- | ------- |
| TypeScript 型チェック（desktop）              | エラー 0 件 | pending |
| ESLint（desktop）                             | エラー 0 件 | pending |
| ユニットテスト全件（desktop）                 | 全件 PASS   | pending |
| `describe.skip` 残存確認                      | 0 件 / N/A  | pending |
| `TODO(W2-seq-03a)` コメント残存確認           | 0 件 / N/A  | pending |
| 新フロー用エッジケーステスト（選択肢B採用時） | 追加済み    | pending |

### 7. Phase 10 ブロッカー確認

| ブロッカー候補                                | 状況    |
| --------------------------------------------- | ------- |
| 型エラーあり（desktop）                       | pending |
| lint エラーあり（desktop）                    | pending |
| テスト失敗あり                                | pending |
| `describe.skip` 残存あり                      | pending |
| `TODO(W2-seq-03a)` コメント残存あり           | pending |
| 新フロー用エッジケーステスト未追加（選択肢B） | pending |

## 統合テスト連携【必須】

| 判定項目                                | 基準       | 結果    |
| --------------------------------------- | ---------- | ------- |
| `pnpm --filter @repo/desktop test:run`  | 全件 PASS  | pending |
| `pnpm --filter @repo/desktop typecheck` | PASS       | pending |
| `pnpm --filter @repo/desktop lint`      | 0 error    | pending |
| `describe.skip` 残存確認                | 0 件 / N/A | pending |
| `TODO(W2-seq-03a)` コメント残存確認     | 0 件 / N/A | pending |
| Phase 10 ブロッカー                     | なし       | pending |

## 多角的チェック観点

| 観点     | 確認内容                                                                                    |
| -------- | ------------------------------------------------------------------------------------------- |
| 矛盾     | 品質ゲート判定テーブルの各項目が実際の計測結果と矛盾していないか                            |
| 漏れ     | 対象テストファイルが存在する場合に `describe.skip` が全 describe ブロックで残存していないか |
| 整合性   | Phase 4〜8 の成果物が品質ゲートの全項目を満たしていることが確認されているか                 |
| 依存関係 | 選択肢B（書き直し）採用時に新フロー用エッジケーステストが追加されているか                   |

## サブタスク管理

1. 全テスト実行（`pnpm --filter @repo/desktop test:run`）
2. 型チェック実行（`pnpm --filter @repo/desktop typecheck`）
3. lint 実行（`pnpm --filter @repo/desktop lint`）
4. `describe.skip` 残存確認
5. `TODO(W2-seq-03a)` コメント残存確認
6. 品質ゲート判定テーブル確認
7. Phase 10 ブロッカー確認
8. 品質保証レポート作成

## 成果物

| 成果物           | パス                            | 説明                                            |
| ---------------- | ------------------------------- | ----------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/qa-results.md` | テスト・lint・typecheck 結果・Phase 10 進行可否 |

## 完了条件

- [ ] `pnpm --filter @repo/desktop test:run` が全件 PASS すること
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件であること
- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 件であること
- [ ] `describe.skip` が対象テストファイルに残存していないこと、または対象ファイル削除済みであることを確認済み
- [ ] `TODO(W2-seq-03a)` コメントが 0 件であること、または対象ファイル削除済みであることを確認済み
- [ ] 選択肢B採用時は新フロー用エッジケーステストが追加されていることを確認済み
- [ ] Phase 10 ブロッカーなし
- [ ] 品質保証レポート（`outputs/phase-9/qa-results.md`）が作成済み
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 10: 最終レビュー
