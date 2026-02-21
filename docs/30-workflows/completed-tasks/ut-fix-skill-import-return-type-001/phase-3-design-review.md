# Phase 3: 設計レビューゲート

## メタ情報

| 項目      | 値                                                                           |
| --------- | ---------------------------------------------------------------------------- |
| Phase     | 3                                                                            |
| タスクID  | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001                                          |
| タスク名  | skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換） |
| 機能名    | skill-import-return-type-fix                                                 |
| 作成日    | 2026-02-21                                                                   |
| 依存Phase | Phase 2（設計）                                                              |

## 目的

Phase 2で作成した設計の妥当性を多角的に検証し、Phase 4（テスト作成）への移行可否を判定する。型安全性、エラーハンドリング、2ステップ呼び出しの整合性、既知の落とし穴との照合を行う。

## 実行タスク

- 設計レビュー: Phase 2設計書の多角的レビュー
- 既知の落とし穴照合: P23/P32/P42/P44/P45との整合性確認
- ゲート判定: PASS/MINOR/MAJOR判定

## 参照資料

| 資料名             | パス                                                                                        | 説明               |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義   | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-1-requirements.md`             | 要件との整合性確認 |
| Phase 2 設計       | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-2-design.md`                   | レビュー対象       |
| 実装パターン集     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 既知パターン参照   |
| セキュリティ仕様書 | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | セキュリティ検証   |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                        | 落とし穴照合       |

---

## 1. レビュー観点

### 1.1 型安全性レビュー

| #   | チェック項目                                                      | 結果 | 備考                                                 |
| --- | ----------------------------------------------------------------- | ---- | ---------------------------------------------------- |
| 1   | ハンドラ戻り値が`ImportedSkill`型であることが設計に明示されている | PASS | Phase 2 §1.2 Step 4で明示                            |
| 2   | `as`型アサーションを使用していない                                | PASS | getSkillByName()の戻り値をそのまま返す設計           |
| 3   | Preload型宣言との一致が確認されている                             | PASS | Phase 2 §3.2 IPC契約テーブルで整合確認               |
| 4   | ImportResult型のプロパティが戻り値に混入しない                    | PASS | importResultは内部変数として使用、返却しない         |
| 5   | null安全性が確保されている                                        | PASS | getSkillByNameのnullチェック設計あり（Phase 2 §1.2） |

### 1.2 エラーハンドリングレビュー

| #   | チェック項目                                             | 結果 | 備考                                                   |
| --- | -------------------------------------------------------- | ---- | ------------------------------------------------------ |
| 1   | バリデーション失敗時のエラー形式が統一されている         | PASS | `{ code, message }` 形式で統一（Phase 2 §1.2）         |
| 2   | importSkills失敗時のエラーハンドリングが定義されている   | PASS | IMPORT_ERRORコード + errors.join(",")                  |
| 3   | getSkillByNameがnullの場合のハンドリングが定義されている | PASS | SKILL_NOT_FOUNDコード + スキル名含むメッセージ         |
| 4   | エラーメッセージに内部情報が漏洩しない                   | PASS | スタックトレース等は含まれない設計                     |
| 5   | エラーコードが既存パターンと整合している                 | PASS | VALIDATION_ERROR（既存）+ IMPORT_ERROR/SKILL_NOT_FOUND |

### 1.3 2ステップ呼び出しの整合性レビュー

| #   | チェック項目                                                       | 結果 | 備考                                                   |
| --- | ------------------------------------------------------------------ | ---- | ------------------------------------------------------ |
| 1   | importSkills()が先に呼ばれ、成功確認後にgetSkillByName()が呼ばれる | PASS | Phase 2 §1.2 Step 2→3の順序が正しい                    |
| 2   | importSkills()にskillNameが配列でラップされて渡される              | PASS | `[skillName]`で渡す設計（Phase 2 §1.3）                |
| 3   | getSkillByName()のキャッシュ問題が考慮されている                   | PASS | importSkills後にスキャンされキャッシュが更新される前提 |
| 4   | 両メソッドの非同期処理が順序通りにawaitされている                  | PASS | 両方とも`await`で逐次実行                              |
| 5   | importSkills()の戻り値（ImportResult）が外部に漏洩しない           | PASS | 内部変数として使用し、返却するのはImportedSkillのみ    |

### 1.4 IPC契約整合性レビュー

| #   | チェック項目                                   | 結果 | 備考                                        |
| --- | ---------------------------------------------- | ---- | ------------------------------------------- |
| 1   | 引数形式がPreload側と一致している              | PASS | 両方とも`skillName: string`（Phase 2 §3.2） |
| 2   | 戻り値型がPreload側と一致している              | PASS | 両方とも`ImportedSkill`（Phase 2 §3.2）     |
| 3   | エラー形式がIPC通信で正しくシリアライズされる  | PASS | `{ code, message }`はstructuredCloneで安全  |
| 4   | チャンネル名がIPC_CHANNELS定数で参照されている | PASS | 既存のIPC_CHANNELS.SKILL_IMPORTを維持       |

---

## 2. 既知の落とし穴照合

### P23: API二重定義の型管理複雑性

| 照合項目                             | 結果 | 備考                                                |
| ------------------------------------ | ---- | --------------------------------------------------- |
| 型定義の変更箇所が全て特定されている | PASS | ハンドラのみ変更、Preload/Renderer/共有型は変更不要 |
| 型変更の影響範囲が調査されている     | PASS | Phase 2 §7で変更影響範囲を詳細に記載                |

### P32: 型定義の二箇所同時更新必須

