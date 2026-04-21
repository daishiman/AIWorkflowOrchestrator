# Phase 2 成果物: SubAgent lane plan

## 目的

Phase 2 設計の 4 ファイル変更と新規 4 テストシナリオを
並列 / 直列の SubAgent lane に分割し、依存関係を固定する。

## Lane 定義

| Lane | 対象                                              | 出力              | 実行形態                 |
| ---- | ------------------------------------------------- | ----------------- | ------------------------ |
| A    | preload 型 + Main 送信関数シグネチャ              | 型差分提案        | 並列                     |
| B    | Runtime ルート emit 経路調査 + callback 設計      | emit path 決定書  | 直列（A の型提案に依存） |
| C    | Renderer Hook フィルタ + useEffect 依存配列最適化 | filter 擬似コード | 並列                     |
| D    | テスト追加設計（4 シナリオ + 既存 PASS 維持）     | test matrix       | 直列（A/B/C 合意後）     |

## Lane 詳細

### Lane A（並列）

- **対象ファイル**
  - `apps/desktop/src/preload/skill-creator-api.ts`
  - `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- **作業**
  - `SkillCreatorProgress` に `planId?: string` / `requestId?: string` を追加する型差分提案
  - `sendSkillCreatorProgress` の progress 引数型拡張
- **出力**: 型差分提案（Phase 5 patch-plan.md へ入力）
- **前提依存**: なし（Lane C と並列実行可能）

### Lane B（直列 / A に依存）

- **対象ファイル**
  - `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- **作業**
  - `executeAsync` / `onWorkflowStateSnapshot` 経路の詳細調査
  - Runtime ルートからも `skill-creator:progress` を emit するか、`onWorkflowStateSnapshot` 経由のみで UI を駆動するかを決定
  - emit する場合、`onProgressCallback?: (progress: SkillCreatorProgress) => void` を facade 注入する設計
- **出力**: emit path 決定書
- **前提依存**: Lane A の型確定（`SkillCreatorProgress` 拡張）が必要

### Lane C（並列）

- **対象ファイル**
  - `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
- **作業**
  - `options?: { planId?: string }` の Hook シグネチャ拡張
  - callback 先頭での filter 分岐擬似コード固定
  - `useEffect` 依存配列への `options?.planId` 追加可否判定
- **出力**: filter 擬似コード + 依存配列判断
- **前提依存**: なし（Lane A と並列実行可能）

### Lane D（直列 / A・B・C に依存）

- **対象ファイル**
  - `apps/desktop/src/renderer/hooks/__tests__/useStreamingProgress.test.ts`
  - （必要に応じて）`apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.*.ts`
- **作業**
  - 新規 4 シナリオ test matrix 作成
    1. match: `options.planId === progress.planId` → ストア更新
    2. miss: `options.planId !== progress.planId` → スキップ
    3. legacy payload: `progress.planId === undefined` → 受け入れ（後方互換）
    4. no options: `options === undefined` → 全通知受け入れ
  - 既存テスト（約 40 シナリオ）の PASS 維持確認
- **出力**: test matrix（Phase 4 test-scenarios.md の入力）
- **前提依存**: Lane A/B/C 合意後でなければ test matrix が確定しない

## 依存関係図（テキスト）

```
             ┌─────────┐
             │ Lane A  │ (並列)
             │ 型/送信  │
             └────┬────┘
                  │
          ┌───────┴────────┐
          │                │
          ▼                │
     ┌─────────┐      ┌─────────┐
     │ Lane B  │      │ Lane C  │ (並列)
     │ Runtime │      │  Hook   │
     └────┬────┘      └────┬────┘
          │                │
          └────────┬───────┘
                   │
                   ▼
              ┌─────────┐
              │ Lane D  │ (直列)
              │  Test   │
              └─────────┘
```

### 依存関係サマリ

- A → B（Lane B は Lane A の型確定に依存）
- A / B / C → D（Lane D は 3 lane 全て合意後）
- A と C は並列実行可能

## Phase ゲート

- Phase 2 → 3: 4 lane すべての出力が揃い、Runtime ルート emit 経路方針が決定していること

## 参照資料

- [phase-2-design.md](../../phase-2-design.md)
- [phase-1 current-implementation-audit.md](../phase-1/current-implementation-audit.md)

## 完了条件

- [x] Lane A/B/C/D の役割 / 実行形態 / 前提依存が明記されている
- [x] 依存関係図（A→B, A→C, A/B/C→D）が図示されている
- [x] 新規 4 シナリオの test matrix 雛形が定義されている
