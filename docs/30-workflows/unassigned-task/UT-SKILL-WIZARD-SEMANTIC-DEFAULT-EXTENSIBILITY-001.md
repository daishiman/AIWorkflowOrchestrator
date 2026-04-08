# ConversationRoundStep semantic default 入力元拡張対応 - タスク指示書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-SKILL-WIZARD-SEMANTIC-DEFAULT-EXTENSIBILITY-001           |
| タスク名     | ConversationRoundStep semantic default 入力元拡張対応        |
| 分類         | 改善・拡張                                                   |
| 対象機能     | skill-wizard / buildInitialAnswers / normalizeSelectedOption |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | `UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001` Phase 12    |
| 発見日       | 2026-04-08                                                   |
| Issue番号    | #2042                                                        |
| Lane         | skill-wizard-redesign-lane                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`ConversationRoundStep.tsx` の `buildInitialAnswers()` は `inferSmartDefaults()` から返される
semantic default 値を UI ラベルへ正規化する純粋関数として実装された。現在は q1-q6 の 6 問に
対して固定の変換テーブル（`normalizeSelectedOption`）が定義されているが、将来的に入力元が
増える（例: LLM が異なる言語で返す、外部 JSON から値を注入する）場合、変換テーブルの追加・
更新が分散しやすい。

### 1.2 問題点・課題

- `normalizeSelectedOption()` の変換テーブルが `ConversationRoundStep.tsx` にハードコード
- 入力元（semantic defaults のプロバイダ）が増えた際に変換テーブルの管理が難しくなる
- q5（共有ターゲット）と q6（実行頻度）の正規化ルールが暗黙的で文書化不十分

### 1.3 放置した場合の影響

- semantic 値と UI ラベルの silent mismatch が発生し、デフォルト値が正しく表示されなくなる
- 同一変換を別コンポーネントが再実装するデッドコードが生まれ、保守コストが増大する
- 変換テーブルの変更時に影響範囲の特定が困難になり、デグレのリスクが高まる

---

## 2. 何を達成するか（What）

### 2.1 目的

semantic default の入力元が増加しても `buildInitialAnswers()` が壊れないよう、変換テーブルを
外部から注入可能な設計（または設定駆動型）に移行する。

### 2.2 最終ゴール

- `ConversationOptionLabelMap` が `@repo/shared` に定義され、コンポーネント間で再利用できる状態
- `normalizeSelectedOption()` が shared パッケージのマッピングを参照する実装に置き換わっている
- `buildInitialAnswers()` のテストが 10 件以上のバリエーション（英語・略称・異形を含む）をカバー

### 2.3 スコープ

#### 含むもの

- `normalizeSelectedOption()` のリファクタリング（設定テーブル外部化 or option registry パターン）
- 変換ルールのドキュメント化（1枚の対応表）
- `buildInitialAnswers()` のユニットテスト強化

#### 含まないもの

- `inferSmartDefaults()` 本体の変更
- 新しい semantic default プロバイダの実装

### 2.4 成果物

