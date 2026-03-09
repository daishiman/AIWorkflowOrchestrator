# UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 - debug-clear-storage 残骸クリーンアップ

## メタ情報

```yaml
issue_number: 1115
task_id: UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001
task_name: debug-clear-storage 残骸クリーンアップ
category: 改善
target_feature: debug-clear-storage workaround / screenshot preflight / e2e setup の repo-wide 棚卸し
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12
created_date: 2026-03-09
dependencies:
  - TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001
```

| 項目         | 内容                                                                     |
| ------------ | ------------------------------------------------------------------------ |
| タスクID     | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001                              |
| タスク名     | debug-clear-storage 残骸クリーンアップ                                   |
| 分類         | 改善                                                                     |
| 対象機能     | repo-wide に残る debug storage clear 前提の comment / script / e2e setup |
| 優先度       | 中                                                                       |
| 見積もり規模 | 中規模                                                                   |
| ステータス   | 未実施                                                                   |
| 発見元       | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 Phase 12                       |
| 発見日       | 2026-03-09                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` で `App.tsx` の本体バグは除去できたが、repo 全体には `debug-clear-storage` を前提とした古い workaround や説明文が残っている。

### 1.2 問題点・課題

- `apps/desktop/e2e/global-setup.ts` などに `sessionStorage.setItem("debug-clear-storage", "done")` が残る
- screenshot script や開発ドキュメントが「storage clear 前提」のまま stale になっている
- 現行実装では不要になった workaround が、将来の回帰切り分けをノイズ化する

### 1.3 放置した場合の影響

- 新しい不具合調査で「まだ本番で storage clear している」と誤読される
- screenshot / e2e preflight が不要な前提を引きずり、false positive / false negative を生む
- system spec と code の整合が再び崩れる

---

## 2. 何を達成するか（What）

### 2.1 目的

`debug-clear-storage` とその周辺 workaround を repo-wide に棚卸しし、不要なものを削除、必要なものは historical note へ降格する。

### 2.2 最終ゴール

1. `debug-clear-storage` に依存する本番コード・テスト補助コード・文書が一覧化される
2. 不要な参照は削除される
3. 残すものは「歴史的経緯」または「別経路の認証 preflight」として説明が更新される

### 2.3 スコープ

#### 含むもの

- `rg "debug-clear-storage|localStorage.clear\(|window.location.reload\("` で検出される関連 code / docs / scripts の棚卸し
- e2e global setup, screenshot script, development docs, completed workflow docs の是正
- 必要なら追加未タスクへの再分割

#### 含まないもの

- 今回修正済み `App.tsx` の再変更
- 認証フローそのものの再設計
- unrelated debug log 全般の削除

### 2.4 成果物

- 棚卸し結果一覧
- 修正済み code / docs / scripts
- 必要なら follow-up unassigned task
- system spec / lessons の同期差分

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001` の実装と Phase 11/12 が完了していること
- `rg` と targeted Vitest / screenshot scripts を実行できること

### 3.2 依存タスク

- `TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001`

### 3.3 必要な知識

- Electron renderer/app shell の起動順序
- Zustand persist と localStorage の関係
- screenshot harness / skipAuth / dev-skip-auth の違い

### 3.4 推奨アプローチ

1. code / docs / workflows を横断検索して current 参照を列挙する
2. 「本当に必要な preflight」か「ただの stale workaround」かを分類する
3. 削除・降格・未タスク再分割を最小差分で実施する
4. system spec と lessons へ残した判断理由を同期する

---

## 4. 実行手順

### Phase構成

- Phase A: 棚卸し
- Phase B: 削除 / 降格
- Phase C: 検証と仕様同期

### Phase A: 棚卸し

#### 手順

1. `rg -n "debug-clear-storage|localStorage.clear\(|window.location.reload\(" apps docs .claude` を実行する
2. 検出箇所を `runtime dependency` / `test helper` / `historical doc` に分類する
3. current task に直結しないものはこの未タスクの対象として固定する

#### 完了条件

- 対象ファイルと分類結果が一覧化されている

### Phase B: 削除 / 降格

#### 手順

1. 不要な workaround を削除する
2. 残す場合は `historical note` へ書き換え、現行前提ではないことを明記する
3. 追加の repo-wide cleanup が必要なら未タスクを再分割する

#### 完了条件

- stale workaround が残っていない、または残す理由が明文化されている

### Phase C: 検証と仕様同期

#### 手順

1. 影響範囲の targeted test / script を実行する
2. `task-workflow.md` / `lessons-learned.md` / 必要な system spec を更新する
3. `verify-unassigned-links.js` と `audit-unassigned-tasks --target-file` を実行する

#### 完了条件

