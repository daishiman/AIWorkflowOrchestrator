---
name: presentation-slide-generator
description: |
  HTMLプレゼンテーションスライドを生成するスキル。Kanagawaテーマ、GSAPアニメーション、23種類のスライドタイプ対応。ホバーエフェクト・ツールチップによるインタラクティブ機能、無料CDNアイコン（FontAwesome 6 Free推奨）、GASデプロイ可能な1ファイルHTML出力。

  Anchors:
  • Presentation Zen (Garr Reynolds) / 適用: スライド構成 / 目的: 1スライド1メッセージの原則
  • GSAP 3.x / 適用: アニメーション / 目的: スライドタイプ別enter/leaveアニメーション
  • Kanagawa Color Scheme / 適用: テーマ / 目的: 一貫したカラーパレット
  • FontAwesome 6 Free / 適用: アイコン / 目的: 無料CDN、2000+アイコン、ブランドロゴ対応

  Trigger:
  Use when user requests creating HTML presentation slides, generating slide decks, or building animated presentations with Kanagawa theme.
  プレゼン, スライド, プレゼンテーション, HTMLスライド, Kanagawa, 発表資料, presentation, slides
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---

# Presentation Slide Generator

## 概要

ユーザーの情報を元に、Kanagawaテーマで統一されたHTMLプレゼン資料を生成するスキル。**16:9アスペクト比を厳守**し、アイコン・図解・表形式を含む23種類のスライドタイプに対応。文章構成に連動したGSAPアニメーションで視覚的インパクトを最大化する。

## 16:9アスペクト比（必須制約）

**すべてのスライドは16:9アスペクト比を厳守すること。**

- プロジェクター/ディスプレイでの正しい表示を保証
- 異なるウィンドウサイズでもレターボックス/ピラーボックスで対応
- PDF出力時も一貫したレイアウトを維持

### 必須HTML構造

```html
<div class="slider" id="slider">
  <div class="slide-area">
    <!-- 16:9強制コンテナ -->
    <div class="slider__container">
      <!-- スライドHTML -->
    </div>
  </div>
</div>
```

### 検証コマンド

```bash
# 16:9アスペクト比の検証
node scripts/verify-slides.mjs ./index.html --check-ratio
```

## ワークフロー

### Phase 1: ヒアリング

**目的**: プレゼン作成に必要な情報を漏れなく収集

**アクション**:

1. タイトル・目的・対象者・発表時間を確認
2. キーメッセージを特定
3. コンテンツ素材（テキスト/箇条書き/データ）を受領
4. 希望するアイコンスタイルを確認（デフォルト: FontAwesome）
5. 情報を整理して次フェーズへ引き継ぎ

**Task**: `agents/hearing-facilitator.md` を参照

### Phase 2: 構成設計 & 構造化データ出力

**目的**: 情報を最適なスライドタイプに分解し、**完全な構造化データを先に出力**する

**アクション**:

1. 情報を1メッセージ単位に分解
2. 各情報のスライドタイプを判定（15種から選択）
3. 各スライドのアイコンを選定
4. アニメーションパターンを決定
5. **structure.md（構造化データ）を出力**
6. ユーザーに構造化データを確認してもらう
7. 承認後にPhase 3へ進む

**重要**: HTML生成前に必ず構造化データを出力し、ユーザー確認を得ること。
これにより修正が容易になり、手戻りを最小化できる。

**Task**: `agents/structure-designer.md` を参照

### Phase 3: HTML生成

**目的**: **承認済み**の構成案を高品質HTMLプレゼンに変換

**前提条件**: Phase 2でstructure.mdが出力され、ユーザー承認を取得していること

**アクション**:

1. structure.mdを読み込み
2. Kanagawaテーマ定義を適用
3. スライドタイプ別テンプレートを生成
4. テキストレイアウトガイドラインを適用（改行・フォント・配置）
5. GSAPアニメーションを実装
6. ナビゲーション・プログレスバーを実装
7. 1ファイルHTMLとして出力
8. **Phase 3.5（検証）へ進む**

