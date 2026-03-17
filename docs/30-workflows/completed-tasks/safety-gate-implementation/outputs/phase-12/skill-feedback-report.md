# Phase 12: スキルフィードバックレポート

## タスク情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| タスクID | UT-06-003                                          |
| タスク名 | SafetyGatePort 具象クラス実装（DefaultSafetyGate） |
| 作成日   | 2026-03-16                                         |

## task-specification-creator への改善提案

### 提案 1: Phase 4/5 テンプレートに「既存ユーティリティ重複検出」ステップ追加

- **背景**: DefaultSafetyGate 実装時に `normalizePath` ユーティリティが既に別モジュールに存在していた。重複実装のリスクがあった
- **提案**: Phase 4（テスト作成）および Phase 5（実装）のテンプレートに、以下のチェックステップを追加する
  - 「対象機能で使用する可能性のあるユーティリティ関数を `grep -rn` で検索し、既存実装の有無を確認」
- **期待効果**: ユーティリティの重複実装を防止し、コードベースの一貫性を維持

### 提案 2: Phase 5 テンプレートに「IPC ハンドラ unregister 関数の有無チェック」追加

- **背景**: `safetyGateHandlers.ts` の実装時に `unregisterSafetyGateHandlers` 関数の追加が漏れた。P5（リスナー二重登録）対策として、IPC ハンドラ登録と同時に解除関数を実装する必要がある
- **提案**: Phase 5 テンプレートの IPC ハンドラ実装セクションに以下のチェック項目を追加する
  - 「`register*Handlers` 関数を作成した場合、対応する `unregister*Handlers` 関数も同時に作成したか？」
- **期待効果**: P5（リスナー二重登録）の再発防止

### 提案 3: Phase 2 設計テンプレートに「DI 境界の型配置判断」明記

- **背景**: DefaultSafetyGate の DI 依存型（`DefaultSafetyGateDeps`）を `default-safety-gate.ts` 内に定義したが、`SafetyGatePort` インターフェースと同じファイルに配置すべきかの判断基準が不明確だった
- **提案**: Phase 2 設計テンプレートに以下の判断フローを追加する
  - 「DI 依存型は具象クラスのみで使用する場合 → 具象クラスファイル内に配置」
  - 「DI 依存型を複数の具象クラスで共有する場合 → Port インターフェースと同階層に配置」
- **期待効果**: 型ファイル配置の判断が明確化し、設計レビューでの手戻りを削減

## aiworkflow-requirements への改善提案

### 提案 4: Trigger キーワードに SkillMetadataProvider 追加

- **背景**: SafetyGate 実装では `SkillMetadataProvider`（スキルのメタデータ取得）が重要な依存だが、既存の Trigger キーワード一覧に含まれていなかった。関連仕様書の検索が困難だった
- **提案**: `references/` 配下の Trigger キーワード一覧に `SkillMetadataProvider` を追加する
- **期待効果**: 関連タスク検索の精度向上

### 提案 5: normalizePath のような横断ユーティリティの配置ガイドライン追加

- **背景**: パス正規化（`normalizePath`）は複数のサービスで使用される横断的なユーティリティだが、配置場所（`utils/` vs `shared/` vs サービス内）の判断基準が仕様書に明記されていない
- **提案**: `architecture-implementation-patterns.md` に以下のガイドラインを追加する
  - 「3つ以上のサービスで使用されるユーティリティ → `packages/shared/src/utils/` に配置」
  - 「2つのサービスで使用 → 上位ディレクトリの `utils/` に配置」
  - 「1つのサービスでのみ使用 → サービス内に配置」
- **期待効果**: ユーティリティ配置の一貫性確保、重複実装の防止
