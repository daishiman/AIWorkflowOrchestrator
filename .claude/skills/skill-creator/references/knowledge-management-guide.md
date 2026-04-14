# knowledge/ ディレクトリ 設計・管理ガイド（知識構築編）

> skill-creator が新規スキルを作成する際に参照するナレッジ管理の標準仕様（知識構築編）。
> パターン選択・ディレクトリ構造・フィールド設計・品質基準を定義する。
> 検索設計・ライフサイクル管理は [knowledge-search-and-lifecycle.md](knowledge-search-and-lifecycle.md) を参照。
> 実装例: `ubm-goal-setting/knowledge/`（Router-Registry型）、`xLOCAL-sakamoto-mind-advisor/knowledge/`（Index-Search型）
>
> **適用範囲**: 200エントリ以下の中小規模ナレッジシステム。これを超える場合は階層化インデックスや外部検索エンジンの導入を検討する。
>
> **version**: 2.0.0 | **last_reviewed**: 2026-04-14

---

## 目次

- [§0. クイックスタート](#0-クイックスタート最小構成で動かす) — パターン選択→ディレクトリ作成→初回エントリ
- [§1. knowledge/を追加するタイミング](#1-knowledge-ディレクトリを追加するタイミング) — 5条件判定
- [§2. 2つの実装パターン](#2-2つの実装パターン) — 共通原則・スケール別・Index-Search型・Router-Registry型
- [§3. ファイル命名規則](#3-ファイル命名規則) — 連番禁止・ハイフン区切り
- [§4. 標準フィールド](#4-各ファイルの標準フィールド) — 基本構造・必須/推奨・**品質ルーブリック**・ステップバイステップ・カテゴリ別
- [§5. スタイルゲノム](#5-スタイルゲノムペルソナ系スキル) — ペルソナ再現用JSON仕様
- [§6. 品質チェックリスト](#6-エントリ品質チェックリスト) — 必須6項目・推奨5項目・リグレッションテスト

> **§7〜§12（検索・ライフサイクル管理）** → [knowledge-search-and-lifecycle.md](knowledge-search-and-lifecycle.md)

---

## 0. クイックスタート（最小構成で動かす）

以下の3ステップで最小構成のナレッジシステムが動作する：

### ステップ1: パターンを選択する

```
Q1: ナレッジは継続的に追加されるか？（新しい素材が増える）
  → Yes → Q2: ソース素材（議事録等）が外部ファイルにあるか？
    → Yes → Router-Registry型（§2 パターンB）
    → No  → Index-Search型（§2 パターンA）
  → No  → Q3: ペルソナ（人物の語り口）を再現するか？
    → Yes → Index-Search型 + style-genome（§2 パターンA + §5）
    → No  → references/ に静的ファイルを配置すれば十分（knowledge/ 不要）
```

### ステップ2: ディレクトリを作成する

**Index-Search型（最小構成）**:
```
knowledge/
├── knowledge-index.json      # カテゴリ索引
└── knowledge-{category}.json # 最低1カテゴリ・3エントリ
scripts/
├── search_knowledge.js       # 検索スクリプト
└── build_index.js            # インデックス検証
```

**Router-Registry型（最小構成）**:
```
knowledge/
├── router.json               # カテゴリ→ファイルマッピング
├── schema.json               # エントリバリデーション
├── registry.json              # 処理済みファイル追跡
└── {category}.json            # 最低1カテゴリ・3エントリ
scripts/
├── detect-knowledge-updates.sh
└── validate-output.sh
agents/
└── knowledge-extractor.md     # 素材→エントリ抽出
```

### ステップ3: 最初の3エントリを作成する

§4.4「エントリ作成ステップバイステップ」に従い、ソース素材から最初の3エントリを作成する。
3エントリが動作したら、検索スクリプトでテストクエリを実行して精度を確認する。

---

## 1. knowledge/ ディレクトリを追加するタイミング

以下の条件を1つ以上満たす場合に `knowledge/` を作成する：

| 条件 | 説明 |
|------|------|
| 外部素材依存 | 議事録・動画・教材・会議メモ等を参照して回答する |
| ペルソナ再現 | 特定人物の語り口・思想・表現スタイルを再現する |
| 知識量が多い | カテゴリ別に分類された知識が10件以上ある |
| 継続的蓄積 | 新しい素材が追加されるたびにナレッジが増える |
| 精度優先検索 | キーワード・カテゴリ・IDで的確に検索したい |

---

## 2. 2つの実装パターン

### 共通設計原則

両パターンに共通する3つの原則：

1. **索引は軽く、データは重く分離する** — 索引（index.json / router.json）はカテゴリ・キーワードのみ。実データはカテゴリ別ファイルに格納
2. **ファイル名は内容を自己記述する** — ファイル名だけで中身が分かること。連番禁止
3. **検索は決定論的ステージとAIステージを分離する** — スクリプト（再現可能・高速）→ AI（意味解釈・柔軟）の2層

### スケール別推奨構成

| エントリ数 | 推奨 | 検索方式 |
|-----------|------|---------|
| 1〜15 | 必須フィールドのみ。スコアリング不要（カテゴリ+ID直引き） | Simple-Lookup |
| 16〜100 | 推奨フィールドも追加。3段階パイプライン（→[検索編 §9](knowledge-search-and-lifecycle.md)） | フルパイプライン |
| 101〜200 | サブカテゴリ分割必須。重みチューニング（→[検索編 §9.8](knowledge-search-and-lifecycle.md)） | フルパイプライン+チューニング |
| 200超 | このガイドの適用範囲外。階層化インデックスを検討 | 外部検索エンジン推奨 |

### パターンA: Index-Search型

**代表例**: `xLOCAL-sakamoto-mind-advisor/knowledge/`

**適用場面**: ペルソナ再現、議事録から抽出した固定ナレッジ、テーマ別分類

**構成**:
```
knowledge/
├── knowledge-index.json          # カテゴリ索引 + global_keywords マップ
├── knowledge-{category}.json     # カテゴリ別データ（複数）
└── knowledge-style-genome.json   # ペルソナ系の場合のみ
```

**スクリプト**:
```
scripts/
├── search_knowledge.js   # キーワード・クエリ・カテゴリ・ID検索
└── build_index.js        # インデックス整合性検証・自動修正
```

**knowledge-index.json の構造**:
```json
{
  "version": "1.0.0",
  "categories": [
    {
      "id": "カテゴリID",
      "label": "カテゴリ日本語名",
      "file": "knowledge-{category}.json",
      "keywords": ["キーワード1", "キーワード2"]
    }
  ],
  "global_keywords": {
    "キーワード": ["関連カテゴリID1", "関連カテゴリID2"]
  },
  "output_dir": "05_Project/.../成果物",
  "output_naming": "output - YYYY-MM-DD - {種別} - {テーマ}.md"
}
```

**検索コマンド**:
```bash
node scripts/search_knowledge.js --query "自然言語クエリ" --limit 5
node scripts/search_knowledge.js --keywords "副業,採用,地方" --limit 3
node scripts/search_knowledge.js --category mindset --limit 3
node scripts/search_knowledge.js --id "mindset_001"
node scripts/build_index.js --stats
node scripts/build_index.js --fix   # インデックス自動修正
```

---

### パターンB: Router-Registry型

**代表例**: `ubm-goal-setting/knowledge/`

**適用場面**: 継続的な知識同期・蓄積、外部ファイルからの随時抽出、動的ファイル追加

**構成**:
```
knowledge/
├── router.json                      # カテゴリ→ファイル対応 + routing_rules + quick_lookup
├── schema.json                      # JSONスキーマ定義（バリデーション用）
├── registry.json                    # MD5ハッシュで処理済みファイルを管理
├── sync-log.jsonl                   # 同期ログ
├── {category}.json                  # カテゴリ基本ファイル（初期）
└── {category}-{subtopic}.json       # サブトピック分割後のファイル
```

**スクリプト**:
```
scripts/
├── detect-knowledge-updates.sh      # 未処理ファイルの検出
├── check-knowledge-split.sh         # エントリ数超過ファイルの監視
└── validate-output.sh               # 出力バリデーション
```

**エージェント**:
```
agents/
├── knowledge-extractor.md           # 素材→ナレッジ抽出 SubAgent
└── info-collector.md                # Phase 1-2 情報収集SubAgent
```

**router.json の構造**:
```json
{
  "categories": {
    "principles": {
      "files": ["principles-relationship.json", "principles-mindset.json"],
      "routing_rules": {
        "principles-relationship.json": {
          "topic": "関係構築・外交の原則",
          "tags": ["関係構築", "外交", "信頼"],
          "default": false
        },
        "principles-mindset.json": {
          "topic": "マインドセット・思考法の原則",
          "tags": ["マインド", "思考", "姿勢"],
          "default": true
        }
      }
    }
  },
  "quick_lookup": {
    "by_phase": {
      "0to1": { "files": ["phase-advice-0to1.json"] },
      "1to10": { "files": ["phase-advice-1to10.json"] }
    },
    "by_issue": {
      "採用": { "files": ["consultation-organization.json"] }
    }
  }
}
```

**routing_rules の各フィールド**:

| フィールド | 説明 |
|-----------|------|
| `topic` | そのファイルのサブトピック概要（人間可読な説明） |
| `tags` | エントリの `tags` とマッチングするキーワード配列 |
| `default` | マッチ数が同点の場合にフォールバック先として使用するか |
```

**同期コマンド**:
```bash
/ai:{skill-name}-knowledge-sync              # 未処理ファイルのみ自動スキャン
/ai:{skill-name}-knowledge-sync --all        # 全ファイル再構築
/ai:{skill-name}-knowledge-sync --since YYYY-MM-DD  # 指定日以降のみ
```

---

## 3. ファイル命名規則

### 共通ルール

| ルール | 説明 |
|--------|------|
| 内容を表す英単語 | ファイル名だけで「何が入っているか」が分かること |
| ハイフン区切り | `{category}-{subtopic}.json` 形式 |
| 小文字のみ | 大文字不使用 |
| **連番禁止** | `-1`, `-2`, `-a`, `-b` は絶対禁止 |

### 命名例

| カテゴリ | 良い例 | 悪い例 |
|---------|--------|--------|
| principles | `principles-relationship.json` | `principles-1.json` |
| mindset | `mindset-goal-strategy.json` | `mindset-a.json` |
| cases | `cases-success.json` | `cases-new.json` |
| phase-advice | `phase-advice-0to1.json` | `phase-advice-part1.json` |

---

## 4. 各ファイルの標準フィールド

### 4.1 カテゴリファイルの基本構造

```json
{
  "category": "カテゴリID",
  "label": "カテゴリ日本語名",
  "version": "1.0.0",
  "created_at": "YYYY-MM-DD",
  "description": "このカテゴリの説明",
  "keywords_global": ["グローバルキーワード1", "グローバルキーワード2"],
  "source_note": "情報源の注記（例: 全情報はYouTube議事録から抽出）",
  "items": [ ... ]
}
```

### 4.2 エントリの必須・推奨フィールド

#### 必須フィールド（全カテゴリ共通）

| フィールド | 説明 | 書き方 |
|-----------|------|--------|
| `id` | 一意識別子 | `{category}_{3桁連番}` または `{PREFIX}-{3桁連番}` |
| `title` または `content` | 知識の核心 | 1〜2文で端的に |
| `purpose` または `intent` | この知識の目的・意図 | 「〜すること」「〜を防ぐこと」の形 |
| `background` | この知識が生まれた背景・状況 | 2〜5文で具体的に |
| `keywords` または `tags` | 検索タグ | ユーザーが使う悩みワード・キーワード |
| `source` | 出典情報 | ファイル名・種別・日付・セクション |

#### 推奨フィールド

| フィールド | 説明 | 書き方 |
|-----------|------|--------|
| `message` | エージェントが伝えるべき核心メッセージ | 2〜4文 |
| `root_cause` | 表面問題の裏にある本質的な原因 | 1〜2文 |
| `expected_outcome` または `achievable` | 実践後の具体的な変化・達成できること | 2〜4文（リスト可） |
| `how_to_use` または `applications` | エージェントとしての活用方法 | いつ・どう使うか |
| `future` | 長期的な理想状態・方向性 | 1〜2文 |
| `related_items` または `related` | 関連エントリID | 配列形式 |
| `output_types` | 生成できる成果物の種別 | 配列形式 |
| `action_items` | 具体的なアクション | 配列形式 |

#### ペルソナ再現系フィールド（Index-Search型で使用）

| フィールド | 説明 | 書き方 |
|-----------|------|--------|
| `sakamoto_voice` または `expression.phrasing` | ペルソナの語り口 | そのペルソナが言いそうな一文 |
| `sakamoto_expressions` または `quote` | 直接引用 | 議事録・素材からの原文。最優先で活用 |
| `expression.tone` | 感情トーン | 厳しめ / 優しめ / 励まし / 問いかけ 等 |
| `expression.context_note` | どういう場面で使う口調か | 1文 |

### 4.3 フィールド別品質ルーブリック（再現性の要）

各必須フィールドの「レベル1（不可）/ レベル2（可）/ レベル3（優）」判断基準。**100人が同じ品質基準で書けること**を目的とする。

#### `title` / `content`

| レベル | 基準 | 例 |
|--------|------|-----|
| 1（不可） | 何の話か分からない。主語・述語が曖昧 | 「地方と人材について」 |
| 2（可） | 主題が明確。主語+動詞+目的語の1文 | 「副業市場は買い手市場である」 |
| 3（優） | 課題と提言が明確。検索ヒットしやすい | 「副業市場は買い手市場：地方企業が今動くべき理由」 |

**決定論的基準**: 主語+動詞+目的語の1文。修飾語は2つまで。

#### `background`

| レベル | 基準 | 例 |
|--------|------|-----|
| 1（不可） | 抽象的。具体情報がない | 「事業の課題についての相談」 |
| 2（可） | 業種・規模・状況のうち2つ以上を含む | 「売上1億円の美容室オーナーが、2店舗目の出店タイミングについて相談」 |
| 3（優） | 業種・規模・期間・数値・試した施策を含む | 「売上1億円・スタッフ8名の美容室オーナーが、年商1.5億への成長を目指し2店舗目を検討中。既存店の利益率低下（前年比-3%）を懸念している状況」 |

**決定論的基準**: 業種・規模・期間・数値のうち最低2つを含むこと。2〜5文。

#### `intent` / `purpose`

| レベル | 基準 | 例 |
|--------|------|-----|
| 1（不可） | 漠然としている | 「採用を改善する」 |
| 2（可） | 「〜すること」の形で目的が明確 | 「副業人材という選択肢の存在を認知させること」 |
| 3（優） | 「何を変えたいか」+「どう変えたいか」が明確 | 「既存の採用チャネルへの固執を自覚させ、副業人材という新しい選択肢の存在を認知させること」 |

**決定論的基準**: 「〜すること」「〜を防ぐこと」の形で記述。対象の変化（before→after）が読み取れること。

#### `keywords` / `tags`

| レベル | 基準 | 例 |
|--------|------|-----|
| 1（不可） | 汎用的すぎて差別化できない | `["採用", "人材", "地方"]` |
| 2（可） | 具体的な悩みワードが3語以上 | `["地方製造業採用難", "副業人材活用", "応募ゼロ"]` |
| 3（優） | 悩みワード+同義語+上位語を含む5〜8語 | `["地方製造業採用難", "ハローワーク限界", "副業人材活用", "応募ゼロ", "中途採用", "人材マッチング"]` |

**決定論的基準**: ソース素材中で相談者/話者が使った原文の言葉 + その同義語・上位語を各1つ。1エントリあたり5〜8語。

#### `source`

| レベル | 基準 | 例 |
|--------|------|-----|
| 1（不可） | ファイル名だけ | `"video.md"` |
| 2（可） | ファイル名+種別 | `{"file": "minutes-2026-04-01.md", "type": "議事録"}` |
| 3（優） | ファイル名+種別+日付+該当セクション | `{"file": "minutes-2026-04-01.md", "type": "議事録", "date": "2026-04-01", "section": "採用戦略の議論"}` |

### 4.4 エントリ作成ステップバイステップ（再現性の核心）

同じソース素材から100人が同じ品質のエントリを作成するための手順：

```
Step 1: ソース素材から「核心の主張」を1文で抽出する
  → タイトルにする（ルーブリック レベル2以上）
  → 例: 議事録から「副業市場は今、買い手市場になっている」を抽出

Step 2: 5W1Hで background を構築する
  → 誰の（Who）・どんな状況で（Where/When）・なぜこの発言が出たか（Why）
  → 業種・規模・期間・数値のうち最低2つを含める
  → 例: 「地方の製造業（従業員50名）が3年間求人しても応募ゼロ。
         ハローワークと求人誌のみで採用活動中」

Step 3: intent を「〜すること」の形で明文化する
  → 「何を変えたいか（before）」+「どう変えたいか（after）」を記述
  → 例: 「フルタイム採用への固執を外し、副業人材という選択肢を認知させること」

Step 4: keywords をユーザーの悩み言葉から5〜8語選定する
  → ソース素材中の原文ワード + 同義語 + 上位語
  → 例: ["地方製造業採用難", "応募ゼロ", "副業人材", "買い手市場",
         "ハローワーク限界", "中途採用代替"]

Step 5: source に出典を記録する
  → ファイル名・種別・日付・該当セクション

Step 6: §4.3 ルーブリックで自己検証する
  → 各フィールドがレベル2以上であることを確認
  → レベル1のフィールドがあれば書き直す
```

### 4.5 カテゴリ別追加フィールド

| カテゴリ | 追加フィールド |
|---------|-------------|
| `consultation` 系 | `situation`（相談者の現状）、`problem`（表面的な問題）、`advice`（アドバイス内容）、`key_insight`（普遍的な学び） |
| `mindset` 系 | `before`（転換前の思考）、`after`（転換後の思考）、`trigger`（転換が必要な状態） |
| `phase-advice` 系 | `focus`（最注力すべきこと）、`do`（推奨行動）、`dont`（避ける行動）、`key_question`（問い続ける問い） |
| `cases` 系 | `what_happened`（実際に起きた事実）、`key_learnings`（学び）、`outcome`（結果）、`key_factor`（成功/失敗要因） |

---

## 5. スタイルゲノム（ペルソナ系スキル）

ペルソナを再現するスキルでは `knowledge-style-genome.json` を作成し、以下を含める：

```json
{
  "category": "style-genome",
  "label": "{人名}スタイルゲノム（語り口・表現・ニュアンス）",
  "style_genome": {
    "persona_summary": "人物の概要・背景・話し方の特徴",
    "communication_style": {
      "energy_level": "熱量レベル",
      "tone": "口調の特徴",
      "pace": "テンポ・結論の出し方",
      "vocabulary_level": "使う言葉のレベル・特徴"
    },
    "sentence_structure_patterns": [
      {
        "pattern_name": "パターン名",
        "description": "どういう構造か",
        "example": "具体例"
      }
    ],
    "signature_phrases": ["シグネチャーフレーズ1", "シグネチャーフレーズ2"],
    "nuances": ["ニュアンス・注意点1", "ニュアンス・注意点2"],
    "emotion_triggers": {
      "excited": "興奮・熱量が上がる話題",
      "concerned": "懸念・警戒する状況",
      "passionate": "情熱的になる文脈"
    },
    "conversation_flow_patterns": {
      "answer": "回答のパターン（核心→事例→問い返し等）",
      "deepen": "問いを深めるパターン",
      "summarize": "成果物にまとめるパターン"
    },
    "output_style_for_documents": "文書化時のスタイル"
  },
  "items": [
    {
      "id": "style_001",
      "title": "コアな話し方",
      "keywords": ["語り口", "話し方", "スタイル"],
      "sakamoto_voice": "ペルソナの典型的な発言",
      "sakamoto_expressions": ["議事録直接引用1", "議事録直接引用2"],
      "message": "このスタイルの本質"
    }
  ]
}
```

---

## 6. エントリ品質チェックリスト

### 必須確認事項（全フィールド §4.3 ルーブリック レベル2以上）

- [ ] `id` が一意でフォーマットに準拠している（`{category}_{3桁連番}`）
- [ ] `title`/`content` が主語+動詞+目的語の1文で核心を表している（ルーブリック確認）
- [ ] `background` が業種・規模・期間・数値のうち最低2つを含む（ルーブリック確認）
- [ ] `intent`/`purpose` が「〜すること」の形で記述されている（ルーブリック確認）
- [ ] `keywords`/`tags` がソース原文+同義語+上位語で5〜8語ある（ルーブリック確認）
- [ ] `source` にファイル名・種別・日付が記録されている（ルーブリック確認）

### 推奨確認事項

- [ ] `root_cause`/`message` がある（本質・伝えるべきこと）
- [ ] `expected_outcome`/`achievable` がある（実践後の変化）
- [ ] `how_to_use`/`applications` がある（エージェントとしての活用方法）
- [ ] `related_items` に関連エントリIDが設定されている
- [ ] ペルソナ系は `sakamoto_expressions`/`quote` に直接引用がある

### 品質シグナル

> このエントリを読んだエージェントが、ユーザーの相談を受けた時に「どういう状況でどう使うか」が即座にイメージできるか？

### リグレッションテスト（エントリ追加/更新後）

エントリを追加・更新した後、以下の検証を行う：

1. **テストクエリ実行**: 追加したエントリに関連するクエリを3つ実行し、そのエントリが上位5件に含まれることを確認
2. **既存精度の維持**: 既存の代表的なクエリ3つを再実行し、結果が劣化していないことを確認
3. **インデックス整合性**: `build_index.js --stats` で整合性エラーがないことを確認


---

## 関連リソース

- **検索・ライフサイクル管理**: [knowledge-search-and-lifecycle.md](knowledge-search-and-lifecycle.md) — §7〜§12（分割・進化・検索・出力・更新・フィードバック）
- **スキル構造仕様**: [skill-structure.md](skill-structure.md)
- **命名規則**: [naming-conventions.md](naming-conventions.md)
- **実装例（Index-Search型）**: `.claude/skills/xLOCAL-sakamoto-mind-advisor/`
- **実装例（Router-Registry型）**: `.claude/skills/ubm-goal-setting/`
