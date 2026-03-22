# Agent SDK Skill 仕様 / history bundle

> 親仕様書: [interfaces-agent-sdk-skill.md](interfaces-agent-sdk-skill.md)
> 役割: history bundle

## 完了タスク

### TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001: 認証 preflight ガードと `errorCode` 契約同期（2026-03-04完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001                             |
| 完了日       | 2026-03-04                                                           |
| ステータス   | **完了**                                                             |
| テスト数     | 264（対象7ファイル）                                                 |
| ドキュメント | `docs/30-workflows/TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001/`        |

#### 変更ポイント

| 変更箇所 | 内容 |
| -------- | ---- |
| Main IPC 契約 | `skill:execute` 失敗応答に `errorCode?: string` を追加し、`AUTHENTICATION_ERROR` を伝搬 |
| Preload 契約 | `safeInvokeUnwrap` で `result.errorCode` を `Error.code` へ転写 |
| Renderer 境界 | AgentView / Hook / Store の execute 前に preflight (`auth-key:exists`) を実施 |
| Auth 判定整合 | `auth-key:exists` は store キー + `ANTHROPIC_API_KEY` env fallback を判定 |

#### 仕様書別SubAgent分担（同期反映）

| SubAgent | 担当仕様書 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-A | `interfaces-agent-sdk-skill.md` | `skill:execute` 失敗契約更新（`errorCode`） | IPC契約表/失敗契約セクション/変更履歴が同期済み |
| SubAgent-B | `api-ipc-system.md` | `auth-key:exists` fallback 契約更新 | store+env 判定順が明文化済み |
| SubAgent-C | `security-electron-ipc.md` | preflight セキュリティ境界を追記 | sender検証順序と事前停止方針が同期済み |
| SubAgent-D | `task-workflow.md` / `lessons-learned.md` | 完了台帳・苦戦箇所・再利用手順を反映 | 検証証跡と教訓が同一ターン同期済み |

#### 実装上の苦戦箇所と解決策

| 苦戦箇所 | 原因 | 解決策 | 再発防止 |
| --- | --- | --- | --- |
| `AUTHENTICATION_ERROR` が Renderer まで届かない | Main 失敗契約が `error` 文字列のみだった | Main で `errorCode` を返し、Preload で `Error.code` へ転写 | 失敗契約変更時は Main/Preload/Renderer を同時更新する |
| preflight 判定と実行時判定の乖離 | `auth-key:exists` が store のみを見ていた | env fallback (`ANTHROPIC_API_KEY`) を `auth-key:exists` に追加 | 判定ロジックの複数経路は `api-ipc-system` 正本に順序を明記する |
| 誘導導線の重複実装 | AgentView/Hook/Store で同じ分岐を個別実装 | `preflightSkillExecutionAuth` 共通 utility を導入 | preflight 導線は共通 utility を唯一の入口にする |

#### 同種課題の簡潔解決手順（4ステップ）

1. 失敗契約を `error` と `errorCode` に分解し、optional 追加で後方互換を維持する。  
2. Main → Preload → Renderer の順で、エラーコード伝搬テストを先に固定する。  
3. 実行前ガードを共通 utility 化し、UI層の重複分岐を排除する。  
4. 契約変更と同時に `api-ipc-system` / `security-electron-ipc` / `task-workflow` を同期する。  

### UT-FIX-SKILL-EXECUTE-INTERFACE-001: skill:execute IPC契約整合（2026-02-25完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-EXECUTE-INTERFACE-001                                  |
| 完了日       | 2026-02-25                                                           |
| ステータス   | **完了**                                                             |
| テスト数     | 90（`skillHandlers.execute/validation/delegate`）                   |
| ドキュメント | `docs/30-workflows/ut-fix-skill-execute-interface-001/`             |

#### 変更ポイント

| 変更箇所 | 内容 |
| -------- | ---- |
| Main IPCハンドラー | `skill:execute` が `SkillExecutionRequest`（`skillName`）と旧 `{ skillId, params }` の両方を受理 |
| 契約ブリッジ | `skillName` 受信時に `scanAvailableSkills()` で `name -> id` を解決し、既存 `SkillService.executeSkill(skillId, ...)` を再利用 |
| 後方互換 | `skillId` 経路を残し、既存テスト・既存呼び出しを破壊しない移行を維持 |
| テスト | preload契約互換（skillName）と旧契約（skillId）の双方を回帰テストで保証 |

#### 仕様書別SubAgent分担（同期反映）

