# 未タスク検出レポート: TASK-SW-CANCEL-004 Phase 12

## メタ情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | TASK-SW-CANCEL-004                 |
| 機能名   | skill-creator-cancel-renderer-hook |
| Phase    | 12 成果物                          |
| 作成日   | 2026-04-15                         |
| 検出者   | Phase 12 実施時                    |

---

## 検出された未タスク一覧

### 未タスク 1: キャンセル後の半作成スキルディレクトリ残存クリーンアップ

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID候補 | `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` |
| 優先度       | Low                                      |
| 先行記録     | CANCEL-003 Phase 12 でも記録済み         |
| 担当候補     | SkillCreatorService / SkillFileManager   |

#### 問題の説明

スキル生成を途中でキャンセルすると、生成が途中まで進んでいた場合にスキルディレクトリが中途半端な状態でファイルシステムに残ることがあります。

**具体的なシナリオ**:

1. ユーザーがスキル名 `my-skill` でスキル生成を開始
2. `~/.claude/skills/my-skill/` ディレクトリが作成される
3. `SKILL.md` の一部が書き込まれた状態でキャンセル
4. `~/.claude/skills/my-skill/` が中途半端な内容のまま残存

#### 影響

- 次回同名スキルを作成しようとすると「既に存在する」エラーが発生する可能性がある
- ユーザーが手動でディレクトリを削除しなければならない
- ディレクトリが増え続けてファイルシステムが汚染される

#### 解決方針（案）

```
cancelCurrentOperation() が呼ばれた際:
  1. 現在作成中のスキルディレクトリパスを記録しておく
  2. キャンセル確定後、そのディレクトリを削除する
  3. 削除に失敗した場合は warn ログを出して続行
```

#### 実装候補ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/SkillFileManager.ts`（存在する場合）

---

### 未タスク 2: AbortSignal を `createSkill()` に直接接続する実装

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID候補 | `TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001`       |
| 優先度       | Medium                                        |
| 依存タスク   | CANCEL-003（`cancelCurrentOperation()` 実装） |
| 担当候補     | SkillCreatorService                           |

#### 問題の説明

CANCEL-003 で `cancelCurrentOperation()` が `AbortController.abort()` を呼ぶように実装されましたが、`createSkill()` の内部ではその `AbortSignal` を受け取って中断する実装が未完成です。

**現在の動作**:

```
cancelCurrentOperation()
  → abortController.abort()  ← signal を abort 状態にする

createSkill(options)
  → 内部で長時間処理を実行
  → AbortSignal を参照していないため、abort されても気づかない
  → 処理が最後まで完走してしまう
```

**期待する動作**:

```
cancelCurrentOperation()
  → abortController.abort()

createSkill(options, signal)  ← AbortSignal を受け取る
  → 各処理ステップで signal.aborted を確認
  → abort されていたら処理を中断して AbortError をスロー
  → ScriptExecutor にも signal を渡して子プロセスを強制終了
```

#### 現状の問題点詳細

`SkillCreatorService.cancelCurrentOperation()` は `AbortController.abort()` を呼びますが、`ScriptExecutor` への実際のプロセス中断は `ScriptExecutor` 内部の `AbortController` が別途管理している可能性があります。両者の `AbortController` が同一インスタンスを参照しているか、または適切に伝播しているかを確認・修正する必要があります。

#### 実装候補ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
  - `createSkill()` のシグネチャを `createSkill(options, signal?: AbortSignal)` に変更
- `apps/desktop/src/main/services/skill/ScriptExecutor.ts`
  - `execute()` に `AbortSignal` を渡す対応

#### 検証方法

1. スキル生成を開始する
2. スクリプト実行中（長時間かかるステップ）にキャンセルボタンを押す
3. スクリプトの子プロセスが即座に終了することを確認（`ps` コマンドまたはタスクマネージャーで確認）
4. キャンセル後に `createSkill()` のログが出力されないことを確認

---

## 検出された未タスクのサマリー

| タスクID候補                             | 優先度 | 記録場所            | 次のアクション               |
| ---------------------------------------- | ------ | ------------------- | ---------------------------- |
| `TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001` | Low    | CANCEL-003 でも記録 | バックログに積む             |
| `TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001`  | Medium | 今回初記録          | 次スプリントでタスク化を検討 |

---

## 補足: CANCEL シリーズ完了後の残キャンセル課題全体像

```
【完了】CANCEL-001〜004: IPC 4層接続
  ✅ チャンネル定数定義
  ✅ Preload API 追加
  ✅ Main ハンドラー追加
  ✅ Renderer Hook IPC 連動

【未完了・将来タスク】
  [ ] 半作成ディレクトリのクリーンアップ (TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001)
  [ ] AbortSignal の createSkill() への接続 (TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001)
```
