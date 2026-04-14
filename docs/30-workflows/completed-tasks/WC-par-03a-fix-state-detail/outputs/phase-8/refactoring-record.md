# Phase 8: リファクタリング記録

## 概要

4 件の修正後の命名・useEffect 依存配列・ロジック重複を確認した。
最小変更の原則に従い、実質的なリファクタは不要と判断した。

---

## Task 1: 命名整理

| 確認項目                              | 状態 | 判断                                                                                           |
| ------------------------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| `internalAnswers` / `answers` の混在  | なし | コンポーネント内部は `internalAnswers`、props は `answers` で統一済み                          |
| `createEmptyAnswers()` の命名         | 適切 | 空の初期値生成を明示しており一貫                                                               |
| `generationLockRef` 関連変数名        | 一貫 | `generationLockRef` / `generationRequestIdRef` / `invalidateGenerationRequests` で統一         |
| `resolveExternalIntegration` 呼び出し | 適切 | handleGenerate と useEffect の 2 箇所だが、役割が異なる（生成時 vs q5 変更時）ため重複ではない |

**結論**: 命名変更不要。

---

## Task 2: useEffect 依存配列の整理

| useEffect              | 依存配列       | eslint-disable          | 判断                                                                                                                                   |
| ---------------------- | -------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 問題12: `[answers]`    | `[answers]`    | あり（exhaustive-deps） | `allEmpty` チェック内で `answers[k]` を参照するが、`answers` 全体を依存に取ることで意図が明確。disable は意図的で問題なし              |
| 問題18: `[answers.q5]` | `[answers.q5]` | あり（exhaustive-deps） | `resolveExternalIntegration` 内で `smartDefaults` / `formData` を参照するが、q5 変更時のみ再計算するという意図を優先。disable は意図的 |

**結論**: 依存配列は最小限。exhaustive-deps disable は理由コメント付きで承認。

---

## Task 3: ロジック重複の確認

| 確認項目                                  | 状態                                  | 判断                                                                                                  |
| ----------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `resolveExternalIntegration` 呼び出し箇所 | 2 箇所（handleGenerate と useEffect） | 役割が異なるため重複ではない。handleGenerate は生成直前の確定値取得、useEffect は q5 変更時の即時更新 |
| `generationLockRef.current = false`       | finally ブロック 1 箇所に集約         | Phase 5 修正後、全経路で一元管理されている。重複なし                                                  |
| `setIsGenerating(false)`                  | finally ブロック 1 箇所               | 同上                                                                                                  |

**結論**: ロジック重複なし。

---

## 最小複雑性の判断

追加コード量（useEffect 2 件 + JSX 1 ブロック + prop 1 件）は最小限。
既存ロジックへの副作用なし。

抽象化の余地（`allEmpty` の関数抽出など）は存在するが、ワンライナーレベルの処理であり現時点では過剰。
今後の concern が増えた段階でのリファクタを推奨。
