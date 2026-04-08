# wizard/index.ts エクスポート更新（Wave 2 整合） - タスク指示書

## メタ情報

```yaml
issue_number: 2017
task_id: UT-SKILL-WIZARD-W2-WIZARD-EXPORTS-001
status: open
priority: medium
scale: small
task_type: NON_VISUAL
```

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W2-WIZARD-EXPORTS-001                     |
| タスク名     | wizard/index.ts エクスポート更新（Wave 2 整合）           |
| 分類         | リファクタリング                                          |
| 対象機能     | スキル作成ウィザード - エクスポートバレル更新             |
| 優先度       | 中                                                        |
| 見積もり規模 | 小規模                                                    |
| ステータス   | 未実施（`status:open`）                                   |
| 発見元       | skill-wizard-redesign-lane Wave 2 完了後                  |
| 発見日       | 2026-04-08                                                |
| タスク分類   | NON_VISUAL タスク（バレルファイルのみ変更、視覚差分なし） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`skill-wizard-redesign-lane` では Wave 0〜2 にわたってスキル作成ウィザードを全面改善する。
Wave 2（`W2-seq-03a`・`W2-seq-03b`）では以下のコンポーネントを追加・変更する計画となっている。

| Wave | タスク     | 成果物                                          |
| ---- | ---------- | ----------------------------------------------- |
| W1   | W1-par-02a | `SkillInfoStep.tsx`（Step 0）                   |
| W1   | W1-par-02b | `ConversationRoundStep.tsx`（Step 1）           |
| W1   | W1-par-02c | `CompleteStep.tsx`（完了画面）再設計            |
| W2   | W2-seq-03a | `SkillCreateWizard.tsx`（オーケストレーション） |
| W2   | W2-seq-03b | `wizard/index.ts` エクスポート更新（本タスク）  |

現在の `apps/desktop/src/renderer/components/skill/wizard/index.ts` は Wave 1 以前の旧設計を前提に構築されており、
Wave 2 完了後に新規追加コンポーネントを追加エクスポートすることなく、
旧バレルのままにすると利用側の import パスが不整合になる。

### 1.2 問題点・課題

1. **新規コンポーネントのエクスポート漏れ**: `SkillInfoStep`・`ConversationRoundStep` が Wave 1 で実装完了しても、
   バレルファイルに追加されなければ `SkillCreateWizard.tsx` からの import が通らない。

2. **不要エクスポートの残留**: Wave 2 の設計変更によって廃止または変更されるコンポーネント・型が
   バレルに残り続けると、利用側に不整合な型推論が伝播する。

3. **`@repo/shared` root と local barrel の重複問題**: `GenerationMode`・`GenerationError` 等の型が
   `@repo/shared` 側で再定義されている場合、`wizard/index.ts` からの再エクスポートと衝突する可能性がある。

4. **名前衝突リスク**: `SkillCategory` など `@repo/shared/types` に存在する型と同名のものを
   バレルに追加すると、import の解決が曖昧になる。

### 1.3 放置した場合の影響

- Wave 2 完了後に `SkillCreateWizard.tsx` がビルドエラーになる（import 未解決）。
- TypeScript の型エラーが連鎖し、`pnpm --filter @repo/desktop typecheck` が FAIL する。
- 旧コンポーネント（テンプレート生成系）のエクスポートが残留し、
  将来の保守者が「使われていない export」を誤って継続使用するリスクがある。

---

## 2. 何を達成するか（What）

### 2.1 目的

Wave 2（`W2-seq-03a` `W2-seq-03b`）完了後に `wizard/index.ts` を整合させ、
新規コンポーネントの正しいエクスポートと不要エクスポートの除去を行う。

### 2.2 最終ゴール

