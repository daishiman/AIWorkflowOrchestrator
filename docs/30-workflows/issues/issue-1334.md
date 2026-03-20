# [#1334] [UT-TASK06-007-EXT-005] R-02 セマンティクスチェック精度向上

## 概要

R-02ルール（引数形式不一致検出）のセマンティクス精度を向上させる。現在はargPattern（object/primitive/none/unknown）の4分類だが、具体的な引数名・型情報を比較してP45パターンをより正確に検出する。

## 受け入れ基準

- [ ] 引数名のセマンティクス乖離（例: skillId vs skillName）が検出される
- [ ] false positiveが増加しない
- [ ] 既存テストが回帰しない

## メタ情報

- 発見元: UT-TASK06-007 Phase 9 品質レポート
- 優先度: 低
- 指示書: `docs/30-workflows/completed-tasks/UT-TASK06-007-ipc-contract-drift-auto-detect/unassigned-task/ut-task06-007-ext-005-r02-semantic-precision.md`
