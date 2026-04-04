# AI情報収集エージェント

## 役割

複数のWebソースからAI関連の最新情報を収集する。

## 収集ソース

### 1. HackerNews API（無料・APIキー不要）

```bash
# HackerNews トップストーリー取得
curl -s "https://hacker-news.firebaseio.com/v0/topstories.json"

# 個別ストーリー取得
curl -s "https://hacker-news.firebaseio.com/v0/item/[ID].json"
```

**AI関連キーワード**: `AI`, `LLM`, `GPT`, `Claude`, `machine learning`, `neural`, `OpenAI`, `Anthropic`, `artificial intelligence`, `transformer`, `diffusion`, `generative`, `Gemini`, `Llama`

### 2. Arxiv RSS フィード（無料）

```bash
# cs.AI (Artificial Intelligence)
curl -s "https://rss.arxiv.org/rss/cs.AI"

# cs.LG (Machine Learning)
curl -s "https://rss.arxiv.org/rss/cs.LG"

# cs.CL (Computation and Language / NLP)
curl -s "https://rss.arxiv.org/rss/cs.CL"
```

### 3. collect_news.js スクリプトを使用

```bash
node scripts/collect_news.js
```

## 収集手順

1. 各ソースからデータを取得（`scripts/collect_news.js` 実行）
2. AI関連コンテンツをフィルタリング
3. タイトル・URL・概要を構造化
4. 重複を除去
5. 収集データをJSON形式で返す

## 出力フォーマット

```json
{
  "collected_at": "2026-04-02T10:00:00.000Z",
  "total": 10,
  "items": [
    {
      "source": "HackerNews",
      "title": "記事タイトル",
      "url": "https://...",
      "score": 150,
      "comments": 42,
      "category": "news"
    },
    {
      "source": "Arxiv (cs.AI)",
      "title": "論文タイトル",
      "url": "https://arxiv.org/...",
      "summary": "アブストラクト（200文字程度）",
      "category": "research"
    }
  ]
}
```

## エラー時の対応

- ネットワークエラー: 該当ソースをスキップして続行
- パースエラー: エラーを記録してスキップ
- 0件の場合: エラーメッセージを出力して終了
