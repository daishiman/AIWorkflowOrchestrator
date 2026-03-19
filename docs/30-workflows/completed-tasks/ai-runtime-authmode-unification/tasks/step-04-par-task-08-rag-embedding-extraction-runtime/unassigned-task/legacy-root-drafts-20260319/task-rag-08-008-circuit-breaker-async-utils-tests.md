# circuit-breaker / async-utils テスト追加 - タスク指示書

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | UT-RAG-08-008                                   |
| タスク名     | circuit-breaker / async-utils テスト追加        |
| 分類         | テスト                                          |
| 対象機能     | RAG / embedding / circuit-breaker / async-utils |
| 優先度       | 低                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 7 カバレッジ確認（TASK-08-RAG-EMBEDDING） |
| 発見日       | 2026-03-19                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-08-RAG-EMBEDDING の Phase 7 カバレッジ確認で embedding 全体の Funcs カバレッジが 78.82%（基準: 80%）となり基準未達となった。

UT-RAG-08-007（openai-provider テスト追加）が主要因の対応タスクだが、circuit-breaker と async-utils も補助的な原因として特定されている。これらのユーティリティはエラーハンドリング・再試行ロジックを担う重要な基盤コンポーネントであり、テストによる仕様明文化が必要。

### 1.2 問題点・課題

**circuit-breaker の未テスト状態**:

circuit-breaker パターンは外部 API（OpenAI 等）への過負荷防止のために実装されているが、以下の状態遷移がテストされていない可能性がある：

- CLOSED → OPEN（失敗閾値到達時）
- OPEN → HALF_OPEN（タイムアウト後の回復試行）
- HALF_OPEN → CLOSED（回復成功時）
- HALF_OPEN → OPEN（回復失敗時）

**async-utils の未テスト状態**:

非同期処理ユーティリティ（retry、sleep、timeout 等）はシステム全体の安定性に影響するが、エッジケース（タイムアウト境界値、最大リトライ超過等）がテストされていない可能性がある。

**graceful degradation との関係**:

L-RAG-03 の教訓として、circuit-breaker の graceful degradation は設計意図として許容されている。本タスクのテストは「graceful degradation が正しく機能することを検証する」目的で作成する。

### 1.3 放置した場合の影響

**短期的影響**:

- circuit-breaker の状態遷移バグが本番で発覚するリスク
- async-utils のエッジケースが未検証のまま継続する

**中長期的影響**:

- 外部 API 障害時の動作保証ができない
- circuit-breaker のパラメータ変更時にリグレッションを検出できない

**影響度**: 低（UT-RAG-08-007 の対応後でも基準未達の場合に対応する補助タスク）

---

## 2. 何を達成するか（What）

### 2.1 目的

circuit-breaker と async-utils のテストを追加し、これらのユーティリティの設計意図（graceful degradation を含む）をテストで明文化する。

### 2.2 最終ゴール

- circuit-breaker の主要状態遷移をテストでカバーする
- async-utils の主要関数（retry, sleep, timeout 等）のエッジケースをテストする
- UT-RAG-08-007 と合わせて embedding 全体の Funcs カバレッジを 80% 以上にする

### 2.3 スコープ

#### 含むもの

- embedding 関連 circuit-breaker のユニットテスト追加
- embedding 関連 async-utils のユニットテスト追加
- タイマー制御を使った状態遷移テスト（P13 対策）

#### 含まないもの

- circuit-breaker / async-utils 本体の実装変更
- 他のドメインで使用される circuit-breaker のテスト（embedding 固有のもののみ）
- 統合テストや E2E テストの追加

### 2.4 成果物

1. `packages/shared/src/services/embedding/__tests__/circuit-breaker.test.ts`（新規または更新）
2. `packages/shared/src/services/embedding/__tests__/async-utils.test.ts`（新規または更新）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] circuit-breaker の実装ファイルパスを確認する
- [ ] async-utils の実装ファイルパスを確認する
- [ ] 既存テストファイルの有無を確認する
- [ ] TASK-08-RAG-EMBEDDING が完了していること

### 3.2 依存タスク

- TASK-08-RAG-EMBEDDING（circuit-breaker / async-utils の実装基盤）
- UT-RAG-08-007 と並列実行可能

### 3.3 必要な知識・スキル

