# UT-IMP-TASK10A-E-A-DOMAIN-SPEC-BLOCK-AUTO-VERIFY-001: TASK-10A-E-A domain仕様3ブロック自動検証ガード

## メタ情報

```yaml
issue_number: 0
task_id: UT-IMP-TASK10A-E-A-DOMAIN-SPEC-BLOCK-AUTO-VERIFY-001
task_name: TASK-10A-E-A domain仕様3ブロック自動検証ガード
category: 改善
target_feature: Phase 12 system spec 同期（api-ipc/security/interfaces）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-10A-E-A Phase 12 再監査（実装苦戦箇所）
created_date: 2026-03-05
```

| 項目         | 内容                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK10A-E-A-DOMAIN-SPEC-BLOCK-AUTO-VERIFY-001                                                                                |
| タスク名     | TASK-10A-E-A domain仕様3ブロック自動検証ガード                                                                                      |
| 分類         | 改善                                                                                                                                |
| 対象機能     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md` / `security-electron-ipc.md` / `interfaces-agent-sdk-skill.md` |
| 優先度       | 中                                                                                                                                  |
| 見積もり規模 | 中規模                                                                                                                              |
| ステータス   | 未実施                                                                                                                              |
| 発見元       | TASK-10A-E-A Phase 12 再監査（苦戦箇所・2026-03-05）                                                                                |
| 発見日       | 2026-03-05                                                                                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-10A-E-A` の再監査で、system spec の更新内容を `task-workflow.md` には詳細に残せる一方、domain正本3仕様書（api-ipc/security/interfaces）への転記粒度が揺れやすいことが分かった。

### 1.2 問題点・課題

- 3仕様書に必要な「実装内容 / 苦戦箇所 / 5ステップ」の存在確認が手動 `rg` 依存
- Step 2 実施後に `spec-update-summary.md` と `documentation-changelog.md` の記録が不一致になりやすい
- `code` と `errorCode` の二軸管理が維持されていても、仕様書側の記述漏れを機械的に止められない

### 1.3 放置した場合の影響

- 同種課題で再び「台帳だけ更新・domain仕様未更新」が発生する
- Phase 12 再監査の差し戻しが増え、ドキュメント品質が不安定になる
- 苦戦箇所の再利用性が低下し、解決時間が延びる

---

## 2. 何を達成するか（What）

### 2.1 目的

domain正本3仕様書の必須ブロックを機械検証し、Phase 12 での system spec 同期を再現可能な運用に固定する。

### 2.2 最終ゴール

1. 3仕様書に必須ブロック（実装内容 / 苦戦箇所 / 5ステップ）が揃っていることを自動判定できる
2. Step 2 同値同期（`spec-update-summary` / `documentation-changelog`）を同じ検証導線で確認できる
3. `task-workflow.md` / `lessons-learned.md` / domain3仕様書の更新漏れを Phase 12 完了前に検出できる

### 2.3 スコープ

#### 含むもの

- domain3仕様書ブロック存在チェックの自動化（スクリプトまたは既存検証への統合）
- Phase 12 テンプレートと完了チェックへの検証手順反映
- `aiworkflow-requirements` の残課題・教訓・変更履歴への同期

#### 含まないもの

- IPC契約仕様（`ERR_1001/2004/5001`）そのものの再設計
- TASK-10A-E-A 実装コード（Main/Preload）の機能追加

### 2.4 成果物

