# Phase 5: 実装 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                    |
| --------- | ----------------------- |
| タスクID  | TASK-10A-G              |
| Phase     | 5                       |
| 名称      | 実装（TDD Green Phase） |
| 依存Phase | Phase 4（テスト作成）   |
| 次Phase   | Phase 6（テスト拡充）   |

---

## 目的

Phase 4 で作成した全28テストケースを Green（成功）にする。本タスクはテスト強化が主目的であり、テスト対象の実装コード（`skillHandlers.ts` 等）は TASK-10A-E / TASK-10A-F で実装済みである。Phase 5 ではテストコードの修正・調整を行い、実際のAPI仕様との整合を図る。

---

## 重要な前提

本タスクでは**プロダクションコードの新規実装は行わない**。以下の作業に限定する:

1. テストコードのモック設定を実際のAPI仕様に合わせて微調整する
2. テストのアサーションを実際の戻り値に合わせて修正する
3. 既存テスト（ChatPanel.skill-management.test.tsx）との整合を調整する
4. 全テストが Green（成功）であることを確認する

プロダクションコードに変更が必要な場合は、変更箇所と理由を記録し Phase 6 以降で対応する。

---

## 実行タスク

- Task 1: 実装契約とテストモックの差分を棚卸しする
- Task 2: Layer 1/2/3 の失敗原因をテストコード側で是正する
- Task 3: 品質ゲート5ステップを通して Green を確認する

### Task 1: 実装コードの現状確認

#### Step 1-1: テスト対象コードの確認

以下のファイルを確認し、テストコードとの整合性を検証する:

```bash
# skill:create ハンドラーの実装確認
cat apps/desktop/src/main/ipc/skillHandlers.ts

# sanitizeErrorMessage の実装確認
grep -rn "sanitizeErrorMessage" apps/desktop/src/main/

# validateIpcSender の実装確認
grep -rn "validateIpcSender" apps/desktop/src/main/infrastructure/security/

# SkillCreateWizard の実装確認
find apps/desktop/src/renderer/components/skill -name "*.tsx" | head -20
```

#### Step 1-2: IPC契約の実態確認

`skillHandlers.ts` の `skill:create` ハンドラーについて以下を確認する:

| 確認項目             | 確認対象                                              |
| -------------------- | ----------------------------------------------------- |
| 引数形式             | 2引数（`description: unknown`, `options: unknown`）か |
| バリデーション順序   | sender -> description -> options の順か               |
| 正常系の戻り値       | `createSkillFromWizard` の戻り値の形状                |
| エラー系の戻り値     | エラーコードとメッセージの形式                        |
| sanitize対象パターン | ファイルパス / トークン / スタックトレースの正規表現  |

### Task 2: Layer 1 テストの調整

#### Step 2-1: モック設定の微調整

Phase 4 で作成したモックと実際のインポート構造を照合し、不一致を修正する:

1. `vi.mock` のモジュールパスが実際のインポートパスと一致することを確認する
2. モックの戻り値の形状が実際の関数シグネチャと一致することを確認する
3. `validateIpcSender` の引数と戻り値の型が実装と一致することを確認する

#### Step 2-2: アサーションの調整

1. `VALIDATION_ERROR` コードの正確な値を実装から取得し、テストのアサーションに反映する
2. `CREATE_ERROR` コードの正確な値を実装から取得し、テストのアサーションに反映する
3. `sanitizeErrorMessage` の正規表現パターンを実装から取得し、テストデータを調整する
4. 正常系の戻り値の形状を実装から確認し、アサーションを修正する

#### Step 2-3: Layer 1 テスト実行と修正

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts
```

- 失敗するテストケースを1つずつ修正する
- 修正はテストコード側のみで行い、プロダクションコードは変更しない
- 修正ごとに再実行して Green を確認する

### Task 3: Layer 2 テストの調整

#### Step 3-1: コンポーネント構造の確認

1. `SkillCreateWizard` コンポーネントの Props / State を確認する
2. `SkillAnalysisView` コンポーネントの Props を確認する
3. ChatPanel からの遷移トリガー（ボタン / メニュー）を確認する
4. Store セレクタの名前と戻り値を確認する

#### Step 3-2: 統合ハーネスの応答形状調整

Layer 2 は component direct IPC を期待値にしない。`window.electronAPI.skill` は store action の下位依存としてのみ差し替え、統合ハーネスのデフォルト state / action / API 応答を実装へ合わせる。

| メソッド               | 確認ポイント                                                   |
| ---------------------- | -------------------------------------------------------------- |
| `create`               | store `createSkill` 下位で使う戻り値の形状                     |
| `analyze`              | store `analyzeSkill` 下位で使う戻り値の形状                    |
| `improve`              | store `applySkillImprovements` / `autoImproveSkill` 下位の形状 |
| `list` / `getImported` | 一覧同期に必要なスキルメタデータ形状                           |

#### Step 3-3: Layer 2 テスト実行と修正

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
```

