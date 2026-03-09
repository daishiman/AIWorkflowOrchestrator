# Phase 2 設計サマリ - TASK-10A-G

## メタ情報

| 項目     | 内容         |
| -------- | ------------ |
| タスクID | TASK-10A-G   |
| Phase    | 2            |
| 判定日   | 2026-03-09   |
| 判定結果 | 全完了条件OK |

---

## 1. 3層テスト構成サマリ

### アーキテクチャ概要

```
Layer 3: 既存テスト整合（ChatPanel.skill-management.test.tsx 拡張）
  |  モック: Store + コンポーネント（既存パターン維持）
  |
Layer 2: Renderer統合テスト（SkillLifecycle.integration.test.tsx 新規）
  |  real composition + 統合ハーネス（store action + electronAPI応答一括制御）
  |
Layer 1: Main IPC契約テスト（skillHandlers.create.test.ts 新規）
  |  モック: SkillService + ipcMain + BrowserWindow
  |
  v
  実コード: skillHandlers.ts skill:create ハンドラー
```

### テストファイル配置

| ファイル                              | レイヤー | 環境      | 主な検証対象                   |
| ------------------------------------- | -------- | --------- | ------------------------------ |
| `skillHandlers.create.test.ts`        | Layer 1  | Node.js   | IPC契約・バリデーション        |
| `SkillLifecycle.integration.test.tsx` | Layer 2  | happy-dom | UI遷移・store action・状態遷移 |
| `ChatPanel.skill-management.test.tsx` | Layer 3  | happy-dom | 既存導線維持 + 拡張            |

### SubAgent別テスト分担

| SubAgent | テストファイル                          | テストカテゴリ                               |
| -------- | --------------------------------------- | -------------------------------------------- |
| G1       | skillHandlers.create.test.ts            | Sender検証、入力バリデーション、委譲、エラー |
| G2       | SkillLifecycle.integration.test.tsx     | create->list->analyze->improve遷移           |
| G3       | ChatPanel.skill-management.test.tsx修正 | 既存テスト整合 + create->list追加            |

---

## 2. モック戦略サマリ

### Layer 1: Main IPC テストモック

- **ipcMain モック**: `vi.mock("electron")` でモジュール全体をモック。`ipcMain.handle` / `ipcMain.removeHandler` を差し替え
- **SkillService モック**: `createSkillFromWizard` のみモック（本テストスコープに限定）
- **validateIpcSender モック**: `vi.mock("../infrastructure/security/ipc-validator")` で差し替え。`toIPCValidationError` も含む
- **IpcMainInvokeEvent モック**: `createMockEvent(isValid)` ファクトリ関数で生成

### Layer 2: Renderer統合テストハーネス

- **方針**: real composition パターン（コンポーネントは `vi.mock` で潰さない）
- **electronAPI**: store actionの下位依存としてのみ差し替え。直接呼び出しは期待値にしない
- **統合ハーネス**: `SkillLifecycleHarnessOptions` でcreate/analyze/improve結果とエラーを一括制御
- **Store**: `beforeEach` でデフォルト状態を再代入

### Layer 3: 既存テスト整合モック

- **方針**: 既存モック構成を維持。追加テストケースのみ拡張。既存モック変更は禁止

### 教訓の反映

| Pitfall | モック戦略への反映                                         |
| ------- | ---------------------------------------------------------- |
| P9      | `beforeEach` で `vi.clearAllMocks()` + Store状態リセット   |
| P39     | happy-dom環境では `fireEvent` 使用、`userEvent` 禁止       |
| P40     | `apps/desktop/` ディレクトリからテスト実行                 |
| P42     | Layer 1のバリデーションテストで3段バリデーション全段を検証 |
| P48     | Layer 2の派生セレクタテストで `useShallow` 適用前提        |

---

## 3. テストケース一覧

### TC-G01: Main IPC契約テスト（14ケース）

