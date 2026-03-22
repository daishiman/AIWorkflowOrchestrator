# Phase 7 成果物: 統合ゲート

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001   |
| Phase      | 7                                                   |
| 成果物種別 | 統合ゲート                                          |
| 作成日     | 2026-03-22                                          |
| 依存成果物 | phase-7/coverage-targets.md, phase-4/test-matrix.md |

---

## 1. Smoke テスト

**目的**: 実装の最低動作確認。ビルドが通り、基本的な変換・表示が動作することを確認する。

| Smoke ID | 検証内容                                      | 期待結果                           | 実行コマンド                                                                               |
| -------- | --------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| SMK-1    | `toHandoffGuidance()` 変換 (guidance-only)    | `HandoffGuidance` が返却されること | `cd packages/shared && pnpm vitest run src/types/handoff`                                  |
| SMK-2    | `toHandoffGuidance()` 変換 (terminal-handoff) | `HandoffGuidance` が返却されること | `cd packages/shared && pnpm vitest run src/types/handoff`                                  |
| SMK-3    | `TerminalHandoffCard` レンダー                | エラーなしで表示されること         | `cd apps/desktop && pnpm vitest run src/renderer/components/organisms/TerminalHandoffCard` |
| SMK-4    | TypeScript コンパイル成功                     | 型エラーなし                       | `pnpm --filter @repo/shared typecheck && pnpm --filter @repo/desktop typecheck`            |
| SMK-5    | Lint 成功                                     | ESLint エラーなし                  | `pnpm --filter @repo/shared lint && pnpm --filter @repo/desktop lint`                      |

**Smoke ゲート**: SMK-1〜5 が全て PASS すること。1件でも FAIL した場合は Phase 5 に戻って実装を修正すること。

---

## 2. Integration テスト

**目的**: chatEditHandlers の handoff path から TerminalHandoffCard 表示、copy 操作までのフルフロー確認。

| Integration ID | シナリオ                                                                 | 期待結果                                                                      | テストID 対応 |
| -------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------- |
| INT-1          | chatEditHandlers handoff 応答 → Renderer の `handoffGuidance` Store 更新 | Store に `HandoffGuidance` がセットされること                                 | IT-A-1        |
| INT-2          | Store の `handoffGuidance` セット → `TerminalHandoffCard` 表示           | `TerminalHandoffCard` がレンダーされること                                    | UT-B-1        |
| INT-3          | `TerminalHandoffCard` 表示 → copy ボタンクリック                         | `navigator.clipboard.writeText(terminalCommand)` が呼ばれること               | UT-B-3        |
| INT-4          | `TerminalHandoffCard` 表示 → dismiss ボタンクリック                      | `clearHandoffGuidance()` が呼ばれ、`TerminalHandoffCard` が非表示になること   | UT-B-4        |
| INT-5          | SkillDocsCapabilityResolver guidance-only → `HandoffGuidance` 生成       | `toHandoffGuidance()` 経由で `HandoffGuidance` が生成されること               | IT-B-1        |
| INT-6          | SkillDocsCapabilityResolver terminal-handoff → `HandoffGuidance` 生成    | `toHandoffGuidance()` 経由で `HandoffGuidance` が生成されること               | IT-B-2        |
| INT-7          | capability=none → assertNoSilentFallback 防御                            | `uiState === "ready"` への silent fallback が検出されエラーがスローされること | UT-C-1        |
| INT-8          | capability 変更 (integrated-api → terminal-handoff) → 表示切り替え       | `TerminalHandoffCard` が表示されること（EC-3-x）                              | EC-3-4        |

**Integration ゲート**: INT-1〜8 が全て PASS すること。

---

## 3. Walkthrough (Phase 11 手動テストの先行確認)

**目的**: 自動テストでは確認できない視覚的・操作的な品質を Phase 11 で確認するための項目定義。

| Walkthrough ID | 対応 TC-MAN | 確認内容                                                        | 確認者                  |
| -------------- | ----------- | --------------------------------------------------------------- | ----------------------- |
| WLK-1          | TC-MAN-1    | `TerminalHandoffCard` が正しくレンダーされること                | Phase 11 担当エンジニア |
| WLK-2          | TC-MAN-4    | App Shell Header 右上に launcher ボタンが表示されること         | Phase 11 担当エンジニア |
| WLK-3          | TC-MAN-5    | launcher クリック後に bottom sheet が開き、auto-send がないこと | Phase 11 担当エンジニア |

