# 未タスク指示書フォーマット正規化（67件） - タスク指示書

## メタ情報

```yaml
issue_number: 871
```

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | UT-IMP-UNASSIGNED-FORMAT-NORMALIZATION-001          |
| タスク名     | 未タスク指示書フォーマット正規化（9セクション準拠） |
| 分類         | 改善                                                |
| 対象機能     | unassigned-task 運用                                |
| 優先度       | 中                                                  |
| 見積もり規模 | 中規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | Phase 12 監査（2026-02-22）                         |
| 発見日       | 2026-02-22                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`docs/30-workflows/unassigned-task/` を監査した結果、9セクションテンプレート未準拠の指示書が67件残っていた。

### 1.2 問題点・課題

- 実装者が必要情報を再調査する手戻りが発生する
- タスク粒度・完了条件の記述品質にばらつきがある
- 機械検証を前提にした運用ができない

### 1.3 放置した場合の影響

- Phase 12 で同じ監査修正が繰り返し発生する
- 未タスク指示書の追跡性が低下する
- 実装速度と再現性が下がる

---

## 2. 何を達成するか（What）

### 2.1 目的

legacy未タスク指示書を `unassigned-task-template.md` 準拠へ統一し、監査を自動化可能にする。

### 2.2 最終ゴール

1. フォーマット未準拠67件を0件にする
2. 命名規則違反（`*`/大文字含む）5件を是正する
3. `audit-unassigned-tasks.js` の結果を CI/運用チェックに組み込む

### 2.3 スコープ

#### 含むもの

- `docs/30-workflows/unassigned-task/*.md` のフォーマット修正
- ファイル名の命名規則修正
- `task-workflow.md` 内リンクの追従修正

#### 含まないもの

- タスク内容そのものの技術的仕様変更
- 完了済みタスクへの移管作業

### 2.4 成果物

- 修正済み未タスク指示書
- フォーマット監査レポート（再実行）
- リンク整合確認ログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` スキルのテンプレート/ガイドが参照可能
- `audit-unassigned-tasks.js` を利用できる

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- Phase 12 の未タスク運用ルール
- Markdownテンプレート編集
- リンク整合チェック

### 3.4 推奨アプローチ

- 影響大のファイル（missing多い順）から修正
- 10件ずつバッチで修正→監査→リンク検証

---

## 4. 実行手順

### Phase構成

- Phase A: 対象抽出と優先順位付け
- Phase B: フォーマット修正（10件単位）
- Phase C: 命名規則修正とリンク追従
- Phase D: 最終監査

### Phase A: 対象抽出

#### 目的

修正対象の確定と優先順位付けを行う。

#### 手順

1. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` を実行
2. `missingHeadings` 件数で降順に並べる
3. バッチ単位（10件）へ分割する

#### 成果物

- 修正対象リスト

#### 完了条件

- 67件の対象と優先順位が確定している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] フォーマット未準拠が0件
- [ ] 命名規則違反が0件

### 品質要件

- [ ] `audit-unassigned-tasks.js` が exit code 0
- [ ] `verify-unassigned-links.js` が `ALL_LINKS_EXIST`

### ドキュメント要件

- [ ] 変更対象ファイル一覧を記録
- [ ] 運用ルール更新を `task-specification-creator` に反映

---

## 6. 検証方法

### テストケース

- Case 1: フォーマット監査が0違反
- Case 2: 命名監査が0違反
- Case 3: リンク監査が0欠損

### 検証手順

1. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`
2. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
3. `git diff --name-only docs/30-workflows/unassigned-task`

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                           |
| -------------------------------- | ------ | -------- | ---------------------------------------------- |
| 大量ファイル修正でリンク切れ発生 | 中     | 中       | バッチごとに `verify-unassigned-links.js` 実行 |
| テンプレート解釈差で表記ゆれ     | 中     | 中       | `unassigned-task-template.md` の文言を固定参照 |
| 作業ボリューム過大               | 中     | 中       | 10件単位で分割し段階完了する                   |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/outputs/phase-12/unassigned-task-placement-audit.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

なし

### 補足事項

本タスクは未タスク運用の品質改善を目的とした横断タスクであり、機能実装タスクとは独立して段階実行する。
