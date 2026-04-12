# inferSmartDefaults semantic default生成ロジック改善 - タスク指示書

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-INFER-SMART-DEFAULTS-IMPROVE-001                  |
| issue_number | 2087                                                              |
| タスク名     | inferSmartDefaults semantic default生成ロジック改善               |
| 分類         | 改善                                                              |
| 対象機能     | SkillCreateWizard / ConversationRoundStep                         |
| 優先度       | 低                                                                |
| 見積もり規模 | 小規模                                                            |
| ステータス   | 未実施                                                            |
| 発見元       | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001 スコープ外明示 |
| 発見日       | 2026-04-11                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`ConversationRoundStep.tsx` の `applySmartDefaults()` は、ユーザーが過去に選択した回答を次ラウンドのデフォルト値として引き継ぐ機能を担う。内部で呼ばれる `inferSmartDefaults()` が「何をデフォルト値として生成するか」のロジックを担っているが、現在の実装は静的なルールベースに留まっている。

### 1.2 問題点・課題

現状の `inferSmartDefaults()` は以下の問題を持つ:

- **silent mismatch リスク**: `"自分だけ"` を返すが UI ラベルは `"自分のみ"` のように、内部値とUIラベルの不一致が黙って発生する可能性がある。`UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001` で `resolveSemanticLabel()` を介した変換テーブルを整備したが、`inferSmartDefaults()` 本体がその恩恵を受けていない。
- **生成ロジックの硬直性**: どの質問に対して何をデフォルト値にするかが固定されており、将来の質問追加・変更に追従しにくい。
- **テストカバレッジ不足**: `inferSmartDefaults()` 単体のテストが不十分で、回帰リスクがある。

### 1.3 放置した場合の影響

- 新しいQuestionを追加した際、`inferSmartDefaults()` の更新を忘れると silent mismatch が本番環境で発生する
- ユーザーが以前の選択を引き継げず、毎回フルの質問に回答する必要が生じ UX が低下する
- テスト不足により、リファクタリング時の回帰検出が遅れる

---

## 2. 何を達成するか（What）

### 2.1 目的

`inferSmartDefaults()` の生成ロジックを `resolveSemanticLabel()` と連携させ、内部値とUIラベルの一致を保証しながら、将来の質問追加に追従しやすい構造に改善する。

### 2.2 最終ゴール

- `inferSmartDefaults()` が `SEMANTIC_LABEL_MAP` を参照してデフォルト値を生成する
- 新しい質問を追加した際、`SEMANTIC_LABEL_MAP` の更新のみでデフォルト値生成が自動的に追従する
- `inferSmartDefaults()` の単体テストが全ケースをカバーする

### 2.3 スコープ

#### 含むもの

- `inferSmartDefaults()` 関数の内部ロジック改善
- `resolveSemanticLabel()` との連携実装
- `inferSmartDefaults()` の単体テスト追加

#### 含まないもの

- `ConversationRoundStep.tsx` の UI 変更
- `SEMANTIC_LABEL_MAP` の内容変更（別タスク: UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001）
- 他コンポーネントへの波及変更

### 2.4 成果物

- `ConversationRoundStep.tsx` の `inferSmartDefaults()` 改善実装
- `ConversationRoundStep.test.tsx` への `inferSmartDefaults()` 単体テスト追加（最低5ケース）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001` が完了済みであること（`resolveSemanticLabel()` と `SEMANTIC_LABEL_MAP` が `@repo/shared/types/skillWizard` から利用可能）
- `pnpm --filter @repo/desktop test` が全件 PASS の状態であること

### 3.2 依存タスク

- **完了済み**: UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001（`resolveSemanticLabel()`・`SEMANTIC_LABEL_MAP` 整備）
- **推奨**: UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001 を先に完了すると `SEMANTIC_LABEL_MAP` が完全な状態になる

### 3.3 必要な知識

- TypeScript 型定義（`QuestionAnswer`・`QuestionSemanticLabelMap`）
- Vitest でのユニットテスト記述方法
- `@repo/shared/types/skillWizard` のエクスポート構成

### 3.4 推奨アプローチ

1. 現状の `inferSmartDefaults()` の戻り値型と内部ロジックを把握する
2. `SEMANTIC_LABEL_MAP` の構造（`q1`〜`q6` キー）を参照し、どのキーに対してデフォルト値を生成すべきかを整理する
3. `SEMANTIC_LABEL_MAP` を DI パラメータとして受け取れるよう関数シグネチャを拡張する
4. テストを先に書いてから実装する（TDD）

---

## 4. 実行手順

### Phase構成

Phase 1（調査）→ Phase 2（設計）→ Phase 3（実装）→ Phase 4（テスト）→ Phase 5（レビュー）

### Phase 1: 現状調査

#### 目的

`inferSmartDefaults()` の現状挙動と `SEMANTIC_LABEL_MAP` の構造を把握する。

#### 手順

1. `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` を読み、`inferSmartDefaults()` の実装を確認する
2. `packages/shared/src/types/skill-wizard-label-map.ts` の `SEMANTIC_LABEL_MAP` 構造を確認する
3. 既存テストで `inferSmartDefaults()` がカバーされているか確認する

#### 成果物

現状調査メモ（不要であればスキップ可）

#### 完了条件

`inferSmartDefaults()` の問題点と改善方向が明確になっている。

### Phase 2: 実装

#### 目的

`inferSmartDefaults()` を `SEMANTIC_LABEL_MAP` と連携させて改善する。

#### 手順

1. `inferSmartDefaults()` のシグネチャに `labelMap?: QuestionSemanticLabelMap` を追加
2. `SEMANTIC_LABEL_MAP` を既定値として使用し、内部ロジックをマップ参照に変更
3. テストを追加（最低5ケース: 通常・カスタムマップ・undefined・空オブジェクト・フォールバック）

#### 成果物

- 改善された `inferSmartDefaults()` 実装
- 追加テスト（5件以上）

#### 完了条件

- `pnpm --filter @repo/desktop test` が全件 PASS
- TypeScript 型チェックが通る（`pnpm --filter @repo/desktop typecheck`）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `inferSmartDefaults()` が `SEMANTIC_LABEL_MAP` を参照してデフォルト値を生成する
- [ ] カスタム `labelMap` を DI 注入できる
- [ ] `labelMap` が未指定の場合は `SEMANTIC_LABEL_MAP` をデフォルト使用する

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` が全件 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が通る
- [ ] 既存テスト（72件）がリグレッションしない

