# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Phase      | 9                                                                                              |
| Phase名    | 品質検証                                                                                       |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                                                   |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング） |
| 後続Phase  | Phase 10（最終レビュー）                                                                       |
| ステータス | not_started                                                                                    |
| 作成日     | 2026-03-13                                                                                     |
| 更新日     | 2026-03-17                                                                                     |
| 機能名     | workspace-chat-panel-runtime-alignment                                                         |

## 目的

Workspace Chat Panel の UX / security / state 整合を品質ゲートに基づいて検証する。Lint / 型チェック / 全テスト実行の結果を記録し、Phase 10（最終レビュー）に進む判断材料を揃える。

## 実行タスク

### T9-1: 品質ゲート実行

以下の品質ゲートを全て実行し、結果を記録する。

| ゲート    | コマンド                                                                          | 合格基準                              |
| --------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| Lint      | `cd apps/desktop && pnpm lint`                                                    | warning 0、error 0                    |
| TypeCheck | `cd apps/desktop && pnpm typecheck`                                               | error 0                               |
| Unit Test | `cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/`            | 全 PASS                               |
| Main Test | `cd apps/desktop && pnpm vitest run src/main/handlers/llm`                        | 全 PASS                               |
| Full Test | `cd apps/desktop && pnpm vitest run`                                              | 全 PASS（回帰なし）                   |
| Coverage  | `cd apps/desktop && pnpm vitest run --coverage src/renderer/views/WorkspaceView/` | Line 80%+、Branch 60%+、Function 80%+ |
| Security  | `grep -rn "homedir\|__dirname\|process.env" src/renderer/` + path traversal 検査  | 0 findings                            |

### T9-2: 品質観点チェック

stream UX / file context / guidance / cancel / security の品質観点を確認する。

