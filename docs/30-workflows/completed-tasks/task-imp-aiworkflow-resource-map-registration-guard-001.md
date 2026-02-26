# UT-IMP-AIWORKFLOW-RESOURCE-MAP-REGISTRATION-GUARD-001: aiworkflow-requirements リソースマップ登録ガード強化

## メタ情報

| 項目         | 内容                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-AIWORKFLOW-RESOURCE-MAP-REGISTRATION-GUARD-001                                       |
| タスク名     | aiworkflow-requirements リソースマップ登録ガード強化                                        |
| 分類         | 改善                                                                                        |
| 対象機能     | `aiworkflow-requirements` の仕様追加運用（`references/` と `indexes/resource-map.md` 同期） |
| 優先度       | 中                                                                                          |
| 見積もり規模 | 中規模                                                                                      |
| ステータス   | 未実施                                                                                      |
| 発見元       | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001 Phase 12 再監査（仕様書最適化作業）                    |
| 発見日       | 2026-02-25                                                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 で `workflow-skill-identifier-branded-type-resolution.md` を新規追加した際、`topic-map.md` / `keywords.json` は `generate-index.js` で更新できたが、`indexes/resource-map.md` のクイックルックアップとカテゴリ行は手動反映が必要だった。

### 1.2 問題点・課題

- 新規仕様書を追加しても `resource-map.md` が自動同期されず、導線漏れが発生しやすい
- `generate-index.js` 実行だけで「索引同期完了」と誤認しやすい
- 仕様追加ごとに手動判断が必要で、担当者依存の運用になる

### 1.3 放置した場合の影響

- 仕様は存在するが、参照導線がない状態が継続する
- 後続タスクで正本仕様を見つけにくくなり、再調査コストが増加する
- Phase 12 の仕様同期品質（Step 1-D相当）が不安定化する

---

## 2. 何を達成するか（What）

### 2.1 目的

`references/*.md` 追加時に `indexes/resource-map.md` の登録漏れを機械的に検出できる運用にする。

### 2.2 最終ゴール

1. `references` 追加・更新時の `resource-map` 同期チェックが標準手順化されている
2. 追加仕様の「クイックルックアップ」と「カテゴリ別ガイド」登録漏れを自動検出できる
3. Phase 12 完了判定に `resource-map` 同期確認が含まれている

### 2.3 スコープ

#### 含むもの

- `aiworkflow-requirements` の `resource-map.md` 同期ルール整備
- 同期漏れ検出のためのスクリプト/チェック手順追加
- Phase 12 手順書と運用ログへの反映

#### 含まないもの

- `references` 全150ファイルの大規模再分類
- `topic-map.md` 生成ロジックの全面刷新
- 他スキルの `resource-map` 仕様変更

### 2.4 成果物