- Wave 1 で追加された `SkillInfoStep`・`ConversationRoundStep` が `wizard/index.ts` からエクスポートされている。
- Wave 2 の `SkillCreateWizard.tsx` が `wizard/index.ts` を通じて新コンポーネントを import できる。
- `@repo/shared` との重複エクスポートが解消されている。
- `pnpm --filter @repo/desktop typecheck` が PASS する。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/components/skill/wizard/index.ts` の更新
  - `SkillInfoStep`・`ConversationRoundStep` の新規エクスポート追加
  - Wave 2 設計変更に伴う廃止エクスポートの削除
  - `@repo/shared` root との重複エクスポートの整理
- 更新に伴う typecheck・lint の通過確認

#### 含まないもの

- `SkillInfoStep.tsx`・`ConversationRoundStep.tsx` の実装（それぞれ Wave 1 タスクで対応）
- `SkillCreateWizard.tsx` の実装（Wave 2 `W2-seq-03a` で対応）
- `@repo/shared/types` の変更
- テスト・カバレッジの新規追加（バレルファイルの変更のみのため不要）

### 2.4 成果物

| 種別 | ファイル                                                     |
| ---- | ------------------------------------------------------------ |
| 修正 | `apps/desktop/src/renderer/components/skill/wizard/index.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `W2-seq-03a`（`SkillCreateWizard.tsx` 完成）が完了していること
- Wave 1 の全タスク（`W1-par-02a` 〜 `W1-par-02c`）が完了し、各コンポーネントが確定していること
- `pnpm install` が完了しており、monorepo のパッケージ解決が正常であること

### 3.2 依存タスク

| タスクID   | 状態           | 内容                                             |
| ---------- | -------------- | ------------------------------------------------ |
| W1-par-02a | 未完了（先行） | `SkillInfoStep.tsx` 実装（Step 0）               |
| W1-par-02b | 未完了（先行） | `ConversationRoundStep.tsx` 実装（Step 1）       |
| W1-par-02c | 未完了（先行） | `CompleteStep.tsx` 再設計                        |
| W2-seq-03a | 未完了（先行） | `SkillCreateWizard.tsx` オーケストレーション完成 |

### 3.3 必要な知識

- TypeScript のバレルファイル（re-export）パターン
- monorepo における `@repo/shared` と local パッケージの import 解決
- `export type` と `export` の使い分け（型のみ / 値も含む）

### 3.4 推奨アプローチ

1. **現状の `wizard/index.ts` を読み込み、既存エクスポートを棚卸しする**:
   各エクスポートが Wave 2 後も継続使用されるかどうかを確認する。

2. **各 Wave 1 コンポーネントの公開 API を確認する**:
   `SkillInfoStep.tsx`・`ConversationRoundStep.tsx`・新 `CompleteStep.tsx` が
   export している型・コンポーネントを収集する。

3. **`@repo/shared` との重複を確認する**:
   `packages/shared/src/index.ts`（または `types/index.ts`）に同名の型が存在しないかチェックする。

4. **`wizard/index.ts` を最小差分で更新する**:
   追加のみを先に行い、削除は `SkillCreateWizard.tsx` から参照されていないことを確認してから行う。

5. **`pnpm --filter @repo/desktop typecheck` で検証する**:
   エラーが出た場合はエラーメッセージを起点に重複・未解決 import を修正する。

### 3.5 苦戦箇所（事前想定）

| 苦戦ポイント                                                  | 詳細                                                                                                       | 推奨対策                                                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `SkillCategory` 等の既存型との名前衝突                        | `@repo/shared/types` に同名の型が存在する場合、バレルから re-export すると import が曖昧になる             | `export type { Foo as WizardFoo }` のように alias を付けるか、バレルからの再エクスポートを省略 |
| `@repo/shared` root export と local barrel の重複エクスポート | `GenerationMode` 等が `@repo/shared` に追加された場合、`wizard/index.ts` からも同名で export すると TS2308 | `wizard/index.ts` からは削除し、利用側は `@repo/shared` から直接 import させる                 |
| `export type` と `export` の混在                              | 値も export しているコンポーネントに対して `export type` のみ書くとランタイムで参照できない                | コンポーネント（関数・オブジェクト）は `export`、型のみは `export type` で明示的に分ける       |
| Wave 2 完了前に本タスクを着手した場合の不整合                 | 依存 Wave が未完了の状態でバレルを書くと、存在しないファイルへの import が残りビルドエラーになる           | 必ず `W2-seq-03a` の完了を確認してから着手する。着手時に依存ファイルの存在を先にチェックする   |
| Phase 12 close-out 時のドキュメント変更記録                   | バレルファイルのみの変更で実コード変化が小さいため、変更ログが省略されがち                                 | Phase 12 でも `documentation-changelog.md` を必ず作成し、変更前後の export 一覧を記録する      |

---

## 4. 実行手順（Phase 1〜13）

### Phase 構成