| ID         | カテゴリ       | テスト内容                                      | 関連FR   |
| ---------- | -------------- | ----------------------------------------------- | -------- |
| TC-G01-001 | Sender検証     | 正当なsenderからの呼び出しが成功する            | FR-G01-1 |
| TC-G01-002 | Sender検証     | 不正なsenderからの呼び出しが拒否される          | FR-G01-1 |
| TC-G01-003 | バリデーション | description未指定でVALIDATION_ERRORを返す       | FR-G01-2 |
| TC-G01-004 | バリデーション | description空文字列でVALIDATION_ERRORを返す     | FR-G01-2 |
| TC-G01-005 | バリデーション | descriptionスペースのみでVALIDATION_ERRORを返す | FR-G01-2 |
| TC-G01-006 | バリデーション | description数値型でVALIDATION_ERRORを返す       | FR-G01-2 |
| TC-G01-007 | バリデーション | options未指定(null)でVALIDATION_ERRORを返す     | FR-G01-3 |
| TC-G01-008 | バリデーション | options文字列型でVALIDATION_ERRORを返す         | FR-G01-3 |
| TC-G01-009 | 正常系         | 有効な引数でcreateSkillFromWizardに委譲する     | FR-G01-4 |
| TC-G01-010 | 正常系         | descriptionがtrim()されてサービスに渡される     | FR-G01-4 |
| TC-G01-011 | エラー系       | サービス例外をCREATE_ERRORでラップする          | FR-G01-5 |
| TC-G01-012 | エラー系       | エラーメッセージからファイルパスが除去される    | FR-G01-6 |
| TC-G01-013 | エラー系       | エラーメッセージからトークン情報が除去される    | FR-G01-6 |
| TC-G01-014 | エラー系       | 非Errorオブジェクトでデフォルトメッセージを返す | FR-G01-6 |

### TC-G02: Renderer統合テスト（10ケース）

| ID         | カテゴリ       | テスト内容                                        | 関連FR   |
| ---------- | -------------- | ------------------------------------------------- | -------- |
| TC-G02-001 | ウィザード起動 | スキル作成ボタンからウィザードが開く              | FR-G02-1 |
| TC-G02-002 | ウィザード起動 | ウィザードが初期状態で表示される                  | FR-G02-1 |
| TC-G02-003 | 作成フロー     | description入力後に useCreateSkill が呼ばれる     | FR-G02-2 |
| TC-G02-004 | 作成フロー     | optionsがstore actionに正しく渡る                 | FR-G02-2 |
| TC-G02-005 | リスト更新     | 作成成功後に一覧stateが同期される                 | FR-G02-3 |
| TC-G02-006 | 分析フロー     | スキル選択後にanalyzeSkillが呼ばれる              | FR-G02-4 |
| TC-G02-007 | 改善フロー     | 改善/再分析フローがstore actionで完結する         | FR-G02-4 |
| TC-G02-008 | エラー系       | create action失敗時にエラーメッセージが表示される | FR-G02-5 |
| TC-G02-009 | エラー系       | analyze action失敗後に再試行で回復できる          | FR-G02-5 |
| TC-G02-010 | 排他制御       | isAnalyzing/isImproving中の操作がガードされる     | FR-G02-6 |

### TC-G03: 既存テスト整合（4ケース追加）

| ID         | カテゴリ     | テスト内容                             | 関連FR   |
| ---------- | ------------ | -------------------------------------- | -------- |
| TC-G03-001 | create->list | スキル作成後にリスト表示が更新される   | FR-G03-2 |
| TC-G03-002 | create->list | 作成キャンセル時にリストが変更されない | FR-G03-2 |
| TC-G03-003 | 回帰確認     | 既存テスト全件がPASSする               | FR-G03-1 |
| TC-G03-004 | 回帰確認     | 新規テスト追加後も実行順序非依存       | FR-G03-1 |

---

## 4. テストデータ設計サマリ

### フィクスチャ定数

