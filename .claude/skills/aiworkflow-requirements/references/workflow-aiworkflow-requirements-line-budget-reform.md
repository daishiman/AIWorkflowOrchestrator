# aiworkflow-requirements line budget reform ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`
> テンプレート: `skill-creator/assets/phase12-system-spec-retrospective-template.md` と `phase12-spec-sync-subagent-template.md` を元に再編

---

## 概要

`TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001` で実施した system spec の line budget reform を、次回再利用しやすい形で 1 ファイルへ集約した正本。
manual docs 34件の family split、`.claude` / `.agents` mirror sync、generated index 再生成、Phase 12 close-out、follow-up formalize までを同一ワークフローとして扱う。

**トリガー**: `line budget reform`, `spec splitting`, `family wave`, `parent child companion`, `generated index sharding`, `documentation shell stale state`, `legacy ordinal`
**実行環境**: `/.claude/skills/aiworkflow-requirements/` 正本 + workflow `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/`
**検索キーワード**: `line budget reform`, `family split`, `generated topic-map`, `manual docs 34`, `current baseline`, `Phase12 artifacts missing`

---

## 仕様書別 SubAgent 編成

| SubAgent | 関心ごと | 主担当仕様書 / 成果物 | 目的 |
| --- | --- | --- | --- |
| SubAgent-A | family plan / workflow 正本 | `workflow-aiworkflow-requirements-line-budget-reform.md`, workflow `outputs/phase-2` / `phase-5` | 分割戦略、lane 構成、family counts を固定する |
| SubAgent-B | 発見導線 | `indexes/quick-reference.md`, `indexes/resource-map.md` | 同種課題の初動を 1 つの入口へ寄せる |
| SubAgent-C | 分割標準 | `spec-splitting-guidelines.md` | parent / child / history / archive / discovery の標準形を再利用可能にする |
| SubAgent-D | 台帳 | `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md`, `task-workflow-backlog.md` | 完了記録、blocked dependency、follow-up を同期する |
| SubAgent-E | 教訓 / close-out | `lessons-learned-workflow-quality-line-budget-reform.md`, `phase-12-documentation-retrospective.md`, `LOGS.md` | 苦戦箇所を 5 分解決カードへ落とす |
| Lead | 最終整合 | `SKILL.md`, `topic-map.md`, `keywords.json`, `.agents` mirror | trigger、変更履歴、generated artifact、mirror parity を揃える |

---

## 今回実装した内容（2026-03-12 / 2026-03-13）

