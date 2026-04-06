# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 12                            |
| 機能名 | rt-04-authkey-component-dedup |
| 作成日 | 2026-04-06                    |

## 目的

実装完了後のドキュメントを整備し、システム仕様更新サマリー・実装ガイド・更新履歴・未タスク検出レポート・スキルフィードバックレポート・準拠確認レポートを作成する。

> **重要: Task 12-1〜12-6 の全タスクを完了することが必須。1つでも未完了のまま Phase 13 に進んではならない。**

---

## 実行タスク

### Task 12-1: 実装ガイド作成

`outputs/phase-12/implementation-guide.md` を以下の2パート構成で作成する。

#### Part 1: 中学生レベルの説明（専門用語なし）

- 日常の例え話を使って「フック統合」の概念を説明する
- 「たとえば」を最低1回は明示する
- `useAuthKeyManagement` が何をするのかをわかりやすく述べる
- 技術用語（IPC、フック、型定義など）を一切使わない
- **例え話のテーマ例**: 「同じ作業を2人でバラバラにやっていたのを、1人の専門家に任せるようにした」など

#### Part 2: 技術者レベルの説明

以下の4項目を必ず含める:

1. **useAuthKeyManagement インターフェース定義**

   ```typescript
   // current contract と target delta を分けて記載する
   interface UseAuthKeyManagementReturn {
     status: ApiKeyStatus;
     keySource: "saved" | "env-fallback" | null;
     inputValue: string;
     isSubmitting: boolean;
     validationError: string | null;
     apiError: string | null;
     setInputValue: (value: string) => void;
     handleSave: () => Promise<boolean>;
     handleDelete: () => Promise<boolean>;
     refresh: () => Promise<boolean>;
   }

   interface UseAuthKeyManagementOptions {
     onStatusChange?: (status: ApiKeyStatus) => void;
   }
   ```

2. **ApiKeyStatus 型定義**（`packages/shared/src/types/skillCreator.ts` の定義を転記）

3. **使用例**（AuthKeySection・ApiKeySettingsPanel 両方からの呼び出し例）

4. **エラーハンドリング**（IPC 呼び出し失敗時の動作）
   - `handleDelete` 失敗時: `status="error"` + `apiError` を設定し、ステータスメッセージ欄に表示する
   - `refresh` 失敗時: `status="check-failed"` + `apiError` を設定し、ステータスメッセージ欄に表示する

---

### Task 12-2: システム仕様書更新（4サブステップ + Step 2）

#### Step 1-A: タスク完了記録

以下のファイルに完了タスクセクションを追加・更新する:

| ファイル                                                                   | 更新内容                                                   |
| -------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`（または相当ファイル）     | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001 完了エントリ追加    |
| `.claude/skills/task-specification-creator/LOGS.md`（または相当ファイル）  | TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001 完了エントリ追加    |
| `.claude/skills/aiworkflow-requirements/SKILL.md`（または相当ファイル）    | スキル実績として記録                                       |
| `.claude/skills/task-specification-creator/SKILL.md`（または相当ファイル） | スキル実績として記録                                       |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              | useAuthKeyManagement・ApiKeyStatus 統一を topic として追記 |

```bash
# 更新対象ファイルの確認
ls .claude/skills/aiworkflow-requirements/
ls .claude/skills/task-specification-creator/
ls .claude/skills/aiworkflow-requirements/references/
ls .claude/skills/aiworkflow-requirements/indexes/
```

#### Step 1-B: 実装状況テーブル更新

以下のファイルで `TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001` のステータスを `completed` に更新する:

```bash
# 実装状況テーブルの検索
grep -rn "TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001" \
  .claude/skills/aiworkflow-requirements/references/task-workflow*.md
```

更新内容:

| 更新対象                                                                       | 変更前   | 変更後     |
| ------------------------------------------------------------------------------ | -------- | ---------- |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 未実施   | completed  |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 未記録   | 追加       |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`   | 残存     | 削除/移管  |
| 完了日                                                                         | （空欄） | 2026-04-06 |

#### Step 1-C: 関連タスクテーブル更新

Issue #1903 に関連するタスクテーブルを更新する:

```bash
# 関連 Issue の確認
grep -rn "1903\|authkey-component-dedup" \
  .claude/skills/aiworkflow-requirements/references/task-workflow*.md \
  .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md \
  .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md \
  .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md
```

#### Step 1-D: topic-map.md 再生成

