# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 8                                             |
| Phase 名   | リファクタリング                              |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 前提 Phase | Phase 7（カバレッジ確認）                     |
| 後続 Phase | Phase 9（品質検証）                           |
| ステータス | completed                                     |
| 作成日     | 2026-03-21                                    |
| 機能名     | runtime-policy-resolver-4state                |

## 目的

語彙ドリフトの最終チェック、不要な import / 未使用変数の削除、コード品質改善を行う。

## 実行タスク

- 語彙最終点検: capability 語彙へ寄せ切れているか確認する
- 不要コード整理: 未使用 import と未使用変数を削除する
- コメント更新: 旧語彙を direct caller 文脈に合わせて書き換える

## 参照資料

| 参照資料     | パス                      | 内容               |
| ------------ | ------------------------- | ------------------ |
| Phase 1 要件 | phase-1-requirements.md   | 境界と受入基準     |
| Phase 2 設計 | phase-2-design.md         | 語彙マッピング表   |
| Phase 5 実装 | phase-5-implementation.md | 実装内容           |
| Phase 6 拡充 | phase-6-test-expansion.md | 境界値と統合テスト |
| Phase 7 計測 | phase-7-coverage-check.md | coverage 判定結果  |

## 実行手順

### ステップ1: 語彙ドリフト最終チェック

```bash
# authMode 語彙が runtime ディレクトリ内の RuntimePolicyResolver 関連ファイルに残存していないか確認
grep -rn "authMode\|auth-mode\|AuthMode" apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts
grep -rn "authMode\|auth-mode\|AuthMode" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
# 期待: 両ファイルとも0件
```

### ステップ2: 不要 import / 未使用変数の削除

```bash
# TypeScript コンパイラで未使用 import を検出
cd apps/desktop && pnpm typecheck 2>&1 | grep -i "unused\|declared but"
```

### ステップ3: コメント内の旧語彙更新

JSDoc コメント内の「authMode」「auth mode」「api-key モード」「subscription モード」を capability 系語彙に更新する。

## 成果物

| 成果物                     | 配置先       |
| -------------------------- | ------------ |
| リファクタリング済みコード | 該当ファイル |

## 統合テスト連携

- grep gate: `RuntimePolicyResolver.ts` と `RuntimeSkillCreatorFacade.ts` の旧語彙検索結果を 0 件にそろえる
- typecheck gate: 未使用 import の削除後に `pnpm typecheck` を通す
- parent boundary: broader consumer で残る旧語彙は親タスク backlog に切り分け、ここで混在させない

## 完了条件

- [ ] `grep -rn "authMode" apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` が0件
- [ ] `grep -rn "authMode" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` が0件
- [ ] 未使用 import が存在しない
- [ ] コメント内の旧語彙が更新されている
- [ ] 全テストが引き続き PASS

## 次 Phase

Phase 9（品質検証）へ進む。
