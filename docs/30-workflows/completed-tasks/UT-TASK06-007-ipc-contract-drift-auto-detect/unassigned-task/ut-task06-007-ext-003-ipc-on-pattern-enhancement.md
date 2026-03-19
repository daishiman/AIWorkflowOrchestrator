# UT-TASK06-007-EXT-003: ipcMain.onパターンの検証強化 - タスク指示書

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-TASK06-007-EXT-003                                        |
| タスク名     | ipcMain.on パターンの検証強化                                |
| 分類         | 機能拡張                                                     |
| 対象機能     | check-ipc-contracts.ts / ipcMain.on と safeOn の照合ロジック |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | UT-TASK06-007 Phase 2 スコープ外定義                         |
| 発見日       | 2026-03-18                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`check-ipc-contracts.ts` は `ipcMain.handle` と `safeInvoke` の対応関係（R-01/R-04 ルール）を検証しているが、`ipcMain.on`（イベントリスナー）と `safeOn` の対応関係に対する照合精度が低い。現在は `ipcMain.on` の検出は行っているものの、対応する `safeOn` との照合は不完全であり、R-01/R-04 ルールが `ipcMain.on` パターンには適用されていない。

### 1.2 問題点・課題

- `ipcMain.on` を使って登録されたイベントリスナーに対応する `safeOn` が Preload に存在しない場合でも、契約違反として検出されない
- `safeOn` で登録されているチャンネルが Main 側に `ipcMain.on` で対応するリスナーを持たない場合も、R-04 違反として検出されない
- UT-TASK06-007 Phase 2 で `ipcMain.on` 対応はスコープ外として切り出された課題

### 1.3 放置した場合の影響

- `ipcMain.on` / `safeOn` 間の契約ドリフトが自動検出されず、P5（リスナー二重登録）や P44（IPC インターフェース不整合）と同種の問題が発生した際に発見が遅れる
- `ipcMain.handle` パターンのみの検証では IPC 契約の網羅性が不完全になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`ipcMain.on` と `safeOn` の対応関係を正確に照合し、R-01/R-04 ルールを `ipcMain.on` パターンにも適用できるようにする。

### 2.2 最終ゴール

`ipcMain.on` と `safeOn` の照合でも R-01（Main 未登録チャンネルの Preload 使用を検出）・R-04（Preload 未登録チャンネルの Main 使用を検出）が機能し、偽陰性ゼロの状態で契約チェックが実行できること。

### 2.3 スコープ

#### 含むもの

- `ipcMain.on` 登録チャンネルの抽出精度向上
- `safeOn` 登録チャンネルの抽出精度向上
- `ipcMain.on` / `safeOn` 間の照合ロジック実装
- R-01/R-04 ルールを `ipcMain.on` パターンに適用するテスト追加

#### 含まないもの

- タプル配列パターンの抽出（UT-TASK06-007-EXT-001 のスコープ）
- `IPC_CHANNELS` 以外の定数オブジェクト対応（UT-TASK06-007-EXT-002 のスコープ）
- `ipcRenderer.on` の検証（Renderer 側リスナーは別課題）

### 2.4 成果物

- `check-ipc-contracts.ts` の `ipcMain.on` / `safeOn` 照合ロジック修正
- 追加単体テスト（R-01/R-04 の `ipcMain.on` パターン）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-TASK06-007 が完了済みであること
- `pnpm --filter @repo/desktop test` が全件 PASS していること

### 3.2 依存タスク

- UT-TASK06-007（完了済み）
- UT-TASK06-007-EXT-001（先行推奨、ただし依存関係なし）

### 3.3 必要な知識

- `ipcMain.on` と `ipcMain.handle` の違い（one-way vs request-response）
- `safeOn` と `safeInvoke` の違い
- R-01/R-04 ルールの定義（`ipc-contract-checklist.md` 参照）
- Vitest を用いた単体テストの記述方法

### 3.4 推奨アプローチ

1. 現在の `check-ipc-contracts.ts` で `ipcMain.on` を抽出するロジックを確認する
2. `safeOn` の抽出ロジックを確認する
3. 両者を照合して差分（R-01 / R-04 違反）を検出する照合関数を追加または修正する
4. 単体テストで照合ロジックが正しく動作することを確認する

---

## 4. 実行手順

### Phase 構成

Phase 1: 調査 → Phase 2: 実装 → Phase 3: テスト追加 → Phase 4: 品質検証

### Phase 1: 調査

#### 目的

現在の `ipcMain.on` / `safeOn` 抽出・照合ロジックを把握し、差分を特定する。

#### 手順

