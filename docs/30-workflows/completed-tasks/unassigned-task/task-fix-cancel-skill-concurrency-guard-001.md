# cancelSkill 並行実行ガードの追加 - タスク指示書

## メタ情報

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-FIX-CANCEL-SKILL-CONCURRENCY-GUARD-001                          |
| タスク名     | cancelSkill 並行実行ガードの追加                                   |
| 分類         | 改善                                                               |
| 対象機能     | agentSlice.abortExecution / skill abort lifecycle                  |
| 優先度       | 中                                                                 |
| 見積もり規模 | 小規模                                                             |
| ステータス   | 未実施                                                             |
| 発見元       | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 Phase 12 再監査 |
| 発見日       | 2026-03-09                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`executeSkill` には `isExecuting` を使った再入ガードが追加され、実行開始の二重送信は抑止できるようになった。一方で `abortExecution` は `executionId` が残っている間、連続クリックや二重 dispatch で IPC abort を重複送信できる余地が残っている。

### 1.2 問題点・課題

- `window.electronAPI.skill.abort(executionId)` が同一 `executionId` に対して複数回送られる可能性がある
- `isExecuting` の復元と cancel 中フラグが分離されておらず、UI と Store の責務境界が曖昧
- 現状のテストは `executeSkill` の再入防止を中心にしており、cancel 連打の state transition を保証していない

### 1.3 放置した場合の影響

- 完了済み実行や error 遷移後の execution に対して重複 abort を送る race が残る
- 将来 `abortExecution` に loading UI や toast を追加したときに二重表示・二重 side effect が起きやすい
- `executeSkill` だけ安全で `abortExecution` は unsafe という非対称設計が残り、保守者の判断コストが上がる

---

## 2. 何を達成するか（What）

### 2.1 目的

`abortExecution` の重複送信余地を調査し、必要最小限の並行実行ガードを追加して cancel 操作の契約を明文化する。

### 2.2 最終ゴール

- `abortExecution` 連打時の振る舞いがテストで再現・固定されている
- 必要なら `isCancelling` または等価の最小 state guard が導入されている
- system spec と task-workflow に cancel 側の設計判断が反映されている

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/store/slices/agentSlice.ts` の `abortExecution`
- cancel 操作の selector / UI disabled 条件が必要ならその最小追加
- `agentSlice` のテスト追加
- Phase 12 の system spec / 未タスク解消記録

#### 含まないもの

- Skill execution queue の新規導入
- cancel/retry/history の全面 redesign
- Main Process 側の abort transport 改修を伴う大規模変更

### 2.4 成果物

- `abortExecution` の実装差分
- cancel 重複送信の回帰テスト
- system spec 更新（少なくとも `arch-state-management.md` と必要な残課題台帳）
- 本未タスク指示書の完了移管または status 更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001` の execute 側ガード実装を理解していること
- `agentSlice` の listener cleanup (`_handleComplete` / `_handleError`) を確認済みであること
- `apps/desktop` 配下から vitest を実行できること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- Zustand slice の `set/get` パターン
- renderer から preload API 経由で abort IPC を呼ぶ流れ
- Vitest で async action と microtask を安定検証する方法

### 3.4 推奨アプローチ

1. 先にテストで cancel 連打シナリオを再現する
2. `executeSkill` と同じ思想で Store 層に最小ガードを置く
3. UI 側は必要最小限の disabled 表示に留め、state explosion を避ける
4. 実装後に system spec と残課題台帳を同ターンで同期する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                              | 発見経緯                                                                    | 解決策                                                                                                      | この未タスクでの適用                                                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `validate-phase-output --phase` の誤案内          | Phase 12 再監査で template と実スクリプトが drift していた                  | validator 実行方法は実装コードに合わせて固定し、docs を同一ターンで更新する                                 | cancel タスク完了時も `validate-phase-output.js <workflow-dir>` と `verify-all-specs` を実行し、docs だけ stale にしない |
| BrowserRouter 配下で Router を二重化              | screenshot harness 作成時に `MemoryRouter` を重ねて描画失敗した             | 既存 Router の descendant route で描画する                                                                  | cancel 専用 review harness を作る場合も Router 二重化を禁止する                                                          |
| current workflow の本文・artifact・index の不一致 | screenshot / implementation-guide は存在しても workflow 本文が stale だった | `phase-12-documentation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` を同ターンで同期する | cancel タスクでも完了判定前に 4 点同期を行う                                                                             |

