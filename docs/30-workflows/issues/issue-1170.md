# [#1170] [UT-IMP-SPEC-CREATED-UI-WORKFLOW-ROOT-SYNC-GUARD-001] spec_created UI workflow root同期ガード

## メタ情報

```yaml
task_id: UT-IMP-SPEC-CREATED-UI-WORKFLOW-ROOT-SYNC-GUARD-001
task_name: spec_created UI workflow root同期ガード
category: 改善
target_feature: spec_created UI workflow の root/index/artifacts/inventory/system spec extraction 同期
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 Phase 12 follow-up
created_date: 2026-03-12
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-spec-created-ui-workflow-root-sync-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001` は実装ではなく `spec_created` のまま Phase 1-3 を確定したが、その再監査で `outputs/phase-1..3` と current workflow root（`index.md` / `phase-1..3` / `artifacts.json`）の内容がずれていた。さらに、親 workflow の旧 unassigned-task をそのまま参照すると、current worktree の actual target inventory と一致しないことも確認された。

### 1.2 問題点・課題

- `verify-all-specs` や `validate-phase-output` が PASS しても、actual inventory と root 本文の責務分離が古いまま残ることがある
- `spec_created` UI task では token scope / component scope / verification-only lane の切り分けが崩れると、後続 phase の設計が肥大化する
- UI 仕様だけを読むと、auth / api / security / portal / state の cross-cutting 前提が抜けやすい
- 既存の `UT-IMP-WORKFLOW-STALE-VALIDATOR-001` は stale 検知に強いが、actual inventory correction や必要 system spec 抽出までは固定しない

### 1.3 放置した場合の影響

- 次の `spec_created` UI workflow でも、古い unassigned inventory が再流入して設計対象がぶれる
- root workflow と `outputs/phase-1..3` の表現差分が残り、次回再監査で不要な手戻りが発生する
- `ui-ux-*` のみを根拠にした設計書が増え、auth / workspace / settings を跨ぐ UI task で仕様漏れが再発する

---

## 2. 何を達成するか（What）

### 2.1 目的

`spec_created` UI workflow で、current inventory、verification-only lane、必要 system spec、root artifacts の4点を同時に固定し、Phase 1-3 設計書の正本を安定させる。

### 2.2 最終ゴール

1. `outputs/phase-1..3` と current workflow root の対象 inventory が一致している
2. token / component / verification-only の 3 lane が root と system spec の両方で明文化されている
3. `ui-ux-*` だけでなく、必要な `state` / `api` / `security` / `portal` 仕様の抽出根拠が残っている
4. 関連未タスクとして `task-workflow.md` / `lessons-learned.md` / workflow spec から同じ ID で辿れる

### 2.3 スコープ

#### 含むもの

- `spec_created` UI workflow の current inventory correction 手順
- `index.md` / `phase-1..3` / `artifacts.json` / `outputs/artifacts.json` の同期ガード
- token / component / verification-only の lane 分離ルール
- `aiworkflow-requirements` からの必要 system spec 抽出マトリクス
- light-theme shared color migration を起点とした再利用導線の system spec 同期

#### 含まないもの

- shared color migration そのものの実装
- 一般的な workflow stale validator の新規実装
- Phase 4 以降の具体実装タスク化
- light theme token foundation 側の completed backlog 再編

### 2.4 成果物

- 本未タスク指示書
- `spec_created` UI workflow root同期ガードの運用ルール
- `task-workflow.md` / `lessons-learned.md` / `workflow-light-theme-global-remediation.md` の関連未タスク導線
- 検証ログ（`verify-unassigned-links` / `audit-unassigned-tasks` / index 再生成）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `Phase 1-3` が出力済みの `spec_created` workflow が存在すること
- current worktree で actual target inventory を再監査できること
- `.claude/skills/task-specification-creator/` と `.claude/skills/aiworkflow-requirements/` を正本として編集できること

### 3.2 依存タスク

- `TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001`
- 補完関係として `UT-IMP-WORKFLOW-STALE-VALIDATOR-001` を参照するが、本タスクは validator 実装ではなく運用ガードを担当する

### 3.3 必要な知識

- `task-specification-creator` の unassigned-task ガイドライン
- `aiworkflow-requirements` の `task-workflow` / `lessons-learned` / workflow spec 更新ルール
- `spec_created` workflow の `artifacts.json` と `outputs/artifacts.json` の役割差
- `rg` による current worktree inventory 監査
- `validate-phase-output.js` / `verify-all-specs.js` / `verify-unassigned-links.js` / `audit-unassigned-tasks.js` の使い分け

### 3.4 推奨アプローチ

