# Apple HIG 準拠検証レポート — TASK-UI-00-ATOMS Phase 3

## カラー準拠

| 検証項目                                        | 結果                                                               |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| ステータスカラーが Apple System Colors に基づく | ✅ TASK-UI-00-TOKENS 経由で HIG 準拠                               |
| ダークモード配色がコントラスト基準を満たす      | ✅ 3テーマのトークン切替で対応                                     |
| 高彩度色を大面積に使わない                      | ✅ Badge/FilterChip は小面積、EmptyState welcoming は opacity 0.05 |
| Tailwind Slate を使用していない                 | ✅ CSS 変数ベースの中性灰を使用                                    |

## スペーシング準拠

| 検証項目                       | 結果   | 備考                                                         |
| ------------------------------ | ------ | ------------------------------------------------------------ |
| 8px グリッドでスペーシング統一 | ✅     | EmptyState compact p-5(20px) は HIG コンパクトモード許容範囲 |
| タッチターゲット最小 44px      | ⚠️ R-3 | SuggestionBubble sm=36px。`min-h-[44px]` で解決              |
| FilterChip 高さ                | ⚠️ R-4 | 具体的高さ未定義。`min-h-9`(36px) を適用                     |

## 角丸準拠

| 検証項目                                                 | 結果                             |
| -------------------------------------------------------- | -------------------------------- |
| ピル形状（`--radius-full`）が Apple Capsule Shape に準拠 | ✅                               |
| SkeletonCard `--radius-md` が 8px〜12px 範囲内           | ✅（TASK-UI-00-TOKENS 定義前提） |

## アニメーション準拠

| 検証項目                                         | 結果 |
| ------------------------------------------------ | ---- |
| StatusIndicator pulse: 200-300ms duration        | ✅   |
| SuggestionBubble hover: scale(1.02)〜scale(1.05) | ✅   |
| SkeletonCard pulse: 控えめで目障りでない         | ✅   |

## 判定

Apple HIG 準拠: **MINOR 2件** (R-3, R-4) — Phase 5 実装時に対応可能
