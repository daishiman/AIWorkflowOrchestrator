# Phase 1: 要件定義・現状調査

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| 名称       | 要件定義・現状調査                         |
| タスクID   | TASK-P0-09                                 |
| ステータス | 未実施                                     |
| 依存       | なし（依存タスクの完了確認のみ）           |
| 完了条件   | 全タスクを100%実行し成果物が揃っていること |

---

## 目的

governance 実装の現状を精査し、P0-09 本体として実装すべき差分を確定する。
また TASK-P0-09-U1 サブタスクとの責務境界を明確化し、受入条件を確定する。

**タスク分類**: `feat`（セキュリティ境界の新規確立）
**命名規則記録**: TypeScript ファイルは `PascalCase`（クラス）、関数は `camelCase`、定数は `SCREAMING_SNAKE_CASE`

---

## 実行タスク

### T-01-1: 依存タスクの完了状況確認

依存タスクの完了を確認する。完了していない場合は着手しない。

```bash
# TASK-RT-06 (SDKメッセージ契約正規化) の完了確認
ls apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts

# TASK-P0-03 (manifest配置) の完了確認
ls apps/desktop/src/main/services/runtime/ManifestLoader.ts

# TASK-P0-04 (ManifestLoader有効化) の完了確認
grep -r "manifestLoader" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | head -5
```

**完了条件**:

- [ ] TASK-RT-06 が完了していることを確認（`sdkMessageNormalizer.ts` が存在）
- [ ] TASK-P0-03 が完了していることを確認（`ManifestLoader.ts` が存在）
- [ ] TASK-P0-04 が完了していることを確認（Facade で ManifestLoader が使用されている）

---

### T-01-2: governance ディレクトリの実装状況調査

`apps/desktop/src/main/services/runtime/governance/` の全ファイルを精査する。

```bash
# ファイル一覧確認
ls -la apps/desktop/src/main/services/runtime/governance/

# 各ファイルの実装状況確認
cat apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts
cat apps/desktop/src/main/services/runtime/governance/SkillCreatorHooksFactory.ts
cat apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts
cat apps/desktop/src/main/services/runtime/governance/index.ts
```

**調査観点**:

- `SkillCreatorPermissionPolicy.ts`: phase 別 policy テーブルの実装状況（`plan` / `execute` / `verify` / `improve` の 4 phase 一覧）
- `SkillCreatorHooksFactory.ts`: hooks インターフェースと実装（`onSessionStart` / `onPreToolUse` / `onPostToolUse` / `onSessionEnd`）
- `SkillCreatorAuditSink.ts`: audit 記録の実装状況（ring buffer の maxEvents 設定）
- `index.ts`: エクスポート一覧の整合性
- `SkillCreatorGovernancePhase` は `plan` / `execute` / `verify` / `improve` の 4 phase に限定されているか

**完了条件**:

- [ ] 全ファイルの実装済み/未実装/部分実装を一覧表として記録している
- [ ] 非 canonical phase 名を混入させていない

---

### T-01-3: RuntimeSkillCreatorFacade.ts の governance 統合状況調査

```bash
# governance 関連のインポート確認
grep -n "governance" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# createGovernanceHooks の実装確認
grep -n "createGovernanceHooks\|createExecuteGovernanceCanUseTool\|getGovernanceState\|auditSink\|currentGovernancePhase" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# 各 phase (plan/execute/verify/improve) での governance hooks 使用確認
grep -n "governanceHooks" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

**調査観点**:

- `createGovernanceHooks(phase)` が plan / execute / verify / improve の全 phase で呼ばれているか
- `createExecuteGovernanceCanUseTool()` で `_input` が未使用であること（context-aware 判定の未実装）
- `getGovernanceState()` IPC 向けメソッドが存在するか
- `auditSink` インスタンスが Facade に保持されているか

**完了条件**:

- [ ] Facade における governance 統合の現状が把握されている
- [ ] `_input` 未使用（TASK-P0-09-U1 へ carry-forward）が確認されている

---

### T-01-4: テストファイルの有無調査

```bash
# governance テストディレクトリの存在確認
ls apps/desktop/src/main/services/runtime/__tests__/governance/ 2>/dev/null || echo "テストディレクトリなし"

# RuntimeSkillCreatorFacade のテストで governance 関連を確認
grep -rn "governance\|canUseTool\|auditSink\|createGovernanceHooks" \
  apps/desktop/src/main/services/runtime/__tests__/ 2>/dev/null | head -20
