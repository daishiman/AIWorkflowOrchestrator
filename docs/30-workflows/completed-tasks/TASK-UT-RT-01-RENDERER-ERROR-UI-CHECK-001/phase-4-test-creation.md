# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 4                                            |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 3（PASS）                              |
| 後続Phase  | Phase 5                                      |
| 作成日     | 2026-04-13                                   |
| ステータス | pending                                      |

## 目的

Phase 2 のテスト設計に基づき、`SkillLifecyclePanel.tsx` のエラー表示経路を検証する
Vitest テストケースを作成し、TDD の Red フェーズを確認する。

## 前提条件確認

```bash
# 依存関係の整合確認（worktree 環境での必須チェック）
pnpm install
pnpm --filter @repo/shared build

# 既存テストファイルの確認
find apps/desktop/src/renderer/components/skill -name "*.test.*" 2>/dev/null
```

**注意（[FB-MSO-002]）**: テスト実行前に esbuild darwin バイナリ mismatch を確認する。
worktree 直後は `pnpm install` を必ず実行すること。

## テスト実装方針

### private method テスト方針（[Feedback P0-09-U1]）

`SkillLifecyclePanel.tsx` のテストにおいて、内部 callback（`onWorkflowStateChanged` のハンドラ）は
public な IPC イベント発火経由で検証する。
直接 private method を呼ぶ場合は `(component as unknown as ComponentPrivate)` キャストを使う。

### テストファイル構成

```
apps/desktop/src/renderer/components/skill/
└── SkillLifecyclePanel.test.tsx  # 新規作成 or 既存に追記
```

### テストケース実装対象

| テストID | 実装内容                                                            |
| -------- | ------------------------------------------------------------------- |
| UT-01    | `onWorkflowStateChanged` mock → `setWorkflowError` → alert 表示確認 |
| UT-02    | `skillExecutionStatus: "error"` → sessionEntries detail 表示確認    |
| UT-03    | `getWorkflowState` failure snapshot → UI 反映確認                   |
| UT-04    | `localError` 優先順位の確認                                         |
| UT-05    | `errorMessage` が undefined の場合に alert が表示されないことを確認 |

### テスト雛形

```typescript
describe("SkillLifecyclePanel - エラーメッセージ表示", () => {
  beforeEach(() => {
    // Object.defineProperty を使ってモック（vi.stubGlobal 禁止）
    Object.defineProperty(window, "skillCreatorAPI", {
      value: {
        onWorkflowStateChanged: vi.fn(),
        // ...
      },
      writable: true,
      configurable: true,
    });
  });

  it("UT-01: onWorkflowStateChanged で errorMessage を受信したとき skill-lifecycle-error に表示する", async () => {
    // TODO: Phase 5 で実装
  });
});
```

## 参照資料

| 参照資料     | パス                               | 説明           |
| ------------ | ---------------------------------- | -------------- |
| テスト設計書 | `outputs/phase-2/test-design.md`   | Phase 2 成果物 |
| テスト戦略   | `outputs/phase-2/test-strategy.md` | Phase 2 成果物 |
| ゲート判定   | `outputs/phase-3/gate-decision.md` | Phase 3 成果物 |

## 実行手順

1. `pnpm install` + `pnpm --filter @repo/shared build` で依存整合を確認する
2. 既存テストファイルの有無を確認する
3. UT-01〜UT-05 のテストケースを作成する（Red: FAIL 状態）
4. テストを実行して Red（FAIL）を確認する:
   ```bash
   pnpm --filter @repo/desktop exec vitest run \
     apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.test.tsx
   ```
5. Red 結果を記録する

## 成果物

| 成果物           | パス                                    | 説明                     |
| ---------------- | --------------------------------------- | ------------------------ |
| テスト仕様書     | `outputs/phase-4/test-specification.md` | UT-01〜UT-05 の詳細仕様  |
| Red結果          | `outputs/phase-4/red-test-result.md`    | FAIL 確認の証跡          |
| テストケース一覧 | `outputs/phase-4/test-case-list.md`     | テストケース一覧と期待値 |

## 完了条件

- [ ] UT-01〜UT-05 のテストケースが作成されている
- [ ] Red（FAIL）が確認されている
- [ ] テスト命名が既存命名規則と整合している
- [ ] `vi.stubGlobal("window", ...)` が使用されていない
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] Red 結果が記録されている
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001
```

## 次のPhase

Phase 5: 実装
