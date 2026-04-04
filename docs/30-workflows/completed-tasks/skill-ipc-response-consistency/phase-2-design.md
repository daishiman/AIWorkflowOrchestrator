# Phase 2: 設計（契約プロファイル設計） - UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001

## メタ情報

| 項目               | 値                                                                                           |
| ------------------ | -------------------------------------------------------------------------------------------- |
| タスクID           | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001                                                    |
| Phase              | 2（設計）                                                                                    |
| 機能名             | skill-ipc-response-consistency                                                               |
| 作成日             | 2026-02-27                                                                                   |
| 前提Phase          | [Phase 1（要件定義）](./phase-1-requirements.md)                                             |
| 目的               | 契約プロファイル表と移行ルールを決定し、方針C（プロファイル明示＋Preload単一化）の設計を行う |
| 成果物ディレクトリ | `docs/30-workflows/skill-ipc-response-consistency/outputs/phase-2/`                          |

## 目的

契約プロファイル表と移行ルールを決定し、方針C（プロファイル明示＋Preload単一化）の設計を行う。

### 背景

Phase 1 で可視化された契約混在に対し、方針C を採用して統一する。Main は「チャネル契約プロファイル表」に従って固定し、Preload は Renderer に対して常に「単一の戻り値解釈」を提供する。

### 方針Cの概要

| 項目        | 内容                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Main 側     | チャネルごとに契約プロファイル（直接返却型/ラッパー返却型/void型等）を固定する                    |
| Preload 側  | `safeInvoke` / `safeInvokeUnwrap` を契約プロファイルに従って選択し、Renderer に単一の型を提供する |
| Renderer 側 | 常に統一された型解釈で戻り値を参照する                                                            |
| 仕様書      | AS-IS と TO-BE を分離し、移行ステップを管理する                                                   |

## 実行タスク

### Task 2-1: 契約プロファイル定義

**目的**: skill: チャネルの戻り値パターンをプロファイルとして正式定義する。

**手順**:

1. Phase 1 の契約マトリクス（`outputs/phase-1/contract-matrix.md`）を入力として、プロファイルカテゴリを定義する
2. 以下のプロファイルカテゴリを候補として検討する:

| プロファイル                  | 戻り値パターン                                                     | エラーパターン           | Preload選択              |
| ----------------------------- | ------------------------------------------------------------------ | ------------------------ | ------------------------ |
| **Profile-A: ラッパー返却型** | `{ success: true, data: T }` / `{ success: false, error: string }` | 構造化エラーオブジェクト | `safeInvokeUnwrap` → `T` |
| **Profile-B: 直接返却型**     | `T` を直接 return                                                  | throw（例外）            | `safeInvoke` → `T`       |
| **Profile-C: プリミティブ型** | `boolean` / `string \| null` 等                                    | throw（例外）            | `safeInvoke` → `T`       |
| **Profile-D: void型**         | 戻り値なし                                                         | throw（例外）            | `safeInvoke` → `void`    |

3. 全14チャネルを各プロファイルに分類する
4. `outputs/phase-2/contract-profiles.md` に出力する

**分類基準**:

- 既存の `{ success, data }` パターンを使用しているチャネル → Profile-A
- 既に直接返却に修正済みのチャネル（`skill:import`, `skill:remove` 等） → Profile-B
- `boolean` や `null` を返すチャネル → Profile-C
- 副作用のみで戻り値が不要なチャネル → Profile-D

**成果物**: `outputs/phase-2/contract-profiles.md`

---

### Task 2-2: Preload 単一化設計

**目的**: Renderer から見て一意の戻り値解釈を提供する Preload の設計を行う。

**手順**:

1. 各プロファイルに対する `safeInvoke` / `safeInvokeUnwrap` の選択ルールを定義する:

| プロファイル | Preload 変換メソッド | Renderer が受け取る型 | 備考                                 |
| ------------ | -------------------- | --------------------- | ------------------------------------ |
| Profile-A    | `safeInvokeUnwrap`   | `T`                   | ラッパーを unwrap して data のみ渡す |
| Profile-B    | `safeInvoke`         | `T`                   | Main の戻り値をそのまま渡す          |
| Profile-C    | `safeInvoke`         | `boolean \| null` 等  | Main の戻り値をそのまま渡す          |
| Profile-D    | `safeInvoke`         | `void`                | 戻り値なし                           |

2. Renderer 向けの統一 API シグネチャを設計する:
   - 各メソッドの TypeScript シグネチャ（引数型と戻り値型）を明示する
   - エラー時の挙動（throw / null / エラーオブジェクト）を統一する
3. AR-2 制約（`{ success, data }` 系は `safeInvokeUnwrap`、直接返却系は `safeInvoke`）への準拠を検証する
4. `outputs/phase-2/preload-unification-design.md` に出力する

