# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 6                                |
| Phase名    | テスト拡充                       |
| カテゴリ   | 品質                             |
| 前提Phase  | Phase 5                          |
| 後続Phase  | Phase 7                          |
| ステータス | 未実施                           |
| 作成日     | 2026-01-30                       |
| 機能名     | TASK-3-2-F-skill-stream-test-env |
| タスクID   | TASK-3-2-F                       |
| Issue      | #559                             |

---

## 目的

Phase 5で改善されたテスト環境を活用し、`describe.skip`で無効化されていた5ブロックのテストを有効化する。全テストがPASSする状態を達成する。

## 背景

テスト環境改善（Phase 5）により、Clipboard APIモックとReact concurrent mode互換性が確保された。本Phaseでは、スキップされていたテストを有効化し、必要に応じてテストコードを新環境に適合するよう調整する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Clipboard Copy関連テストの有効化（SkillStreamDisplay.test.tsx）

**目的**: `SkillStreamDisplay.test.tsx`内の3つの`describe.skip`ブロックを有効化する。

**実行手順**:

1. `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`を開く
2. 以下の3箇所の`describe.skip`を`describe`に変更する
   - L973: `describe.skip("SkillStreamDisplay - Clipboard Copy (R3)")` → `describe("SkillStreamDisplay - Clipboard Copy (R3)")`
   - L1426: `describe.skip("SkillStreamDisplay - Clipboard Copy Edge Cases")` → `describe("SkillStreamDisplay - Clipboard Copy Edge Cases")`
   - L1610: `describe.skip("SkillStreamDisplay - Integration Scenarios")` → `describe("SkillStreamDisplay - Integration Scenarios")`
3. 各テストブロックでClipboard APIモック（Phase 5で実装）が正しく使用されているか確認する
4. テストを実行し、結果を確認する
   ```bash
   pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx
   ```
5. 失敗するテストがある場合、新環境に適合するようテストコードを調整する
   - `navigator.clipboard.writeText`のモック参照が正しいか
   - `act()`ラップが適切か
   - 非同期処理の`await`が正しいか

**期待される成果物**:

- `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`（更新済み）

---

### タスク2: i18n CopyButtonテストの有効化（SkillStreamDisplay.i18n.test.tsx）

**目的**: `SkillStreamDisplay.i18n.test.tsx`内の`describe.skip`ブロックを有効化する。

**実行手順**:

1. `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx`を開く
2. L248の`describe.skip`を`describe`に変更する
   - `describe.skip("SkillStreamDisplay - CopyButton feedback")` → `describe("SkillStreamDisplay - CopyButton feedback")`
3. テストを実行し、結果を確認する
   ```bash
   pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx
   ```
4. 失敗するテストがある場合、新環境に適合するようテストコードを調整する
   - i18nコンテキストとClipboard APIモックの組み合わせが正しいか
   - 翻訳キーの参照が正しいか

**期待される成果物**:

- `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx`（更新済み）

---

### タスク3: i18n統合テストの有効化（SkillStreamDisplay.i18n.integration.test.tsx）

**目的**: `SkillStreamDisplay.i18n.integration.test.tsx`内の`describe.skip`ブロックを有効化する。

**実行手順**:

1. `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx`を開く
2. L64の`describe.skip`を`describe`に変更する
   - `describe.skip("SkillStreamDisplay - i18n Integration (Phase 6)")` → `describe("SkillStreamDisplay - i18n Integration (Phase 6)")`
3. テストを実行し、結果を確認する
   ```bash
   pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx
   ```
4. 失敗するテストがある場合、新環境に適合するようテストコードを調整する
   - React concurrent modeの互換性
   - 非同期レンダリングの待機処理
   - `act()`警告の有無を確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx`（更新済み）

---

### タスク4: 全テスト一括実行と act() 警告確認

**目的**: 全SkillStreamDisplayテストを一括実行し、全件PASSかつact()警告がゼロであることを確認する。

**実行手順**:

1. 全SkillStreamDisplayテストを実行する
   ```bash
   pnpm --filter @repo/desktop vitest run src/renderer/components/AgentView/__tests__/SkillStreamDisplay
   ```
2. 実行結果を確認する
   - 全テストがPASSしていること
   - `describe.skip`が残っていないこと
   - `act()`警告がログに出力されていないこと
3. 失敗するテストがある場合、テストコードを修正する
4. `act()`警告が残る場合、以下を確認する
   - `waitFor`の使用箇所が適切か
   - `act`ラップが必要な箇所が漏れていないか
   - 非同期操作のクリーンアップが実施されているか
5. 実行結果を成果物に記録する

**期待される成果物**:

- `outputs/phase-6/test-activation-result.md`（テスト有効化結果レポート）

---

## 参照資料

| 参照資料           | パス                                                                                                    | 内容                 |
| ------------------ | ------------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 5成果物      | `outputs/phase-5/tdd-green-evidence.md`                                                                 | Green状態証拠        |
| Phase 4成果物      | `outputs/phase-4/skipped-test-inventory.md`                                                             | スキップテスト棚卸し |
| テストファイル     | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`                  | メインテスト         |
| テストファイル     | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx`             | i18nテスト           |
| テストファイル     | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx` | 統合テスト           |
| テストセットアップ | `apps/desktop/src/test/setup.ts`                                                                        | モック設定           |

---

## 統合テスト連携

### このPhaseでの統合テスト観点

- i18n統合テスト（タスク3）が環境改善後に正常に動作することを確認する
- Clipboard APIモックを使用した統合シナリオ（コピー → フィードバック表示）が動作することを確認する
- React concurrent modeでの非同期レンダリングが統合テストで問題なく動作することを確認する

---

## 成果物

| 成果物               | パス                                                                                                    | 内容                     | タイプ   |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------ | -------- |
| メインテスト（更新） | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx`                  | describe.skip解消        | code     |
| i18nテスト（更新）   | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.test.tsx`             | describe.skip解消        | code     |
| 統合テスト（更新）   | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.i18n.integration.test.tsx` | describe.skip解消        | code     |
| テスト有効化結果     | `outputs/phase-6/test-activation-result.md`                                                             | 全テスト実行結果レポート | document |

---

## 完了条件

- [ ] `SkillStreamDisplay.test.tsx`の3つの`describe.skip`が`describe`に変更されている
- [ ] `SkillStreamDisplay.i18n.test.tsx`の1つの`describe.skip`が`describe`に変更されている
- [ ] `SkillStreamDisplay.i18n.integration.test.tsx`の1つの`describe.skip`が`describe`に変更されている
- [ ] 全SkillStreamDisplayテストが`pnpm --filter @repo/desktop vitest run`でPASSする
- [ ] `grep -r "describe.skip" apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay*`の結果が0件
- [ ] テスト実行ログに`act()`警告が出力されていない
- [ ] テスト有効化結果レポートが生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（4タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（テストカバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-F-skill-stream-test-env/phase-7-test-coverage.md`