- `packages/shared/src/types/skill-wizard-label-map.ts`（新規）
- リファクタリング済み `ConversationRoundStep.tsx`
- 強化済みユニットテスト
- `design-decisions.md` への正準形マッピング表の追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001` が完了済みであること
- `ConversationRoundStep.tsx` および関連テストファイルが読める状態であること
- `packages/shared/src/types/` の既存型定義を把握していること

### 3.2 依存タスク

| タスクID                                       | 関係             |
| ---------------------------------------------- | ---------------- |
| UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 | 前提（完了済み） |

### 3.3 必要な知識

- TypeScript の型定義とモジュール分割（`@repo/shared` へのエクスポート方法）
- React コンポーネントへの依存性注入パターン（props / context / import）
- Vitest を使ったユニットテストのパラメータ化（`it.each`）

### 3.4 苦戦箇所（前タスクからの知見）

以下は `UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001` Phase 12 で得られた教訓である。
本タスクの実装時に必ず参照すること。

1. **semantic default と UI ラベルの乖離**
   - `inferSmartDefaults()` が `"自分だけ"` を返すが UI ラベルは `"自分のみ"` — 変換テーブルが
     ないと silent mismatch になる
   - 教訓: semantic 値と display label は設計段階で 1 枚の対応表（正準形マッピング）を作り
     `@repo/shared` に置くべき

2. **変換テーブルの分散**
   - 正規化ロジックがコンポーネント内部に閉じているため、同一変換を別コンポーネントが
     再実装するリスクがある
   - 教訓: option label の正規化は shared パッケージに集約し、コンポーネント間で再利用できるようにする

3. **Phase 12 canonical 成果物の整合確認**
   - 変換テーブルを変更すると Phase 5 実装・Phase 6 テスト・Phase 12 ガイドの 3 箇所を
     同時更新する必要がある
   - 教訓: shared 型定義の変更は影響範囲が広いため、型定義→テスト→ドキュメントの順で修正すること

### 3.5 推奨アプローチ

1. `packages/shared/src/types/skill-wizard-label-map.ts` に `ConversationOptionLabelMap` 型と
   正準マッピング定数を定義する
2. `ConversationRoundStep.tsx` の `normalizeSelectedOption()` を `ConversationOptionLabelMap` を
   参照するよう変更する
3. `buildInitialAnswers()` のテストに入力元バリエーション（英語・略称・異形）を追加する
4. `design-decisions.md` に変換テーブルの 1 枚対応表を追記する

---

## 4. 実行手順

### Phase構成

| Phase | 内容                            | 目安 |
| ----- | ------------------------------- | ---- |
| 1     | 設計・型定義（LabelMap schema） | 0.5h |
| 2     | リファクタリング実装            | 1h   |
| 3     | テスト強化                      | 1h   |

### Phase 1: 設計・型定義（LabelMap schema）

#### 目的

変換テーブルを shared パッケージへ移動するための型設計と正準マッピング定数を確定する。

#### 手順

1. `ConversationRoundStep.tsx` の `normalizeSelectedOption()` 実装を読み、現在の変換テーブルを
   全問（q1-q6）分書き出す
2. `packages/shared/src/types/` 内の既存型定義を確認し、命名規則・エクスポートパターンを把握する
3. `skill-wizard-label-map.ts` の型インターフェース（`ConversationOptionLabelMap`）を設計する
4. q5・q6 の正規化ルールをコメントで明文化した正準マッピング定数を作成する

#### 成果物

- `packages/shared/src/types/skill-wizard-label-map.ts`（型定義 + 定数）

#### 完了条件

- `ConversationOptionLabelMap` 型が定義されている
- q1-q6 の全変換ルールが 1 ファイルに集約されている
- q5・q6 のルールが JSDoc コメントで説明されている

### Phase 2: リファクタリング実装

#### 目的

`ConversationRoundStep.tsx` の `normalizeSelectedOption()` を shared パッケージのマッピングを
参照する実装に置き換える。

#### 手順

1. `packages/shared/src/types/index.ts`（またはバレルファイル）に `skill-wizard-label-map` を
   エクスポート追加する
2. `ConversationRoundStep.tsx` で `@repo/shared` から `ConversationOptionLabelMap` をインポートする
3. `normalizeSelectedOption()` 内のハードコードされた変換テーブルを削除し、shared マッピングを
   参照するよう書き換える
4. 型チェック（`pnpm --filter @repo/shared typecheck` および
   `pnpm --filter @repo/desktop typecheck`）が通ることを確認する

#### 成果物

- リファクタリング済み `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- 更新済み `packages/shared/src/types/index.ts`

#### 完了条件

- `normalizeSelectedOption()` がコンポーネントローカルな変換テーブルを持っていない
- `@repo/shared` からのインポートに切り替わっている
- 型チェックが通っている

### Phase 3: テスト強化

#### 目的

`buildInitialAnswers()` が多様な入力元（英語・略称・異形）を正しく処理できることを
ユニットテストで保証する。

#### 手順

1. 既存テスト（TC-01〜TC-19）を確認し、カバーされていない入力バリエーションを洗い出す
2. `it.each` を使って入力元バリエーション（英語・略称・異形・null・undefined）を
   10 件以上のテストケースに追加する
3. `pnpm --filter @repo/desktop test` を実行し、全テストが GREEN であることを確認する
4. `design-decisions.md` に正準形マッピング表（semantic 値 → UI ラベル の対応表）を追記する

#### 成果物

