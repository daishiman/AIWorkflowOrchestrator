# openai-provider ユニットテスト追加 - タスク指示書

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | UT-RAG-08-007                                   |
| タスク名     | openai-provider ユニットテスト追加              |
| 分類         | テスト                                          |
| 対象機能     | RAG / embedding / openai-provider               |
| 優先度       | 低                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 7 カバレッジ確認（TASK-08-RAG-EMBEDDING） |
| 発見日       | 2026-03-19                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-08-RAG-EMBEDDING の Phase 7 カバレッジ確認で、embedding 全体の Funcs カバレッジが 78.82%（基準: 80%）と基準未達となった。

主な原因は `openai-provider.ts` の未テスト関数にある。当該ファイルには tiktoken によるトークンカウントと、失敗時の簡易推定（silent fallback）ロジックが含まれており、これらの関数がテストされていない状態だった。

Phase 7 では SCF（Selective Coverage Filter）でゲート通過したが、未テスト関数が残存している。

### 1.2 問題点・課題

**未テストの主要関数候補**:

1. **tiktoken カウント関数**: OpenAI のトークナイザーを使用してテキストのトークン数を計算する関数
2. **簡易推定フォールバック関数**: tiktoken 失敗時に文字数ベースで推定する silent fallback ロジック
3. **その他プロバイダー固有関数**: バッチ処理、エラーハンドリング等

**silent fallback の設計意図**:

L-RAG-03 の教訓として、tiktoken 失敗時の簡易推定 silent fallback は graceful degradation として許容されている。ただし「許容」は「テスト不要」を意味しない。テストはその設計意図（graceful degradation が正しく機能すること）を検証する目的で作成する。

### 1.3 放置した場合の影響

**短期的影響**:

- embedding Funcs カバレッジが 78.82% のまま継続する
- tiktoken 失敗時のフォールバック動作が未検証のまま本番稼働する

**中長期的影響**:

- openai-provider に機能追加する際にリグレッションリスクが高まる
- silent fallback の仕様が実装コメントにしか存在せず、テストによる仕様明文化ができない

**影響度**: 低（機能は正常動作しているが、フォールバック動作の検証が不十分）

---

## 2. 何を達成するか（What）

### 2.1 目的

`openai-provider.ts` の未テスト関数にユニットテストを追加し、embedding 全体の Funcs カバレッジを基準値（80%）以上に引き上げる。特に tiktoken フォールバックの graceful degradation が正しく機能することをテストで保証する。

### 2.2 最終ゴール

- embedding 全体の Funcs カバレッジ: 80% 以上
- tiktoken 正常系・失敗時フォールバックの両パスをテストでカバーする
- openai-provider.ts の主要関数（バッチ処理、エラーハンドリング等）をテストする

### 2.3 スコープ

#### 含むもの

- `openai-provider.ts` の未テスト関数の特定
- `openai-provider.test.ts` への追加テストケース作成
- tiktoken の正常系テスト
- tiktoken 失敗時フォールバックテスト（graceful degradation の検証）

#### 含まないもの

- openai-provider.ts 本体の実装変更
- 他のプロバイダー（qwen3-provider 等）のテスト追加（別タスク化を推奨）
- 統合テストや E2E テストの追加

### 2.4 成果物

1. 更新された `packages/shared/src/services/embedding/__tests__/openai-provider.test.ts`（または新規作成）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] `openai-provider.ts` の現行実装を全件読み込んでから作業を開始する
- [ ] 既存のテストファイルが存在する場合は読み込んでから追加する
- [ ] カバレッジレポートを実行して未テスト関数を特定する
- [ ] TASK-08-RAG-EMBEDDING が完了していること

### 3.2 依存タスク

- TASK-08-RAG-EMBEDDING（openai-provider の実装基盤）
- 他のテスト追加タスク（UT-RAG-08-008 等）とは独立して実行可能

### 3.3 必要な知識・スキル

