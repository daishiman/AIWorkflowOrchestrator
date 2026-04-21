# Phase 2: 設計

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| Phase      | 2                               |
| 機能名     | TASK-RALLY-007                  |
| タスク名   | addAssistantMessage依存配列修正 |
| 前提Phase  | Phase 1                         |
| 後続Phase  | Phase 3                         |
| 作成日     | 2026-04-21                      |
| ステータス | pending                         |

## 目的

`addAssistantMessage`のstale closure問題を解消する設計方針を確定する。
`useRef`による最新値追跡パターンと`setState(prev => ...)`パターンへの変更設計を固定する。

## 実行タスク

- 変更前後のコード設計を定義する（直列）
- `currentStepIndexRef`の型・初期化・追跡useEffectを設計する
- `addAssistantMessage`内の依存関係を整理し、依存配列から`currentStepIndex`を除去する設計を確定する
- `setTotalSteps`の呼び出しを`setState(prev => ...)`パターンに変更する設計を確定する
- 設計判断の根拠を文書化する

## 参照資料

| 資料名           | パス                                                                   | 用途              |
| ---------------- | ---------------------------------------------------------------------- | ----------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`                           | Phase 1成果物     |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`                               | Phase 1成果物     |
| コード調査結果   | `outputs/phase-1/code-investigation.md`                                | Phase 1成果物     |
| 設計ドキュメント | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` | RALLY-007設計方針 |

## 設計内容

### 変更前（概念コード）

```typescript
const addAssistantMessage = useCallback(
  (message: AssistantMessage) => {
    setSteps((prev) => {
      const updatedStep = {
        ...prev[currentStepIndex],
        assistantMessages: [
          ...(prev[currentStepIndex]?.assistantMessages ?? []),
          message,
        ],
      };
      // ...
    });
    setTotalSteps(currentStepIndex + 1); // currentStepIndexへの直接依存
  },
  [currentStepIndex, setSteps, setTotalSteps], // currentStepIndexが依存配列にある
);
```

### 変更後

```typescript
// currentStepIndexをrefで追跡
const currentStepIndexRef = useRef(currentStepIndex);
useEffect(() => {
  currentStepIndexRef.current = currentStepIndex;
}, [currentStepIndex]);

const addAssistantMessage = useCallback(
  (message: AssistantMessage) => {
    // ref経由で常に最新値を参照 → stale closureなし
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
    // setState(prev => ...)パターンでcurrentStepIndexへの依存を断つ
    setTotalSteps((prev) => Math.max(prev, stepIndex + 1));
  },
  [setSteps, setTotalSteps], // currentStepIndexを除外 → 依存配列が安定
);
```

### 設計判断の根拠

- `useRef`のcurrentは依存配列に含める必要がない（React規約上、refは安定した参照のため）
- `setState(prev => ...)`パターンは最新のstateを引数として受け取るため、外側の変数をクロージャで参照しなくて済む
- 依存配列が安定することで、コールバック関数自体が不必要に再生成されなくなりパフォーマンスも向上する

## 成果物

| 成果物             | パス                                   | 説明                          |
| ------------------ | -------------------------------------- | ----------------------------- |
| アーキテクチャ設計 | `outputs/phase-2/design-spec.md`       | 変更前後の詳細設計            |
| 依存配列設計       | `outputs/phase-2/deps-array-design.md` | useCallback依存配列の設計根拠 |

## 完了条件

- [ ] 変更前後のコード設計が文書化されていること
- [ ] `currentStepIndexRef`の型・初期化・追跡パターンが確定していること
- [ ] `setTotalSteps`の`setState(prev => ...)`パターンへの変更設計が確定していること
- [ ] 設計判断の根拠が文書化されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビューゲート
