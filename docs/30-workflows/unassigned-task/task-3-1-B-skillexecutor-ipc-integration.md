# SkillExecutor IPC Handler統合 - タスク指示書

## メタ情報

```yaml
issue_number: 540
```

## メタ情報

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| タスクID     | TASK-3-1-B                             |
| タスク名     | SkillExecutor IPC Handler統合          |
| 分類         | 改善                                   |
| 対象機能     | Skill Import Agent System              |
| 優先度       | 高                                     |
| 見積もり規模 | 中規模                                 |
| ステータス   | 確認待ち（TASK-3-2との重複検証が必要） |
| 発見元       | TASK-3-1-A完了時（blocks）             |
| 発見日       | 2026-01-25                             |

---

## 重要: TASK-3-2との関係確認

**注意**: TASK-3-2「SkillExecutor IPC Handler」（2026-01-25完了）が本タスクの内容をカバーしている可能性があります。

### 確認すべき事項

| 項目                          | TASK-3-2の実装状況    | TASK-3-1-Bで追加が必要か |
| ----------------------------- | --------------------- | ------------------------ |
| skill:execute IPC統合         | ✅ 実装済み           | 確認必要                 |
| skill:stream リアルタイム通信 | ✅ 実装済み           | 確認必要                 |
| skill:abort 中断処理          | ✅ 実装済み           | 確認必要                 |
| skill:get-status 状態取得     | ✅ 実装済み           | 確認必要                 |
| Permission IPC連携            | ✅ TASK-3-1-D/Eで実装 | 確認必要                 |

**推奨アクション**: 実装を開始する前に、TASK-3-2の成果物を確認し、本タスクが実際に必要かどうかを検証してください。

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-1-A（SkillExecutor Core実装）が完了し、スキル実行のコアロジックが実装された。
次のステップとして、Main ProcessのSkillExecutorとRenderer Process間でIPC通信を介して
実行結果をリアルタイムでストリーミング表示する統合が必要とされた。

### 1.2 問題点・課題

- Main ProcessでのSkillExecutor実行結果がRenderer Processに伝達されていない可能性
- ストリーミング出力のリアルタイム表示が未完成の可能性
- IPC Handler層での統合が不完全な可能性

### 1.3 放置した場合の影響

- スキル実行結果がUIに表示されない、または遅延する
- ユーザーがスキル実行状況を把握できない
- エラー発生時のフィードバックが不十分

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillExecutorの実行結果をIPC経由でRenderer Processにリアルタイムで配信し、
UIでストリーミング表示する統合を完成させる。

### 2.2 最終ゴール

- SkillExecutor実行開始〜完了までの全ストリーミングイベントがRenderer Processで受信可能
- UI上でリアルタイムにスキル実行結果が表示される
- 中断・エラー時も適切にUIが更新される

### 2.3 スコープ

#### 含むもの

- IPC Handler層の実装確認・補完
- Renderer Process側のイベント受信処理確認
- ストリーミング表示のE2E動作確認

#### 含まないもの

- SkillExecutor Core実装（TASK-3-1-Aで完了）
- Permission Dialog UI（TASK-3-1-D/Eで完了）
- 新規UIコンポーネント開発

### 2.4 成果物

| 成果物           | 説明                                 |
| ---------------- | ------------------------------------ |
| IPC Handler更新  | 統合が不完全な場合の修正             |
| 動作確認レポート | TASK-3-2との重複確認・追加実装の有無 |
| テストケース     | 統合テスト（該当する場合）           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-1-A（SkillExecutor Core）完了
- TASK-3-2（SkillExecutor IPC Handler）完了
- TASK-5-1（SkillAPI Preload）完了

### 3.2 依存タスク

| タスクID   | タスク名                  | ステータス |
| ---------- | ------------------------- | ---------- |
| TASK-3-1-A | SkillExecutor Core実装    | ✅ 完了    |
| TASK-3-2   | SkillExecutor IPC Handler | ✅ 完了    |
| TASK-5-1   | SkillAPI Preload実装      | ✅ 完了    |

