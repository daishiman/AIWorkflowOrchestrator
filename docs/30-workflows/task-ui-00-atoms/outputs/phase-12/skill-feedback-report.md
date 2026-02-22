# スキルフィードバックレポート -- TASK-UI-00-ATOMS

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| タスクID | TASK-UI-00-ATOMS                           |
| 報告日   | 2026-02-23                                 |
| Phase    | 12                                         |
| 実行方式 | Phase 1-11 直列実行、Phase 12 並列Task実行 |

## 1. タスク仕様書品質評価

### 良かった点

1. **Phase 1 の要件定義が非常に詳細**: 各コンポーネントの機能要件が要件ID付き（SI-F-01等）で定義されており、Phase 5 実装時に曖昧さなくコーディングできた。特にステータスカラーマッピング表、ARIA属性マトリクス、デザイントークン依存マトリクスが3つの軸（カラー・アクセシビリティ・トークン）で網羅されていた点が優れていた

2. **後方互換性要件の明示**: Badge 17テスト・EmptyState 7テストの既存テスト影響分析が Phase 1 段階で完了しており、Phase 5 実装時に「壊してはいけないテスト」が明確だった。テスト名+アサーション内容+影響有無の3列テーブルが特に有用だった

3. **コンポーネント間依存と実装順序制約の明示**: EmptyState -> SuggestionBubble の依存関係と推奨実装順序（4並列 -> Badge -> SuggestionBubble -> EmptyState）が Phase 1 で確定されており、Phase 5 の実装順序判断が不要だった

4. **Phase 12 仕様書のP1-P43対策チェックリスト**: Phase 12 仕様書の冒頭に「事前チェック（Phase 12 開始時の必須確認）」としてP1/P2/P3/P4/P29/P43の対策が明記されており、Phase 12 実行時の漏れ防止に直結した

5. **Phase 3 MINOR指摘のトラッキング**: R-1からR-6の指摘事項が Phase 5 実装サマリーで全て「対応状況: 完了」として記録されており、指摘の追跡が容易だった

6. **テスト環境ルール（Pitfall対策）の仕様書への組み込み**: P39（happy-dom/userEvent非互換）、P40（テスト実行ディレクトリ依存）、P9（モジュールスコープ変数リーク）、P13（タイマーテスト無限ループ）が Phase 1 要件定義と Phase 4 テスト作成仕様の両方に記載されており、テストコード作成時に過去の落とし穴を回避できた

### 改善提案

1. **Props命名の仕様-実装間ドリフト検出メカニズムの不足（M-1関連）**: Phase 10 で発見された `updateInterval` vs `refreshInterval` の命名差異は、Phase 3 設計レビューで検出すべきだった。Phase 2 設計書のProps定義と Phase 1 要件書の用語を突合するチェック項目を Phase 3 仕様書に追加すべきである

2. **テスト件数見積もりの精度**: index.md のテスト件数見積もり（合計約187件）と実際のテスト件数（Phase 7 時点で156件、Phase 9 時点で388件（全Atoms含む））に乖離がある。Phase 4 仕様書には139テストケースと記載されているが、Phase 6 テスト拡充後の件数が見積もりと大きく異なる。見積もり時に「Phase 4 + Phase 6 = 合計」の計算式を明記し、Phase 6/7 完了時に実数で上書きする運用を推奨する

3. **Phase 11 手動テストの「CONDITIONAL」判定基準の明確化**: 51テストケース中31件が CONDITIONAL 判定（実機確認待ち）だが、CONDITIONAL から PASS/FAIL に遷移する条件と実施タイミングが仕様書に未定義。「次回の実機テストスプリントで確認」等の具体的なトリガーを定義すべきである

## 2. Phase実行フロー改善点

### 良かった点

1. **Phase 1-3 の直列実行による要件-設計-レビューの一貫性**: 要件定義から設計レビューまでを1つの流れで実行したことで、Phase 3 で検出された6件の MINOR 指摘が全て Phase 5 で対応可能な軽微なものに留まった

2. **Phase 4（TDD Red）-> Phase 5（TDD Green）の明確な分離**: テストを先に作成し、その後に実装するTDDサイクルが仕様書レベルで強制されていた。Phase 4 で139テストケースが設計・作成され、Phase 5 で全テストをグリーンにするという明確なゴールが実装を効率化した

3. **Phase 6-7 のカバレッジ改善ループ**: Phase 7 で全コンポーネントがLine 100%, Branch 80%+, Function 100% を達成し、Phase 6 への差し戻しが不要だった。Phase 6 のテスト拡充仕様書がエッジケース・テーマ横断・アクセシビリティの3カテゴリで整理されていたことが効率的なテスト追加に寄与した

4. **Phase 9 品質ゲートの網羅性**: 8項目（機能品質/テスト品質/Lint/型安全性/テスト安定性/ビルド可能性/セキュリティ/後方互換性）の品質ゲートが Phase 9 で全て検証されており、Phase 10 での最終レビューがスムーズだった

