# Phase 4: テスト作成 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容                              |
| --------- | --------------------------------- |
| タスクID  | TASK-10A-G                        |
| Phase     | 4                                 |
| 名称      | テスト作成（TDD Red Phase）       |
| 依存Phase | Phase 3（設計レビューゲート）     |
| 次Phase   | Phase 5（実装 / TDD Green Phase） |

---

## 目的

Phase 2 の設計に基づき、3層テスト構成（Main IPC契約 / Renderer統合 / 既存テスト整合）のテストコードを作成する。この段階では全テストが Red（失敗）であることを確認し、TDD の Red Phase を完了する。

---

## 実行タスク

### Task 1: Layer 1 - Main IPC `skill:create` 契約テスト作成

**成果物**: `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`（新規）

#### Step 1-1: テストファイルの雛形作成

1. `apps/desktop/src/main/ipc/__tests__/` ディレクトリにファイルを作成する
2. Phase 2 セクション2.1 のモック戦略に基づき以下をセットアップする:
   - `vi.mock("electron")` で ipcMain / BrowserWindow をモック
   - `vi.mock("../infrastructure/security/ipc-validator")` で validateIpcSender / toIPCValidationError をモック
   - SkillService のモックオブジェクトを定義
3. `beforeEach` で `vi.clearAllMocks()` を実行（P9準拠）

#### Step 1-2: Sender検証テスト（TC-G01-001, TC-G01-002）

| テストケースID | テスト内容                                               |
| -------------- | -------------------------------------------------------- |
| TC-G01-001     | 正当なsenderからの呼び出しが成功する                     |
| TC-G01-002     | 不正なsenderからの呼び出しがVALIDATION_ERRORで拒否される |

- `createMockEvent(isValid)` ファクトリ関数を使用してイベントを生成する
- `validateIpcSender` の戻り値を制御してsender検証の成否を切り替える

#### Step 1-3: 入力バリデーションテスト（TC-G01-003 〜 TC-G01-008）

| テストケースID | テスト内容                                      | 入力値      |
| -------------- | ----------------------------------------------- | ----------- |
| TC-G01-003     | description未指定でVALIDATION_ERRORを返す       | `undefined` |
| TC-G01-004     | description空文字列でVALIDATION_ERRORを返す     | `""`        |
| TC-G01-005     | descriptionスペースのみでVALIDATION_ERRORを返す | `"   "`     |
| TC-G01-006     | description数値型でVALIDATION_ERRORを返す       | `12345`     |
| TC-G01-007     | options未指定(null)でVALIDATION_ERRORを返す     | `null`      |
| TC-G01-008     | options文字列型でVALIDATION_ERRORを返す         | `"invalid"` |

- P42準拠の3段バリデーション（型チェック -> 空文字列 -> trim空文字列）を検証する
- 各テストで `VALIDATION_ERROR` コードが返されることをアサートする

#### Step 1-4: 正常系テスト（TC-G01-009, TC-G01-010）

| テストケースID | テスト内容                                  |
| -------------- | ------------------------------------------- |
| TC-G01-009     | 有効な引数でcreateSkillFromWizardに委譲する |
| TC-G01-010     | descriptionがtrim()されてサービスに渡される |

- `mockSkillService.createSkillFromWizard` が正しい引数で呼び出されることを検証する
- description の前後空白が除去されていることを確認する

#### Step 1-5: エラー系テスト（TC-G01-011 〜 TC-G01-014）

| テストケースID | テスト内容                                      |
| -------------- | ----------------------------------------------- |
| TC-G01-011     | サービス例外をCREATE_ERRORでラップする          |
| TC-G01-012     | エラーメッセージからファイルパスが除去される    |
| TC-G01-013     | エラーメッセージからトークン情報が除去される    |
| TC-G01-014     | 非Errorオブジェクトでデフォルトメッセージを返す |

- `sanitizeErrorMessage` がファイルパス（`/home/user/...`, `C:\Users\...`）を除去することを検証する
- `token=xxx` パターンが除去されることを検証する

### Task 2: Layer 2 - Renderer統合テスト作成

