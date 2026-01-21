# Phase 4: テスト作成（TDD: Red）- タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成                    |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-18                    |
| 機能名     | fr011-file-type-icons         |

---

## 目的

期待されるファイルタイプアイコン表示を検証するテストを先に作成し、Red状態を確認する。

## 背景

設計レビューが完了したため、実装に先立ち期待動作をテストとして明文化する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストシナリオ設計

**目的**: 受け入れ基準からテストケースを導出する

**実行手順**:

1. Phase 1の受け入れ基準を確認
2. 拡張子ごとの表示シナリオを整理
3. `outputs/phase-4/test-specification.md` に記載

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### タスク2: ユニットテスト作成

**目的**: FileTypeIconとFileTreeItemの表示テストを作成する

**実行手順**:

1. `FileTreeItem.test.tsx` に拡張子別の表示テストを追加
2. `SelectableFileTreeItem.test.tsx` に拡張子別の表示テストを追加
3. Red状態の確認手順を `outputs/phase-4/test-cases.md` に記載

**期待される成果物**:

- `outputs/phase-4/test-cases.md`
- `apps/desktop/src/renderer/components/molecules/FileTreeItem/FileTreeItem.test.tsx`
- `apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/SelectableFileTreeItem.test.tsx`

---

### タスク3: 統合テスト設計

**目的**: ファイルツリー全体での表示を検証する

**実行手順**:

1. WorkspaceSidebarとFileSelectorModalの表示シナリオを整理
2. 統合テスト観点を `outputs/phase-4/integration-test-design.md` に記載

**期待される成果物**:

- `outputs/phase-4/integration-test-design.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                       | 内容                                    |
| ------------------------ | -------------------------------------------------------------------------- | --------------------------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | ファイルツリー表示とWorkspaceモード仕様 |
| パネル・セレクターUI/UX  | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`        | アイコンサイズ規則                      |
| UI/UXデザインシステム    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | 色設計と視認性基準                      |

### Phase 1 成果物

| 参照資料     | パス                                         | 内容         |
| ------------ | -------------------------------------------- | ------------ |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 表示要件     |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否判定基準 |

### Phase 2 成果物

| 参照資料               | パス                                     | 内容         |
| ---------------------- | ---------------------------------------- | ------------ |
| アイコンマッピング設計 | `outputs/phase-2/icon-mapping-design.md` | 拡張子対応表 |
| 統合設計               | `outputs/phase-2/architecture-design.md` | 組み込み設計 |

### Phase 3 成果物

| 参照資料         | パス                                      | 内容     |
| ---------------- | ----------------------------------------- | -------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | 判定結果 |

---

## 成果物

| 成果物         | パス                                                                                                   | 内容           |
| -------------- | ------------------------------------------------------------------------------------------------------ | -------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`                                                                | テスト設計     |
| テストケース   | `outputs/phase-4/test-cases.md`                                                                        | ケース一覧     |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md`                                                           | 統合テスト計画 |
| テストファイル | `apps/desktop/src/renderer/components/molecules/FileTreeItem/FileTreeItem.test.tsx`                    | 表示テスト更新 |
| テストファイル | `apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/SelectableFileTreeItem.test.tsx` | 表示テスト更新 |

---

## 統合テスト連携（Phase 1〜11は必須）

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                         | テストファイル |
| ------------------ | -------------------------------- | -------------- |
| UI接続テスト       | 拡張子別アイコン表示             | `*.test.tsx`   |
| データフローテスト | 展開状態とアイコンの同期         | `*.test.tsx`   |
| エラーハンドリング | 未対応拡張子のフォールバック表示 | `*.test.tsx`   |
| 状態同期テスト     | 選択状態とアイコン表示の同時反映 | `*.test.tsx`   |

---

## 完了条件

- [ ] 受け入れ基準ごとのテストが作成されている
- [ ] 拡張子別の表示テストが作成されている
- [ ] 未対応拡張子のフォールバックテストが作成されている
- [ ] テストが失敗状態（Red）であることを確認できる
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
pnpm --filter @repo/desktop test:run -- FileTreeItem
```

- [ ] テストが失敗することを確認（Red状態）

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/fr011-file-type-icons --phase 4
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

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

- **前提**: Phase 1〜Phase 3の成果物
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fr011-file-type-icons/phase-5-implementation.md`
