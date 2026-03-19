# Phase 10: 最終レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 10                                           |
| Phase名    | 最終レビュー                                 |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | Phase 1〜9                                   |
| 後続Phase  | Phase 11（手動テスト）                       |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 更新日     | 2026-03-17                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

Phase 1〜9 の全成果物を突き合わせ、Workspace Chat Panel の実装が要件・設計・品質基準を満たし、Phase 11（手動テスト）に進む準備が整っていることを多角的に検証する。判定基準は `review-gate-criteria.md` の Phase 10 セクションに準拠する。

## 実行タスク

### T10-1: Phase 1〜9 成果物の通し検証

全 Phase の成果物が矛盾なく接続しているかを検証する。

| Phase | 成果物                                 | 検証ポイント                                           |
| ----- | -------------------------------------- | ------------------------------------------------------ |
| 1     | requirements-definition.md / scope     | 要件と受入基準が Phase 5 の実装で全て充足されているか  |
| 2     | design-summary / contract-matrix / IPC | 設計が Phase 5 の実装と一致しているか                  |
| 3     | design-review-report                   | PASS 判定の根拠が実装で維持されているか                |
| 4     | test-matrix.md                         | テスト計画が Phase 5-6 のテストコードと一致しているか  |
| 5     | implementation-report                  | 実装結果が Phase 2 の設計と乖離していないか            |
| 6     | test-expansion-report                  | テスト拡充がカバレッジ基準を満たしているか             |
| 7     | coverage-report                        | Line 80%+、Branch 60%+、Function 80%+ を満たしているか |
| 8     | refactor-plan                          | リファクタリングが機能変更なしで完了しているか         |
| 9     | qa-checklist                           | 品質ゲート 5 項目が全て合格しているか                  |

### T10-2: レビュー観点の逐次検証

review-gate-criteria.md の Phase 10 レビュー観点に沿い、10 観点を順次検証する。

### T10-3: Phase 9 欠陥パターンの最終確認

Phase 9 T9-3 で整理した 4 件の欠陥パターン（stream/cancel race / conversation ID leak / mention stale / transcript auto-send）が解決済みか、未解決の場合は MINOR として記録する。

## レビュー観点

### FR-01: 機能完全性

- Phase 1 の受入基準が全て満たされているか
- Phase 2 の IPC 契約（llm:stream-chat / cancel / conversation）が実装で正しく配線されているか
- エッジケース（empty input / null model / file read failure / cancel during stream）が処理されているか

### FR-02: コード品質

- Phase 8 のリファクタリング結果が Clean Code 原則に従っているか
- 重複コードがないか（特に error handling と state reset）
- 命名が streaming / context / conversation の prefix で統一されているか

### FR-03: テスト品質

- Phase 7 のカバレッジ基準（Line 80%+、Branch 60%+、Function 80%+）を満たしているか
- 境界値テスト（empty messages / max file size / panel width 360px）が含まれているか
- テスト間で状態が共有されていないか（P9 対策）

### FR-04: セキュリティ

- IPC sender 検証が全チャンネルに適用されているか
- file path traversal 防止が実装されているか
- error message masking で内部パス情報が漏洩しないか
- transcript 共有が hidden parsing / silent summarization を禁止しているか

### FR-05: パフォーマンス

- streaming chunk の表示に明らかなボトルネックがないか
- file context の組立が大量ファイル選択時に遅延しないか
- mention 候補のフィルタリングが大量ファイル時に遅延しないか

### FR-06: ドキュメント整合性

- Phase 2 の IPC 型定義と実装コードの型が一致しているか
- Phase 2 の状態遷移テーブルと実装の状態管理が一致しているか
- コメントと実装の動作が乖離していないか

### FR-07: エラーハンドリング

- Phase 2 T2-5 の error policy（fail-fast / guidance / silent / blocked）が正しく実装されているか
- 全エラーコード（VALIDATION_ERROR / API_KEY_MISSING / MODEL_NOT_FOUND / NETWORK_ERROR）に対応する guidance が実装されているか
- P62 対策（DEFAULT_CONFIG fallback 禁止）が二重防御で実装されているか

