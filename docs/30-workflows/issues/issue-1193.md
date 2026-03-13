# [#1193] [UT-IMP-PHASE12-STEP2-PUBLIC-CONTRACT-GUARD-001] Phase 12 Step 2 public contract 判定ガード

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-STEP2-PUBLIC-CONTRACT-GUARD-001
task_name: Phase 12 Step 2 public contract 判定ガード
category: 改善
target_feature: Phase 12 Step 2 の public preload API / shared export / interface spec 同期
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-SKILL-LIFECYCLE-04 Phase 12 follow-up
created_date: 2026-03-13
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-phase12-step2-public-contract-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SKILL-LIFECYCLE-04` では `skill:optimize:evaluate` の既存 IPC を再利用しつつ、`window.electronAPI.skill.evaluatePrompt()` と lifecycle quality 型の shared export を public 契約として追加した。ところが Phase 12 の再確認で、「新しい channel を増やしていないから Step 2 は不要」と誤解しやすいことが露出した。

### 1.2 問題点・課題

- Step 2 の要否判断が IPC channel 数だけに寄ると、public preload method 追加を見落とす
- `packages/shared/src/types/index.ts` と `packages/shared/index.ts` の barrel export 追加が interface spec 更新対象として扱われない
- `task-workflow.md` / `interfaces-agent-sdk-skill.md` / `lessons-learned.md` / workflow outputs の 4 箇所で Step 2 判定根拠が同値になりにくい
- 既存の broad guard は 4 仕様書同期や IPC 契約全般を扱うが、「既存 IPC 再利用でも public contract 増分なら Step 2 必須」という条件だけを機械的に塞いでいない

### 1.3 放置した場合の影響

- public preload API を増やしたのに system spec が未更新のまま残る
- 既存 IPC 再利用タスクで同じ誤判定を繰り返し、Phase 12 の差し戻しが再発する
- Renderer 利用面の公開契約と interface spec が乖離し、後続実装が古い契約を参照する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 12 Step 2 の判定を「IPC channel 追加の有無」ではなく「public contract 追加の有無」で固定し、public preload API と shared export の増分が出たら必ず interface spec まで更新する運用にする。

### 2.2 最終ゴール

1. public preload API / shared export / interface spec 更新要否の判定マトリクスが定義されている
2. `window.electronAPI.*` と shared barrel export の差分を検出する確認手順がある
3. `interfaces-agent-sdk-skill.md` / `task-workflow.md` / `lessons-learned.md` / Phase 12 outputs に同一 ID の未タスク導線が張られている
4. 同種タスクで Step 2 要否を 5 分以内に判定できる

### 2.3 スコープ

#### 含むもの

- public preload API 追加時の Step 2 判定ルール
- shared export 追加時の interface spec 更新ルール
- `interfaces-agent-sdk-skill.md` と workflow outputs の同期チェック
- `task-specification-creator` と `aiworkflow-requirements` の再利用導線

#### 含まないもの

- Task04 の UI/状態管理ロジックそのものの再実装
- IPC channel 命名の全面リファクタリング
- 他ドメインの全 interface spec の一括是正

### 2.4 成果物

- 本未タスク仕様書
- Step 2 public contract 判定マトリクス
- interface spec 同期チェック手順
- `task-workflow.md` / `interfaces-agent-sdk-skill.md` / `lessons-learned.md` の関連未タスク導線

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SKILL-LIFECYCLE-04` の Phase 12 outputs と system spec が参照可能である
- `packages/shared` と preload 層の公開経路を追える
- `verify-unassigned-links.js` と `audit-unassigned-tasks.js` が実行可能である

### 3.2 依存タスク

- TASK-SKILL-LIFECYCLE-04（完了）
- UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001（関連）
- UT-IMP-SKILL-IPC-DOCUMENTATION-CONTRACT-SYNC-GUARD-001（関連）

### 3.3 必要な知識

- Electron preload API の公開境界
- shared barrel export と TypeScript 型再公開の責務
- Phase 12 Step 2 と Step 1-C の責務分離

### 3.4 推奨アプローチ

1. IPC channel 追加、public preload method 追加、shared export 追加を別列で扱う判定表を作る
2. 既存 IPC 再利用でも public method/export 増分があれば Step 2 必須と明記する
3. `interfaces-agent-sdk-skill.md` の Task04 節を正本にし、task-workflow/lessons/outputs はそこへ追従させる
4. 未タスク導線と link 検証を同一ターンで閉じる

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                          | 発見経緯                                                                                       | 解決策                                                                                              | 教訓                                                                   |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 新しい IPC channel が無いと Step 2 不要に見えてしまう         | `skill:optimize:evaluate` を再利用した Task04 で interface spec 更新が後ろ倒しになった         | `evaluatePrompt()` の public preload 追加と shared export 増分を interface spec 更新条件に昇格した  | Step 2 判定は transport 追加ではなく public contract 増分で見る        |
| shared export 追加が「型の小変更」として軽視される            | `ExecutionQualityEvaluation` 群の barrel export 追加が outputs より後に追記された              | `packages/shared/src/types/index.ts` と `packages/shared/index.ts` を公開契約の正本チェックに含める | public export は renderer 利用契約なので interface spec 更新対象である |
| outputs と system spec の説明粒度がずれて再確認コストが増える | workflow outputs では書いていても `interfaces-agent-sdk-skill.md` 側に残っていない状態が起きた | SubAgent を `interfaces` / `task-workflow` / `lessons` に分けて同一ターンで同期する                 | Step 2 は 1 ファイル完結ではなく cross-document 同期前提で扱う         |

