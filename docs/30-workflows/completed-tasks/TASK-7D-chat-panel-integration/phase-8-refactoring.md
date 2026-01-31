# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目      | 内容                           |
| --------- | ------------------------------ |
| Phase     | 8                              |
| Phase名   | リファクタリング               |
| カテゴリ  | TDD-Refactor                   |
| 機能名    | TASK-7D-chat-panel-integration |
| 作成日    | 2026-01-30                     |
| 前提Phase | Phase 7                        |
| 後続Phase | Phase 9                        |

## 目的

Phase 5 で実装したコードの品質を向上させるリファクタリングを行う。コードの可読性、保守性、パフォーマンスを改善しつつ、全テストが Green のままであることを保証する。

## 実行タスク

### タスク1: コンポーネント構造の最適化

**目的**: SkillStreamingView のサブコンポーネント分離と再利用性を検証・改善する。

**手順**:

1. SkillStreamingView.tsx を確認し、以下の観点でリファクタリングする:
   - StatusBadge、StreamMessageItem、ToolExecutionHistory がファイル内のローカルコンポーネントとして適切に分離されているか確認する
   - 各サブコンポーネントに `React.memo` が必要かを判断する（Props が頻繁に変わるかどうか）
   - StreamMessageItem の switch 文が exhaustive check を持つか確認する（TypeScript の satisfies/never パターン）
2. ChatPanel.tsx を確認し、以下の観点でリファクタリングする:
   - useAppStore からの destructuring が最小限であるか確認する（不要な再レンダー防止）
   - useEffect の依存配列が正しいか確認する

**期待される成果物**:

- リファクタリング済みのコンポーネントファイル

### タスク2: 型定義の精緻化

**目的**: TypeScript の型安全性を強化する。

**手順**:

1. SkillStreamingView の Props 型が `packages/shared/src/types/skill.ts` の型と整合しているか確認する
2. StatusBadge の config オブジェクトを `Record<string, { color: string; label: string }>` から、`SkillExecutionStatus` のリテラル型を使った `Record<SkillExecutionStatus, ...>` に変更できるか検討する
3. StreamMessageItem の message.type で switch 分岐する際に、exhaustive check（`default: return assertNever(message)` パターン）を適用する

**期待される成果物**:

- 型定義が精緻化されたコンポーネントファイル

### タスク3: パフォーマンス改善

**目的**: 不要な再レンダーを防止し、レンダリングパフォーマンスを最適化する。

**手順**:

1. ChatPanel の useAppStore 呼び出しで、セレクタパターンの使用を検討する:

```typescript
// Before: 全 state を destructure
const { selectedSkillName, streamingMessages, ... } = useAppStore();

// After: 必要な state のみ select（if supported by store pattern）
const selectedSkillName = useAppStore((state) => state.selectedSkillName);
```

2. SkillStreamingView に React.memo を適用するか判断する
3. StreamMessageItem の key 属性が安定していることを確認する（`${msg.timestamp}-${index}` パターン）

**期待される成果物**:

- パフォーマンス最適化済みのコンポーネントファイル

### タスク4: リファクタリング後のテスト確認

**目的**: リファクタリング後も全テストが Green であることを確認する。

**手順**:

1. 以下のコマンドで全テストを実行する:

```bash
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.test.tsx
pnpm --filter @repo/desktop vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillStreamingView.test.tsx
```

2. 全テストが PASS であることを確認する
3. TypeScript 型チェックを実行する:

```bash
pnpm --filter @repo/desktop typecheck
```

4. ESLint を実行する:

```bash
pnpm --filter @repo/desktop lint
```

**期待される成果物**:

- テスト実行結果ログ（全 Green）
- 型チェック結果ログ（エラーゼロ）
- ESLint 結果ログ（エラーゼロ）

## 参照資料

| 参照資料             | パス                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| Phase 5 実装ファイル | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`          |
| Phase 5 実装ファイル | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                    |
| 既存パターン参考     | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`               |
| 状態管理パターン     | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` |

## 統合テスト連携

### このフェーズで確認すべき統合テスト観点

| カテゴリ       | 確認項目                                         |
| -------------- | ------------------------------------------------ |
| リグレッション | リファクタリング後に既存機能が維持されていること |
| パフォーマンス | 不要な再レンダーが発生していないこと             |

## 多角的観点チェック

### Renderer（フロントエンド）層

| 観点           | 確認項目                                                            |
| -------------- | ------------------------------------------------------------------- |
| コード品質     | React.memo/useMemo/useCallback の適用判断が適切か                   |
| 型安全性       | exhaustive check パターン（never 型）が switch 文に適用されているか |
| パフォーマンス | Zustand セレクタパターンで不要な再レンダーが防止されているか        |

## 成果物

| 成果物                     | パス                                                                | 種別 |
| -------------------------- | ------------------------------------------------------------------- | ---- |
| SkillStreamingView（改善） | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx` | code |
| ChatPanel（改善）          | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`           | code |

## 完了条件

- [ ] サブコンポーネントの分離が適切であることが確認されている
- [ ] TypeScript の型安全性が強化されている（exhaustive check 等）
- [ ] パフォーマンス最適化が検討・適用されている
- [ ] 全テストが Green（PASS）である
- [ ] TypeScript 型チェックがエラーゼロで通る
- [ ] ESLint がエラーゼロで通る
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: コンポーネント構造の最適化
3. タスク2: 型定義の精緻化
4. タスク3: パフォーマンス改善
5. タスク4: リファクタリング後のテスト確認
6. 統合テスト連携の実施
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7D-chat-panel-integration --phase 8
```

## 次のPhase

Phase 9: 品質保証 → [phase-9-quality.md](phase-9-quality.md)