### 3.3 必要な知識

- Electron IPC通信（Main/Renderer間）
- TypeScriptストリーミングパターン
- Preload API（contextBridge）

### 3.4 推奨アプローチ

1. TASK-3-2の成果物を確認
2. 未実装箇所があれば補完
3. なければ本タスクをクローズ

---

## 4. 実行手順

### Phase 0: TASK-3-2との重複確認【最重要】

#### 目的

本タスクが実際に必要かどうかを検証する。

#### 手順

1. TASK-3-2の成果物を確認
   - `apps/desktop/src/main/skill/skill-handler.ts`
   - `apps/desktop/src/preload/skillApi.ts`
   - `apps/desktop/src/renderer/store/slices/agentSlice.ts`

2. 以下のIPC通信フローが完成しているか確認:
   - `skill:execute` → 実行開始
   - `skill:stream` → ストリーミング受信
   - `skill:abort` → 中断
   - `skill:get-status` → 状態取得

3. 判定:
   - **全て実装済み**: 本タスクをクローズ（ステータス: 完了）
   - **不足あり**: Phase 1以降を実行

#### 成果物

- 確認レポート（`outputs/phase-0/verification-report.md`）

---

### Phase 1-13: 標準タスク仕様書フロー（不足がある場合のみ）

Phase 0で不足が確認された場合のみ、task-specification-creatorの標準フローに従って実行。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] TASK-3-2との重複確認が完了している
- [ ] 不足がある場合は実装が完了している
- [ ] ストリーミング通信が正常に動作する

### 品質要件

- [ ] テストカバレッジ基準を満たす（該当する場合）
- [ ] エラーハンドリングが適切

### ドキュメント要件

- [ ] 確認レポートが作成されている
- [ ] 本タスクのステータスが更新されている

---

## 6. 検証方法

### テストケース

| #   | テストケース           | 期待結果                           |
| --- | ---------------------- | ---------------------------------- |
| 1   | スキル実行開始         | UI上に実行開始が表示される         |
| 2   | ストリーミング出力受信 | リアルタイムでテキストが表示される |
| 3   | スキル実行中断         | 中断処理が正常に完了する           |
| 4   | エラー発生時           | エラーメッセージがUIに表示される   |

### 検証手順

1. スキル一覧からスキルを選択して実行
2. 実行中の出力がリアルタイムでUIに表示されることを確認
3. 実行中に「中断」ボタンをクリックして中断できることを確認
4. エラーが発生するスキルを実行してエラー表示を確認

---

## 7. リスクと対策

| リスク                      | 影響度 | 発生確率 | 対策                              |
| --------------------------- | ------ | -------- | --------------------------------- |
| TASK-3-2と完全重複          | 低     | 高       | Phase 0で確認し、重複ならクローズ |
| IPC通信のパフォーマンス問題 | 中     | 低       | バッファリング・スロットリング    |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| SkillExecutor仕様      | `aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` |
| Skill IPC セキュリティ | `aiworkflow-requirements/references/security-skill-ipc.md`            |
| タスクワークフロー     | `aiworkflow-requirements/references/task-workflow.md`                 |

### 関連タスク

| タスクID   | 関係     | 説明                      |
| ---------- | -------- | ------------------------- |
| TASK-3-1-A | 先行     | SkillExecutor Core実装    |
| TASK-3-2   | 重複候補 | SkillExecutor IPC Handler |
| TASK-5-1   | 先行     | SkillAPI Preload実装      |

---

## 9. 備考

### 発見元の原文

```
TASK-3-1-A完了時（blocks）
- SkillExecutor IPC Handler統合が後続タスクとして記録
- 優先度: 高
```

### 補足事項

- 本タスクはTASK-3-2の実装状況により、実行不要となる可能性が高い
- Phase 0（TASK-3-2との重複確認）を最優先で実行すること
- 重複が確認された場合は、本タスクをクローズし、task-workflow.mdを更新すること
