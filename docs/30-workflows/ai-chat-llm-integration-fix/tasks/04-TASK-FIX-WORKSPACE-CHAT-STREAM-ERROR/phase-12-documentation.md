# Phase 12: ドキュメント

## メタ情報

| 項目          | 値                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 12                                                                                                                    |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                                                              |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                                                  |
| 作成日        | 2026-03-20                                                                                                            |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-11-manual-test.md` |

## 目的

実装ガイド（Part 1: 中学生レベルの概念説明 + Part 2: 開発者向け詳細）、システム仕様書更新、未タスク検出を実施する。Phase 12チェックリストを全項目逐次確認する。

## 実行タスク

### Task 1: 実装ガイドの作成

#### Task 1-A: outputs/phase-12/implementation-guide.md の作成

**ファイル**: `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-12/implementation-guide.md`

---

**Part 1: 中学生でもわかる概念説明（日常のたとえ必須）**

#### エラーって何のこと？

AIとチャットしているとき、うまくいかないことがあります。たとえば：

- お店のレジで支払い方法が登録されていない（= APIキーがない）
- 電話が繋がらない（= ネットワークエラー）
- お店が混みすぎていて注文を断られた（= レート制限）

このような「うまくいかなかった理由」のことを「エラーコード」といいます。

#### 今回のエラーUX改善で何をしたの？

**改善前**: エラーが起きても「エラーが発生しました」というメッセージだけが表示されて、ユーザーはどうすればいいかわからない状態でした。

**改善後**: エラーの種類に応じて「次に何をすべきか」を示すボタンを表示します。

- APIキーがないエラー → 「設定を開く」ボタンで設定画面に案内
- ネットワークエラー → 「再試行」ボタンで同じメッセージを再送
- レート制限 → 「しばらく待ってから再試行してください」のヒント + 「再試行」ボタン

これは、迷子になった人に「次の角を右に曲がってください」と道案内するようなイメージです。

#### 3つの主要な部品

1. **エラー種別判定 (`mapLLMErrorToStreamingError`)**: エラーコードを見て「このエラーはどんなアクションが必要か」を判断する辞書のような関数
2. **エラー表示コンポーネント (`StreamingErrorDisplay`)**: 判断結果を画面に見せる部品。メッセージ・ヒント・ボタンを表示する
3. **状態管理 (`useWorkspaceChatController` の拡張)**: エラーが起きたことを記憶し、ユーザーが解決するまで覚えておく仕組み

---

**Part 2: 開発者向け実装詳細**

#### アーキテクチャ概要

```
LLM API（Main Process）
    ↓ onStreamError IPC
useWorkspaceChatController（Renderer）
    ↓ mapLLMErrorToStreamingError
    ↓ setStreamingError(state)
WorkspaceChatPanel
    ↓ streamingError prop
StreamingErrorDisplay（UI）
    ↓ onDismiss / onRetry / onOpenSettings コールバック
```

IPC層は変更なし。`onStreamError` コールバックの受信後、Renderer側のみで処理を追加した。

#### 新規実装ファイル

| ファイル                               | 責務                                                |
| -------------------------------------- | --------------------------------------------------- |
| `hooks/mapLLMErrorToStreamingError.ts` | エラーコード → `StreamingErrorState` の純粋変換関数 |
| `components/StreamingErrorDisplay.tsx` | エラー表示UIコンポーネント（Apple HIG準拠）         |

#### 既存ファイルの変更

| ファイル                              | 変更内容                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `hooks/useWorkspaceChatController.ts` | `streamingError` state追加、`retryLastMessage` / `dismissStreamingError` 追加 |
| `WorkspaceChatPanel.tsx`              | `StreamingErrorDisplay` の統合                                                |
| `types.ts`                            | `StreamingErrorState` / `StreamingErrorAction` 型追加                         |

#### 型定義

```typescript
export type StreamingErrorAction = "SETTINGS" | "RETRY" | null;

