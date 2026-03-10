# Phase 1: 要件分析結果

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| Phase    | 1          |
| タスクID | TASK-10A-G |
| 作成日   | 2026-03-10 |
| 状態     | completed  |

## 1. 既存実装の調査結果

### 1.1 Main IPC `skill:create` ハンドラ (G1 対象)

**ファイル**: `apps/desktop/src/main/ipc/skillHandlers.ts` L684-732

#### 実装確認事項

| 項目                    | 実装状態 | 詳細                                                                                                |
| ----------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| チャンネル登録          | 実装済み | `IPC_CHANNELS.SKILL_CREATE` で `ipcMain.handle` 登録                                                |
| 引数形式                | 実装済み | `description: unknown, options: unknown` の2引数形式                                                |
| validateIpcSender       | 実装済み | L692-697 で `validateIpcSender(event, IPC_CHANNELS.SKILL_CREATE, { getAllowedWindows })` を呼び出し |
| P42 3段バリデーション   | 実装済み | L699: `typeof description !== "string" \|\| description.trim() === ""`                              |
| options null チェック   | 実装済み | L705: `typeof options !== "object" \|\| options === null`                                           |
| description trim 委譲   | 実装済み | L720: `description.trim()` で trim 済みの値を `createSkillFromWizard` に渡す                        |
| sanitizeErrorMessage    | 実装済み | L728: catch 内で `sanitizeErrorMessage(error)` を使用                                               |
| エラーコード            | 実装済み | バリデーション失敗: `VALIDATION_ERROR`、サービス例外: `CREATE_ERROR`                                |
| sender 検証失敗         | 実装済み | L696: `throw toIPCValidationError(validation)` で throw 形式                                        |
| unregisterSkillHandlers | 実装済み | L759: `ipcMain.removeHandler(IPC_CHANNELS.SKILL_CREATE)` で解除                                     |

#### サービス委譲先

- `SkillService.createSkillFromWizard(description, options)` (L251-284)
- 戻り値: `Promise<{ path: string }>`
- 内部で `SkillCreatorService.createSkill()` に委譲

### 1.2 Preload API

**ファイル**: `apps/desktop/src/preload/skill-api.ts` L689

```typescript
safeInvoke(IPC_CHANNELS.SKILL_CREATE, params.description, params.options);
```

- `description` と `options` を個別引数で `safeInvoke` に渡す形式
- Store 側の `createSkill` action が `window.electronAPI.skill.create({ description, options })` を呼ぶ

### 1.3 Store action (G2 対象)

**ファイル**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

| アクション               | 行数     | 実装状態 | 詳細                                                                               |
| ------------------------ | -------- | -------- | ---------------------------------------------------------------------------------- |
| `createSkill`            | L931-962 | 実装済み | P42 3段バリデーション、IPC呼び出し、成功後 `fetchSkills()` 連鎖、失敗時 skillError |
| `analyzeSkill`           | L854-873 | 実装済み | P42 3段バリデーション、isAnalyzing 状態遷移、currentAnalysis 設定                  |
| `applySkillImprovements` | L875-906 | 実装済み | P42 3段バリデーション、isImproving 状態遷移、改善後に再分析                        |
| `autoImproveSkill`       | L908-929 | 実装済み | P42 3段バリデーション、isImproving 状態遷移                                        |
| `clearAnalysis`          | L964-966 | 実装済み | `currentAnalysis: null` に設定                                                     |

#### 状態フィールド (TASK-10A-D)

| フィールド      | 型            | 初期値 |
| --------------- | ------------- | ------ |
| currentAnalysis | SkillAnalysis | null   |
| isAnalyzing     | boolean       | false  |
| isImproving     | boolean       | false  |

### 1.4 ChatPanel と SkillManagementPanel の結線 (G3 対象)

**ファイル**: `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`

| 項目                        | 実装状態 | 詳細                                                                        |
| --------------------------- | -------- | --------------------------------------------------------------------------- |
| SkillManagementPanel import | 実装済み | L21: `import { SkillManagementPanel } from "../skill/SkillManagementPanel"` |
| toggle ボタン               | 実装済み | L101-114: `data-testid="skill-management-toggle"`                           |
| 排他表示                    | 実装済み | L119-135: `showSkillManagement ? <SkillManagementPanel /> : <MessageList>`  |
| 実行中ガード                | 実装済み | L109: `disabled={isExecuting}`                                              |
| aria-expanded               | 実装済み | L108: `aria-expanded={showSkillManagement}`                                 |
| aria-label                  | 実装済み | L103-107: 開閉状態に応じた aria-label                                       |

**SkillManagementPanel**: 内部で `SkillCreateWizard` / `SkillAnalysisView` / `SkillEditor` を配置し、`View` 状態 (`"list" | "editor" | "analysis" | "create"`) で切り替え。

### 1.5 既存テストカバレッジ

| テストファイル                          | skill:create カバー | 備考                                         |
| --------------------------------------- | ------------------- | -------------------------------------------- |
| skillHandlers.test.ts                   | なし                | skill:list/import/remove/get-detail のみ     |
| skillHandlers.validation.test.ts        | なし                | 6ハンドラ対象だが skill:create 未含有        |
| skillHandlers.contract.test.ts          | なし                | 14チャンネル対象だが skill:create 未含有     |
| skillCreatorIpc.integration.test.ts     | 部分的              | `createSkill` をモック経由でテスト           |
| skillCreatorHandlers.security.test.ts   | 部分的              | セキュリティ観点のみ                         |
| skillCreatorHandlers.validation.test.ts | 部分的              | バリデーション観点のみ                       |
| ChatPanel.skill-management.test.tsx     | G3相当              | toggle/排他表示/実行中ガードを15テストで検証 |

