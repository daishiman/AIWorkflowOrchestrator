# Phase 4 成果物: テスト設計マトリクス

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001    |
| Phase      | 4                                                    |
| 成果物種別 | テスト設計マトリクス                                 |
| 作成日     | 2026-03-22                                           |
| 依存成果物 | phase-2/contract-matrix.md, phase-3/gate-decision.md |

---

## 1. Unit Test

### 1.1 toHandoffGuidance() adapter

**対象ファイル**: `packages/shared/src/types/handoff.ts`

| テストID | 入力 (SkillDocsCapabilityResult.capability)                  | 期待出力               | 検証ポイント                                            |
| -------- | ------------------------------------------------------------ | ---------------------- | ------------------------------------------------------- |
| UT-A-1   | `"guidance-only"`                                            | `HandoffGuidance` 返却 | `terminalCommand === "claude docs generate"` であること |
| UT-A-2   | `"guidance-only"` + `guidance: undefined`                    | `HandoffGuidance` 返却 | `contextSummary` が fallback 文字列を使用すること       |
| UT-A-3   | `"guidance-only"` + `guidance: "API key を設定してください"` | `HandoffGuidance` 返却 | `contextSummary` が指定値を使用すること                 |
| UT-A-4   | `"terminal-handoff"` + `reason: "LLM 到達不可"`              | `HandoffGuidance` 返却 | `reason` フィールドが入力値と一致すること               |
| UT-A-5   | `"terminal-handoff"` + `reason: undefined`                   | `HandoffGuidance` 返却 | `reason` が fallback 文字列 `"LLM 到達不可"` であること |
| UT-A-6   | `"integrated-api"`                                           | `null`                 | handoff 不要パスで `null` を返すこと                    |

**不変条件チェック** (全テストに共通):

- `HandoffGuidance` 返却時: `terminalCommand` / `contextSummary` / `reason` の全 3フィールドが非空文字列であること
- `terminalCommand` に API key パターン (`sk-`, `Bearer `) が含まれないこと

---

### 1.2 TerminalHandoffCard コンポーネント

**対象ファイル**: `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx`

| テストID | 操作                            | 期待結果                                                            | 使用ツール |
| -------- | ------------------------------- | ------------------------------------------------------------------- | ---------- |
| UT-B-1   | コンポーネント初期レンダー      | `terminalCommand` が表示されること                                  | fireEvent  |
| UT-B-2   | コンポーネント初期レンダー      | `contextSummary` が表示されること                                   | fireEvent  |
| UT-B-3   | copy ボタンクリック             | `navigator.clipboard.writeText` が `terminalCommand` で呼ばれること | fireEvent  |
| UT-B-4   | dismiss ボタンクリック          | `onDismiss` コールバックが 1 回呼ばれること                         | fireEvent  |
| UT-B-5   | props: `handoffGuidance = null` | コンポーネントが非表示 (null render) であること                     | -          |

> 注意 (P39 準拠): happy-dom 環境では `userEvent.setup()` ではなく `fireEvent` を使用する。
> 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む。

---

### 1.3 assertNoSilentFallback

**対象ファイル**: `apps/desktop/src/main/services/runtime/assertNoSilentFallback.ts` (新規または既存ユーティリティ)

| テストID | 入力                                                         | 期待結果                       |
| -------- | ------------------------------------------------------------ | ------------------------------ |
| UT-C-1   | `capability === "none"` + `uiState === "ready"`              | エラーをスロー（P62 違反検出） |
| UT-C-2   | `capability === "none"` + `uiState === "blocked"`            | エラーをスローしない           |
| UT-C-3   | `capability === "integratedRuntime"` + `uiState === "ready"` | エラーをスローしない           |
| UT-C-4   | `capability === "none"` + `uiState === "unavailable"`        | エラーをスローしない           |

---

## 2. Integration Test

### 2.1 chatEditHandlers handoff path

**対象ファイル**: `apps/desktop/src/main/handlers/chatEditHandlers.ts`

| テストID | シナリオ                                  | 期待結果                                                         |
| -------- | ----------------------------------------- | ---------------------------------------------------------------- |
| IT-A-1   | `SendWithContextResponse.guidance` あり   | IPC レスポンスに `HandoffGuidance` が含まれること                |
| IT-A-2   | `guidance.terminalCommand` が空文字列     | `VALIDATION_ERROR` が返却されること (P42 準拠 3段バリデーション) |
| IT-A-3   | `guidance.terminalCommand` がスペースのみ | `VALIDATION_ERROR` が返却されること (P42: `.trim() === ""`)      |
| IT-A-4   | `guidance` が `null`                      | `{ success: true, data: { guidance: null } }` が返却されること   |

