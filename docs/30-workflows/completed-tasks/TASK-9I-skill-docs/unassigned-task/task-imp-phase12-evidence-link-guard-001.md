# UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001: Phase 12 再確認証跡テーブル・未タスクリンク整合ガード

## メタ情報

| 項目         | 内容                                                                                |
| ------------ | ----------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001                                              |
| タスク名     | Phase 12 再確認証跡テーブル・未タスクリンク整合ガード                               |
| 分類         | 改善                                                                                |
| 対象機能     | Phase 12 運用（`task-workflow.md` / `lessons-learned.md` / `unassigned-task` 監査） |
| 優先度       | 中                                                                                  |
| 見積もり規模 | 中規模                                                                              |
| ステータス   | 未実施                                                                              |
| 発見元       | TASK-9I Phase 12 再確認（2026-02-28）                                               |
| 発見日       | 2026-02-28                                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9I の Phase 12 再確認で、仕様書の台帳記述と監査コマンド実行結果の同期に手戻りが発生した。特に `task-workflow.md` 内のワイルドカード参照や、監査値（current/baseline）の読み違いが再確認コストを増大させた。

### 1.2 問題点・課題

- `docs/30-workflows/unassigned-task/*.md` のようなワイルドカード参照は `verify-unassigned-links` で missing 扱いとなり、実体が存在しても失敗する
- `audit-unassigned-tasks --target-file` の出力で `baseline` を今回差分と誤読しやすい
- `task-workflow.md` の再確認テーブル値（例: links件数）が更新後にドリフトしやすい

### 1.3 放置した場合の影響

- Phase 12 再確認の完了判定が不安定化し、同じ修正の再実行が続く
- 台帳と実体の不一致で、未タスク追跡の信頼性が低下する
- 同種タスクの初動が毎回手探りとなり、運用効率が落ちる

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 再確認で使う証跡テーブル・リンク参照・監査判定軸を機械検証可能なルールに統一し、再発を防止する。

### 2.2 最終ゴール

1. `task-workflow.md` / 関連仕様書でワイルドカード参照（`*.md`）が 0 件になる
2. 再確認テーブルに `current` と `baseline` の分離記録が標準化される
3. `verify-unassigned-links` / `audit --target-file` / `audit --diff-from HEAD` の結果が台帳へ一貫して同期される

### 2.3 スコープ

#### 含むもの

- `task-workflow.md` の未タスク参照記述ルール整備（実体パス必須）
- 再確認証跡テーブルの標準列定義（links件数、current/baseline）
- Phase 12 テンプレート/運用ガイドへの反映（task-spec / skill-creator / aiworkflow-requirements）

#### 含まないもの

- 既存未タスク 71 件（baseline）そのものの一括修正
- 個別機能（LLM連携、テンプレートCRUDなど）の実装作業

### 2.4 成果物

