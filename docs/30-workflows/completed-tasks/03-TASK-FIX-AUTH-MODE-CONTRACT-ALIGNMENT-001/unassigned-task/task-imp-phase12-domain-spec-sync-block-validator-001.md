# Phase 12 domain spec 同期ブロック検証ガード - タスク指示書

## メタ情報

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-DOMAIN-SPEC-SYNC-BLOCK-VALIDATOR-001                             |
| タスク名     | Phase 12 domain spec 同期ブロック検証ガード                                     |
| 分類         | 改善                                                                            |
| 対象機能     | Phase 12 の domain spec 同期（`interfaces-auth.md` / `api-ipc-system.md` など） |
| 優先度       | 中                                                                              |
| 見積もり規模 | 中規模                                                                          |
| ステータス   | 未実施                                                                          |
| 発見元       | `TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001` Phase 12 再確認                     |
| 発見日       | 2026-03-06                                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

auth-mode 契約整合タスクの Phase 12 で、`interfaces-auth.md` と `api-ipc-system.md` に `実装内容（要点）` / `苦戦箇所（再利用形式）` / `同種課題の5分解決カード` を手動で追加し、domain spec 単体でも再利用できる粒度へ整えた。  
一方で、現行の `verify-all-specs` / `validate-phase-output` / `audit-unassigned-tasks` では、更新対象 domain spec にこの3ブロックが揃っているかを機械検証できない。

### 1.2 問題点・課題

- `task-workflow.md` と `lessons-learned.md` の同期が済んでいても、domain spec 側だけが契約表のみで薄い状態のまま完了扱いになり得る
- `phase12-domain-spec-sync-block-template.md` で書き方は定義したが、実行時のチェックゲートがないため守るかどうかが属人化する
- Phase 12 の再監査で「実装内容は記録したが、苦戦箇所と5分解決カードが domain spec にない」という後追い修正が発生しやすい

### 1.3 放置した場合の影響

- domain spec が再び「契約定義だけの文書」に戻り、同種課題の初動短縮に使えない
- `task-workflow` / `lessons` / domain spec の3点で知見の粒度がずれ、再利用時にどれを正本にすべきか迷う
- auth-mode で解消したはずの後追い文書修正が、別IPC・別UI契約タスクでも再発する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 で更新対象になった domain spec に対し、標準3ブロックの存在を機械検証できるようにする。

### 2.2 最終ゴール

- 更新対象 domain spec を抽出できる
- 各対象ファイルに `### 実装内容（要点）` / `### 苦戦箇所（再利用形式）` / `### 同種課題の5分解決カード` が存在する
- 欠落時に「対象ファイル」「不足見出し」「推奨修正先テンプレート」を表示できる
- Phase 12 の検証チェーンへ組み込み、完了判定前に欠落を止められる

### 2.3 スコープ

#### 含むもの

- 更新対象 domain spec の抽出ルール定義
- 3ブロック存在検証のスクリプト追加、または既存検証スクリプトへの統合
- `task-specification-creator` / `aiworkflow-requirements` ガイド更新
- テストケース追加

#### 含まないもの

- 既存の全 domain spec を一括で全面改稿する作業
- ブロック本文の文章品質を自然言語評価する仕組み
- 5分解決カード全文の厳格一致検証（これは別未タスク `UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001` の主担当）

### 2.4 成果物

- domain spec 3ブロック検証スクリプト
- 正常系/異常系テスト
- Phase 12 ガイドの追記
- system spec 反映ルールの更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `assets/phase12-domain-spec-sync-block-template.md` が標準ブロック定義として存在していること
- `task-workflow.md` / `lessons-learned.md` / domain spec の3点同期方針を理解していること
- `verify-all-specs` / `validate-phase-output` の既存責務を把握していること

### 3.2 依存タスク

| タスク                                                              | ステータス |
| ------------------------------------------------------------------- | ---------- |
| TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001                           | 完了       |
| UT-IMP-PHASE12-UNASSIGNED-LINK-DIAGNOSTICS-001                      | 未実施     |
| UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 | 未実施     |

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `.claude/skills/skill-creator/assets/phase12-domain-spec-sync-block-template.md`

### 3.4 推奨アプローチ

1. まず「何を domain spec と見なすか」「更新対象をどう抽出するか」を決める
2. 次に見出し存在検証だけを小さく実装し、過剰な本文評価を避ける
3. 欠落時は file path / missing heading / template path を短文で返す
4. 最後に Phase 12 ガイドへコマンド・失敗時の次アクション・同期先を追記する

### 3.5 親タスクで苦戦した箇所（再利用形式）

| 苦戦箇所                                                           | 再発条件                                                                                                                      | 今回の対処                                                                                                   | 標準ルール                                                                                                      |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| domain spec が契約表だけ更新され、知見ブロックが後追いになりやすい | `interfaces` / `api-ipc` の契約表を直した時点で完了扱いにし、`実装内容` / `苦戦箇所` / `5分解決カード` の存在確認をしない場合 | `interfaces-auth.md` と `api-ipc-system.md` に3ブロックを手動で補い、残課題を本未タスクとして formalize した | Phase 12 は更新対象 domain spec に標準3ブロックが揃っていることを機械検証できるまで閉じない                     |
| `task-workflow` / `lessons` と domain spec の粒度がずれやすい      | 実装教訓を `task-workflow` と `lessons` にだけ書き、domain spec では型・チャネル表だけに留める場合                            | auth-mode では同じ語彙で3仕様書を揃えたうえで、テンプレート化と未タスク化まで実施した                        | 「task-workflow / lessons / domain spec」は実装要点と苦戦箇所の語彙を揃え、domain spec だけ薄い状態を許容しない |

