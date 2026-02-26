# Phase 1 要件定義

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 1
- 作成日: 2026-02-25
- ステータス: 完了（implementation_and_spec_sync）

## 背景

`skill:execute` IPCハンドラは、Preload層から `SkillExecutionRequest`（`skillName` ベース）の形式で呼び出されることを前提とするが、Main Handlerは `SkillExecutionRequest | { skillId: string; params?: Record<string, unknown> }` のユニオン型を受け入れる設計になっている。

### 現状の実装構造（実コード確認済み）

- **Shared型定義** (`packages/shared/src/types/skill.ts:306-315`):
  - `SkillExecutionRequest` = `{ skillName: string; prompt: string; workingDirectory?: string }`
- **Preload** (`apps/desktop/src/preload/skill-api.ts:224-225`):
  - `execute(request: SkillExecutionRequest)` で `safeInvokeUnwrap(IPC_CHANNELS.SKILL_EXECUTE, request)` を呼び出す
  - Preload層はSkillExecutionRequest型のオブジェクトをそのままIPCに送信する
- **Main Handler** (`apps/desktop/src/main/ipc/skillHandlers.ts:217-283`):
  - 引数型: `SkillExecutionRequest | { skillId: string; params?: Record<string, unknown> }`
  - `isSkillNameRequest` 型ガード（L231-236）で分岐:
    - 判定条件: `typeof payload === "object" && payload !== null && "skillName" in payload`
    - skillNameパス（L257-268）: `scanAvailableSkills()` → `skills.find(item => item.name === args.skillName)` → `executeSkill(skill.id, { prompt: args.prompt })`
    - skillIdパス（L270-275）: `executeSkill(args.skillId, args.params)`
  - P42準拠3段バリデーション（L239-254）: skillName/skillId 両パスに適用済み

### 不整合の具体的ポイント

1. **契約の二重性**: ユニオン型による2つの入力パスが存在し、どちらが正規契約か不明確
2. **名前解決の非効率**: skillNameパスで毎回 `scanAvailableSkills()` を呼び出し全スキルスキャン後に `find()` で検索（`SkillService.getSkillByName()` が存在するのに未使用）
3. **引数命名の残存ドリフト**: skillIdパスの `{ skillId: string }` がP45観点で内部利用意図であることが文書化されていない
4. **prompt バリデーションの非対称性**: skillNameパスでpromptの型/空文字列チェックが未実施

## 機能要件

| ID    | 要件                                                                                       | 根拠                                 |
| ----- | ------------------------------------------------------------------------------------------ | ------------------------------------ |
| FR-01 | `skill:execute` の正規入力契約を明確に定義し、Preload/Main/Shared間で統一する              | P44対策: 契約正本の単一化            |
| FR-02 | `skillName` → `skillId` 変換の責務を単一箇所に限定し、変換ロジックを明文化する             | P45対策: 変換境界の明確化            |
| FR-03 | 全文字列引数に対してP42準拠3段バリデーション（typeof → 空文字列 → trim空文字列）を維持する | P42対策: バリデーション規約          |
| FR-04 | `isSkillNameRequest` 型ガードの判定ロジックの妥当性を検証し、文書化する                    | ユニオン型分岐の正確性保証           |
| FR-05 | 仕様書成果物はPhase 1-12で `outputs/` 配下へ出力する                                       | implementation_and_spec_sync運用規約 |

## 非機能要件

| ID     | 要件                                                                 | 根拠                       |
| ------ | -------------------------------------------------------------------- | -------------------------- |
| NFR-01 | `validateIpcSender` によるsender検証を維持する                       | セキュリティ: 完全仲介原則 |
| NFR-02 | 要件→設計→テストIDの追跡可能性を維持する                             | トレーサビリティ           |
| NFR-03 | `skillName`（外部契約）/ `skillId`（内部契約）の命名規約を文書化する | P45対策: 命名一貫性        |
| NFR-04 | Phase 9/10でGo/No-Go判定が可能な記録を残す                           | 品質ゲート                 |
| NFR-05 | 名前解決時の性能特性（全スキャン vs 直接検索）を記録する             | 変更容易性                 |

## P44/P45/P42 再発条件と対策要件

| 観点 | 再発条件                                   | 現状の対策状況                         | 追加対策要件                                    |
| ---- | ------------------------------------------ | -------------------------------------- | ----------------------------------------------- |
| P44  | Main/Preloadで引数構造が不一致             | ユニオン型 + 型ガードで両方受け入れ    | 正規契約の明確化と非正規パスの位置付け文書化    |
| P45  | `skillName`/`skillId` の意味が層ごとに逆転 | skillNameパスでは name→id 変換実装済み | 変換境界の明文化、内部メソッド命名の整合確認    |
| P42  | `trim()` 未適用で空白入力を許容            | 両パスで3段バリデーション適用済み      | prompt引数の空文字列/空白のみ入力時の挙動規約化 |

## テスト現状（実測値）

| テストファイル                     | テスト数 | 主要観点                            |
| ---------------------------------- | -------- | ----------------------------------- |
| `skillHandlers.execute.test.ts`    | 23       | skillName/skillId 分岐、エラー処理  |
| `skillHandlers.validation.test.ts` | 55       | P42準拠3段バリデーション、境界値    |
| `skillHandlers.delegate.test.ts`   | 12       | SkillExecutor注入、委譲、エラー伝播 |
| **合計**                           | **90**   | **全PASS**                          |

## スコープ明確化（implementation_and_spec_sync）

- **実施対象**: 要件定義、設計、テスト計画、品質計画、文書更新計画の作成
- **非対象**: 実装コード修正、テスト実行、コミット、PR作成
- **前提**: 既存実装は動作しており（3ファイル90テスト全PASS）、本タスクは契約の明文化と品質保証計画の策定が主目的

## SubAgent分担

| SubAgent   | 担当                          | 成果                                                |
| ---------- | ----------------------------- | --------------------------------------------------- |
| SubAgent-A | 契約監査                      | ユニオン型構造の解析、GAP-01/03/05 抽出             |
| SubAgent-B | サービス/セキュリティ観点監査 | validateIpcSender整合確認、名前解決非効率（GAP-02） |
| SubAgent-C | テスト観点監査                | 3ファイル90テストの観点網羅確認、不足観点抽出       |
| SubAgent-D | 統合判定・品質監査            | 機能/非機能要件分類、完了判定                       |

## フェーズ完了判定

- [x] 要件が機能/非機能で分類されている
- [x] P44/P45/P42再発条件が現状の対策状況を含めて明記されている
- [x] implementation_and_spec_sync運用前提が明記されている
- [x] 実コードの構造（ユニオン型・型ガード・scanAvailableSkills）が正確に反映されている
- [x] テスト現状（3ファイル90テスト）が実測値で記録されている
- [x] SubAgent分担が確定している
- [x] 本Phase内の全タスク（Task 1-1〜1-4）を100%実行完了
