# legacy 未タスク仕様書正規化ガード - タスク指示書

## メタ情報

```yaml
issue_number: 1009
```

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | UT-IMP-UNASSIGNED-TASK-LEGACY-NORMALIZATION-001         |
| タスク名     | legacy 未タスク仕様書正規化ガード                       |
| 分類         | 改善                                                    |
| 対象機能     | `docs/30-workflows/unassigned-task/` と未タスク監査運用 |
| 優先度       | 中                                                      |
| 見積もり規模 | 中規模                                                  |
| ステータス   | 未実施                                                  |
| 発見元       | TASK-043B Phase 12 再確認                               |
| 発見日       | 2026-03-06                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-043B の Phase 12 再確認で `audit-unassigned-tasks.js --json` を実行したところ、今回差分起因の `currentViolations=0` は維持できている一方で、repository 全体には `baselineViolations=93` が残っていた。内訳は `format=66`、`naming=5`、`misplaced=22` で、未タスク仕様書の legacy 負債が継続している。

### 1.2 問題点・課題

- 新規タスクだけを正しく配置しても、legacy 仕様書の未整備が大きく残る
- `current=0` だけを見ると、置き場全体が健全だと誤認しやすい
- `completed-tasks/unassigned-task` に legacy が混在しており、正規配置ルールの理解が難しい
- フォーマット不一致の既存ファイルが多く、未タスクを再利用しづらい

### 1.3 放置した場合の影響

- 未タスク監査の結果が読みづらくなり、feature 起因の差分と legacy 負債を混同しやすい
- 再監査時に「何を直せば current を保てるか」が見えにくくなる
- 未タスク仕様書を再利用する際に、テンプレート準拠前提の自動検証が機能しづらい

---

## 2. 何を達成するか（What）

### 2.1 目的

legacy な未タスク仕様書を、現在のタスク仕様書フォーマットと配置ルールに段階的に揃え、未タスク監査の判定を読みやすくする。

### 2.2 最終ゴール

- `docs/30-workflows/unassigned-task/` 配下の対象ファイルが現行テンプレートへ近い構造を持つ
- 配置先ルールが「未実施 / 完了済みUT / legacy」の3分類で一貫する
- `audit-unassigned-tasks.js` の baseline を改善対象として追跡できる

### 2.3 スコープ

#### 含むもの

- legacy 未タスク仕様書の棚卸し
- フォーマット違反、命名違反、misplaced の分類
- 優先順位を付けた段階正規化計画
- 高優先度ファイルの実ファイル修正または移管方針の確定
- `task-workflow.md` など台帳側の参照同期

#### 含まないもの

- TASK-043B 本体機能の追加改修
- feature 実装コードの変更
- 全 legacy ファイルの一括修正を 1 回で完了させること

### 2.4 成果物

- 正規化対象一覧
- 配置ルール整理メモ
- 修正済み未タスク仕様書群、または移管計画
- 監査結果レポート（`audit-unassigned-tasks` / `verify-unassigned-links`）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の未タスクテンプレートと監査スクリプトを利用できること
- `docs/30-workflows/unassigned-task/` と `docs/30-workflows/completed-tasks/unassigned-task/` の両方を監査できること

### 3.2 依存タスク

- なし。独立して着手可能

### 3.3 必要な知識

- 未タスク仕様書テンプレート
- `audit-unassigned-tasks.js` の `current` / `baseline` の意味
- `verify-unassigned-links.js` の link 整合確認
- task-workflow / lessons-learned / system spec の同期運用

### 3.4 推奨アプローチ

1. まず監査結果を「format / naming / misplaced」に分ける
2. 次に配置先を「未実施 / 完了済みUT / legacy」で分類する
3. 影響の大きいファイルから段階修正し、修正ごとに `target-file` と全体監査を回す
4. 最後に台帳側の参照と教訓を同期する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 項目             | 内容                                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| 課題             | `currentViolations=0` を見て「未タスク置き場全体も問題ない」と誤解しやすい                            |
| 発見経緯         | TASK-043B の Phase 12 再確認で、新規差分は健全でも `baselineViolations=93` が残っていることを確認した |
| 解決策           | feature 起因の有無と repository 既存負債を分離し、後者は独立未タスクとして管理する                    |
| 今後の標準ルール | `current=0` は差分合格、`baseline>0` は別タスクで削減する改善 backlog として扱う                      |