| 品質観点       | 確認内容                                                                             | 期待結果                                                     |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| stale chunk    | cancel 後に前回の streaming chunk が表示に残らないか                                 | cancel 時に streamContent がクリアされている                 |
| 誤添付         | file read failure の file が context chips に残存しないか                            | read failure 時に該当 file が chips から除外される           |
| 誤成功表示     | API key 不足時に送信ボタンが活性化されないか                                         | access capability が unavailable 時に送信が非活性            |
| guidance 不足  | unavailable / blocked 状態で次アクションが表示されているか                           | GuidanceBlock に Settings 導線または terminal handoff がある |
| error masking  | IPC エラーメッセージに内部パス（homedir 等）が含まれないか                           | error.message に `/Users/` や `C:\` が含まれない             |
| P62 fallback   | selectedModelId が null のまま送信を試みた場合に DEFAULT_CONFIG へ fallback しないか | VALIDATION_ERROR が返され、送信が実行されない                |
| compact layout | panel 幅 360px 以下で CTA と guidance が切れないか                                   | compact 幅でも送信 / cancel / terminal ボタンが操作可能      |

### T9-4: セキュリティスキャン

file context の path traversal / conversation データ保護 / error masking のセキュリティ観点を確認する。

| セキュリティ観点        | 確認内容                                                                      | 期待結果                                                 |
| ----------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------- |
| path traversal          | file context で `../` や絶対パスを含むファイル指定が拒否されるか              | buildFileContextBlock がパス正規化と範囲検証を行う       |
| conversation データ保護 | conversation create / addMessage で未サニタイズの入力が保存されないか         | 入力値がサニタイズされてから SQLite に保存される         |
| error masking           | IPC エラーレスポンスに `homedir` / `__dirname` / `process.env` が含まれないか | sanitizeError で内部情報がマスクされている               |
| API key 非漏洩          | Renderer 側のログやエラーメッセージに API key が露出しないか                  | API key は Main Process 内に留まり Renderer に到達しない |

### T9-3: 欠陥検出観点の整理

Phase 10 で重点確認すべき欠陥パターンを整理する。

| 欠陥パターン             | 発生条件                                        | 検出方法                               |
| ------------------------ | ----------------------------------------------- | -------------------------------------- |
| stream と cancel の race | cancel と stream 完了が同時に到達する           | concurrent mock で cancel/end 同時送信 |
| conversation ID leak     | conversation create 失敗後にメッセージ送信する  | create mock を reject に設定           |
| mention 候補の stale     | file tree 更新後に mention 候補が古いまま残る   | file tree mock を更新し候補を再取得    |
| transcript auto-send     | terminal dock open 時に自動で chat に入力される | dock open 後の composer.value を検証   |

## 参照資料

| 参照資料                    | パス                                                                                | 内容                                 |
| --------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 5（実装）             | `phase-5-implementation.md`                                                         | 実配線後の品質観点を確認する         |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                            | リファクタ結果を確認する             |
| WorkspaceChatPanel          | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | stream UX と guidance 表示を確認する |
| useWorkspaceChatController  | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | state drift 観点を確認する           |
| llm handlers                | `apps/desktop/src/main/handlers/llm.ts`                                             | error masking と P62 対策を確認する  |
| completed task 059a         | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md`  | 既存 UI 正本との drift を確認する    |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                         | 内容                                                                                               |
| --------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| security-electron-ipc | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | error masking / path traversal / API key 非漏洩の正本を確認する（T9-4 セキュリティスキャンの根拠） |
| llm-streaming         | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`         | stream / cancel 契約（T9-2 stale chunk / race condition 検証の根拠）を確認する                     |
| error-handling        | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | fail-fast / guidance / silent の error category 分類（T9-2 品質観点チェックの根拠）を確認する      |
| arch-state-management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | state drift（cancel / stream race condition）の正本を確認する                                      |

## 実行手順

### ステップ1: Phase 8 成果物の確認

Phase 8 のリファクタ計画と実施結果を読み、変更されたファイルを把握する。

### ステップ2: T9-1 品質ゲート実行

7 つの品質ゲート（Lint / TypeCheck / Unit Test / Main Test / Full Test / Coverage / Security）を順次実行し、結果を記録する。

品質ゲート未達時の修正フロー:

| ゲート未達            | 修正方針                                                                    | 修正後の確認                                              |
| --------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| Lint / TypeCheck      | エラー箇所を修正して Phase 8 へ戻り、再リファクタリングを実施               | `pnpm lint && pnpm typecheck` が 0 error になるまで再実行 |
| Unit Test / Main Test | 失敗テストのエラーログを確認し、Phase 8 の責務分離が原因なら Phase 8 へ戻る | 全テストが PASS になるまで修正を繰り返す                  |
| Coverage 未達         | Phase 6（テスト拡充）の不足箇所を補完する                                   | `--coverage` で基準値クリアを再確認                       |
| Security              | 検出箇所を修正し、同一パターンがないか `grep -rn` で全体確認                | findings 0 を再確認                                       |

### ステップ3: T9-2 品質観点チェック

7 つの品質観点（stale chunk / 誤添付 / 誤成功表示 / guidance 不足 / error masking / P62 fallback / compact layout）を順次確認する。

### ステップ4: T9-4 セキュリティスキャン

4 つのセキュリティ観点（path traversal / conversation データ保護 / error masking / API key 非漏洩）を確認する。

### ステップ5: T9-3 欠陥検出観点の整理

Phase 10 向けの欠陥パターン 4 件を整理し、QA チェックリストに記録する。

### ステップ6: 成果物と完了条件の確認

QA チェックリストの全項目に結果を記入し、完了条件を確認する。

## 統合テスト連携

| 確認観点       | 検証方法                                                        |
| -------------- | --------------------------------------------------------------- |
| stale chunk    | cancel mock + streamContent assertion                           |
| 誤成功表示     | capability mock(unavailable) + 送信ボタン disabled assertion    |
| error masking  | IPC error mock + message 内容 assertion（パス文字列を含まない） |
| P62 fallback   | selectedModelId=null + streamChat 未呼出 assertion              |
| path traversal | file context に `../` パスを含む mock + 拒否 assertion          |
| API key 非漏洩 | error mock で API key 文字列が Renderer に到達しない assertion  |
| 全テスト回帰   | `pnpm vitest run` で failure 0                                  |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

**本Phase固有の確認観点**:

| 観点               | 確認内容                                                                         |
| ------------------ | -------------------------------------------------------------------------------- |
| UI/UX              | stale chunk / 誤添付 / guidance 不足が UX-04 screenshot 契約の品質基準を満たすか |
| セキュリティ       | error masking / path traversal / API key 非漏洩が全て検証されているか            |
| エラーハンドリング | fail-fast / guidance / silent の 3 分類が正しく機能しているか                    |
| 状態管理           | cancel / stream 完了の race condition で state が不整合にならないか              |
| P62 対策           | DEFAULT_CONFIG fallback 禁止が品質観点で検証されているか                         |

## 成果物

| 成果物            | パス                              | 内容                                               |
| ----------------- | --------------------------------- | -------------------------------------------------- |
| QA チェックリスト | `outputs/phase-9/qa-checklist.md` | 品質ゲート結果、品質観点チェック結果、欠陥パターン |

## 完了条件

- [ ] T9-1: 品質ゲート 7 項目（Lint / TypeCheck / Unit Test / Main Test / Full Test / Coverage / Security）が全て合格している
- [ ] T9-2: 品質観点 7 項目（stale chunk / 誤添付 / 誤成功表示 / guidance 不足 / error masking / P62 fallback / compact layout）が全て確認されている
- [ ] T9-4: セキュリティスキャン 4 項目（path traversal / conversation データ保護 / error masking / API key 非漏洩）が全て確認されている
- [ ] T9-3: 欠陥検出観点 4 件が Phase 10 向けに整理されている
- [ ] stale stream と誤 context 表示の検出観点が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

| サブタスクID | 内容                      | 依存先 | ステータス  |
| ------------ | ------------------------- | ------ | ----------- |
| ST-9-1       | T9-1 品質ゲート実行       | なし   | not_started |
| ST-9-2       | T9-2 品質観点チェック     | ST-9-1 | not_started |
| ST-9-3       | T9-4 セキュリティスキャン | ST-9-2 | not_started |
| ST-9-4       | T9-3 欠陥検出観点整理     | ST-9-3 | not_started |
| ST-9-5       | 成果物作成・完了条件確認  | ST-9-4 | not_started |

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

```bash
# 1. 成果物ファイルの存在確認
ls -la outputs/phase-9/qa-checklist.md

# 2. 品質ゲート結果の記録確認
grep -c "Lint\|TypeCheck\|Unit Test\|Main Test\|Full Test" outputs/phase-9/qa-checklist.md

# 3. 品質観点の網羅確認（7 観点）
grep -c "stale chunk\|誤添付\|誤成功\|guidance\|error masking\|P62\|compact" outputs/phase-9/qa-checklist.md

# 4. 欠陥パターンの記録確認
grep -c "race\|leak\|stale\|auto-send" outputs/phase-9/qa-checklist.md

# 5. Lint / TypeCheck の最終結果
cd apps/desktop && pnpm lint 2>&1 | tail -3
cd apps/desktop && pnpm typecheck 2>&1 | tail -3
```

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
- Phase 10 へ引き渡す情報: QA チェックリスト（品質ゲート結果、品質観点チェック結果、欠陥パターン）
