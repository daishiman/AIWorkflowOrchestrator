# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                                           |
| ---------- | ---------------------------------------------------------------------------- |
| Phase      | 1                                                                            |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名   | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 機能名     | skill-import-return-type-fix                                                 |
| 分類       | バグ修正                                                                     |
| 作成日     | 2026-02-21                                                                   |
| 関連タスク | UT-FIX-SKILL-IMPORT-INTERFACE-001（引数形式修正）                            |

## 目的

skill:import IPCハンドラの戻り値型不整合を修正し、Main ProcessからRenderer Processへ正しい`ImportedSkill`型のデータが返却されるようにする。現状は`ImportResult`型（`{ success, importedCount, errors }`）が返却されており、Renderer側の`agentSlice.ts`が`ImportedSkill`として`importedSkills`配列に格納するため、UIでスキル一覧が正しく表示されない。

## 実行タスク

- 要件抽出: 戻り値型不整合の原因分析とIPCインターフェース契約の確認
- 受け入れ基準作成: 戻り値型の検証可能な基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名             | パス                                                                                        | 説明                           |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| IPC Agent仕様書    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | IPC API設計仕様                |
| SDK Skill型仕様書  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | ImportedSkill/ImportResult定義 |
| セキュリティ仕様書 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPCセキュリティ原則            |
| 実装パターン集     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P32/P44パターン            |
| 共有型定義         | `packages/shared/src/types/skill.ts`                                                        | ImportResult/ImportedSkill定義 |
| skillHandlers.ts   | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                | 修正対象ハンドラ               |
| skill-api.ts       | `apps/desktop/src/preload/skill-api.ts`                                                     | Preload API定義                |
| agentSlice.ts      | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                      | Renderer側Store                |
| SkillService.ts    | `apps/desktop/src/main/services/skill/SkillService.ts`                                      | getSkillByName()実装済み       |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                        | P23/P32/P44/P45                |

---

## 問題分析

### 現在のデータフロー（不整合状態）

```
skillHandlers.ts:136
  return skillService.importSkills(args.skillIds)
    → ImportResult { success: boolean, importedCount: number, errors: string[] }

skill-api.ts:261-262
  import: (skillName: string): Promise<ImportedSkill> => safeInvoke(...)
    → 型宣言は ImportedSkill だが実際は ImportResult が返る

agentSlice.ts:606-608
  const imported = await window.electronAPI.skill.import(skillName);
  set((state) => ({ importedSkills: [...state.importedSkills, imported] }))
    → ImportResult が ImportedSkill として配列に混入
```

### 期待されるデータフロー（修正後）

```
skillHandlers.ts（修正後）
  1. skillService.importSkills([skillName]) → ImportResult（インポート実行）
  2. importResult.success === false → エラーthrow
  3. skillService.getSkillByName(skillName) → ImportedSkill | null
  4. null → エラーthrow
  5. return importedSkill → ImportedSkill

skill-api.ts:261-262（変更不要）
  import: (skillName: string): Promise<ImportedSkill> → 型宣言と実態が一致

agentSlice.ts:606-608（変更不要）
  const imported = await window.electronAPI.skill.import(skillName);
    → 正しい ImportedSkill が格納される
```

---

## 機能要件（FR）

### FR-1: ハンドラ戻り値型の修正

| ID     | 要件                                                                         | 優先度 |
| ------ | ---------------------------------------------------------------------------- | ------ |
| FR-1.1 | skill:importハンドラが`ImportedSkill`型のオブジェクトを返す                  | 高     |
| FR-1.2 | ハンドラ内で`importSkills()`実行後に`getSkillByName()`を呼び出してデータ取得 | 高     |
| FR-1.3 | 戻り値に`importedAt`（Date型）、`status`（"active"）プロパティが含まれる     | 高     |
| FR-1.4 | 戻り値に`name`、`description`、`path`、`allowedTools`プロパティが含まれる    | 高     |

### FR-2: インポート実行とデータ取得の2ステップ処理

| ID     | 要件                                                                               | 優先度 |
| ------ | ---------------------------------------------------------------------------------- | ------ |
| FR-2.1 | `skillService.importSkills([skillName])`でインポートを実行する                     | 高     |
| FR-2.2 | インポート成功後に`skillService.getSkillByName(skillName)`でスキルデータを取得する | 高     |
| FR-2.3 | 取得した`ImportedSkill`をそのまま返却する                                          | 高     |

### FR-3: エラーハンドリング

| ID     | 要件                                                                                     | 優先度 |
| ------ | ---------------------------------------------------------------------------------------- | ------ |
| FR-3.1 | `importSkills()`の結果で`success === false`の場合、`errors`配列のメッセージでエラーthrow | 高     |
| FR-3.2 | `getSkillByName()`が`null`を返した場合、適切なエラーメッセージでthrow                    | 高     |
| FR-3.3 | エラーは`{ code: string, message: string }`形式でサニタイズして返す                      | 中     |

---

## 非機能要件（NFR）

### NFR-1: 型安全性