1. 親 workflow の unassigned-task を起点にせず、current worktree から actual inventory を取り直す。
2. inventory を token / component / verification-only の3 lane に分解する。
3. UI / state / api-auth / security / portal の system spec 抽出マトリクスを先に埋める。
4. `outputs/phase-1..3` を正本として current workflow root を同期し、`artifacts.json` と `outputs/artifacts.json` を一致させる。
5. 関連未タスクを `task-workflow` / `lessons-learned` / workflow spec へ同一ターンで登録する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                 | 発見経緯                                                                                                                                                    | 解決策                                                                                                                                         | 教訓                                                                            |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| old unassigned-task の対象一覧を流用すると current worktree とずれる | `SettingsView` / `DashboardView` を主対象のまま持ち込むと、`AccountSection` / `ApiKeysSection` / `AuthModeSelector` / `WorkspaceSearchPanel` の重みが崩れた | `outputs/phase-1` の inventory を正本にし、actual target を current worktree から再定義した                                                    | `spec_created` UI task は Phase 1 の inventory correction を省略しない          |
| token scope と component scope を混ぜると task 境界が崩れる          | `white/black baseline` と shared component migration を同時に書くと設計レビューが不安定になった                                                             | token 基盤は親 workflow、current task は component migration、wrapper は verification-only に分離した                                          | light-theme follow-up は 3 lane 分離を先に決める                                |
| UI 仕様だけ読むと auth / api / security / portal / state が抜ける    | `ui-ux-*` だけで Phase 1-2 を閉じると `AuthView` / `WorkspaceSearchPanel` の前提が不足した                                                                  | `rag-desktop-state` / `api-ipc-auth` / `api-ipc-system` / `architecture-auth-security` / `security-*` / `ui-ux-portal-patterns` を同時抽出した | settings/auth/workspace を跨ぐ UI task は cross-cutting spec を同一ターンで読む |
| Phase 1-3 gate 前に 4+ を詳細化すると downstream が揺れる            | inventory correction 前に Phase 4-13 の batch を詰めると test anchor が再修正になった                                                                       | Phase 1-3 を completed、Phase 4-13 は planned のまま保持した                                                                                   | `spec_created` task は「Phase 1-3 completed -> 4+ planned」の順序を守る         |
| root workflow と outputs の片側だけ直すと stale が残る               | `verification-report.md` は更新されていても `index.md` / `artifacts.json` が古いまま残った                                                                  | `index.md` / `phase-1..3` / `artifacts.json` / `outputs/artifacts.json` を同一ターンで同期した                                                 | root, phase, registry は三点セットで閉じる                                      |

### 3.6 SubAgent 分担

| SubAgent   | 関心ごと                     | 主担当成果物                                                                    |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------- |
| SubAgent-A | current inventory / root同期 | `index.md` / `phase-1..3` / `artifacts.json` / `outputs/artifacts.json`         |
| SubAgent-B | UI / state / portal 抽出     | `ui-ux-*` / `rag-desktop-state` / `ui-ux-portal-patterns` の要否整理            |
| SubAgent-C | auth / api / security 抽出   | `api-ipc-auth` / `api-ipc-system` / `architecture-auth-security` / `security-*` |
| SubAgent-D | workflow 台帳同期            | `task-workflow.md` / `workflow-light-theme-global-remediation.md`               |
| SubAgent-E | 教訓化と監査                 | `lessons-learned.md` / `verify-unassigned-links` / `audit-unassigned-tasks`     |

---

## 4. 実行手順

### Phase構成

- Phase A: current inventory 再監査
- Phase B: lane 分離と system spec 抽出
- Phase C: root workflow 三点同期
- Phase D: 未タスク導線登録と検証

### Phase A: current inventory 再監査

#### 目的

actual target inventory を current worktree から再確定する。

#### 手順

1. 対象 workflow の `outputs/phase-1/requirements-definition.md` と current 実コードを突合する。
2. 旧 unassigned-task 起点の対象一覧との差分を洗い出す。
3. actual primary targets と verification-only targets を再分類する。

#### 成果物

- inventory 差分メモ
- primary / verification-only 分類表

#### 完了条件

- current worktree ベースの対象一覧が 1 つに確定している

### Phase B: lane 分離と system spec 抽出

#### 目的

3 lane と cross-cutting spec の抽出漏れを防ぐ。

#### 手順

1. 対象を token / component / verification-only に分ける。
2. UI / state / api-auth / security / portal の要否判定表を作る。
3. 必要な `aiworkflow-requirements` 参照先を workflow 本文へ反映する。

#### 成果物

- lane 分離表
- system spec 抽出マトリクス

#### 完了条件

- `ui-ux-*` 以外の必要仕様が列挙され、採否理由が残っている

### Phase C: root workflow 三点同期

#### 目的

workflow root と outputs の drift を無くす。

#### 手順