| Phase | 名称             | ステータス | 概要                                                               |
| ----- | ---------------- | ---------- | ------------------------------------------------------------------ |
| 1     | 要件定義         | open       | 対象ファイル確定・前提 Wave の完了確認・export 棚卸し              |
| 2     | 設計             | open       | 追加・削除・変更する export の一覧確定                             |
| 3     | 設計レビュー     | open       | 重複・名前衝突・型整合を確認し Phase 4 進行可否を判定              |
| 4     | テスト作成       | open       | typecheck 実行スクリプト確認（バレルのみ変更のため通常テスト不要） |
| 5     | 実装             | open       | `wizard/index.ts` の最小差分更新                                   |
| 6     | テスト拡充       | open       | typecheck PASS・lint PASS の確認                                   |
| 7     | カバレッジ確認   | open       | バレルファイルのため N/A（typecheck で代替）                       |
| 8     | リファクタリング | open       | export の命名・順序整理・コメント更新                              |
| 9     | 品質検証         | open       | typecheck / lint 全 PASS 確認                                      |
| 10    | 最終レビュー     | open       | 受入条件チェック・ブロッカー判定                                   |
| 11    | 手動テスト       | open       | NON_VISUAL: import 解決確認（console / mock による自動 evidence）  |
| 12    | ドキュメント更新 | open       | canonical 6成果物 + step log + 準拠チェック作成                    |
| 13    | PR 作成          | blocked    | ユーザー明示承認後のみ実施                                         |

---

### Phase 1: 要件定義

**ステータス**: open

#### 目的

Wave 2 完了確認・export 棚卸し・受入条件の確定。

#### 前提チェックリスト

| 確認項目                                                    | 判定   |
| ----------------------------------------------------------- | ------ |
| `W1-par-02a`（SkillInfoStep.tsx）が実装完了している         | 要確認 |
| `W1-par-02b`（ConversationRoundStep.tsx）が実装完了している | 要確認 |
| `W1-par-02c`（CompleteStep.tsx 再設計）が実装完了している   | 要確認 |
| `W2-seq-03a`（SkillCreateWizard.tsx）が実装完了している     | 要確認 |

#### 受入条件（AC）

| AC   | 内容                                                                                 |
| ---- | ------------------------------------------------------------------------------------ |
| AC-1 | `SkillInfoStep` が `wizard/index.ts` から import 可能                                |
| AC-2 | `ConversationRoundStep` が `wizard/index.ts` から import 可能                        |
| AC-3 | Wave 2 設計変更で廃止されたコンポーネント・型が `wizard/index.ts` から削除されている |
| AC-4 | `@repo/shared` と重複するエクスポートが `wizard/index.ts` から除去されている         |
| AC-5 | `pnpm --filter @repo/desktop typecheck` が PASS する                                 |
| AC-6 | `pnpm --filter @repo/desktop lint` が PASS する                                      |

#### 手順

1. `apps/desktop/src/renderer/components/skill/wizard/index.ts` を読み込み、既存 export を一覧化する
2. `apps/desktop/src/renderer/components/skill/wizard/` 配下の全コンポーネントを確認し、
   各ファイルが export しているシンボルを収集する
3. `packages/shared/src/index.ts` を確認し、同名 export がないかチェックする
4. 上記 AC-1〜AC-6 を仕様書に記録する

#### 成果物

- export 棚卸し一覧
- 受入条件（AC）一覧

#### 完了条件

- AC-1〜AC-6 が明文化されている
- NON_VISUAL タスクとして分類されていることが記録されている

---

### Phase 2: 設計

**ステータス**: open

#### 目的

追加・削除・変更する export の一覧を確定する。

#### 設計: export 変更一覧（Wave 2 完了後に記入）

| 変更種別 | シンボル                       | ファイル                              | 変更理由                                |
| -------- | ------------------------------ | ------------------------------------- | --------------------------------------- |
| 追加     | `SkillInfoStep`                | `./SkillInfoStep`                     | Wave 1 新規コンポーネント               |
| 追加     | `SkillInfoStepProps`           | `./SkillInfoStep`                     | Wave 1 新規型                           |
| 追加     | `ConversationRoundStep`        | `./ConversationRoundStep`             | Wave 1 新規コンポーネント               |
| 追加     | `ConversationRoundStepProps`   | `./ConversationRoundStep`             | Wave 1 新規型                           |
| 要確認   | `GenerationMode`               | 現在 `wizard/index.ts` にローカル宣言 | `@repo/shared` に移動した場合は削除対象 |
| 要確認   | `DescribeStep` 等の既存 export | 継続・廃止を Wave 2 完了後に判断      | -                                       |

