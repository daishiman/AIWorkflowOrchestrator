# W2-seq-03a スキルフィードバックレポート

## タスクID: W2-seq-03a

## 作成日: 2026-04-08

---

## 対象

- `task-specification-creator`（Phase/成果物の規約とテンプレート）
- `aiworkflow-requirements`（システム仕様の正本）

---

## 改善点（今後の改善候補）

### 1. inferSmartDefaults のツール値大文字小文字統一

**課題**:

`inferSmartDefaults` の推論ループ内では、ツール名のキーワード検索を小文字で行い（`purposeLower.includes('slack')`）、表示名は大文字で返す（`toolName: 'Slack'`）。この変換規則が `EXTERNAL_TOOL_KEYWORDS` 配列内にのみ暗黙的に存在しており、ドキュメントに明記されていない。

**改善案**:

- `EXTERNAL_TOOL_KEYWORDS` の型定義に `displayName: string`（大文字）と `searchKeyword: string`（小文字）を明示的に分離する
- Phase 2 の設計書（inference-flowchart.md）に「キーワード検索は小文字化して実施、表示名は元の大文字表記を使用」と明記する

---

### 2. handleGenerate の二重呼び出し防止を設計書に明記

**課題**:

`handleGenerate` の二重呼び出し防止は Phase 6 のエッジケース（EC-HG-02）で検証しているが、Phase 2 の設計書（architecture-design.md）のハンドラ設計に防止策が記載されていない。

**改善案**:

- Phase 2 のハンドラ設計に「生成中フラグ（`isGenerating`）を使って二重呼び出しを防止する」旨を追記する
- Phase 1 の非機能要件に「`handleGenerate` の冪等性保証」を追加する

---

### 3. handleRetry 後のリセット対象を設計書に一覧化

**課題**:

`handleRetry` がリセットする State（`answers` / `smartDefaults` / `skillPath` / `hasExternalIntegration` / `externalToolName`）と保持する State（`formData`）の一覧が、architecture-design.md のハンドラ設計のコードコメントにのみ記載されており、テーブル形式で一目で分からない。

**改善案**:

- Phase 2 の設計書に「handleRetry のリセット対象 State / 保持 State」のテーブルを追加する

---

## 良かった点（維持したい点）

- `inferSmartDefaults` を純粋関数として実装し、副作用を排除した点（テスト容易性が高い）
- `EXTERNAL_TOOL_KEYWORDS` / `SKIP_CATEGORIES` を定数配列として切り出し、新ツール・カテゴリ追加時の拡張性を確保した点
- `inferenceLog` を `SmartDefaultResult` に含め、推論過程をデバッグ・テストで確認できるようにした点
- `handleRetry` で `formData` のみを保持し、その他の State をリセットすることで「前回入力を引き継ぎつつクリーンな状態で再生成」を実現した点
