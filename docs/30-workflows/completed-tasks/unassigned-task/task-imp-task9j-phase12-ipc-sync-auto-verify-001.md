# UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001: TASK-9J Phase 12 IPC同期自動検証ガード

## メタ情報

```yaml
issue_number: 927
task_id: UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001
task_name: TASK-9J Phase 12 IPC同期自動検証ガード
category: 改善
target_feature: Phase 12 IPC追加時の5仕様書同期と handler/register/preload 三点突合
priority: 中
scale: 中規模
status: 完了（2026-02-28, Phase 12完了移管）
source_phase: TASK-9J-skill-analytics Phase 12再確認（実装苦戦箇所）
created_date: 2026-02-28
```

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001      |
| タスク名     | TASK-9J Phase 12 IPC同期自動検証ガード              |
| 分類         | 改善                                                |
| 対象機能     | IPC追加時の Phase 12 同期運用（5仕様書 + 三点突合） |
| 優先度       | 中                                                  |
| 見積もり規模 | 中規模                                              |
| ステータス   | 完了（2026-02-28, Phase 12完了移管）                |
| 発見元       | TASK-9J-skill-analytics Phase 12再確認（苦戦箇所）  |
| 発見日       | 2026-02-28                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9J の実装では、`skillAnalyticsHandlers.ts` の追加後に `ipc/index.ts` 側登録漏れ、`skillHandlers.ts` との責務重複、Preload API命名ドリフト（`recordAnalytics` / `analyticsRecord`）が発生した。運用ルールは仕様書へ反映済みだが、判定の多くが手作業に依存している。

### 1.2 問題点・課題

- IPC追加時の完了判定（`handler/register/preload`）が機械検証されていない
- Phase 12 の同期対象が実務上は5仕様書（interfaces/api-ipc/security/task-workflow/lessons）だが、既存ガードは4仕様書前提の運用資産が残る
- 仕様書更新済みでも、実装経路とのドリフトを再監査で発見する後追い型になりやすい

### 1.3 放置した場合の影響

- 実装済み機能が本番起動経路で未接続になる再発リスクが残る
- Phase 12 の差し戻しコストが継続し、完了判定の再現性が低下する
- 同種課題で毎回同じ確認を手動で繰り返すことになる

---

## 2. 何を達成するか（What）

### 2.1 目的

IPC追加時の Phase 12 完了判定を自動検証化し、TASK-9J で発生した苦戦箇所（登録漏れ・責務重複・命名ドリフト）を再発させない。

### 2.2 最終ゴール

1. `handler/register/preload` 三点突合を自動検証する仕組みを追加する
2. Phase 12 の同期対象を5仕様書として機械判定できるようにする
3. 検証結果を `task-workflow.md` と Phase 12成果物へ即転記できる運用を固定する

### 2.3 スコープ

#### 含むもの

- `task-specification-creator` 側の自動検証スクリプトまたは既存スクリプト拡張
- 5仕様書同期の検証ルール（interfaces/api-ipc/security/task-workflow/lessons）
- 失敗時の是正フロー（実装→仕様→台帳の順）

#### 含まないもの

- 新規IPC機能の実装（ビジネスロジック追加）
- TASK-9J以外の全ドメインへの一括適用

### 2.4 成果物

- IPC三点突合の自動検証仕様（コマンド化）
- 5仕様書同期チェック項目と判定基準
- 検証結果の台帳転記テンプレート（Phase 12向け）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9J の仕様反映が `aiworkflow-requirements` に完了している
- `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` が利用可能
- `skill-creator` の `phase12-spec-sync-subagent-template.md` が5仕様書分担版に更新済みである

### 3.2 依存タスク

- UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001
- UT-IMP-SKILL-IPC-DOCUMENTATION-CONTRACT-SYNC-GUARD-001
- UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001

### 3.3 必要な知識

- Electron IPC（Main/Preload）実装パターン
- Phase 12 の完了判定フロー
- `aiworkflow-requirements` の更新対象仕様書構造

### 3.4 推奨アプローチ

1. `task-specification-creator/scripts` に三点突合チェックを追加する
2. 5仕様書同期の必須更新判定を `--workflow` 検証と組み合わせる
3. 失敗時は「実装経路修正 → 仕様同期 → 台帳更新」の順で是正する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                            | 発見経緯                                                                    | 解決策                                                                        | 教訓                                                                |
| ------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| IPCハンドラ実装後の登録配線漏れ | TASK-9Jで `skillAnalyticsHandlers.ts` 実装後、`ipc/index.ts` 登録漏れが発生 | `registerSkillAnalyticsHandlers` を起動経路へ追加し、検証観点に登録配線を追加 | IPC完了条件は `handler/register/preload` の3点セットで判定する      |
| analytics責務の重複実装         | `skillHandlers.ts` と `skillAnalyticsHandlers.ts` に責務が分散              | analytics責務を専用ハンドラへ一本化                                           | 同一チャネル群は1ファイル1責務を維持する                            |
| Preload API命名ドリフト         | 仕様書 `recordAnalytics` と実装 `analyticsRecord` が混在                    | `skill-api.ts` を正本として仕様を一方向同期                                   | API命名は「実装正本→仕様書」運用を固定する                          |
| 共有型公開面の更新漏れ          | `src/types` 更新だけで `@repo/shared` 公開が不足                            | `packages/shared/index.ts` の再エクスポートを追加                             | 共有型は `definition + types/index + package index` の3点同期が必要 |

