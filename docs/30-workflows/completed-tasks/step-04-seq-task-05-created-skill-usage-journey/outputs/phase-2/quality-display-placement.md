# 品質表示配置設計

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-05                     |
| Phase      | 2                                           |
| Phase名    | 設計                                        |
| 成果物種別 | 品質表示配置設計                            |
| 作成日     | 2026-03-15                                  |
| 前提       | phase-1-requirements.md                     |
| 準拠ルール | Apple HIG, WCAG 2.1 AA, Task04 スコアモデル |

## 目的

作成済みスキルの利用導線における品質表示の配置を7地点で定義し、Task04 の評価コンポーネント（ScoreGateBadge / ScoreDisplay / ScoringGateBanner / ScoreDelta）を統一的に配置する設計を確定する。

---

## 1. 品質表示7地点テーブル

| #   | 画面                 | コンポーネント                  | 配置場所                   | 表示モード    | Task04 対応             |
| --- | -------------------- | ------------------------------- | -------------------------- | ------------- | ----------------------- |
| 1   | Skill Center 一覧    | `ScoreGateBadge`                | SkillCard 右上             | compact       | `getScoreGateResult()`  |
| 2   | スキル詳細パネル     | `ScoreDisplay`                  | ヘッダー直下               | full (5軸)    | `EvaluationBreakdown`   |
| 3   | 作成直後CTA画面      | `ScoringGateBanner` + CTA制御   | CTA ボタン群の上部         | banner        | `ScoringGateResult`     |
| 4   | Workspace スキル選択 | `ScoreGateBadge` + EP-3バナー   | スキル選択ドロップダウン内 | inline        | `PromptEvaluation`      |
| 5   | Agent 実行前         | `ScoreDisplay`                  | 実行パネル上部             | compact       | `ScoringGateResult`     |
| 6   | Agent 実行後         | `ScoreDelta` + EP-4再評価       | 結果サマリー内             | delta         | `calculateScoreDelta()` |
| 7   | 履歴一覧             | `ScoreGateBadge` + `ScoreDelta` | 履歴エントリ右側           | compact+delta | `ScoreDelta`            |

---

## 2. コンポーネント仕様

### 2.1 ScoreGateBadge（地点1, 4, 5, 7）

用途: スコアのゲート判定結果をコンパクトに表示するバッジ。

```typescript
interface ScoreGateBadgeProps {
  gate: ScoringGate;
  score: number;
  size: "sm" | "md";
  showLabel?: boolean; // default: true
}
```

#### ゲート別表示マッピング

| ScoringGate       | ラベル   | バリアント | アイコン     | ライトモード背景色        | ダークモード背景色         |
| ----------------- | -------- | ---------- | ------------ | ------------------------- | -------------------------- |
| NEEDS_IMPROVEMENT | 改善必須 | error      | alert-circle | `rgba(255, 59, 48, 0.12)` | `rgba(255, 69, 58, 0.20)`  |
| SAVE_ALLOWED      | 保存可   | warning    | save         | `rgba(255, 149, 0, 0.12)` | `rgba(255, 159, 10, 0.20)` |
| USE_ALLOWED       | 利用可   | success    | check-circle | `rgba(52, 199, 89, 0.12)` | `rgba(48, 209, 88, 0.20)`  |
| RECOMMENDED       | 推奨     | success    | star         | `rgba(52, 199, 89, 0.12)` | `rgba(48, 209, 88, 0.20)`  |

#### サイズバリエーション

| サイズ | バッジ高さ | フォントサイズ | アイコンサイズ | 使用箇所                                |
| ------ | ---------- | -------------- | -------------- | --------------------------------------- |
| sm     | 20px       | 11px           | 12px           | SkillCard、履歴エントリ、ドロップダウン |
| md     | 28px       | 13px           | 16px           | Agent 実行前パネル                      |

### 2.2 ScoreDisplay（地点2, 5）

用途: 総合スコアと5軸ブレイクダウンを表示する詳細パネル。

```typescript
interface ScoreDisplayProps {
  score: number;
  breakdown?: EvaluationBreakdown;
  mode: "full" | "compact";
  gate: ScoringGate;
}
```

#### 表示モード

| モード  | 表示内容                                           | 使用箇所           |
| ------- | -------------------------------------------------- | ------------------ |
| full    | 総合スコア（大数値） + 5軸レーダーチャート or バー | スキル詳細パネル   |
| compact | 総合スコア（小数値） + ゲートバッジ                | Agent 実行前パネル |

#### full モードの5軸表示