**成果物**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx`（新規）

#### Step 2-1: テストファイルの雛形作成

1. Phase 2 セクション2.2 の統合ハーネス方針に基づき以下をセットアップする:
   - `createSkillLifecycleHarness()` を定義し、state/action/API 応答を1箇所で制御する
   - `window.electronAPI` は store action の下位依存としてのみ差し替える
   - `ChatPanel` / `SkillManagementPanel` / `SkillCreateWizard` / `SkillAnalysisView` は実体をレンダーする
2. `beforeEach` で `vi.clearAllMocks()` とStore状態リセットを実行する（P9準拠）
3. `afterEach` で `cleanup()` と `electronAPI` 復元を実行する
4. happy-dom環境で `fireEvent` を使用する（P39準拠: `userEvent` 使用禁止）

#### Step 2-2: ウィザード起動テスト（TC-G02-001, TC-G02-002）

| テストケースID | テスト内容                           |
| -------------- | ------------------------------------ |
| TC-G02-001     | スキル作成ボタンからウィザードが開く |
| TC-G02-002     | ウィザードが初期状態で表示される     |

- スキル作成ボタンのクリックで `SkillCreateWizard` コンポーネントが表示されることを確認する
- ウィザードの初期状態（description空、options未選択）を検証する

#### Step 2-3: 作成フローテスト（TC-G02-003 〜 TC-G02-005）

| テストケースID | テスト内容                                      |
| -------------- | ----------------------------------------------- |
| TC-G02-003     | description入力後に `useCreateSkill` が呼ばれる |
| TC-G02-004     | optionsが store action に正しく渡される         |
| TC-G02-005     | 作成成功後に一覧 state が同期される             |

- `SkillCreateWizard.store-integration.test.tsx` と同様に、component direct IPC を期待値にしない
- 作成成功後に Store の `fetchSkills` と一覧 state が同期されることを確認する（RT-01）

#### Step 2-4: 分析・改善フローテスト（TC-G02-006, TC-G02-007）

| テストケースID | テスト内容                                  |
| -------------- | ------------------------------------------- |
| TC-G02-006     | スキル選択後に `analyzeSkill` が呼ばれる    |
| TC-G02-007     | 改善/再分析フローが store action で完結する |

- `SkillAnalysisView.store-integration.test.tsx` の lower-layer 保証を前提に、Layer 2 では state transition と UI 遷移を検証する

#### Step 2-5: エラーハンドリングテスト（TC-G02-008 〜 TC-G02-010）

| テストケースID | テスト内容                                           |
| -------------- | ---------------------------------------------------- |
| TC-G02-008     | create action 失敗時にエラーメッセージが表示される   |
| TC-G02-009     | analyze action 失敗後に再試行で回復できる            |
| TC-G02-010     | `isAnalyzing` / `isImproving` 中の操作がガードされる |

- store action 下位の `electronAPI` 応答が `Promise.reject` を返す場合のUIフォールバックを検証する
- コンポーネントがアンマウントされずエラーメッセージが表示されることを確認する

### Task 3: Layer 3 - 既存テスト整合（ChatPanel.skill-management.test.tsx 拡張）

**成果物**: `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`（修正）

#### Step 3-1: 既存テスト確認

1. 既存テストファイルを読み込み、現在の `describe` / `it` 構成を把握する
2. 既存モック構成を確認し、変更を加えない方針を確認する（回帰リスク回避）

#### Step 3-2: テストケース追加（TC-G03-001 〜 TC-G03-004）

| テストケースID | テスト内容                             |
| -------------- | -------------------------------------- |
| TC-G03-001     | スキル作成後にリスト表示が更新される   |
| TC-G03-002     | 作成キャンセル時にリストが変更されない |
| TC-G03-003     | 既存テスト全件がPASSする               |
| TC-G03-004     | 新規テスト追加後も実行順序非依存       |

- 既存の `describe` ブロック末尾に新しいテストケースを追加する
- 既存テストのモック構成を一切変更しない

### Task 4: Red Phase 確認

#### Step 4-1: テスト実行（全件失敗の確認）

以下のコマンドを順に実行し、テストが Red（失敗）であることを確認する:

```bash
# Step 1: 共有パッケージビルド
pnpm --filter @repo/shared build

