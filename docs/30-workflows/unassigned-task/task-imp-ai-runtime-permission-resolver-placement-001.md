# PermissionResolver 責務帰属先の確定 - タスク指示書

## メタ情報

| 項目         | 内容                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| タスクID     | UT-AI-RUNTIME-PERMISSION-RESOLVER-PLACEMENT-001                                      |
| タスク名     | PermissionResolver 責務帰属先の確定                                                  |
| 分類         | 設計改善                                                                             |
| 対象機能     | ai-runtime-authmode-foundation / Task04 runtime routing                              |
| 優先度       | 中                                                                                   |
| 見積もり規模 | 小規模                                                                               |
| ステータス   | 未実施                                                                               |
| 発見元       | TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（Phase 3 MINOR-01 / Phase 10 MINOR-06） |
| 発見日       | 2026-03-14                                                                           |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`AIAccessCapabilityResolver`（何が使えるか）と `AIRuntimeResolver`（どう解決するか）は定義済みだが、`skillExecutionAuthPreflight` 相当の Permission 判定の責務位置が正本設計に未固定。

### 1.2 問題点・課題

- capability 判定と permission 判定の境界が曖昧。
- surface 実装ごとに preflight の解釈が揺れる。
- Phase 3/10 で同種 MINOR 指摘が再発。

### 1.3 放置した場合の影響

- Task04 以降で判定責務が分散し、auth 関連不具合の原因追跡が難化する。
- settings 表示語彙（ready/blocked/unavailable）との対応が崩れる。

## 2. 何を達成するか（What）

### 2.1 目的

Permission 判定の責務境界を system spec と task 設計に固定し、後続実装で同じ解釈を再利用できる状態にする。

### 2.2 最終ゴール

- PermissionResolver の配置方針が 1 案に確定。
- 入出力/エラー型の契約が明文化。
- Task04 の仕様書へ反映済み。

### 2.3 スコープ

#### 含むもの

- Resolver 3責務（capability/runtime/permission）の境界定義。
- `skillExecutionAuthPreflight` と新契約の対応表。
- Task04 への参照反映。

#### 含まないもの

- 実装コード変更。
- APIキーUIの挙動変更。

### 2.4 成果物

- 責務境界メモ（設計文書への追記）。
- 選定理由（trade-off 評価表）。
- Task04 側の参照更新。

## 3. どのように実行するか（How）

### 3.1 前提条件

- Step-01 の Phase 2/3/10 文書が参照可能。
- `interfaces-auth.md` と `security-skill-execution.md` が最新。

### 3.2 依存タスク

- TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（spec_created 完了）。

### 3.3 必要な知識

- auth-mode 契約、IPC security 境界、preflight 判定フロー。

### 3.4 推奨アプローチ

- 案A/B/C を比較し、責務分離を最優先に 1 案へ収束。
- system spec と task spec を同ターン同期してドリフトを防止。

## 4. 実行手順

### Phase構成

- Phase A: 現状分析
- Phase B: 方針決定
- Phase C: 仕様同期

### Phase A: 現状分析

#### 目的

既存 preflight の入力/出力/責務を棚卸しする。

#### 手順

1. Step-01 の `design-summary.md` / `phase-3-design-review.md` / `phase-10-final-review.md` を確認。
2. `skillExecutionAuthPreflight` の判定項目を列挙。
3. capability/runtime との重複と不足を表で整理。

#### 成果物

責務比較表（3 resolver 比較）。

#### 完了条件

重複領域と未定義領域が明示されている。

### Phase B: 方針決定

#### 目的

責務配置を 1 案に確定する。

#### 手順

1. 案A/B/C のメリット・デメリットを比較。
2. 運用コストと再利用性で評価。
3. 推奨案と採用理由を決定。

#### 成果物

方針決定メモ（採用案+却下理由）。

#### 完了条件

採用案が一意で、却下案の理由も記録されている。

### Phase C: 仕様同期

#### 目的

決定事項を正本仕様へ反映する。

#### 手順

1. `interfaces-auth.md` / `security-skill-execution.md` に責務境界を追記。
2. Task04 仕様へ PermissionResolver 配置を追記。
3. `task-workflow.md` / `lessons-learned.md` へ同期記録を残す。

#### 成果物

更新済み仕様書と同期ログ。

#### 完了条件

関連仕様が同一の責務定義で整合している。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] PermissionResolver の責務帰属先が明示されている
- [ ] 入出力/エラー型の契約が定義されている
- [ ] `skillExecutionAuthPreflight` との対応が明文化されている

### 品質要件

- [ ] 3案比較の根拠が記録されている
- [ ] capability/runtime/permission の重複定義が解消されている

### ドキュメント要件

- [ ] Task04 仕様への参照反映が完了している
- [ ] `task-workflow.md` と `lessons-learned.md` が更新されている

## 6. 検証方法

### テストケース

- 仕様文書レビューで責務定義の矛盾がないこと。
- settings 表示契約と Permission 判定の用語が一致すること。

### 検証手順

1. `interfaces-auth.md` と `security-skill-execution.md` の該当節を相互参照する。
2. Task04 文書に同一語彙で追記されていることを確認する。
3. レビューで MINOR 再発がないことを確認する。

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                     |
| ------------------------------ | ------ | -------- | -------------------------------------------------------- |
| 採用案の判断が曖昧で再度揺れる | 高     | 中       | 却下理由まで記録して意思決定を固定する                   |
| Task04 側へ反映漏れが発生する  | 中     | 中       | 同期対象をチェックリスト化し同ターン反映する             |
| 用語不一致でUI契約がずれる     | 中     | 低       | `ready/blocked/unavailable` とエラー型の対応表を併記する |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/phase-3-design-review.md`
- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/phase-10-final-review.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`
- `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`

### 参考資料

- `apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts`

## 9. 備考

### レビュー指摘の原文（要約）

- Phase 3 MINOR-01: preflight の責務境界が設計文書で曖昧。
- Phase 10 MINOR-06: PermissionResolver の配置が後続タスクへ未固定。

### 補足事項

本タスクは設計同期のみを対象とし、実装変更は後続タスクで扱う。
