# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase      | 1                                                    |
| Phase名    | 要件定義                                             |
| カテゴリ   | 要件                                                 |
| 前提Phase  | なし                                                 |
| 後続Phase  | Phase 2                                              |
| タスク分類 | 新機能（Feature Gap 系）— UIコンポーネント + IPC実装 |
| 作成日     | 2026-04-06                                           |

## 目的

TASK-P0-08のスコープ・受入条件・前提条件を確定し、既存実装の状態を正確に把握する。
特に「TASK-SDK-08で実装済みの main 側 API」と「本タスクで実装する IPC / Renderer 側」の境界を明確にし、Phase 2 以降の設計入力を準備する。

---

## Step 0: P50チェック（必須）

Phase 1 開始前に、対象ファイルの現在の実装状態を確認し、重複作成を防止する。

### 確認対象ファイル

| ファイル                                                             | 確認コマンド                                                                                                                               |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `RuntimeSkillCreatorFacade.ts`                                       | `grep -n "listSessions\|resumeSession\|deleteSession\|cleanupExpired" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` |
| `packages/shared/src/ipc/channels.ts`                                | `grep -n "session" packages/shared/src/ipc/channels.ts`                                                                                    |
| `packages/shared/src/types/skillCreator.ts`                          | `grep -n "Session\|Checkpoint\|ResumeToken\|session_id" packages/shared/src/types/skillCreator.ts \| head -30`                             |
| `apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx` | `ls apps/desktop/src/renderer/components/skill/ \| grep -i session`                                                                        |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | `grep -n "session\|Session" apps/desktop/src/preload/skill-creator-api.ts`                                                                 |

### P50 確認結果記録テンプレート（実行前に必ず埋める）

```markdown
| ファイル                                          | 実装状態            | 備考                                    |
| ------------------------------------------------- | ------------------- | --------------------------------------- |
| RuntimeSkillCreatorFacade.ts（セッション管理API） | ○実装済み / ×未実装 | TASK-SDK-08で実装予定                   |
| channels.ts（session関連チャンネル）              | ○定義済み / ×未定義 | TASK-RT-06後に命名確定                  |
| skillCreator.ts（Session型定義）                  | ○定義済み / ×未定義 | SkillCreatorPersistedWorkflowCheckpoint |
| SessionResumePrompt.tsx                           | ○実装済み / ×未実装 | 本タスクで新規作成                      |
| SessionIndicator.tsx                              | ○実装済み / ×未実装 | 本タスクで新規作成                      |
| preload/skill-creator-api.ts（session API）       | ○追加済み / ×未追加 | 本タスクで追加                          |
```

**TASK-SDK-08が未完了の場合の対処**: `RuntimeSkillCreatorFacade.ts` にセッション管理メソッドが存在しない場合は本タスクを待機する。

---

## 実行タスク

### タスク1: TASK-SDK-08 完了確認と API 把握

**目的**: 依存タスクの完了状態を確認し、利用可能な API を把握する。

**手順**:

1. `RuntimeSkillCreatorFacade.ts` のセッション管理 API を確認する:

   ```bash
   grep -n "Session\|session\|checkpoint\|resume\|persist" \
     apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | head -40
   ```

2. 既存セッション関連型定義を確認する:

   ```bash
   grep -n "Session\|Checkpoint\|ResumeToken\|session_id" \
     packages/shared/src/types/skillCreator.ts | head -30
   ```

3. 既存の IPC チャンネル命名を確認する（TASK-RT-06 完了後の命名に従う）:

   ```bash
   grep -n "skill-creator" packages/shared/src/ipc/channels.ts | head -20
   ```

4. P0-06 で実装済みの `SkillLifecyclePanel.tsx` の現行フローを把握する:

   ```bash
   grep -n "useEffect\|useState\|Session\|interview" \
     apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -30
   ```

**期待される成果物**: API 確認メモ（`outputs/phase-1/spec-extraction-map.md`）

### タスク2: スコープと受入条件の確定

**目的**: AC-1〜AC-9 を詳細化し、Phase 2 以降の設計入力として確定する。

**受入条件（確定版）**:

| ID   | 受入条件                                                                                                                                 | 検証方法                                                        |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| AC-1 | アプリ起動時に未完了セッションが自動検出される（`listSessions()` IPC 呼び出し）                                                          | ユニットテスト + 手動テスト TC-03                               |
| AC-2 | 未完了セッションが存在する場合、`SessionResumePrompt` が表示され、「続きから再開」ボタンが押下可能                                       | ユニットテスト (SessionResumePrompt) + 手動テスト TC-03         |
| AC-3 | 「続きから再開」選択で `resumeSession(sessionId)` が呼ばれ、`workflowSnapshot` が取得されてセッションが継続される                        | 統合テスト AC-2 シナリオ + 手動テスト                           |
| AC-4 | 「削除して新規開始」選択で `deleteSession(sessionId)` が呼ばれ、新規セッションが開始される                                               | 統合テスト AC-3 シナリオ + 手動テスト                           |
| AC-5 | アクティブセッションの `session_id` と経過時間が `SessionIndicator` に表示される                                                         | ユニットテスト (SessionIndicator) + 手動テスト TC-06            |
| AC-6 | 期限切れセッションが `cleanupExpiredSessions()` IPC 経由で削除される                                                                     | 統合テスト AC-5 シナリオ                                        |
| AC-7 | `session_id` が SDK `resume` / `continue` 入力へ正しく再利用される（IPC 経由で main 側 Facade に渡る）                                   | 統合テスト AC-6 シナリオ                                        |
| AC-8 | manifest 互換性なし（`isCompatible: false`）の場合に警告バッジが表示され、`resumeSession` 失敗時には新規開始へフォールバックする         | ユニットテスト (SessionResumePrompt) + 統合テスト AC-7 シナリオ |
| AC-9 | IPC 経由でセッション一覧（`listSessions`）・セッション復元（`resumeSession`）・削除（`deleteSession`）・クリーンアップが取得・実行できる | 統合テスト AC-8 シナリオ                                        |

### タスク3: 責務境界の定義（P0-06 vs P0-08）

**この境界の明確化は P0-08 実装において最重要の設計判断**である。

| 状態の種類   | 責務タスク | 保持レイヤー                 | 保持期間                     | 具体例                                                                                                                            |
| ------------ | ---------- | ---------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **一時状態** | **P0-06**  | レンダラープロセス（メモリ） | ページリロードまで（揮発性） | messages、proficiency、currentStepIndex、selectedOptionIds、textAnswer、validationError（完全リストは useInterviewState.ts 参照） |
| **永続状態** | **P0-08**  | mainプロセス + SQLite        | アプリ再起動をまたいで永続化 | workflowSnapshot、checkpointId、planId、session_id、resume token（完全リストは SkillCreatorPersistedWorkflowCheckpoint 参照）     |

**P0-08 が触れてはいけない一時状態（P0-06 の領域）**:

- `useInterviewState` フック内の `messages`、`proficiency`、`currentStepIndex`
- フォーム入力値（`selectedOptionIds`、`textAnswer`、`secretAnswer`、`confirmAnswer`）
- バリデーションエラー（`validationError`）、送信中フラグ（`isSubmitting`）

---

## 参照資料

| 資料名                 | パス                                                                                  | 説明                       |
| ---------------------- | ------------------------------------------------------------------------------------- | -------------------------- |
| unassigned task 仕様書 | `docs/30-workflows/unassigned-task/TASK-P0-08-session-resume-renderer-integration.md` | 元タスク指示書（詳細仕様） |
| lane 共通不変条件      | `../root-workflow-pack/index.md`                                                      | lane 共通方針              |
| P0是正パック           | `../p0-verify-manifest-remediation-pack.md`                                           | 全体タスク構成             |
| IPC 型定義             | `packages/shared/src/ipc/channels.ts`                                                 | IPC チャンネル命名規則     |
| Skill Creator 型定義   | `packages/shared/src/types/skillCreator.ts`                                           | セッション関連型           |
| SkillLifecyclePanel    | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                  | 統合先コンポーネント       |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                    | 内容                       |
| ---------------- | ----------------------------------------------------------------------- | -------------------------- |
| IPC/Preload仕様  | `.claude/skills/aiworkflow-requirements/references/api-ipc-channels.md` | IPC チャンネル設計ガイド   |
| UI/UX仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-diagrams.md`   | UIコンポーネント設計       |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-preload.md` | contextBridge セキュリティ |

---

## 統合テスト連携【必須】

| 判定項目                  | 基準 | 備考                                                 |
| ------------------------- | ---- | ---------------------------------------------------- |
| ユニットテスト Line       | 80%+ | SessionResumePrompt / SessionIndicator / IPC handler |
| ユニットテスト Branch     | 60%+ | 互換性判定・エラー分岐を含む                         |
| ユニットテスト Function   | 80%+ |                                                      |
| 結合テスト API            | 100% | AC-1〜AC-9 全シナリオ                                |
| 結合テスト シナリオ正常系 | 100% | 復元成功・新規開始選択                               |
| 結合テスト シナリオ異常系 | 80%+ | 互換性なし・復元失敗・期限切れ                       |

---

## 成果物

| 成果物                 | パス                                     | 説明                                      |
| ---------------------- | ---------------------------------------- | ----------------------------------------- |
| spec-extraction-map.md | `outputs/phase-1/spec-extraction-map.md` | system spec と current code anchor の対応 |
| p50-check-result.md    | `outputs/phase-1/p50-check-result.md`    | P50チェック結果記録                       |

---

## 完了条件

- [ ] P50チェックが完了し、実装状態が確認されている
- [ ] TASK-SDK-08 の Facade API が利用可能であることが確認されている（または待機理由が記録されている）
- [ ] AC-1〜AC-9 が全て定義され、検証方法が明記されている
- [ ] P0-06 / P0-08 の責務境界が定義されている
- [ ] `spec-extraction-map.md` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計（IPC 4層設計、コンポーネントトポロジー、型定義）
