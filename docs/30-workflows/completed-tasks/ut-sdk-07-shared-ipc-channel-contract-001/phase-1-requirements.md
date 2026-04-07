# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 1                                         |
| Phase名    | 要件定義                                  |
| 前提Phase  | なし（開始Phase）                         |
| 後続Phase  | Phase 2                                   |
| ステータス | 未実施                                    |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-shared-ipc-channel-contract-001 |

## 目的

Skill Creator runtime 系 3 チャンネルの現状 drift を把握し、shared 正本化に必要な要件・受入基準・スコープを確定する。

## 背景

TASK-SDK-07 Phase 12 再監査で発見した課題。既存タスク #1696 で APPROVAL_CHANNELS / EXECUTION_CHANNELS は shared へ移行済みだが、以下の 3 チャンネルは preload に直書きされたまま:

- SKILL_CREATOR_PROGRESS: "skill-creator:progress"
- SKILL_CREATOR_WORKFLOW_STATE_CHANGED: "skill-creator:workflow-state-changed"
- SKILL_CREATOR_ADAPTER_STATUS_CHANGED: "skill-creator:adapter-status-changed"

## 実行タスク

### タスク1: 現状 drift の確認

**目的**: 3 チャンネルの現在の定義場所と文字列値を正確に記録する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts` を読み込み、SKILL_CREATOR 系チャンネルが何種類定義されているか確認する
2. `apps/desktop/src/preload/channels.ts` を読み込み、SKILL_CREATOR_PROGRESS / SKILL_CREATOR_WORKFLOW_STATE_CHANGED / SKILL_CREATOR_ADAPTER_STATUS_CHANGED の定義箇所（行番号）を確認する
3. 両ファイルを比較し、drift がある 3 チャンネルの文字列値を requirements-summary.md に記録する
4. ALLOWED_ON_CHANNELS に 3 チャンネルが含まれているかを確認する

**期待される成果物**:

- `outputs/phase-1/requirements-summary.md`

---

### タスク2: 受入基準の確定

**目的**: Phase 5 実装の完了判定に使う受入基準を確定する

**実行手順**:

1. AC-1〜AC-7 を scope-definition.md に転記する
2. 後方互換性要件（既存テスト・IPC handler・ALLOWED_ON_CHANNELS への影響ゼロ）を追記する
3. 命名規則を確認する: 定数グループは SCREAMING_SNAKE_CASE、文字列値は "skill-creator:xxx" の形式

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`
- `outputs/phase-1/acceptance-criteria.md`

---

### タスク3: タスク分類の明示

**目的**: Phase 11 の NON_VISUAL / VISUAL 判定根拠を Phase 1 で確定する

**実行手順**:

1. 本タスクが UI 変更を伴わないことを確認する
2. タスク分類を "code task（NON_VISUAL）" として記録する
3. artifact 命名 canonical 一覧を確定する

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md` にタスク分類を含める

---

## 参照資料

| 参照資料                   | パス                                                                                    | 内容                               |
| -------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| shared channels.ts         | `packages/shared/src/ipc/channels.ts`                                                   | 修正対象の current code            |
| preload channels.ts        | `apps/desktop/src/preload/channels.ts`                                                  | 修正対象の current code            |
| 先行タスク仕様書           | `docs/30-workflows/completed-tasks/step-ut-sdk-07-shared-ipc-channel-contract/index.md` | 移行パターンの参考                 |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`                                    | Phase 1-13 / Phase 12 テンプレート |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`                                       | system spec の正本                 |

## 成果物

| 成果物               | パス                                      | 内容                                 |
| -------------------- | ----------------------------------------- | ------------------------------------ |
| requirements-summary | `outputs/phase-1/requirements-summary.md` | drift チャンネル一覧・文字列値       |
| scope-definition     | `outputs/phase-1/scope-definition.md`     | スコープ・非スコープ・後方互換性要件 |
| acceptance-criteria  | `outputs/phase-1/acceptance-criteria.md`  | AC-1〜AC-7 + タスク分類              |

## 統合テスト連携

- 3 チャンネルの現状文字列と preload/shared 定義差分を明記する
- ALLOWED_ON_CHANNELS における 3 チャンネルの利用状況を記録する

## 完了条件

- [ ] 3 チャンネルの現状 drift が文書化されている
- [ ] AC-1〜AC-7 が scope-definition / acceptance-criteria に記録されている
- [ ] タスク分類（NON_VISUAL code task）が記録されている
- [ ] 全成果物が outputs/phase-1/ に生成されている

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 依存関係

- **前提**: なし
- **後続**: Phase 2（設計）へ進む

## 次のPhase

完了後、以下のファイルを実行してください:
`docs/30-workflows/ut-sdk-07-shared-ipc-channel-contract-001/phase-2-design.md`
