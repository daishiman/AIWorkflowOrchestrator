# スコープ定義書

## タスク: UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001

## 変更ファイル一覧

### コード変更（2ファイル）

| ファイル                                               | 変更種別 | 変更内容                                     |
| ------------------------------------------------------ | -------- | -------------------------------------------- |
| `packages/shared/src/types/skillInfoFormValidation.ts` | 新規作成 | バリデーション関数・型・エラーメッセージ定義 |
| `packages/shared/src/types/index.ts`                   | 更新     | 新規バリデーションAPIの再エクスポート追加    |

### テストコード変更（1ファイル）

| ファイル                                                              | 変更種別 | 変更内容                           |
| --------------------------------------------------------------------- | -------- | ---------------------------------- |
| `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | 新規作成 | バリデーション関数のユニットテスト |

### スコープ外（変更しない）

| ファイル                                    | 理由                                             |
| ------------------------------------------- | ------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts` | 型定義変更なし（SkillInfoFormData は変更対象外） |
| `packages/shared/index.ts`                  | 既存の `export * from "./types"` に追随するため  |
| `apps/desktop/src/renderer/` 配下           | UIコンポーネントは後続 Wave で対応               |
| IPC ハンドラ                                | 本タスクのスコープ外                             |

## 文字数制限の確定値

| フィールド  | 制限種別   | 値      |
| ----------- | ---------- | ------- |
| `skillName` | 最大文字数 | 100文字 |
| `purpose`   | 最小文字数 | 10文字  |
| `purpose`   | 最大文字数 | 500文字 |

## 依存関係

| タスクID                                  | 関係     | ステータス  |
| ----------------------------------------- | -------- | ----------- |
| UT-SKILL-WIZARD-W0-seq-01                 | 親タスク | completed   |
| UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 | 本タスク | in_progress |
