# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                         |
| ------------ | ---------------------------- |
| Phase        | 12                           |
| タスクID     | TASK-FIX-EXECUTE-PLAN-FF-001 |
| ステータス   | 未実施                       |
| 担当         | 実装者                       |
| 見積もり時間 | 1.5h                         |

## 目的

修正内容をシステム仕様書・実装ガイド・スキルフィードバックへ同期し、知識を再利用可能な状態にする。未タスクの検出と記録も行う。

## 実行タスク

1. `implementation-guide.md` の作成（Part 1: 中学生レベル例え話 + Part 2: 技術詳細）
2. `system-spec-update-summary.md` の作成（仕様書更新内容のサマリー）
3. `documentation-changelog.md` の作成（変更履歴）
4. `unassigned-task-detection.md` の作成（未タスク検出）
5. `skill-feedback-report.md` の作成（スキルフィードバック）

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                           | 内容                      |
| ------------------ | ------------------------------------------------------------------------------ | ------------------------- |
| セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | Electron IPC セキュリティ |
| アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | システム全体像            |
| タスクワークフロー | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了タスク記録            |

## 実行手順

### ステップ 1: implementation-guide.md の作成

**ファイル**: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベル例え話

「IPC fire-and-forget パターン」を中学生でも理解できる言葉で説明する:

**例え話: 宅配注文と配達通知**

従来の仕組み（ブロッキング）:
「宅配会社に電話して注文する。配達員が商品を届けるまで電話を切らずに待つ。30 分後に商品が届いたら電話を切る。→ 電話がつながりっぱなしで 30 分かかる（タイムアウトする）」

修正後の仕組み（fire-and-forget）:
「宅配会社に電話して注文する。宅配会社が『注文を受け付けました（accepted）』と言ったら電話を切る。商品が届いたら宅配会社から『届きました（STATE_CHANGED）』と別の電話が来る。→ 最初の電話は 1 秒以内に終わる」

#### Part 2: 技術詳細

1. **CHANNEL_TIMEOUTS への追加**:
   - 場所: `apps/desktop/src/preload/ipc-utils.ts`
   - 変更: `"skill-creator:execute-plan": 1_800_000` を追加
   - 理由: P0 暫定対応として 30 分タイムアウトを設定。本来は fire-and-forget のため不要になるが、既存 `safeInvoke` との互換性のため残す

2. **creatorHandlers.ts の fire-and-forget 化**:
   - `await runtimeSkillCreatorService.execute()` を `void facade.executeAsync()` に変更
   - ハンドラーは即座に `{ accepted: true, planId }` を返す
   - `void` キーワードで ESLint の `no-floating-promises` に対応

3. **SkillCreatorWorkflowEngine の onPhaseChanged**:
   - `PhaseChangedCallback` 型を export
   - `onPhaseChanged?: PhaseChangedCallback` を optional property として追加
   - フェーズ遷移メソッド内で `this.onPhaseChanged?.(phase, progress)` を呼ぶ

4. **RuntimeSkillCreatorFacade の executeAsync**:
   - `executeAsync(planId, req): Promise<void>` を追加
   - `engine.onPhaseChanged` を `webContents.send(STATE_CHANGED)` にワイヤリング
   - catch ブロックで `phase: 'failed'` を STATE_CHANGED に通知し、外部に throw しない

### ステップ 2: system-spec-update-summary.md の作成

**ファイル**: `outputs/phase-12/system-spec-update-summary.md`

以下の仕様書を更新・参照する:

| 仕様書                       | 更新内容                                                                        | 優先度 |
| ---------------------------- | ------------------------------------------------------------------------------- | ------ |
| `security-electron-ipc.md`   | IPC fire-and-forget パターンを IPC ベストプラクティスとして追記                 | should |
| `architecture-overview.md`   | スキル生成フローの非同期アーキテクチャ（fire-and-forget + STATE_CHANGED）を記録 | should |
| `task-workflow-completed.md` | TASK-FIX-EXECUTE-PLAN-FF-001 の完了を記録                                       | must   |

### ステップ 3: documentation-changelog.md の作成

