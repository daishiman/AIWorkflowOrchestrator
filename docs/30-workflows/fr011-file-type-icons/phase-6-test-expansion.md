# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 6                               |
| Phase名    | テスト拡充                      |
| 前提Phase  | Phase 5（実装）                 |
| 後続Phase  | Phase 7（テストカバレッジ確認） |
| ステータス | 未実施                          |
| 作成日     | 2026-01-18                      |
| 機能名     | fr011-file-type-icons           |

---

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 背景

Phase 5の実装に対して、カバレッジ目標を満たすための追加テストが必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ分析

**目的**: テスト未到達領域を特定する

**実行手順**:

1. カバレッジ計測を実行
2. 未到達の分岐と拡張子パスを抽出
3. `outputs/phase-6/coverage-report.md` に記載

**期待される成果物**:

- `outputs/phase-6/coverage-report.md`

---

### タスク2: 追加テスト作成

**目的**: 未到達領域を補うテストを追加する

**実行手順**:

1. 追加拡張子の表示テストを追加
2. フォルダ展開アイコンの切り替えテストを追加
3. 未対応拡張子のフォールバックテストを追加

**期待される成果物**:

- `apps/desktop/src/renderer/components/molecules/FileTreeItem/FileTreeItem.test.tsx`
- `apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/SelectableFileTreeItem.test.tsx`

---

### タスク3: 統合テスト拡充

**目的**: ワークスペース画面とファイルセレクターの統合確認を追加する

**実行手順**:

1. WorkspaceSidebarの表示ケースを追加
2. FileSelectorModalの表示ケースを追加
3. `outputs/phase-6/integration-test.md` に記載

**期待される成果物**:

- `outputs/phase-6/integration-test.md`

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標                         | 目標 |
| ---------------------------- | ---- |
| APIエンドポイント            | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ               | 100% |
| 異常系シナリオ               | 80%+ |
| 外部連携ポイント             | 100% |

## 実行手順

### 1. カバレッジ測定

```bash
pnpm test:coverage
```

### 2. ギャップ分析

- 未到達の行/分岐/関数を特定
- 統合テスト不足領域を特定

### 3. 追加テスト作成

- ユニット/統合/E2Eの不足分を追加
- フロント・バックエンド接続経路を優先

### 4. 統合テスト再実行

```bash
pnpm test:integration
pnpm test:e2e
```

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                       | 内容                 |
| ------------------------ | -------------------------------------------------------------------------- | -------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | ファイルツリーUI構成 |
| パネル・セレクターUI/UX  | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`        | アイコンサイズ規則   |
| UI/UXデザインシステム    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | 色設計と視認性基準   |

### Phase 5 成果物

| 参照資料     | パス                                    | 内容               |
| ------------ | --------------------------------------- | ------------------ |
| Phase 5 実装 | `apps/desktop/src/renderer/components/` | アイコン表示の実装 |

---

## 成果物

| 成果物             | パス                                    | 内容               |
| ------------------ | --------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`    | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`   | 統合テスト実行結果 |
| 追加テスト         | `apps/desktop/src/renderer/components/` | 追加テストコード   |

---

## 統合テスト連携（Phase 1〜11は必須）

| テストカテゴリ     | 検証項目                         | 目標 |
| ------------------ | -------------------------------- | ---- |
| UI接続テスト       | 拡張子別アイコン表示             | 100% |
| データフローテスト | 展開状態とアイコンの同期         | 100% |
| エラーハンドリング | 未対応拡張子のフォールバック     | 100% |
| 状態同期テスト     | 選択状態とアイコン表示の同時反映 | 100% |

---

## 完了条件

- [ ] カバレッジレポートが出力されている
- [ ] 追加テストが作成されている
- [ ] 統合テスト結果が記録されている
- [ ] ユニットテストカバレッジ基準を達成している
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/fr011-file-type-icons --phase 6
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 6 実行記録

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

- **前提**: Phase 5（実装）の成果物
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fr011-file-type-icons/phase-7-coverage-check.md`
