# SKILL.md / LOGS.md Conflict Marker 検出 Lint - タスク指示書

## メタ情報

```yaml
issue_number: 1092
```

## メタ情報

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | UT-IMP-SKILL-CONFLICT-MARKER-LINT-001                                          |
| タスク名     | SKILL.md / LOGS.md の Git Conflict Marker 検出 Lint                            |
| 分類         | 改善                                                                           |
| 対象機能     | aiworkflow-requirements / task-specification-creator 品質ガード                |
| 優先度       | 低                                                                             |
| 見積もり規模 | 小規模                                                                         |
| ステータス   | 未実施                                                                         |
| 発見元       | TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 Phase 12（スキルフィードバック） |
| 発見日       | 2026-03-08                                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Graceful Degradation タスクの Phase 12 Step 1-A で SKILL.md の変更履歴を更新しようとした際、既存の conflict marker が残っており、Edit ツールの文字列マッチが失敗した。conflict marker はマージ解決時の残置物であり、通常の文書閲覧では見逃しやすい。

### 1.2 問題点・課題

- `SKILL.md` と `LOGS.md` は Phase 12 の Step 1-A で必ず更新される重要ファイル
- conflict marker が残っていると、Edit ツールの `old_string` マッチが予期しない行を含み失敗する
- 現在のバリデータ（`verify-all-specs`, `validate-phase-output`）は conflict marker を検出しない

### 1.3 放置した場合の影響

- Phase 12 Step 1-A の更新が失敗し、P1/P25（LOGS.md 更新漏れ）の原因になる
- conflict marker を含む文書がそのまま PR にマージされ、仕様書の信頼性が低下

---

## 2. 何を達成するか（What）

### 2.1 目的

`.claude/skills/` 配下の `SKILL.md` と `LOGS.md` に Git conflict marker が含まれていないことを検証する lint スクリプトを作成する。

### 2.2 最終ゴール

```bash
node .claude/skills/aiworkflow-requirements/scripts/check-conflict-markers.js
# → PASS（conflict marker なし）または FAIL（検出箇所を報告）
```

### 2.3 スコープ

#### 含むもの

- `check-conflict-markers.js` スクリプトの新規作成
- `.claude/skills/*/SKILL.md` と `.claude/skills/*/LOGS.md` の conflict marker 検出
- `<<<<<<<`, `=======`, `>>>>>>>` パターンの検出

#### 含まないもの

- references/ 配下の全ファイルスキャン（対象は SKILL.md と LOGS.md のみ）
- conflict marker の自動解決
- pre-commit hook への組み込み（別タスク）

### 2.4 成果物

| 成果物          | パス                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| lint スクリプト | `.claude/skills/aiworkflow-requirements/scripts/check-conflict-markers.js` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

なし

### 3.2 依存タスク

なし

### 3.3 必要な知識

- Node.js ファイルシステム操作
- Git conflict marker のパターン

### 3.4 推奨アプローチ

1. `glob` で `.claude/skills/*/SKILL.md` と `.claude/skills/*/LOGS.md` を列挙
2. 各ファイルを行単位で読み、`/^(<{7}|={7}|>{7})/` にマッチする行を検出
3. 検出箇所をファイル名:行番号で報告

---

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                   | 発見経緯                                                               | 解決策                                                             | 教訓                                                               |
| -------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| conflict marker による Edit ツール失敗 | Phase 12 Step 1-A で SKILL.md の変更履歴更新時に発生                   | 事前に conflict marker を除去してから更新                          | Phase 12 開始前に対象ファイルの conflict marker チェックを実行する |
| P11 PostToolUse フック干渉             | Prettier / ESLint のフックがファイルを変更し、後続の Edit マッチが失敗 | conflict marker は Prettier で変更されないため、チェック自体は安定 | lint スクリプトは Prettier 非対象の Markdown ファイルに適用        |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `.claude/skills/*/SKILL.md` と `LOGS.md` の conflict marker を検出できる
- [ ] 検出箇所をファイル名:行番号で報告する
- [ ] conflict marker がない場合は PASS を返す

### 品質要件

- [ ] 現在のリポジトリで実行して PASS すること（conflict marker が解消済みの状態で）

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                 |
| -------------------------------------- | ------ | -------- | ------------------------------------ |
| Markdown テーブル内の `=======` 誤検出 | 低     | 低       | 行頭のみマッチ（`^` アンカー）で回避 |

---

## 8. 参照情報

### 関連ドキュメント

| 資料                  | パス                                                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| P1/P25 落とし穴       | `.claude/rules/06-known-pitfalls.md#P1`                                                                                        |
| P11 落とし穴          | `.claude/rules/06-known-pitfalls.md#P11`                                                                                       |
| skill-feedback-report | `docs/30-workflows/completed-tasks/10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001/outputs/phase-12/skill-feedback-report.md` |