**Task**: `agents/html-generator.md` を参照

### Phase 3.5: 視覚検証（自動）

**目的**: 生成したスライドのレイアウト問題を自動検出・修正

**アクション**:

1. `scripts/verify-slides.mjs` でスクリーンショット撮影
2. 各スライドの問題を視覚的に確認:
   - テキスト切れ（カード・ボックス内でオーバーフロー）
   - 不自然な改行（意味の切れ目以外での改行）
   - 画像・図解の表示崩れ
3. 問題発見時は即座に修正:
   - CSS調整（幅・フォントサイズ・overflow）
   - テキスト簡略化・`<br>`タグ位置調整
   - 再スクリーンショットで修正確認
4. 全スライド問題なしを確認後、GASデプロイ手順を案内

**検証スクリプト使用例**:

```bash
node scripts/verify-slides.mjs ./index.html ./screenshots
```

**よくある問題と対処法**:

| 問題         | 原因                 | 対処法                                    |
| ------------ | -------------------- | ----------------------------------------- |
| テキスト切れ | カード幅不足         | `max-width`拡大、`font-size`縮小          |
| 不自然な改行 | 固定幅内での自動改行 | テキスト簡略化、`<br>`明示挿入            |
| 統計値切れ   | 大きなフォントサイズ | `--fs-heading`使用、`white-space: nowrap` |
| 画像切れ     | コンテナサイズ不足   | `max-width`/`max-height`調整              |

**Task**: `agents/html-generator.md` を参照（検証セクション）

### Phase 4: 改善・修正（オプション）

**目的**: 既存スライドの改善・修正を効率的に実施

**アクション**:

1. 既存structure.mdを読み込み
2. ユーザー修正要求を分析
3. 影響範囲と修正内容を設計
4. 修正案を提示しユーザー承認を取得
5. HTMLを再生成（該当部分または全体）
6. structure.mdの修正履歴を更新

**Task**: `agents/slide-modifier.md` を参照

**発動条件**: 既存のスライド（structure.md）が存在し、修正要求がある場合

### Phase 5: PDF出力（配布用・オプション）

**目的**: スライドを印刷・配布用PDFとして出力

**発動条件**: ユーザーがPDF出力、印刷用、配布用を要求した場合

**アクション**:

1. ブラウザで印刷プレビューを開く（Cmd/Ctrl + P）
2. 「PDFとして保存」を選択
3. 印刷設定で「背景のグラフィック」を有効化
4. PDFファイルを出力

**詳細仕様**: See [references/print-layout.md](references/print-layout.md)

## Task仕様（ナビゲーション）

| Task                | 起動タイミング                      | 入力                    | 出力                            |
| ------------------- | ----------------------------------- | ----------------------- | ------------------------------- |
| hearing-facilitator | Phase 1開始時                       | ユーザー初期入力        | ヒアリング結果                  |
| structure-designer  | Phase 2開始時                       | ヒアリング結果          | structure.md（構造化データ）    |
| html-generator      | Phase 3開始時（構成案承認後）       | structure.md            | HTMLファイル + デプロイ手順     |
| visual-verification | Phase 3.5（HTML生成後自動実行）     | index.html              | スクリーンショット + 修正済HTML |
| slide-modifier      | Phase 4開始時（既存スライド修正時） | structure.md + 修正要求 | 更新されたHTML + structure.md   |

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照

## スライドタイプ

### 基本タイプ（15種）

