# テスト仕様書

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 4                                              |

## テストファイル

`packages/shared/src/services/skillCreator/__tests__/smartDefaultReasoningService.test.ts`

## テストケース一覧

### ツール推論（7件）

| #   | テスト内容                   | 期待値                          |
| --- | ---------------------------- | ------------------------------- |
| 1   | purpose に 'Slack' を含む    | tool = 'slack'                  |
| 2   | purpose に 'GitHub' を含む   | tool = 'github'                 |
| 3   | purpose に 'Notion' を含む   | tool = 'notion'                 |
| 4   | ツール名が含まれない         | tool = null（フォールバック）   |
| 5   | 'Slack' と 'GitHub' 両方含む | tool = 'slack'（先勝ちルール）  |
| 6   | 'slack'（小文字）を含む      | tool = null（大文字小文字区別） |
| 7   | purpose が null              | tool = null（エラーにならない） |

### タイミング推論（9件）

| #   | テスト内容                       | 期待値                               |
| --- | -------------------------------- | ------------------------------------ |
| 8   | purpose に '毎日' を含む         | timing = 'scheduled'                 |
| 9   | purpose に '毎週' を含む         | timing = 'scheduled'                 |
| 10  | purpose に '定期' を含む         | timing = 'scheduled'                 |
| 11  | purpose に 'スケジュール' を含む | timing = 'scheduled'                 |
| 12  | purpose に 'リアルタイム' を含む | timing = 'realtime'                  |
| 13  | purpose に '即座' を含む         | timing = 'realtime'                  |
| 14  | purpose に 'すぐに' を含む       | timing = 'realtime'                  |
| 15  | タイミングキーワードなし         | timing = null（フォールバック）      |
| 16  | '毎日' と 'リアルタイム' 両方    | timing = 'scheduled'（先勝ちルール） |

### フォーマット推論（6件）

| #   | テスト内容                 | 期待値                          |
| --- | -------------------------- | ------------------------------- |
| 17  | category = 'code-support'  | format = 'code'                 |
| 18  | category = 'data-analysis' | format = 'structured'           |
| 19  | category が null           | format = null（フォールバック） |
| 20  | category が undefined      | format = null                   |
| 21  | category が 'automation'   | format = null                   |
| 22  | category が 空文字         | format = null                   |

### inferenceLog（4件）

| #   | テスト内容                           | 期待値                                    |
| --- | ------------------------------------ | ----------------------------------------- |
| 23  | 推論1件                              | inferenceLog.length = 1 かつ "slack" 含む |
| 24  | 推論0件                              | inferenceLog = []                         |
| 25  | ツール+タイミング+フォーマット全推論 | inferenceLog.length = 3                   |
| 26  | 各エントリが対応フィールド名含む     | slack/scheduled/structured 含む           |

### フォールバック（2件）

| #   | テスト内容          | 期待値                                                   |
| --- | ------------------- | -------------------------------------------------------- |
| 27  | purpose = 空文字    | tool/timing = null（category 未選択なら format も null） |
| 28  | purpose = undefined | tool/timing = null（category 未選択なら format も null） |

### 組み合わせテスト（3件）

| #   | テスト内容                                  | 期待値                                           |
| --- | ------------------------------------------- | ------------------------------------------------ |
| 29  | 毎日Slack, category=automation              | tool=slack, timing=scheduled, format=null        |
| 30  | リアルタイムレビュー, category=code-support | tool=null, timing=realtime, format=code          |
| 31  | Notion毎週, category=data-analysis          | tool=notion, timing=scheduled, format=structured |

**合計: 31 テストケース**（vitest 実行時は describe ネストで 32 表示）
