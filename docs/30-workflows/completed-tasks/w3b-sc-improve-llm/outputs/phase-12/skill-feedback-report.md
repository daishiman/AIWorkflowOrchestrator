# スキルフィードバックレポート: improve() LLM 統合

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 機能名   | w3b-sc-improve-llm     |
| 作成日   | 2026-03-23             |

---

## ワークフロー改善点

### 1. plan() パターンの再利用が効果的

improve() の実装は plan() の LLM 統合パターン（resolveDecision → graceful degradation → prompt 構築 → sendChat → レスポンスパース）をほぼそのまま踏襲できた。このパターンの再利用性は高く、将来の新しい LLM 統合ポイント（debug(), fork() 等）でも同じ構造を適用できる。

### 2. RESPONSE_SCHEMA_INSTRUCTION パターンの標準化

`PLAN_RESPONSE_SCHEMA_INSTRUCTION` と `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` は同じ「JSON-only 出力指示」パターン。将来的には共通テンプレートを作成し、各機能固有の JSON Schema 部分だけ差し替える形にすると保守性が向上する。

---

## 技術的教訓

### 1. stripMarkdownCodeBlock の DRY 共有

LLM は指示に関わらず Markdown コードブロック（` ```json ... ``` `）でレスポンスを囲むことがある。`stripMarkdownCodeBlock()` をモジュールスコープ関数として1箇所に定義し、plan/improve 両方から呼ぶ設計は DRY 原則に合致し、テストも1箇所で済む。

### 2. mapToSuggestion による LLM 出力正規化

LLM の出力フォーマット（`issue`/`pattern` フィールド）とアプリケーション内部の型（`reason` フィールド）を分離し、`mapToSuggestion()` で変換する設計は、LLM のプロンプト変更がアプリケーション型に影響しないバッファ層として機能する。

### 3. isValidImproveResponse の in 演算子パターン

P49 準拠で `in` 演算子を使った type predicate は、`as` キャストによる型チェック回避を防ぎつつ、実行時安全性を確保する。このパターンは他の LLM レスポンスバリデーションにも適用すべき。

---

## スキル改善提案

### task-specification-creator への提案

- Phase 12 仕様書に「IPC DI 配線確認」チェック項目を追加すると、Facade に DI が必要な依存を渡し忘れるパターン（今回の UT-SC-05-IPC-DI-WIRING）を早期検出できる

---

## 新規 Pitfall 候補

候補なし（既存 Pitfall のパターン内で対応可能）。IPC DI 配線の問題は P65（dead-end namespace）の変種だが、今回は namespace の問題ではなくコンストラクタ引数不足であるため、P65 のカバー範囲を拡張するか検討の余地がある。
