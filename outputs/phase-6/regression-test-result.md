# Phase 6: リグレッションテスト結果 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## 実行コマンド

```bash
pnpm vitest run packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts
```

## 結果

```
RUN  v2.1.9

✓ packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts (33 tests) 12ms

Test Files  1 passed (1)
     Tests  33 passed (33)
  Start at  2026-04-08
  Duration  1.8s
```

## 全件判定（TC-01〜TC-20 + 追加分）

### ツール推論

| TC ID | 説明                                       | 結果 |
| ----- | ------------------------------------------ | ---- |
| TC-01 | purpose に 'Slack' → tool = 'slack'        | PASS |
| TC-02 | purpose に 'GitHub' → tool = 'github'      | PASS |
| TC-03 | purpose に 'Notion' → tool = 'notion'      | PASS |
| TC-04 | ツール名なし → tool = null                 | PASS |
| TC-16 | Slack + GitHub 両方 → slack 先勝ち         | PASS |
| TC-17 | 'slack'（小文字）→ tool = null             | PASS |
| TC-18 | 'SlackBot'（部分一致）→ tool = 'slack'     | PASS |
| TC-19 | purpose = null → tool = null（エラーなし） | PASS |

### タイミング推論

| TC ID | 説明                                       | 結果 |
| ----- | ------------------------------------------ | ---- |
| TC-05 | '毎日' → timing = 'scheduled'              | PASS |
| TC-06 | '毎週' → timing = 'scheduled'              | PASS |
| TC-07 | '定期' → timing = 'scheduled'              | PASS |
| -     | 'スケジュール' → timing = 'scheduled'      | PASS |
| TC-08 | 'リアルタイム' → timing = 'realtime'       | PASS |
| -     | '即座' → timing = 'realtime'               | PASS |
| -     | 'すぐに' → timing = 'realtime'             | PASS |
| TC-09 | タイミングキーワードなし → timing = null   | PASS |
| TC-20 | '毎日' + 'リアルタイム' → scheduled 先勝ち | PASS |

### フォーマット推論

| TC ID | 説明                                               | 結果 |
| ----- | -------------------------------------------------- | ---- |
| TC-10 | category = 'code-support' → format = 'code'        | PASS |
| TC-11 | category = 'data-analysis' → format = 'structured' | PASS |
| TC-12 | category = null → format = null                    | PASS |
| -     | category = undefined → format = null               | PASS |
| -     | category = 'automation' → format = null            | PASS |
| -     | category = '' → format = null                      | PASS |

### inferenceLog

| TC ID | 説明                                       | 結果 |
| ----- | ------------------------------------------ | ---- |
| TC-13 | 推論1件 → inferenceLog length = 1          | PASS |
| TC-14 | 推論0件 → inferenceLog = []                | PASS |
| -     | ツール+タイミング+フォーマット全推論 → 3件 | PASS |
| -     | 各エントリがフィールド名を含む             | PASS |

### フォールバック

| TC ID | 説明                                               | 結果 |
| ----- | -------------------------------------------------- | ---- |
| TC-15 | purpose 空 → tool/timing=null, category 推論継続   | PASS |
| -     | purpose undefined → 全フィールド null              | PASS |
| -     | purpose 空白のみ → tool/timing=null, category 継続 | PASS |

### 組み合わせ

| TC ID | 説明                                                                                | 結果 |
| ----- | ----------------------------------------------------------------------------------- | ---- |
| -     | 毎日Slack + automation → tool='slack', timing='scheduled', format=null              | PASS |
| -     | リアルタイム + code-support → tool=null, timing='realtime', format='code'           | PASS |
| -     | Notion毎週 + data-analysis → tool='notion', timing='scheduled', format='structured' | PASS |

## 総合判定: PASS（33/33件）

TC-01〜TC-20 および追加分を含む全33件が PASS。リグレッションなし。