1. `grep -rn "ipcMain\.on\b" apps/desktop/src/main/ --include="*.ts"` で `ipcMain.on` 登録箇所を収集する
2. `grep -rn "safeOn" apps/desktop/src/preload/ --include="*.ts"` で `safeOn` 登録箇所を収集する
3. `check-ipc-contracts.ts` の現在の照合ロジックを読み、`ipcMain.on` と `safeOn` の照合がどこまで実装されているかを確認する
4. 照合が不完全なチャンネルの一覧を作成する

#### 成果物

照合が不完全なチャンネル一覧と修正方針

#### 完了条件

- 照合ロジックの不完全箇所が特定されている
- 修正すべき関数名・行番号が判明している

### Phase 2: 実装

#### 目的

`ipcMain.on` / `safeOn` の照合ロジックを修正し、R-01/R-04 ルールを適用できるようにする。

#### 手順

1. 照合関数を修正して `ipcMain.on` 抽出チャンネルと `safeOn` 抽出チャンネルの差分を検出できるようにする
2. R-01 ルール（Preload の `safeOn` に対応する Main の `ipcMain.on` が存在しない場合 error）を適用する
3. R-04 ルール（Main の `ipcMain.on` に対応する Preload の `safeOn` が存在しない場合 error）を適用する
4. `pnpm --filter @repo/desktop typecheck` でコンパイルエラーがないことを確認する

#### 成果物

`check-ipc-contracts.ts` の修正差分

#### 完了条件

- TypeScript コンパイルエラーが 0 件
- `ipcMain.on` と `safeOn` の対応関係が正確に照合される

### Phase 3: テスト追加

#### 目的

R-01/R-04 ルールが `ipcMain.on` パターンでも機能することを確認するテストを追加する。

#### 手順

1. `ipcMain.on` のみ存在・`safeOn` なし → R-04 違反検出のテストを追加する
2. `safeOn` のみ存在・`ipcMain.on` なし → R-01 違反検出のテストを追加する
3. `ipcMain.on` と `safeOn` 両方存在 → 違反なしのテストを追加する
4. 既存テストが全件 PASS することを確認する

#### 成果物

追加テストコード

#### 完了条件

- 既存テスト全件 PASS
- 新規テスト 3 件が PASS

### Phase 4: 品質検証

#### 目的

Lint・型チェック・全テストが通ることを確認する。

#### 手順

1. `pnpm --filter @repo/desktop lint` を実行する
2. `pnpm --filter @repo/desktop typecheck` を実行する
3. `pnpm --filter @repo/desktop test` を実行する

#### 成果物

各コマンドの実行ログ

#### 完了条件

- Lint エラー 0 件・型エラー 0 件・テスト全件 PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ipcMain.on` と `safeOn` の対応関係が正確に照合される
- [ ] R-01 ルールが `ipcMain.on` パターンにも適用される
- [ ] R-04 ルールが `ipcMain.on` パターンにも適用される

### 品質要件

- [ ] 既存テストが回帰しない
- [ ] R-01/R-04 の `ipcMain.on` パターンに対応した新規テストが追加されている
- [ ] Lint・型チェックが全件 PASS

### ドキュメント要件

- [ ] Phase 12 完了時に `ipc-contract-checklist.md` の将来拡張セクションを「対応済み」に更新する

---

## 6. 検証方法

### テストケース

1. `ipcMain.on("channel:foo", ...)` のみ存在し `safeOn` に `channel:foo` がない → R-04 違反が 1 件検出される
2. `safeOn("channel:bar", ...)` のみ存在し `ipcMain.on` に `channel:bar` がない → R-01 違反が 1 件検出される
3. `ipcMain.on("channel:baz", ...)` と `safeOn("channel:baz", ...)` が両方存在 → 違反 0 件

### 検証手順

```bash
# 1. テスト実行（ipcMain.on 関連）
pnpm --filter @repo/desktop test -- --grep "ipcMain.on"

# 2. スクリプト実行して ipcMain.on 照合結果を確認
node apps/desktop/scripts/check-ipc-contracts.ts 2>&1 | grep -E "R-01|R-04|ipcMain\.on"

