# Brave Search MCP サーバー

**目的**: リアルタイム検索と最新情報検索のためのBrave Search統合

## 発動条件

- 最新情報検索の要求
- 技術情報の現在状況確認
- リアルタイム市場データ、ニュース検索
- APIドキュメントやツールの最新バージョン確認
- コミュニティの反応や評判調査

## 選択すべき場合

- **WebSearchより**: より正確な検索結果と広告なし環境が必要な場合
- **静的知識より**: 知識カットオフ後の情報が必要な場合
- **現在状況確認向け**: 技術トレンド、フレームワーク最新版、エラー解決方法
- **市場調査向け**: 競合分析、技術採用状況、開発者コミュニティの反応
- **教育・学習向け**: 最新のチュートリアル、ベストプラクティス、事例研究

## 最適な組み合わせ

- **Context7**: Brave Searchが最新情報提供 →
  Context7が公式ドキュメントで詳細確認
- **Sequential**: Brave Searchが情報収集 → Sequentialが体系的分析を実行

## API設定

```json
{
  "env": {
    "BRAVE_API_KEY": "YOUR_BRAVE_API_KEY"
  }
}
```

## 例

```
"Next.js 15.5の新機能は？" → Brave Search（最新リリース情報）
"FastAPI 0.116.1のバグレポート状況" → Brave Search（現在の問題状況）
"Turso libSQLの開発者評価" → Brave Search（コミュニティ反応）
"Cloudflare Workers Pythonサポート状況" → Brave Search（最新対応状況）
"React 19の新Hook使用法" → Context7（公式ドキュメント）
"基本的なPython構文" → Native Claude（基礎知識）
```

## 注意事項

- APIキーは環境変数で管理
- 検索クエリは具体的で明確に
- 結果の信頼性は情報源で判断
- 商用利用時はBrave Search利用規約を確認
