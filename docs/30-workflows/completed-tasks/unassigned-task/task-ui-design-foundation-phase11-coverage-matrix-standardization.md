# TASK-UI-00 Phase 11 画面カバレッジマトリクス標準化 - タスク指示書

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-UI-00-003                                                      |
| タスク名     | Phase 11 画面カバレッジマトリクス標準化                           |
| 分類         | 改善                                                              |
| 対象機能     | TASK-UI-00-DESIGN-FOUNDATION（Phase 11 手動テスト仕様・証跡運用） |
| 優先度       | 中                                                                |
| 見積もり規模 | 小規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | Phase 12 再監査（`validate-phase11-screenshot-coverage` warning） |
| 発見日       | 2026-03-04                                                        |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`validate-phase11-screenshot-coverage` の互換拡張で PASS は回復したが、`phase-11-manual-test.md` にテストケース一覧と画面カバレッジマトリクスが未定義のため warning が継続している。

### 1.2 問題点・課題

- Phase 11 仕様書から TC 一覧を直接抽出できず、`manual-test-checklist.md` へフォールバックしている
- 画面カバレッジマトリクス節がなく、証跡の追跡経路が分散する
- warning 理由が毎回再説明になり、再監査工数が増える

### 1.3 放置した場合の影響

- UIタスク再監査で warning を恒常的に抱え、合否判定の説明コストが増加する
- Phase 11 仕様と成果物の参照責務が曖昧になり、証跡の保守性が低下する

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11 手動テスト仕様に TC 一覧と画面カバレッジマトリクスを標準定義し、スクリーンショット監査を warning なしで再現可能にする。

### 2.2 最終ゴール

- `phase-11-manual-test.md` から TC が直接抽出できる
- 画面カバレッジマトリクスで TC とスクリーンショットの対応が一意に追跡できる
- `validate-phase11-screenshot-coverage` の warning が解消される

### 2.3 スコープ

#### 含むもの

- `phase-11-manual-test.md` に `テストケース一覧` と `画面カバレッジマトリクス` 節を追加
- `TC-UI-00-301` 形式と `TC ID` ヘッダを明示した記載ルール化
- `manual-test-result.md` / `manual-test-checklist.md` との参照整合確認

#### 含まないもの

- 新規UIコンポーネントの実装変更
- Phase 11 のスクリーンショット再撮影そのもの

### 2.4 成果物

- Phase 11 仕様書更新差分（TC一覧 + マトリクス節）
- warning 解消を示す検証ログ
- `task-workflow.md` / `lessons-learned.md` 追補記録

## 3. どのように実行するか（How）

### 3.1 前提条件

- `docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation/` の Phase 11 成果物が揃っていること
- `validate-phase11-screenshot-coverage.js` が互換拡張済みであること

### 3.2 依存タスク

- UT-UI-00-001（Lightテーマ境界コントラスト改善）
- UT-UI-00-002（モバイル情報密度最適化）

### 3.3 必要な知識

- Phase 11 証跡の構造（manual-test / checklist / result / screenshots）
- `task-specification-creator` の screenshot coverage 監査仕様

### 3.4 推奨アプローチ

warning 解消を目的に、まず仕様書側の節不足を埋める。スクリプト追加改修は行わず、文書構造の標準化で解決する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                | 発見経緯                                            | 解決策                                                                 | 教訓                                                       |
| --------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| TC命名が `TC-UI-00-xxx` のため、従来抽出に失敗した  | Phase 12 再監査で coverage が偽失敗                 | スクリプトを命名互換化し、今回タスクでは仕様書側にも命名規約を明記する | 抽出ロジックの互換性だけでなく、文書側の規約固定が必要     |
| `TC ID` 列名と `TC-ID` 列名の揺れで結果抽出が不安定 | `manual-test-result.md` の列名差で再確認工数が発生  | 列名を `TC ID` に統一し、Phase 11 テンプレートへ反映する               | 監査対象列名はテンプレートで固定する                       |
| 画面カバレッジマトリクス節がなく warning が残った   | coverage 実行時に「マトリクス未記載」warning が継続 | `phase-11-manual-test.md` に明示節を追加し、TC→証跡パスを記述する      | PASS だけでなく warning 0 を目標にすると再監査が短縮できる |

## 4. 実行手順

### Phase構成

- Phase A: Phase 11 仕様の標準化
- Phase B: 監査実行と仕様同期

### Phase A: Phase 11 仕様の標準化

#### 目的

TC抽出と画面カバレッジ追跡を仕様書単体で成立させる。

#### 手順

1. `phase-11-manual-test.md` に `テストケース一覧` を追加する
2. `phase-11-manual-test.md` に `画面カバレッジマトリクス` を追加する
3. `TC ID` 列名と `TC-UI-00-xxx` 命名規約を固定する

#### 成果物

- Phase 11 仕様書更新差分

#### 完了条件

- 仕様書から TC 一覧とマトリクスが読める

### Phase B: 監査実行と仕様同期

#### 目的

warning 解消と台帳同期を同一ターンで完了する。

#### 手順

1. `validate-phase11-screenshot-coverage` を実行する
2. `verify-unassigned-links` と `audit --target-file` で未タスク整合を確認する
3. `task-workflow.md` / `lessons-learned.md` に結果を同期する

#### 成果物

- 監査ログ
- 仕様同期差分

#### 完了条件

- screenshot coverage が warning なしで PASS
- 未タスク監査が `currentViolations=0`

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `phase-11-manual-test.md` に TC一覧が追加されている
- [ ] `phase-11-manual-test.md` に画面カバレッジマトリクスが追加されている
- [ ] `TC ID` 列名と `TC-UI-00-xxx` 命名規約が明文化されている

### 品質要件

- [ ] `validate-phase11-screenshot-coverage` が warning なしで PASS
- [ ] `verify-unassigned-links` が missing=0
- [ ] `audit --target-file` が `currentViolations=0`

### ドキュメント要件

- [ ] `task-workflow.md` の TASK-UI-00 セクションへ登録済み
- [ ] `lessons-learned.md` の TASK-UI-00 教訓へ反映済み

## 6. 検証方法

### テストケース

- Case 1: `phase-11-manual-test.md` から TC一覧を抽出できる
- Case 2: TC とスクリーンショットの紐づけがマトリクスで追跡できる
- Case 3: coverage 実行時に warning が出ない

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/completed-tasks/unassigned-task/task-ui-design-foundation-phase11-coverage-matrix-standardization.md
```

## 7. リスクと対策

| リスク                                     | 影響度 | 発生確率 | 対策                                                              |
| ------------------------------------------ | ------ | -------- | ----------------------------------------------------------------- |
| 仕様書更新だけで実データ列名が揺れる       | 中     | 中       | `manual-test-result.md` と同時に列名整合を確認する                |
| warning 解消を優先し過ぎて手順が過剰化する | 低     | 中       | 必須節を2つに限定し、最小構成で標準化する                         |
| 他UIタスクへ横展開が遅れる                 | 中     | 中       | `task-workflow.md` と `lessons-learned.md` に再利用手順を固定する |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation/phase-11-manual-test.md`
- `docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation/outputs/phase-11/manual-test-checklist.md`
- `docs/30-workflows/completed-tasks/task-050-ui-00-ui-design-foundation/outputs/phase-11/manual-test-result.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

`validate-phase11-screenshot-coverage` は PASS だが、`phase-11-manual-test.md` の TC一覧/画面カバレッジマトリクス未記載により warning が継続。

### 補足事項

本タスクは Phase 11 証跡運用の標準化タスクであり、UI機能追加ではなく監査品質の改善を目的とする。