---

## 4. 実行手順

### Phase構成

- Phase A: 判定マトリクス定義
- Phase B: 公開契約差分検出
- Phase C: system spec と outputs 同期
- Phase D: 未タスク監査と link 検証

### Phase A: 判定マトリクス定義

#### 目的

Step 2 を必要とする public contract 条件を曖昧さなく定義する。

#### 手順

1. IPC channel、public preload method、shared export、interface spec を 4 軸で整理する
2. `既存 IPC 再利用 + public preload 追加` のケースを明示する
3. `既存 IPC 再利用 + shared export 追加` のケースを明示する

#### 成果物

- Step 2 判定マトリクス

#### 完了条件

- 判定表だけで Step 2 要否が機械的に判断できる

### Phase B: 公開契約差分検出

#### 目的

公開契約の増分を source から短時間で見つけられるようにする。

#### 手順

1. preload API の公開メソッド一覧を抽出する
2. shared barrel export の増分を抽出する
3. `interfaces-agent-sdk-skill.md` の記載と突合する

#### 成果物

- 差分検出コマンドとチェックリスト

#### 完了条件

- public preload と shared export の差分が 1 回で洗い出せる

### Phase C: system spec と outputs 同期

#### 目的

system spec と parent workflow outputs の記述ずれを防ぐ。

#### 手順

1. `interfaces-agent-sdk-skill.md` に関連未タスクを登録する
2. `task-workflow.md` と `lessons-learned.md` に同一 ID を登録する
3. parent workflow の `unassigned-task-detection.md` と `phase12-task-spec-compliance-check.md` を更新する

#### 成果物

- 更新済み system spec
- 更新済み parent workflow outputs

#### 完了条件

- 4 箇所で同じ未タスク ID と要旨が辿れる

### Phase D: 未タスク監査と link 検証

#### 目的

未タスク化そのものが validator で閉じる状態にする。

#### 手順

1. `audit-unassigned-tasks.js --json --diff-from HEAD --target-file ...` を実行する
2. `verify-unassigned-links.js` を実行する
3. `audit-unassigned-tasks.js --json --diff-from HEAD` を実行して current/baseline を分離記録する

#### 成果物

- 監査結果ログ

#### 完了条件

- 対象未タスクの `currentViolations=0`
- link 検証が PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Step 2 public contract 判定マトリクスが定義されている
- [ ] public preload API / shared export の差分検出手順が定義されている
- [ ] `interfaces-agent-sdk-skill.md` まで更新対象に含めるルールが明文化されている

### 品質要件

- [ ] 既存 IPC 再利用ケースが明示されている
- [ ] public contract と transport contract の違いが説明されている
- [ ] `current` と `baseline` を分離した監査結果が残る

### ドキュメント要件

- [ ] 本未タスク仕様書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow.md` と `lessons-learned.md` に関連未タスクが同期されている
- [ ] `interfaces-agent-sdk-skill.md` に関連未タスク導線がある
- [ ] parent workflow の Phase 12 outputs に formalize 結果が反映されている

---

## 6. 検証方法

### テストケース

- Case 1: 既存 IPC 再利用だが public preload method を追加した場合、Step 2 必須と判定される
- Case 2: shared export だけを追加した場合でも interface spec 更新が必要と判定される
- Case 3: 未タスク導線が task-workflow / interfaces / lessons / outputs で一致する

### 検証手順

```bash
rg -n "evaluatePrompt|window\\.electronAPI\\.skill|ExecutionQualityEvaluation|LifecycleGateDecision" \
  apps/desktop/src/preload \
  packages/shared/src/types \
  packages/shared/index.ts \
  .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-phase12-step2-public-contract-guard-001.md

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                           | 影響度 | 発生確率 | 対策                                                                                       |
| ------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------ |
| broad guard と責務が重複して未タスクが肥大化する | 中     | 中       | 本タスクは Step 2 判定条件と interface spec 同期だけに限定する                             |
| public contract 差分検出が grep 依存で漏れる     | 中     | 中       | preload method と shared export の対象ファイルを固定し、対象ファイルを template に埋め込む |
| outputs だけ更新して system spec が遅れる        | 高     | 中       | `interfaces` / `task-workflow` / `lessons` / outputs を同一ターン更新の完了条件にする      |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-12/phase12-task-spec-compliance-check.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

### 参考資料

- `apps/desktop/src/preload/skill-api.ts`
- `apps/desktop/src/preload/channels.ts`
- `packages/shared/src/types/skill-lifecycle.ts`
- `packages/shared/src/types/index.ts`
- `packages/shared/index.ts`

---

## 9. 備考

### 補足事項

この未タスクは Task04 の修正漏れを蒸し返すものではなく、Task04 で露出した Step 2 判定の盲点を今後の短縮導線として formalize するための guard である。実装時は IPC channel 数ではなく公開契約差分を一次判定軸にすること。
