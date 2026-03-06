# UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001: Phase 12 UI domain spec 同期ガード

## メタ情報

```yaml
issue_number: 937
task_id: UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001
task_name: Phase 12 UI domain spec 同期ガード
category: 改善
target_feature: Phase 12 UI仕様同期（基本6仕様書 + domain UI spec）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UI-02-GLOBAL-NAV-CORE Phase 12 再監査（実装苦戦箇所）
created_date: 2026-03-06
dependency: UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001
```

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-UI-DOMAIN-SPEC-SYNC-GUARD-001                                    |
| タスク名     | Phase 12 UI domain spec 同期ガード                                              |
| 分類         | 改善                                                                            |
| 対象機能     | Phase 12 における UI仕様同期（基本6仕様書 + navigation 正本などの domain spec） |
| 優先度       | 中                                                                              |
| 見積もり規模 | 中規模                                                                          |
| ステータス   | 未実施                                                                          |
| 発見元       | TASK-UI-02-GLOBAL-NAV-CORE Phase 12 再監査（苦戦箇所・2026-03-06）              |
| 発見日       | 2026-03-06                                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-02-GLOBAL-NAV-CORE の Phase 12 再監査では、`task-workflow.md` / `lessons-learned.md` / `ui-ux-components.md` / `ui-ux-feature-components.md` / `arch-state-management.md` は更新されていた一方で、domain 正本の `ui-ux-navigation.md` への同期が後追いになった。

### 1.2 問題点・課題

- UIタスクの標準同期先が「基本6仕様書」で止まり、domain 固有正本の追加要否が担当者判断になっている
- Phase 12 の SubAgent 分担に domain spec 専任スロットがないと、`navigation` / `ipc` / `security` などの専用正本が抜けやすい
- 5分解決カードや苦戦箇所が task/lessons にだけ残り、実運用で参照される domain 正本へ伝播しない

### 1.3 放置した場合の影響

- UI実装の正本が task 台帳側と domain 正本側で分岐し、再利用時に誤った仕様を参照する
- 同種の UI改善で毎回「どの正本まで更新すべきか」を再判断する必要が出る
- Phase 12 再監査のたびに、実装漏れではなく仕様同期漏れで差し戻しが発生する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 における UI仕様同期を「基本6仕様書 + domain UI spec」まで含めて標準化し、抜け漏れを事前に検知できるようにする。

### 2.2 最終ゴール

1. UIタスクごとに必要な domain spec を追加判定できるチェックルールを定義する
2. SubAgent 分担に domain spec 専任担当を追加し、同期責務を固定する
3. `task-workflow.md` / `lessons-learned.md` / UI正本群に同一未タスクIDで追跡導線を残す

### 2.3 スコープ

#### 含むもの

- UIタスクの Phase 12 で同期対象に含めるべき domain spec の判定ルール
- `ui-ux-navigation.md` のような専用正本への同期ガード
- 苦戦箇所と簡潔解決手順を domain 正本へ反映する運用

#### 含まないもの

- 新しい UI機能の追加実装
- 全 domain spec の一括棚卸し

### 2.4 成果物

- 本未タスク仕様書
- domain spec 同期ガード手順
- 関連システム仕様書への追記（task / lessons / UI detail / navigation）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UIタスクの実装と Phase 11 / 12 監査が完了している
- `aiworkflow-requirements` の UI系正本構造が整理されている
- `task-specification-creator` の未タスク検証スクリプトが利用可能である

### 3.2 依存タスク

- ~~UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001~~（完了済み、4仕様書同期の基本形）

### 3.3 必要な知識

- `ui-ux-components.md` / `ui-ux-feature-components.md` / `ui-ux-navigation.md` の責務差
- UIタスクにおける Phase 12 の台帳同期ルール
- `verify-unassigned-links` と `audit-unassigned-tasks` の判定軸

### 3.4 推奨アプローチ

1. まず「基本6仕様書」で止めず、domain 固有正本の有無を判定する
2. domain spec が存在する場合は SubAgent-G+ を追加し、同期先と完了条件を固定する
3. 苦戦箇所と 5分解決カードは task/lessons だけでなく domain 正本へ同一ターンで反映する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                           | 発見経緯                                                      | 解決策                                                      | 教訓                                                      |
| -------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| 基本6仕様書は更新済みでも domain UI spec が stale になる       | TASK-UI-02 で `ui-ux-navigation.md` の追補が後手になった      | 「基本6仕様書 + domain spec」を同期セットとして定義し直した | UIタスクは index/detail/state/task/lessons だけで閉じない |
| SubAgent 分担に domain spec スロットがなく、責務が宙に浮く     | `navigation` 正本更新が明示担当なしで残った                   | `SubAgent-G+` を domain spec 専任として追加する             | 専用正本があるドメインは担当スロットごと増やす            |
| 苦戦箇所が task/lessons にだけ残り domain 正本で再利用しにくい | `mobileLabel` や UI同期漏れの教訓が現場参照先へ届きにくかった | domain 正本にも同じ教訓と簡潔解決手順を追記する             | 再利用導線は「よく見る正本」に残して初めて機能する        |

