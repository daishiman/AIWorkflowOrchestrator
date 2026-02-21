# skillHandlers IPC引数命名統一（skillId → skillName横展開） - タスク指示書

## メタ情報

```yaml
issue_number: 858
```

## メタ情報

| 項目         | 内容                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| タスクID     | UT-FIX-SKILL-IPC-NAMING-P45-001                                                            |
| タスク名     | skillHandlers IPC引数命名統一（skillId → skillName横展開）                                 |
| 分類         | リファクタリング                                                                           |
| 対象機能     | スキル管理IPCハンドラ・サービス層・実行層                                                  |
| 優先度       | 中                                                                                         |
| 見積もり規模 | 中規模                                                                                     |
| ステータス   | 未実施                                                                                     |
| 発見元       | UT-FIX-SKILL-IMPORT-INTERFACE-001 / UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時（2026-02-20） |
| 発見日       | 2026-02-20                                                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-IMPORT-INTERFACE-001 および UT-FIX-SKILL-REMOVE-INTERFACE-001 の実装で、skill:import / skill:remove ハンドラの引数名を `skillId` → `skillName` に修正した。これはP45パターン（IPC引数命名の契約ドリフト）として `06-known-pitfalls.md` に記録されている。

しかし、同じ `skillHandlers.ts` 内の `skill:get-detail` / `skill:execute` ハンドラ、および下流の `SkillService` / `SkillExecutor` / `SkillImportManager` では、引数名が `skillId` のまま残存している。実際に渡される値はスキル「名前」（例: `"my-skill"`）であるにもかかわらず、引数名が `skillId` であるため、コードの意図が不明確になっている。

### 1.2 問題点・課題

#### 残存する命名不整合箇所

| レイヤー    | ファイル                        | 箇所             | 現在の引数名         | 実際の値       |
| ----------- | ------------------------------- | ---------------- | -------------------- | -------------- |
| IPCハンドラ | skillHandlers.ts:165            | skill:get-detail | `args.skillId`       | スキル名       |
| IPCハンドラ | skillHandlers.ts:198            | skill:execute    | `args.skillId`       | スキル名       |
| サービス層  | SkillService.ts:176             | executeSkill()   | `skillId: string`    | スキル名       |
| サービス層  | SkillService.ts:103             | importSkills()   | `skillIds: string[]` | スキル名の配列 |
| 実行層      | SkillExecutor.ts:71,88,134      | 実行パイプライン | `skillId`            | スキル名       |
| 管理層      | SkillImportManager.ts:92,98,153 | インポート管理   | `skillId`/`skillIds` | スキル名       |

#### 命名不統一による問題

1. **可読性低下**: `skillId` という変数名からは「一意のID」を連想するが、実際にはスキルの名前（ディレクトリ名）が渡される。コードを読む際に「IDなのか名前なのか」を毎回確認する必要がある
2. **保守性リスク**: 将来的にスキルにUUIDベースのIDを導入した場合、「名前」と「ID」の区別が付かないコードが大量に存在し、移行コストが増大する
3. **修正済みハンドラとの一貫性欠如**: `skill:import` / `skill:remove` は `skillName` に修正済みだが、`skill:get-detail` / `skill:execute` は未修正。同一ファイル内でパターンが混在する

### 1.3 放置した場合の影響

1. 新規開発者が `skillId` と `skillName` の違いを理解できず、誤った前提で実装するリスクがある
2. 将来のID導入時に、名前ベースの検索とIDベースの検索が混在し、データ整合性の問題が発生する可能性がある
3. P45パターンの再発を防止するための教訓が活かされない

---

## 2. 何を達成するか（What）

### 2.1 目的

`skillHandlers.ts` およびその下流サービス（`SkillService`, `SkillExecutor`, `SkillImportManager`）における `skillId` 引数名を、実際の値のセマンティクスに合致する `skillName` に統一する。

### 2.2 最終ゴール