| SubAgent | 担当仕様書 | 主担当作業 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-A | `interfaces-agent-sdk-skill.md` | IPC契約（正式/後方互換）の境界定義更新 | `skill:execute` 契約表と変更理由が同期済み |
| SubAgent-B | `security-skill-ipc.md` | 入力検証のセキュリティ要件同期 | sender + `skillName/skillId` 検証が明文化済み |
| SubAgent-C | `task-workflow.md` | Phase 12証跡と未タスク監査の台帳反映 | 検証4コマンド結果が記録済み |
| SubAgent-D | `lessons-learned.md` | 苦戦箇所と再利用手順の教訓化 | 同種課題手順に反映済み |

#### 実装上の苦戦箇所と解決策

| 苦戦箇所 | 原因 | 解決策 | 再発防止 |
| --- | --- | --- | --- |
| `skillName`/`skillId` 契約差分の同時維持 | shared/preload は `skillName`、Mainは `skillId` 前提で分岐不能 | union受理 + type guard で契約を明示分離 | IPC契約変更時は「正式契約 + 後方互換契約」を仕様に同時明記する |
| `skillName` から既存 Service への接続 | `executeSkill()` が `skillId` ベースで破壊的変更が発生しやすい | Mainハンドラ内で `name -> id` 解決して Service API は据え置き | 段階移行は Adapter（境界変換）優先で実施する |
| 検証観点の漏れ | 新契約追加で旧契約テストが欠落しやすい | execute/validation/delegate の3ファイルで両契約を同時検証 | IPC契約修正時は「新旧両契約の回帰テスト」を完了条件に固定する |

#### 同種課題の簡潔解決手順（4ステップ）

1. shared/preload/Main の3層で引数名と型を一覧化して契約差分を可視化する。  
2. Main境界に Adapter を置き、ドメイン層APIは一度に変えない。  
3. 新契約と旧契約の両方で正常系/異常系テストを追加する。  
4. 仕様書（interfaces/security/task-workflow）へ同時反映し、リンク検証を実行する。  

#### 検出未タスク（実装苦戦箇所由来）

| タスクID | 内容 | 優先度 | 指示書パス |
| -------- | ---- | ------ | ---------- |
| UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001 | Phase 12 仕様書別SubAgent同期ガードの自動化（4仕様書同時更新 + current/baseline分離判定） | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-phase12-spec-sync-subagent-guard-001.md` |

---

### UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog skill.id→skill.name修正（2026-02-22完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001                                |
| 完了日       | 2026-02-22                                                           |
| ステータス   | **完了**                                                             |
| テスト数     | 49（SkillImportDialog）+ 3（AgentView統合）                         |
| ドキュメント | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/`   |

#### 変更ポイント

| 変更箇所 | 内容 |
| -------- | ---- |
| SkillImportDialog | `onImport(skill.id)` を `onImport(skill.name)` に変更。SHA-256ハッシュプレフィックスではなく人間可読名を渡すように修正 |
| AgentView | `handleImportSkill` の引数名を `skillId` → `skillName` に変更（P45準拠） |
| テスト | SkillImportDialogテスト49件（skill.name渡し検証追加）、AgentView統合テスト3件、全PASS |

#### 変更理由

- SkillImportDialogがskill.id（SHA-256ハッシュプレフィックス）をonImportに渡していたが、IPCハンドラ（skill:import）はskill.name（人間可読名）を期待
- Renderer層のみの変更（IPC/Preload/Main/Store変更なし）
- P44パターン（IPCインターフェース不整合）のRenderer側バリエーションとして解決

#### 実装上の苦戦箇所と解決策

| 苦戦箇所 | 原因 | 解決策 | 再発防止 |
| --- | --- | --- | --- |
| 同名コンポーネントの誤調査 | `SkillImportDialog` が複数箇所に存在し、実際に使用されるファイル特定に時間を要した | `AgentView` の import 元から逆引きし、`apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx` を修正対象として固定 | 変更前に `rg "from .*SkillImportDialog"` で参照元を機械確認してから実装する |
| `skill.id`/`skill.name` の文字列型混同 | どちらも `string` 型のため、型システムだけでは意味差を検出できなかった | `onImport` の引数名を `skillNames` に統一し、`selectedIds` から `availableSkills.map(skill.name)` への明示変換を追加 | テストに否定条件（`skill.id` を渡さないこと）を必須化する |
| インポート処理の偽成功ログ | `importSkills` 側ログだけを見ると成功に見えるが、後段の `getSkillByName` で失敗していた | Renderer → IPC → Handler の値をトレースし、失敗点を `getSkillByName` 不一致に特定 | ログ確認時は単一関数ではなく IPCハンドラ最終戻り値まで追跡する |

#### 同種課題の簡潔解決手順（4ステップ）

