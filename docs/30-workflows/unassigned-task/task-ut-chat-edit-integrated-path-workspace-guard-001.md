# chatEditHandlers integrated path の workspace 制約テスト

## メタ情報

```yaml
issue_number: 1270
```

## メタ情報

| 項目         | 内容                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------- |
| タスクID     | task-ut-chat-edit-integrated-path-workspace-guard-001                                     |
| タスク名     | chatEditHandlers integrated path の workspace 制約テスト                                  |
| 分類         | テスト                                                                                    |
| 対象機能     | Workspace Chat Edit（IPC handler / ChatEditService 統合パス）                             |
| 優先度       | 中                                                                                        |
| 見積もり規模 | 小規模                                                                                    |
| ステータス   | 未実施                                                                                    |
| 発見元       | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 Phase 5（P61派生 - RuntimeResolver mock 戦略） |
| 発見日       | 2026-03-15                                                                                |

## 1. なぜこのタスクが必要か（Why）

### 背景

UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 で workspacePath セキュリティ検証のテスト6件（TC-WS-01〜06）を作成した。しかし、RuntimeResolver の mock 戦略として `type: "handoff"` のみを使用し、ChatEditService の生成を回避した。これにより、`type: "integrated"` パス（実際に ChatEditService を生成して LLM 統合編集を行うパス）での workspace 制約テストが未実施のまま残っている。

### 問題点・課題

- `registerChatEditHandlers` L176-189 の分岐で、`type: "integrated"` の場合 ChatEditService が生成され、その内部でもファイル I/O が発生する
- workspace 制約チェック（L159-173）は integrated/handoff 共通で通過するが、ChatEditService 内での追加的なファイルアクセスが workspace 外を参照するリスクは未検証
- 現在のテストは handoff パスの workspace ガードのみカバーしており、integrated パスの end-to-end セキュリティ保証が欠落

### 放置した場合の影響

| 影響領域         | 影響                                                                |
| ---------------- | ------------------------------------------------------------------- |
| セキュリティ     | integrated path で workspace 外ファイルへの書き込みが発生するリスク |
| テストカバレッジ | RuntimeResolver の分岐の片方のみテストされている状態                |
| 回帰保証         | ChatEditService の変更が workspace 制約を破壊しても検出できない     |

## 2. 何を達成するか（What）

### 目的

`type: "integrated"` パスで ChatEditService が生成された場合の workspace 制約テストを追加し、両パスのセキュリティを保証する。

### 最終ゴール

- integrated path でも workspace 外ファイルが PERMISSION_DENIED で拒否されること
- ChatEditService 内のファイル I/O が workspace 境界を遵守すること
- handoff/integrated 両パスのテストで分岐カバレッジ 100%

### スコープ

**含むもの**:

- `type: "integrated"` を返す RuntimeResolver mock での workspace 制約テスト
- ChatEditService のコンストラクタ mock と workspace 境界検証
- 既存 TC-WS-01〜06 の integrated 版（TC-WS-INT-01〜06）

**含まないもの**:

- ChatEditService の内部ロジック（diff 生成、LLM 呼び出し等）のテスト
- E2E テスト（Electron IPC 実環境）

### 成果物

| 種別   | 成果物                                        | 配置先                                 |
| ------ | --------------------------------------------- | -------------------------------------- |
| テスト | chatEditHandlers.workspace-integrated.test.ts | `apps/desktop/src/main/ipc/__tests__/` |
| 文書   | テスト結果レポート                            | `docs/30-workflows/` 配下              |

## 3. どのように実行するか（How）

### 前提条件

- UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 が完了していること

### 推奨アプローチ

1. ChatEditService のコンストラクタを mock し、workspace 外ファイルへのアクセスを検出可能にする
2. RuntimeResolver mock を `type: "integrated"` に変更
3. 既存 TC-WS-01〜06 と同等のテストケースを integrated path で実行
4. 両パスの workspace 制約が同一の挙動を示すことを検証

### 実装課題と解決策（親タスクからの教訓）

| 課題                                    | 発見経緯                                                               | 解決策                                                                                                                                                          | 教訓                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ChatEditService の依存が重い（P61派生） | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 で handoff に寄せて回避した | ChatEditService コンストラクタを vi.mock し、`processEdit()` を spy で監視。workspace チェックは handler 層（L159-173）で完了するため、サービス層は mock で十分 | 動的DI依存が重い場合は、テスト対象の責務を明確にして mock 範囲を最小化する |
| P58 同名ファイル二重存在                | ipc/chatEditHandlers.ts と handlers/chatEditHandlers.ts の混同         | テストファイル冒頭に正本パス（`ipc/chatEditHandlers.ts`）を明記する                                                                                             | 同名ファイルが複数ある場合は `grep -rn "export.*register"` で正本を判定    |
| vi.spyOn vs vi.mock 判断                | isAllowedPath の完全 mock でパストラバーサル検証が失われた             | 既存テストと同様に `vi.spyOn` で実装を保持する                                                                                                                  | セキュリティロジックでは実装を保持して実動作を検証すべき                   |

