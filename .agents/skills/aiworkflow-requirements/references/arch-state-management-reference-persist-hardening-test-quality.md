# 状態管理パターン（Desktop Renderer） / reference bundle

> 親仕様書: [arch-state-management.md](arch-state-management.md)
> 役割: reference bundle

## LLM Selection Persist Validation（TASK-FIX-LLM-CONFIG-PERSISTENCE）

### 目的

`selectedProviderId` / `selectedModelId` の永続化値が stale でも、意図しない fallback を起こさず安全に復元する。

### 契約

| 対象 | 契約 |
| --- | --- |
| persist key | `knowledge-studio-store` を正本とする |
| persist version | `2` |
| migrate | v0/v1 からの復元時は `selectedProviderId=null`, `selectedModelId=null` を補う |
| invalid provider | provider/model の両方を `null` にする |
| invalid model | provider は保持し、model のみ `null` にする |
| providers 未取得 | 空配列時は判断保留し、永続化値を消さない |

### Phase 11 harness ルール

- dedicated harness は `phase11-llm-config-persistence.tsx` を正本とし、valid / invalid / legacy / reload の 4 状態を固定する
- capture plan と screenshot evidence は current workflow `outputs/phase-11/` に残す
- build blocker がある場合でも `manual-test-result.md` と `discovered-issues.md` に同じ理由を書く

## Persist Iterable Hardening（TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001）

### 目的

`expandedFolders` / `viewHistory` の永続化破損で `object is not iterable` が発生する経路を遮断する。

### 契約

| 対象 | 入力検証 | フォールバック |
| --- | --- | --- |
| `expandedFolders` hydrate | `Array.isArray(raw)` | `new Set<string>()` |
| `expandedFolders` persist | `instanceof Set` or `Array.isArray` | `[]` |
| `viewHistory` setCurrentView | `Array.isArray(state.viewHistory)` | `[view]` |
| `viewHistory` goBack/canGoBack | `Array.isArray(history)` | return / `false` |

### persist 復旧契約（DD-01〜DD-05）

`customStorage`（`apps/desktop/src/renderer/store/index.ts`）は Zustand `persist` ミドルウェアのカスタムストレージ実装であり、`localStorage` からの復元時に破損データを安全に処理する。

| ID | 対象 | ガード内容 |
| --- | --- | --- |
| DD-01 | `getItem` / `expandedFolders` | `Array.isArray(raw)` → `raw.filter(v => typeof v === "string")` → `new Set(...)`. 非配列は `new Set<string>()` にフォールバック |
| DD-02 | `setItem` / `expandedFolders` | `instanceof Set` → `Array.from()`、`Array.isArray` → `.filter(string)` の二段対応。それ以外は空配列 |
| DD-03 | `useCanGoBack` | `Array.isArray(state.viewHistory)` を前提条件に追加（破損時は `false` 返却） |
| DD-04 | shared App shell mount effect | debug-only `localStorage.clear()` / `window.location.reload()` を禁止。persist 復旧と WebContents 安定性を壊す副作用は feature-flag 付き harness または専用 script へ隔離する |
| DD-05 | Phase 11 persist bug 検証 | bug path の確認は通常ルート metadata（navigation type / debug log absence）で行い、画面証跡は dedicated harness へ分離して false negative を避ける |

#### 設計原則

- persist 復元時は「型検証→フィルタ→安全既定値」の3段を必須化する
- `console.warn` で破損検出をロギング（`process.env.NODE_ENV !== 'test'` でガード不要、persist 問題は全環境で可視化すべき）
- テストでは破損値5パターン以上（`null`, `undefined`, `number`, `object`, `string[]` with non-string elements）を固定
- shared App shell の mount effect に debug cleanup を残さず、検証用副作用は dedicated harness / capture script へ分離する

### 実装ガイドライン

- 永続化復元点では型検証を最優先し、異常値を直接spread/iterateしない。
- フォールバック時は診断可能な warning を出し、アプリ継続を優先する。
- 破損入力テスト（`null`/`undefined`/`number`/`string`/`object`）を標準テストセットに含める。

### 追加した防御契約

| 対象                             | 契約                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| `navigationSlice.setCurrentView` | `viewHistory` は `Array.isArray` で検証し、非配列は `[]` にフォールバックしてから push する |
| `navigationSlice.goBack`         | `viewHistory` が非配列なら `[]` 扱いで早期 return する                                      |
| `navigationSlice.canGoBack`      | `Array.isArray(history) && history.length > 1` のみ true                                    |
| `customStorage.getItem`          | `expandedFolders` は `string[]` のみ `Set<string>` に復元し、それ以外は空 Set               |
| `customStorage.setItem`          | `expandedFolders` が Set/配列以外なら `[]` で永続化                                         |

### 検証証跡

