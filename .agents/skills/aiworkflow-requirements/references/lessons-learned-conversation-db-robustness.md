# Lessons Learned: Conversation DB Robustness (2026-03-19)

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> current summary: [lessons-learned-current.md](lessons-learned-current.md)
> 役割: TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 の教訓を記録

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | Conversation DB 堅牢化実装での苦戦箇所と解決策を記録                  |
| スコープ | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001                                |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 2026-03-19 TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001

### 教訓1: module-level Singleton DB のテスト間リーク（P9再発）

Factory 関数パターンで module-level `let db` を使用すると、テスト間で状態がリークする。`_resetForTesting()` を全テストの `beforeEach` で呼ぶ必要がある。
リファクタリングで後方互換パスが `initializeConversationDatabase()` を呼ぶように変更した際、register-conversation-handlers.test.ts の17件が一斉FAILした。
原因: あるテストの `initializeConversationDatabase()` 呼び出しで module-level `db` がセットされ、次テストの `safeRegister` 内の `initializeConversationDatabase()` が冪等性ガードで即リターンし、モックDBではなく前テストのDBインスタンスが使われた。

**対策**: module-level Singleton を使う Factory 関数には必ず `_resetForTesting()` を提供し、テストの `beforeEach` で呼び出す。

### 教訓2: will-quit vs before-quit の選択

`before-quit` はユーザーがキャンセル可能（`event.preventDefault()`）で、DBクローズが保証されない。`will-quit` はキャンセル不可で確実に実行される。DBクローズのような「確実に実行すべき処理」には `will-quit` を使用する。

### 教訓3: 後方互換パスの3分岐→2分岐簡素化

registerAllIpcHandlers の第2引数 `conversationDb` が undefined/null/Database の3パターンを取りうる場合、`!= null`（truthy check）で2分岐にすると可読性が向上する。Phase 8でさらに後方互換パス内の重複ロジックを `initializeConversationDatabase()` 1行に集約した。

---

## 問題パターン（一般化）

- DB が開いたことと、IPC 群が安全に登録できたことを同じ成功として扱うと、後段の不整合を見落とす。
- graceful degradation を実装しても、仕様・未タスク・運用知見に戻さないと次回短く解決できない。
- 保存先変更は実装完了と同時に、既存データ移行責務を生む。

## 5分で確認する順序

1. DB 初期化の成否を確認する。
2. handler registration の成否を conversation channel 全体で確認する。
3. failure path で DB_NOT_AVAILABLE が返るか確認する。
4. scope 外課題を unassigned-task に formalize する。

## 次回の判断ルール

- conversation:search だけを例外扱いしない。
- 旧 path と新 path が並立する変更では、migration を別責務として必ず評価する。
- Phase 12 の完了条件は、計画ではなく実体ファイルと導線で判定する。
