# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| Phase名    | テスト拡充                      |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | Phase 5: 実装                   |
| 次Phase    | Phase 7: カバレッジ確認         |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

最小テストで見落としやすい境界条件を補強し、
`runCreateWorkflow` の実装に対するバグ再発と回帰の両方を防止するテストカバレッジを確保する。

## 実行タスク

### Task 1: loadAgentキャッシュ機構の確認

- `resourceLoader.loadAgent` が同一呼び出しで複数回実行されないことを確認する
- `createSkill()` を同一オプションで複数回呼び出した場合、2回目以降はキャッシュから返されることを確認する
- キャッシュヒット時と初回ロード時でパフォーマンス差が意図通りであることを確認する

### Task 2: options引数の構造計画JSON反映

- `options.name` が `runCreateWorkflow` で返す構造計画JSONの `skillName` フィールドに正しく反映されることを確認する
- `options.description` が構造計画JSONの `description` フィールドに正しく反映されることを確認する
- `options.name` と `options.description` が両方空文字の場合でも構造計画JSONが生成されることを確認する

### Task 3: nullフォールバック機構の確認

- `runCreateWorkflow` が `null` を返した場合、タスクAのtmp JSON機構が最小JSONにフォールバックすることを確認する
- `loadAgent` が例外を投げた場合に `runCreateWorkflow` が `null` を返すことを確認する
- フォールバック時の最小JSONに必須フィールド（`skillName`、`description`）が含まれることを確認する

### Task 4: collaborativeモードとの分岐確認

- `createSkill()` を `mode:"collaborative"` で呼び出した場合に `runCreateWorkflow` が呼ばれないことを確認する
- `createSkill()` を `mode:"create"` で呼び出した場合にのみ `runCreateWorkflow` が呼ばれることを確認する
- switch文のdefaultケースで意図しないモードが渡された場合の挙動を確認する

## 参照資料

| 資料名       | パス                                       | 説明           |
| ------------ | ------------------------------------------ | -------------- |
| 実装記録     | `outputs/phase-5/implementation-record.md` | 実装後の観測点 |
| テスト仕様書 | `outputs/phase-4/test-specifications.md`   | 拡充元         |

## 統合テスト連携

- 境界ケースがAC-1〜AC-5の補強として機能することを確認する
- 拡充したテストがPhase 7のカバレッジ確認の入力となる

## 成果物

| 成果物         | パス                                      | 説明           |
| -------------- | ----------------------------------------- | -------------- |
| テスト拡充記録 | `outputs/phase-6/extended-test-record.md` | 境界ケース一覧 |

## 完了条件

- [ ] 4件のタスクに対する境界ケースが追加されている
- [ ] loadAgentキャッシュ・nullフォールバック・モード分岐の防止ケースが含まれている
- [ ] 既存の collaborative モードテストへの回帰がない
- [ ] 追加観点が成果物に記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
