# スキルフィードバックレポート: TASK-SW-FIX-UI-001

## 作成日: 2026-04-14

## 設計判断と採用理由

| 論点                | 採用した設計                          | 思考法         | 結論                                                                           |
| ------------------- | ------------------------------------- | -------------- | ------------------------------------------------------------------------------ |
| category の型表現   | `SkillCategory[]`（配列）             | 拡張性・一貫性 | null を排除し空配列で「未選択」を表現。null チェックが不要になり型安全性が向上 |
| トグルロジック      | `includes` + `filter` パターン        | 不変性・宣言的 | 配列をイミュータブルに操作。React の state 更新と親和性が高い                  |
| ProgressBar 計算    | `Math.max(1, answeredCount)`          | 最小驚き原則   | 0 問回答でも「質問 0/6」を表示しない。UX として自然                            |
| CSS 変数統一        | `--status-primary` / `--text-inverse` | 一元管理       | テーマ変更時に全ボタンが自動追従。ハードコード色の排除                         |
| 代表カテゴリ        | `resolvePrimarySkillCategory()`       | 後方互換       | 単一値を期待する API（trackEvent, buildSkillContext）との互換性を維持          |
| subpath export 方針 | サブパス内に閉じた変更                | 影響最小化     | ルート barrel を変更しないことで、他パッケージへの影響を排除                   |
| 視覚証跡            | screenshot manifest + console audit   | エビデンス化   | Phase 11 の 9 枚スクリーンショットと audit PASS を再確認できる                 |

## 実装パターンの評価

### 良かった点

- **`SkillCategory[]` への変更**: null を排除したことで、全ての比較ロジックが `.includes()` に統一され可読性が向上した
- **トグルロジック**: `filter()` + スプレッドの組み合わせは React の state 管理パターンとして定着しており、レビュアーにとっても理解しやすい
- **`Math.max(1, answeredCount)`**: 1 行で最小値保証を実現するシンプルな設計
- **CSS 変数統一**: `bg-blue-600` → `bg-[var(--status-primary)]` の変更により、将来のテーマ追加にも自動対応
- **subpath export 閉じ込め**: ルート barrel に手を入れないことで、影響範囲を `@repo/shared/types/skillCreator` の利用箇所に限定

### 注意点

- 破壊的型変更（`null` → `[]`）はテストファイルへの波及が大きい（計 8 テストファイル修正）。型エラーが出ない箇所（`as` キャスト）でランタイムエラーが発生するリスクがある
- `resolvePrimarySkillCategory()` で入力順依存を抑えたが、将来的に「主カテゴリ」を明示指定する要件が出る可能性は残る
