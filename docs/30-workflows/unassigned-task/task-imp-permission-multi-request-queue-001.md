# Permission要求キュー管理 - タスク指示書

## メタ情報

```yaml
issue_number: 604
```

## メタ情報

| 項目         | 内容                                                                        |
| ------------ | --------------------------------------------------------------------------- |
| タスクID     | task-imp-permission-multi-request-queue-001                                 |
| タスク名     | Permission要求キュー管理                                                    |
| 分類         | 改善                                                                        |
| 対象機能     | PermissionDialog、agentSlice                                                |
| 優先度       | 中                                                                          |
| 見積もり規模 | 中規模                                                                      |
| ステータス   | 未実施                                                                      |
| 発見元       | システム仕様書分析（ui-ux-agent-execution.md 権限確認フローの連続要求対応） |
| 発見日       | 2026-01-31                                                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ui-ux-agent-execution.mdの「権限確認フロー」セクションでは、単一の権限要求に対するPermissionDialogの応答フローが定義されている。しかし、エージェント実行中に複数のツール呼び出しが連続する場合（例: Glob→Read→Edit→Writeの連続実行）、権限要求が短時間に複数発生するケースが想定される。現在の仕様では同時に複数の権限要求が到達した場合の処理が定義されていない。

### 1.2 問題点・課題

- 複数の権限要求が同時に到達した場合のUI動作が未定義
- モーダルの重複表示やレースコンディションが発生する可能性
- ユーザーが連続する権限ダイアログに疲弊し、全て「許可」を選択するリスク
- agent:permission:req IPCイベントのキューイングが未実装

### 1.3 放置した場合の影響

- エージェント実行中にUI不整合（モーダル重複）が発生する可能性
- 権限要求の見落とし・誤操作リスクの増大
- 「ダイアログ疲れ」による無意識の許可操作（セキュリティリスク）

---

## 2. 何を達成するか（What）

### 2.1 目的

複数の権限要求を安全にキューイングし、1つずつ順番にユーザーに提示する仕組みを実装する。キューの状態をユーザーに視覚的にフィードバックする。

### 2.2 最終ゴール

- 複数の権限要求が到達した場合、キューに格納され1つずつ表示される
- キュー内の要求数がユーザーに表示される（例: 「1/3件目」）
- 連続する同種ツール要求に対する「全て許可」オプションが利用可能
- キュー処理中にユーザーが中断（全拒否）できる

### 2.3 スコープ

#### 含むもの

- 権限要求キューのデータ構造定義
- agentSliceへのキュー管理ロジック追加
- PermissionDialogへのキュー進捗表示追加
- 「同種ツール全て許可/拒否」バッチ操作
- ユニットテスト・コンポーネントテスト

#### 含まないもの

- 権限要求の自動判断ロジック
- キュー内の優先度制御
- 権限要求のタイムアウト処理（別タスク候補）

### 2.4 成果物

| 成果物               | パス                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| キュー管理モジュール | `apps/desktop/src/renderer/components/skill/permissionQueue.ts`                        |
| agentSlice拡張       | 既存agentSliceにキュー管理を追加                                                       |
| PermissionDialog修正 | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`                      |
| ユニットテスト       | `apps/desktop/src/renderer/components/skill/__tests__/permissionQueue.test.ts`         |
| コンポーネントテスト | `apps/desktop/src/renderer/components/skill/__tests__/PermissionDialog.queue.test.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-readable-ui-001が完了していること
- PermissionDialogのStore-directパターンが理解されていること
- agent:permission:req/res IPCチャンネルの仕組みが理解されていること

### 3.2 依存タスク

| タスクID                            | 状態 | 依存内容                 |
| ----------------------------------- | ---- | ------------------------ |
| task-imp-permission-readable-ui-001 | 完了 | PermissionDialog基盤実装 |

### 3.3 必要な知識

- Zustand状態管理（agentSlice）
- Electron IPC通信パターン（agent:permission:req/res）
- React モーダルコンポーネント設計
- キューデータ構造

### 3.4 推奨アプローチ

