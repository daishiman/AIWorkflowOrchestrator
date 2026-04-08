# タスク実行仕様書生成ガイド / completed records (IPC preload foundation)

> 親仕様書: [task-workflow.md](task-workflow.md)
> 役割: completed records（IPC preload 拡張仕様差分是正以降）
> 前半: [task-workflow-completed-ipc-contract-preload-alignment.md](task-workflow-completed-ipc-contract-preload-alignment.md)

### タスク: UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 task-9D〜9J仕様差分の統合是正（2026-02-25完了）

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001                                                           |
| 完了日     | 2026-02-25                                                                                                |
| ステータス | **完了（仕様書修正）**                                                                                    |
| タスク種別 | 仕様書修正のみ（`spec_created`）                                                                          |
| Phase      | Phase 1-12 相当（実装コード変更なし）                                                                     |
| コード変更 | なし（`docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` のみ） |

#### 成果物

| 成果物                 | パス/内容                                                                                                                                                                                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 修正仕様書（task-9系） | `task-022-task-9f-skill-share.md`, `task-023a-task-9g-skill-schedule.md`, `task-023b-task-9h-skill-debug.md`, `task-023c-task-9i-skill-docs.md`, `task-023d-task-9j-skill-analytics.md`, `task-023e-task-9d-skill-chain.md`, `task-023f-task-9e-skill-fork.md`                                                     |
| 修正仕様書（task-9系） | `../completed-task/task-022-task-9f-skill-share.md`（移管）, `task-023a-task-9g-skill-schedule.md`, `task-023b-task-9h-skill-debug.md`, `task-023c-task-9i-skill-docs.md`, `../completed-task/task-023d-task-9j-skill-analytics.md`（移管）, `task-023e-task-9d-skill-chain.md`, `task-023f-task-9e-skill-fork.md` |
| 付随修正               | `task-003-execution-plan.md` の `skill-api.ts` 参照統一                                                                                                                                                                                                                                                            |
| 完了記録               | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-013-ut-imp-ipc-preload-extension-spec-alignment-001.md`                                                                                                                                                                                     |

#### 実装内容（仕様更新）

- 7仕様書の `artifacts.modifies` を現行正本に統一（`preload/channels.ts`, `preload/skill-api.ts`, `preload/types.ts`, `packages/shared/src/types/index.ts`）。
- 各 task に `packages/shared/src/types/skill-<domain>.ts`（`chain/fork/share/schedule/debug/docs/analytics`）を `artifacts.creates` として明記。
- 旧参照 `preload/skillAPI.ts` / `main/ipc/channels.ts` / `packages/shared/src/types/skillXxx.ts` を排除。
- task-9I の `GeneratedDoc.generatedAt` を IPC境界方針に合わせ `Date` → ISO 8601 `string` へ統一。

#### 苦戦箇所と解決策

| 苦戦ポイント   | 問題                                                         | 解決策                                                 |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| 旧パス混在     | `skillAPI.ts` と `skill-api.ts` が混在し、参照の正本が曖昧化 | 監査条件を固定し、旧パスを0件化してから反映            |
| artifacts 欠落 | taskごとに `modifies/creates` の必須項目が不一致             | 7タスク共通の必須4項目 + task別domain型を先に固定      |
| 型方針ドリフト | task-9I だけ Date型記述が残り IPC方針と衝突                  | Dateシリアライズ方針を追記し、型をISO 8601文字列へ統一 |

#### 同種課題の簡潔解決手順（5ステップ）

1. 監査対象を task-9D〜9J に限定してノイズを分離する。
2. `oldPaths`（参照差分）と `missingArtifacts`（台帳差分）を分けて検出する。
3. 参照差分を一括修正し、次に artifacts を task単位で補完する。
4. Date型が残る仕様書は IPC境界方針（ISO 8601 string）へ揃える。
5. 完了記録・残課題状態・教訓記録を同一コミット相当で同期する。

---

### タスク: UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 skill:import IPCチャネル名競合の予防的解消（2026-02-24完了）

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| タスクID   | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 |
| 完了日     | 2026-02-24                           |
| ステータス | **完了**                             |
| タスク種別 | 仕様書修正のみ（`spec_created`）     |
| Phase      | Phase 1-13 完了                      |
| コード変更 | なし（仕様書修正のみ）               |

#### 成果物

| 成果物               | パス/内容                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/`                                              |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/implementation-guide.md`      |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/unassigned-task-detection.md` |

#### 変更理由

- `skill:import` をローカルインポート専用のまま維持し、外部インポート用を `skill:importFromSource` に分離してIPCチャネル名競合を予防
- TASK-9F/TASK-UI-05 仕様書のチャネル表記を統一し、実装前に契約ドリフトを除去
- 仕様書修正のみタスクとして `spec_created` で完了管理し、Phase 10/11 で追加未タスク 0 件を確認

---

### タスク: TASK-UI-00-ATOMS Atoms共通コンポーネント実装（2026-02-23完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-UI-00-ATOMS                            |
| 完了日     | 2026-02-23                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-13 完了                             |
| テスト数   | 156（コンポーネント実装対象テスト、全PASS） |
| 変更範囲   | Atoms新規5件 + 既存2件拡張                  |

#### 成果物