### 3.6 SubAgent分担（関心ごとの分離）

| SubAgent   | 担当関心     | 主担当作業                                      | 依存      |
| ---------- | ------------ | ----------------------------------------------- | --------- |
| SubAgent-A | 実装経路検証 | `handler/register/preload` 三点突合ロジック定義 | なし      |
| SubAgent-B | 仕様同期検証 | 5仕様書更新判定ロジック定義                     | Aと並列可 |
| SubAgent-C | 台帳同期     | `task-workflow.md` / 関連仕様書への記録手順整備 | A/B後     |
| SubAgent-D | 検証運用     | 検証コマンド統合・PASS/FAIL判定固定             | C後       |

---

## 4. 実行手順

### Phase構成

- Phase A: 検証要件定義
- Phase B: 検証ロジック実装
- Phase C: ワークフロー統合
- Phase D: 仕様書・台帳反映

### Phase A: 検証要件定義

#### 目的

三点突合と5仕様書同期の判定要件を確定する。

#### 手順

1. IPC追加時の必須チェック項目を定義する
2. 5仕様書の必須更新判定ルールを定義する
3. FAIL時の是正順序を定義する

#### 成果物

- 検証要件定義書

#### 完了条件

- 判定条件が曖昧なく定義される

### Phase B: 検証ロジック実装

#### 目的

機械検証で判定できる実装を追加する。

#### 手順

1. `task-specification-creator/scripts` に検証処理を追加する
2. `--workflow` 指定時に三点突合と5仕様書判定を実行する
3. 結果を JSON/テキストで出力する

#### 成果物

- 検証スクリプト（新規または既存拡張）

#### 完了条件

- 想定FAILケースで確実に検出される

### Phase C: ワークフロー統合

#### 目的

Phase 12の標準検証チェーンに組み込む。

#### 手順

1. 検証コマンドを `phase-11-12-guide.md` へ反映する
2. `spec-update-workflow.md` に判定ルールを追記する
3. 失敗時アクションをテンプレート化する

#### 成果物

- 更新済み検証導線ドキュメント

#### 完了条件

- Phase 12再確認手順に自動検証が組み込まれる

### Phase D: 仕様書・台帳反映

#### 目的

運用資産として追跡可能にする。

#### 手順

1. 本未タスクの参照を `task-workflow.md` 残課題へ登録する
2. 関連仕様書の未タスクテーブルへ登録する
3. `SKILL.md` / `LOGS.md` を更新して履歴化する

#### 成果物

- 仕様書更新差分

#### 完了条件

- 参照リンク切れなし、監査で current 違反 0 を維持

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 三点突合（handler/register/preload）の自動検証が実装されている
- [ ] 5仕様書同期の必須更新判定が実装されている
- [ ] FAIL時の是正フローがドキュメント化されている

### 品質要件

- [ ] 判定ロジックに曖昧な手作業ステップが残っていない
- [ ] 既存検証コマンドとの重複/矛盾がない
- [ ] 再監査時に同じ判定結果を再現できる

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] 関連仕様書の未タスク参照に反映されている

---

## 6. 検証方法

### テストケース

- Case 1: `handler/register/preload` が揃っている場合 PASS
- Case 2: `register` 欠落時に FAIL
- Case 3: `api-ipc` 未更新時に FAIL
- Case 4: 5仕様書同時更新時に PASS

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-9J-skill-analytics
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-9J-skill-analytics
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task9j-phase12-ipc-sync-auto-verify-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                | 影響度 | 発生確率 | 対策                                                       |
| ------------------------------------- | ------ | -------- | ---------------------------------------------------------- |
| 既存検証スクリプトと責務が重複する    | 中     | 中       | 既存スクリプトの役割分担を先に明文化し、拡張優先で実装する |
| 5仕様書判定が過剰厳格で運用負荷になる | 中     | 低       | 対象を「IPC追加タスク時のみ」に条件化する                  |
| 既存未タスクとのスコープ重複          | 中     | 中       | 依存関係を明記し、本タスクを「自動検証化」に限定する       |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `docs/30-workflows/completed-tasks/TASK-9J-skill-analytics/outputs/phase-12/documentation-changelog.md`
- `docs/30-workflows/completed-tasks/TASK-9J-skill-analytics/outputs/phase-12/spec-update-summary.md`
- `.claude/rules/06-known-pitfalls.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
IPC追加後に handler 実装だけで完了扱いにすると、register 配線漏れと Preload 命名ドリフトが再発する。
Phase 12 では 5仕様書同期と三点突合を機械判定できる形にする必要がある。
```

### 補足事項

- 本タスクは「運用ガードの自動検証化」が対象であり、TASK-9J 機能自体の再実装は含まない。
