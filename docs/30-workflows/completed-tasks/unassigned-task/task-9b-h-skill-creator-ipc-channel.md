# SkillCreatorService IPC通信チャンネル設定 - タスク指示書

## メタ情報

```yaml
issue_number: 692
```

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | TASK-9B-H                       |
| タスク名     | SkillCreatorService IPC通信設定 |
| 分類         | 機能追加                        |
| 対象機能     | Skill Creator Service           |
| 優先度       | **高**                          |
| 見積もり規模 | 中規模                          |
| ステータス   | 未着手                          |
| 発見元       | TASK-9B-G Phase 3 設計レビュー  |
| 発見日       | 2026-02-03                      |
| ブロック対象 | TASK-10A（UI統合）              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9B-GでSkillCreatorServiceのMain Process側コア実装が完了した。
しかし、Renderer ProcessからSkillCreatorServiceを利用するためのIPC通信チャンネルが未設定である。

### 1.2 問題点・課題

- SkillCreatorServiceはMain Processでのみ動作
- Renderer ProcessのUIからスキル作成機能を呼び出す方法がない
- 以下のIPC操作が未定義:
  - スキル作成開始（`skill-creator:create`）
  - タスク生成（`skill-creator:generate-tasks`）
  - 検証実行（`skill-creator:validate`）
  - 進捗通知（`skill-creator:progress`）

### 1.3 放置した場合の影響

- UIからスキル作成機能が利用できない
- TASK-10A（UI統合）が開始できない
- ユーザーがスキル作成機能にアクセスできない

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillCreatorServiceをRenderer Processから利用可能にするIPC通信チャンネルを設定する。

### 2.2 最終ゴール

- Renderer ProcessからSkillCreatorServiceの全APIが呼び出し可能
- 進捗・エラー通知がRenderer Processに配信される
- セキュリティ検証（withValidation）が適用されている

### 2.3 スコープ

#### 含むもの

- IPCチャンネル定数定義
- skillCreatorHandlers.ts実装
- Preload API（skillCreatorAPI）実装
- channels.tsホワイトリスト追加
- ユニットテスト

#### 含まないもの

- UIコンポーネント実装（TASK-10A）
- Zustand Slice実装（TASK-10A）
- E2Eテスト（TASK-10A以降）

### 2.4 成果物

