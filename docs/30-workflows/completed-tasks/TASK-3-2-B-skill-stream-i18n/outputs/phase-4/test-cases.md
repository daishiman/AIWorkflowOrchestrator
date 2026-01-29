# Phase 4: テストケース一覧

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| Phase    | 4          |
| 作成日   | 2026-01-28 |
| タスクID | TASK-3-2-B |

---

## 1. formatRelativeTime i18n テスト

### 1.1 日本語ロケール (ja)

| ID    | テストケース                   | 入力                           | 期待出力   |
| ----- | ------------------------------ | ------------------------------ | ---------- |
| FT-01 | たった今（未来タイムスタンプ） | timestamp=now+1s, locale="ja"  | "たった今" |
| FT-02 | 30秒前                         | timestamp=now-30s, locale="ja" | "30秒前"   |
| FT-03 | 5分前                          | timestamp=now-5m, locale="ja"  | "5分前"    |
| FT-04 | 2時間前                        | timestamp=now-2h, locale="ja"  | "2時間前"  |
| FT-05 | 3日前                          | timestamp=now-3d, locale="ja"  | "3日前"    |

### 1.2 英語ロケール (en)

| ID    | テストケース   | 入力                           | 期待出力         |
| ----- | -------------- | ------------------------------ | ---------------- |
| FT-06 | Just now       | timestamp=now+1s, locale="en"  | "Just now"       |
| FT-07 | 30 seconds ago | timestamp=now-30s, locale="en" | "30 seconds ago" |
| FT-08 | 5 minutes ago  | timestamp=now-5m, locale="en"  | "5 minutes ago"  |
| FT-09 | 2 hours ago    | timestamp=now-2h, locale="en"  | "2 hours ago"    |
| FT-10 | 3 days ago     | timestamp=now-3d, locale="en"  | "3 days ago"     |

### 1.3 英語単数形

| ID    | テストケース | 入力                          | 期待出力       |
| ----- | ------------ | ----------------------------- | -------------- |
| FT-11 | 1 second ago | timestamp=now-1s, locale="en" | "1 second ago" |
| FT-12 | 1 minute ago | timestamp=now-1m, locale="en" | "1 minute ago" |
| FT-13 | 1 hour ago   | timestamp=now-1h, locale="en" | "1 hour ago"   |
| FT-14 | 1 day ago    | timestamp=now-1d, locale="en" | "1 day ago"    |

### 1.4 デフォルト・フォールバック

| ID    | テストケース               | 入力                           | 期待出力 |
| ----- | -------------------------- | ------------------------------ | -------- |
| FT-15 | デフォルト（locale未指定） | timestamp=now-30s              | "30秒前" |
| FT-16 | 未対応ロケール             | timestamp=now-30s, locale="fr" | "30秒前" |

### 1.5 境界値

| ID    | テストケース | 入力                           | 期待出力 |
| ----- | ------------ | ------------------------------ | -------- |
| FT-17 | 59秒         | timestamp=now-59s, locale="ja" | "59秒前" |
| FT-18 | 60秒→1分     | timestamp=now-60s, locale="ja" | "1分前"  |
| FT-19 | 24時間→1日   | timestamp=now-24h, locale="ja" | "1日前"  |

---

## 2. SkillStreamDisplay i18n テスト

### 2.1 日本語ステータス

| ID    | テストケース | 条件                            | 期待表示 |
| ----- | ------------ | ------------------------------- | -------- |
| SD-01 | 待機中       | status="idle", locale="ja"      | "待機中" |
| SD-02 | 実行中       | status="running", locale="ja"   | "実行中" |
| SD-03 | 完了         | status="completed", locale="ja" | "完了"   |
| SD-04 | エラー       | status="error", locale="ja"     | "エラー" |
| SD-05 | 中断         | status="aborted", locale="ja"   | "中断"   |

### 2.2 英語ステータス

| ID    | テストケース | 条件                            | 期待表示    |
| ----- | ------------ | ------------------------------- | ----------- |
| SD-06 | Idle         | status="idle", locale="en"      | "Idle"      |
| SD-07 | Running      | status="running", locale="en"   | "Running"   |
| SD-08 | Completed    | status="completed", locale="en" | "Completed" |
| SD-09 | Error        | status="error", locale="en"     | "Error"     |
| SD-10 | Aborted      | status="aborted", locale="en"   | "Aborted"   |

### 2.3 ボタンラベル

