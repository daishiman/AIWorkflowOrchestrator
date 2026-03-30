# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 6                                       |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

対象テスト以外への影響、復旧手順の冪等性、ガイドの実行可能性を確認する。

## 実行タスク

- 周辺 runtime テスト確認
- install / rebuild 手順の冪等性確認
- docs 追試レビュー

## 参照資料

| 資料名         | パス                                                 | 説明        |
| -------------- | ---------------------------------------------------- | ----------- |
| 実装           | `phase-5-implementation.md`                          | 復旧手順    |
| 再発防止ガイド | `docs/40-guides/esbuild-arch-mismatch-prevention.md` | docs 成果物 |

## 実行手順

### Step 1: 周辺確認

```bash
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/
```

### Step 2: 冪等性確認

```bash
pnpm install --frozen-lockfile
pnpm ls esbuild @esbuild/darwin-arm64 @esbuild/darwin-x64 2>/dev/null || true
```

### Step 3: docs 追試

ガイドだけを見て第三者が同じ順序で復旧できるかをレビューする。

## 統合テスト連携

- 対象テスト単体の回復が runtime suite 全体を壊していないかを確認する。

## 成果物

| 成果物         | パス                                       | 説明                   |
| -------------- | ------------------------------------------ | ---------------------- |
| テスト拡充結果 | `outputs/phase-6/test-expansion-result.md` | 周辺検証と冪等性の結果 |

## 完了条件

- [ ] 周辺 runtime テストの結果を記録した
- [ ] install 手順の冪等性を確認した
- [ ] docs の追試結果を記録した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認
