# Phase 1: 要件定義 - 成果物

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 1                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-09                                         |

## ブランチ現況判定結果

### ステップ0: ブランチ現況確認

`git diff --name-status main...HEAD` の結果、mainブランチとの差分は仕様書のみ（コード変更なし）。

**判定結果:**

| 層      | 判定               | 根拠                                                                                     |
| ------- | ------------------ | ---------------------------------------------------------------------------------------- |
| Store層 | 通常実装モード     | `agentSlice.ts` L742-797: `executeSkill` 関数冒頭に `isExecuting` チェックが欠落している |
| UI層    | 既存実装監査モード | `ExecuteButton` / `AgentExecutionView` / `ChatPanel` は既に `isExecuting` を反映している |

## 問題分析

### 現状のコード（agentSlice.ts L742-797）

`executeSkill` 関数は `selectedSkillName` の存在チェックのみで `isExecuting` の状態を確認していない。これにより以下の3つの並行実行シナリオが発生する。

### シナリオA: 200ms以内にボタン2回クリック

1. ユーザーが実行ボタンをクリック（1回目）
2. `isExecuting: true` に設定される前に、200ms以内に2回目のクリックが発生
3. 2つの `executeSkill` 呼び出しが並行で開始される
4. 2つ目の呼び出しが `executionId` を上書きし、1つ目の実行結果が行き場を失う

**影響:** `executionId` の上書きにより、1つ目の実行の完了/エラーハンドリングが正しく機能しない。

### シナリオB: 実行中に別スキル選択して実行

1. スキルAの実行を開始（`isExecuting: true` に設定済み）
2. UIガードが効かない経路（プログラム的呼び出し等）でスキルBの `executeSkill` が呼ばれる
3. `executionId` がスキルBの値で上書きされる
4. スキルAの `streamingMessages` とスキルBの `streamingMessages` が混在する

**影響:** ストリーミングメッセージが混在し、ユーザーに意味不明な出力が表示される。

### シナリオC: ネットワーク遅延でIPC応答前に2回目実行

1. スキル実行を開始、`authKey` 事前検証（非同期）が完了
2. `window.electronAPI.skill.execute()` のIPC呼び出しが開始される
3. ネットワーク遅延によりIPC応答が遅延
4. IPC応答前に2回目の `executeSkill` が呼ばれる
5. 2つ目の呼び出しが `streamingMessages: []` でリセットし、1つ目の途中結果が消失

**影響:** 1つ目の実行のストリーミング結果が消失し、ユーザーが部分的な出力しか受け取れない。

## 機能要件

| ID    | 要件                                                                                                                                                                         | 優先度 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `executeSkill` 関数冒頭で `isExecuting === true` の場合、新しい実行を即座に拒否（早期return）する                                                                            | 必須   |
| FR-02 | Store層ガード追加後も、既存UIガード面（`ExecuteButton.tsx`、`AgentExecutionView.tsx`、`ChatPanel.tsx`）が `isExecuting` を一貫して反映し、ユーザーが二重実行を知覚できること | 必須   |
| FR-03 | 実行中のUIフィードバック（ExecuteButton非表示、AgentExecutionView入力無効化、ChatPanelの`skill-management-toggle` disabled + `SkillStreamingView`表示）が維持されること      | 必須   |
| FR-04 | ガードによる拒否時、既存の `streamingMessages` や `executionId` が変更されないことを保証する                                                                                 | 必須   |

## 非機能要件

| ID     | 要件                                                                                                                                                 | 優先度 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| NFR-01 | ガード処理のオーバーヘッドは1ms未満（同期的な状態チェックのみ）                                                                                      | 必須   |
| NFR-02 | 既存テスト（race condition対策テスト含む）との後方互換性を維持する                                                                                   | 必須   |
| NFR-03 | P31（Zustand Store Hooks無限ループ）に抵触しない実装とする。`isExecuting` 参照は個別セレクタまたはプリミティブ直接セレクタに限定し、合成Hook化しない | 必須   |

## 受入基準

| ID    | 受入基準                                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01 | `isExecuting === true` の状態で `executeSkill` を呼んだ場合、関数が即座にreturnする                                                      |
| AC-02 | AC-01の状況で `streamingMessages` 配列が変更されない                                                                                     |
| AC-03 | AC-01の状況で `executionId` が上書きされない                                                                                             |
| AC-04 | UI上で実行中フィードバックが既存仕様どおり表示される（ExecuteButton非表示 / AgentExecutionView入力disabled / ChatPanel toggle disabled） |
| AC-05 | 実行完了後に上記UIガード面が通常状態へ戻る                                                                                               |
| AC-06 | 全既存テストがPASSする                                                                                                                   |

## 非採用案の理由

| 案                                       | 不採用の理由                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------- |
| UI改修を主変更にする案                   | 既存UIがすでに `isExecuting` を反映しており、主因はStore側の再入防止欠落であるため |
| Main Process / Preload 契約変更案        | `skill:execute` 契約自体には今回の不整合がなく、変更すると影響半径だけが増えるため |
| 新しい合成 selector / custom hook 追加案 | P31の再発リスクを上げるため                                                        |

## 必要仕様抽出マトリクス

| 区分   | 採用する仕様                              | このタスクで使う理由                                               |
| ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| 必須   | `arch-state-management.md`                | `isExecuting` / `skillExecutionStatus` / Store境界の責務確認       |
| 必須   | `interfaces-agent-sdk-skill.md`           | `executeSkill` / streaming / permission 周辺契約確認               |
| 必須   | `api-ipc-agent.md`                        | `skill:execute` request / response / error 契約確認                |
| 必須   | `ui-ux-agent-execution.md`                | 実行中UIの disabled / hidden 契約確認                              |
| 必須   | `ui-ux-feature-skill-stream.md`           | ChatPanel と SkillStreamingView の表示連動確認                     |
| 必須   | `quality-requirements.md`                 | TDD / coverage / 性能要件の下限確認                                |
| 補助   | `architecture-implementation-patterns.md` | 最小変更での実装パターン確認                                       |
| 非採用 | `interfaces-agent-sdk-executor.md`        | Main executor DIが中心で今回のRenderer Storeガードの主論点ではない |
| 非採用 | `security-skill-execution.md`             | permission永続化や危険ツール許可は今回の主変更範囲外               |
| 非採用 | `ui-ux-settings.md`                       | 設定画面改修が今回の実装要件に含まれない                           |

## 完了条件チェック

- [x] FR-01〜FR-04の機能要件が定義されている
- [x] NFR-01〜NFR-03の非機能要件が定義されている
- [x] AC-01〜AC-06の受入基準が検証可能な形式で定義されている
- [x] 再現シナリオA〜Cが文書化されている
- [x] 必要仕様抽出マトリクスと非採用理由が明文化されている
- [x] ブランチ現況判定結果が記録されている
