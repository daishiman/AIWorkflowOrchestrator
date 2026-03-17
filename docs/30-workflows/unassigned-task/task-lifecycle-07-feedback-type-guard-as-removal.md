# UT-FIX-FEEDBACK-TYPE-GUARD-AS-REMOVAL-001 フィードバック型ガードの as キャスト除去 - タスク指示書

## メタ情報

```yaml
issue_number: 1257
```

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | UT-FIX-FEEDBACK-TYPE-GUARD-AS-REMOVAL-001           |
| タスク名     | フィードバック型ガードの as キャスト除去（P49準拠） |
| 分類         | 改善                                                |
| 対象機能     | SkillFeedback 型ガード（isImprovementSuggestion）   |
| 優先度       | 低                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 未実施                                              |
| 発見元       | TASK-SKILL-LIFECYCLE-07 Phase 10 MINOR FR-M-01      |
| 発見日       | 2026-03-16                                          |
| 関連タスク   | TASK-SKILL-LIFECYCLE-07                             |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-07 の Phase 10 最終レビューで MINOR 判定 FR-M-01 として検出された。`feedback-model-impl-spec.md` の `isImprovementSuggestion()` 型ガード実装仕様に `as Record<string, unknown>` キャストが含まれており、P49（type predicate 内での as キャスト禁止）に違反している。

### 1.2 問題点・課題

`as Record<string, unknown>` はコンパイル時の型チェックを通過させるが、実行時の安全性を保証しない。`item` が実際にオブジェクトでない場合にプロパティアクセスが `undefined` を返し、意図しない falsy 判定となる可能性がある。P49 で規定された `in` 演算子による実行時プロパティ存在検証を使用すべき。

### 1.3 放置した場合の影響

- 実装時に仕様書の型ガードパターンをそのままコピーすると、実行時の型安全性が不十分なコードが生成される
- P49 違反のコードパターンがプロジェクト内に新たに伝播するリスクがある

## 2. 何を達成するか（What）

### 2.1 目的

`isImprovementSuggestion()` の型ガード実装仕様を P49 準拠の `in` 演算子パターンに変更する。

### 2.2 最終ゴール

`feedback-model-impl-spec.md` 内の型ガード仕様から `as Record<string, unknown>` が除去され、`in` 演算子による実行時検証パターンに置換されている。

### 2.3 スコープ

#### 含むもの

- `feedback-model-impl-spec.md` の `isImprovementSuggestion()` 型ガード仕様の修正
- 実装時の `feedback-types.ts`（該当する場合）の同パターン修正

#### 含まないもの

- 他の型ガード関数の修正（本タスクのスコープ外で別途調査が必要な場合は未タスク化する）
- フィードバック機能の動作変更

### 2.4 成果物

- 修正済み `feedback-model-impl-spec.md`（型ガード仕様部分）
- 実装コードが存在する場合は修正済み `feedback-types.ts`

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-07 の成果物が確定していること
- P49 パターン（`06-known-pitfalls.md#P49`）を理解していること
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` のライフサイクル型定義セクションを確認済みであること

### 3.2 依存タスク

なし。

### 3.3 必要な知識

- TypeScript type predicate（ユーザー定義型ガード）
- P49: `as` キャストと `in` 演算子の使い分け

### 3.4 推奨アプローチ

仕様書内の型ガードコードブロックを以下のパターンに変更する:

```typescript
// 変更前（P49 違反）
const isImprovementSuggestion = (
  item: unknown,
): item is ImprovementSuggestion =>
  typeof (item as Record<string, unknown>).suggestion === "string";

// 変更後（P49 準拠）
const isImprovementSuggestion = (
  item: unknown,
): item is ImprovementSuggestion =>
  item != null &&
  typeof item === "object" &&
  "suggestion" in item &&
  typeof item.suggestion === "string";
```

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                            | 発見経緯                                               | 解決策                                         | 教訓                                           |
| ----------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------- |
| 仕様書内の型ガードに as キャストが混入          | Phase 10 最終レビューで P49 違反として検出             | `in` 演算子パターンに置換                      | 設計段階から P49 準拠を意識する                |
| Phase 12 サブエージェントが実ファイル更新を保留 | Phase 12 Step 2 で仕様書更新が計画のみで保留された     | 設計タスクでも Phase 12 の実ファイル更新は必須 | サブエージェントに「計画記録のみ」を許容しない |
| Phase 3 MINOR の追跡が Phase 横断で消失         | Phase 3→5→9→10 の4Phase横断で MINOR 対応状況が不明確に | Phase 5 完了時に MINOR 追跡マトリクスを作成    | MINOR 3件以上は追跡マトリクス必須              |

## 4. 実行手順

### Phase構成

仕様修正 -> 検証。

### Phase 1: 型ガード仕様の修正

#### 目的

P49 違反の型ガードパターンを修正する。

#### 手順

1. `feedback-model-impl-spec.md` 内の `isImprovementSuggestion()` 仕様を確認する
2. `as Record<string, unknown>` を `in` 演算子パターンに置換する
3. 実装ファイル（`feedback-types.ts` 等）が存在する場合は同様に修正する
4. `grep -rn "as Record<string, unknown>" docs/30-workflows/skill-lifecycle-unification/` で残存箇所がないか確認する

#### 成果物

- 修正済み仕様書
- 修正済み実装コード（存在する場合）

#### 完了条件

- 対象ファイルに `as Record<string, unknown>` パターンが残存していない
- 型ガードが `in` 演算子による実行時検証を使用している

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `isImprovementSuggestion()` が `in` 演算子パターンで定義されている
- [ ] `as Record<string, unknown>` が対象ファイルから除去されている

### 品質要件

- [ ] 型ガードが null チェック -> typeof object チェック -> in 演算子の3段階で検証している

### ドキュメント要件

- [ ] 変更内容が変更履歴に記録されている

## 6. 検証方法

### テストケース

- Case 1: `grep -rn "as Record<string, unknown>" feedback-model-impl-spec.md` が 0 件
- Case 2: 型ガードが P49 準拠パターンに合致する

### 検証手順

1. 対象ファイルで `as` キャストの残存を grep 確認する
2. 型ガード関数が `in` 演算子を使用していることを目視確認する

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                              |
| ---------------------------------------- | ------ | -------- | ----------------------------------------------------------------- |
| 他の型ガード関数にも同パターンが存在する | 低     | 中       | grep で全仕様書を横断検索し、追加修正が必要な場合は未タスク化する |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/` 配下の Phase 10 成果物
- `.claude/rules/06-known-pitfalls.md#P49` — type predicate 内の as キャスト禁止
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` — ライフサイクル型定義セクション
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — TASK-SKILL-LIFECYCLE-07 教訓セクション

### 参考資料

- `.claude/rules/02-code-quality.md#TypeScript型安全`

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 10 MINOR FR-M-01: isImprovementSuggestion() の as Record<string, unknown> キャストが P49 違反
```

### 補足事項

設計タスクのため、仕様書の修正が主対象。実装コードが存在する場合は同時に修正する。
