# UT-IMP-TASK-UI-01-PHASE12-EVIDENCE-CLEANUP-GUARD-001: TASK-UI-01 Phase 12 証跡同期・cleanup ガード

## メタ情報

```yaml
task_id: UT-IMP-TASK-UI-01-PHASE12-EVIDENCE-CLEANUP-GUARD-001
task_name: TASK-UI-01 Phase 12 証跡同期・cleanup ガード
category: 改善
target_feature: TASK-UI-01-STORE-IPC-ARCHITECTURE の Phase 11/12 再確認運用
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-UI-01-STORE-IPC-ARCHITECTURE Phase 12 再確認
created_date: 2026-03-05
dependencies:
  - UT-UI-01-NAV-ACCESSIBILITY-POLISH-001
  - UT-UI-01-PLACEHOLDER-GUIDANCE-001
```

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-UI-01-PHASE12-EVIDENCE-CLEANUP-GUARD-001          |
| タスク名     | TASK-UI-01 Phase 12 証跡同期・cleanup ガード                  |
| 分類         | 改善                                                          |
| 対象機能     | TASK-UI-01 再監査運用（画面証跡・検証コマンド・プロセス管理） |
| 優先度       | 中                                                            |
| 見積もり規模 | 小規模                                                        |
| ステータス   | 未実施                                                        |
| 発見元       | TASK-UI-01-STORE-IPC-ARCHITECTURE Phase 12 再確認             |
| 発見日       | 2026-03-05                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-01 の Phase 12 再確認で、機能自体は完了していても、再監査運用における再発ポイント（コマンド経路、証跡時刻、プロセス残留）が繰り返し発生しやすいことが確認された。

### 1.2 問題点・課題

- 検証コマンドをグローバルCLI前提で実行すると、環境差分で再監査が停止しやすい
- UI再撮影後の時刻同期が漏れると、成果物間で証跡整合が崩れる
- `vite` / `capture-*` の残留プロセスが次工程の検証を不安定化する

### 1.3 放置した場合の影響

- 再監査の再現性が低下し、工数が増える
- 証跡整合が崩れてレビュー説明コストが増える
- ポート競合や誤判定で Phase 11/12 の品質ゲートが不安定になる

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-UI-01 系の UI再確認運用を、再現可能な標準手順として固定する。

### 2.2 最終ゴール

1. 検証コマンドがローカル実体パスで固定される
2. 画面証跡時刻が成果物・台帳で同値同期される
3. 再撮影後 cleanup が完了条件に組み込まれる

### 2.3 スコープ

#### 含むもの

- Phase 11/12 再確認コマンドの実体パス固定
- `manual-test-result.md` / `screenshot-coverage.md` の時刻同期手順
- 再撮影後の残留プロセス確認・停止手順
- `task-workflow.md` / `lessons-learned.md` の運用導線同期

#### 含まないもの

- UI機能本体（AppDock/Workspace/HistorySearch）の機能追加
- IPC契約の新規追加・仕様変更

### 2.4 成果物

