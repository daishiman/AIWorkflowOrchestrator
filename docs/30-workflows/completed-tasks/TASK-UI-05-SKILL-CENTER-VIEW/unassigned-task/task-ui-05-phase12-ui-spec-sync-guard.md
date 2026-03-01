# TASK-UI-05 Phase 12 UI仕様同期プロファイル適用ガード - タスク指示書

## メタ情報

```yaml
issue_number: 956
```

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | UT-UI-05-007                              |
| タスク名   | Phase 12 UI仕様同期プロファイル適用ガード |
| 分類       | 改善                                      |
| 対象機能   | TASK-UI-05 ドキュメント運用（Phase 12）   |
| 優先度     | 中                                        |
| ステータス | 未実施                                    |
| 発見元     | TASK-UI-05 Phase 12 再確認（苦戦箇所）    |
| 発見日     | 2026-03-01                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-05 の Phase 12 再確認で、UI機能実装にもかかわらず「標準5仕様書（interfaces/api-ipc/security/task/lessons）」テンプレート前提で進めると、`ui-ux-components.md` / `ui-ux-feature-components.md` / `arch-ui-components.md` / `arch-state-management.md` の更新漏れが起きやすいことが判明した。

### 1.2 問題点

- タスク種別（UI機能）に対する仕様書同期プロファイルが固定されていない。
- `task-workflow.md` と `lessons-learned.md` の同時同期が運用依存になりやすい。
- 未タスクテーブル（UI仕様書側）と残課題テーブル（task-workflow側）の件数ドリフトが再発しやすい。

### 1.3 放置影響

- UI仕様の正本が古いまま残り、後続実装で誤った前提を参照する。
- Phase 12 完了判定の再現性が下がり、再監査コストが増える。

---

## 2. 何を達成するか（What）

### 2.1 目的

UI機能実装タスク向けに「UI 6仕様書同期プロファイル」を未タスク実装として固定し、Phase 12 の同期漏れを予防する。

### 2.2 完了イメージ

- UI機能タスクで更新対象を6仕様書（`ui-ux-components` / `ui-ux-feature-components` / `arch-ui-components` / `arch-state-management` / `task-workflow` / `lessons-learned`）として明文化できる。
- 未タスク指示書作成時に、苦戦箇所の再発条件と解決策が `3.5` セクションに必ず記録される。
- `verify-unassigned-links` / `audit --target-file` / `audit --diff-from HEAD` で current違反0を維持できる。

### 2.3 スコープ

- 含む: テンプレート適用手順、UI仕様書同期ルール、監査チェックの標準化。
- 含まない: SkillCenterView 実装コードの機能追加。

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の未タスクフォーマット（`## メタ情報` + `## 1..9`）を満たしていること。
- `aiworkflow-requirements` の UI仕様書（`ui-ux-*`, `arch-ui-*`）と `task-workflow.md` への更新権限があること。

### 3.2 推奨アプローチ

1. タスク種別を判定し、UI機能の場合は「UI 6仕様書同期プロファイル」を選択する。
2. SubAgentを仕様書単位で分離し、同一ターンで同期する。
3. 未タスク作成後に `target-file` 監査と `diff-from` 監査を連続実行する。

### 3.3 実装方針

- `skill-creator` の Phase 12 テンプレートを参照し、UIプロファイルと標準プロファイルの選択基準を明記する。
- `task-workflow.md` の残課題テーブルと `ui-ux-components.md` / `ui-ux-feature-components.md` の未タスク表を同一IDで同期する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                      | 発見経緯                                                             | 解決策                                                                                    | 教訓                                                            |
| --------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| UIタスクに標準5仕様書テンプレートを誤適用しやすい         | TASK-UI-05 Phase 12再確認で `ui-ux` / `arch-ui` 更新漏れリスクを確認 | UI機能時は6仕様書プロファイルを先に宣言し、分担表を固定する                               | テンプレートは「タスク種別→仕様書プロファイル」を最初に確定する |
| `task-workflow` のみ更新して `lessons` 同期が遅延しやすい | 台帳更新先行で教訓転記が別ターン化                                   | 同一ターンで `task-workflow` と `lessons-learned` を更新するチェックを完了条件に追加      | Phase 12完了判定は台帳と教訓の同時同期を必須にする              |
| 未タスク件数が仕様書間でずれやすい                        | UI仕様書は3件、task-workflowは6件などのドリフトが発生                | 未タスクIDを単一正本（task-workflow）から転記し、`verify-unassigned-links` で実体検証する | 未タスクは「ID・件数・参照先」の3点を同時に一致させる           |

---

## 4. 実行手順

1. 対象タスクが UI機能実装かを判定し、UI 6仕様書プロファイルを選択する。
2. SubAgent-A〜E を仕様書単位で割り当て、更新対象と完了条件を固定する。
3. 未タスクIDを `task-workflow.md` へ登録し、UI仕様書テーブルへ同一IDを転記する。
4. `task-workflow.md` と `lessons-learned.md` に苦戦箇所と簡潔手順を同一ターンで記録する。
5. `verify-unassigned-links` と `audit --target-file` / `audit --diff-from HEAD` を実行し、違反0を確認する。

---

## 5. 完了条件チェックリスト

- [ ] UI機能実装の同期プロファイル（6仕様書）が明記されている。
- [ ] `UT-UI-05-007` が `task-workflow.md` 残課題テーブルへ登録されている。
- [ ] `ui-ux-components.md` と `ui-ux-feature-components.md` に同IDが登録されている。
- [ ] `task-workflow.md` と `lessons-learned.md` に再発条件付き苦戦箇所が反映されている。
- [ ] 未タスク監査の `currentViolations` が 0 である。

---

## 6. 検証方法

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

補足:

- `--target-file` は `docs/30-workflows/unassigned-task/` 配下のみ監査対象。
- `completed-tasks/.../unassigned-task/` 配置時は `verify-unassigned-links` + `--diff-from HEAD` を合否確認に使う。

---

## 7. リスクと対策

| リスク                                       | 対策                                                             |
| -------------------------------------------- | ---------------------------------------------------------------- |
| UI仕様書更新を後回しにして台帳のみ完了化する | 更新順を「UI仕様書→台帳→教訓」に固定し、同一ターンで完了判定する |
| 未タスクID採番の重複                         | `rg -n "UT-UI-05-"` で採番確認後に起票する                       |
| 監査結果の baseline と current の誤読        | 合否は `currentViolations`、baselineは監視値として分離記録する   |

---

## 8. 参照情報

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`

---

## 9. 備考

本未タスクは機能追加ではなく、Phase 12の同期品質を安定化する運用改善タスクである。TASK-UI-05 系の後続未タスク（UT-UI-05-001〜006）実施時にも同プロファイルを再利用する。
