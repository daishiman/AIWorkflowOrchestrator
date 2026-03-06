# Phase 12 未タスクリンク診断改善 - タスク指示書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-PHASE12-UNASSIGNED-LINK-DIAGNOSTICS-001               |
| タスク名     | Phase 12 未タスクリンク診断改善                              |
| 分類         | 改善                                                         |
| 対象機能     | `task-specification-creator` の `verify-unassigned-links.js` |
| 優先度       | 中                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | `TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001` Phase 12 再確認  |
| 発見日       | 2026-03-06                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

auth-mode 契約整合タスクの Phase 12 再監査で、`verify-unassigned-links.js` は「参照先が存在しない」こと自体は検出できたが、実際の原因が「`task-workflow.md` は `unassigned-task/` を参照しているのに、実体ファイルが別ディレクトリへ配置されている」ことだと分かるまでに追加の手調査が必要だった。

### 1.2 問題点・課題

- 現行出力は `missing` の列挙が中心で、配置ドリフトの典型原因を即時に説明できない
- `unassigned-task/` と `completed-tasks/` のどちらへ移すべきかが、ログからは読み取りにくい
- Phase 12 の切り分け時間が余計にかかり、再監査コストが高止まりする

### 1.3 放置した場合の影響

- 同種の broken link を毎回手で辿ることになり、再発時の初動が遅い
- 完了済み未タスクの移管ミスと未実施未タスクの配置ミスが混同されやすい
- `verify-unassigned-links` を実行しても、修正方針の判断は属人化したまま残る

---

## 2. 何を達成するか（What）

### 2.1 目的

`verify-unassigned-links.js` の出力だけで、未タスク参照切れの原因候補と推奨修正先を即時に判断できる状態にする。

### 2.2 最終ゴール

- `missing` ごとに「参照側パス」「想定配置」「実体候補」の診断が表示される
- `unassigned-task/` 参照と `completed-tasks/` 実体のずれを明示できる
- Phase 12 成果物へ転記しやすい短い診断メッセージを標準化する

### 2.3 スコープ

#### 含むもの

- `verify-unassigned-links.js` の診断メッセージ改善
- `unassigned-task-guidelines.md` または関連ガイドへの運用追記
- 診断結果を確認するテストケース追加

#### 含まないもの

- 未タスクの自動移動
- `audit-unassigned-tasks.js` の仕様変更
- 全 backlog の一括再配置

### 2.4 成果物

- 改善済み `verify-unassigned-links.js`
- 診断メッセージのテスト
- ガイド更新（配置ドリフト時の読み方）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の Phase 12 検証フローを理解していること
- `docs/30-workflows/unassigned-task/` と `docs/30-workflows/completed-tasks/` の配置ルールを理解していること

### 3.2 依存タスク

| タスク                                                                | ステータス |
| --------------------------------------------------------------------- | ---------- |
| TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001                             | 完了       |
| task-imp-phase12-task-investigate-five-minute-card-sync-validator-001 | 未実施     |

### 3.3 必要な知識

- `verify-unassigned-links.js` の参照解決ロジック
- 未タスク配置ルール（未実施 / 完了済み / legacy）
- Phase 12 成果物の書き方

### 3.4 推奨アプローチ

1. まず既存の `missing` 出力を分類し、配置ドリフト・ID typo・参照先欠落の3種類に分ける
2. 配置ドリフトだけは「実体候補を探索して提案する」方向で出力を拡張する
3. Phase 12 成果物へそのまま転記できる短い定型文を作る

---

## 4. 実行手順

### Phase構成

- Phase A: 症状分類
- Phase B: 診断メッセージ設計
- Phase C: スクリプト更新
- Phase D: テスト・ガイド同期

### Phase A: 症状分類

#### 目的

どの missing が「配置ドリフト」なのかを機械的に判別できる条件を定義する。

#### 手順