## 4. 実行手順

### 概要ステップ

1. ChatEditService のコンストラクタ mock 戦略を設計する
2. RuntimeResolver mock を `type: "integrated"` に設定する
3. TC-WS-INT-01〜06 のテストケースを作成する
4. 両パス（handoff/integrated）の workspace 制約が同一挙動であることを検証する
5. 分岐カバレッジを確認する

### Phase 構成

| Phase | 名称                           | 内容                                                 |
| ----- | ------------------------------ | ---------------------------------------------------- |
| 1-3   | 要件定義・設計・レビュー       | ChatEditService mock 戦略、テストケース設計          |
| 4     | テスト作成                     | TC-WS-INT-01〜06 のテストコード作成                  |
| 5     | 実装                           | テスト実行・修正（テスト追加タスクのため Phase 4=5） |
| 6-7   | テスト拡充・カバレッジ         | 分岐カバレッジ確認                                   |
| 8-10  | リファクタリング〜最終レビュー | 品質検証                                             |
| 11-13 | 手動テスト〜完了               | 文書更新・PR                                         |

## 5. 完了条件チェックリスト

- [ ] integrated path で workspace 外ファイルが PERMISSION_DENIED になること
- [ ] integrated path で workspace 内ファイルが正常処理されること
- [ ] integrated path でパストラバーサルが拒否されること
- [ ] 全テスト PASS（既存 + 新規）
- [ ] Branch Coverage 70% 以上

## 6. 検証方法

### 実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/chatEditHandlers.workspace-integrated.test.ts
```

### テストケース

| #   | テストケース                                                              | 入力条件                                                                                                     | 期待結果                                                             |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| 1   | TC-WS-INT-01: integrated path で workspace 外ファイルが拒否されること     | RuntimeResolver が `type: "integrated"` を返す状態で、workspace 外の filePath を指定                         | PERMISSION_DENIED エラーが返され、ChatEditService が生成されないこと |
| 2   | TC-WS-INT-02: integrated path で workspace 内ファイルが正常処理されること | RuntimeResolver が `type: "integrated"` を返す状態で、workspace 内の filePath を指定                         | ChatEditService が生成され、processEdit が呼び出されること           |
| 3   | TC-WS-INT-03: integrated path でパストラバーサルが拒否されること          | RuntimeResolver が `type: "integrated"` を返す状態で、`../` を含む filePath を指定                           | PERMISSION_DENIED エラーが返されること                               |
| 4   | TC-WS-INT-04: integrated path でシンボリックリンクが拒否されること        | RuntimeResolver が `type: "integrated"` を返す状態で、workspace 外を指すシンボリックリンクの filePath を指定 | PERMISSION_DENIED エラーが返されること                               |
| 5   | TC-WS-INT-05: integrated path で空の workspacePath が拒否されること       | RuntimeResolver が `type: "integrated"` を返す状態で、workspacePath が空文字列                               | バリデーションエラーが返されること                                   |
| 6   | TC-WS-INT-06: integrated path で null workspacePath が拒否されること      | RuntimeResolver が `type: "integrated"` を返す状態で、workspacePath が null                                  | バリデーションエラーが返されること                                   |

## 7. リスクと対策

| リスク                        | 影響度 | 発生確率 | 対策                                           |
| ----------------------------- | ------ | -------- | ---------------------------------------------- |
| ChatEditService mock の複雑度 | 中     | 中       | コンストラクタ mock + processEdit spy で最小化 |
| 既存テストへの影響            | 低     | 低       | 独立テストファイルで隔離                       |

## 8. 参照情報

### ソースコード

- `apps/desktop/src/main/ipc/chatEditHandlers.ts` — テスト対象（L159-173: workspace 制約、L176-189: integrated/handoff 分岐）
- `apps/desktop/src/main/ipc/__tests__/chatEditHandlers.workspace-constraint.test.ts` — 既存テスト（handoff path）
- `apps/desktop/src/main/services/chat-edit/ChatEditService.ts` — integrated path で生成されるサービス

### 仕様書・ルール

- `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` — Workspace Chat Edit 仕様
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` — IPC セキュリティ
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — P58/P61 教訓
- `.claude/rules/06-known-pitfalls.md` — P58, P61

## 9. 備考

### 補足事項

- 本タスクは UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 の「handoff only テスト」制約から派生した改善タスク。
- workspace 制約チェック自体は handler 層（L159-173）で完了するため、integrated path でも同一ロジックが適用される。ただし、ChatEditService 内での追加ファイル操作が workspace 境界を遵守することの保証が目的。
- セキュリティロジックのテストでは `vi.spyOn` で実装を保持し、実動作を検証すること（vi.mock による完全置換は避ける）。
