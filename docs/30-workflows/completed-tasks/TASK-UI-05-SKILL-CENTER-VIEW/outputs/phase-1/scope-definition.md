# スコープ定義: TASK-UI-05-SKILL-CENTER-VIEW

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| タスクID | TASK-UI-05-SKILL-CENTER-VIEW |
| Phase    | 1                            |
| 作成日   | 2026-03-01                   |

---

## 実装範囲

### SkillCenterView コンポーネント群

| コンポーネント              | 種別     | 説明                                          |
| --------------------------- | -------- | --------------------------------------------- |
| `SkillCenterView/index.tsx` | View     | メインレイアウト（ページコンポーネント）      |
| `FeaturedSection.tsx`       | Organism | おすすめセクション（最大3枚）                 |
| `FeaturedCard.tsx`          | Molecule | おすすめ用大カード（h=160px）                 |
| `SkillCard.tsx`             | Molecule | カードグリッド内のツールカード（h>=120px）    |
| `AddButton.tsx`             | Atom     | 「追加する」->「追加済み!」モーフィングボタン |
| `CategoryTabs.tsx`          | Molecule | 横スクロール可能カテゴリタブ                  |
| `SkillDetailPanel.tsx`      | Organism | スライドイン / ボトムシート詳細パネル         |
| `SkillCapabilities.tsx`     | Molecule | 「このツールでできること」箇条書き            |
| `SkillPermissions.tsx`      | Molecule | 「AIにできること」バッジ表示                  |
| `SkillMarkdownCollapse.tsx` | Molecule | 「詳しい説明を見る」折りたたみ                |
| `SkillDangerZone.tsx`       | Molecule | 「このツールを削除」+「フォーク」ボタン       |
| `SkillImportSection.tsx`    | Molecule | 追加トリガー（既存SkillImportDialog連携）     |
| `SkillEmptyState.tsx`       | Molecule | ゼロステート表示                              |

### サブダイアログ（task-9 UI移管）

| コンポーネント           | 移管元  | 説明                                     |
| ------------------------ | ------- | ---------------------------------------- |
| `ForkSkillDialog.tsx`    | TASK-9E | スキルフォークダイアログ                 |
| `ImportSkillDialog拡張`  | TASK-9F | 4ソースタブ追加（GitHub/Gist/URL/Local） |
| `ExportSkillDialog.tsx`  | TASK-9F | エクスポートダイアログ                   |
| `GenerateDocsDialog.tsx` | TASK-9I | ドキュメント自動生成ダイアログ           |
| `DocPreview.tsx`         | TASK-9I | ドキュメントプレビュー                   |

### カスタムフック

| フック                 | 説明                                  |
| ---------------------- | ------------------------------------- |
| `useSkillCenter.ts`    | フィルタリング・検索・選択ロジック    |
| `useFeaturedSkills.ts` | おすすめスキル選定ロジック（useMemo） |

### テストファイル

| テストファイル              | テスト対象               |
| --------------------------- | ------------------------ |
| `SkillCenterView.test.tsx`  | 統合テスト（全体フロー） |
| `FeaturedSection.test.tsx`  | おすすめセクション       |
| `SkillCard.test.tsx`        | ツールカード             |
| `AddButton.test.tsx`        | 追加ボタンモーフィング   |
| `CategoryTabs.test.tsx`     | カテゴリタブ             |
| `SkillDetailPanel.test.tsx` | 詳細パネル               |
| `useSkillCenter.test.ts`    | フック（検索・フィルタ） |
| `useFeaturedSkills.test.ts` | フック（おすすめ選定）   |

### ファイルパス構成

```
apps/desktop/src/renderer/
├── views/SkillCenterView/
│   ├── index.tsx
│   ├── components/
│   │   ├── FeaturedSection/
│   │   │   ├── FeaturedSection.tsx
│   │   │   └── FeaturedCard.tsx
│   │   ├── SkillCard.tsx
│   │   ├── AddButton.tsx
│   │   ├── CategoryTabs.tsx
│   │   ├── SkillDetailPanel/
│   │   │   ├── SkillDetailPanel.tsx
│   │   │   ├── SkillCapabilities.tsx
│   │   │   ├── SkillPermissions.tsx
│   │   │   ├── SkillMarkdownCollapse.tsx
│   │   │   └── SkillDangerZone.tsx
│   │   ├── SkillImportSection.tsx
│   │   └── SkillEmptyState.tsx
│   ├── hooks/
│   │   ├── useSkillCenter.ts
│   │   └── useFeaturedSkills.ts
│   └── __tests__/
│       ├── SkillCenterView.test.tsx
│       ├── FeaturedSection.test.tsx
│       ├── SkillCard.test.tsx
│       ├── AddButton.test.tsx
│       ├── CategoryTabs.test.tsx
│       ├── SkillDetailPanel.test.tsx
│       ├── useSkillCenter.test.ts
│       └── useFeaturedSkills.test.ts
└── store/slices/
    └── (agentSlice を既存利用、新規スライス不要)
```