> 上記の「要確認」行は Wave 2 完了後に実際のコードを精読して確定する。

#### 手順

1. Phase 1 の棚卸し結果をもとに上記テーブルを確定する
2. `@repo/shared` との重複エクスポートを具体的にリストアップする
3. alias が必要なシンボルを特定する

#### 成果物

- export 変更一覧テーブル（上記の「要確認」列が全て解決済み）

#### 完了条件

- 追加・削除・変更の各アクションが明確になっている
- alias が必要なケースが特定されている

---

### Phase 3: 設計レビュー

**ステータス**: open

#### 目的

Phase 2 の設計が AC を満たし Phase 4 へ進めるかを判定する。

#### レビューチェックリスト

| チェック項目                                                        | 判定   |
| ------------------------------------------------------------------- | ------ |
| AC-1〜AC-6 を全て満たす設計になっているか                           | 要確認 |
| `@repo/shared` root export との重複が解消されているか               | 要確認 |
| `SkillCategory` 等の既存型との名前衝突がないか                      | 要確認 |
| `export type` と `export` の使い分けが正しいか                      | 要確認 |
| 削除する export が `SkillCreateWizard.tsx` 等から参照されていないか | 要確認 |

#### 手順

1. Phase 2 の変更一覧テーブルを精読し、上記チェックリストを評価する
2. CRITICAL 問題があれば Phase 2 へ差し戻す
3. MINOR 問題は未タスク候補として記録し Phase 4 へ進む

#### 成果物

- 設計レビュー結果（PASS / FAIL）
- MINOR 指摘事項リスト（あれば）

#### 完了条件

- チェックリスト全項目が PASS または MINOR として記録されている
- Phase 4 進行可否が明確に判定されている

---

### Phase 4: テスト確認

**ステータス**: open

> **NON_VISUAL・バレルのみ変更のため**: 新規ユニットテストは不要。typecheck コマンドをテストゲートとする。

#### 目的

typecheck が正しく動作することを確認し、実装前のベースラインを記録する。

#### 手順

1. 実装前の状態で `pnpm --filter @repo/desktop typecheck` を実行し、
   既存エラーがないことを確認する（あれば記録する）
2. 実装前のベースライン状態を記録する

#### 成果物

- 実装前 typecheck 実行ログ（ベースライン）

#### 完了条件

- ベースライン typecheck 結果が記録されている

---

### Phase 5: 実装

**ステータス**: open

#### 目的

Phase 2 の変更一覧に基づき `wizard/index.ts` を最小差分で更新する。

#### 実装タスク

**Task 5-1: 新規コンポーネントの export 追加**

1. `SkillInfoStep.tsx` の public export シンボルを確認する
2. `ConversationRoundStep.tsx` の public export シンボルを確認する
3. `wizard/index.ts` に追加 export 行を挿入する

**Task 5-2: 廃止エクスポートの削除**

1. Wave 2 設計変更で不要になった export を特定する
2. 参照先がないことを確認してから削除する

**Task 5-3: `@repo/shared` との重複解消**

1. 重複する型定義を `wizard/index.ts` から削除する
2. 利用側が `@repo/shared` から直接 import するように誘導するコメントを追加する（任意）

#### 成果物

- 更新済み `apps/desktop/src/renderer/components/skill/wizard/index.ts`
- `pnpm --filter @repo/desktop typecheck` の PASS ログ

#### 完了条件

- AC-1〜AC-6 が全て満たされている
- typecheck が PASS している

---

### Phase 6: テスト拡充

**ステータス**: open

#### 目的

lint PASS を確認し、エラーがあれば修正する。

#### 手順

1. `pnpm --filter @repo/desktop lint` を実行して PASS を確認する
2. エラーがある場合は修正して再実行する

#### 成果物

- lint PASS ログ

#### 完了条件

- lint が PASS している

---

### Phase 7: カバレッジ確認

**ステータス**: open

> **バレルファイルのため**: コードカバレッジ計測の対象外。typecheck + lint を品質指標とする。

#### 完了条件