### 改善提案

1. **Phase 9 と Phase 10 の重複削減**: Phase 9 の品質ゲート判定と Phase 10 の最終レビューで「テスト全PASS」「カバレッジ基準達成」「ESLintエラー0件」の検証が重複している。Phase 10 は Phase 9 の結果を前提とし、Phase 10 固有の検証（要件-実装整合性、デザイントークン監査、Apple HIG準拠）に集中するよう仕様を改善すべきである

2. **Phase 11 手動テストのコード分析ベース実施の位置づけ明確化**: 今回の Phase 11 は「コード分析ベース + 実機確認要否判定」として実施されたが、仕様書上は「UIテスト・E2Eシナリオ実行」と記載されている。コード分析ベースの実施が許容されるケース（Electron環境でのレンダリング確認が困難な場合等）を Phase 11 仕様テンプレートに明記すべきである

3. **Phase 8 リファクタリングの対象判断基準**: Phase 8 で「実施しなかった変更」として U-1/U-2/U-3 の3件が記録されているが、実施/非実施の判断基準が各案件の理由文にのみ記載されている。「共通化のメリットがコードの複雑化を上回る場合のみ実施」等の汎用判断基準を Phase 8 仕様テンプレートに追加すべきである

## 3. ツール・スクリプト改善要望

1. **`complete-phase.js` の artifacts.json 自動更新**: 現在 artifacts.json の Phase ステータス更新は手動で行っているが、`complete-phase.js` 実行時にステータスを `in_progress` -> `completed` に自動更新し、`completedAt` タイムスタンプと成果物パスを自動記録する機能があると、Phase 末端アクションの漏れを防止できる

2. **テスト実行コマンドのエイリアス化**: 現在 `cd apps/desktop && pnpm vitest run src/renderer/components/atoms/` と毎回入力しているが、`pnpm --filter @repo/desktop test:atoms` のようなスクリプトを package.json に追加すると効率的である。P40 対策としても有効である

3. **カバレッジレポートの自動生成スクリプト**: Phase 7 のカバレッジ確認で個別コンポーネントのカバレッジ数値を手動で収集しているが、`vitest run --coverage` の出力からコンポーネント別カバレッジテーブルをMarkdown形式で自動生成するスクリプトがあると Phase 7 の作業が効率化される

## 4. 落とし穴追加候補

### P-NEW-1: HTMLAttributes との Props 型衝突（Badge content 型エラー）

- **発見Phase**: Phase 9（品質検証）
- **症状**: `BadgeProps extends React.HTMLAttributes<HTMLSpanElement>` で `content` プロパティの型が衝突。`HTMLAttributes` は `content?: string` を持つが、`BadgeProps` は `content?: string | number` と拡張しており、TS2430 エラーが発生
- **解決策**: `Omit<React.HTMLAttributes<HTMLSpanElement>, "content">` で HTML標準の `content` プロパティを除外してから独自定義する
- **汎用性**: `content`, `color`, `translate`, `hidden` 等、HTML標準属性と同名の Props を定義するコンポーネントで同様の問題が発生しうる
- **推奨Pitfall ID**: P46

```typescript
// 問題パターン: HTMLAttributesのcontent?: stringとの衝突
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  content?: string | number; // TS2430: 'string | number' is not assignable to 'string'
}

// 解決パターン: 衝突するプロパティをOmitで除外
interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  content?: string | number; // OK
}
```

### P-NEW-2: CSS変数ベースのスタイルテストでのアサーション戦略

- **発見Phase**: Phase 5-6（実装/テスト拡充）
- **症状**: デザイントークン（CSS変数）をTailwind の arbitrary values（`bg-[var(--status-primary)]`）で使用した場合、テストでは `toHaveClass("bg-[var(--status-primary)]")` のようにCSSクラス名の文字列比較でアサーションする必要がある。従来のTailwindユーティリティクラス（`bg-blue-500`）と異なり、`var()` 関数を含むクラス名の文字列が長くなりがちである
- **解決策**: variantStyles を Record 型でコンポーネント外部に抽出し、テストでも同じ Record を参照して期待値を生成する。またはテスト用のヘルパー関数を作成して `bg-[var(--status-primary)]` のような文字列を短縮する
- **汎用性**: デザイントークン移行を行う全コンポーネントで共通の課題

### 新規Pitfall追加の結論

上記2件は新規パターンとして `06-known-pitfalls.md` への追加を推奨する。特にP-NEW-1は今後のコンポーネント拡張（Molecules/Organisms）で再発する可能性が高い。

## 5. UIコンポーネント実装知見

### 5.1 Atomic Designパターンでの開発知見