- 未タスク解消用の検証手順（コマンド + 合否基準）
- system spec 更新漏れを止めるチェック項目
- 更新済み仕様書台帳（task-workflow / lessons / 関連仕様）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-specification-creator` の Phase 12 検証スクリプトが利用可能
- `aiworkflow-requirements` の `api-ipc-agent` / `security-electron-ipc` / `interfaces-agent-sdk-skill` が存在
- `TASK-10A-E-A` の完了台帳と教訓セクションが参照可能

### 3.2 依存タスク

- UT-IMP-SKILL-IPC-DOCUMENTATION-CONTRACT-SYNC-GUARD-001
- UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001

### 3.3 必要な知識

- Phase 12 Step 1-A〜Step 2 の更新フロー
- IPC失敗契約の二軸管理（`code` / `errorCode`）
- `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit-unassigned-tasks`

### 3.4 推奨アプローチ

1. domain3仕様書の必須見出しを正規表現で固定し、欠落時に fail させる
2. Step 2 同値同期チェックを同一検証ジョブに含める
3. 台帳3点（task-workflow / lessons / domain仕様）の同時更新を完了条件にする

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                            | 発見経緯                                                            | 解決策                                                                                  | 教訓                                                                       |
| ------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| domain3仕様書の転記粒度ドリフト | TASK-10A-E-A 再監査で `task-workflow` 側のみ詳細化されやすかった    | 3仕様書に同一3ブロック（実装内容/苦戦箇所/5ステップ）を固定し、見出し存在を機械検証する | 仕様書別SubAgent運用は「分担定義」だけでなく「分担成果の機械検証」まで必要 |
| Step 2 記録不一致               | `spec-update-summary` と `documentation-changelog` の片側更新が発生 | Step 2 判定後に2成果物を同一ターンで更新し、検証コマンドで差分を確認する                | Step 2 完了条件は「更新要否判断」ではなく「2成果物同値化」                 |
| `code` / `errorCode` の転記漏れ | 契約表を message 中心で更新すると片軸が落ちる                       | `code + errorCode + message` を1テーブルで管理し、3分類を固定する                       | IPC失敗契約は必ず二軸で記録し、片軸更新を禁止する                          |

---

## 4. 実行手順

### Phase A: 検証基準の固定

1. domain3仕様書の必須見出し（実装内容/苦戦箇所/5ステップ）を定義
2. Step 2 同値同期の判定条件（更新要否 + 更新対象一致）を定義
3. 合否判定軸（current/baseline 分離）を明文化

### Phase B: 検証導線の実装

1. 既存スクリプトへ検証追加、または専用検証スクリプトを追加
2. `phase12-system-spec-retrospective-template` の検証コマンドへ統合
3. 失敗時の未タスク化ルールを固定

### Phase C: 仕様書同期と監査

1. `task-workflow.md` / `lessons-learned.md` / domain3仕様書へ運用ルールを反映
2. 未タスク台帳を更新し、参照リンクの実在を確認
3. 監査コマンドを実行して `currentViolations=0` を確認

---

## 5. 完了条件チェックリスト

- [ ] domain3仕様書の必須3ブロック存在を機械判定できる
- [ ] Step 2 同値同期チェックを検証導線に組み込んだ
- [ ] `code` / `errorCode` 二軸チェックを完了条件に含めた
- [ ] 本未タスク指示書を `docs/30-workflows/unassigned-task/` に配置した
- [ ] `task-workflow.md` の関連未タスクへ登録した
- [ ] `interfaces-agent-sdk-skill.md` と `lessons-learned.md` に関連未タスク導線を追加した

---

## 6. 検証方法

### テストケース

- Case 1: 3仕様書に必須見出しが揃う場合 PASS
- Case 2: 1仕様書の「苦戦箇所」見出しを削除した場合 FAIL
- Case 3: Step 2 記録が summary/changelog で不一致の場合 FAIL

### 検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/task-043a-ipc-contract-and-security-alignment --strict --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/task-043a-ipc-contract-and-security-alignment
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-task10a-e-a-domain-spec-block-auto-verify-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                                                                           |
| ---------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------ |
| 検証対象見出しが増減し、正規表現が追従できない | 中     | 中       | 見出し定義をテンプレート1箇所で管理し、スクリプトはその定義を参照する          |
| 監査値の baseline を今回差分 fail と誤認       | 中     | 中       | 合否は `currentViolations.total` のみで判定し、baseline は監視値として別記録   |
| 未タスク導線が1仕様書にしか反映されない        | 高     | 低       | Step 1-A 完了条件に「task-workflow + lessons + domain仕様」の3点同時更新を固定 |

---

## 8. 参照情報

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`

---

## 9. 備考

- 本タスクは「既存実装の再開発」ではなく、Phase 12 の仕様同期品質ゲートを強化する運用改善タスク。
- 完了時は `docs/30-workflows/completed-tasks/unassigned-task/` への移管と、参照先の再同期を同一ターンで行う。