1. `AgentView` など呼び出し元から対象コンポーネントの import 先を確定する。
2. `skill.id`（内部識別）と `skill.name`（IPC契約）の境界を表にして固定する。
3. 変換ポイントを1箇所に集約し、引数名を `skillNames` のように意味付き名称へ統一する。
4. テストに「期待値」と「否定条件（idが渡らない）」を同時追加して回帰を防止する。

#### 検出未タスク（実装苦戦箇所由来）

| タスクID | 内容 | 優先度 | 指示書パス |
| -------- | ---- | ------ | ---------- |
| UT-TYPE-SKILL-IDENTIFIER-BRANDED-001 | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別） | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-type-skill-identifier-branded.md` |
| UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001 | SkillImportDialog同名コンポーネント解消 | 低 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-refactor-skill-import-dialog-dedup.md` |

---

### UT-FIX-SKILL-IMPORT-INTERFACE-001: skill:import IPCインターフェース不整合修正（2026-02-21完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-IMPORT-INTERFACE-001                                   |
| 完了日       | 2026-02-21                                                           |
| ステータス   | **完了**                                                             |
| テスト数     | 52（`skillHandlers.test.ts`）                                       |
| ドキュメント | `docs/30-workflows/ut-fix-skill-import-interface-001/`              |

#### 変更ポイント

| 変更箇所 | 内容 |
| -------- | ---- |
| Main IPCハンドラー | `skill:import` が `{ skillIds: string[] }` 受け取りから `skillName: string` 直接受け取りに変更 |
| 入力検証 | `trim()` を含む非空文字列検証を追加（P42準拠） |
| Service呼び出し | `skillService.importSkills([skillName])` で既存Service API互換を維持 |
| テスト | SH-IMP-01〜13へ更新（旧形式オブジェクト拒否・境界値・sender検証を含む） |

#### 関連ドキュメント

| ドキュメント | 説明 |
| ------------ | ---- |
| [UT-FIX-SKILL-IMPORT-INTERFACE-001 実装ガイド](../../../../docs/30-workflows/ut-fix-skill-import-interface-001/outputs/phase-12/implementation-guide.md) | 概念説明（Part 1）と技術詳細（Part 2） |
| [完了タスク指示書](../../../../docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-import-interface-001.md) | 元タスクの完了記録 |

#### 実装上の課題と教訓

| 課題 | 解決策 | 教訓 |
| --- | --- | --- |
| `phase-12` 成果物は生成済みでも、仕様書本体が未実施のまま残る | `phase-12-documentation.md` のステータス/完了条件を成果物と同時同期 | 成果物作成だけで完了判定せず、仕様書本体の状態も同一ターンで更新する |
| タスク移動後に旧参照パスが残る | `rg` で旧パスを横断検出し、`completed-task` 側に統一 | ワークフロー移動時はリンク整合チェックを必須工程にする |
| Vitest をルートで実行すると alias 解決が崩れる | `apps/desktop` ディレクトリで `vitest run` を実行して証跡化 | テスト実行ディレクトリは再現性要件として明示する |

---

### UT-FIX-SKILL-REMOVE-INTERFACE-001: skill:remove IPCインターフェース不整合修正（2026-02-20完了）

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-REMOVE-INTERFACE-001                                   |
| 完了日       | 2026-02-20                                                           |
| ステータス   | **完了**                                                             |
| テスト数     | 45（`skillHandlers.test.ts`）                                       |
| ドキュメント | `docs/30-workflows/completed-tasks/ut-fix-skill-remove-interface/`                  |

#### 変更ポイント

| 変更箇所 | 内容 |
| -------- | ---- |
| Main IPCハンドラー | `skill:remove` が `{ skillId: string }` 受け取りから `skillName: string` 直接受け取りに変更 |
| 入力検証 | `trim()` を含む非空文字列検証を追加 |
| テスト | SH-RM-01〜11を `skillName` 契約に更新（sender検証・空白文字列検証を含む） |

#### Phase実行時の追加教訓（2026-02-21）

| 苦戦箇所 | 原因 | 対策 |
|----------|------|------|
| Phase依存順序違反 | 5エージェント並列ディスパッチでPhase 1-3完了前にPhase 4-7が先行 | ゲートPhase（3, 10）前後で並列化区間を分離 |
| worktree環境でのPhase 11 | Electron起動不可 | 自動テスト（vitest）で代替し、制約を明記 |
| カバレッジ閾値解釈 | skillHandlers.ts全体のLine 45%は低いが修正対象は全分岐カバー | ハンドラ固有の分岐カバー率を別途記録 |

#### 関連ドキュメント

| ドキュメント | 説明 |
| ------------ | ---- |
| [UT-FIX-SKILL-REMOVE-INTERFACE-001 実装ガイド](../../../../docs/30-workflows/completed-tasks/ut-fix-skill-remove-interface/outputs/phase-12/implementation-guide.md) | 概念説明（Part 1）と技術詳細（Part 2） |
| [完了タスク指示書](../../../../docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-remove-interface-001.md) | 元タスクの完了記録 |