| ID    | テストケース         | 条件                            | 期待表示   |
| ----- | -------------------- | ------------------------------- | ---------- |
| SD-11 | 中断ボタン（日）     | status="running", locale="ja"   | "中断"     |
| SD-12 | リセットボタン（日） | status="completed", locale="ja" | "リセット" |
| SD-13 | Abort button（英）   | status="running", locale="en"   | "Abort"    |
| SD-14 | Reset button（英）   | status="completed", locale="en" | "Reset"    |

### 2.4 aria-label

| ID    | テストケース              | 条件                          | 期待値               |
| ----- | ------------------------- | ----------------------------- | -------------------- |
| SD-15 | LoadingSpinner aria（日） | status="running", locale="ja" | "実行中"             |
| SD-16 | LoadingSpinner aria（英） | status="running", locale="en" | "Loading"            |
| SD-17 | CopyButton aria（日）     | locale="ja"                   | "メッセージをコピー" |
| SD-18 | CopyButton aria（英）     | locale="en"                   | "Copy message"       |

### 2.5 メッセージ

| ID    | テストケース             | 条件                          | 期待表示                       |
| ----- | ------------------------ | ----------------------------- | ------------------------------ |
| SD-19 | アイドルメッセージ（日） | status="idle", locale="ja"    | "スキル実行を開始してください" |
| SD-20 | 実行中メッセージ（日）   | status="running", locale="ja" | "実行中..."                    |
| SD-21 | Idle message（英）       | status="idle", locale="en"    | "Start skill execution"        |
| SD-22 | Running message（英）    | status="running", locale="en" | "Executing..."                 |

### 2.6 コピーフィードバック

| ID    | テストケース       | 条件                  | 期待表示         |
| ----- | ------------------ | --------------------- | ---------------- |
| SD-23 | コピー成功（日）   | コピー後, locale="ja" | "コピーしました" |
| SD-24 | Copy success（英） | コピー後, locale="en" | "Copied"         |

---

## 3. i18n設定テスト

### 3.1 初期化

| ID    | テストケース       | 検証内容                 | 期待結果         |
| ----- | ------------------ | ------------------------ | ---------------- |
| IC-01 | 初期化成功         | i18n.isInitialized       | true             |
| IC-02 | デフォルト言語     | i18n.language            | "ja" または "en" |
| IC-03 | フォールバック言語 | i18n.options.fallbackLng | ["ja"]           |
| IC-04 | デフォルト名前空間 | i18n.options.defaultNS   | "skill-stream"   |

### 3.2 翻訳取得

| ID    | テストケース          | 条件          | 期待結果         |
| ----- | --------------------- | ------------- | ---------------- |
| IC-05 | status.running（日）  | language="ja" | "実行中"         |
| IC-06 | status.running（英）  | language="en" | "Running"        |
| IC-07 | feedback.copied（日） | language="ja" | "コピーしました" |
| IC-08 | feedback.copied（英） | language="en" | "Copied"         |

### 3.3 補間

| ID    | テストケース           | 条件                             | 期待結果         |
| ----- | ---------------------- | -------------------------------- | ---------------- |
| IC-09 | 数値補間（日）         | t("time.secondsAgo", {count:30}) | "30秒前"         |
| IC-10 | 数値補間・複数形（英） | t("time.secondsAgo", {count:30}) | "30 seconds ago" |
| IC-11 | 数値補間・単数形（英） | t("time.secondsAgo", {count:1})  | "1 second ago"   |

### 3.4 フォールバック

| ID    | テストケース             | 条件                  | 期待結果           |
| ----- | ------------------------ | --------------------- | ------------------ |
| IC-12 | 未対応言語フォールバック | language="fr"         | "実行中"（日本語） |
| IC-13 | 存在しないキー           | t("non.existent.key") | "non.existent.key" |

### 3.5 名前空間

| ID    | テストケース     | 検証内容                           | 期待結果 |
| ----- | ---------------- | ---------------------------------- | -------- |
| IC-14 | 名前空間読み込み | hasLoadedNamespace("skill-stream") | true     |
| IC-15 | 日本語リソース   | getResourceBundle("ja")            | 定義済み |
| IC-16 | 英語リソース     | getResourceBundle("en")            | 定義済み |

---

## 4. 統計

| カテゴリ                | テストケース数 |
| ----------------------- | -------------- |
| formatRelativeTime i18n | 19             |
| SkillStreamDisplay i18n | 24             |
| i18n設定                | 16             |
| **合計**                | **59**         |

---

## 5. テスト状態

| 状態 | Phase 4完了時 | Phase 5完了後 |
| ---- | ------------- | ------------- |
| PASS | 0             | 59            |
| FAIL | 59            | 0             |