- コンポーネントのレンダリングが正しく行われ、store action/state transition が期待どおり動くことを確認する
- `fireEvent` のターゲット要素が正しいことを確認する（P39準拠）
- 非同期処理は `await act(async () => { ... })` で包む

### Task 4: Layer 3 テストの調整

#### Step 4-1: 既存テストとの整合確認

1. `ChatPanel.skill-management.test.tsx` の既存テストを全件実行し、PASS を確認する
2. 追加したテストケース（TC-G03-001〜004）が既存テストに影響しないことを確認する

#### Step 4-2: Layer 3 テスト実行と修正

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

- 既存テストが全件 PASS であることを確認する
- 追加テストケースのモック設定を既存パターンに合わせる
- 既存のモック構成を一切変更しない

### Task 5: 全テスト Green 確認

#### Step 5-1: 品質ゲート実行

```bash
# Step 1: 共有パッケージビルド
pnpm --filter @repo/shared build

# Step 2: 型チェック
pnpm --filter @repo/desktop typecheck

# Step 3: Layer 1 テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts

# Step 4: Layer 2 テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

# Step 5: Layer 3 テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

#### Step 5-2: Green Phase 結果記録

テスト実行結果を `outputs/phase-5/test-green-result.md` に記録する。以下の情報を含める:

- 各テストファイルの実行結果（成功件数 / 総件数）
- Phase 4 からの変更点（モック修正、アサーション調整の一覧）
- プロダクションコードの変更が必要と判断された箇所（ある場合）
- テスト実行時間

---

## 参照資料

| 参照資料        | パス                                                                                             | 使用セクション                |
| --------------- | ------------------------------------------------------------------------------------------------ | ----------------------------- |
| Phase 4 成果物  | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-4-test-creation.md` | テストコード構成              |
| Phase 2 設計書  | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`        | モック戦略・テストデータ      |
| IPC API仕様     | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                             | skill:create 契約             |
| テストパターン  | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                | モック構成・パターン3,9       |
| 状態管理仕様    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                     | store action 契約             |
| UI機能仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                  | direct IPC 排除前提           |
| エラー仕様      | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                            | エラーコード・サニタイズ      |
| IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                     | Sender検証・P42バリデーション |

---

## 統合テスト連携

### 修正時の注意事項

| 注意事項                     | 詳細                                                                    |
| ---------------------------- | ----------------------------------------------------------------------- |
| プロダクションコード変更禁止 | テストコードの修正のみ。実装変更が必要な場合は記録して Phase 6 へ       |
| 既存モック変更禁止           | Layer 3 の既存モック構成は変更しない                                    |
| direct IPC 再導入禁止        | Layer 2 は component から `window.electronAPI.skill.*` を直接期待しない |
| 修正の粒度                   | テストケース単位で修正 -> 実行 -> 確認を繰り返す                        |
| 非同期処理の包括             | `fireEvent` + 非同期ハンドラは `await act(async () => { ... })` で包む  |

---

## 成果物

| 成果物                                          | パス                                                                                       | 種別 |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| skillHandlers.create.test.ts（修正済み）        | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | 修正 |
| SkillLifecycle.integration.test.tsx（修正済み） | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | 修正 |
| ChatPanel.skill-management.test.tsx（修正済み） | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | 修正 |
| Green Phase結果レポート                         | `outputs/phase-5/test-green-result.md`                                                     | 新規 |

---

## 完了条件

- [ ] Layer 1: skillHandlers.create.test.ts の14テストケースが全件 PASS
- [ ] Layer 2: SkillLifecycle.integration.test.tsx の10テストケースが全件 PASS
- [ ] Layer 3: ChatPanel.skill-management.test.tsx の既存テスト + 追加4テストが全件 PASS
- [ ] `pnpm --filter @repo/desktop typecheck` が成功する
- [ ] 全テスト合計28件が Green である
- [ ] プロダクションコードの変更を行っていない（変更が必要な場合は記録のみ）
- [ ] Phase 4 からの変更点が Green Phase結果レポートに記録されている
- [ ] テスト実行時間が30秒以内である
- [ ] Green Phase結果レポートが `outputs/phase-5/test-green-result.md` に出力されている

---

## 次Phase

Phase 6（テスト拡充）: Phase 5 で不足しているテストケース（境界値、非同期エラー、テスト間独立性）を追加する。
