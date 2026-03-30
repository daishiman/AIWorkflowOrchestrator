# Phase 5: 実装（TDD-Green）

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 5                                       |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

environment mismatch を最短で復旧し、RT-06 target test の Green 化と再発防止ガイドの作成を完了する。

## 実行タスク

- 環境診断: current arch と expected platform を確認
- 環境修正: `pnpm install --force` を主経路として整合を復旧
- テスト検証: target test が exit 0 で完走することを確認
- ドキュメント作成: `docs/40-guides/esbuild-arch-mismatch-prevention.md` を作成

## 参照資料

| 資料名             | パス                                                                      | 説明           |
| ------------------ | ------------------------------------------------------------------------- | -------------- |
| Phase 1 要件定義   | `phase-1-requirements.md`                                                 | FR/NFR/AC 定義 |
| Phase 2 設計       | `phase-2-design.md`                                                       | 修正フロー     |
| Phase 4 テスト計画 | `phase-4-test-creation.md`                                                | テスト計画     |
| 未タスク指示書     | `docs/30-workflows/unassigned-task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md` | 実行手順の原案 |

## 実行手順

### Step 1: 環境診断

```bash
node -e "console.log('arch:', process.arch)"
file "$(which node)"
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
echo "$EXPECTED_PLATFORM"
ls node_modules/@esbuild/ 2>/dev/null || echo "esbuild packages not found"
```

### Step 2: 環境修正

```bash
rm -rf node_modules
pnpm store prune
pnpm install --force
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
ls node_modules/@esbuild/ | grep "$EXPECTED_PLATFORM"
```

### Step 3: target test 検証

```bash
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

### Step 4: 再発防止ガイド作成

ガイドには最低でも以下を含める。

| セクション             | 必須内容                                     |
| ---------------------- | -------------------------------------------- |
| 概要                   | mismatch の発生条件                          |
| 診断方法               | `process.arch` と `EXPECTED_PLATFORM` の確認 |
| 修正手順               | `pnpm install --force` を主経路にした復旧    |
| 再発防止               | worktree 作成後の preflight                  |
| トラブルシューティング | mismatch error と対処法                      |

## 統合テスト連携

- esbuild package 整合 -> vitest 起動 -> target test 完走 の順で確認する
- blocker が残る場合は Phase 10/11/12 に引き継ぐ

## 成果物

| 成果物               | パス                                                 | 説明                 |
| -------------------- | ---------------------------------------------------- | -------------------- |
| 環境修正結果         | `outputs/phase-5/implementation-result.md`           | 診断・修正・検証ログ |
| テスト実行結果       | `outputs/phase-5/test-result.md`                     | target test 実行ログ |
| 再発防止ドキュメント | `docs/40-guides/esbuild-arch-mismatch-prevention.md` | 再発防止手順ガイド   |

## 完了条件

- [ ] 環境診断を実行し記録
- [ ] `pnpm install --force` による復旧を実施
- [ ] AC-1: target test が exit 0 で完走
- [ ] AC-2: `node_modules/@esbuild/$EXPECTED_PLATFORM` が存在
- [ ] AC-3: mismatch エラーが出力に含まれない
- [ ] AC-4: ガイドが存在する
- [ ] AC-5: ガイドに `process.arch` と `pnpm install --force` が含まれる
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