**結論**: `skill:create` ハンドラ固有の契約テスト（G1）は存在しない。Store 駆動の lifecycle テスト（G2）も未作成。ChatPanel 結線テスト（G3）は既存15テストで基本導線をカバー済みだが、G3-UI-04（SkillManagementPanel 結線確認）と G3-ISO-01（テスト間分離検証）の明示的なテストケースが不足。

## 2. 機能要件 (FR) 検証可能性確認

| FR ID | 要件                                          | 検証可能性 | 検証方法                                                           |
| ----- | --------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| FR-1  | skill:create の description 3段バリデーション | 検証可能   | G1-VAL-01/02/03: 非文字列/空文字/空白のみで VALIDATION_ERROR throw |
| FR-2  | skill:create の options null/非object 拒否    | 検証可能   | G1-VAL-04/05: null/非object で VALIDATION_ERROR throw              |
| FR-3  | validateIpcSender による sender 検証          | 検証可能   | G1-VAL-06: sender 検証失敗時に toIPCValidationError throw          |
| FR-4  | createSkillFromWizard への trim 済み委譲      | 検証可能   | G1-DEL-01/02: mockService 引数検証                                 |
| FR-5  | createSkill 成功後の fetchSkills 連鎖         | 検証可能   | G2-CRT-01: Store action 連鎖検証                                   |
| FR-6  | analyzeSkill/applySkillImprovements 状態遷移  | 検証可能   | G2-ANL-01/02/03, G2-IMP-01/02/03: isAnalyzing/isImproving 遷移     |
| FR-7  | ChatPanel toggle で SkillManagementPanel 切替 | 検証可能   | G3-UI-01/02/03/04: visibility/排他表示/実行中ガード/結線確認       |

## 3. 非機能要件 (NFR) 検証可能性確認

| NFR ID | 要件                                        | 検証可能性 | 検証方法                                                    |
| ------ | ------------------------------------------- | ---------- | ----------------------------------------------------------- |
| NFR-1  | sanitizeErrorMessage によるエラーサニタイズ | 検証可能   | G1-ERR-02: Error インスタンスのメッセージがサニタイズされる |
| NFR-2  | テスト間状態リーク防止 (P9)                 | 検証可能   | G2-SEL-03, G3-ISO-01: beforeEach での Store/mock 初期化検証 |
| NFR-3  | セレクタ安定性 (P31/P48)                    | 検証可能   | G2-SEL-01/02: useCreateSkill / useAnalyzeSkill の参照安定性 |
| NFR-4  | happy-dom 互換性 (P39)                      | 検証可能   | G3 全テスト: fireEvent 使用、userEvent 不使用               |

## 4. 受入基準 (AC) 具体的検証方法

| AC ID | 受入基準                                      | 具体的検証方法                                                                                                   |
| ----- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| AC-1  | G1テスト14件全PASS                            | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.create.test.ts`                         |
| AC-2  | G2テスト12件全PASS                            | `cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` |
| AC-3  | G3テスト全PASS                                | `cd apps/desktop && pnpm vitest run src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  |
| AC-4  | 既存テスト回帰なし                            | `cd apps/desktop && pnpm vitest run` で全テストPASS                                                              |
| AC-5  | TypeScript型チェック通過                      | `pnpm --filter @repo/desktop typecheck` エラーゼロ                                                               |
| AC-6  | ESLint通過                                    | `pnpm --filter @repo/desktop lint` エラーゼロ                                                                    |
| AC-7  | P9/P13/P31/P39/P40/P42/P48 対策がテストに反映 | コードレビューで各 Pitfall 対策の実装を確認                                                                      |
| AC-8  | G1/G2/G3 の責務分離が維持されている           | G1=IPC契約、G2=Store状態遷移、G3=ChatPanel結線の責務が混在していないことを確認                                   |

## 5. テスト仕様書と実装の整合性サマリ

### 整合している点

1. `skill:create` ハンドラの引数形式 `(description: unknown, options: unknown)` はテスト仕様書 G1 の前提と一致
2. P42 準拠 3段バリデーションが実装済みで、G1-VAL-01/02/03 の期待値と一致
3. `sanitizeErrorMessage` の使用箇所が L728 にあり、G1-ERR-02 で検証可能
4. Store action `createSkill` の `fetchSkills()` 連鎖が実装済みで、G2-CRT-01 の期待値と一致
5. ChatPanel の toggle/排他表示/実行中ガードが実装済みで、G3 の期待値と一致

### 注意点

1. **G1-ERR-01**: `sanitizeErrorMessage` は `error instanceof Error` でない場合にデフォルトメッセージ `"スキル処理でエラーが発生しました"` を返す。テストでは `Error` インスタンスと非 `Error` 値の両方を検証する必要がある
2. **G1-DEL-03**: `createSkillFromWizard` の戻り値 `{ path: string }` がそのまま透過返却される。`null` 返却のテストケースも境界値として必要
3. **G2-IMP-02**: テスト仕様書では「改善成功後に currentAnalysis がクリアされる」とあるが、実装では改善後に再分析して `currentAnalysis` が新しい値で**更新**される（クリアではない）。テスト仕様書の表現を実装に合わせて修正が必要
4. **G3 既存テスト**: 15テスト中、G3-UI-04（SkillManagementPanel が描画されること）と G3-ISO-01（テスト間分離）に相当するテストケースは暗黙的にカバーされているが、明示的なアサーションとして追加する価値がある
