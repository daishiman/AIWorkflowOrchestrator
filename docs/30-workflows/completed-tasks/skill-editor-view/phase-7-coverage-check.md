# Phase 7: カバレッジ確認 — SkillEditorView

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| タスク ID  | TASK-UI-05A-SKILL-EDITOR-VIEW                        |
| Phase      | 7（カバレッジ確認）                                  |
| 前提 Phase | Phase 6（テスト拡充）                                |
| 後続 Phase | Phase 8（リファクタリング）                          |
| ステータス | 未着手                                               |
| 作成日     | 2026-03-01                                           |
| 機能名     | SkillEditorView（スキルエディタービュー）            |
| 依存タスク | TASK-UI-05-SKILL-CENTER-VIEW（SkillCenterView 実装） |

## 目的

Phase 6 までのテスト（合計 94 ケース）によるカバレッジが以下の基準を充足しているか最終確認する。未達の場合は Phase 6 へ戻り追加テストを作成する。

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 背景

Phase 4 で 64 テストケースを作成し、Phase 5 で実装を完了、Phase 6 で 30 テストケースを追加した。合計 94 テストケースで Line / Branch / Function カバレッジが最低基準を満たしているかを確認する。v8 カバレッジプロバイダのインライン関数カウント（P41）に注意する。

## 実行タスク

### タスク 1: カバレッジ計測実行

**目的**: 全テストのカバレッジを計測し、ファイルごとの詳細レポートを生成する。

**実行手順**:

1. 以下のコマンドでカバレッジを計測する:
   ```bash
   cd apps/desktop && pnpm vitest run --coverage src/renderer/views/SkillEditorView/
   ```
2. カバレッジレポートから以下の情報を抽出する:
   - 全体のカバレッジサマリー（Line / Branch / Function）
   - ファイルごとのカバレッジ詳細
3. 以下のファイルごとにカバレッジを記録する:

| ファイル                                     | Line    | Branch  | Function |
| -------------------------------------------- | ------- | ------- | -------- |
| `components/FileTreePanel/FileTreeNode.tsx`  | \_\_\_% | \_\_\_% | \_\_\_%  |
| `components/FileTreePanel/FileTreePanel.tsx` | \_\_\_% | \_\_\_% | \_\_\_%  |
| `components/EditorPanel/EditorStatusBar.tsx` | \_\_\_% | \_\_\_% | \_\_\_%  |
| `components/EditorPanel/EditorPanel.tsx`     | \_\_\_% | \_\_\_% | \_\_\_%  |
| `components/EditorToolBar.tsx`               | \_\_\_% | \_\_\_% | \_\_\_%  |
| `components/UnsavedChangesDialog.tsx`        | \_\_\_% | \_\_\_% | \_\_\_%  |
| `components/BackupMenu.tsx`                  | \_\_\_% | \_\_\_% | \_\_\_%  |
| `hooks/useSkillEditor.ts`                    | \_\_\_% | \_\_\_% | \_\_\_%  |
| `hooks/useFileTree.ts`                       | \_\_\_% | \_\_\_% | \_\_\_%  |
| `hooks/useUnsavedWarning.ts`                 | \_\_\_% | \_\_\_% | \_\_\_%  |
| `index.tsx`                                  | \_\_\_% | \_\_\_% | \_\_\_%  |
| **合計**                                     | \_\_\_% | \_\_\_% | \_\_\_%  |

4. 結果を `outputs/phase-7/coverage-report.md` に記録する

**期待される成果物**:

- `docs/30-workflows/skill-editor-view/outputs/phase-7/coverage-report.md`（計測結果テーブル）

### タスク 2: 基準充足判定

**目的**: カバレッジ計測結果が最低基準を充足しているか判定する。

**実行手順**:

1. 全体カバレッジの判定:

| 指標              | 最低基準 | 計測結果 | 判定  |
| ----------------- | -------- | -------- | ----- |
| Line Coverage     | 80%      | \_\_\_%  | ✅/❌ |
| Branch Coverage   | 60%      | \_\_\_%  | ✅/❌ |
| Function Coverage | 80%      | \_\_\_%  | ✅/❌ |

2. 判定ロジック:
   - **全指標が最低基準以上**: → Phase 8 へ進む
   - **1 つ以上の指標が最低基準未満**: → Phase 6 へ戻り、以下を実施する
     1. 未カバー行・ブランチ・関数を特定する
     2. 該当箇所のテストケースを追加する
     3. カバレッジを再測定する
     4. 再測定後も未達の場合は、未カバー箇所の理由を分析する（到達不能コード、外部依存等）

3. P41 対策: v8 カバレッジプロバイダでインライン arrow function が独立関数としてカウントされる場合:
   - 該当箇所を特定する
   - テストからコールバックの戻り値を明示的に検証する
   - 到達不能な場合はその理由を `coverage-report.md` に記録する

4. 判定結果を `outputs/phase-7/coverage-report.md` に追記する

**期待される成果物**:

- `docs/30-workflows/skill-editor-view/outputs/phase-7/coverage-report.md`（判定結果追記）

