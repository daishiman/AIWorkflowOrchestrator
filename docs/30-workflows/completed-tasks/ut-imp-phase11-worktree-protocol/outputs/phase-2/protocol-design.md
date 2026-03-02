# Phase 2: テスト3層分類プロトコル詳細設計

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| タスクID  | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001 |
| Phase     | 2                                    |
| 作成日    | 2026-03-01                           |
| 依存Phase | Phase 1（要件定義）                  |

## プロトコル概要

Git Worktree環境でPhase 11（手動テスト）を実行する際のテスト3層分類プロトコルを定義する。Worktree環境ではElectronアプリの直接起動が困難なため、テストを実行可能環境ごとに3層に分類し、各層の実行コマンド・判定基準・判定フローを明示する。

## Layer 1: 自動テスト検証（Worktree実行可能）

Layer 1はWorktree環境で実行可能なVitestユニットテストと統合テストを対象とする。Electronプロセスの起動を必要とせず、モックを活用してMain Processのロジックを直接検証する。

### Layer 1 テスト項目

| #    | テスト種別               | 実行コマンド                                                          | 判定基準                     | 対応要件   |
| ---- | ------------------------ | --------------------------------------------------------------------- | ---------------------------- | ---------- |
| L1-1 | ユニットテスト全件実行   | `cd apps/desktop && pnpm test:run`                                    | 全テストPASS（FAILゼロ件）   | FR-1       |
| L1-2 | IPC通信テスト            | `cd apps/desktop && pnpm vitest run src/main/ipc/`                    | IPC関連テスト全件PASS        | FR-2, FR-3 |
| L1-3 | Zustand Store統合テスト  | `cd apps/desktop && pnpm vitest run src/renderer/store/`              | Store関連テスト全件PASS      | FR-1       |
| L1-4 | エラーハンドリングテスト | `cd apps/desktop && pnpm vitest run --grep "error\|validation\|fail"` | エラー系テスト全件PASS       | FR-2, FR-3 |
| L1-5 | カバレッジ確認           | `cd apps/desktop && pnpm test:run -- --coverage`                      | Line 80%以上、Branch 60%以上 | NFR-1      |

### Layer 1 合格判定

| 条件                                                   | 判定 | 次のアクション                              |
| ------------------------------------------------------ | ---- | ------------------------------------------- |
| L1-1〜L1-5の全件PASS                                   | PASS | Layer 2 へ進む                              |
| L1-1〜L1-4のいずれか1件でもFAIL                        | FAIL | Phase 11 FAIL → Phase 5 へ戻る              |
| L1-5のカバレッジ未達（Line < 80% または Branch < 60%） | FAIL | Phase 11 FAIL → Phase 6（テスト拡充）へ戻る |

## Layer 2: 静的コード検証（Worktree実行可能）

Layer 2はWorktree環境で実行可能な静的解析ツールとコードレビューを対象とする。TypeScriptコンパイラ・ESLintは自動実行、IPC契約整合性・セキュリティ設定・ARIA属性はコードレビューで確認する。

### Layer 2 検証項目

| #    | 検証項目                      | 実行コマンド / 手順                                                                                         | 判定基準                                                                   | 対応要件   |
| ---- | ----------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| L2-1 | TypeScript型チェック          | `pnpm typecheck`                                                                                            | エラーゼロで終了（exitcode 0）                                             | NFR-1      |
| L2-2 | ESLint静的解析                | `pnpm lint`                                                                                                 | エラーゼロで終了（Warningは許容）                                          | NFR-1      |
| L2-3 | IPC契約整合性検証             | `channels.ts` のチャネル定数一覧と `ipcMain.handle()` / `ipcMain.on()` 登録一覧をコードレビューで比較       | 全チャネルが `IPC_CHANNELS` 定数経由で参照され、ハードコード文字列がゼロ件 | FR-2, FR-3 |
| L2-4 | セキュリティ設定レビュー      | BrowserWindow生成コードで `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` を確認        | 3設定が全て正しい値であること                                              | NFR-1      |
| L2-5 | ARIA属性存在確認              | 新規/変更コンポーネントの `role`, `aria-label`, `aria-modal` 属性をコードレビューで確認                     | 対話的要素に `role` または `aria-label` が付与されていること               | NFR-1      |
| L2-6 | Preload APIホワイトリスト確認 | `preload.ts` の `contextBridge.exposeInMainWorld` で公開されたAPIが `IPC_CHANNELS` 定数を使用しているか確認 | ハードコード文字列によるチャネル指定がゼロ件                               | FR-4       |

