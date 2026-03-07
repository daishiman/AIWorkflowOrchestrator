# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 6                                  |
| 機能名 | store-lifecycle-integration-design |
| 作成日 | 2026-03-06                         |

## 目的

Phase 5 で実装した selector/action に対し、境界値・異常系・組合せテストを追加し、状態遷移の正確性と P31 回帰防止を網羅的に検証する。

## 実行タスク

- 境界値テスト（空リスト、大量スキル、重複インポート）を追加する
- 異常系テスト（ネットワークエラー、タイムアウト、不正レスポンス）を追加する
- 組合せテスト（同時インポート、フィルタ中のインポート）を追加する
- P31 回帰テスト（無限ループ検出）を追加する

## 参照資料

| 参照資料       | パス                                                                         | 使用目的             |
| -------------- | ---------------------------------------------------------------------------- | -------------------- |
| Phase 4 成果物 | `phase-4-test-creation.md`                                                   | 基本テストケース設計 |
| Phase 5 成果物 | `phase-5-implementation.md`                                                  | 実装仕様の確認       |
| 状態管理仕様   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | 状態遷移の正本       |
| エラー仕様     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラーカテゴリの確認 |
| 品質要件       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | カバレッジ基準       |

## 実行手順

### Step 1: 境界値テスト

以下のテストケースを `agentSlice.edge-cases.test.ts` に追加する。

#### 1-1. 空リスト

| テストケース                                                 | 期待結果                         |
| ------------------------------------------------------------ | -------------------------------- |
| `availableSkills` が空の場合の `useAvailableSkillsForImport` | 空配列を返す                     |
| `importedSkills` が空の場合の `useAvailableSkillsForImport`  | `availableSkills` をそのまま返す |
| 両方空の場合の `useFilteredAvailableSkills`                  | 空配列を返す                     |
| `skillFilter` が空文字の場合                                 | フィルタなしとして全件返す       |

#### 1-2. 大量スキル

| テストケース                                           | 期待結果                        |
| ------------------------------------------------------ | ------------------------------- |
| `availableSkills` に 100 件のスキルがある場合          | selector の算出が正常に完了する |
| `importedSkills` に 50 件、available に 100 件ある場合 | フィルタ後に 50 件返す          |
| `skillFilter` で 100 件中 1 件だけマッチする場合       | 1 件のみ返す                    |

#### 1-3. 重複インポート

| テストケース                                        | 期待結果                       |
| --------------------------------------------------- | ------------------------------ |
| 既にインポート済みのスキル名で `importSkill` を呼ぶ | IPC を呼ばずに早期 return する |
| 冪等ガード後の `importedSkills` に変化がない        | 配列長が変わらないこと         |
| 同名スキルを連続で2回 `importSkill` する            | 1回目のみ IPC が呼ばれる       |

### Step 2: 異常系テスト

以下のテストケースを `agentSlice.error-cases.test.ts` に追加する。

#### 2-1. ネットワークエラー

| テストケース                                          | 期待結果                                                |
| ----------------------------------------------------- | ------------------------------------------------------- |
| IPC が `ERR_4004 NETWORK_ERROR` で失敗                | `isImporting` が `false`、`skillError` にメッセージ保持 |
| IPC が `ERR_3005 EXTERNAL_SERVICE_UNAVAILABLE` で失敗 | 同上                                                    |
| エラー後に `clearError` でリセット                    | `skillError` が `null` になる                           |

#### 2-2. タイムアウト

| テストケース                            | 期待結果                                                        |
| --------------------------------------- | --------------------------------------------------------------- |
| IPC が `ERR_3002 AI_API_TIMEOUT` で失敗 | `isImporting` が `false`、`skillError` にタイムアウトメッセージ |
| タイムアウト後の再試行が正常に動作する  | `isImporting` が `true` → `false` の遷移                        |

#### 2-3. 不正レスポンス

| テストケース                           | 期待結果                              |
| -------------------------------------- | ------------------------------------- |
| IPC が `undefined` を返す              | `skillError` に適切なエラーメッセージ |
| IPC が期待と異なる型のレスポンスを返す | 型ガードで拒否、エラー保持            |

### Step 3: 組合せテスト

以下のテストケースを `agentSlice.combination.test.ts` に追加する。

#### 3-1. 同時インポート防止

