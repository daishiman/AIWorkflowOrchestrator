# Phase 8: リファクタリング

## メタ情報

| 項目          | 内容                                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 8                                                                                                                   |
| 機能名        | チャット向けコンパクトモデルセレクタ共通コンポーネント作成 (TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT)                |
| 作成日        | 2026-03-21                                                                                                          |
| 担当          | -                                                                                                                   |
| ステータス    | 未着手                                                                                                              |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-7-coverage.md` |

## 目的

Phase 5 の実装をより安全・明確・保守しやすいコードに改善する。テストはすべて GREEN のままで、コードの可読性・型安全性・コンポーネント分割の最適性を向上させる。

## 実行タスク

### タスク1: コードレビュー観点

以下の観点で Phase 5 で実装したコードを見直す。

#### 1-1: コードの重複排除

- `SelectorTrigger` と `SelectorDropdown` の間で重複するロジックがないか確認する
- Provider/Model を探す処理（`find`）が複数箇所に散在していないか確認する
- 重複がある場合はユーティリティ関数に抽出する

```typescript
// 重複排除例: Provider/Model名の解決を共通関数に抽出
function resolveProviderName(
  providers: Provider[],
  providerId: string | null,
): string | undefined {
  return providers.find((p) => p.id === providerId)?.name;
}
```

#### 1-2: デザイントークンの定数化（P47対策の強化）

- `selectorTriggerStyles` / `healthDotStyles` 定数がモジュールスコープにあり、コンポーネント外からインポート可能か確認する
- 文字列リテラルのデザイントークンが直接 JSX に埋め込まれていないか確認する（全て定数経由にする）

```bash
# インラインのデザイントークン残存確認
grep -n "var(--" apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx \
  | grep -v "selectorTriggerStyles\|healthDotStyles"
```

#### 1-3: コンポーネント分割の最適化

- `SelectorTrigger` が single responsibility を守っているか確認する（表示のみ、状態なし）
- `SelectorDropdown` が過度に大きくなっていないか確認する
  - プロバイダーリスト表示 → `ProviderList` サブコンポーネント化を検討
  - モデルリスト表示 → `ModelList` サブコンポーネント化を検討

#### 1-4: 型安全性の向上

- `HealthStatus` 型が明示的に定義され、`as const` オブジェクトのキーとして使われているか確認する（P49対策）
- `onSelectionChange` コールバックの引数型が `{ providerId: string; modelId: string }` として明示されているか確認する

```typescript
// P49対策: as キャストを避け、型ガードで安全に処理
type HealthStatus = "healthy" | "degraded" | "checking" | "error" | "unknown";

function isHealthStatus(value: unknown): value is HealthStatus {
  return (
    typeof value === "string" &&
    ["healthy", "degraded", "checking", "error", "unknown"].includes(value)
  );
}
```

#### 1-5: useEffect の依存配列確認

- 外部クリック処理の useEffect が正しい依存配列を持っているか確認する
- キーボード処理の useEffect が正しい依存配列を持っているか確認する
- `react-hooks/exhaustive-deps` の lint ルールが通ることを確認する

### タスク2: リファクタリングの実施

タスク1で発見した問題点を修正する。

**前提**: テストが GREEN であることを確認しながら小さく変更する。1 回の変更ごとにテストを実行する。

```bash
# リファクタリング後のテスト実行（apps/desktop から）
cd apps/desktop
pnpm vitest run src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx
```

### タスク3: TypeScript 型チェック

```bash
cd apps/desktop
pnpm typecheck
```

### タスク4: Lint 確認

```bash
cd apps/desktop
pnpm lint
```

## 参照資料

### コード品質ルール

| 資料名            | パス                               |
| ----------------- | ---------------------------------- |
| TypeScript 型安全 | `.claude/rules/02-code-quality.md` |
| アーキテクチャ    | `.claude/rules/01-architecture.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                         | 対策                                                          |
| ---------- | -------------------------------------------- | ------------------------------------------------------------- |
| P47        | CSS変数ベーステストのアサーション戦略        | デザイントークン定数を `export` し、インライン埋め込みを排除  |
| P49        | type predicate 内での `as` キャスト          | `in` 演算子・型ガード関数でナロイング                         |
| P31        | Zustand Store Hooks 無限ループ               | 個別セレクタの使用を維持する（合成Hook禁止）                  |
| P48        | useShallow未適用による派生セレクタ無限ループ | `.filter()` / `.map()` を返すセレクタには `useShallow` を維持 |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                                             | 内容                       |
| ------------------- | ------------------------------------------------------------------------------------------------ | -------------------------- |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                          | 既存UIコンポーネント構造   |
| 実装パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-core.md` | アーキテクチャ実装パターン |

## 実行手順

1. **タスク1の実施**: コードレビューを行い、改善点をリストアップする
2. **タスク2の実施**: 発見した問題点を1つずつ修正し、その都度テストを実行する
3. **タスク3の実施**: TypeScript 型チェックを実行する
4. **タスク4の実施**: Lint を実行する
5. **最終確認**: 全テストが GREEN であることを確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこの Phase で確認・更新する
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと 1 対 1 で突合する

## 成果物

| 成果物                       | パス                                                                                                                   | 説明                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 8 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-8-refactoring.md` | リファクタリング計画書 |
| リファクタリング済みコード   | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                                                     | 改善されたコード       |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT --phase 8
```

## 完了条件

- [ ] タスク1のコードレビューを実施し、改善点をリストアップした
- [ ] コードの重複が排除された（タスク1-1）
- [ ] デザイントークン定数がモジュールスコープにあり、全て定数経由で使用されている（P47対策）
- [ ] コンポーネント分割が単一責務原則に従っている
- [ ] `HealthStatus` 型が明示的に定義されている（P49対策）
- [ ] useEffect の依存配列が正しい
- [ ] リファクタリング後のすべてのテストが GREEN である
- [ ] TypeScript 型チェックが通った
- [ ] Lint が通った

## 次のPhase

Phase 9: 品質検証（`phase-9-quality.md`）