**Walkthrough 注意事項**:

- CLI 環境ではスクリーンショット取得が困難 (P53 対策)
- `xvfb-run` または `webContents.capturePage()` スクリプトで取得すること
- WLK-1〜3 は Phase 11 の手動テスト仕様書 (TC-MAN-1, 4, 5) に対応

---

## 4. Residual Risk (残存リスク)

### 4.1 Terminal Dock session persistence（Task06 依存）

| リスクID | 内容                                                                           | 重大度 | 対処                                                                  |
| -------- | ------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------- |
| RR-1     | terminal dock の transcript 保持は Task06 (Terminal Dock) 完成後にのみ検証可能 | 中     | Phase 6 の REG-M2-1〜4 は `.skip` でマーク。Task06 完成後に有効化     |
| RR-2     | bottom sheet の実装は Task06 依存。現時点では stub (launcher CTA のみ)         | 中     | `TODO(Task06)` コメントを placeholder に記載。Phase 5 タスク 5 で対応 |
| RR-3     | EC-3-5 (capability 変更時のちらつき) は視覚テストが必要                        | 低     | Phase 11 で目視確認。自動テストでは `loading` state の存在を確認      |
| RR-4     | EC-5-4 (高速連続 handoff) の debounce 実装は Phase 6 後に検討                  | 低     | 現時点では Store 上書きで対応。パフォーマンステストは Phase 8 以降    |

### 4.2 未実装範囲の明示

| 機能                               | 実装状態  | Task 依存 | Phase 7 ゲート影響       |
| ---------------------------------- | --------- | --------- | ------------------------ |
| bottom sheet (TerminalDock)        | stub のみ | Task06    | 影響なし（stub は PASS） |
| transcript 保持                    | 未実装    | Task06    | 影響なし（.skip）        |
| Terminal Dock aborted state (MN-2) | 未実装    | Task06    | 影響なし（.skip）        |
| REG-M2-1〜4                        | .skip     | Task06    | 影響なし                 |

---

## 5. Phase 7 ゲート判定基準

| ゲート条件                                      | 判定 |
| ----------------------------------------------- | ---- |
| SMK-1〜5 が全て PASS                            | 必須 |
| INT-1〜8 が全て PASS                            | 必須 |
| Line Coverage >= 80% (全対象ファイル)           | 必須 |
| Branch Coverage >= 60% (全対象ファイル)         | 必須 |
| Function Coverage >= 80% (全対象ファイル)       | 必須 |
| TypeScript 型エラーなし                         | 必須 |
| ESLint エラーなし                               | 必須 |
| WLK-1〜3 は Phase 11 に委譲（Phase 7 では任意） | 任意 |
| REG-M2-1〜4 は .skip（Task06 完成後に有効化）   | 除外 |

**ゲート PASS 条件**: 「必須」項目が全て PASS した場合に Phase 8 (リファクタリング) に進む。

**ゲート FAIL 時の戻り先**:

- SMK FAIL → Phase 5 (実装修正)
- Integration FAIL → Phase 5 (実装) または Phase 6 (テスト修正)
- Coverage 未達 → Phase 6 (テスト拡充)
- TypeScript / Lint エラー → Phase 5 (コード修正)

---

## 6. Phase 7 実行チェックリスト

- [ ] SMK-1〜5 全 PASS を確認
- [ ] INT-1〜8 全 PASS を確認
- [ ] `cd packages/shared && pnpm vitest run --coverage` でカバレッジ確認
- [ ] `cd apps/desktop && pnpm vitest run --coverage` でカバレッジ確認
- [ ] `pnpm --filter @repo/shared typecheck` が成功
- [ ] `pnpm --filter @repo/desktop typecheck` が成功
- [ ] `pnpm lint` が成功
- [ ] `assertNoSilentFallback` の Function Coverage が 100% であること (P62 防御)
- [ ] Renderer コンポーネントに `authMode` / `apiKey` の直接 import がないこと (NFR-2a)
- [ ] Phase 8 着手条件を満たしていること