| テストケース                                                   | 期待結果                           |
| -------------------------------------------------------------- | ---------------------------------- |
| `isImporting === true` の状態で別のスキルを `importSkill` する | 2回目の呼び出しは待機または拒否    |
| 1回目のインポート完了後に2回目が実行される                     | 両方のスキルがインポート済みになる |

#### 3-2. フィルタ中のインポート

| テストケース                                                                      | 期待結果                                       |
| --------------------------------------------------------------------------------- | ---------------------------------------------- |
| フィルタ適用中にインポートを実行                                                  | インポート成功後、フィルタ結果が再計算される   |
| インポート成功後、インポートしたスキルが `useAvailableSkillsForImport` から消える | フィルタ結果にインポート済みスキルが含まれない |

#### 3-3. import と create/analyze の同時実行

| テストケース                                          | 期待結果                                    |
| ----------------------------------------------------- | ------------------------------------------- |
| `isImporting === true` の状態で `analyzeSkill` を呼ぶ | 両方が独立して状態遷移する                  |
| `isAnalyzing === true` の状態で `importSkill` を呼ぶ  | 両方が独立して状態遷移する                  |
| 両方が同時に `fetchSkills` を呼ぶ                     | 最後の結果が `availableSkills` に反映される |

### Step 4: P31 回帰テスト

以下のテストケースを `agentSlice.p31-regression.test.ts` に追加する。

| テストケース                                        | 検証方法                                 | 期待結果                            |
| --------------------------------------------------- | ---------------------------------------- | ----------------------------------- |
| `useImportSkill` の参照安定性                       | `renderHook` で2回取得し `===` 比較      | 同一参照                            |
| `useIsImportingSkill` の参照安定性                  | 値が変化しない限り再レンダリングなし     | `renderCount === 1`                 |
| `useAvailableSkillsForImport` の再計算タイミング    | `importedSkills` 変更時のみ再計算        | 無関係な状態変更では再計算されない  |
| `useFilteredAvailableSkills` がフィルタ変更で再計算 | `skillFilter` 変更で再計算される         | 正しくフィルタされた結果が返る      |
| 合成 Hook 不使用の確認                              | grep で `useSkillStore()` の使用箇所検出 | SkillManagementPanel に使用箇所なし |

## 統合テスト連携

- Phase 5 で追加した selector/action が全テストケースで正しく動作することを検証する
- P31 回帰テストは `renderHook` パターンを使用し、Zustand Store の参照安定性を検証する
- テスト環境: happy-dom（P39 準拠: `userEvent` 不使用、`fireEvent` + `act` を使用）

## 多角的チェック観点

| 観点         | チェック内容                                                                           |
| ------------ | -------------------------------------------------------------------------------------- |
| 境界値       | 空配列、大量データ、重複データでの動作                                                 |
| 異常系       | 全エラーカテゴリ（Validation/Business/External/Infrastructure/Internal）のハンドリング |
| 組合せ       | import + filter、import + create/analyze の同時実行                                    |
| P31          | 個別セレクタの参照安定性、無限ループ非発生                                             |
| テスト間独立 | `beforeEach` で状態リセット、テスト間で状態を共有しない（P9 対策）                     |

## 成果物

| 成果物         | パス                                                                                 | 説明                       |
| -------------- | ------------------------------------------------------------------------------------ | -------------------------- |
| 境界値テスト   | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.edge-cases.test.ts`     | 空リスト、大量スキル、重複 |
| 異常系テスト   | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.error-cases.test.ts`    | エラーハンドリング検証     |
| 組合せテスト   | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.combination.test.ts`    | 同時操作、フィルタ連携     |
| P31 回帰テスト | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.p31-regression.test.ts` | 無限ループ非発生検証       |

## 完了条件

- [ ] 境界値テスト（空リスト、大量スキル、重複インポート）が実装され PASS する
- [ ] 異常系テスト（ネットワークエラー、タイムアウト、不正レスポンス）が実装され PASS する
- [ ] 組合せテスト（同時インポート、フィルタ中のインポート、import+create/analyze 同時）が実装され PASS する
- [ ] P31 回帰テスト（参照安定性、無限ループ非発生）が実装され PASS する
- [ ] テスト間で状態を共有していない（`beforeEach` でリセット）
- [ ] happy-dom 環境で全テストが安定動作する

## 次のPhase

Phase 7: カバレッジ確認 (`phase-7-coverage-check.md`)
