---
issue_number: null
---

# Vitest モック 2段階リセットユーティリティ共通化

## メタ情報

| 項目             | 内容                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| タスクID         | task-imp-vitest-mock-reset-utility-001                                     |
| タスク名         | Vitest モック 2段階リセットユーティリティ共通化                            |
| 分類             | 改善                                                                       |
| 対象機能         | テスト基盤（Desktop / Shared 共通）                                        |
| 優先度           | 中                                                                         |
| 見積もり規模     | 小規模                                                                     |
| ステータス       | 未実施                                                                     |
| 発見元           | TASK-FIX-11-1-SDK-TEST-ENABLEMENT Phase 5（実装中の苦戦箇所）              |
| 発見日           | 2026-02-13                                                                 |
| 発見エージェント | 実装担当（Vitest mock reset API の挙動差異に起因するテスト状態リーク問題） |

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-FIX-11-1（SDK統合テスト有効化）の実装中、`vi.clearAllMocks()` が `mockImplementation()` / `mockRejectedValue()` をリセット**しない**ことに起因するテスト間状態リーク（P9パターン）が繰り返し発生した。

現在、プロジェクト内の各テストファイルで `beforeEach` のリセット処理が個別に実装されており、以下の問題がある：

1. **不完全なリセット**: `vi.clearAllMocks()` のみで `mockImplementation` が残存するテストが存在する
2. **ボイラープレートの重複**: 「履歴クリア＋デフォルト応答再設定」の2段階パターンが各テストファイルにコピーペーストされている
3. **新規テスト作成時の罠**: `clearAllMocks` で十分と誤解し、断続的に失敗するテストを書いてしまう

### 問題点・課題

現在の実装パターン（各テストファイルで個別に記述）：

```typescript
// ファイルA: skill-executor.test.ts
beforeEach(() => {
  vi.clearAllMocks();
  mockAgentAPI.query.mockResolvedValue({ response: "default" });
  mockCreate.mockResolvedValue({ content: [{ type: "text", text: "ok" }] });
});

// ファイルB: skill-executor.auth.test.ts（同一パターンの重複）
beforeEach(() => {
  vi.clearAllMocks();
  mockAgentAPI.query.mockResolvedValue({ response: "default" });
  mockCreate.mockResolvedValue({ content: [{ type: "text", text: "ok" }] });
});
```

問題点:

- 同一モックのデフォルト応答定義が5ファイル以上で重複
- `mockRejectedValue`（永続）と `mockRejectedValueOnce`（1回限り）の使い分けが暗黙知
- `clearAllMocks` / `resetAllMocks` / `restoreAllMocks` の差異が文書化されていない

### 放置した場合の影響

| 影響領域               | 影響度 | 説明                                                                         |
| ---------------------- | ------ | ---------------------------------------------------------------------------- |
| テスト信頼性           | High   | P9パターン（テスト間状態リーク）が新規テスト追加のたびに再発するリスクがある |
| 開発者オンボーディング | Medium | Vitest mock API の挙動差異を知らない開発者が断続的テスト失敗に遭遇する       |
| 保守コスト             | Medium | デフォルト応答の変更時に複数ファイルを同時修正する必要がある                 |
| テスト実行速度         | Low    | 不完全なリセットが原因でデバッグに時間を費やす                               |

## 2. 何を達成するか（What）

### 目的

Vitest モックの「2段階リセット」パターン（履歴クリア＋デフォルト応答再設定）を共通ユーティリティとして提供し、テスト間状態リークを構造的に防止する。

### 最終ゴール

- ✅ `createMockResetHelper()` ユーティリティ関数を作成
- ✅ SkillExecutor 関連テスト（5ファイル）のリセットロジックをユーティリティに移行
- ✅ ユーティリティ自体の単体テストを作成
- ✅ プロジェクト内テストガイドラインに使用方法を記載

### スコープ

**含むもの:**

- `createMockResetHelper()` ユーティリティ実装（`apps/desktop/src/main/slide/__tests__/helpers/` 配下）
- SkillExecutor テスト5ファイルのリファクタリング
- ユーティリティの単体テスト
- `Once` サフィックスパターンの推奨ルール明文化

**含まないもの:**

