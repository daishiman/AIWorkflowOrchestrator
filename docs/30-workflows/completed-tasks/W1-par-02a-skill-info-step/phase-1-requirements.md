# Phase 1: 要件定義

## メタ情報

- Phase: 1
- タスクID: UT-SKILL-WIZARD-W1-par-02a
- 機能名: SkillInfoStep コンポーネント実装（Step 0）
- 作成日: 2026-04-07

## 目的

スキルウィザードの Step 0 として機能する `SkillInfoStep` コンポーネントの要件を明確化し、実装に必要な仕様を確定する。既存の `DescribeStep.tsx` が担っていた役割を整理し、新しい設計方針に沿った要件を定義する。Step 0 は「目的 10 文字以上」かつ「カテゴリ選択済み」で初めて次へ進める。

## 実行タスク

- [ ] 既存の `DescribeStep.tsx` の実装内容を調査・把握する
- [ ] `GenerationMode` 型の利用箇所を全て洗い出す
- [ ] 共有型 `SkillInfoFormData` の利用方針を確定する
- [ ] バリデーションルールを定義する
- [ ] カテゴリタグの仕様（表示名・値）を確定する
- [ ] Step 1（ConversationRoundStep）への伝達インターフェースを定義する

## 参照資料

| 資料名                     | パス                                                                 | 説明                 |
| -------------------------- | -------------------------------------------------------------------- | -------------------- |
| 既存 DescribeStep          | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` | 削除対象の現行実装   |
| 共有型定義                 | `packages/shared/src/types/skillCreator.ts`                          | 型定義参照           |
| ウィザード親コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/`                 | ウィザード全体構成   |
| W0-seq-01仕様書            | `docs/30-workflows/completed-tasks/W0-seq-01-types-skill-info-form/` | 依存タスクの完了仕様 |

## 実行手順

### Step 1: 既存コードの調査

`DescribeStep.tsx` の現行実装を確認し、以下の点を把握する。

- レンダリングする UI 要素の一覧
- `GenerationMode` 型の定義と利用箇所
- 親コンポーネントとの Props インターフェース
- 状態管理の方法

### Step 2: 削除対象の影響範囲調査

```bash
# GenerationMode の利用箇所を検索
grep -r "GenerationMode" apps/ packages/ --include="*.ts" --include="*.tsx"

# DescribeStep の import 箇所を検索
grep -r "DescribeStep" apps/ packages/ --include="*.ts" --include="*.tsx"
```

### Step 3: 共有型の確認

W0-seq-01 で `packages/shared/src/types/skillCreator.ts` に追加された `SkillInfoFormData` / `SkillCategory` をそのまま利用し、Step 0 が受け取るフィールドを再確認する。特に `category` は `SkillCategory | null` で定義されており、初期状態は `null` を許容するため、UI は未選択状態を表示しつつ選択後に `null` へ戻さないように設計する。

### Step 4: バリデーションルール確定

| フィールド  | ルール                                      | エラーメッセージ                             |
| ----------- | ------------------------------------------- | -------------------------------------------- |
| `purpose`   | 必須・最低10文字                            | 「目的・背景は10文字以上で入力してください」 |
| `category`  | 必須・SkillCategory（初期状態は `null` 可） | —                                            |
| `skillName` | 任意                                        | —                                            |

### Step 5: カテゴリ表示仕様確定

| 値                     | 表示名         |
| ---------------------- | -------------- |
| `automation`           | 自動化         |
| `external-integration` | 外部連携       |
| `data-analysis`        | データ分析     |
| `code-support`         | コードサポート |
| `other`                | その他         |

### Step 6: Step 1 への伝達仕様確定

- `category === "external-integration"` の場合、Step 1 の Q5 が必須となる
- `SkillInfoFormData` を `ConversationRoundStep` に Props として渡すことで伝達する
- Step 0 の「次へ」ボタンは `purpose.trim().length >= 10` かつ `category !== null` でのみ活性化する

## 成果物

- 要件定義書（本ファイル）
- `SkillInfoFormData` 型定義の確定仕様
- `SkillCategory` 型定義の確定仕様
- バリデーションルール一覧
- 削除対象ファイル・型の影響範囲リスト

## 完了条件

- [ ] 既存 `DescribeStep.tsx` の実装内容が把握されている
- [ ] `GenerationMode` 型の全利用箇所が洗い出されている
- [ ] `SkillInfoFormData` の型定義が確定している
- [ ] バリデーションルールが文書化されている
- [ ] カテゴリ5種の表示名が確定している
- [ ] Step 1 への伝達インターフェースが明確になっている