**ファイル**: `outputs/phase-12/documentation-changelog.md`

変更履歴:

```
## 2026-04-01

### TASK-FIX-EXECUTE-PLAN-FF-001: skill-creator:execute-plan fire-and-forget 化

**変更ファイル**:
- apps/desktop/src/preload/ipc-utils.ts: CHANNEL_TIMEOUTS に execute-plan 追加
- apps/desktop/src/main/ipc/creatorHandlers.ts: fire-and-forget 化
- apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts: onPhaseChanged callback 追加
- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts: executeAsync 追加

**修正内容**: 30 分かかるスキル生成 IPC の非ブロッキング化

**PR**: #XXXX
```

### ステップ 4: unassigned-task-detection.md の作成

**ファイル**: `outputs/phase-12/unassigned-task-detection.md`

本修正の調査・実装過程で検出された未タスク候補:

| 未タスク候補                                            | 内容                                                                                                 | 優先度 | 推奨タスクID                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------ | ------------------------------------ |
| `CHANNEL_TIMEOUTS` P0 値の恒久対応                      | 1_800_000 は暫定値。fire-and-forget 完全移行後は Renderer 側の `safeInvoke` 呼び出し方式見直しが必要 | low    | TASK-IPC-CHANNEL-TIMEOUT-CLEANUP-001 |
| before-quit guard の実装                                | アプリ終了時にバックグラウンド実行中のスキル生成を適切に処理する機能                                 | medium | 別タスク（要検討）                   |
| `skill-creator:*` 他ハンドラーの fire-and-forget 化調査 | 同様の問題が他ハンドラーに存在しないか確認                                                           | low    | TASK-CREATOR-HANDLERS-AUDIT-001      |

### ステップ 5: skill-feedback-report.md の作成

**ファイル**: `outputs/phase-12/skill-feedback-report.md`

`task-specification-creator` スキルへのフィードバック:

1. **良かった点**:
   - Phase 2 の 4 concern 設計が実装との対応が明確
   - Phase 3 の IPC 4 層整合性チェックで breaking change を早期発見

2. **改善提案**:
   - Phase 4 のテストファイルセットアップコードをもう少し具体的に記述する（`ipcMain` モック方法の明記）
   - Phase 9 のリスク評価で「Renderer 側の戻り値変更影響」を Phase 3 に前倒しする

## 多角的チェック観点

- `implementation-guide.md` の Part 1 が「中学生レベル」（技術用語なしで説明）になっているか確認したか
- `unassigned-task-detection.md` の未タスクが実際の調査・実装過程で発見したものになっているか（架空のタスクを記載していないか）
- `skill-feedback-report.md` の「改善提案」が次回の仕様書品質向上に具体的に役立つ内容になっているか

## 成果物

| 成果物               | パス                                             | 説明                                                |
| -------------------- | ------------------------------------------------ | --------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`       | Part 1 中学生レベル例え話 + Part 2 技術詳細         |
| 仕様書更新サマリー   | `outputs/phase-12/system-spec-update-summary.md` | 更新対象仕様書と更新内容                            |
| ドキュメント変更履歴 | `outputs/phase-12/documentation-changelog.md`    | 変更ファイル一覧と変更内容                          |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`  | 本タスクで検出された未タスク候補                    |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`      | task-specification-creator スキルへのフィードバック |

## 完了条件

- [ ] `implementation-guide.md` の Part 1（中学生レベル例え話）が完成している
- [ ] `implementation-guide.md` の Part 2（技術詳細）が完成している
- [ ] `system-spec-update-summary.md` に更新対象仕様書が記録されている
- [ ] `task-workflow-completed.md` に TASK-FIX-EXECUTE-PLAN-FF-001 の完了が記録されている
- [ ] `unassigned-task-detection.md` に未タスク候補が記録されている
- [ ] `skill-feedback-report.md` に具体的なフィードバックが記録されている

## タスク100%実行確認【必須】

- [ ] 全実行タスクが完了している
- [ ] 全成果物が存在する（5 ファイル）
- [ ] 全完了条件が満たされている

## 次Phase

Phase 13: PR作成 へ進む（ユーザーの明示承認後のみ）
