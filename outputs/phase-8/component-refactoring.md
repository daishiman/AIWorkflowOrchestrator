# Phase 8 タスク4: コンポーネント内リファクタリング記録

## 調査結果

SkillCreateWizard.tsx 内のリファクタリング候補を調査した。

### エラーハンドリングパターン

handleLlmGenerate と handleExecutePlan の catch ブロックは類似しているが、
エラーメッセージが異なり処理の意味論も異なるため共通化する価値は薄い。

### 生成状態クリア

`setLocalPlanResult(null)` + `clearGenerationState()` の組み合わせが handleExecutePlan と handleCancelPlan の両方に現れる（AC-10 対称クリアの仕様）。この組み合わせは仕様上意図的であり、共通化すると対称クリアの可視性が下がる。コメントで AC-10 参照を明記することで可読性を確保している。

### resetGeneratedState

既存の `resetGeneratedState(preserveFormData)` 関数がテンプレートフローのリセット処理を担っている。LLM フローのリセット（handleCancelPlan）は setState の組み合わせで十分シンプルなので共通化は不要。

## 判断: リファクタリング不実施

実装はすでに適切な粒度で整理されている。不要な抽象化を避けるため、現状を維持する。