---

## 4. 実行手順

### Phase構成

- Phase A: domain spec 判定ルール整理
- Phase B: SubAgent 分担拡張
- Phase C: 正本同期
- Phase D: 監査固定

### Phase A: domain spec 判定ルール整理

#### 目的

UIタスクごとに追加同期すべき domain 正本を判定できるようにする。

#### 手順

1. UIタスクの変更領域と対応する domain 正本を棚卸しする
2. 「基本6仕様書」で足りるケースと追加 domain spec が必要なケースを分ける
3. 判定ルールをテンプレート化する

#### 成果物

- domain spec 判定ルール

#### 完了条件

- domain spec の追加要否を事前に判断できる

### Phase B: SubAgent 分担拡張

#### 目的

domain 正本の同期責務を担当者レベルで明確化する。

#### 手順

1. 既存 SubAgent 分担へ `SubAgent-G+` を追加する
2. domain 正本ごとに担当/完了条件/検証条件を定義する
3. 仕様書ごとの変更履歴更新も担当範囲に含める

#### 成果物

- 拡張済み SubAgent 分担テンプレート

#### 完了条件

- domain 正本の更新漏れが責務不明のまま残らない

### Phase C: 正本同期

#### 目的

UIタスクの実装内容と苦戦箇所を domain 正本まで反映する。

#### 手順

1. `task-workflow.md` と `lessons-learned.md` に未タスクと教訓を追加する
2. `ui-ux-feature-components.md` と対応する domain 正本へ同じ未タスクIDを追記する
3. 実装内容・苦戦箇所・簡潔解決手順を domain 正本へ転記する

#### 成果物

- 同期済み system spec

#### 完了条件

- 台帳/教訓/domain 正本が同じ課題IDを共有している

### Phase D: 監査固定

#### 目的

domain 正本同期の抜け漏れを機械検証で検出できるようにする。

#### 手順

1. 対象の `ui-ux-*.md` を `rg` で横断確認する
2. `verify-unassigned-links.js` を実行する
3. `audit-unassigned-tasks.js --unassigned-dir ... --target-file` と `--diff-from HEAD` を実行する

#### 成果物

- 監査ログ

#### 完了条件

- 未タスク仕様書と system spec 参照が両方整合している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] UIタスクで追加同期すべき domain spec の判定ルールが定義されている
- [ ] SubAgent 分担に domain spec 専任担当が追加されている
- [ ] 苦戦箇所と簡潔解決手順が domain 正本にも反映される

### 品質要件

- [ ] `verify-unassigned-links` が PASS する
- [ ] `audit --target-file` の `currentViolations` が 0 である
- [ ] `audit --diff-from HEAD` の `currentViolations` が 0 である

### ドキュメント要件

- [ ] 本未タスク仕様書が `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/` に配置されている
- [ ] `task-workflow.md` / `lessons-learned.md` / `ui-ux-feature-components.md` / domain 正本へ同一IDが反映されている
- [ ] 苦戦箇所（3.5）が再利用可能な形式で整理されている

---

## 6. 検証方法

### テストケース

- Case 1: UI task に対応する domain 正本が未更新の場合、監査で検出できる
- Case 2: `task-workflow.md` と domain 正本に同一未タスクIDが残る
- Case 3: 本未タスク仕様書がフォーマット監査を通過する

### 使用コマンド

```bash
rg -n "TASK-UI-02|Global Navigation|navigation" .claude/skills/aiworkflow-requirements/references/ui-ux-*.md
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --unassigned-dir docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task --target-file docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/unassigned-task/task-imp-phase12-ui-domain-spec-sync-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

### 合格基準

- `ui-ux-navigation.md` を含む関連正本へ同一論点が反映されている
- `verify-unassigned-links` が missing 0
- `audit-unassigned-tasks` が `currentViolations.total = 0`

---

## 7. リスクと対策

| リスク                                    | 内容                                 | 対策                                                     |
| ----------------------------------------- | ------------------------------------ | -------------------------------------------------------- |
| domain spec 判定が属人的になる            | 追加同期先の判断が担当者依存になる   | 判定ルールをテンプレート化し、UI変更の種類から逆引きする |
| 参照先が増えて更新漏れが増える            | ドキュメント数増加で負担が増える     | SubAgent 分担と完了条件を先に固定する                    |
| 未タスクID だけ追加して本文が追いつかない | 台帳だけ存在し、教訓が正本に残らない | task/lessons/domain 正本を同一ターンで更新する           |

---

## 8. 参照情報

- `docs/30-workflows/completed-tasks/task-057-ui-02-global-nav-core/`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `docs/30-workflows/unassigned-task/task-imp-phase12-spec-sync-subagent-guard-001.md`

---

## 9. 備考

- 本未タスクは TASK-UI-02 の再監査で実際に露出した「domain 正本の後追い同期」を抽象化したもの。
- 初回適用対象は UI系 task だが、同じ構図は `api-ipc-system.md` や `security` 系 domain 正本にも展開可能。
