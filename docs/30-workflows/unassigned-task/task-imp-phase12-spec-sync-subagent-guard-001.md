# UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001: Phase 12 仕様書別SubAgent同期ガードの自動化

## メタ情報

```yaml
issue_number: 915
task_id: UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001
task_name: Phase 12 仕様書別SubAgent同期ガードの自動化
category: 改善
target_feature: aiworkflow-requirements Phase 12 仕様同期（interfaces/security/task-workflow/lessons）
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-FIX-SKILL-EXECUTE-INTERFACE-001 Phase 12 再確認（実装苦戦箇所）
created_date: 2026-02-25
```

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001                                |
| タスク名     | Phase 12 仕様書別SubAgent同期ガードの自動化                                |
| 分類         | 改善                                                                       |
| 対象機能     | aiworkflow-requirements の Phase 12 仕様同期（4仕様書）                    |
| 優先度       | 中                                                                         |
| 見積もり規模 | 中規模                                                                     |
| ステータス   | 未実施                                                                     |
| 発見元       | UT-FIX-SKILL-EXECUTE-INTERFACE-001 Phase 12 再確認（苦戦箇所・2026-02-25） |
| 発見日       | 2026-02-25                                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill:execute` 契約整合（UT-FIX-SKILL-EXECUTE-INTERFACE-001）を反映する際、`interfaces`/`security`/`task-workflow`/`lessons` の4仕様書を同時更新する必要があった。

### 1.2 問題点・課題

- 仕様書更新を単独で順次進行すると、反映順序の差で同期漏れが発生しやすい
- `audit-unassigned-tasks` の `current`/`baseline` 解釈を誤ると、不要な再修正が発生する
- `validate-phase-output` の引数形式誤用で再検証のやり直しが起きる

### 1.3 放置した場合の影響

- 実装完了後も仕様不整合で Phase 12 が差し戻される
- 同種タスクで同じ再確認コストを繰り返す
- 仕様同期が属人化し、タスク完了判定の再現性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 の横断仕様更新を「仕様書別SubAgent分担 + 機械検証」で標準化し、同期漏れを自動的に検知できる状態にする。

### 2.2 最終ゴール

1. 4仕様書（`interfaces`/`security`/`task-workflow`/`lessons`）同時更新の必須条件を定義する
2. 分担表・更新有無・検証証跡をチェックするガード手順を整備する
3. 失敗時の修正フロー（再同期→再検証）を標準化する

### 2.3 スコープ

#### 含むもの

- Phase 12 仕様同期ガードの手順定義
- SubAgent分担テンプレートとチェック項目の運用定義
- `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from` の証跡要件化

#### 含まないもの

- `skill:execute` 以外の機能実装変更
- 全ドメイン仕様書への一括適用（初回は skill 系仕様同期に限定）

### 2.4 成果物

- 仕様同期ガード手順書
- 分担テンプレート運用チェックリスト
- システム仕様書への追記（残課題/運用ルール/教訓）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-EXECUTE-INTERFACE-001 の完了記録が存在する
- `task-specification-creator` の Phase 12 検証コマンドが利用可能である
- aiworkflow-requirements の正本更新フロー（SKILL/LOGS/変更履歴）が確立されている

### 3.2 依存タスク

- ~~UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001~~（完了済み）
- ~~UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001~~（完了済み）

### 3.3 必要な知識

- Phase 12 Step 1-A〜1-D の同期要件
- `audit-unassigned-tasks` の `current`/`baseline` 判定
- aiworkflow-requirements の台帳更新ルール

### 3.4 推奨アプローチ

1. 仕様書ごとの SubAgent 担当と完了条件を先に固定する
2. 4仕様書を同一ターンで更新し、変更履歴を同時記録する
3. 4コマンド検証を必須実行し、結果を台帳へ反映する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                     | 発見経緯                                                                    | 解決策                                                                                                | 教訓                                                             |
| ---------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 仕様書同期を単独進行すると更新漏れが発生 | UT-FIX-SKILL-EXECUTE-INTERFACE-001 の Phase 12 再確認で、反映順序依存が発生 | 仕様書別SubAgent（A: interfaces / B: security / C: task-workflow / D: lessons）を固定し同一ターン更新 | 横断仕様更新は単一担当の逐次更新ではなく、責務分担前提で実施する |
| `--target-file` の出力を誤読             | baseline が混在し、対象ファイル違反と誤認した                               | 判定を `currentViolations.total` 固定にし、baseline は別枠で記録                                      | 監査結果は `current`/`baseline` を分離して扱う                   |
| `validate-phase-output` 引数誤用         | `--phase` 指定を試して再実行が発生                                          | `validate-phase-output.js <workflow-dir>` の位置引数で統一                                            | コマンド形式はテンプレート化して運用する                         |

---

## 4. 実行手順

### Phase構成

- Phase A: ガード要件定義
- Phase B: 分担テンプレート運用化
- Phase C: 検証フロー固定
- Phase D: 仕様書反映と台帳同期

### Phase A: ガード要件定義

#### 目的

4仕様書同時更新の必須条件を定義する。

#### 手順

1. 対象4仕様書と必須記載項目を定義する
2. SubAgent担当と完了条件をマトリクス化する
3. 検証必須4コマンドを固定する

#### 成果物

- 同期ガード要件定義

#### 完了条件

- 4仕様書の更新条件と検証条件が一意に判定できる

### Phase B: 分担テンプレート運用化

#### 目的

仕様同期時の形式ブレを防止する。

#### 手順

1. 分担テンプレートに担当/完了条件を記入する
2. 4仕様書へ同時適用する
3. 変更履歴更新を同一ターンで実施する

#### 成果物

- 更新済み分担テンプレート運用記録

#### 完了条件

- 4仕様書に同一粒度の分担情報が反映される

### Phase C: 検証フロー固定

#### 目的

同期漏れの再発を検証コマンドで検出可能にする。

#### 手順

1. `verify-all-specs --workflow` を実行する
2. `validate-phase-output <workflow-dir>` を実行する
3. `verify-unassigned-links` と `audit --diff-from HEAD` を実行する

#### 成果物

- 検証ログ

#### 完了条件

- `currentViolations=0` で仕様同期合否を判定できる

### Phase D: 仕様書反映と台帳同期

#### 目的

未タスク管理をシステム仕様へ同期し、追跡可能にする。

#### 手順

1. `task-workflow.md` 残課題テーブルへ登録する
2. 関連仕様書（interfaces）へ未タスク追記する
3. `aiworkflow-requirements` の SKILL/LOGS 変更履歴を更新する

#### 成果物

- 仕様書更新差分

#### 完了条件

- 未タスク指示書とシステム台帳の参照整合が取れている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 4仕様書同時更新のガード要件が定義されている
- [ ] SubAgent分担と完了条件が仕様として固定されている
- [ ] 検証コマンドで同期漏れ検出が可能である

### 品質要件

- [ ] `current`/`baseline` 分離判定が運用ルール化されている
- [ ] コマンド誤用防止（位置引数ルール）が記載されている
- [ ] 再確認時のやり直し手順が定義されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録されている
- [ ] 関連仕様書（interfaces）へ未タスク追記済み

---

## 6. 検証方法

### テストケース

- Case 1: 4仕様書すべて更新済み + 4コマンド PASS
- Case 2: 1仕様書欠落時にガードで FAIL 判定
- Case 3: `audit` で `current=0`/`baseline>0` を正しく分離報告できる

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir> --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-dir>
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                       |
| ---------------------------------------- | ------ | -------- | ---------------------------------------------------------- |
| 仕様書更新の順序依存で同期漏れが再発する | 中     | 中       | SubAgent分担テンプレートを必須化し同一ターン更新を固定する |
| 監査結果の誤読で過剰修正が発生する       | 中     | 中       | `current` 判定固定 + baseline分離表記を必須化する          |
| 検証コマンド誤用で証跡不足になる         | 低     | 中       | コマンドをテンプレート化し、台帳記録時に必ず貼付する       |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

### 参考資料

- `docs/30-workflows/ut-fix-skill-execute-interface-001/outputs/phase-12/documentation-changelog.md`
- `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`
- `.claude/rules/06-known-pitfalls.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
仕様書更新を単独で進めると同期漏れが発生しやすい。
仕様書別のSubAgent分担と、current/baseline分離判定を固定して再発を防止する必要がある。
```

### 補足事項

- 本タスクは「横断仕様同期の運用改善」が対象であり、機能実装変更は含まない。
