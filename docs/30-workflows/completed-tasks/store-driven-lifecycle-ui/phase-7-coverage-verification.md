# Phase 7: カバレッジ確認 — Store駆動ライフサイクルUI統合

## メタ情報

| 項目      | 値                             |
| --------- | ------------------------------ |
| Phase     | 7                              |
| 機能名    | store-driven-lifecycle-ui      |
| タスクID  | TASK-10A-F                     |
| 作成日    | 2026-03-07                     |
| 前提Phase | Phase 6 完了（テスト拡充済み） |
| 次Phase   | Phase 8（リファクタリング）    |

## 目的

Phase 6 で拡充したテストの結果を検証し、Line/Branch/Function カバレッジが基準を充足しているか判定する。未達の場合は Phase 6 に差戻す。

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 未達時の対応     |
| ----------------- | -------- | -------- | ---------------- |
| Line Coverage     | 80%      | 90%      | Phase 6 に差戻し |
| Branch Coverage   | 60%      | 70%      | Phase 6 に差戻し |
| Function Coverage | 80%      | 90%      | Phase 6 に差戻し |

## 参照資料

| 資料名             | パス                                                                        | 説明           |
| ------------------ | --------------------------------------------------------------------------- | -------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                     | Phase 4 成果物 |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`                                 | Phase 5 成果物 |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                        | Phase 6 成果物 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                                       | Phase 6 成果物 |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ基準 |

## 実行タスク

### Task 1: カバレッジ計測

#### 手順

1. 以下のコマンドを実行する:

```bash
cd apps/desktop && pnpm vitest run --coverage -- src/renderer/components/skill/
```

2. `coverage/` ディレクトリの HTML レポートを確認する

### Task 2: カバレッジ判定

#### 判定対象ファイル

以下の4ファイルについて個別にカバレッジを確認する:

| ファイル                    | 判定基準     |
| --------------------------- | ------------ |
| `SkillCreateWizard.tsx`     | 最低基準以上 |
| `hooks/useSkillAnalysis.ts` | 最低基準以上 |
| `SkillAnalysisView.tsx`     | 最低基準以上 |
| `SkillManagementPanel.tsx`  | 最低基準以上 |

#### 判定テーブル

| ファイル                  | Line  | Branch | Function | 判定      |
| ------------------------- | ----- | ------ | -------- | --------- |
| SkillCreateWizard.tsx     | \_\_% | \_\_%  | \_\_%    | PASS/FAIL |
| hooks/useSkillAnalysis.ts | \_\_% | \_\_%  | \_\_%    | PASS/FAIL |
| SkillAnalysisView.tsx     | \_\_% | \_\_%  | \_\_%    | PASS/FAIL |
| SkillManagementPanel.tsx  | \_\_% | \_\_%  | \_\_%    | PASS/FAIL |

#### 判定ルール

- 全ファイルが最低基準（Line: 80%, Branch: 60%, Function: 80%）を満たす → **PASS** → Phase 8 に進む
- 1ファイルでも最低基準を満たさない → **FAIL** → Phase 6 に差戻し、未カバー箇所のテストを追加する

### Task 3: 未カバー箇所の特定（FAIL 時のみ実行）

FAIL の場合、以下を実施する:

1. カバレッジレポートの HTML で赤色（未カバー）行を特定する
2. 未カバー行のカテゴリを分類する:
   - **到達不能コード**: デッドコードの場合はリファクタリング対象としてメモする（Phase 8 で対応）
   - **テスト不足**: テストケースの追加で到達可能な場合は Phase 6 差戻し時の追加対象とする
   - **v8カバレッジプロバイダの制限**: P41準拠でインライン arrow function が独立カウントされる場合は、テストで明示的に呼び出しを検証する
3. 未カバー箇所リストを作成し、Phase 6 差戻し時の指示に含める

### Task 4: カバレッジサマリ記録

カバレッジ計測結果を以下のフォーマットで記録する:

```markdown
## カバレッジサマリ（TASK-10A-F Phase 7）

計測日時: YYYY-MM-DD HH:MM
計測コマンド: cd apps/desktop && pnpm vitest run --coverage -- src/renderer/components/skill/

| ファイル                  | Line  | Branch | Function | 判定      |
| ------------------------- | ----- | ------ | -------- | --------- |
| SkillCreateWizard.tsx     | \_\_% | \_\_%  | \_\_%    | PASS/FAIL |
| hooks/useSkillAnalysis.ts | \_\_% | \_\_%  | \_\_%    | PASS/FAIL |
| SkillAnalysisView.tsx     | \_\_% | \_\_%  | \_\_%    | PASS/FAIL |
| SkillManagementPanel.tsx  | \_\_% | \_\_%  | \_\_%    | PASS/FAIL |

総合判定: PASS / FAIL（Phase 6 差戻し）
```

## 成果物

| 成果物             | パス                               |
| ------------------ | ---------------------------------- |
| カバレッジレポート | `apps/desktop/coverage/` (HTML)    |
| カバレッジサマリ   | 本仕様書の Task 4 セクションに記入 |

## 完了条件

- [ ] Task 1: `cd apps/desktop && pnpm vitest run --coverage -- src/renderer/components/skill/` を実行済み
- [ ] Task 2: 判定テーブルの全セルに数値と PASS/FAIL を記入済み
- [ ] Task 3: FAIL の場合、未カバー箇所リストを作成済み（PASS の場合はスキップ）
- [ ] Task 4: カバレッジサマリを記録済み
- [ ] 総合判定が PASS の場合: Phase 8 に進む
- [ ] 総合判定が FAIL の場合: Phase 6 に差戻し、未カバー箇所のテスト追加指示を明記済み
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

- **PASS**: Phase 8（リファクタリング）へ進む
- **FAIL**: Phase 6（テスト拡充）へ差戻す
