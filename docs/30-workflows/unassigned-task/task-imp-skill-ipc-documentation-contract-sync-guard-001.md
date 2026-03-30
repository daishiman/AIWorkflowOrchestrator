# UT-IMP-SKILL-IPC-DOCUMENTATION-CONTRACT-SYNC-GUARD-001: skill IPCドキュメント契約同期ガード

## メタ情報

```yaml
issue_number: 926
task_id: UT-IMP-SKILL-IPC-DOCUMENTATION-CONTRACT-SYNC-GUARD-001
task_name: skill IPCドキュメント契約同期ガード
category: 改善
target_feature: skill IPC契約ドキュメント（Main/Preload/Phase 12台帳同期）
priority: 中
scale: 中規模
status: 未実施
source_phase: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12 再監査（実装苦戦箇所）
created_date: 2026-02-27
```

| 項目         | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-IPC-DOCUMENTATION-CONTRACT-SYNC-GUARD-001                            |
| タスク名     | skill IPCドキュメント契約同期ガード                                               |
| 分類         | 改善                                                                              |
| 対象機能     | `skillHandlers.ts` / `skill-api.ts` / `ipc-documentation.md` / Phase 12成果物台帳 |
| 優先度       | 中                                                                                |
| 見積もり規模 | 中規模                                                                            |
| ステータス   | 未実施                                                                            |
| 発見元       | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12 再監査（苦戦箇所・2026-02-27） |
| 発見日       | 2026-02-27                                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001` の再監査で、`ipc-documentation.md` の引数・戻り値・エラー契約が `skillHandlers.ts` / `skill-api.ts` の実装と再びズレるリスクが確認された。

### 1.2 問題点・課題

- `ipc-documentation.md` の記述が手更新のため、Main/Preload実装変更に追従漏れが起きやすい
- `artifacts.json` と `outputs/artifacts.json` の二重管理で、Phase 12完了判定が不安定になりやすい
- 未タスク監査の `current` と `baseline` を混同し、不要な修正作業が発生しやすい

### 1.3 放置した場合の影響

- IPC利用側が誤った契約で実装し、実行時不整合が再発する
- Phase 12の再監査差し戻しが継続し、開発速度が低下する
- 合否判定の再現性が下がり、運用が属人化する

---

## 2. 何を達成するか（What）

### 2.1 目的

skill IPC契約のドキュメント同期を機械検証可能にし、Phase 12の台帳同期と監査判定軸を標準化する。

### 2.2 最終ゴール

1. `ipc-documentation.md` と Main/Preload実装の契約差分を検出するチェックを定義する
2. `artifacts.json` と `outputs/artifacts.json` の同期確認を完了条件に組み込む
3. 未タスク監査の合否を `currentViolations.total` 固定で判定する運用を仕様化する

### 2.3 スコープ

#### 含むもの

- skill IPC契約（`skill:execute` / `skill:abort` / `skill:get-status` など）の文書-実装突合
- Phase 12二重台帳の同期チェック手順
- `task-workflow.md` / `interfaces-agent-sdk-skill.md` / `lessons-learned.md` への運用反映

#### 含まないもの

- skill IPC契約そのものの全面再設計
- auth/chat/rag等の他ドメインIPCへの横展開

### 2.4 成果物

- 契約同期チェック手順書（実装+文書+台帳の3点突合）
- 検証コマンド実行テンプレート
- 更新済みシステム仕様書（残課題テーブル + 変更履歴）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001` の再監査記録が存在する
- `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit-unassigned-tasks` が実行可能
- `docs/30-workflows/skill-ipc-response-consistency/` の Phase 12成果物が参照可能

### 3.2 依存タスク

- UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001（契約マトリクス整備）
- UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001（Phase 12品質ゲート）

### 3.3 必要な知識

- Electron IPC（Main/Preload/Renderer）
- P42/P44/P45パターン（検証・契約・命名）
- Phase 12 Step 1-A〜Step 2 の台帳運用

### 3.4 推奨アプローチ