---

## 4. 実行手順

### Phase構成

3フェーズで進める。棚卸し、正規化、台帳同期の順に分離する。

### Phase 1: 棚卸しと分類

#### 目的

legacy 未タスク仕様書の全体像を可視化し、どこから直すべきかを決める。

#### 手順

1. `audit-unassigned-tasks.js --json` を実行し、違反一覧を取得する
2. format / naming / misplaced の3分類へ整理する
3. 配置先を「未実施 / 完了済みUT / legacy」に分類する

#### 成果物

- 棚卸し一覧
- 優先順位付きの対象リスト

#### 完了条件

- 違反の種類と件数が見える
- 高優先度の修正対象が決まっている

### Phase 2: 正規化と移管

#### 目的

対象ファイルを現行ルールへ近づける。

#### 手順

1. 高優先度の format violation をテンプレート準拠へ修正する
2. naming violation を命名規則へ合わせる
3. misplaced file を正規配置へ移すか、legacy として明示管理する

#### 成果物

- 修正済み未タスク仕様書
- 移管済みファイル
- legacy 扱い一覧

#### 完了条件

- 触ったファイルが `audit --target-file` で PASS する
- 参照パスが実ファイルへ一致する

### Phase 3: 台帳同期と監査

#### 目的

system spec と監査証跡を最新状態へ揃える。

#### 手順

1. `task-workflow.md` に新規/更新した未タスクを同期する
2. 必要に応じて `lessons-learned.md` と LOGS を更新する
3. `verify-unassigned-links.js` と `audit-unassigned-tasks.js --diff-from HEAD` を再実行する

#### 成果物

- 同期済み system spec
- 監査ログ

#### 完了条件

- 新規差分が `currentViolations=0` を維持している
- 参照リンク切れが 0 件

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] legacy 未タスク仕様書の違反種別が分類されている
- [ ] 優先度付きの正規化対象が定義されている
- [ ] 高優先度対象の修正または移管方針が決まっている

### 品質要件

- [ ] 変更した未タスク仕様書が `audit --target-file` で PASS する
- [ ] `audit --diff-from HEAD` で `currentViolations=0` を維持する
- [ ] `verify-unassigned-links` が PASS する

### ドキュメント要件

- [ ] `task-workflow.md` に関連未タスクが同期されている
- [ ] 必要なら `lessons-learned.md` に教訓が追加されている
- [ ] legacy / current の判定軸が文書化されている

---

## 6. 検証方法

### テストケース

- format violation として挙がったファイルを修正後に `audit --target-file` で確認する
- naming / misplaced 対象を移管後に再監査する
- `verify-unassigned-links` で参照切れが増えていないことを確認する

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-unassigned-task-legacy-normalization-001.md
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                                |
| --------------------------------------- | ------ | -------- | --------------------------------------------------- |
| legacy ファイル数が多く一度に片付かない | 中     | 高       | 優先順位を付けて段階的に進める                      |
| 参照パス更新漏れで link 切れが増える    | 高     | 中       | 修正ごとに `verify-unassigned-links` を実行する     |
| completed / unassigned の配置判断を誤る | 中     | 中       | 3分類ルールを先に固定し、移動前に台帳参照を確認する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/task-043b-ui-ux-import-list-design/outputs/phase-12/unassigned-task-detection.md`

### 参考資料

- `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json`
- `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
未タスクをタスク仕様書のフォーマットどおりに指定のディレクトリ（docs/30-workflows/unassigned-task/）に配置できているか確認して。
```

### 補足事項

- 本タスクは TASK-043B の機能差分そのものではなく、Phase 12 再確認で見つかった運用改善課題を分離したもの
- 追加後も `audit --diff-from HEAD` の合否基準は `currentViolations=0` のまま維持する
