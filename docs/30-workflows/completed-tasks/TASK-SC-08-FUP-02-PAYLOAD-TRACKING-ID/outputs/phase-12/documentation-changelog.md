# Phase 12: documentation changelog

## メタ情報

| 項目       | 値                                    |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID |
| タスク種別 | NON_VISUAL code task                  |
| Task       | 12-3                                  |

## Phase spec 再構成サマリ

| 変更点                                                             | 内容                                                                                                                                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 11 を NON_VISUAL 固定                                        | `phase-11-manual-test.md` を NON_VISUAL code task 代替証跡（NV-01〜NV-05）ベースに再構成。UI スクリーンショット不要を明示                                            |
| Phase 11 artifact 3 点化                                           | `manual-test-result.md`（正本） + `manual-test-checklist.md` + `discovered-issues.md` の構成に統一                                                                   |
| Phase 12 artifact 6 点化                                           | implementation-guide / system-spec-update-summary / documentation-changelog / unassigned-task-detection / skill-feedback-report / phase12-task-spec-compliance-check |
| Phase 13 artifact 4 点化 + user 承認ゲート                         | local-check-result / change-summary / pr-info は draft 許可。pr-creation-result は user 承認後のみ作成                                                               |
| `index.md` / `artifacts.json` / `outputs/artifacts.json` の parity | Phase 11 / 12 / 13 の artifact 一覧を同期                                                                                                                            |

## artifact 名統一（Phase 11 / 12 / 13 全成果物）

### Phase 11

| #   | パス                                        |
| --- | ------------------------------------------- |
| 1   | `outputs/phase-11/manual-test-result.md`    |
| 2   | `outputs/phase-11/manual-test-checklist.md` |
| 3   | `outputs/phase-11/discovered-issues.md`     |

### Phase 12

| #   | パス                                                     |
| --- | -------------------------------------------------------- |
| 1   | `outputs/phase-12/implementation-guide.md`               |
| 2   | `outputs/phase-12/system-spec-update-summary.md`         |
| 3   | `outputs/phase-12/documentation-changelog.md`            |
| 4   | `outputs/phase-12/unassigned-task-detection.md`          |
| 5   | `outputs/phase-12/skill-feedback-report.md`              |
| 6   | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

### Phase 13

| #   | パス                                     | 状態                                  |
| --- | ---------------------------------------- | ------------------------------------- |
| 1   | `outputs/phase-13/local-check-result.md` | draft（承認前作成可）                 |
| 2   | `outputs/phase-13/change-summary.md`     | draft（承認前作成可）                 |
| 3   | `outputs/phase-13/pr-info.md`            | draft（承認前作成可）                 |
| 4   | `outputs/phase-13/pr-creation-result.md` | user 承認後のみ作成（本 task 対象外） |

## 参照資料更新予定内容サマリ

### `api-ipc-system-skill-creator.md`

| 変更種別 | 対象節                           | 内容                                                                                                                           |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 追記     | `skill-creator:progress` payload | `planId?: string`（どの plan の progress か識別） / `requestId?: string`（監査用 request 単位 ID）を optional field として追記 |
| 追記     | 後方互換節                       | 「未設定の場合は既存クライアントとの後方互換を保つため受信側で受け入れる」旨を明示                                             |
| 関連 AC  | —                                | AC-1 / AC-2 / AC-6                                                                                                             |

### `lessons-learned-stream-001-progress-callback.md`

| 変更種別 | 対象節                | 内容                                                                                                                                    |
| -------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 追記     | filter-by-planId 契約 | `useStreamingProgress` 受信側は `options.planId` と `progress.planId` が両方ある場合のみ filter、一方でも未設定なら受け入れる規約を明示 |
| 追記     | エッジケース          | 空文字 / undefined の扱い、`options.planId` 未指定時の全通知受け入れ、useEffect 依存配列での再購読動作                                  |
| 関連 AC  | —                     | AC-3 / AC-4 / AC-5 / AC-6 / AC-7                                                                                                        |

### 更新実施タイミング

spec-only task のため、本 changelog では「更新予定内容」を確定させ、**実更新は実コード導入と同じ波で実施**する。

## Phase 13 draft との関係

- 本 changelog で統一した artifact 名は Phase 13 `change-summary.md` / `pr-info.md` からも参照される
- `pr-creation-result.md` は user 承認後に作成するため、本 changelog の Phase 13 節では「status: 承認待ち」のみ記録する

## 参照

- `phase-12-documentation.md` Task 12-3
- `index.md` Phase 一覧
- `artifacts.json` / `outputs/artifacts.json`