### FR-08: UI/UX

- 5 領域構成（panel header / file context chips / message log / composer / guidance block）が Phase 2 設計通りか
- 状態遷移（zero -> ready -> streaming -> cancelled / guidance）が Phase 2 の状態遷移テーブル通りか
- compact 幅（<=360px）のレイアウトが Phase 2 T2-7 の設計通りか
- マイクロコピーが全状態で Phase 2 の定義通りか

### FR-09: データ整合性

- conversation の create -> addMessage 順序が保証されているか
- cancel 時に conversation に不完全なメッセージが保存されないか
- file context の組立と streaming request の引数が一致しているか

### FR-10: Task01 / 親パック整合

- access capability が Task01 の AccessCapabilityResolver を消費しているか（local 判定禁止）
- terminal handoff が親パック ui-ux-realization.md の Terminal 常設ルールに準拠しているか
- transcript 共有が親パックの Transcript -> Chat 手動連携ルールに準拠しているか

## レビューゲート

最終レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` の Phase 10 セクションに従う。

### 判定基準

| 判定     | 条件                                               | 次のアクション                                         |
| -------- | -------------------------------------------------- | ------------------------------------------------------ |
| PASS     | FR-01〜FR-10 全項目で重大な問題がない              | Phase 11（手動テスト）に進む                           |
| MINOR    | 軽微な指摘がある（命名、コメント不備、テスト補足） | 全て未タスク仕様書に変換後 Phase 11 に進む（省略不可） |
| MAJOR    | 重大な問題がある（機能欠落、セキュリティ脆弱性）   | 影響範囲に応じて Phase 1-8 へ戻る                      |
| CRITICAL | 致命的な問題がある（要件自体の見直しが必要）       | Phase 1 へ戻りユーザーと要件を再確認する               |

### 戻り先決定基準

| 問題の種類       | 戻り先                      | 具体例                             |
| ---------------- | --------------------------- | ---------------------------------- |
| 要件の問題       | Phase 1（要件定義）         | 受入基準が不足している             |
| 設計の問題       | Phase 2（設計）             | authority 配置が実装と乖離している |
| テスト設計の問題 | Phase 4（テスト作成）       | テストケースが不足している         |
| 実装の問題       | Phase 5（実装）             | IPC 契約の実装が設計と異なる       |
| カバレッジ未達   | Phase 7（カバレッジ確認）   | カバレッジ基準を満たしていない     |
| コード品質の問題 | Phase 8（リファクタリング） | 責務境界が崩れている               |

### MINOR 判定時のフロー（省略不可）

```
レビューで MINOR 判定
    |
    v
指摘事項を分析（「機能影響なし」でも省略不可）
    |
    v
未タスク指示書を docs/30-workflows/unassigned-task/ に作成
    |
    v
task-workflow.md 残課題テーブルに登録
    |
    v
関連仕様書に参照リンク追加
    |
    v
