# Phase 12 成果物: スキルフィードバックレポート

## テンプレート改善

- Phase テンプレートに「current fact」と「plan」を分ける注記が必要
- NON_VISUAL タスクはスクリーンショット参照の要否を最初に明示した方がよい
- `spec_created` / `completed` の切り替え条件を docs-only と code-change で分けると混乱が減る

## ワークフロー改善

- `artifacts.json` と `outputs/` の同期確認を、Phase 12 の root evidence に組み込むと漏れが減る
- `ConfigureStep` 削除のような successor task は、最初から W2 と明示した方がよい
- semantic default と UI ラベルの正規化は、設計段階で 1 枚の表にまとめると読みやすい

## ドキュメント改善

- Q1 の canonical label は `自分のみ` と明記した方がよい
- `buildInitialAnswers()` の責務を「初期値変換 + 正規化」に分けて書くと誤解が少ない
- 2ページ構成と進捗表示の関係を、図か表で1回だけ示すと重複を防げる
