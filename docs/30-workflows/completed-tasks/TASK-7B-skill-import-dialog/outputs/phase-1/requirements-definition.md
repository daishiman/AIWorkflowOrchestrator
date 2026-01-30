# 要件定義書: SkillImportDialog コンポーネント

## メタ情報

| 項目       | 値                |
| ---------- | ----------------- |
| タスクID   | TASK-7B           |
| 機能名     | SkillImportDialog |
| Phase      | 1 - 要件定義      |
| 作成日     | 2026-01-30        |
| ステータス | 完了              |

## 目的

SkillImportDialogは、スキルのメタデータ（名前、説明、許可ツール、サブリソース一覧）をユーザーに表示し、インポート前の確認を行うダイアログコンポーネントである。ユーザーはスキルの構成内容を確認した上で、インポートの実行またはキャンセルを選択できる。

## 機能要件（FR: Functional Requirements）

| FR-ID | 要件                                                | 優先度 | 説明                                                                                                    |
| ----- | --------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| FR-01 | ダイアログを `isOpen` プロパティで開閉制御できる    | 高     | `isOpen=true` でダイアログを表示、`isOpen=false` で非表示（DOMに存在しない）                            |
| FR-02 | スキル名と説明を表示する                            | 高     | `SkillMetadata.name` と `SkillMetadata.description` をダイアログ内に表示                                |
| FR-03 | 許可ツール一覧をタグ形式で表示する                  | 高     | `SkillMetadata.allowedTools` の各ツールを `<span>` タグとして表示                                       |
| FR-04 | agents/ 一覧をファイル名・説明付きで表示する        | 中     | `SkillMetadata.agents` の各 `SkillSubResource` を filename + description で一覧表示                     |
| FR-05 | references/ 一覧をファイル名・説明付きで表示する    | 中     | `SkillMetadata.references` の各 `SkillSubResource` を filename + description で一覧表示                 |
| FR-06 | scripts/ 一覧をファイル名・説明付きで表示する       | 中     | `SkillMetadata.scripts` の各 `SkillSubResource` を filename + description で一覧表示                    |
| FR-07 | assets/ 一覧をファイル名・説明付きで表示する        | 低     | `SkillMetadata.assets` の各 `SkillSubResource` を filename + description で一覧表示                     |
| FR-08 | schemas/ 一覧をファイル名・説明付きで表示する       | 低     | `SkillMetadata.schemas` の各 `SkillSubResource` を filename + description で一覧表示                    |
| FR-09 | indexes/ 一覧をファイル名・説明付きで表示する       | 低     | `SkillMetadata.indexes` の各 `SkillSubResource` を filename + description で一覧表示                    |
| FR-10 | インポートボタンクリックで `importSkill` を実行する | 高     | ボタンクリック時に `useAppStore().importSkill(skill.name)` を呼び出す                                   |
| FR-11 | インポート中はローディング状態を表示する            | 高     | `isImporting=true && importingSkillName===skill.name` の場合、ボタンテキストを「インポート中...」に変更 |
| FR-12 | キャンセルボタンでダイアログを閉じる                | 高     | キャンセルボタンクリック時に `onClose` コールバックを呼び出す                                           |
| FR-13 | ESCキーでダイアログを閉じる                         | 中     | ダイアログ表示中に Escape キーを押下すると `onClose` コールバックを呼び出す                             |
| FR-14 | インポート完了後に自動でダイアログを閉じる          | 中     | `importSkill` の Promise 解決後に `onClose` を呼び出す                                                  |
| FR-15 | サブリソースが0件の場合はセクションを非表示にする   | 中     | 各サブリソース配列（agents, references 等）の `length === 0` のセクションはレンダリングしない           |

## 非機能要件（NFR: Non-Functional Requirements）

