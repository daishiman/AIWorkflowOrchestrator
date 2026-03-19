# Lessons Learned: SafetyGate / IPC 品質検証

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: SafetyGate 実装、IPC テスト品質、DIP/型安全パターンに関する教訓
> 分割元: [lessons-learned-current.md](lessons-learned-current.md)

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 正本     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` |
| 目的     | SafetyGate 実装と IPC テスト品質に関する教訓を集約                    |
| スコープ | IPC レスポンス形式、DIP 準拠、型安全パターン、カバレッジ分析          |
| 対象読者 | AIWorkflowOrchestrator 開発者                                          |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-03-18 | 1.0.0 | lessons-learned-current.md から分割作成。UT-06-003 SafetyGate 実装の教訓5件を移動 |

---

## 2026-03-17 UT-06-003 SafetyGate 実装

### 苦戦箇所1: IPC テスト応答形式の不一致（最も苦戦）

| 項目 | 内容 |
| --- | --- |
| 課題 | テスト I-3〜I-7 が `{ code: "VALIDATION_ERROR" }` のフラットな形式を期待していたが、実装は `{ success: false, error: { code: "VALIDATION_ERROR" } }` のラッパー形式を返していた。テスト全体の修正が必要になった |
| 再発条件 | Phase 4（テスト設計）で IPC レスポンスの wrapper 構造を明示的に決定せず、Phase 5（実装）で初めて形式が確定する |
| 解決策 | テストの全アサーションを `result.error.code` 形式に修正。Phase 4 で IPC レスポンスの wrapper 形式（`{ success, data?, error? }`）を事前に明示的に定義する |
| 標準ルール | IPC ハンドラのテスト設計時にレスポンス構造（success/error wrapper）を Phase 2 設計書に明記し、テストコードに反映する |
| 関連パターン | P60（新規） |
| 関連タスク | UT-06-003 |

```typescript
// Phase 4 でフラットな形式を想定（不正）
expect(result).toEqual({ code: "VALIDATION_ERROR", message: "..." });

// Phase 5 の実装が返す実際の形式
expect(result).toEqual({
  success: false,
  error: { code: "VALIDATION_ERROR", message: "..." },
});
```

### 苦戦箇所2: DIP 違反の遅発検出

| 項目 | 内容 |
| --- | --- |
| 課題 | `registerSafetyGateHandlers` が `DefaultSafetyGate`（具象クラス）を引数に取っていた。Phase 10 の最終レビューまで検出されなかった |
| 再発条件 | Phase 2 設計で IPC ハンドラの依存先が Port/Interface であることを設計チェック項目に含めない |
| 解決策 | 引数型を `SafetyGatePort`（インターフェース）に変更 |
| 標準ルール | Phase 2 設計書に「IPC ハンドラの依存先が Port/Interface であること」を設計チェック項目として含める |
| 関連パターン | P61（新規）、DIP（依存性逆転原則） |
| 関連タスク | UT-06-003 |

```typescript
// DIP 違反（具象クラス依存）
export function registerSafetyGateHandlers(safetyGate: DefaultSafetyGate): void {}

// DIP 準拠（インターフェース依存）
export function registerSafetyGateHandlers(safetyGate: SafetyGatePort): void {}
```

### 苦戦箇所3: P49 違反（as キャスト）の残存

| 項目 | 内容 |
| --- | --- |
| 課題 | エラーハンドリングで `(error as { code: string })` を使用。コンパイルは通るが実行時に安全でない |
| 再発条件 | catch ブロック内の `error: unknown` に対して `as` キャストを安易に使用する |
| 解決策 | `in` 演算子 + `typeof` による段階的な実行時検証に置換 |
| 標準ルール | catch ブロック内の `error: unknown` に対しては、必ず `in` 演算子パターンを使用する（P49 準拠） |
| 関連パターン | P49（type predicate 内での `as` キャスト vs `in` 演算子） |
| 関連タスク | UT-06-003 |

```typescript
// P49 違反
const err = error as { code: string };
return { success: false, error: { code: err.code } };

// P49 準拠
if (error != null && typeof error === "object" && "code" in error && typeof error.code === "string") {
  return { success: false, error: { code: error.code } };
}
```

### 苦戦箇所4: カバレッジ未達箇所の特定困難（ternary 分岐）

| 項目 | 内容 |
| --- | --- |
| 課題 | `normalizePath` の末尾スラッシュ分岐（ternary の true ケース）が未カバー。行レベルのカバレッジレポートでは特定が困難だった |
| 再発条件 | ternary 演算子の分岐カバレッジを行レベルレポートだけで確認しようとする |
| 解決策 | JSON カバレッジ出力 + Node.js スクリプトで正確な未カバー分岐を特定 |
| 標準ルール | ternary 演算子の分岐カバレッジは v8 プロバイダの JSON 出力を使って分析する。行レベルレポートだけでは不十分 |
| 関連パターン | P41（v8 カバレッジプロバイダのインライン関数カウント） |
| 関連タスク | UT-06-003 |

### 苦戦箇所5: 未タスク配置ディレクトリの間違い（P38 再発）

| 項目 | 内容 |
| --- | --- |
| 課題 | 未タスク指示書を `safety-gate-implementation/unassigned-task/` に配置したが、正しくは `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` |
| 再発条件 | workflow ローカルパスに未タスクを配置する（P38/P58 と同一パターン） |
| 解決策 | root canonical path（`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/`）へ再配置 |
| 標準ルール | Phase 12 テンプレートに「配置先: `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/`」を明示する |
| 関連パターン | P38（未タスク配置ディレクトリ間違い）、P58（設計タスクにおける未タスク指示書の配置省略） |
| 関連タスク | UT-06-003 |

### 同種課題の簡潔解決手順（5ステップ）

1. Phase 2 設計書に IPC レスポンス wrapper 形式（`{ success, data?, error? }`）と IPC ハンドラの依存先（Port/Interface）を明記する。
2. Phase 4 テスト設計時に Phase 2 のレスポンス形式定義を参照し、アサーションを wrapper 形式で記述する。
3. catch ブロック内の `error: unknown` には `in` 演算子パターンのみ使用し、`as` キャストを禁止する。
4. ternary 演算子の分岐カバレッジは `vitest run --coverage --reporter=json` で JSON 出力して分析する。
5. 未タスク指示書は必ず `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に配置する。
