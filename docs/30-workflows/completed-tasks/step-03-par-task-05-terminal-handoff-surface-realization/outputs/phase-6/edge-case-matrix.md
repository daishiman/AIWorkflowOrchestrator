# Phase 6 成果物: 境界ケースマトリクス

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 6                                                 |
| 成果物種別 | 境界ケースマトリクス                              |
| 作成日     | 2026-03-22                                        |
| 依存成果物 | phase-6/regression-expansion-plan.md              |

---

## 1. HandoffGuidance.terminalCommand が空文字列の場合

**シナリオ**: `buildForSurface()` や `toHandoffGuidance()` が `terminalCommand: ""` を返すケース。P42 準拠の 3段バリデーションで早期リジェクトすること。

| テストID | 入力                                                  | 期待結果                                            | 検証層               |
| -------- | ----------------------------------------------------- | --------------------------------------------------- | -------------------- |
| EC-1-1   | `buildForSurface()`: `suggestedCommand: ""`           | `VALIDATION_ERROR` がスローされること               | Main (builder)       |
| EC-1-2   | `buildForSurface()`: `suggestedCommand: "   "`        | P42: `.trim() === ""` チェックで `VALIDATION_ERROR` | Main (builder)       |
| EC-1-3   | IPC ハンドラ受信: `terminalCommand: ""`               | `VALIDATION_ERROR` が Renderer に返却されること     | Main (handler)       |
| EC-1-4   | IPC ハンドラ受信: `terminalCommand: "   "`            | P42: `.trim() === ""` チェックで `VALIDATION_ERROR` | Main (handler)       |
| EC-1-5   | `TerminalHandoffCard` に `terminalCommand: ""` を渡す | copy ボタンが disabled であること（UX保護）         | Renderer (component) |

**バリデーション実装参照**:

```typescript
// P42 準拠 3段バリデーション
if (
  typeof terminalCommand !== "string" ||
  terminalCommand === "" ||
  terminalCommand.trim() === ""
) {
  throw {
    code: "VALIDATION_ERROR",
    message: "terminalCommand must be a non-empty string",
  };
}
```

---

## 2. contextSummary のローカライズで未知の surface prefix の場合

**シナリオ**: `localizeContextSummary()` が未知の surface prefix（例: `surface=unknown`）を受け取った場合の挙動。エラーをスローせずフォールバック表示すること。

| テストID | 入力 contextSummary                           | 期待結果                                             |
| -------- | --------------------------------------------- | ---------------------------------------------------- |
| EC-2-1   | `"surface=unknown skill=test"`                | フォールバック: 未ローカライズの文字列をそのまま表示 |
| EC-2-2   | `"surface=agent"` (既知prefix)                | 正常ローカライズ                                     |
| EC-2-3   | `""`（空文字列）                              | フォールバック: 空文字列をそのまま表示（エラーなし） |
| EC-2-4   | `null` / `undefined`                          | フォールバック: 空文字列として表示（型安全ガード）   |
| EC-2-5   | XSS 試みパターン (`<script>alert()</script>`) | サニタイズ後に安全な文字列として表示                 |

**実装方針**:

- `localizeContextSummary()` は unknown prefix の場合にエラーをスローしない
- 未知 prefix は `i18n key が存在しない → 元の文字列をフォールバック表示` の方針
- P19 対策: `unknown` 型で受け取り、`typeof` チェック後にローカライズ処理

---

## 3. TerminalHandoffCard が表示中に capability 変更が発生した場合

**シナリオ**: `TerminalHandoffCard` が既に表示されている状態で、background で capability が変更された場合（例: API key が更新されて `integrated-api` に昇格）。

| テストID | 変更前 capability  | 変更後 capability   | 期待結果                                               |
| -------- | ------------------ | ------------------- | ------------------------------------------------------ |
| EC-3-1   | `terminal-handoff` | `integrated-api`    | `TerminalHandoffCard` が非表示になり通常 UI に戻ること |
| EC-3-2   | `terminal-handoff` | `guidance-only`     | `TerminalHandoffCard` → `GuidanceBlock` への切り替え   |
| EC-3-3   | `terminal-handoff` | `none` (resolvable) | blocked UI に切り替わること                            |
| EC-3-4   | `guidance-only`    | `terminal-handoff`  | `GuidanceBlock` → `TerminalHandoffCard` への切り替え   |
| EC-3-5   | capability 変更中  | (transition)        | ちらつきなしにスムーズに切り替わること (200-300ms以内) |

**実装方針**:

- Store の `handoffGuidance` が `null` になれば `TerminalHandoffCard` は自動的に非表示になること (props: `handoffGuidance = null` → null render)
- capability 変更は `resolveCapability` action で Main Process から通知されること (NFR-2a)
- Renderer 側での capability 再評価は行わないこと (ローカル判定禁止)

---

## 4. guidance-only → integrated-api への状態遷移タイミング

**シナリオ**: API key が設定されていない状態（guidance-only）から、ユーザーが API key を設定して `integrated-api` に昇格するタイミングの競合状態。

| テストID | 操作シーケンス                                     | 期待結果                                                            |
| -------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| EC-4-1   | guidance-only 中 → API key 設定 → 即座に reload    | `GuidanceBlock` が消え、`integrated-api` の通常 UI が表示されること |
| EC-4-2   | guidance-only 中 → API key 設定 → IPC 遅延 (500ms) | 遅延中は guidance-only UI が維持されること                          |
| EC-4-3   | guidance-only 中 → API key 設定 → IPC 失敗         | guidance-only UI を維持し、エラートーストを表示すること             |
| EC-4-4   | IPC capability 再解決中 → ローディング状態         | スピナーまたはスケルトン表示でユーザーへのフィードバック            |

**実装方針**:

- `resolveCapability` は surface mount 時 + `auth:changed` IPC イベント時に呼ばれること
- 遷移中の UI は `loading` state (スケルトン) を表示すること（silent fallback 防止）

---

## 5. 二重 handoff: 既に handoff 表示中に新しい handoff が発生した場合

**シナリオ**: `TerminalHandoffCard` が表示中に、新たな handoff 応答が IPC から到達した場合。

| テストID | 操作シーケンス                                       | 期待結果                                                          |
| -------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| EC-5-1   | handoff 表示中 → 同一コマンドの新しい handoff 到達   | 既存の `TerminalHandoffCard` を新しい内容で上書き更新             |
| EC-5-2   | handoff 表示中 → 別コマンドの新しい handoff 到達     | `TerminalHandoffCard` の表示内容が新しい `HandoffGuidance` で更新 |
| EC-5-3   | handoff 表示中 → dismiss → 即座に新しい handoff 到達 | dismiss 後に新しい `TerminalHandoffCard` が表示されること         |
| EC-5-4   | 複数の handoff が高速連続で到達 (10ms 間隔)          | 最後の handoff のみが表示されること（debounce または上書き）      |
| EC-5-5   | handoff 表示中に `clearHandoffGuidance()` が呼ばれる | カードが非表示になり、次の handoff 表示が可能な状態になること     |

**実装方針**:

- Store の `setHandoffGuidance(guidance)` は上書き方式（accumulate ではない）
- EC-5-4 の高速連続 handoff は Store の 上書きで自然に最新化されること
- dismiss 後の `clearHandoffGuidance()` は Store の `handoffGuidance` を `null` に設定すること

---

## 6. 境界ケース優先度サマリー

| 境界ケースグループ        | 優先度 | 実装タイミング | 根拠                                         |
| ------------------------- | ------ | -------------- | -------------------------------------------- |
| EC-1-x (空文字列 command) | 高     | Phase 6 完了前 | P42 バリデーション漏れはセキュリティリスク   |
| EC-2-x (未知 surface)     | 中     | Phase 6 完了前 | フォールバック未実装は表示クラッシュに繋がる |
| EC-3-x (capability 変更)  | 中     | Phase 6 完了前 | リアルタイム更新の整合性                     |
| EC-4-x (遷移タイミング)   | 中     | Phase 6 完了前 | 競合状態の UI 不整合防止                     |
| EC-5-x (二重 handoff)     | 低     | Phase 6 完了前 | Edge case だが UX デグレが起きやすい         |

---

## 7. 既知の落とし穴との対応

| Pitfall | 関連境界ケース | 対策                                                                 |
| ------- | -------------- | -------------------------------------------------------------------- |
| P42     | EC-1-1〜4      | 3段バリデーション: 型チェック → 空文字列 → `.trim() === ""`          |
| P62     | EC-3-x         | assertNoSilentFallback で capability 変更時の silent fallback を防止 |
| P19     | EC-2-4         | `unknown` 型で受け取り、実行時型検証後にローカライズ処理             |
| P55     | EC-2-5         | contextSummary の表示前に XSS サニタイズ (escapeRegExp 準拠)         |
| P9      | EC-5-x         | beforeEach で Store の handoffGuidance を null にリセット            |
