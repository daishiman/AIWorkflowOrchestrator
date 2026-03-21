# Phase 4: テスト作成 - SkillExecutionStatus 型同期の再監査

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 4                               |
| 機能名 | execution-status-type-spec-sync |
| 作成日 | 2026-03-20                      |

## 目的

ready/blocked の両分岐を機械的に検証できる command suite を作成し、P50/P65 の再発を防ぐ。

## 実行タスク

- readiness テスト定義: 現物値と Task12 一次情報の整合を確認する
- canonical 抽出テスト定義: index 起点で必要仕様へ到達できるか確認する
- 分岐判定テスト定義: ready path / blocked path の誤判定を防ぐ
- parity 前提テスト定義: mirror と validator の前提を確認する
- 多角的チェック観点: architecture / data consistency / document operation を追加する

### タスク1: readiness 検証テストの定義

### タスク2: canonical 参照抽出テストの定義

### タスク3: ready path / blocked path の判定テスト定義

### タスク4: mirror / validator 前提テストの定義

## 参照資料

| 資料名           | パス                                                                                                  | 説明           |
| ---------------- | ----------------------------------------------------------------------------------------------------- | -------------- |
| Phase 1 要件     | `outputs/phase-1/requirements.md`                                                                     | FR 一覧        |
| Phase 2 設計     | `outputs/phase-2/design.md`                                                                           | lane と matrix |
| Phase 3 レビュー | `outputs/phase-3/design-review-result.md`                                                             | 判定           |
| Task12 一次情報  | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md` | readiness 根拠 |

## 実行手順

### ステップ1: readiness 判定テストを定義する

| テストID | 内容                           | 初期状態       | コマンド                                                                                                           | RED条件          | GREEN条件          | blocked 時の扱い                          |
| -------- | ------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------------ | ----------------------------------------- |
| T4-1     | `skill.ts` の現行値抽出        | 実コード未確認 | `sed -n '360,390p' packages/shared/src/types/skill.ts`                                                             | 値集合が読めない | 6値または9値が確定 | 6値なら blocked 判定候補として記録        |
| T4-2     | Task12 一次情報の存在確認      | 一次情報未確認 | `test -f .claude/skills/aiworkflow-requirements/references/task-workflow-completed-skill-lifecycle-design.md`      | exit 1           | exit 0             | spec 抽出不能として blocked 候補に追加    |
| T4-3     | lessons learned の直接参照確認 | 教訓参照未確認 | `test -f .claude/skills/aiworkflow-requirements/references/lessons-learned-current-electron-menu-docs-task0912.md` | exit 1           | exit 0             | P64/P65 根拠不足として blocked 候補に追加 |

### ステップ2: canonical 抽出テストを定義する

| テストID | 内容                                | 観点               | コマンド                                                                                                          | RED条件                      | GREEN条件                                                                                                    | blocked 時の扱い                |
| -------- | ----------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------- | ------------------------------------ |
| T4-4     | search-spec で一次情報に到達        | document operation | `node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001"` | 関連 spec が返らない         | Task12 関連 spec が返る                                                                                      | 抽出導線不足を blocker 化       |
| T4-5     | `SkillExecutionStatus` 参照箇所列挙 | data consistency   | `grep -rn "SkillExecutionStatus" .claude/skills/aiworkflow-requirements/references/`                              | 更新/確認対象が欠落          | 更新/確認対象が列挙できる                                                                                    | 不足ファイルを follow-up 候補化 |
| T4-6     | topic-map 行位置確認                | architecture       | `grep -n "interfaces-agent-sdk-integration\\                                                                      | arch-state-management-core\\ | task-workflow-completed-skill-lifecycle-design" .claude/skills/aiworkflow-requirements/indexes/topic-map.md` | 対象が見つからない              | 対象が見つかる | index 再生成または補修対象として記録 |

### ステップ3: 分岐判定テストを定義する

| テストID | 内容                                                        | 初期状態                    | RED条件                 | GREEN条件                      | 判定      | blocked 時の扱い           |
| -------- | ----------------------------------------------------------- | --------------------------- | ----------------------- | ------------------------------ | --------- | -------------------------- |
| T4-7     | `review` / `improve_ready` / `reuse_ready` が実コードにある | 追加状態未確認              | 追加状態が欠落          | 3状態が全て存在                | `ready`   | N/A                        |
| T4-8     | 実コードが 6 値のまま                                       | 現行実値が 6 値             | 6値を 9値扱いしてしまう | 6値をそのまま `blocked` と判定 | `blocked` | system spec 本文更新を停止 |
| T4-9     | `blocked` 時に system spec 更新を実行しない                 | future-state 記載の危険あり | 本文更新を許容する      | 停止条件が明記されている       | PASS 条件 | blocker 記録へ送る         |

### ステップ4: parity / validator / 多角的観点を定義する

| テストID | 内容                              | 観点               | コマンド                                                                                                                                                      | 期待結果                                          |
| -------- | --------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| T4-10    | `.claude` / `.agents` parity 前提 | document operation | `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements`                                                                      | diff 0 または差分の所在が説明できる               |
| T4-11    | workflow validator 前提           | data consistency   | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/execution-status-type-spec-sync --phase 4` | error 0                                           |
| T4-12    | architecture 整合観点の明記       | architecture       | 目視レビュー                                                                                                                                                  | ready/blocked と更新対象/確認対象が分離されている |

## 統合テスト連携（Phase 4）

| 検証項目       | 方法         | 期待結果                                       |
| -------------- | ------------ | ---------------------------------------------- |
| readiness 検証 | T4-1〜T4-3   | 現物と一次情報が確定                           |
| 抽出導線       | T4-4〜T4-6   | canonical 参照に到達                           |
| 分岐判定       | T4-7〜T4-9   | ready/blocked を誤判定しない                   |
| 多角的チェック | T4-10〜T4-12 | architecture / data / document の3観点を満たす |

## 成果物

| 成果物       | パス                            | 説明                     |
| ------------ | ------------------------------- | ------------------------ |
| テストケース | `outputs/phase-4/test-cases.md` | command suite と判定基準 |

## 完了条件

- [ ] readiness / canonical / 分岐判定のテストケースが定義されている
- [ ] 9値前提ではなく conditional validation になっている
- [ ] `blocked` 時の停止条件が明文化されている
- [ ] architecture / data consistency / document operation の観点が含まれている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. readiness テスト設計
3. canonical 抽出テスト設計
4. 分岐判定テスト設計
5. 成果物作成
6. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/execution-status-type-spec-sync --phase 4
```

## 次のPhase

Phase 5: 実装