- `apps/desktop/src/renderer/store/slices/navigationSlice.test.ts`: 破損入力の回帰テストを追加
- `docs/30-workflows/07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001/outputs/phase-11/screenshots/`: TC-11-01〜03 の画面証跡

---

## TASK-043D: テスト品質ゲート設計（2026-03-08）

### 概要

agentSlice / navigationSlice / customStorage / Store統合テストの品質ゲートとして、責務境界テスト・P31回帰テスト・persist復旧テストを体系的に追加した。

### agentSlice 責務境界テスト拡張

agentSlice の責務範囲（import lifecycle、アクション組み合わせ、境界値、エッジケース、エラーケース、P31回帰）を網羅するテストファイル群を新規追加。

| テストファイル | 行数 | テスト観点 |
| --- | --- | --- |
| `agentSlice.boundary.test.ts` | 203 | 境界値（配列上限、文字列長、数値境界） |
| `agentSlice.combination.test.ts` | 321 | アクション組み合わせ（状態遷移の順序依存性） |
| `agentSlice.edge-cases.test.ts` | 305 | エッジケース（同時操作、状態矛盾、再入防止） |
| `agentSlice.error-cases.test.ts` | 283 | エラーケース（IPC失敗、タイムアウト、不正入力） |
| `agentSlice.extension.test.ts` | 188 | 拡張テスト（TASK-UI-03追加分: recentExecutions/isAdvancedSettingsOpen） |
| `agentSlice.import-lifecycle.test.ts` | 283 | インポートライフサイクル（isImporting/importingSkillName/skillError の遷移） |
| `agentSlice.p31-regression.test.ts` | 303 | P31回帰テスト（個別セレクタの参照安定性、useEffect無限ループ非発生） |

**実装場所**: `apps/desktop/src/renderer/store/slices/__tests__/`

### navigationSlice のページ状態管理 iterable hardening

`navigationSlice` の `setCurrentView` / `goBack` / `canGoBack` に `Array.isArray(state.viewHistory)` ガードを追加し、persist 復旧時に `viewHistory` が破損（`null`/`undefined`/`number`/`string`/`object`）していても crash しないように強化。

| メソッド | ガード内容 |
| --- | --- |
| `setCurrentView` | `Array.isArray(state.viewHistory)` が偽なら `[view]` にフォールバック |
| `goBack` | `!Array.isArray(history)` なら即座に return（currentView を維持） |
| `canGoBack` | `Array.isArray(history) && history.length > 1` で安全判定 |

テストは `navigationSlice.test.ts` に `iterable hardening` describe ブロック（57行）として追加。5パターンの破損値（`null`/`undefined`/`number`/`string`/`object`）を `it.each` で網羅。

### customStorage 3段ガードパターンのテスト正式化

`apps/desktop/src/renderer/store/__tests__/customStorage.test.ts`（184行）を新規作成し、DD-01〜DD-03 の persist 復旧契約をテストで固定。

| テスト対象 | 検証内容 |
| --- | --- |
| DD-01: `getItem` / `expandedFolders` | 正常配列→Set変換、非string要素フィルタ、非配列（null/undefined/number/object/string）→空Setフォールバック |
| DD-02: `setItem` / `expandedFolders` | Set→Array変換、Array→stringフィルタ、非Set非Array→空配列フォールバック |
| DD-03: `useCanGoBack` | `Array.isArray(state.viewHistory)` ガードによる破損時 `false` 返却 |

### Store統合テストパターン（hook + Store + IPC 分離）

SkillAnalysisView / SkillCreateWizard の Store統合テストを追加し、「hook → Store action → IPC 呼び出し」の3層を分離してテストする戦略を確立。

| テストファイル | 行数 | テスト対象 |
| --- | --- | --- |
| `SkillAnalysisView.store-integration.test.tsx` | 221 | `useSkillAnalysis` hook が Store 個別セレクタ経由で `analyzeSkill`/`autoImproveSkill`/`applySkillImprovements` を呼び出す統合テスト |
| `SkillCreateWizard.store-integration.test.tsx` | 171 | `useCreateSkill` hook が Store action 経由で `createSkill` を呼び出す統合テスト |

**実装場所**: `apps/desktop/src/renderer/components/skill/__tests__/`

**テスト設計原則**:
- hook のテストは `renderHook` で Store 操作のみを検証（UI レンダリング不要）
- IPC モック（`window.electronAPI`）は `beforeEach` で設定し、テスト間で状態を共有しない
- Store の状態変化を `useAppStore.getState()` で直接検証し、セレクタの正確性を確認

### store/index.ts セレクタエクスポート拡張

`apps/desktop/src/renderer/store/index.ts` に63行を追加し、新規個別セレクタのエクスポートを追加。`useCanGoBack` セレクタに `Array.isArray` ガードを適用（DD-03対応）。