| 成果物               | パス/内容                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/task-ui-00-atoms/`                                              |
| 実装ガイド           | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-12/implementation-guide.md`      |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-12/unassigned-task-detection.md` |

#### 変更理由

- Atoms層の基盤部品（StatusIndicator/FilterChip/SkeletonCard/SuggestionBubble/RelativeTime）を新規実装し、Badge/EmptyStateを拡張
- Apple HIG/WCAGとデザイントークン運用を仕様化し、テーマ横断・a11y検証を実施
- Phase 10 MINOR 3件を未タスク化して `docs/30-workflows/unassigned-task/` に配置し、`task-workflow.md` 残課題テーブルへ登録

---

### タスク: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 SkillImportDialog skill.id→skill.name修正（2026-02-22完了）

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001                 |
| 完了日     | 2026-02-22                                          |
| ステータス | **完了**                                            |
| Phase      | Phase 1-12完了                                      |
| テスト数   | 49（SkillImportDialog）+ 3（AgentView統合）、全PASS |

#### 成果物

| 成果物               | パス/内容                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/`                                            |
| 実装ガイド           | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/outputs/phase-12/unassigned-task-report.md`  |

#### 変更理由

- SkillImportDialogがskill.id（SHA-256ハッシュプレフィックス）をonImportに渡していたが、IPCハンドラ（skill:import）はskill.name（人間可読名）を期待していたため100%インポート失敗
- Renderer層のみの変更（SkillImportDialog + AgentView + テスト）。IPC/Preload/Main/Storeに変更なし
- P44パターンのRenderer側バリエーションとして解決

---

### タスク: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 skill:import 戻り値型不整合修正（2026-02-21完了）

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                            |
| 完了日     | 2026-02-21                                                     |
| ステータス | **完了**                                                       |
| Phase      | Phase 1-12完了                                                 |
| テスト数   | 115（全PASS）+ 59（agentSlice integration、全PASS）            |
| カバレッジ | Branch 84.9%（修正対象skill:importハンドラ全10分岐100%カバー） |

#### 成果物

| 成果物               | パス/内容                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/ut-fix-skill-import-return-type-001/`                                            |
| 実装ガイド           | `docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-12/unassigned-task-report.md`  |

#### 変更理由

- skill:import IPCハンドラが `ImportResult` 型を返していたが、Preload/Renderer側は `ImportedSkill` 型を期待していた（P44パターン）
- 2ステップ変換パターン（importSkills → getSkillByName）で `ImportedSkill` を返すように修正
- P42準拠の3段バリデーション（型チェック → 空文字列 → trim空文字列）を追加
- 引数形式を `{ skillIds: string[] }` → `skillName: string` に統一（P44/P45解決）

### タスク: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 skill:ハンドラIPCレスポンス形式統一（2026-02-25完了）

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001            |
| 完了日     | 2026-02-25                                           |
| ステータス | **完了**                                             |
| Phase      | Phase 1-12完了（Phase 13未実施）                     |
| テスト数   | 394（Preload 133 + Main 145 + Renderer 116、全PASS） |

#### 成果物

| 成果物               | パス/内容                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/`                                            |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/implementation-guide.md`    |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/spec-update-summary.md`     |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/unassigned-task-report.md`  |
| スキルフィードバック | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/skill-feedback-report.md`   |

#### 変更理由

- `skill:execute` の Main 応答が `{ success, data }` ラッパー形式であるのに対し、Preload 側が直接型前提で解釈される箇所を是正した
- `skill:remove` の戻り値契約を `Promise<void>` から `Promise<RemoveResult>` に統一し、Main/Preload/仕様書のドリフトを解消した
- Phase 12 再監査で未タスクリンク参照切れと成果物不足（`spec-update-summary.md` 未出力）を是正した

#### 実装時の苦戦箇所と解決策

| 苦戦箇所                                     | 課題                                                                                          | 解決策                                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `safeInvoke` / `safeInvokeUnwrap` の使い分け | `execute` が wrapper 応答、`remove` が直接応答で、Preload側の選択を誤ると実行時に契約崩壊する | Main 応答形式を先に固定し、`execute=unwrap` / `remove=direct` を明文化してテストを更新                  |
| Phase 12 実装ガイド要件の不足                | Part 1 の日常例え・Part 2 の型/API/エッジケース記載が薄いと、task-spec要件未達になりやすい    | `implementation-guide.md` を再構成し、Part 1 に例え話、Part 2 に型定義/APIシグネチャ/エッジケースを追加 |
| 未タスク監査結果の誤読                       | repository 全体監査結果（既存負債）を今回差分の失敗と混同しやすい                             | ベースラインと今回差分を分離して報告し、今回対象の未タスク2件は個別に配置/フォーマットを確認            |

#### 同種課題の簡潔解決手順（4ステップ）

1. Main の実応答形式を一覧化し、Preload の `safeInvoke` / `safeInvokeUnwrap` を1対1で対応付ける。
2. Part 1/Part 2 要件で `implementation-guide.md` を作成し、日常例え・型/API・エッジケースを必ず記載する。
3. `verify-unassigned-links.js` と `validate-phase-output.js` を実行し、Phase 12 の参照と成果物を機械検証する。
4. `task-workflow.md` と関連仕様書へ「苦戦箇所 + 解決手順」を同時反映し、再発防止知見を残す。

### タスク: TASK-9A-B スキルファイル操作IPCハンドラー実装（2026-02-19完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-9A-B                                   |
| 完了日     | 2026-02-19                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了                              |
| テスト数   | 65（全PASS）                                |
| カバレッジ | Line 91.14% / Branch 93.93% / Function 100% |

#### 成果物

| 成果物               | パス/内容                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/`                                            |
| 実装ガイド           | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/unassigned-task-report.md`  |

#### 変更理由

- SkillFileManagerのファイル操作をIPC経由でRendererから呼び出し可能にするため、6チャンネルを追加（skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup）
- validateIpcSender + 引数バリデーション + isKnownSkillFileErrorエラーサニタイズによる多層防御を実装
- registerSkillFileHandlers / unregisterSkillFileHandlers によるハンドラ登録/解除パターンを実装

---