1. **Atoms コンポーネントは props 駆動を徹底すべき**: 今回の7コンポーネントは全て Zustand Store に依存せず、純粋に props のみで挙動が決まる設計にした。P31（Store Hooks無限ループ）対策としても有効であり、テストの記述が大幅に簡素化された。Molecules/Organisms では Store 連携が必要になるが、Atoms レイヤーでは props 駆動を原則とすべきである

2. **コンポーネント間依存の最小化**: EmptyState が SuggestionBubble に依存する設計だが、依存を `suggestions` props のデータ構造に限定し、SuggestionBubble の内部実装には依存しない形にした。これにより両コンポーネントの独立テストが可能になった

3. **`displayName` の設定は必須**: React.memo でラップした場合、DevTools でのコンポーネント名が `Memo(Component)` ではなく `Component` と表示されるよう `displayName` を設定した。全7コンポーネントで統一的に設定した

### 5.2 デザイントークンとTailwind CSSの組み合わせパターン

1. **Tailwind arbitrary values パターンの確立**: `bg-[var(--status-primary)]`, `text-[var(--text-muted)]` のようにTailwindのarbitrary values でCSS変数を参照するパターンが全コンポーネントで統一的に使用された。このパターンにより、テーマ切替時にCSS変数の値が切り替わるだけでコンポーネント側の変更が不要になる

2. **variantStyles の Record 型パターン**: `Record<NonNullable<Props["variant"]>, string>` 型でバリアントスタイルを定義するパターンが Badge, StatusIndicator, SkeletonCard, SuggestionBubble で使用された。TypeScript の型レベルでバリアント値の網羅性が保証され、新規バリアント追加時にコンパイルエラーで漏れを検出できる

3. **スタイル定数のモジュールスコープ抽出**: Phase 8 リファクタリングで `variantStyles`, `sizeStyles`, `baseStyles` をレンダリング関数外に抽出した。レンダリング毎のオブジェクト再生成を防止し、React.memo の効果を最大化する

### 5.3 テーマ対応（3テーマ）の実装パターン

1. **CSS変数による完全分離**: 3テーマ（kanagawa-dragon / light / dark）の切替はCSS変数の値差し替えのみで実現され、コンポーネントのTypeScript/TSXコードにテーマ固有のロジックは存在しない。これは TASK-UI-00-TOKENS で確立された `[data-theme]` セレクタベースの設計の成果である

2. **テーマテストの `describe.each` パターン**: Phase 6 で追加したテーマ横断テストでは `describe.each(["light", "dark", "kanagawa-dragon"])` でテーマ毎のレンダリングを検証した。DOM に `data-theme` 属性を設定してレンダリングし、CSS クラスの適用を検証するパターンが確立された

3. **`--text-muted` の低コントラスト問題**: Apple HIG の `secondaryLabel`（`rgba(60, 60, 67, 0.6)`）は背景色との組み合わせでWCAG AA基準のコントラスト比（4.5:1）を下回る場合がある。StatusIndicator の idle/offline ドットとRelativeTimeのテキストで使用しているが、UI部品のコントラスト基準（3:1）で許容する判断をした。この判断は仕様書に明記すべきである

### 5.4 アクセシビリティ実装の知見

1. **`div[role="button"]` vs `<button>` の使い分け**: SuggestionBubble で `<div role="button" tabIndex={0}>` を使用したが、`<button>` 要素を使用した方がキーボード操作（Enter/Space）のデフォルト動作が自動的に有効になるため、Atoms レベルでは `<button>` を優先すべきである。FilterChip は `<button>` を使用しており、キーボードイベントハンドラの追加が不要だった

2. **`aria-label` の自動生成パターン**: Badge で `content` が `number` 型の場合に `aria-label="{content}件"` を自動設定するパターンを実装した。明示的な `aria-label` props が指定された場合はそれを優先する。このパターンは今後のコンポーネントでも再利用可能である

3. **`role="status"` と `aria-busy`の組み合わせ**: SkeletonCard で `role="status" aria-label="読み込み中" aria-busy="true"` を設定した。ローディング状態のプレースホルダーにはこの3属性の組み合わせがスクリーンリーダー対応として適切である

## サマリー

| カテゴリ           | 改善提案数 |
| ------------------ | ---------- |
| 仕様書品質         | 3件        |
| 実行フロー         | 3件        |
| ツール・スクリプト | 3件        |
| 落とし穴追加       | 2件        |
| **合計**           | **11件**   |

### 優先度の高い改善提案（Top 3）

| 順位 | 提案                                                                    | カテゴリ     |
| ---- | ----------------------------------------------------------------------- | ------------ |
| 1    | P-NEW-1（HTMLAttributes Props型衝突）の `06-known-pitfalls.md` への追加 | 落とし穴追加 |
| 2    | Phase 3 設計レビューにProps命名の仕様-実装間突合チェック項目を追加      | 仕様書品質   |
| 3    | `complete-phase.js` の artifacts.json 自動更新機能                      | ツール       |
