# notion freeText特別ケース解消 - タスク指示書

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001                 |
| issue_number | 2089                                                              |
| タスク名     | notion freeText特別ケース解消                                     |
| 分類         | リファクタリング                                                  |
| 対象機能     | SkillCreateWizard / ConversationRoundStep                         |
| 優先度       | 低                                                                |
| 見積もり規模 | 小規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 Phase 10 MINOR |
| 発見日       | 2026-04-11                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`ConversationRoundStep.tsx` の `createQuestionAnswer()` 関数内で、`notion` という値に対して特別ケース処理が残存している。具体的には `notion` を選択した際に `{ answer: "その他", freeText: "Notion" }` を生成するロジックが、`resolveSemanticLabel()` を経由せずにハードコードされている。

`UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001` で `resolveSemanticLabel()` と `SEMANTIC_LABEL_MAP` を整備したが、`notion` の特別処理はスコープ外として残置された。

### 1.2 問題点・課題

- **変換ロジックの分散**: `resolveSemanticLabel()` を使えば変換テーブルで管理できるはずの変換が、`createQuestionAnswer()` 内に特別ケースとして残っている
- **SEMANTIC_LABEL_MAP との不整合リスク**: `SEMANTIC_LABEL_MAP` を更新しても `notion` 特別ケースが独立して存在するため、変換ロジックが二箇所に分散したまま
- **テスト複雑化**: 特別ケースがあることで `createQuestionAnswer()` のテストに特別ケース用のブランチが必要になる
- **拡張困難**: 将来 `notion` と同様の「UIラベルと内部値が異なるツール」が増えた場合、特別ケースをさらに追加する悪い先例となる

### 1.3 放置した場合の影響

- `SEMANTIC_LABEL_MAP` を更新しても `notion` の変換は変わらず、意図しない動作の原因になる可能性がある
- 同種のツール（例: `figma`、`slack` など）が将来追加された際に、特別ケースが増殖するコードになる
- コードレビュー時に「なぜここだけ特別ケースがあるのか」という疑問が生まれ、レビューコストが上がる

---

## 2. 何を達成するか（What）

### 2.1 目的

`createQuestionAnswer()` 内の `notion` 特別ケースを削除し、`resolveSemanticLabel()` の返り値だけで変換が完結するよう `SEMANTIC_LABEL_MAP` を拡張する。

### 2.2 最終ゴール

- `createQuestionAnswer()` に `notion` の特別ケース処理が存在しない
- `notion → { answer: "その他", freeText: "Notion" }` の変換が `SEMANTIC_LABEL_MAP` のみで表現されている
- `resolveSemanticLabel("notion")` が正しく `"その他"` を返し、`freeText` の生成も変換テーブルから導出できる

### 2.3 スコープ

#### 含むもの

- `SEMANTIC_LABEL_MAP` への `notion` エントリ追加（`freeText` 対応含む）
- `createQuestionAnswer()` の `notion` 特別ケース削除
- 関連テストの更新・追加

#### 含まないもの

- `resolveSemanticLabel()` のシグネチャ変更（`freeText` 返却対応が不要な場合は変更しない）
- 他の特別ケースの解消（別タスクで対応）
- UI 側の変更

### 2.4 成果物

- 更新された `packages/shared/src/types/skill-wizard-label-map.ts`（`notion` エントリ追加）
- 更新された `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`（特別ケース削除）
- 更新された `ConversationRoundStep.test.tsx`（notion 変換テスト）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001` が完了済みであること（`resolveSemanticLabel()` と `SEMANTIC_LABEL_MAP` が利用可能）
- `pnpm --filter @repo/desktop test` が全件 PASS の状態であること

### 3.2 依存タスク

- **完了済み**: UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001（`resolveSemanticLabel()` 整備）
- **推奨**: このタスクを先に完了させると `UT-SKILL-WIZARD-INFER-SMART-DEFAULTS-IMPROVE-001` が完全な `SEMANTIC_LABEL_MAP` を参照できる

### 3.3 必要な知識

- `QuestionSemanticLabelMap` 型の構造（`Record<string, Record<string, string>>`）
- `resolveSemanticLabel()` の挙動（入力値 → UIラベルの変換）
- `createQuestionAnswer()` の現状実装

### 3.4 推奨アプローチ

**設計検討ポイント**: `notion → { answer: "その他", freeText: "Notion" }` の変換では、単純な文字列マッピングでは `freeText` を表現できない。以下の選択肢がある:

**オプション1**: `SEMANTIC_LABEL_MAP` を拡張して `freeText` を表現できる型に変更する

```typescript
type LabelEntry = string | { label: string; freeText?: string };
type QuestionSemanticLabelMap = Record<string, Record<string, LabelEntry>>;
```

**オプション2**: `notion` のような「その他」マッピングを別のマップ（`FREE_TEXT_MAP`）で管理する

**オプション3**: `resolveSemanticLabel()` が `{ label, freeText? }` オブジェクトを返すよう拡張する

型の破壊的変更を避けつつ、最もシンプルな設計を選ぶこと。

---

## 4. 実行手順

### Phase構成

Phase 1（設計決定）→ Phase 2（実装）→ Phase 3（テスト）

### Phase 1: 設計決定

#### 目的

`freeText` をどのように `SEMANTIC_LABEL_MAP` に組み込むかの設計を決定する。

#### 手順

1. 現状の `createQuestionAnswer()` の `notion` 特別ケース実装を読む
2. `QuestionSemanticLabelMap` の現状の型定義を確認する
3. 上記3つのオプションを検討し、破壊的変更が最小のアプローチを選択する
4. 選択したアプローチの設計概要を短くまとめる（コメントとして実装ファイルに記載）

#### 成果物

採用アプローチの決定

#### 完了条件

アプローチが明確になっており、実装に進める状態である。

### Phase 2: 実装

#### 目的

特別ケースを削除し、変換テーブルで完結する実装に変更する。

#### 手順

1. 採用アプローチに従い `QuestionSemanticLabelMap` 型（必要な場合）と `SEMANTIC_LABEL_MAP` を更新する
2. `createQuestionAnswer()` の `notion` 特別ケースを削除し、`resolveSemanticLabel()` 返り値から `freeText` を導出するよう変更する
3. `pnpm --filter @repo/desktop test` でリグレッションがないことを確認する

#### 成果物

- 更新された `skill-wizard-label-map.ts`
- 更新された `ConversationRoundStep.tsx`

#### 完了条件

- `notion` 特別ケースが `createQuestionAnswer()` に存在しない
- `pnpm --filter @repo/desktop test` が全件 PASS

### Phase 3: テスト追加

#### 目的

`notion` 変換のテストを追加し、回帰を防ぐ。

#### 手順

1. `ConversationRoundStep.test.tsx` に `notion` の変換テストを追加する（最低2ケース）
2. `SEMANTIC_LABEL_MAP` の `notion` エントリを変更した場合のテストも追加する

#### 成果物

追加テスト（2件以上）

#### 完了条件

`pnpm --filter @repo/desktop test` が全件 PASS。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `createQuestionAnswer()` 内に `notion` の特別ケース処理が存在しない
- [ ] `notion` を入力した場合、`resolveSemanticLabel()` または変換テーブル経由で `{ answer: "その他", freeText: "Notion" }` が生成される
- [ ] `SEMANTIC_LABEL_MAP` に `notion` のエントリが追加されている

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` が全件 PASS（既存72件 + 新規テスト）
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] `pnpm --filter @repo/shared build` が通る（型変更がある場合）