---

## 非実装範囲

### AgentView 変更なし

- AgentView のソースコード（`views/AgentView/`）には一切変更を加えない
- AgentView はスキル「選択・実行」に専念し、SkillCenterView とは責務が明確に分離される
- 同じ `agentSlice` のデータを参照するため、データ整合性は自動的に保たれる

### Main Process 変更なし

- Main Process（`apps/desktop/src/main/`）のコードには変更を加えない
- 既存の SkillService をそのまま利用する
- IPC ハンドラの追加・修正は行わない

### 新規IPCチャネル追加なし

- 本タスクでは新規IPCチャネルを追加しない
- 既存チャネル（`skill:list`, `skill:import`, `skill:remove`, `skill:get-detail`, `skill:readFile`）をそのまま利用する
- TASK-9F/9E/9I で追加されるチャネルは各タスクが提供し、本タスクでは利用のみ行う

### 新規Zustandスライス追加なし

- 新規スライスは作成しない
- 既存の `agentSlice` を個別セレクタ経由で利用する（P31対策）
- 画面固有の状態はコンポーネントローカル（`useState`）で管理する

### データベーススキーマ変更なし

- DB スキーマの変更は不要（`database-schema.md` で非適用を確認済み）

---

## 前提条件

### 既存 agentSlice

- `agentSlice` に以下の状態・アクションが存在すること:
  - `skills`, `availableSkillsMetadata`, `importedSkills`, `isLoadingSkills`
  - `skillFilter`, `skillCategory`, `isImportDialogOpen`
  - `fetchSkills()`, `importSkill()`, `removeSkill()`, `selectSkillByName()`
  - `setSkillFilter()`, `setSkillCategory()`
- 個別セレクタ（`useImportedSkills()`, `useSkillFilter()` 等）が提供されていること（P31対策）

### 既存IPC

- 以下のIPCチャネルが正常に動作すること:
  - `skill:list`: ツール一覧取得
  - `skill:import`: ツール追加（skillName: string を直接渡す、P44解決済み）
  - `skill:remove`: ツール削除（skillName: string を直接渡す、P44/P45解決済み）
  - `skill:get-detail`: ツール詳細取得
  - `skill:readFile`: SKILL.md取得
- P42準拠の3段バリデーション（型チェック -> 空文字列 -> トリム空文字列）がMain側で実施済みであること

### TASK-UI-00 共通コンポーネント

- 以下の共通コンポーネントが TASK-UI-00 で実装済みであること:
  - **Atoms**: Badge, Button, EmptyState
  - **Molecules**: SearchBar, TabSwitcher
  - **Organisms**: SlideInPanel, CardGrid, SkillImportDialog, CodeViewer
- デザイントークン（CSS変数）が定義済みであること:
  - `--color-accent`, `--shadow-md`, `--status-primary`, `--status-success`, `--status-success-subtle`
  - `--status-warning-subtle`, `--status-info-subtle`

---

## 依存タスク

| タスクID             | 内容                               | 本タスクでの利用                                                                                        | 依存種別       |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------- |
| TASK-UI-00           | デザイン基盤（共通コンポーネント） | SearchBar, CardGrid, TabSwitcher, SlideInPanel, Badge, Button, EmptyState, CodeViewer, デザイントークン | 必須前提       |
| TASK-UI-00-ATOMS     | Atomsコンポーネント                | Badge, Button, EmptyState                                                                               | 必須前提       |
| TASK-UI-00-MOLECULES | Moleculesコンポーネント            | SearchBar, TabSwitcher                                                                                  | 必須前提       |
| TASK-UI-00-ORGANISMS | Organismsコンポーネント            | SkillImportDialog, SlideInPanel                                                                         | 必須前提       |
| TASK-UI-01           | UIアーキテクチャ                   | Zustandスライス設計原則、ルーティング                                                                   | 必須前提       |
| TASK-UI-02           | ナビゲーションコア                 | サイドバーナビゲーション、ビュー切替                                                                    | 必須前提       |
| TASK-9E              | スキルフォーク機能                 | `skill:fork` チャネル（ForkSkillDialog用）                                                              | サブダイアログ |
| TASK-9F              | スキル共有・インポート機能         | `skill:importFromSource`, `skill:validateSource`, `skill:export` チャネル                               | サブダイアログ |
| TASK-9I              | スキルドキュメント生成             | `skill:docs:generate`, `skill:docs:export` チャネル                                                     | サブダイアログ |

