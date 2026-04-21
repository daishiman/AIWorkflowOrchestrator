---
task_id: TASK-RALLY-007
task_name: addAssistantMessage依存配列修正
task_type: NON_VISUAL
category: improvement
status: not_started
current_phase: 1
created_date: 2026-04-21
---

# TASK-RALLY-007: addAssistantMessage依存配列修正

## メタ情報

| 項目                | 値                                              |
| ------------------- | ----------------------------------------------- |
| タスクID            | TASK-RALLY-007                                  |
| 機能名              | スキルクリエイター ラリー機能 stale closure排除 |
| 作成日              | 2026-04-21                                      |
| 実行形態            | par                                             |
| 依存タスク          | なし（Wave 2・並列実行可）                      |
| 衝突ドメイン        | useInterviewStateドメイン                       |
| implementation_mode | new                                             |

## 目的

`useInterviewState.ts` の `addAssistantMessage` は `useCallback` で定義されており、依存配列に `currentStepIndex` が含まれている。`currentStepIndex` は steps 配列が更新されるたびに変わる可能性があるが、`useCallback` のクロージャは依存配列が変化するまで古い値を保持し続ける。

このため「steps 配列が更新されたが `currentStepIndex` はまだ古い値を持つ」という短い時間窓でアシスタントメッセージを追加すると、間違った stepIndex でメッセージが追加される stale closure 問題が発生しうる。

本タスクでは `currentStepIndex` を `useRef` で追跡し、`addAssistantMessage` の `useCallback` 依存配列から `currentStepIndex` を除去することで stale closure を解消する。また `setTotalSteps` の更新を `setState(prev => ...)` パターンに変更して `currentStepIndex` への依存を断つ。

## スコープ

### 含む

- `useInterviewState.ts` の `addAssistantMessage` useCallback の依存配列から `currentStepIndex` を除去する
- `currentStepIndex` を `useRef` で最新値を追跡するパターンへの変更
- `setTotalSteps` の更新を `setState(prev => ...)` パターンに変更する
- `react-hooks/exhaustive-deps` ESLint ルールへの準拠確認

### 含まない

- `useInterviewState.ts` 以外のファイルの変更
- ConversationalInterview.tsx への変更（別スコープ）
- SkillLifecyclePanel.tsx への変更（別スコープ）
- commit / push / PR 実行

## Phase 1: 要件定義

### 受け入れ基準

- AC-1: `addAssistantMessage` の useCallback 依存配列から `currentStepIndex` が除去されていること
- AC-2: `currentStepIndexRef` が実装され、currentStepIndex の変化を追跡していること
- AC-3: `addAssistantMessage` 内で `currentStepIndexRef.current` を使用して常に最新の stepIndex を参照していること
- AC-4: `setTotalSteps`（または同等の state 更新）が `setState(prev => ...)` パターンを使用していること
- AC-5: `react-hooks/exhaustive-deps` ESLint ルールが警告を出さないこと
- AC-6: `pnpm typecheck` がエラーなしで通過すること
- AC-7: `pnpm lint` がエラーなしで通過すること

### P50チェック

対象ファイルの現状実装を確認する：

```bash
# addAssistantMessage の現状確認
grep -n "addAssistantMessage\|currentStepIndex\|setTotalSteps\|useCallback\|useRef" \
  apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts | head -40

# ファイル全体の行数確認
wc -l apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts

# ESLint 現状確認
pnpm lint apps/desktop/src/renderer/components/skill/hooks/useInterviewState.ts 2>&1 | grep -A2 "exhaustive-deps"
```

## Phase 2: 設計

### 変更箇所

#### 現状（概念コード）

```typescript
const addAssistantMessage = useCallback(
  (message: AssistantMessage) => {
    setSteps((prev) => {
      // currentStepIndex を直接クロージャで参照している
      const updatedStep = {
        ...prev[currentStepIndex],
        assistantMessages: [
          ...(prev[currentStepIndex]?.assistantMessages ?? []),
          message,
        ],
      };
      // ...
    });
    setTotalSteps(currentStepIndex + 1); // ← currentStepIndex への直接依存
  },
  [currentStepIndex, setSteps, setTotalSteps], // ← currentStepIndex が依存配列にある
);
```

#### 変更後

```typescript
// currentStepIndex を ref で追跡
const currentStepIndexRef = useRef(currentStepIndex);
useEffect(() => {
  currentStepIndexRef.current = currentStepIndex;
}, [currentStepIndex]);

const addAssistantMessage = useCallback(
  (message: AssistantMessage) => {
    // ref 経由で常に最新値を参照 → stale closure なし
    const stepIndex = currentStepIndexRef.current;
    setSteps((prev) => {
      const updatedStep = {
        ...prev[stepIndex],
        assistantMessages: [
          ...(prev[stepIndex]?.assistantMessages ?? []),
          message,
        ],
      };
      // ...
    });
    // setState(prev => ...) パターンで currentStepIndex への依存を断つ
    setTotalSteps((prev) => Math.max(prev, stepIndex + 1));
  },
  [setSteps, setTotalSteps], // currentStepIndex を除外 → 依存配列が安定
);
```