| 成果物         | パス                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| IPCハンドラー  | `apps/desktop/src/main/services/skill/skillCreatorHandlers.ts`                |
| Preload API    | `apps/desktop/src/preload/skillCreatorApi.ts`                                 |
| チャンネル定義 | `apps/desktop/src/preload/channels.ts`（追記）                                |
| 型定義         | `apps/desktop/src/shared/ipc/skillCreatorTypes.ts`                            |
| テスト         | `apps/desktop/src/main/services/skill/__tests__/skillCreatorHandlers.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9B-G（SkillCreatorService実装）完了
- Electron IPC設計理解

### 3.2 依存タスク

| タスクID  | タスク名                  | ステータス |
| --------- | ------------------------- | ---------- |
| TASK-9B-G | SkillCreatorService実装   | ✅ 完了    |
| TASK-3-2  | SkillExecutor IPC Handler | ✅ 完了    |

### 3.3 必要な知識・スキル

- Electron IPC通信（contextBridge, ipcRenderer, ipcMain）
- TypeScript型定義
- withValidation()パターン
- Main/Renderer間のセキュリティ設計

### 3.4 推奨アプローチ

1. 既存のskillHandler.ts（TASK-3-2）をリファレンスとして参照
2. 同様のパターンでskillCreatorHandlers.tsを実装
3. 進捗通知はwebContents.sendでMain→Renderer配信

---

## 4. 実行手順

### Phase 1-13: task-specification-creatorの標準フローに従って実行

詳細なPhase構成はtask-specification-creatorスキルで生成。

### 参考: 主要実装ポイント

#### IPCチャンネル定義（例）

| チャンネル               | 方向            | 用途           |
| ------------------------ | --------------- | -------------- |
| `skill-creator:create`   | Renderer → Main | スキル作成開始 |
| `skill-creator:generate` | Renderer → Main | タスク生成     |
| `skill-creator:validate` | Renderer → Main | 検証実行       |
| `skill-creator:abort`    | Renderer → Main | 中断           |
| `skill-creator:progress` | Main → Renderer | 進捗通知       |
| `skill-creator:result`   | Main → Renderer | 結果通知       |
| `skill-creator:error`    | Main → Renderer | エラー通知     |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全IPCチャンネルが定義されている
- [ ] Preload APIが公開されている
- [ ] セキュリティ検証（withValidation）が適用されている
- [ ] 進捗通知がRenderer Processで受信できる

### 品質要件

- [ ] テストカバレッジ: Line 80%, Branch 60%, Function 80%
- [ ] 型安全性が確保されている

### ドキュメント要件

- [ ] api-ipc-agent.mdにチャンネル仕様を追記
- [ ] interfaces-agent-sdk-skill.mdにPreload API仕様を追記

---

## 6. 検証方法

### テストケース

| #   | テストケース        | 期待結果                         |
| --- | ------------------- | -------------------------------- |
| 1   | createSkill呼び出し | SkillCreatorService.createが実行 |
| 2   | 進捗イベント受信    | Renderer側でprogressが受信可能   |
| 3   | 中断処理            | abort後にクリーンアップ          |
| 4   | エラー通知          | エラー内容がRenderer側に伝達     |

---

## 7. リスクと対策

| リスク          | 影響度 | 発生確率 | 対策                           |
| --------------- | ------ | -------- | ------------------------------ |
| IPC設計の複雑化 | 中     | 中       | 既存パターン（TASK-3-2）を踏襲 |
| 進捗通知の負荷  | 低     | 低       | デバウンス/スロットリング      |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント            | パス                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| SkillCreatorService仕様 | `aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    |
| SkillExecutor IPC仕様   | `aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` |
| Skill IPCセキュリティ   | `aiworkflow-requirements/references/security-skill-ipc.md`            |

### 関連タスク

| タスクID  | 関係 | 説明                      |
| --------- | ---- | ------------------------- |
| TASK-9B-G | 先行 | SkillCreatorService実装   |
| TASK-10A  | 後続 | スキル作成UI統合          |
| TASK-3-2  | 参考 | SkillExecutor IPC Handler |

---

## 9. 先行タスクからの教訓（TASK-9B-G）

TASK-9B-G（SkillCreatorService実装）で得られた知見を本タスク実装時に活用すること。

### 9.1 セキュリティ検証の実装箇所

| 項目     | 内容                                                                 |
| -------- | -------------------------------------------------------------------- |
| 問題     | パストラバーサル防止をどの層で実装すべきか不明瞭だった               |
| 解決策   | **ScriptExecutor側**でファイル操作前にパス検証を実施                 |
| 本タスク | IPCハンドラーはwithValidation()でスキーマ検証、パス検証はService層へ |

### 9.2 Script First原則

| 項目     | 内容                                                         |
| -------- | ------------------------------------------------------------ |
| 原則     | 決定論的な処理（100%正しい結果が出るもの）はスクリプトに委譲 |
| 本タスク | IPC通信の入力検証・サニタイズはスクリプトベースで決定論的に  |

### 9.3 未タスク登録漏れ防止

| 項目     | 内容                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 問題     | 未タスク指示書を作成しても、task-workflow.mdへの登録を忘れやすい                           |
| 解決策   | **3ステップ必須**: ①指示書作成 → ②task-workflow.md残課題テーブル登録 → ③関連仕様書への記載 |
| 本タスク | Phase 12完了前に必ず3ステップを確認すること                                                |

---

## 10. 備考

### 発見元の原文

```
Phase 3 設計レビュー結果より:
- IPC通信チャンネル設定が未実装（MINOR判定）
- UI統合前に必要な基盤整備
```

### 補足事項

- TASK-3-2のskillHandler.tsを参考実装として活用
- セキュリティ検証は既存パターン（withValidation）を適用
- 進捗通知のデバウンスは100ms推奨