1. Main/Preload実装シグネチャを正本として契約一覧を固定する
2. `ipc-documentation.md` を正本と突合するチェック観点を定義する
3. 二重台帳同期と `current/baseline` 判定を検証コマンドで固定する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                  | 発見経緯                                                                               | 解決策                                                                                         | 教訓                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `ipc-documentation.md` の契約ドリフト | 再監査で `skill:abort` / `skill:get-status` / `skill:execute` 記述が実装と不一致だった | Main (`skillHandlers.ts`) と Preload (`skill-api.ts`) の実シグネチャを一次情報として再同期した | IPC仕様更新は「文書のみ更新」ではなく「実装+文書+契約テスト」同時更新で実施する |
| Phase 12台帳の二重管理不整合          | `artifacts.json` と `outputs/artifacts.json` の片側更新で完了判定が揺れた              | 2台帳を同時更新し、`validate-phase-output` で固定化した                                        | Phase 12完了条件は成果物作成ではなく台帳同期まで含める                          |
| `current` / `baseline` 監査軸の混同   | 全体監査FAILを今回差分FAILと誤認しやすかった                                           | `audit --diff-from HEAD` の `currentViolations.total` を合否軸に固定した                       | 監査値は current（今回）と baseline（既存）を分離報告する                       |

---

## 4. 実行手順

### Phase構成

- Phase A: 契約同期ルール定義
- Phase B: 検証導線整備
- Phase C: 仕様書反映と台帳同期

### Phase A: 契約同期ルール定義

#### 目的

IPC契約の正本と同期対象を固定する。

#### 手順

1. `skillHandlers.ts` と `skill-api.ts` のシグネチャを抽出する
2. `ipc-documentation.md` の各チャンネル記述と突合する
3. 不一致検出時の修正順序（実装確認 → 文書更新 → テスト確認）を定義する

#### 成果物

- 契約同期ルール一覧

#### 完了条件

- 主要チャンネルの正本・同期手順が一意に定義されている

### Phase B: 検証導線整備

#### 目的

再監査時の判定を機械化する。

#### 手順

1. Phase 12の4検証コマンドを実行テンプレート化する
2. `audit --diff-from HEAD` の current判定ルールを明文化する
3. 二重台帳同期の確認手順（差分確認）を追加する

#### 成果物

- 検証コマンドテンプレート

#### 完了条件

- 合否判定が `currentViolations.total` で再現可能になる

### Phase C: 仕様書反映と台帳同期

#### 目的

未タスクとして追跡可能にし、再発防止を固定する。

#### 手順

1. 未タスク指示書を `docs/30-workflows/unassigned-task/` に配置する
2. `task-workflow.md` と `interfaces-agent-sdk-skill.md` の残課題テーブルへ登録する
3. `aiworkflow-requirements` の変更履歴（references/SKILL/LOGS）を更新する

#### 成果物

- 更新済み未タスク指示書とシステム仕様書

#### 完了条件

- 指示書パスと仕様書テーブル参照が一致し、リンク検証に通過する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] IPC契約ドキュメント同期ルールが定義されている
- [ ] 二重台帳同期の手順が明記されている
- [ ] current/baseline分離判定の運用が定義されている

### 品質要件

- [ ] 苦戦箇所3件の再発防止策が手順化されている
- [ ] 検証コマンドが再実行可能な形式で記載されている
- [ ] 判定基準が曖昧語なしで記述されている

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルへ登録済み
- [ ] `interfaces-agent-sdk-skill.md` 関連未タスクへ登録済み

---

## 6. 検証方法

### テストケース

- Case 1: 契約一致 + 台帳同期 + current=0 のとき PASS
- Case 2: `ipc-documentation.md` の引数記述を意図的に崩した場合 FAIL
- Case 3: `artifacts.json` と `outputs/artifacts.json` の不一致時に FAIL

### 検証手順

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-ipc-response-consistency
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-ipc-response-consistency
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                 |
| ------------------------------------ | ------ | -------- | ---------------------------------------------------- |
| 契約同期ルールが文書だけで形骸化する | 中     | 中       | 仕様更新時に契約テスト実行を必須化する               |
| 二重台帳の片側更新が再発する         | 中     | 中       | 更新手順に2ファイル同時更新と差分確認を組み込む      |
| 監査判定の解釈揺れが再発する         | 中     | 低       | `currentViolations.total` を合否軸として固定記載する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/skill-ipc-response-consistency/outputs/phase-12/ipc-documentation.md`
- `docs/30-workflows/skill-ipc-response-consistency/outputs/phase-12/spec-update-summary.md`

### 参考資料

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/preload/skill-api.ts`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
再監査で IPC ドキュメント契約ドリフト、Phase 12台帳二重管理不整合、current/baseline判定混同が再発した。
同種課題を簡潔に解決するため、契約同期と判定軸を未タスクとして固定する。
```

### 補足事項

- 本タスクは「契約仕様の再設計」ではなく「契約ドリフトを再発させない運用ガード」の整備を目的とする。
