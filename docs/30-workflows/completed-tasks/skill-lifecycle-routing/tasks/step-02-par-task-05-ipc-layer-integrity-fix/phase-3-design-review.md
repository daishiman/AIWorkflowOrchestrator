# Phase 3: 設計レビュー

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 3                                                 |
| タスクID | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001              |
| 機能名   | skill-lifecycle-routing / ipc-layer-integrity-fix |
| 作成日   | 2026-03-17                                        |
| 前Phase  | [Phase 2: 設計](./phase-2-design.md)              |

## 目的

Phase 2 で定義した設計の妥当性を多角的に検証し、Phase 4 へ進むべきか判定する。特にIPC整合性・セキュリティ・Pitfall対策の観点から設計の問題点を洗い出し、PASS/MINOR/MAJOR の判定を行う。

## 実行タスク

- 設計レビュー実施: 各レビュー観点テーブルに沿って設計の妥当性を検証する
- Pitfall チェック: P5/P23/P32/P42/P44/P45 の各パターンに対して設計が適切に対処しているか確認する
- IPC契約整合性確認: IPC契約チェックリスト Phase 1-3 の項目を設計レベルで確認する
- 代替案の検討: より簡素な実装方針があるか検討し記録する
- 判定と戻り先の決定: PASS/MINOR/MAJOR を判定し、戻り先を明示する

## 参照資料

### 一般