**成果物**: `outputs/phase-2/preload-unification-design.md`

---

### Task 2-3: 型定義同期設計

**目的**: shared/preload の型定義変更計画を策定する。

**手順**:

1. 以下の2ファイルの差分を確認する（P23/P32 準拠）:
   - `packages/shared/src/types/skill.ts`（共有型定義）
   - `apps/desktop/src/preload/types.ts`（Preload層型定義）
2. 変更が必要な型定義を一覧化する:
   - 新規追加が必要な型
   - 既存型の修正が必要な箇所
   - 廃止が必要な型（OperationResult ラッパー等）
3. P23/P32 準拠の同時更新計画を策定する:
   - 2ファイル同時更新の順序とコミット単位
   - `pnpm typecheck` による型整合性検証ステップ
4. `outputs/phase-2/type-sync-plan.md` に出力する

**変更対象候補**:

| 型定義                   | 現状の配置       | 変更内容                      |
| ------------------------ | ---------------- | ----------------------------- |
| `ImportedSkill`          | shared + preload | 定義の一致確認                |
| `RemoveResult`           | shared           | Preload 側との整合確認        |
| `SkillExecutionResponse` | shared + preload | 直接返却化に伴う型整理        |
| `OperationResult<T>`     | shared           | 廃止 or 維持の判断（P25参照） |
| Preload API型            | preload/types.ts | 統一シグネチャへの更新        |

**成果物**: `outputs/phase-2/type-sync-plan.md`

---

### Task 2-4: 移行ステップ設計

**目的**: AS-IS から TO-BE への移行ステップと順序を定義する。

**手順**:

1. チャネル間の依存関係を考慮した移行順序を定義する:

| 移行順序 | 対象チャネル                                            | 理由                               |
| -------- | ------------------------------------------------------- | ---------------------------------- |
| Step 1   | `skill:execute`                                         | 最も利用頻度が高く、影響範囲が広い |
| Step 2   | `skill:remove`                                          | AR-7 制約の直接対象                |
| Step 3   | `skill:list` / `skill:getImported` / `skill:get-detail` | 読み取り系で影響が限定的           |
| Step 4   | `skill:analyze` / `skill:improve` / `skill:optimize` 系 | TASK-9C 系、OperationResult 依存   |
| Step 5   | `skill:abort` / `skill:get-status` / `skill:scan`       | プリミティブ型、影響最小           |

2. 各ステップの変更範囲を明示する:
   - **Main**: ハンドラの return/throw パターン変更
   - **Preload**: `safeInvoke` / `safeInvokeUnwrap` の選択変更
   - **Renderer**: 戻り値解釈パターンの更新
   - **テスト**: 期待値の更新
3. リスク軽減策を評価する:
   - **段階的移行**: 1チャネルずつ変更し、テストで回帰を確認
   - **一括移行**: 全チャネルを一度に変更し、統合テストで検証
   - **ハイブリッド**: Step 単位で移行し、各 Step でテスト実行
4. `outputs/phase-2/migration-plan.md` に出力する

**成果物**: `outputs/phase-2/migration-plan.md`

---

### Task 2-5: インターフェース設計書作成

**目的**: 統合設計書を作成し、Phase 3 のレビュー入力とする。

**手順**:

1. Task 2-1〜2-4 の結果を統合する
2. 以下の全体像を文書化する:
   - **AS-IS**: 現状の契約混在状況（Phase 1 の成果物を引用）
   - **TO-BE**: 方針C適用後の統一契約
   - **移行パス**: AS-IS → TO-BE の段階的移行計画
3. セキュリティ考慮事項を記述する:
   - P42 準拠3段バリデーションの適用確認
   - `validateIpcSender` の適用確認
4. `outputs/phase-2/design-document.md` に出力する

**AS-IS → TO-BE 概念図**:

```
AS-IS:
  Main ─── [ラッパー/直接/例外が混在] ──→ Preload ─── [safeInvoke/Unwrap混在] ──→ Renderer
                                                                                    ↓
                                                                          [解釈パターン混在]

TO-BE:
  Main ─── [プロファイル明示で固定] ──→ Preload ─── [プロファイルに応じた変換] ──→ Renderer
                                                                                    ↓
                                                                          [単一の戻り値解釈]
```

**成果物**: `outputs/phase-2/design-document.md`

---

## SubAgent 分担

| SubAgent   | 担当                                                        |
| ---------- | ----------------------------------------------------------- |
| SubAgent-A | Task 2-1（プロファイル定義）+ Task 2-2（Preload単一化設計） |
| SubAgent-B | Task 2-3（型定義同期設計）+ Task 2-4（移行ステップ設計）    |
| SubAgent-C | Task 2-5（統合設計書作成）— SubAgent-A/B 完了後に実行       |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                                        | 内容                  |
| -------------------------- | ------------------------------------------------------------------------------------------- | --------------------- |
| Skill IPC インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | skill: チャネル型定義 |
| 実装パターン集             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S2/S13/S18パターン    |
| IPC 契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | 契約変更手順          |
| Electron IPC セキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | Preload境界設計       |
| IPC セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 検証パターン          |
| Electron サービス設計      | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | サービス層設計        |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーカテゴリ        |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                                        | P23/P32/P42/P44/P45   |

