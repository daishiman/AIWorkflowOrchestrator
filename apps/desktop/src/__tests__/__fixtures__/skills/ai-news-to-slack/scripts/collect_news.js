#!/usr/bin/env node
/**
 * AI情報収集スクリプト
 * HackerNews APIとArxiv RSSからAI関連情報を収集する
 *
 * 使い方:
 *   node collect_news.js
 *   node collect_news.js --max-news 10 --max-research 5
 */

const https = require('https');
const http = require('http');

// AI関連キーワード（小文字で比較）
const AI_KEYWORDS = [
  'ai', 'llm', 'gpt', 'claude', 'machine learning', 'neural',
  'openai', 'anthropic', 'artificial intelligence', 'deep learning',
  'transformer', 'diffusion', 'generative', 'gemini', 'llama',
  'mistral', 'language model', 'chatgpt', 'copilot', 'stable diffusion',
  'midjourney', 'dall-e', 'rag', 'fine-tun', 'embedding', 'vector',
];

/**
 * HTTPリクエストをPromise形式で実行
 */
function fetchUrl(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;

    const req = client.get(url, {
      headers: {
        'User-Agent': 'AIWorkflowOrchestrator/1.0 (AI News Collector)',
        'Accept': 'application/json, text/xml, */*',
      },
      timeout: timeoutMs,
    }, (res) => {
      // リダイレクト対応
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(fetchUrl(res.headers.location, timeoutMs));
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout: ${url}`));
    });
  });
}

/**
 * HackerNewsからAI関連ストーリーを取得
 */
async function fetchHackerNewsAI(maxItems = 8) {
  console.error('HackerNewsから情報を取得中...');

  try {
    const topStoriesJson = await fetchUrl('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topStoryIds = JSON.parse(topStoriesJson).slice(0, 150);

    const stories = [];
    const batchSize = 10;

    for (let i = 0; i < topStoryIds.length && stories.length < maxItems; i += batchSize) {
      const batch = topStoryIds.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map(id => fetchUrl(`https://hacker-news.firebaseio.com/v0/item/${id}.json`))
      );

      for (const result of batchResults) {
        if (stories.length >= maxItems) break;
        if (result.status !== 'fulfilled') continue;

        let story;
        try {
          story = JSON.parse(result.value);
        } catch {
          continue;
        }

        if (!story || !story.title || story.type !== 'story') continue;

        const titleLower = story.title.toLowerCase();
        const isAIRelated = AI_KEYWORDS.some(kw => titleLower.includes(kw));

        if (isAIRelated) {
          stories.push({
            source: 'HackerNews',
            title: story.title,
            url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
            score: story.score || 0,
            comments: story.descendants || 0,
            category: 'news',
          });
        }
      }
    }

    console.error(`HackerNews: ${stories.length}件のAI関連記事を取得`);
    return stories;
  } catch (e) {
    console.error('HackerNews取得エラー:', e.message);
    return [];
  }
}

/**
 * Arxiv RSSからAI論文を取得
 */
async function fetchArxivPapers(category, maxItems = 3) {
  console.error(`Arxiv (${category}) から論文を取得中...`);

  try {
    const rssData = await fetchUrl(`https://rss.arxiv.org/rss/${category}`);

    const items = [];
    // 簡易XMLパース
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(rssData)) !== null && items.length < maxItems) {
      const itemContent = match[1];

      const extractTag = (tag) => {
        const m = itemContent.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        if (!m) return null;
        return m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim();
      };

      const title = extractTag('title');
      const link = extractTag('link') || (itemContent.match(/https?:\/\/arxiv\.org\/abs\/[^\s<"]+/) || [])[0];
      const description = extractTag('description');

      if (!title || !link) continue;

      // タイトルから数字だけの行を除外（RSSフィードのゴミデータ対策）
      if (/^\d+$/.test(title)) continue;

      const cleanDesc = description
        ? description.replace(/<[^>]+>/g, '').trim().slice(0, 200)
        : '';

      items.push({
        source: `Arxiv (${category})`,
        title: title,
        url: link.trim(),
        summary: cleanDesc,
        category: 'research',
      });
    }

    console.error(`Arxiv (${category}): ${items.length}件の論文を取得`);
    return items;
  } catch (e) {
    console.error(`Arxiv (${category}) 取得エラー:`, e.message);
    return [];
  }
}

/**
 * コマンドライン引数パース
 */
function parseArgs(args) {
  const options = {
    maxNews: 8,
    maxResearch: 6,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--max-news' && args[i + 1]) {
      options.maxNews = parseInt(args[++i], 10) || 8;
    } else if (args[i] === '--max-research' && args[i + 1]) {
      options.maxResearch = parseInt(args[++i], 10) || 6;
    }
  }

  return options;
}

/**
 * メイン実行
 */
async function main() {
  const options = parseArgs(process.argv.slice(2));
  const researchPerCategory = Math.ceil(options.maxResearch / 3);

  console.error('=== AI情報収集開始 ===');

  const [hnStories, arxivAI, arxivLG, arxivCL] = await Promise.all([
    fetchHackerNewsAI(options.maxNews),
    fetchArxivPapers('cs.AI', researchPerCategory),
    fetchArxivPapers('cs.LG', researchPerCategory),
    fetchArxivPapers('cs.CL', researchPerCategory),
  ]);

  const allItems = [
    ...hnStories,
    ...arxivAI,
    ...arxivLG,
    ...arxivCL,
  ];

  console.error(`=== 収集完了: 合計 ${allItems.length} 件 ===`);

  const result = {
    collected_at: new Date().toISOString(),
    total: allItems.length,
    items: allItems,
  };

  // 標準出力にJSON出力（パイプ可能）
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
