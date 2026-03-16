# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                         |
| ------ | -------------------------- |
| Phase  | 3                          |
| 機能名 | safety-gate-implementation |
| 作成日 | 2026-03-16                 |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、Phase 4 以降の実装に進めるかを判定する。

## 実行タスク

### Task 1: 要件-設計整合性チェック

Phase 1 の受入基準と Phase 2 の設計が1対1で対応しているかを検証する:

| 受入基準                                    | Phase 2 対応セクション                     | 整合性 |
| ------------------------------------------- | ------------------------------------------ | ------ |
| `evaluate(skillName)` が動作する            | Task 1: DefaultSafetyGate クラス設計       | -      |
| SafetyCheckId 5種の評価ロジック             | Task 2: 5種 SafetyCheckId 評価ロジック設計 | -      |
| Grade集約ルール（UNSAFE優先）               | Task 3: Grade集約ロジック設計              | -      |
| `CRITICAL_TOOL_REQUIRED` → `UNSAFE`         | Task 2 チェック1 擬似コード                | -      |
| `HIGH_TOOL_REQUIRED` → `SAFE_WITH_WARNINGS` | Task 2 チェック2 擬似コード                | -      |
| `skill:evaluate-safety` IPCハンドラ         | Task 4: IPC ハンドラ設計                   | -      |
| IPC経由で結果取得できる                     | Task 4-3: Preload API 設計                 | -      |
| DI境界を維持                                | Task 1-2: DI設計（Constructor Injection）  | -      |
| テストでblocked/warned/passed固定           | Phase 4 で詳細化                           | -      |

### Task 2: SafetyGatePort 契約との整合性検証

Phase 5 の型定義（`safety-gate.ts`）と Phase 2 設計の整合を検証する:

| 検証項目                                     | 条件式                                                          | Phase 2 対応 |
| -------------------------------------------- | --------------------------------------------------------------- | ------------ |
| `details` は常に5要素を含む                  | `result.details.length === 5`                                   | Task 2       |
| `evaluatedAt` は呼び出し時点のタイムスタンプ | `result.evaluatedAt <= Date.now()`                              | Task 1       |
| `overallGrade` は `details` と整合する       | `calculateOverallGrade(result.details) === result.overallGrade` | Task 3       |
| `skillName` は入力値と一致する               | `result.skillName === inputSkillName`                           | Task 1       |

### Task 3: セキュリティレビュー

| チェック項目                  | 基準                                                     | Phase 2 対応 |
| ----------------------------- | -------------------------------------------------------- | ------------ |
| IPC引数バリデーション（P42）  | 3段バリデーション: typeof → 空文字列 → trim空文字列      | Task 4-2     |
| チャンネル名定数管理（P27）   | `IPC_CHANNELS.SKILL_EVALUATE_SAFETY` で参照              | Task 4-1     |
| 送信元ウィンドウ検証          | `validateIpcSender(event)` を呼び出し                    | Task 4-2     |
| エラーサニタイズ              | 内部エラー（スタックトレース等）を Renderer に漏洩しない | Task 5       |
| 保護パスマッチング（P55対策） | 正規表現メタ文字のエスケープは不要（前方一致比較のため） | Task 2-3     |

### Task 4: DI設計レビュー

| 検証項目                                 | 判定基準                                                |
| ---------------------------------------- | ------------------------------------------------------- |
| Constructor Injection の妥当性           | P34: 全依存が生成時点で利用可能                         |
| `SkillMetadataProvider` の抽象化の十分さ | DefaultSafetyGate が SkillService に直接依存しないこと  |
| モック注入のテスト容易性                 | `SafetyGatePort` インターフェースでモック差し替えが可能 |
| 循環依存の有無                           | Main Process 内で依存方向が一方向であること             |

### Task 5: 既知の落とし穴チェック

Phase 2 設計が以下の既知の落とし穴に抵触しないかを確認:

| Pitfall ID | タイトル                     | 関連チェック項目                         | 判定 |
| ---------- | ---------------------------- | ---------------------------------------- | ---- |
| P5         | リスナー二重登録             | IPCハンドラの登録を一度だけ行うか        | -    |
| P27        | ハードコード文字列の見落とし | チャンネル名定数管理                     | -    |
| P42        | .trim()バリデーション漏れ    | IPC引数バリデーション                    | -    |
| P44        | IPCインターフェース不整合    | ハンドラ引数とPreload呼び出しの一致      | -    |
| P45        | IPC引数命名の契約ドリフト    | `skillName` パラメータ名の一貫性         | -    |
| P54        | safeRegister パターン不適合  | 戻り値キャプチャの要否確認               | -    |
| P55        | パスの正規表現メタ文字       | 保護パスマッチングでRegExpを使わないこと | -    |

