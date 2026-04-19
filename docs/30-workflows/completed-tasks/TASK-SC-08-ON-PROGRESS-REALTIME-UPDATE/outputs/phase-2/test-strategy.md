# テスト戦略書

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 2                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. テスト方針

### TDD アプローチ

本タスクは TDD（テスト駆動開発）で進める。

1. **Red フェーズ（Phase 4）**: 新 phase のマッピングに対する失敗テストを先に作成する
2. **Green フェーズ（Phase 5）**: `PHASE_TO_STAGE` に 4 エントリ追加して全テストを PASS させる
3. **Refactor フェーズ（Phase 6）**: エッジケース・回帰テストを追加して品質を向上させる

### テスト対象の選定理由

- `PHASE_TO_STAGE` の変換ロジックは純粋関数的であり、単体テストが容易
- モード別の phase 名は決定論的にマッピングされるため、期待値が明確
- フォールバック動作の検証は境界値テストとして重要

---

## 2. テストレベル

### 単体テスト（Unit Test）

| 対象                    | ツール | 対象ファイル                   |
| ----------------------- | ------ | ------------------------------ |
| `mapPhaseToStage` 関数  | Vitest | `useStreamingProgress.test.ts` |
| `PHASE_TO_STAGE` マップ | Vitest | `useStreamingProgress.test.ts` |

### 統合テスト（Integration Test）

| 対象                          | ツール                   | 対象ファイル                   |
| ----------------------------- | ------------------------ | ------------------------------ |
| onProgress → Store 更新フロー | Vitest + Testing Library | `useStreamingProgress.test.ts` |
| モード別進捗の UI 反映        | Vitest + Testing Library | `SkillLifecyclePanel.test.ts`  |

---

## 3. モード別マッピングテスト戦略

### update モードテスト

```typescript
describe("update モード phase マッピング", () => {
  it("TC-01: loading-skill → planning", () => {
    expect(mapPhaseToStage("loading-skill")).toBe("planning");
  });

  it("TC-02: analyzing → planning", () => {
    expect(mapPhaseToStage("analyzing")).toBe("planning");
  });
});
```

### orchestrate モードテスト

```typescript
describe("orchestrate モード phase マッピング", () => {
  it("TC-03: engine-selection → planning", () => {
    expect(mapPhaseToStage("engine-selection")).toBe("planning");
  });
});
```

### improve-prompt モードテスト

```typescript
describe("improve-prompt モード phase マッピング", () => {
  it("TC-04: improving → generating-skill", () => {
    expect(mapPhaseToStage("improving")).toBe("generating-skill");
  });
});
```

### create モード回帰テスト

```typescript
describe("create モード phase マッピング（回帰）", () => {
  it("TC-05: 既存 create phase が変わらない", () => {
    expect(mapPhaseToStage("planning")).toBe("planning");
    expect(mapPhaseToStage("generating-skill")).toBe("generating-skill");
    expect(mapPhaseToStage("generating-agents")).toBe("generating-agents");
    expect(mapPhaseToStage("validating")).toBe("validating");
    expect(mapPhaseToStage("done")).toBe("done");
  });
});
```

### フォールバックテスト

```typescript
describe("未知 phase のフォールバック", () => {
  it("TC-07: 未登録 phase は planning にフォールバック", () => {
    expect(mapPhaseToStage("unknown-phase")).toBe("planning");
    expect(mapPhaseToStage("")).toBe("planning");
  });
});
```

---

## 4. テストカバレッジ目標

| 対象                        | 目標カバレッジ | 備考                         |
| --------------------------- | -------------- | ---------------------------- |
| `mapPhaseToStage` 全分岐    | 100%           | 全 phase 名 + フォールバック |
| `PHASE_TO_STAGE` 全エントリ | 100%           | 9 エントリすべて検証         |
| onProgress コールバック登録 | 80% 以上       | 正常系 + エラー系            |

---

## 5. テスト実行コマンド

```bash
# useStreamingProgress 単体テスト
pnpm --filter @repo/desktop test -- --run useStreamingProgress

# SkillLifecyclePanel 統合テスト
pnpm --filter @repo/desktop test -- --run SkillLifecyclePanel

# 全テスト実行（リグレッション確認）
pnpm --filter @repo/desktop test -- --run

# TypeScript 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 6. テスト除外範囲

| 除外対象                         | 理由                                      |
| -------------------------------- | ----------------------------------------- |
| Main プロセスの IPC emit         | TASK-SC-08 のスコープ外                   |
| Preload の safeOn 実装           | 既存テストで検証済み（TASK-SC-07 成果物） |
| E2E テスト（Playwright）         | phase マッピング変更は単体・統合で十分    |
| `generationProgressSlice` 型変更 | 変更なしのため、既存テストで十分          |