| 観点 | 実装内容 | 主な成果物 |
| --- | --- | --- |
| family split | manual over-limit docs 34件を F1-F6 の family wave で parent index + companion 構成へ再編した | `references/*.md`, `references/*-*.md` |
| ledger split | `LOGS.md` / `task-workflow.md` / `lessons-learned.md` を親 index 化し、archive / completed / backlog / domain lesson へ分離した | `references/logs-archive-*.md`, `references/task-workflow-*.md`, `references/lessons-learned-*.md` |
| discovery sync | `quick-reference.md` / `resource-map.md` / generated `topic-map.md` / `keywords.json` を再生成・再配置した | `indexes/quick-reference.md`, `indexes/resource-map.md`, `indexes/topic-map.md`, `indexes/keywords.json` |
| citation inventory | 今回作成・更新した canonical files の完全一覧を 1 ファイルへ集約し、引用元の漏れ確認を可能にした | `references/workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory.md` |
| legacy ordinal migration | 旧 ordinal filename 67件を family register で分類し、current semantic filename へ actual rename した | `references/legacy-ordinal-family-register.md` |
| multi-angle audit | 同じ粒度で再生成できるかを 20 観点で監査する playbook を追加した | `references/spec-elegance-consistency-audit.md` |
| workflow close-out | `outputs/phase-4` から `outputs/phase-12` までを実体化し、Phase 11 screenshot sanity と Phase 12 documentation shell drift を回収した | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/outputs/` |
| mirror parity | `.claude` 正本更新後に `.agents` mirror へ同期し、`diff -qr` 差分 0 を維持した | `.claude/skills/aiworkflow-requirements/`, `.agents/skills/aiworkflow-requirements/` |
| follow-up formalize | generated `topic-map.md` の 500 行超 blocker を docs-only task の scope 外として切り出し、恒久対応を backlog 化した | `task-imp-aiworkflow-requirements-generated-index-sharding-001.md` |

### family-wave 実績

| family | 主対象 | parent 数 | child 数 | 補足 |
| --- | --- | --- | --- | --- |
| F1 | ledger / archive | 3 | 68 | `LOGS` / `task-workflow` / `lessons-learned` の親 index 化 |
| F2 | pattern / rulebook | 6 | 25 | `patterns` / `quality` / `error-handling` / `development-guidelines` を companion 化 |
| F3 | architecture / core | 6 | 24 | `arch-*` / `architecture-*` を parent index + detail/history へ再編 |
| F4 | interfaces / api / security | 9 | 31 | contract / detail / history を分離し、型と履歴の混線を解消 |
| F5 | ui / ux | 7 | 24 | feature / surface / history の導線を親へ集約 |
| F6 | support / platform | 3 | 12 | `deployment` / `database-implementation` / `technology-devops` を分割 |

### 実装結果サマリー

| 項目 | 値 |
| --- | --- |
| manual docs reform | 34件完了 |
| manual max line count | `SKILL.md` 500行 |
| active ordinal files | `references/` 0件 |
| generated blocker | `indexes/topic-map.md` の 500 行超 blocker |
| mirror parity | `diff -qr` 差分 0 |
| validation | `validate-structure.js` PASS、schema compatibility PASS |
| visual sanity | Phase 11 representative screenshot 5件、Apple UI/UX blocker なし |

---

## 苦戦箇所と再発防止

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| parent / child だけ更新して discovery 入口を後回しにすると検索導線が切れる | family の companion と `quick-reference` / `resource-map` を別 turn に分ける | lane ごとに parent / child / history / archive / discovery を同一 wave で閉じた | family split は「本文」ではなく「入口ごと」同期する |
| manual docs の line budget と generated artifact の line budget を同じ土俵で扱うと close-out がぶれる | `topic-map.md` の oversized を docs patch で解消しようとする | manual reform 完了と generated blocker を分離し、`topic-map.md` は未タスク化した | generated artifact は manual docs gate と別レイヤーで管理する |
| `current=0` と `baseline>0` を混同すると今回差分の完了判定を誤る | `audit-unassigned-tasks` の総件数だけを見て判断する | `current` / `baseline`、`link` / `phase outputs` / `skill validator` を別表で記録した | 監査値は bucket ごとに分けて書く |
| `task-specification-creator` 側の shell 補完完了と、aiworkflow 側の final state 同期を同一意味で扱うと stale state が残る | workflow outputs だけ更新して `SKILL.md` / `LOGS.md` / `task-workflow` を後回しにする | close-out 前に workflow outputs、台帳、履歴、change history を一括再同期した | documentation shell と final sync を別工程として扱う |
| `.claude` と `.agents` を同時に手で触ると mirror drift の原因になる | 両 root を並列に編集する | `.claude` を正本に固定し、最後に mirror sync と `diff -qr` を実行した | manual patch は `.claude` のみ、mirror は同期コマンドで反映する |
| `-a` / `-b` のような連番 filename で shard を増やすと、責務が名前から読めず保守性が落ちる | 行数超過を急いで処理し、分類を飛ばして命名だけ先に決める | まず family ごとの classification matrix を作り、その後に semantic filename を付ける方針を `spec-splitting-guidelines.md` に固定した | split filename は順序ではなく concern / role / scope を表し、rename は分類結果として行う |

---

## 同種課題の 5 分解決カード

1. まず family を F1-F6 のような責務束へ分け、1 agent あたり 3 ファイル以下で wave を切る。
2. `.claude` 正本で parent / child / history / archive / discovery を同じ wave で更新する。
3. `validate-structure.js`、raw `wc -l`、`generate-index.js`、`diff -qr` を通し、manual と generated の判定を分離する。
4. `current` / `baseline`、`links` / `phase outputs` / `validator` を別々に記録して stale state を残さない。
5. workflow outputs、`SKILL.md`、`LOGS.md`、`task-workflow`、`lessons-learned` を final state へ同一ターンで同期する。
6. generator 側の恒久対応が必要なら、その場で未タスクを起票して親タスクの close-out を止めない。
7. 新しい shard は `-a` / `-b` で増やさず、先に classification matrix を作ってから semantic filename にする。

---

## 最適なファイル形成

| 情報の種類 | 最適な反映先 | 反映理由 |
| --- | --- | --- |
| line budget reform の全体像、SubAgent 分担、family-wave 実績 | `workflow-aiworkflow-requirements-line-budget-reform.md` | 今回のような docs-only 改修を 1 ファイルで再現できる |
| 分割ルールそのもの | `spec-splitting-guidelines.md` | 次回の分割設計でそのまま参照できる |
| classification-first ルール | `spec-splitting-guidelines.md` | rename の前に concern を確定し、誤った semantic name を防げる |
| semantic filename ルール | `spec-splitting-guidelines.md` | split 後も責務と依存関係を名前から追える |
| legacy ordinal migration record | `legacy-ordinal-family-register.md` | 旧 filename と current filename の対応、旧分類軸、migration 根拠を 1 箇所で確認できる |
| エレガンス / 整合性の多角的監査 | `spec-elegance-consistency-audit.md` | 「正しいか」を 20 観点で再利用可能なチェックへ落とせる |
| 初動の逆引き | `indexes/quick-reference.md` / `indexes/resource-map.md` | 「何から読むか」を即断できる |
| 完了記録と blocked dependency | `task-workflow-completed-skill-lifecycle-agent-view-line-budget.md` / `task-workflow-backlog.md` | 台帳と未タスクの責務を分けて保持できる |
| 苦戦箇所と短手順 | `lessons-learned-workflow-quality-line-budget-reform.md` | 同種課題の初動短縮に直結する |
| close-out の詳細経緯 | `phase-12-documentation-retrospective.md` | stale state、artifact drift、validator のズレを詳細に残せる |

> 同じ段落を複数仕様書へ重複転記せず、上の責務マトリクスに沿って情報を分散させる。

---

## 検証コマンド

| コマンド | 目的 | 合格条件 |
| --- | --- | --- |
| `node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js .claude/skills/aiworkflow-requirements` | manual docs 構造監査 | warning 0 |
| `find .claude/skills/aiworkflow-requirements -path '*/scripts/*' -prune -o -name '*.md' -print0 | xargs -0 wc -l | sort -nr` | line budget 測定 | manual over-limit 0 |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` | generated index 再生成 | `topic-map.md` / `keywords.json` 更新 |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` | mirror parity | 差分 0 |
| `node .claude/skills/task-specification-creator/scripts/validate-schema.js --schema schemas/artifact-definition.json --data docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/artifacts.json` | workflow artifacts schema 互換 | PASS |
| `wc -l .claude/skills/aiworkflow-requirements/indexes/topic-map.md` | generated blocker 確認 | 実測値は `generate-index.js` 再実行ごとに再計測する。follow-up 起票済み |

---

## 関連改善タスク

| 未タスクID | 概要 | 参照 |
| --- | --- | --- |
| TASK-IMP-AIWORKFLOW-REQUIREMENTS-GENERATED-INDEX-SHARDING-001 | generated `topic-map.md` を generator-aware に shard 化する | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-aiworkflow-requirements-generated-index-sharding-001.md` |
| TASK-IMP-AIWORKFLOW-GENERATED-INDEX-METRIC-SYNC-GUARD-001 | `generate-index.js` 後の実測値を current system spec / unassigned task へ再同期する guard を整備する | `docs/30-workflows/completed-tasks/aiworkflow-requirements-line-budget-reform/unassigned-task/task-imp-aiworkflow-generated-index-metric-sync-guard-001.md` |
| TASK-IMP-AIWORKFLOW-SAME-WAVE-SYNC-GUARD-001 | current canonical set / inventory / register / parent docs / ledger / mirror の same-wave closure を guard 化する | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-aiworkflow-same-wave-sync-guard-001.md` |
| TASK-IMP-AIWORKFLOW-REQ-PHASE12-ARTIFACTS-MISSING-001 | Phase 12 artifact drift の回収履歴 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-aiworkflow-req-phase12-phase-12-artifacts-missing-001.md` |

