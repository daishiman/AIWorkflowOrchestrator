# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 11                     |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

> **テスト種別**: NON_VISUAL（IPC 配線タスク、UI 変更なし）

## 目的

DI 配線変更が Electron アプリの起動シーケンスに影響しないこと、および SkillCreator 機能が正常に動作することを手動で確認する。

## 実行タスク

### Task 1: Electron アプリ起動確認

```bash
cd apps/desktop && pnpm dev
```

以下を確認する:

| 確認項目                                                              | 確認方法                                    | 結果 |
| --------------------------------------------------------------------- | ------------------------------------------- | ---- |
| アプリが正常に起動すること                                            | メインウィンドウが表示される                | -    |
| コンソールに SkillExecutor 関連の warn が出ていないこと（出ても許容） | DevTools > Console を確認                   | -    |
| LLM adapter not available の warn が API キー未設定時に出ること       | DevTools > Console で warn メッセージを確認 | -    |

### Task 2: IPC ハンドラ登録確認

DevTools の Console で以下のコマンドを実行し、IPC ハンドラが登録されていることを確認する:

```javascript
// skill-creator:plan ハンドラの存在確認（Renderer 側から呼び出し可能であること）
window.electronAPI?.skillCreator?.plan?.("test spec");
```

応答の形式を確認する:

- API キー設定済みの場合: LLM 応答を含むオブジェクト
- API キー未設定の場合: Graceful Degradation のスタブ応答（`{ planId: "plan-...", suggestions: [] }` 形式）

> **IIFE 登録タイミング確認**: `registerSkillCreatorHandlers` 内で IIFE パターン（`void (async () => { ... })()`）を採用しているため、`llmAdapter` の取得は fire-and-forget で非同期に行われる。上記コマンドが `undefined` や `TypeError` を返さず正常な応答を返すことで、ハンドラ登録が完了していることを確認できる。

### Task 3: CLI 環境での代替確認

CLI 環境（Electron アプリ起動不可能な場合）では、以下のテスト実行で間接的に動作確認する:

```bash
cd apps/desktop && pnpm vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers --reporter=verbose
```

テスト名と結果を一覧表示し、全件 PASS を確認する。

## 参照資料

- Phase 5 実装（`phase-05-implementation.md`）
- `.claude/rules/06-known-pitfalls.md` P53（CLI 環境でのスクリーンショット取得制約）

## 統合テスト連携

- 本 Phase の手動テスト結果は、Phase 9 の品質検証テスト（223件全PASS）と組み合わせて IPC 配線の動作を確認する
- IIFE パターンの非同期初期化完了後にハンドラが正常応答することを、Phase 4 の既存テストスイートで間接検証済み

## 多角的チェック観点

| 観点           | チェック内容                                             | 結果 |
| -------------- | -------------------------------------------------------- | ---- |
| セキュリティ   | APIキー・トークンがログに露出しないこと                  | -    |
| パフォーマンス | IIFE非同期初期化がBrowserWindow表示前に完了すること      | -    |
| 互換性         | 既存のskill-creator:\*ハンドラ応答形式が維持されること   | -    |
| エラー耐性     | LLMAdapter取得失敗時にGraceful Degradationが機能すること | -    |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを管理すること:

- [ ] Task 1: IPC通信成功テスト実行
- [ ] Task 2: Graceful Degradationテスト実行
- [ ] Task 3: CLI代替確認（verbose テスト出力）

## 成果物

- 手動テスト結果（本仕様書に結果テーブルを記録）

## 完了条件

- [ ] Electron アプリ起動確認を実施した（または CLI 代替確認を実施した）
- [ ] IPC ハンドラ登録を確認した（または verbose テスト出力で確認した）
- [ ] Graceful Degradation が API キー未設定環境で機能することを確認した

## タスク100%実行確認【必須】

- [ ] Task 1（Electron アプリ起動確認 または CLI 代替確認）を実施した
- [ ] Task 2（IPC ハンドラ登録確認）を実施した
- [ ] Task 3（CLI 環境での代替確認）が必要な場合に実施した

## 次のPhase

Phase 12: ドキュメント