1. `index.md` と `phase-1..3` を actual inventory と lane 分離に合わせて更新する。
2. `artifacts.json` と `outputs/artifacts.json` を同期する。
3. `Phase 1-3 completed / Phase 4+ planned` の gate 表現を統一する。

#### 成果物

- 同期済み workflow root
- 一致した `artifacts.json` / `outputs/artifacts.json`

#### 完了条件

- root 本文と registry が同じ inventory と status を示している

### Phase D: 未タスク導線登録と検証

#### 目的

再利用導線を system spec と未タスク台帳へ固定する。

#### 手順

1. 本未タスクを `docs/30-workflows/unassigned-task/` に配置する。
2. `task-workflow.md` の残課題テーブルと parent task 節に同じ ID を登録する。
3. `lessons-learned.md` と `workflow-light-theme-global-remediation.md` に関連未タスクを追加する。
4. `generate-index.js`、`verify-unassigned-links.js`、`audit-unassigned-tasks.js --json --diff-from HEAD --target-file ...` を実行する。

#### 成果物

- 登録済み unassigned task
- 同期済み system spec
- 検証ログ

#### 完了条件

- 未タスクの ID、説明、参照先が docs と system spec で一致する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] current worktree ベースの inventory correction 手順が定義されている
- [ ] token / component / verification-only の3 lane が明文化されている
- [ ] 必要な `aiworkflow-requirements` 抽出セットが列挙されている
- [ ] parent task 節と残課題テーブルの両方に同じ未タスク ID が登録されている

### 品質要件

- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` が PASS する
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-spec-created-ui-workflow-root-sync-guard-001.md` で `currentViolations.total = 0`
- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` 実行後に index が再生成される
- [ ] `artifacts.json` と `outputs/artifacts.json` の差分確認手順が明記されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow.md` に概要と参照パスが追加されている
- [ ] `lessons-learned.md` に苦戦箇所由来の関連未タスク導線が追加されている
- [ ] `workflow-light-theme-global-remediation.md` に light-theme 系の関連改善タスクとして登録されている

---

## 6. 検証方法

### テストケース

| テストケース                  | 目的                                                                         | 合格条件                                                  |
| ----------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| TC-01 inventory drift 検知    | 旧 unassigned inventory が current worktree とずれた場合を見抜けるか確認する | primary target と verification-only target が再分類される |
| TC-02 cross-cutting spec 抽出 | `ui-ux-*` 以外の必要仕様が落ちないか確認する                                 | state / api / security / portal の採否が記録される        |
| TC-03 registry 同期           | root registry と outputs registry の不一致を検知できるか確認する             | `diff -u` が差分なしになる                                |
| TC-04 未タスク導線            | parent task / backlog / lessons / workflow spec の導線が揃っているか確認する | 同一 ID で全箇所から辿れる                                |

### 検証手順

1. `ls docs/30-workflows/unassigned-task/ | rg 'spec-created-ui-workflow-root-sync-guard-001'`
2. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
3. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
4. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/unassigned-task/task-imp-spec-created-ui-workflow-root-sync-guard-001.md`
5. `diff -u docs/30-workflows/light-theme-shared-color-migration/artifacts.json docs/30-workflows/light-theme-shared-color-migration/outputs/artifacts.json`

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                                                                             |
| ------------------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------------------------------------------- |
| 既存の stale validator と責務が重複して見える    | 中     | 中       | validator 実装ではなく `spec_created` UI workflow 運用ガードであることを本文に明記する                           |
| parent workflow 固有の事象に閉じて汎用化できない | 中     | 中       | light-theme を起点にしつつ、inventory correction / lane 分離 / system spec extraction の一般ルールとして記述する |
| system spec 更新が `task-workflow` だけで終わる  | 高     | 中       | `task-workflow` / `lessons-learned` / workflow spec の3本同期を完了条件に含める                                  |
| 未タスク追加だけで links/audit 検証を忘れる      | 中     | 中       | `verify-unassigned-links` と `audit --diff-from HEAD --target-file` を必須化する                                 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-light-theme-global-remediation.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/security-principles.md`

### 参考資料

- `docs/30-workflows/light-theme-shared-color-migration/index.md`
- `docs/30-workflows/light-theme-shared-color-migration/phase-1-requirements.md`
- `docs/30-workflows/light-theme-shared-color-migration/phase-2-design.md`
- `docs/30-workflows/light-theme-shared-color-migration/phase-3-design-review.md`
- `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-1/requirements-definition.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

該当なし。`TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001` の再監査で露出した苦戦箇所を、再利用用の改善未タスクとして formalize したもの。

### 補足事項

- 本タスクは実装タスクではなく、`spec_created` UI workflow の正本同期ルールを固める改善タスクである。
- 一般 stale 検知は `UT-IMP-WORKFLOW-STALE-VALIDATOR-001` が担当し、本タスクは actual inventory と system spec extraction の同期に責務を限定する。
