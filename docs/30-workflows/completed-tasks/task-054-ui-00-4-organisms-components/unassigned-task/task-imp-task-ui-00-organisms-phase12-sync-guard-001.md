# UT-IMP-TASK-UI-00-ORGANISMS-PHASE12-SYNC-GUARD-001: TASK-UI-00-ORGANISMS Phase 12 証跡・台帳同期ガード

## メタ情報

```yaml
issue_number: 980
task_id: UT-IMP-TASK-UI-00-ORGANISMS-PHASE12-SYNC-GUARD-001
task_name: TASK-UI-00-ORGANISMS Phase 12 証跡・台帳同期ガード
category: 改善
target_feature: TASK-UI-00-ORGANISMS Phase 12（UI証跡・未タスク監査・system spec同期）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UI-00-ORGANISMS Phase 12再確認（苦戦箇所）
created_date: 2026-03-04
```

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-TASK-UI-00-ORGANISMS-PHASE12-SYNC-GUARD-001           |
| タスク名     | TASK-UI-00-ORGANISMS Phase 12 証跡・台帳同期ガード           |
| 分類         | 改善                                                         |
| 対象機能     | TASK-UI-00-ORGANISMS の Phase 12運用（証跡・監査・台帳同期） |
| 優先度       | 中                                                           |
| 見積もり規模 | 中規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-UI-00-ORGANISMS Phase 12再確認（2026-03-04）            |
| 発見日       | 2026-03-04                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-00-ORGANISMS では、Phase 11 の再撮影証跡（TC-01〜TC-06）と Phase 12 文書群を再同期したが、更新手順が個人依存になりやすいことが判明した。

### 1.2 問題点・課題

- UI再撮影後に `manual-test-result.md` と system spec の時刻同期が漏れやすい。
- `audit-unassigned-tasks --diff-from HEAD` の `current`/`baseline` を混同し、誤判定しやすい。
- Step 1-A で UI仕様書更新のみ先行し、`task-workflow.md` / `lessons-learned.md` の同時更新が漏れる。

### 1.3 放置した場合の影響

- Phase 12 の再確認時に証跡の信頼性が下がり、差し戻しが増える。
- 未タスク判定の再現性が失われ、同種課題で同じ手戻りを繰り返す。
- system spec 正本と workflow 成果物の整合が崩れる。

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-UI-00-ORGANISMS 系の Phase 12 で、画面証跡・未タスク監査・system spec 反映を一連手順として固定し、誰が実行しても同じ合否判定になる状態を作る。

### 2.2 最終ゴール

1. UI再撮影後の時刻同期手順が明文化されている。
2. 未タスク監査の合否軸が `currentViolations=0` で統一されている。
3. Step 1-A で `task-workflow` と `lessons` の同時更新が完了条件として固定されている。

### 2.3 スコープ

#### 含むもの

- Phase 12の証跡同期手順（再撮影・時刻同期・coverage検証）
- 未タスク監査の判定ルール（current/baseline分離）
- system spec 台帳同期（`task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md`）

#### 含まないもの

- Organisms コンポーネント本体の機能改修
- 新規IPCチャンネルや新規型契約の追加

### 2.4 成果物

