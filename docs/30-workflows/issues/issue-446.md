# [#446] "[UNASSIGNED-SYSPROMPT-001] システムプロンプトフロントエンドUI実装"

## メタ情報

```yaml
task_id: UNASSIGNED-SYSPROMPT-001
task_name: システムプロンプトフロントエンドUI実装
category: 機能拡張
target_feature: チャット - システムプロンプト設定
priority: **高**
scale: **大規模**
status: 未実施
source_phase: TASK-CHAT-SYSPROMPT-DB-001 Phase 12
created_date: 2026-01-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-system-prompt-frontend-ui.md
```

| 項目       | 内容       |
| ---------- | ---------- |
| 優先度     | **高**     |
| 規模       | **大規模** |
| ステータス | 未実施     |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

システムプロンプトのDB永続化機能（TASK-CHAT-SYSPROMPT-DB-001）が完了し、以下が実装済みです：

- **Repository層**: `SystemPromptRepository`（Drizzle ORM + Turso）
- **IPC Handler層**: `systemPromptHandlers`（Main Process）
- **State管理**: `systemPromptSlice`（Zustand）
- **テスト**: 213件（カバレッジ84%+）

しかし、ユーザーがこれらの機能を利用するための**ReactコンポーネントUI**が未実装です。

### 問題点・課題

| 問題                   | 影響                                       |
| ---------------------- | ------------------------------------------ |
| UIコンポーネント未実装 | ユーザーがテンプレートを操作できない       |
| バックエンド機能未活用 | 実装済みRepository/IPC Handlerが使われない |
| ユーザー体験の欠如     | DB永続化の価値をユーザーに提供できない     |

### 放置した場合の影響

- DB永続化機能が使われず、開発リソースが無駄になる
- ユーザーはテンプレート管理機能を利用できない
- 複数デバイス間の同期メリットを享受できない

---

## 2. 何を達成するか（What）

### 目的

Zustand Store経由でIPC Handlerを呼び出すReactコンポーネントを実装し、ユーザーがテンプレートをCRUD操作できるUIを提供する。

### 最終ゴール

| ゴール               | 詳細                                     |
| -------------------- | ---------------------------------------- |
| テンプレート一覧表示 | ユーザーの全テンプレートを一覧表示       |
| テンプレート作成     | 名前・コンテンツを入力して新規作成       |
| テンプレート編集     | 既存テンプレートの名前・コンテンツを編集 |
| テンプレート削除     | 確認ダイアログ後に削除                   |
| プリセット選択       | システム提供プリセットを選択・適用       |
| テンプレート適用     | 選択したテンプレートをチャットに適用     |

### スコープ

**含むもの**:

- テンプレート一覧コンポーネント
- 作成・編集フォームコンポーネント
- 削除確認ダイアログ
- プリセットセレクター
- Zustand Store統合（既存のsystemPromptSlice使用）
- エラーハンドリングUI（トースト通知）

**含まないもの**:

- エクスポート/インポート機能（別タスク: task-system-prompt-template-export-import.md）
- 高度な検索・フィルタリング機能
- テンプレートのカテゴリ分類

### 成果物一覧

| 種別         | 成果物                        | 配置先                                               |
| ------------ | ----------------------------- | ---------------------------------------------------- |
| 実装         | TemplateList コンポーネント   | `apps/desktop/src/renderer/components/organisms/`    |
| 実装         | TemplateForm コンポーネント   | `apps/desktop/src/renderer/components/molecules/`    |
| 実装         | TemplateCard コンポーネント   | `apps/desktop/src/renderer/components/molecules/`    |
| 実装         | PresetSelector コンポーネント | `apps/desktop/src/renderer/components/molecules/`    |
| 実装         | useSystemPrompt Hook          | `apps/desktop/src/renderer/hooks/`                   |
| テスト       | コンポーネントテスト          | `apps/desktop/src/renderer/components/**/*.test.tsx` |
| テスト       | Hook テスト                   | `apps/desktop/src/renderer/hooks/*.test.ts`          |
| ドキュメント | UI/UXガイドライン更新         | `.claude/skills/aiworkflow-requirements/references/` |

---

## 3. どのように実行するか（How）

### 前提条件

| 条件                   | 状態   |
| ---------------------- | ------ |
| SystemPromptRepository | ✅完了 |
| IPC Handlers           | ✅完了 |
| systemPromptSlice      | ✅完了 |
| IPC Bridge             | ✅完了 |

### 依存タスク

- なし（バックエンドは実装済み）

### 必要な知識・スキル

| スキル                | レベル |
| --------------------- | ------ |
| React                 | 中級   |
| Zustand               | 中級   |
| TypeScript            | 中級   |
| Tailwind CSS          | 基礎   |
| React Testing Library | 中級   |

### 推奨アプローチ

1. **既存UI仕様の確認**: `ui-ux-system-prompt.md` を参照
2. **useSystemPrompt Hook作成**: Zustand Storeとの連携
3. **コンポーネント実装**: Atomic Design原則に従う
4. **テスト作成**: 各コンポーネントのユニットテスト

---

## 4. 実行手順

### Phase構成