- circuit-breaker パターンの状態遷移の理解
- Vitest のタイマーモック（`vi.useFakeTimers()`）
- P13（タイマーテストの無限ループ）の理解と回避方法
- async/await テストパターン

### 3.4 推奨アプローチ

1. **実装把握**: circuit-breaker と async-utils の実装を読み込んで関数一覧を作成する
2. **タイマー戦略**: `vi.useFakeTimers()` を使用してタイマーを制御する（P13 回避のため `advanceTimersByTime` を使用）
3. **状態遷移テスト**: CLOSED → OPEN → HALF_OPEN → CLOSED の順でテストを作成する
4. **graceful degradation テスト**: エラーが外部に伝播しないことを明示的に検証する

### 3.5 苦戦ポイント（過去の教訓）

**L-RAG-03: circuit-breaker の graceful degradation は設計意図**

circuit-breaker が OPEN 状態の時にリクエストを即時拒否する動作は設計意図による graceful degradation。テストは「この拒否動作が正しく機能すること」を検証する：

```typescript
describe("circuit-breaker（graceful degradation）", () => {
  it("OPEN状態でリクエストを即時拒否する（エラーは外部に伝播しない）", async () => {
    // OPEN 状態に遷移させる
    // リクエストが拒否されることを確認
    // ただしアプリケーション全体はクラッシュしないことを確認
  });
});
```

**P13: タイマーテストの無限ループ**

circuit-breaker のタイムアウト回復（OPEN → HALF_OPEN）をテストする場合、`runAllTimers()` を使うと無限ループが発生する可能性がある。代わりに `advanceTimersByTime(milliseconds)` で明示的に時間を進める：

```typescript
// 危険: runAllTimers は circuit-breaker の内部タイマーが再スケジュールされると無限ループ
// vi.runAllTimers();

// 安全: 必要な時間だけ進める
vi.advanceTimersByTime(circuit_breaker_timeout_ms + 1);
```

**P40: テスト実行ディレクトリ依存**

```bash
# 正しい実行方法
cd packages/shared
pnpm vitest run src/services/embedding/__tests__/circuit-breaker.test.ts
```

**P63: インポートパス誤り**

```bash
# テスト作成前に既存テストのパスを確認
grep -n "^import" packages/shared/src/services/embedding/__tests__/*.test.ts | head -20
```

---

## 4. Phase 構成

### Phase 1: 調査

**目的**: テスト対象関数を特定し、テスト設計を行う

**実行手順**:

1. circuit-breaker の実装を読み込む（ファイルパスを確認してから）
2. async-utils の実装を読み込む
3. 各関数の状態遷移と副作用を分析する
4. タイマーを使う関数を特定する

**完了条件**:

- [ ] circuit-breaker の状態遷移図が把握されている
- [ ] async-utils の主要関数が把握されている
- [ ] タイマーを使う関数が特定されている

### Phase 2: circuit-breaker テスト作成

**目的**: circuit-breaker の主要状態遷移をテストする

**テスト設計**:

```typescript
describe("CircuitBreaker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("CLOSED 状態", () => {
    it("リクエストを通過させる");
    it("失敗閾値未満の失敗はCLOSEDを維持する");
    it("失敗閾値到達でOPENに遷移する");
  });

  describe("OPEN 状態", () => {
    it("リクエストを即時拒否する（graceful degradation）");
    it("タイムアウト後にHALF_OPENに遷移する", () => {
      // P13 対策: advanceTimersByTime を使用
      vi.advanceTimersByTime(RECOVERY_TIMEOUT_MS + 1);
    });
  });

  describe("HALF_OPEN 状態", () => {
    it("成功するとCLOSEDに遷移する");
    it("失敗するとOPENに戻る");
  });
});
```

**成果物**:

- `circuit-breaker.test.ts`

**完了条件**:

- [ ] CLOSED → OPEN の遷移テストが存在する
- [ ] OPEN でのリクエスト拒否テストが存在する
- [ ] OPEN → HALF_OPEN の遷移テストが存在する（advanceTimersByTime 使用）
- [ ] HALF_OPEN → CLOSED / OPEN の遷移テストが存在する

### Phase 3: async-utils テスト作成

**目的**: async-utils の主要関数とエッジケースをテストする

