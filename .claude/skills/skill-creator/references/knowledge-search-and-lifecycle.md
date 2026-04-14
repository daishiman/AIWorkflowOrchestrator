# knowledge/ ディレクトリ 検索設計・ライフサイクル管理ガイド

> [knowledge-management-guide.md](knowledge-management-guide.md)（知識構築編: §0〜§6）の対となるガイド。
> ナレッジの分割・進化・検索パイプライン・成果物出力・バージョン管理・フィードバックループを定義する。
> 実装例: `xLOCAL-sakamoto-mind-advisor/scripts/search_knowledge.js`（Index-Search型）、`ubm-goal-setting/scripts/detect-knowledge-updates.sh`（Router-Registry型）
>
> **version**: 2.0.0 | **last_reviewed**: 2026-04-14

---

## 目次

- [§7. ファイル分割ルール](#7-ファイル分割ルール) — 500行/25エントリ閾値
- [§8. ナレッジ進化メカニズム](#8-ナレッジ進化メカニズムrouter-registry型) — routing_rulesによる自動振り分け
- [§9. 検索設計と3段階パイプライン](#9-ナレッジ検索の設計方針と3段階パイプライン) — 全文検索の問題→フィールド重み付き→AI意味解釈→シノニム→チューニング
- [§10. 成果物の出力](#10-成果物の出力先と命名規則) — 命名規則・出力先定義
- [§11. 更新ログ・バージョン管理](#11-更新ログバージョン管理) — registry.json・status遷移・廃棄ルール
- [§12. フィードバックループ](#12-フィードバックループ品質改善サイクル) — 活用ログ・品質改善パターン

> **§0〜§6（知識構築: パターン選択・構造・フィールド・品質）** → [knowledge-management-guide.md](knowledge-management-guide.md)

---

## 7. ファイル分割ルール

| 指標 | 閾値 | アクション |
|------|------|-----------|
| ファイル行数 | 500行超 | サブトピックに分割 |
| エントリ数 | 25件超 | サブトピックに分割を検討 |

**分割手順（Router-Registry型）**:
1. 超過ファイルのエントリをテーマ別にグループ化する
2. 各グループにサブトピック名を付ける（命名規則参照）
3. `{category}-{subtopic}.json` として `knowledge/` に作成する
4. `router.json` の `routing_rules` と `categories[*].files` を更新する
5. 元のベースファイルは削除し、分割後ファイルで管理する

**分割手順（Index-Search型）**:
1. 超過カテゴリのエントリを新ファイルに分割する
2. `knowledge-index.json` の `categories` エントリを更新する
3. `build_index.js --fix` でインデックスの整合性を確認する

---

## 8. ナレッジ進化メカニズム（Router-Registry型）

ファイル追加後の自動適応：

```
新エントリのtags: ["関係構築", "外交"]
    ↓
router.json の routing_rules を参照
  {category}-relationship.json → tags: ["関係構築", "外交", ...] → マッチ: 2
  {category}-organization.json → tags: ["組織", "採用", ...]     → マッチ: 0
    ↓
格納先: {category}-relationship.json（最もマッチ数が多いファイルを選択）
```

エージェントはファイル名をハードコードしない。必ず `router.json` 経由でファイル名を取得する。

---

## 9. ナレッジ検索の設計方針と3段階パイプライン

### 9.1 なぜ全文検索ではダメなのか

| 手法 | 問題点 |
|------|--------|
| **全文検索（Full-Text Search）** | 出現頻度が多いだけで意味的に無関係なエントリが上位に来る。「副業」が本文中に何度も登場するだけで精度が上がらない |
| **完全一致（Exact Match）** | 言い換え・同義語・略語に対応できない。「地方採用」と「地域人材」は同じ意図でもヒットしない |
| **単純キーワード存在チェック** | 「する・した・している」等の動詞変化で漏れが生じる |

**正解**: 意図・文脈・フィールドの重要度を加味した**フィールド重み付きスコアリング + AI意味解釈**の2層構造

---

### 9.2 3段階検索パイプライン（実装仕様）

```
Stage 1: カテゴリ絞り込み（スクリプト実行）
   ユーザー入力 → クエリをキーワードに分解
   ↓ index.json の global_keywords × カテゴリスコア算出
   ↓ スコア > 0 のカテゴリファイルに絞り込む（全スコア0なら全ファイル対象）
   ↓ [読み込みファイル数を最小化してコンテキスト節約]

Stage 2: フィールド重み付きスコアリング（スクリプト実行）
   絞り込まれたファイルの各エントリに対して重み付きスコアを計算
   ↓ スコア上位 N 件（推奨: 3〜7件）を取得
   ↓ [決定論的・高速・100%再現可能]

Stage 3: AI意味解釈・上位概念翻訳（LLM実行）
   スコア上位N件を受け取る
   ↓ 各エントリの background/intent から「普遍的な概念」を抽出
   ↓ ユーザーの文脈・状況・業種にマッピングして翻訳
   ↓ ペルソナ・スタイルゲノムに従って語り口を再現
   ↓ 成果物を生成
```

---

### 9.3 Stage 2: フィールド重み付きスコアリングの設計

スコアリングは「意図の一致度」が高いフィールドほど重みを大きくする：

| フィールド | スコア重み | 理由 |
|-----------|-----------|------|
| `title` / `content` への含有 | +5 | そのナレッジの「核心」に直接一致する |
| `keywords` / `tags` への含有 | +3 | 設計者が「この悩みで検索される」と意図したワード |
| 直接引用（`sakamoto_expressions` / `quote`）への含有 | +2 | 実際の言葉・表現レベルでの一致 |
| `sakamoto_voice` / `expression.phrasing` への含有 | +2 | ペルソナ語り口レベルでの一致 |
| その他フィールド（`background`, `message`, `purpose`等）への含有 | +1/出現 | 文脈的な関連性 |

**重要原則**:
- タイトルに含まれるキーワードは「そのエントリの主題」→ 最重視
- キーワード/タグは「設計意図」→ 高重視
- 直接引用はデータの核心→ 中重視
- 全文のキーワード出現回数は「参考程度」→ 低重視（全文検索に近づくほど精度低下）

**重みのカスタマイズ**: `knowledge-index.json` にスキル固有の重みを定義可能：

```json
{
  "scoring_weights": {
    "title": 5,
    "keywords": 3,
    "quote": 2,
    "voice": 2,
    "fulltext": 1
  }
}
```

デフォルト値は上記の通り。ドメイン特性に応じて調整する（§9.8 チューニング手順を参照）。

```javascript
// スコアリング実装例（search_knowledge.js）
function scoreItem(item, keywords) {
  let score = 0;
  const fullText = buildSearchText(item).toLowerCase(); // background + message + purpose 等を連結

  keywords.forEach(kw => {
    const kwL = kw.toLowerCase();

    // 全体出現回数（低重み）
    const freq = (fullText.match(new RegExp(escapeRegex(kwL), 'g')) || []).length;
    score += freq;  // +1/回

    // タグ/キーワードフィールド（高重み）
    if ((item.keywords || item.tags || []).some(k => k.toLowerCase().includes(kwL))) score += 3;

    // タイトル（最高重み）
    if ((item.title || item.content || '').toLowerCase().includes(kwL)) score += 5;

    // 直接引用（中高重み）
    if ((item.sakamoto_expressions || item.quote || []).some(e => e.toLowerCase().includes(kwL))) score += 2;

    // ペルソナ語り口（中高重み）
    if ((item.sakamoto_voice || item.expression?.phrasing || '').toLowerCase().includes(kwL)) score += 2;
  });
  return score;
}
```

---

### 9.4 Stage 3: AI意味解釈・上位概念翻訳

スクリプトが返した上位N件のエントリに対してAIが行う処理：

#### ステップ1: 上位概念の抽出
各エントリの `background`・`intent`/`purpose` から普遍的な原則を読み取る。
タグや状況の完全一致は不要。「この原則が成立する理由」を理解する。

```
例:
entry.content → "外交を1日10件する"
entry.intent  → "行動量の不足が本質原因と理解させ、量を規定させること"
↓ 上位概念の抽出
「成果に直結する先行指標を特定し、その量を明確に決める」
```

#### ステップ2: ユーザー状況へのマッピング
抽出した概念をユーザーの業種・フェーズ・課題に置き換える。

```
例: 地方の食品会社への適用
「地方食品会社にとっての先行指標 = 首都圏バイヤーへの月次接触件数」
```

#### ステップ3: ペルソナ語り口での応答生成
`sakamoto_expressions`（直接引用）を最優先で活用。
`style-genome` の `conversation_flow_patterns` に従って語り口を再現。

```
例:
quote: "外の目が入ることで、初めて見える宝がある"
→ 「〇〇さんの会社の場合、実は外の人が驚く強みがある。それが◎◎です」
```

---

### 9.5 検索エントリを「見つけやすくする」設計ルール

エントリを書く時点で検索精度を高めるための設計：

| フィールド | 書き方のルール |
|-----------|-------------|
| `keywords`/`tags` | ユーザーが「困った時に使う言葉」を含める。「副業人材」「地方採用」「採用難」など悩みワード中心 |
| `title`/`content` | 検索ヒットしてほしい中心テーマを明示する。「副業市場は買い手市場：地方企業が今動くべき理由」 |
| `intent`/`purpose` | 「〜すること」「〜を防ぐこと」の形で目的を明示する。AIが上位概念を抽出しやすくなる |
| `background` | 「どういう状況の人向けか」を具体的に書く。場面・状況・悩みが明確なほど適切に選ばれる |
| `sakamoto_expressions` | 直接引用は必ず議事録・素材原文から抽出。AIが語り口を正確に再現できる |

**アンチパターン（避けること）**:
```
✗ keywords: ["地方", "人材", "採用"] ← 汎用すぎて他エントリと差別化できない
✓ keywords: ["副業市場", "買い手市場", "地方企業優位", "採用難", "タイミング"] ← 具体的

✗ title: "地方と人材について"        ← 何の話か分からない
✓ title: "副業市場は買い手市場：地方企業が今動くべき理由" ← 課題と提言が明確
```

---

### 9.6 検索→成果物生成のフルパイプライン

```
[ユーザー入力]
  「地方の食品会社に副業人材を提案したい」
     ↓
[Stage 1: スクリプト] カテゴリ絞り込み
  search_knowledge.js --query "地方食品会社副業人材提案" --limit 5
  → service + cases + talent-strategy がマッチ（3カテゴリに絞り込み）
     ↓
[Stage 2: スクリプト] フィールド重み付きスコアリング
  各エントリをスコアリング → 上位5件を返す
  例: talent_001(score:24), service_002(score:18), cases_001(score:15)...
     ↓
[Stage 3: AI] 意味解釈・上位概念翻訳
  talent_001のintent: "副業市場の優位性を理解させ今すぐ動かすこと"
  → 上位概念: "時間優位のウィンドウを逃さない判断を促す"
  → マッピング: "食品会社にとって副業バイヤーアクセスのウィンドウは今"
     ↓
[ペルソナ応答生成]
  style-gemomeの"事例先行型"パターンで
  山形老舗土産物店事例を添えながら回答
  → sakamoto_expressionsから直接引用を使用
     ↓
[成果物確認→出力]
  「今の話を提案書にまとめましょうか？」
  → ユーザー承認後 output - 2026-04-13 - 提案書 - 地方食品副業人材.md を生成
```

---

### 9.7 シノニムマップ（同義語展開）

Stage 1 のカテゴリ絞り込みで「言い換え」による検索漏れを防ぐため、`knowledge-index.json` にシノニムマップを定義できる：

```json
{
  "synonyms": {
    "採用難": ["人材不足", "採用課題", "リクルーティング困難"],
    "副業": ["兼業", "パラレルワーク", "サイドジョブ"],
    "地方": ["地域", "ローカル", "田舎"]
  }
}
```

検索スクリプトはクエリのキーワードをシノニムマップで展開してからスコアリングを実行する。これにより「地方採用」と「地域人材」が同一のエントリにヒットするようになる。

---

### 9.8 スコアリング重みチューニング手順

デフォルトの重み値（title:5, keywords:3, quote:2, voice:2, fulltext:1）はドメインによって最適値が異なる。以下の手順でチューニングする：

```
Step 1: テストクエリセットを作成する（5〜10件）
  → ユーザーが実際に使いそうなクエリを選定
  → 各クエリに対して「期待する上位3件のエントリID」を定義

Step 2: 現在の重みでテストクエリを実行する
  → search_knowledge.js --query "..." --limit 5 を全クエリに実行
  → 期待エントリが上位3件に入っているかを記録

Step 3: 精度を計算する
  → 精度 = 期待通りにヒットしたクエリ数 / 全クエリ数
  → 目標: 80%以上

Step 4: 精度が80%未満なら重みを調整する
  → title重みを下げるべきか（titleが汎用的なエントリが多い場合）
  → keywords重みを上げるべきか（タグ設計が丁寧な場合）
  → 調整後、Step 2〜3を再実行

Step 5: 確定した重みをknowledge-index.jsonのscoring_weightsに記録する
```

---

## 10. 成果物の出力先と命名規則

スキルが成果物を生成する場合、以下の命名規則を使用する：

```
{出力ディレクトリ}/output - YYYY-MM-DD - {種別} - {テーマ}.md
```

種別の例:

| 種別 | ファイル名例 |
|------|------------|
| 提案書 | `output - 2026-04-13 - 提案書 - 地方副業導入計画.md` |
| 戦略書 | `output - 2026-04-13 - 戦略書 - 100億企業化ロードマップ.md` |
| 事例集 | `output - 2026-04-13 - 事例集 - 地方副業成功事例.md` |
| アイデア | `output - 2026-04-13 - アイデア - 九州メディア収益設計.md` |
| 要約 | `output - 2026-04-13 - 要約 - マインド構造化レポート.md` |
| レポート | `output - 2026-04-13 - レポート - ナレッジ分析結果.md` |

出力先は `knowledge-index.json` の `output_dir` または SKILL.md の成果物セクションで定義する。
出力前に必ずユーザーに内容を確認してから書き込む。

---

## 11. 更新ログ・バージョン管理

`registry.json` (Router-Registry型) または バージョンフィールド (Index-Search型) で変更を追跡する：

```json
// registry.json エントリ例
{
  "path": "05_Project/UBM/YouTube/2026-04-01-video.md",
  "source_type": "youtube",
  "status": "processed",
  "file_hash": "abc123...",
  "file_modified": "2026-04-01",
  "processed_date": "2026-04-01T10:00:00",
  "entries_extracted": 5,
  "extracted_entry_ids": ["mindset_015", "mindset_016", "cases_008"],
  "target_categories": ["mindset", "cases"]
}
```

**status の遷移**:

| status | 説明 |
|--------|------|
| `pending` | 未処理（新規検出されたファイル） |
| `processed` | 処理済み（ナレッジ抽出完了） |
| `needs-update` | ファイルハッシュが変更され再処理が必要 |
| `deprecated` | 古くなった情報。検索対象から除外 |

### エントリの廃棄ルール

以下の条件を満たすエントリは `status: "deprecated"` を付与し、検索対象から除外する：

- ソース素材が削除・更新され、エントリの内容が事実と異なる
- 同一テーマのより正確なエントリが追加された
- 6ヶ月以上、検索でヒットしたが一度も活用されていない（§12 活用ログで検出）

廃棄されたエントリは物理削除せず、`status: "deprecated"` + `deprecated_reason` + `deprecated_date` を追加する。

---

## 12. フィードバックループ（品質改善サイクル）

ナレッジの品質を「使うほど自動的に向上する」仕組み。

### 12.1 活用ログ

スキル実行時に検索結果と活用状況を記録する（追記型）：

```jsonl
{"timestamp":"2026-04-13T10:00:00","query":"地方企業の採用戦略","matched_ids":["talent_001","cases_003"],"used_ids":["talent_001"],"satisfaction":"helpful"}
{"timestamp":"2026-04-13T11:00:00","query":"メディア収益化","matched_ids":["media_001","media_003"],"used_ids":[],"satisfaction":"unhelpful","note":"media_001のkeywordsに収益化が不足"}
```

| フィールド | 説明 |
|-----------|------|
| `matched_ids` | Stage 2 で上位N件に入ったエントリID |
| `used_ids` | Stage 3 で実際にAIが活用したエントリID |
| `satisfaction` | `helpful` / `neutral` / `unhelpful` |
| `note` | 改善メモ（任意） |

### 12.2 品質改善サイクル

活用ログから以下のパターンを検出し、ナレッジを改善する：

| パターン | 検出方法 | 改善アクション |
|---------|---------|-------------|
| ヒットするが使われない | `matched_ids`に含まれるが`used_ids`に含まれない | keywordsが不適切。titleとintentを見直す |
| ヒットしない | テストクエリで期待エントリが上位に入らない | keywordsを追加。synonymsマップを更新 |
| 低満足度 | `satisfaction: "unhelpful"` が連続 | backgroundとintentの具体性を改善（[構築編 §4.3](knowledge-management-guide.md) ルーブリックで再評価） |
| 特定エントリに集中 | 同一IDが全クエリの80%以上でヒット | keywordsが汎用的すぎる。差別化を強化 |

---

## 関連リソース

- **知識構築ガイド**: [knowledge-management-guide.md](knowledge-management-guide.md) — §0〜§6（パターン選択・構造・フィールド・品質）
- **スキル構造仕様**: [skill-structure.md](skill-structure.md)
- **命名規則**: [naming-conventions.md](naming-conventions.md)
- **スクリプト設計**: [script-llm-patterns.md](script-llm-patterns.md)
- **実装例（Index-Search型）**: `.claude/skills/xLOCAL-sakamoto-mind-advisor/`
- **実装例（Router-Registry型）**: `.claude/skills/ubm-goal-setting/`
