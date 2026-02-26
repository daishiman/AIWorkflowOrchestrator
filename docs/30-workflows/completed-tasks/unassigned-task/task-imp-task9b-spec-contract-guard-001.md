# UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001: TASK-9B 仕様契約再監査ガード強化

## メタ情報

| 項目         | 値                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001                                                                      |
| タスク名     | TASK-9B 仕様契約再監査ガード強化                                                                           |
| 分類         | 改善                                                                                                       |
| 対象機能     | SkillCreator IPC仕様同期（`interfaces-agent-sdk-skill.md` / `security-skill-ipc.md` / `task-workflow.md`） |
| 優先度       | 中                                                                                                         |
| 見積もり規模 | 中規模                                                                                                     |
| ステータス   | 完了（2026-02-26, Phase 12完了移管）                                                                       |
| 発見元       | TASK-9B 再監査（Phase 12 / 2026-02-26）                                                                    |
| 発見日       | 2026-02-26                                                                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9B 再監査で、SkillCreator IPC拡張（13チャンネル: 12 invoke + 1 progress）の仕様同期は完了したが、再監査のたびに同種の確認漏れが発生しやすいことが判明した。特に「仕様書間同期」「`create` のP42検証」「未タスク監査結果の解釈」で判断コストが高かった。

### 1.2 問題点・課題

- チャンネル数の正本が `channels.ts` であることは明確でも、仕様書側の更新順序が手作業依存でドリフトしやすい
- `create` の P42 3段バリデーション（sender / schema / payload）のチェック漏れが再発しやすい
- `audit-unassigned-tasks` の `currentViolations` と `baselineViolations` の読み分けを誤ると、誤判定につながる

### 1.3 放置した場合の影響

- TASK-9B 系の再監査で同じ差し戻しが繰り返される
- 仕様更新の網羅性が担当者依存になり、SubAgent分担でも整合漏れが発生する
- 未タスク監査結果の誤解で、未解決課題を見落とすリスクが残る

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-9B 系の仕様更新で必ず確認すべき契約項目を固定化し、仕様書更新と監査判定を短時間で再現可能にする。

### 2.2 最終ゴール

1. TASK-9B 系の仕様同期ガード（13ch / P42 create / current-baseline判定）をチェックリスト化
2. 仕様書3点（interfaces/security/task-workflow）に同一観点を反映する更新手順を標準化
3. 未タスク監査の判定ミスを避ける検証コマンド手順を明文化

### 2.3 スコープ

#### 含むもの

- TASK-9B 再監査用の契約チェックリスト作成
- `interfaces-agent-sdk-skill.md` / `security-skill-ipc.md` / `task-workflow.md` への運用ルール追記
- `audit-unassigned-tasks` の判定基準（current/baseline）を運用文書へ固定

#### 含まないもの

- SkillCreator IPC機能の新規実装追加
- TASK-9B-J/K など別未タスクの実装本体

### 2.4 成果物