export interface StreamingErrorState {
  code: string; // エラーコード
  message: string; // ユーザー向け日本語メッセージ
  retryable: boolean; // リトライ可能か
  action: StreamingErrorAction; // UIアクション種別
  hint?: string; // RATE_LIMIT時の追加ヒント
}
```

#### 後方互換性

既存の `errorMessage: string | null` は維持。`streamingError` は新規追加のみで、既存コードへの影響なし。

---

#### Task 1-B: コンポーネントドキュメントの作成

**ファイル**: `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/component-documentation.md`

`StreamingErrorDisplay` コンポーネントの Props・使用例・スタイルバリアントを記録する。

### Task 2: システム仕様書更新（spec-update-workflow準拠）

#### Step 1-A: タスク完了記録

以下2ファイルを両方更新する（P1・P25対策: 2ファイル更新漏れ防止）:

1. `aiworkflow-requirements/LOGS.md` にタスク完了記録を追加する
2. `task-specification-creator/LOGS.md` にタスク完了記録を追加する

記録内容（両ファイル共通）:

```
| 2026-03-20 | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR | WorkspaceChat ストリーミングエラーUX改善 | 完了 | StreamingErrorDisplay実装、エラー種別UI分岐、リトライ機能追加 |
```

#### Step 1-A（続）: SKILL.md 変更履歴更新

1. `aiworkflow-requirements/SKILL.md` の変更履歴テーブルを更新する（P29対策）
2. `task-specification-creator/SKILL.md` の変更履歴テーブルを更新する

#### Step 1-B: 実装ステータス更新

該当する仕様書の実装状況テーブルを確認・更新する:

```bash
grep -rn "TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR\|StreamingErrorDisplay\|streamingError" \
  .claude/skills/aiworkflow-requirements/references/ | head -20
```

#### Step 1-C: 関連タスクテーブルの更新

```bash
grep -rn "TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR" \
  .claude/skills/aiworkflow-requirements/references/
```

関連仕様書（ui-ux-workspace-chat.md 等）に完了タスクリンクを追加する。

#### Step 1-D: topic-map.md 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

仕様書に変更があれば必ず再生成する（P2・P27対策）。

#### Step 2: システム仕様更新（該当する場合）

WorkspaceChat の UI/UX 仕様書に StreamingErrorDisplay の追加を記録する:

- `references/ui-ux-workspace-chat.md`（存在する場合）
- `references/arch-state-management.md`（`streamingError` state の追加）
- `references/error-handling.md`（WorkspaceChatのエラーハンドリングパターン追加）

#### Step 3: IPC契約検証（本タスクはIPC変更なしのためスキップ）

IPC層に変更がないことを確認済み（Phase 9, Task 4参照）。`ipc-contract-checklist.md` Phase 1-6は不要。

### Task 3: outputs/phase-12/documentation-changelog.md の作成

**ファイル**: `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-12/documentation-changelog.md`

**重要**: 全Step完了前に「完了」と記載しない（P4対策）。各Stepの実行結果を事後記録する。

記録内容:

- Step 1-A: LOGS.md 2ファイル更新結果
- Step 1-A: SKILL.md 2ファイル更新結果
- Step 1-B: 実装ステータス更新結果
- Step 1-C: 関連タスクテーブル更新結果
- Step 1-D: topic-map.md 再生成結果（コマンド実行ログ）
- Step 2: システム仕様更新結果
- Step 3: IPC変更なし確認（スキップ理由記録）

### Task 4: 未タスク検出

**ファイル**: `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-12/unassigned-task-detection.md`

0件でも必ず作成する（P3対策）。

#### 未タスク候補の検討

以下の観点で未タスクを検出する:

| 候補                 | 内容                                                       | 優先度 |
| -------------------- | ---------------------------------------------------------- | ------ |
| コントラスト比       | systemRed on error-container-background の WCAG AA 確認    | 低     |
| 自動消去タイマー     | エラーバナーを一定時間後に自動消去する機能（Task 1と統一） | 中     |
| エラーアニメーション | バナーの表示/非表示のトランジションアニメーション          | 低     |
| E2Eテスト            | Playwright を使った実際のエラー発生シナリオのE2Eテスト     | 中     |

#### 検出した未タスクの3ステップ（P3・P38対策）

検出した未タスクそれぞれに対して以下3ステップを全て実行する:

1. `docs/30-workflows/unassigned-task/` に指示書ファイルを作成する
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

#### artifacts.json の更新

```bash
# Phase 12 ステータスを更新
grep -n "phase-12\|Phase 12" \
  docs/30-workflows/ai-chat-llm-integration-fix/artifacts.json 2>/dev/null
