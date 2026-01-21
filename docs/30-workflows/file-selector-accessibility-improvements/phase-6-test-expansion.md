# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 6                                        |
| Phase名    | テスト拡充                               |
| 前提Phase  | Phase 5                                  |
| 後続Phase  | Phase 7                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

テストケースを拡充し、アクセシビリティ要件の網羅性を高める。

## 背景

実装が完了したため、エッジケースと回帰防止のテストを追加する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-06-1 テスト拡充

**目的**: フォーカス管理と ARIA 変更の追加テストを実装する。

**実行手順**:

1. Shift+Tab のフォーカス循環テストを追加する。
2. aria-live が external/workspace のいずれか 1 箇所のみで通知されることを検証する。
3. WorkspaceFileSelector の treeitem で aria-selected の状態変化を検証するテストを追加する。
4. FileSelectorTrigger の `aria-expanded` と `aria-controls` の整合性を検証するテストを追加する。

**期待される成果物**:

- apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/FileSelectorTrigger.a11y.test.tsx
- apps/desktop/src/renderer/components/organisms/FileSelectorModal/FileSelectorModal.a11y.test.tsx

---

### タスク1: T-06-2 テスト安定化

**目的**: テストの安定性と可読性を高める。

**実行手順**:

1. React Testing Library の推奨クエリを優先して使用する。
2. テストユーティリティを利用して重複処理を削減する。
3. テストケースの実行結果を記録する。

**期待される成果物**:

- outputs/phase-6/test-expansion-summary.md
- outputs/phase-6/regression-test-log.md

---

## 参照資料

依存Phase成果物:

| 参照資料          | パス                                    | 内容               |
| ----------------- | --------------------------------------- | ------------------ |
| 実装メモ          | outputs/phase-5/implementation-notes.md | Phase 5 の実装内容 |
| a11y 変更サマリー | outputs/phase-5/a11y-change-summary.md  | 変更点の一覧       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス                                                                        | 内容                  |
| -------- | --------------------------------------------------------------------------- | --------------------- |
| 品質要件 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略と RTL 指針 |

---

## 成果物

| 成果物             | パス                                      | 内容             |
| ------------------ | ----------------------------------------- | ---------------- |
| テスト拡充サマリー | outputs/phase-6/test-expansion-summary.md | 追加テストの概要 |
| 回帰テストログ     | outputs/phase-6/regression-test-log.md    | 実行結果の記録   |

---

## 統合テスト連携（Phase 1〜11は必須）

- external/workspace 両モードの選択完了フローの統合テストを追加し、結果を記録する

---

## 完了条件

- [ ] 追加テストが実装されている
- [ ] テスト実行結果が記録されている
- [ ] 既存テストが継続して成功する

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 6
```

---

## 依存関係

- **前提**: Phase 5 が完了していること
- **後続**: Phase 7 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

### 実行タスク

- T-06-1 テスト拡充: {result}
- T-06-2 テスト安定化: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-7-coverage-check.md`
