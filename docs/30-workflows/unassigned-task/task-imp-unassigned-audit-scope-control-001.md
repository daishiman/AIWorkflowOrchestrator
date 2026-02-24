# UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001: 未タスク監査の対象スコープ制御とベースライン分離

## メタ情報

```yaml
issue_number: 898
```

## メタ情報

| 項目         | 値                                                        |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001                 |
| タスク名     | 未タスク監査の対象スコープ制御とベースライン分離          |
| 分類         | 改善                                                      |
| 対象機能     | `unassigned-task` 監査運用（`audit-unassigned-tasks.js`） |
| 優先度       | 中                                                        |
| 見積もり規模 | 中規模                                                    |
| ステータス   | 未着手                                                    |
| 発見元       | UT-IPC-DATA-FLOW-TYPE-GAPS-001 Phase 12 再監査            |
| 発見日       | 2026-02-24                                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 12 の未タスク監査で、`docs/30-workflows/unassigned-task/` 全体を対象に `audit-unassigned-tasks.js` を実行すると、過去資産由来の違反が大量検出される。

### 1.2 問題点・課題

- 今回変更した未タスク1件が準拠していても、全体違反に埋もれて判定が不明瞭になる
- 「今回起因の違反」と「既存ベースライン違反」が混在し、修正優先度を誤る
- Phase 12 での完了判定が、対象外ノイズで遅延しやすい

### 1.3 放置した場合の影響

- 未タスク登録のスピードが落ち、追跡漏れが増える
- 監査レポートが実運用で使われず形骸化する
- 同種課題で同じ切り分け作業を毎回手作業で繰り返す

---

## 2. 何を達成するか（What）

### 2.1 目的

未タスク監査を「全体監査」と「対象監査」に分離し、今回実装分の合否を即時判定できる運用にする。

### 2.2 最終ゴール

1. `audit-unassigned-tasks.js` に対象限定監査（ファイル指定または差分指定）を追加する
2. 監査結果を `current`（今回起因）と `baseline`（既存）で分離表示できるようにする
3. Phase 12 の未タスク運用手順に、対象監査 → 全体監査の順序を標準化する

### 2.3 スコープ

#### 含むもの

- `audit-unassigned-tasks.js` の対象スコープ制御拡張
- `task-specification-creator` 側の運用ガイド更新
- 検証コマンドと判定基準の明文化

#### 含まないもの

- 既存67件の未タスク指示書本文の一括修正
- `unassigned-task` 全ファイルの全面フォーマット統一作業

### 2.4 成果物

- 改修済み `audit-unassigned-tasks.js`
- 更新済み運用ガイド（`unassigned-task-guidelines.md` など）
- 対象監査/全体監査の実行結果ログ

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 実行環境が利用可能
- `task-specification-creator` スキルの script/references にアクセス可能
- `aiworkflow-requirements` の残課題台帳（`task-workflow.md`）を更新可能

### 3.2 依存タスク

- `UT-IMP-UNASSIGNED-FORMAT-NORMALIZATION-001`（既存未準拠群の本体是正タスク）

### 3.3 必要な知識

- Phase 12 未タスク運用ルール
- 未タスク指示書テンプレート（Why/What/How + 1-9セクション）
- `task-workflow.md` 残課題管理ルール

### 3.4 推奨アプローチ

- 先に「対象監査」を成功させて今回変更分の合否を確定
- 次に「全体監査」でベースライン違反を別管理
- 監査結果は CI で fail 条件を分離（current fail / baseline warn）

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                           | 発見経緯                                                      | 解決策                                                | 教訓                                                 |
| ---------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| 全体監査ノイズで今回変更分の合否が判定しづらい | `audit-unassigned-tasks.js --json` で過去違反が多数検出       | 対象ファイル限定監査を追加し、current/baseline を分離 | 監査は「差分の合否判定」と「資産健全性監視」を分ける |
| 成果物台帳の二重管理で同期漏れが起きやすい     | `artifacts.json` と `outputs/artifacts.json` の同期作業で発生 | 対象監査結果と台帳同期チェックを同一フローへ統合      | 検証と台帳更新は別工程にしない                       |
| スキル定義の制約超過を後段で検出しやすい       | `quick_validate.py` で frontmatter `description` 長さ制約違反 | 変更直後に `quick_validate.py` を必須実行             | 仕様更新は「編集→即検証」を1セット化する             |

