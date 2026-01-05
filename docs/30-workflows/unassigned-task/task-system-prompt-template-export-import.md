# システムプロンプトテンプレートのエクスポート/インポート - タスク実行仕様書

## ユーザーからの元の指示

```
システムプロンプトテンプレートをJSON形式でエクスポート/インポートできるようにし、
バックアップ・復元やデバイス間でのテンプレート共有を可能にする。
```

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-CHAT-SYSPROMPT-EXPORT-001                          |
| Worktreeパス | `.worktrees/task-{{timestamp}}`                         |
| ブランチ名   | `task-{{timestamp}}`                                    |
| タスク名     | システムプロンプトテンプレートのエクスポート/インポート |
| 分類         | 機能拡張                                                |
| 対象機能     | チャット - システムプロンプト設定                       |
| 優先度       | 低                                                      |
| 見積もり規模 | 小規模                                                  |
| ステータス   | 未実施                                                  |
| 作成日       | 2025-12-26                                              |

---

## タスク概要

### 目的

カスタムテンプレートをJSON形式でエクスポート/インポートし、バックアップ・復元やデバイス間での共有を可能にする。

### 背景

**現在の実装**:

- テンプレートは electron-store にローカル保存
- バックアップ・復元機能なし
- デバイス間での共有不可

**問題点**:

- テンプレートを失うリスク
- 新しいデバイスでの再設定が必要
- チーム内での有用なテンプレート共有ができない

**参照 (FR-012)**:

> FR-012: テンプレートをエクスポート/インポートできる（優先度: 将来）

### 最終ゴール

- カスタムテンプレートをJSON形式でエクスポートできる
- JSONファイルからテンプレートをインポートできる
- プリセットテンプレートはエクスポート対象外（設定で切り替え可能）
- インポート時の重複チェック
- データ検証（スキーマ、文字数制限）

### 成果物一覧

| 種別         | 成果物                                  | 配置先                                                               |
| ------------ | --------------------------------------- | -------------------------------------------------------------------- |
| 環境         | Git Worktree環境                        | `.worktrees/task-{{timestamp}}`                                      |
| 実装         | エクスポート機能                        | `apps/desktop/src/renderer/utils/exportTemplates.ts`                 |
| 実装         | インポート機能                          | `apps/desktop/src/renderer/utils/importTemplates.ts`                 |
| 実装         | Slice更新（Export/Import actions）      | `apps/desktop/src/renderer/store/slices/*.ts`                        |
| 実装         | UI更新（エクスポート/インポートボタン） | `apps/desktop/src/renderer/components/molecules/SystemPromptHeader/` |
| テスト       | エクスポート単体テスト                  | `apps/desktop/src/renderer/utils/*.test.ts`                          |
| テスト       | インポート単体テスト                    | `apps/desktop/src/renderer/utils/*.test.ts`                          |
| テスト       | Slice統合テスト                         | `apps/desktop/src/renderer/store/slices/*.test.ts`                   |
| ドキュメント | 要件ドキュメント                        | `docs/30-workflows/system-prompt-export/`                            |
| ドキュメント | 設計ドキュメント                        | `docs/30-workflows/system-prompt-export/`                            |
| PR           | GitHub Pull Request                     | GitHub UI                                                            |

---

## タスク分解サマリー

| ID     | フェーズ | サブタスク名                 | 責務                                      |
| ------ | -------- | ---------------------------- | ----------------------------------------- |
| T--1-1 | Phase -1 | Git Worktree環境作成・初期化 | Git Worktree環境の作成と初期化            |
| T-00-1 | Phase 0  | 機能要件定義                 | エクスポート/インポート機能の要件を明文化 |
| T-01-1 | Phase 1  | エクスポート/インポート設計  | JSON形式、データ検証、重複チェック設計    |
| T-02-1 | Phase 2  | 設計レビュー                 | 要件・設計の妥当性検証                    |
| T-03-1 | Phase 3  | テスト作成                   | エクスポート/インポートのテスト作成       |
| T-04-1 | Phase 4  | エクスポート/インポート実装  | 機能実装                                  |
| T-04-2 | Phase 4  | Slice・UI統合                | actions追加、ボタン配置                   |
| T-05-1 | Phase 5  | リファクタリング             | コード品質改善                            |
| T-06-1 | Phase 6  | 品質保証                     | テスト・lint・ビルド                      |
| T-07-1 | Phase 7  | 最終レビュー                 | 全体検証                                  |
| T-08-1 | Phase 8  | 手動テスト                   | エクスポート→インポート動作確認           |
| T-09-1 | Phase 9  | ドキュメント更新             | UI/UXガイドライン更新                     |
| T-10-1 | Phase 10 | コミット・PR作成             | 差分確認・PR作成                          |

**総サブタスク数**: 13個

---

## 設計概要

### JSON形式

```json
{
  "version": "1.0",
  "exportedAt": "2025-12-26T12:00:00.000Z",
  "templates": [
    {
      "name": "マイテンプレート1",
      "content": "あなたは...",
      "createdAt": "2025-12-25T00:00:00.000Z",
      "updatedAt": "2025-12-26T00:00:00.000Z"
    }
  ]
}
```

### エクスポート関数

```typescript
// apps/desktop/src/renderer/utils/exportTemplates.ts
export async function exportTemplates(
  templates: PromptTemplate[],
  includePresets = false,
): Promise<void> {
  const customTemplates = includePresets
    ? templates
    : templates.filter((t) => !t.isPreset);

  const exportData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    templates: customTemplates.map((t) => ({
      name: t.name,
      content: t.content,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
  };

  // Electron dialog.showSaveDialog でファイル保存
  const json = JSON.stringify(exportData, null, 2);
  await window.electronAPI.fs.writeFile(filePath, json);
}
```

### インポート関数

```typescript
// apps/desktop/src/renderer/utils/importTemplates.ts
export async function importTemplates(
  filePath: string,
): Promise<PromptTemplate[]> {
  // 1. ファイル読み込み
  const json = await window.electronAPI.fs.readFile(filePath);

  // 2. JSONパース
  const data = JSON.parse(json);

  // 3. スキーマ検証
  const schema = z.object({
    version: z.string(),
    templates: z.array(
      z.object({
        name: z.string().max(50),
        content: z.string().max(4000),
      }),
    ),
  });
  schema.parse(data);

  // 4. PromptTemplate型に変換
  return data.templates.map((t) => ({
    id: crypto.randomUUID(),
    name: t.name,
    content: t.content,
    isPreset: false,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  }));
}
```

---

## リスクと対策

| リスク           | 影響度 | 対策                               |
| ---------------- | ------ | ---------------------------------- |
| 不正なJSON形式   | 中     | Zodスキーマ検証、エラーメッセージ  |
| 重複テンプレート | 低     | インポート時に重複チェック         |
| バージョン非互換 | 低     | version フィールドでバージョン管理 |

---

## 完了条件チェックリスト

- [ ] カスタムテンプレートをJSONエクスポートできる
- [ ] JSONファイルからテンプレートをインポートできる
- [ ] インポート時にスキーマ検証が実行される
- [ ] 重複テンプレート名の場合は上書き確認が表示される
- [ ] テストカバレッジ 80%以上

---

## 更新履歴

| 日付       | 版  | 変更内容 | 作成者 |
| ---------- | --- | -------- | ------ |
| 2025-12-26 | 1.0 | 初版作成 | Claude |
