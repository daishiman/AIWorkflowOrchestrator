# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| タスクID   | UT-RUNTIME-BUILDER-MIGRATION-001                         |
| Phase      | 7                                                        |
| 担当       | Claude Code                                              |
| 前提成果物 | phase-6-test-expansion.md（全追加テスト Green 確認済み） |
| 作成日     | 2026-03-23                                               |

## 目的

Phase 4〜6 で作成したテストが、カバレッジ基準（Line 90%、Branch 70%、Function 90%）を満たしているかを確認する。基準未達の場合は Phase 6 に戻り、不足箇所のテストを追加する。

## 実行タスク

カバレッジを計測し、基準との乖離がある場合は Phase 6 へフィードバックする。

## 参照資料

| 参照資料           | パス                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| Phase 6 テスト拡充 | `docs/30-workflows/runtime-builder-migration/phase-6-test-expansion.md` |
| カバレッジ基準     | `.claude/rules/02-code-quality.md#カバレッジ基準`                       |

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 | 未達時の対応   |
| ----------------- | -------- | -------- | -------------- |
| Line Coverage     | 90%      | 95%      | Phase 6 に戻る |
| Branch Coverage   | 70%      | 80%      | Phase 6 に戻る |
| Function Coverage | 90%      | 95%      | Phase 6 に戻る |

## カバレッジ計測コマンド

### TerminalHandoffBuilder のカバレッジ計測（主計測対象）

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts
```

### 全関連ファイルのカバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/services/runtime/__tests__/TerminalHandoffBuilder.test.ts \
  src/main/ipc/__tests__/chatEditHandlers.test.ts \
  src/main/ipc/__tests__/agentHandlers.test.ts \
  src/main/ipc/__tests__/skillHandlers.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

## 確認対象ファイル

以下のファイルのカバレッジを確認する。主要確認対象は `runtime/TerminalHandoffBuilder.ts`。

| ファイルパス                                                          | 確認優先度   | 理由                                                             |
| --------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`    | 最高（必須） | Phase 5 で実装した主要ファイル                                   |
| `apps/desktop/src/main/ipc/chatEditHandlers.ts`                       | 高           | `buildForSurface()` 呼び出しに移行した箇所                       |
| `apps/desktop/src/main/ipc/agentHandlers.ts`                          | 高           | `buildForSurface()` 呼び出しに移行した箇所                       |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                          | 高           | `buildForSurface()` 呼び出しに移行した箇所                       |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 中           | 戻り値型変更の影響範囲                                           |
| `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`  | 低           | `@deprecated` 付与のみ（既存テストが存在する場合はそちらで確認） |

## 重点チェック: buildForSurface() の全分岐網羅

以下の全分岐がカバレッジレポートで緑（covered）になっていることを確認する。

| 分岐                                       | 担当テストケース                        | カバレッジ確認ポイント           |
| ------------------------------------------ | --------------------------------------- | -------------------------------- |
| `surfaceType === "chat-edit"` の処理パス   | Phase 4: ケース 1〜4、Phase 6: A-1、A-4 | 全ステートメントが緑             |
| `surfaceType === "runtime"` の処理パス     | Phase 4: ケース 5〜8、Phase 6: A-2      | 全ステートメントが緑             |
| `surfaceType === "skill-docs"` の処理パス  | Phase 4: ケース 9〜12、Phase 6: A-3     | 全ステートメントが緑             |
| `default`（未知 surfaceType）の throw パス | Phase 4: ケース 13                      | `throw` 文が緑                   |
| `sanitizePrompt()` 内の各 replace 分岐     | Phase 4: ケース 14、Phase 6: A-3        | 各 replace が緑                  |
| `prompt` が `undefined` → デフォルト値適用 | Phase 4: ケース 15                      | 三項演算子または `??` の両辺が緑 |
| `prompt` が指定済み → そのまま使用         | Phase 4: ケース 1〜12                   | 反対側の分岐が緑                 |

## 未達時のフィードバックフロー