---

## リスクと対策

### P31: Zustand Store Hooks 無限ループ

| 項目     | 内容                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| リスク   | agentSlice の合成Store Hook（`useAgentStore()`）の戻り値関数を`useEffect`依存配列に含めると無限ループが発生する               |
| 影響度   | 高（画面が無限ループでフリーズする）                                                                                          |
| 対策     | 全ての agentSlice 利用箇所で個別セレクタ（`useImportedSkills()`, `useSkillFilter()` 等）を使用する。合成Store Hook は使用禁止 |
| 検証方法 | コードレビューで `useAgentStore()` の使用がないことを確認                                                                     |

### P39: happy-dom 環境での userEvent 非互換

| 項目     | 内容                                                                                                                                  |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| リスク   | `@testing-library/user-event` が happy-dom 環境で Symbol 操作エラーを発生させる                                                       |
| 影響度   | 高（大量のテストが一斉に失敗する）                                                                                                    |
| 対策     | テストでは `fireEvent` のみ使用する。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む。`userEvent` は使用禁止 |
| 検証方法 | テストコード内に `userEvent` の import が存在しないことを確認                                                                         |

### P40: テスト実行ディレクトリ依存（モノレポ）

| 項目     | 内容                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| リスク   | プロジェクトルートからテストを実行すると `vitest.config.ts` の設定が読み込まれず `document is not defined` エラーが発生する |
| 影響度   | 高（全テストが失敗する）                                                                                                    |
| 対策     | テスト実行は必ず `cd apps/desktop && pnpm vitest run` または `pnpm --filter @repo/desktop exec vitest run` で実行する       |
| 検証方法 | CI/CD パイプラインでの実行コマンドを確認                                                                                    |

### P44: skill:import/remove IPC ハンドラとPreloadのインターフェース不整合

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| リスク     | IPC ハンドラの引数形式が Preload 側と異なり、バリデーションエラーが発生する                          |
| 影響度     | 高（追加/削除が動作しない）                                                                          |
| ステータス | **解決済み** -- `skill:import` / `skill:remove` は `string`（skillName）を直接渡すパターンに統一済み |
| 確認事項   | 本タスクでは既に解決済みのパターンをそのまま利用する。IPCチャネルの引数変更は行わない                |

### P45: IPC 引数命名の契約ドリフト（skillId vs skillName）

| 項目       | 内容                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| リスク     | 引数名が `skillId` と `skillName` で混在し、コードの可読性と保守性が低下する          |
| 影響度     | 中（命名の不整合が将来の実装ミスを誘発する）                                          |
| ステータス | **解決済み** -- 全レイヤーで `skillName` に統一済み                                   |
| 確認事項   | 本タスクの実装では `skillName` を一貫して使用する。`skillId` を引数名として使用しない |

### P47: CSS変数ベースのスタイルテストアサーション戦略

| 項目   | 内容                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------- |
| リスク | デザイントークン（CSS変数）をTailwind arbitrary valuesで使用した場合、テストのアサーションが煩雑になる                    |
| 影響度 | 低（テストの可読性の問題であり、機能には影響なし）                                                                        |
| 対策   | `variantStyles` を `Record<Variant, string>` 型でモジュールスコープに抽出し、テスト側も定数を import して期待値を生成する |

### 追加リスク: TASK-9F/9E/9I チャネルの未実装

| 項目   | 内容                                                                                                                                                                 |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | サブダイアログが依存する IPC チャネル（`skill:fork`, `skill:importFromSource` 等）が未実装の場合、サブダイアログ機能が動作しない                                     |
| 影響度 | 中（サブダイアログは FR-9 で優先度「中〜低」のため、基本機能には影響なし）                                                                                           |
| 対策   | サブダイアログのIPCチャネルが未実装の場合、ボタンを disabled 表示し「準備中」のツールチップを表示する。基本機能（FR-1〜FR-8）は TASK-9F/9E/9I に依存しない設計とする |

---

## 非スコープの明示的除外事項

以下の項目は本タスクのスコープ外であり、実装しない:

1. **AgentView の変更**: AgentView は一切変更しない（NFR-14 準拠）
2. **新規IPCチャネルの追加**: Main Process に新規ハンドラを追加しない
3. **新規Zustandスライスの作成**: 既存 agentSlice を利用する
4. **DBスキーマの変更**: データベース変更は不要
5. **Preload 層の変更**: 既存の contextBridge API をそのまま利用する
6. **認証・セキュリティ機能の変更**: 既存のセキュリティ機構をそのまま利用する
7. **バックエンドAPI・サーバーサイド処理の追加**: Renderer 層のみの実装