| ID      | 要件                                                                      | 優先度 |
| ------- | ------------------------------------------------------------------------- | ------ |
| NFR-1.1 | ハンドラの戻り値型が`ImportedSkill`であることをTypeScriptで型チェック可能 | 高     |
| NFR-1.2 | `as`型アサーションを使用せず、安全な型変換を行う                          | 高     |
| NFR-1.3 | Preload（skill-api.ts）の型宣言と実際の戻り値が一致する                   | 高     |

### NFR-2: IPCセキュリティ

| ID      | 要件                                                      | 優先度 |
| ------- | --------------------------------------------------------- | ------ |
| NFR-2.1 | P42準拠の3段バリデーションが引数に適用されている          | 高     |
| NFR-2.2 | エラーレスポンスに内部情報が漏洩しない                    | 高     |
| NFR-2.3 | 送信元ウィンドウ検証（validateIpcSender）が維持されている | 高     |

### NFR-3: 既存テスト互換性

| ID      | 要件                                                          | 優先度 |
| ------- | ------------------------------------------------------------- | ------ |
| NFR-3.1 | 既存テスト（SH-IMP-01〜06）の修正が必要な箇所を明確に特定する | 高     |
| NFR-3.2 | agentSlice.skill-integration.test.tsのモック戻り値を修正する  | 高     |
| NFR-3.3 | 修正後のテストが全てPASSする                                  | 高     |

### NFR-4: Date型シリアライゼーション

| ID      | 要件                                                                 | 優先度 |
| ------- | -------------------------------------------------------------------- | ------ |
| NFR-4.1 | IPC通信でDate型がシリアライズ/デシリアライズされる際の動作を考慮する | 中     |
| NFR-4.2 | `importedAt`がRenderer側でDate型として使用可能であることを確認する   | 中     |

---

## 受け入れ基準

### AC-1: 戻り値型の正確性

- [ ] skill:importハンドラが返すオブジェクトに`name`（string）プロパティが存在する
- [ ] 同オブジェクトに`description`（string）プロパティが存在する
- [ ] 同オブジェクトに`path`（string）プロパティが存在する
- [ ] 同オブジェクトに`importedAt`（Date）プロパティが存在する
- [ ] 同オブジェクトに`status`（"active"）プロパティが存在する
- [ ] 同オブジェクトに`agents`（配列）プロパティが存在する
- [ ] `ImportResult`型のプロパティ（`importedCount`、`errors`）が戻り値に含まれない

### AC-2: エラーハンドリング

- [ ] インポート失敗時にエラーが throw される
- [ ] getSkillByNameがnullの場合にエラーが throw される
- [ ] エラーメッセージが具体的で内部情報を漏洩しない

### AC-3: テスト

- [ ] skillHandlers.test.tsのSH-IMP-01テストが`ImportedSkill`型プロパティを検証するように修正される
- [ ] agentSlice.skill-integration.test.tsのモック戻り値が`ImportedSkill`型に修正される
- [ ] 全テストがPASSする

### AC-4: 統合動作

- [ ] Renderer側の`importedSkills`配列に正しい`ImportedSkill`オブジェクトが格納される
- [ ] UIのスキル一覧で、インポートしたスキルが正しく表示される

---

## アーキテクチャ層別要件

### Main Process（skillHandlers.ts）

- ハンドラ内で2ステップ呼び出しを実装
- `importSkills()` → `getSkillByName()` の順序で実行
- エラー発生時はIPCエラー形式でthrow

### Preload（skill-api.ts）

- 変更不要（型宣言`Promise<ImportedSkill>`は正しい）
- ただし、実態と型宣言の一致を検証

### Renderer（agentSlice.ts）

- 変更不要（`imported`を`importedSkills`に追加するロジックは正しい）
- ただし、正しい型のデータが受信されることを前提としている

---

## 修正対象ファイル

| ファイルパス                                                                            | 修正内容                            |
| --------------------------------------------------------------------------------------- | ----------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                            | ハンドラロジック修正（2ステップ化） |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             | SH-IMP-01テスト修正                 |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | モック戻り値修正                    |

---

## 統合テスト連携

| 観点         | 確認内容                                                                         | 参照仕様                                                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPC契約      | `skill:import` の引数・戻り値・エラー形式の整合を確認                            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` / `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` / `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| セキュリティ | `validateIpcSender` と入力バリデーション（`skillName` / `skillIds`）の整合を確認 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` / `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                          |
| E2E整合      | Main → Preload → Renderer で `ImportedSkill` が破綻なく流れることを確認          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                                                                                 |

## 成果物

| 成果物             | パス                                                                            |
| ------------------ | ------------------------------------------------------------------------------- |
| Phase 1 要件定義書 | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-1-requirements.md` |

## 完了条件

- [x] 機能要件（FR-1〜FR-3）が定義されている
- [x] 非機能要件（NFR-1〜NFR-4）が定義されている
- [x] 受け入れ基準（AC-1〜AC-4）が検証可能な形式で定義されている
- [x] アーキテクチャ層別要件が明確化されている
- [x] 修正対象ファイルが特定されている
- [x] 参照資料テーブルが完備されている

## 次Phase

→ Phase 2: 設計（phase-2-design.md）
