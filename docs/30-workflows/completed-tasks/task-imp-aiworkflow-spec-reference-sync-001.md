# UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001: Phase 12 仕様更新リンク同期ガード強化

## メタ情報

```yaml
issue_number: 903
task_id: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
task_name: Phase 12 仕様更新リンク同期ガード強化
category: 改善
target_feature: aiworkflow-requirements の Phase 12 台帳同期
priority: 中
scale: 小規模
status: 完了（spec_created）
source_phase: UT-IPC-AUTH-HANDLE-DUPLICATE-001 Phase 12 再確認
created_date: 2026-02-25
completed_date: 2026-02-25
dependencies:
  [UT-IPC-AUTH-HANDLE-DUPLICATE-001, UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001]
spec_path: docs/30-workflows/completed-tasks/task-imp-aiworkflow-spec-reference-sync-001.md
```

| 項目         | 値                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001                                                     |
| タスク名     | Phase 12 仕様更新リンク同期ガード強化                                                         |
| 分類         | 改善                                                                                          |
| 対象機能     | `aiworkflow-requirements` の Phase 12 台帳同期（`task-workflow.md` / `SKILL.md` / `LOGS.md`） |
| 優先度       | 中                                                                                            |
| 見積もり規模 | 小規模                                                                                        |
| ステータス   | 完了（spec_created）                                                                          |
| 発見元       | UT-IPC-AUTH-HANDLE-DUPLICATE-001 Phase 12 再確認                                              |
| 発見日       | 2026-02-25                                                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 でシステム仕様書を更新する際、実装内容自体は正しく反映できていても、未タスク台帳・完了タスク参照・スキル履歴の同期で手戻りが発生した。

### 1.2 問題点・課題

- `baseline` 監査結果と `current` 変更差分の判定を混同しやすい
- 未タスク完了後に `unassigned-task` 参照が残るリンク漏れが起こる
- 通常経路だけ更新し、fallback経路の記載を片側修正のまま残しやすい

### 1.3 放置した場合の影響

- Phase 12 の再監査コストが増大する
- 参照ドリフトにより後続タスクの探索精度が低下する
- 同種課題で毎回同じ確認漏れを繰り返す

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 での仕様更新を「実装内容反映」と「参照同期」の両面で一度に完了できる運用ガードを整備する。

### 2.2 最終ゴール

1. 台帳更新時に `unassigned` / `completed` 参照の整合を機械検証できる
2. `task-workflow.md` / `SKILL.md` / `LOGS.md` の3点同期をチェックリスト化する
3. 苦戦箇所を未タスク指示書へ必ず転記する手順を標準化する

### 2.3 スコープ

#### 含むもの

- `aiworkflow-requirements/references/task-workflow.md` の未タスク参照同期ルール強化
- `aiworkflow-requirements/SKILL.md` / `LOGS.md` の更新順序ルール明文化
- Phase 12 検証コマンド（リンク検証・索引再生成・SKILL検証）の実行手順整備

#### 含まないもの

- 既存の全未タスク指示書本文の一括リライト
- 実装コード（`apps/` / `packages/`）の仕様外改修

### 2.4 成果物

