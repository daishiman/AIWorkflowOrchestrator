# UT-CONV-DB-001: conversationRepository.test.ts 75件SKIPの修正

## メタ情報

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-CONV-DB-001                                                           |
| タスク名     | conversationRepository.test.ts 75件SKIP修正                              |
| 分類         | テスト基盤改善                                                           |
| 対象機能     | Conversation DB テスト                                                   |
| 優先度       | HIGH                                                                     |
| 見積もり規模 | Small (Phase 1-6簡易版)                                                  |
| ステータス   | completed                                                                |
| 完了日       | 2026-03-22                                                               |
| 発見元       | Phase 12（TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001）                      |
| 発見日       | 2026-03-19                                                               |
| 親タスク     | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001                                  |
| Issue        | [#1340](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1340) |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

conversationRepository.test.ts は75件のテストケースを持つが、better-sqlite3 のネイティブバイナリが Node.js v22 と ABI 不一致（P7パターン）のため、全件 `describe.skip` でスキップされている。`describeIfBetterSqlite3` という条件付きdescribeが `describe.skip` にフォールバックしている。

### 1.2 問題点・課題

- 75件のテストが機能していないため、ConversationRepository の回帰テストが実質的に存在しない
- DB操作層のバグが検出されずにリリースされるリスク
- TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 で新設した `conversationDatabase.ts` の Factory 関数パターンとの統合テストも不可能

### 1.3 放置した場合の影響

- ConversationRepository の変更時に回帰テストが機能しない
- 実質的なテストカバレッジが `conversationHandlers.test.ts`（43件）と `register-conversation-handlers.test.ts`（22件）のモックテストのみ

### 苦戦箇所の教訓（TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 より）

- P7: `pnpm store prune && pnpm install --force` でネイティブモジュールのリビルドが必要。通常の `pnpm install` ではキャッシュされた古いバイナリが残る
- P9: better-sqlite3 の実DBを使うテストでは、テスト間でDB状態がリークしやすい。`beforeEach` で DB を完全にリセットする必要がある
- Electron の ABI と Node.js の ABI が異なる場合、`electron-rebuild` または `@electron/rebuild` が必要

## 2. 何を達成するか（What）

### 2.1 目的

better-sqlite3 のネイティブバイナリを現在の Node.js/Electron バージョンに合わせてリビルドし、75件のテストを全て PASS 状態にする。

### 2.2 最終ゴール

`cd apps/desktop && pnpm vitest run src/main/repositories/__tests__/conversationRepository.test.ts` で75件全て PASS。

### 2.3 スコープ

含むもの:

- better-sqlite3 ネイティブバイナリのリビルド
- `describeIfBetterSqlite3` の条件ロジック確認・修正
- postinstall スクリプトへのリビルドコマンド追加検討

含まないもの:

- テストケースの追加・変更
- ConversationRepository のコード変更
- Electron ABI リビルドの完全自動化（別タスク）

### 2.4 成果物

- リビルド手順ドキュメント
- postinstall 設定（該当する場合）
- 75件テスト PASS の確認記録

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js v22 環境
- pnpm パッケージマネージャー

### 3.2 依存タスク

なし（独立実行可能）

### 3.3 推奨アプローチ

1. `pnpm store prune && pnpm install --force` でリビルドを試行
2. 失敗する場合は `npx electron-rebuild -f -w better-sqlite3` を試行
3. CI 環境でも動作するよう postinstall スクリプトに追加

## 4. 実行手順

簡易版 Phase 1-6 で実行。

### Phase 1: 現状確認

```bash
# 現在のスキップ状態を確認
cd apps/desktop && pnpm vitest run src/main/repositories/__tests__/conversationRepository.test.ts --reporter=verbose 2>&1 | head -30

# Node.js / better-sqlite3 バージョン確認
node -v
pnpm list better-sqlite3
```

### Phase 2: ネイティブバイナリのリビルド

```bash
# Step 1: キャッシュクリア + 強制再インストール
pnpm store prune && pnpm install --force

# Step 2: 上記で解決しない場合は electron-rebuild を使用
cd apps/desktop
npx @electron/rebuild -f -w better-sqlite3
```

### Phase 3: describeIfBetterSqlite3 の確認

```bash
# 条件ロジックのファイルを特定
grep -rn "describeIfBetterSqlite3" apps/desktop/src/
```

`describeIfBetterSqlite3` が `describe.skip` にフォールバックする条件（better-sqlite3 のロードチェック）がリビルド後に `describe` に解決されることを確認する。

### Phase 4: テスト実行と PASS 確認

```bash
cd apps/desktop && pnpm vitest run src/main/repositories/__tests__/conversationRepository.test.ts --reporter=verbose
```

### Phase 5: postinstall スクリプトへの追加（任意）

`apps/desktop/package.json` の `postinstall` スクリプトにリビルドコマンドを追加し、CI 環境での自動リビルドを保証する。

### Phase 6: 回帰確認

```bash
# 他の conversation 関連テストに影響がないことを確認
cd apps/desktop && pnpm vitest run src/main/ --reporter=verbose 2>&1 | tail -20
```

## 5. 完了条件チェックリスト

- [ ] better-sqlite3 のネイティブバイナリが正しくビルドされている
- [ ] `conversationRepository.test.ts` の75件が全て PASS
- [ ] `describeIfBetterSqlite3` が `describe` に解決されている
- [ ] 他のテスト（conversation 関連85件）に影響がない

## 6. 検証方法

```bash
cd apps/desktop && pnpm vitest run src/main/repositories/__tests__/conversationRepository.test.ts --reporter=verbose
```

期待する出力例:

```
Test Files  1 passed (1)
Tests       75 passed (75)
```

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                          |
| ------------------------------------------ | ------ | -------- | --------------------------------------------- |
| Electron ABI と Node.js ABI の不一致が継続 | 高     | 中       | electron-rebuild を使用                       |
| CI 環境でリビルドが失敗                    | 中     | 低       | postinstall でプラットフォーム別リビルド      |
| テスト間の DB 状態リーク（P9）             | 中     | 中       | beforeEach で DB を完全リセットする実装を確認 |

## 8. 参照情報

| 資料                        | パス                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| DB 実装パターン             | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md` |
| ConversationRepository 構成 | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`         |
| P7 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md#P7`                                             |
| P9 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md#P9`                                             |
| 親タスク仕様                | `docs/30-workflows/conversation-db-robustness/index.md`                             |
| 教訓（P9 Singleton リーク） | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`      |

## 9. 備考

- 本タスクは TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 の Phase 12 で検出
- P7 パターンの根本解決として、postinstall への自動リビルド追加を推奨
- `describeIfBetterSqlite3` の実装場所は `apps/desktop/src/` 内で `grep -rn "describeIfBetterSqlite3"` で確認すること
