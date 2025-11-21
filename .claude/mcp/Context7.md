# Context7 MCP Server

**目的**: 公式ライブラリ文書検索とフレームワークパターンガイダンス

## 発動条件

- インポート文: `import`, `require`, `from`, `use`
- フレームワークキーワード: React, Vue, Angular, Next.js, Express など
- APIやベストプラクティスに関するライブラリ固有の質問
- 汎用ソリューションよりも公式文書パターンが必要
- バージョン固有の実装要件

## 選択すべき場合

- **WebSearchより**: キュレートされたバージョン固有の文書が必要な場合
- **ネイティブ知識より**: 実装が公式パターンに従う必要がある場合
- **フレームワーク向け**: React hooks、Vue composition API、Angular services
- **ライブラリ向け**: 正しいAPI使用法、認証フロー、設定
- **コンプライアンス向け**: 公式標準への準拠が必須の場合

## 最適な組み合わせ

- **Sequential**: Context7が文書提供 → Sequentialが実装戦略を分析
- **Magic**: Context7がパターン提供 →
  Magicがフレームワーク準拠コンポーネントを生成

## 例

```
"implement React useEffect" → Context7 (公式Reactパターン)
"add authentication with Auth0" → Context7 (公式Auth0文書)
"migrate to Vue 3" → Context7 (公式移行ガイド)
"optimize Next.js performance" → Context7 (公式最適化パターン)
"just explain this function" → Native Claude (外部文書不要)
```