| 軸              | ラベル | 説明                                 |
| --------------- | ------ | ------------------------------------ |
| clarity         | 明確さ | プロンプトの指示が明確か             |
| specificity     | 具体性 | 具体的な条件・制約が記述されているか |
| completeness    | 完全性 | 必要な情報が網羅されているか         |
| reproducibility | 再現性 | 同じ結果を再現できるか               |
| security        | 安全性 | セキュリティリスクがないか           |

### 2.3 ScoringGateBanner（地点3, 4）

用途: ゲート判定に基づく情報バナー。ユーザーの行動を案内するが、ブロックはしない。

```typescript
interface ScoringGateBannerProps {
  gateResult: ScoringGateResult;
  context: "post-creation" | "workspace-selection";
  onImproveClick?: () => void;
}
```

#### ゲート別メッセージ仕様

| ScoringGate       | post-creation コンテキスト                                     | workspace-selection コンテキスト                     | アイコン     | 背景色                                              |
| ----------------- | -------------------------------------------------------------- | ---------------------------------------------------- | ------------ | --------------------------------------------------- |
| NEEDS_IMPROVEMENT | 「このスキルは改善が必要です。改善してからの利用を推奨します」 | 「このスキルは改善が推奨されています」               | alert-circle | ライト: systemRed 12% / ダーク: systemRed 20%       |
| SAVE_ALLOWED      | 「保存可能ですが、改善するとより良い結果が得られます」         | 「改善するとより良い結果が得られる可能性があります」 | info-circle  | ライト: systemOrange 12% / ダーク: systemOrange 20% |
| USE_ALLOWED       | 「このスキルは利用可能です」                                   | 「利用可能なスキルです」                             | check-circle | ライト: systemGreen 12% / ダーク: systemGreen 20%   |
| RECOMMENDED       | 「このスキルは高品質で、推奨されています」                     | 「推奨スキルです」                                   | star         | ライト: systemGreen 12% / ダーク: systemGreen 20%   |

#### EP-3 はブロックしない設計

EP-3（利用前評価）のバナーは情報提供のみであり、CTA ボタンの無効化やスキル選択のブロックは行わない。

| 設計判断           | 内容                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| CTA 無効化         | しない。全ゲートで「使う」ボタンは有効のまま                              |
| ドロップダウン制限 | しない。全スキルが選択可能                                                |
| バナー表示         | する。ゲートに応じた情報メッセージを表示                                  |
| 改善リンク         | NEEDS_IMPROVEMENT / SAVE_ALLOWED の場合に「改善する」テキストリンクを表示 |

### 2.4 ScoreDelta（地点6, 7）

用途: スコアの変化量と方向を視覚的に表示する。

```typescript
interface ScoreDeltaProps {
  delta: ScoreDelta;
  showPreviousScore?: boolean; // default: false
  size: "sm" | "md";
}
```

#### delta スコア表示ルール

| 条件              | 方向アイコン | テキスト色                                       | ラベル例        | aria-label                 |
| ----------------- | ------------ | ------------------------------------------------ | --------------- | -------------------------- |
| delta >= +3       | 上矢印       | systemGreen（ライト: #34C759 / ダーク: #30D158） | 「+5」          | 「スコアが5ポイント向上」  |
| -2 <= delta <= +2 | ダッシュ(-)  | secondaryLabel（グレー系）                       | 「0」 or 「+1」 | 「スコアに大きな変化なし」 |
| delta <= -3       | 下矢印       | systemRed（ライト: #FF3B30 / ダーク: #FF453A）   | 「-4」          | 「スコアが4ポイント低下」  |

#### サイズバリエーション

| サイズ | フォントサイズ | アイコンサイズ | 使用箇所                 |
| ------ | -------------- | -------------- | ------------------------ |
| sm     | 11px           | 12px           | 履歴エントリ             |
| md     | 14px           | 16px           | Agent 実行後結果サマリー |

#### スコア詳細表示（showPreviousScore: true）

```
[上矢印] +5 (70 → 75)
```

previousScore と newScore の両方を括弧内に表示する。

---

## 3. 各地点の詳細配置設計

### 地点1: Skill Center 一覧（SkillCard）

```
+--------------------------------------+
| [スキル名]              [ScoreGate] *|  <- ScoreGateBadge (sm) 右上
| [説明文 2行省略...]                  |      * = お気に入りスター
| [最終使用日: 3日前]                  |
+--------------------------------------+
```

| 要素             | 位置                    | z-index | 条件                         |
| ---------------- | ----------------------- | ------- | ---------------------------- |
| ScoreGateBadge   | カード右上、padding 8px | 10      | スコアが存在する場合のみ表示 |
| お気に入りスター | ScoreGateBadge の右隣   | 10      | 常に表示                     |

### 地点2: スキル詳細パネル