### ドキュメント要件

- [ ] `SEMANTIC_LABEL_MAP` の変更を `packages/shared/src/types/skill-wizard-label-map.ts` のコメントに反映する（任意）

---

## 6. 検証方法

### テストケース

| TC    | 入力                                                | 期待結果                                          |
| ----- | --------------------------------------------------- | ------------------------------------------------- |
| TC-01 | `createQuestionAnswer()` に `notion` を渡す         | `{ answer: "その他", freeText: "Notion" }` が返る |
| TC-02 | `resolveSemanticLabel(questionId, "notion")` を呼ぶ | 変換テーブルから `"その他"` が返る                |
| TC-03 | 既存テスト全件実行                                  | リグレッションなし（PASS）                        |

### 検証手順

```bash
pnpm --filter @repo/desktop test --run
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared build
```

---

## 7. リスクと対策

| リスク                                                                                    | 影響度 | 発生確率 | 対策                                                                                    |
| ----------------------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| `QuestionSemanticLabelMap` 型変更が既存コードの型エラーを引き起こす                       | 高     | 中       | オプション1採用時は後方互換型（`string \| LabelEntry`）を使い、段階的に移行する         |
| `freeText` の導出ロジックが複雑になる                                                     | 中     | 低       | オプション2（別マップ）や オプション3（返り値拡張）に切り替えて最もシンプルな実装を選ぶ |
| `pnpm --filter @repo/shared build` のエクスポート変更でデスクトップ側がビルドエラーになる | 高     | 低       | `packages/shared/package.json` の `exports` と `typesVersions` を合わせて更新する       |

---

## 8. 参照情報

### 関連ドキュメント

- `packages/shared/src/types/skill-wizard-label-map.ts` - 変換テーブル定義
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` - 実装対象
- `docs/30-workflows/ut-skill-wizard-semantic-default-extensibility-001/outputs/phase-12/unassigned-task-detection.md` - 未タスク検出元
- `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-INFER-SMART-DEFAULTS-IMPROVE-001.md` - 関連未タスク

### 参考資料

- `packages/shared/src/types/index.ts` - shared パッケージのエクスポート一覧

---

## 9. 備考

### 苦戦箇所【記入必須】

| 項目     | 内容                                                                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | `notion` を選択した際に `{ answer: "その他", freeText: "Notion" }` を生成する必要があり、単純な文字列マッピングでは `freeText` を表現できなかった |
| 原因     | `SEMANTIC_LABEL_MAP` の型が `Record<string, Record<string, string>>` に固定されており、`freeText` のような付加情報を持てなかった                  |
| 対応     | `UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001` では `createQuestionAnswer()` 内の特別ケースをそのまま残し、変換テーブルの整備を先行させた   |
| 再発防止 | 本タスクで `freeText` を変換テーブルに組み込む設計を確立し、同様のケースが増えても特別ケースを追加しない原則を確立する                            |

### レビュー指摘の原文（該当する場合）

```
Phase 12 unassigned-task-detection.md No.3:
「notion の freeText: "Notion" 設定が createQuestionAnswer の特別ケースとして残存。
resolveSemanticLabel 返り値だけで完結させる設計を検討。」
```

### 補足事項

このタスクは `QuestionSemanticLabelMap` の型変更を伴う可能性があり、`packages/shared` のビルドと `apps/desktop` の両方に影響する。型変更は慎重に設計し、破壊的変更が最小になるアプローチを選ぶこと。