### タスク固有参照

| 参照資料                 | パス                                                                       | 内容               |
| ------------------------ | -------------------------------------------------------------------------- | ------------------ |
| Phase 1 成果物           | `outputs/phase-1/`                                                         | 契約棚卸し結果     |
| タスク指示書（完了記録） | `docs/30-workflows/completed-tasks/task-skill-ipc-response-consistency.md` | 元タスクの詳細仕様 |

## 統合テスト連携

- 統合ポイント（IPC契約境界）を設計に反映し、Phase 4（テスト作成）で統合テストケースの入力とする
- 各プロファイルの契約スキーマが Phase 4 のテスト設計基準となる
- 移行ステップごとのテスト回帰確認ポイントを設計に含める
- Preload単一化の型シグネチャが型定義テストの入力となる

## 多角的チェック観点

| 観点           | 適用判断              | 仕様参照先                                                   |
| -------------- | --------------------- | ------------------------------------------------------------ |
| セキュリティ   | 必須（AR-3/AR-4）     | `security-skill-ipc.md`, `security-electron-ipc.md`          |
| UI/UX          | 非該当（IPC層タスク） | —                                                            |
| アーキテクチャ | 必須                  | `interfaces-agent-sdk-skill.md`, `arch-electron-services.md` |
| 型安全         | 必須（AR-5/P23/P32）  | `architecture-implementation-patterns.md`                    |
| テスト         | 設計レベルで考慮      | 移行ステップごとのテスト回帰ポイント定義                     |
| 後方互換性     | 必須                  | `skill:execute` 互換性崩れリスク評価                         |

### Electron デスクトップアプリ観点

| 層                         | 適用判断 | 確認内容                                     |
| -------------------------- | -------- | -------------------------------------------- |
| フロントエンド（Renderer） | 必須     | 統一 API シグネチャの設計                    |
| バックエンド（Main）       | 必須     | プロファイルごとの return/throw パターン固定 |
| IPC通信                    | 必須     | 契約プロファイル表の定義                     |
| Preload/セキュリティ       | 必須     | safeInvoke/safeInvokeUnwrap 選択ルールの定義 |
| ローカルストレージ         | 非該当   | —                                            |

## 実行手順

1. SubAgent-A: Phase 1 成果物を入力として、契約プロファイル定義と Preload 単一化設計を作成する
2. SubAgent-B: 型定義の差分確認と移行ステップ設計を作成する
3. SubAgent-C: SubAgent-A/B の成果物を統合し、インターフェース設計書を作成する
4. 全成果物の完了条件を検証する

## 成果物

| 成果物             | パス                                            | 内容                   |
| ------------------ | ----------------------------------------------- | ---------------------- |
| 契約プロファイル表 | `outputs/phase-2/contract-profiles.md`          | プロファイル定義と分類 |
| Preload単一化設計  | `outputs/phase-2/preload-unification-design.md` | Renderer向け統一API    |
| 型定義同期計画     | `outputs/phase-2/type-sync-plan.md`             | shared/preload変更計画 |
| 移行計画           | `outputs/phase-2/migration-plan.md`             | AS-IS→TO-BEステップ    |
| 設計書             | `outputs/phase-2/design-document.md`            | 統合設計書             |

## 完了条件

- [ ] 全14チャネルがプロファイルに分類されている
- [ ] Preload 単一化の API シグネチャが定義されている
- [ ] 型定義の変更計画が P23/P32 準拠で策定されている
- [ ] 移行ステップと順序が定義されている
- [ ] 統合設計書が Phase 3 のレビュー入力として完成している

---

## サブタスク管理

Phase実行開始時に以下のサブタスクを作成して管理する。

1. 参照資料確認（Phase 1 成果物 / 実装パターン集 / IPC 契約チェックリスト / セキュリティ原則）
2. 実行タスク実施（Task 2-1〜2-5 を SubAgent 分担に従い実行）
3. 成果物作成（5つの成果物ファイルを outputs/phase-2/ に出力）
4. 完了条件検証（全5条件のチェック）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（Task 2-1〜2-5）を100%実行完了
- [ ] 各タスクの成果物（5ファイル）が `outputs/phase-2/` に生成されている
- [ ] artifacts.json の Phase 2 ステータスが更新されている
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

[Phase 3（設計レビューゲート）](./phase-3-design-review.md) へ進む。
