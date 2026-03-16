# Phase 1: 受入基準マップ

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 1                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 受入基準一覧

### AC-1: SafetyGatePort 契約準拠

| 項目      | 値                                                                                                                                            |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 基準      | DefaultSafetyGate が SafetyGatePort インターフェースを implements し、`evaluate(skillName: string): Promise<SafetyGateResult>` を実装している |
| 検証方法  | TypeScript コンパイル（`pnpm typecheck`）                                                                                                     |
| 検証Phase | Phase 9                                                                                                                                       |

### AC-2: 5種チェック実装

| 項目      | 値                                                                                                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 基準      | CRITICAL_TOOL_REQUIRED, HIGH_TOOL_REQUIRED, NO_PERMANENT_APPROVAL, ALL_LOW_TOOLS, PROTECTED_PATH_ACCESS の5種全てが実装されている |
| 検証方法  | テストケース C-1〜C-3, H-1〜H-2, N-1〜N-3, L-1〜L-2, P-1〜P-5 が全 PASS                                                           |
| 検証Phase | Phase 4-5                                                                                                                         |

### AC-3: グレード集約ロジック

| 項目      | 値                                                                              |
| --------- | ------------------------------------------------------------------------------- |
| 基準      | blocked が1件以上で UNSAFE、warned のみで SAFE_WITH_WARNINGS、全 passed で SAFE |
| 検証方法  | テストケース G-1〜G-4 が全 PASS                                                 |
| 検証Phase | Phase 4-5                                                                       |

### AC-4: IPC チャンネル登録

| 項目      | 値                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| 基準      | `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` が `channels.ts` に定義され、`ALLOWED_INVOKE_CHANNELS` に登録されている |
| 検証方法  | `grep -n "SKILL_EVALUATE_SAFETY" apps/desktop/src/preload/channels.ts` で2件以上ヒット                       |
| 検証Phase | Phase 5, Phase 9                                                                                             |

### AC-5: P42 準拠3段バリデーション

| 項目      | 値                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------ |
| 基準      | IPC ハンドラで `typeof !== "string"` → `=== ""` → `.trim() === ""` の3段バリデーションが実装されている |
| 検証方法  | テストケース I-3〜I-5 が PASS + コード目視確認                                                         |
| 検証Phase | Phase 4-5, Phase 9                                                                                     |

### AC-6: 送信元ウィンドウ検証

| 項目      | 値                                                                                        |
| --------- | ----------------------------------------------------------------------------------------- |
| 基準      | IPC ハンドラ内で `event.sender !== mainWindow.webContents` チェックが実装されている       |
| 検証方法  | テストケース I-6 が PASS + `grep -n "event.sender" safetyGateHandlers.ts` で1件以上ヒット |
| 検証Phase | Phase 4-5, Phase 9                                                                        |

### AC-7: チャンネル名定数管理

| 項目      | 値                                                                                          |
| --------- | ------------------------------------------------------------------------------------------- |
| 基準      | ハンドラ・テストで `"skill:evaluate-safety"` 文字列リテラルが0件                            |
| 検証方法  | `grep -rn '"skill:evaluate-safety"' apps/desktop/src/main/ apps/desktop/src/preload/` で0件 |
| 検証Phase | Phase 9                                                                                     |

### AC-8: DI 設計

| 項目      | 値                                                                                      |
| --------- | --------------------------------------------------------------------------------------- |
| 基準      | DefaultSafetyGate が Constructor Injection で依存を受け取り、テストでモック差し替え可能 |
| 検証方法  | テストで mockPermissionStore, mockSkillMetadataProvider を注入して全テスト PASS         |
| 検証Phase | Phase 4-5                                                                               |

### AC-9: 保護パスマッチング

| 項目      | 値                                                                            |
| --------- | ----------------------------------------------------------------------------- |
| 基準      | 末尾スラッシュ正規化 + `startsWith` による前方一致（正規表現不使用、P55準拠） |
| 検証方法  | テストケース P-1〜P-5, B-1〜B-6 が全 PASS                                     |
| 検証Phase | Phase 4-6                                                                     |

### AC-10: カバレッジ基準

| 項目      | 値                                                    |
| --------- | ----------------------------------------------------- |
| 基準      | Line 80%+, Branch 60%+, Function 80%+                 |
| 検証方法  | `pnpm vitest run --coverage` でカバレッジレポート確認 |
| 検証Phase | Phase 7, Phase 9                                      |

### AC-11: 品質基準

| 項目      | 値                                                              |
| --------- | --------------------------------------------------------------- |
| 基準      | ESLint エラー0件、TypeScript 型エラー0件、`any` 型不適切使用0件 |
| 検証方法  | `pnpm lint` + `pnpm typecheck` + `grep -n "any"`                |
| 検証Phase | Phase 9                                                         |

## 受入基準 × Phase マトリクス

| 受入基準 | P4  | P5  | P6  | P7  | P9  | P10 |
| -------- | --- | --- | --- | --- | --- | --- |
| AC-1     |     | x   |     |     | x   | x   |
| AC-2     | x   | x   |     |     |     | x   |
| AC-3     | x   | x   |     |     |     | x   |
| AC-4     |     | x   |     |     | x   | x   |
| AC-5     | x   | x   |     |     | x   | x   |
| AC-6     | x   | x   |     |     | x   | x   |
| AC-7     |     |     |     |     | x   | x   |
| AC-8     | x   | x   |     |     |     | x   |
| AC-9     | x   | x   | x   |     |     | x   |
| AC-10    |     |     |     | x   | x   | x   |
| AC-11    |     |     |     |     | x   | x   |
