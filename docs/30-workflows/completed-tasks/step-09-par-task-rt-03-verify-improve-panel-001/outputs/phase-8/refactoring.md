# Phase 8: リファクタリング判定

## メタ情報

| 項目   | 内容                                |
| ------ | ----------------------------------- |
| Phase  | 8                                   |
| タスク | TASK-RT-03-VERIFY-IMPROVE-PANEL-001 |
| 実行日 | 2026-04-03                          |
| 判定   | リファクタリング不要                |

## 判定根拠

### 検討した候補

| #   | パターン                              | 出現箇所                                                          | 判定   | 理由                                                                 |
| --- | ------------------------------------- | ----------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| 1   | 折りたたみトグル（useState + button） | VerifyResultDetailPanel (2箇所), ImproveResultDetailPanel (1箇所) | 見送り | 3行程度のパターンであり、抽出するとかえって Props が増えて複雑化する |
| 2   | スケルトン表示ブロック                | VerifyResultDetailPanel, ImproveResultDetailPanel                 | 見送り | 内部構造が異なる（行数・幅比率）ため共通化のメリットが薄い           |
| 3   | SeverityIcon / CheckItem              | VerifyResultDetailPanel 内のみ                                    | 見送り | 単一ファイル内のローカルコンポーネントで十分、外部抽出不要           |
| 4   | SuggestionCard                        | ImproveResultDetailPanel 内のみ                                   | 見送り | 単一ファイル内のローカルコンポーネントで十分                         |

### 既存共有部品の再利用状況

以下の `result-panel-parts.tsx` エクスポートは適切に再利用されている:

- `PANEL_CARD_CLASSES` — 両パネルのルート `<div>` に使用
- `SectionHeader` — 両パネルのセクション区切りに使用
- `StatusBadge` — VerifyResultDetailPanel で `label` override 付きで使用
- `DetailFooter` — 両パネルの ID フッターに使用

### StatusBadge の label override 設計

Phase 5 で `StatusBadge` に `label?: string` props を追加済み。これにより:

- verify の `pass`/`fail`/`pending` を `合格`/`不合格`/`検証中` に変換
- 既存の Plan/Execute パネルには影響なし（`label` 未指定時はデフォルト値を使用）

## 結論

3行程度の繰り返しパターンは抽出コストが利益を上回るため、リファクタリングは不要と判定した。共有部品 `result-panel-parts.tsx` は適切に活用されており、追加抽出の必要はない。