---

## 4. 実行手順

### Phase構成

3フェーズで進める。Phase Aで現状再現、Phase Bで最小修正、Phase Cで仕様同期と完了確認を行う。

### Phase A: 現状調査と再現

#### 目的

`abortExecution` がどの条件で重複送信されるかを特定し、必要な guard 条件を明文化する。

#### 手順

1. `agentSlice.ts` の `abortExecution` 実装と `executionId` クリア条件を読む
2. `window.electronAPI.skill.abort` のモックを使い、同一 `executionId` に対する連続呼び出しテストを追加する
3. `isExecuting=true` / complete直後 / error直後 / `executionId=null` の各ケースを分類する

#### 成果物

- 再現テストまたは再現不能の判定メモ
- cancel state transition の一覧

#### 完了条件

- 重複 abort の有無が再現テストまたは明示的な非再現結論で説明できる

### Phase B: 最小ガード実装

#### 目的

Store責務を壊さずに cancel 側の再入防止を追加する。

#### 手順

1. 必要最小限の guard (`isCancelling` または同等条件) を設計する
2. listener cleanup と矛盾しないよう state 復元ポイントを整理する
3. テストを更新し、重複 abort が抑止されることを確認する

#### 成果物

- `agentSlice.ts` の修正
- 関連テストの追加/更新

#### 完了条件

- 同一 `executionId` への重複 abort が抑止される
- execute 側ガードと cancel 側ガードの状態遷移が矛盾しない

### Phase C: 仕様同期と完了確認

#### 目的

実装内容と苦戦箇所を再利用できる形で system spec と workflow に残す。

#### 手順

1. `arch-state-management.md` と `task-workflow.md` に実装内容、苦戦箇所、残課題を反映する
2. 必要なら `lessons-learned.md` に 5分解決カードを追加する
3. validator / test を再実行し、本指示書の status と配置先を更新する

#### 成果物

- system spec 更新
- validation 実行記録
- 完了後の未タスク移管またはステータス更新

#### 完了条件

- code / test / system spec / task ledger が同じ結論になっている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `abortExecution` の重複送信シナリオが再現または否定できている
- [ ] 必要な guard が最小差分で実装されている
- [ ] 完了/エラー/未実行時の挙動が明文化されている

### 品質要件

- [ ] 対象テストが PASS
- [ ] execute 側 guard との非対称性が説明できる、または解消されている
- [ ] 追加 state が増えた場合は cleanup 条件までテストされている

### ドキュメント要件

- [ ] `arch-state-management.md` に cancel 側の最終仕様が記載されている
- [ ] `task-workflow.md` の残課題/完了状態が更新されている
- [ ] 苦戦箇所と5分解決カードが system spec か lessons に残っている

---

## 6. 検証方法

### テストケース

- TC-01: `executionId` がある状態で `abortExecution` を2回呼ぶと abort IPC が1回だけ送られる
- TC-02: complete/error 後に `abortExecution` を呼んでも不要な abort を送らない
- TC-03: cancel 中 state がある場合、UI が二重 cancel を許さない
- TC-04: execute ガードと cancel ガードが干渉せず、再実行可能状態へ戻る

### 検証手順

1. `cd apps/desktop && pnpm exec vitest run <対象テストファイル>`
2. `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js <workflow-dir>`
3. `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow <workflow-dir>`
4. 未タスクが完了した場合は `verify-unassigned-links.js` で参照整合を確認する

---

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                                                    |
| -------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| cancel guard のために state が増え、cleanup 漏れが起きる | 中     | 中       | `_handleComplete` / `_handleError` / abort success での復元経路を一覧化してから実装する |
| UI disabled だけで Store guard を入れず再発する          | 高     | 中       | Store 層で最終防衛線を置き、UI は補助層に留める                                         |
| execute 側と cancel 側で名称や責務がずれる               | 中     | 中       | `isExecuting` / `isCancelling` の定義を spec へ明文化する                               |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/outputs/phase-12/documentation-changelog.md`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考資料

- `apps/desktop/src/renderer/store/slices/agentSlice.ts`
- `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Workflow12 再監査で、execute 側の並行実行ガードは完了している一方、
abortExecution には同等の再入防止が残っていない可能性があると判定された。
```

### 補足事項

- このタスクは execute 側の完了を否定するものではなく、cancel 側の対称性確認を目的とする
- 実装不要と結論づけた場合も、その理由を system spec に残してからクローズする
