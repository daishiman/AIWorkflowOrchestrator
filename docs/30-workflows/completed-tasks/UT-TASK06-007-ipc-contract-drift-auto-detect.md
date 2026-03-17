# IPC 契約ドリフト自動検出スクリプト（Phase 9 統合）- タスク指示書

## メタ情報

| 項目         | 内容                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| タスクID     | UT-TASK06-007                                                                  |
| タスク名     | IPC 契約ドリフト自動検出スクリプト（Phase 9 統合）                             |
| 分類         | 品質改善・自動化                                                               |
| 対象機能     | IPC 契約整合性検証（全機能共通基盤）                                           |
| 優先度       | 高                                                                             |
| 見積もり規模 | 中規模                                                                         |
| ステータス   | 未実施                                                                         |
| 発見元       | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 Phase 12 skill-feedback-report T-02 |
| 発見日       | 2026-03-17                                                                     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 で発見された GAP/DRIFT の多くが IPC 契約のドリフト（P44/P45 パターン）に起因している。
Main Process ハンドラの引数型と Preload API の呼び出しパターンの不整合が人手確認に依存しており、コンパイル時に検出されないランタイムエラーの温床となっている。

現状では `ipc-contract-checklist.md` は IPC 修正タスクにのみ適用されるが、一般的なタスクでは IPC ドリフトが検出されない。

### 1.2 問題点・課題

- P44（skill:import/remove インターフェース不整合）: ハンドラがオブジェクト形式を期待するのに Preload が文字列を渡す不整合がランタイムまで検出されなかった。
- P45（IPC 引数命名の契約ドリフト）: `skillId` という引数名が実際にはスキル名を渡していたが、命名とセマンティクスの乖離はコンパイルエラーにならない。
- P60（IPC テスト応答形式の不一致）: Phase 4 と Phase 5 の間でレスポンス wrapper 形式の合意がなく、テスト全件失敗が Phase 5 まで検出されなかった。
- AI_CHECK_CONNECTION の廃止状況が「設計意図」と「コード実体」で乖離し、Phase 12 の二重記述問題が発生した。

### 1.3 放置した場合の影響

- P44/P45 パターンの再発。ランタイムエラーがコンパイル時に検出されない。
- IPC 契約の暗黙的な合意が増加し、新規参加者がインターフェース不整合を判断できない。
- Phase 9 品質検証でドリフトが検出されず、Phase 10/11 まで問題が先送りされる。

## 2. 何を達成するか（What）

### 2.1 目的

Main Process ハンドラの引数型と Preload API の呼び出しパターンを自動照合し、IPC 契約ドリフトを Phase 9 品質検証の段階で検出できるようにする。

### 2.2 最終ゴール

- `scripts/check-ipc-contracts.ts` スクリプトが作成される。
- Phase 9 品質検証チェックリストに `pnpm tsx scripts/check-ipc-contracts.ts` 実行ステップが追加される。
- CI に組み込み可能な exit code（不一致があれば非ゼロ）を返す設計になっている。

### 2.3 スコープ

#### 含むもの

- `scripts/check-ipc-contracts.ts` の新規作成。
- Main Process ハンドラ（`ipcMain.handle`）の引数型定義の AST/grep による抽出。
- Preload API（`safeInvoke`）の呼び出しパターン抽出。
- チャンネル名・引数形式の照合とレポート出力。
- Phase 9 テンプレートへの統合ステップ追加（`phase-templates.md` 更新）。

#### 含まないもの

- 検出された不整合の自動修正（修正は人手で行う）。
- AST パーサーの独自実装（grep ベースのパターンマッチで代替可能な範囲で実装）。
- Main ハンドラ以外の IPC パターン（`ipcMain.on` 等）の検証（第1フェーズのスコープ外）。

### 2.4 成果物

- `apps/desktop/scripts/check-ipc-contracts.ts`（または `packages/shared/scripts/`）
- 更新済み Phase 9 テンプレート（`phase-templates.md` の品質検証チェックリスト節）
- スクリプト動作確認レポート（既知の P44/P45 パターンが検出されることを確認）

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 18 以上（`tsx` または `ts-node` 実行可能）。
- `apps/desktop/src/main/handlers/` にハンドラが配置されていること。
- `apps/desktop/src/preload/` に Preload API が配置されていること。
- `apps/desktop/src/shared/ipc-channels.ts`（または同等ファイル）にチャンネル定数が定義されていること。

### 3.2 依存タスク

- TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001（完了）
- UT-TASK06-003（IPC ハンドラ登録漏れ防止）: ハンドラ一覧の管理パターンが参照可能

### 3.3 必要な知識

- Electron IPC パターン（`ipcMain.handle` / `contextBridge.exposeInMainWorld` / `safeInvoke`）
- P44（skill:import/remove インターフェース不整合）
- P45（IPC 引数命名の契約ドリフト）
- P60（IPC テスト応答形式の不一致）
- P42（文字列引数の `.trim()` バリデーション漏れ）: 検出ルールの追加対象

### 3.4 推奨アプローチ