`topic-map.md` と `keywords.json` を current facts へ同期するため、次を実行する:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

#### Step 2: 新規インターフェース追加

`useAuthKeyManagement` と `ApiKeyStatus` の target delta を current contract へ反映する。
IPC 契約は変更しないため、`api-ipc-system-core.md` は no-op 判定の可能性が高いが、判定理由は必ず記録する。

```bash
# 更新対象の確認
grep -rn "ApiKeyStatus\|AuthKeySection" \
  .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md \
  .claude/skills/aiworkflow-requirements/references/ui-ux-settings-core.md
```

追記内容:

- `interfaces-agent-sdk-skill-reference.md`: `ApiKeyStatus` の current contract を更新
- `ui-ux-settings-core.md`: `AuthKeySection` の状態表示契約と source 優先表示を更新
- `api-ipc-system-core.md`: IPC 仕様が変わらない場合は no-op を明記
- `task-workflow.md` / `task-workflow-completed.md` / `task-workflow-backlog.md`: current facts と完了状態を同期

---

### Task 12-3: ドキュメント更新履歴作成

`outputs/phase-12/documentation-changelog.md` を作成し、Step 1-A〜1-D・Step 2 の結果を個別に記録する。

**記録フォーマット:**

```markdown
## Step 1-A: タスク完了記録

- 更新ファイル: （ファイルパス）
- 更新内容: （変更した内容の要約）
- current / baseline: （どちらを正としたか）
- validator 結果: （実行コマンドと PASS/FAIL）
- artifacts.json / outputs/artifacts.json: （同期結果）
- 結果: DONE / SKIPPED（スキップ理由を記載）

## Step 1-B: 実装状況テーブル更新

（同上）

## Step 1-C: 関連タスクテーブル更新

（同上）

## Step 1-D: topic-map.md 再生成

（同上）

## Step 2: 新規インターフェース追加

（同上）
```

---

### Task 12-4: 未タスク検出レポート作成（0件でも出力必須）

`outputs/phase-12/unassigned-task-detection.md` を作成する。

**検出対象:**

| MINOR ID  | 内容                                               | 未タスク化の要否        |
| --------- | -------------------------------------------------- | ----------------------- |
| TECH-M-01 | `ApiKeySettingsPanel` 廃止（委譲実装後の後続作業） | **要** → 未タスク化する |

**未タスク化フォーマット（TECH-M-01）:**

```markdown
## 未タスク: ApiKeySettingsPanel 廃止

- タスクID（仮）: TASK-RT-04-APIKEYPANEL-REMOVAL-001
- 由来: TECH-M-01（Phase 3 MINOR 指摘）
- 内容: ApiKeySettingsPanel を AuthKeySection への委譲実装後に削除する
- 前提条件: AuthKeySection への完全委譲が確認されていること
- 呼び出し元変更が必要: SkillLifecyclePanel など
- ステータス: unassigned
- 参照 Issue: #1903
```

> 未タスクが 0 件の場合でも「検出なし」と明記してファイルを作成すること。

---

### Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）

`outputs/phase-12/skill-feedback-report.md` を作成する。

**記録内容:**

| 項目                       | 内容                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------- |
| 実行したスキル・フェーズ   | task-specification-creator（Phase 1〜13） / aiworkflow-requirements（references sync） |
| 良かった点                 | （記載する）                                                                           |
| 改善提案                   | （あれば記載、なければ「なし」）                                                       |
| フック統合パターンの汎用性 | 他タスクへの応用可否を記載                                                             |

> 改善点が 0 件の場合でも「改善提案: なし」と明記してファイルを作成すること。

---

### Task 12-6: Phase 12 コンプライアンスチェック

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-6 の完了状況を記録する。

| タスク    | 成果物パス                                               | 完了 |
| --------- | -------------------------------------------------------- | ---- |
| Task 12-1 | `outputs/phase-12/implementation-guide.md`               | [ ]  |
| Task 12-2 | システム仕様書各ファイル（Step 1-A〜1-D・Step 2）        | [ ]  |
| Task 12-3 | `outputs/phase-12/documentation-changelog.md`            | [ ]  |
| Task 12-4 | `outputs/phase-12/unassigned-task-detection.md`          | [ ]  |
| Task 12-5 | `outputs/phase-12/skill-feedback-report.md`              | [ ]  |
| Task 12-6 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | [ ]  |

---

## 参照資料

