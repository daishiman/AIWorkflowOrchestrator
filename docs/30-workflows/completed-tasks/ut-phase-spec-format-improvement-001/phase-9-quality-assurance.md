# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 9                                                                 |
| Phase名    | 品質保証                                                          |
| 対象機能   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 仕様書テンプレート改修 |
| 前提Phase  | Phase 8: リファクタリング                                         |
| 次Phase    | Phase 10: 最終レビュー                                            |
| ステータス | pending                                                           |
| 作成日     | 2026-04-06                                                        |
| 更新日     | 2026-04-06                                                        |

## 目的

改修済みテンプレートの品質を静的解析・目視確認・互換性チェックで保証する。docs-only タスクのため、コード静的解析の代わりにテンプレートの品質基準で判定する。

## 実行タスク

### Task 9-1: Handlebars 構文の品質確認

```bash
# テンプレートファイルのタグバランス確認
node -e "
const fs = require('fs');
const files = [
  '.claude/skills/task-specification-creator/assets/phase-spec-template.md',
  '.claude/skills/task-specification-creator/assets/unassigned-task-template.md'
];
files.forEach(path => {
  const template = fs.readFileSync(path, 'utf8');
  const opens = (template.match(/\{\{#/g) || []).length;
  const closes = (template.match(/\{\{\//g) || []).length;
  const status = opens === closes ? 'PASS' : 'FAIL';
  console.log(status + ': ' + path + ' (' + opens + ' open, ' + closes + ' close)');
});
"

# Markdown 構文チェック（markdownlint がある場合）
markdownlint .claude/skills/task-specification-creator/assets/phase-spec-template.md || echo "markdownlint not available, skip"

# 行末スペースの確認
grep -rn " $" .claude/skills/task-specification-creator/assets/phase-spec-template.md && \
  echo "WARN: trailing spaces found" || echo "PASS: no trailing spaces"
```

### Task 9-2: テンプレートの品質基準チェック

| 品質基準                                          | 確認方法                                      | 判定 |
| ------------------------------------------------- | --------------------------------------------- | ---- |
| Handlebars タグのバランス（開閉一致）             | Task 9-1 のスクリプトで確認                   | -    |
| コメントに判断基準が記載されている                | grep で `{{!--` コメントの存在確認            | -    |
| Task/Step 分離ガイドラインが一読で理解できる      | 第三者目線での目視確認                        | -    |
| docs-only evidence ルールが明示的に記載されている | grep で `manual-test-checklist.md` の存在確認 | -    |
| 既存フォーマットとの互換性                        | 既存仕様書との構造比較                        | -    |

### Task 9-3: 「100人中100人が同じ理解で実行できる」基準の確認

以下の質問に対して YES と答えられるか確認する:

1. 「実行タスク」セクションを見た人が、それが plan（計画）であると理解できるか？
2. 「検証ログ」セクションを見た人が、それが current fact の記録先案内であると理解できるか？
3. docs-only タスクで作業する人が、screenshot を撮らなくてよいと理解できるか？
4. UI タスクは別ガイドに従うことが明確に伝わるか？

### Task 9-4: line budget の確認

```bash
# テンプレートの行数確認（500行上限ガイドライン）
wc -l .claude/skills/task-specification-creator/assets/phase-spec-template.md
```

| 行数      | 判定                                           |
| --------- | ---------------------------------------------- |
| 500行未満 | PASS                                           |
| 500行以上 | WARN: 分割を検討（spec-500line-guideline参照） |

## 参照資料

| 資料名                   | パス                                 |
| ------------------------ | ------------------------------------ |
| Phase 7 カバレッジ       | `outputs/phase-7/coverage-report.md` |
| Phase 8 リファクタリング | git diff（リファクタリング後）       |

## 成果物

| 成果物      | パス                                | 説明                               |
| ----------- | ----------------------------------- | ---------------------------------- |
| QA レポート | `outputs/phase-9/quality-report.md` | 品質基準チェック結果・判定サマリー |

## 統合テスト連携

- Phase 10 の最終レビューで本 QA 結果を受入条件確認に流用する。
- Phase 11 で docs-only / NON_VISUAL の evidence ルールが残っていることを確認する。

## 完了条件

- [ ] Handlebars タグのバランスが PASS
- [ ] 全品質基準が PASS（または許容範囲の WARN）
- [ ] 「100人中100人」基準の確認が完了している
- [ ] line budget が 500 行未満（またはWARN理由が記録されている）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
