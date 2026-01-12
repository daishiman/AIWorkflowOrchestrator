# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 7                      |
| Phase名    | カバレッジ確認         |
| 前提Phase  | Phase 6                |
| 後続Phase  | Phase 8                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-11             |
| 機能名     | スキル管理バックエンド |

---

## 目的

Phase 6のテスト拡充結果を検証し、カバレッジ基準を満たしていることを確認する。未達の場合はPhase 6へ戻りテストを追加する。

## 背景

テスト拡充が完了した。リファクタリングに進む前に、カバレッジ目標が達成されていることを確認するゲートフェーズ。

---

## テストカバレッジ基準

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テスト

| 指標                            | 目標 |
| ------------------------------- | ---- |
| IPCエンドポイント               | 100% |
| モジュール間インターフェース    | 100% |
| 正常系シナリオ                  | 100% |
| 異常系シナリオ                  | 80%+ |
| 外部連携ポイント（ファイルI/O） | 100% |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ計測

**目的**: 最終カバレッジを計測する

**実行手順**:

1. カバレッジを計測する:

```bash
pnpm --filter @repo/desktop test:coverage
```

2. カバレッジレポートを生成する

**期待される成果物**:

- カバレッジレポート（HTML/JSON）

---

### タスク2: ユニットテストカバレッジ判定

**目的**: ユニットテストカバレッジが基準を満たしているか判定する

**実行手順**:

1. 以下の基準で判定する:

| 指標              | 計測値 | 基準 | 判定      |
| ----------------- | ------ | ---- | --------- |
| Line Coverage     | XX%    | 80%+ | PASS/FAIL |
| Branch Coverage   | XX%    | 60%+ | PASS/FAIL |
| Function Coverage | XX%    | 80%+ | PASS/FAIL |

2. 全項目がPASSの場合、タスク3へ進む
3. FAILの項目がある場合、Phase 6へ戻る

**期待される成果物**:

- `outputs/phase-7/unit-coverage-result.md`

---

### タスク3: 結合テストカバレッジ判定

**目的**: 結合テストカバレッジが基準を満たしているか判定する

**実行手順**:

1. 以下の基準で判定する:

| 指標                         | 計測値 | 基準 | 判定      |
| ---------------------------- | ------ | ---- | --------- |
| IPCエンドポイント            | XX%    | 100% | PASS/FAIL |
| モジュール間インターフェース | XX%    | 100% | PASS/FAIL |
| 正常系シナリオ               | XX%    | 100% | PASS/FAIL |
| 異常系シナリオ               | XX%    | 80%+ | PASS/FAIL |
| 外部連携ポイント             | XX%    | 100% | PASS/FAIL |

2. 全項目がPASSの場合、タスク4へ進む
3. FAILの項目がある場合、Phase 6へ戻る

**期待される成果物**:

- `outputs/phase-7/integration-coverage-result.md`

---

### タスク4: テスト品質確認

**目的**: テストの品質を確認する

**実行手順**:

1. 以下の品質観点を確認する:

| 観点                 | チェック項目                             |
| -------------------- | ---------------------------------------- |
| テスト独立性         | 各テストが独立して実行可能か             |
| テストの可読性       | テスト名から何をテストしているかわかるか |
| アサーションの適切性 | 適切なアサーションが使用されているか     |
| モック使用           | 外部依存が適切にモックされているか       |
| エッジケース         | 境界値・異常系がテストされているか       |

2. 問題がある場合は記録する

**期待される成果物**:

- `outputs/phase-7/test-quality-check.md`

---

### タスク5: 統合テスト実行・確認

**目的**: 統合テストが全て成功することを確認する

**実行手順**:

1. 統合テストを実行する:

```bash
pnpm --filter @repo/desktop test src/main/services/skill/__tests__/integration.test.ts
```

2. 全テストが成功することを確認する

3. 結果を記録する:

```markdown
## 統合テスト実行結果

### IPC Connection Tests

- ✓ should respond to agent:scan-available-skills
- ✓ should respond to agent:get-imported-skills
- ✓ should respond to agent:import-skills
- ✓ should respond to agent:remove-skill
- ✓ should respond to agent:get-skill-detail

### Data Flow Tests

- ✓ should complete full import workflow
- ✓ should complete full remove workflow
- ✓ should persist imports across service restart

### Error Handling Tests

- ✓ should return proper error for invalid base path
- ✓ should return proper error for malformed SKILL.md
- ✓ should return proper error for invalid skill id format

### State Synchronization Tests

- ✓ should reflect new skills after re-scan
- ✓ should maintain import state after cache clear

### 総計

- テスト数: XX
- 成功: XX
- 失敗: 0
```

**期待される成果物**:

- `outputs/phase-7/integration-test-result.md`

---

### タスク6: ゲート判定

**目的**: Phase 8への進行可否を判定する

**実行手順**:

1. 全チェック結果を集約する:

| チェック項目             | 結果      |
| ------------------------ | --------- |
| ユニットテストカバレッジ | PASS/FAIL |
| 結合テストカバレッジ     | PASS/FAIL |
| テスト品質               | PASS/FAIL |
| 統合テスト実行           | PASS/FAIL |

2. 判定を行う:
   - 全項目PASS: Phase 8へ進行
   - いずれかFAIL: Phase 6へ戻る

**期待される成果物**:

- `outputs/phase-7/gate-result.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容           |
| ---------------------- | ---------------------------------------------------------------------------- | -------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | テストパターン |

---

## 成果物

| 成果物                 | パス                                             | 内容                     |
| ---------------------- | ------------------------------------------------ | ------------------------ |
| ユニットカバレッジ結果 | `outputs/phase-7/unit-coverage-result.md`        | ユニットテストカバレッジ |
| 結合カバレッジ結果     | `outputs/phase-7/integration-coverage-result.md` | 結合テストカバレッジ     |
| テスト品質チェック     | `outputs/phase-7/test-quality-check.md`          | テスト品質確認結果       |
| 統合テスト結果         | `outputs/phase-7/integration-test-result.md`     | 統合テスト実行結果       |
| ゲート結果             | `outputs/phase-7/gate-result.md`                 | ゲート判定結果           |

---

## 統合テスト連携

**Phase 7での必須アクション**: 統合テストの再実行とゲート判定

- [ ] 統合テストが全て成功することを確認
- [ ] カバレッジ基準を満たしていることを確認
- [ ] 未達の場合はPhase 6へ戻る

---

## 完了条件

- [ ] ユニットテストカバレッジが Line 80%+, Branch 60%+, Function 80%+ を達成
- [ ] 結合テストカバレッジ基準を達成
- [ ] 統合テストが全て成功
- [ ] テスト品質チェックが完了
- [ ] ゲート判定がPASS

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.json を更新

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む
- **戻り**: カバレッジ未達の場合、Phase 6へ戻る

---

## 次のPhase

完了後（ゲートPASSの場合）、以下のファイルを実行してください:

`docs/30-workflows/agent-003-skill-management-backend/phase-8-refactoring.md`