### タスク 3: カバレッジレポート最終作成

**目的**: Phase 7 の最終成果物としてカバレッジレポートを完成させる。

**実行手順**:

1. `outputs/phase-7/coverage-report.md` に以下のセクションを記載する:
   - カバレッジサマリーテーブル（全体 + ファイルごと）
   - 基準充足判定結果（✅ / ❌）
   - 未カバー箇所の分析（未達の場合のみ）
   - 推奨基準との差分（Line 90%, Branch 70%, Function 90% との比較）
   - Phase 6 へのフィードバック（追加テストが必要な場合の指示）
2. テストケース数の最終集計:
   - Phase 4: 64 ケース
   - Phase 6: 30 ケース
   - 合計: 94 ケース
3. 全テストが PASS していることを最終確認する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/views/SkillEditorView/
   ```

**期待される成果物**:

- `docs/30-workflows/skill-editor-view/outputs/phase-7/coverage-report.md`（最終版）

## 参照資料

| 参照資料                   | パス                                                                               | 内容                      |
| -------------------------- | ---------------------------------------------------------------------------------- | ------------------------- |
| Phase 5 実装サマリー       | `docs/30-workflows/skill-editor-view/outputs/phase-5/implementation-summary.md`    | 依存Phase成果物の整合確認 |
| Phase 6 カバレッジレポート | `docs/30-workflows/skill-editor-view/outputs/phase-6/coverage-report.md`           | Phase 6 時点のカバレッジ  |
| 品質要件（正本）           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`        | カバレッジ必須基準        |
| コンポーネント試験ガイド   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`  | テスト観点の確認          |
| アクセシビリティ試験ガイド | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`       | WCAG 試験観点             |
| 抽出マトリクス             | `docs/30-workflows/skill-editor-view/aiworkflow-requirements-extraction-matrix.md` | 抽出漏れガード            |
| テストカバレッジ基準       | `.claude/skills/task-specification-creator/references/coverage-standards.md`       | 最低/推奨基準             |
| P41 対策                   | `.claude/rules/06-known-pitfalls.md`                                               | v8 インライン関数カウント |

## aiworkflow-requirements 抽出確認

以下のコマンドで、品質・テスト要件の抽出結果を再現可能にする。

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "quality-requirements" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "testing-component-patterns" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "testing-accessibility" -C 2
```

## 成果物

| 成果物             | パス                                                                     | 説明                   |
| ------------------ | ------------------------------------------------------------------------ | ---------------------- |
| カバレッジレポート | `docs/30-workflows/skill-editor-view/outputs/phase-7/coverage-report.md` | 最終カバレッジレポート |

## 統合テスト連携【必須】

| 検証項目                   | 内容                                         | 確認方法                             |
| -------------------------- | -------------------------------------------- | ------------------------------------ |
| 全テスト PASS              | Phase 4 + Phase 6 の全 94 テストが PASS      | `pnpm vitest run` の結果確認         |
| Line Coverage 基準充足     | 全体 Line Coverage >= 80%                    | カバレッジレポートの Line 値確認     |
| Branch Coverage 基準充足   | 全体 Branch Coverage >= 60%                  | カバレッジレポートの Branch 値確認   |
| Function Coverage 基準充足 | 全体 Function Coverage >= 80%                | カバレッジレポートの Function 値確認 |
| P41 対策完了               | インライン関数のカバレッジ低下箇所を特定済み | coverage-report.md に記録済み        |

## 完了条件

- [ ] カバレッジ計測コマンドを実行し、結果を記録している
- [ ] 全体 Line Coverage が 80% 以上である
- [ ] 全体 Branch Coverage が 60% 以上である
- [ ] 全体 Function Coverage が 80% 以上である
- [ ] ファイルごとのカバレッジ詳細が記録されている
- [ ] 推奨基準（Line 90%, Branch 70%, Function 90%）との差分が記録されている
- [ ] 全 94 テストケースが PASS している
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が完成している
- [ ] 基準未達の場合は Phase 6 へ戻る判定が記録されている
- [ ] P41 対策（インライン関数カウント）の確認が完了している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## Phase 末端アクション【必須】

1. 全完了条件のチェックボックスを確認する
2. `outputs/phase-7/coverage-report.md` にカバレッジレポートを完成させる
3. 基準充足判定の結果に応じて次のアクションを決定する:
   - 全基準充足: Phase 8 へ進む
   - 1 つ以上未達: Phase 6 へ戻る

## 依存関係

| 方向 | Phase / タスク              | 内容                           |
| ---- | --------------------------- | ------------------------------ |
| 入力 | Phase 6（テスト拡充）       | 追加テスト 30 ケース           |
| 出力 | Phase 8（リファクタリング） | カバレッジ基準充足確認後に開始 |
| 戻り | Phase 6（テスト拡充）       | 基準未達時に追加テスト作成     |

## 次の Phase

- **全基準充足の場合**: Phase 8（リファクタリング）へ進む
- **基準未達の場合**: Phase 6（テスト拡充）へ戻り、未カバー箇所のテストを追加する