**テスト設計**:

```typescript
describe("async-utils", () => {
  describe("retry", () => {
    it("成功する場合はそのまま結果を返す");
    it("失敗後に再試行する");
    it("最大リトライ数超過でエラーを throw する");
    it("指数バックオフが適用される");
  });

  describe("sleep", () => {
    it("指定時間後に解決する", async () => {
      vi.useFakeTimers();
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await promise;
    });
  });

  describe("withTimeout", () => {
    it("タイムアウト前に完了する場合は結果を返す");
    it("タイムアウト超過でエラーを throw する");
  });
});
```

**成果物**:

- `async-utils.test.ts`

**完了条件**:

- [ ] retry 関数の正常系・異常系がテストされている
- [ ] sleep 関数がテストされている
- [ ] タイムアウト関数がテストされている

### Phase 4: カバレッジ確認

**目的**: UT-RAG-08-007 と合わせて embedding 全体のカバレッジを確認する

**完了条件**:

- [ ] embedding 全体の Funcs カバレッジ >= 80%（UT-RAG-08-007 との組み合わせで）
- [ ] 全テストが PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] circuit-breaker の主要状態遷移がテストされている
- [ ] OPEN 状態の graceful degradation がテストされている
- [ ] async-utils の主要関数がテストされている

### 品質要件

- [ ] タイマーテストで `advanceTimersByTime` を使用している（P13 対策）
- [ ] `vi.useFakeTimers()` が `afterEach` でリセットされている
- [ ] 全テストが PASS している
- [ ] `pnpm typecheck` がエラーなし

### ドキュメント要件

- [ ] LOGS.md が2ファイル更新されている
- [ ] documentation-changelog.md が更新されている

---

## 6. 検証方法

```bash
# circuit-breaker テスト実行
cd packages/shared
pnpm vitest run src/services/embedding/__tests__/circuit-breaker.test.ts

# async-utils テスト実行
pnpm vitest run src/services/embedding/__tests__/async-utils.test.ts

# embedding 全体のカバレッジ確認（UT-RAG-08-007 との合算）
pnpm vitest run --coverage \
  --coverage.include="src/services/embedding/**" \
  src/services/embedding/__tests__/
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                   |
| -------------------------------------- | ------ | -------- | ------------------------------------------------------ |
| タイマーテストの無限ループ（P13）      | 高     | 中       | runAllTimers 禁止、advanceTimersByTime を使用する      |
| タイマーの afterEach リセット忘れ      | 中     | 中       | afterEach で vi.useRealTimers() を必ず呼ぶ             |
| circuit-breaker の内部状態リーク（P9） | 中     | 中       | beforeEach で circuit-breaker インスタンスを再生成     |
| インポートパス誤り（P63）              | 中     | 中       | 既存テストファイルのパスを grep で確認してから記述     |
| UT-RAG-08-007 未完了での基準未達       | 低     | 低       | UT-RAG-08-007 と並列実行し、両方完了後にカバレッジ確認 |

---

## 8. 参照情報

### 関連 Pitfall

- P13: タイマーテストの無限ループ
- P9: モジュールスコープ変数のテスト間リーク
- P40: テスト実行ディレクトリ依存（モノレポ）
- P63: サブエージェントによるテストファイルのインポートパス誤り

### 関連タスク

- UT-RAG-08-007: openai-provider ユニットテスト（カバレッジ改善の主要タスク）

---

## 9. 備考

### 発見経緯

TASK-08-RAG-EMBEDDING Phase 7 カバレッジ確認で embedding Funcs が 78.82% となりゲート基準未達。UT-RAG-08-007 の補助原因として circuit-breaker と async-utils が特定され、未タスクとして切り出した。

### 優先順位の判断

- まず UT-RAG-08-007 を実施してカバレッジを計測する
- UT-RAG-08-007 だけで 80% を達成できる場合、本タスクの優先度は「非常に低い」に降格してよい
- 80% 未達の場合に本タスクを実施する

### 補足事項

- circuit-breaker は将来的に他のドメイン（チャット履歴、コミュニティ等）でも使用される可能性があるため、テストの設計は汎用的なパターンを使う
- タイマーモックを使うテストは実行順序に敏感なため、`beforeEach` での完全リセットが特に重要