- ESLint カスタムルールの実装（別タスク `task-ref-vitest-module-mock-audit-001` でガイドライン策定後に検討）
- SkillExecutor 以外のテストファイルへの適用（段階的に横展開）
- `vi.resetAllMocks()` への全面置換（`clearAllMocks` + 明示再設定の方が意図が明確）

### 成果物

| 種別         | 成果物                         | 配置先                                                                    |
| ------------ | ------------------------------ | ------------------------------------------------------------------------- |
| 実装         | mockResetHelper ユーティリティ | `apps/desktop/src/main/slide/__tests__/helpers/mock-reset-helper.ts`      |
| テスト       | ユーティリティ単体テスト       | `apps/desktop/src/main/slide/__tests__/helpers/mock-reset-helper.test.ts` |
| リファクタ   | SkillExecutor テスト5ファイル  | `apps/desktop/src/main/slide/__tests__/skill-executor.*.test.ts`          |
| ドキュメント | テストガイドライン更新         | `docs/` 配下（該当ドキュメント）                                          |

## 3. どのように実行するか（How）

### 前提条件

- [x] TASK-FIX-11-1-SDK-TEST-ENABLEMENT が完了していること（2026-02-13完了）
- [ ] SkillExecutor テスト5ファイルが全て PASS していること

### 依存タスク

先に完了している必要があるタスク:

- TASK-FIX-11-1-SDK-TEST-ENABLEMENT（完了済み）

同時実施可能なタスク:

- task-ref-vitest-module-mock-audit-001（モジュールレベルmock監査）

### 必要な知識・スキル

- Vitest mock API（`clearAllMocks` / `resetAllMocks` / `restoreAllMocks` の差異）
- TypeScript ジェネリクス（型安全なモックヘルパー設計）
- TDD（Red-Green-Refactor）

### 推奨アプローチ

**設計方針**: Factory パターンでモックオブジェクト群とリセット関数をセットで提供する

```typescript
// 推奨する API 設計イメージ
interface MockResetConfig<T extends Record<string, vi.Mock>> {
  mocks: T;
  defaults: { [K in keyof T]: Parameters<T[K]["mockResolvedValue"]>[0] };
}

function createMockResetHelper<T extends Record<string, vi.Mock>>(
  config: MockResetConfig<T>,
) {
  return {
    resetAll: () => {
      vi.clearAllMocks();
      for (const [key, defaultValue] of Object.entries(config.defaults)) {
        config.mocks[key].mockResolvedValue(defaultValue);
      }
    },
    mocks: config.mocks,
  };
}
```

**使用例**:

```typescript
const { resetAll, mocks } = createMockResetHelper({
  mocks: { query: mockAgentAPI.query, create: mockCreate },
  defaults: {
    query: {
      response: "default mock response",
      tokenUsage: { input: 100, output: 50 },
    },
    create: { content: [{ type: "text", text: "response" }] },
  },
});

beforeEach(() => resetAll());
```

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                          | 発見経緯                                                                  | 解決策                                                                                  | 教訓                                               |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `vi.clearAllMocks()` は `mockImplementation` をリセットしない | TASK-FIX-11-1 Phase 5: 有効化したテストの1/3が断続的に失敗                | 2段階リセットパターン（履歴クリア＋デフォルト応答再設定）を採用                         | 「履歴クリア」と「実装リセット」は別操作として扱う |
| `mockRejectedValue` が後続テストに漏洩                        | TASK-FIX-11-1 Phase 5: エラーハンドリングテスト後の正常系テストが全て失敗 | `mockRejectedValueOnce` に統一し、永続的な `mockRejectedValue` はテストコードで使用禁止 | テストの副作用は「1回限り」が安全なデフォルト      |
| `beforeEach` のリセット不足に気付きにくい                     | TASK-FIX-11-1 Phase 6: テスト実行順序変更でランダムに失敗が顕在化         | 共通ユーティリティで強制的に2段階リセットを適用                                         | テスト基盤は「忘れても安全」な設計にする           |

## 4. 実行手順

### Phase構成

```
Phase 1-3: 要件定義・設計・設計レビュー
  ↓
Phase 4: ユーティリティテスト作成（TDD Red）
  ↓
Phase 5: ユーティリティ実装（TDD Green）
  ↓
Phase 6-7: テスト拡充・カバレッジ確認
  ↓
Phase 8: SkillExecutor テスト5ファイルのリファクタリング
  ↓
Phase 9-10: 品質検証・最終レビュー
  ↓
Phase 11-12: 手動テスト・ドキュメント
```

