# UT-IMP-TASK10A-F-PHASE11-FILENAME-EVIDENCE-SYNC-GUARD-001 - タスク指示書

## メタ情報

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-IMP-TASK10A-F-PHASE11-FILENAME-EVIDENCE-SYNC-GUARD-001 |
| タスク名     | Phase 11 ファイル名・証跡同期ガードの自動検証追加         |
| 分類         | 改善                                                      |
| 対象機能     | TASK-10A-F の Phase 11/12 ドキュメント運用                |
| 優先度       | 中                                                        |
| 見積もり規模 | 小規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | Phase 12                                                  |
| 発見日       | 2026-03-07                                                |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-F 再確認時に、`phase-11-manual-testing.md` と `phase-11-manual-test.md` の名称差分で screenshot coverage 検証が一時失敗した。

### 1.2 問題点・課題

- Phase 11 文書名の期待値がスクリプトと運用で揺れる。
- 画面証跡が存在しても、TC紐付けが不足すると未参照扱いになる。

### 1.3 放置した場合の影響

再監査時に false fail が発生し、実装完了済みタスクの判定が不安定になる。

## 2. 何を達成するか（What）

### 2.1 目的

Phase 11 文書名と証跡リンクの整合を機械的に検証し、再監査の手戻りを防止する。

### 2.2 最終ゴール

- `validate-phase11-screenshot-coverage` 実行前にファイル名/TC/証跡の前提不整合を検出できる。
- TASK-10A 系ワークフローで同種エラーが再発しない。

### 2.3 スコープ

#### 含むもの

- Phase 11 文書名チェック（`phase-11-manual-test.md`）
- TC-ID と screenshot パスの一致検証
- 運用手順書への再発防止追記

#### 含まないもの

- 既存 legacy 未タスク351件の一括是正
- 全 workflow の全面リライト

### 2.4 成果物

- 検証ガード仕様（task-specification-creator または skill-creator 側）
- 更新ログ（LOGS/SKILL）
- 適用例（TASK-10A-F 参照）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の Phase 11/12 関連スクリプトが実行可能であること

### 3.2 依存タスク

- TASK-10A-F（完了）

### 3.3 必要な知識

- Phase 11 screenshot coverage validator
- unassigned-task フォーマット要件

### 3.4 推奨アプローチ

1. 既存 validator の前段に「文書名と必須節」チェックを追加
2. `manual-test-result.md` の証跡参照を TC単位で検証
3. パターン集に成功/失敗パターンを追記

## 4. 実行手順

### Phase構成

- Phase A: 現状分析
- Phase B: 検証ガード実装
- Phase C: ドキュメント同期

### Phase A: 現状分析

#### 目的

文書名・TC・証跡のずれパターンを特定する。

#### 手順

1. `validate-phase11-screenshot-coverage.js` の期待入力を確認
2. 対象 workflow で mismatch ケースを再現
3. 検出項目を分類

#### 成果物

ズレ分類メモ

#### 完了条件

ズレの再現条件が3行以内で説明できる。

### Phase B: 検証ガード実装

#### 目的

再現したズレを自動検出できる状態にする。

#### 手順

1. 文書名チェックを追加
2. TC-ID と証跡の紐付け必須化
3. テストまたは検証コマンドで確認

#### 成果物

更新済みスクリプト/テンプレート

#### 完了条件

同じズレを再現しても precheck で失敗を返せる。

### Phase C: ドキュメント同期

#### 目的

再発防止を運用資産に反映する。

#### 手順

1. `task-workflow.md` へ関連未タスクを登録
2. `lessons-learned.md` へ苦戦箇所と簡潔手順を追記
3. LOGS/SKILL を同期

#### 成果物

仕様書更新ログ

#### 完了条件

参照リンク切れがなく、`verify-unassigned-links` がPASS。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 文書名不整合を検出できる
- [ ] TC/証跡不整合を検出できる

### 品質要件

- [ ] `verify-unassigned-links` がPASS
- [ ] `audit-unassigned-tasks --target-file` がPASS

### ドキュメント要件

- [ ] `task-workflow.md` に登録済み
- [ ] `lessons-learned.md` に追記済み

## 6. 検証方法

### テストケース

- 文書名が `phase-11-manual-testing.md` のみのケースで失敗を返す
- TCが11件、証跡10件のケースで不足を返す

### 検証手順

1. validator 実行
2. 期待エラー確認
3. 是正後に再実行してPASS確認

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                              |
| ---------------------------- | ------ | -------- | --------------------------------- |
| 既存 workflow との互換性崩れ | 中     | 中       | precheckはwarning→段階的にerror化 |
| 過検知による運用停止         | 中     | 低       | 対象をPhase11文書名とTC証跡に限定 |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/store-driven-lifecycle-ui/phase-11-manual-test.md`
- `.claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### 参考資料

- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 12仕様書通りに実行できているか再確認し、未タスク配置と苦戦箇所を明記すること。
```

### 補足事項

本タスクは TASK-10A-F の再発防止のための改善バックログであり、親タスク完了判定をブロックしない。
