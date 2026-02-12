# Phase 11: 手動テスト - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 11                               |
| Phase名    | 手動テスト検証                   |
| 前提Phase  | Phase 10                         |
| 後続Phase  | Phase 12                         |
| ステータス | 未実施                           |
| 作成日     | 2026-02-12                       |
| 機能名     | UT-STORE-HOOKS-TEST-REFACTOR-001 |

---

## 目的

テストコードの移行結果を手動で検証し、テスト品質と一貫性を確認する。

---

## 実行タスク

### タスク1: テスト実行確認

**実行手順**:

```bash
# 全対象テスト実行
pnpm --filter @repo/desktop test -- --run agentSlice.selectors
pnpm --filter @repo/desktop test -- --run authModeSlice.selectors
pnpm --filter @repo/desktop test -- --run llmSlice.selectors

# 全体テスト実行（リグレッション確認）
pnpm --filter @repo/desktop test -- --run
```

**確認項目**:

- [ ] agentSliceテスト: 全テストPASS
- [ ] authModeSliceテスト: 全テストPASS
- [ ] llmSliceテスト: 全テストPASS
- [ ] 全体テスト: リグレッションなし

### タスク2: テストパターンの目視確認

**確認観点**:

1. agentSlice.selectors.test.tsでgetState()が使用されていないこと

   ```bash
   grep -n "getState()" apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts
   ```

   → 結果が0件であること

2. renderHookがimportされていること

   ```bash
   grep -n "renderHook" apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts
   ```

   → importおよびテスト内で使用されていること

3. 3ファイル間のパターン統一
   - describe構造が一致
   - 参照安定性テストのパターンが統一

### タスク3: テスト実行時間の確認

**確認項目**:

- [ ] テスト実行時間が移行前と比較して±20%以内

### タスク4: テスト結果レポート作成

**レポート形式**（phase-11-12-guide.md準拠）:

```markdown
## テストカテゴリ別結果

### 機能テスト（正常系）

| TC-ID  | 機能                      | 期待結果           | 結果 | 備考 |
| ------ | ------------------------- | ------------------ | ---- | ---- |
| TC-001 | agentSlice renderHook移行 | 全48テストPASS     | -    |      |
| TC-002 | 参照安定性テスト          | 全アクションで安定 | -    |      |
| TC-003 | パターン統一              | 3ファイル間一貫性  | -    |      |

### エラーハンドリングテスト（異常系）

| TC-ID  | 状況            | 期待結果       | 結果 | 備考 |
| ------ | --------------- | -------------- | ---- | ---- |
| TC-101 | API呼び出し失敗 | エラー状態更新 | -    |      |
```

---

## 参照資料

| 参照資料     | パス                                      | 内容             |
| ------------ | ----------------------------------------- | ---------------- |
| Phase 10結果 | `outputs/phase-10/final-review-result.md` | 最終レビュー結果 |

---

## 統合テスト連携

- テスト実行と結果の手動確認

---

## 成果物

| 成果物         | パス                                     | 説明                   |
| -------------- | ---------------------------------------- | ---------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動テスト結果レポート |

---

## 完了条件

- [ ] 全対象テストがPASS
- [ ] 全体テストにリグレッションなし
- [ ] getState()パターンが完全に除去されている（agentSlice）
- [ ] renderHookパターンが使用されている
- [ ] テスト実行時間が許容範囲内
- [ ] テスト結果レポートがoutputs/phase-11/に出力されている
- [ ] 発見課題（ある場合）がoutputs/phase-11/discovered-issues.mdに出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

完了後、以下のファイルを実行してください:
`docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001/phase-12-documentation.md`
