# Phase 6 成果物: 回帰拡張計画

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001      |
| Phase      | 6                                                      |
| 成果物種別 | 回帰拡張計画                                           |
| 作成日     | 2026-03-22                                             |
| 依存成果物 | phase-4/test-matrix.md, phase-5/implementation-plan.md |

---

## 1. Error パス: API key 有効 → LLM 到達不可 → terminal-handoff 降格

**シナリオ概要**: API key は有効だが LLM エンドポイントへの到達に失敗した場合、`integrated-api` から `terminal-handoff` への降格が正しく行われ、`TerminalHandoffCard` が表示されること。

| テストID | 入力状態                                      | 期待結果                                                            |
| -------- | --------------------------------------------- | ------------------------------------------------------------------- |
| REG-E-1  | API key 有効 + LLM HTTP 503                   | `capability` が `terminal-handoff` に降格すること                   |
| REG-E-2  | API key 有効 + LLM タイムアウト (30秒超過)    | `terminal-handoff` 降格後、`toHandoffGuidance()` が呼ばれること     |
| REG-E-3  | API key 有効 + LLM 到達不可 → handoff 表示    | `TerminalHandoffCard` が表示され、`reason` に降格理由が含まれること |
| REG-E-4  | API key 有効 + LLM 到達不可 → copy ボタン操作 | `terminalCommand` がクリップボードに書き込まれること                |
| REG-E-5  | API key 有効 + LLM 到達不可 → dismiss 後      | `clearHandoffGuidance()` が呼ばれ、カードが非表示になること         |

**対象ファイル**:

