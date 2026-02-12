# Phase 4: テスト仕様書

## メタ情報

| 項目       | 値                            |
| ---------- | ----------------------------- |
| タスクID   | TASK-9B-H                     |
| フェーズ   | Phase 4: テスト作成 (TDD Red) |
| 作成日     | 2026-02-12                    |
| ステータス | 完了                          |

## テストファイル一覧

### 1. Main Process ハンドラーテスト

**ファイル**: `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`

**テスト数**: 31

#### テストカテゴリ

| カテゴリ        | テスト数 | 内容                                            |
| --------------- | -------- | ----------------------------------------------- |
| ハンドラー登録  | 2        | 5ハンドラー登録、解除                           |
| detect-mode     | 5        | 正常、空文字、undefined、Error、非Errorエラー   |
| create          | 5        | 正常、name未指定、desc未指定、mode未指定、Error |
| execute-tasks   | 4        | 正常、空文字、スペースのみ、Error               |
| validate        | 4        | 正常、false結果、空文字、Error                  |
| validate-schema | 4        | 正常、空schemaName、undefined data、Error       |
| Sender検証      | 5        | 全5ハンドラーの不正送信元拒否                   |
| 進捗通知        | 2        | send呼び出し、ウィンドウ破棄時スキップ          |

### 2. Preload API テスト

**ファイル**: `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`

**テスト数**: 14

#### テストカテゴリ

| カテゴリ                 | テスト数 | 内容                                     |
| ------------------------ | -------- | ---------------------------------------- |
| チャンネル定数           | 4        | 6定数存在、invoke白名簿、on白名簿        |
| APIインターフェース      | 1        | 全6メソッド存在確認                      |
| detectMode               | 1        | 正しいチャンネル呼び出し                 |
| createSkill              | 1        | 正しいチャンネル呼び出し                 |
| executeTasks             | 1        | 正しいチャンネル呼び出し                 |
| validateSkill            | 1        | 正しいチャンネル呼び出し                 |
| validateSchema           | 1        | 正しいチャンネル呼び出し                 |
| onProgress               | 3        | リスナー登録、データ受信、クリーンアップ |
| safeInvokeホワイトリスト | 1        | 全5 invokeメソッドの呼び出し確認         |

## 合計

- テストファイル: 2
- テスト数: 45
- 全テスト PASS