- TASK-9B 再監査ガード仕様（チェックリスト + 実行手順）
- 仕様書3点の更新記録
- 未タスク監査手順の判定基準ドキュメント

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-9B` および `TASK-9B-H-SKILL-CREATOR-IPC` の現行仕様が確定している
- `channels.ts` を IPC契約の正本として扱う運用に合意済み

### 3.2 依存タスク

- ~~TASK-9B~~（完了）
- ~~UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001~~（完了）

### 3.3 必要な知識

- Electron IPC（Main/Preload/Renderer）の契約境界
- P42 バリデーション規約
- Phase 12 未タスク監査（`currentViolations` / `baselineViolations`）

### 3.4 推奨アプローチ

- 先に「契約正本（13ch, P42 create）」を固定し、差分検証対象を最小化する
- 次に仕様書別SubAgentの責務を分離し、同一ターンで3仕様書を同期更新する
- 最後に監査コマンドの出力判定を文書化し、判定手順を標準化する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                          | 発見経緯                                                                | 解決策                                                                                    | 教訓                                                        |
| --------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| IPC契約チャンネル数のドリフト（6ch/13ch混在） | TASK-9B-H と TASK-9B の仕様同期タイミングが分離し、文書間で表記がズレた | `channels.ts` 正本で 13ch（12 invoke + 1 progress）へ統一し、関連仕様書を同一ターンで更新 | 「正本定義の固定」→「複数仕様書同時更新」をセットで実施する |
| `create` の P42 3段バリデーション漏れ         | 再監査時に sender/schema/payload のうち一部説明が欠落しやすかった       | `security-skill-ipc.md` の `create` 行を3段検証で固定し、テーブルで明示管理               | P42は「項目列挙」ではなく「段階別完了確認」で検証する       |
| `audit-unassigned-tasks` 判定の誤読           | `baselineViolations` を current の失敗と誤って扱いやすい                | `--target-file` と `--diff-from` を優先し、`currentViolations.total` 基準で合否判定       | 監査は「対象判定」と「全体監視」を分離して扱う              |

---

## 4. 実行手順

### Phase構成

- Phase A: 契約正本と検証観点の固定
- Phase B: 仕様書3点の同期更新
- Phase C: 監査手順の固定化と検証

### Phase A: 契約正本と検証観点の固定

#### 目的

TASK-9B 系で不変とする契約観点（13ch / P42 create / current-baseline）を定義する。

#### 手順

1. `channels.ts` の SkillCreator チャンネルを一覧化する
2. `create` の P42 3段バリデーション観点を定義する
3. 未タスク監査の判定基準を整理する

#### 成果物

- TASK-9B 契約観点チェックリスト（草案）

#### 完了条件

- 3観点の確認項目が文書化され、曖昧な判断項目がない

### Phase B: 仕様書3点の同期更新

#### 目的

SubAgent分担で仕様書ごとの責務を分離しつつ、同一観点で同期反映する。

#### 手順

1. SubAgent-A: `interfaces-agent-sdk-skill.md` の関連未タスクと運用手順を更新する
2. SubAgent-B: `security-skill-ipc.md` の残課題とP42観点を更新する
3. SubAgent-C: `task-workflow.md` の残課題台帳を更新する

#### 成果物

- 更新済み3仕様書（interfaces/security/task-workflow）

#### 完了条件

- 未タスクID・目的・参照パスが3仕様書で一致している

### Phase C: 監査手順の固定化と検証

#### 目的

判定ミスを防ぐため、実行コマンドと判定基準を再利用可能にする。

#### 手順

1. `verify-unassigned-links` で参照整合を確認する
2. `audit-unassigned-tasks --target-file` で対象監査を実施する
3. `audit-unassigned-tasks --diff-from HEAD` で差分監査を実施する

#### 成果物

- 監査実行ログと判定メモ

#### 完了条件

- `currentViolations.total = 0` を確認し、判定根拠を記録できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] TASK-9B 再監査ガードのチェックリストが作成されている
- [ ] 13ch / P42 create / current-baseline 判定の3観点が網羅されている

### 品質要件

- [ ] 仕様書3点で未タスクIDとリンクが一致している
- [ ] 判定基準が `currentViolations` ベースで明文化されている

### ドキュメント要件

- [ ] `docs/30-workflows/unassigned-task/` に未タスク仕様書が配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] `interfaces-agent-sdk-skill.md` または関連仕様書の未タスク表に登録されている

---

## 6. 検証方法

### テストケース

- Case 1: 仕様書3点で未タスクID・パスが一致すること
- Case 2: `--target-file` 監査で `currentViolations.total = 0` になること
- Case 3: リンク検証で新規未タスクへの参照切れがないこと

### 検証手順

1. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
2. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-task9b-spec-contract-guard-001.md`
3. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                                               |
| ---------------------------- | ------ | -------- | ------------------------------------------------------------------ |
| 仕様書更新の片側漏れ         | 高     | 中       | 仕様書別SubAgent分担を固定し、同一ターンで3仕様書を更新する        |
| `create` のP42観点の記載揺れ | 中     | 中       | sender/schema/payload の3段確認チェックをテンプレート化する        |
| 監査結果の誤解釈             | 中     | 中       | `--target-file` 結果を合否判定に使い、baselineは監視用途と明記する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`
- `docs/30-workflows/completed-tasks/task-9b-skill-creator/index.md`
- `docs/30-workflows/completed-tasks/skill-creator-ipc/index.md`

### 参考資料

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/rules/06-known-pitfalls.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
情報が漏れているような気がする。仕様書更新・未タスク作成・苦戦箇所の記録漏れを再確認し、
同じ課題を簡潔に解決できる状態にしてほしい。
```

### 補足事項

- 本タスクは仕様同期と監査判定の再発防止が目的であり、機能追加タスクではない。
- 実装時は `task-specification-creator` と `aiworkflow-requirements` の両スキル手順に従うこと。
