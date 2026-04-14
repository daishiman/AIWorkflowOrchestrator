# Phase 12: スキルフィードバックレポート

## 対象: TASK-SW-FIX-STATE-DETAIL-001

---

## 改善観点

### 観点 1: useEffect 依存配列の見落としを防ぐレビューチェックリスト

**背景**: 問題12・18は両方とも「state が props の変化に追従しない」バグであり、
`useEffect` の依存配列が不完全なことが根本原因だった。
このクラスのバグはコードレビューで検出しにくい。

**提案**: 以下のチェックリストを skill のレビューフェーズに追加する。

```
useEffect レビューチェックリスト:
- [ ] 依存配列に含めていない変数を effect 内で参照していないか
- [ ] eslint-disable exhaustive-deps を使う場合、コメントで理由を明記しているか
- [ ] 依存配列が空（[]）の場合、マウント時のみ実行で問題ないか
- [ ] 依存配列に関数が含まれる場合、その関数は useCallback で安定化されているか
- [ ] effect 内で setState を呼ぶ場合、無限ループ条件を排除しているか（allEmpty パターン等）
```

---

### 観点 2: useRef ロックパターンの finally 保証

**背景**: 問題19は `generationLockRef.current = false` が finally 以外のブロックにあり、
エラーパスでリセットが漏れていた。

**提案**: useRef ロックを使う実装では、以下のパターンを標準化する。

```typescript
// 推奨パターン: ロック解放は必ず finally に置く
generationLockRef.current = true;
try {
  // ... 非同期処理 ...
} finally {
  generationLockRef.current = false; // 常に解放
  // requestId ガードが必要な処理は if 文で分岐
}
```

---

### 観点 3: optional prop の wire-up 確認

**背景**: 問題13修正では `isTemplateMode` prop の追加だけでなく、呼び出し元からの wire-up も必要だった。今回のタスクでは `SkillCreateWizardShell` によって実装済みだが、route wrapper を増やすと伝播漏れが再発しやすい。

**提案**: 新規 prop 追加時は以下を確認する。

```
新規 prop 追加チェックリスト:
- [ ] prop を追加したコンポーネントの全呼び出し箇所を grep で確認
- [ ] オプショナル prop でもデフォルト値が意図通りか確認
- [ ] テストで prop なし（デフォルト値）のケースを含めているか
```

---

## 30思考法 traceability

| 論点                                            | 採用思考法                 | 結論                                                                               |
| ----------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------- |
| 問題12: internalAnswers の残留                  | 構造分解（原因分析）       | `useState` 初期化はマウント時のみ。`useEffect([answers])` で対応                   |
| 問題12: 無限ループ防止                          | 論理分析（矛盾排除）       | `allEmpty` チェックで非空時はリセット不発にする                                    |
| 問題13: キャンセルボタンの条件                  | システム系（影響範囲分析） | 既存の `showCancelButton` と独立した条件式で templateMode 専用化                   |
| 問題18: q5 のみ依存                             | 発想・拡張（最小化）       | `answers.q5` のみを依存配列に指定し、他問の変化で不要な再計算を防ぐ                |
| 問題19: finally vs 条件分岐                     | 論理分析（全経路保証）     | throw / return / 正常完了の3経路を finally で一元化                                |
| `eslint-disable exhaustive-deps` の使用         | 論理分析（意図明示）       | 意図的な依存省略はコメントで理由を明記する                                         |
| `isTemplateMode` wire-up の確認                 | システム系（伝播経路確認） | route wrapper と本体の両方で prop が伝播していることを確認。回帰防止観点として残す |
| リファクタリング候補（`allEmpty` 関数化）の保留 | 発想・拡張（過剰設計排除） | ワンライナーレベルの処理は現時点では過剰。将来の concern 増加時に対応              |
