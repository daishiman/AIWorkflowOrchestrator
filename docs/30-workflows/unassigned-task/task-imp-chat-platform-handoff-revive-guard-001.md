# UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001: chat platform handoff / revive 回帰ガード

## メタ情報

```yaml
issue_number: 1163
task_id: UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001
task_name: chat platform handoff / revive 回帰ガード
category: 改善
target_feature: ChatView / WorkspaceView / SkillCenterView 共通チャット基盤
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-SKILL-LIFECYCLE-02 Phase 12 追補（2026-03-12）
created_date: 2026-03-12
```

| 項目         | 内容                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------- |
| タスクID     | UT-IMP-CHAT-PLATFORM-HANDOFF-REVIVE-GUARD-001                                                                  |
| タスク名     | chat platform handoff / revive 回帰ガード                                                                      |
| 分類         | 改善                                                                                                           |
| 対象機能     | `ChatView` / `WorkspaceView` / `SkillCenterView` の handoff、`chatSlice` persist / revive、recent session rail |
| 優先度       | 中                                                                                                             |
| 見積もり規模 | 中規模                                                                                                         |
| ステータス   | 未実施                                                                                                         |
| 発見元       | TASK-SKILL-LIFECYCLE-02 Phase 12 追補（documentation / lessons / system spec 再確認）                          |
| 発見日       | 2026-03-12                                                                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-02 で `ChatView` を共通会話 surface に統合し、`WorkspaceView` と `SkillCenterView` は handoff のみを担う構造へ整理した。実装時に `entry surface` と `execution surface` の責務分離、および `chatSessions` の persist / revive 契約が重要な難所だったが、現在の回帰確認は `chatSlice.test.ts`、`WorkspaceView.test.tsx`、`SkillCenterView.test.tsx`、Phase 11 screenshot に分散している。

### 1.2 問題点・課題

- handoff と revive が別々の targeted test に分かれており、複合回帰を一度に検出できない
- `createdAt` / `updatedAt` / `timestamp` の `Date` revive 失敗は reload 後の recent rail で顕在化しやすく、単体テストだけでは見落としやすい
- 新しい entry surface や context 項目を追加した際、`Workspace -> ChatView -> reload -> recent rail 再開` の流れが手動確認頼みになりやすい

### 1.3 放置した場合の影響

- chat platform の再入場時に session ordering が崩れても、Phase 11 まで検出が遅れる
- `SkillCenterView` や `WorkspaceView` 側へ独自 chat state を戻してしまう regression を早期に止められない
- 同様の統合タスクで毎回 handoff / revive の切り分けに時間を使い、解決手順が再利用されない

---

## 2. 何を達成するか（What）

### 2.1 目的

chat platform の handoff と persist / revive を横断して検証する回帰ガードを追加し、`Workspace` / `Skill Center` / `ChatView` の責務分離と recent rail の整合を自動で確認できる状態にする。

### 2.2 最終ゴール

1. `WorkspaceView` と `SkillCenterView` の handoff payload が `ChatView` / `chatSlice` に正しく集約されることを結合テストで保証する
2. persist された `chatSessions` が reload 後に `Date` revive・active session 再構築・`modeSessionIds` 再利用まで含めて復元されることを検証する
3. `llm:stream-cancel` / retry / placeholder 非永続 state が reload を跨いで持ち越されないことを明文化し、テストで固定する

### 2.3 スコープ

#### 含むもの

- renderer 側 chat platform 用の回帰テスト helper / fixture 追加
- `chatSlice` persist / revive と `WorkspaceView` / `SkillCenterView` handoff を結合で確認するテスト追加
- `task-workflow.md` / `lessons-learned.md` / `arch-state-management.md` / `ui-ux-feature-components.md` の未タスク導線と教訓同期

#### 含まないもの

- Main Process の LLM API 契約変更
- 新しい chat mode の追加
- ChatHistory 永続層そのものの実装変更

### 2.4 成果物

- `chat platform` 用 persist / revive test helper または fixture
- `chatSlice` / `WorkspaceView` / `SkillCenterView` の回帰テスト追加
- handoff / revive / recent rail を横断する検証手順書
- system spec 更新差分（関連未タスク導線、苦戦箇所、再利用ルール）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-02 の current 実装が `main` 相当へ取り込まれている
- `apps/desktop/src/renderer/store/slices/chatSlice.ts` と既存テスト群を参照できる
- `task-specification-creator` と `aiworkflow-requirements` の最新正本を参照できる

### 3.2 依存タスク

- TASK-SKILL-LIFECYCLE-02 会話基盤・セッション統合（完了）
- `UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001`（画面証跡の current build 固定ルールは再利用するが、本タスクの blocker ではない）

### 3.3 必要な知識

- `chatSlice` の `activeChatSessionId` / `chatSessions` / `chatSessionOrder` / `modeSessionIds`
- `WorkspaceView` の `workspace-open-chat` handoff
- `SkillCenterView` の `skill-lifecycle-start-*` handoff
- persist storage で `Date` を revive する現在の契約

### 3.4 推奨アプローチ

1. まず `entry surface` と `execution surface` の責務をテスト観点で分離する
2. handoff 結合テストと persist / revive テストを別ファイルに切り、同じ fixture を共有する
3. `isStreaming` / `currentStreamId` など非永続 state は「persist しないこと」自体を回帰条件として固定する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                          | 発見経緯                                                                                                | 解決策                                                                                | 教訓                                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 入口 surface と実行 surface を混ぜると handoff / retry / context が分断される | TASK-SKILL-LIFECYCLE-02 で `Workspace` と `Skill Center` に会話責務が残る案を比較したときに整合が崩れた | `ChatView` + `chatSlice` に会話本体を集約し、入口側は payload 作成だけに寄せた        | 回帰テストも「入口の payload」と「実行 surface の state」を分けて検証する |
| `Date` revive を省くと recent rail と session ordering が崩れる               | persist 文字列をそのまま store に戻すと時刻比較と表示順が不安定になった                                 | `customStorage.getItem()` で session/message の日時を `Date` に戻した                 | session persist は serialize だけでなく revive まで 1 セットで検証する    |
| outputs だけ更新すると workflow / system spec が stale になりやすい           | Phase 12 の証跡は揃っても台帳と教訓が後追いになりやすかった                                             | workflow outputs と `task-workflow` / `lessons` / feature spec を同一ターンで同期した | 回帰ガード追加時もテストだけで閉じず、関連仕様書まで同時更新する          |

### 3.6 SubAgent 分担（関心ごとの分離）

| SubAgent   | 担当関心          | 主担当作業                                                                                            | 依存関係   |
| ---------- | ----------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| SubAgent-A | handoff guard     | `WorkspaceView` / `SkillCenterView` から `ChatView` への payload 集約テストを追加する                 | なし       |
| SubAgent-B | revive guard      | persist fixture、`Date` revive、`modeSessionIds` / active session 復元テストを追加する                | A と並列可 |
| SubAgent-C | non-persist guard | `isStreaming` / `currentStreamId` / placeholder state が reload 後に残らないことを固定する            | B と並列可 |
| SubAgent-D | spec sync         | `task-workflow` / `lessons-learned` / `arch-state-management` / `ui-ux-feature-components` を同期する | A/B/C 後   |
| SubAgent-E | validation        | vitest / typecheck / unassigned link 監査を実行して結果を台帳化する                                   | D 後       |

---

## 4. 実行手順

### Phase構成

- Phase A: 契約整理
- Phase B: handoff / revive harness 実装
- Phase C: 回帰テスト追加
- Phase D: system spec 同期と検証

### Phase A: 契約整理

#### 目的

harness 化する対象契約を current 実装から固定する。

#### 手順

1. `chatSlice.ts` と `session.ts` の handoff / revive 契約を抽出する
2. `WorkspaceView.test.tsx` と `SkillCenterView.test.tsx` の既存確認範囲を棚卸しする
3. `persist 対象` と `非 persist 対象` をテスト観点で表に落とす

#### 成果物

- 契約一覧メモ
- テスト観点マトリクス

#### 完了条件

- handoff / revive / non-persist の3観点で確認対象が固定されている

### Phase B: handoff / revive harness 実装

#### 目的

横断回帰を再現できる fixture と helper を用意する。

#### 手順

1. persisted `chatSessions` を組み立てる fixture を作成する
2. `Date` revive 後の比較 helper を追加する
3. `Workspace` / `Skill Center` から `ChatView` へ遷移した後の active session を確認できる helper を追加する