1. `PermissionRequest`型を定義（toolName, args, requestId, timestamp）
2. `permissionQueue`をagentSliceに追加（FIFO構造）
3. 新規要求到着時: キューに追加、先頭要求のみPermissionDialogに表示
4. 応答時: 現在の要求を処理してキューから除去、次の要求を表示
5. PermissionDialogに「n/m件目」表示と「全て拒否」ボタンを追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 内容                                 |
| ----- | ---------------- | ------------------------------------ |
| 1-3   | 要件定義・設計   | キューアーキテクチャ設計、状態遷移図 |
| 4     | テスト作成       | TDD: キュー操作、バッチ処理テスト    |
| 5     | 実装             | permissionQueue.ts、agentSlice拡張   |
| 6-9   | テスト拡充・品質 | レースコンディションテスト、品質確認 |
| 10-12 | レビュー・文書化 | 最終レビュー、仕様書更新             |

### Phase 4-5: テスト・実装

#### 目的

権限要求キューとバッチ操作を実装する。

#### 手順

1. `PermissionRequestQueue`型とFIFO操作関数を定義
2. agentSliceに`permissionQueue`状態と操作メソッドを追加
3. IPC受信ハンドラでキューに格納するロジックを追加
4. PermissionDialogでキュー先頭要求のみを表示
5. 応答完了時にキューから除去し、次の要求をセット
6. 「n/m件目」進捗表示をダイアログヘッダーに追加
7. 「全て拒否」ボタンをフッターに追加

#### 成果物

- permissionQueue.ts、agentSlice拡張
- PermissionDialog修正
- テストファイル2件

#### 完了条件

- 複数要求がキューに格納されること
- 1つずつ順番に表示されること
- 進捗表示が正しいこと

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 複数の権限要求がキューに格納される
- [ ] キュー内の要求が1つずつ順番にダイアログ表示される
- [ ] キュー進捗（n/m件目）がダイアログに表示される
- [ ] 同種ツール要求に対する「全て許可」が機能する
- [ ] 「全て拒否」でキュー内の全要求を拒否できる
- [ ] キュー処理中に新規要求が到着しても正常に動作する

### 品質要件

- [ ] テストカバレッジ Lines 95%以上
- [ ] レースコンディションテストがPASS
- [ ] TypeScript strict modeでエラーなし

### ドキュメント要件

- [ ] ui-ux-agent-execution.mdの権限確認フローにキュー仕様を追記
- [ ] interfaces-agent-sdk-ui.mdにキュー関連型定義を追記

---

## 6. 検証方法

### テストケース

| #   | テストケース                                | 期待結果                         |
| --- | ------------------------------------------- | -------------------------------- |
| 1   | 3件の権限要求を連続送信                     | 1件目のみ表示、「1/3件目」と表示 |
| 2   | 1件目許可後                                 | 2件目が表示、「2/3件目」と表示   |
| 3   | 「全て拒否」クリック                        | 残り全件拒否、ダイアログ閉じる   |
| 4   | 処理中に新規要求到着                        | キューに追加、件数表示が更新     |
| 5   | 同ツール（Bash）3件で「同種ツール全て許可」 | 3件全て許可処理される            |

### 検証手順

1. `pnpm vitest run`で全テストがPASSすることを確認
2. エージェント実行で複数ツール呼び出しシナリオを手動テスト
3. レースコンディションテスト（高速連続要求）を実行

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                       |
| ------------------------------ | ------ | -------- | ------------------------------------------ |
| IPC応答の順序保証が必要        | 高     | 中       | requestIdで応答と要求を一意に紐付け        |
| キュー操作のスレッドセーフ性   | 中     | 低       | Zustandのimmutableな状態更新パターンで対応 |
| バッチ許可のセキュリティリスク | 高     | 低       | 同種ツール同引数パターンのみバッチ許可対象 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------- |
| 権限確認フロー仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md` L277-L287 |
| agentSlice仕様       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`           |
| IPC通信仕様          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`         |
| PermissionDialog仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md` L133-L190 |

### 参考資料

- Zustand 公式ドキュメント（複雑な状態管理パターン）
- Apple HIG: Queued Alerts

---

## 9. 備考

### 補足事項

- Electron IPC（agent:permission:req）は非同期イベントのため、複数要求の到着順は保証されない点に注意
- キュー管理はRenderer Process側（agentSlice）で完結させ、Main Process側の変更を最小限にする
- 「全て許可」は同一セッション内の同一ツール・同一パターンの要求のみを対象とする（セキュリティ考慮）