- `skillHandlers.ts` の全ハンドラで、スキル名を受け取る引数が `skillName` に命名されている
- `SkillService` / `SkillExecutor` / `SkillImportManager` のメソッドパラメータが `skillName` に統一されている
- 全テストが PASS する
- TypeScript 型チェックが PASS する

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/ipc/skillHandlers.ts` の `skill:get-detail`, `skill:execute` ハンドラの引数名変更
- `apps/desktop/src/main/services/skill/SkillService.ts` のメソッドパラメータ名変更
- `apps/desktop/src/main/services/skill/SkillExecutor.ts` のパラメータ名変更
- `apps/desktop/src/main/services/skill/SkillImportManager.ts` のパラメータ名変更
- 対応するテストファイルの変数名更新
- Preload側の呼び出しとの整合性確認

#### 含まないもの

- `skill:abort` / `skill:get-status` の `executionId` 引数（これは正しくIDを指す）
- P42バリデーション追加（UT-FIX-SKILL-VALIDATION-P42-001のスコープ）
- エラー応答パターン統一（UT-FIX-SKILL-IPC-ERROR-RESPONSE-001のスコープ）
- 戻り値型の修正（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001のスコープ）
- `SkillExecutor` の `executionId`（これは正しく実行IDを指す）

### 2.4 成果物

| 成果物           | パス                                                         |
| ---------------- | ------------------------------------------------------------ |
| 修正済みハンドラ | `apps/desktop/src/main/ipc/skillHandlers.ts`                 |
| 修正済みサービス | `apps/desktop/src/main/services/skill/SkillService.ts`       |
| 修正済み実行層   | `apps/desktop/src/main/services/skill/SkillExecutor.ts`      |
| 修正済み管理層   | `apps/desktop/src/main/services/skill/SkillImportManager.ts` |
| テストコード     | 対応する全テストファイル                                     |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-IMPORT-INTERFACE-001 が完了済みであること
- UT-FIX-SKILL-REMOVE-INTERFACE-001 が完了済みであること

### 3.2 依存タスク

| タスクID                            | 関係             | 説明                                                    |
| ----------------------------------- | ---------------- | ------------------------------------------------------- |
| UT-FIX-SKILL-IMPORT-INTERFACE-001   | 先行（完了済み） | skill:import の引数名修正の前例                         |
| UT-FIX-SKILL-REMOVE-INTERFACE-001   | 先行（完了済み） | skill:remove の引数名修正の前例                         |
| UT-FIX-SKILL-VALIDATION-P42-001     | 並行可能         | P42バリデーション横展開（同一ファイルだがスコープ独立） |
| UT-FIX-SKILL-IPC-ERROR-RESPONSE-001 | 並行可能         | エラー応答統一（同一ファイルだがスコープ独立）          |

### 3.3 必要な知識

- P45パターン（引数命名の契約ドリフト）: `06-known-pitfalls.md` P45セクション
- P44パターン（IPC契約ドリフト防止）: `06-known-pitfalls.md` P44セクション
- IPC契約チェックリスト: `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`
- Vitest の IDE Refactoring 連携: リネーム操作で全参照箇所が追随するか確認

### 3.4 推奨アプローチ

リネームリファクタリングを各レイヤーで下流から上流に向かって実施する。

**リネーム順序**（依存方向の逆順で安全に実施）:

1. `SkillImportManager.ts` — 最下流（ファイルシステム操作）
2. `SkillExecutor.ts` — 実行パイプライン
3. `SkillService.ts` — サービス層（#1, #2 を呼び出す）
4. `skillHandlers.ts` — IPC ハンドラ層（#3 を呼び出す）
5. テストファイル — 全レイヤーのテスト

**注意**: `SkillExecutor` の `executionId` は実行IDを正しく指すため、リネーム対象外。`skillId` のみをリネームすること。

**Before/After例:**

```typescript
// ❌ Before: SkillService
async executeSkill(skillId: string, params?: Record<string, unknown>): Promise<ExecutionResult> {
  const skill = await this.getSkillDetail(skillId);
  // ...
}