| タイプ       | 用途                      | アニメーション特徴         |
| ------------ | ------------------------- | -------------------------- |
| タイトル     | 冒頭のタイトルスライド    | scale + rotation           |
| アジェンダ   | 発表全体のアジェンダ表示  | stagger x軸移動            |
| セクション   | 各セクションの冒頭見出し  | scale + y軸移動            |
| メッセージ   | 1つの主張・結論           | y軸移動 + fade             |
| リスト       | アイコン付き箇条書き      | stagger x軸移動            |
| 比較         | 2-4項目の対比表示         | 左右から同時出現           |
| フロー       | ステップ・プロセス図解    | stagger scale + 矢印アニメ |
| タイムライン | 時系列表示                | stagger y軸 + ラインdraw   |
| テーブル     | データ表形式              | 行ごとstagger fade         |
| 統計         | 大きな数字を強調表示      | scale + グラデーション     |
| チャート     | 棒グラフ・円グラフ        | scaleY + rotation          |
| 図解         | サークル・ピラミッド型    | stagger scale              |
| 引用         | 印象的な引用文            | y軸移動 + fade             |
| 画像         | 画像+テキスト（左右配置） | x軸移動 + stagger          |
| フルイメージ | 全画面背景画像            | y軸移動 + fade             |

### 拡張タイプ（8種）

| タイプ           | クラス名          | 用途                       | アニメーション特徴       |
| ---------------- | ----------------- | -------------------------- | ------------------------ |
| ピラミッド       | `slide-pyramid`   | 階層構造（上→下に広がる）  | scaleX展開               |
| サークル         | `slide-circle`    | 中心+周辺要素の関係        | 中心→周辺順にscale       |
| グリッド         | `slide-grid`      | 2x2〜4x4カードレイアウト   | stagger scale + y移動    |
| ハイライト       | `slide-highlight` | 1つの重要値/メッセージ強調 | scale + グラデーション   |
| アイコングリッド | `slide-icon-grid` | アイコン主体の一覧表示     | stagger rotation + scale |
| プロセス（縦）   | `slide-process`   | 縦方向ステップ表示         | stagger x移動            |
| 引用（拡張）     | `slide-quote`     | 引用文+著者情報            | mark rotation + y移動    |
| ヒーロー         | `slide-hero`      | グラデーション背景+CTA     | badge→title→cta順        |

**詳細仕様**: See [references/slide-components.md](references/slide-components.md)

## ホバーエフェクト・ツールチップ

スライド要素にインタラクティブなフィードバックを追加し、聴衆の注目を集める機能。

### ホバーエフェクト

| 対象要素       | エフェクト                      | 用途               |
| -------------- | ------------------------------- | ------------------ |
| リストアイテム | 右移動 + 拡大 + 影              | 項目への注目       |
| 比較カード     | 上移動 + 拡大 + 影              | カード選択の視覚化 |
| フローステップ | 拡大 + 背景変化 + 影            | ステップへの注目   |
| テーブル行     | 背景ハイライト + テキスト色変化 | 行選択の視覚化     |
| 統計カード     | 上移動 + 拡大 + 影 + 値スケール | 数値への注目       |
| アイコン       | 拡大 + 回転 + 色変化            | アイコンへの注目   |

### ツールチップ

要素にマウスを合わせると補足情報を表示。

**使用方法**:

```html
<div class="stat-item has-tooltip" data-tooltip="補足説明テキスト">
  <span class="stat-value">60万円</span>
</div>
```

**バリエーション**:

- `has-tooltip` - 上向きツールチップ（デフォルト）
- `has-tooltip has-tooltip-bottom` - 下向きツールチップ

**詳細仕様**: See [references/slide-components.md](references/slide-components.md)（セクション4: ホバーエフェクト）

## ベストプラクティス

### すべきこと

- 1スライド1メッセージの原則を守る
- **index.htmlを修正したら必ずstructure.mdも同期更新する**
- 全ての情報にアイコンまたは図解を付与
- 3項目以上の列挙は図解または表形式を使用
- プロセス説明にはフローチャートを使用
- 構成案はユーザー承認後にHTML生成へ進む
- Kanagawaテーマのカラーパレットを一貫して使用
- 重要な数値・項目にはツールチップで補足情報を追加

### 避けるべきこと

- 1スライドに複数メッセージを詰め込まない
- **index.htmlとstructure.mdを非同期状態にしない**
- 外部ファイル参照（CDN以外）を含めない
- 承認なしでHTML生成に進まない
- アイコンなしのテキストのみスライド
- 定義外のスライドタイプを使用しない
- ツールチップの過度な使用（重要箇所のみに限定）

