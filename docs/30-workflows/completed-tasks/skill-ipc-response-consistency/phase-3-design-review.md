# Phase 3: 設計レビューゲート - UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001

## メタ情報

| 項目               | 値                                                                            |
| ------------------ | ----------------------------------------------------------------------------- |
| タスクID           | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001                                     |
| Phase              | 3（設計レビュー）                                                             |
| 機能名             | skill-ipc-response-consistency                                                |
| 作成日             | 2026-02-27                                                                    |
| 前提Phase          | [Phase 2（設計）](./phase-2-design.md)                                        |
| 目的               | Phase 2 の設計を多角的に検証し、方針A/B/C の評価と方針C採用の妥当性を確定する |
| 成果物ディレクトリ | `docs/30-workflows/skill-ipc-response-consistency/outputs/phase-3/`           |

## 目的

Phase 2 の設計を多角的に検証し、方針A/B/C の評価と方針C採用の妥当性を確定する。

### 背景

契約統一の設計方針は複数存在し、それぞれにトレードオフがある。Phase 3 では方針C（契約プロファイル明示＋Preload単一化）が最適解であることを確認する。

### 3つの方針の概要

| 方針 | 名称                              | 特徴                                                                     |
| ---- | --------------------------------- | ------------------------------------------------------------------------ |
| A    | 全チャネル直接返却+throw統一      | 冗長なラッパー廃止。長期最適だが既存テスト・仕様影響が大きい             |
| B    | 全チャネルラッパー返却+unwrap統一 | `{ success, data }` に統一。`execute`/`remove`の既存期待値と衝突しやすい |
| C    | プロファイル明示+Preload単一化    | Main契約を固定し、Preloadで吸収。既存資産を活かしつつ混乱を排除できる    |

## 実行タスク

### Task 3-1: 設計レビュー実施

**目的**: 方針A/B/C を体系的に評価し、方針C の採用理由を確定する。

**手順**:

1. Phase 2 の設計書（`outputs/phase-2/design-document.md`）を入力として、以下の5つの観点でレビューする:

| #   | レビュー観点   | 評価基準                                                       |
| --- | -------------- | -------------------------------------------------------------- |
| 1   | 要件充足性     | Phase 1 の要件（AR-1〜AR-7）を全て満たすか                     |
| 2   | 実装変更コスト | 既存テスト・仕様への影響範囲は許容可能か                       |
| 3   | 契約明瞭性     | 開発者が迷わず正しい戻り値解釈を選択できるか                   |
| 4   | セキュリティ   | AR-3（validateIpcSender + trim検証）/ AR-4（Main側検証）準拠か |
| 5   | 再発防止       | 契約ドリフト検出の仕組みが設計に組み込まれているか             |

2. 方針A/B/C の比較表を作成する:

| 評価軸         | 方針A（直接返却統一） | 方針B（ラッパー統一） | 方針C（プロファイル明示） |
| -------------- | --------------------- | --------------------- | ------------------------- |
| 要件充足性     | —                     | —                     | —                         |
| 実装変更コスト | 高                    | 中                    | 中                        |
| 契約明瞭性     | 高                    | 中                    | 高                        |
| セキュリティ   | —                     | —                     | —                         |
| 再発防止       | —                     | —                     | —                         |
| 後方互換性     | 低                    | 低                    | 高                        |
| テスト影響範囲 | 大                    | 大                    | 中                        |
| **総合評価**   | —                     | —                     | —                         |

3. `outputs/phase-3/review-result.md` に結果を出力する

**評価の詳細ポイント**:

- **方針A（全チャネル直接返却+throw統一）**:
  - 長期的には最もクリーンだが、`skill:list` / `skill:getImported` / `skill:get-detail` / `skill:execute` の既存ラッパー返却を全て変更する必要がある
  - TASK-9C 系の `OperationResult` ラッパーも廃止が必要（P25 波及影響リスク）
  - 既存テストの期待値が大量に変更される

- **方針B（全チャネルラッパー返却+unwrap統一）**:
  - `skill:import`（直接返却に修正済み）と `skill:remove`（RemoveResult直接返却）を再びラッパーで包む必要がある
  - `skill:abort`（boolean）/ `skill:get-status`（null許容）のプリミティブ型もラッパー化が必要
  - UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 の成果を無駄にする

- **方針C（プロファイル明示+Preload単一化）**:
  - 既存の return パターンを尊重しつつ、プロファイルとして明示化する
  - Preload で `safeInvoke` / `safeInvokeUnwrap` を契約プロファイルに従って選択し、Renderer に単一の型を提供する
  - 移行コストが最小で、既存テスト・仕様への影響が限定的

