# [#1379] "[UT-RAG-08-013] SF-07 RelevanceEvaluator Error throw 修正"

## メタ情報

```yaml
task_id: UT-RAG-08-013
task_name: SF-07 RelevanceEvaluator Error throw 修正
category: バグ修正
target_feature: RAG / CRAG / relevance-evaluator
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 10 最終レビュー MINOR P10-M02（TASK-08-RAG-EMBEDDING）
created_date: 2026-03-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-rag-08-013-relevance-evaluator-sf07-fix.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-08-RAG-EMBEDDING の Phase 10 最終レビューで MINOR 指摘 P10-M02 として検出された。

`relevance-evaluator.ts` の設計目標は、評価スコアが閾値を超えた場合に `Error` を throw することだが、実際の実装は `score = 5` に設定してから警告ログを出力する動作になっている。

**設計書の意図（期待される動作）**:

```typescript
// 評価スコアが無効な場合（例: undefined, NaN, 範囲外）
throw new Error("Invalid relevance score: ...");
```

**実際の実装（現在の動作）**:

```typescript
// SF-07 監視分類: score = 5 にフォールバック + warn ログ
score = 5;
console.warn("Invalid relevance score, falling back to 5");
```

### 1.2 問題点・課題

**SF-07 silent fallback の3分類判定**:

L-RAG-03 の教訓として、silent fallback には3つの分類がある：

1. **監視型（SF-07）**: 問題を記録してフォールバック値で継続する（許容）
2. **完全サイレント型**: 問題を記録せずにフォールバックする（要改善）
3. **エラー伝播型**: 問題をエラーとして上位に伝播する（設計意図に応じて）

現在の実装は「監視型（SF-07）」に分類されているが、設計書は「エラー伝播型」を意図している。この乖離が P50（既実装防御の発見による Phase 転換）と類似したパターンを生んでいる。

**なぜ設計書通り Error throw が必要か**:

- relevance-evaluator が無効スコアを返した場合、CRAG パイプライン全体の検索結果品質が保証できない
- `score = 5` へのフォールバックは「中程度の関連性」として扱われ、低品質なチャンク（実際は評価不能）が検索結果に含まれる可能性がある
- 呼び出し元がエラーをキャッチして適切にフォールバック処理を行う機会を奪っている

**設計書との乖離の発見が遅延した経緯**:

Phase 5（実装）では L-RAG-03 の判断基準に基づいて SF-07（監視型）として実装された。しかし Phase 10 のレビューで設計書との乖離が確認された（P50 パターン）。

### 1.3 放置した場合の影響

**短期的影響**:

- 無効スコアが `score = 5` として処理され、CRAG の検索結果品質が低下する可能性がある
- 設計書と実装の乖離が継続し、将来の機能追加時に誤解を招く

**中長期的影響**:

- CRAG の検索精度に関するバグが設計書から追跡できなくなる
- `score = 5` のフォールバック動作を前提とした下流コードが増殖するリスク

**影響度**: 中（CRAG 検索の品質に直接影響する可能性があるが、現時点では顕在化していない）

---

## 2. 何を達成するか（What）

### 2.1 目的

`relevance-evaluator.ts` の無効スコア処理を設計書通り `Error` を throw する実装に修正し、設計書と実装の乖離を解消する。

### 2.2 最終ゴール

- 無効スコア（undefined, NaN, 範囲外等）の場合に `Error` を throw する
- 呼び出し元が適切なエラーハンドリングを行える状態にする
- SF-07 監視ログは維持しつつ、その後に `Error` を throw する実装にする
- 対応するテストを追加・更新する

### 2.3 スコープ

#### 含むもの

- `relevance-evaluator.ts` の無効スコア処理の修正
- 修正に対応するユニットテストの追加・更新
- 呼び出し元での `Error` キャッチの確認（必要に応じて対応）

#### 含まないもの

- relevance-evaluator の評価アルゴリズム自体の変更
- CRAG パイプライン全体のエラーハンドリング設計変更
- SF-07 分類基準の変更（L-RAG-03 の判断基準の変更）

### 2.4 成果物

1. 修正された `packages/shared/src/services/search/crag/relevance-evaluator.ts`
2. 更新された `packages/shared/src/services/search/crag/__tests__/relevance-evaluator.test.ts`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] `relevance-evaluator.ts` の現行実装を全件読み込んでから作業を開始する
- [ ] 設計書の期待動作を確認する（TASK-08-RAG-EMBEDDING の Phase 2 設計ドキュメント）
- [ ] 呼び出し元のエラーハンドリング実装を確認する（`grep -rn "relevanceEvaluator\|RelevanceEvaluator" packages/shared/src/`）
- [ ] 既存テストを全件読み込んでから修正する

### 3.2 依存タスク

- TASK-08-RAG-EMBEDDING が完了していること
- 他のテスト追加タスク（UT-RAG-08-001, UT-RAG-08-006 等）とは独立して実行可能

### 3.3 必要な知識・スキル

- CRAG（Corrective RAG）パイプラインの基本理解
- TypeScript のエラーハンドリングパターン
- Vitest によるユニットテスト（エラー throw のテスト方法）
- P50（既実装防御の発見による Phase 転換）の理解

### 3.4 推奨アプローチ

1. **現行実装の把握**: `relevance-evaluator.ts` を読み込んで無効スコア処理箇所を特定する
2. **呼び出し元の確認**: エラーが throw された場合の呼び出し元の動作を確認する
3. **テスト先行**: Error throw を期待するテストを先に作成してから実装を修正する（TDD）
4. **修正実装**: SF-07 ログを維持しつつ、その後に Error を throw する実装に変更する
5. **呼び出し元の対応**: 必要に応じて呼び出し元に try-catch を追加する

### 3.5 苦戦ポイント（過去の教訓）

**L-RAG-03: silent fallback の3分類判定と SF-07 の位置づけ**

SF-07 は「監視型」として分類されているが、設計書は「エラー伝播型」を意図している。この判断の乖離は Phase 5 実装時に発生した。修正の際は：

1. SF-07 の warn ログを削除せず維持する（監視として有用）
2. ログ出力後に `Error` を throw する実装に変更する
3. 呼び出し元が Error をキャッチして適切に処理できることを確認する

```typescript
// 現在の実装（SF-07 監視型）
if (isInvalidScore(score)) {
  this.logger.warn("Invalid relevance score, falling back to 5", { score });
  return 5; // ← これが問題
}

