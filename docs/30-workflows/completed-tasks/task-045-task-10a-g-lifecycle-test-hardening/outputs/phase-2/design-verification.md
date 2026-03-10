# Phase 2: 設計検証結果

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| Phase    | 2          |
| タスクID | TASK-10A-G |
| 作成日   | 2026-03-10 |
| 状態     | completed  |

## 1. テストアーキテクチャ設計の検証

### 1.1 G1/G2/G3 責務分離の検証

| SubAgent | 責務                         | テスト対象レイヤー | 実装実体との一致 |
| -------- | ---------------------------- | ------------------ | ---------------- |
| G1       | Main IPC `skill:create` 契約 | Main Process       | 一致             |
| G2       | Store 駆動ライフサイクル     | Renderer (Store)   | 一致             |
| G3       | ChatPanel 結線               | Renderer (UI)      | 一致             |

#### G1: Main IPC 層

- **テスト対象**: `skillHandlers.ts` L684-732 の `skill:create` ハンドラ
- **責務境界**: `ipcMain.handle` のコールバック関数内のバリデーション、委譲、エラーハンドリング
- **実装実体との一致**: ハンドラは `description: unknown, options: unknown` を受け取り、`validateIpcSender` → P42バリデーション → `skillService.createSkillFromWizard` 委譲の3段階で構成。テスト仕様書の14テストケースがこの3段階を網羅的にカバー

#### G2: Store 層

- **テスト対象**: `agentSlice.ts` の `createSkill` / `analyzeSkill` / `applySkillImprovements` action
- **責務境界**: Store action の状態遷移（isAnalyzing, isImproving, currentAnalysis, skillError）と IPC 呼び出し
- **実装実体との一致**: 各 action が P42 バリデーション → 状態設定 → IPC 呼び出し → 結果反映の流れで構成。12テストケースが状態遷移を検証
- **注意**: G2-IMP-02「改善成功後に currentAnalysis がクリアされる」は実装と不一致。実装では改善後に `analyze()` を再呼び出しして `currentAnalysis` を**新しい値で更新**する（L898）。テストケースは「改善成功後に currentAnalysis が再分析結果で更新される」に修正すべき

#### G3: ChatPanel UI 層

- **テスト対象**: `ChatPanel.tsx` の toggle ボタンと SkillManagementPanel 排他表示
- **責務境界**: UI レンダリングとイベントハンドリング。skill:create の内部契約は G1/G2 に委譲
- **実装実体との一致**: 既存テスト15件が基本導線をカバー。G3-UI-04 と G3-ISO-01 の明示的追加で完成

### 1.2 テスト間の依存関係

```
G1 (IPC 契約) ←独立→ G2 (Store 状態遷移)
                          ↓
                    G3 (ChatPanel 結線) ← G2 の Store mock に依存
```

- G1 と G2 は完全に独立（異なるプロセス層をテスト）
- G3 は Store のモックに依存するが、G2 の内部実装には依存しない
- 障害切り分け: G1 のみ失敗→IPC層問題、G2のみ失敗→Store層問題、G3のみ失敗→結合点問題

## 2. モック構成の妥当性確認

### 2.1 G1 モック構成

| モック対象             | モック方法                   | 妥当性 |
| ---------------------- | ---------------------------- | ------ |
| `electron` (ipcMain)   | `vi.mock("electron")`        | 適切   |
| `SkillService`         | メソッド単位の `vi.fn()`     | 適切   |
| `BrowserWindow`        | `{ id, webContents, ... }`   | 適切   |
| `validateIpcSender`    | `vi.mock` でデフォルト valid | 適切   |
| `toIPCValidationError` | `vi.mock` でエラー構造返却   | 適切   |

**既存テスト（skillHandlers.validation.test.ts）のモック構成との整合性**: G1 は同等のモック構成を採用可能。`ipcMain.handle` の handler map パターンで登録されたハンドラを直接呼び出す方式が実証済み。

### 2.2 G2 モック構成