Phase 11 に進む
```

## 参照資料

### 全 Phase 成果物

| 参照資料       | パス               | 内容                        |
| -------------- | ------------------ | --------------------------- |
| Phase 1 成果物 | `outputs/phase-1/` | 要件・スコープを確認する    |
| Phase 2 成果物 | `outputs/phase-2/` | 設計・IPC 契約を確認する    |
| Phase 3 成果物 | `outputs/phase-3/` | 設計レビュー結果を確認する  |
| Phase 4 成果物 | `outputs/phase-4/` | テスト計画を確認する        |
| Phase 5 成果物 | `outputs/phase-5/` | 実装結果を確認する          |
| Phase 6 成果物 | `outputs/phase-6/` | テスト拡充結果を確認する    |
| Phase 7 成果物 | `outputs/phase-7/` | カバレッジ報告を確認する    |
| Phase 8 成果物 | `outputs/phase-8/` | リファクタ計画を確認する    |
| Phase 9 成果物 | `outputs/phase-9/` | QA チェックリストを確認する |

### ソースコード

| 参照資料                   | パス                                                                                | 内容                                |
| -------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------- |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | 実装結果を確認する                  |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | controller 実装を確認する           |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | IPC handler 実装を確認する          |
| conversation repository    | `apps/desktop/src/main/repositories/conversationRepository.ts`                      | conversation 永続化の実装を確認する |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 照合内容                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | IPC 契約のインデックス（詳細型定義は llm-ipc-types.md を参照）                                                            |
| llm-ipc-types            | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`            | AIChatRequest / LLMProvider 実型定義が実装と整合するか（FR-01 機能完全性・FR-06 ドキュメント整合性の根拠）                |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | stream / cancel 契約が一致するか                                                                                          |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | UI 構成が正本と整合するか                                                                                                 |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | state 管理が正本と矛盾しないか                                                                                            |
| security-electron-ipc    | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | sender 検証 / error masking が正本に準拠しているか（FR-04 セキュリティレビュー根拠）                                      |
| error-handling           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`           | fail-fast / guidance / silent / blocked の 4 分類が正本 category に準拠しているか（FR-07 エラーハンドリングレビュー根拠） |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | guidance 導線（Settings / terminal handoff）が workspace 導線の正本と整合するか（FR-08 UI/UX レビュー根拠）               |

### レビュー基準・親パック正本

| 参照資料             | パス                                                                           | 内容                                                  |
| -------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| review-gate-criteria | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | Phase 10 の判定基準正本                               |
| パック index         | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                   | Task01 契約と Task08 責務を確認する                   |
| UI/UX realization    | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`       | UX-04 screenshot 契約と Terminal 常設ルールを確認する |
| design audit         | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`     | local 判定禁止方針を確認する                          |

## 実行手順

### ステップ1: Phase 1〜9 全成果物の読み込み

`outputs/phase-1/` 〜 `outputs/phase-9/` の全成果物を読み、各 Phase の結果を把握する。

### ステップ2: T10-1 Phase 1〜9 通し検証

9 Phase の成果物を突き合わせ、矛盾・漏れ・乖離を検出する。

### ステップ3: T10-2 レビュー観点の逐次検証

FR-01〜FR-10 の 10 項目を順番に検証する。各項目で発見した指摘を severity（CRITICAL / MAJOR / MINOR）と共に記録する。

### ステップ4: T10-3 Phase 9 欠陥パターンの最終確認

Phase 9 で整理した 4 件の欠陥パターンの解決状態を確認する。

### ステップ5: system spec との最終整合確認

aiworkflow-requirements の正本 5 ファイルと実装を照合する。

### ステップ6: 判定と成果物作成

1. 全指摘を severity 別に集計する
2. CRITICAL が 1 件以上: CRITICAL 判定 -> Phase 1 へ戻る
3. MAJOR が 1 件以上: MAJOR 判定 -> 戻り先を決定
4. MINOR のみ: MINOR 判定 -> 全て未タスク仕様書に変換（省略不可）
5. 指摘 0 件: PASS 判定
6. 判定根拠を `outputs/phase-10/final-review-report.md` に記録する

### ステップ7: 完了条件と次 Phase への handoff 確認

完了条件チェックリストを全項目確認し、Phase 11 への引き渡し情報を記録する。

## 統合テスト連携

| 確認観点     | 検証方法                                                               |
| ------------ | ---------------------------------------------------------------------- |
| 機能完全性   | Phase 1 受入基準と Phase 5 実装の 1:1 対応を検証する                   |
| IPC 契約整合 | Phase 2 型定義と Phase 5 実装の型が一致することを検証する              |
| テスト品質   | Phase 7 カバレッジ基準の充足を検証する                                 |
| 品質ゲート   | Phase 9 の 5 ゲートが全て合格していることを検証する                    |
| Task01 整合  | access capability が Task01 の AccessCapabilityResolver 経由か検証する |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

**本Phase固有の確認観点**:

| 観点               | 確認内容                                                                         |
| ------------------ | -------------------------------------------------------------------------------- |
| 機能完全性         | Phase 1 受入基準が全て実装で充足されているか                                     |
| コード品質         | Phase 8 リファクタリング後のコードが Clean Code 原則に従っているか               |
| テスト品質         | カバレッジ基準（Line 80%+ / Branch 60%+ / Function 80%+）を満たしているか        |
| セキュリティ       | sender 検証 / path traversal / error masking / transcript auto-send 禁止が実装か |
| UI/UX              | 5 領域 / 状態遷移 / CTA 条件 / compact 幅 / マイクロコピーが設計通りか           |
| エラーハンドリング | fail-fast / guidance / silent / blocked の 4 分類が全エラーで正しく機能するか    |
| P62 対策           | DEFAULT_CONFIG fallback 禁止が二重防御で実装されているか                         |
| Task01 整合        | local 判定禁止 / access matrix 消費が実装されているか                            |

## 成果物

| 成果物           | パス                                      | 内容                                                           |
| ---------------- | ----------------------------------------- | -------------------------------------------------------------- |
| 最終レビュー報告 | `outputs/phase-10/final-review-report.md` | 判定結果、全指摘の severity と詳細、system spec 整合結果を記録 |

## 完了条件

- [ ] T10-1: Phase 1〜9 の成果物が矛盾なく接続していることが確認されている
- [ ] T10-2: FR-01〜FR-10 の全 10 項目に判定根拠が記録されている
- [ ] T10-3: Phase 9 の欠陥パターン 4 件の解決状態が確認されている
- [ ] CRITICAL / MAJOR 指摘が 0 件である
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換されている（P3 準拠: 3 ステップ完了、省略不可）
- [ ] Task01 の access matrix 契約との矛盾がない
- [ ] 親パック正本（ui-ux-realization.md / design-audit-matrix.md）との整合が確認されている
- [ ] system spec 5 ファイルとの最終整合確認が記録されている
- [ ] レビューゲート判定結果（PASS / MINOR / MAJOR / CRITICAL）が成果物に記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

| サブタスクID | 内容                        | 依存先           | ステータス  |
| ------------ | --------------------------- | ---------------- | ----------- |
| ST-10-1      | Phase 1〜9 成果物の読み込み | なし             | not_started |
| ST-10-2      | T10-1 通し検証              | ST-10-1          | not_started |
| ST-10-3      | T10-2 レビュー観点検証      | ST-10-1          | not_started |
| ST-10-4      | T10-3 欠陥パターン最終確認  | ST-10-1          | not_started |
| ST-10-5      | system spec 最終整合確認    | ST-10-3          | not_started |
| ST-10-6      | 判定・成果物作成            | ST-10-2〜ST-10-5 | not_started |
| ST-10-7      | 完了条件確認・handoff 記録  | ST-10-6          | not_started |

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

```bash
# 1. 成果物ファイルの存在確認
ls -la outputs/phase-10/final-review-report.md

