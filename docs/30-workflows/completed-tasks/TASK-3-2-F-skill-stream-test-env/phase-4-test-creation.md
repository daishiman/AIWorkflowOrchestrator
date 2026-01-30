# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 4                                |
| Phase名    | テスト作成                       |
| カテゴリ   | TDD-Red                          |
| 前提Phase  | Phase 3                          |
| 後続Phase  | Phase 5                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-30                       |
| 機能名     | TASK-3-2-F-skill-stream-test-env |
| タスクID   | TASK-3-2-F                       |
| Issue      | #559                             |

---

## 目的

テスト環境改善を検証するためのテストを作成する。TDD-Redフェーズとして、環境切り替え後にPASSすべきテストが現時点で失敗することを確認する。

## 背景

本タスクは既存テストの`describe.skip`解消が主目的であるため、新規テストの追加は最小限とし、主に既存スキップテストの有効化を検証するためのテストを作成する。環境変更の妥当性を検証するための環境チェックテストも作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テスト環境検証テストの作成

**目的**: テスト環境（jsdomまたは改善されたhappy-dom）が必要なAPIを提供していることを検証するテストを作成する。

**実行手順**:

1. `apps/desktop/src/renderer/components/AgentView/__tests__/`に環境検証テストファイルを作成する
   - ファイル名: `SkillStreamDisplay.env-check.test.tsx`
2. 以下のテストケースを記述する

```typescript
// テスト環境検証テスト（環境変更前は失敗することを確認）
describe("SkillStreamDisplay - Test Environment Verification", () => {
  test("navigator.clipboard.writeText が利用可能", () => {
    expect(navigator.clipboard).toBeDefined();
    expect(typeof navigator.clipboard.writeText).toBe("function");
  });

  test("navigator.clipboard.writeText がPromiseを返す", async () => {
    const result = navigator.clipboard.writeText("test");
    expect(result).toBeInstanceOf(Promise);
    await expect(result).resolves.toBeUndefined();
  });

  test("act() 警告なしでの非同期状態更新", async () => {
    // React concurrent modeでの非同期レンダリングが正常に動作することを確認
    // 具体的なテスト内容はPhase 2の設計に基づく
  });
});
```

3. テストを実行し、現在の環境（happy-dom）で失敗することを確認する

```bash
pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.env-check.test.tsx
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.env-check.test.tsx`（環境検証テスト）

---

### タスク2: スキップテストの有効化準備

**目的**: 現在`describe.skip`で無効化されているテストを、環境改善後に有効化する準備をする。

**実行手順**:

1. 以下の5つの`describe.skip`ブロックの内容を確認する

| #   | ファイル                                     | 行番号 | テスト名                                        |
| --- | -------------------------------------------- | ------ | ----------------------------------------------- |
| 1   | SkillStreamDisplay.test.tsx                  | L973   | SkillStreamDisplay - Clipboard Copy (R3)        |
| 2   | SkillStreamDisplay.test.tsx                  | L1426  | SkillStreamDisplay - Clipboard Copy Edge Cases  |
| 3   | SkillStreamDisplay.test.tsx                  | L1610  | SkillStreamDisplay - Integration Scenarios      |
| 4   | SkillStreamDisplay.i18n.test.tsx             | L248   | SkillStreamDisplay - CopyButton feedback        |
| 5   | SkillStreamDisplay.i18n.integration.test.tsx | L64    | SkillStreamDisplay - i18n Integration (Phase 6) |

2. 各ブロック内のテストケース数を記録する
3. 各テストが依存するAPI/機能を整理する

| テストブロック             | テスト件数 | 依存API                       |
| -------------------------- | ---------- | ----------------------------- |
| Clipboard Copy (R3)        | 件数を記載 | navigator.clipboard.writeText |
| Clipboard Copy Edge Cases  | 件数を記載 | navigator.clipboard.writeText |
| Integration Scenarios      | 件数を記載 | concurrent mode, clipboard    |
| CopyButton feedback        | 件数を記載 | navigator.clipboard.writeText |
| i18n Integration (Phase 6) | 件数を記載 | concurrent mode               |

4. テストが`describe.skip` → `describe`に変更された場合に、現環境で失敗することを確認する（1つのブロックで代表確認）

**期待される成果物**:

- `outputs/phase-4/skipped-test-inventory.md`（スキップテスト棚卸し）

---

### タスク3: TDD-Red状態の確認

**目的**: 現在の環境（happy-dom）でスキップテストを有効化すると失敗することを確認する（Red状態の証明）。

**実行手順**:

1. 1つの`describe.skip`ブロックを一時的に`describe`に変更してテストを実行する
   - 対象: `SkillStreamDisplay.i18n.integration.test.tsx` L64（最も明確な失敗が期待される）
2. テスト実行結果（失敗メッセージ）を記録する

```bash
pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx
```

3. 失敗を確認後、`describe.skip`に戻す（元の状態を維持）
4. Red状態の証拠として実行結果を成果物に記録する

**期待される成果物**:

- `outputs/phase-4/tdd-red-evidence.md`（Red状態の証拠記録）

---

## 参照資料

| 参照資料       | パス                                                                                                    | 内容           |
| -------------- | ------------------------------------------------------------------------------------------------------- | -------------- |
| Phase 2成果物  | `outputs/phase-2/approach-selection.md`                                                                 | 選定アプローチ |
| Phase 2成果物  | `outputs/phase-2/clipboard-mock-design.md`                                                              | モック設計     |
| Phase 3成果物  | `outputs/phase-3/design-review-result.md`                                                               | レビュー結果   |
| テストファイル | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`                  | メインテスト   |
| テストファイル | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx`             | i18nテスト     |
| テストファイル | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx` | 統合テスト     |

---

## 統合テスト連携

### このPhaseでの統合テスト観点

- 環境検証テスト（タスク1）は統合テストの基盤となるAPI可用性を確認する
- スキップテスト#5（i18n Integration）は統合テストそのものであり、環境改善後に有効化される

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.env-check.test.tsx
```

**確認項目**:

- [ ] 環境検証テスト（タスク1）が現環境で失敗する（Red状態）
- [ ] スキップテストを有効化すると失敗する（Red状態の証明）

---

## 成果物

| 成果物               | パス                                                                                             | 内容                  | タイプ   |
| -------------------- | ------------------------------------------------------------------------------------------------ | --------------------- | -------- |
| 環境検証テスト       | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.env-check.test.tsx` | 環境APIチェックテスト | code     |
| スキップテスト棚卸し | `outputs/phase-4/skipped-test-inventory.md`                                                      | テスト詳細一覧        | document |
| Red状態証拠          | `outputs/phase-4/tdd-red-evidence.md`                                                            | 失敗テストの記録      | document |

---

## 完了条件

- [ ] 環境検証テスト（`SkillStreamDisplay.env-check.test.tsx`）が作成されている
- [ ] 環境検証テストが現環境（happy-dom）で失敗することが確認されている（Red状態）
- [ ] 5つの`describe.skip`ブロックの棚卸し（テスト件数、依存API）が完了している
- [ ] 1つ以上のスキップテストを有効化して失敗することが確認されている（Red状態の証明）
- [ ] Red状態の証拠（失敗メッセージ）が記録されている
- [ ] 成果物が生成されている（コードファイル1個、ドキュメント2個）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（3タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）がPASSまたはMINOR判定であること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-F-skill-stream-test-env/phase-5-implementation.md`
