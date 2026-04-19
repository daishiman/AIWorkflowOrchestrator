# Phase 4: 失敗分析

## TC-03: skill generation completes without auth:login timeout

**失敗行数**: テスト実行時 → `clickPrepareButton()` 内
**分類**: B（コンポーネントAPI変更）
**エラー内容**:

```
Unable to find an element by: [data-testid="skill-lifecycle-prepare-button"]
```

**原因**: UIリファクタリングにより `skill-lifecycle-prepare-button` testid が削除済み。
また `isOpen={true}` / `defaultTab="create"` props はコンポーネントに存在しない（TypeScript的には無視されるが意図しない動作）。
**Phase 5 での処置方針**: 削除（ブロック全体）

---

## TC-05: skill generation does not call auth:login when user is unauthenticated

**失敗行数**: `clickPrepareButton()` 内
**分類**: B（コンポーネントAPI変更）
**エラー内容**:

```
Unable to find an element by: [data-testid="skill-lifecycle-prepare-button"]
```

**原因**: TC-03 と同一。
**Phase 5 での処置方針**: 削除（ブロック全体）

---

## TC-06: rapid skill generation clicks do not trigger multiple auth:login

**失敗行数**: `screen.getByTestId("skill-lifecycle-prepare-button")` 呼び出し
**分類**: B（コンポーネントAPI変更）
**エラー内容**:

```
Unable to find an element by: [data-testid="skill-lifecycle-prepare-button"]
```

**原因**: TC-03 と同一。
**Phase 5 での処置方針**: 削除（ブロック全体）

---

## TC-07: auth:login is not triggered on component re-render during skill flow

**失敗行数**: `clickPrepareButton()` 内
**分類**: B（コンポーネントAPI変更）
**エラー内容**:

```
Unable to find an element by: [data-testid="skill-lifecycle-prepare-button"]
```

**原因**: TC-03 と同一。
**Phase 5 での処置方針**: 削除（ブロック全体）

---

## TC-08: authModeSlice state changes do not trigger unexpected auth:login

**分類**: なし（PASS）
**エラー内容**: なし
**原因**: `resetAuthModeListenerFlag` は正常にexportされており、テストロジック自体は有効。`describe.skip` 自体が誤りだった。
**Phase 5 での処置方針**: `describe` のまま維持（既にskip解除済み）