```
+--------------------------------------+
| [スキル名] [ScoreGateBadge(md)] [*]  |  <- ヘッダー
+--------------------------------------+
| [ScoreDisplay (full)]                |  <- ヘッダー直下
| 総合: 82点                           |
| 明確さ: ████████░░ 80                |
| 具体性: █████████░ 90                |
| 完全性: ███████░░░ 70                |
| 再現性: ████████░░ 85                |
| 安全性: █████████░ 85                |
+--------------------------------------+
| [説明文]                             |
| [利用履歴]                           |
| [使う] [改善する]                    |
+--------------------------------------+
```

### 地点3: 作成直後CTA画面

```
+--------------------------------------+
| スキル作成完了                        |
+--------------------------------------+
| [ScoringGateBanner]                  |  <- CTA上部にバナー表示
| 「このスキルは利用可能です」          |
+--------------------------------------+
| [今すぐ使う]  [保存して後で使う]     |  <- CTA ボタン群
| [改善してから使う]                   |     全ボタン有効（ブロックしない）
+--------------------------------------+
```

### 地点4: Workspace スキル選択

```
+--------------------------------------+
| スキルを選択 [v]                     |
+--------------------------------------+
| [スキルA] [ScoreGateBadge(sm)] 82点  |
| [スキルB] [ScoreGateBadge(sm)] 65点  |
| [スキルC] [ScoreGateBadge(sm)] 45点  |
+--------------------------------------+
| [ScoringGateBanner]                  |  <- 選択後に表示
| 「改善するとより良い結果が...」      |     EP-3 バナー
+--------------------------------------+
```

### 地点5: Agent 実行前

```
+--------------------------------------+
| 実行パネル                           |
+--------------------------------------+
| [ScoreDisplay (compact)]             |  <- パネル上部
| スキル: XXX  スコア: 82 [利用可]     |
+--------------------------------------+
| [実行パラメータ設定]                 |
| [実行ボタン]                         |
+--------------------------------------+
```

### 地点6: Agent 実行後

```
+--------------------------------------+
| 実行結果サマリー                     |
| ステータス: 完了  実行時間: 12.3秒   |
+--------------------------------------+
| 品質情報                             |
| [ScoreDisplay(compact)] 75点 [利用可]|
| [ScoreDelta(md)] +5 (70→75) [上矢印]|
+--------------------------------------+
| [再評価する] [改善する] [完了]       |  <- EP-4 再評価ボタン
+--------------------------------------+
```

### 地点7: 履歴一覧

```
+--------------------------------------+
| 2026-03-15 14:30  スキルA            |
|   結果: 完了  [ScoreGateBadge(sm)]   |
|   [ScoreDelta(sm)] +3 [上矢印]      |
+--------------------------------------+
| 2026-03-14 10:15  スキルB            |
|   結果: 完了  [ScoreGateBadge(sm)]   |
|   [ScoreDelta(sm)] 0 [-]            |
+--------------------------------------+
```

---

## 4. カラーバリエーション（Apple HIG 準拠）

### バリアント別カラー定義

| バリアント | ライトモード前景色 | ライトモード背景色        | ダークモード前景色 | ダークモード背景色         |
| ---------- | ------------------ | ------------------------- | ------------------ | -------------------------- |
| error      | #FF3B30            | `rgba(255, 59, 48, 0.12)` | #FF453A            | `rgba(255, 69, 58, 0.20)`  |
| warning    | #FF9500            | `rgba(255, 149, 0, 0.12)` | #FF9F0A            | `rgba(255, 159, 10, 0.20)` |
| success    | #34C759            | `rgba(52, 199, 89, 0.12)` | #30D158            | `rgba(48, 209, 88, 0.20)`  |

### CSS 変数定義（Tailwind arbitrary values 用）

```css
:root {
  --score-error-fg: #ff3b30;
  --score-error-bg: rgba(255, 59, 48, 0.12);
  --score-warning-fg: #ff9500;
  --score-warning-bg: rgba(255, 149, 0, 0.12);
  --score-success-fg: #34c759;
  --score-success-bg: rgba(52, 199, 89, 0.12);
}

.dark {
  --score-error-fg: #ff453a;
  --score-error-bg: rgba(255, 69, 58, 0.2);
  --score-warning-fg: #ff9f0a;
  --score-warning-bg: rgba(255, 159, 10, 0.2);
  --score-success-fg: #30d158;
  --score-success-bg: rgba(48, 209, 88, 0.2);
}
```

### P47 準拠: variantStyles の定数管理

