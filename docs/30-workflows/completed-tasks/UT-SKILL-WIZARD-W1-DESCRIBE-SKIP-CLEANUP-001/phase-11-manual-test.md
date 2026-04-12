# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 11                                             |
| タスクID   | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001   |
| タスク名   | describe.skip 内の旧 testid 参照クリーンアップ |
| 前提Phase  | Phase 10                                       |
| 後続Phase  | Phase 12                                       |
| 作成日     | 2026-04-11                                     |
| ステータス | 未実施                                         |

## 目的

NON_VISUAL タスクの手動検証を CLI 出力確認により実施し、
`skill-lifecycle-request-input` 参照の完全除去とテスト・型チェックの全通過を確認する。

## 実行タスク

- MT-01: grep で skill-lifecycle-request-input 参照の残存がないことを確認する
- MT-02: pnpm --filter @repo/desktop test:run を実行して全件 PASS を確認する
- MT-03: pnpm --filter @repo/desktop typecheck を実行してエラーがないことを確認する
- 手動テスト結果を outputs/phase-11/ に出力する

## タスク種別判定テーブル

| 項目                   | 判定               |
| ---------------------- | ------------------ |
| UI 変更                | なし（NON_VISUAL） |
| テストファイル変更     | あり               |
| スクリーンショット要否 | 不要（NON_VISUAL） |

## 手動テスト計画テーブル

| MT番号 | シナリオ                                           | 手順                                                                                                        | 期待結果      |
| ------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------- |
| MT-01  | `skill-lifecycle-request-input` 参照の残存確認     | `grep -rn "skill-lifecycle-request-input" apps/desktop/src/renderer/components/skill/__tests__/` を実行する | マッチ 0 件   |
| MT-02  | `pnpm --filter @repo/desktop test:run` が全件 PASS | `pnpm --filter @repo/desktop test:run` を実行する                                                           | 全テスト PASS |
| MT-03  | `pnpm --filter @repo/desktop typecheck` が PASS    | `pnpm --filter @repo/desktop typecheck` を実行する                                                          | エラー 0 件   |

## 手動テスト実行手順

```bash
# MT-01: skill-lifecycle-request-input 参照の残存確認
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/ \
  || echo "OK: 0 matches found"

# describe.skip ブロック内も含めて個別確認
grep -n "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx \
  || echo "OK: llm-generation - 0 matches"

grep -n "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx \
  || echo "OK: auth-regression - 0 matches"

# MT-02: 全テスト実行
pnpm --filter @repo/desktop test:run

# MT-03: 型チェック
pnpm --filter @repo/desktop typecheck
```

## Semantic / Visual / AI UX 評価

| 評価種別 | 対象                      | 結果                           |
| -------- | ------------------------- | ------------------------------ |
| Semantic | testid 参照の完全除去     | grep で 0 件確認後に PASS 判定 |
| Visual   | N/A（テストファイルのみ） | NON_VISUAL                     |
| AI UX    | N/A（テストファイルのみ） | NON_VISUAL                     |

## スクリーンショット

NON_VISUAL タスクのためスクリーンショットは不要。
代わりに CLI 出力をテキスト証跡として記録する。

```
# MT-01 期待される CLI 出力（例）
OK: 0 matches found
OK: llm-generation - 0 matches
OK: auth-regression - 0 matches

# MT-02 期待される CLI 出力（例）
PASS  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx
PASS  src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
...
Test Files  X passed (X)
Tests       X passed (X)

# MT-03 期待される CLI 出力（例）
tsc: no errors found
```

## フィードバックループ

Phase 11 で発見された HIGH 問題: なし（実施前）

## 参照資料

| 資料名           | パス                                      | 用途            |
| ---------------- | ----------------------------------------- | --------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Phase 10 成果物 |

## 実行手順

1. MT-01 の grep コマンドを実行して参照残存がないことを確認する
2. MT-02 の `test:run` を実行して全テスト PASS を確認する
3. MT-03 の `typecheck` を実行してエラーがないことを確認する
4. 手動テスト結果を outputs/phase-11/ に出力する

## 統合テスト連携

NON_VISUAL タスクのため UI 証跡は不要。CLI 出力確認による代替検証を実施する。

```bash
# 旧 testid 参照の残存確認
grep -rn "skill-lifecycle-request-input" \
  apps/desktop/src/renderer/components/skill/__tests__/

# 全テスト PASS 確認
pnpm --filter @repo/desktop test:run

# 型チェック PASS 確認
pnpm --filter @repo/desktop typecheck
```

## 多角的チェック観点

| 観点               | 確認内容                                             |
| ------------------ | ---------------------------------------------------- |
| 削除完全性         | grep で旧 testid 参照が 0 件であること               |
| テスト通過         | test:run が全件 PASS すること                        |
| 型安全性           | typecheck がエラーなしで通過すること                 |
| describe.skip 整合 | スキップブロックの内容が現行 UI と矛盾していないこと |

## 成果物

| 成果物         | パス                                     | 説明                    |
| -------------- | ---------------------------------------- | ----------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | MT-01〜MT-03 の実行結果 |

## 完了条件

- [ ] MT-01〜MT-03 が全て PASS
- [ ] NON_VISUAL の理由が記録されている
- [ ] HIGH 問題なし（または全て unassigned-task として記録済み）

## サブタスク管理

| サブタスクID | 内容                        | 状態   |
| ------------ | --------------------------- | ------ |
| ST-11-1      | MT-01: grep 残存確認        | 未実施 |
| ST-11-2      | MT-02: test:run 実行・確認  | 未実施 |
| ST-11-3      | MT-03: typecheck 実行・確認 | 未実施 |
| ST-11-4      | 手動テスト結果出力          | 未実施 |

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成（仕様書として記録）
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001
```

## 次のPhase

Phase 12: ドキュメント更新
