# Phase 4: テスト作成（TDD Red） - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 4                             |
| Phase名    | テスト作成（TDD Red）         |
| 前提Phase  | Phase 3（設計レビューゲート） |
| 後続Phase  | Phase 5（実装）               |
| ステータス | 未実施                        |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-streaming-animation |

---

## 目的

TDDのRedフェーズとして、アニメーション機能のテストを先に作成する。このテストは実装前なので失敗する（Red状態）。

## 背景

アニメーションのテストは通常難しいが、CSSクラスの適用・reduced-motion対応・コンポーネント挙動はテスト可能。テストファーストで品質を担保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト仕様設計

**目的**: アニメーションテストの仕様を設計する

**実行手順**:

1. 以下のテストカテゴリを設計:
   - CSSクラス適用テスト
   - reduced-motionフック テスト
   - コンポーネント統合テスト
2. テストケースを一覧化
3. 仕様を文書化

**期待される成果物**:

- `outputs/phase-4/test-specification.md`

---

### タスク2: useReducedMotion フックテスト作成

**目的**: アクセシビリティフックのテストを作成する

**実行手順**:

1. 以下のテストケースを作成:
   - reduced-motion有効時にtrueを返す
   - reduced-motion無効時にfalseを返す
   - メディアクエリ変更時に更新される
2. テストファイルを作成
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/__tests__/useReducedMotion.test.ts`

---

### タスク3: StreamingChunkテスト作成

**目的**: ストリーミングチャンクコンポーネントのテストを作成する

**実行手順**:

1. 以下のテストケースを作成:
   - フェードインクラスが適用される
   - reduced-motion時はアニメーションクラスなし
   - コンテンツが正しく表示される
2. テストファイルを作成
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/components/__tests__/StreamingChunk.test.tsx`

---

### タスク4: StreamingCursorテスト作成

**目的**: カーソルコンポーネントのテストを作成する

**実行手順**:

1. 以下のテストケースを作成:
   - ブリンキングクラスが適用される
   - reduced-motion時は静的表示
   - ストリーミング完了時は非表示
2. テストファイルを作成
3. テストが失敗することを確認（Red状態）

**期待される成果物**:

- `apps/desktop/src/renderer/components/__tests__/StreamingCursor.test.tsx`

---

### タスク5: Red状態確認

**目的**: 全テストが失敗することを確認する

**実行手順**:

1. 以下のコマンドでテストを実行:

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="streaming"
```

2. 全テストが失敗することを確認
3. 結果を記録

**期待される成果物**:

- `outputs/phase-4/test-red-status.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料   | パス                                                                    | 内容       |
| ---------- | ----------------------------------------------------------------------- | ---------- |
| テスト戦略 | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md` | テスト方針 |

### 前Phase成果物

| 参照資料  | パス                                   | 内容       |
| --------- | -------------------------------------- | ---------- |
| 設計書    | `outputs/phase-2/design-document.md`   | 全設計     |
| React統合 | `outputs/phase-2/react-integration.md` | コンポ設計 |

---

## 成果物

| 成果物                 | パス                                                                      | 内容           |
| ---------------------- | ------------------------------------------------------------------------- | -------------- |
| テスト仕様書           | `outputs/phase-4/test-specification.md`                                   | テスト仕様     |
| useReducedMotionテスト | `apps/desktop/src/renderer/hooks/__tests__/useReducedMotion.test.ts`      | フックテスト   |
| StreamingChunkテスト   | `apps/desktop/src/renderer/components/__tests__/StreamingChunk.test.tsx`  | チャンクテスト |
| StreamingCursorテスト  | `apps/desktop/src/renderer/components/__tests__/StreamingCursor.test.tsx` | カーソルテスト |
| Red状態確認            | `outputs/phase-4/test-red-status.md`                                      | テスト失敗確認 |

---

## 統合テスト連携（Phase 1〜11は必須）

- アニメーションコンポーネントの統合テストシナリオを設計
- 既存UI統合テストとの整合性を確認

---

## 完了条件

- [ ] テスト仕様が設計されている
- [ ] useReducedMotionフックテストが作成されている
- [ ] StreamingChunkテストが作成されている
- [ ] StreamingCursorテストが作成されている
- [ ] **全テストが失敗している（Red状態）**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --testPathPattern="streaming"
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-sdk-streaming-animation/phase-5-implementation.md`
