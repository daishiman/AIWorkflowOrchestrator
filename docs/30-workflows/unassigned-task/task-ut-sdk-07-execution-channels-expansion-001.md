# UT-SDK-07-EXECUTION-CHANNELS-EXPANSION-001: EXECUTION_CHANNELS の拡充検討

## メタ情報

```yaml
task_id: UT-SDK-07-EXECUTION-CHANNELS-EXPANSION-001
task_name: EXECUTION_CHANNELS の拡充検討（desktop 独自チャネルの shared 移管判断）
category: 仕様整合性
target_feature: packages/shared/src/ipc/channels.ts の EXECUTION_CHANNELS
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001 Phase 12 unassigned-task-detection（2026-03-29）
created_date: 2026-03-29
dependencies: [TASK-UT-SDK-07]
```

| 項目         | 内容                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| タスクID     | UT-SDK-07-EXECUTION-CHANNELS-EXPANSION-001                                            |
| タスク名     | EXECUTION_CHANNELS の拡充検討（desktop 独自チャネルの shared 移管判断）               |
| 分類         | 仕様整合性                                                                            |
| 対象機能     | `packages/shared/src/ipc/channels.ts` の `EXECUTION_CHANNELS` グループ                |
| 優先度       | 低                                                                                    |
| 見積もり規模 | 小規模                                                                                |
| ステータス   | 未実施                                                                                |
| 発見元       | TASK-UT-SDK-07 Phase 12 unassigned-task-detection（desktop 独自チャネルの分散を確認） |
| 発見日       | 2026-03-29                                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UT-SDK-07 の実装時に、`apps/desktop/src/preload/channels.ts` には以下の2チャネルが定義されているが、`packages/shared/src/ipc/channels.ts` の `EXECUTION_CHANNELS` オブジェクトには含まれていないことが判明した。

- `EXECUTION_GET_TERMINAL_LOG`
- `EXECUTION_GET_COPY_COMMAND`

これらは `EXECUTION_*` プレフィックスを持つ「実行系」チャネルであり、同カテゴリの他チャネル（`EXECUTION_START`、`EXECUTION_STOP` 等）は shared の `EXECUTION_CHANNELS` に集約されている。

### 1.2 問題点・課題

- 同一カテゴリ（`EXECUTION_*`）のチャネルが shared と desktop に分散しており、管理場所が一貫していない
- 新規開発者がどのチャネルが shared にあり、どれが desktop にあるかを把握しにくい
- `EXECUTION_CHANNELS` を参照する際に、desktop 独自チャネルが存在することを前提に追加参照が必要になる
- 将来的に web や他クライアントが実行系チャネルを参照する際に、desktop 独自チャネルを見落とすリスクがある

### 1.3 放置した場合の影響

- IPC チャネルの真の SSOT（Single Source of Truth）が形成されない
- 仕様書・コード間でチャネル一覧に齟齬が生じ続ける
- 他の IPC 系タスクで同様のパターンが踏襲され、分散が拡大する可能性がある

---

## 2. 何を達成するか（What）

### 2.1 目的

`EXECUTION_GET_TERMINAL_LOG` および `EXECUTION_GET_COPY_COMMAND` を shared の `EXECUTION_CHANNELS` に追加すべきかを判断し、決定に応じて実施または見送り理由を記録する。

### 2.2 最終ゴール

- 2チャネルを shared に移管すべきかの技術的判断を行う
- 移管する場合:
  - `packages/shared/src/ipc/channels.ts` の `EXECUTION_CHANNELS` に追加
  - `apps/desktop/src/preload/channels.ts` の定義を shared 参照に変更
  - 関連テスト・型定義を更新
- 移管しない場合:
  - 理由（desktop 専用の機能であること等）をコメントで明示する
  - 本タスク仕様書に判断根拠を記録する

### 2.3 スコープ

#### 含むもの

- `EXECUTION_GET_TERMINAL_LOG` / `EXECUTION_GET_COPY_COMMAND` の使用箇所調査
- shared 移管の可否判断（desktop 専用か、web/他クライアントでも使用するか）
- 移管する場合の `channels.ts` 更新と関連ファイルの追従修正
- 判断根拠のドキュメント記録

#### 含まないもの

- `EXECUTION_CHANNELS` 全体の見直し・再設計
- desktop 専用チャネル全般の shared 移管
- IPC ハンドラー実装の変更（チャネル文字列定義のみ対象）

---

## 3. 実行手順

1. `apps/desktop/src/preload/channels.ts` で `EXECUTION_GET_TERMINAL_LOG` と `EXECUTION_GET_COPY_COMMAND` の定義箇所を確認する
2. 各チャネルの使用箇所を `grep` で調査し、desktop 専用か否かを判断する:
   - `apps/desktop/src/main/` 配下のハンドラー
   - `apps/desktop/src/renderer/` 配下の呼び出し元
   - `apps/web/` 配下での参照有無
3. 判断基準:
   - desktop 専用の機能（例: ターミナルログ取得）であれば shared 移管不要
   - 将来的に web クライアントでも使用するなら shared 移管を推奨
4. 移管する場合:
   - `packages/shared/src/ipc/channels.ts` の `EXECUTION_CHANNELS` に2チャネルを追加
   - `apps/desktop/src/preload/channels.ts` から重複定義を削除し、shared からインポート
   - `apps/desktop/src/preload/channels.test.ts` の期待値を更新
5. 移管しない場合:
   - `apps/desktop/src/preload/channels.ts` の定義箇所に `// NOTE: desktop 専用チャネル（shared 移管対象外）` コメントを付与
   - 本タスク仕様書の「完了条件チェックリスト」に判断根拠を記録する

---

## 4. 完了条件チェックリスト

- [ ] `EXECUTION_GET_TERMINAL_LOG` / `EXECUTION_GET_COPY_COMMAND` の使用箇所を調査した
- [ ] shared 移管の可否を判断し、判断根拠を記録した
- [ ] 移管する場合: `packages/shared/src/ipc/channels.ts` に追加し、関連ファイルを更新した
- [ ] 移管しない場合: desktop 側にコメントを付与し、理由を本ドキュメントに追記した
- [ ] 変更がある場合、関連テストが通ることを確認した

---

## 5. 参照情報

- `packages/shared/src/ipc/channels.ts`（`EXECUTION_CHANNELS` の現在の定義）
- `apps/desktop/src/preload/channels.ts`（desktop 独自チャネルの定義箇所）
- `apps/desktop/src/preload/channels.test.ts`（`EXECUTION_CHANNELS` のテスト）
- `docs/30-workflows/step-ut-sdk-07-shared-ipc-channel-contract/outputs/phase-12/unassigned-task-detection.md`（発見元）
