# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 8                                                                     |
| タスクID   | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                |
| タスク名   | packages/shared/vitest.config.ts の @repo/shared resolve alias 標準化 |
| 前提Phase  | Phase 7                                                               |
| 後続Phase  | Phase 9                                                               |
| 作成日     | 2026-04-08                                                            |
| ステータス | 完了                                                                  |

## 目的

Phase 5 の実装に対して、duplicate・naming drift を除去し、
コードの可読性と保守性を向上させる。

## リファクタリング分析

### 変更対象テーブル

| 対象ファイル                       | Before             | After                          | 理由                     |
| ---------------------------------- | ------------------ | ------------------------------ | ------------------------ |
| `packages/shared/vitest.config.ts` | resolve.alias なし | resolve.alias + 並列化設定追加 | 標準テンプレートへの適合 |

### duplicate 検出

```bash
# 他パッケージの vitest.config.ts に同様の設定があるか確認
find packages/ apps/ -name "vitest.config.ts" -exec grep -l "resolve" {} \;

# @repo/* alias の設定状況を確認
grep -rn "resolve.alias" packages/ apps/
```

**確認結果**:

- `packages/shared/vitest.config.ts` に resolve.alias を設定済み
- `apps/desktop/vitest.config.ts` は別パッケージのため別設定
- duplicate なし

### navigation drift 確認

本タスクは UI を持たないため navigation drift 確認は N/A。

### naming drift 確認

| 項目         | 確認内容                                      | 判定 |
| ------------ | --------------------------------------------- | ---- |
| alias キー名 | `"@repo/shared"` が package.json と一致するか | ✅   |
| alias 解決先 | `./index.ts` が実在するか                     | ✅   |
| 変数名       | `CI_MAX_FORKS`, `LOCAL_MAX_FORKS` が明確か    | ✅   |

## リファクタリング内容

**N/A** — Phase 5 の実装はすでに最小変更かつ命名が適切。
既存の `apps/desktop/vitest.config.ts` と同一パターンを採用しており、
プロジェクト全体の一貫性が保たれている。

## リファクタリング後のテスト確認

```bash
# リファクタリング後の全テスト実行
pnpm --filter @repo/shared test
```

## 参照資料

| 資料名             | パス                                 | 用途           |
| ------------------ | ------------------------------------ | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | Phase 7 成果物 |

## 成果物

| 成果物               | パス                                    | 説明                            |
| -------------------- | --------------------------------------- | ------------------------------- |
| リファクタリング報告 | `outputs/phase-8/refactoring-report.md` | リファクタリング内容（N/A含む） |

## 完了条件

- [x] duplicate の確認完了（なし）
- [x] naming drift の確認完了（問題なし）
- [x] リファクタリング後のテストが全件 PASS

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001
```

## 次のPhase

Phase 9: 品質保証
