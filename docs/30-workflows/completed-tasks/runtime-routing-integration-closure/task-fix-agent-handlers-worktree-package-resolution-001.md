# agentHandlers.test.ts Worktree パッケージ解決エラー修復 - タスク指示書

## メタ情報

```yaml
issue_number: 1236
```

## メタ情報

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| タスクID     | UT-FIX-AGENT-HANDLERS-WORKTREE-PACKAGE-RESOLUTION-001                        |
| タスク名     | agentHandlers.test.ts の @repo/shared パッケージ解決エラー修復               |
| 分類         | バグ修正                                                                     |
| 対象機能     | Agent実行ハンドラーのテスト環境                                              |
| 優先度       | 中                                                                           |
| 見積もり規模 | 小規模                                                                       |
| ステータス   | 未実施                                                                       |
| 発見元       | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001（Phase 5 実装中） |
| 発見日       | 2026-03-15                                                                   |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 の Phase 5 実装中に、`agentHandlers.test.ts` の既存16テストが全て失敗していることを発見した。`git stash` で当方の変更を退避しても同様に失敗するため、worktree 環境固有の問題であることを確認した。

### 1.2 問題点・課題

- `@repo/shared` パッケージのモジュール解決が worktree 環境で失敗する
- `agentHandlers.test.ts` の全16テストが `Cannot find module '@repo/shared'` エラーで FAIL
- worktree の `node_modules/.pnpm` のシンボリックリンク構造が本体リポジトリと異なる可能性がある
- P7（ネイティブモジュールのバイナリ不一致）の派生パターン

### 1.3 放置した場合の影響

- worktree 環境での agent 関連テスト実行が不可能
- 回帰テストの信頼性低下
- 新規 agent 機能追加時のテスト実行で混乱が発生

## 2. 何を達成するか（What）

### 2.1 目的

worktree 環境で `agentHandlers.test.ts` の全16テストが PASS する状態を回復する。

### 2.2 最終ゴール

- `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/agentHandlers.test.ts` が全件 PASS
- worktree 作成後の preflight チェックリストに `@repo/shared` 解決確認を追加

### 2.3 スコープ

#### 含むもの

- @repo/shared パッケージ解決エラーの原因特定
- vitest.config.ts の resolve.alias 設定確認
- worktree 環境での pnpm install / pnpm store prune の実行確認
- 必要に応じた tsconfig.json の paths 設定修正

#### 含まないもの

- agentHandlers の機能改修
- 新規テスト追加
- 他のテストファイルの修正

### 2.4 成果物

- 修正済みの設定ファイル（vitest.config.ts / tsconfig.json / package.json のいずれか）
- worktree preflight チェックリストの更新

## 3. どのように実行するか（How）

### 3.1 前提条件

- worktree 環境が構築済み
- pnpm install が実行済み

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識

- pnpm workspace のシンボリックリンク構造
- Vitest の resolve.alias 設定
- TypeScript の paths 設定とモノレポの依存解決

### 3.4 推奨アプローチ

1. まず `ls -la node_modules/@repo/shared` で symlink の存在を確認
2. `pnpm store prune && pnpm install --force` で再構築を試行
3. それでも解決しない場合は vitest.config.ts の `resolve.alias` に明示的なパス解決を追加

### 3.5 苦戦箇所（親タスク由来）

| 苦戦箇所                                          | 再発条件                                    | 対処                                                                  |
| ------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------- |
| worktree で @repo/shared が解決不能               | git worktree add 後に pnpm install のみ実行 | `pnpm store prune && pnpm install --force` を preflight に追加        |
| 本体リポジトリでは PASS するが worktree では FAIL | symlink 構造の差異                          | worktree 作成直後に `pnpm vitest run --reporter=dot` でスモークテスト |
| P7（ネイティブモジュール不一致）の拡張パターン    | Node.js/pnpm バージョン更新後               | `pnpm install --force` で全バイナリ再構築                             |

## 4. 実行手順

### Phase 1: 原因調査

#### 目的

エラーの根本原因を特定する。

#### 手順

1. `ls -la node_modules/@repo/shared` でシンボリックリンクを確認
2. `pnpm ls @repo/shared` で依存解決状態を確認
3. `vitest.config.ts` の resolve 設定を確認
4. 本体リポジトリとの差分を `diff` で比較

#### 成果物

原因分析レポート。

#### 完了条件

エラーの根本原因が特定されている。

### Phase 2: 修正適用

#### 目的

テストが PASS する状態を回復する。

#### 手順

1. 原因に応じた設定修正を適用
2. `pnpm vitest run src/main/ipc/__tests__/agentHandlers.test.ts` で全件 PASS を確認
3. 他のテストファイルへの影響がないことを確認

#### 成果物

修正済み設定ファイル。

#### 完了条件

全16テストが PASS。

### Phase 3: Preflight チェックリスト更新

#### 目的

再発防止のための worktree 構築手順を整備する。

#### 手順

1. worktree preflight に `@repo/shared` 解決確認ステップを追加
2. `lessons-learned` に教訓を記録

#### 成果物

更新済みチェックリスト。

#### 完了条件

ドキュメントに再発防止手順が記載されている。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `agentHandlers.test.ts` の全16テストが worktree 環境で PASS
- [ ] `@repo/shared` パッケージが正常に解決される

### 品質要件

- [ ] 他のテストファイルに影響がない
- [ ] 本体リポジトリのテストが引き続き PASS

### ドキュメント要件

- [ ] worktree preflight チェックリストが更新されている
- [ ] lessons-learned に教訓が記録されている

## 6. 検証方法

### テストケース

- worktree 環境で `agentHandlers.test.ts` 全件実行 → PASS
- 本体リポジトリで同テスト実行 → 引き続き PASS

### 検証手順

1. `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/agentHandlers.test.ts`
2. `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/agentHandlers.runtime.test.ts`
3. 両方 PASS を確認

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                        |
| -------------------------------------------- | ------ | -------- | ------------------------------------------- |
| resolve.alias 追加で他モジュールの解決に影響 | 中     | 低       | `@repo/shared` のみに限定した alias 設定    |
| pnpm store prune で他 worktree に影響        | 中     | 低       | worktree ごとに独立した node_modules を維持 |
| worktree 構築手順の複雑化                    | 低     | 中       | preflight スクリプト化で自動化              |

## 8. 参照情報

### 関連ドキュメント

- `.claude/rules/06-known-pitfalls.md` — P7（ネイティブモジュール不一致）、P40（テスト実行ディレクトリ依存）
- `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details.md`
- `apps/desktop/vitest.config.ts`

### 参考資料

- `apps/desktop/src/main/ipc/__tests__/agentHandlers.test.ts`
- `apps/desktop/src/main/ipc/__tests__/agentHandlers.runtime.test.ts`
- pnpm workspace ドキュメント

## 9. 備考

### 発見経緯

UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 の Phase 5 で `agentHandlers.runtime.test.ts` を作成した際、既存の `agentHandlers.test.ts` が全件失敗していることを発見。`git stash` で当方変更を退避しても同結果であり、worktree 環境固有の問題と判定した。

### 補足事項

本タスクは worktree 環境のパッケージ解決修復に限定し、agentHandlers の機能改修は含まない。