- 本未タスク指示書
- 同期ガード適用後の運用手順（`task-workflow.md` / `phase-11-12-guide.md` 更新）
- 検証ログ（`verify-unassigned-links` / `generate-index` / SKILL validate）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` と `aiworkflow-requirements` の参照更新権限がある
- Node.js 実行環境が利用可能
- 既存の Phase 12 成果物と台帳ファイルへアクセスできる

### 3.2 依存タスク

- UT-IPC-AUTH-HANDLE-DUPLICATE-001（完了済み、教訓の発見元）
- UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001（監査判定分離の前提）

### 3.3 必要な知識

- Phase 12 Step 1-A/1-C/1-D の更新責務
- `verify-unassigned-links.js` / `audit-unassigned-tasks.js` の使い分け
- `generate-index.js` による索引再同期

### 3.4 推奨アプローチ

- 先に「対象タスクIDでの参照同期待ち受け点」を `rg` で棚卸しする
- 次に台帳更新を行い、更新直後に機械検証を実行する
- 最後に苦戦箇所を `lessons-learned` または未タスク3.5へ確定記録する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                               | 発見経緯                             | 解決策                                                | 教訓                                     |
| ---------------------------------- | ------------------------------------ | ----------------------------------------------------- | ---------------------------------------- |
| `baseline` と `current` の判定混同 | 再監査で既存違反を今回差分違反と誤読 | 監査結果を「今回差分」と「既存資産」に分離記録        | 合否判定は差分起点で固定する             |
| 完了移管後のリンク更新漏れ         | `unassigned-task` 参照が残存         | `verify-unassigned-links.js` を台帳更新直後に必須実行 | 移管作業とリンク検証は同一手順で実施する |
| 通常/fallback 片側修正             | AUTH登録監査で記載抜けを検出         | 監査観点に「通常 + fallback 同時確認」を追加          | 片側更新を許容しないチェックリストにする |

---

## 4. 実行手順

### Phase構成

- Phase A: 現状差分と参照先の棚卸し
- Phase B: 台帳/履歴の同期ルール更新
- Phase C: 機械検証と再発防止記録

### Phase A: 現状棚卸し

#### 目的

参照同期が必要なファイルとタスクIDの出現箇所を特定する。

#### 手順

1. `rg` で対象タスクIDを `references/` 配下から抽出する
2. `task-workflow.md` の残課題テーブルの参照先を確認する
3. `SKILL.md` / `LOGS.md` の履歴更新有無を確認する

#### 成果物

- 参照棚卸しメモ（更新対象一覧）

#### 完了条件

- 更新対象ファイルと更新行の候補が確定している

### Phase B: 同期ルール更新

#### 目的

未タスク台帳とスキル履歴の同期漏れを防止する。

#### 手順

1. `task-workflow.md` の残課題テーブルへ未タスクを登録する
2. `SKILL.md` の変更履歴に反映内容を追記する
3. `LOGS.md` に実施ログと苦戦箇所を記録する

#### 成果物

- 更新済み台帳・履歴ファイル

#### 完了条件

- 3ファイルの記録内容が同一タスクIDで一致している

### Phase C: 機械検証

#### 目的

参照切れと索引不整合を検出し、再発防止手順を確定する。

#### 手順

1. `verify-unassigned-links.js` を実行する
2. `generate-index.js` を実行して索引を同期する
3. SKILL validator を実行して frontmatter/構造を検証する

#### 成果物

- 検証ログ

#### 完了条件

- リンク参照切れ0件、索引再生成成功、SKILL検証成功

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 未タスク台帳に本タスクが登録されている
- [ ] 苦戦箇所が 3.5 セクションに記録されている
- [ ] `task-workflow.md` / `SKILL.md` / `LOGS.md` の3点同期が完了している

### 品質要件

- [ ] `verify-unassigned-links.js` で参照切れ0件
- [ ] `generate-index.js` 実行後に索引が再同期されている
- [ ] SKILL validator で対象スキルが有効判定になる

### ドキュメント要件

- [ ] Why/What/How が具体的に記載されている
- [ ] スコープ内外が明示されている
- [ ] 実行手順が Phase 単位で再現可能に記述されている

---

## 6. 検証方法

### テストケース

- Case 1: 本タスクの未タスク指示書が required heading を全て含む
- Case 2: `task-workflow.md` の参照先が実在する
- Case 3: 索引再生成後に `aiworkflow-requirements` の topic/keyword 索引が更新される

### 検証手順

1. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --unassigned-dir <tmp> --completed-unassigned-dir <tmp-empty>`
2. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md`
3. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
4. `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements --verbose`

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                           |
| -------------------------- | ------ | -------- | ---------------------------------------------- |
| 履歴更新の片側漏れ         | 中     | 中       | 3ファイル同時更新をPR前チェック項目に固定する  |
| 既存baseline違反の誤読     | 中     | 高       | current/baseline を分離した検証ログを保存する  |
| 索引未再生成による参照ずれ | 低     | 中       | `generate-index.js` を台帳更新後に必ず実行する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`
- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- `/Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/SKILL.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

なし

### 補足事項

- 本タスクは「個別不具合修正」ではなく「Phase 12 運用の再発防止」が目的
- 同種課題を20分以内に再現可能な形で解決することを完了基準に含める
