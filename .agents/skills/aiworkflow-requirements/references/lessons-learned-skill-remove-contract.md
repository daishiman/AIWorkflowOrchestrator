# Lessons Learned（教訓集） / skill domain lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: skill domain lessons

## UT-FIX-SKILL-REMOVE-INTERFACE-001: skill:remove インターフェース整合修正

### タスク概要

| 項目        | 内容                                                             |
| ----------- | ---------------------------------------------------------------- |
| タスクID    | UT-FIX-SKILL-REMOVE-INTERFACE-001                                |
| 目的        | `skill:remove` の IPC 契約を Main / Service / 仕様書で一貫させる |
| 完了日      | 2026-02-20                                                       |
| ステータス  | **完了**                                                         |
| 関連Pitfall | P23, P32, P42, P44                                               |
| テスト      | SH-RM-01〜SH-RM-11（11件追加）                                   |

### 苦戦箇所と解決策

#### 1. `skillId` / `skillName` 契約ドリフト

| 項目       | 内容                                                                                                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | MainハンドラーとService層で同じ文字列引数を扱っているのに、命名が `skillId` / `skillName` で混在し、仕様書ともズレた                                                      |
| **原因**   | 実装先行で命名統一ルールを適用しきれず、Step 2更新時に契約差分が残った                                                                                                    |
| **解決策** | `skill:remove` を `skillName: string` に統一。Mainハンドラーで `.trim()` を含む3段バリデーションを実施し、関連仕様書4件（interfaces/api/security/architecture）を同時更新 |
| **教訓**   | 引数名は型と同等の契約。コード修正時に仕様書を1ファイルでも後回しにすると再ドリフトする                                                                                   |

**コード例（Before → After）**:

```typescript
// ❌ Before: 3ファイルで命名が混在
// skillHandlers.ts — skillId を使用
ipcMain.handle(IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, args: { skillId: string }) => {
    // args.skillId でアクセス
    return skillService.removeSkill(args.skillId);
  }
);

// SkillService.ts — skillName を使用
async removeSkill(skillName: string): Promise<RemoveResult> {
  return this.importManager.removeSkill(skillName);
}

// SkillImportManager.ts — skillName を使用
async removeSkill(skillName: string): Promise<RemoveResult> { ... }
```

```typescript
// ✅ After: 全3ファイルで skillName に統一 + P42準拠3段バリデーション
// skillHandlers.ts
ipcMain.handle(IPC_CHANNELS.SKILL_REMOVE,
  async (event: IpcMainInvokeEvent, skillName: string) => {
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_REMOVE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }
    // P42準拠: 3段バリデーション（型チェック → 空文字列 → トリム空文字列）
    if (typeof skillName !== "string" || skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    return skillService.removeSkill(skillName);
  }
);

// SkillService.ts — 同じ skillName を透過
async removeSkill(skillName: string): Promise<RemoveResult> {
  return this.importManager.removeSkill(skillName);
}

// SkillImportManager.ts — 同じ skillName を使用
async removeSkill(skillName: string): Promise<RemoveResult> {
  log.debug("[SkillImportManager] removeSkill called with:", skillName);
  const removed = this.importedIds.has(skillName);
  // ...
}
```

**同時更新が必要な箇所の一覧**（P23/P32パターン）:

| 更新対象                 | ファイル                        | 変更内容                     |
| ------------------------ | ------------------------------- | ---------------------------- |
| Mainハンドラー           | `skillHandlers.ts`              | 引数型・バリデーション・命名 |
| Service層                | `SkillService.ts`               | メソッドシグネチャの引数名   |
| Import Manager           | `SkillImportManager.ts`         | メソッドシグネチャの引数名   |
| テスト                   | `skillHandlers.test.ts`         | モック・アサーション全件     |
| 仕様書（interfaces）     | `interfaces-agent-sdk-skill.md` | 契約定義                     |
| 仕様書（API）            | `api-ipc-agent.md`              | エンドポイント定義           |
| 仕様書（セキュリティ）   | `security-skill-ipc.md`         | バリデーションルール         |
| 仕様書（アーキテクチャ） | `arch-electron-services.md`     | Service契約                  |

#### 2. 未タスク配置ディレクトリのドリフト