**成果物**: `outputs/phase-3/review-result.md`

---

### Task 3-2: リスク評価

**目的**: 設計の実装リスクを事前評価する。

**手順**:

1. 既知のPitfall への対策が設計に含まれているか確認する:

| Pitfall | 内容                                          | 設計での対策状況 | 判定 |
| ------- | --------------------------------------------- | ---------------- | ---- |
| P23     | API二重定義の型管理                           | —                | —    |
| P32     | 型定義の二箇所同時更新必須                    | —                | —    |
| P42     | 文字列引数の .trim() バリデーション漏れ       | —                | —    |
| P44     | skill:import/remove IPCインターフェース不整合 | —                | —    |
| P45     | IPC引数命名の契約ドリフト                     | —                | —    |

2. `execute` 互換性崩れリスクを評価する:
   - `skill:execute` の戻り値変更は Renderer の AgentView / SkillExecutor に影響する
   - `executionId` の直参照パターンが崩れるリスク
   - 変更スコープと影響範囲を定量化する

3. テスト既存前提崩れリスクを評価する:
   - 各チャネルの既存テスト数と変更が必要なテスト数を推定する
   - テスト回帰実行の計画を確認する

4. `outputs/phase-3/risk-assessment.md` に出力する

**リスク評価テンプレート**:

| リスク項目                   | 発生確率 | 影響度 | リスクレベル | 軽減策 |
| ---------------------------- | -------- | ------ | ------------ | ------ |
| execute 互換性崩れ           | —        | —      | —            | —      |
| OperationResult 廃止波及     | —        | —      | —            | —      |
| 型定義同期漏れ               | —        | —      | —            | —      |
| テスト期待値大量変更         | —        | —      | —            | —      |
| Renderer側の戻り値解釈不整合 | —        | —      | —            | —      |

**成果物**: `outputs/phase-3/risk-assessment.md`

---

### Task 3-3: レビュー判定

**目的**: PASS/MINOR/MAJOR/CRITICAL を判定する。

**手順**:

1. Task 3-1（設計レビュー）と Task 3-2（リスク評価）の結果に基づき判定する
2. 以下の判定基準に従う:

| 判定     | 条件                                             | 次のアクション                                 |
| -------- | ------------------------------------------------ | ---------------------------------------------- |
| PASS     | 全レビュー観点で問題なし、リスクが全て許容範囲内 | Phase 4（テスト作成）へ進行                    |
| MINOR    | 軽微な指摘あり（契約明瞭性の改善提案等）         | 指摘対応後、Phase 4 へ進行                     |
| MAJOR    | 要件未充足またはリスクが高い                     | 問題種別に応じて Phase 1 または Phase 2 へ戻る |
| CRITICAL | 致命的な設計問題（セキュリティ欠陥等）           | Phase 1 へ戻りユーザー確認                     |

3. MINOR 指摘がある場合は対応方針を記録する:
   - 各指摘に対する対応方法（設計修正 / 未タスク化 / 許容）
   - 対応後の再レビュー要否
4. `outputs/phase-3/gate-decision.md` に出力する

**戻り先決定基準**:

| 問題の種類 | 戻り先              | 根拠                             |
| ---------- | ------------------- | -------------------------------- |
| 要件の問題 | Phase 1（要件定義） | AR制約の不足・誤解がある場合     |
| 設計の問題 | Phase 2（設計）     | プロファイル分類・移行計画の問題 |

**成果物**: `outputs/phase-3/gate-decision.md`

---

## SubAgent 分担

| SubAgent   | 担当                                                           |
| ---------- | -------------------------------------------------------------- |
| SubAgent-A | Task 3-1（設計レビュー）— Phase 2 全成果物を対象にレビュー実施 |
| SubAgent-B | Task 3-2（リスク評価）— Pitfall対策検証とリスク定量化          |
| SubAgent-C | Task 3-3（判定）— SubAgent-A/B 完了後にゲート判定を実施        |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                  |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| Skill IPC インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | skill: チャネル型定義 |
| IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 契約変更手順          |
| IPC セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 検証パターン          |
| Electron IPC セキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | IPC セキュリティ原則  |
| 実装パターン集             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S2/S13/S18パターン    |
| Electron サービス設計      | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | サービス層設計        |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                        | P23/P32/P42/P44/P45   |

### タスク固有参照

| 参照資料         | パス                                 | 内容         |
| ---------------- | ------------------------------------ | ------------ |
| Phase 2 設計書   | `outputs/phase-2/design-document.md` | レビュー対象 |
| Phase 1 要件書   | `outputs/phase-1/requirements.md`    | 要件充足確認 |
| Phase 2 全成果物 | `outputs/phase-2/`                   | 設計の詳細   |