- ガード仕様を反映した未タスク運用手順
- 更新済み仕様書（task-workflow / lessons-learned / skill-creator patterns・template）
- 機械検証ログ（verify/validate/links/audit）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.claude/skills/task-specification-creator/scripts/` の監査スクリプトが実行可能
- `aiworkflow-requirements` と `skill-creator` の更新権限がある
- Phase 12 の current/baseline 判定ルールを理解している

### 3.2 依存タスク

- `UT-IMP-PHASE12-COMPLETED-TASK-REFERENCE-SYNC-GUARD-001`
- `UT-IMP-PHASE12-UNASSIGNED-BASELINE-REMEDIATION-002`
- `UT-IMP-AIWORKFLOW-UNASSIGNED-TABLE-DEDUP-001`

### 3.3 必要な知識

- Phase 12 必須成果物と検証チェーン
- `verify-unassigned-links` の仕様（実体パス判定）
- `audit-unassigned-tasks` の `current` / `baseline` の意味

### 3.4 推奨アプローチ

1. 参照記述の正規化（ワイルドカード禁止・実体パス必須）を先に適用する
2. 監査判定は `currentViolations.total` を合否基準に固定し、baseline は別列で記録する
3. 台帳更新と検証実行を同一ターンで完了させる

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                        | 発見経緯                                                                          | 解決策                                                                             | 教訓                                                           |
| ------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| ワイルドカード参照でリンク監査が false fail | TASK-9I 再確認で `docs/30-workflows/unassigned-task/*.md` が missing 扱いになった | `task-workflow.md` を実体2ファイル参照へ修正し、`verify-unassigned-links` を再実行 | 未タスクリンクはワイルドカード禁止、実体パスのみ許容に統一する |
| `--target-file` 監査の baseline 誤読        | `current=0` でも baseline 併記で fail と誤判定しやすかった                        | 合否は `currentViolations.total` 固定、baseline は既存課題として分離記録           | 監査表は必ず `current/baseline` を2列で持つ                    |
| 再確認テーブルの値ドリフト                  | links件数（94/94→96/96）が更新後に残存した                                        | 検証実行→台帳反映を同一ターンで行い、差分監査を追加した                            | 仕様更新は「コマンド結果転記」までを完了条件にする             |

---

## 4. 実行手順

### Phase構成

- Phase A: 参照ルール設計
- Phase B: 仕様・テンプレート更新
- Phase C: 検証チェーン実行
- Phase D: 台帳同期・記録

### Phase A: 参照ルール設計

#### 目的

ワイルドカード禁止と判定軸分離ルールを定義する。

#### 手順

1. `task-workflow.md` と関連仕様書の未タスク参照記述を棚卸しする
2. `*.md` 記述を実体パス必須へ置換するルールを定義する
3. `current/baseline` 分離列を再確認表の標準として確定する

#### 成果物

- 参照ルール定義メモ

#### 完了条件

- ワイルドカード禁止ルールと判定軸が文書化されている

### Phase B: 仕様・テンプレート更新

#### 目的

ルールを `aiworkflow-requirements` / `skill-creator` に反映する。

#### 手順

1. `task-workflow.md` / `lessons-learned.md` を更新する
2. `skill-creator` の `patterns.md` / Phase 12テンプレートへ反映する
3. 運用履歴（SKILL.md / LOGS.md）を更新する

#### 成果物

- 更新済み仕様書・テンプレート

#### 完了条件

- 主要4ファイル以上に再利用ルールが反映されている

### Phase C: 検証チェーン実行

#### 目的

変更後の運用が機械検証で再現可能か確認する。

#### 手順

1. `verify-all-specs` と `validate-phase-output` を実行する
2. `verify-unassigned-links` を実行する
3. `audit --target-file` と `audit --diff-from HEAD` を実行する

#### 成果物

- 検証ログ（PASS/件数）

#### 完了条件

- current 違反 0、links missing 0 が確認できる

### Phase D: 台帳同期・記録

#### 目的

再確認結果と教訓を追跡可能な形式で残す。

#### 手順

1. `task-workflow.md` 残課題へ本タスクを登録する
2. 必要に応じて関連仕様書の未タスク表へ反映する
3. LOGS/変更履歴へ最終記録を追加する

#### 成果物

- 台帳登録済み未タスク

#### 完了条件

- 未タスク仕様書・残課題テーブル・運用履歴が同期している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 未タスク参照のワイルドカード記述が対象仕様書で 0 件
- [ ] 再確認テーブルに `current` / `baseline` 分離列がある
- [ ] `audit --target-file` の合否軸が `currentViolations.total` で固定されている

### 品質要件

- [ ] `verify-unassigned-links` が `missing: 0`
- [ ] `audit --diff-from HEAD` が `currentViolations: 0`
- [ ] 変更後の手順がテンプレートで再利用可能

### ドキュメント要件

- [ ] `task-workflow.md` 残課題へ登録済み
- [ ] 苦戦箇所が `3.5` に記載済み
- [ ] 関連SKILL/LOGSの更新履歴が同期済み

---

## 6. 検証方法

### テストケース

- Case 1: 未タスクリンク監査で missing が 0
- Case 2: 対象未タスク監査で current が 0
- Case 3: 差分監査で current が 0、baseline は分離記録

### 検証手順

```bash
# 1) ワイルドカード参照の検出
rg -n "docs/30-workflows/unassigned-task/\*\.md" .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 2) 未タスクリンク整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 3) 対象未タスク監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/unassigned-task/task-imp-phase12-evidence-link-guard-001.md

# 4) 差分監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                      |
| ---------------------------------------------------- | ------ | -------- | --------------------------------------------------------- |
| 既存文書にワイルドカード参照が散在し、置換漏れが出る | 中     | 中       | `rg` で網羅検出し、置換後に links 検証を必須化            |
| baseline違反の多さで current判定が再度埋もれる       | 中     | 中       | 監査結果テーブルを `current/baseline` 固定列に統一        |
| テンプレート反映だけで台帳同期が漏れる               | 高     | 低       | Phase D で「台帳登録 + LOGS/SKILL更新」をチェックリスト化 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/skill-creator/references/patterns.md`
- `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`

### 参考資料

- `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
- `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
verify-unassigned-links で wildcard 参照が missing file と判定される。
--target-file 監査では baseline が同時出力されるため、current 判定を分離する必要がある。
```

### 補足事項

本タスクは機能追加ではなく、Phase 12 再確認運用の再発防止を目的とした運用改善タスクである。
