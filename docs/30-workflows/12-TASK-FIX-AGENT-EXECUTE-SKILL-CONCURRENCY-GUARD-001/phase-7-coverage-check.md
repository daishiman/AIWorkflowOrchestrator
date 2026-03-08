# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 7                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Phase 5の実装とPhase 6の拡充テストに対して、カバレッジ基準（Line 80%以上、Branch 60%以上、Function 80%以上）の充足を確認する。未達の場合はPhase 6に戻る。

## 実行タスク

- カバレッジ計測: 修正対象ファイルのカバレッジを計測
- 基準充足判定: プロジェクトのカバレッジ基準との照合
- 未達時のフィードバック: 不足箇所の特定とPhase 6への差戻し判断

## 参照資料

| 資料名         | パス                               | 説明               |
| -------------- | ---------------------------------- | ------------------ |
| 品質基準       | `.claude/rules/02-code-quality.md` | カバレッジ基準定義 |
| Phase 6 テスト | Phase 6の成果物                    | 拡充テスト一覧     |

### システム仕様（aiworkflow-requirements）

- 該当なし（カバレッジ基準は `.claude/rules/02-code-quality.md` に定義）

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts
```

### ステップ2: カバレッジ基準の照合

| 指標              | 最低基準 | 推奨基準 | 実測値         | 判定 |
| ----------------- | -------- | -------- | -------------- | ---- |
| Line Coverage     | 80%      | 90%      | （計測後記入） | -    |
| Branch Coverage   | 60%      | 70%      | （計測後記入） | -    |
| Function Coverage | 80%      | 90%      | （計測後記入） | -    |

### ステップ3: 判定

- **全基準充足:** Phase 8（リファクタリング）へ進む
- **一部未達:** 不足箇所を特定し、Phase 6に戻ってテストを追加

### ステップ4: 特に確認すべきカバレッジ対象

| 対象コード箇所                       | 期待されるカバレッジ                 |
| ------------------------------------ | ------------------------------------ |
| `if (isExecuting) return;` ガード    | true/false両方のブランチが実行される |
| `if (!selectedSkillName) return;`    | ガード前のreturnが実行される         |
| authKey事前検証ブロック              | 既存テストで網羅済みであること       |
| `set({ isExecuting: true, ... })`    | 正常系で実行される                   |
| エラーハンドリング（catch ブロック） | T-09で実行される                     |

## 統合テスト連携（Phase 1〜11は必須）

- カバレッジ計測は修正対象コード（`executeSkill` 関数）のみに焦点を当てる
- agentSlice全体のカバレッジは参考値として確認する

## 成果物

| 成果物           | パス                                                                                                | 説明           |
| ---------------- | --------------------------------------------------------------------------------------------------- | -------------- |
| カバレッジ確認書 | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-7-coverage-check.md` | 本ドキュメント |

## 完了条件

- [ ] カバレッジ計測が実行されている
- [ ] Line Coverage 80%以上を達成している
- [ ] Branch Coverage 60%以上を達成している
- [ ] Function Coverage 80%以上を達成している
- [ ] `isExecuting` ガードの両ブランチ（true/false）がテストで実行されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（カバレッジ基準充足の場合）
Phase 6: テスト拡充（カバレッジ基準未達の場合）
