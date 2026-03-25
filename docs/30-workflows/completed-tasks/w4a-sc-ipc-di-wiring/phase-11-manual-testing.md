# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 11                     |
| 機能名   | Skill Creator DI 配線  |
| タスクID | UT-SC-05-IPC-DI-WIRING |
| 作成日   | 2026-03-23             |

## 目的

DI 配線変更が Electron アプリの起動シーケンスに影響しないこと、および SkillCreator 機能が正常に動作することを手動で確認する。

## 背景

Phase 10 の最終レビューをPASSした後、Electron アプリの起動確認とIPC ハンドラの動作確認を手動（またはCLI代替）で実施する。

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

## 成果物

- 手動テスト結果（本仕様書に結果テーブルを記録）

## 完了条件

- [ ] Electron アプリ起動確認を実施した（または CLI 代替確認を実施した）
- [ ] IPC ハンドラ登録を確認した（または verbose テスト出力で確認した）
- [ ] Graceful Degradation が API キー未設定環境で機能することを確認した

## 統合テスト連携

Electron アプリ起動確認・IPC ハンドラ登録確認（または CLI 代替テスト）。手動統合テスト（UI/API接続）を確認する。

本タスクは IPC/API 変更のみ（UI 変更なし）のため、スクリーンショットは「推奨」レベル。DevTools の Console でハンドラ登録を確認する方式を採用。

## 多角的チェック観点

| 観点           | 適用                                       | 仕様参照先                                   |
| -------------- | ------------------------------------------ | -------------------------------------------- |
| IPC通信        | IPC ハンドラの登録確認・レスポンス確認     | `aiworkflow-requirements: api-*.md`          |
| アーキテクチャ | Electron Main Process の起動シーケンス確認 | `aiworkflow-requirements: architecture-*.md` |

### スクリーンショット適用判断

| タスク種別      | スクリーンショット | 判断基準                         |
| --------------- | ------------------ | -------------------------------- |
| IPC/API変更のみ | 推奨               | DevTools動作確認エビデンスとして |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. Electron アプリ起動確認（Task 1）
2. IPC ハンドラ登録確認（Task 2）
3. CLI 環境での代替確認（Task 3 - Electron起動不可時）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/w4a-sc-ipc-di-wiring --phase 11
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

| タスク                          | 結果 | 備考 |
| ------------------------------- | ---- | ---- |
| Task 1: Electron アプリ起動確認 | -    | -    |
| Task 2: IPC ハンドラ登録確認    | -    | -    |
| Task 3: CLI 環境での代替確認    | -    | -    |

### 発見事項

- 良かった点: -
- 問題点: -
- 改善提案: -

### 次Phaseへの引き継ぎ事項

- -

## 次のPhase

Phase 12: ドキュメント
