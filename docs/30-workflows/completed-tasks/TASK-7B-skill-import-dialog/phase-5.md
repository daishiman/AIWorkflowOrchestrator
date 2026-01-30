# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 5                           |
| 機能名 | TASK-7B-skill-import-dialog |
| 作成日 | 2026-01-30                  |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う（Green状態）。

## 実行タスク

- SkillImportDialog 実装: メインダイアログコンポーネントの実装
- Section 実装: セクション見出し＋コンテンツの内部コンポーネント実装
- ResourceList 実装: サブリソース一覧の内部コンポーネント実装
- index.ts更新: エクスポートの追加

## 参照資料

| 資料名             | パス                                                                              | 説明          |
| ------------------ | --------------------------------------------------------------------------------- | ------------- |
| コンポーネント設計 | `outputs/phase-2/component-design.md`                                             | Phase 2成果物 |
| テスト仕様書       | `outputs/phase-4/test-specification.md`                                           | Phase 4成果物 |
| テストファイル     | `apps/desktop/src/renderer/components/skill/__tests__/SkillImportDialog.test.tsx` | Phase 4成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                         | 内容              |
| ----------------------- | ---------------------------------------------------------------------------- | ----------------- |
| UI/UXコンポーネント概要 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | Atomic Design原則 |
| UI/UXフォーム設計       | `.claude/skills/aiworkflow-requirements/references/ui-ux-forms.md`           | ダイアログUI設計  |
| 状態管理仕様            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | Zustandパターン   |

## 実行手順

### ステップ1: SkillImportDialog 実装

#### ファイル作成

`apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`

#### 実装内容

1. **Props受け取り**
   - `skill: SkillMetadata` - 表示するスキルのメタデータ
   - `isOpen: boolean` - ダイアログの開閉状態
   - `onClose: () => void` - ダイアログを閉じるコールバック

2. **Store連携**
   - `useAppStore()`から`importSkill`, `isImporting`, `importingSkillName`を取得
   - `isCurrentlyImporting`を`isImporting && importingSkillName === skill.name`で算出

3. **handleImport関数**
   - `await importSkill(skill.name)`でインポート実行
   - 完了後に`onClose()`を呼び出し

4. **ESCキーハンドラー**
   - `useEffect`で`keydown`イベントリスナーを登録
   - ESCキー押下時に`onClose()`を呼び出し
   - インポート中の場合はESCを無視

5. **フォーカストラップ**
   - `useRef`でダイアログコンテナを参照
   - `useEffect`でフォーカス可能な要素を取得
   - Tab/Shift+Tabでフォーカスを循環

6. **レンダリング構造**
   - `isOpen`がfalseの場合は`null`を返す
   - オーバーレイ → ダイアログコンテナ → ヘッダー/コンテンツ/フッター
   - 各セクションは`skill.{property}.length > 0`の条件で表示

### ステップ2: Section 実装

同一ファイル内に定義:

```typescript
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mb-4">
    <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
    <div className="pl-2 border-l-2 border-gray-200">{children}</div>
  </div>
);
```

### ステップ3: ResourceList 実装

同一ファイル内に定義:

```typescript
const ResourceList: React.FC<{ resources: SkillSubResource[] }> = ({
  resources,
}) => (
  <ul className="space-y-1">
    {resources.map((resource) => (
      <li key={resource.relativePath} className="flex items-start gap-2 text-sm">
        <span className="text-gray-400">•</span>
        <div>
          <span className="font-mono text-gray-700">{resource.filename}</span>
          {resource.description && (
            <span className="text-gray-500"> - {resource.description}</span>
          )}
        </div>
      </li>
    ))}
  </ul>
);
```

### ステップ4: index.ts 更新

`apps/desktop/src/renderer/components/skill/index.ts`にエクスポートを追加:

```typescript
export { SkillImportDialog } from "./SkillImportDialog";
```

## 統合テスト連携【必須】

フロント連携の実装とテスト支援コード整備:

| 実装項目           | 内容                                                              |
| ------------------ | ----------------------------------------------------------------- |
| Store連携          | useAppStore()からimportSkill/isImporting/importingSkillNameを取得 |
| 型連携             | SkillMetadata/SkillSubResourceを@repo/sharedからインポート        |
| エラーハンドリング | importSkill失敗時はconsole.error + ダイアログを開いたまま維持     |
| 状態同期           | isImporting状態変化による即時UI反映                               |

## アーキテクチャ層別実装（Electronデスクトップアプリ観点）

| 層               | 実装観点                            | 実装ファイル配置                              | 仕様参照先   |
| ---------------- | ----------------------------------- | --------------------------------------------- | ------------ |
| Renderer Process | UIコンポーネント、Zustand連携、A11y | `apps/desktop/src/renderer/components/skill/` | `ui-ux-*.md` |

## 成果物

| 成果物            | パス                                                               | 説明                 |
| ----------------- | ------------------------------------------------------------------ | -------------------- |
| SkillImportDialog | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx` | メインコンポーネント |
| 更新済みindex.ts  | `apps/desktop/src/renderer/components/skill/index.ts`              | エクスポート追加     |

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] SkillImportDialogが実装されている
- [ ] Sectionコンポーネントが実装されている
- [ ] ResourceListコンポーネントが実装されている
- [ ] useAppStoreからの状態取得が動作する
- [ ] ESCキーハンドラーが動作する
- [ ] フォーカストラップが動作する
- [ ] index.tsにエクスポートが追加されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. SkillImportDialogの実装
3. Sectionコンポーネントの実装
4. ResourceListコンポーネントの実装
5. index.tsの更新
6. テスト実行とGreen確認
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-7B-skill-import-dialog --phase 5
```

## 次のPhase

Phase 6: テスト拡充
