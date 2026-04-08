# 拡張テストケース

## タスク情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| Phase    | 6                                              |

## 追加済みエッジケース（Phase 4 時点で既に含む）

### ツール推論エッジケース

| ケース                                  | 期待結果                          | テスト状態 |
| --------------------------------------- | --------------------------------- | ---------- |
| purpose に "Slack" と "GitHub" 両方含む | tool = "slack"（先勝ちルール）    | ✅ PASS    |
| purpose に "slack"（小文字）が含まれる  | tool = null（大文字小文字は区別） | ✅ PASS    |
| purpose に "SlackBot" と入力する        | tool = "slack"（部分一致）        | ✅ PASS    |
| purpose が null の場合                  | tool = null（エラーにならない）   | ✅ PASS    |

### タイミング推論エッジケース

| ケース                                       | 期待結果                             | テスト状態 |
| -------------------------------------------- | ------------------------------------ | ---------- |
| purpose に "毎日" と "リアルタイム" 両方含む | timing = "scheduled"（先勝ちルール） | ✅ PASS    |
| purpose に "毎週" が含まれる                 | timing = "scheduled"                 | ✅ PASS    |
| purpose に "スケジュール" が含まれる         | timing = "scheduled"                 | ✅ PASS    |
| purpose に "すぐに" が含まれる               | timing = "realtime"                  | ✅ PASS    |
| purpose に "即座" が含まれる                 | timing = "realtime"                  | ✅ PASS    |

### フォーマット推論エッジケース

| ケース                          | 期待結果      | テスト状態 |
| ------------------------------- | ------------- | ---------- |
| category が undefined の場合    | format = null | ✅ PASS    |
| category が "automation" の場合 | format = null | ✅ PASS    |
| category が "" 空文字の場合     | format = null | ✅ PASS    |

### inferenceLog 詳細テスト

| ケース                                           | 期待結果                        | テスト状態 |
| ------------------------------------------------ | ------------------------------- | ---------- |
| ツール+タイミング+フォーマット全て推論できた場合 | inferenceLog に 3件の記録       | ✅ PASS    |
| 推論が0件の場合                                  | inferenceLog = []               | ✅ PASS    |
| 各エントリが対応フィールド名を含む               | slack/scheduled/structured 含む | ✅ PASS    |

### 組み合わせテスト（AC-2）

| 入力                                                                  | 期待結果                                               | テスト状態 |
| --------------------------------------------------------------------- | ------------------------------------------------------ | ---------- |
| purpose="毎日Slackに通知を送る", category="automation"                | tool="slack", timing="scheduled", format=null          | ✅ PASS    |
| purpose="コードをリアルタイムでレビューする", category="code-support" | tool=null, timing="realtime", format="code"            | ✅ PASS    |
| purpose="Notionにデータを毎週記録する", category="data-analysis"      | tool="notion", timing="scheduled", format="structured" | ✅ PASS    |

## 総テスト数

**32 テスト全件 PASS**（エッジケースは Phase 4 テストファイルに既に組み込み済み）