| 資料名                | パス                                                                          | 説明                                  |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| Phase 1 要件定義      | `outputs/phase-1/requirements.md`                                             | 確定した受入基準                      |
| Phase 2 設計書        | `outputs/phase-2/design.md`                                                   | レビュー対象の設計書                  |
| IPC契約チェックリスト | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md` | Phase 1-6 チェック項目                |
| 既知の落とし穴        | `.claude/rules/06-known-pitfalls.md`                                          | P5/P23/P32/P42/P44/P45 の詳細         |
| セキュリティルール    | `.claude/rules/04-electron-security.md`                                       | IPC セキュリティ原則                  |
| コード品質ルール      | `.claude/rules/02-code-quality.md`                                            | TypeScript 型安全・エラーハンドリング |

### システム仕様（aiworkflow-requirements）

| 資料名                     | パス                                                                              | 説明                              |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| IPC API仕様                | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | スキルIPC チャンネル定義          |
| スキルIPCセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | IPCチャンネル検証テーブル（正本） |
| Electron IPCセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | IPC全般のセキュリティ原則         |
| スキルインターフェース定義 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | SkillAPI型定義・統一API仕様       |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | エラーカテゴリとコード範囲        |

## レビュー観点テーブル

### 1. IPC整合性（最重要）

| 観点 ID | 確認項目                                                                         | 判定基準    | 判定 |
| ------- | -------------------------------------------------------------------------------- | ----------- | ---- |
| IPC-1   | SKILL_UPDATE ハンドラの引数名がセマンティクスと一致する（P45: skillName を使用） | PASS / FAIL |      |
| IPC-2   | SKILL_GET_DETAIL Preload の引数名が既存ハンドラの期待と一致する                  | PASS / FAIL |      |
| IPC-3   | SKILL_UPDATE Preload の引数順序が Main ハンドラの期待と一致する                  | PASS / FAIL |      |
| IPC-4   | `safeInvoke` でチャンネル名に `IPC_CHANNELS` 定数を使用している（P27準拠）       | PASS / FAIL |      |
| IPC-5   | ホワイトリスト（`ALLOWED_INVOKE_CHANNELS`）に変更が不要であることを確認          | PASS / N/A  |      |
| IPC-6   | unregister 設計が P5（二重登録防止）に対応している                               | PASS / FAIL |      |

### 2. セキュリティ

| 観点 ID | 確認項目                                                                           | 判定基準    | 判定 |
| ------- | ---------------------------------------------------------------------------------- | ----------- | ---- |
| SEC-1   | Main Process ハンドラで送信元ウィンドウ検証（`validateIpcSender`）が設計されている | PASS / FAIL |      |
| SEC-2   | パストラバーサル攻撃を考慮したバリデーションが設計されている                       | PASS / N/A  |      |
| SEC-3   | エラーレスポンスに内部情報（スタックトレース等）が含まれない設計になっている       | PASS / FAIL |      |
| SEC-4   | contextIsolation/nodeIntegration 設定に変更が不要であることを確認                  | PASS / N/A  |      |

### 3. バリデーション（P42準拠）

| 観点 ID | 確認項目                                                                    | 判定基準    | 判定 |
| ------- | --------------------------------------------------------------------------- | ----------- | ---- |
| VAL-1   | SKILL_UPDATE ハンドラで `typeof skillName !== "string"` チェックがある      | PASS / FAIL |      |
| VAL-2   | SKILL_UPDATE ハンドラで `skillName === ""` チェックがある                   | PASS / FAIL |      |
| VAL-3   | SKILL_UPDATE ハンドラで `skillName.trim() === ""` チェックがある（P42核心） | PASS / FAIL |      |
| VAL-4   | `getDetail()` Preload で `skillId` の3段バリデーションが設計されている      | PASS / FAIL |      |
| VAL-5   | `update()` Preload で `skillName` の3段バリデーションが設計されている       | PASS / FAIL |      |
| VAL-6   | `updates` オブジェクトの null チェック・型チェックが設計されている          | PASS / FAIL |      |

### 4. 型定義整合性（P23/P32準拠）

| 観点 ID | 確認項目                                                                         | 判定基準    | 判定 |
| ------- | -------------------------------------------------------------------------------- | ----------- | ---- |
| TYPE-1  | P32準拠: 型定義の二箇所同時更新計画が設計書に明記されている                      | PASS / FAIL |      |
| TYPE-2  | `apps/desktop/src/preload/types.ts` の SkillAPI 型に追加メソッドが計画されている | PASS / FAIL |      |
| TYPE-3  | P23準拠: 型定義の「同時更新」が1つのコミットで行われる計画になっている           | PASS / FAIL |      |
| TYPE-4  | `any` 型を使用しない設計になっている（`unknown` または具体的な型を使用）         | PASS / FAIL |      |

### 5. エラーハンドリング

| 観点 ID | 確認項目                                                      | 判定基準    | 判定 |
| ------- | ------------------------------------------------------------- | ----------- | ---- |
| ERR-1   | エラーコードが error-handling.md のカテゴリ範囲に準拠している | PASS / FAIL |      |
| ERR-2   | バリデーションエラーが 1000-1999 範囲のコードを使用している   | PASS / FAIL |      |
| ERR-3   | try-catch で握りつぶしていない設計になっている（上位に伝播）  | PASS / FAIL |      |

### 6. 既存テストへの影響

| 観点 ID | 確認項目                                                                     | 判定基準    | 判定 |
| ------- | ---------------------------------------------------------------------------- | ----------- | ---- |
| TEST-1  | 既存のスキルハンドラテストに破壊的変更を加えない設計になっている             | PASS / FAIL |      |
| TEST-2  | P21準拠: DI 追加時の既存テストへのモック追加が計画されている（該当する場合） | PASS / N/A  |      |
| TEST-3  | P35準拠: 影響範囲の全テストファイルへの修正計画がある                        | PASS / FAIL |      |

### 7. 代替案の検討記録

Phase 3 ポイント準拠: より簡素な代替案を検討した結果を記録する。

| 代替案                                               | 採用/不採用 | 理由                                                                       |
| ---------------------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| SKILL_UPDATE をスキップして別タスクに先送り          | 不採用      | デッドチャンネルは Renderer からアクセス時にクラッシュするため即修正が必要 |
| SKILL_GET_DETAIL Preload を別ファイルに分離          | 不採用      | 既存の `skill-api.ts` に追加する方が一貫性が高い                           |
| `updates` をオブジェクトではなく文字列（JSON）で渡す | 不採用      | IPC通信でオブジェクトは直接渡せるため不要                                  |

## 判定基準と戻り先

| 判定              | 条件                                                  | 対応                                              |
| ----------------- | ----------------------------------------------------- | ------------------------------------------------- |
| PASS              | レビュー観点の全項目が PASS または N/A                | Phase 4（テスト作成）へ進行                       |
| MINOR             | 軽微な指摘がある（設計の本質に影響しない改善点）      | 指摘を MINOR 追跡テーブルに記録後、Phase 4 へ進行 |
| MAJOR（要件問題） | 受入基準 AC-1〜AC-8 に未対応の要件問題がある          | Phase 1 へ戻る                                    |
| MAJOR（設計問題） | IPC契約・セキュリティ・型整合性に重大な設計問題がある | Phase 2 へ戻る                                    |

### MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘を以下のテーブルで追跡する（実施時に記入）:

| MINOR ID         | 指摘内容 | 解決予定Phase | 解決確認Phase | 備考 |
| ---------------- | -------- | ------------- | ------------- | ---- |
| （実施時に記入） | —        | —             | —             | —    |

## Phase 4 開始条件と Phase 13 Blocked 条件

### Phase 4 開始条件

以下が全て満たされた場合のみ Phase 4 へ進む:

- [ ] Phase 3 判定が PASS または MINOR である
- [ ] MINOR 指摘が MINOR 追跡テーブルに全て記録されている
- [ ] IPC契約チェックリスト Phase 1（変更前の契約確認）が設計レベルで確認済み
- [ ] IPC契約チェックリスト Phase 3（バリデーション確認）が設計レベルで確認済み

### Phase 13 Blocked 条件

以下のいずれかに該当する場合、Phase 13（PR作成）をブロックする:

- AC-7（既存テスト全件 PASS）が達成されていない
- `pnpm typecheck` でエラーが残存する
- IPC契約チェックリスト Phase 6（テスト検証）が未完了

## 実行手順

### ステップ1: 設計書の読み込み

`outputs/phase-2/design.md` を読み込み、設計の全体像を把握する。

### ステップ2: 各レビュー観点の検証

レビュー観点テーブルの各項目（IPC-1〜6、SEC-1〜4、VAL-1〜6、TYPE-1〜4、ERR-1〜3、TEST-1〜3）を順番に確認し、判定を記入する。

### ステップ3: Pitfall チェックリスト

以下の Pitfall に対して設計が適切に対処しているか確認する:

| Pitfall | 確認内容                                                                                               | 設計での対処    |
| ------- | ------------------------------------------------------------------------------------------------------ | --------------- |
| P5      | `ipcMain.handle` 二重登録防止: `unregisterSkillHandlers()` に `removeHandler(SKILL_UPDATE)` が含まれる | 確認済み/未対処 |
| P23     | 型定義の同時更新: `preload/types.ts` の SkillAPI 型に `getDetail`/`update` を追加する計画がある        | 確認済み/未対処 |
| P32     | 二箇所同時更新: `packages/shared` と `apps/desktop/src/preload/types.ts` を1コミットで更新する計画     | 確認済み/未対処 |
| P42     | `.trim()` バリデーション: 全文字列引数に3段バリデーション（型→空文字→トリム空文字）がある              | 確認済み/未対処 |
| P44     | IPC契約ドリフト: ハンドラの引数形式と Preload の渡し方が一致している                                   | 確認済み/未対処 |
| P45     | 命名ドリフト: `skillName`（セマンティクスに一致）を使用している                                        | 確認済み/未対処 |

### ステップ4: IPC契約チェックリスト Phase 1-3 の確認

設計レベルで以下を確認する:

**Phase 1（変更前の契約確認）**:

- [ ] 1-1: 対象チャネルの現在の shape を4箇所で確認する計画がある
- [ ] 1-2: 引数の命名が3箇所で一致することを確認する計画がある
- [ ] 1-3: 引数の構造が一致することを確認する計画がある
- [ ] 1-4: 成功/失敗 envelope が一致することを確認する計画がある

**Phase 2（実装変更: 3箇所同時更新）**:

- [ ] 2-1: Main Process ハンドラの更新が計画されている
- [ ] 2-2: Preload API の更新が計画されている
- [ ] 2-3: テストの期待値更新が計画されている

**Phase 3（バリデーション確認: P42準拠）**:

- [ ] 3-1: `typeof` チェックが設計されている
- [ ] 3-2: `=== ""` チェックが設計されている
- [ ] 3-3: `.trim() === ""` チェックが設計されている

### ステップ5: 判定の決定

全レビュー観点の確認結果に基づき、PASS/MINOR/MAJOR を判定し、成果物に記録する。

### ステップ6: MINOR 指摘の記録と解決計画

MINOR 判定の場合は、全ての指摘を MINOR 追跡テーブルに記録し、解決予定 Phase を明示する。

## 統合テスト連携

| 確認項目                                                       | 確認方法                   | 期待結果        |
| -------------------------------------------------------------- | -------------------------- | --------------- |
| 設計が既存テストと矛盾しないか                                 | 設計書と既存テストの照合   | 矛盾なし        |
| IPC契約チェックリスト Phase 1-3 が設計レベルで充足されているか | レビュー観点テーブルの確認 | 全項目 PASS/N/A |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                  | 仕様参照先                                          |
| ------------------ | ------------------------- | --------------------------------------------------- |
| セキュリティ       | IPC引数バリデーション設計 | `aiworkflow-requirements: security-electron-ipc.md` |
| API設計            | IPC API 契約設計          | `aiworkflow-requirements: api-ipc-agent.md`         |
| エラーハンドリング | エラーコード・伝播設計    | `aiworkflow-requirements: error-handling.md`        |
| アーキテクチャ     | IPC層レイヤ設計           | `aiworkflow-requirements: architecture-overview.md` |

**Electronデスクトップアプリ観点**:

| 層                   | 適用判断                | 仕様参照先                                                     |
| -------------------- | ----------------------- | -------------------------------------------------------------- |
| バックエンド（Main） | ハンドラ設計の妥当性    | `aiworkflow-requirements: architecture-overview.md`            |
| IPC通信              | チャンネル契約の整合性  | `aiworkflow-requirements: api-ipc-agent.md`, `interfaces-*.md` |
| Preload/セキュリティ | Preload API設計の妥当性 | `aiworkflow-requirements: security-api-electron.md`            |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 2 設計書、ipc-contract-checklist.md）
2. レビュー観点テーブル（IPC整合性）の検証
3. レビュー観点テーブル（セキュリティ）の検証
4. レビュー観点テーブル（バリデーション P42準拠）の検証
5. レビュー観点テーブル（型定義整合性 P23/P32準拠）の検証
6. レビュー観点テーブル（エラーハンドリング・テスト影響）の検証
7. Pitfall チェックリストの実施（P5/P23/P32/P42/P44/P45）
8. IPC契約チェックリスト Phase 1-3 の設計レベル確認
9. 代替案の検討記録
10. 判定決定（PASS/MINOR/MAJOR）と MINOR 追跡テーブル記録
11. 成果物の作成
12. 完了条件の検証

## 成果物

| 成果物             | パス                                      | 説明                               |
| ------------------ | ----------------------------------------- | ---------------------------------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | 判定結果・観点別確認結果           |
| MINOR 追跡テーブル | `outputs/phase-3/minor-tracking.md`       | MINOR 指摘の追跡計画（該当時のみ） |

## 完了条件

- [ ] レビュー観点テーブルの全項目（IPC-1〜6、SEC-1〜4、VAL-1〜6、TYPE-1〜4、ERR-1〜3、TEST-1〜3）を確認済み
- [ ] Pitfall チェックリスト（P5/P23/P32/P42/P44/P45）を実施済み
- [ ] IPC契約チェックリスト Phase 1-3 を設計レベルで確認済み
- [ ] 代替案の検討結果を記録済み
- [ ] PASS/MINOR/MAJOR の判定を決定し記録済み
- [ ] MINOR 指摘がある場合、全て MINOR 追跡テーブルに記録済み（解決予定 Phase を明示）
- [ ] `outputs/phase-3/design-review-result.md` が作成済み
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix \
  --phase 3
```

## 次Phase

判定が PASS または MINOR の場合: Phase 4（テスト作成）へ進行

> **Gate**:
>
> - PASS → 即座に Phase 4 へ進行
> - MINOR → MINOR 追跡テーブルに全指摘を記録後、Phase 4 へ進行（指摘対応は Phase 4-5 で実施）
> - MAJOR（要件問題）→ Phase 1 へ戻り要件を再確認
> - MAJOR（設計問題）→ Phase 2 へ戻り設計を修正