## index.html ⇔ structure.md 同期ルール

**重要**: 両ファイルは常に整合性を維持すること。

```
【HTML修正時】
index.html 修正 → structure.md 該当セクション更新 → 修正履歴追記

【構成変更時】
structure.md 修正 → ユーザー承認 → index.html 再生成
```

非同期状態になると、次回修正時に意図しない結果になる。

## テキストレイアウトガイドライン

### フォントサイズ

**必須**: インラインスタイルでfont-sizeを指定せず、CSS変数を使用する

| 用途         | CSS変数                | 説明                 |
| ------------ | ---------------------- | -------------------- |
| タイトル     | `var(--fs-title)`      | メインタイトル用     |
| サブタイトル | `var(--fs-subtitle)`   | 副題用               |
| 見出し       | `var(--fs-heading)`    | スライドタイトル用   |
| 小見出し     | `var(--fs-subheading)` | セクション内見出し用 |
| 本文         | `var(--fs-body)`       | 通常テキスト用       |
| 大きめ本文   | `var(--fs-body-lg)`    | 強調テキスト用       |
| 小さめ文字   | `var(--fs-small)`      | 補足・注釈用         |

**ユーティリティクラス**:

- `.text-note` - 注釈・補足テキスト（グレー色付き）
- `.text-emphasis` - 強調テキスト
- `.text-caption` - キャプション・説明文

### 改行位置

**原則**: 1行が長くなりすぎないよう、意味の切れ目で`<br>`タグを挿入

**改行すべき箇所**:

1. 20文字を超える文章の意味的な区切り
2. 読点「、」の後（文脈に応じて）
3. 括弧で囲まれた説明の前後
4. 強調（`<strong>`）の前後で区切りが自然な場合

**例**:

```html
<!-- NG: 長すぎて変な位置で自動改行される -->
<span>テンプレートを使えば、こんなに楽に高品質な文書が作れるを体感する</span>

<!-- OK: 意味の切れ目で明示的に改行 -->
<span
  >テンプレートを使えば、<br />こんなに楽に高品質な文書が作れるを体感する</span
>
```

### 配置（アラインメント）

| スライドタイプ | テキスト配置     | 理由               |
| -------------- | ---------------- | ------------------ |
| タイトル       | 中央揃え         | インパクト重視     |
| メッセージ     | 中央揃え         | 1メッセージの強調  |
| リスト         | 左揃え           | 読みやすさ         |
| 比較           | 各パネル内左揃え | 比較のしやすさ     |
| フロー         | 中央揃え         | ステップの視認性   |
| テーブル       | 左揃え           | データの読みやすさ |
| セクション     | 中央揃え         | 区切りの明確化     |

## リソース参照

### references/（責務別ガイドライン）

| リソース               | パス                                                                           | 責務                                                                            |
| ---------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 構成戦略               | See [references/strategy.md](references/strategy.md)                           | 相手分析・目的設定・BSEC構成・ボリューム設計                                    |
| ライティング           | See [references/writing-rules.md](references/writing-rules.md)                 | タイトル・メッセージ・箇条書き・文章表現                                        |
| レイアウト・ビジュアル | See [references/layout-visual.md](references/layout-visual.md)                 | レイアウト法則・分割パターン・図形・矢印・余白・統一感                          |
| 図解・グラフ           | See [references/diagram-chart.md](references/diagram-chart.md)                 | 14種の図解タイプ・グラフ選択・データ可視化                                      |
| スライドコンポーネント | See [references/slide-components.md](references/slide-components.md)           | 全23種のスライドタイプ・CSS・HTMLテンプレート・ホバーエフェクト・アニメーション |
| テーマ・スタイル       | See [references/theme-style.md](references/theme-style.md)                     | カラーパレット・CSS変数・共通スタイル・アニメーション速度                       |
| アイコン               | See [references/icons.md](references/icons.md)                                 | アイコンライブラリ・マッピングテーブル・使用方法                                |
| 印刷レイアウト         | See [references/print-layout.md](references/print-layout.md)                   | PDF出力・印刷用CSS・シンプル方式                                                |
| LLM/Script責務分離     | See [references/llm-script-separation.md](references/llm-script-separation.md) | 決定論的処理と創造的処理の分離                                                  |