1. **抽出フェーズ**: `rg -n "ipcMain\.handle" apps/desktop/src/main` でハンドラ定義を抽出し、チャンネル名と引数型を一覧化する。
2. **照合フェーズ**: `rg -n "safeInvoke" apps/desktop/src/preload` で Preload 側の呼び出し一覧を抽出し、チャンネル名でジョインして引数形式を比較する。
3. **ルール定義**: 以下の検出ルールを実装する:
   - チャンネル名の不一致（Preload にあって Main にないもの、逆も同様）
   - 引数がオブジェクト形式（`{ key: value }`）vs プリミティブ形式の不一致
   - 引数名のセマンティクス乖離（`skillId` に名前文字列が渡されているパターン）
4. **レポート出力**: JSON または Markdown 形式で不一致箇所を出力し、不一致があれば `process.exit(1)` を返す。
5. **Phase 9 統合**: `phase-templates.md` の Phase 9 チェックリストに実行ステップを追加する。

### 3.5 苦戦箇所の記録（TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 経験から）

- **worktree でのシステム仕様書更新先送り（P57）**: `.claude/skills/` の更新を「PR 時に」と先送りしがち。Phase 12 完了前に実更新することを徹底する。
- **サブエージェントのインポートパス誤り**: `@/main/...` パスエイリアスをサブエージェントが解決できず import が壊れた。サブエージェント向けには絶対パスを指定する。
- **IPC の存廃判断は「コード実体 > 設計意図」**: `AI_CHECK_CONNECTION` の廃止状況が設計文書と実装で乖離した。`check-ipc-contracts.ts` の自動検証でこの問題を根本解決できる。

## 4. 実行手順

1. 既存ハンドラパターンを調査する:
   ```
   rg -n "ipcMain\.handle" apps/desktop/src/main/handlers/
   rg -n "safeInvoke" apps/desktop/src/preload/
   rg -n "IPC_CHANNELS\." apps/desktop/src/shared/
   ```
2. P44 の具体例をテストケースとして用意し、スクリプトが検出できることを確認する。
3. `scripts/check-ipc-contracts.ts` を実装する（200行以内を目安）。
4. `pnpm tsx scripts/check-ipc-contracts.ts` で動作確認し、既存ドリフトがあれば一覧表示されることを確認する。
5. `phase-templates.md` の Phase 9 チェックリストに以下を追加する:
   ```
   - [ ] `pnpm tsx scripts/check-ipc-contracts.ts` が exit 0 で完了する
   ```
6. Phase 12 チェックリストに従い、LOGS.md（2ファイル）・SKILL.md・topic-map.md を更新する。

## 5. 完了条件チェックリスト

- [ ] `scripts/check-ipc-contracts.ts` が作成されている
- [ ] Main ハンドラ引数型と Preload 呼び出しパターンが自動照合される
- [ ] 不一致があれば exit 1、整合していれば exit 0 を返す
- [ ] P44 パターン（オブジェクト vs プリミティブ不一致）が検出される
- [ ] P45 パターン（引数命名のセマンティクス乖離）が検出できる設計になっている
- [ ] `phase-templates.md` の Phase 9 チェックリストに統合されている
- [ ] スクリプト動作確認レポートが成果物として存在する

## 6. 検証方法

```bash
# スクリプト単体実行
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts

# 既知のドリフトなし状態での exit code 確認
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts; echo "exit: $?"

# Phase 9 統合後のテンプレート確認
grep -n "check-ipc-contracts" .claude/skills/task-specification-creator/references/phase-templates.md
```

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                                                                     |
| -------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| grep ベースの抽出が AST より精度が低い             | 中     | 高       | false positive を抑えるルール設計と、検出ルールを段階的に追加する方針を取る                                              |
| 動的チャンネル名（文字列結合）が抽出できない       | 低     | 低       | 定数参照（`IPC_CHANNELS.XXX`）を必須とする既存ルールで予防済み                                                           |
| Phase 9 に組み込むことで実行時間が増加する         | 低     | 中       | スクリプトは 10 秒以内を目標。超過する場合は `--fast` フラグで照合ルールを限定する                                       |
| worktree 環境でパス解決が失敗する                  | 中     | 中       | スクリプト内ではプロジェクトルートからの相対パスでなく `__dirname` ベースの絶対パスを使用する                            |
| 既存ドリフトが大量に検出されて CI がブロックされる | 高     | 中       | 初回実行時は `--report-only`（exit 0）モードで既存ドリフト一覧を作成し、段階的に修正してから `--strict` モードに移行する |

## 8. 参照情報

- `.claude/rules/06-known-pitfalls.md#P44`（skill:import/remove インターフェース不整合）
- `.claude/rules/06-known-pitfalls.md#P45`（IPC 引数命名の契約ドリフト）
- `.claude/rules/06-known-pitfalls.md#P60`（IPC テスト応答形式の不一致）
- `.claude/rules/04-electron-security.md#IPC セキュリティ原則`
- `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`
- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync/`

## 9. 備考

TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 の skill-feedback-report T-02 から formalize。
IPC 契約の人手確認依存を自動化することで、P44/P45/P60 パターンの再発を予防する。
`AI_CHECK_CONNECTION` の廃止状況二重記述問題のような「設計意図 vs コード実体」の乖離も、このスクリプトが稼働することで早期検出可能になる。