## 統合テスト連携

- 統合テスト観点でのレビューゲートを実施する:
  - IPC契約境界のテスト可能性を検証する
  - 移行ステップごとのテスト回帰計画の妥当性を確認する
  - Preload単一化後の統合テストシナリオが設計に含まれているか確認する
- レビュー指摘が Phase 4 のテスト設計に影響する場合、指摘事項を Phase 4 仕様書に伝達する

## 多角的チェック観点

| 観点           | 適用判断                | 仕様参照先                                                   |
| -------------- | ----------------------- | ------------------------------------------------------------ |
| セキュリティ   | 必須（AR-3/AR-4検証）   | `security-skill-ipc.md`, `security-electron-ipc.md`          |
| UI/UX          | 非該当（IPC層タスク）   | —                                                            |
| アーキテクチャ | 必須（方針比較）        | `interfaces-agent-sdk-skill.md`, `arch-electron-services.md` |
| 型安全         | 必須（P23/P32対策検証） | `architecture-implementation-patterns.md`                    |
| テスト         | 必須（テスト影響評価）  | テスト回帰計画の妥当性確認                                   |
| 後方互換性     | 必須                    | `skill:execute` 互換性崩れリスク                             |

### Electron デスクトップアプリ観点

| 層                         | 適用判断 | 確認内容                                 |
| -------------------------- | -------- | ---------------------------------------- |
| フロントエンド（Renderer） | 必須     | Renderer 利用側への影響評価              |
| バックエンド（Main）       | 必須     | プロファイル分類の妥当性                 |
| IPC通信                    | 必須     | 契約プロファイル表の完全性               |
| Preload/セキュリティ       | 必須     | safeInvoke/safeInvokeUnwrap 選択の正確性 |
| ローカルストレージ         | 非該当   | —                                        |

## 実行手順

1. SubAgent-A: Phase 2 設計書を5つのレビュー観点で評価し、方針比較表を作成する
2. SubAgent-B: Pitfall 対策検証とリスク定量化を実施する
3. SubAgent-C: SubAgent-A/B の結果を統合し、PASS/MINOR/MAJOR/CRITICAL を判定する
4. 判定結果に応じて次のアクションを決定する

## 成果物

| 成果物       | パス                                 | 内容                 |
| ------------ | ------------------------------------ | -------------------- |
| レビュー結果 | `outputs/phase-3/review-result.md`   | 方針比較と採用理由   |
| リスク評価   | `outputs/phase-3/risk-assessment.md` | 実装リスク評価       |
| ゲート判定   | `outputs/phase-3/gate-decision.md`   | PASS/MINOR/MAJOR判定 |

## 完了条件

- [ ] 方針A/B/Cの比較表が作成されている
- [ ] 方針C の採用理由が明確に記録されている
- [ ] P23/P32/P42/P44/P45 への対策が設計に含まれていることが確認されている
- [ ] リスク評価が完了し、軽減策が定義されている
- [ ] PASS/MINOR/MAJOR/CRITICAL の判定が記録されている

---

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成して管理する。

1. 参照資料確認（Phase 2 設計書 / Phase 1 要件書 / 既知の落とし穴）
2. 実行タスク実施（Task 3-1〜3-3 を SubAgent 分担に従い実行）
3. 成果物作成（3つの成果物ファイルを outputs/phase-3/ に出力）
4. 完了条件検証（全5条件のチェック）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（Task 3-1〜3-3）を100%実行完了
- [ ] 各タスクの成果物（3ファイル）が `outputs/phase-3/` に生成されている
- [ ] artifacts.json の Phase 3 ステータスが更新されている
- [ ] Phase末端で完了状態を明記している

## Phase実行記録

| 項目     | 値  |
| -------- | --- |
| 開始日時 | —   |
| 完了日時 | —   |
| 実行者   | —   |
| 判定     | —   |
| 備考     | —   |

## 次Phase

- **PASS / MINOR対応完了の場合**: [Phase 4（テスト作成）](./phase-4-test-creation.md) へ進む。
- **MAJOR（要件問題）の場合**: [Phase 1（要件定義）](./phase-1-requirements.md) へ戻る。
- **MAJOR（設計問題）の場合**: [Phase 2（設計）](./phase-2-design.md) へ戻る。
- **CRITICAL の場合**: [Phase 1（要件定義）](./phase-1-requirements.md) へ戻り、ユーザー確認を実施する。