| 成果物                 | パス                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| 未タスク仕様書（本書） | `docs/30-workflows/unassigned-task/task-imp-aiworkflow-resource-map-registration-guard-001.md` |
| 残課題台帳反映         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                           |
| 関連仕様更新           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`              |
| 運用ログ               | `.claude/skills/aiworkflow-requirements/LOGS.md`                                               |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `aiworkflow-requirements` の `references/` / `indexes/` 構成を理解している
- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行できる
- Phase 12 仕様更新フロー（Step 1-A〜1-E）を把握している

### 3.2 依存タスク

| タスクID                                  | 状態 | 依存種別                     |
| ----------------------------------------- | ---- | ---------------------------- |
| UT-TYPE-SKILL-IDENTIFIER-BRANDED-001      | 完了 | 親タスク（苦戦箇所の発生源） |
| UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 | 完了 | 先行タスク（リンク同期運用） |

### 3.3 必要な知識

- `aiworkflow-requirements/scripts/generate-index.js` の生成対象（topic-map / keywords）
- `indexes/resource-map.md` のクイックルックアップ構造
- Phase 12 での未タスク登録・台帳同期ルール

### 3.4 推奨アプローチ

1. `resource-map.md` の登録要件（クイックルックアップ + カテゴリ）をチェックリスト化する
2. `references` の追加差分と `resource-map` 登録有無を突合する検証ステップを追加する
3. Phase 12 の完了判定に「resource-map 同期確認」を必須項目として組み込む

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                             | 発見経緯                                                                            | 解決策                                                | 教訓                                           |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| 新規仕様追加時に `resource-map` 登録が漏れやすい | `workflow-skill-identifier-branded-type-resolution.md` 追加時に手動追記が必要だった | 追加仕様の登録チェックを機械判定（差分突合）する      | 索引再生成と導線登録は別工程として扱う         |
| `generate-index.js` 実行で同期完了と誤認しやすい | topic-map/keywords は更新されたが resource-map は未更新だった                       | Phase 12 に `resource-map` 専用確認ステップを追加する | 自動更新対象と手動更新対象を明示分離する       |
| 表構造の揺れで手動編集ミスが起きる               | `resource-map` の章構成により差し込み位置の判断がぶれた                             | 追加位置を規約化し、失敗時は `rg` で検証する          | 大規模表は編集規約と検証コマンドをセットで持つ |

---

## 4. 実行手順

### Phase構成

- Phase 1: 現状分析（同期漏れパターン抽出）
- Phase 2: 同期ガード設計（検出ルール・判定基準）
- Phase 3: 運用反映（手順書・台帳・検証コマンド）

### Phase 1: 現状分析

#### 目的

`resource-map` 同期漏れの発生条件を定義する。

#### 手順

1. `references` の追加履歴と `resource-map` 反映履歴を比較
2. 追加仕様がクイックルックアップ/カテゴリに載る条件を整理
3. 漏れケースを「検出可能な条件」に変換

#### 成果物

- 同期漏れパターン一覧

#### 完了条件

- 漏れ条件が機械検出可能なルールとして定義されている

### Phase 2: 同期ガード設計

#### 目的

`resource-map` 未登録を fail できるチェック方式を設計する。

#### 手順

1. `references` 差分に対する登録チェックルールを定義
2. `task-specification-creator` の Phase 12 手順へ組み込む前提を整理
3. warning/fail の判定境界を決定

#### 成果物

- 同期ガード仕様（判定条件 + 実行コマンド）

#### 完了条件

- 判定条件が文書化され、再実行時に同じ結果が得られる

### Phase 3: 運用反映

#### 目的

Phase 12 の実運用に `resource-map` 同期確認を定着させる。

#### 手順

1. `aiworkflow-requirements` の関連文書へチェック手順を反映
2. `task-specification-creator` 側に必要なら検証ステップを追記
3. 検証コマンド実行結果をログへ記録

#### 成果物

- 更新済み仕様書/ログ

#### 完了条件

- 新規仕様追加時に `resource-map` 未同期を検出できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `resource-map` 同期漏れ検出ルールが定義されている
- [ ] クイックルックアップ/カテゴリ両方の登録確認が可能である
- [ ] Phase 12 フローに同期確認手順が組み込まれている

### 品質要件

- [ ] 同じ差分入力で同じ判定結果になる
- [ ] 手動判断なしで漏れ検知できる
- [ ] 既存運用（verify-unassigned-links 等）を壊さない

### ドキュメント要件

- [ ] 未タスク台帳に登録済み
- [ ] 苦戦箇所（3.5）が反映済み
- [ ] 関連仕様書への参照が明記されている

---

## 6. 検証方法

### テストケース

| テストケース                                          | 期待結果                                |
| ----------------------------------------------------- | --------------------------------------- |
| `references` に新規仕様を追加し `resource-map` 未更新 | 同期漏れとして検出される                |
| `resource-map` を規約どおり更新後に再検証             | fail が解消される                       |
| `generate-index.js` 実行のみ                          | `resource-map` 未更新なら別途検出される |

### 検証手順

1. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
2. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
3. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-aiworkflow-resource-map-registration-guard-001.md`

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                   |
| ----------------------------------------- | ------ | -------- | -------------------------------------- |
| 判定条件を厳しくしすぎて運用負荷が増える  | 中     | 中       | warning→fail の段階導入で調整する      |
| `resource-map` 手動更新ルールが複雑化する | 中     | 中       | 追加位置規約を固定し、編集例を併記する |
| 既存ファイルとの整合で誤検知が出る        | 低     | 中       | 差分対象（新規/変更）限定で判定する    |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-skill-identifier-branded-type-resolution.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 参考資料

- `UT-TYPE-SKILL-IDENTIFIER-BRANDED-001` Phase 12 成果物
- `UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001` 完了記録

---

## 9. 備考

### 補足事項

- 本タスクは「新規仕様追加時の導線同期漏れ防止」を目的とし、`references` 本文の内容変更は対象外とする。
- 実装時は `task-specification-creator` の未タスク作成ガイド（Why/What/How + 3.5 教訓反映）を必ず維持する。