- 運用ガードの未タスク指示書（本ファイル）
- `task-workflow.md` 残課題テーブルの追記
- `lessons-learned.md` 関連未タスク導線の追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/` の成果物が存在する
- `task-specification-creator` の監査スクリプトが実行可能

### 3.2 依存タスク

- `TASK-UI-01-STORE-IPC-ARCHITECTURE`（完了）

### 3.3 必要な知識

- Phase 11/12 の証跡運用（再撮影・coverage検証）
- `audit-unassigned-tasks` の current/baseline 判定
- `task-workflow.md` / `lessons-learned.md` の同期ルール

### 3.4 推奨アプローチ

1. 監査コマンドは必ず `node .claude/skills/task-specification-creator/scripts/*.js` で実行する
2. UI再撮影後は時刻同期と coverage 検証を同一ターンで実施する
3. `ps -ef` による残留確認と cleanup を完了条件に含める

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                       | 発見経緯                                                                | 解決策                                                                                               | 教訓                                                           |
| -------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 検証コマンド経路のドリフト | グローバルCLI前提で `not found` / `MODULE_NOT_FOUND` が発生しやすかった | 実体経路（`node .claude/skills/task-specification-creator/scripts/*.js`）へ固定した                  | 再監査は「実体探索→固定コマンド実行→結果転記」の順を標準化する |
| UI証跡時刻の同期漏れ       | 再撮影後、成果物間で時刻が不一致になりやすかった                        | `stat` で実時刻を確認し、`manual-test-result.md` / `screenshot-coverage.md` / 仕様台帳へ同値反映した | UI再撮影は「再取得→時刻同期→coverage検証」を1セットで行う      |
| 再撮影後の残留プロセス     | `vite` / `capture-*` が残って次工程で競合が発生しやすかった             | `ps -ef` で残留確認し不要プロセスを停止してから次工程へ進めた                                        | 再撮影タスクは cleanup 完了までを Done 定義にする              |

---

## 4. 実行手順

### Phase構成

- Phase A: 監査経路固定
- Phase B: UI証跡同期
- Phase C: cleanup 固定化
- Phase D: 仕様台帳同期

### Phase A: 監査経路固定

#### 目的

コマンド実行経路の揺れを排除する。

#### 手順

1. `rg --files .claude/skills/task-specification-creator/scripts` で実体を確認する
2. `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` の実行コマンドを絶対に `node .../scripts/*.js` 形式で固定する

#### 成果物

コマンド固定手順と実行ログ

#### 完了条件

グローバルCLI非依存で同一結果が再現できること

### Phase B: UI証跡同期

#### 目的

画面証跡の時刻整合を固定する。

#### 手順

1. UI再撮影を実施する
2. `stat` / `ls -lt` で最新時刻を確認する
3. `manual-test-result.md` / `screenshot-coverage.md` / 台帳へ同値反映する

#### 成果物

時刻同期済みの Phase 11 成果物

#### 完了条件

成果物間で時刻不一致がないこと

### Phase C: cleanup 固定化

#### 目的

再撮影後の残留プロセスを確実に除去する。

#### 手順

1. `ps -ef | rg "capture-.*phase11|vite" | rg -v rg || true` を実行する
2. 残留時は停止し、実施結果を `documentation-changelog.md` へ記録する

#### 成果物

cleanup 実施ログ

#### 完了条件

不要プロセス残留が解消されていること

### Phase D: 仕様台帳同期

#### 目的

再発防止ルールを system spec に固定する。

#### 手順

1. `task-workflow.md` 残課題テーブルへ本未タスクを登録する
2. `lessons-learned.md` 関連未タスクへ導線を追加する
3. 変更履歴を更新する

#### 成果物

更新済み `task-workflow.md` / `lessons-learned.md`

#### 完了条件

仕様台帳と未タスク指示書のリンクが双方向で解決できること

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 監査コマンド経路固定手順が定義されている
- [ ] UI証跡時刻同期手順が定義されている
- [ ] 再撮影後 cleanup 手順が定義されている

### 品質要件

- [ ] `validate-phase11-screenshot-coverage` が PASS する
- [ ] `audit-unassigned-tasks --diff-from HEAD` の `currentViolations=0` を維持する
- [ ] 再監査時に同手順を再現できる

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] `lessons-learned.md` の関連未タスクに導線がある

---

## 6. 検証方法

### テストケース

- Case 1: 実体パス固定コマンドで Phase 12 監査が通る
- Case 2: UI証跡時刻が成果物間で一致する
- Case 3: 再撮影後 cleanup が実施される

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture
ps -ef | rg "capture-.*phase11|vite" | rg -v rg || true
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                         |
| -------------------------------- | ------ | -------- | ------------------------------------------------------------ |
| ルールが文書化のみで運用されない | 中     | 中       | 完了条件チェックリストにコマンド証跡を必須化する             |
| cleanup の実施漏れ               | 中     | 中       | `documentation-changelog.md` に cleanup 実施記録を必須化する |
| baseline違反を今回差分違反と誤読 | 中     | 低       | `current` と `baseline` の分離記録をルール化する             |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `docs/30-workflows/completed-tasks/task-056-ui-01-store-ipc-architecture/outputs/phase-12/documentation-changelog.md`

### 参考資料

- `.claude/rules/06-known-pitfalls.md`

---

## 9. 備考

- 本タスクは機能追加ではなく、Phase 11/12 の再監査運用安定化を目的とする。
- 実装本体（IPC/Store/UI）に変更が必要な場合は、別未タスクへ分離する。