| モック対象                 | モック方法                       | 妥当性    |
| -------------------------- | -------------------------------- | --------- |
| `window.electronAPI.skill` | グローバルモック                 | 適切      |
| Store 初期状態             | `useAppStore.getState().reset()` | 適切 (P9) |

**注意点**:

- `window.electronAPI.skill.create` のモックは `{ description, options }` オブジェクトを受け取る形式
- `window.electronAPI.skill.analyze` / `applyImprovements` も同様にモック
- P9 対策: `beforeEach` で `useAppStore.setState(initialAgentState)` を呼び出してリセット

### 2.3 G3 モック構成

| モック対象             | モック方法                         | 妥当性 |
| ---------------------- | ---------------------------------- | ------ |
| `useAppStore`          | セレクタ関数をモック               | 適切   |
| `useIsSkillExecuting`  | `vi.fn()` で boolean 返却          | 適切   |
| `SkillSelector`        | `<div data-testid="...">` 差し替え | 適切   |
| `SkillManagementPanel` | `<div data-testid="...">` 差し替え | 適切   |
| `PermissionDialog`     | `<div data-testid="...">` 差し替え | 適切   |
| `SkillStreamingView`   | `<div data-testid="...">` 差し替え | 適切   |
| `SkillImportDialog`    | `null` 返却                        | 適切   |

**既存テストとの整合性**: `ChatPanel.skill-management.test.tsx` の既存モック構成と完全一致。G3 追加テストは既存モック構成をそのまま利用可能。

## 3. テストケース設計の詳細検証

### 3.1 G1 テストケース (14件)

#### バリデーション系 (VAL: 6件)

| ID        | 入力                  | 期待出力                             | 検証済み |
| --------- | --------------------- | ------------------------------------ | -------- |
| G1-VAL-01 | `description = 123`   | throw `{ code: "VALIDATION_ERROR" }` | 実装一致 |
| G1-VAL-02 | `description = ""`    | throw `{ code: "VALIDATION_ERROR" }` | 実装一致 |
| G1-VAL-03 | `description = "   "` | throw `{ code: "VALIDATION_ERROR" }` | 実装一致 |
| G1-VAL-04 | `options = null`      | throw `{ code: "VALIDATION_ERROR" }` | 実装一致 |
| G1-VAL-05 | `options = "string"`  | throw `{ code: "VALIDATION_ERROR" }` | 実装一致 |
| G1-VAL-06 | sender 検証失敗       | throw `toIPCValidationError` 結果    | 実装一致 |

#### 委譲系 (DEL: 3件)

| ID        | 検証内容                                       | 検証済み |
| --------- | ---------------------------------------------- | -------- |
| G1-DEL-01 | `createSkillFromWizard` が正しい引数で呼ばれる | 実装一致 |
| G1-DEL-02 | `description` が trim 済みで委譲される         | 実装一致 |
| G1-DEL-03 | service 戻り値を透過して返す                   | 実装一致 |

#### エラー系 (ERR: 3件)

| ID        | 検証内容                                                   | 検証済み |
| --------- | ---------------------------------------------------------- | -------- |
| G1-ERR-01 | service 例外時に `{ code: "CREATE_ERROR" }` を throw       | 実装一致 |
| G1-ERR-02 | service 例外メッセージが sanitizeErrorMessage で処理される | 実装一致 |
| G1-ERR-03 | service が null を返してもそのまま返す                     | 実装一致 |

**テスト仕様書の SEC カテゴリについて**: index.md の `"SEC": 2` は G1-VAL-06 のみで 1件。Phase 4 仕様書では G1-VAL-06 のみがセキュリティ関連。仕様書間の件数不一致があるが、Phase 4 仕様書の12テストケースが正であり、index.md の `14` は Phase 4 テストケース表の項目数12に対して過大。ただし、追加テストケースとして以下の2件を暗黙的に含む可能性がある:

- description が `undefined` の場合（VAL 追加）
- options が `undefined` の場合（VAL 追加）

これらを含めると14件で整合する。Phase 4 実装時にテストケース表を補完する。

