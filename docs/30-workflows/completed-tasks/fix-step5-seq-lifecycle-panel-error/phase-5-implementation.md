# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| Phase      | 5                         |
| Phase名    | 実装                      |
| 前提Phase  | Phase 4                   |
| 後続Phase  | Phase 6                   |
| ステータス | 完了                      |
| 作成日     | 2026-04-02                |
| 機能名     | fix-lifecycle-panel-error |

---

## 目的

Phase 4で作成したRedテストをGreenにする実装を行う。`SkillLifecyclePanel.tsx:539` に1行の条件分岐を追加する。

## 背景

修正は `if (snapshot.currentPhase !== 'handoff')` で `setWorkflowError(null)` を囲む1行変更のみ。変更最小性を維持しながら、AC-1〜AC-5を全て充足させる。

---

## 実行タスク

### タスク1: コード実装

**目的**: `setWorkflowError(null)` の無条件呼び出しを条件付き呼び出しに変更する。

**実行手順**:

1. `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` を開く
2. `onWorkflowStateChanged` コールバック内の `setWorkflowError(null)` を特定する（539行目付近）
3. `outputs/phase-2/before-after-comparison.md` を参照し、After設計通りに修正する
4. 変更内容:

```typescript
// Before（修正前）
setWorkflowError(null);

// After（修正後）
if (snapshot.currentPhase !== "handoff") {
  setWorkflowError(null);
}
```

5. 変更行数が最小限（1〜3行程度）であることを確認する

**新規作成・修正ファイル一覧**:

| 種別 | ファイルパス                                                         |
| ---- | -------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` |

**期待される成果物**:

- 修正済み `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`

---

### タスク2: テストGreen確認

**目的**: Phase 4で作成したテストがGreenになることを確認する。

**実行手順**:

1. テストを実行し、Greenになることを確認する
2. 全テストケース（AC-1〜AC-3対応分）がPASSすることを確認する

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel.error-persistence"
```

**期待される成果物**:

- テスト実行結果（Green状態の確認）

---

### タスク3: 既存テストへの影響確認

**目的**: 変更により既存テストが壊れていないことを確認する。

**実行手順**:

1. `SkillLifecyclePanel` 関連の全テストを実行する
2. 全てGreenであることを確認する（AC-4充足）

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel"
```

**期待される成果物**:

- 既存テスト全PASS確認

---

## 参照資料

| 参照資料           | パス                                                                                                  | 内容            |
| ------------------ | ----------------------------------------------------------------------------------------------------- | --------------- |
| 修正対象ファイル   | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                  | 修正対象        |
| Before/After比較   | `outputs/phase-2/before-after-comparison.md`                                                          | 実装設計        |
| エラー永続化テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` | Red→Green確認用 |

---

## 成果物

| 成果物                       | パス                                                                 | 内容            |
| ---------------------------- | -------------------------------------------------------------------- | --------------- |
| SkillLifecyclePanel.tsx 修正 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 1行条件分岐追加 |

---

## TDD検証

### TDD サイクル確認

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel.error-persistence"
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 統合テスト連携

- React 状態管理の `setWorkflowError` 動作との接続実装を確認する
- IPC コールバックの変更が正しく React 状態に反映されることを確認する

---

## 完了条件

- [ ] `SkillLifecyclePanel.tsx` の `onWorkflowStateChanged` が修正されている
- [ ] 変更が `if (snapshot.currentPhase !== 'handoff')` の条件追加のみ（最小変更）
- [ ] Phase 4のテストが全てGreen（AC-1〜AC-3充足）
- [ ] 既存の `SkillLifecyclePanel` 関連テストが全てGreen（AC-4充足）
- [ ] TypeScript型エラーなし、ESLintエラーなし（AC-5充足）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜3）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 修正ファイルの変更内容を記録済み

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了し、Redテストが存在すること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/fix-step5-seq-lifecycle-panel-error/phase-6-test-expansion.md`
