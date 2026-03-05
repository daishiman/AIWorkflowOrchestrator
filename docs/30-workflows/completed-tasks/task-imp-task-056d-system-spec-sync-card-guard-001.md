# UT-IMP-TASK-056D-SYSTEM-SPEC-SYNC-CARD-GUARD-001 タスク指示書

## メタ情報

```yaml
issue_number: 985
task_id: UT-IMP-TASK-056D-SYSTEM-SPEC-SYNC-CARD-GUARD-001
task_name: Phase 12 system spec 4仕様書同期と5分解決カード整合ガード
category: 改善
target_feature: TASK-UI-01-D Phase 12 system spec 同期運用
priority: 中
scale: 小規模
status: 未実施
source_phase: TASK-UI-01-D Phase 12 再確認（2026-03-05）
created_date: 2026-03-05
dependencies:
  [
    TASK-UI-01-D-VIEWTYPE-ROUTING-NAV,
    UT-IMP-TASK-056D-PHASE11-SCREENSHOT-CAPTURE-PATH-GUARD-001,
  ]
spec_path: docs/30-workflows/completed-tasks/task-imp-task-056d-system-spec-sync-card-guard-001.md
```

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-IMP-TASK-056D-SYSTEM-SPEC-SYNC-CARD-GUARD-001          |
| タスク名     | Phase 12 system spec 4仕様書同期と5分解決カード整合ガード |
| 分類         | 改善                                                      |
| 優先度       | 中                                                        |
| 見積もり規模 | 小規模                                                    |
| ステータス   | 未実施                                                    |
| 発見元       | TASK-UI-01-D Phase 12 再確認                              |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-01-D の Phase 12 で system spec を更新した際、`task-workflow` / `lessons-learned` / `ui-ux-navigation` / `arch-state-management` を手作業で同期した。  
同時に `skill-creator` テンプレートも更新したが、仕様書間で「実装内容」「苦戦箇所」「5分解決カード」の記述粒度を維持する運用ガードが不足している。

### 1.2 問題点

- 4仕様書のうち一部だけ更新されても、構造検証（verify/validate）では検出しにくい。
- 5分解決カードが `task-workflow` のみに残り、`lessons` / `ui-ux` へ同期漏れする可能性がある。
- strictPort preflight（`Port 5177`）や workflow 保存先確認がテンプレート実行時に抜けると、同種課題で再発する。

### 1.3 放置時の影響

- 同じ調査と再同期作業を毎回繰り返し、Phase 12 の作業時間が増加する。
- system spec の記録品質がタスクごとに揺れ、再利用性が下がる。
- 「実装内容はあるが苦戦箇所がない」または「手順はあるが検証値がない」不整合が残る。

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 Step 2 の system spec 反映を、4仕様書同時同期 + 5分解決カード同値転記で再現可能にする。

### 2.2 最終ゴール

1. 4仕様書（`task-workflow` / `lessons-learned` / `ui-ux-navigation` / `arch-state-management`）に必須ブロックの存在を機械確認できる。
2. 5分解決カードの要素（症状/根本原因/最短手順/検証ゲート/同期先）が仕様書間で一致する。
3. strictPort preflight（5177）と workflow 保存先確認がテンプレート運用の完了条件に固定される。

### 2.3 スコープ

#### 含むもの

- system spec 4仕様書の同期ガード（必須見出し/必須語句チェック）
- 5分解決カード同値転記の運用チェック
- `skill-creator` / `task-specification-creator` テンプレート・ガイドの整合更新

#### 含まないもの

- TASK-UI-01-D 本体の UI 実装変更
- スクリーンショット撮影ロジックそのものの機能改修

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の未タスクガイドラインを参照できること
- `aiworkflow-requirements` と `skill-creator` の更新権限があること
- `rg` / `node` / `jq` が利用可能であること

### 3.2 依存タスク

- TASK-UI-01-D-VIEWTYPE-ROUTING-NAV（完了）
- UT-IMP-TASK-056D-PHASE11-SCREENSHOT-CAPTURE-PATH-GUARD-001（未実施）

### 3.3 必要な知識