// ✅ After: SkillService
async executeSkill(skillName: string, params?: Record<string, unknown>): Promise<ExecutionResult> {
  const skill = await this.getSkillDetail(skillName);
  // ...
}
```

```typescript
// ❌ Before: skillHandlers.ts skill:get-detail
const args = rawArgs as { skillId: string };
if (typeof args?.skillId !== "string") {
  return { success: false, error: "skillId must be a string" };
}
const result = await skillService.getSkillDetail(args.skillId);

// ✅ After: skillHandlers.ts skill:get-detail
const args = rawArgs as { skillName: string };
if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
  return { success: false, error: "skillName must be a non-empty string" };
}
const result = await skillService.getSkillDetail(args.skillName);
```

### 3.5 実装課題と解決策（UT-FIX-SKILL-IMPORT-INTERFACE-001 からの教訓）

#### 課題1: コンパイル時検出不可のインターフェース不整合（P44）

| 項目             | 内容                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 発生状況         | Main Processのハンドラが `{ skillId: string }` を期待し、Preload側が `skillName` という別名で渡していたが、TypeScriptコンパイラはPreloadのモック化（`contextBridge.exposeInMainWorld`）により不整合を検出できなかった。UT-FIX-SKILL-IMPORT-INTERFACE-001ではランタイム（`Error occurred in handler for 'skill:import': { code: 'VALIDATION_ERROR', message: 'skillIds must be an array' }`）で初めて顕在化した |
| 本タスクでの対策 | リネーム前に `grep -rn "skillId" apps/desktop/src/` で全使用箇所を網羅的に列挙する。Preload側（`skill-api.ts`）の呼び出しパターンと照合し、引数のセマンティクスが一致していることを確認する                                                                                                                                                                                                                    |
| チェック方法     | ipc-contract-checklist.md Phase 1-6 を実施                                                                                                                                                                                                                                                                                                                                                                     |

#### 課題2: 多レイヤー同時リネームの波及範囲（P23拡張）

| 項目             | 内容                                                                                                                                                                                                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 発生状況         | `skillId` はIPCハンドラ層だけでなく、サービス層（SkillService）、実行層（SkillExecutor）、管理層（SkillImportManager）の4レイヤーに跨って使用されている。UT-FIX-SKILL-IMPORT-INTERFACE-001では3箇所（ハンドラ・Preload API・テスト）の同時更新が必要だったが、本タスクではさらに広範囲（4レイヤー + テスト）のリネームが必要 |
| 本タスクでの対策 | 下流から上流へ（SkillImportManager → SkillExecutor → SkillService → skillHandlers）の順序でリネームし、各ステップ後にテストを実行して回帰を検出する。一気にリネームせず、レイヤーごとに段階的に実施する                                                                                                                      |
| チェック方法     | 各レイヤーのリネーム後に `cd apps/desktop && pnpm vitest run` で全テストPASSを確認                                                                                                                                                                                                                                           |

#### 課題3: executionId との区別（本タスク固有の判断ポイント）

| 項目             | 内容                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 発生状況         | `SkillExecutor` では `skillId`（スキル名）と `executionId`（実行ID）が同じファイル内に共存している。無差別に `skillId` をリネームすると、`executionId` まで誤って変更するリスクがある |
| 本タスクでの対策 | `grep -n "skillId" SkillExecutor.ts` で各行の文脈を確認し、スキル名を指す `skillId` のみをリネーム対象とする。`executionId` を指す変数は一切変更しない                                |
| チェック方法     | リネーム後に `grep -n "skillId" SkillExecutor.ts` で残存箇所がないことを確認（`executionId` は残存OK）                                                                                |

#### 課題4: テストモック定義の大規模修正（P21/P35）

| 項目             | 内容                                                                                                                                                                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 発生状況         | UT-FIX-SKILL-IMPORT-INTERFACE-001では、テストのモック定義で `{ skillIds: string[] }` → `skillName: string` への変更が104テスト中の多数に影響した。本タスクでもサービス層のパラメータリネームにより、複数のテストファイルでモック引数名の更新が必要になる |
| 本タスクでの対策 | 影響範囲を事前に `grep -rn "skillId" apps/desktop/src/**/*.test.ts` で特定し、変更量を見積もる。テストファイル内の `skillId` → `skillName` は機械的リネームで対応可能                                                                                    |
| チェック方法     | リネーム後に全テスト実行で回帰なしを確認                                                                                                                                                                                                                 |

#### 課題5: P42準拠3段バリデーションの標準化

| 項目             | 内容                                                                                                                                                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 発生状況         | UT-FIX-SKILL-IMPORT-INTERFACE-001で `typeof !== "string"` → `=== ""` → `.trim() === ""` の3段バリデーションを標準化した。リネーム時にバリデーションメッセージ内の引数名（`"skillId must be..."` → `"skillName must be..."`）も同時更新が必要 |
| 本タスクでの対策 | リネーム対象にバリデーションエラーメッセージ内の文字列も含める。`grep -rn "skillId" apps/desktop/src/main/` でメッセージ文字列内の参照も漏れなく検出する                                                                                     |
| チェック方法     | エラーメッセージ内に `skillId` が残存していないことを `grep` で確認                                                                                                                                                                          |

#### 課題6: 並列エージェント管理とコンフリクト解消

| 項目             | 内容                                                                                                                                                                                                                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 発生状況         | UT-FIX-SKILL-IMPORT-INTERFACE-001では7エージェント並列実行時にrate limitに到達し一部が中断した。またorigin/main（REMOVE taskマージ後）との13件のマージコンフリクトが発生し、追加工数が必要になった。本タスクは同一ファイル群（skillHandlers.ts, SkillService.ts等）を修正するため、同様のコンフリクトリスクがある |
| 本タスクでの対策 | 実装前にmainの最新をマージしてから着手する。仕様書更新は3ファイル以下/エージェントに分割し、rate limitを回避する                                                                                                                                                                                                  |
| チェック方法     | `git merge origin/main` でコンフリクトなしを確認してから実装開始                                                                                                                                                                                                                                                  |

---

## 4. 実行手順

### Phase構成

| Phase | 名称       | 内容                               |
| ----- | ---------- | ---------------------------------- |
| 1     | 要件定義   | リネーム対象箇所の網羅的洗い出し   |
| 2     | 設計       | リネーム順序・影響範囲の確定       |
| 4     | テスト作成 | リネーム後の期待値テストケース追加 |
| 5     | 実装       | 4レイヤーの段階的リネーム          |
| 9     | 品質検証   | Lint・型チェック・全テスト実行     |

### 各Phase詳細

#### Phase 1: 要件定義

全使用箇所の洗い出し:

```bash
# skillId の全使用箇所を列挙
grep -rn "skillId" apps/desktop/src/main/ --include="*.ts"

