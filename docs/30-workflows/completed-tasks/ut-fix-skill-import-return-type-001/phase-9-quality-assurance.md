# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 9                                          |
| Phase名    | 品質検証                                   |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001        |
| 前提Phase  | Phase 8（リファクタリング）                |
| 後続Phase  | Phase 10（最終レビューゲート）             |
| ステータス | 完了                                       |
| 作成日     | 2026-02-21                                 |
| 機能名     | skill:import IPCハンドラ戻り値型不整合修正 |

---

## 目的

静的解析（Lint）、型チェック、セキュリティ検証、テスト実行の4観点から skill:import ハンドラ戻り値型修正のコード品質を検証する。
プロジェクト品質基準（Line Coverage 80%+、Branch Coverage 60%+）を満たしていることを確認する。

## 背景

skill:import ハンドラはセキュリティ境界（IPC）に位置するため、通常の品質検証に加えてセキュリティ固有の検証が必須である。
P42準拠の3段バリデーション、validateIpcSender、エラーサニタイズの3点を重点的に検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Lint 検証

**目的**: ESLint ルールへの準拠を確認する

**実行手順**:

1. ESLint を実行する
2. エラー・警告を確認する
3. 問題があれば修正する
4. 再度 Lint を実行して確認する

**コマンド**:

```bash
# Lint 実行（desktopパッケージ）
pnpm --filter @repo/desktop lint

# 自動修正
pnpm --filter @repo/desktop lint --fix
```

**検証対象ファイル**:

| ファイル                                                                                | 確認項目                          |
| --------------------------------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                                            | skill:import ハンドラのLintクリア |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             | テストファイルのLintクリア        |
| `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | 統合テストのLintクリア            |

**合格基準**: ESLint エラー 0件

**期待される成果物**:

- `outputs/phase-9/lint-report.md`

---

### タスク2: 型チェック検証

**目的**: TypeScript の型エラーがないことを確認する

**実行手順**:

1. TypeScript コンパイラを実行する
2. 型エラーを確認する
3. ハンドラ戻り値型と Preload/Renderer の型期待が一致していることを確認する

**コマンド**:

```bash
# 型チェック実行
pnpm --filter @repo/desktop typecheck

# shared パッケージも確認
pnpm --filter @repo/shared typecheck
```

**型整合性チェックポイント**:

| チェック項目                           | 確認内容                                                         |
| -------------------------------------- | ---------------------------------------------------------------- |
| ハンドラ戻り値型                       | skill:import ハンドラが ImportedSkill 型を返すこと               |
| safeInvoke の型宣言                    | `preload/types.ts` の importSkill メソッド戻り値が ImportedSkill |
| ImportedSkill 型の定義一致             | `preload/types.ts` の定義がインターフェース仕様と一致            |
| interfaces-agent-sdk-skill.md との整合 | 仕様書上の型定義と実装が一致                                     |

**合格基準**: TypeScript エラー 0件

**期待される成果物**:

- `outputs/phase-9/typecheck-report.md`

---

### タスク3: セキュリティ検証

**目的**: skill:import ハンドラがプロジェクトのセキュリティ要件を全て満たしていることを確認する

**実行手順**:

1. skill:import ハンドラで `validateIpcSender()` が正しく適用されていることを確認する
2. P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）が実装されていることを確認する
3. catch ブロックでエラーメッセージに内部情報が漏洩していないことを確認する
4. チャンネル名が `IPC_CHANNELS` 定数で参照されていることを確認する

**セキュリティチェックリスト**:

| チェック項目                 | 確認内容                                       | 結果 |
| ---------------------------- | ---------------------------------------------- | ---- |
| validateIpcSender            | skill:import ハンドラで呼び出されている        | -    |
| getAllowedWindows            | mainWindow のみ許可されている                  | -    |
| 3段バリデーション（P42準拠） | typeof → === "" → .trim() === "" の3段チェック | -    |
| エラーサニタイズ             | catch 内でスタックトレースや内部パスを返さない | -    |
| IPC_CHANNELS 定数参照        | ハードコード文字列でないこと                   | -    |
| getSkillByName null チェック | null 時にセキュアなエラーを返す                | -    |

**ハードコード文字列検出コマンド**:

```bash
# safeInvokeでハードコード文字列が使われていないか確認
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep -v "IPC_CHANNELS"
```

**期待される成果物**:

- `outputs/phase-9/security-report.md`

---

### タスク4: テスト実行・カバレッジ確認

**目的**: 全テストが成功し、カバレッジ基準を満たしていることを確認する

**実行手順**:

1. skillHandlers のユニットテストを実行する
2. agentSlice の統合テストを実行する
3. カバレッジレポートを確認する
4. 基準未達の場合は Phase 6 に戻る

**コマンド**:

```bash
# skillHandlers テスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose

# agentSlice 統合テスト実行
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice.skill-integration --reporter=verbose

# カバレッジ付きテスト実行
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers --coverage --reporter=verbose
```

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**期待される成果物**:

- `outputs/phase-9/test-coverage-report.md`

---

### タスク5: 品質ゲート総合判定

**目的**: 全ての品質基準を満たしているか総合判定する

**実行手順**:

1. タスク1〜4の結果を統合する
2. 品質基準との照合を行う
3. 判定結果を記録する

**品質ゲートチェックリスト**:

#### 機能検証

- [ ] skillHandlers ユニットテスト全件PASS
- [ ] agentSlice 統合テスト全件PASS

#### コード品質

- [ ] Lint エラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

#### テスト網羅性

- [ ] Line Coverage 80%+ 達成
- [ ] Branch Coverage 60%+ 達成
- [ ] Function Coverage 80%+ 達成

#### セキュリティ

- [ ] validateIpcSender 実施確認済み
- [ ] P42準拠3段バリデーション確認済み
- [ ] エラーサニタイズ確認済み
- [ ] ハードコード文字列なし確認済み

#### 型安全

- [ ] ハンドラ戻り値型が ImportedSkill と一致
- [ ] safeInvoke の型宣言と実態が一致
- [ ] interfaces-agent-sdk-skill.md の仕様と実装が一致

#### 判定結果

| 品質項目      | 結果 |
| ------------- | ---- |
| Lint          | -    |
| TypeCheck     | -    |
| Security      | -    |
| Test/Coverage | -    |
| 型安全        | -    |
| **総合判定**  | -    |

**期待される成果物**:

- `outputs/phase-9/quality-gate-result.md`

---

## 参照資料

| 参照資料          | パス                                                                                    | 内容                   |
| ----------------- | --------------------------------------------------------------------------------------- | ---------------------- |
| IPCハンドラー実装 | `apps/desktop/src/main/ipc/skillHandlers.ts`                                            | Main Processハンドラー |
| ハンドラーテスト  | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                             | ユニットテスト         |
| 統合テスト        | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts` | Store統合テスト        |
| Phase 5実装仕様   | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-5-implementation.md`       | 実装内容確認           |
| ESLint設定        | `.eslintrc.*`                                                                           | Lintルール             |
| TypeScript設定    | `tsconfig.json`                                                                         | 型チェック設定         |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                              | 内容            |
| ---------------- | --------------------------------------------------------------------------------- | --------------- |
| セキュリティ原則 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPCセキュリティ |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質基準        |
| スキルIPC仕様    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキルIPC型定義 |
| 既知の落とし穴   | `.claude/rules/06-known-pitfalls.md`                                              | P42, P44参照    |

---

## 成果物

| 成果物               | パス                                      | 内容             |
| -------------------- | ----------------------------------------- | ---------------- |
| Lintレポート         | `outputs/phase-9/lint-report.md`          | Lint結果         |
| 型チェックレポート   | `outputs/phase-9/typecheck-report.md`     | 型チェック結果   |
| セキュリティレポート | `outputs/phase-9/security-report.md`      | セキュリティ確認 |
| テスト・カバレッジ   | `outputs/phase-9/test-coverage-report.md` | テスト結果       |
| 品質ゲート結果       | `outputs/phase-9/quality-gate-result.md`  | 総合判定         |

---

## 統合テスト連携

> 品質検証で統合テスト結果を確認する

| 確認項目                    | 基準                           |
| --------------------------- | ------------------------------ |
| skillHandlersユニットテスト | 全テストケースPASS             |
| agentSlice統合テスト        | 全テストケースPASS             |
| セキュリティテスト          | バリデーション・sender検証PASS |

---

## 完了条件

- [ ] Lint エラーがない
- [ ] 型エラーがない
- [ ] セキュリティレビューが完了している（6項目確認済み）
- [ ] 全テストが成功している
- [ ] カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] 品質ゲートの全項目をパスしている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（5タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（5ファイル）が全て生成されていることを確認
- [ ] 品質ゲート全項目PASSを確認

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-fix-skill-import-return-type-001/phase-10-final-review.md`