# 2. 判定結果の記録確認
grep -c "PASS\|MINOR\|MAJOR\|CRITICAL" outputs/phase-10/final-review-report.md

# 3. レビュー観点の網羅確認（FR-01〜FR-10 の 10 項目）
grep -c "FR-[01][0-9]" outputs/phase-10/final-review-report.md

# 4. Phase 1〜9 通し検証の記録確認
grep -c "Phase [1-9]" outputs/phase-10/final-review-report.md

# 5. system spec 整合確認の記録確認
grep -c "interfaces-llm\|llm-streaming\|ui-ux-feature\|arch-state\|security-electron" outputs/phase-10/final-review-report.md

# 6. MINOR 指摘の未タスク変換確認（MINOR 判定の場合のみ）
ls -la docs/30-workflows/unassigned-task/

# 7. 品質ゲート最終確認
cd apps/desktop && pnpm lint 2>&1 | tail -3
cd apps/desktop && pnpm typecheck 2>&1 | tail -3
cd apps/desktop && pnpm vitest run 2>&1 | tail -5
```

## 次のPhase

- [Phase 11（手動テスト）](./phase-11-manual-test.md) に進む
- Phase 11 へ引き渡す情報: 最終レビュー報告（判定結果、全指摘リスト、未タスク仕様書一覧、system spec 整合結果）
