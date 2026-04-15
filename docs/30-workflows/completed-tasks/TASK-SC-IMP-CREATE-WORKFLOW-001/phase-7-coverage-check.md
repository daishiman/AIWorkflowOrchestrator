# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| Phase名    | カバレッジ確認                  |
| 対象機能   | TASK-SC-IMP-CREATE-WORKFLOW-001 |
| 前提Phase  | Phase 6: テスト拡充             |
| 次Phase    | Phase 8: リファクタリング       |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

AC-1〜AC-5とconcern coverageを照合し、
`runCreateWorkflow` の変更行に対するカバレッジ抜けをなくす。

## 実行タスク

### Task 1: 受入条件カバレッジ照合

- AC-1（mode:"create"でcreateSkill()を呼ぶとresourceLoader.loadAgentが呼ばれる）のテスト対応表を作成する
- AC-2（runCreateWorkflow完了後、createSkill()後続処理が正常に続く）のテスト対応表を作成する
- AC-3（loadAgentが失敗した場合でもcreateSkill()は成功する）のテスト対応表を作成する
- AC-4（`void options`コメントが削除され、options.descriptionが使用される）のテスト対応表を作成する
- AC-5（collaborativeモードの既存テストが全てパスし続ける）のテスト対応表を作成する

### Task 2: concern coverageの確認

- `runCreateWorkflow` の戻り型変更（`void` → `StructurePlanJson | null`）が型安全に実装されているかを確認する
- `createSkill()` のswitch文における `case "create"` と `case "collaborative"` の分岐が個別concernとして確認する
- `loadAgent` の成功パス・失敗パス・例外パスの3観点を確認する

### Task 3: カバレッジレポートの生成

以下のコマンドを実行してカバレッジを測定する:

```bash
pnpm --filter @repo/desktop test -- --coverage apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

**目標値**:

- `runCreateWorkflow` の変更行: line 100% / branch 100%
- `createSkill()` のswitch文 case "create": 100%

### Task 4: カバレッジ抜けの解消

- カバレッジ抜けが発見された場合はPhase 6の拡充対象として記録する
- 行数カバレッジよりconcern coverageを優先して判定する
- フォールバック（null返却）経路のブランチカバレッジを確認する

## 参照資料

| 資料名         | パス                                       | 説明           |
| -------------- | ------------------------------------------ | -------------- |
| テスト拡充記録 | `outputs/phase-6/extended-test-record.md`  | coverage対象   |
| 実装記録       | `outputs/phase-5/implementation-record.md` | coverageの根拠 |

## 統合テスト連携

- AC-1〜AC-5のすべてに対応するテストが存在することを確認する
- `loadAgent`成功→JSON生成→タスクA連携の一連フローがcoverageの中核ケースとして計上されていることを確認する

## 成果物

| 成果物             | パス                                 | 説明                |
| ------------------ | ------------------------------------ | ------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | ACとconcernの対応表 |

## 完了条件

- [ ] AC-1〜AC-5の対応表がある
- [ ] concern coverageの抜けがない
- [ ] `runCreateWorkflow` の変更箇所がすべてcoverageに含まれている
- [ ] Phase 8に渡す重複削減候補が整理されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
