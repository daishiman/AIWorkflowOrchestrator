# Phase 6: エッジケーステスト結果 — UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

## 対象エッジケース

### TC-16: 先勝ちルール（ツール複数一致）

**シナリオ**: purpose に 'Slack' と 'GitHub' 両方が含まれる

**検証内容**:

- `TOOL_KEYWORDS` は先頭から順に評価される
- 最初に一致した 'Slack' が採用される
- 後続の 'GitHub' は評価されない

**入力**: `{ purpose: "Slack と GitHub を使う", category: null }`

**結果**: PASS（tool = "slack"）

---

### TC-17: 大文字小文字区別

**シナリオ**: purpose に小文字の 'slack' が含まれる

**検証内容**:

- `String.includes()` は大文字小文字を区別する
- 'slack'（小文字）は 'Slack'（大文字始まり）にマッチしない

**入力**: `{ purpose: "slack通知を送る", category: null }`

**結果**: PASS（tool = null）

---

### TC-18: 部分一致（'SlackBot'）

**シナリオ**: purpose に 'SlackBot' が含まれる

**検証内容**:

- `String.includes("Slack")` は 'SlackBot' の中の 'Slack' に一致する
- 部分一致でツール推論が正しく動作する

**入力**: `{ purpose: "SlackBotを作成する", category: null }`

**結果**: PASS（tool = "slack"）

---

### TC-19: purpose が null（エラーなし）

**シナリオ**: purpose に null が渡される（型違反の実ユーザー操作を想定）

**検証内容**:

- `normalizePurpose(null)` が空文字を返す
- エラー（TypeError 等）を throw しない
- 全フィールドが null で返る

**入力**: `{ purpose: null as unknown as string, category: null }`

**結果**: PASS（tool = null、エラーなし）

---

### TC-20: 先勝ちルール（タイミング複数一致）

**シナリオ**: purpose に '毎日' と 'リアルタイム' 両方が含まれる

**検証内容**:

- `SCHEDULED_PATTERN` が先に評価される
- '毎日' が一致した時点で 'scheduled' が採用される
- 後続の `REALTIME_PATTERN` は評価されない

**入力**: `{ purpose: "毎日リアルタイムで処理する", category: null }`

**結果**: PASS（timing = "scheduled"）

---

## エッジケーステスト総合評価

全エッジケース PASS。

| 観点                       | 確認内容                           | 結果 |
| -------------------------- | ---------------------------------- | ---- |
| 先勝ちルール（ツール）     | 複数キーワード時は先頭優先         | PASS |
| 大文字小文字区別           | 大文字始まりのみ一致               | PASS |
| 部分一致                   | キーワードが語の一部であっても一致 | PASS |
| null 入力耐性              | エラーを throw せず null を返す    | PASS |
| 先勝ちルール（タイミング） | scheduled が realtime より優先     | PASS |