**設計判断の根拠**：

- `useRef` の current は依存配列に含める必要がない（React の規約上、ref は安定した参照のため）
- `setState(prev => ...)` パターンは最新の state を引数として受け取るため、外側の変数をクロージャで参照しなくて済む
- 依存配列が空（または安定した値のみ）になることで、コールバック関数自体が不必要に再生成されなくなりパフォーマンスも向上する

### 検証方法

1. `pnpm lint` で `exhaustive-deps` 警告が出ないことを確認
2. 単体テストでステップ追加の正しい stepIndex が使われることを確認
3. 複数ステップ進んだ後に addAssistantMessage を呼んだとき、正しいステップにメッセージが追加されることを確認
4. `pnpm typecheck` でエラーなしを確認

## Phase 3: 実装計画

1. `useInterviewState.ts` の `addAssistantMessage` と関連する `currentStepIndex` の全使用箇所を把握する
2. `currentStepIndexRef` を追加し、`currentStepIndex` の変化を追跡する useEffect を追加する
3. `addAssistantMessage` 内の `currentStepIndex` 参照を `currentStepIndexRef.current` に変更する
4. `setTotalSteps` の呼び出しを `setState(prev => ...)` パターンに変更する
5. `addAssistantMessage` の useCallback 依存配列から `currentStepIndex` を除去する
6. `pnpm lint` を実行して `exhaustive-deps` 警告がないことを確認する
7. 単体テストを作成または更新する
8. `pnpm typecheck` と `pnpm lint` を実行して品質を確認する

## Phase 4: テスト設計

### 単体テスト（Vitest）

テスト対象: `useInterviewState.ts` の `addAssistantMessage`

| テストケース | 内容                                                | 期待結果                                                    |
| ------------ | --------------------------------------------------- | ----------------------------------------------------------- |
| TC-1         | stepIndex=0 のとき addAssistantMessage を呼ぶ       | steps[0] にメッセージが追加される                           |
| TC-2         | stepIndex=2 に進んだ後に addAssistantMessage を呼ぶ | steps[2] にメッセージが追加される                           |
| TC-3         | steps が更新される直前に addAssistantMessage を呼ぶ | 最新の currentStepIndex（ref 経由）でメッセージが追加される |
| TC-4         | addAssistantMessage を複数回呼ぶ                    | 各呼び出しで正しいステップにメッセージが追加される          |
| TC-5         | setTotalSteps が prev ベースで更新される            | currentStepIndex + 1 と同等の結果になる                     |

## Phase 5: 実装

Phase 3 の手順に従い実装する。

実装時の注意点：

- `currentStepIndexRef` の型は `React.MutableRefObject<number>` となる
- `useEffect` で currentStepIndex を追跡する際、初期値は `useRef(currentStepIndex)` の引数として設定する
- `setTotalSteps(prev => ...)` のパターンが `setTotalSteps` の型シグネチャと合致するか確認する（`Dispatch<SetStateAction<number>>` ならば対応済み）

## Phase 12: ドキュメント

### 変更内容のドキュメント化

- `addAssistantMessage` のインラインコメントに「currentStepIndexRef を使う理由（stale closure 防止）」を追記する
- `setState(prev => ...)` パターンの説明コメントを追加する

中学生レベルの概念説明：

`useCallback` は「関数を記憶しておく仕組み」です。依存配列に書いた値が変化しない限り、同じ関数を使い回します。便利ですが「関数を作った時点の値しか覚えていない」という問題（stale closure：古いクロージャ）があります。たとえば「ステップ番号が 0 の時に関数を作った」場合、ステップ番号が 2 になっても関数は 0 を覚えています。`useRef` を使うと「いつでも最新の値を見に行ける窓口」を作れます。本タスクではこの窓口を使って、常に正しいステップ番号でメッセージを追加できるようにします。

## Phase 13: 完了確認

### 完了条件

- [ ] `addAssistantMessage` の useCallback 依存配列から `currentStepIndex` が除去されている
- [ ] `currentStepIndexRef` が実装され、useEffect で最新値を追跡している
- [ ] `addAssistantMessage` 内で `currentStepIndexRef.current` を使用している
- [ ] `setTotalSteps` が `setState(prev => ...)` パターンを使用している
- [ ] 単体テスト TC-1〜TC-5 がすべて PASS している
- [ ] `pnpm lint` の `exhaustive-deps` 警告がゼロである
- [ ] `pnpm typecheck` がエラーなしで通過している

### タスク100%実行確認【必須】

- [ ] Phase 1〜12 完了
- [ ] 受け入れ基準 AC-1〜AC-7 全PASS
- [ ] 本タスクは Wave 2 並列実行可。SkillLifecyclePanel.tsx を変更しないため他タスクとの衝突なし
