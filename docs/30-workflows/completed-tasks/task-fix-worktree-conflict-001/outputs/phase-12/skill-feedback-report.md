# スキルフィードバックレポート - TASK-FIX-WORKTREE-CONFLICT-001

## task-specification-creator へのフィードバック

### 良かった点

- Phase 1 の Step 0 現状確認により、前提条件（既実施の `.gitattributes` 設定）を確認してから着手できた
- FIX-001-A〜D 並列・FIX-001-E/F 直列の依存関係が明確で実行順序が迷わなかった

### 改善提案

- シェルスクリプトのテスト（TC-C-04）では、`command -v` チェックの必要性が設計段階で明示されていると実装漏れを防げる

## aiworkflow-requirements へのフィードバック

- `.gitattributes` の `merge=ours` vs `merge=union` の判断基準（追記型か構造化データか）が
  今後の parallel branch 戦略の canonical パターンとして lessons-learned に追記済み
- canonical の `.claude/` と mirror の `.agents/` を同波で同期しないと stale が残るため、`diff -qr` を Phase 12 の標準ゲートにするとよい
- `post-merge` フックが `--quiet` を渡すなら、`generate-index.js` 側も同じ契約を受けてログ量を制御できるようにしておくと運用が安定する
- `keywords.json` の生成時刻は mirror parity を壊す volatile 情報なので、出力から外して deterministic に保つ方がよい

## 学習事項

1. **merge 戦略の分類**: 追記型テキスト → `union`、JSON 構造 → `ours` + post-merge 再生成
2. **シェルスクリプトの堅牢性**: `command -v` で外部コマンドの存在確認を条件にすること（`set -euo pipefail` 環境では特に重要）
3. **husky との共存**: `git rev-parse --git-path hooks/post-merge` は husky 設定時は `.husky/_/post-merge` を返すため、スクリプト内でパスを決め打ちしないことが重要
4. **mirror 同期の明文化**: Phase 12 の文書には canonical と mirror の双方の対象ファイルを明記し、更新漏れを防ぐことが重要
5. **quiet 契約の整合**: hook と生成スクリプトの引数契約は一致させ、ログ抑制はオプションではなく一貫した運用ルールとして扱うことが重要
6. **生成物の決定性**: 自動生成 JSON に時刻のような変動要素を埋め込むと mirror 同期が崩れるため、必要性がなければ出力から外す方がよい