| 項目       | 内容                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | 未実施タスク指示書が `docs/30-workflows/completed-tasks/unassigned-task/` に残り、`unassigned-task/` 参照と不整合になった                                   |
| **原因**   | 既存の移管運用（完了済み未タスクのアーカイブ）と、未実施タスク配置ルールが混在していた                                                                      |
| **解決策** | 未実施指示書を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に補完し、`task-workflow.md` / `api-ipc-agent.md` の参照を統一。`verify-unassigned-links.js` で全件検証 |
| **教訓**   | 「未実施」と「完了済み」をディレクトリ境界で分離し、参照修正と物理配置を同じターンで完了させる                                                              |

**ディレクトリ構造の正しい配置**:

```
docs/30-workflows/
├── unassigned-task/                    # ✅ 未実施タスク指示書の正しい配置先
│   ├── task-xxx.md
│   └── task-yyy.md
├── completed-tasks/
│   ├── feature-a/                      # 完了タスクのアーカイブ
│   └── feature-b/
└── skill-import-agent-system/
    └── tasks/
        └── completed-task/             # ❌ ここに未実施指示書を置かない
```

**類似パターン**: P3（未タスク管理の3ステップ不完全）、P38（未タスク配置ディレクトリ間違い）

#### 3. Vitest実行コンテキスト差異

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| **課題**   | ルート実行と `apps/desktop` 実行で Vitest 設定解決が異なり、watch設定由来の失敗が発生した      |
| **原因**   | モノレポ構成で package 単位の設定（alias / environment）を前提にしたテストをルートから実行した |
| **解決策** | 検証コマンドを `apps/desktop` コンテキストに固定し、`vitest run` で非watch実行に統一           |
| **教訓**   | 「どこでコマンドを打つか」も再現性要件。Phase 11/12の証跡には実行ディレクトリを明記する        |

**コマンド例（正しい実行方法 / 間違い例）**:

```bash
# ❌ プロジェクトルートから直接実行 → vitest.config.ts が解決されない
cd /path/to/AIWorkflowOrchestrator
pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts

# ❌ watchモード（デフォルト）→ CI/自動実行で停止しない
cd apps/desktop
pnpm vitest src/main/ipc/__tests__/skillHandlers.test.ts

# ✅ 対象パッケージディレクトリから vitest run で実行
cd apps/desktop
pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts

# ✅ pnpm --filter を使用（ディレクトリ移動不要）
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts

# ✅ 特定テストIDのみ実行
cd apps/desktop
pnpm vitest run -t "SH-RM" src/main/ipc/__tests__/skillHandlers.test.ts
```

**類似パターン**: P40（テスト実行ディレクトリ依存）

#### 4. worktree環境でのStep 1-A先送り誤判断

| 項目       | 内容                                                                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | worktreeで作業中という理由で、Phase 12 Task 2 Step 1-A（LOGS/SKILL/関連仕様更新）を「マージ後対応」に先送りし、仕様同期が不完全なまま残った                                                        |
| **原因**   | 「worktreeではスキル仕様書を更新しない」という誤った運用を採用し、spec-update-workflowの必須条件よりローカル判断を優先した                                                                         |
| **解決策** | worktreeでもStep 1-Aを通常通り実施。未実施タスク誤配置（`completed-tasks/unassigned-task/`）を是正し、`task-workflow.md` 参照を `unassigned-task/` へ同期。`verify-unassigned-links.js` で機械検証 |
| **教訓**   | 「作業場所（worktree）」はStep 1-A省略理由にならない。省略ではなく、同一ブランチで仕様更新まで完結させることが再発防止に直結する                                                                   |

**実行コマンド（再発防止用）**:

```bash
# 未実施タスクの誤配置を検出（completed配下に未着手/未実施が混在していないか）
rg -n "^\\| ステータス\\s*\\|.*未着手|^\\| ステータス\\s*\\|.*未実施|^\\| ステータス\\s*\\|.*進行中" \
  docs/30-workflows/completed-tasks/unassigned-task -g "*.md"

# task-workflow.md の参照整合を検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

#### 5. マルチエージェントPhase実行の依存順序違反

| 項目       | 内容                                                                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Phase 1-12を5エージェントに分割して全て並列ディスパッチした結果、Phase 4-7エージェントがPhase 1-3エージェントより先に完了した                                                                         |
| **原因**   | 要件定義（Phase 1）→ 設計（Phase 2）→ レビュー（Phase 3）の成果物が、後続Phaseの前提条件として参照されるべきだった                                                                                    |
| **解決策** | Phase依存チェーンを尊重し、ゲートPhase（Phase 3設計レビュー、Phase 10最終レビュー）の前後で並列化区間を分離する。推奨構成: [Phase 1→2→3] → [Phase 4→5→6→7] → [Phase 8→9→10] → [Phase 11] → [Phase 12] |
| **教訓**   | エージェントディスパッチ前にPhase依存チェーンを確認し、ゲートPhaseを跨ぐ並列化を禁止する                                                                                                              |

#### 6. worktree環境でのPhase 11手動テスト制約

| 項目       | 内容                                                                                                                 |
| ---------- | -------------------------------------------------------------------------------------------------------------------- |
| **課題**   | Git worktree環境ではElectronアプリを起動できないため、Phase 11（手動テスト）のUI操作テストが実行不可                 |
| **原因**   | Phase 11仕様書が「Electronアプリ起動 → DevTools → 操作確認」を前提としている                                         |
| **解決策** | worktree環境では自動テスト（vitest）で代替し、制約を成果物に明記する。Electron起動テストはmainブランチマージ後に実施 |
| **教訓**   | Phase 11仕様書にworktree環境用の代替手順を明記する                                                                   |

#### 7. カバレッジ閾値のスコープ解釈

| 項目       | 内容                                                                                                                             |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **課題**   | `skillHandlers.ts` 全体のLine Coverage 45.14%（最低基準80%未満）だが、skill:remove固有のコード（行140-159）は全分岐カバー        |
| **原因**   | Phase 7（カバレッジ確認）の判定基準が「ファイル全体」か「修正対象ハンドラ」かが仕様書上あいまい                                  |
| **解決策** | バグ修正タスクのカバレッジはファイル全体ではなく修正対象関数の分岐カバー率で判定する。ファイル全体のカバレッジは参考値として記録 |
| **教訓**   | Phase 7仕様書に「修正対象関数のBranch Coverage 100%」を必須条件として明記する                                                    |

### 同種課題の簡潔解決手順（チェックリスト形式）

IPCインターフェース契約修正を行う場合、以下を順に実行する:

#### Step 1: 契約語彙の横断検出と統一判定

```bash
# 命名の混在を検出
rg -n "skillId|skillName" apps/desktop/src/main/ --type ts
rg -n "skillId|skillName" .claude/skills/aiworkflow-requirements/references/ --type md
```

- [ ] 実装コード内の命名混在を全件リストアップ
- [ ] 仕様書内の命名混在を全件リストアップ
- [ ] 統一先の命名を1つ決定（Preload側に合わせるのが原則）

#### Step 2: 実装と仕様書を同一ターンで更新

- [ ] Mainハンドラー（`skillHandlers.ts`）を更新
- [ ] Service層（`SkillService.ts`）を更新
- [ ] Import Manager / 下位層を更新
- [ ] テストファイル（`skillHandlers.test.ts`）を更新
- [ ] 仕様書 interfaces を更新
- [ ] 仕様書 api を更新
- [ ] 仕様書 security を更新
- [ ] 仕様書 architecture を更新

#### Step 3: 未実施タスク指示書の配置検証

```bash
# 配置先の確認
ls docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/
# 検証スクリプト実行
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

- [ ] 未実施タスク指示書が `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` にある
- [ ] `task-workflow.md` の参照パスが正しい
- [ ] `verify-unassigned-links.js` が `ALL_LINKS_EXIST` を返す

#### Step 4: テスト実行と結果記録

```bash
# 対象パッケージディレクトリから実行
cd apps/desktop
pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
```

- [ ] 全テストがPASS
- [ ] 実行ディレクトリをPhase成果物に明記
- [ ] `vitest run`（非watchモード）で実行

#### Step 5: 型チェックと最終検証

```bash
pnpm --filter @repo/shared build && pnpm typecheck
```

- [ ] 型チェックPASS
- [ ] `git diff --stat` で変更ファイル数を確認

### 予防策

今後同様の契約ドリフトを防止するための具体的手順:

| 予防策                         | 実施タイミング           | 具体的なアクション                                       |
| ------------------------------ | ------------------------ | -------------------------------------------------------- |
| **命名規約の事前確認**         | Phase 2（設計）          | Preload側の既存命名をgrepで確認し、ハンドラ設計に反映    |
| **P23準拠の同時更新**          | Phase 5（実装）          | ハンドラ・Service・Preload・テストを1コミットで更新      |
| **P42準拠のバリデーション**    | Phase 5（実装）          | 全文字列引数に `.trim() === ""` チェックを追加           |
| **仕様書の即時更新**           | Phase 12（ドキュメント） | 実装完了後、PRマージを待たず仕様書を更新（P26対策）      |
| **未タスク3ステップ検証**      | Phase 12（ドキュメント） | ①指示書作成 → ②残課題テーブル → ③参照リンク → verify実行 |
| **テスト実行コンテキスト明記** | Phase 11（手動テスト）   | 実行ディレクトリとコマンドを証跡に記録                   |

### 関連ドキュメント更新

| ドキュメント                  | 更新内容                                                |
| ----------------------------- | ------------------------------------------------------- |
| task-workflow.md              | 未タスク参照パスを `unassigned-task/` に統一            |
| api-ipc-agent.md              | UT-9A-B派生未タスク参照パスを `unassigned-task/` に統一 |
| interfaces-agent-sdk-skill.md | `skill:remove` 契約の完了記録を反映                     |
| arch-electron-services.md     | Service層の引数契約を `skillName` として明記            |

### 関連パターン相互参照

| パターン                                                                            | 関連性                                        | 本タスクでの教訓                                        |
| ----------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| [P23: API二重定義の型管理](../../../rules/06-known-pitfalls.md#p23)                 | ハンドラ・Service・Preloadの3層同時更新が必要 | 命名の統一も型と同等の「契約」として扱う                |
| [P32: 型定義の二箇所同時更新](../../../rules/06-known-pitfalls.md#p32)              | 実装ファイル + 仕様書の同時更新パターン       | 仕様書4件の同時更新が漏れやすい                         |
| [P42: .trim()バリデーション漏れ](../../../rules/06-known-pitfalls.md#p42)           | 3段バリデーション標準化                       | `skillName` にも `.trim()` チェック適用                 |
| [P44: skill:import インターフェース不整合](../../../rules/06-known-pitfalls.md#p44) | 同一チャンネル群の姉妹タスク                  | `skill:import` と `skill:remove` で同じドリフトパターン |
| [P3: 未タスク管理の3ステップ不完全](../../../rules/06-known-pitfalls.md#p3)         | 未タスク配置ドリフト                          | ディレクトリ境界での分離が不十分だった                  |
| [P40: テスト実行ディレクトリ依存](../../../rules/06-known-pitfalls.md#p40)          | Vitest実行コンテキスト                        | `apps/desktop` からの実行が必須                         |

> **統合チェックリスト**: 上記パターンを統合したIPC修正時の品質ゲートは [ipc-contract-checklist.md](./ipc-contract-checklist.md) を参照。

### 関連未タスク

| タスクID                                   | タスク名                                              | 優先度 | 仕様書                                                                                                                                                                                |
| ------------------------------------------ | ----------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ~~UT-FIX-SKILL-VALIDATION-P42-001~~        | ~~skillHandlers P42準拠バリデーション横展開~~         | ~~中~~ | **完了: 2026-02-24（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001で実施）**                                                                                                                 |
| UT-FIX-SKILL-IPC-ERROR-RESPONSE-001        | skillHandlers IPCバリデーションエラー応答パターン統一 | 中     | [`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ipc-skill-error-response-unification.md`](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ipc-skill-error-response-unification.md)           |
| UT-IMP-PHASE11-WORKTREE-PROTOCOL-001       | Phase 11 Worktree環境手動テスト実行プロトコル策定     | 中     | [`docs/30-workflows/completed-tasks/task-imp-phase11-worktree-testing-protocol-001.md`](../../../docs/30-workflows/completed-tasks/task-imp-phase11-worktree-testing-protocol-001.md) |
| UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001   | IPCハンドラ粒度カバレッジ計測インフラ構築             | 中     | [`docs/30-workflows/completed-tasks/task-imp-ipc-handler-coverage-granular-001.md`](../../../docs/30-workflows/completed-tasks/task-imp-ipc-handler-coverage-granular-001.md)         |
| UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001 | マルチエージェントPhase依存順序ガード                 | 中     | [`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-multiagent-phase-ordering-guard-001.md`](../../../docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-multiagent-phase-ordering-guard-001.md)     |

---