```

## 参照資料

| ドキュメント             | パス                                                                                                                  | 参照目的                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 11 手動テスト      | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-11-manual-test.md` | 手動テスト結果確認           |
| タスク実行ルール         | `.claude/rules/05-task-execution.md`                                                                                  | Phase 12チェックリスト全項目 |
| P1/P25 LOGS.md 2ファイル | `.claude/rules/06-known-pitfalls.md`                                                                                  | 2ファイル更新漏れ防止        |
| P2/P27 topic-map再生成   | `.claude/rules/06-known-pitfalls.md`                                                                                  | 再生成トリガー判定           |
| P3/P38 未タスク3ステップ | `.claude/rules/06-known-pitfalls.md`                                                                                  | 指示書 + 登録 + リンク       |
| P4 早期完了記載禁止      | `.claude/rules/06-known-pitfalls.md`                                                                                  | changelog事後記録            |
| P29 SKILL.md更新漏れ     | `.claude/rules/06-known-pitfalls.md`                                                                                  | SKILL.md変更履歴必須         |

## 実行手順

1. **Task 1-A**: `outputs/phase-12/implementation-guide.md` Part 1（中学生レベル）と Part 2（開発者向け）を作成する
2. **Task 1-B**: `component-documentation.md` を作成する
3. **Task 2, Step 1-A**: LOGS.md 2ファイルを更新する（P1・P25対策）
4. **Task 2, Step 1-A（続）**: SKILL.md 2ファイルの変更履歴を更新する（P29対策）
5. **Task 2, Step 1-B**: 実装ステータステーブルを更新する
6. **Task 2, Step 1-C**: 関連タスクテーブルを更新する
7. **Task 2, Step 1-D**: topic-map.md を再生成する（P2・P27対策）
8. **Task 2, Step 2**: システム仕様書を更新する
9. **Task 2, Step 3**: IPC変更なし確認（スキップ）
10. **Task 3**: 全Step完了後に outputs/phase-12/documentation-changelog.md を作成する（P4対策）
11. **Task 4**: 未タスク検出と3ステップ処理を実施する（P3・P38対策）

## 成果物

| 成果物                        | パス                                                                                                                                        | 形式     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 実装ガイド（Part 1 + Part 2） | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-12/implementation-guide.md`      | Markdown |
| コンポーネントドキュメント    | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/component-documentation.md`                    | Markdown |
| documentation-changelog       | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-12/documentation-changelog.md`   | Markdown |
| 未タスクレポート              | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/outputs/phase-12/unassigned-task-detection.md` | Markdown |
| LOGS.md（2ファイル）          | `aiworkflow-requirements/LOGS.md` + `task-specification-creator/LOGS.md`                                                                    | Markdown |
| SKILL.md（2ファイル）         | `aiworkflow-requirements/SKILL.md` + `task-specification-creator/SKILL.md`                                                                  | Markdown |
| topic-map.md（再生成）        | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                                                                               | Markdown |
| Phase 12 仕様書（本ファイル） | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-12-documentation.md`                     | Markdown |

## 完了条件

### Task 1

- [ ] `outputs/phase-12/implementation-guide.md` Part 1（中学生レベル・日常例え必須）作成済み
- [ ] `outputs/phase-12/implementation-guide.md` Part 2（開発者向け技術詳細）作成済み
- [ ] `component-documentation.md` 作成済み

### Task 2

- [ ] Step 1-A: `aiworkflow-requirements/LOGS.md` 更新済み
- [ ] Step 1-A: `task-specification-creator/LOGS.md` 更新済み（2ファイル両方必須）
- [ ] Step 1-A: `aiworkflow-requirements/SKILL.md` 変更履歴更新済み
- [ ] Step 1-A: `task-specification-creator/SKILL.md` 変更履歴更新済み
- [ ] Step 1-B: 実装ステータステーブル更新済み（該当する場合）
- [ ] Step 1-C: 関連タスクテーブル更新済み
- [ ] Step 1-D: `topic-map.md` 再生成済み（`node generate-index.js` 実行確認）
- [ ] Step 2: システム仕様書（ui-ux・arch等）更新済み
- [ ] Step 3: IPC変更なし確認（スキップ理由記録済み）

### Task 3

- [ ] 全Step完了後に `outputs/phase-12/documentation-changelog.md` を作成済み（P4: 早期「完了」記載禁止）
- [ ] changelog に各Stepの実行結果が詳細に記録されている

### Task 4

- [ ] `outputs/phase-12/unassigned-task-detection.md` 作成済み（0件でも必須）
- [ ] 検出した未タスクそれぞれに3ステップ全完了:
  - [ ] `unassigned-task/` に指示書作成
  - [ ] `task-workflow.md` 残課題テーブルに登録
  - [ ] 関連仕様書に参照リンク追加
- [ ] 再評価クローズした未タスクの GitHub Issue を Close済み（P56対策）

## 次Phase

Phase 13: 完了 (`phase-13-pr-creation.md`)
