# スキルフィードバックレポート

## タスク情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| タスクID | UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 |
| 完了日   | 2026-03-22                                |

## ワークフロー改善点

### 1. エスケープテストのアサーションパターン

shell injection 対策のテストで `not.toContain` を使うと、エスケープ後の文字列に元の文字列が部分文字列として含まれるため偽陽性が発生する。lookbehind regex パターンを標準化すべき。

### 2. worktree 環境での esbuild 不一致

worktree はメインリポジトリの node_modules を共有するため、プラットフォーム固有バイナリの不一致が発生しうる。`pnpm install --force` または `pnpm add -wD @esbuild/darwin-x64` で対応可能。

## 技術的教訓

1. **Discriminated Union + exhaustive check** は adapter パターンと相性が良い。将来の Consumer 追加時にコンパイルエラーで漏れを検出できる
2. **MN-2 対応**: 型をそのまま wrap するのではなく、必要フィールドのみ抽出することで依存を最小化できる
3. **段階的移行**: 既存 Builder を維持しつつ adapter を追加する方針により、破壊的変更なしで進められた

## スキル改善提案

改善点なし。task-specification-creator の Phase 1-13 フローは本タスクで適切に機能した。

## 新規 Pitfall 候補

### 候補: エスケープテストの部分文字列マッチ

- **教訓**: `\$HOME` は部分文字列 `$HOME` を含むため `not.toContain("$HOME")` が偽陽性になる
- **解決策**: lookbehind regex `not.toMatch(/(?<!\\)\$HOME/)` で未エスケープ文字の非存在を検証
- **関連パターン**: P55（正規表現メタ文字）
