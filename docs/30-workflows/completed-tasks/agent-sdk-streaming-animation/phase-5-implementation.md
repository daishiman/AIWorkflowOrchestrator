# Phase 5: 実装（TDD Green） - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 5                             |
| Phase名    | 実装（TDD Green）             |
| 前提Phase  | Phase 4（テスト作成）         |
| 後続Phase  | Phase 6（テスト拡充）         |
| ステータス | 未実施                        |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-streaming-animation |

---

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストを全て成功させる実装を行う。CSSアニメーション・Reactコンポーネント・アクセシビリティフックを実装する。

## 背景

テストファーストで作成されたテストケースに対して、最小限のコードで全テストを成功させる。パフォーマンスとアクセシビリティを両立する実装を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: CSSアニメーション実装

**目的**: アニメーション用CSSを実装する

**実行手順**:

1. 以下のCSSを実装:

```css
/* フェードイン */
@keyframes streaming-fade-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* カーソルブリンク */
@keyframes streaming-cursor-blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}

/* クラス定義 */
.streaming-chunk--fade-in {
  animation: streaming-fade-in 150ms ease-out;
}

.streaming-cursor--blink {
  animation: streaming-cursor-blink 1000ms infinite;
}

/* reduced-motion対応 */
@media (prefers-reduced-motion: reduce) {
  .streaming-chunk--fade-in,
  .streaming-cursor--blink {
    animation: none;
  }
}
```

2. CSSファイルを作成または更新
3. ビルド確認

**期待される成果物**:

- `apps/desktop/src/renderer/styles/streaming-animation.css`

---

### タスク2: useReducedMotion フック実装

**目的**: reduced-motion検出フックを実装する

**実行手順**:

1. 以下のフックを実装:

```typescript
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}
```

2. フックファイルを作成
3. テストを実行して成功を確認

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/useReducedMotion.ts`

---

### タスク3: StreamingChunk コンポーネント実装

**目的**: フェードインアニメーション付きチャンクコンポーネントを実装する

**実行手順**:

1. 以下のコンポーネントを実装:
   - フェードインクラスの条件付き適用
   - reduced-motion時のフォールバック
   - コンテンツ表示
2. コンポーネントファイルを作成
3. テストを実行して成功を確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/StreamingChunk.tsx`

---

### タスク4: StreamingCursor コンポーネント実装

**目的**: ブリンキングカーソルコンポーネントを実装する

**実行手順**:

1. 以下のコンポーネントを実装:
   - ブリンキングクラスの条件付き適用
   - reduced-motion時の静的表示
   - ストリーミング完了時の非表示
2. コンポーネントファイルを作成
3. テストを実行して成功を確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/StreamingCursor.tsx`

---

### タスク5: 全テスト成功の確認

**目的**: Phase 4で作成した全テストが成功することを確認する

**実行手順**:

1. 以下のコマンドでテストを実行:

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="streaming"
```

2. 全テストが成功することを確認
3. テスト結果を記録

**期待される成果物**:

- `outputs/phase-5/test-green-status.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容      |
| ------------------------- | --------------------------------------------------------------------------- | --------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | SDK型定義 |
| UI/UX設計                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-design.md`         | UI基準    |

### 前Phase成果物

| 参照資料   | パス                                    | 内容       |
| ---------- | --------------------------------------- | ---------- |
| 設計書     | `outputs/phase-2/design-document.md`    | 全設計     |
| テスト仕様 | `outputs/phase-4/test-specification.md` | テスト仕様 |

---

## 成果物

| 成果物            | パス                                                       | 内容                   |
| ----------------- | ---------------------------------------------------------- | ---------------------- |
| CSSアニメーション | `apps/desktop/src/renderer/styles/streaming-animation.css` | アニメーションCSS      |
| useReducedMotion  | `apps/desktop/src/renderer/hooks/useReducedMotion.ts`      | フック実装             |
| StreamingChunk    | `apps/desktop/src/renderer/components/StreamingChunk.tsx`  | チャンクコンポーネント |
| StreamingCursor   | `apps/desktop/src/renderer/components/StreamingCursor.tsx` | カーソルコンポーネント |
| テスト成功確認    | `outputs/phase-5/test-green-status.md`                     | テスト結果             |

---

## 統合テスト連携（Phase 1〜11は必須）

- アニメーションコンポーネントが既存UIと統合できることを確認
- IPC通信への影響がないことを確認

---

## 完了条件

- [ ] CSSアニメーションが実装されている
- [ ] useReducedMotionフックが実装されている
- [ ] StreamingChunkが実装されている
- [ ] StreamingCursorが実装されている
- [ ] **Phase 4で作成した全テストが成功している（Green状態）**

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

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-sdk-streaming-animation/phase-6-test-expansion.md`