// 修正後の実装（SF-07 + エラー伝播型）
if (isInvalidScore(score)) {
  this.logger.warn("Invalid relevance score detected", { score });
  throw new Error(`Invalid relevance score: ${score}`); // ← 設計書通り
}
```

**P50: 既実装防御の発見による Phase 転換**

現在の `score = 5` フォールバックが実際に使われているケースが存在する可能性がある。修正前に呼び出し元を全件確認して影響範囲を把握すること：

```bash
grep -rn "RelevanceEvaluator\|relevanceEvaluator\|evaluateRelevance" \
  packages/shared/src/services/search/
```

もし呼び出し元が Error を想定していない場合、呼び出し元への try-catch 追加もスコープに含める。

**P19: non-null assertion による安全性偽装**

修正コード内で `score!` や `result!.score` のような non-null assertion を使わないこと（P48 参照）。

---

## 4. Phase 構成

### Phase 1: 調査・設計

**目的**: 現行実装と設計書の乖離を定量化し、修正範囲を決定する

**実行手順**:

1. `relevance-evaluator.ts` の無効スコア処理箇所を特定する
2. 呼び出し元を全件列挙する
3. 呼び出し元のエラーハンドリング有無を確認する

```bash
# 呼び出し元の確認
grep -rn "RelevanceEvaluator\|relevanceEvaluator\|evaluateRelevance" \
  packages/shared/src/services/search/crag/

# テスト内の呼び出し元
grep -rn "RelevanceEvaluator\|relevanceEvaluator" \
  packages/shared/src/services/search/crag/__tests__/