| Phase | 内容               | 見積もり |
| ----- | ------------------ | -------- |
| 1     | 要件確認・設計     | 小       |
| 2     | Hook実装           | 小       |
| 3     | コンポーネント実装 | 中       |
| 4     | テスト作成         | 中       |
| 5     | 統合・動作確認     | 小       |

### Phase 1: 要件確認・設計

**入力**: `ui-ux-system-prompt.md`, `interfaces-system-prompt.md`

**作業**:

1. 既存UI仕様を確認
2. コンポーネント構成を設計
3. 状態管理フローを設計

**出力**: 設計ドキュメント

### Phase 2: Hook実装

**作業**:

1. `useSystemPrompt` Hook作成
2. Zustand Store連携
3. IPC呼び出しラッパー

```typescript
// apps/desktop/src/renderer/hooks/useSystemPrompt.ts
export function useSystemPrompt() {
  const {
    templates,
    presets,
    selectedTemplateId,
    isLoading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
  } = useSystemPromptStore();

  return {
    templates,
    presets,
    selectedTemplateId,
    isLoading,
    error,
    actions: {
      fetchTemplates,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      selectTemplate,
    },
  };
}
```

### Phase 3: コンポーネント実装

**TemplateList**:

```typescript
// apps/desktop/src/renderer/components/organisms/TemplateList/TemplateList.tsx
export function TemplateList() {
  const { templates, presets, actions } = useSystemPrompt();

  return (
    <div className="template-list">
      <section className="presets">
        <h3>プリセット</h3>
        {presets.map(preset => (
          <TemplateCard key={preset.id} template={preset} onSelect={actions.selectTemplate} />
        ))}
      </section>
      <section className="custom">
        <h3>カスタムテンプレート</h3>
        {templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={actions.selectTemplate}
            onEdit={/* ... */}
            onDelete={actions.deleteTemplate}
          />
        ))}
      </section>
    </div>
  );
}
```

### Phase 4: テスト作成

**テスト対象**:

- Hook: `useSystemPrompt.test.ts`
- TemplateList: `TemplateList.test.tsx`
- TemplateForm: `TemplateForm.test.tsx`
- TemplateCard: `TemplateCard.test.tsx`

### Phase 5: 統合・動作確認

**確認項目**:

- テンプレートCRUD操作
- プリセット選択
- エラーハンドリング
- ローディング状態

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] テンプレート一覧が表示される
- [ ] 新規テンプレートを作成できる
- [ ] 既存テンプレートを編集できる
- [ ] テンプレートを削除できる（確認ダイアログあり）
- [ ] プリセットを選択・適用できる
- [ ] 選択したテンプレートをチャットに適用できる

### 品質要件

- [ ] テストカバレッジ 80%以上
- [ ] ESLintエラー 0件
- [ ] TypeScriptエラー 0件
- [ ] アクセシビリティ基準（WCAG 2.1 AA）

### ドキュメント要件

- [ ] UI/UXガイドライン更新
- [ ] コンポーネントドキュメント作成

---

## 6. 検証方法

### テストケース

| ID   | テストケース         | 期待結果                         |
| ---- | -------------------- | -------------------------------- |
| TC01 | 一覧表示             | テンプレート・プリセット一覧表示 |
| TC02 | 新規作成             | テンプレート作成、一覧に追加     |
| TC03 | 編集                 | テンプレート更新、一覧に反映     |
| TC04 | 削除                 | 確認後削除、一覧から削除         |
| TC05 | プリセット選択       | プリセット適用                   |
| TC06 | バリデーションエラー | エラーメッセージ表示             |
| TC07 | ネットワークエラー   | エラートースト表示               |

---

## 7. リスクと対策

| リスク               | 影響度 | 対策                       |
| -------------------- | ------ | -------------------------- |
| 既存UIとの整合性     | 中     | ui-ux-system-prompt.md参照 |
| パフォーマンス問題   | 低     | 仮想スクロール検討         |
| アクセシビリティ不足 | 中     | WCAG 2.1 AAチェック        |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                            |
| -------------------- | ------------------------------------------------------------------------------- |
| UI/UX仕様            | `.claude/skills/aiworkflow-requirements/references/ui-ux-system-prompt.md`      |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-system-prompt.md` |
| 実装ガイド           | `docs/30-workflows/system-prompt-db/outputs/phase-12/implementation-guide.md`   |

### 実装済みコード

| ファイル                      | 内容          |
| ----------------------------- | ------------- |
| `systemPromptSlice.ts`        | Zustand Store |
| `systemPromptHandlers.ts`     | IPC Handlers  |
| `system-prompt-repository.ts` | Repository    |

---

## 9. 備考

### DB永続化タスクからの引き継ぎ

- Repository/IPC Handler/Sliceは全て実装・テスト済み
- フロントエンドUIのみが残タスク
- 既存のsystemPromptSliceをそのまま使用可能

---

## 更新履歴

| 日付       | 版  | 変更内容                   | 作成者 |
| ---------- | --- | -------------------------- | ------ |
| 2026-01-22 | 1.0 | 初版作成（Phase 12で検出） | Claude |
