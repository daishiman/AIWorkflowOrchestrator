# 機能追加パターン アーキテクチャ設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 機能追加パターン

### 新機能追加の手順

新しいワークフロー機能を追加する場合の手順を以下に示す。

**ステップ1: フォルダ作成**

- apps/web/src/features/に新しい機能名のフォルダを作成する
- フォルダ名はケバブケース（例: youtube-summarize）を使用する

**ステップ2: スキーマ定義**

- schema.ts ファイルに入出力スキーマを定義する
- Zodを使用して型安全なバリデーションを実装する
- 入力フィールドと出力フィールドを明確に分離する

**ステップ3: Executor実装**

- executor.ts ファイルに IWorkflowExecutor インターフェースを実装する
- type プロパティにワークフロー識別子を設定する
- execute メソッドで入力バリデーション、処理、出力バリデーションを行う

**ステップ4: テスト作成**

- executor.test.ts ファイルにユニットテストを作成する
- 正常系、異常系、境界値のテストケースを網羅する

**ステップ5: Registry登録**

- features/registry.ts にエグゼキューターを登録する
- ワークフロータイプとエグゼキューターのマッピングを追加する

**ステップ6: API Route作成（必要な場合）**

- apps/web/src/app/api/v1/に対応するルートを作成する

### 機能構成のベストプラクティス

**必須ファイル**:

| ファイル         | 役割                      |
| ---------------- | ------------------------- |
| schema.ts        | 入出力スキーマ定義（Zod） |
| executor.ts      | ビジネスロジック実装      |
| executor.test.ts | ユニットテスト            |

**オプションファイル**:

| ファイル/フォルダ | 用途                       |
| ----------------- | -------------------------- |
| api.ts            | 機能固有のAPIハンドラー    |
| hooks/            | 機能固有のReact Hooks      |
| components/       | 機能固有のUIコンポーネント |

### この構造の利点

| 利点                 | 説明                                              |
| -------------------- | ------------------------------------------------- |
| 変更の局所化         | 機能追加は新規フォルダ作成のみで完結              |
| 削除の容易性         | フォルダごと削除すれば機能を除去可能              |
| 影響範囲の限定       | 機能間の独立性により他機能への影響ゼロ            |
| テストの同居         | 実装とテストが同じ場所にあり管理しやすい          |
| 共通インフラの再利用 | AIクライアント等は shared/infrastructure から取得 |

---

## Zustand Sliceパターン（Desktop）

### 概要

デスクトップアプリ（Electron）では、Zustandを使用した状態管理を採用。
機能単位でSliceを分離し、型安全性と保守性を確保する。

**実装場所**: `apps/desktop/src/renderer/store/slices/`

### Sliceの基本構造

各SliceはStateCreator型を使用して定義し、状態とアクションを分離する。

**必須ファイル構成**:

| ファイル             | 役割                        |
| -------------------- | --------------------------- |
| `{name}Slice.ts`     | Slice定義（状態+アクション）|
| `__tests__/{name}Slice.test.ts` | ユニットテスト    |

**Slice定義パターン**:

| 要素             | 説明                       |
| ---------------- | -------------------------- |
| `{Name}State`    | 状態のインターフェース     |
| `{Name}Actions`  | アクションのインターフェース |
| `{Name}Slice`    | State + Actions の統合型   |
| `initial{Name}State` | 初期状態オブジェクト   |
| `create{Name}Slice` | StateCreator関数        |

### 既存Slice一覧

| Slice名      | 責務                       | 実装ファイル                    |
| ------------ | -------------------------- | ------------------------------- |
| `uiSlice`    | UI状態（currentView等）    | `store/slices/uiSlice.ts`       |
| `authSlice`  | 認証状態                   | `store/slices/authSlice.ts`     |
| `chatSlice`  | チャット状態               | `store/slices/chatSlice.ts`     |
| `agentSlice` | エージェント・スキル管理   | `store/slices/agentSlice.ts`    |

### agentSlice詳細

**状態定義**:

| プロパティ         | 型                      | 説明               |
| ------------------ | ----------------------- | ------------------ |
| `skills`           | `Skill[]`               | スキル一覧         |
| `selectedSkill`    | `Skill \| null`         | 選択中のスキル     |
| `skillFilter`      | `string`                | フィルター文字列   |
| `skillCategory`    | `string \| null`        | カテゴリフィルター |
| `executionStatus`  | `AgentExecutionStatus`  | 実行状態           |
| `currentExecutionId` | `string \| null`      | 実行ID             |
| `executionOutput`  | `string[]`              | 実行出力           |
| `isLoading`        | `boolean`               | ローディング状態   |
| `error`            | `string \| null`        | エラーメッセージ   |

**アクション定義**:

| アクション           | 引数                     | 説明               |
| -------------------- | ------------------------ | ------------------ |
| `setSkills`          | `skills: Skill[]`        | スキル一覧設定     |
| `selectSkill`        | `skill: Skill \| null`   | スキル選択         |
| `setSkillFilter`     | `filter: string`         | フィルター設定     |
| `setSkillCategory`   | `category: string \| null` | カテゴリ設定     |
| `setExecutionStatus` | `status: AgentExecutionStatus` | 実行状態設定 |
| `appendOutput`       | `output: string`         | 出力追加           |
| `clearExecution`     | -                        | 実行クリア         |
| `resetAgentState`    | -                        | 状態リセット       |

### 新規Slice追加手順

**ステップ1: Slice定義**

- `store/slices/{name}Slice.ts` を作成
- State、Actions、Slice インターフェースを定義
- initialStateとcreateSlice関数を実装

**ステップ2: Store統合**

- `store/index.ts` でSliceをimport
- createStoreのcombine関数にSliceを追加

**ステップ3: View追加（必要な場合）**

- `views/{Name}View/index.tsx` を作成
- `App.tsx` のrenderView関数にcaseを追加
- `components/AppDock/index.tsx` のnavItemsに追加

**ステップ4: テスト作成**

- `store/slices/__tests__/{name}Slice.test.ts` を作成
- 全アクションのテストを実装

---