### Layer 2 合格判定

| 条件                              | 判定      | 次のアクション                                |
| --------------------------------- | --------- | --------------------------------------------- |
| L2-1〜L2-6の全件PASS              | PASS      | Layer 3 記録へ進む                            |
| L2-1（型チェック）FAIL            | FAIL      | Phase 11 FAIL → Phase 5 へ戻る                |
| L2-2（ESLint）FAIL                | FAIL      | Phase 11 FAIL → Phase 5 へ戻る                |
| L2-3（IPC契約）FAIL               | FAIL      | Phase 11 FAIL → Phase 5 へ戻る（P44/P45対策） |
| L2-4（セキュリティ設定）FAIL      | FAIL      | Phase 11 FAIL → Phase 5 へ戻る                |
| L2-5（ARIA属性）FAIL              | MINOR指摘 | 未タスク仕様書に変換後、Phase 12 へ進む       |
| L2-6（Preloadホワイトリスト）FAIL | FAIL      | Phase 11 FAIL → Phase 5 へ戻る                |

## Layer 3: UI/E2Eテスト（CI/メインリポジトリのみ）

Layer 3はWorktree環境では実行しない。Electronプロセスの起動を必要とするため、CI環境（ubuntu-latest + xvfb-run）またはメインリポジトリのローカル環境でのみ実行する。Worktree環境では `deferred-tests.md` に記録して追跡する。

### Layer 3 テスト項目

| #    | テスト項目                   | 実行環境                 | 検証内容                                                                                | 対応要件   |
| ---- | ---------------------------- | ------------------------ | --------------------------------------------------------------------------------------- | ---------- |
| L3-1 | Electronアプリ起動テスト     | CI（xvfb-run）           | `_electron.launch()` でアプリが起動し、メインウィンドウが表示される（domcontentloaded） | FR-2, FR-3 |
| L3-2 | IPC skill:remove E2Eテスト   | CI（xvfb-run）           | TC-R01〜TC-R04の4テストケース（正常系1件・異常系3件）が全てPASS                         | FR-2       |
| L3-3 | IPC skill:import E2Eテスト   | CI（xvfb-run）           | TC-I01〜TC-I04の4テストケース（正常系1件・異常系3件）が全てPASS                         | FR-3       |
| L3-4 | UIインタラクション操作テスト | メインリポジトリ（手動） | クリック、入力、ナビゲーション操作の手動確認                                            | FR-6       |

### Layer 3 deferred-tests.md 記録フォーマット

Worktree環境でLayer 3テストをスキップする場合、以下のフォーマットで `outputs/phase-11/deferred-tests.md` に記録する。

```markdown
| ID     | テスト名                     | カテゴリ | スキップ理由                  | 実行予定環境             | 期限                  | ステータス |
| ------ | ---------------------------- | -------- | ----------------------------- | ------------------------ | --------------------- | ---------- |
| DT-001 | Electronアプリ起動テスト     | E2E      | Worktree環境/Electron起動不可 | CI                       | PRマージ後3営業日以内 | 未実施     |
| DT-002 | IPC skill:remove E2Eテスト   | E2E      | Worktree環境/Electron起動不可 | CI                       | PRマージ後3営業日以内 | 未実施     |
| DT-003 | IPC skill:import E2Eテスト   | E2E      | Worktree環境/Electron起動不可 | CI                       | PRマージ後3営業日以内 | 未実施     |
| DT-004 | UIインタラクション操作テスト | 手動     | Worktree環境/Electron起動不可 | メインリポジトリ（手動） | PRマージ後5営業日以内 | 未実施     |
```