# テストファイルの使用箇所
grep -rn "skillId" apps/desktop/src/main/ --include="*.test.ts"

# Preload側の呼び出しパターン確認
grep -rn "skillId\|skillName" apps/desktop/src/preload/ --include="*.ts"
```

各行について「スキル名を指すskillId」と「実行IDを指すexecutionId」を分類し、リネーム対象リストを作成する。

#### Phase 5: 実装

以下の順序でレイヤーごとにリネームを実施:

1. **SkillImportManager.ts**: `skillId`/`skillIds` → `skillName`/`skillNames` （importSkills, isImported, removeSkill）
2. **SkillExecutor.ts**: `skillId` → `skillName` （executeSkill, 実行コンテキスト内のみ。executionIdは変更しない）
3. **SkillService.ts**: `skillId` → `skillName` （executeSkill, getSkillDetail, importSkills パラメータ）
4. **skillHandlers.ts**: `args.skillId` → `args.skillName` （skill:get-detail, skill:execute）
5. **テストファイル**: 全てのskillId参照をskillNameに更新

各ステップ後にテスト実行:

```bash
cd apps/desktop && pnpm vitest run src/main/
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skillHandlers.ts` のスキル名を受け取る全ハンドラで引数名が `skillName` である
- [ ] `SkillService` のスキル名パラメータが `skillName` に統一されている
- [ ] `SkillExecutor` のスキル名パラメータが `skillName` に統一されている（executionIdは変更なし）
- [ ] `SkillImportManager` のスキル名パラメータが `skillName`/`skillNames` に統一されている
- [ ] `grep -rn "skillId" apps/desktop/src/main/` の結果に、スキル名を指すskillIdが残存していない（executionIdのみ残存OK）

### 品質要件

- [ ] 全テストが PASS する
- [ ] TypeScript 型チェックが PASS する
- [ ] ESLint が PASS する
- [ ] 既存テストの動作が変わっていないこと

### ドキュメント要件

- [ ] 本タスク仕様書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` の残課題テーブルに登録されている