---

### TASK-9B-H-SKILL-CREATOR-IPC / TASK-9B: SkillCreatorService IPC登録・拡張（2026-02-26同期）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | TASK-9B-H-SKILL-CREATOR-IPC / TASK-9B                                     |
| 完了日       | 2026-02-12（基盤） / 2026-02-26（拡張同期）                               |
| ステータス   | **完了**                                                                   |
| テスト数     | 85（基盤） + 拡張チャンネル回帰テスト                                     |
| 発見課題     | MINOR 2件（IpcResult型重複、Zodスキーマ未使用）                            |
| ドキュメント | `docs/30-workflows/completed-tasks/skill-creator-ipc/`, `docs/30-workflows/completed-tasks/task-9b-skill-creator/` |

#### テスト結果サマリー

| カテゴリ                     | テスト数 | PASS | FAIL |
| ---------------------------- | -------- | ---- | ---- |
| ハンドラー登録/解除          | 2        | 2    | 0    |
| 正常フロー（主要チャンネル） | 22       | 22   | 0    |
| sender検証                   | 5        | 5    | 0    |
| エッジケース                 | 12       | 12   | 0    |
| セキュリティ                 | 8        | 8    | 0    |
| 進捗通知                     | 11       | 11   | 0    |
| 統合テスト                   | 11       | 11   | 0    |
| Preload API                  | 14       | 14   | 0    |

#### 成果物

| 成果物             | パス                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| 実装ガイド（基盤） | `docs/30-workflows/completed-tasks/skill-creator-ipc/outputs/phase-12/implementation-guide.md` |
| 実装ガイド（拡張） | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-12/implementation-guide.md`           |

#### 追加チャンネル一覧（13チャンネル）

| 定数名                           | チャンネル値                      | 方向          |
| -------------------------------- | --------------------------------- | ------------- |
| `SKILL_CREATOR_DETECT_MODE`      | `skill-creator:detect-mode`       | invoke (R->M) |
| `SKILL_CREATOR_CREATE`           | `skill-creator:create`            | invoke (R->M) |
| `SKILL_CREATOR_EXECUTE_TASKS`    | `skill-creator:execute-tasks`     | invoke (R->M) |
| `SKILL_CREATOR_VALIDATE`         | `skill-creator:validate`          | invoke (R->M) |
| `SKILL_CREATOR_VALIDATE_SCHEMA`  | `skill-creator:validate-schema`   | invoke (R->M) |
| `SKILL_CREATOR_IMPROVE`          | `skill-creator:improve`           | invoke (R->M) |
| `SKILL_CREATOR_FORK`             | `skill-creator:fork`              | invoke (R->M) |
| `SKILL_CREATOR_SHARE`            | `skill-creator:share`             | invoke (R->M) |
| `SKILL_CREATOR_SCHEDULE`         | `skill-creator:schedule`          | invoke (R->M) |
| `SKILL_CREATOR_DEBUG`            | `skill-creator:debug`             | invoke (R->M) |
| `SKILL_CREATOR_GENERATE_DOCS`    | `skill-creator:generate-docs`     | invoke (R->M) |
| `SKILL_CREATOR_STATS`            | `skill-creator:stats`             | invoke (R->M) |
| `SKILL_CREATOR_PROGRESS`         | `skill-creator:progress`          | on (M->R)     |

#### 関連未タスク

| タスクID    | 内容                                        | 優先度 | 指示書パス                                                                      |
| ----------- | ------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| UT-9B-H-001 | IpcResult型の重複定義を@repo/sharedに統一   | 低     | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-9b-h-ipcresult-type-unification.md`     |
| UT-9B-H-002 | IPCハンドラー引数検証のZodスキーマ移行      | 低     | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-9b-h-zod-schema-migration.md`           |
| ~~UT-9B-H-003~~ | ~~SkillCreator IPCセキュリティ強化（パストラバーサル対策、sanitizeError、schemaNameホワイトリスト）~~ | ~~高~~ | ~~`docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/index.md`~~ **2026-02-12完了（UT-9B-H-003-security-hardeningで実施）** |
| UT-9B-H-004 | SkillCreator設計書-実装整合性修正（Zod/型/メソッド名の乖離対応） | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-9b-h-design-implementation-alignment.md` |
| ~~UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001~~ | ~~TASK-9B 仕様契約再監査ガード強化（13ch同期/P42 create/current-baseline判定）~~ | ~~中~~ | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-task9b-spec-contract-guard-001.md` **（完了: 2026-02-26）** |

#### 仕様書別SubAgent分担（TASK-9B 再監査）

| SubAgent | 担当仕様書 | 主担当作業 |
| --- | --- | --- |
| SubAgent-A | `interfaces-agent-sdk-skill.md` | 12メソッドAPIと `CreateSkillOptions` / 進捗型の実装同期 |
| SubAgent-B | `security-skill-ipc.md` | Sender検証 + P42 3段バリデーション適用範囲の同期 |
| SubAgent-C | `task-workflow.md` | 完了台帳・検証証跡・成果物参照の同期 |
| SubAgent-D | `lessons-learned.md` | 苦戦箇所と簡潔解決手順の再利用化 |

#### 再監査時の苦戦箇所と解決策

| 苦戦箇所 | 原因 | 解決策 | 再発防止 |
| --- | --- | --- | --- |
| IPC契約のチャンネル数ドリフト（6と13の混在） | 基盤実装（TASK-9B-H）と拡張実装（TASK-9B）の同期タイミングが分離 | `channels.ts` 正本を基準に 13チャンネル（12 invoke + 1 progress）へ統一 | Phase 12で `interfaces/security/task/lessons` の4仕様書を同一ターン更新する |
| `create` のP42 3段バリデーション漏れ | 既存ハンドラー群の水平展開時に `trim()` チェックが未適用 | `skillCreatorHandlers.ts` の `create` に型/空文字/trim空文字を追加し、回帰テストを実装 | 「新規/拡張ハンドラー追加時は P42 + テスト追加を1セット」をチェックリスト化 |
| 成果物台帳の二重管理（`artifacts.json` / `outputs/artifacts.json`） | Phase 12終盤で片側更新になりやすい | 2ファイルを同時更新し、`spec-update-summary.md` に検証結果を固定 | Phase完了前に両ファイル差分を必須確認する |

#### 同種課題の簡潔解決手順（4ステップ）

1. `channels.ts` を正本にして契約数・型を固定する。  
2. 追加/変更したIPCに P42 3段バリデーションと回帰テストを同時実装する。  
3. `interfaces/security/task/lessons` の4仕様書を SubAgent 分担で同一ターン更新する。  
4. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` の結果を成果物へ記録する。  