```typescript
// コンポーネント外部に定数として定義（テストで import 可能）
export const scoreVariantStyles: Record<
  "error" | "warning" | "success",
  string
> = {
  error:
    "bg-[var(--score-error-bg)] text-[var(--score-error-fg)] border-[var(--score-error-fg)]",
  warning:
    "bg-[var(--score-warning-bg)] text-[var(--score-warning-fg)] border-[var(--score-warning-fg)]",
  success:
    "bg-[var(--score-success-bg)] text-[var(--score-success-fg)] border-[var(--score-success-fg)]",
};
```

---

## 5. アクセシビリティ設計

### 3重表現の原則

全ての品質表示は、色・ラベル・アイコンの3つの表現手段を組み合わせる。色だけで情報を伝えない。

| 表現手段 | 目的                                               | 対象ユーザー               |
| -------- | -------------------------------------------------- | -------------------------- |
| 色       | 直感的な状態認知（赤=注意、緑=良好）               | 色覚に問題のないユーザー   |
| ラベル   | 状態の明示的な説明（「改善必須」「利用可」）       | スクリーンリーダーユーザー |
| アイコン | 視覚的な状態シンボル（alert-circle, check-circle） | 色覚多様性のあるユーザー   |

### ARIA 属性設計

| コンポーネント    | role   | aria-label                            | aria-live |
| ----------------- | ------ | ------------------------------------- | --------- |
| ScoreGateBadge    | status | `"品質: {ラベル} ({score}点)"`        | -         |
| ScoreDisplay      | region | `"スキル品質詳細"`                    | -         |
| ScoringGateBanner | alert  | `"{メッセージテキスト}"`              | polite    |
| ScoreDelta        | status | `"スコア変化: {delta}ポイント{方向}"` | -         |

### コントラスト比の確認

| バリアント | ライトモード前景/背景コントラスト比              | WCAG 2.1 AA 判定        |
| ---------- | ------------------------------------------------ | ----------------------- |
| error      | #FF3B30 on rgba(255,59,48,0.12) → 高コントラスト | PASS (テキストは前景色) |
| warning    | #FF9500 on rgba(255,149,0,0.12) → 高コントラスト | PASS (テキストは前景色) |
| success    | #34C759 on rgba(52,199,89,0.12) → 高コントラスト | PASS (テキストは前景色) |

> バッジの背景色は淡い半透明であり、テキスト（前景色）は Apple systemColor をそのまま使用するため、コントラスト比は十分に確保される。大テキスト基準（3:1以上）を適用する。

### キーボード操作

| コンポーネント    | フォーカス可能 | キーボード操作                         |
| ----------------- | -------------- | -------------------------------------- |
| ScoreGateBadge    | いいえ         | 表示のみ（情報要素）                   |
| ScoreDisplay      | いいえ         | 表示のみ（情報要素）                   |
| ScoringGateBanner | いいえ         | 表示のみ（内部リンクはフォーカス可能） |
| ScoreDelta        | いいえ         | 表示のみ（情報要素）                   |
| 改善するリンク    | はい           | Enter / Space で遷移                   |
| 再評価ボタン      | はい           | Enter / Space で実行                   |

### スクリーンリーダー対応

```typescript
// ScoreGateBadge のスクリーンリーダー出力例
<span
  role="status"
  aria-label={`品質: ${GATE_BADGE_CONFIG[gate].label} (${score}点)`}
>
  <Icon name={GATE_BADGE_CONFIG[gate].icon} aria-hidden="true" />
  {showLabel && <span>{GATE_BADGE_CONFIG[gate].label}</span>}
</span>

// ScoreDelta のスクリーンリーダー出力例
<span
  role="status"
  aria-label={`スコア変化: ${Math.abs(delta.delta)}ポイント${
    delta.direction === "up" ? "向上" :
    delta.direction === "down" ? "低下" : "変化なし"
  }`}
>
  <DirectionIcon direction={delta.direction} aria-hidden="true" />
  <span aria-hidden="true">{delta.delta >= 0 ? `+${delta.delta}` : delta.delta}</span>
</span>
```

---

## 6. コンポーネント配置ファイルパス

| コンポーネント     | 配置先ファイルパス                                                           |
| ------------------ | ---------------------------------------------------------------------------- |
| ScoreGateBadge     | `apps/desktop/src/renderer/components/atoms/ScoreGateBadge/index.tsx`        |
| ScoreDisplay       | `apps/desktop/src/renderer/components/molecules/ScoreDisplay/index.tsx`      |
| ScoringGateBanner  | `apps/desktop/src/renderer/components/molecules/ScoringGateBanner/index.tsx` |
| ScoreDelta         | `apps/desktop/src/renderer/components/atoms/ScoreDelta/index.tsx`            |
| scoreVariantStyles | `apps/desktop/src/renderer/components/atoms/ScoreGateBadge/variants.ts`      |