### Task 6: simpler alternative の検討

| 検討項目                       | 現在の設計                            | 代替案                                     | 採用判定     | 理由                                                                  |
| ------------------------------ | ------------------------------------- | ------------------------------------------ | ------------ | --------------------------------------------------------------------- |
| 5種チェックの実行方式          | 全5チェック常時実行・途中打ち切りなし | 最初の blocked で short-circuit            | 現設計を採用 | details 配列は常に5要素を返す契約（設計契約 セクション6-3）があるため |
| Grade集約の実装場所            | DefaultSafetyGate 内の private 関数   | スタンドアロンの純粋関数としてエクスポート | 現設計を採用 | Grade集約は SafetyGatePort の責務であり外部公開の必要なし             |
| SkillMetadataProvider の抽象化 | interface として DI                   | SkillService を直接 import                 | 現設計を採用 | SkillService への直接依存は DI 境界を破壊し、テスト容易性を低下させる |

## レビューゲート判定基準

| 判定              | 条件                                           | 対応                  |
| ----------------- | ---------------------------------------------- | --------------------- |
| PASS              | 全チェック項目がクリア                         | Phase 4 へ            |
| MINOR             | 軽微な指摘のみ（機能・セキュリティに影響なし） | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | 受入基準に漏れ・矛盾がある                     | Phase 1 へ戻る        |
| MAJOR（設計問題） | アーキテクチャ・セキュリティに重大な問題がある | Phase 2 へ戻る        |

### MINOR 追跡テーブル

| MINOR ID  | 指摘内容                 | 解決予定Phase | 解決確認Phase | 備考 |
| --------- | ------------------------ | ------------- | ------------- | ---- |
| TECH-M-01 | （Phase 3 実行時に記録） | -             | Phase 9/10    | -    |

### Phase 4 開始条件

- PASS: Phase 3 レビューで全チェック項目がクリアされた場合、Phase 4 へ進む
- MINOR: MINOR 追跡テーブルに記録後、Phase 4 へ進む（解決確認は Phase 9/10 で行う）
- MAJOR: Phase 1 または Phase 2 に戻り、問題を解決してから Phase 3 を再実行する

### Phase 13 blocked 条件

MINOR 追跡テーブルに未解決（解決確認Phase が空欄）の MINOR 指摘が残存している場合、Phase 13 をブロックする。Phase 9（品質検証）または Phase 10（最終レビュー）で全 MINOR 指摘の解決確認を記録すること。

## 参照資料

