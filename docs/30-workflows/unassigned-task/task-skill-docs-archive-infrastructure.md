# スキル文書肥大化対策（LOGS.md / patterns.md アーカイブ基盤） - タスク指示書

## メタ情報

```yaml
issue_number: 1111
```

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-SKILL-DOCS-ARCHIVE-INFRASTRUCTURE-001                 |
| タスク名     | スキル文書肥大化対策（LOGS.md / patterns.md アーカイブ基盤） |
| 分類         | 改善                                                         |
| 対象機能     | スキル文書管理基盤                                           |
| 優先度       | 高                                                           |
| 見積もり規模 | 中規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-10A-G Phase 12                                          |
| 発見日       | 2026-03-09                                                   |
| 配置先       | `docs/30-workflows/unassigned-task/`                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-G の Phase 12 実行中に、`.claude/skills/aiworkflow-requirements/LOGS.md` が 8656行（492KB超）に膨張し、Claude Code の Read ツールの 256KB 制限を超えて読み込み不可能になりました。同様に `.claude/skills/skill-creator/references/patterns.md` が 3058行に膨張し、クイックナビゲーションテーブルのテスト・Phase 12・IPC ドメインが3-4回重複していました。

スキル文書は追記のみで運用されており、削除・統合・アーカイブの仕組みが存在しません。タスク完了ごとにファイルサイズが単調増加する構造的問題があります。

### 1.2 現在の問題

- LOGS.md が Claude Code の Read ツール制限（256KB）を超えており、全文参照が不可能
- patterns.md のクイックナビゲーションテーブルで同一ドメインが3-4行重複し、情報検索効率が大幅に低下
- 追記のみで削除・統合・アーカイブの仕組みがなく、ファイルサイズが単調増加する構造問題
- `.claude` と `.agents` の両方に同じファイルが存在し、肥大化が2倍に波及

### 1.3 放置した場合の影響

- スキル実行時に LOGS.md を参照できず、過去の実行履歴を活用した判断ができない
- patterns.md の重複により、パターン検索時に同じ情報を3-4回読む無駄が発生
- 今後のタスク完了ごとにファイルサイズが累積し、Progressive Disclosure の原則に反する
- Read ツール制限超過が他のスキル文書にも波及し、Phase 12 の仕様書更新ワークフロー全体が停滞する

---

## 2. 何を達成するか（What）

### 2.1 目的

LOGS.md と patterns.md の肥大化を解消し、アーカイブ基盤と重複防止ルールを導入して、スキル文書が Read ツール制限内に収まり続ける持続可能な運用構造を確立します。

### 2.2 完了イメージ

- LOGS.md が 500行以内に収まり、Claude Code の Read ツールで全文参照可能
- 古いログが月次アーカイブファイルに完全保存され、必要時に参照可能
- patterns.md のクイックナビゲーションテーブルに重複ドメインが0件
- `scripts/archive-logs.js` により閾値超過時のアーカイブが半自動化されている
- `.claude` と `.agents` で同一構造が維持されている

### 2.3 スコープ

#### 含む

- LOGS.md の古いログを月次アーカイブファイルへ分割・移動
- patterns.md のクイックナビゲーションテーブル重複行の統合
- `scripts/archive-logs.js` スクリプトの作成
- LOGS.md の行数上限ルール（500行）の導入
- patterns.md のテーブル各ドメイン1行制約の導入
- `.claude` と `.agents` 両方への同一構造の適用

#### 含まない

- LOGS.md の記録フォーマット自体の再設計
- patterns.md のパターン内容の改訂・品質改善
- スキル文書全体のディレクトリ構造再編
- CI/CD パイプラインへのアーカイブ自動化組み込み

### 2.4 成果物

| 成果物                    | 説明                                                       |
| ------------------------- | ---------------------------------------------------------- |
| LOGS.md 圧縮版            | 直近分のみ保持した 500行以内の LOGS.md                     |
| アーカイブファイル群      | `references/logs-archive-YYYY-MM.md` 形式の月次アーカイブ  |
| patterns.md 統合版        | クイックナビゲーションテーブルの重複を解消した patterns.md |
| `scripts/archive-logs.js` | 閾値超過時にアーカイブを実行するスクリプト                 |
| 運用ルール追記            | SKILL.md または運用ガイドへの行数上限・重複防止ルール記載  |

---

## 3. どのように実行するか（How）

### 3.1 技術方針

1. **LOGS.md アーカイブ**: 直近N日分のみ本体に保持し、古いログは `references/logs-archive-YYYY-MM.md` へ移動する。本体には「アーカイブ参照先一覧」セクションを設けて、過去ログへのナビゲーションを維持する
2. **patterns.md 重複解消**: クイックナビゲーションテーブルの各ドメインは1行のみ許可し、追記時は既存行にマージするルールを明文化する
3. **アーカイブスクリプト**: `scripts/archive-logs.js` を作成し、LOGS.md が閾値（500行）を超過した場合に古いエントリを月次ファイルへ移動する
4. **二重管理同期**: `.claude` と `.agents` の両方に同一の変更を適用し、構造の一致を保証する

### 3.2 実装課題と解決策（親タスクからの教訓）

| 課題                         | 発見経緯                                                               | 解決策                                                              | 教訓                                                 |
| ---------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------- |
| LOGS.md 読み込み不可         | Phase 12 で LOGS.md に追記しようとしたら 256KB超で Read ツールがエラー | offset/limit パラメータで部分読み込みを試みたが、全体構造把握が困難 | ファイルサイズに上限を設け、アーカイブ機構を導入する |
| patterns.md 重複膨張         | クイックナビゲーションテーブルを確認したら同一ドメインが3-4回出現      | 手動で重複行を統合し1行にマージした                                 | 追記時に既存行への統合を必須ルール化する             |
| `.claude`/`.agents` 二重管理 | 片方を更新しても他方に同期漏れが発生                                   | 両方を同一ターンで更新する運用を徹底                                | アーカイブ構造も両方に同時適用する必要がある         |