---

## 4. 実行手順

### Phase構成

- Phase A: 監査要件定義（対象/全体の判定分離）
- Phase B: 監査スクリプト改修
- Phase C: ガイドライン反映
- Phase D: 検証と台帳同期

### Phase A: 要件定義

#### 目的

対象監査と全体監査の責務を明確化する。

#### 手順

1. 現行 `audit-unassigned-tasks.js` の入力オプションを確認する
2. `--target-file` または `--diff-from` の要件を定義する
3. 出力フォーマット（`current`/`baseline`）を決定する

#### 成果物

- 監査モード仕様メモ

#### 完了条件

- 新オプションと出力形式が確定している

### Phase B: スクリプト改修

#### 目的

対象スコープ制御と結果分類を実装する。

#### 手順

1. `audit-unassigned-tasks.js` に対象限定ロジックを追加する
2. 結果 JSON に `currentViolations` / `baselineViolations` を追加する
3. exit code 判定を `current` 基準へ変更可能にする

#### 成果物

- 改修済みスクリプト

#### 完了条件

- 対象監査で対象外ファイルが評価対象に入らない

### Phase C: ガイドライン反映

#### 目的

運用手順へ新監査フローを反映する。

#### 手順

1. `unassigned-task-guidelines.md` に対象監査手順を追記する
2. `phase-11-12-guide.md` に判定順序（対象→全体）を追記する
3. 実行例コマンドを追加する

#### 成果物

- 更新済みガイドライン

#### 完了条件

- 新規運用者が手順だけで同じ判定に到達できる

### Phase D: 検証

#### 目的

監査モードの有効性を確認する。

#### 手順

1. 対象1ファイルで監査し、違反0を確認する
2. 全体監査を実行し、baseline違反件数を確認する
3. `verify-unassigned-links.js` でリンク整合を確認する

#### 成果物

- 監査結果ログ

#### 完了条件

- current と baseline が分離表示され、判定誤りがない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 対象スコープを指定した監査が実行できる
- [ ] 監査結果が current/baseline に分離される
- [ ] current違反0件を完了判定に利用できる

### 品質要件

- [ ] `audit-unassigned-tasks.js` の新オプションにテストが追加されている
- [ ] 既存オプション互換が維持されている
- [ ] 判定ロジックがドキュメントと一致している

### ドキュメント要件

- [ ] `unassigned-task-guidelines.md` に新手順が反映されている
- [ ] `phase-11-12-guide.md` に判定順序が反映されている
- [ ] `task-workflow.md` の残課題テーブルに登録済み

---

## 6. 検証方法

### テストケース

- Case 1: 対象1ファイル監査で違反0件
- Case 2: 全体監査で baseline違反が計上される
- Case 3: 対象外違反が current 側に混入しない

### 検証手順

1. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-unassigned-audit-scope-control-001.md`
2. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json`
3. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
4. `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py .claude/skills/task-specification-creator`

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                 |
| -------------------------------- | ------ | -------- | ---------------------------------------------------- |
| 判定条件の複雑化で誤判定が起きる | 中     | 中       | `current` 判定条件を最小化し、テストケースで固定する |
| 既存監査利用者の運用が破綻する   | 中     | 低       | 既存オプション互換を維持し、新モードは追加方式にする |
| 全体健全性の課題が見えなくなる   | 中     | 低       | 全体監査を廃止せず baseline 指標として継続する       |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/documentation-changelog.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`
- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
- `/Users/dm/.codex/skills/.system/skill-creator/SKILL.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

なし

### 補足事項

- 本タスクは「全未タスクの本文是正」ではなく「監査運用の判定精度向上」が目的
- 既存の本文是正は `UT-IMP-UNASSIGNED-FORMAT-NORMALIZATION-001` と並行で実施する
