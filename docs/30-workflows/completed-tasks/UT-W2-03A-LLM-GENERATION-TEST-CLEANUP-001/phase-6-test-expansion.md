# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 6                                                        |
| タスクID   | UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001                |
| 機能名     | SkillCreateWizard LLM生成フロー 削除済み前提のテスト拡充 |
| 前提Phase  | Phase 5                                                  |
| 後続Phase  | Phase 7                                                  |
| 作成日     | 2026-04-16                                               |
| ステータス | pending                                                  |

## 目的

Phase 5 で削除済み前提が確定したため、`SkillCreateWizard.llm-generation.test.tsx` 側の拡張は行わない。
必要がある場合のみ `SkillCreateWizard.test.tsx` に補完を寄せ、削除済みの suite は N/A として扱う。

## 実行タスク

- [ ] 削除済み suite に対する追加テスト作成を行わない
- [ ] `SkillCreateWizard.test.tsx` の重複と不足だけを確認する
- [ ] 旧フロー由来の 4 テスト名は、対象ファイルが存在する場合のみ参照する
- [ ] 補完が必要なら Phase 7 のカバレッジ確認に渡す
- [ ] 変更が発生した場合のみ `pnpm --filter @repo/desktop test:run` と `typecheck` を実行する

## 参照資料

| 資料名                 | パス                                                                                             | 用途                 |
| ---------------------- | ------------------------------------------------------------------------------------------------ | -------------------- |
| 整理対象テストファイル | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx` | 削除済みのため N/A   |
| 参照テストファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`                | 重複チェック・補完先 |
| Phase 5 実装サマリー   | `outputs/phase-5/implementation-summary.md`                                                      | 削除済み前提の確認   |

## 実行手順

### 1. 安全な存在確認

```bash
target_file="apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx"

if [ -e "$target_file" ]; then
  echo "想定外: $target_file が存在するため、拡張は行わず N/A とする"
else
  echo "N/A: $target_file は削除済み"
fi
```

### 2. companion test の重複・不足確認

```bash
rg -n "createSkill|isGenerating|cancel|error|generate" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

### 3. 変更が入った場合のみ共通確認

```bash
pnpm --filter @repo/desktop test:run
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携【必須】

| 判定項目                                | 基準                     | 結果    |
| --------------------------------------- | ------------------------ | ------- |
| 削除済み suite の扱い                   | N/A または想定外時の停止 | pending |
| companion test の重複・不足             | 必要箇所のみ補完         | pending |
| `pnpm --filter @repo/desktop test:run`  | 変更時のみ PASS          | pending |
| `pnpm --filter @repo/desktop typecheck` | 変更時のみ PASS          | pending |

## 多角的チェック観点

| 観点     | チェック内容                                                                   |
| -------- | ------------------------------------------------------------------------------ |
| 矛盾     | 削除済み suite を前提にした拡張を行っていないか                                |
| 漏れ     | companion test 側の不足だけを確認し、無関係な再作成をしていないか              |
| 整合性   | Phase 4 / 5 の N/A 記録と Phase 6 の扱いが一致しているか                       |
| 依存関係 | Phase 7 のカバレッジ確認が、削除済み suite ではなく現行 suite を基準にできるか |

## サブタスク管理

1. 削除済み suite の存在確認
2. companion test の重複・不足確認
3. 必要なら補完先を N/A ではなく companion test に寄せる
4. 変更があった場合のみ `test:run` と `typecheck` を実行
5. Phase 7 へ削除済み前提を引き継ぐ

## 成果物

| 成果物         | パス                                    | 説明                      |
| -------------- | --------------------------------------- | ------------------------- |
| テスト拡充ログ | `outputs/phase-6/test-expansion-log.md` | 追加可否と N/A 判定の記録 |

## 完了条件

- [ ] 削除済み suite に対する拡張を行っていない
- [ ] `SkillCreateWizard.test.tsx` の重複と不足を確認済み
- [ ] 変更がある場合のみ `pnpm --filter @repo/desktop test:run` が PASS
- [ ] 変更がある場合のみ `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 7: カバレッジ確認