```
カバレッジ計測
  ↓
基準を全て満たす？
  ├── YES → Phase 8（リファクタリング）へ
  └── NO  → 未達指標と未カバー行を特定
              ↓
             Phase 6 に戻り、以下を実施:
             1. カバレッジレポートで赤（uncovered）の行を確認
             2. 対応するテストケースを追加
             3. 再度 Phase 7 でカバレッジ計測
```

## カバレッジレポートの読み方

Vitest の `--coverage` オプションを使用すると、以下の形式でレポートが出力される。

```
 % Stmts   % Branch   % Funcs   % Lines   Uncovered Line #s
---------+-----------+---------+---------+------------------
   XX.XX |     XX.XX |   XX.XX |   XX.XX |   12, 34-38
```

- **Stmts（ステートメント）**: Line Coverage に相当
- **Branch**: 分岐カバレッジ
- **Funcs（関数）**: Function Coverage に相当
- **Uncovered Line #s**: カバーされていない行番号

未達の場合は `Uncovered Line #s` の行番号を確認し、Phase 6 に追加するテストの設計に活用する。

## 合否判定チェックリスト

以下の全項目を確認してから合否を判定する。

### runtime/TerminalHandoffBuilder.ts（必須）

- [ ] Line Coverage が 90% 以上であること
- [ ] Branch Coverage が 70% 以上であること
- [ ] Function Coverage が 90% 以上であること
- [ ] `buildForSurface()` の `surface === "chat-edit"` パスが covered であること
- [ ] `buildForSurface()` の `surface === "runtime"` パスが covered であること
- [ ] `buildForSurface()` の `surface === "skill-docs"` パスが covered であること
- [ ] `buildForSurface()` の `default`（throw）パスが covered であること
- [ ] `sanitizePrompt()` の全 replace が covered であること
- [ ] `prompt` が `undefined` のパスが covered であること

### 呼び出し元ハンドラー（高優先度）

- [ ] `ipc/chatEditHandlers.ts` の移行箇所（`buildForSurface` 呼び出し）が covered であること
- [ ] `ipc/agentHandlers.ts` の移行箇所が covered であること
- [ ] `ipc/skillHandlers.ts` の移行箇所が covered であること

## 成果物

| 項目               | 内容                                                       |
| ------------------ | ---------------------------------------------------------- |
| カバレッジレポート | `cd apps/desktop && pnpm vitest run --coverage` の実行結果 |
| 合否判定           | 全指標が基準を満たしているかの確認結果                     |
| 未達の場合         | 未カバー行番号と Phase 6 へのフィードバック内容            |

## 完了条件

- [ ] カバレッジ計測コマンドが正常に実行できること
- [ ] `runtime/TerminalHandoffBuilder.ts` の Line Coverage が 90% 以上であること
- [ ] `runtime/TerminalHandoffBuilder.ts` の Branch Coverage が 70% 以上であること
- [ ] `runtime/TerminalHandoffBuilder.ts` の Function Coverage が 90% 以上であること
- [ ] 合否判定チェックリストの全項目が確認されていること
- [ ] 未達の場合は Phase 6 へのフィードバック内容が明確になっていること

---

## 統合テスト連携

Phase 6 で追加した統合テスト（C-1〜C-3, D-1）のカバレッジも計測対象に含める。

---

## 多角的チェック観点

| 観点           | 確認内容                             | 対応                         |
| -------------- | ------------------------------------ | ---------------------------- |
| パフォーマンス | カバレッジ計測がタイムアウトしないか | 必要に応じてファイル分割実行 |

---

## サブタスク管理

- [ ] カバレッジ計測コマンドを実行する
- [ ] Line/Branch/Function Coverage を確認する
- [ ] 未カバー行を特定する
- [ ] 基準未達の場合 Phase 6 へフィードバックする

## 次 Phase

- 基準達成の場合: Phase 8（リファクタリング）
- 基準未達の場合: Phase 6（テスト拡充）に戻る