---

## 関連ドキュメント

| ドキュメント | 用途 |
| --- | --- |
| [spec-splitting-guidelines.md](./spec-splitting-guidelines.md) | 分割ルールの正本 |
| [workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory.md](./workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory.md) | 今回差分の完全ファイル一覧 |
| [task-workflow.md](./task-workflow.md) | 完了台帳と backlog 入口 |
| [lessons-learned.md](./lessons-learned.md) | 苦戦箇所と短手順 |
| [phase-12-documentation-retrospective.md](./phase-12-documentation-retrospective.md) | close-out の詳細経緯 |
| [task-workflow-backlog.md](./task-workflow-backlog.md) | generated index follow-up |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-13 | 1.6.0 | legacy ordinal file 67件を actual semantic filename へ rename し、parent index / archive index / citation route / migration register を current state へ同期 |
| 2026-03-13 | 1.5.0 | 再現性・漏れ・矛盾・依存関係・エレガンスを 20 観点で監査する `spec-elegance-consistency-audit.md` を追加し、current canonical set と SKILL 入口へ統合 |
| 2026-03-13 | 1.4.0 | legacy ordinal family 67件の全件 register を追加し、parent index / archive index / citation route を exhaustive coverage 前提へ補強 |
| 2026-03-13 | 1.3.0 | semantic filename の前に classification matrix を作る方針を追記し、rename は分類結果として行うルールへ強化 |
| 2026-03-13 | 1.2.0 | `-a` / `-b` のような連番 filename を避け、semantic filename で shard を切る方針を追記 |
| 2026-03-13 | 1.1.0 | `workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory.md` を追加し、今回作成・更新した canonical files の完全 inventory と引用導線を補強 |
| 2026-03-13 | 1.0.0 | TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 の実装内容、苦戦箇所、SubAgent 分担、5分解決カード、最適なファイル形成を集約した統合正本を新規作成 |