### scripts/（決定論的処理）

| スクリプト                         | 用途                   | 使用例                                                       |
| ---------------------------------- | ---------------------- | ------------------------------------------------------------ |
| `verify-slides.mjs`                | スライド検証           | `node scripts/verify-slides.mjs ./index.html`                |
| `verify-slides.mjs --cleanup`      | スクリーンショット削除 | `node scripts/verify-slides.mjs ./index.html --cleanup`      |
| `verify-slides.mjs --auto-cleanup` | 検証後自動削除         | `node scripts/verify-slides.mjs ./index.html --auto-cleanup` |
| `validate-structure.mjs`           | 構成案検証（23種対応） | `node scripts/validate-structure.mjs structure.json`         |
| `log_usage.mjs`                    | フィードバック記録     | `node scripts/log_usage.mjs --result success`                |

## LLM/Script 責務分離

曖昧性を排除し、再現性を高めるため、処理を「LLM担当」と「Script担当」に明確に分離する。

**詳細仕様**: See [references/llm-script-separation.md](references/llm-script-separation.md)

### assets/（テンプレート）

| テンプレート          | 用途                   |
| --------------------- | ---------------------- |
| `slide-template.html` | 完全なHTMLテンプレート |
| `gas-deploy-guide.md` | GASデプロイ手順書      |

## 出力ディレクトリ構成

スライドは以下の命名規則で出力：

```
05_Project/
└── スライド/
    └── slide-YYYY-MM-DD-{タイトル}/
        ├── index.html      # プレゼンテーション本体
        ├── structure.md    # 構造化データ（改善・修正用）
        └── deploy-guide.md # GASデプロイ手順（同梱ドキュメント）
```

### structure.md（構造化データ）

スライドの改善・修正に使用する構造化データ。以下の情報を含む：

- **メタ情報**: タイトル、目的、対象者、発表時間、生成日時
- **スライド一覧**: 各スライドのタイプ、メッセージ、アイコン、アニメーション
- **各スライド詳細**: コンテンツの全文、図解構造、使用カラー
- **修正履歴**: 修正があれば記録

**フォーマット**: See [assets/structure-template.md](assets/structure-template.md)

## ワークフロー図

```
【新規作成フロー】
User Request → Phase 1 (hearing-facilitator) → Phase 2 (structure-designer)
                                                        ↓
                                              Output: structure.md（構造化データ）
                                                        ↓
                                              [User Review & Approval]
                                                        ↓
                                              Phase 3 (html-generator)
                                                        ↓
                                              Output: index.html
                                                        ↓
                                              Phase 3.5 (visual-verification)
                                                        ↓
                                              スクリーンショット撮影 → 問題検出 → 修正
                                                        ↓
                                              [整合性確認] index.html ⇔ structure.md 同期
                                                        ↓
                                              Output: 検証済み index.html + 同期済み structure.md

【修正・改善フロー】
Existing structure.md + Modification Request → Phase 4 (slide-modifier)
                                                        ↓
                                              Output: Updated structure.md
                                                        ↓
                                              [User Review & Approval]
                                                        ↓
                                              Phase 3 (html-generator) 再実行
                                                        ↓
                                              Phase 3.5 (visual-verification)
                                                        ↓
                                              [整合性確認] index.html ⇔ structure.md 同期
                                                        ↓
                                              Output: Updated index.html + 同期済み structure.md

※ 構造化データを先に出力・確認することで、手戻りを最小化
※ 視覚検証により、テキスト切れ・改行問題を自動検出・修正
※ 【重要】HTMLを修正したら必ずstructure.mdにも反映（整合性維持必須）
```

## index.html ⇔ structure.md 整合性維持（必須）

**原則: index.htmlとstructure.mdは常に同期を維持すること。**