- Phase 5・6 の typecheck / lint が PASS している（カバレッジ N/A を明記）

---

### Phase 8: リファクタリング

**ステータス**: open

#### 目的

export の命名・順序・コメントを整理し、可読性を高める。

#### 手順

1. export の並び順を論理的なグループ（コンポーネント本体 → Props 型 → その他型）に整理する
2. 各グループにコメントを追加する（任意）
3. `pnpm --filter @repo/desktop typecheck` と lint が引き続き PASS することを確認する

#### 成果物

- 整理済み `wizard/index.ts`

#### 完了条件

- export の並び順が論理的に整理されている
- typecheck / lint が PASS している

---

### Phase 9: 品質検証

**ステータス**: open

#### 目的

typecheck / lint の全 PASS を最終確認する。

#### 手順

1. `pnpm --filter @repo/desktop typecheck` を実行して PASS を確認する
2. `pnpm --filter @repo/desktop lint` を実行して PASS を確認する

#### 成果物

- 品質検証結果レポート（`outputs/phase-9/quality-check-result.md`）

#### 完了条件

- typecheck / lint が全て PASS している

---

### Phase 10: 最終レビュー

**ステータス**: open

#### 目的

受入条件（AC-1〜AC-6）の充足確認と Phase 11 進行可否の判定。

#### 受入条件チェック

| AC   | 内容                                                                 | 判定   |
| ---- | -------------------------------------------------------------------- | ------ |
| AC-1 | `SkillInfoStep` が `wizard/index.ts` から import 可能                | 未確認 |
| AC-2 | `ConversationRoundStep` が `wizard/index.ts` から import 可能        | 未確認 |
| AC-3 | Wave 2 廃止コンポーネント・型が `wizard/index.ts` から削除されている | 未確認 |
| AC-4 | `@repo/shared` と重複するエクスポートが除去されている                | 未確認 |
| AC-5 | `pnpm --filter @repo/desktop typecheck` が PASS する                 | 未確認 |
| AC-6 | `pnpm --filter @repo/desktop lint` が PASS する                      | 未確認 |

#### 完了条件

- AC-1〜AC-6 が全て PASS している
- Phase 11 への進行が承認されている

---

### Phase 11: 手動テスト（NON_VISUAL）

**ステータス**: open

> **NON_VISUAL タスク**: UI 変更なし。import 解決確認のみで手動テストを代替する。

#### 目的

`SkillCreateWizard.tsx` が `wizard/index.ts` 経由で新コンポーネントを正しく import できることを確認する。

#### 手順

1. `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` で
   `import { SkillInfoStep, ConversationRoundStep } from "./wizard"` が成立することを
   typecheck で確認する
2. `pnpm --filter @repo/desktop typecheck` が PASS することを証跡として記録する

#### 成果物

- NON_VISUAL 手動テスト結果（`outputs/phase-11/manual-test-result.md`）

#### 完了条件

- typecheck PASS が証跡として記録されている
- 重大な問題がない

---

### Phase 12: ドキュメント更新

**ステータス**: open

#### 目的

canonical 6 成果物 + step log + 準拠チェックを作成する。

#### Task 12-1: 実装ガイド作成（2パート構成）

**Part 1: 中学生でも理解できる説明**

---

プログラムのコードは「ファイル」という単位で管理されています。
1つの大きなプログラムを作るとき、たくさんのファイルに分けて書くのが普通です。
ただ、ファイルが多くなると「どこに何が入っているか」が分かりにくくなってしまいます。

そこで「バレルファイル」という仕組みが使われます。
バレル（樽）は、中に色々なものをまとめて入れられる入れ物ですよね。
プログラムでもバレルファイルを使うと、複数のファイルのエクスポート（公開したいもの）を
1か所にまとめることができます。

今回の `wizard/index.ts` がそのバレルファイルです。
スキル作成ウィザードで使う色々なコンポーネント（画面パーツ）を、
`wizard/index.ts` から一括でエクスポートしています。

Wave 1 と Wave 2 の改修によって新しいコンポーネント（`SkillInfoStep`・`ConversationRoundStep`）が
追加されたので、バレルファイルにも「このコンポーネントも外から使えます」という宣言を追加する必要があります。
また、古いコンポーネントは削除・整理します。

これは設計図の目次ページを最新版に書き直すような作業です。

---

**Part 2: 技術者向けの詳細説明**

