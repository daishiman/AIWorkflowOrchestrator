# Task仕様書：AI UX 3層評価

> **読み込み条件**: Phase 11（手動テスト）で UI/UX 評価実行時
> **相対パス**: `agents/evaluate-ui-ux.md`

## 1. メタ情報

| 項目     | 内容                                        |
| -------- | ------------------------------------------- |
| 名前     | Don Norman                                  |
| 専門領域 | ユーザビリティ工学、アクセシビリティ、UX 評価 |
| Task種別 | LLM Task                                    |

> 注記: 「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Don Normanは『The Design of Everyday Things』の著者として、ユーザー中心設計の原則を体系化した。
彼のアプローチは、ユーザーの認知負荷を最小化し、アフォーダンスとフィードバックの質を
体系的に評価することで、直感的な操作体験を実現することを重視する。

### 2.2 目的

Electron デスクトップアプリの UI スクリーンショットを 3 層の観点で評価し、
ユーザビリティ問題・アクセシビリティ懸念・改善提案を構造化された JSON 形式で出力する。
HIGH 重要度の問題は自動的に `unassigned-task/` として生成し、フィードバックループを閉じる。

### 2.3 責務

| 責務                  | 成果物                                  |
| --------------------- | --------------------------------------- |
| スクリーンショット分析 | ユーザビリティ問題リスト                |
| WCAG 2.1 AA 準拠確認  | アクセシビリティ懸念リスト              |
| 改善提案の策定        | 優先度付き改善提案（最大 5 件）         |
| フィードバック生成    | `ai-ux-evaluation.md` + unassigned-task |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント                     | 適用方法                              |
| ------------------------------------- | ------------------------------------- |
| The Design of Everyday Things (Norman) | アフォーダンス・フィードバック原則    |
| WCAG 2.1 AA 基準                      | アクセシビリティ評価の基準            |
| Nielsen's 10 Usability Heuristics     | ユーザビリティ問題の分類・重要度判定  |

### 3.2 スキーマ・リソース参照

| リソース                | パス                                                  | 用途             |
| ----------------------- | ----------------------------------------------------- | ---------------- |
| 3層評価テンプレート     | references/phase-11-test-report-template.md           | 結果記録フォーマット |
| スクリーンショットガイド | references/phase-11-screenshot-guide.md               | 撮影ルール       |
| 未完了タスクテンプレート | assets/unassigned-task-template.md                    | HIGH問題のタスク化 |
| 評価メインスクリプト    | scripts/evaluate-ui-ux.js                              | CLI エントリポイント |
| スクリーンショット処理  | scripts/evaluate-ui-ux-screenshot.js                   | base64 エンコード |
| プロンプトローダー      | scripts/evaluate-ui-ux-prompt-loader.js                | エージェント仕様書からプロンプト読込 |
| レポート生成            | scripts/evaluate-ui-ux-report-formatter.js             | Markdown レポート出力 |
| タスク自動生成          | scripts/evaluate-ui-ux-unassigned-task.js              | HIGH 問題の unassigned-task 生成 |
| Playwright E2E          | scripts/evaluate-ui-ux-playwright-e2e.ts               | 層1・層2 自動テスト |
| 型定義                  | scripts/evaluate-ui-ux-types.d.ts                      | JSDoc 型参照 |
| プロンプト定義          | agents/evaluate-ui-ux.md (本ファイル §4.2)             | API 送信プロンプト |

> Progressive Disclosure:
> - スクリーンショットガイドは撮影時に読み込む
> - テンプレートは結果記録時に読み込む

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                                       |
| -------- | ---------------------------------------------------------------- |
| 1        | 対象画面のスクリーンショットを `outputs/phase-11/screenshots/` に配置 |
| 2        | 層1: Playwright `_electron` で Semantic テスト（ARIA, tabindex, keyboard） |
| 3        | 層2: `toHaveScreenshot()` で Visual regression テスト            |
| 4        | 層3: Claude API でスクリーンショットの UX 評価                   |
| 5        | 評価結果を `outputs/phase-11/ai-ux-evaluation.md` に記録        |
| 6        | HIGH 重要度の問題を `unassigned-task/` に自動生成                |

### 4.2 評価プロンプト

このUIのスクリーンショットを評価してください。対象: {{taskContext}}

以下の観点で評価し、JSON形式で出力してください：

1. ユーザビリティ問題（usabilityIssues）
   - 操作しにくい箇所
   - 視認性の低い要素
   - 直感的でない操作フロー
   - ボタンやリンクの適切なサイズ（最小 44x44px）
   - 一貫性のないインタラクションパターン

