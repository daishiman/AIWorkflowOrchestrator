# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 9                                             |
| Phase 名   | 品質検証                                      |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 |
| 前提 Phase | Phase 8（リファクタリング）                   |
| 後続 Phase | Phase 10（最終レビュー）                      |
| ステータス | completed                                     |
| 作成日     | 2026-03-21                                    |
| 機能名     | runtime-policy-resolver-4state                |

## 目的

Lint、型チェック、全テスト実行によりコード品質の最終確認を行う。

## 実行タスク

- lint 実行: 直接変更スコープの静的検証を行う
- typecheck 実行: capability bridge の型整合を確認する
- test 実行: shared と desktop の関連 suite を通す

## 参照資料

| 参照資料         | パス                             | 内容                   |
| ---------------- | -------------------------------- | ---------------------- |
| Phase 5 実装     | phase-5-implementation.md        | capability bridge 実装 |
| Phase 8 整理     | phase-8-refactoring.md           | 旧語彙整理結果         |
| CLAUDE.md        | CLAUDE.md                        | pnpm コマンド          |
| コード品質ルール | .claude/rules/02-code-quality.md | カバレッジ基準         |

## 実行手順

### ステップ1: Lint

```bash
pnpm lint
```

### ステップ2: 型チェック

```bash
pnpm typecheck
```

### ステップ3: shared パッケージテスト

```bash
pnpm --filter @repo/shared test
```

### ステップ4: desktop パッケージテスト

```bash
pnpm --filter @repo/desktop test
```

### ステップ5: 旧語彙残存チェック

```bash
grep -rn "authMode" apps/desktop/src/main/services/runtime/ --include="*.ts" | grep -iv "RuntimeResolver\|authModeService\|TerminalHandoff"
# 期待: RuntimePolicyResolver / RuntimeSkillCreatorFacade 関連の一致が0件
```

## 成果物

| 成果物       | 配置先   |
| ------------ | -------- |
| 品質検証結果 | 実行ログ |

## 統合テスト連携

- shared suite: `pnpm --filter @repo/shared test` で capability contract 回帰を確認する
- desktop suite: `pnpm --filter @repo/desktop test` で direct caller 回帰を確認する
- grep gate: runtime policy 関連の旧語彙検索を品質ゲートに含める

## 完了条件

- [ ] `pnpm lint` が PASS
- [ ] `pnpm typecheck` が PASS
- [ ] `pnpm --filter @repo/shared test` が全て PASS
- [ ] `pnpm --filter @repo/desktop test` が全て PASS
- [ ] 旧語彙残存チェックが0件

## 次 Phase

Phase 10（最終レビュー）へ進む。
