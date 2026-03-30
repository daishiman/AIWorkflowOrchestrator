# Phase 5: 実装（契約統一 TDD Green）

## メタ情報

| 項目       | 値                                        |
| ---------- | ----------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 |
| Phase      | 5 / 13                                    |
| 前Phase    | Phase 4（テスト作成）                     |
| 次Phase    | Phase 6（テスト拡充）                     |
| 作成日     | 2026-02-27                                |
| ステータス | 未着手                                    |

## 目的

方針C に従って Main/Preload/Renderer/型を同期更新し、TDD Green 状態を達成する。

Phase 4 で作成したテストが全て通るように、契約統一の実装を行う。P23/P32 準拠で3箇所同時更新を行い、契約ドリフトを防止する。

## 依存関係

| 依存先                | パス                                                                                        | 用途           |
| --------------------- | ------------------------------------------------------------------------------------------- | -------------- |
| Phase 2 設計書        | `outputs/phase-2/design-document.md`                                                        | 実装の根拠     |
| Phase 4 テスト        | 各テストファイル                                                                            | Green確認      |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 契約変更手順   |
| 実装パターン集        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S2/S13パターン |

## 参照資料

| 参照資料               | パス                                                                                        | 内容                     |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 4 テスト成果物   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.contract.test.ts`                        | Green化対象の契約テスト  |
| Phase 4 テスト成果物   | `apps/desktop/src/preload/__tests__/skill-api.contract.test.ts`                             | Green化対象の契約テスト  |
| Phase 4 テスト仕様成果 | `outputs/phase-4/test-case-matrix.md`                                                       | テストケース根拠         |
| Phase 2 設計成果物     | `outputs/phase-2/design-document.md`                                                        | 契約統一の設計根拠       |
| IPC 契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 変更時の必須確認手順     |
| 実装パターン集         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S2/S13/P42 準拠パターン  |
| Skill IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | sender検証と入力検証要件 |

## 実行タスク

### タスク1: Main ハンドラ契約明示化

**目的**: 各ハンドラの戻り値を契約プロファイルに従って固定する。

**手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts` を編集する
2. 各チャネルの return 文を契約プロファイル表に従って統一する
3. P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）を全ハンドラで確認・修正する
4. 変更ごとに部分テスト実行で Green 確認する

**P42準拠バリデーションパターン**:

```typescript
// 3段バリデーション標準パターン
if (typeof skillName !== "string" || skillName.trim() === "") {
  throw {
    code: "VALIDATION_ERROR",
    message: "skillName must be a non-empty string",
  };
}
```

**注意点**:

- 各ハンドラの戻り値形状を契約プロファイルに厳密に合わせる
- エラー形式も統一する（`{ code, message }` パターン）
- 変更は1ハンドラずつ行い、各変更後にテストを実行する

### タスク2: Preload API 単一化

**目的**: Renderer に対して統一された戻り値解釈を提供する。

**手順**:

1. `apps/desktop/src/preload/skill-api.ts` を編集する
2. 契約プロファイルに基づき `safeInvoke` / `safeInvokeUnwrap` を正確に選択する
3. Renderer 向け API シグネチャを統一する

**safeInvoke / safeInvokeUnwrap 選択基準**:

- `safeInvoke`: IPC応答をそのまま返す（`{ success, data, error }` ラッパー付き）
- `safeInvokeUnwrap`: IPC応答をアンラップして直接値を返す

契約プロファイルに基づき、各メソッドで適切な関数を選択する。

### タスク3: 型定義同期

**目的**: shared/preload の型定義を実装と完全一致させる。

**手順**:

1. `apps/desktop/src/preload/types.ts` を編集する（P32準拠）
2. shared 側の型変更がある場合のみ `packages/shared/src/types/skill.ts` を編集する
3. `pnpm typecheck` で型整合性を検証する

**P32準拠**: 型定義は以下の2ファイルを同時に更新する:

- `packages/shared/src/types/skill.ts`（共有型定義）
- `apps/desktop/src/preload/types.ts`（Preload層型定義）

### タスク4: Renderer 利用側統一

**目的**: Renderer の全利用箇所で統一された契約に基づくコードに更新する。

**手順**:

1. agentSlice / useSkillExecution 等の利用箇所を統一パターンに修正する
2. 型アサーション（`as unknown as`）がないことを確認する

**確認コマンド**:

```bash
grep -rn "as unknown as" apps/desktop/src/renderer/ --include="*.ts" --include="*.tsx"
```

型アサーションが残存している場合は、正しい型定義に基づいて解消する。

### タスク5: IPC契約チェックリスト実行

**目的**: `ipc-contract-checklist.md` の Phase 4/5/6 を完了する。

**手順**:

1. Phase 4（型定義同期）: shared/preload 型の同時確認
2. Phase 5（仕様書同期）: 関連仕様書の参照パスを確認
3. Phase 6（テスト検証）: 全テスト実行

**チェック項目**:

- [ ] ハンドラ引数形式と Preload 側の呼び出し形式が一致（P44対策）
- [ ] 引数名のセマンティクスが実際の値と一致（P45対策）
- [ ] P42準拠3段バリデーションが全ハンドラに適用されている

### タスク6: TDD Green 状態確認

**手順**:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers*.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api*.test.ts
```

- 全テストが Green であることを確認する
- テスト実行結果を記録する

## TDD検証（Phase 5）

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers*.test.ts
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-api*.test.ts
pnpm typecheck
```

- [ ] テストが成功することを確認する（Green状態）
- [ ] `pnpm typecheck` が成功することを確認する
- [ ] 型アサーション（`as unknown as`）が残存していないことを確認する

## SubAgent 分担

| SubAgent   | 担当                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| SubAgent-A | タスク1（Main ハンドラ契約明示化）                                      |
| SubAgent-B | タスク2（Preload API 単一化）+ タスク3（型定義同期）                    |
| SubAgent-C | タスク4（Renderer 利用側統一）+ タスク5/6（IPC契約検証・TDD Green確認） |

## 成果物

| 成果物                  | パス                                         | 内容             |
| ----------------------- | -------------------------------------------- | ---------------- |
| 契約統一済みハンドラ    | `apps/desktop/src/main/ipc/skillHandlers.ts` | 統一後のハンドラ |
| 契約統一済みPreload API | `apps/desktop/src/preload/skill-api.ts`      | 統一後のPreload  |
| 同期済み型定義          | `apps/desktop/src/preload/types.ts`          | 統一後の型定義   |

## 統合テスト連携

フロント/バック接続の実装とテスト支援コード整備。Main → Preload → Renderer の各レイヤーを横断するテストが Green であることを確認する。

## 完了条件

- [ ] 全 skill: チャネルが契約プロファイルに従った戻り値を返す
- [ ] Preload API が Renderer に統一された戻り値を返す
- [ ] 型定義が実装と完全一致する（`pnpm typecheck` 成功）
- [ ] Renderer 利用側が統一パターンに更新されている
- [ ] IPC契約チェックリスト Phase 4/5/6 が完了している
- [ ] TDD Green 状態が確認されている
- [ ] 型アサーション（`as unknown as`）が残存していない

---

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成すること:

- [ ] タスク1: Main ハンドラ契約明示化
- [ ] タスク2: Preload API 単一化
- [ ] タスク3: 型定義同期
- [ ] タスク4: Renderer 利用側統一
- [ ] タスク5: IPC契約チェックリスト実行
- [ ] タスク6: TDD Green 状態確認

## タスク100%実行確認【必須】チェックリスト

Phase 完了前に以下を全て確認すること:

- [ ] 全タスク（タスク1〜6）が完了している
- [ ] 成果物が全て所定のパスに出力されている
- [ ] TDD Green 状態が確認されている
- [ ] `pnpm typecheck` が成功している
- [ ] IPC契約チェックリストが完了している
- [ ] 完了条件が全て満たされている

## Phase実行記録

| 項目           | 記録 |
| -------------- | ---- |
| 実行開始日時   |      |
| 実行完了日時   |      |
| 実行者         |      |
| Green テスト数 |      |
| typecheck結果  |      |
| 備考           |      |

## Phase末端アクション【必須】

1. `artifacts.json` の Phase 5 ステータスを更新する
2. 本仕様書の完了条件チェックリストを全て埋める
3. Phase実行記録を記入する
4. 次 Phase（Phase 6: テスト拡充）に進む

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)