- 強化済みテストファイル（`ConversationRoundStep.test.tsx`）
- 更新済み `design-decisions.md`（正準形マッピング表含む）

#### 完了条件

- `buildInitialAnswers()` テストが 10 件以上のバリエーションをカバー
- 既存テスト（TC-01〜TC-19）が全 GREEN のまま
- `design-decisions.md` に正準形マッピング表が記載されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ConversationOptionLabelMap` が `@repo/shared` に定義済み
- [ ] `normalizeSelectedOption()` が LabelMap を参照している
- [ ] `buildInitialAnswers()` テストが 10+ バリエーションをカバー
- [ ] design-decisions.md に正準形マッピング表が記載

### 品質要件

- [ ] 既存テスト（TC-01〜TC-19）が全 GREEN のまま
- [ ] `pnpm --filter @repo/shared typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop test` で ConversationRoundStep 関連テストが全 PASS

### ドキュメント要件

- [ ] Phase 12 close-out 時に `unassigned-task-detection.md` の formalized 欄を更新する

---

## 6. 検証方法

### テストケース

| テストID                    | 内容                                            | 確認コマンド                                             |
| --------------------------- | ----------------------------------------------- | -------------------------------------------------------- |
| buildInitialAnswers-EN      | 英語の semantic 値が正しく正規化される          | `pnpm --filter @repo/desktop test ConversationRoundStep` |
| buildInitialAnswers-abbr    | 略称（例: "daily"）が正しく正規化される         | 同上                                                     |
| buildInitialAnswers-variant | 異形（例: "自分だけ" → "自分のみ"）が変換される | 同上                                                     |
| buildInitialAnswers-null    | null / undefined 入力でクラッシュしない         | 同上                                                     |
| TC-01〜TC-19                | 既存テスト全件が GREEN のまま                   | 同上                                                     |

### 検証手順

```bash
# shared パッケージの型チェック
pnpm --filter @repo/shared typecheck

# desktop パッケージの型チェック
pnpm --filter @repo/desktop typecheck

# ConversationRoundStep 関連テストの実行
pnpm --filter @repo/desktop test ConversationRoundStep
```

---

## 7. リスクと対策

| リスク                                                  | 影響度 | 発生確率 | 対策                                                                         |
| ------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------- |
| shared 型変更が他コンポーネントの import に影響する     | 中     | 低       | `packages/shared/src/types/index.ts` のバレルエクスポートを慎重に設計する    |
| q5・q6 の正規化ルールが暗黙的で設計者以外に分かりにくい | 中     | 高       | JSDoc と design-decisions.md で明示的にドキュメント化する                    |
| テストバリエーション追加時に既存テストケースと衝突する  | 低     | 低       | `it.each` で独立したテーブル形式にし、既存 TC の番号を変更しない             |
| `inferSmartDefaults()` の返り値が変わった際の追従漏れ   | 高     | 低       | LabelMap の型定義に `satisfies` や型テストを加えて静的に検知できるようにする |

---

## 8. 参照情報

### 関連ファイル

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`
- `packages/shared/src/types/`
- `docs/30-workflows/ut-skill-wizard-w1-conversation-round-step-001/outputs/phase-2/design-decisions.md`

### 関連ドキュメント

- `docs/30-workflows/skill-wizard-redesign-lane/index.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-core.md`

---

## 9. 備考

### 前タスク発見時の原文メモ（Phase 12 close-out より）

```
UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 Phase 12 発見事項:
  - normalizeSelectedOption() の変換テーブルがコンポーネント内部にハードコード
  - inferSmartDefaults() の返り値 "自分だけ" と UI ラベル "自分のみ" の乖離が
    変換テーブルがないと silent mismatch になることを確認
  - 将来の semantic default プロバイダ追加に備えた shared 集約が必要
  発見元: UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 Phase 12
```

### 補足事項

- 本タスクは優先度「低」であり、skill-wizard の主要機能に影響しない範囲のリファクタリングである。
  `UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001` の TC-01〜TC-19 が全 GREEN であれば
  既存ユーザー体験への影響はない。
- `inferSmartDefaults()` 本体の変更は本タスクのスコープ外。新しい semantic default プロバイダの
  実装が確定した段階で、本タスクの成果物（LabelMap）を拡張する形で対応すること。