- tiktoken ライブラリの基本動作（テスト環境でのモック方法）
- Vitest の `vi.mock` によるモジュールモック
- graceful degradation パターンのテスト設計
- P40（テスト実行ディレクトリ依存）の理解

### 3.4 推奨アプローチ

1. **調査フェーズ**: `openai-provider.ts` の全関数を把握し、テスト済み・未テストを分類する
2. **tiktoken モック設計**: テスト環境での tiktoken の扱いを確認する（`vi.mock` または実際の tiktoken を使用）
3. **テスト実装**: 正常系 → tiktoken エラー → フォールバック の順でテストを追加する
4. **カバレッジ確認**: 追加後にカバレッジが 80% 以上になることを確認する

### 3.5 苦戦ポイント（過去の教訓）

**L-RAG-03: tiktoken 失敗時の簡易推定 silent fallback は graceful degradation として許容**

このフォールバックが「許容」されているのは設計上の意図であり、「テスト不要」ではない。テストの目的は「フォールバックが設計通りに機能すること」を検証することにある。

具体的には：

- tiktoken が正常に動作する場合: 正確なトークン数を返す
- tiktoken が失敗する場合: 文字数ベースの簡易推定値を返す（エラーを throw しない）

**P40: テスト実行ディレクトリ依存**

```bash
# 正しい実行方法（packages/shared ディレクトリから実行）
cd packages/shared
pnpm vitest run src/services/embedding/__tests__/openai-provider.test.ts

# またはフィルター指定
pnpm --filter @repo/shared exec vitest run src/services/embedding/__tests__/openai-provider.test.ts
```

`packages/shared` ディレクトリの `vitest.config.ts` が適用されないと、エイリアス解決に失敗する。

**tiktoken のモック戦略**:

```typescript
// tiktoken を vi.mock でモックする場合の例
vi.mock("tiktoken", () => ({
  get_encoding: vi.fn().mockReturnValue({
    encode: vi.fn().mockReturnValue(new Uint32Array([1, 2, 3, 4, 5])),
    free: vi.fn(),
  }),
  encoding_for_model: vi.fn(),
}));

// エラー発生時のテスト
vi.mock("tiktoken", () => ({
  get_encoding: vi.fn().mockImplementation(() => {
    throw new Error("tiktoken initialization failed");
  }),
}));
```

**P63: サブエージェントによるインポートパス誤り**

テスト作成時は既存の embedding テストファイルのインポートパスを必ず参照すること：

```bash
grep -n "^import" packages/shared/src/services/embedding/__tests__/*.test.ts | head -20
```

---

## 4. Phase 構成

### Phase 1: 調査

**目的**: 未テスト関数を特定し、tiktoken のモック戦略を決定する

**実行手順**:

1. `openai-provider.ts` の全関数一覧を作成する
2. 既存テストファイルの有無を確認する
3. カバレッジ計測で未テスト関数を特定する

```bash
cd packages/shared
pnpm vitest run --coverage \
  --coverage.include="src/services/embedding/**/*provider*" \
  2>&1 | tail -30
```

4. tiktoken の現行のモック/実装使用方法を確認する

**成果物**:

- 未テスト関数の一覧

**完了条件**:

- [ ] 未テスト関数が特定されている
- [ ] tiktoken のモック戦略が決定されている

### Phase 2: テスト作成

**目的**: 未テスト関数のテストを追加する

**実行手順**:

1. 既存テストファイルのインポートパスを確認する（P63 対策）
2. tiktoken 正常系テストを追加する
3. tiktoken 失敗時フォールバックテストを追加する（graceful degradation の検証）
4. その他の未テスト関数のテストを追加する

**テスト設計の指針**:

```typescript
describe("トークンカウント", () => {
  describe("tiktoken 正常系", () => {
    it("テキストのトークン数を正確に返す", async () => {
      // tiktoken が正常に動作する場合のテスト
    });
  });

  describe("tiktoken 失敗時フォールバック（graceful degradation）", () => {
    it("tiktoken 初期化失敗時に簡易推定値を返す", async () => {
      // tiktoken がエラーを throw する場合のテスト
      // エラーが propagate されないこと（silent fallback）を検証
    });

    it("フォールバック値はゼロではないこと", async () => {
      // 推定値の妥当性を検証
    });
  });
});
```

