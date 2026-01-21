# Phase 5: 実装（TDD: Green）- タスク仕様書

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 5                     |
| Phase名    | 実装                  |
| 前提Phase  | Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充） |
| ステータス | 未実施                |
| 作成日     | 2026-01-18            |
| 機能名     | fr011-file-type-icons |

---

## 目的

テストを通すための最小限の実装を行い、ファイルタイプアイコンを表示する。

## 背景

テストで定義した期待動作を満たすため、最小限の実装を行う必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Iconコンポーネント拡張

**目的**: 必要なLucide IconsをIconNameに追加する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/Icon/index.tsx` を更新
2. 追加するアイコンをIconNameとiconMapに追加
3. 追加したアイコン名を設計ドキュメントと一致させる

**期待される成果物**:

- `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`

---

### タスク2: アイコンマッピング実装

**目的**: 拡張子とアイコンの対応表を実装する

**実行手順**:

1. `apps/desktop/src/renderer/utils/fileTypeIconMap.ts` を追加
2. 拡張子ごとのアイコン名と色クラスを定義
3. 未対応拡張子のフォールバック定義を追加

**期待される成果物**:

- `apps/desktop/src/renderer/utils/fileTypeIconMap.ts`

---

### タスク3: FileTypeIconコンポーネント実装

**目的**: ファイルタイプ表示の共通コンポーネントを実装する

**実行手順**:

1. `apps/desktop/src/renderer/components/atoms/FileTypeIcon/index.tsx` を追加
2. ファイル名から拡張子を抽出しマッピングを参照
3. フォルダの展開状態に応じたアイコン切り替えを実装

**期待される成果物**:

- `apps/desktop/src/renderer/components/atoms/FileTypeIcon/index.tsx`

---

### タスク4: 既存コンポーネント統合

**目的**: FileTreeItemとSelectableFileTreeItemにアイコン表示を統合する

**実行手順**:

1. `FileTreeItem` のアイコン表示を `FileTypeIcon` に置換
2. `SelectableFileTreeItem` のアイコン表示を `FileTypeIcon` に置換
3. 既存の選択状態と展開状態を維持

**期待される成果物**:

- `apps/desktop/src/renderer/components/molecules/FileTreeItem/index.tsx`
- `apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/SelectableFileTreeItem.tsx`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                       | 内容                           |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------ |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | ファイルツリーUIの構成         |
| パネル・セレクターUI/UX  | `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`        | アイコンライブラリとサイズ規則 |
| UI/UXデザインシステム    | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md` | 色設計と視認性基準             |
| ディレクトリ構造         | `.claude/skills/aiworkflow-requirements/references/directory-structure.md` | 実装パスの基準                 |

### Phase 4 成果物

| 参照資料       | パス                                         | 内容           |
| -------------- | -------------------------------------------- | -------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`      | テスト設計     |
| テストケース   | `outputs/phase-4/test-cases.md`              | テスト一覧     |
| 統合テスト設計 | `outputs/phase-4/integration-test-design.md` | 統合テスト計画 |

---

## 成果物

| 成果物                     | パス                                                                                              | 内容                       |
| -------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------- |
| Icon拡張                   | `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`                                       | アイコン定義の追加         |
| マッピング                 | `apps/desktop/src/renderer/utils/fileTypeIconMap.ts`                                              | 拡張子対応表               |
| FileTypeIcon               | `apps/desktop/src/renderer/components/atoms/FileTypeIcon/index.tsx`                               | 共通アイコンコンポーネント |
| FileTreeItem更新           | `apps/desktop/src/renderer/components/molecules/FileTreeItem/index.tsx`                           | アイコン表示更新           |
| SelectableFileTreeItem更新 | `apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/SelectableFileTreeItem.tsx` | アイコン表示更新           |

---

## 統合テスト連携（Phase 1〜11は必須）

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                   |
| ------------------ | -------------------------------------- |
| API接続            | UI内完結のため該当なし                 |
| エラーハンドリング | 未対応拡張子のフォールバック表示を実装 |
| 状態同期           | 展開状態と選択状態を維持               |

---

## 完了条件

- [ ] 追加アイコンがIconコンポーネントに登録されている
- [ ] FileTypeIconが拡張子とフォルダ状態に応じて表示できる
- [ ] FileTreeItemとSelectableFileTreeItemでアイコン表示が更新されている
- [ ] テストが成功状態（Green）である
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
pnpm --filter @repo/desktop test:run -- FileTreeItem
```

- [ ] テストが成功することを確認（Green状態）

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/fr011-file-type-icons --phase 5
```

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

| タスク  | 結果        | 備考 |
| ------- | ----------- | ---- |
| タスク1 | 完了/未完了 |      |
| タスク2 | 完了/未完了 |      |
| タスク3 | 完了/未完了 |      |
| タスク4 | 完了/未完了 |      |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

## 依存関係

- **前提**: Phase 4の成果物
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/fr011-file-type-icons/phase-6-test-expansion.md`
