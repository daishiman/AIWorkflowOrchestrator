# Phase 10: 最終レビュー

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 10                           |
| 機能名 | slide-runtime-alignment-impl |
| 作成日 | 2026-03-22                   |
| Issue  | #1363                        |

## 目的

Phase 5〜9 で実施した実装・リファクタリング・品質検証を、4つのレビュー観点で多角的に検証し、Phase 11（手動テスト）へ進めるかを判定する。

## 実行タスク

| タスク | レビュー観点             | 判定基準                               |
| ------ | ------------------------ | -------------------------------------- |
| R10-1  | アーキテクチャ・依存関係 | 依存方向・DIP・namespace の整合性      |
| R10-2  | 完全性・MECE             | 12チャネル実装済み・drift 6件解消済み  |
| R10-3  | 問題・根本原因           | D1-D6 の根本原因が除去されている       |
| R10-4  | UX・価値・エレガンス     | handoff guidance・エラーメッセージ品質 |

## 参照資料

| 資料名               | パス                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| Phase 1 要件書       | `docs/30-workflows/slide-runtime-alignment-impl/phase-01-requirements.md`  |
| Phase 2 設計書       | `docs/30-workflows/slide-runtime-alignment-impl/phase-02-design.md`        |
| Phase 3 レビュー     | `docs/30-workflows/slide-runtime-alignment-impl/phase-03-design-review.md` |
| Phase 9 品質検証     | `docs/30-workflows/slide-runtime-alignment-impl/phase-09-quality.md`       |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                         |
| セキュリティルール   | `.claude/rules/04-electron-security.md`                                    |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                       |

## レビュー手順

### R10-1: アーキテクチャ・依存関係レビュー

#### 依存方向の検証（Renderer → Preload → Main）

| チェック項目                                                | 確認方法                                                                                | 判定 |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------- | ---- |
| Renderer が Preload の contextBridge 経由でのみ Main に通信 | `grep -rn "ipcRenderer\." apps/desktop/src/renderer/` で直接 ipcRenderer 使用がないこと | -    |
| Main の slide ハンドラが Preload の allowlist に存在        | `preload/channels.ts` に全12チャネルが定義されていること                                | -    |
| slide IPC が `registerAllIpcHandlers()` から登録            | `grep -n "registerSlideIpcHandlers" apps/desktop/src/main/ipc/index.ts`                 | -    |

#### DIP（依存性逆転原則）の検証

| チェック項目                                            | 確認方法                                                                                 | 判定 |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---- |
| `ipc-handlers.ts` が具象クラスではなく interface に依存 | `registerSlideIpcHandlers()` の引数型が `SkillExecutor` interface であること（P61 対策） | -    |
| `skill-executor.ts` が RuntimeResolver の Port に依存   | `import { RuntimeResolver }` が具象実装ではなく型/interface を参照していること           | -    |

#### Dead-end namespace の確認（P65 対策）

```bash
# slide 系チャネルの namespace 一覧
grep -rn "ipcMain.handle\|ipcMain.on" apps/desktop/src/main/slide/ | grep -v "test" | grep "slide:"
```

**確認ポイント**:

- 全ハンドラが `slide:*` namespace のみを使用していること
- `creator:*` 等の別 namespace が混在していないこと
- Preload の allowlist と Main のハンドラで namespace が一致していること

---

### R10-2: 完全性・MECE レビュー

#### 12チャネルの実装完了確認

| チャネル                    | 種別   | 実装ファイル      | 判定 |
| --------------------------- | ------ | ----------------- | ---- |
| `slide:executePhase`        | invoke | `ipc-handlers.ts` | -    |
| `slide:watch-start`         | invoke | `ipc-handlers.ts` | -    |
| `slide:watch-stop`          | invoke | `ipc-handlers.ts` | -    |
| `slide:sync-status`         | invoke | `ipc-handlers.ts` | -    |
| `slide:reverse-sync`        | invoke | `ipc-handlers.ts` | -    |
| `slide:cancel`              | invoke | `ipc-handlers.ts` | -    |
| `slide:sync-status-changed` | push   | `ipc-handlers.ts` | -    |
| `slide:sync-progress`       | push   | `ipc-handlers.ts` | -    |
| `slide:sync-error`          | push   | `ipc-handlers.ts` | -    |
| `slide:execution-progress`  | push   | `ipc-handlers.ts` | -    |
| `slide:structureChanged`    | push   | `ipc-handlers.ts` | -    |
| `slide:watch-status`        | push   | `ipc-handlers.ts` | -    |

#### drift 6件の解消確認

| drift | 内容                         | 確認コマンド                                                                                                                        | 判定 |
| ----- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ---- |
| D1    | IPC handler 未接続           | `grep -n "registerSlideIpcHandlers" apps/desktop/src/main/ipc/index.ts`                                                             | -    |
| D2    | チャネル名 legacy            | `grep -rn "startWatching\|stopWatching\|getSyncStatus\|manualSync\|cancelExecution" apps/desktop/src/`                              | -    |
| D3    | SDK 直接利用                 | `grep -n "@anthropic-ai/sdk\|safeStorage\|ANTHROPIC_API_KEY" apps/desktop/src/main/slide/`                                          | -    |
| D4    | modifier-skill 独立実装      | `grep -rn "modifier-skill" apps/desktop/src/main/` で `skill-executor.ts` からのみ import                                           | -    |
| D5    | validateIpcSender 未実装     | `grep -c "validateIpcSender" apps/desktop/src/main/slide/ipc-handlers.ts` が 6 以上                                                 | -    |
| D6    | slideSlice store fields 不足 | `grep -n "syncDirection\|syncProgress\|syncError\|isHandoff\|handoffGuidance" apps/desktop/src/renderer/stores/slide/slideSlice.ts` | -    |

#### テストカバレッジ確認

```bash
cd apps/desktop && pnpm vitest run src/main/slide/ --coverage
```

- Line Coverage: 80% 以上（推奨 90%）
- Function Coverage: 80% 以上（推奨 90%）

---

### R10-3: 問題・根本原因レビュー

各 drift の根本原因が構造的に除去されているかを確認する。

#### D1 根本原因の除去確認

**根本原因**: `registerSlideIpcHandlers()` が `ipc/index.ts` の `registerAllIpcHandlers()` から呼ばれていなかった。

**除去確認**: `registerAllIpcHandlers()` と `unregisterAllIpcHandlers()` の両方に slide の登録・解除が含まれているか確認する。P5（リスナー二重登録）対策として `unregisterSlideIpcHandlers()` も実装されていることを確認する。

#### D2 根本原因の除去確認

**根本原因**: チャネル名がコード内に文字列リテラルとしてハードコードされていた（P27 対策）。

**除去確認**: `SLIDE_INVOKE_CHANNELS` と `SLIDE_PUSH_CHANNELS` 定数が定義され、全ハンドラおよび Preload `channels.ts` で定数参照されていること。

```bash
# 文字列リテラルでのチャネル指定が残っていないか確認
grep -rn "\"slide:" apps/desktop/src/main/slide/ | grep -v "//.*\"slide:"
```

#### D3 根本原因の除去確認

**根本原因**: `agent-client.ts` が RuntimeResolver をバイパスして SDK・認証情報へ直接アクセスしていた。

**除去確認**:

```bash
# agent-client.ts が廃止または空になっているか確認
cat apps/desktop/src/main/slide/agent-client.ts 2>/dev/null || echo "ファイル削除済み"

# skill-executor.ts が RuntimeResolver 経由で実行しているか確認
grep -n "RuntimeResolver" apps/desktop/src/main/slide/skill-executor.ts
```

#### D4 根本原因の除去確認

**根本原因**: `modifier-skill.ts` が呼び出し元ゼロの独立モジュールとして残存していた。

**除去確認**: `modifier-skill.ts` が `skill-executor.ts` から `import` され、`phase === "modifier"` の分岐内で利用されていること。

#### D5 根本原因の除去確認

**根本原因**: セキュリティレビューが各ハンドラ実装時に適用されていなかった。

**除去確認**: Phase 8 で抽出した `validateSlideRequest()` ヘルパーが全6本の invoke ハンドラで使用されていること。

```bash
grep -c "validateSlideRequest\|validateIpcSender" apps/desktop/src/main/slide/ipc-handlers.ts
```

#### D6 根本原因の除去確認

**根本原因**: `slideSlice` の store fields が正本仕様から乖離したまま放置されていた。

**除去確認**: 正本 7 fields（`syncStatus`, `isWatching`, `syncDirection`, `syncProgress`, `syncError`, `isHandoff`, `handoffGuidance`）が全て `SlideSliceState` interface に定義されていること。

---

### R10-4: UX・価値・エレガンス レビュー

#### handoff guidance の品質確認