```

4. 設計書の期待動作を確認する

**成果物**:

- 修正箇所・影響範囲の一覧

**完了条件**:

- [ ] 無効スコア処理箇所が特定されている
- [ ] 呼び出し元が全件列挙されている
- [ ] 呼び出し元でエラーハンドリングが必要かどうか判断されている

### Phase 2: テスト修正・追加（TDD）

**目的**: Error throw を期待するテストを先行作成する

**テスト設計**:

```typescript
describe("RelevanceEvaluator", () => {
  describe("無効スコアの処理", () => {
    it("スコアが undefined の場合 Error を throw する", async () => {
      // モック設定で undefined を返すようにする
      await expect(evaluator.evaluate(text, context)).rejects.toThrow(
        "Invalid relevance score",
      );
    });

    it("スコアが NaN の場合 Error を throw する", async () => {
      await expect(evaluator.evaluate(text, context)).rejects.toThrow(
        "Invalid relevance score",
      );
    });

    it("スコアが範囲外（例: -1）の場合 Error を throw する", async () => {
      await expect(evaluator.evaluate(text, context)).rejects.toThrow(
        "Invalid relevance score",
      );
    });

    it("warn ログが出力されてから Error が throw される", async () => {
      // SF-07 監視ログが維持されていることを確認
      await expect(evaluator.evaluate(text, context)).rejects.toThrow();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining("Invalid relevance score"),
      );
    });
  });

  describe("正常スコアの処理（既存テストの維持）", () => {
    it("有効なスコアはそのまま返す");
    it("スコア 0 は有効値として処理する");
    it("スコア 10 は有効値として処理する");
  });
});
```

**成果物**:

- 更新された `relevance-evaluator.test.ts`（RED 状態）

**完了条件**:

- [ ] Error throw を期待するテストが追加されている
- [ ] テストが RED 状態（実装変更前は失敗）である

### Phase 3: 実装修正

**目的**: SF-07 ログを維持しつつ Error を throw する実装に変更する

**実行手順**:

1. 無効スコア処理箇所を修正する（ログ維持 + Error throw）
2. 呼び出し元に try-catch が必要な場合は追加する
3. non-null assertion を使わないことを確認する（P48/P19 対策）

**成果物**:

- 修正された `relevance-evaluator.ts`
- 必要に応じて修正された呼び出し元ファイル

**完了条件**:

- [ ] 無効スコアで Error が throw されるように修正されている
- [ ] SF-07 warn ログが維持されている
- [ ] 呼び出し元が適切に Error をキャッチしている

### Phase 4: 検証

**目的**: 修正が設計書通りであり、既存テストへの影響がないことを確認する

**実行手順**:

1. テストを実行して GREEN 状態になることを確認する
2. 全テストを実行してリグレッションがないことを確認する
3. 型チェックを実行する

```bash
cd packages/shared
pnpm vitest run src/services/search/crag/__tests__/relevance-evaluator.test.ts
pnpm vitest run
pnpm typecheck
```

**完了条件**:

- [ ] relevance-evaluator のテストが全件 PASS
- [ ] 既存テストへの影響がない
- [ ] 型チェックがエラーなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 無効スコア（undefined, NaN, 範囲外）で Error が throw される
- [ ] SF-07 warn ログが維持されている
- [ ] 呼び出し元が Error を適切に処理している

### 品質要件

- [ ] Error throw のテストが追加されている
- [ ] 警告ログ出力の確認テストが含まれている
- [ ] 正常系テストが維持されている
- [ ] 全テストが PASS している
- [ ] `pnpm typecheck` がエラーなし

### ドキュメント要件

- [ ] LOGS.md が2ファイル（.claude/ と .agents/）更新されている
- [ ] documentation-changelog.md が更新されている

---

## 6. 検証方法

### テストケース

| No  | シナリオ             | 入力      | 期待結果                              |
| --- | -------------------- | --------- | ------------------------------------- |
| 1   | スコアが undefined   | undefined | Error を throw、warn ログが出力される |
| 2   | スコアが NaN         | NaN       | Error を throw、warn ログが出力される |
| 3   | スコアが範囲外（-1） | -1        | Error を throw、warn ログが出力される |
| 4   | スコアが範囲外（11） | 11        | Error を throw、warn ログが出力される |
| 5   | スコアが有効値（0）  | 0         | そのまま 0 を返す（エラーなし）       |
| 6   | スコアが有効値（10） | 10        | そのまま 10 を返す（エラーなし）      |

### 検証コマンド

```bash
# relevance-evaluator のテスト実行
cd packages/shared
pnpm vitest run src/services/search/crag/__tests__/relevance-evaluator.test.ts

# 全テスト実行（リグレッション確認）
pnpm vitest run src/services/search/

# 型チェック
pnpm typecheck
```

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                 |
| ---------------------------------------- | ------ | -------- | ---------------------------------------------------- |
| 呼び出し元のエラーハンドリング不在       | 高     | 中       | 呼び出し元を全件確認し、必要に応じて try-catch 追加  |
| `score = 5` フォールバックへの依存コード | 中     | 低       | grep で依存箇所を全件特定してから修正する            |
| SF-07 ログ削除による監視機能の喪失       | 中     | 低       | ログを維持してから Error throw する実装を採用する    |
| 修正により他の CRAG テストが失敗する     | 中     | 中       | 修正前に全テストを実行して現状を把握してから着手する |
| non-null assertion の混入（P48/P19）     | 低     | 低       | コードレビュー時に `!` 演算子を grep で確認する      |

---

## 8. 参照情報

### 関連 Pitfall

- P50: 既実装防御の発見による Phase 転換
- P19: 型キャスト（as）による実行時検証バイパス
- P48: Non-null assertion による安全性偽装

### 対象ファイル

- `packages/shared/src/services/search/crag/relevance-evaluator.ts`
- `packages/shared/src/services/search/crag/__tests__/relevance-evaluator.test.ts`

### 関連ドキュメント

- `.claude/rules/02-code-quality.md` — エラーハンドリング原則（Result パターン）

---

## 9. 備考

### 発見経緯

TASK-08-RAG-EMBEDDING Phase 10 最終レビューで MINOR P10-M02 として検出。L-RAG-03（silent fallback 分類）の判断で Phase 5 実装時に SF-07 監視型として実装されたが、Phase 10 で設計書との乖離が確認されたため未タスクとして切り出した。

### SF-07 分類の見直しについて

本タスクは SF-07 の分類を「監視型」から「エラー伝播型」に変更することを意味する。この変更は L-RAG-03 の判断基準を否定するものではなく、relevance-evaluator の特定ケースにおいて設計書の意図が「エラー伝播」であることを再確認したものである。

他の SF-07 分類されたフォールバック（tiktoken 失敗時の簡易推定等）は影響を受けない。

### 修正後の Error メッセージ形式

エラーメッセージは以下の形式を推奨（呼び出し元での解析・ログ収集に対応するため）：

```
Invalid relevance score: ${score} (expected: 0-10, type: ${typeof score})
```

### Phase 12 完了後の作業

- `.claude/skills/` と `.agents/skills/` を rsync で同期すること（MEMORY.md の Mirror Sync 手順参照）
- LOGS.md 2ファイル更新を忘れないこと（P1/P25 対策）