#### 成果物

- fixture / helper

#### 完了条件

- 既存テストから再利用できる最小 helper が用意されている

### Phase C: 回帰テスト追加

#### 目的

handoff と revive の複合回帰を自動検知できるようにする。

#### 手順

1. `workspace-open-chat` 後の session 再利用・context 引き継ぎテストを追加する
2. `skill-lifecycle-start-*` 後の `lifecycleJob` / `handoffLabel` 維持テストを追加する
3. reload 後の recent rail ordering、active session 復元、non-persist state 非保持を確認する

#### 成果物

- 新規または拡張された vitest

#### 完了条件

- handoff / revive / non-persist の3観点が自動テストで通る

### Phase D: system spec 同期と検証

#### 目的

未タスク完了時の知見を再利用可能な形で残す。

#### 手順

1. `task-workflow.md` と `lessons-learned.md` に完了記録と教訓を反映する
2. `arch-state-management.md` と `ui-ux-feature-components.md` にガード完了後の契約差分を反映する
3. `verify-unassigned-links` と対象テストを実行して証跡を固定する

#### 成果物

- 更新済み system spec
- 検証ログ

#### 完了条件

- system spec と test 証跡が同期している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `WorkspaceView` handoff と `SkillCenterView` handoff の両方に回帰テストがある
- [ ] persist / revive の `Date` 復元と active session 再構築を検証している
- [ ] `isStreaming` / `currentStreamId` など非永続 state が reload 後に残らないことを確認している

### 品質要件

- [ ] 対象 vitest がすべて PASS する
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する
- [ ] handoff / revive / non-persist の責務分離がテスト名と spec の両方で明確になっている

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` の残課題テーブルに登録されている
- [ ] `ui-ux-feature-components.md` / `arch-state-management.md` / `lessons-learned.md` に関連未タスクまたは完了記録が反映されている

---

## 6. 検証方法

### テストケース

| ケース | 内容                                           | 期待結果                                                   |
| ------ | ---------------------------------------------- | ---------------------------------------------------------- |
| TC-01  | `workspace-open-chat` 後に session を再開する  | `workspacePath` / selected files が active session に残る  |
| TC-02  | `skill-lifecycle-start-improve` 後に再入場する | `lifecycleJob` / `handoffLabel` が維持される               |
| TC-03  | persist された session を revive する          | recent rail ordering と active session が崩れない          |
| TC-04  | reload 後の streaming state を確認する         | `isStreaming=false`、`currentStreamId=null` 相当で再開する |

### 検証手順

```bash
pnpm --filter @repo/desktop exec vitest run \
  apps/desktop/src/renderer/store/slices/chatSlice.test.ts \
  apps/desktop/src/renderer/views/WorkspaceView/WorkspaceView.test.tsx \
  apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx \
  apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx

pnpm --filter @repo/desktop typecheck

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/task-imp-chat-platform-handoff-revive-guard-001.md
```

---

## 7. リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                                       |
| --------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------- |
| fixture が実装詳細に寄りすぎ、将来変更で壊れやすい  | 中     | 中       | public state 契約だけを触る helper に限定する                              |
| revive テストが localStorage 実装差分に引きずられる | 中     | 中       | `customStorage.getItem()` の責務境界を直接検証し、ブラウザ依存を最小化する |
| handoff テストが UI 文言依存になり brittle になる   | 低     | 中       | `data-testid` と payload 契約を主軸に確認する                              |
| テスト追加だけで spec 更新を忘れる                  | 中     | 中       | Phase D に spec sync を独立 Phase として固定する                           |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`
- `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`
- `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/completed-tasks/step-02-par-task-02-chat-platform-unification/outputs/phase-12/documentation-changelog.md`

### 参考資料

- `apps/desktop/src/renderer/store/slices/chatSlice.ts`
- `apps/desktop/src/renderer/features/chat-platform/session.ts`
- `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceView.test.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.test.tsx`
- `apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

なし。Phase 12 の苦戦箇所から再発防止目的で formalize した改善タスク。

### 補足事項

本タスクは chat platform の機能追加ではなく、既存契約を保守し続けるための回帰ガード整備である。新しい entry surface や context 項目を追加する前に着手すると、後続タスクの手戻りを減らせる。