---

## 4. 実行手順

### Phase構成

- Phase A: 対象判定ルール定義
- Phase B: 検証仕様設計
- Phase C: スクリプト実装とテスト
- Phase D: ガイドと system spec 同期

### Phase A: 対象判定ルール定義

#### 目的

どのファイルを「Phase 12 で更新対象になった domain spec」と見なすかを定義する。

#### 手順

1. `references/` 配下のうち domain spec に該当するファイル群を整理する
2. workflow 差分、成果物参照、または明示入力のどれで対象を特定するか決める
3. `task-workflow` / `lessons` / cross-cutting doc と domain spec を区別する条件を明文化する

#### 成果物

- 対象判定ルール一覧
- 対象外ファイル条件一覧

#### 完了条件

- validator が何を検査対象にするかを他者が誤読しない形で説明できる

### Phase B: 検証仕様設計

#### 目的

3ブロック欠落時に、次アクションが即決できる出力仕様を定める。

#### 手順

1. `実装内容（要点）` / `苦戦箇所（再利用形式）` / `同種課題の5分解決カード` の3見出しを固定する
2. 欠落時の出力に `file` / `missing headings` / `template path` / `suggested action` を含める
3. 既存の5分解決カード同期 validator と責務が重ならない境界を決める

#### 成果物

- 検証仕様
- エラーメッセージ雛形

#### 完了条件

- 欠落ケースと責務境界を説明できる

### Phase C: スクリプト実装とテスト

#### 目的

3ブロックの存在検証を自動化し、正常系/異常系を固定する。

#### 手順

1. `task-specification-creator` 側へ新規スクリプトを追加するか、既存検証スクリプトへ統合する
2. 更新対象 domain spec の見出し存在を検査する
3. 欠落1件、欠落複数件、全件存在のテストを追加する

#### 成果物

- 実装済みスクリプト
- テスト

#### 完了条件

- 3パターン以上のテストで判定結果が固定される

### Phase D: ガイドと system spec 同期

#### 目的

validator を運用へ組み込み、Phase 12 完了条件に接続する。

#### 手順

1. `spec-update-workflow.md` などへ実行コマンドを追記する
2. `aiworkflow-requirements` 側に domain spec 3ブロック必須ルールを同期する
3. 失敗時に未タスク化すべき条件と、即時修正で閉じる条件を明記する

#### 成果物

- ガイド更新
- system spec 更新

#### 完了条件

- 実行者が validator 実行から修正先判断まで迷わない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 更新対象 domain spec の3ブロック存在を検証できる
- [ ] 欠落見出しを file path 付きで出力できる
- [ ] 責務が `UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001` と重複していない

### 品質要件

- [ ] 正常系/異常系のテストを追加している
- [ ] 既存の `verify-all-specs` / `validate-phase-output` 運用を壊していない
- [ ] 出力が Phase 12 成果物へ転記できる長さに収まっている

### ドキュメント要件

- [ ] `task-workflow.md` に関連未タスクとして登録されている
- [ ] `lessons-learned.md` に親タスク由来の苦戦箇所と関連未タスクが同期されている
- [ ] 少なくとも1つの domain spec（`interfaces-auth.md` または `api-ipc-system.md`）に残課題導線が同期されている

---

## 6. 検証方法

### テストケース

- Case 1: 更新対象 domain spec に3ブロックが揃っている場合、PASS
- Case 2: `苦戦箇所（再利用形式）` が欠落している場合、FAIL
- Case 3: domain spec 以外のファイルは対象外として誤検知しない

### 検証手順

```bash
# 1) 未タスク指示書の配置・フォーマット監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/unassigned-task/task-imp-phase12-domain-spec-sync-block-validator-001.md

# 2) 参照リンク整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 3) 親workflowの再監査
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 \
  --strict
```

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                                |
| -------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------- |
| domain spec 判定が広すぎて大量の既存文書を巻き込む | 中     | 中       | 初期は対象ファイルの明示指定または workflow 差分ベースで始める                      |
| 5分解決カード同期 validator と責務が重複する       | 中     | 中       | 「本タスクは3ブロック存在」「既存未タスクはカード同期内容」を境界として固定する     |
| 見出し名の表記ゆれで誤検知する                     | 中     | 低       | 初期は標準見出しを厳密一致にし、変更時は template と validator を同一ターン更新する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `.claude/skills/skill-creator/assets/phase12-domain-spec-sync-block-template.md`

### 参考資料

- `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/unassigned-task-detection.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
タスク仕様書作成skill（/.claude/skills/task-specification-creator/）に従って未タスクを未タスクディレクトリ（/docs/30-workflows/unassigned-task/）に作成して。
未タスク仕様書を作成してください。合わせて、同未タスク仕様書に今回実装に苦戦した箇所も記述してください。
これは、同じような課題を簡潔に解決するために必要です。そして、システムの仕様書スキルの内容も反映させること。
```

### 補足事項

- 本タスクは auth-mode で顕在化した運用ギャップを、次の IPC / UI / domain spec タスクへ再利用可能な形で固定するための改善バックログである。
- `phase12-domain-spec-sync-block-template.md` を追加しただけでは完了ではなく、validator 導入で初めて運用ガードになる。
