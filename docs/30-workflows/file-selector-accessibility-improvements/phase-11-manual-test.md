# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 11                                       |
| Phase名    | 手動テスト検証                           |
| 前提Phase  | Phase 10                                 |
| 後続Phase  | Phase 12                                 |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

手動アクセシビリティテストを実施し、実機環境での操作性を確認する。

## 背景

自動テストだけでは確認できない操作性を検証するため、手動テストが必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-11-1 手動テスト実行

**目的**: キーボード操作とスクリーンリーダーの動作を確認する。

**実行手順**:

1. VoiceOver と NVDA を用いた読み上げ確認を実施する。
2. Tab と Shift+Tab によるフォーカス循環を確認する。
3. モーダルの開閉とフォーカス復帰を確認する。
4. WorkspaceFileSelector のツリーで Enter/Space/Arrow による操作が期待通り動作することを確認する。
5. external/workspace でファイル選択数の読み上げが一度だけ発火することを確認する。

**期待される成果物**:

- outputs/phase-11/manual-test-result.md

---

### タスク1: T-11-2 結果記録と課題整理

**目的**: 手動テスト結果と課題を記録する。

**実行手順**:

1. テスト結果をテンプレート形式で記載する。
2. 発見課題を一覧化する。
3. 重要度と対応方針を記録する。

**期待される成果物**:

- outputs/phase-11/discovered-issues.md

---

## 参照資料

依存Phase成果物:

| 参照資料             | パス                                      | 内容                 |
| -------------------- | ----------------------------------------- | -------------------- |
| 受け入れ基準         | outputs/phase-1/acceptance-criteria.md    | Phase 1 の基準       |
| アクセシビリティ設計 | outputs/phase-2/accessibility-design.md   | Phase 2 の設計       |
| 実装メモ             | outputs/phase-5/implementation-notes.md   | Phase 5 の実装内容   |
| テスト拡充サマリー   | outputs/phase-6/test-expansion-summary.md | Phase 6 の追加テスト |
| カバレッジ報告       | outputs/phase-7/coverage-report.md        | Phase 7 のカバレッジ |
| リファクタ記録       | outputs/phase-8/refactor-notes.md         | Phase 8 の変更       |
| 品質報告             | outputs/phase-9/quality-report.md         | Phase 9 の結果       |
| 最終レビュー報告     | outputs/phase-10/final-review-report.md   | Phase 10 の判定      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                    | 内容                           |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` | フォーカス管理とキーボード操作 |

---

## 成果物

| 成果物         | パス                                   | 内容         |
| -------------- | -------------------------------------- | ------------ |
| 手動テスト結果 | outputs/phase-11/manual-test-result.md | テスト記録   |
| 発見課題       | outputs/phase-11/discovered-issues.md  | 発見課題一覧 |

---

## テスト結果レポート形式

手動テスト結果は以下の形式で `outputs/phase-11/manual-test-result.md` に記録する。

```markdown
## テストカテゴリ別結果

### 機能テスト（正常系）

| TC-ID  | 機能     | 期待結果         | 結果 | 備考 |
| ------ | -------- | ---------------- | ---- | ---- |
| TC-001 | {機能名} | {期待される動作} | PASS |      |

### エラーハンドリングテスト（異常系）

| TC-ID  | 状況       | 期待結果           | 結果 | 備考 |
| ------ | ---------- | ------------------ | ---- | ---- |
| TC-101 | {異常状況} | {期待されるエラー} | PASS |      |

### アクセシビリティテスト

| TC-ID  | 要件                     | 結果 | WCAG違反 |
| ------ | ------------------------ | ---- | -------- |
| TC-201 | キーボードナビゲーション | PASS | なし     |

### 統合テスト連携

| テスト項目 | 結果 | 課題有無 |
| ---------- | ---- | -------- |
| IPC接続    | PASS | なし     |
```

---

## 統合テスト連携（Phase 1〜11は必須）

- 手動統合テストの結果を手動テスト結果に記載する

---

## 完了条件

- [ ] 手動テスト結果が記録されている
- [ ] 発見課題が整理されている
- [ ] 重要度と対応方針が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 11
```

---

## 依存関係

- **前提**: Phase 10 が完了していること
- **後続**: Phase 12 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 11 実行記録

### 実行タスク

- T-11-1 手動テスト実行: {result}
- T-11-2 結果記録と課題整理: {result}

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

`phase-12-documentation.md`
