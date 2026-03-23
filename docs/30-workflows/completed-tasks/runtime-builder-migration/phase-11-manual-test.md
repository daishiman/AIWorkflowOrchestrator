# Phase 11: 手動テスト

## メタ情報

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| タスクID | UT-RUNTIME-BUILDER-MIGRATION-001                |
| Phase    | 11 - 手動テスト                                 |
| 前提     | `phase-10-final-review.md`（最終レビュー PASS） |
| 実施環境 | CLI 環境（Electron UI テストは別タスク）        |

## 目的

`TerminalHandoffBuilder.buildForSurface()` の統一メソッドが、各 surface（chat-edit / agent / skill）で正しく動作することを手動で確認する。
また、`RuntimeSkillCreatorFacade` の `plan()` メソッドにおける `terminal_handoff` 分岐の動作と、セキュリティ要件（API キー非漏洩、特殊文字サニタイズ）を検証する。

## 実行タスク

### テスト項目 1: chat-edit handoff 確認

**目的**: `chatEditHandlers` 経由で handoff が発生した際に、`buildForSurface()` が正しい `HandoffGuidance` を返すこと

**確認手順**:

1. `chatEditHandlers.ts` の呼び出し箇所が `buildForSurface({ surfaceType: 'chat-edit', ... }, reason)` を使用していることをコードで確認する
2. 返却される `HandoffGuidance` の `contextSummary` に以下が含まれることを確認する:
   - `command` フィールド
   - `files` フィールド
   - `workspace` フィールド
3. `terminalCommand` が空文字列でないことを確認する

**期待結果**:

- `buildForSurface()` が `HandoffGuidance` 型のオブジェクトを返す
- `contextSummary.command` に実行対象コマンド情報が含まれる
- `contextSummary.files` に関連ファイルのリストが含まれる
- `contextSummary.workspace` にワークスペースパス情報が含まれる

**確認コマンド例**:

```bash
# chat-edit ハンドラの呼び出し箇所を確認
grep -rn "buildForSurface" apps/desktop/src/main/ipc/chatEditHandlers.ts
```

---

### テスト項目 2: agent handoff 確認

**目的**: `agentHandlers` 経由で handoff が発生した際に、`buildForSurface()` が正しい `HandoffGuidance` を返すこと

**確認手順**:

1. `agentHandlers.ts` の呼び出し箇所が `buildForSurface({ surfaceType: 'runtime', runtimeType: 'agent', ... }, reason)` を使用していることをコードで確認する
2. 返却される `HandoffGuidance` の `contextSummary` に `surfaceType=runtime / runtimeType=agent` が含まれることを確認する
3. agent 固有のコンテキスト情報が `contextSummary` に反映されていることを確認する

**期待結果**:

- `buildForSurface()` が `HandoffGuidance` 型のオブジェクトを返す
- `contextSummary` に `surfaceType: 'runtime'` および `runtimeType: 'agent'` またはそれに相当する識別情報が含まれる
- agent 実行コンテキスト（プロンプト、ツール情報等）が `contextSummary` に含まれる

**確認コマンド例**:

```bash
# agent ハンドラの呼び出し箇所を確認
grep -rn "buildForSurface" apps/desktop/src/main/ipc/agentHandlers.ts
```

---

### テスト項目 3: skill handoff 確認

**目的**: `skillHandlers` 経由で handoff が発生した際に、`buildForSurface()` が正しい `HandoffGuidance` を返すこと

**確認手順**:

1. `skillHandlers.ts` の呼び出し箇所が `buildForSurface({ surfaceType: 'runtime', runtimeType: 'skill', ... }, reason)` を使用していることをコードで確認する
2. 返却される `HandoffGuidance` の `contextSummary` に `surfaceType=runtime / runtimeType=skill` が含まれることを確認する
3. skill 固有のコンテキスト情報（スキル名、パラメータ等）が `contextSummary` に反映されていることを確認する

**期待結果**:

- `buildForSurface()` が `HandoffGuidance` 型のオブジェクトを返す
- `contextSummary` に `surfaceType: 'runtime'` および `runtimeType: 'skill'` またはそれに相当する識別情報が含まれる
- skill 実行コンテキスト（スキル名等）が `contextSummary` に含まれる

**確認コマンド例**:

```bash
# skill ハンドラの呼び出し箇所を確認
grep -rn "buildForSurface" apps/desktop/src/main/ipc/skillHandlers.ts
```

---

### テスト項目 4: RuntimeSkillCreatorFacade 確認

