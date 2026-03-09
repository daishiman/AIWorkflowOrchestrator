# Phase 12 Step 1-A 必須更新の機械検証スクリプト

## メタ情報

```yaml
id: UT-IMP-PHASE12-STEP1A-VERIFICATION-SCRIPT-001
issue_number: 1112
status: 未着手
created: 2026-03-09
updated: 2026-03-09
```

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-STEP1A-VERIFICATION-SCRIPT-001  |
| タスク名     | Phase 12 Step 1-A 必須更新の機械検証スクリプト |
| 分類         | 改善                                           |
| 対象機能     | タスク仕様書品質保証                           |
| 優先度       | 高                                             |
| 見積もり規模 | 小規模                                         |
| 発見元       | TASK-10A-G Phase 12                            |
| 発見日       | 2026-03-09                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 Step 1-A には以下の5つの必須更新がある：

1. `aiworkflow-requirements/LOGS.md` 更新
2. `task-specification-creator/LOGS.md` 更新
3. `aiworkflow-requirements/SKILL.md` 変更履歴更新
4. `task-specification-creator/SKILL.md` 変更履歴更新
5. `indexes/topic-map.md` 再生成

これらは P1（LOGS.md 2ファイル更新漏れ）、P2（topic-map 再生成忘れ）、P25（P1再発）、P29（SKILL.md 変更履歴更新漏れ）として繰り返し問題になっており、TASK-10A-G でも再監査時に topic-map 再生成漏れが検出された。

### 1.2 現在の問題

1. Step 1-A の5項目はチェックリストとして文書化されているが、機械検証の仕組みがない
2. `verify-all-specs` や `validate-phase-output` は Phase の仕様書構造を検証するが、Step 1-A の「更新有無」は検証しない
3. サブエージェントが Step 1-A を「完了」と報告しても、実際にはファイル変更がないケースがある（P43, P51）
4. `git diff --stat -- .claude/skills/` で手動確認しているが、これも属人的

### 1.3 放置した場合の影響

1. P1/P2/P25/P29 の再発が止まらず、毎回の Phase 12 で手動再監査が必要
2. サブエージェントの完了報告を信頼できず、メインエージェントの検証負荷が増大
3. system spec と実装の乖離が蓄積する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 Step 1-A の5つの必須更新項目を機械的に検証するスクリプトを作成し、人手による確認漏れを防止する。

### 2.2 完了イメージ

```bash
node scripts/validate-phase12-step1a.js --workflow <dir> --task-id TASK-10A-G
```

実行結果（JSON出力例）：

```json
{
  "taskId": "TASK-10A-G",
  "timestamp": "2026-03-09T12:00:00Z",
  "results": [
    {
      "item": "aiworkflow-requirements/LOGS.md",
      "status": "PASS",
      "detail": "変更検出済み"
    },
    {
      "item": "task-specification-creator/LOGS.md",
      "status": "PASS",
      "detail": "変更検出済み"
    },
    {
      "item": "aiworkflow-requirements/SKILL.md",
      "status": "PASS",
      "detail": "TASK-10A-G を変更履歴に検出"
    },
    {
      "item": "task-specification-creator/SKILL.md",
      "status": "FAIL",
      "detail": "TASK-10A-G が変更履歴に見つからない"
    },
    {
      "item": "indexes/topic-map.md",
      "status": "PASS",
      "detail": "最終更新日が 2026-03-09"
    }
  ],
  "summary": { "total": 5, "pass": 4, "fail": 1 }
}
```

### 2.3 スコープ（含む / 含まない）

**含む:**

- `validate-phase12-step1a.js` スクリプト本体の作成
- 5項目（LOGS.md x2、SKILL.md x2、topic-map.md）の検証ロジック
- JSON 形式の出力
- CLI オプション（`--workflow`, `--task-id`）のパース

**含まない:**

- 既存の `verify-all-specs` / `validate-phase-output` への統合（将来タスク）
- CI パイプラインへの組み込み（将来タスク）
- Step 1-B 以降の検証（本タスクは Step 1-A のみ）

### 2.4 成果物

| 成果物         | パス                                                                           |
| -------------- | ------------------------------------------------------------------------------ |
| 検証スクリプト | `.claude/skills/task-specification-creator/scripts/validate-phase12-step1a.js` |

---

## 3. どのように実行するか（How）

### 3.1 技術方針

1. `scripts/validate-phase12-step1a.js` を作成
2. 入力: `--workflow <dir>` と `--task-id <id>`
3. 検証項目:
   - `git diff --name-only HEAD -- .claude/skills/aiworkflow-requirements/LOGS.md` が変更されているか
   - `git diff --name-only HEAD -- .claude/skills/task-specification-creator/LOGS.md` が変更されているか
   - 両 `SKILL.md` の変更履歴テーブルに `task-id` が含まれているか
   - `indexes/topic-map.md` の最終更新日が今日以降か、または `generate-index.js` 実行後か