両ファイルが整合していない場合、次回の修正時に意図しない結果になり、変更追跡が困難になる。

### 同期ルール

| HTMLの変更        | structure.mdに反映すべき内容        |
| ----------------- | ----------------------------------- |
| テキスト変更      | 該当スライドのメッセージ/コンテンツ |
| タイプ変更        | スライドタイプ、アニメーション      |
| アイコン変更      | 使用アイコン情報                    |
| レイアウト調整    | 調整内容をスライド詳細に記録        |
| スライド追加/削除 | スライド一覧を全更新                |

### 同期タイミング

1. **HTML修正後**: 修正内容をstructure.mdに即座に反映
2. **視覚検証での修正後**: 調整内容をstructure.mdに記録
3. **修正完了時**: structure.mdの修正履歴に変更内容を追記

**Task参照**: `agents/html-generator.md` セクション4.5、`agents/slide-modifier.md` セクション4.5

## 変更履歴

| Version | Date       | Changes                                                                                                                                                                                                                                                                 |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.5.0   | 2026-01-07 | **整合性維持ルール強化**: index.html⇔structure.md同期必須をワークフロー図とSKILL.mdに明示追加、同期ルール・タイミング詳細化                                                                                                                                             |
| 2.4.0   | 2026-01-07 | **16:9アスペクト比の厳格化**: slide-area要素追加、CSS変数による16:9強制、verify-slides.mjsに--check-ratioオプション追加、全ドキュメント更新                                                                                                                             |
| 2.3.0   | 2026-01-04 | 印刷CSS刷新（シンプル方式採用、コンテンツ消失問題修正）、print-layout.md更新、LLM/Script責務分離をreferences/に外部化、SKILL.md 500行以内に最適化                                                                                                                       |
| 2.2.0   | 2026-01-03 | LLM/Script責務分離セクション追加、validate-structure.mjs 23種対応、icons.md 18カテゴリ拡張、slide-components.md ホバー詳細追加、agents参照先統一                                                                                                                        |
| 2.1.0   | 2026-01-03 | リファレンス再構成（責務別7ファイルに統合）：strategy.md（構成戦略）、writing-rules.md（ライティング）、layout-visual.md（レイアウト）、diagram-chart.md（14種図解・グラフ）、slide-components.md（スライドタイプ統合）、theme-style.md（テーマ）、icons.md（アイコン） |
| 2.0.0   | 2026-01-03 | ホバーエフェクト・ツールチップ追加、拡張スライドタイプ8種追加（ピラミッド、サークル、グリッド等）、スクリーンショット削除機能追加                                                                                                                                       |
| 1.8.0   | 2026-01-03 | Phase 3.5（視覚検証）追加、verify-slides.mjsスクリプト追加                                                                                                                                                                                                              |
| 1.7.0   | 2026-01-03 | テキストレイアウトガイドライン追加（フォントCSS変数化、改行位置、配置ルール）                                                                                                                                                                                           |
| 1.6.0   | 2026-01-03 | ワークフロー変更：構造化データを先に出力→ユーザー確認→HTML生成の順に変更                                                                                                                                                                                                |
| 1.5.0   | 2026-01-02 | 追加スライドタイプ（統計、チャート、図解、引用、画像、フルイメージ）、画像対応                                                                                                                                                                                          |
| 1.4.0   | 2026-01-02 | アジェンダ・セクションヘッダースライド追加、デプロイガイド同梱出力                                                                                                                                                                                                      |
| 1.3.0   | 2026-01-02 | Phase 4（改善・修正フロー）を追加、slide-modifier.md新規作成                                                                                                                                                                                                            |
| 1.2.0   | 2026-01-02 | 構造化データ（structure.md）出力を追加                                                                                                                                                                                                                                  |
| 1.1.0   | 2026-01-02 | Flaticon API言及を削除、無料CDNライブラリに統一                                                                                                                                                                                                                         |
| 1.0.0   | 2026-01-02 | 初版作成                                                                                                                                                                                                                                                                |
