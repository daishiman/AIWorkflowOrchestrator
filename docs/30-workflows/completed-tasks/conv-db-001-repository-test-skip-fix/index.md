# UT-CONV-DB-001: conversationRepository.test.ts 75件SKIP修正

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

## 1. 目的

better-sqlite3 のネイティブバイナリを Node.js v22 に合わせてリビルドし、`conversationRepository.test.ts` の75件テストを全て PASS 状態にする。

## 2. 背景

`conversationRepository.test.ts` は75件のテストケースを持つが、better-sqlite3 のネイティブバイナリが Node.js v22 と ABI 不一致（P7パターン）のため、全件 `describe.skip` でスキップされている。`describeIfBetterSqlite3` という条件付き describe が `describe.skip` にフォールバックしている。

### 現状の問題

- `.node` バイナリファイルが `build/Release/` に存在しない
- `require('better-sqlite3')` が失敗 → `BetterSqlite3Ctor = null` → `describe.skip`
- ConversationRepository の回帰テストが実質的に存在しない
- `postinstall` スクリプトに `electron-rebuild` が未設定

## 3. スコープ

### 含むもの

- better-sqlite3 ネイティブバイナリのリビルド
- `describeIfBetterSqlite3` が `describe` に解決されることの確認
- postinstall スクリプトへのリビルドコマンド追加検討
- リビルド手順のドキュメント化

### 含まないもの

- テストケースの追加・変更
- ConversationRepository のコード変更
- Electron ABI リビルドの完全自動化（別タスク）

## 4. 成果物一覧

| 成果物                        | パス                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| Phase 1: 要件定義             | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-1-requirements.md`      |
| Phase 2: 設計                 | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-2-design.md`            |
| Phase 3: 設計レビュー         | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-3-design-review.md`     |
| Phase 4: テストコード静的確認 | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-4-test-verification.md` |
| Phase 5: 実装                 | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-5-implementation.md`    |
| Phase 6: 回帰確認             | `docs/30-workflows/conv-db-001-repository-test-skip-fix/phase-6-regression-check.md`  |

## 5. Phase 構成

| Phase | 名称                 | 目的                                                   | ゲート     |
| ----- | -------------------- | ------------------------------------------------------ | ---------- |
| 1     | 要件定義             | スキップ原因の特定と修正要件の明文化                   | -          |
| 2     | 設計                 | リビルド戦略と postinstall 設計                        | -          |
| 3     | 設計レビュー         | 設計の妥当性検証                                       | PASS/MINOR |
| 4     | テストコード静的確認 | 既存75件テストの構造確認（テストコード変更不要を確認） | -          |
| 5     | 実装                 | リビルド実行と postinstall 設定                        | -          |
| 6     | 回帰確認             | 75件 PASS と他テストへの影響なしを確認                 | -          |

## 6. 完了条件

- [x] better-sqlite3 のネイティブバイナリが正しくビルドされている
- [x] `conversationRepository.test.ts` の75件が全て PASS
- [x] `describeIfBetterSqlite3` が `describe` に解決されている
- [x] 他のテスト（conversation 関連85件）に影響がない
- [x] リビルド手順がドキュメント化されている
- [x] `apps/desktop/package.json` に `rebuild:native` スクリプトが追加されている（永続的修正）

## 7. リスクと対策

| リスク                                     | 影響度 | 対策                                                       |
| ------------------------------------------ | ------ | ---------------------------------------------------------- |
| Electron ABI と Node.js ABI の不一致が継続 | 高     | electron-rebuild を使用                                    |
| CI 環境でリビルドが失敗                    | 中     | postinstall でプラットフォーム別リビルド                   |
| テスト間の DB 状態リーク（P9）             | 中     | beforeEach で DB を完全リセットする実装を確認              |
| 次回 Node.js バージョンアップでの再発      | 高     | CI パイプラインに ABI 整合チェック追加を別タスクとして登録 |

## 8. 再発防止策

本タスクは一時的な修正であり、次回 Node.js バージョンアップ時に同じ問題が再発する可能性がある。根本的な再発防止には以下が必要:

- CI パイプラインに `node --version` と `node-abi` の整合チェックを追加
- `postinstall` または CI ステップでネイティブモジュールの自動リビルドを保証
- これらは本タスクのスコープ外であり、別タスクとして登録する

## 9. 参照情報

| 資料                        | パス                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| DB 実装パターン             | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md` |
| ConversationRepository 構成 | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`         |
| P7 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md#P7`                                             |
| P9 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md#P9`                                             |
| 親タスク仕様                | `docs/30-workflows/conversation-db-robustness/index.md`                             |