- code / docs / system spec / 未タスク台帳が同期されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `debug-clear-storage` の現行参照が棚卸し済み
- [ ] 不要な workaround / stale comment / stale preflight が削除または降格済み
- [ ] false positive / false negative を起こす古い検証経路が整理済み

### 品質要件

- [ ] 変更箇所の targeted test / script が PASS
- [ ] `verify-unassigned-links.js` が PASS
- [ ] `audit-unassigned-tasks --target-file` で `currentViolations=0`

### ドキュメント要件

- [ ] `task-workflow.md` の残課題と整合
- [ ] `lessons-learned.md` に再発防止ルールを反映
- [ ] 必要に応じて Phase 11/12 guide も更新

---

## 6. 検証方法

### テストケース

- Case 1: repo-wide search で stale workaround が整理されたことを確認する
- Case 2: 代表的 screenshot / e2e preflight が現行前提で動作することを確認する
- Case 3: system spec と未タスク台帳のリンクが整合することを確認する

### 検証手順

```bash
rg -n "debug-clear-storage|localStorage.clear\(|window.location.reload\(" apps docs .claude
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --diff-from HEAD \
  --target-file docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/unassigned-task/task-fix-debug-clear-storage-shim-cleanup-001.md
```

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                       |
| -------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------- |
| 歴史的経緯として残すべき記述まで消す               | 中     | 中       | 削除前に runtime dependency / historical note を分類する                   |
| screenshot / e2e が別の preflight を必要としている | 中     | 中       | `skipAuth` / `dev-skip-auth` / harness を役割別に整理してから変更する      |
| completed workflow まで広く波及する                | 中     | 高       | current workflow と repo-wide cleanup を分離し、必要なら追加未タスクを切る |

---

## 8. 参照情報

- `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
repo-wide に残る debug-clear-storage workaround / stale comment / screenshot preflight を棚卸しし、必要なら別未タスクとして formalize する。
```

### 補足事項

- この未タスクは current task の責務を守るための分離であり、「今すぐ全部直す」ではなく「repo-wide cleanup を正しい単位で進める」ことが目的。

### 実装時の苦戦箇所と5分解決カード

本タスクの親タスク（TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001）実装で判明した苦戦箇所。同種の課題に遭遇した際は以下を参照して迅速に解決すること。

#### 苦戦1: skipAuth=true が bug path を mask する false negative

| 項目         | 内容                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | `skipAuth=true` で screenshot を取得すると、localStorage.clear() の影響が見えず bug が検出できない                                                              |
| 原因         | `skipAuth=true` は認証フローをスキップするため、`localStorage.clear()` → Zustand persist 破壊 → 認証ハングの連鎖が発生しない                                    |
| 解決策       | bug path 検証は通常ルート（`http://localhost:5181/`）で metadata（`navigation.type`, persist snapshot）を記録し、screenshot は dedicated harness で分離取得する |
| 検出コマンド | `rg -n "skipAuth.*true\|dev-skip-auth" apps/desktop/src/`                                                                                                       |
| 再発防止     | `.claude/skills/skill-creator/references/patterns.md` に「bug path metadata / screenshot harness 分離パターン」を登録済み                                       |

#### 苦戦2: repo-wide に残る debug-clear-storage 残骸の検出漏れ

| 項目         | 内容                                                                                                                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | App.tsx のデバッグコードを削除しても、e2e global-setup / screenshot script に `sessionStorage.setItem("debug-clear-storage", "done")` が残存                                                    |
| 原因         | デバッグコードが App.tsx だけでなく、e2e / screenshot / docs に workaround として波及していた                                                                                                   |
| 解決策       | `rg -n "debug-clear-storage\|localStorage.clear\(\|window.location.reload\(" apps docs .claude` で repo 全体を横断検索し、分類（runtime dependency / test helper / historical doc）してから処置 |
| 検出コマンド | `rg -n "debug-clear-storage" apps/ docs/ .claude/ scripts/`                                                                                                                                     |
| 再発防止     | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md` に「shared app shell での debug-only storage clear / forced reload 禁止」ルール追加済み                           |

#### 苦戦3: Zustand persist 破壊の検出困難性

| 項目         | 内容                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状         | `localStorage.clear()` 後、Zustand persist の状態が消失するが、エラーログや警告が出ない                                                        |
| 原因         | Zustand persist middleware は localStorage が空の場合、初期値で再構築するため silent failure になる                                            |
| 解決策       | `isLoading` フラグの初期化フローと persist rehydration の整合性を確認する。Store 初期化後に persist データの有無をチェックする防御ガードを検討 |
| 検出コマンド | `rg -n "persist\|rehydrate\|customStorage" apps/desktop/src/renderer/store/`                                                                   |
| 再発防止     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` の DD-04/DD-05 に persist 破壊検出ガードパターンを記録済み        |