## 判定フロー

### 全体判定フロー（条件分岐付き）

```
Phase 11 開始
  |
  v
[判断] Worktree環境かどうか確認
  TOPLEVEL=$(git rev-parse --show-toplevel)
  echo "$TOPLEVEL" | grep -q ".worktrees/"
  |
  +-- YES（Worktree環境）-----------> 以下のLayer 1-3分離フローへ
  |
  +-- NO（メインリポジトリ）-------> 通常Phase 11フロー（本プロトコル対象外）
  |
  v [Worktree環境の場合]

=== Layer 1 実行 ===
  |
  v
L1-1: cd apps/desktop && pnpm test:run
  |
  +-- FAIL（1件以上） -> Phase 11 FAIL
  |                      -> Phase 5（実装）へ戻る
  |
  +-- 全PASS -> 次へ
  |
  v
L1-2: cd apps/desktop && pnpm vitest run src/main/ipc/
  |
  +-- FAIL -> Phase 11 FAIL -> Phase 5 へ戻る
  +-- 全PASS -> 次へ
  |
  v
L1-3: cd apps/desktop && pnpm vitest run src/renderer/store/
  |
  +-- FAIL -> Phase 11 FAIL -> Phase 5 へ戻る
  +-- 全PASS -> 次へ
  |
  v
L1-4: cd apps/desktop && pnpm vitest run --grep "error|validation|fail"
  |
  +-- FAIL -> Phase 11 FAIL -> Phase 5 へ戻る
  +-- 全PASS -> 次へ
  |
  v
L1-5: cd apps/desktop && pnpm test:run -- --coverage
  |
  +-- Line < 80% または Branch < 60% -> Phase 11 FAIL -> Phase 6 へ戻る
  +-- 基準達成 -> Layer 1 PASS

=== Layer 2 実行 ===
  |
  v
L2-1: pnpm typecheck
  |
  +-- FAIL -> Phase 11 FAIL -> Phase 5 へ戻る
  +-- 全PASS -> 次へ
  |
  v
L2-2: pnpm lint
  |
  +-- FAIL -> Phase 11 FAIL -> Phase 5 へ戻る
  +-- 全PASS（Warningは許容）-> 次へ
  |
  v
L2-3: IPC契約整合性確認（コードレビュー）
  |
  +-- ハードコード文字列を発見 -> Phase 11 FAIL -> Phase 5 へ戻る
  +-- 全チャネルがIPC_CHANNELS定数経由 -> 次へ
  |
  v
L2-4: BrowserWindowセキュリティ設定確認（コードレビュー）
  |
  +-- FAIL -> Phase 11 FAIL -> Phase 5 へ戻る
  +-- 3設定全て正しい値 -> 次へ
  |
  v
L2-5: ARIA属性存在確認（コードレビュー）
  |
  +-- FAIL -> MINOR指摘 -> 未タスク仕様書に変換 -> 次へ（ブロックしない）
  +-- PASS -> 次へ
  |
  v
L2-6: Preload APIホワイトリスト確認（コードレビュー）
  |
  +-- FAIL -> Phase 11 FAIL -> Phase 5 へ戻る
  +-- PASS -> Layer 2 PASS

=== Layer 3 記録 ===
  |
  v
outputs/phase-11/deferred-tests.md を作成
  |
  v
Layer 3全テスト項目（L3-1〜L3-4）を deferred-tests.md に記録
  ステータス: 「未実施」
  実行予定環境: CI / メインリポジトリ
  |
  v
Phase 11 判定: 条件付きPASS
  |
  v
Phase 12 へ進む

=== CI実行（PRマージ後） ===
  |
  v
e2e-desktopジョブが自動実行
  |
  +-- 全PASS -> deferred-tests.md のステータスを「PASS」に更新
  |
  +-- FAIL -> 修正タスクを起票 -> deferred-tests.md のステータスを「FAIL」に更新
```