---

## 4. 実行手順

1. `.claude/skills/aiworkflow-requirements/LOGS.md` の現在の行数とエントリ構造を `wc -l` と `head`/`tail` で確認する
2. エントリを日付で分類し、月次アーカイブファイル `references/logs-archive-YYYY-MM.md` を作成する
3. LOGS.md 本体を直近分のみに圧縮し、先頭に「アーカイブ参照先一覧」セクションを追加する
4. `.claude/skills/skill-creator/references/patterns.md` のクイックナビゲーションテーブルから重複行を検出・統合する
5. `scripts/archive-logs.js` スクリプトを作成する（入力: 対象 LOGS.md パス、閾値行数、出力先ディレクトリ）
6. `.agents` 側にも同一の変更を適用し、`diff` で差分0を確認する
7. SKILL.md または運用ガイドに行数上限（500行）と重複防止ルールを追記する
8. 圧縮後の LOGS.md が Read ツールで正常に全文読み込み可能であることを確認する

---

## 5. 完了条件チェックリスト

- [ ] LOGS.md が 500行以内
- [ ] patterns.md のクイックナビゲーションテーブルに重複ドメインが0件
- [ ] アーカイブファイル（`references/logs-archive-*.md`）に過去ログが完全保存されている
- [ ] `.claude` と `.agents` で同一構造が維持されている（diff 差分0）
- [ ] `scripts/archive-logs.js` スクリプトが動作し、閾値超過時にアーカイブを実行できる
- [ ] LOGS.md の先頭にアーカイブ参照先一覧が記載されている
- [ ] 行数上限・重複防止ルールが SKILL.md または運用ガイドに明文化されている
- [ ] Read ツールで LOGS.md が全文読み込み可能

---

## 6. 検証方法

| 検証対象                 | コマンド                                                                                                        | 合格条件   |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------- |
| LOGS.md 行数             | `wc -l .claude/skills/aiworkflow-requirements/LOGS.md`                                                          | 500行以内  |
| patterns.md 重複         | `awk '/^\|/' .claude/skills/skill-creator/references/patterns.md \| awk -F'\|' '{print $2}' \| sort \| uniq -d` | 重複0件    |
| アーカイブ実在           | `test -f .claude/skills/aiworkflow-requirements/references/logs-archive-*.md && echo OK`                        | OK         |
| `.claude`/`.agents` 同期 | `diff .claude/skills/aiworkflow-requirements/LOGS.md .agents/skills/aiworkflow-requirements/LOGS.md`            | 差分0      |
| patterns.md 同期         | `diff .claude/skills/skill-creator/references/patterns.md .agents/skills/skill-creator/references/patterns.md`  | 差分0      |
| スクリプト動作           | `node scripts/archive-logs.js --dry-run --input .claude/skills/aiworkflow-requirements/LOGS.md --threshold 500` | 正常終了   |
| Read ツール読み込み      | Claude Code の Read ツールで LOGS.md 全文取得                                                                   | エラーなし |

---

## 7. リスクと対策

| リスク                       | 内容                                           | 対策                                                                           |
| ---------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| アーカイブ時のログ欠損       | 分割・移動時にエントリが欠落する               | アーカイブ前後で `wc -l` の合計が一致することを検証する                        |
| アーカイブ参照の断絶         | 過去ログへのナビゲーションが失われる           | LOGS.md 先頭に「アーカイブ参照先一覧」を設け、月次ファイルへのリンクを維持する |
| `.claude`/`.agents` 同期漏れ | 片方のみ更新して差分が発生する                 | 全変更を同一ターンで両方に適用し、完了時に `diff` で検証する                   |
| 閾値設定の不適切さ           | 500行が厳しすぎる、または緩すぎる              | 運用開始後に実績を観察し、必要に応じて閾値を調整する                           |
| スクリプトのエントリ境界誤認 | LOGS.md のエントリ区切りを正しくパースできない | エントリのヘッダパターン（日付・タスクID）を正規表現で明確に定義する           |

---

## 8. 参照情報

| 種別                     | パス                                                                   | 用途                       |
| ------------------------ | ---------------------------------------------------------------------- | -------------------------- |
| 肥大化元ファイル         | `.claude/skills/aiworkflow-requirements/LOGS.md`                       | アーカイブ対象の LOGS.md   |
| 重複元ファイル           | `.claude/skills/skill-creator/references/patterns.md`                  | 重複解消対象の patterns.md |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 過去の教訓・パターン集     |
| タスク台帳               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`   | タスク管理台帳             |
| 発見元タスク             | `docs/30-workflows/completed-tasks/task-045-lifecycle-test-hardening/` | TASK-10A-G Phase 12 の記録 |
| `.agents` 側 LOGS.md     | `.agents/skills/aiworkflow-requirements/LOGS.md`                       | 同期対象                   |
| `.agents` 側 patterns.md | `.agents/skills/skill-creator/references/patterns.md`                  | 同期対象                   |

---

## 9. 備考

- 本タスクは TASK-10A-G Phase 12 実行中に発見された構造的問題への対策であり、機能開発ではなく運用基盤の改善に該当する。
- アーカイブスクリプトは Phase 12 の LOGS.md 更新フローに組み込むことを想定しているが、CI/CD への統合は本タスクのスコープ外とする。
- 着手後は `.claude` と `.agents` の両方を同一ターンで更新し、差分0を維持する。
