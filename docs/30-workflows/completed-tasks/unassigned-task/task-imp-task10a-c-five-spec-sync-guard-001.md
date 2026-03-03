# UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001: TASK-10A-C 5仕様書同時同期ガード

## メタ情報

```yaml
issue_number: 949
task_id: UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001
task_name: TASK-10A-C 5仕様書同時同期ガード
category: 改善
target_feature: SkillCreateWizard Phase 12 仕様同期（api-ipc/interfaces/security/task-workflow/lessons）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-10A-C Phase 12再監査（2026-03-03）
created_date: 2026-03-03
dependencies:
  [
    UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001,
    UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001,
  ]
```

| 項目         | 内容                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK10A-C-FIVE-SPEC-SYNC-GUARD-001                                                |
| タスク名     | TASK-10A-C 5仕様書同時同期ガード                                                         |
| 分類         | 改善                                                                                     |
| 対象機能     | SkillCreateWizard Phase 12 仕様同期（api-ipc/interfaces/security/task-workflow/lessons） |
| 優先度       | 中                                                                                       |
| 見積もり規模 | 中規模                                                                                   |
| ステータス   | 未実施                                                                                   |
| 発見元       | TASK-10A-C Phase 12再監査（苦戦箇所）                                                    |
| 発見日       | 2026-03-03                                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-C の再監査で、`skill:create` の実装自体は完了していたが、仕様同期は複数仕様書への同時反映が必須であり、作業順序が崩れると契約ドリフトが再発しやすいことが確認された。

### 1.2 問題点・課題

- `api-ipc` / `interfaces` / `security` / `task-workflow` / `lessons` の5仕様書を同一ターンで更新する明確なゲートがない。
- `spec-update-summary.md` の分担表だけ更新され、`task-workflow.md` 側へ転記されないケースが起きうる。
- 「実装内容 + 苦戦箇所 + 同種課題の簡潔解決手順」の3点セットが、仕様書ごとに欠ける可能性がある。

### 1.3 放置した場合の影響

- 仕様書間で契約記述がズレ、次タスクで再調査コストが増える。
- SubAgent分担の追跡性が落ち、責務境界が不明瞭になる。
- 同種課題で同じ苦戦を繰り返し、Phase 12 差し戻しリスクが上がる。

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill:create` 系タスクで、5仕様書への同時同期を機械的に確認できるガード手順を定義し、再利用可能な運用へ固定する。

### 2.2 最終ゴール

1. 5仕様書すべてに「実装内容 + 苦戦箇所 + 同種課題の簡潔解決手順」が存在することを確認できる。
2. `task-workflow.md` に仕様書別SubAgent分担が必ず転記される。
3. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` の合格値を同一台帳に固定できる。

### 2.3 スコープ

#### 含むもの

- Phase 12 5仕様書同期の完了ゲート定義
- SubAgent分担表の二重台帳（spec-update-summary + task-workflow）同期ルール
- 5仕様書の必須記載項目チェック（実装/苦戦/簡潔手順）

#### 含まないもの

- `skill:create` の機能追加/実装修正
- 既存未タスク全件の一括フォーマット修正
- UIスクリーンショット取得フロー自体の変更

### 2.4 成果物

- 本未タスク仕様書（本ファイル）
- 5仕様書同期ガード手順の更新差分（system spec）
- `task-workflow.md` 残課題テーブルへの登録

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の未タスクフォーマットを理解していること
- `aiworkflow-requirements` の対象5仕様書を編集可能であること
- Phase 12 検証コマンドが利用可能であること

### 3.2 依存タスク

- UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001
- UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`

### 3.4 推奨アプローチ

1. SubAgentごとに仕様書を固定し、更新対象と完了条件を先に定義する。
2. 5仕様書の必須3点（実装/苦戦/簡潔手順）を同一ターンで埋める。
3. `task-workflow` に分担表を転記した時点でのみ「同期完了」と判定する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                     | 発見経緯                          | 解決策                                                  | 教訓                             |
| ---------------------------------------- | --------------------------------- | ------------------------------------------------------- | -------------------------------- |
| 4仕様書同期で止まり lessons 反映が遅れる | TASK-10A-C で契約同期優先時に発生 | 同期対象を5仕様書へ固定し、lessons まで同一ターンで更新 | 仕様同期は実装契約だけで閉じない |
| 分担表が `spec-update-summary` のみ残る  | 完了台帳への転記が後回しになる    | `task-workflow` への分担表転記を完了条件に昇格          | 分担は成果物と台帳の両方へ残す   |
| 苦戦箇所はあるが再利用手順が欠ける       | 記録を症状中心で終える            | すべての対象仕様書へ「同種課題の簡潔解決手順」を必須化  | 教訓は再利用手順までがセット     |

---

## 4. 実行手順

### Phase構成

- Phase A: 同期対象と完了条件の定義
- Phase B: 5仕様書同時更新の実施
- Phase C: 検証と台帳固定

### Phase A: 同期対象と完了条件の定義

#### 目的

同期漏れを防ぐため、対象仕様書と必須記載項目を先に固定する。

#### 手順

1. 対象5仕様書を確定する（api-ipc/interfaces/security/task-workflow/lessons）。
2. 各仕様書で必須とする3項目（実装/苦戦/簡潔手順）をチェックリスト化する。
3. SubAgent分担（A〜E）を定義する。

#### 成果物

- 5仕様書同期チェックリスト

#### 完了条件

- 対象と必須項目が明文化され、作業開始前に共有されている。

### Phase B: 5仕様書同時更新の実施

#### 目的

仕様書間ドリフトを発生させず、同一ターンで更新を完了させる。

#### 手順

1. 各SubAgentが担当仕様書へ「実装内容 + 苦戦箇所 + 簡潔手順」を追記する。
2. `task-workflow.md` の対象タスク節に仕様書別SubAgent分担表を転記する。
3. `lessons-learned.md` へ再発条件付き教訓を同期する。

#### 成果物

- 更新済み5仕様書

#### 完了条件

- 5仕様書すべてで必須3項目が確認できる。

### Phase C: 検証と台帳固定

#### 目的

機械検証値と台帳記録を一致させ、再利用可能な完了状態を確定する。

#### 手順

1. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` を実行する。
2. `audit-unassigned-tasks --json --target-file` で本指示書を監査する。
3. 検証値を `task-workflow.md` と `lessons-learned.md` に同期する。

#### 成果物

- 検証ログ
- 台帳反映差分

#### 完了条件

- `currentViolations.total=0` と主要検証PASSを満たす。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 5仕様書の同期対象が固定されている
- [ ] 各仕様書に実装内容が記録されている
- [ ] 各仕様書に苦戦箇所が記録されている
- [ ] 各仕様書に同種課題の簡潔解決手順が記録されている

### 品質要件

- [ ] `task-workflow.md` にSubAgent分担表が転記されている
- [ ] 仕様書間で契約記述の矛盾がない
- [ ] `verify-all-specs` / `validate-phase-output` がPASS

### ドキュメント要件

- [ ] 本ファイルが `docs/30-workflows/completed-tasks/unassigned-task/` に配置済み
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] `lessons-learned.md` に関連未タスクとして追記済み

---

## 6. 検証方法

### テストケース

- Case 1: 5仕様書に必須3項目が存在する
- Case 2: `task-workflow` の分担表が `spec-update-summary` と整合する
- Case 3: 未タスク指示書フォーマットが10見出し準拠である

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/skill-create-wizard --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/skill-create-wizard
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task10a-c-five-spec-sync-guard-001.md
rg -n "実装時の苦戦箇所（TASK-10A-C）|同種課題の簡潔解決手順" .claude/skills/aiworkflow-requirements/references/api-ipc-agent.md .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md .claude/skills/aiworkflow-requirements/references/task-workflow.md .claude/skills/aiworkflow-requirements/references/lessons-learned.md
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                    |
| ------------------------------ | ------ | -------- | ------------------------------------------------------- |
| 5仕様書のうち1ファイル更新漏れ | 高     | 中       | 対象固定チェックリストを先に作成し、完了時に5件突合する |
| 分担表転記漏れ                 | 中     | 中       | `task-workflow` 転記を完了条件に含める                  |
| 教訓が抽象的で再利用できない   | 中     | 中       | 再発条件と標準ルールを必須項目化する                    |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`
- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-12/spec-update-summary.md`

### 参考資料

- `.claude/skills/skill-creator/references/patterns.md`（TASK-10A-C 成功/失敗パターン）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
タスク仕様書作成skillに従って未タスクを未タスクディレクトリに作成し、今回実装に苦戦した箇所も記述すること。
```

### 補足事項

- 本未タスクは「機能追加」ではなく、Phase 12 運用ガードの標準化を目的とする。