`handoff` モード時に返される `HandoffGuidance` オブジェクトが actionable（ユーザーが迷わず行動できる）かを確認する。

**確認ポイント**:

| フィールド       | 品質基準                                                      |
| ---------------- | ------------------------------------------------------------- |
| `command`        | ターミナルにそのままコピー&ペーストできる完全なコマンド文字列 |
| `contextSummary` | 現在のプロジェクト状態を 1〜3 文で要約した具体的な説明        |
| `reason`         | なぜ handoff が必要なのかを平易な日本語で説明した 1〜2 文     |

**確認方法**: `skill-executor.ts` の `buildHandoffGuidance()` 関数の実装を確認し、上記基準を満たすオブジェクトを返すことをテストで検証する。

#### エラーメッセージのユーザーフレンドリー確認

`sanitizeError()` が返すエラーメッセージが内部情報を含まないことを確認する。

**確認ポイント**:

- ファイルパス（`/Users/...` 等）が含まれていないこと（P55 対策）
- スタックトレースが含まれていないこと
- エラーコード（`VALIDATION_ERROR`, `SECURITY_ERROR` 等）が明確に含まれていること
- ユーザーが次に何をすべきかが推測できるメッセージであること

#### コードのエレガンス確認

- `validateSlideRequest()` ヘルパーが適切に抽象化されており、各ハンドラが薄くなっているか
- switch 文の `default` に `never` チェックがあり、将来の拡張に対して型安全か
- `modifier-skill.ts` が utility として適切なサイズに縮退しているか

**R10-4 追加チェック**: `handoffGuidance` を表示するコンポーネント（SlideGuidanceBlock 等）の存在確認:

```bash
grep -rn "handoffGuidance\|SlideGuidanceBlock\|HandoffGuidance" apps/desktop/src/renderer/
```

表示コンポーネントが存在しない場合、slideSlice に handoffGuidance が保存されてもユーザーに到達しない。
未存在の場合は未タスク（UT-SLIDE-GUIDANCE-UI-001）として登録する。

---

## 判定

### 判定基準

| 判定     | 対応                                                |
| -------- | --------------------------------------------------- |
| PASS     | Phase 11（手動テスト）へ進む                        |
| MINOR    | 指摘事項を未タスク化後、Phase 11 へ進む（省略不可） |
| MAJOR    | 影響範囲に応じて Phase 1〜5 へ戻る                  |
| CRITICAL | Phase 1 へ戻り要件再確認                            |

### MAJOR 判定となる条件

- drift の根本原因が構造的に除去されていない（表面的な修正のみ）
- 12チャネルのうち1本以上が未実装または Preload allowlist に未登録
- `validateIpcSender` が1本以上のハンドラに未適用
- `sanitizeError()` が内部パスやスタックトレースを漏洩している

### MINOR 判定（未タスク化）となる条件

- テストカバレッジが 80% 未満の箇所がある
- `HandoffGuidance` の `contextSummary` が具体性に欠ける（改善余地あり）
- コードコメントの一部が英語のみで日本語説明がない

---

## 統合テスト連携

本 Phase のレビューが PASS または MINOR（未タスク化完了）となった場合に Phase 11 へ進む。

MINOR 判定の場合は未タスク仕様書を `docs/30-workflows/slide-runtime-alignment-impl/` 内の `unassigned-task/` ディレクトリに作成し、`task-workflow.md` の残課題テーブルにも登録してから Phase 11 へ進む。

## 成果物

| 成果物               | パス                                    | 説明                                 |
| -------------------- | --------------------------------------- | ------------------------------------ |
| 最終レビュー結果     | Phase 10 判定記録                       | PASS/MINOR/MAJOR/CRITICAL 判定と根拠 |
| MINOR 未タスク仕様書 | `unassigned-task/` 配下（該当する場合） | MINOR 指摘の未タスク化               |

## 完了条件

- [ ] R10-1: 依存方向（Renderer→Preload→Main）が正しく、DIP 準拠、dead-end namespace なし
- [ ] R10-2: 全12チャネルが実装済み・Preload allowlist に登録済み、drift D1-D6 が全て解消
- [ ] R10-3: D1-D6 の根本原因が構造的に除去されており、再発防止策がコードに組み込まれている
- [ ] R10-4: handoff guidance が actionable、エラーメッセージがユーザーフレンドリー、コードがエレガント
- [ ] 判定が PASS または MINOR（MINOR の場合は未タスク化完了）

## 次のPhase

Phase 11（手動テスト）へ進む。
