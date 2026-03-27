# 未タスク指示書: UT-IMP-PHASE2-CONTRACT-MATRIX-DTO-SYNC-001

## メタ情報

```yaml
issue_number:
task_id: UT-IMP-PHASE2-CONTRACT-MATRIX-DTO-SYNC-001
task_name: Phase-2 contract matrix の DTO 変更自動追従スクリプト
category: 改善
target_feature: Phase-2 contract matrix と TypeScript DTO shape の自動整合性検証
priority: 低
scale: 中規模
status: unassigned
source_phase: lessons-learned L-WLC-012 相当（Phase 2 contract matrix が DTO 更新に追従しない問題）
created_date: 2026-03-27
dependencies: []
```

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE2-CONTRACT-MATRIX-DTO-SYNC-001                                            |
| タスク名   | Phase-2 contract matrix の DTO 変更自動追従スクリプト                                 |
| 由来       | lessons-learned L-WLC-012 相当（Phase 2 contract matrix が DTO 更新に追従しない問題） |
| ステータス | unassigned                                                                            |
| 優先度     | 低                                                                                    |
| 作成日     | 2026-03-27                                                                            |
| 関連仕様書 | lessons-learned-phase12-workflow-lifecycle.md                                         |

---

## 目的

Phase-2 設計成果物（contract matrix）に記載された DTO shape と、実コード上の TypeScript 型定義の乖離を自動検知する監査スクリプトを作成し、ドキュメントの正確性を継続的に保証する。

---

## 背景

Phase-2 の設計フェーズでは、contract matrix に DTO のフィールド名・型・構造を記述し、後続フェーズの実装ガイドとして参照される。しかし、Phase-5 実装中に DTO shape が変更された場合、contract matrix 側の更新が行われないケースが頻発している。

この乖離は Phase-12 ドキュメント段階まで検出されず、以下の問題を引き起こす：

- **reader の誤誘導**: contract matrix を信頼して実装・レビューする開発者が、実際とは異なる DTO shape を前提に判断してしまう
- **Phase-12 手戻り**: ドキュメント最終段階で乖離に気づき、matrix の遡及修正が必要になる
- **手動追従の限界**: DTO 変更のたびに matrix を手動で更新するワークフローは、忘れやすく持続可能でない

これらの問題に対し、差分を機械的に検知する監査スクリプトを CI / pre-commit に組み込むことで、乖離の早期発見と修正を促進する。

---

## 実行タスク

### 1. Phase-2 contract matrix からの DTO 参照抽出パーサー

- `outputs/phase-2/` 配下の contract matrix（Markdown テーブル形式）を解析する
- DTO 名、フィールド名、型情報を構造化データとして抽出する
- 複数の matrix ファイルに対応できる汎用パーサーとする

### 2. TypeScript 型定義からの DTO shape 取得

- `packages/shared/src/types/` 配下の TypeScript 型定義ファイルをパースする
- interface / type alias からフィールド名・型を抽出する
- extends / intersection type による合成型も考慮する

### 3. 差分検知ロジックの実装

- contract matrix 上の DTO shape と TypeScript 型定義を比較する
- 以下の差分パターンを検知する：
  - フィールド追加（TypeScript にあるが matrix にない）
  - フィールド削除（matrix にあるが TypeScript にない）
  - 型変更（同一フィールドで型が不一致）
  - optional/required の不一致

### 4. CI / pre-commit 統合

- CI パイプラインで実行可能な監査スクリプトとして整備する
- pre-commit hook としても利用可能な設計にする
- 終了コードで差分の有無を表現する（0: 一致、1: 差分あり）

### 5. レポート出力フォーマットの定義

- 差分検出時に人間可読なレポートを標準出力またはファイルに出力する
- JSON 形式の機械可読出力もサポートする
- 対象 matrix ファイルパス、DTO 名、差分内容を含める

---

## 受入基準

- [ ] DTO フィールドの追加・削除・型変更を正しく検知できる
- [ ] Phase-2 contract matrix 内の DTO 参照（テーブル形式）を正しく抽出できる
- [ ] 差分レポートが人間可読な形式で出力される
- [ ] JSON 形式の機械可読出力をサポートする
- [ ] CI パイプラインで実行可能（終了コードで結果を表現）
- [ ] pre-commit hook として利用可能
- [ ] 差分がない場合は正常終了（exit 0）する
- [ ] 複数の matrix ファイル・複数 DTO を一括検証できる

---

## 苦戦箇所・知見（親タスクからの引き継ぎ）

### L-WLC-012 相当: Phase-2 成果物と実装の乖離問題

- **根本原因**: Phase-2 で確定した contract matrix が、Phase-5 以降の実装変更に対する自動追従メカニズムを持たない。ワークフロー上、matrix 更新は手動依存であり、実装者が意識しない限り更新されない。
- **影響範囲**: Phase-12 ドキュメント作成時に初めて乖離が発覚し、遡及的な matrix 修正と影響調査が発生する。最悪の場合、乖離に気づかないまま誤った仕様がドキュメントとして確定する。
- **推奨アプローチ**: Markdown テーブルのパースには正規表現ベースの軽量パーサーで十分。TypeScript 型定義のパースには `ts-morph` または TypeScript Compiler API の利用を推奨。完全一致ではなく「matrix に記載された範囲」での整合性チェックとし、matrix 側が意図的に省略しているフィールドを false positive にしない設計が重要。