```typescript
// apps/desktop/src/renderer/components/skill/wizard/index.ts（更新後イメージ）

// Step 0: スキル情報入力
export { SkillInfoStep } from "./SkillInfoStep";
export type { SkillInfoStepProps } from "./SkillInfoStep";

// Step 1: 会話ラリー
export { ConversationRoundStep } from "./ConversationRoundStep";
export type { ConversationRoundStepProps } from "./ConversationRoundStep";

// 完了画面
export { CompleteStep } from "./CompleteStep";
export type { CompleteStepProps } from "./CompleteStep";

// 既存コンポーネント（継続）
export { StepIndicator, stepStateStyles } from "./StepIndicator";
export type { StepState, StepIndicatorProps } from "./StepIndicator";

// ※ GenerationMode 等 @repo/shared に移動済みの型はここからは export しない
```

主なポイント:

- `export type` は型のみ、`export` はコンポーネント（値 + 型）に使い分ける
- `@repo/shared` に移動済みの型定義はここから再エクスポートせず、利用側で直接 import する
- 不要になったコンポーネントの export は削除し、import エラーが出ないことを typecheck で確認する

#### Task 12-2: システム仕様書更新

- `task-workflow-completed.md` へ本タスク完了記録を追記
- `task-workflow-backlog.md` のステータスを `completed` に更新

#### Task 12-3: ドキュメント更新履歴

- `outputs/phase-12/documentation-changelog.md` を作成する

#### Task 12-4: 未タスク検出レポート（0件でも出力必須）

- `outputs/phase-12/unassigned-task-detection.md` を作成する
- Phase 10/11 の MINOR 指摘事項を未タスク候補として記録する

#### Task 12-5: スキルフィードバックレポート（改善点なしでも出力必須）

- `outputs/phase-12/skill-feedback-report.md` を作成する
- `phase12-task-spec-compliance-check.md` を root evidence として残す

#### 成果物

| ファイル                                                 | 内容                                               |
| -------------------------------------------------------- | -------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド Part1（中学生レベル） + Part2（技術者） |
| `outputs/phase-12/system-spec-update-summary.md`         | システム仕様書更新サマリー                         |
| `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴                               |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート（0件でも出力必須）            |
| `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバックレポート（改善点なしでも必須） |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック（root evidence）             |

#### 完了条件

- 上記 6ファイルが全て作成されている
- `outputs/artifacts.json` と `outputs/phase-12/` が同期されている
- LOGS.md（2ファイル）と SKILL.md（2ファイル）が同一ターンで更新されている

---

### Phase 13: PR 作成

**ステータス**: blocked

> **重要**: PR 作成はユーザーの明示的な承認後のみ実施する。自動実行しない。

#### 完了条件

- ユーザーの承認を得た後に PR が作成されている
- CI が PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AC-1: `SkillInfoStep` が `wizard/index.ts` から import 可能
- [ ] AC-2: `ConversationRoundStep` が `wizard/index.ts` から import 可能
- [ ] AC-3: Wave 2 廃止コンポーネント・型が `wizard/index.ts` から削除されている
- [ ] AC-4: `@repo/shared` と重複するエクスポートが除去されている

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS

### ドキュメント要件（Phase 12）

- [ ] `outputs/phase-12/implementation-guide.md`（Part1/Part2 両方）
- [ ] `outputs/phase-12/system-spec-update-summary.md`
- [ ] `outputs/phase-12/documentation-changelog.md`
- [ ] `outputs/phase-12/unassigned-task-detection.md`（0件でも出力必須）
- [ ] `outputs/phase-12/skill-feedback-report.md`（改善点なしでも出力必須）

---

## 6. 検証方法

### 自動検証

```bash
# desktop パッケージの型チェック
pnpm --filter @repo/desktop typecheck

# desktop パッケージの lint
pnpm --filter @repo/desktop lint

# shared パッケージとの整合確認
pnpm --filter @repo/shared typecheck
```

### NON_VISUAL 手動確認

`SkillCreateWizard.tsx` の import 文で `SkillInfoStep`・`ConversationRoundStep` が
解決されることを typecheck ログで確認する。

---

## 7. リスクと対策