### 判定基準テーブル（Layer 1/2結果の組み合わせ）

| Layer 1結果        | Layer 2結果                 | Phase 11判定 | 次のアクション                                      |
| ------------------ | --------------------------- | ------------ | --------------------------------------------------- |
| 全PASS             | 全PASS（L2-5のMINORを除く） | 条件付きPASS | Layer 3をdeferred-tests.mdに記録してPhase 12へ      |
| 全PASS             | L2-5 MINORのみ              | 条件付きPASS | L2-5を未タスク仕様書に変換、Layer 3記録後Phase 12へ |
| FAILあり           | -                           | FAIL         | Phase 5（実装）へ戻る                               |
| 全PASS             | L2-1〜L2-4/L2-6のFAIL       | FAIL         | Phase 5（実装）へ戻る                               |
| L1-5カバレッジ未達 | -                           | FAIL         | Phase 6（テスト拡充）へ戻る                         |

## Worktree環境判定コマンド

```bash
# Worktree環境かどうかを判定するbashスクリプト
TOPLEVEL=$(git rev-parse --show-toplevel)
if echo "$TOPLEVEL" | grep -q ".worktrees/"; then
  echo "Worktree環境: Layer 1-3分離フローに従う"
  echo "WORKTREE_ENV=true"
else
  echo "メインリポジトリ: 通常のPhase 11フローに従う"
  echo "WORKTREE_ENV=false"
fi
```

## IPC契約整合性確認チェックリスト（L2-3詳細）

L2-3のコードレビューでは以下のチェックリストを用いる。

```markdown
### IPC契約整合性チェックリスト（P44/P45対策）

- [ ] channels.ts の IPC_CHANNELS 定数に全チャネル名が定義されている
- [ ] ipcMain.handle() の全登録で IPC_CHANNELS 定数が使用されている（ハードコード文字列なし）
- [ ] ipcMain.on() の全登録で IPC_CHANNELS 定数が使用されている（ハードコード文字列なし）
- [ ] skill:remove ハンドラの引数が string 型（skillName）である（P44対策）
- [ ] skill:import ハンドラの引数が string 型（skillName）である（P44対策）
- [ ] ハンドラ引数名が実際の値のセマンティクスと一致している（P45対策）
- [ ] P42準拠3段バリデーションが全ハンドラに実装されている（typeof + === '' + .trim() === ''）
- [ ] preload.ts で contextBridge.exposeInMainWorld に公開されたAPIが IPC_CHANNELS 定数を使用している
```

## BrowserWindowセキュリティ設定チェックリスト（L2-4詳細）

L2-4のコードレビューでは以下のチェックリストを用いる。

```markdown
### BrowserWindowセキュリティ設定チェックリスト（04-electron-security.md準拠）

- [ ] contextIsolation: true が設定されている（V8コンテキスト分離）
- [ ] nodeIntegration: false が設定されている（RendererからNode.js遮断）
- [ ] sandbox: true が設定されている（Chromiumサンドボックス）
- [ ] 上記3設定が開発時も含めて変更されていない
```

## 完了条件

- [x] Layer 1の5テスト項目（L1-1〜L1-5）の実行コマンド・判定基準が定義されている
- [x] Layer 2の6検証項目（L2-1〜L2-6）の実行コマンド/手順・判定基準が定義されている
- [x] Layer 3の4テスト項目（L3-1〜L3-4）の実行環境・検証内容が定義されている
- [x] deferred-tests.md 記録フォーマットが定義されている
- [x] 全体判定フロー（Layer 1 -> Layer 2 -> Layer 3記録 -> CI実行）が条件分岐付きで定義されている
- [x] Layer 1/2結果の組み合わせと判定結果のテーブルが定義されている
- [x] IPC契約整合性確認チェックリスト（L2-3詳細）が定義されている
- [x] BrowserWindowセキュリティ設定チェックリスト（L2-4詳細）が定義されている
