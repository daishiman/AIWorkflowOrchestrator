# Phase 2 SubAgent分業計画

## 1. チーム編成（SubAgent-DESIGN-TEAM）

| SubAgent                | 関心ごと          | 入力                              | 出力                |
| ----------------------- | ----------------- | --------------------------------- | ------------------- |
| SubAgent-IMP-TOKENS     | Token反映監査     | SRC-T1/T5C/T6 + 00-1              | reflection-matrix行 |
| SubAgent-IMP-ATOMS      | Atoms反映監査     | SRC-T2/T4/T5 + 00-2               | reflection-matrix行 |
| SubAgent-IMP-MOLECULES  | Molecules反映監査 | SRC-T2/T3/T4/T5 + 00-3            | reflection-matrix行 |
| SubAgent-IMP-ORGANISMS  | Organisms反映監査 | SRC-T2/T4/T5 + 00-4               | reflection-matrix行 |
| SubAgent-IMP-SCREENS    | 画面仕様監査      | SRC-T3/T5B/T5C/T5D + 057〜061/030 | section-link-map行  |
| SubAgent-IMP-INTEGRATOR | 判定統合/課題化   | 全SubAgent出力                    | finding-log         |

## 2. 実行順序

1. 直列: マトリクス形式共有（Phase 2成果物を固定）
2. 並列: 仕様書別監査（6 SubAgent）
3. 直列: 判定統合と優先度決定

## 3. 重複防止ルール

- `audit_id + target_spec` を一意キーとする。
- 同一キーの重複はINTEGRATORが最終版のみ採用。
- 判定語彙は `反映済み/要追記/対象外` に限定。

## 4. コミュニケーション規約

- 共有フォーマット: Markdown表（Phase 2列定義に準拠）
- 証跡は `path:line` のみ受理
- 不明点は `判定保留` を禁止し、`要追記` で課題化

## 5. Phase 3レビュー入力

| レビュー観点       | 期待値 |
| ------------------ | ------ |
| SubAgent責務の重複 | 0件    |
| 判定語彙ゆれ       | 0件    |
| 証跡欠落           | 0件    |
| 例外処理漏れ       | 0件    |

## 6. Task 100% 実行確認

- [x] SubAgent責務を重複なく定義
- [x] 並列/直列工程を固定
- [x] 重複防止ルールを定義
- [x] Phase 3レビュー入力を明記
