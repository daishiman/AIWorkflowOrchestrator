# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 1                      |
| Phase名    | 要件定義               |
| 前提Phase  | なし                   |
| 後続Phase  | Phase 2（設計）        |
| ステータス | 未実施                 |
| 作成日     | 2026-01-24             |
| 機能名     | workspace-chat-edit-ui |

---

## 目的

workspace-chat-edit-ui機能のUIコンポーネント6種類について、機能要件と非機能要件を明確に定義する。

## 背景

chatEditSlice、useFileContext、useDiffApply等のコアロジックが実装完了しており、
これらを活用するUIコンポーネントの要件を詳細に定義する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件の定義

**目的**: 各コンポーネントの機能要件を詳細に定義する

**実行手順**:

1. 既存実装（useFileContext, useDiffApply, chatEditSlice）の型定義を確認
2. 各コンポーネントのPropsインターフェースを設計
3. 各コンポーネントの振る舞い（ユーザーアクション→状態変化）を定義
4. ユースケースシナリオを作成

**期待される成果物**:

- `outputs/phase-1/functional-requirements.md`

---

### タスク2: 非機能要件の定義

**目的**: アクセシビリティ、パフォーマンス、セキュリティ要件を定義する

**実行手順**:

1. WCAG 2.1 AA準拠要件を確認（aria属性、キーボード操作）
2. パフォーマンス要件を定義（レンダリング時間、メモリ使用量）
3. セキュリティ要件を確認（XSS防止等）
4. レスポンシブ対応要件を定義

**期待される成果物**:

- `outputs/phase-1/non-functional-requirements.md`

---

### タスク3: コンポーネント間連携要件の定義

**目的**: useFileContext、useDiffApplyとの連携要件を明確化する

**実行手順**:

1. useFileContextからUIコンポーネントへのデータフローを図示
2. useDiffApplyからDiffPreview/ApplyControlsへのデータフローを図示
3. イベントハンドリング（追加/削除/適用/却下）のフローを定義
4. エラーハンドリングフローを定義

**期待される成果物**:

- `outputs/phase-1/integration-requirements.md`

---

## 参照資料

| 参照資料            | パス                                                                             | 内容                                     |
| ------------------- | -------------------------------------------------------------------------------- | ---------------------------------------- |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`          | コンポーネント設計原則、アクセシビリティ |
| 品質要件            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`      | テストカバレッジ目標                     |
| 既存types定義       | `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts`          | FileContext, EditCommand等               |
| useFileContext      | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useFileContext.ts` | ファイルコンテキスト管理                 |
| useDiffApply        | `apps/desktop/src/renderer/features/workspace-chat-edit/hooks/useDiffApply.ts`   | 差分計算・適用                           |

---

## 成果物

| 成果物                 | パス                                             | 内容                       |
| ---------------------- | ------------------------------------------------ | -------------------------- |
| 機能要件ドキュメント   | `outputs/phase-1/functional-requirements.md`     | 各コンポーネントの機能要件 |
| 非機能要件ドキュメント | `outputs/phase-1/non-functional-requirements.md` | アクセシビリティ、性能要件 |
| 統合要件ドキュメント   | `outputs/phase-1/integration-requirements.md`    | Hooks連携、データフロー    |

---

## 統合テスト連携（Phase 1〜11は必須）

useFileContext, useDiffApply連携要件を明記する。

具体的なアクション:

- [ ] useFileContextが提供するfileContexts, isDragging, errorの利用方法を文書化
- [ ] useDiffApplyが提供するcurrentResult, isDiffPreviewOpenの利用方法を文書化
- [ ] コンポーネントから呼び出すアクション（addFileContext, removeFileContext等）を列挙

---

## 完了条件

- [ ] 6種類のUIコンポーネントの機能要件が定義されている
- [ ] WCAG 2.1 AA準拠要件が明記されている
- [ ] useFileContext、useDiffApplyとのデータフローが図示されている
- [ ] エラーハンドリング要件が定義されている
- [ ] ユースケースシナリオが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（コアロジック実装済み）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/workspace-chat-edit-ui/phase-2-design.md`
