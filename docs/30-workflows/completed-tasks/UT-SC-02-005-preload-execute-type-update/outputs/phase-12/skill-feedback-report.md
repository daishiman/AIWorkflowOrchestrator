# UT-SC-02-005: スキルフィードバックレポート

## 基本情報

- タスクID: UT-SC-02-005
- 報告日: 2026-03-26
- 対象スキル: `aiworkflow-requirements`, `task-specification-creator`, `skill-creator`

## ワークフロー改善点

1. workflow 雛形が `phase-3/6/7/8/9/10/11` の必須成果物名を自動生成しきれておらず、実装済みでも `outputs/` のファイル名が仕様書とズレやすい。初期 scaffold で `gate-decision.md` や `quality-report.md` まで生成した方がよい。
2. Phase 11 が「視覚 UI 変更なし」のタスクでも必須3成果物を要求するため、非視覚タスク向けの `PASS（代替確認）` テンプレートを標準化した方が再作業を減らせる。

## 技術的教訓

1. IPC ハンドラの戻り値型を更新したら、Main だけでなく Preload / Renderer / test fixture の4点を同時に検索する必要がある。
2. `terminal_handoff` のような union variant は、mock shape を簡略化しすぎると本番 shape とのドリフトが再発する。

## スキル改善提案

1. `aiworkflow-requirements` 側に「IPC 3層 + テスト fixture shape まで確認する」チェックポイントを短いチェックリストとして追加するとよい。
2. `task-specification-creator` 側に「Phase 12 では outputs の存在確認だけでなく、古いテスト件数や out-of-scope 注記の残骸も監査する」項目を追加するとよい。
3. `skill-creator` 側に「same-wave sync のあと、stale fact / legacy wording / 日付ドリフトを除去してから changelog を閉じる」ルールをテンプレートで明文化するとよい。

## 新規 Pitfall 候補

- 候補名: Preload execute 型だけ直して Renderer ローカル型と fixture shape を置き去りにするドリフト
- 症状: typecheck は通っても `terminal_handoff` mock が実 shape とズレ、回帰時に検知が遅れる
- 再発防止: shared union 型参照 + 実 bundle shape での fixture 固定

## 品質確認

| チェック              | 結果       |
| --------------------- | ---------- |
| typecheck             | PASS       |
| lint                  | PASS       |
| テスト                | 54/54 PASS |
| skill template update | PASS       |