# Step 2: 型チェック（テストコードの構文エラーがないこと）
pnpm --filter @repo/desktop typecheck

# Step 3: Layer 1 テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts

# Step 4: Layer 2 テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx

# Step 5: Layer 3 テスト実行
cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

#### Step 4-2: Red Phase 結果記録

テスト実行結果を `outputs/phase-4/test-red-result.md` に記録する。以下の情報を含める:

- 各テストファイルの実行結果（失敗件数 / 総件数）
- 失敗理由の分類（未実装 / モック不足 / 型エラー）
- テストコードの構文エラーがないことの確認結果

---

## 参照資料

| 参照資料                | パス                                                                                             | 使用セクション                         |
| ----------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------- |
| Phase 1 要件定義書      | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-1-requirements.md`  | FR/NFRとの対応確認                     |
| Phase 2 設計書          | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-2-design.md`        | モック戦略・テストデータ               |
| Phase 3 レビュー結果    | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-3-design-review.md` | Gate通過条件の確認                     |
| IPC API仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                             | skill:create 契約                      |
| テストパターン          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                | セクション16,17の harness / Layer 分割 |
| 状態管理仕様            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                     | store action / selector                |
| UI機能仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                  | SkillCreateWizard / SkillAnalysisView  |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                      | カバレッジ基準                         |
| エラー仕様              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                            | エラーコード・サニタイズ               |
| IPCセキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                     | Sender検証・P42バリデーション          |
| TASK-10A-F 引き渡し設計 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`                  | RT-01〜RT-07 の原本                    |

---

## 統合テスト連携

### Layer間の依存関係

```
Layer 1（Main IPC）: 単独実行可能 - 他Layerへの依存なし
Layer 2（Renderer統合）: 統合ハーネスの state/action/API 応答が Layer 1 契約と TASK-10A-F の state 遷移と一致する必要あり
Layer 3（既存テスト整合）: 既存テストとの共存 - 既存モック変更禁止
```

### SubAgent別実行分担

| SubAgent | テストファイル                          | 並列実行    |
| -------- | --------------------------------------- | ----------- |
| G1       | skillHandlers.create.test.ts            | G2と並列    |
| G2       | SkillLifecycle.integration.test.tsx     | G1と並列    |
| G3       | ChatPanel.skill-management.test.tsx修正 | G1/G2完了後 |

---

## 成果物

| 成果物                              | パス                                                                                       | 種別 |
| ----------------------------------- | ------------------------------------------------------------------------------------------ | ---- |
| skillHandlers.create.test.ts        | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | 新規 |
| SkillLifecycle.integration.test.tsx | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | 新規 |
| ChatPanel.skill-management.test.tsx | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | 修正 |
| Red Phase結果レポート               | `outputs/phase-4/test-red-result.md`                                                       | 新規 |

---

## 完了条件

- [ ] Layer 1: skillHandlers.create.test.ts に14テストケース（TC-G01-001〜014）が作成されている
- [ ] Layer 2: SkillLifecycle.integration.test.tsx に10テストケース（TC-G02-001〜010）が作成されている
- [ ] Layer 3: ChatPanel.skill-management.test.tsx に4テストケース（TC-G03-001〜004）が追加されている
- [ ] 合計28テストケースが作成されている
- [ ] `pnpm --filter @repo/desktop typecheck` が成功する（テストコードの構文エラーなし）
- [ ] テスト実行結果が全件 Red（失敗）である
- [ ] 失敗理由が「未実装」であり「構文エラー」ではない
- [ ] `beforeEach` で全モックがリセットされている（P9準拠）
- [ ] happy-dom環境で `fireEvent` を使用している（P39準拠: `userEvent` 未使用）
- [ ] テスト実行が `apps/desktop/` ディレクトリから行われている（P40準拠）
- [ ] Red Phase結果レポートが `outputs/phase-4/test-red-result.md` に出力されている

---

## 次Phase

Phase 5（実装 / TDD Green Phase）: Phase 4 で作成したテストを全てPassさせるため、テストコードの修正・調整を行う。
