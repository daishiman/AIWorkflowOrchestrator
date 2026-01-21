# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 2                       |
| Phase名    | 設計                    |
| 前提Phase  | Phase 1（要件定義）     |
| 後続Phase  | Phase 3（設計レビュー） |
| ステータス | 未実施                  |
| 作成日     | 2026-01-18              |
| 機能名     | fr011-file-type-icons   |

---

## 目的

要件を実装可能な設計に落とし込み、アイコンマッピングとUI統合ポイントを確定する。

## 背景

Phase 1で整理した要件に基づき、アイコンライブラリ選定、拡張子マッピング、既存コンポーネント統合の設計が必要である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アイコンマッピング設計

**目的**: 拡張子とアイコンの対応を定義する

**実行手順**:

1. Phase 1の要件と対象拡張子一覧を確認
2. Lucide Iconsから使用アイコンを選定
3. 拡張子ごとのアイコン名と色クラスを定義
4. `outputs/phase-2/icon-mapping-design.md` に記載

**期待される成果物**:

- `outputs/phase-2/icon-mapping-design.md`

---

### タスク2: FileTypeIconコンポーネント設計

**目的**: ファイルタイプアイコンの責務とAPIを定義する

**実行手順**:

1. `FileTypeIcon` のProps（fileName, isFolder, expanded, size, className）を定義
2. アイコン表示とaria属性の方針を決定
3. `outputs/phase-2/component-interface.md` に記載

**期待される成果物**:

- `outputs/phase-2/component-interface.md`

---

### タスク3: 統合設計

**目的**: 既存コンポーネントへの組み込み方法を確定する

**実行手順**:

1. `FileTreeItem` と `SelectableFileTreeItem` の現在のアイコン表示箇所を確認
2. `FileTypeIcon` への差し替え箇所を設計
3. 追加で変更が必要なIconコンポーネントの型定義を整理
4. `outputs/phase-2/architecture-design.md` に記載

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                       | 内容                                      |
| ------------------------ | -------------------------------------------------------------------------- | ----------------------------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | ファイルツリーUI構成とWorkspaceモード設計 |
| パネル・セレクターUI/UX  | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`        | アイコンライブラリとサイズ規則            |
| UI/UXデザインシステム    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | 色設計と視認性基準                        |
| ディレクトリ構造         | `.claude/skills/aiworkflow-requirements/references/directory-structure.md` | コンポーネント配置ルール                  |

### Phase 1 成果物

| 参照資料     | パス                                         | 内容                 |
| ------------ | -------------------------------------------- | -------------------- |
| 要件定義     | `outputs/phase-1/requirements-definition.md` | 対応拡張子と表示要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 合否判定基準         |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象と非対象         |

---

## 成果物

| 成果物             | パス                                     | 内容                         |
| ------------------ | ---------------------------------------- | ---------------------------- |
| アイコンマッピング | `outputs/phase-2/icon-mapping-design.md` | 拡張子とアイコン対応表       |
| コンポーネント設計 | `outputs/phase-2/component-interface.md` | FileTypeIconの設計           |
| 統合設計           | `outputs/phase-2/architecture-design.md` | 組み込み箇所と更新対象の整理 |

---

## 統合テスト連携（Phase 1〜11は必須）

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント | 契約定義             |
| ------------ | -------------------- |
| フロント→API | 該当なし（UI内完結） |
| API→DB       | 該当なし             |
| 外部サービス | 該当なし             |

- FileTreeItemとSelectableFileTreeItemの統合ポイントを設計に明記
- 既存の選択状態と展開状態が変化しないことを設計で明確化

---

## 完了条件

- [ ] 拡張子ごとのアイコン対応表が定義されている
- [ ] FileTypeIconのPropsと責務が定義されている
- [ ] 既存コンポーネントの統合箇所が特定されている
- [ ] Iconコンポーネントの型拡張方針が明確になっている
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/fr011-file-type-icons --phase 2
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

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

- **前提**: Phase 1（要件定義）の成果物
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fr011-file-type-icons/phase-3-design-review.md`