- 本未タスク指示書
- system spec の残課題テーブル登録
- lessons 側の関連未タスク導線
- 再利用用の検証コマンドセット

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-UI-00-ORGANISMS` の Phase 11/12 成果物が存在すること。
- `task-specification-creator` の監査スクリプトが利用可能であること。
- `aiworkflow-requirements` の正本更新フロー（`SKILL.md` / `LOGS.md` / `generate-index.js`）を実行できること。

### 3.2 依存タスク

- TASK-UI-00-ORGANISMS（完了済み）
- TASK-UI-00-MOLECULES の Phase 12 運用ガード知見（関連）

### 3.3 必要な知識

- `validate-phase11-screenshot-coverage` の運用
- `audit-unassigned-tasks` の `current`/`baseline` 判定
- `aiworkflow-requirements` の台帳同期ルール

### 3.4 推奨アプローチ

1. 再撮影証跡と `stat` 時刻を先に固定する。
2. 監査コマンドで `currentViolations=0` を合否判定する。
3. system spec 3点（feature/workflow/lessons）を同一ターンで更新する。

## 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                     | 発見経緯                                          | 解決策                                                                     | 教訓                                                                  |
| ------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| UI再撮影後の時刻同期漏れ | TC-01〜TC-06 再撮影後に文書時刻が旧値のまま残存   | `stat` で実時刻を取得し、`manual-test-result.md` と system spec を同時更新 | UI証跡更新は「再撮影→時刻同期→coverage検証」を1セットで固定する       |
| 未タスク監査値の誤読     | `baselineViolations` を今回差分違反と誤認         | 合否判定を `currentViolations=0` に固定し、baselineは監視値として分離      | 監査結果は current/baseline の二軸で必ず記録する                      |
| Step 1-A 同期漏れ        | UI仕様書のみ更新し、台帳/教訓の片側更新が後回し化 | Step 1-A 完了条件に `task-workflow + lessons` 同時更新を明記               | Phase 12 完了判定は「仕様同期 + 台帳同期 + 教訓同期」の同時成立にする |

---

## 4. 実行手順

### Phase構成

- Phase A: 証跡・監査要件の定義
- Phase B: system spec 同期
- Phase C: 検証と完了判定

### Phase A: 証跡・監査要件の定義

#### 目的

証跡同期と未タスク監査の判定軸を固定する。

#### 手順

1. `manual-test-result.md` とスクリーンショットの時刻同期要件を定義する。
2. `currentViolations=0` を合否基準として明記する。
3. Step 1-A の同時更新対象を定義する。

#### 成果物

- 同期要件定義

#### 完了条件

- 判定軸（時刻/監査/台帳同期）が曖昧なく定義されている。

### Phase B: system spec 同期

#### 目的

正本仕様に未タスクを登録し、参照導線を固定する。

#### 手順

1. `docs/30-workflows/unassigned-task/` に未タスク仕様書を配置する。
2. `task-workflow.md` 残課題テーブルへ登録する。
3. `lessons-learned.md` と `ui-ux-feature-components.md` に関連未タスク導線を追加する。

#### 成果物

- 更新済み仕様書群

#### 完了条件

- 未タスク参照が system spec 3点で一致している。

### Phase C: 検証と完了判定

#### 目的

配置・リンク・監査の整合を機械検証で担保する。

#### 手順

1. `verify-unassigned-links` を実行する。
2. `audit-unassigned-tasks --target-file` と `--diff-from HEAD` を実行する。
3. `verify-all-specs` / `validate-phase-output` を実行し、Phase 12 出力整合を確認する。

#### 成果物

- 検証ログ

#### 完了条件

- `currentViolations=0`
- `missing=0`
- workflow 検証コマンドが PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 証跡時刻同期フローが定義されている
- [ ] 未タスク監査の判定軸が固定されている
- [ ] Step 1-A 同時更新ルールが定義されている

### 品質要件

- [ ] `verify-unassigned-links` が PASS
- [ ] `audit --target-file` で `currentViolations=0`
- [ ] `audit --diff-from HEAD` で `currentViolations=0`

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] `lessons-learned.md` / `ui-ux-feature-components.md` へ導線が追加されている

---

## 6. 検証方法

### テストケース

- Case 1: 未タスクファイル単体監査で `currentViolations=0`
- Case 2: 差分監査で `currentViolations=0`
- Case 3: system spec 参照リンクが `missing=0`

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --unassigned-dir docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/unassigned-task --target-file docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/unassigned-task/task-imp-task-ui-00-organisms-phase12-sync-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components
```

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                                             |
| ---------------------------- | ------ | -------- | ---------------------------------------------------------------- |
| 時刻同期漏れが再発する       | 中     | 中       | `stat` 取得結果をチェックリスト必須項目に固定する                |
| baseline誤読で誤判定する     | 中     | 中       | `current` 合否 / `baseline` 監視の2軸記録をテンプレート化する    |
| 台帳同期の片側更新が再発する | 中     | 中       | Step 1-A 完了条件に `task-workflow + lessons` 同時更新を組み込む |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-12/spec-update-summary.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/task-054-ui-00-4-organisms-components/outputs/phase-11/screenshot-coverage.md`
- `.claude/rules/06-known-pitfalls.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
TASK-UI-00-ORGANISMS の再確認で、画面証跡時刻同期・未タスク監査判定軸・Step 1-A 同時更新の運用固定が必要と判断した。
```

### 補足事項

- 本タスクは実装コード変更ではなく、Phase 12 運用品質の再発防止を目的とする。
- 完了後は同種 UI タスクへ横展開する（Atoms/Molecules/Advanced Views を含む）。