| 参照資料             | パス                                                              | 内容                            |
| -------------------- | ----------------------------------------------------------------- | ------------------------------- |
| システム仕様         | `.claude/skills/aiworkflow-requirements/references/`              | AIWorkflowOrchestrator 正本仕様 |
| 未タスクガイドライン | `docs/30-workflows/unassigned-task/unassigned-task-guidelines.md` | 未タスク化の手順・フォーマット  |
| 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)                | AC-1〜AC-6                      |
| 設計レビュー         | [phase-3-design-review.md](phase-3-design-review.md)              | TECH-M-01・TECH-M-02            |
| 手動テスト結果       | [phase-11-manual-test.md](phase-11-manual-test.md)                | Phase 11 成果物                 |
| useAuthKeyManagement | `apps/desktop/src/renderer/hooks/useAuthKeyManagement.ts`         | 実装済みフック                  |
| ApiKeyStatus 型      | `packages/shared/src/types/skillCreator.ts`                       | 共有型定義                      |

---

## 統合テスト連携【必須】

| 判定項目                            | 基準                                                    | 確認方法                                              |
| ----------------------------------- | ------------------------------------------------------- | ----------------------------------------------------- |
| Task 12-1 実装ガイド（2パート構成） | Part 1（中学生レベル）・Part 2（技術者レベル）両方あり  | `outputs/phase-12/implementation-guide.md` の内容確認 |
| Task 12-2 システム仕様書更新        | Step 1-A〜1-D・Step 2 全実施                            | `documentation-changelog.md` の記録                   |
| Task 12-4 未タスク検出レポート      | TECH-M-01 が未タスク化されている（0件でもファイル必須） | `unassigned-task-detection.md` の存在                 |
| Task 12-5 スキルフィードバック      | 改善点なしでもファイル必須                              | `skill-feedback-report.md` の存在                     |
| Task 12-6 コンプライアンスチェック  | 全タスク完了チェック済み                                | `phase12-task-spec-compliance-check.md`               |

---

## 成果物

| 成果物                            | パス                                                     | 説明                                      |
| --------------------------------- | -------------------------------------------------------- | ----------------------------------------- |
| 実装ガイド                        | `outputs/phase-12/implementation-guide.md`               | 2パート（中学生・技術者）構成             |
| システム仕様書更新サマリー        | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-D・Step 2 の更新結果まとめ    |
| ドキュメント更新履歴              | `outputs/phase-12/documentation-changelog.md`            | 各ステップの変更記録                      |
| 未タスク検出レポート              | `outputs/phase-12/unassigned-task-detection.md`          | TECH-M-01 の未タスク化記録（0件でも出力） |
| スキルフィードバックレポート      | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0件でも出力）                     |
| Phase 12 コンプライアンスチェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 完了状況                  |

---

## 完了条件

- [ ] Task 12-1: 実装ガイド作成（Part 1・Part 2 両方）
- [ ] Task 12-2: システム仕様書更新（Step 1-A・1-B・1-C・1-D・Step 2 全実施）
- [ ] Task 12-3: ドキュメント更新履歴作成
- [ ] Task 12-4: 未タスク検出レポート作成（TECH-M-01 未タスク化・0件でも出力）
- [ ] Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力）
- [ ] Task 12-6: Phase 12 コンプライアンスチェック完了
- [ ] 全成果物（6ファイル）が `outputs/phase-12/` に存在する
- [ ] **本 Phase 内の全タスク（12-1〜12-6）を 100% 実行完了**

---

## タスク100%実行確認【必須】

| タスク                                                 | 完了 |
| ------------------------------------------------------ | ---- |
| Task 12-1: 実装ガイド作成（2パート）                   | [ ]  |
| Task 12-2: システム仕様書更新（Step 1-A〜1-D・Step 2） | [ ]  |
| Task 12-3: ドキュメント更新履歴作成                    | [ ]  |
| Task 12-4: 未タスク検出レポート作成                    | [ ]  |
| Task 12-5: スキルフィードバックレポート作成            | [ ]  |
| Task 12-6: Phase 12 コンプライアンスチェック           | [ ]  |

---

## 次のPhase

Phase 13: PR 作成（[phase-13-pr-creation.md](phase-13-pr-creation.md)）

**Task 12-1〜12-6 の全タスクが完了した場合のみ Phase 13 へ進むこと。**
**1タスクでも未完了の場合は Phase 13 に進んではならない。**