2. アクセシビリティ懸念（accessibilityConcerns）
   - WCAG 2.1 AA 準拠チェック
   - コントラスト比が 4.5:1 未満の要素
   - スクリーンリーダー対応の問題（alt テキスト欠如、aria-label 欠如）
   - キーボードナビゲーションの問題（フォーカストラップ、Tab 順序）
   - フォーカス表示の視認性

3. 改善提案（improvements）
   - 優先度順で最大5件
   - 具体的な修正方法を含める

出力フォーマット:

```json
{
  "usabilityIssues": [
    { "id": "UX-001", "description": "...", "severity": "HIGH|MEDIUM|LOW" }
  ],
  "accessibilityConcerns": [
    {
      "id": "A11Y-001",
      "concern": "...",
      "wcagCriteria": "1.x.x",
      "severity": "HIGH|MEDIUM|LOW"
    }
  ],
  "improvements": [
    { "priority": 1, "suggestion": "...", "effort": "LOW|MEDIUM|HIGH" }
  ]
}
```

### 4.3 重要度基準

| 重要度 | 定義                                                     | 例                                             | アクション                    |
| ------ | -------------------------------------------------------- | ---------------------------------------------- | ----------------------------- |
| HIGH   | ユーザーの操作を妨げる、またはアクセシビリティ基準に違反 | フォーカストラップ、コントラスト比不足         | unassigned-task 自動生成      |
| MEDIUM | UX を損なうが回避策がある                                | 非直感的なラベル、一貫性のないスペーシング     | レポートに記録、次タスクで参照 |
| LOW    | 改善すると良いが機能に影響しない                         | 微小なアライメントずれ、フォントサイズの最適化 | レポートに記録のみ            |

### 4.4 ビジネスルール（制約）

| 制約                    | 説明                                                         |
| ----------------------- | ------------------------------------------------------------ |
| Phase 11 必須実行       | 3 層すべてを実行する（層 3 は API キー必須）                 |
| HIGH は即 unassigned    | HIGH 重要度の問題は必ず `unassigned-task/` にファイル生成    |
| 冪等性                  | 同一スクリーンショットに対して同一結果を保証                 |
| コスト上限              | 1 回の評価で 10 枚以下のスクリーンショットを推奨（約 $0.18） |
| ベースライン初回生成    | Visual テストは初回 `--update-snapshots` でベースライン生成  |

---

## 5. インターフェース

### 5.1 入力

**実行タイミング**: Phase 11（手動テスト）で実行。

| データ名             | 提供元                          | 検証ルール            | 欠損時処理         |
| -------------------- | ------------------------------- | --------------------- | ------------------ |
| スクリーンショット   | outputs/phase-11/screenshots/   | PNG ファイルが存在    | エラー終了         |
| タスクコンテキスト   | artifacts.json                  | taskId が存在         | デフォルト ID 使用 |
| ANTHROPIC_API_KEY    | 環境変数                        | 非空文字列            | エラー終了         |

### 5.2 出力

| 成果物名              | 配置先                            | 内容                                     |
| --------------------- | --------------------------------- | ---------------------------------------- |
| AI UX 評価レポート    | outputs/phase-11/ai-ux-evaluation.md | 問題・懸念・提案のテーブル形式レポート |
| unassigned-task       | unassigned-task/ui-ux-issue-*.md  | HIGH 問題の改善タスク指示書              |
| 3 層評価結果          | outputs/phase-11/manual-test-result.md | テンプレートに従った結果記録          |

### 5.3 実行コマンド

```bash
# 層1 + 層2: Playwright E2E テスト
npx playwright test --config .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts

# 層3: AI UX 評価
node .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js \
  --screenshot "outputs/phase-11/screenshots/*.png" \
  --output outputs/phase-11 \
  --task-id TASK-UIUX-FEEDBACK-001
```

---

## 6. 補足

### 6.1 3 層評価の対応関係

| 層             | ツール                  | 対象                         | 自動化レベル |
| -------------- | ----------------------- | ---------------------------- | ------------ |
| 層1: Semantic  | Playwright `_electron`  | ARIA, role, tabindex, keyboard | 完全自動     |
| 層2: Visual    | `toHaveScreenshot()`    | ピクセル差分（閾値 50px）    | 完全自動     |
| 層3: AI UX     | Claude API              | ユーザビリティ・A11y 総合    | 半自動       |

### 6.2 フィードバックループ

```
Phase 11 実行
  → 層1-3 テスト実行
  → ai-ux-evaluation.md 生成
  → HIGH 問題 → unassigned-task/ 自動生成
  → 次タスク Phase 2 で参照
  → 改善実装
  → 次回 Phase 11 で再評価
```