```

**完了条件**:

- [ ] governance ユニットテストの有無が確認されている
- [ ] Facade 統合テストで governance が検証されているかが把握されている

---

### T-01-5: TASK-P0-09-U1 サブタスクの内容確認

```bash
cat docs/30-workflows/unassigned-task/TASK-P0-09-U1-governance-actual-enforcement-completion.md
cat docs/30-workflows/unassigned-task/TASK-P0-09-U1-path-scoped-governance-runtime-enforcement.md
```

**確認観点**:

- U1-A: `execute` / `improve` phase での `canUseTool` 実配線（context 引数を使う部分）
- U1-B: `targetPath` / `allowedSkillRoot` の SDK callback への接続

**完了条件**:

- [ ] P0-09 本体と U1 の責務境界が明確になっている
- [ ] P0-09 本体で実装すべき差分が確定している

---

### T-01-6: 受入条件（AC）の確定

上記調査を踏まえ、以下の受入条件を確定する。

#### AC-1: phase 別 policy の完備

- plan / execute / verify / improve の全 4 phase で `permissionMode` / `allowedTools` / `disallowedTools` が定義されている
- `DESTRUCTIVE_TOOLS` が全 phase で `disallowedTools` に含まれている

#### AC-2: lifecycle hooks の実装

- `onSessionStart` / `onPreToolUse` / `onPostToolUse` / `onSessionEnd` の全 4 hooks が実装されている
- `createHooks(phase, auditSink)` が全 phase に対応している

#### AC-3: audit sink の in-memory 実装

- `SkillCreatorAuditSink` が ring buffer 方式で audit イベントを記録する
- `record()` / `getEvents()` / `getRecentEvents()` / `getEventsBySession()` / `getDenialEvents()` / `clear()` が実装されている
- maxEvents を超えた場合に古いイベントが破棄される

#### AC-4: Facade 手前での正規化

- plan / execute / verify / improve の全 phase で `createGovernanceHooks(phase)` が呼ばれている
- `onSessionStart` / `onSessionEnd` が各 phase の開始・終了で確実に呼ばれている

#### AC-5: 品質要件

- 全ユニットテストが PASS
- `pnpm --filter @repo/desktop typecheck` がエラーなし
- `pnpm --filter @repo/desktop lint` がエラーなし
- `SkillCreatorAuditSink` の branch coverage が 80% 以上

---

## 成果物

| 成果物名                 | パス                                     | 必須 |
| ------------------------ | ---------------------------------------- | ---- |
| 現状ギャップ分析レポート | `outputs/phase-1/gap-analysis.md`        | ✅   |
| 受入条件定義書           | `outputs/phase-1/acceptance-criteria.md` | ✅   |
| タスク分類記録           | `outputs/phase-1/task-classification.md` | ✅   |

---

## 完了条件チェックリスト

- [ ] 依存タスク（TASK-RT-06 / P0-03 / P0-04）の完了が確認されている
- [ ] governance ディレクトリの全ファイル実装状況が一覧化されている
- [ ] Facade における governance 統合状況が把握されている
- [ ] governance テストファイルの有無が確認されている
- [ ] TASK-P0-09-U1 サブタスクの carry-forward 内容が把握されている
- [ ] 受入条件 AC-1〜AC-5 が明文化されている
- [ ] P0-09 本体で実装すべき差分が確定している
- [ ] タスク分類（feat）と命名規則が記録されている
- [ ] `outputs/phase-1/` に全成果物が配置されている

---

## サブタスク管理

| SubAgent   | 責務                                  |
| ---------- | ------------------------------------- |
| SubAgent-A | 依存タスクと current diff の確認      |
| SubAgent-B | skill 準拠 matrix と 4条件の整理      |
| SubAgent-C | U1 carry-forward 境界と受入条件の確定 |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                  | 内容                             |
| -------------------- | --------------------------------------------------------------------- | -------------------------------- |
| セキュリティ設計     | `.claude/skills/aiworkflow-requirements/references/security-*.md`     | SDK ガバナンスのセキュリティ要件 |
| アーキテクチャ設計   | `.claude/skills/aiworkflow-requirements/references/architecture-*.md` | Facade/Engine/Service の責務境界 |
| インターフェース定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-*.md`   | governance 関連の型定義          |

### 関連ファイル

| ファイル                          | パス                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| `RuntimeSkillCreatorFacade.ts`    | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                    |
| `SkillCreatorPermissionPolicy.ts` | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts`      |
| `SkillCreatorHooksFactory.ts`     | `apps/desktop/src/main/services/runtime/governance/SkillCreatorHooksFactory.ts`          |
| `SkillCreatorAuditSink.ts`        | `apps/desktop/src/main/services/runtime/governance/SkillCreatorAuditSink.ts`             |
| unassigned-task 指示書            | `docs/30-workflows/unassigned-task/TASK-P0-09-claude-sdk-permission-hooks-governance.md` |
