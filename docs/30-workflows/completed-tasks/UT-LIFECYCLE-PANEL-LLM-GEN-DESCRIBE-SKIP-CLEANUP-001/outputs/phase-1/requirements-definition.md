# Phase 1 成果物: 要件定義書

## P50チェック結果

| 項目                                            | 結果                                     |
| ----------------------------------------------- | ---------------------------------------- |
| 対象ファイル存在確認                            | present                                  |
| describe.skip 件数                              | 12件                                     |
| planSkill / detectMode モック宣言               | 存在（削除対象）                         |
| SkillLifecyclePanel.tsx 内 planSkill/detectMode | 型定義のみ（optional）、実処理なし       |
| skill-lifecycle-prepare-button testid           | **存在しない**（これが全削除判断の根拠） |

## 12件の describe.skip 分類

| ID    | 行番号 | describe 名                                                  | 分類                        | 理由                                                            |
| ----- | ------ | ------------------------------------------------------------ | --------------------------- | --------------------------------------------------------------- |
| U-1   | 397    | detectMode → planSkill sequential call                       | **削除**                    | skill-lifecycle-prepare-button なし + planSkill/detectMode 廃止 |
| U-2   | 420    | backward compatibility - detectMode='create' skips planSkill | **削除**                    | skill-lifecycle-prepare-button なし + detectMode 廃止           |
| U-4   | 458    | isGenerating guard prevents double invocation (R-1)          | **削除**                    | skill-lifecycle-prepare-button が現行UIに存在しない             |
| U-6   | 497    | terminal_handoff triggers handoff guidance display           | **削除**                    | skill-lifecycle-prepare-button なし + planSkill 廃止            |
| U-8b  | 1428   | canonical binding drift prevention                           | **削除**                    | skill-lifecycle-prepare-button なし + planSkill 廃止            |
| U-10  | 921    | planSkill failure propagates error                           | **削除**                    | skill-lifecycle-prepare-button なし + planSkill 廃止            |
| U-11  | 968    | empty input validation                                       | **削除**                    | skill-lifecycle-prepare-button が現行UIに存在しない             |
| U-12  | 984    | planSkill API unavailable graceful degradation               | **削除**                    | skill-lifecycle-prepare-button なし + planSkill 廃止            |
| U-18b | 1756   | cancel then re-plan replaces approved snapshot               | **削除**                    | skill-lifecycle-prepare-button なし + planSkill 廃止            |
| U-19b | 1794   | multiple textarea edits do not affect approved snapshot      | **削除**                    | skill-lifecycle-prepare-button なし + planSkill 廃止            |
| U-20b | 1819   | cancel clears approved snapshot symmetrically                | **昇格（describe に変更）** | clearGenerationState + キャンセルボタンは現行UIで再現可能       |
| U-21  | 1841   | approved snapshot behavior after execute failure             | **削除**                    | skill-lifecycle-prepare-button なし + planSkill 廃止            |

## 問題点の整理

| 問題               | 詳細                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| デッドコード蓄積   | 12件の describe.skip が廃止済み API（planSkill/detectMode）や存在しない testid（skill-lifecycle-prepare-button）を参照し、永遠に動かないコードが残留 |
| CI 信頼性低下      | スキップされたテストはカバレッジに算入されず「全テスト PASS」表示がミスリーディング                                                                  |
| 新規参入者の混乱   | なぜスキップされているか不明で、コードベース理解を妨げる                                                                                             |
| カバレッジ過大評価 | ファイル数・テスト数の見かけが膨らみ、品質評価が歪む                                                                                                 |

## 受け入れ基準 AC-1〜AC-6

| ID   | 受け入れ基準                                                                | 検証方法                                |
| ---- | --------------------------------------------------------------------------- | --------------------------------------- |
| AC-1 | 旧フロー依存の describe.skip（U-1/U-2/U-6/U-10/U-12 の5件）が削除されている | grep -c "describe\.skip" → 1件以下      |
| AC-2 | 要調査テスト（U-4/U-11/U-8b）が削除または昇格で解消されている               | 対象テストに describe.skip が存在しない |
| AC-3 | snapshot 系テスト（U-18b/U-19b/U-20b/U-21）の処置が完了している             | U-20b は昇格、U-18b/U-19b/U-21 は削除   |
| AC-4 | `pnpm --filter @repo/desktop test:run` が PASS する                         | CI 相当の全テスト PASS                  |
| AC-5 | `pnpm --filter @repo/desktop typecheck` が PASS する                        | TypeScript 型チェック 0 error           |
| AC-6 | 廃止済み API モック宣言（mockDetectMode/mockPlanSkill）が整理済み           | 宣言・beforeEach 設定がすべて除去済み   |

## タスク分類宣言

| 分類項目   | 値                                                 |
| ---------- | -------------------------------------------------- |
| タスク種別 | CLEANUPタスク                                      |
| 変更範囲   | テストファイルのみ（プロダクションコード変更なし） |
| UIタスク   | 非UIタスク                                         |
| 可視性     | NON_VISUAL（テストコードのみ変更）                 |
| テスト種別 | コンポーネントテスト（desktop renderer 層）        |