**成果物**:

- 更新された `openai-provider.test.ts`

**完了条件**:

- [ ] tiktoken 正常系テストが追加されている
- [ ] tiktoken フォールバックテストが追加されている
- [ ] graceful degradation（エラーが外部に伝播しない）が検証されている

### Phase 3: カバレッジ確認

**目的**: embedding 全体の Funcs カバレッジが 80% 以上になったことを確認する

**実行手順**:

1. embedding 全体のカバレッジを計測する
2. 80% 未達の場合は Phase 2 に戻る

```bash
cd packages/shared
pnpm vitest run --coverage \
  --coverage.include="src/services/embedding/**" \
  src/services/embedding/__tests__/
```

**完了条件**:

- [ ] embedding Funcs カバレッジ >= 80%
- [ ] 全テストが PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] openai-provider.ts の主要関数がテストされている
- [ ] tiktoken 正常系テストが存在する
- [ ] tiktoken 失敗時フォールバックのテストが存在する
- [ ] graceful degradation の動作がテストで検証されている

### 品質要件

- [ ] embedding 全体の Funcs カバレッジ >= 80%
- [ ] 全テストが PASS している
- [ ] テスト間で状態が共有されていない（beforeEach リセット）
- [ ] `pnpm typecheck` がエラーなし

### ドキュメント要件

- [ ] LOGS.md が2ファイル更新されている
- [ ] documentation-changelog.md が更新されている

---

## 6. 検証方法

### カバレッジ計測

```bash
# embedding プロバイダーのみのカバレッジ
cd packages/shared
pnpm vitest run --coverage \
  --coverage.include="src/services/embedding/**/*provider*"

# embedding 全体のカバレッジ
pnpm vitest run --coverage \
  --coverage.include="src/services/embedding/**"
```

### 期待するカバレッジ値

| 対象ファイル    | 現在値 | 目標値 |
| --------------- | ------ | ------ |
| openai-provider | 未測定 | >= 80% |
| embedding 全体  | 78.82% | >= 80% |

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                                   |
| --------------------------------- | ------ | -------- | ------------------------------------------------------ |
| tiktoken モックの複雑性           | 中     | 中       | 既存テストの tiktoken モックパターンを参照する         |
| テスト実行ディレクトリ問題（P40） | 中     | 中       | packages/shared ディレクトリからテストを実行する       |
| インポートパス誤り（P63）         | 中     | 中       | 既存テストファイルのパターンを grep で確認してから記述 |
| graceful degradation の検証漏れ   | 低     | 低       | silent fallback の両パス（tiktoken成功/失敗）をカバー  |

---

## 8. 参照情報

### 関連 Pitfall

- P40: テスト実行ディレクトリ依存（モノレポ）
- P63: サブエージェントによるテストファイルのインポートパス誤り
- P9: モジュールスコープ変数のテスト間リーク

### 関連ドキュメント

- `.claude/rules/02-code-quality.md` — カバレッジ基準

---

## 9. 備考

### 発見経緯

TASK-08-RAG-EMBEDDING Phase 7 カバレッジ確認で embedding Funcs が 78.82% となりゲート基準 80% 未達。SCF 適用でゲート通過したが、openai-provider.ts の未テスト関数が主な原因として特定されたため未タスクとして切り出した。

### 補足事項

- L-RAG-03 の教訓: tiktoken 失敗時の silent fallback は設計意図（graceful degradation）。テストはこの意図が正しく実装されていることを確認するために存在する
- 他のプロバイダー（qwen3-provider 等）にも同様のテスト追加が推奨されるが、本タスクのスコープ外
- 将来的に複数プロバイダーのテストが増える場合、共通テストヘルパーの抽出を検討する