- Phase 12 Step 1-A〜Step 2 の実行要件
- `audit-unassigned-tasks` の current/baseline 判定
- system spec 仕様書の責務境界（台帳/教訓/UI/状態管理）

### 3.4 推奨アプローチ

1. まず必須ブロックの存在確認ルールを定義し、テンプレートに固定する。
2. 次に 4仕様書への同期を1ターンで実施し、同値項目の差分チェックを実行する。
3. 最後に未タスク監査（target/diff）とリンク監査を実行し、運用ガードとして閉じる。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                    | 発見経緯                                                                  | 解決策                                                                                                 | 教訓                                                                |
| --------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| system spec 4仕様書の記述粒度が揺れる   | TASK-UI-01-D 追補時に実装内容と苦戦箇所の配置が仕様書ごとに異なった       | 4仕様書の必須ブロック（実装内容/苦戦箇所/5分解決カード）をテンプレート化し、機械確認コマンドを追加する | 仕様書別SubAgentでも「共通最小構造」を固定しないと再利用性が下がる  |
| 5分解決カードの同期漏れ                 | `task-workflow` 更新後に `lessons` / `ui-ux` への同値転記が後追いになった | 同期先3点を完了条件チェックに組み込み、同値項目を `rg` で照合する                                      | カードは作るだけでなく「同値で複製」しないと再発防止に使えない      |
| strictPort preflight の運用が抜けやすい | `Port 5177 is already in use` の分岐を成果物へ残さないケースが発生        | テンプレートに `lsof` preflight と分岐記録を必須化する                                                 | UI再撮影運用は preview だけでなく strictPort preflight も同格で扱う |

## 4. 実行手順

1. ガード仕様の追加
   - `skill-creator` テンプレートに「4仕様書必須ブロック」「5分解決カード同値転記」「strictPort preflight」を追記する。
2. 仕様書同期
   - `task-workflow` / `lessons-learned` / `ui-ux-navigation` / `arch-state-management` を同一ターンで更新する。
3. 未タスク・リンク監査
   - `verify-unassigned-links` と `audit --target-file` / `audit --diff-from HEAD` を実行する。
4. 記録固定
   - 検証値と苦戦箇所を `task-workflow` と `lessons` の両方へ同値で記録する。

## 5. 完了条件チェックリスト

- [ ] 未タスク指示書が `docs/30-workflows/unassigned-task/` に作成されている
- [ ] `## メタ情報` が1セクションで、`## 1..9` が揃っている
- [ ] 3.5 セクションに親タスク由来の苦戦箇所が記載されている
- [ ] 4仕様書に「実装内容 + 苦戦箇所 + 5分解決カード」が反映されている
- [ ] `verify-unassigned-links` が PASS
- [ ] `audit --target-file` が `currentViolations=0`
- [ ] `audit --diff-from HEAD` が `currentViolations=0`

## 6. 検証方法

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/task-imp-task-056d-system-spec-sync-card-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD | jq '.currentViolations.total, .baselineViolations.total'
rg -n "実装内容（要点）|苦戦箇所|5分解決カード" .claude/skills/aiworkflow-requirements/references/{task-workflow,lessons-learned,ui-ux-navigation,arch-state-management}.md
```

## 7. リスクと対策

| リスク                                     | 影響                           | 対策                                                                |
| ------------------------------------------ | ------------------------------ | ------------------------------------------------------------------- |
| 必須ブロック定義が曖昧で運用解釈が分かれる | 同期漏れを再発させる           | テンプレートに必須見出し・必須語句を固定する                        |
| 監査結果の current/baseline を取り違える   | 不要な修正または見逃しが起こる | `--target-file` / `--diff-from HEAD` / 全体監査の使い分けを明記する |
| 5分解決カードの文面差分が残る              | 再利用時に手順がぶれる         | 同期先3点の同値確認コマンドを完了条件に含める                       |

## 8. 参照情報

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`

## 9. 備考

本未タスクは機能バグ修正ではなく、Phase 12 system spec 同期品質を安定化する運用ガードである。  
同種課題の初動短縮を目的としており、TASK-UI-01-D で顕在化した苦戦箇所を再利用可能形式に固定する。