- `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts`
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`

---

## 2. Blocked パス: capability=none + hasResolutionAction 分岐

**シナリオ概要**: capability が `none` の場合、`hasResolutionAction` の真偽によって `blocked` (設定導線表示) と `unavailable` (操作不可表示) に分岐すること。silent fallback が発生しないこと (P62 対策)。

| テストID | hasResolutionAction | 期待 UiState  | 期待 CTA             | assertNoSilentFallback |
| -------- | ------------------- | ------------- | -------------------- | ---------------------- |
| REG-B-1  | `true`              | `blocked`     | 設定を開く (primary) | エラーなし             |
| REG-B-2  | `false`             | `unavailable` | なし                 | エラーなし             |
| REG-B-3  | `true`              | `ready`       | (不正: ready に遷移) | エラーをスロー (P62)   |
| REG-B-4  | `false`             | `ready`       | (不正: ready に遷移) | エラーをスロー (P62)   |

**検証コード参考**:

```typescript
// REG-B-3/4: assertNoSilentFallback が P62 違反を検出すること
expect(() => {
  assertNoSilentFallback("none", "ready");
}).toThrow();
```

---

## 3. Fallback 防御: P62 assertNoSilentFallback

**シナリオ概要**: `assertNoSilentFallback` が全ての silent fallback パターンを検出すること。

| テストID | capability            | uiState                      | 期待動作          |
| -------- | --------------------- | ---------------------------- | ----------------- |
| REG-F-1  | `"none"`              | `"ready"`                    | エラーをスロー    |
| REG-F-2  | `"none"`              | `"blocked"`                  | 正常 (エラーなし) |
| REG-F-3  | `"none"`              | `"unavailable"`              | 正常 (エラーなし) |
| REG-F-4  | `"integratedRuntime"` | `"ready"`                    | 正常 (エラーなし) |
| REG-F-5  | `"terminalSurface"`   | `"ready"`                    | 正常 (エラーなし) |
| REG-F-6  | `"both"`              | `"ready"`                    | 正常 (エラーなし) |
| REG-F-7  | `"none"`              | `"ready"` (異なる呼び出し元) | エラーをスロー    |

**全 UiState パターン網羅確認**:

```bash
# capability → UiState マッピングの全パターンを確認
grep -rn "UiState\|assertNoSilentFallback" apps/desktop/src/main/services/
```

---

## 4. Permission パス: IRuntimePolicyResolver.resolve() 経由以外の判定禁止

**シナリオ概要**: Renderer ローカルで capability / auth 判定が行われていないこと。全ての capability 判定が `IRuntimePolicyResolver.resolve()` 経由であることを確認する。

| テストID | 検証内容                                                      | 期待結果                                             |
| -------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| REG-P-1  | Renderer コンポーネントへの `authMode` / `apiKey` import 禁止 | import が存在しないこと                              |
| REG-P-2  | `IRuntimePolicyResolver.resolve()` をモックしたテスト         | IPC 経由の capability 値のみが UI 判定に使われること |
| REG-P-3  | `IRuntimePolicyResolver.resolve()` を bypass したテスト       | bypass パスで capability が `none` に落ちること      |
| REG-P-4  | モック resolve が `integrated-api` を返す → `ready` 状態      | Renderer で auth 判定を追加実施しないこと            |

**禁止パターンの静的検出コマンド**:

```bash
# Renderer に auth / apiKey 判定が混入していないことを確認 (NFR-2a)
grep -rn "authMode\|apiKey\|apikey\|AUTH_MODE" apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/
grep -rn "authMode\|apiKey\|apikey\|AUTH_MODE" apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/
```

---

## 5. MN-2 対応: Terminal Dock aborted state 追加

**シナリオ概要**: terminal dock セッションが中断 (aborted) された場合の状態遷移を追加する。Task06 (Terminal Dock) の完成を待って実装するが、Phase 6 でテストケースを先行定義する。

| テストID | 操作シーケンス                                            | 期待結果                                               |
| -------- | --------------------------------------------------------- | ------------------------------------------------------ |
| REG-M2-1 | terminal dock running → 中断 (process kill)               | dock state が `aborted` に遷移すること                 |
| REG-M2-2 | aborted state → 再 open launcher                          | transcript は保持されるが session は新規開始されること |
| REG-M2-3 | aborted state → TerminalHandoffCard から copy → dock open | transcript 継続で dock が開くこと                      |
| REG-M2-4 | aborted state の UI 表示                                  | "中断されました" テキストと再起動 CTA が表示されること |

> **注意**: REG-M2-1〜4 は Task06 (Terminal Dock セッション管理) 依存のため、現時点では `.skip` でマーク。
> Task06 完成後に `.skip` を外してテストを有効化すること。

```typescript
// Task06 依存テストのスキップ方法
it.skip("REG-M2-1: aborted state への遷移", () => {
  // TODO(Task06): Terminal Dock セッション管理実装後に有効化
});
```

---

## 6. 回帰テスト実行コマンド

```bash
# Phase 6 拡充テスト一括実行
cd apps/desktop && pnpm vitest run src/main/services/skill/SkillDocsCapabilityResolver
cd apps/desktop && pnpm vitest run src/main/services/runtime/TerminalHandoffBuilder
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/TerminalHandoffCard
cd apps/desktop && pnpm vitest run src/renderer/components/organisms/ExecutionEnvironment

# shared パッケージのアダプタテスト
cd packages/shared && pnpm vitest run src/types/handoff
```

---

## 7. 優先度マトリクス

| テストグループ | 優先度 | 実装タイミング | 理由                                       |
| -------------- | ------ | -------------- | ------------------------------------------ |
| REG-E-1〜5     | 高     | Phase 6 完了前 | LLM 降格パスは本番障害に直結するため       |
| REG-B-1〜4     | 高     | Phase 6 完了前 | P62 silent fallback は UX 破壊のため       |
| REG-F-1〜7     | 高     | Phase 6 完了前 | assertNoSilentFallback の網羅確認          |
| REG-P-1〜4     | 中     | Phase 6 完了前 | 静的検出で代替可能だが自動テストが望ましい |
| REG-M2-1〜4    | 低     | Task06 完成後  | Task06 依存のため現時点では skip           |