### ドキュメント要件

- [ ] 変更内容を Phase 12 ドキュメントに反映する（任意）

---

## 6. 検証方法

### テストケース

| TC    | 入力                                             | 期待結果                                          |
| ----- | ------------------------------------------------ | ------------------------------------------------- |
| TC-01 | デフォルト `labelMap` で q1 のデフォルト値生成   | `SEMANTIC_LABEL_MAP["q1"]` に基づく値が返る       |
| TC-02 | カスタム `labelMap` を注入                       | カスタムマップの値が返る                          |
| TC-03 | `labelMap` に存在しないキー                      | フォールバック値（または `undefined`）が返る      |
| TC-04 | 全質問への適用                                   | q1〜q6 全てに対して適切なデフォルト値が生成される |
| TC-05 | 回帰: 既存の `applySmartDefaults()` テストが通る | PASS                                              |

### 検証手順

```bash
pnpm --filter @repo/desktop test --run
pnpm --filter @repo/desktop typecheck
```

---

## 7. リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                                                      |
| --------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------------- |
| `SEMANTIC_LABEL_MAP` のキー変更で破壊的変更が起きる | 中     | 低       | `SEMANTIC_LABEL_MAP` の型を `QuestionSemanticLabelMap` で保護し、キー変更は型エラーで検出 |
| 既存の `applySmartDefaults()` テストが壊れる        | 高     | 低       | テスト追加前にベースラインを確認し、DI で後方互換を維持する                               |
| `vitest.config.ts` の alias 解決問題                | 中     | 中       | `UT-SKILL-WIZARD-VITEST-ALIAS-AUTO-RESOLVE-001` で対処予定                                |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/ut-skill-wizard-semantic-default-extensibility-001/` - 親タスクの仕様書
- `packages/shared/src/types/skill-wizard-label-map.ts` - `SEMANTIC_LABEL_MAP` 定義
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` - 実装対象

### 参考資料

- `docs/30-workflows/ut-skill-wizard-semantic-default-extensibility-001/outputs/phase-12/unassigned-task-detection.md` - 未タスク検出元

---

## 9. 備考

### 苦戦箇所【記入必須】

| 項目     | 内容                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | `inferSmartDefaults()` が返す内部値と UI ラベルが silent mismatch を起こしていた                                                                              |
| 原因     | `resolveSemanticLabel()` の変換テーブルが整備される前は、変換なしに内部値をそのまま利用していた                                                               |
| 対応     | `UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001` で `SEMANTIC_LABEL_MAP` を shared に集約。本タスクで `inferSmartDefaults()` 本体をそのマップに連携させる |
| 再発防止 | 新しい質問を追加する際は `SEMANTIC_LABEL_MAP` の更新と `inferSmartDefaults()` の追従を必ずセットで実施する                                                    |

### レビュー指摘の原文（該当する場合）

```
Phase 12 unassigned-task-detection.md No.1:
「inferSmartDefaults 本体の変更（semantic default の生成ロジック改善）はスコープ外。別タスクで対応。」
```

### 補足事項

`UT-SKILL-WIZARD-NOTION-SPECIAL-CASE-ELIMINATE-001`（notion 特別ケース解消）と合わせて実施すると、`SEMANTIC_LABEL_MAP` が完全な状態になり、より効果的に改善できる。
