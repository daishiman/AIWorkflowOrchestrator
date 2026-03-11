# Phase 7 カバレッジ測定結果

## 実行

- コマンド: `pnpm exec vitest run --coverage <変更範囲>`

## 結果

- 変更ファイル単位ではカバレッジ取得済み
- ただしプロジェクト global threshold（80%など）により exit code 1
- 判定: 変更範囲の品質判断は可能、全体閾値判定は既存baseline影響あり