| 照合項目                                              | 結果 | 備考                                            |
| ----------------------------------------------------- | ---- | ----------------------------------------------- |
| shared/types/skill.tsの変更が不要であることが確認済み | PASS | ImportedSkill/ImportResult型は変更不要          |
| preload/types.tsの変更が不要であることが確認済み      | PASS | skill-api.tsの型宣言は既にImportedSkillで正しい |

### P42: .trim()バリデーション漏れ

| 照合項目                                          | 結果 | 備考                                   |
| ------------------------------------------------- | ---- | -------------------------------------- |
| 3段バリデーション（型→空文字列→トリム）が設計済み | PASS | Phase 2 §5でP42準拠設計を記載          |
| skill:removeハンドラのパターンと整合している      | PASS | skillHandlers.ts:150-156と同一パターン |

### P44: skill:import/remove IPCインターフェース不整合

| 照合項目                                           | 結果 | 備考                                          |
| -------------------------------------------------- | ---- | --------------------------------------------- |
| 引数形式が`string`（単一スキル名）に統一されている | PASS | UT-FIX-SKILL-IMPORT-INTERFACE-001との同時修正 |
| 内部メソッドの引数名がskillNameで統一されている    | PASS | Phase 2 §1.2で`skillName`パラメータ名を使用   |

### P45: IPC引数命名の契約ドリフト

| 照合項目                             | 結果 | 備考                              |
| ------------------------------------ | ---- | --------------------------------- |
| 引数名がセマンティクスと一致している | PASS | `skillName`（実際の値はスキル名） |
| skillId/skillNameの混在がない        | PASS | 一貫して`skillName`を使用         |

---

## 3. テスト設計の妥当性レビュー

| #   | チェック項目                                       | 結果 | 備考                                   |
| --- | -------------------------------------------------- | ---- | -------------------------------------- |
| 1   | 正常系テスト（ImportedSkill返却）が計画されている  | PASS | SH-IMP-01修正 + モック設計あり         |
| 2   | バリデーション異常系テストが計画されている         | PASS | SH-IMP-02/03修正計画あり               |
| 3   | importSkills失敗時のテストが計画されている         | PASS | 新規テスト追加計画あり                 |
| 4   | getSkillByNameがnull時のテストが計画されている     | PASS | 新規テスト追加計画あり                 |
| 5   | agentSlice統合テストのモック修正が計画されている   | PASS | Phase 2 §6.2で修正計画あり             |
| 6   | Date型のシリアライゼーションテストが考慮されている | PASS | Phase 2 §4.2でtoBeInstanceOf(Date)検証 |

---

## 4. リスク評価

| リスク                                             | 影響度 | 発生確率 | 対策                                            |
| -------------------------------------------------- | ------ | -------- | ----------------------------------------------- |
| getSkillByName()のキャッシュ未更新                 | 中     | 低       | importSkills()がスキャン→キャッシュ更新する前提 |
| importSkills()が成功してもキャッシュに反映されない | 中     | 低       | テストで検証。失敗時はclearCache()追加を検討    |
| 既存テストの修正漏れ                               | 低     | 中       | Phase 2 §6のテスト修正計画で網羅的に特定済み    |
| UT-FIX-SKILL-IMPORT-INTERFACE-001との同時修正衝突  | 低     | 低       | 同一ハンドラ内の修正のため一括で対応            |

---

## 5. ゲート判定

### 判定基準

| 判定  | 条件                                        |
| ----- | ------------------------------------------- |
| PASS  | 全チェック項目がPASSし、重大なリスクがない  |
| MINOR | 軽微な改善点があるが、Phase 4移行に支障なし |
| MAJOR | 設計の根本的な問題があり、Phase 2へ差し戻し |

### 判定結果: **PASS**

#### 判定理由

1. **型安全性**: ハンドラ戻り値がImportedSkill型に正しく変換される設計であり、型アサーション不使用
2. **エラーハンドリング**: 3パターンの異常系が全て定義され、エラーコードが体系化されている
3. **IPC契約整合性**: 引数・戻り値・エラーの3軸で修正前後の契約が明確化されている
4. **既知の落とし穴**: P23/P32/P42/P44/P45の全てとの照合が完了し、問題なし
5. **テスト計画**: 既存テスト修正 + 新規テスト追加の詳細計画が策定されている

---

## 統合テスト連携

| 観点         | 確認内容                                                                         | 参照仕様                                                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IPC契約      | `skill:import` の引数・戻り値・エラー形式の整合を確認                            | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` / `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` / `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` |
| セキュリティ | `validateIpcSender` と入力バリデーション（`skillName` / `skillIds`）の整合を確認 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md` / `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                                                          |
| E2E整合      | Main → Preload → Renderer で `ImportedSkill` が破綻なく流れることを確認          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                                                                                                                                 |

## 成果物

| 成果物                 | パス                                                                             |
| ---------------------- | -------------------------------------------------------------------------------- |
| Phase 3 設計レビュー書 | `docs/30-workflows/ut-fix-skill-import-return-type-001/phase-3-design-review.md` |

## 完了条件

- [x] 型安全性レビューが完了している（5/5 PASS）
- [x] エラーハンドリングレビューが完了している（5/5 PASS）
- [x] 2ステップ呼び出しの整合性レビューが完了している（5/5 PASS）
- [x] IPC契約整合性レビューが完了している（4/4 PASS）
- [x] 既知の落とし穴P23/P32/P42/P44/P45との照合が完了している
- [x] テスト設計の妥当性レビューが完了している（6/6 PASS）
- [x] リスク評価が実施されている
- [x] ゲート判定がPASSである

## 次Phase

→ Phase 4: テスト作成（phase-4-test-creation.md）
