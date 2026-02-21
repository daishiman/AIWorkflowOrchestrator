# Phase 3: 設計レビュー — skill:import IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目        | 値                                   |
| ----------- | ------------------------------------ |
| タスクID    | UT-FIX-SKILL-IMPORT-INTERFACE-001    |
| Phase       | 3（設計レビュー）                    |
| 前Phase依存 | Phase 2 設計書（`outputs/phase-2/`） |
| 担当        | Claude Code                          |
| 作成日      | 2026-02-21                           |

## 目的

Phase 2 で作成した設計の妥当性を、要件整合性・セキュリティ・Pitfall対策・テスト設計の観点から検証する。

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

1. 要件整合性チェック（FR-1〜3, QR-1〜5 が設計で充足されているか）
2. セキュリティチェック（04-electron-security.md 準拠）
3. Pitfall対策チェック（P23, P32, P42, P44 の対策が設計に含まれているか）
4. テスト設計チェック（テストケースの網羅性）
5. skill:remove との一貫性チェック
6. レビュー判定

## 参照資料

> 依存Phase成果物参照: Phase 1, Phase 2

| 資料                                                                                       | 用途                                     |
| ------------------------------------------------------------------------------------------ | ---------------------------------------- |
| Phase 1 要件定義書                                                                         | 受入基準との照合                         |
| Phase 2 設計書                                                                             | レビュー対象                             |
| `docs/30-workflows/completed-tasks/ut-fix-skill-remove-interface/phase-3-design-review.md` | 同一パターンのレビュー結果（一貫性確認） |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`               | IPC セキュリティ原則                     |
| `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`              | Pitfall 対策（P23/P32/P42/P44）確認      |

## 実行手順

### Step 1: 要件整合性チェック

#### 機能要件

| ID   | 受入基準                                                         | 設計での対応箇所                                    | 充足 |
| ---- | ---------------------------------------------------------------- | --------------------------------------------------- | ---- |
| FR-1 | 文字列引数でバリデーションエラーが発生しない                     | ハンドラの引数を `skillName: string` に変更         | ✅   |
| FR-2 | `skillService.importSkills` に正しいスキル名が配列として渡される | `skillService.importSkills([skillName])` の呼び出し | ✅   |
| FR-3 | 存在しないスキル名の呼び出しがサービス層で処理される             | サービス層に委譲（ハンドラは中継のみ）              | ✅   |

#### 品質要件

| ID   | 受入基準                                   | 設計での対応箇所                          | 充足 |
| ---- | ------------------------------------------ | ----------------------------------------- | ---- |
| QR-1 | P42準拠の3段バリデーション                 | `typeof !== "string" \|\| .trim() === ""` | ✅   |
| QR-2 | `validateIpcSender` によるセキュリティ検証 | バリデーションフロー Step 1               | ✅   |
| QR-3 | カバレッジ基準達成                         | Phase 6-7 のテスト拡充・確認              | ✅   |
| QR-4 | `pnpm typecheck` が通る                    | Phase 9 で検証予定                        | ✅   |
| QR-5 | リグレッションなし                         | Phase 9 で全テスト実行予定                | ✅   |

**結果:** 全要件が設計で充足されている。

### Step 2: セキュリティチェック

| チェック項目                                       | 設計での対応                                                | 判定 |
| -------------------------------------------------- | ----------------------------------------------------------- | ---- |
| チャンネル名が `IPC_CHANNELS` 定数で参照されている | `IPC_CHANNELS.SKILL_IMPORT` を使用                          | ✅   |
| 全ハンドラで送信元ウィンドウを検証している         | `validateIpcSender` をバリデーションフロー Step 1 で実行    | ✅   |
| 引数は Main 側でバリデーションしている             | バリデーションフロー Step 2-3 で3段バリデーション           | ✅   |
| エラーはサニタイズしてから Renderer に送る         | エラーオブジェクト `{ code, message }` で内部情報を含まない | ✅   |
| ハードコード文字列でチャンネル名を指定していない   | `IPC_CHANNELS.SKILL_IMPORT` 定数を使用                      | ✅   |

**結果:** セキュリティ原則に準拠している。

### Step 3: Pitfall対策チェック

| Pitfall | タイトル                        | 設計での対策                                                                         | 判定 |
| ------- | ------------------------------- | ------------------------------------------------------------------------------------ | ---- |
| P23     | API二重定義の型管理複雑性       | Preload側は変更不要（既に正しい）、ハンドラ側のみ修正                                | ✅   |
| P32     | 型定義の二箇所同時更新必須      | `preload/types.ts` は既に `(skillName: string) => Promise<ImportedSkill>` で変更不要 | ✅   |
| P42     | `.trim()` バリデーション漏れ    | `typeof !== "string" \|\| skillName.trim() === ""` で3段バリデーション               | ✅   |
| P44     | skill:import 同一パターン       | アプローチAに統一（skill:removeと同一方針）                                          | ✅   |
| P45     | IPC引数命名の契約ドリフト       | 引数名を `skillName` に統一（セマンティクス一致）                                    | ✅   |
| P11     | PostToolUseフックによるEdit失敗 | Phase 5 の注意事項として認識                                                         | ✅   |
| P40     | テスト実行ディレクトリ依存      | `cd apps/desktop &&` でコマンド記載                                                  | ✅   |
| P41     | v8 インライン関数カウント       | Phase 6 SH-IMP-07 で `getAllowedWindows` コールバック明示的検証                      | ✅   |

**結果:** 関連する全 Pitfall が対策済み。

### Step 4: テスト設計チェック

#### テストケースの分岐カバレッジ

| 分岐                                            | カバーするテスト          | 判定 |
| ----------------------------------------------- | ------------------------- | ---- |
| `validation.valid === false`（sender 検証失敗） | SH-IMP-08                 | ✅   |
| `validation.valid === true`（sender 検証成功）  | SH-IMP-01, 04, 07, 09, 11 | ✅   |
| `typeof skillName !== "string"`（型不正）       | SH-IMP-02, 06             | ✅   |
| `skillName.trim() === ""`（空/スペースのみ）    | SH-IMP-03, 05, 10         | ✅   |
| 正常パス（全バリデーション通過）                | SH-IMP-01, 04, 09, 11     | ✅   |

#### テストケースの網羅性

| 観点           | テストケース数      | 十分性判定                                 |
| -------------- | ------------------- | ------------------------------------------ |
| 正常系         | 2（01, 04）         | 十分                                       |
| バリデーション | 4（02, 03, 05, 06） | 十分（型、空、トリム、undefined 全カバー） |
| セキュリティ   | 2（07, 08）         | 十分                                       |
| エッジケース   | 2（09, 10）         | 十分                                       |
| エラー伝播     | 1（11）             | 十分                                       |
| 合計           | 11                  | —                                          |

**結果:** 全分岐がテストでカバーされている。テスト設計は十分。

### Step 5: skill:remove との一貫性チェック

| 比較項目         | skill:import（本設計）                    | skill:remove（修正済み）                  | 一貫性   |
| ---------------- | ----------------------------------------- | ----------------------------------------- | -------- |
| アプローチ       | A（ハンドラ修正）                         | A（ハンドラ修正）                         | ✅       |
| 引数型           | `skillName: string`                       | `skillName: string`                       | ✅       |
| バリデーション式 | `typeof !== "string" \|\| .trim() === ""` | `typeof !== "string" \|\| .trim() === ""` | ✅       |
| エラーメッセージ | `"skillName must be a non-empty string"`  | `"skillName must be a non-empty string"`  | ✅       |
| サービス呼び出し | `importSkills([skillName])`               | `removeSkill(skillName)`                  | ✅（注） |
| テストケース数   | 11                                        | 11                                        | ✅       |

**注:** importSkills は配列引数を受け取るため `[skillName]` でラッピングしている。removeSkill は単一文字列を受け取るため直接渡している。この差異はサービス層のシグネチャに起因し、ハンドラ設計としては一貫している。

**結果:** skill:remove との一貫性が保たれている。

### Step 6: レビュー判定

#### 判定結果: **PASS**

| 観点               | 判定 | 備考                               |
| ------------------ | ---- | ---------------------------------- |
| 要件整合性         | PASS | FR-1〜3, QR-1〜5 全て充足          |
| セキュリティ       | PASS | IPC原則5項目全て準拠               |
| Pitfall対策        | PASS | P23,P32,P40,P41,P42,P44,P45 全対策 |
| テスト設計         | PASS | 全5分岐カバー、11テストケース      |
| skill:remove一貫性 | PASS | 全6項目で一貫性確認                |

**判定根拠:** 設計は要件を完全に充足し、セキュリティ原則に準拠し、関連する全Pitfallに対策が取られている。テスト設計も全分岐をカバーしている。skill:remove の修正済みパターンとの一貫性も確認された。MINOR指摘もなく、Phase 4 への進行を承認する。

## 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合する            |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認する                 |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致させる |

## 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                                                                    | 本タスクでの確認ポイント                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `skill:import/remove` チャンネル定義の整合 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill管理API契約（引数・戻り値）整合       |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload間の責務境界と引数契約         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `validateIpcSender` と入力検証の必須要件   |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `safeInvoke` とホワイトリスト制約          |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42に基づく実装整合                    |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` 等の扱い統一            |

## 成果物

| 成果物       | パス                                |
| ------------ | ----------------------------------- |
| レビュー結果 | `outputs/phase-3/review-summary.md` |

## 完了条件

- [ ] 機能要件 FR-1〜FR-3 の充足が確認されている
- [ ] 品質要件 QR-1〜QR-5 の充足が確認されている
- [ ] セキュリティチェック5項目が全て ✅
- [ ] Pitfall対策チェック8項目（P23, P32, P40, P41, P42, P44, P45, P11）が全て ✅
- [ ] テストケースの分岐カバレッジ5分岐が全てカバーされている
- [ ] テストケース11件の網羅性が「十分」と判定されている
- [ ] skill:remove との一貫性チェック6項目が全て ✅
- [ ] 判定結果（PASS / MINOR / MAJOR）が明記されている
- [ ] PASS の場合: Phase 4 への進行承認が記載されている

## 次Phase

**PASS** → Phase 4（テスト作成）へ進む。TDD Red フェーズでテストを先に修正・追加する。