- `VALID_DESCRIPTION`: 正常系テスト用の説明文字列
- `VALID_OPTIONS`: `{ generateTasks, addAgents, addReferences }` のオブジェクト
- `CREATED_SKILL_PATH`: 作成成功時の返却パス

### バリデーションエラーデータ

| ケース                  | description       | options       | 期待エラーコード |
| ----------------------- | ----------------- | ------------- | ---------------- |
| description未指定       | `undefined`       | VALID_OPTIONS | VALIDATION_ERROR |
| description数値型       | `12345`           | VALID_OPTIONS | VALIDATION_ERROR |
| description空文字列     | `""`              | VALID_OPTIONS | VALIDATION_ERROR |
| descriptionスペースのみ | `"   "`           | VALID_OPTIONS | VALIDATION_ERROR |
| options未指定           | VALID_DESCRIPTION | `null`        | VALIDATION_ERROR |
| options非オブジェクト   | VALID_DESCRIPTION | `"invalid"`   | VALIDATION_ERROR |

### ファクトリ関数

- `createMockEvent(isValid)`: IpcMainInvokeEvent モック生成
- `createMockSkillMetadata(overrides)`: スキルメタデータ生成
- `createMockElectronAPI()`: electronAPI応答モック生成
- `createSkillLifecycleHarness(options)`: Layer 2統合ハーネス生成

---

## 5. 品質ゲート手順サマリ

### 実行順序

```
Step 1: pnpm --filter @repo/shared build
Step 2: pnpm --filter @repo/desktop typecheck
Step 3: cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts
Step 4: cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx
Step 5: cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

### テスト間の独立性保証

| 対策              | 実装方法                                      |
| ----------------- | --------------------------------------------- |
| モックリセット    | `beforeEach(() => { vi.clearAllMocks(); })`   |
| Store状態リセット | `beforeEach` でデフォルト状態を再代入         |
| electronAPI復元   | `afterEach` で `Object.defineProperty` で復元 |
| DOMクリーンアップ | `afterEach(() => { cleanup(); })`             |

---

## 6. 依存トレーサビリティ

| 依存元     | 固定済み観点             | Layer   | 対応テストケース |
| ---------- | ------------------------ | ------- | ---------------- |
| TASK-10A-F | RT-01 作成後一覧同期     | Layer 2 | TC-G02-005       |
| TASK-10A-F | RT-02 改善後再分析       | Layer 2 | TC-G02-007       |
| TASK-10A-F | RT-03 全自動改善後再分析 | Layer 2 | TC-G02-007       |
| TASK-10A-F | RT-04 エラー回復         | Layer 2 | TC-G02-009       |
| TASK-10A-F | RT-05 状態初期化         | Layer 2 | TC-G02-010       |
| TASK-10A-F | RT-06 分析->改善->再分析 | Layer 2 | TC-G02-007       |
| TASK-10A-F | RT-07 並行操作防止       | Layer 2 | TC-G02-010       |
| TASK-10A-E | sender / P42 / error     | Layer 1 | TC-G01-001 - 014 |

---

## Phase 2 完了判定

| 完了条件                                                                    | 判定 |
| --------------------------------------------------------------------------- | ---- |
| 3層テスト構成（Main IPC / Renderer統合 / 既存テスト整合）が設計されている   | OK   |
| 各レイヤーのモック戦略が testing-component-patterns.md 準拠で定義されている | OK   |
| テストデータ（フィクスチャ・バリデーションエラーケース）が設計されている    | OK   |
| テストケース一覧（TC-G01/G02/G03）がFR要件にトレース可能                    | OK   |
| テスト実行順序と独立性保証が明記されている                                  | OK   |
| 品質ゲートの実行手順が定義されている                                        | OK   |
| P9, P31, P39, P40, P42, P48 の教訓がモック戦略に反映されている              | OK   |

**Phase 2 判定: 全完了条件OK - Phase 3 へ進行可能**