4. 出力: JSON 形式で各項目の PASS/FAIL と詳細メッセージ

### 3.2 実装課題と解決策（親タスクからの教訓）

| 課題                           | 発見経緯                                                                            | 解決策                                      | 教訓                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
| topic-map 再生成漏れ           | Phase 12 再監査で `git diff --stat -- .claude/skills/` に indexes/ の変更がなかった | `node scripts/generate-index.js` を手動実行 | 再生成の要否判定と実行を自動化すべき                     |
| LOGS.md 片方更新漏れ           | P1/P25 として既知だが TASK-10A-G でも発生しかけた                                   | 2ファイル同時更新を手順化                   | 2ファイルの更新を1コマンドで検証できるようにする         |
| SKILL.md 変更履歴漏れ          | LOGS.md を更新しても SKILL.md の変更履歴テーブルを忘れる                            | P29 で手順化済みだが機械検証がない          | diff ベースで変更有無を判定するスクリプトが必要          |
| サブエージェントの早期完了報告 | P43/P51 でサブエージェントが完了報告したが実際は未完了                              | `git diff --stat` で事後確認                | 事前に検証ゲートを設けてサブエージェント完了前にチェック |

---

## 4. 実行手順

1. `.claude/skills/task-specification-creator/scripts/validate-phase12-step1a.js` を作成
2. CLI 引数パーサーを実装（`--workflow`, `--task-id`）
3. 5つの検証関数を実装:
   - `checkLogsUpdated(skillDir, logsPath)` - git diff で LOGS.md の変更を検出
   - `checkSkillMdHistory(skillMdPath, taskId)` - SKILL.md のテキスト内に taskId が含まれるか検証
   - `checkTopicMapRegenerated(topicMapPath)` - topic-map.md の最終更新日を検証
4. JSON 出力フォーマッターを実装
5. 動作テスト: Step 1-A 未実行状態と実行済み状態の両方で検証

---

## 5. 完了条件チェックリスト

- [ ] `validate-phase12-step1a.js` が5項目を検証できる
- [ ] JSON 出力で PASS/FAIL が判定される
- [ ] 既存の `verify-all-specs` / `validate-phase-output` と組み合わせて Phase 12 品質を網羅的に検証可能
- [ ] `.claude/skills/task-specification-creator/scripts/` に配置されている
- [ ] LOGS.md 未更新状態で FAIL を正しく検出する
- [ ] SKILL.md に task-id が未記載の状態で FAIL を正しく検出する
- [ ] topic-map.md 未再生成状態で FAIL を正しく検出する

---

## 6. 検証方法

| 対象                   | コマンド                                                                        | 合格条件                     |
| ---------------------- | ------------------------------------------------------------------------------- | ---------------------------- |
| スクリプト実行         | `node scripts/validate-phase12-step1a.js --workflow <dir> --task-id TASK-10A-G` | JSON 出力で5項目の PASS/FAIL |
| LOGS.md 未更新検出     | Step 1-A 未実行状態で実行                                                       | 2ファイルとも FAIL を検出    |
| topic-map 未再生成検出 | generate-index.js 未実行状態で実行                                              | FAIL を検出                  |

---

## 7. リスクと対策

| リスク                                                  | 影響度 | 対策                                                                   |
| ------------------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| git diff の基準コミットが不明確（HEAD vs main）         | 中     | `--base` オプションで基準コミットを指定可能にする。デフォルトは HEAD~1 |
| topic-map.md の最終更新日判定が不正確                   | 低     | `git diff` とファイルの mtime の両方を確認する                         |
| SKILL.md の変更履歴フォーマットが変わった場合に検出漏れ | 低     | タスクIDの文字列検索（grep相当）で判定し、フォーマット依存を最小化する |

---

## 8. 参照情報

- `.claude/rules/05-task-execution.md` - Phase 12 Step 1-A チェックリスト正本
- `.claude/rules/06-known-pitfalls.md` - P1, P2, P25, P29, P43, P51
- `.claude/skills/task-specification-creator/scripts/verify-all-specs.js` - 既存検証スクリプト
- `.claude/skills/task-specification-creator/scripts/validate-phase-output.js` - 既存検証スクリプト
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` - 教訓集

---

## 9. 備考

- 本タスクは TASK-10A-G の Phase 12 実行中に検出された改善項目である
- 将来的には `verify-all-specs` に統合し、Phase 12 完了前のゲートチェックとして自動実行することを推奨する
- CI パイプラインへの組み込みは別タスクとして検討する