1. `verify-unassigned-links.js` の現在の出力形式を確認する
2. 代表的な failure を 3 種類に分類する
3. 配置ドリフトに固有のヒント（同名ファイルの別配置）を定義する

#### 成果物

- failure 分類メモ
- 診断条件一覧

#### 完了条件

- 配置ドリフトを他の missing と区別する条件が書けている

### Phase B: 診断メッセージ設計

#### 目的

実行者が次アクションを即決できる出力形式を決める。

#### 手順

1. 「参照側」「期待配置」「実体候補」「推奨修正」の4項目を出力案に入れる
2. Phase 12 成果物に転記しやすい1〜2行の短文テンプレートを作る
3. typo / 実体欠落ケースと混同しない文言を選ぶ

#### 成果物

- 診断メッセージ案
- 転記テンプレート

#### 完了条件

- 配置ドリフト時の修正方針が出力だけで判断できる

### Phase C: スクリプト更新

#### 目的

`verify-unassigned-links.js` へ診断ロジックを実装する。

#### 手順

1. 別配置に同名ファイルが存在するか探索する
2. 配置ドリフト時のみ診断メッセージを追加する
3. 既存の PASS / FAIL 判定ロジックを崩さないことを確認する

#### 成果物

- 更新済みスクリプト

#### 完了条件

- 既存判定を維持したまま、配置ドリフトの原因説明が追加されている

### Phase D: テスト・ガイド同期

#### 目的

改善内容を再利用可能な形で固定する。

#### 手順

1. 配置ドリフトを再現するテストを追加する
2. ガイドへ「診断メッセージの読み方」を追記する
3. Phase 12 のサンプル転記文を残す

#### 成果物

- テスト
- ガイド追記

#### 完了条件

- テストで診断メッセージが固定され、ガイドから読み方が分かる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 配置ドリフトを検知したとき、実体候補パスを表示できる
- [ ] typo / 実体欠落とは別メッセージになる
- [ ] PASS / FAIL の既存判定を壊していない

### 品質要件

- [ ] テストで診断メッセージを固定している
- [ ] 既存の `verify-unassigned-links` 利用箇所との互換を保っている
- [ ] 出力が長すぎず、Phase 12 成果物へ転記できる

### ドキュメント要件

- [ ] 配置ドリフト時の読み方をガイドへ追記している
- [ ] 関連する Phase 12 成果物または教訓へ反映先を示している

---

## 6. 検証方法

### テストケース

- Case 1: 参照先と実体が一致する場合は PASS
- Case 2: `unassigned-task/` 参照だが実体が `completed-tasks/` にある場合、配置ドリフト診断が出る
- Case 3: 実体がどこにもない場合、従来どおり missing として出る

### 検証手順

1. スクリプト単体テストを実行する
2. サンプル参照ファイルで `verify-unassigned-links.js` を実行する
3. 出力文を Phase 12 成果物へ転記できる長さか確認する

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                            |
| ---------------------------------- | ------ | -------- | ----------------------------------------------- |
| 別配置探索が誤検知する             | 中     | 中       | 同名一致だけでなく expected path 規則も併用する |
| 出力が冗長になる                   | 低     | 中       | Phase 12 転記向け短文テンプレートを別に持つ     |
| 既存スナップショットテストが壊れる | 中     | 低       | 診断追加ケースを別テストに分離する              |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/unassigned-task/task-phase12-automation-enhancement.md`
- `docs/30-workflows/unassigned-task/task-imp-phase12-auto-verification.md`

### 参考資料

- `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/spec-update-summary.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
verify-unassigned-links が missing を出すだけで、unassigned-task 参照と実体配置ずれの原因が即時に分からない。
```

### 補足事項

- 本タスクは blocking バグではなく、Phase 12 再監査の切り分け速度を上げるための改善バックログである。
- 完了時は `docs/30-workflows/completed-tasks/unassigned-task/` への移管と、親タスク側の参照更新を同一ターンで行う。
