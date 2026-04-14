# Phase 2: 設計

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 2                                            |
| タスクID   | TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001    |
| タスク名   | Renderer 側エラーメッセージ UI 表示 E2E 確認 |
| 前提Phase  | Phase 1                                      |
| 後続Phase  | Phase 3                                      |
| 作成日     | 2026-04-13                                   |
| ステータス | pending                                      |

## 目的

Phase 1 の受け入れ基準に基づき、テストアプローチを選定し、テスト構造・モック戦略・依存関係を設計する。
Vitest + testing-library を推奨アプローチとして採用し、テスト実行可能な設計を確定する。
詳細なエラー経路は Phase 1 を正本とし、Phase 2 では再掲せず設計判断に絞る。

## 背景

Phase 1 で要件・受け入れ基準・確認対象は固定済みである。
Phase 2 ではその正本を前提に、Vitest + testing-library をどう組むかだけを決める。

## テストアプローチ比較

| アプローチ    | 手法                     | メリット            | デメリット                           | 推奨 |
| ------------- | ------------------------ | ------------------- | ------------------------------------ | ---- |
| **A（推奨）** | Vitest + testing-library | 高速・CI で実行可能 | IPC モックが必要                     | ✅   |
| B             | Playwright E2E テスト    | 実 Electron で検証  | 環境セットアップが複雑・時間がかかる | △    |
| C             | 手動テスト               | セットアップ不要    | 証跡が残りにくい・再現性が低い       | △    |

**選定理由**: アプローチ A（Vitest + testing-library）は CI 環境での自動実行が可能で、
`window.skillCreatorAPI.onWorkflowStateChanged` をモックすることで IPC 依存を排除でき、
安定した E2E 証跡を残せる。

## テスト設計

### モック戦略

```typescript
// window.skillCreatorAPI モックの設計
const mockSkillCreatorAPI = {
  onWorkflowStateChanged: vi.fn(),
  // ...他の API
};

// Preload Bridge モック
Object.defineProperty(window, "skillCreatorAPI", {
  value: mockSkillCreatorAPI,
  writable: true,
});
```

**注意**: `vi.stubGlobal("window", ...)` は使用禁止（[FB-VSCPKR-02]）。
`Object.defineProperty` を使用すること。

### テストケース設計

| テストID | シナリオ                                      | 検証内容                                                       |
| -------- | --------------------------------------------- | -------------------------------------------------------------- |
| UT-01    | onWorkflowStateChanged で errorMessage を受信 | `data-testid="skill-lifecycle-error"` にメッセージが表示される |
| UT-02    | skillExecutionStatus が "error" に変化        | skillError が sessionEntries の detail に表示される            |
| UT-03    | getWorkflowState が failure snapshot を返す   | failure 状態が UI に反映される                                 |
| UT-04    | localError が設定された場合の優先順位         | workflowError より localError が優先表示される                 |
| UT-05    | errorMessage が undefined の場合              | data-testid="skill-lifecycle-error" が表示されない             |

### コンポーネント構造と依存関係

```
SkillLifecyclePanel.tsx
├── useWorkflowError (store hook)
├── useSetWorkflowError (store hook)
├── onWorkflowStateChanged callback
│   └── setWorkflowError(errorMessage)
└── currentSurfaceError = localError ?? workflowError ?? skillError
    └── {currentSurfaceError && <div role="alert" data-testid="skill-lifecycle-error">}
```

### SubAgentチーム編成

| Lane   | 関心ごと    | 主担当                                    |
| ------ | ----------- | ----------------------------------------- |
| Lane-A | Mock/Bridge | window.skillCreatorAPI モック戦略         |
| Lane-B | Test design | テストファイル構成・describe ブロック設計 |
| Lane-C | Integration | workflowError ストアと gate 判定の整合    |

> 3 lane 上限に合わせ、統合設計は Lane-C に寄せる。

## 参照資料

| 参照資料     | パス                                                    | 説明           |
| ------------ | ------------------------------------------------------- | -------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md`            | Phase 1 成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                | Phase 1 成果物 |
| 仕様抽出結果 | `outputs/phase-1/aiworkflow-requirements-extraction.md` | Phase 1 成果物 |
| 調査メモ     | `outputs/phase-1/investigation-memo.md`                 | Phase 1 成果物 |

## 実行手順

1. Phase 1 の受け入れ基準（TC-01〜TC-04）を確認する
2. `SkillLifecyclePanel.tsx` のテスト対象箇所を特定する
3. モック戦略を決定する（`Object.defineProperty` で `window.skillCreatorAPI` を制御）
4. 既存テストファイルの有無を確認し、新規作成 or 追加の判断をする
5. Lane-A/B/C を並列で進め、Lane-C で統合する
6. テスト設計書を `outputs/phase-2/` に出力する

## 成果物

| 成果物             | パス                                               | 説明                           |
| ------------------ | -------------------------------------------------- | ------------------------------ |
| テスト設計書       | `outputs/phase-2/test-design.md`                   | テスト構造・UT-01〜UT-05の詳細 |
| アプローチ選定結果 | `outputs/phase-2/approach-selection.md`            | A/B/C 比較と選定理由           |
| テスト戦略         | `outputs/phase-2/test-strategy.md`                 | モック戦略・実行方針           |
| 依存整合マトリクス | `outputs/phase-2/dependency-consistency-matrix.md` | 依存関係表                     |

## 完了条件

- [ ] テストアプローチが選定・理由が記録されている
- [ ] UT-01〜UT-05 のテスト設計が完了している
- [ ] モック戦略が決定されている（`Object.defineProperty` 使用）
- [ ] 既存テストファイルの有無が確認されている
- [ ] 実行タスクで定義した成果物を全件作成
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-UT-RT-01-RENDERER-ERROR-UI-CHECK-001
```

## 次のPhase

Phase 3: 設計レビューゲート
