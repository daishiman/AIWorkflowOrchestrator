# Phase 2: 設計

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 2                                        |
| タスクID     | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| ステータス   | 未実施                                   |
| 担当         | 実装者                                   |
| 見積もり時間 | 0.5h                                     |

## 目的

既存実装のアーキテクチャを検証し、不足している追加テストと文書化の設計を確定する。特に `app.exit(0)` 前クリーンアップの設計方針を決定する。

## 実行タスク

1. P50 チェック結果を踏まえて既存実装の境界を確認する
2. `hasRunningExecution()` と `beforeQuitGuard` の依存関係を設計に固定する
3. 追加テストケース TC-F-04〜TC-F-08 / TC-B-04〜TC-B-05 の役割を確定する
4. `app.exit(0)` の既知リスクを Phase 12 の文書化対象として整理する

## 設計トポロジー

### コンポーネント構成

```
[Electron app.on('before-quit')]
         │
         ▼
[registerBeforeQuitGuard]  ← ipc/beforeQuitGuard.ts
         │
         ├─ facade.hasRunningExecution() ── false → 早期 return（通常終了）
         │
         └─ true → event.preventDefault()
                    │
                    ▼
           [dialog.showMessageBox]
                    │
              ┌─────┴─────┐
              │           │
           response=0  response=1
           「中断して終了」  「キャンセル」
              │
              ▼
          app.exit(0)    ← 即時強制終了
```

### hasRunningExecution() の状態管理

```
RuntimeSkillCreatorFacade
  ├─ activeExecutionCount: number = 0   （プライベートフィールド）
  ├─ executeAsync(planId, args)
  │    └─ execute(planResult, authMode, apiKey)
  │         └─ activeExecutionCount += 1 ← 実行開始
  │            try { ... } finally {
  │              activeExecutionCount = Math.max(0, activeExecutionCount - 1)
  │            }                        ← 完了/失敗時に減算
  └─ hasRunningExecution(): boolean
       └─ return activeExecutionCount > 0
```

## 設計決定事項

### 決定 1: `app.exit(0)` 前クリーンアップ — 「既知リスクとして受容」

**問題**: ユーザーが「中断して終了」を選択した場合、`app.exit(0)` が即時呼ばれ LLM 処理が中断される。
スキル生成の成果物ファイルが中途半端な状態になる可能性がある。

**設計方針**: **既知リスクとして受容し、文書化する**

**根拠**:

1. スキル生成の成果物は `.claude/skills/` への書き込みだが、Claude Code が atomic write で管理するため部分書き込みリスクは低い
2. graceful shutdown（LLM API の中断待機）は `claude-agent-sdk` の `AbortController` サポートに依存するが、現時点では実装コストが高い
3. ユーザーは「中断して終了」を選択した時点でデータ損失リスクを許容している
4. アプリ再起動時にチェックポイントから再開できる仕組みが `SkillCreatorWorkflowEngine` にある

**文書化**: Phase 12 の `implementation-guide.md` に既知制限として明記する。

### 決定 2: テスト設計方針

既存テスト（TC-B-01〜TC-B-03）は `beforeQuitGuard.ts` の外部動作を検証済み。
追加すべきテストは `RuntimeSkillCreatorFacade` の `hasRunningExecution()` の内部カウンタ動作。

**既存テストファイル**: `RuntimeSkillCreatorFacade.notification.test.ts`

| テストケース | 検証内容                                 |
| ------------ | ---------------------------------------- |
| TC-F-04      | execute 実行中は true を返す             |
| TC-F-05      | execute 完了後は false に戻る            |
| TC-F-06      | 並行2件実行中は true を返す              |
| TC-F-07      | 1件完了後も残り1件実行中なら true を返す |
| TC-F-08      | 全件完了後は false に戻る                |

### 決定 3: `beforeQuitGuard.test.ts` への追加テスト

既存テストに不足しているケースを Phase 6（テスト拡充）で追加。

| テストケース | 検証内容                                                           |
| ------------ | ------------------------------------------------------------------ |
| TC-B-04      | response=0 時に app.exit(0) が呼ばれる                             |
| TC-B-05      | dialog.showMessageBox が reject した場合に console.warn が呼ばれる |

## 変更対象ファイル

| ファイル                                                                                          | Phase | 変更種別 | 内容                               |
| ------------------------------------------------------------------------------------------------- | ----- | -------- | ---------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | 4     | 既存確認 | TC-F-04〜TC-F-08                   |
| `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`                                     | 6     | 追加     | TC-B-04〜TC-B-05                   |
| 実装ファイル（`beforeQuitGuard.ts`, `RuntimeSkillCreatorFacade.ts`）                              | 5     | 検証のみ | 変更不要（既存実装が要件を満たす） |

## 成果物

| 成果物          | パス                                 | 説明                           |
| --------------- | ------------------------------------ | ------------------------------ |
| design-topology | `outputs/phase-2/design-topology.md` | 設計トポロジーと設計決定の記録 |

## 参照資料

| 参照資料              | パス                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| Electron IPC 設計     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`             |
| Facade アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`       |
| before-quit 教訓      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-conversation-db-robustness.md` |

## 統合テスト連携

Phase 4 / 6 のユニットテストで AC-4〜AC-7 を検証。
Phase 11 の手動テストで実際のダイアログ表示を目視確認する。

## 完了条件

- [ ] 設計トポロジー（コンポーネント構成・状態管理）の文書化完了
- [ ] `app.exit(0)` クリーンアップの設計方針決定（受容 or 対処）
- [ ] 追加テストケース（TC-F-04〜TC-F-08, TC-B-04〜TC-B-05）の設計完了
- [ ] `outputs/phase-2/design-topology.md` に記録完了

## タスク 100% 実行確認【必須】

- [ ] 設計決定事項 1〜3 を全て確定した
- [ ] 変更対象ファイル一覧を確定した
- [ ] Phase 3 レビューに必要な情報が揃っている

## 次 Phase

Phase 2 完了後、Phase 3（設計レビューゲート）に進む。