### 3.2 G2 テストケース (12件)

| カテゴリ | 件数 | 検証対象                                    | 実装一致 |
| -------- | ---- | ------------------------------------------- | -------- |
| CRT      | 3    | createSkill 連鎖/失敗/契約透過              | 一致     |
| ANL      | 3    | analyzeSkill 状態遷移/成功/前状態消去       | 一致     |
| IMP      | 3    | applySkillImprovements 状態遷移/後処理/失敗 | 要修正\* |
| SEL/SD   | 3    | selector 安定性/テスト間リーク防止          | 一致     |

\*G2-IMP-02 修正: 「改善成功後に currentAnalysis がクリアされる」→「改善成功後に currentAnalysis が再分析結果で更新される」

### 3.3 G3 テストケース (5件)

| ID        | 検証内容                             | 既存テストカバー                                        |
| --------- | ------------------------------------ | ------------------------------------------------------- |
| G3-UI-01  | toggle で panel 表示切替             | TC-CP-02 でカバー済み                                   |
| G3-UI-02  | panel 表示中は message list 非表示   | TC-CP-02 でカバー済み                                   |
| G3-UI-03  | isExecuting=true で toggle 無効化    | TC-CP-03 でカバー済み                                   |
| G3-UI-04  | panel 内に SkillManagementPanel 描画 | TC-CP-02 で暗黙カバー（明示的アサーション追加推奨）     |
| G3-ISO-01 | テスト間で Store/mock が独立         | beforeEach/afterEach でカバー済み（明示的検証追加推奨） |

## 4. Pitfall 対策の設計検証

| Pitfall | 対策設計                                              | 検証方法                             |
| ------- | ----------------------------------------------------- | ------------------------------------ |
| P9      | `beforeEach` で `vi.clearAllMocks()` + Store リセット | G2-SEL-03, G3-ISO-01 で明示検証      |
| P13     | タイマー不使用（該当テストなし）                      | N/A                                  |
| P31     | 個別セレクタ使用（合成 Hook 不使用）                  | G2-SEL-01 で検証                     |
| P39     | `fireEvent` 使用、`userEvent` 不使用                  | G3 全テストで `fireEvent` 使用を確認 |
| P40     | `cd apps/desktop &&` で実行                           | QG-3/4/5 コマンドで確認              |
| P42     | 3段バリデーション（型→空文字→trim空文字）             | G1-VAL-01/02/03 で検証               |
| P48     | 派生セレクタに `useShallow` 適用                      | G2-SEL-02 で selector 安定性を検証   |

## 5. 設計上の懸念事項

### 5.1 G2-IMP-02 のテスト仕様書と実装の不一致

**仕様書**: 「改善成功後に currentAnalysis がクリアされる」
**実装**: L897-899 で改善後に `analyze()` を再呼び出し、`currentAnalysis` を新しい値で更新

**対応**: Phase 4 でテストケースの期待値を実装に合わせて修正する。テスト名を「改善成功後に currentAnalysis が再分析結果で更新される」に変更。

### 5.2 index.md のテストケース数と Phase 4 仕様書の不一致

**index.md**: G1=14件 (VAL:6, DEL:3, ERR:3, SEC:2)
**Phase 4 仕様書**: G1=12件 (VAL:6（うちSEC相当1件）, DEL:3, ERR:3)

**対応**: `description = undefined` と `options = undefined` のテストケースを追加して14件に合わせる。SEC:2 は G1-VAL-06（sender検証）と追加の sender 関連テスト（例: getAllowedWindows コールバック検証）で構成。

### 5.3 sanitizeErrorMessage の非Error入力

`sanitizeErrorMessage` は `error instanceof Error` でない場合にデフォルトメッセージを返す。`skill:create` の catch 節では `throw { code: "CREATE_ERROR", message: sanitizeErrorMessage(error) }` 形式で使用されるため、非Error例外時にも安全にメッセージが生成される。G1-ERR-01/02 で両ケースを検証する。