# 3. 全テスト実行
pnpm --filter @repo/desktop test
```

---

## 7. リスクと対策

| リスク                                                                                  | 影響度 | 発生確率 | 対策                                                                        |
| --------------------------------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------- |
| `ipcMain.on` の一部チャンネルがエラー通知専用など意図的に非対称な場合に偽陽性が発生する | 中     | 中       | ホワイトリスト機能を設けて既知の非対称チャンネルを除外できるようにする      |
| 既存テストの回帰                                                                        | 高     | 低       | Phase 4 で全テスト実行を必須とする                                          |
| P5（リスナー二重登録）との干渉                                                          | 低     | 低       | `ipcMain.on` 照合ロジックは `ipcMain.handle` 照合ロジックと分離して実装する |

---

## 8. 参照情報

### 関連ドキュメント

- [`ipc-contract-checklist.md` 将来拡張セクション](../../../.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md)
- [`task-workflow-backlog.md`](../../../.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md)
- 関連既知の落とし穴: [P5（リスナー二重登録）](../../../.claude/rules/06-known-pitfalls.md#p5), [P44](../../../.claude/rules/06-known-pitfalls.md#p44), [P45](../../../.claude/rules/06-known-pitfalls.md#p45)

### 参考資料

- 親タスク: `docs/30-workflows/UT-TASK06-007-ipc-contract-drift-auto-detect/`
- 先行タスク: `docs/30-workflows/unassigned-task/UT-TASK06-007-EXT-001-tuple-array-handler-extraction.md`

---

## 10. 実装時の苦戦ポイント（親タスク UT-TASK06-007 から抽出）

以下は親タスク UT-TASK06-007 の実装過程で遭遇した苦戦ポイントであり、本タスクの実装時に同様の課題に直面する可能性が高い。

### 10.1 ipcMain.handle と ipcMain.on の引数パターン差異

**問題**: `ipcMain.handle` は request-response パターン（`(event, args) => result`）だが、`ipcMain.on` は one-way パターン（`(event, ...args) => void`）であり、引数の分類ロジック（`classifyHandlerArgPattern`）がそのまま適用できない。特に `ipcMain.on` では可変長引数が使われることが多く、R-02（セマンティクスチェック）の精度に影響する。

**教訓**: `classifyHandlerArgPattern` を `ipcMain.on` 用に拡張する際、可変長引数 `(...args)` のパターンを `"variadic"` として新たに分類する必要がある。既存の4分類（`object | primitive | none | unknown`）では不十分。

**対策**: `argPattern` の型定義を `"object" | "primitive" | "none" | "unknown" | "variadic"` に拡張し、`ipcMain.on` 固有のパターンに対応する。

### 10.2 safeOn のリスナー登録/解除ライフサイクル追跡

**問題**: `safeOn` で登録されたリスナーは `removeListener` / `removeAllListeners` で解除される場合があるが、現在のスクリプトはリスナーの登録のみを追跡し、解除を追跡しない。解除されたリスナーが R-01 チェックの対象に含まれると偽陽性が発生する。

**教訓**: リスナーのライフサイクルを追跡するには `ListenerEntry` 型に `isActive: boolean` フラグを追加し、`removeListener` / `removeAllListeners` の呼び出しを検出して状態を更新するロジックが必要。ただし、静的解析でのライフサイクル追跡は条件分岐や動的な登録/解除パターンでは不完全になる。

**対策**: 第1フェーズでは登録/解除の「存在」のみを追跡し、条件分岐内のライフサイクル追跡は将来課題とする。`--ignore-lifecycle` CLIオプションでライフサイクル追跡を無効化できるようにする。

### 10.3 matchAndValidate の4ルール適用ロジック拡張（130行問題）

**問題**: `matchAndValidate` 関数は現在130行で4つのルール（R-01~R-04）を適用している。`ipcMain.on` / `safeOn` の照合ロジックを追加すると、さらに50-70行の増加が見込まれ、200行を超える単一関数になるリスクがある。

**教訓**: Phase 8 リファクタリングレポートで「OCP準拠: 新規ルール追加は matchAndValidate 内に case 追加で対応可能」と記録されたが、`ipcMain.on` 対応はルール追加というより照合対象の拡張であり、case 追加だけでは不十分。

**対策**: `matchAndValidate` を `matchHandleEntries()` と `matchOnEntries()` に分割し、共通ロジックを `matchEntries(handlers, preloads, mode: "handle" | "on")` として抽出する。

### 10.4 worktree環境でのesbuildプラットフォーム不一致（P7亜種）

**問題**: worktree環境では `node_modules` がシンボリックリンクで共有されるため、`vitest run` 実行時に `esbuild-darwin-arm64` の解決に失敗する場合がある。

**教訓**: テスト実行は `pnpm tsx` 経由の直接実行を第一手段とする。`vitest` を使う場合は `--pool=forks` オプションを付与する。

**対策**: テスト追加時は `pnpm tsx apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` での実行を先に確認すること。

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
UT-TASK06-007 Phase 2 スコープ外定義:
ipcMain.on パターン（イベントリスナー）と safeOn の対応関係検証は
UT-TASK06-007 のスコープ外として切り出す。
現状は ipcMain.on の検出は行っているが safeOn との照合精度が低い。
```

### 補足事項

- タプル配列パターンの抽出は UT-TASK06-007-EXT-001 のスコープ
- `IPC_CHANNELS` 以外の定数オブジェクト対応は UT-TASK06-007-EXT-002 のスコープ
- `ipcMain.on` は one-way イベント、`ipcMain.handle` は request-response。照合ロジックは分離して実装すること