### Phase 4: ユーティリティテスト作成（TDD Red）

目的: `createMockResetHelper` の期待動作をテストで定義する

テストケース:

1. `resetAll()` 呼び出し後、`vi.clearAllMocks()` が実行されていること
2. `resetAll()` 呼び出し後、各モックの `mockResolvedValue` がデフォルト値で再設定されていること
3. `mockRejectedValue` で設定したエラーが `resetAll()` 後にクリアされていること
4. 複数モックを同時にリセットできること
5. 型安全性: 存在しないモックキーにアクセスするとコンパイルエラーになること

### Phase 5: ユーティリティ実装

目的: テストを全て PASS させる実装

### Phase 8: SkillExecutor テストリファクタリング

対象ファイル:

- `skill-executor.test.ts`
- `skill-executor.auth.test.ts`
- `skill-executor.retry.test.ts`
- `skill-executor.integration.test.ts`
- `skill-executor.permission.test.ts`

各ファイルの `beforeEach` を `resetAll()` 呼び出しに置換する。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `createMockResetHelper()` ユーティリティが実装されている
- [ ] SkillExecutor テスト5ファイルが `resetAll()` を使用している
- [ ] 全テストが PASS する（回帰テスト含む）

### 品質要件

- [ ] ユーティリティの単体テストが5ケース以上 PASS
- [ ] SkillExecutor テスト 134/134 PASS（回帰なし）
- [ ] ESLint / TypeScript エラーゼロ

### ドキュメント要件

- [ ] `lessons-learned.md` に本タスクの完了記録を追加
- [ ] `architecture-implementation-patterns.md` の該当パターンに参照リンクを追加

## 6. 検証方法

### テストケース

ユニットテスト（mock-reset-helper）:

1. 2段階リセットの動作検証
2. 複数モックの同時リセット
3. `mockRejectedValue` のクリア確認
4. 型安全性の確認
5. デフォルト値の正確な再設定

### 検証手順

```bash
# ユーティリティテスト
pnpm vitest run apps/desktop/src/main/slide/__tests__/helpers/mock-reset-helper.test.ts

# SkillExecutor 回帰テスト
pnpm vitest run apps/desktop/src/main/slide/__tests__/skill-executor

# 全テスト
pnpm --filter @repo/desktop test
```

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                              |
| ------------------------------------ | ------ | -------- | ------------------------------------------------- |
| 型定義の複雑化                       | Medium | Medium   | ジェネリクスを最小限にし、使用例をドキュメント化  |
| 既存テストのリファクタリング時の回帰 | Medium | Low      | 1ファイルずつ移行し、各段階で全テスト PASS を確認 |
| ユーティリティの過度な抽象化         | Low    | Medium   | 最小限の API で開始し、必要に応じて拡張           |

## 8. 参照情報

### 関連ドキュメント

- [lessons-learned.md - TASK-FIX-11-1 苦戦箇所#3](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md) — Vitest モックリセット API 比較表・コード例
- [architecture-implementation-patterns.md - Vitest mock reset strategy](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) — 2段階リセットパターン仕様
- [patterns.md - SDK test mock 2-stage reset](../../.claude/skills/skill-creator/references/patterns.md) — 成功パターン
- [06-known-pitfalls.md#P9](../../.claude/rules/06-known-pitfalls.md) — モジュールスコープ変数のテスト間リーク

### 参考資料

- [Vitest Mock Functions API](https://vitest.dev/api/mock.html) — clearAllMocks / resetAllMocks / restoreAllMocks
- [Jest Mock Functions](https://jestjs.io/docs/mock-function-api) — 同等 API（Vitest は Jest 互換）

## 9. 備考

### 発見経緯

TASK-FIX-11-1-SDK-TEST-ENABLEMENT の Phase 5（実装）で、17件の TODO テストを有効化した際、約1/3のテストが断続的に失敗した。原因調査の結果、`vi.clearAllMocks()` が `mockImplementation()` をリセットしないという Vitest の仕様に起因するテスト間状態リークであることが判明。手動で2段階リセットパターンを適用して解決したが、同様の問題がプロジェクト内の他のテストファイルでも発生する可能性がある。

### 横展開の方針

SkillExecutor テスト5ファイルでの実績を確認した後、プロジェクト全体のテストファイルに段階的に適用を拡大する。