---

### TASK-9B-G: SkillCreatorService実装（2026-02-03完了）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | TASK-9B-G                                                                  |
| 完了日       | 2026-02-03                                                                 |
| ステータス   | **完了**                                                                   |
| テスト数     | 50（自動テスト）                                                           |
| 発見課題     | 0件                                                                        |
| ドキュメント | `docs/30-workflows/TASK-9B-G-skill-creator-service/`                       |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| ScriptExecutor     | 9        | 9    | 0    |
| ResourceLoader     | 9        | 9    | 0    |
| SkillCreatorService| 22       | 22   | 0    |
| 統合テスト         | 10       | 10   | 0    |

#### 成果物

| 成果物             | パス                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| テスト結果レポート | `docs/30-workflows/TASK-9B-G-skill-creator-service/outputs/phase-11/manual-test-result.md` |
| 実装ガイド         | `docs/30-workflows/TASK-9B-G-skill-creator-service/outputs/phase-12/implementation-guide.md` |

---

## 変更履歴

| 日付       | バージョン | 変更内容                                               |
| ---------- | ---------- | ------------------------------------------------------ |
| 2026-03-21 | 1.43.5     | UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 追補: `planSkill` / `executePlan` / `improveSkillWithFeedback` の renderer surface に対して `SkillCreatorPlanRequest` / `SkillCreatorExecutePlanRequest` / `SkillCreatorImproveSkillRequest` と `RuntimeSkillCreator*Response` の型アンカーを追加し、`packages/shared/src/types/skillCreator.ts` を canonical source として明記 |
| 2026-03-05 | 1.43.4     | SkillService/SkillExecutor DIフロー表を実装に同期。`new SkillExecutor(mainWindow, undefined, authKeyService)` へ更新し、AuthKeyService注入経路を明示 |
| 2026-03-04 | 1.43.3     | TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001 反映: `skill:execute` 失敗契約を `{ success:false, error, errorCode? }` に拡張し、`AUTHENTICATION_ERROR` 伝搬と Renderer preflight（`auth-key:exists`）の境界を追加。完了タスク記録と苦戦箇所・再利用手順を追記 |
| 2026-03-03 | 1.43.2     | UT-UI-05A-GETFILETREE-001 完了同期: SkillFileManager API に `getFileTree(skillName): Promise<SkillFileTreeNode[]>` を追加し、`SkillFileTreeNode` 型を定義。TASK-9A-B 完了記録を基盤6ch表記へ整理し、`skill:getFileTree` 追加タスクの完了記録を追記 |
| 2026-03-02 | 1.43.1     | TASK-UI-05B 実装完了同期: TASK-9D スキルチェーンの Preload API（chainList/get/save/delete/execute）を実装済み契約へ更新。TASK-9G セクションと整合化 |
| 2026-03-02 | 1.43.0     | TASK-UI-05B仕様整合: TASK-9D（スキルチェーン型定義10型・IPCチャネル5ch）とTASK-9G（スキルスケジュール型定義4型・IPCチャネル5ch・Preload API 5メソッド）のセクションを追加。実装コードとの整合を検証済み |
| 2026-02-28 | 1.42.1     | TASK-9E追補: 型/API契約観点の苦戦箇所3件（件数ドリフト/契約境界混同/path境界追従）と同種課題向け4ステップ手順を追加 |
| 2026-02-28 | 1.42.0     | TASK-9E反映: `skill:fork` IPC契約と `SkillForkOptions/SkillForkResult/SkillForkMetadata` 型定義セクションを追加。`skill:fork` と `skill-creator:fork` の責務境界を明文化し、完了タスク記録を追記 |
| 2026-02-27 | 1.41.0     | TASK-9H反映: スキルデバッグ型定義セクション追加（`DebugSessionState` / `DebugEvent` / `DebugCommand` / Preload API 7メソッド、配線漏れ対策を含む） |
| 2026-02-28 | 1.42.0     | TASK-9I反映: スキルドキュメント型定義セクション追加（DocGenerationRequest / GeneratedDoc / DocSection / DocTemplate / TemplateSection）、Preload API 4メソッド（docsGenerate/docsPreview/docsExport/docsTemplates）、関連未タスク UT-9I-001/002 を登録 |
| 2026-02-28 | 1.42.3     | TASK-9J未タスクの完了移管を反映: `UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001` を completed-tasks/unassigned-task 参照へ更新 |
| 2026-02-28 | 1.42.2     | TASK-9J関連未タスクを追加: `UT-IMP-TASK9J-PHASE12-IPC-SYNC-AUTO-VERIFY-001` を登録し、型仕様セクションから Phase 12 自動検証ガードへ参照可能にした |
| 2026-02-28 | 1.42.1     | TASK-9J追補: 「実装時の苦戦箇所」セクションを追加。共有型公開面同期漏れとPreload API命名ドリフトの対処・標準ルールを明文化 |
| 2026-02-28 | 1.42.0     | TASK-9J: スキル分析・統計型定義（8インターフェース）とIPCチャネル追加 |
| 2026-02-27 | 1.41.1     | TASK-9G 未タスク同期: UT-9G-001〜005 を関連未タスクとして登録し、`unassigned-task/` 指示書への正本リンクを追加 |
| 2026-02-27 | 1.41.0     | TASK-9G完了反映: スキルスケジュール型定義セクション追加（ScheduledSkill/SkillSchedule/NotificationSettings/ScheduledRunResult）、Preload API 5メソッド（scheduleList/add/update/delete/toggle）と完了タスク記録を追記 |
| 2026-02-27 | 1.40.1     | TASK-9F追補: 型仕様の苦戦箇所3件（型パス正本/分岐契約明示/MINOR分離）と同種課題向け4ステップ手順を追加 |
| 2026-02-27 | 1.40.0     | TASK-9F完了反映: スキル共有型定義セクション追加（ShareTarget/ShareImportResult/ShareExportResult/ShareValidateSourceResult等10型、Preload API 3メソッド、完了タスク記録） |
| 2026-02-26 | 1.39.0     | TASK-9B 完了移管に同期: 実行ワークフロー参照を `completed-tasks/task-9b-skill-creator/` に統一し、`UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001` を completed-tasks/unassigned-task 移管済みとして完了化 |
| 2026-02-26 | 1.38.0     | TASK-9B 再監査の苦戦箇所を未タスク化: `UT-IMP-TASK9B-SPEC-CONTRACT-GUARD-001` を関連未タスクへ追加（13chドリフト/P42 create検証漏れ/current-baseline誤読の再発防止） |
| 2026-02-26 | 1.37.0     | TASK-9B再監査追補: 仕様書別SubAgent分担、実装時の苦戦箇所（13chドリフト/P42 create漏れ/成果物二重台帳）と4ステップ簡潔解決手順を TASK-9B-H/TASK-9B セクションへ追記 |
| 2026-02-26 | 1.36.0     | TASK-9B反映: SkillCreatorService APIを12メソッドへ同期。TASK-9B-HセクションのIPCチャンネル一覧を13チャンネル（12 invoke + 1 progress）へ更新し、成果物リンクを `completed-tasks/skill-creator-ipc` と `task-9b-skill-creator` に正規化 |
| 2026-02-26 | 1.36.2     | TASK-9A成果物移管を反映。TASK-9A参照を `completed-tasks/TASK-9A-skill-editor/` に更新し、`TASK-9A-C-004` を完了化して `completed-tasks/unassigned-task/` へ移管 |
| 2026-02-26 | 1.36.1     | TASK-9A-C-004 を関連未タスクへ追加。Phase 12再確認で顕在化した仕様同期運用課題（Part 1/2要件漏れ、監査判定誤読、メタ情報重複）を再発防止タスクとして登録 |
| 2026-02-26 | 1.36.0     | TASK-9A完了反映: SkillEditor UI を `spec_created` から `completed` に更新。関連ドキュメント参照を `TASK-9A-skill-editor` 正本へ移行し、未タスク `TASK-9A-C-002` を完了化 |
| 2026-02-25 | 1.35.0     | UT-FIX-SKILL-EXECUTE-INTERFACE-001 由来の未タスク `UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001` を追加。4仕様書同期の運用ガード課題を関連未タスクとして記録 |
| 2026-02-25 | 1.34.0     | UT-FIX-SKILL-EXECUTE-INTERFACE-001 追補: 仕様書別SubAgent分担（interfaces/security/task-workflow/lessons）を追加し、契約同期の責務分離を明文化 |
| 2026-02-25 | 1.33.0     | UT-FIX-SKILL-EXECUTE-INTERFACE-001完了反映。`skill:execute` の正式契約（`skillName`）と後方互換契約（`skillId`）を仕様化し、Main境界の `name -> id` 変換フローと回帰テスト結果を追記 |
| 2026-02-25 | 1.32.0     | UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001 を再評価クローズへ更新。`skill:get-detail` は `skillId` 契約が実装実体（`cache.set(skill.id, skill)` + `getSkillById`）と一致するため、命名ドリフト未発生と判定 |
| 2026-02-25 | 1.31.0     | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 の実装苦戦箇所から未タスク `UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001` を追加。skillHandlers 関連未タスクテーブルへ契約マトリクス + 自動整合チェックの追跡行を登録 |
| 2026-02-25 | 1.30.0     | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001完了反映: 関連未タスクテーブルを完了化（取り消し線 + 実ワークフロー参照へ更新）。`skill:remove` の戻り値記述を `Promise<void>` から `Promise<RemoveResult>` に同期 |
| 2026-02-22 | 1.29.0     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001苦戦箇所から未タスク2件登録: UT-TYPE-SKILL-IDENTIFIER-BRANDED-001（Branded Type導入）、UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001（同名コンポーネント解消）を完了タスクセクションに参照追加 |
| 2026-02-22 | 1.28.0     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001完了反映: 関連未タスクテーブルを完了化（取り消し線）、完了タスクセクションに詳細記録追加。Renderer層のみ変更（skill.id→skill.name） |
| 2026-02-22 | 1.27.0     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: skillHandlers 関連未タスクテーブルに追加（skill.idハッシュ→getSkillByName失敗バグ） |
| 2026-02-21 | 1.26.0     | UT-FIX-SKILL-IMPORT-INTERFACE-001 追補: 「実装上の課題と教訓」を追加（Phase 12ステータス同期、旧参照パス残存、Vitest実行ディレクトリ差異） |
| 2026-02-21 | 1.25.0     | UT-FIX-SKILL-REMOVE-INTERFACE-001: Phase実行時の追加教訓テーブル追加（Phase依存順序違反・worktree Phase 11制約・カバレッジスコープ解釈） |
| 2026-02-21 | 1.25.0     | UT-FIX-SKILL-IMPORT-INTERFACE-001完了反映。`skill:import` の引数契約を `skillName: string` に統一し、バリデーション仕様・完了タスク記録を追加 |
| 2026-02-20 | 1.24.0     | 完了済み UT-9B-H-003 の参照先を `docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/index.md` に更新（削除済み旧パスの整合修正） |
| 2026-02-20 | 1.23.0     | UT-FIX-SKILL-REMOVE-INTERFACE-001完了反映。`skill:remove` の引数契約を `skillName: string` に更新し、バリデーション仕様・完了タスク記録を追加 |
| 2026-02-19 | 1.22.0     | TASK-9A-C: 関連未タスク3件の参照テーブル追加（TASK-9A-C-001/002/003）。ワークフローリンクをcompleted-tasks/に更新 |
| 2026-02-19 | 1.21.0     | TASK-9A-C: SkillEditor UI 型定義追加（SkillEditorProps, SkillCodeEditorProps, FileTreeCategory）。仕様書作成済み・実装未着手を明記 |
| 2026-02-19 | 1.21.0     | TASK-9A-B完了記録追加。スキルファイル操作IPCハンドラー6チャンネル（skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）、65テスト全PASS、カバレッジ Line 91.14% / Branch 93.93% / Function 100% |
| 2026-02-14 | 1.20.0     | UT-FIX-IPC-RESPONSE-UNWRAP-001完了記録追加。Preload IPCラッパー展開統一と苦戦箇所（参照正本・MINOR未タスク化・リンク整合）を追記 |
| 2026-02-13 | 1.19.0     | TASK-FIX-13-1 苦戦箇所・教訓を追記（削除範囲境界、参照誤検出対策、Phase 12同期手順） |
| 2026-02-13 | 1.18.0     | TASK-FIX-13-1完了記録追加。deprecated型プロパティ（`Anchor.name`, `Skill.lastUpdated`）削除と型定義テーブル（`lastModified`）を反映 |
| 2026-02-12 | 1.17.0     | UT-FIX-AGENTVIEW-INFINITE-LOOP-001完了記録追加。AgentViewのP31適用拡張（個別セレクタ移行）を反映 |
| 2026-02-12 | 1.16.2     | UT-9B-H-003完了後処理: 関連未タスクテーブルの参照パスを `completed-tasks/unassigned-task/` へ更新 |
| 2026-02-12 | 1.16.1     | UT-9B-H-003完了反映: 関連未タスクテーブルを更新（取り消し線 + 完了日追記） |
| 2026-02-12 | 1.16.0     | 未タスク2件追加: UT-9B-H-003（IPCセキュリティ強化）、UT-9B-H-004（設計書-実装整合性修正）。関連未タスクテーブルに優先度列追加 |
| 2026-02-12 | 1.15.0     | TASK-9B-H-SKILL-CREATOR-IPC完了: SkillCreatorService IPCチャンネルセクション追加（6チャンネル、SkillCreatorAPI型定義、85テスト） |
| 2026-02-12 | 1.14.1     | TASK-FIX-7-1セクション修正: テスト数を実際の値（61件）に訂正、型変換フローテーブルを実装コード（9フィールド明示コピー、lastModified除外）に準拠して修正 |
| 2026-02-12 | 1.14.0     | TASK-FIX-7-1完了: SkillService.executeSkill() SkillExecutor 委譲実装。Setter Injection パターン、型変換フロー、未タスク3件（UT-FIX-7-1-001/002/003） |
| 2026-02-10 | 1.13.0     | UT-FIX-5-4完了: AgentSDKAPI abort()型定義修正（`void` → `Promise<void>`）。P23パターン準拠で2箇所同時更新、24テスト追加 |
| 2026-02-04 | 1.12.0     | TASK-FIX-1-1-TYPE-ALIGNMENT: スキル型定義統一完了記録追加（skill-execution.ts削除、6型+1定数をskill.tsに統合、BaseStreamMessage抽出） |
| 2026-02-03 | 1.11.0     | マージ統合: TASK-9B-G + TASK-9C |
| 2026-02-03 | 1.10.0     | TASK-9B-G: 実装上の苦戦箇所・教訓セクション追加（未タスク登録漏れ、Script First統合設計、定数外部化、パストラバーサル防止） |
| 2026-02-03 | 1.9.0      | TASK-9B-G: SkillCreatorService仕様追加（SkillCreatorMode, ScriptExecutor, ResourceLoader型定義、API仕様、50テスト完了記録） |
| 2026-02-02 | 1.8.0      | TASK-8C-B: スキル選択E2Eテスト完了記録追加（8テスト、ARIA属性ベースセレクタ、安定性対策3層） |
| 2026-02-02 | 1.7.0      | TASK-8C-A: テストアーキテクチャセクション追加（テスト構成、適用パターン、ヘルパー関数、テストデータ定数） |
| 2026-02-02 | 1.6.0      | TASK-8A完了: スキル管理モジュール単体テスト231テスト全PASS、skillSlice 59テスト含む                       |
| 2026-02-02 | 1.5.0      | TASK-8C-A完了: skill:abort/get-statusチャネル仕様追加、IPC統合テスト完了記録                              |
| 2026-01-30 | 1.4.0      | TASK-7D完了: ChatPanel統合セクション追加                                                                  |
| 2026-01-30 | 1.3.0      | TASK-7B完了: SkillImportDialogファイルパス修正（components/skill/）                                       |
| 2026-01-28 | 1.2.0      | TASK-6-1完了: SkillSlice型定義セクション追加                                                              |
| 2026-01-26 | 1.1.0      | コードブロックを表形式・文章に変換（ガイドライン準拠）                                                    |
| 2026-01-26 | 1.0.0      | interfaces-agent-sdk.mdから分割                                                                           |