**目的**: `RuntimeSkillCreatorFacade.plan()` メソッドの `terminal_handoff` 分岐で、`guidance` が `HandoffGuidance` 型であることを確認する

**確認手順**:

1. `RuntimeSkillCreatorFacade.ts` の `plan()` メソッド内の `terminal_handoff` 分岐を確認する
2. `guidance` 変数の型が `HandoffGuidance` であることをコードレベルで確認する
3. `buildForSurface()` の戻り値が正しく `guidance` に代入されていることを確認する
4. 型エラーがないことを TypeScript コンパイルで検証する

**期待結果**:

- `plan()` の `terminal_handoff` 分岐で `buildForSurface()` が呼ばれる
- 戻り値が `HandoffGuidance` 型に正しく適合する
- `pnpm typecheck` が PASS する

**確認コマンド例**:

```bash
# RuntimeSkillCreatorFacade の terminal_handoff 分岐を確認
grep -rn "terminal_handoff\|buildForSurface" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# TypeCheck で型整合性を検証
pnpm --filter @repo/desktop typecheck
```

---

### テスト項目 5: セキュリティ確認

**目的**: 生成された `terminalCommand` に API キーが含まれていないこと、および shell 特殊文字がサニタイズされていることを確認する

**確認手順**:

1. `buildForSurface()` の出力に含まれる `terminalCommand` を確認する
2. 以下のセキュリティ要件を検証する:
   - `ANTHROPIC_API_KEY` 等の環境変数の実値が `terminalCommand` に含まれていないこと
   - shell 特殊文字（`;`, `|`, `&&`, `$(...)`, バッククォート等）がサニタイズまたはエスケープされていること
3. テストコードでセキュリティ検証が実装されていることを確認する

**期待結果**:

- `terminalCommand` に API キーの実値が含まれない（`$ANTHROPIC_API_KEY` のような変数参照形式は許容）
- ユーザー入力由来の文字列が shell 特殊文字を含む場合にサニタイズされる
- セキュリティテストが既存のテストスイートに含まれ PASS する

**確認コマンド例**:

```bash
# セキュリティ関連テストを実行
pnpm --filter @repo/desktop test -- --reporter=verbose TerminalHandoffBuilder

# サニタイズ処理の実装箇所を確認
grep -rn "sanitize\|escape\|apiKey\|API_KEY" apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts
```

---

## 注意事項

- 本 Phase は CLI 環境での確認が中心となる
- Electron UI を通じた手動テスト（実際のウィンドウ操作）は別タスクで実施する
- スクリーンショット取得が必要な場合は、`Playwright page.screenshot()` または `Electron webContents.capturePage()` を使用すること（P53 対策）
- 自動テスト（ユニットテスト）の結果を間接的な検証証跡として記録してよい

## 参照資料

- `phase-10-final-review.md` - 最終レビュー結果
- `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts` - 実装コード
- `.claude/rules/06-known-pitfalls.md#P53` - CLI 環境でのスクリーンショット取得制約

## 成果物

- `outputs/phase-11/manual-test-report.md`（手動テスト結果レポート）

## 完了条件

- [ ] テスト項目 1〜5 が全て確認済みである
- [ ] 各確認コマンドの実行結果が期待結果と一致している
- [ ] セキュリティ要件（API キー非漏洩・特殊文字サニタイズ）が満たされていることを確認した
- [ ] 手動テスト結果レポートが作成されている

## 次 Phase

Phase 12: ドキュメント (`phase-12-documentation.md`)

---

## 統合テスト連携

Phase 10 の最終レビュー結果を参照し、全テスト（単体+統合）が PASS していることを手動テストの前提として確認する。

---

## 多角的チェック観点

| 観点         | 確認内容                                                                        | 対応テスト項目  |
| ------------ | ------------------------------------------------------------------------------- | --------------- |
| API設計      | buildForSurface() の呼び出しが正しい surfaceType / runtimeType を使用しているか | テスト項目 1〜3 |
| セキュリティ | API キー非漏洩・特殊文字サニタイズが確認されているか                            | テスト項目 5    |
| 型安全性     | HandoffGuidance 型が正しく適合しているか                                        | テスト項目 4    |

---

## サブタスク管理

- [ ] テスト項目 1（chat-edit handoff）を確認する
- [ ] テスト項目 2（agent handoff）を確認する
- [ ] テスト項目 3（skill handoff）を確認する
- [ ] テスト項目 4（RuntimeSkillCreatorFacade）を確認する
- [ ] テスト項目 5（セキュリティ）を確認する
- [ ] 手動テスト結果レポートを作成する
