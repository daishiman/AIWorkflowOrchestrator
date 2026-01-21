# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| 前提Phase  | Phase 11（手動テスト検証） |
| 後続Phase  | Phase 13（PR作成）         |
| ステータス | 未実施                     |
| 作成日     | 2026-01-18                 |
| 機能名     | fr011-file-type-icons      |

---

## 目的

実装内容をドキュメントに反映し、未タスクを検出して記録する。

## 背景

実装が完了したため、ドキュメント更新と未タスク検出を実施する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成

**目的**: 実装内容を2パート構成で記述する

**実行手順**:

1. `assets/implementation-guide-template.md` を参照
2. `outputs/phase-12/implementation-guide.md` を作成
3. Part 1に概念的説明を記載
4. Part 2に技術的詳細（FileTypeIcon、マッピング、アイコン追加）を記載

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

---

### タスク2: システムドキュメント更新

**目的**: 仕様書の更新が必要か判断し反映する

**実行手順**:

1. `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を確認
2. 更新が必要な場合は `docs/00-requirements/` の該当仕様を更新
3. `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` にファイルタイプアイコン表示の説明を追加
4. 更新時はタスク完了ステータスセクションを追加し、変更履歴にバージョンを追記
5. 更新内容を `outputs/phase-12/documentation-update-log.md` に記載

**期待される成果物**:

- `outputs/phase-12/documentation-update-log.md`

---

### タスク3: 未タスク検出

**目的**: レビュー結果やテスト結果から未タスクを記録する

**実行手順**:

1. Phase 3/Phase 10レビュー結果とPhase 11手動テスト結果を確認
2. 各Phase成果物の「TODO/FIXME/将来対応」を確認
3. TODO/FIXME等がある場合は `docs/30-workflows/unassigned-task/` に指示書を作成
4. `node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js --workflow docs/30-workflows/fr011-file-type-icons --sources "apps/,packages/"` を実行
5. `outputs/phase-12/unassigned-task-report.md` に検出結果を記載

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`
- `docs/30-workflows/unassigned-task/*.md`

---

## サブフェーズ

### Phase 12-1: 実装ガイド作成

2パート構成で実装ガイドを作成する。

### Phase 12-2: システムドキュメント更新

aiworkflow-requirements と `docs/00-requirements/` を更新する。

### Phase 12-3: 未タスク検出

レビュー結果、手動テスト結果、コードベースのTODO/FIXMEを確認する。

---

## 未タスク検出レポート形式（0件の場合）

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                       | 内容                   |
| ------------------------ | -------------------------------------------------------------------------- | ---------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | ファイルツリー表示仕様 |
| パネル・セレクターUI/UX  | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`        | アイコン規則           |
| UI/UXデザインシステム    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | 色設計と視認性基準     |

### task-specification-creator 参照

| 参照資料               | パス                                                                                    | 内容               |
| ---------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| 仕様更新判断           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 更新判断フロー     |
| 技術ドキュメント作成   | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | 実装ガイド作成     |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`     | 実装ガイドテンプレ |

### Phase 11 成果物

| 参照資料       | パス                                     | 内容           |
| -------------- | ---------------------------------------- | -------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動テスト結果 |
| 発見課題一覧   | `outputs/phase-11/discovered-issues.md`  | 発見課題       |

### Phase 10 成果物

| 参照資料         | パス                                      | 内容     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |

### Phase 9 成果物

| 参照資料     | パス                                | 内容     |
| ------------ | ----------------------------------- | -------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質結果 |

### Phase 8 成果物

| 参照資料       | パス                              | 内容     |
| -------------- | --------------------------------- | -------- |
| リファクタ記録 | `outputs/phase-8/refactor-log.md` | 変更内容 |

### Phase 7 成果物

| 参照資料         | パス                                 | 内容       |
| ---------------- | ------------------------------------ | ---------- |
| カバレッジ再測定 | `outputs/phase-7/coverage-report.md` | 再測定結果 |

### Phase 6 成果物

| 参照資料       | パス                                  | 内容           |
| -------------- | ------------------------------------- | -------------- |
| 統合テスト結果 | `outputs/phase-6/integration-test.md` | 統合テスト結果 |

### Phase 5 成果物

| 参照資料     | パス                                    | 内容       |
| ------------ | --------------------------------------- | ---------- |
| Phase 5 実装 | `apps/desktop/src/renderer/components/` | 実装コード |

### Phase 2 成果物

| 参照資料               | パス                                     | 内容   |
| ---------------------- | ---------------------------------------- | ------ |
| アイコンマッピング設計 | `outputs/phase-2/icon-mapping-design.md` | 対応表 |

### Phase 1 成果物

| 参照資料 | パス                                         | 内容     |
| -------- | -------------------------------------------- | -------- |
| 要件定義 | `outputs/phase-1/requirements-definition.md` | 表示要件 |

---

## 成果物

| 成果物               | パス                                           | 必須 | 内容                   |
| -------------------- | ---------------------------------------------- | ---- | ---------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | ✅   | 概念的説明と技術的詳細 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-update-log.md` | ✅   | 更新履歴               |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | ✅   | 未タスク検出結果       |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`       | 条件 | 検出時のみ作成         |

---

## 完了条件

- [ ] 実装ガイドが作成されている
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 更新が必要な場合、仕様書が更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

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
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/fr011-file-type-icons --phase 12
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 12 実行記録

### 実行タスク

| タスク  | 結果        | 備考 |
| ------- | ----------- | ---- |
| タスク1 | 完了/未完了 |      |
| タスク2 | 完了/未完了 |      |
| タスク3 | 完了/未完了 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 1、Phase 2、Phase 5、Phase 6、Phase 7、Phase 8、Phase 9、Phase 10、Phase 11の成果物
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fr011-file-type-icons/phase-13-pr-creation.md`