| 参照資料           | パス                                                                                                                        | 内容                             |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 成果物     | `phase-1-requirements.md`                                                                                                   | 受入基準・インベントリ・制約     |
| Phase 2 成果物     | `phase-2-design.md`                                                                                                         | クラス設計・IPC設計・エラー設計  |
| SafetyGate設計契約 | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-2/safety-gate-contract.md` | 5種チェックルール・Grade集約契約 |
| SafetyGate型定義   | `docs/30-workflows/completed-tasks/step-05-par-task-06-trust-permission-governance/outputs/phase-5/safety-gate.ts`          | SafetyGatePort インターフェース  |

### システム仕様（aiworkflow-requirements）

| 参照資料               | パス                                                                                         | 内容                                         |
| ---------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------- |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`            | IPC セキュリティ原則・認証設計               |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`  | DI パターン・型安全パターン                  |
| IPC システム           | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                        | IPC チャンネル設計・ハンドラ規約             |
| SafetyGatePort契約     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | SafetyGatePort インターフェース定義（L221+） |
| スキル実行セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | ToolRiskLevel・保護パス・許可ツール定義      |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | VALIDATION_ERROR等のエラーコード分類         |

## 実行手順

### ステップ1: 要件-設計整合性チェック（Task 1）

1. Phase 1 の受入基準テーブルの各行について、Phase 2 の対応セクションを特定する
2. 整合性列を `整合` / `不整合（理由）` で埋める

### ステップ2: SafetyGatePort 契約との整合性検証（Task 2）

1. Phase 5 型定義の各フィールドについて、Phase 2 設計が正しく対応しているか確認する
2. 検証項目列を `整合` / `不整合（理由）` で埋める

### ステップ3: セキュリティレビュー（Task 3）

1. P42, P27, P44, P45, P55 の各項目を確認する
2. 対応状況を記録する

### ステップ4: DI設計レビュー（Task 4）

1. Constructor Injection の妥当性を検証する
2. SkillMetadataProvider の抽象化が十分かを確認する
3. 循環依存の有無を確認する

### ステップ5: 既知の落とし穴チェック（Task 5）

1. P5, P27, P42, P44, P45, P54, P55 の各項目を確認する
2. 判定列を `OK` / `NG（理由）` で埋める

### ステップ6: simpler alternative の検討

1. DefaultSafetyGate の設計について、よりシンプルな代替案がないか検討する
2. 検討結果を記録する（代替案がない場合も理由を明記）

### ステップ7: レビューゲート判定

1. 全チェック項目の結果から PASS / MINOR / MAJOR を判定する
2. MINOR 指摘がある場合は MINOR 追跡テーブルに ID（TECH-M-01 形式）で登録する

## 統合テスト連携

- Phase 3 レビュー結果で検出された追加テストケースを Phase 4 に引き継ぐ
- MINOR 指摘事項は Phase 10 最終レビューで解決確認を行う

## 多角的チェック観点（AIが判断）

| 観点           | 確認項目                                    | 仕様参照先                                                         |
| -------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ   | IPC バリデーション要件（P42）、送信元検証   | `aiworkflow-requirements: architecture-auth-security.md`           |
| アーキテクチャ | DI 境界（SafetyGatePort）、レイヤー依存方向 | `aiworkflow-requirements: architecture-implementation-patterns.md` |
| テスタビリティ | モック注入パターン、テスト間状態リーク防止  | `aiworkflow-requirements: testing-component-patterns.md`           |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                                               | 仕様参照先                                          |
| -------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| バックエンド（Main） | DefaultSafetyGate の実装場所として Main Process が対象 | `aiworkflow-requirements: architecture-overview.md` |
| IPC通信              | `skill:evaluate-safety` チャンネルの設計               | `aiworkflow-requirements: api-ipc-system.md`        |
| Preload Script       | evaluateSafety API の公開                              | `aiworkflow-requirements: security-api-electron.md` |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 要件-設計整合性チェック（全受入基準と設計の1対1対応確認）
2. SafetyGatePort 契約との整合性検証
3. セキュリティレビュー（P42/P27/P44/P45/P55 確認）
4. DI設計レビュー（Constructor Injection 妥当性・循環依存確認）
5. 既知の落とし穴チェック（P5/P27/P42/P44/P45/P54/P55）
6. simpler alternative 検討と記録
7. レビューゲート判定と MINOR 追跡テーブル更新
8. 成果物の作成・配置
9. 完了条件の検証

## 成果物

| 成果物               | パス                                      | 説明                                                     |
| -------------------- | ----------------------------------------- | -------------------------------------------------------- |
| 設計レビューレポート | `outputs/phase-3/design-review-report.md` | Task 1-6 の全チェック結果・ゲート判定・MINOR追跡テーブル |
| MINOR指摘一覧        | `outputs/phase-3/minor-tasks.md`          | MINOR 指摘の詳細・解決予定Phase・解決確認Phase の一覧表  |

## 完了条件

- [ ] 要件-設計整合性チェック（Task 1）の全9行について整合性列が `整合` または `不整合（理由）` で埋まっている
- [ ] SafetyGatePort 契約との整合性検証（Task 2）の全4項目の検証項目列が埋まっている
- [ ] セキュリティレビュー（Task 3）の全5項目が確認されている
- [ ] DI設計レビュー（Task 4）の全4項目が確認されている
- [ ] 既知の落とし穴チェック（Task 5）の全7項目（P5/P27/P42/P44/P45/P54/P55）で判定列が `OK` または `NG（理由）` で埋まっている
- [ ] simpler alternative の検討結果（Task 6）が3項目すべて記録されている
- [ ] レビューゲート判定が PASS / MINOR / MAJOR のいずれかで明示されている
- [ ] MINOR指摘がある場合、MINOR追跡テーブルに TECH-M-XX 形式の ID で記録されている
- [ ] Phase 4 開始条件が満たされている（PASS または MINOR 判定であること）

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/safety-gate-implementation --phase 3
```

## 次Phase

Phase 4: テスト作成 → `phase-4-test-creation.md`