---

## 6. 検証方法

### 検証手順

1. リネーム前: `grep -rn "skillId" apps/desktop/src/main/ | wc -l` でベースライン取得
2. リネーム後: 同コマンドでカウント減少を確認
3. `cd apps/desktop && pnpm vitest run` で全テストPASS
4. `pnpm typecheck` で型整合性確認
5. `pnpm lint` でLint PASS
6. `grep -rn "skillId" apps/desktop/src/main/ipc/skillHandlers.ts` でハンドラ層にskillIdが残存していないことを確認

---

## 7. リスクと対策

| リスク                                              | 影響度 | 対策                                                                                |
| --------------------------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| executionIdの誤リネーム                             | 高     | 各行の文脈を確認し、スキル名を指すskillIdのみリネーム                               |
| テストファイルの大規模修正                          | 中     | grep で事前に影響範囲を把握し、機械的リネームで対応                                 |
| Preload側との整合性崩壊                             | 中     | Preload側は既にskillNameを使用（修正済み）。ipc-contract-checklist.md Phase 2で照合 |
| P42タスクとのコンフリクト                           | 低     | P42タスクは.trim()追加のみでパラメータ名を変更しない。git rebase で解決可能         |
| UT-FIX-SKILL-IPC-ERROR-RESPONSE-001とのコンフリクト | 低     | エラー応答統一はreturn形式の変更のみ。パラメータ名変更との直接衝突なし              |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                                        | 参照理由                   |
| -------------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| P45パターン                | `.claude/rules/06-known-pitfalls.md#P45`                                                    | 引数命名ドリフトの教訓     |
| P44パターン                | `.claude/rules/06-known-pitfalls.md#P44`                                                    | IPC契約ドリフト防止の教訓  |
| P23パターン                | `.claude/rules/06-known-pitfalls.md#P23`                                                    | 多レイヤー同時更新の教訓   |
| P42パターン                | `.claude/rules/06-known-pitfalls.md#P42`                                                    | 3段バリデーションパターン  |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | IPC修正時の品質ゲート      |
| Agent SDK Skill仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | インターフェース定義の正本 |
| スキルIPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | セキュリティ要件           |
| アーキテクチャ実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P44/P45パターンの詳細  |

### 参考資料

| 資料                         | 参照理由                                      |
| ---------------------------- | --------------------------------------------- |
| `skill:import` のP45修正実装 | skillHandlers.ts 行120-140 — リネーム参考実装 |
| `skill:remove` のP45修正実装 | skillHandlers.ts 行150-156 — リネーム参考実装 |

---

## 9. 備考

- 本タスクは純粋なリネームリファクタリングであり、ロジック変更を伴わない。テストの期待値変更も引数名の文字列マッチングのみ
- P42バリデーション追加（UT-FIX-SKILL-VALIDATION-P42-001）と同時実施する場合は、リネームを先に実施し、その後P42を適用する方がコンフリクトが少ない
- `SkillExecutor` 内の `executionId` は実行IDを正しく指すため、リネーム対象外である。リネーム時にこの区別を間違えないよう注意すること
- `SkillImportManager.importSkills` の引数 `skillIds: string[]` は実態としてスキル名の配列であるため、`skillNames: string[]` にリネームする