| NFR-ID | 要件                                            | 優先度 | カテゴリ         | 説明                                                                          |
| ------ | ----------------------------------------------- | ------ | ---------------- | ----------------------------------------------------------------------------- |
| NFR-01 | `role="dialog"`, `aria-modal="true"` を設定する | 高     | アクセシビリティ | ダイアログのルート要素に WAI-ARIA のダイアログロールとモーダル属性を付与      |
| NFR-02 | `aria-labelledby` でタイトルと関連付ける        | 高     | アクセシビリティ | ダイアログのタイトル要素の `id` を `aria-labelledby` で参照する               |
| NFR-03 | フォーカストラップを実装する                    | 高     | アクセシビリティ | ダイアログ表示中はフォーカスがダイアログ内に閉じ込められる                    |
| NFR-04 | Tab/Shift+Tab でフォーカス移動できる            | 高     | アクセシビリティ | Tab キーで次のフォーカス可能要素へ、Shift+Tab で前の要素へ移動する            |
| NFR-05 | インポート中はボタンを `disabled` にする        | 中     | ユーザビリティ   | `isCurrentlyImporting` が `true` の間、インポート・キャンセル両ボタンを無効化 |
| NFR-06 | ダイアログオーバーレイでスクロールを抑制する    | 中     | ユーザビリティ   | ダイアログ表示中は背景コンテンツのスクロールを防止する                        |
| NFR-07 | コンテンツが多い場合にスクロール可能にする      | 中     | ユーザビリティ   | ダイアログ内コンテンツ領域に `overflow-y: auto` を設定し、最大高さを制限      |
| NFR-08 | TypeScript 型安全性を維持する                   | 高     | コード品質       | `any` 型を使用せず、`SkillMetadata`/`SkillSubResource` 等の厳密な型定義を使用 |

## 接続要件

### 状態管理（Zustand）

| 接続先               | アクセス方法                       | 説明                                                   |
| -------------------- | ---------------------------------- | ------------------------------------------------------ |
| `importSkill`        | `useAppStore().importSkill`        | スキルインポートアクション（`skillName` を引数に取る） |
| `isImporting`        | `useAppStore().isImporting`        | インポート処理中フラグ（`boolean`）                    |
| `importingSkillName` | `useAppStore().importingSkillName` | 現在インポート中のスキル名（`string \| null`）         |

### 型連携

| 型名               | パッケージ     | 用途                                          |
| ------------------ | -------------- | --------------------------------------------- |
| `SkillMetadata`    | `@repo/shared` | ダイアログに表示するスキルメタデータ（Props） |
| `SkillSubResource` | `@repo/shared` | サブリソース（agents, references 等）の型     |

### データフロー

```
SkillSelector（スキル選択）
  ↓ skill: SkillMetadata, isOpen, onClose
SkillImportDialog（メタデータ表示・確認）
  ↓ importSkill(skillName)
SkillSlice（Zustand状態管理）
  ↓ window.electronAPI.skill.import(skillName)
IPC通信
  ↓
Mainプロセス（実際のインポート処理）
```

## アーキテクチャ層別要件

| 層                         | 確認観点                                                          | 本タスクとの関連         |
| -------------------------- | ----------------------------------------------------------------- | ------------------------ |
| フロントエンド（Renderer） | Reactコンポーネント設計、Zustand連携、アクセシビリティ            | 直接関係あり（実装対象） |
| バックエンド（Main）       | SkillSlice経由でIPCを呼ぶため、本タスクでは直接関係なし           | 間接的（IPC経由）        |
| IPC通信                    | SkillSliceが内部でIPC呼び出しを行うため、本タスクでは直接関係なし | 間接的                   |
| セキュリティ               | ダイアログ内でユーザー入力なし（表示のみ + ボタン操作）           | 低リスク                 |
| データ                     | 永続化なし（SkillSlice経由でimport処理を委譲）                    | 関係なし                 |

## コンポーネント構成

### Props インターフェース

```typescript
interface SkillImportDialogProps {
  /** 表示するスキルのメタデータ */
  skill: SkillMetadata;
  /** ダイアログの開閉状態 */
  isOpen: boolean;
  /** ダイアログを閉じるコールバック */
  onClose: () => void;
}
```

### サブコンポーネント

| コンポーネント名 | 役割                                          |
| ---------------- | --------------------------------------------- |
| `Section`        | セクション表示（タイトル + 子要素のラッパー） |
| `ResourceList`   | `SkillSubResource[]` をリスト形式で表示       |

## 参照資料

| 資料名           | パス                                                                               |
| ---------------- | ---------------------------------------------------------------------------------- |
| タスク定義       | `docs/30-workflows/skill-import-agent-system/tasks/task-7b-skill-import-dialog.md` |
| UI/UX仕様（4.3） | `docs/30-workflows/skill-import-agent-system/specification.md`                     |
| SkillSlice定義   | `apps/desktop/src/renderer/store/slices/skillSlice.ts`                             |
| SkillMetadata型  | `packages/shared/src/types/skill.ts`                                               |
