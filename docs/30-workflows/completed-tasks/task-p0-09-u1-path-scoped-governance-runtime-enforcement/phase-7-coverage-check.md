# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 7                                          |
| Phase名    | カバレッジ確認                             |
| 前提Phase  | Phase 6                                    |
| 後続Phase  | Phase 8                                    |
| ステータス | 完了                                       |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## 目的

追加テストで `RuntimeSkillCreatorFacade.ts` のカバレッジが目標に達したか確認する。

---

## 目標カバレッジ

| 指標              | 目標 |
| ----------------- | ---- |
| Line Coverage     | 80%+ |
| Branch Coverage   | 80%+ |
| Function Coverage | 80%+ |

---

## 実行タスク

### タスク1: カバレッジ計測

**目的**: `RuntimeSkillCreatorFacade.ts` の branch coverage を計測する

**実行コマンド**:

```bash
cd apps/desktop && npx vitest run --coverage src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

**確認観点**:

- `createExecuteGovernanceCanUseTool` の branch coverage（新規パス含む）
- `targetPath` 抽出ロジック（`file_path ?? path` の各分岐）
- `skillRoot` が空の場合のフォールバック分岐
- `improve` phase の対応分岐（実装した場合）

**期待される成果物**:

- カバレッジレポート（`outputs/phase-7/coverage-report.txt`）

### タスク2: 未達の場合のテスト追加

**目的**: カバレッジ未達の場合に追加テストで目標を達成する

**実行手順**:

1. カバレッジレポートで未カバーの分岐を確認する
2. 未カバーの分岐に対するテストケースを追加する
3. カバレッジを再計測し、80%+ を確認する

**未達カバレッジの典型パターン**:

- `input` が `null` または `undefined` の場合
- `skillRoot` が `undefined` の場合（`getExplicitSkillCreatorRoot()` が undefined を返す場合）
- `auditSink.record()` が例外を投げた場合

**期待される成果物**:

- 追加テスト（必要な場合）
- 目標達成後のカバレッジレポート

### タスク3: governance テスト全体のカバレッジ確認

**目的**: governance モジュール全体のカバレッジに影響がないか確認する

**実行コマンド**:

```bash
cd apps/desktop && npx vitest run --coverage src/main/services/runtime/
```

**期待される成果物**:

- governance モジュール全体のカバレッジ確認記録

---

## 参照資料

| 参照資料                  | パス                                                                  | 内容             |
| ------------------------- | --------------------------------------------------------------------- | ---------------- |
| Phase 6 成果物            | `outputs/phase-6/test-results.txt`                                    | テスト拡充結果   |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 計測対象ファイル |

---

## 成果物

| 成果物              | パス                                  | 内容               |
| ------------------- | ------------------------------------- | ------------------ |
| coverage-report.txt | `outputs/phase-7/coverage-report.txt` | カバレッジ計測結果 |

---

## 統合テスト連携

統合テストの再実行とゲート判定（カバレッジ 80%+ 達成）を行う。

---

## 完了条件

- [ ] `RuntimeSkillCreatorFacade.ts` の branch coverage が 80%+ に達している
- [ ] カバレッジ未達の場合は追加テストで目標を達成している
- [ ] `outputs/phase-7/coverage-report.txt` が作成されている
- [ ] 全 governance テストが PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6 が完了していること
- **後続**: Phase 8（リファクタリング）へ進む（カバレッジ未達の場合は Phase 6 へ戻る）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-8-refactoring.md`