### 2.2 SkillDocsCapabilityResolver guidance-only 変換

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts`

| テストID | resolver.resolve() 戻り値        | 期待結果                                                                     |
| -------- | -------------------------------- | ---------------------------------------------------------------------------- |
| IT-B-1   | `capability: "guidance-only"`    | `toHandoffGuidance()` が呼ばれ `HandoffGuidance` が生成されること            |
| IT-B-2   | `capability: "terminal-handoff"` | `toHandoffGuidance()` が呼ばれ `HandoffGuidance` が生成されること            |
| IT-B-3   | `capability: "integrated-api"`   | `toHandoffGuidance()` が `null` を返し、handoff パスを通らないこと           |
| IT-B-4   | resolver が例外をスロー          | IPC レスポンスに `{ success: false, error: { code: "..." } }` が含まれること |

### 2.3 launcher → terminal dock open/close/reopen

**対象ファイル**: `apps/desktop/src/renderer/components/organisms/TerminalDock/` (または相当コンポーネント)

| テストID | 操作シーケンス                              | 期待結果                                                     |
| -------- | ------------------------------------------- | ------------------------------------------------------------ |
| IT-C-1   | launcher ボタンクリック                     | terminal dock が open 状態になること                         |
| IT-C-2   | terminal dock open → dismiss ボタンクリック | terminal dock が close 状態になること (transcript 保持)      |
| IT-C-3   | close 後に再度 launcher ボタンクリック      | terminal dock が open になり transcript が保持されていること |
| IT-C-4   | terminal dock open 時                       | コマンドが自動送信されないこと (input が空であること)        |

---

## 3. Contract Test

### 3.1 HandoffGuidance DTO 3フィールド不変条件

**目的**: `HandoffGuidance` の全フィールドが型・制約を満たすことを保証する。

| テストID | 検証対象                     | 不変条件                                                       |
| -------- | ---------------------------- | -------------------------------------------------------------- |
| CT-A-1   | `terminalCommand` フィールド | `string` 型、非空文字列、API key パターン非含有                |
| CT-A-2   | `contextSummary` フィールド  | `string` 型、非空文字列                                        |
| CT-A-3   | `reason` フィールド          | `string` 型、非空文字列                                        |
| CT-A-4   | 全フィールドの存在           | 3フィールド全てが存在すること (partial 不可)                   |
| CT-A-5   | IPC シリアライズ後の復元     | `JSON.stringify → JSON.parse` 後も全フィールドが同値であること |

### 3.2 IPC 通過型ルール

**目的**: `TerminalHandoffBundle` が Renderer 側コードに露出しないことを保証する。

| テストID | 検証対象                 | 期待結果                                                                         |
| -------- | ------------------------ | -------------------------------------------------------------------------------- |
| CT-B-1   | IPC ハンドラの返却型     | `HandoffGuidance` 型を返すこと (`TerminalHandoffBundle` 非返却)                  |
| CT-B-2   | Preload の型定義         | `HandoffGuidance` 型のみを expose すること                                       |
| CT-B-3   | packages/shared への配置 | `HandoffGuidance` が `packages/shared/src/types/handoff.ts` に定義されていること |

---

## 4. Manual Test (Phase 11 対象)

| TC-ID    | 画面状態                                        | 操作                     | 期待結果                                                        | 対応 AC    |
| -------- | ----------------------------------------------- | ------------------------ | --------------------------------------------------------------- | ---------- |
| TC-MAN-1 | TerminalHandoffCard 表示状態                    | カード描画確認           | `terminalCommand` / `contextSummary` が表示されること           | AC-1, AC-2 |
| TC-MAN-2 | TerminalHandoffCard 表示中                      | copy ボタンクリック      | クリップボードに `terminalCommand` が書き込まれること           | AC-2       |
| TC-MAN-3 | TerminalHandoffCard 表示中                      | dismiss ボタンクリック   | カードが非表示になり state がクリアされること                   | AC-1       |
| TC-MAN-4 | App Shell Header 表示状態                       | 目視確認                 | 右上に「terminal を開く」ボタンが固定表示されること             | AC-1       |
| TC-MAN-5 | 「terminal を開く」クリック後                   | terminal dock 目視確認   | bottom sheet が開き、input が空でコマンドが自動送信されないこと | AC-4       |
| TC-MAN-6 | terminal dock open → close → 再 open            | 操作後に transcript 確認 | 以前の transcript が保持されていること                          | AC-1       |
| TC-MAN-7 | API key 未設定状態                              | Skill Docs 画面を開く    | GuidanceBlock (handoff variant) と設定導線が表示されること      | AC-3       |
| TC-MAN-8 | capability=none + hasResolutionAction=true 状態 | 実行 CTA クリック        | 設定画面への導線が表示され、retry が primary でないこと         | AC-2       |

---

## 5. テストカバレッジ目標（Phase 4 時点）

| 指標              | 最低基準 | 推奨基準 | 備考                                    |
| ----------------- | -------- | -------- | --------------------------------------- |
| Line Coverage     | 80%      | 90%      | toHandoffGuidance / TerminalHandoffCard |
| Branch Coverage   | 60%      | 70%      | capability 3パス + error パス           |
| Function Coverage | 80%      | 90%      | P41 対策: callback 関数も検証対象       |

---

## 6. MINOR 追跡との対応

| MINOR ID | 対応テスト                            | 備考                                            |
| -------- | ------------------------------------- | ----------------------------------------------- |
| MN-1     | UT-A-1〜6 (toHandoffGuidance adapter) | Phase 5 で実装、Phase 4 でテストを先行作成      |
| MN-2     | IT-C-2, TC-MAN-5                      | Terminal Dock aborted state は Phase 6 で拡充   |
| MN-3     | UT-B-1〜5 + IT-B-1〜4                 | GuidanceBlock vs TerminalHandoffCard 判定を検証 |