| リスク                                                                          | 影響度 | 発生確率 | 対策                                                                                        |
| ------------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------- |
| Wave 1/2 の先行タスクが未完了のまま着手してしまう                               | 高     | 中       | Phase 1 の前提チェックリストで全先行タスクの完了を確認してから着手する                      |
| `@repo/shared` に移動された型を `wizard/index.ts` から re-export して重複エラー | 高     | 中       | `packages/shared/src/index.ts` を事前確認し、同名の型が存在する場合はバレルから除外する     |
| 削除した export を他コンポーネントが参照していた（import エラー）               | 高     | 低       | `pnpm --filter @repo/desktop typecheck` で削除前に参照元がないことを確認する                |
| `SkillCategory` 等の既存型との名前衝突                                          | 中     | 低       | Phase 3 のレビューチェックリストで名前衝突を事前に確認する。衝突する場合は alias を使用する |
| バレルファイルの変更で循環 import が発生する                                    | 中     | 低       | 追加する export が `wizard/index.ts` 自身を参照していないことを確認する                     |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/components/skill/wizard/index.ts` — 変更対象ファイル
- `apps/desktop/src/renderer/components/skill/wizard/` — ウィザードコンポーネント群
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` — バレルの主要 import 先
- `packages/shared/src/index.ts` — `@repo/shared` root エクスポート（重複確認用）
- `docs/30-workflows/skill-wizard-redesign-lane/index.md` — lane 全体設計（依存 Wave 確認）

### 関連タスク

| タスクID/Wave | 関係     | 内容                                                     |
| ------------- | -------- | -------------------------------------------------------- |
| W0-seq-01     | 先行完了 | 型定義（SkillInfoFormData 等）追加                       |
| W0-seq-02     | 先行完了 | `inferSmartDefaults` サービス（`@repo/shared` から公開） |
| W1-par-02a    | 先行必須 | `SkillInfoStep.tsx` 実装                                 |
| W1-par-02b    | 先行必須 | `ConversationRoundStep.tsx` 実装                         |
| W1-par-02c    | 先行必須 | `CompleteStep.tsx` 再設計                                |
| W2-seq-03a    | 先行必須 | `SkillCreateWizard.tsx` オーケストレーション完成         |

---

## 9. 備考

### 苦戦箇所【記入必須】

> 実行時に迷った点・判断に時間がかかった点・再利用したい回避策を具体的に記録してください。

| 項目     | 内容（事前想定）                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------------------- |
| 症状     | バレルファイルのエクスポートに `SkillCategory`（既存型）と同名の型を追加しようとしてエラーが出る                     |
| 原因     | `@repo/shared/types` に同名の型が既に存在しており、バレルからの re-export と衝突した                                 |
| 対応     | `wizard/index.ts` からの re-export に alias を付けるか、バレルからの再エクスポートを省略して利用側が直接 import する |
| 再発防止 | バレルに型を追加する前に必ず `@repo/shared` の export 一覧を確認する                                                 |

| 項目     | 内容（事前想定）                                                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| 症状     | `GenerationMode` 等のローカル型定義を `wizard/index.ts` から削除したら利用側でエラーが出た                    |
| 原因     | `SkillCreateWizard.tsx` が `wizard/index.ts` 経由でその型を import していたため                               |
| 対応     | 削除前に `import from "./wizard"` の参照元を grep で洗い出し、`@repo/shared` への import 変更を先に完了させる |
| 再発防止 | export 削除は必ず「参照先がない」ことを typecheck または grep で確認してから行う                              |

| 項目     | 内容（Phase 12 close-out 教訓より）                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------ |
| 症状     | バレルファイルのみの変更のため「変更が小さい」と思い、Phase 12 の documentation-changelog を省略しがちになる |
| 原因     | 小さな変更ほど記録が疎かになりやすい                                                                         |
| 対応     | Phase 12 では変更前後の export 一覧（diff 形式）を必ず `documentation-changelog.md` に記録する               |
| 再発防止 | Phase 12 テンプレートに「バレルファイル変更時も changelog 必須」を明記する                                   |

### 補足事項

- 本タスクは `skill-wizard-redesign-lane` の Wave 2 完了後に発生する後処理タスクである。
- タスク分類は NON_VISUAL（バレルファイルのみの変更）のため、Phase 11 は console / typecheck 証跡で代替する。
- Phase 13（PR 作成）は `skill-wizard-redesign-lane` の Wave 3（`W3-seq-04`）完了後に
  lane 全体の PR と統合することを検討してもよい。
