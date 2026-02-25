# タスク実行仕様書生成ガイド

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 概要

本ドキュメントは、複雑なタスクを単一責務の原則に基づいて分解し、各サブタスクに最適なスラッシュコマンド・エージェント・スキルの組み合わせを選定するためのガイドラインを定義する。

### 目的

ユーザーから与えられた複雑なタスクを分解し、以下を実現する：

- 単一責務の原則に基づいたサブタスク分割
- 各サブタスクに最適なコマンド・エージェント・スキルの選定
- そのまま実行可能な仕様書ドキュメントの生成
- TDDサイクル（Red→Green→Refactor）の組み込み
- 品質ゲートの明確化

### 成果物配置

生成された仕様書は以下のパス形式で配置する。

| 要素       | 説明                               | 例                                                        |
| ---------- | ---------------------------------- | --------------------------------------------------------- |
| ベースパス | `docs/30-workflows/`               | 固定                                                      |
| 機能名     | 実装対象の機能を表すディレクトリ名 | `skill-import-agent/`                                     |
| ファイル名 | `task-step{N}-{機能名}.md` 形式    | `task-step1-init.md`                                      |
| 完全パス例 | 上記を組み合わせた配置先           | `docs/30-workflows/skill-import-agent/task-step1-init.md` |

---

## ドキュメント構成

| ドキュメント     | ファイル                                             | 説明                                           |
| ---------------- | ---------------------------------------------------- | ---------------------------------------------- |
| フェーズ定義     | [task-workflow-phases.md](./task-workflow-phases.md) | Phase 0〜6の詳細定義とテンプレート             |
| ルール・選定基準 | [task-workflow-rules.md](./task-workflow-rules.md)   | 品質ゲート、コマンド・エージェント・スキル選定 |

---

## フェーズ構造（概要）

すべてのタスクは以下のフェーズ構造に従う。詳細は [task-workflow-phases.md](./task-workflow-phases.md) を参照。

| フェーズ                                  | ID接頭辞 | 目的                                         |
| ----------------------------------------- | -------- | -------------------------------------------- |
| Phase 0: 要件定義                         | `T-00`   | タスクの目的、スコープ、受け入れ基準を明文化 |
| Phase 1: 設計                             | `T-01`   | 要件を実現可能な構造に落とし込む             |
| Phase 2: テスト作成 (TDD: Red)            | `T-02`   | 期待される動作を検証するテストを先行作成     |
| Phase 3: 実装 (TDD: Green)                | `T-03`   | テストを通すための最小限の実装               |
| Phase 4: リファクタリング (TDD: Refactor) | `T-04`   | 動作を変えずにコード品質を改善               |
| Phase 5: 品質保証                         | `T-05`   | 定義された品質基準をすべて満たすことを検証   |
| Phase 6: ドキュメント更新                 | `T-06`   | 実装内容をシステム要件ドキュメントに反映     |

### フェーズ遷移図

以下の表はフェーズ間の遷移関係を示す。通常は上から順に進行し、Phase 5で品質ゲートを通過しない場合はPhase 4に戻る。

| 遷移元                    | 遷移先                    | 条件                 |
| ------------------------- | ------------------------- | -------------------- |
| Phase 0: 要件定義         | Phase 1: 設計             | 要件定義完了         |
| Phase 1: 設計             | Phase 2: テスト作成       | 設計完了             |
| Phase 2: テスト作成       | Phase 3: 実装             | テスト作成完了       |
| Phase 3: 実装             | Phase 4: リファクタリング | 実装完了             |
| Phase 4: リファクタリング | Phase 5: 品質保証         | リファクタリング完了 |
| Phase 5: 品質保証         | Phase 6: ドキュメント更新 | 品質ゲート通過       |
| Phase 5: 品質保証         | Phase 4: リファクタリング | 品質ゲート未通過     |
| Phase 6: ドキュメント更新 | 完了                      | ドキュメント更新完了 |

---

## 品質ゲート（概要）

次フェーズに進む前に満たすべき品質基準。詳細は [task-workflow-rules.md](./task-workflow-rules.md) を参照。

- 機能検証: 全テスト成功（ユニット、統合、E2E）
- コード品質: Lintエラーなし、型エラーなし、フォーマット適用済み
- テスト網羅性: カバレッジ基準達成（60%以上）
- セキュリティ: 脆弱性スキャン完了、重大な脆弱性なし

---

## 出力テンプレート

### ファイル配置

タスク実行仕様書は `docs/30-workflows/{機能名}/task-step{N}-{機能名}.md` の形式で配置する。詳細は「成果物配置」セクションの表を参照。

### テンプレート構造

タスク実行仕様書は以下の構造を持つ：

1. **ユーザーからの元の指示** - 元の指示文をそのまま記載
2. **タスク概要** - 目的、背景、最終ゴール、成果物一覧
3. **参照ファイル** - コマンド・エージェント・スキル選定の参照先
4. **タスク分解サマリー** - 全サブタスクの一覧表
5. **実行フロー図** - Mermaidによるフロー可視化
6. **各フェーズの詳細** - Phase 0〜5の各サブタスク詳細
7. **品質ゲートチェックリスト** - 完了条件のチェック項目
8. **リスクと対策** - リスク分析と対応方針
9. **前提条件** - タスク実行の前提
10. **備考** - 技術的制約、参考資料

---

## 実行時のコマンド・エージェント・スキル

### 本ドキュメント作成に使用するコマンド

| コマンド       | 用途                                                            |
| -------------- | --------------------------------------------------------------- |
| `/sc:workflow` | PRDと機能要件から構造化された実装ワークフローを生成             |
| `/sc:document` | コンポーネント、関数、API、機能の重点的文書生成                 |
| `/sc:design`   | システムアーキテクチャ、API、コンポーネントインターフェース設計 |

### 本ドキュメント作成に使用するエージェント

| エージェント           | 用途                                                   |
| ---------------------- | ------------------------------------------------------ |
| `technical-writer`     | 使いやすさとアクセシビリティに重点を置いた技術文書作成 |
| `requirements-analyst` | 曖昧なプロジェクトアイデアを具体的な仕様に変換         |
| `system-architect`     | スケーラブルシステムアーキテクチャ設計                 |

### 本ドキュメント作成に使用するスキル

タスク実行仕様書の生成には、プロジェクト固有のスキル定義（`.claude/skills/skill_list.md`）を参照する。

---

## 完了タスク

### タスク: UT-IPC-DATA-FLOW-TYPE-GAPS-001 バックエンド型定義とUI Props間のデータフロー型ギャップ解消（2026-02-24完了）

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| タスクID     | UT-IPC-DATA-FLOW-TYPE-GAPS-001                                   |
| 完了日       | 2026-02-24                                                       |
| ステータス   | **完了**                                                         |
| タスク種別   | 仕様書修正のみ（`spec_created`）                                 |
| Phase        | Phase 1-12 完了                                                  |
| コード変更   | なし（仕様書修正のみ）                                           |

#### テスト結果サマリー

| 指標                       | 結果                 |
| -------------------------- | -------------------- |
| Phase 6 整合性検証         | 24/24 PASS           |
| Phase 7 網羅性確認         | 49/49 PASS (100%)    |
| Phase 8 品質改善           | 6/6 PASS             |
| Phase 9 品質保証           | 60/60 PASS           |
| Phase 10 最終レビュー      | PASS（MINOR 1件付き）|
| Phase 11 手動検証          | 9/9 PASS             |
| 累計検証項目               | 173項目 ALL PASS     |

#### 成果物

| 成果物               | パス/内容                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/`                                                        |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/implementation-guide.md`                |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/spec-update-summary.md`                 |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/documentation-changelog.md`             |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/unassigned-task-report.md`              |
| スキルフィードバック | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-12/skill-feedback-report.md`               |

#### 変更理由

バックエンド型定義（task-9 系仕様書）とフロントエンド UI Props（task-030, task-031b）間に6つの型ギャップが存在し、後続実装者が型不整合に直面するリスクがあった。7つの仕様書ファイルを修正し、IPC境界でのDate型シリアライズ方針統一、DebugSession.status idle追加、onExport引数明確化、ExportResult変換ロジック、safeOn購読パターン、IPC引数オブジェクト形式統一を実施。

#### 苦戦箇所と解決策

| 苦戦ポイント | 問題 | 解決策 |
| --- | --- | --- |
| Phase 12成果物の不足 | `spec-update-summary.md` 未作成のまま完了扱いになりやすい | 成果物表と `outputs/phase-12/` 実体を1対1で突合し、不足ファイルは即時作成 |
| `artifacts.json` 二重管理 | `artifacts.json` と `outputs/artifacts.json` が非同期化しやすい | 2ファイルを同一内容へ同期し、completed成果物の実在チェックを実行 |
| 未タスク指示書テンプレートの揺れ | 旧見出し形式（`## 1. メタ情報`）が残り監査で違反化 | Why/What/How必須見出しを含む最新テンプレートへ正規化 |

#### 同種課題の簡潔解決手順（4ステップ）

1. `phase-12-documentation.md` の成果物一覧と `outputs/phase-12/` 実体を突合する
2. `artifacts.json` と `outputs/artifacts.json` を同時更新し、completed成果物の参照切れをゼロ化する
3. `generate-index.js` 実行結果を `documentation-changelog.md` に記録する
4. 未タスク指示書は `audit-unassigned-tasks.js` 単体監査で必須見出しを確認してから完了扱いにする

---

### タスク: UT-SKILL-IPC-PRELOAD-EXTENSION-001 task-9D-J 30チャネル IPC/Preload 拡張計画の策定（2026-02-25反映）

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスクID   | UT-SKILL-IPC-PRELOAD-EXTENSION-001                                  |
| 完了日     | 2026-02-25                                                           |
| ステータス | **完了（仕様書作成）**                                               |
| タスク種別 | 仕様書修正のみ（`spec_created`）                                     |
| Phase      | Phase 1-12 完了（Phase 13は未実施）                                 |
| コード変更 | なし（`docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/` のみ） |

#### 成果物

| 成果物               | パス/内容                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/`                                                           |
| 要件/設計/品質成果物 | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/phase-1` 〜 `phase-12`                            |
| 検証レポート         | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/verification-report.md`                            |
| 追補監査レポート     | `docs/30-workflows/completed-tasks/ut-skill-ipc-preload-extension-001/outputs/phase-12/recheck-multithinking-audit.md`          |
| 未タスク指示書       | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-ipc-preload-extension-spec-alignment-001.md`                         |

#### 変更理由

- task-9D〜9Jで必要な30チャネル（handle 29 / on 1）の仕様計画を実装前に固定し、P32/P44/P45の契約ドリフトを予防するため。
- 仕様監査で検出した差分（`main/ipc/channels.ts` 記述残存、命名差分、参照切れ）を未タスクとして分離し、後続実装の手戻りを抑制するため。

---

### タスク: UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 task-9D〜9J仕様差分の統合是正（2026-02-25完了）

| 項目       | 内容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001                                                         |
| 完了日     | 2026-02-25                                                                                                |
| ステータス | **完了（仕様書修正）**                                                                                    |
| タスク種別 | 仕様書修正のみ（`spec_created`）                                                                          |
| Phase      | Phase 1-12 相当（実装コード変更なし）                                                                     |
| コード変更 | なし（`docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/` のみ） |

#### 成果物

| 成果物 | パス/内容 |
| --- | --- |
| 修正仕様書（task-9系） | `task-022-task-9f-skill-share.md`, `task-023a-task-9g-skill-schedule.md`, `task-023b-task-9h-skill-debug.md`, `task-023c-task-9i-skill-docs.md`, `task-023d-task-9j-skill-analytics.md`, `task-023e-task-9d-skill-chain.md`, `task-023f-task-9e-skill-fork.md` |
| 付随修正 | `task-003-execution-plan.md` の `skill-api.ts` 参照統一 |
| 完了記録 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-013-ut-imp-ipc-preload-extension-spec-alignment-001.md` |

#### 実装内容（仕様更新）

- 7仕様書の `artifacts.modifies` を現行正本に統一（`preload/channels.ts`, `preload/skill-api.ts`, `preload/types.ts`, `packages/shared/src/types/skill/index.ts`）。
- 各 task に `packages/shared/src/types/skill/<domain>.ts`（`chain/fork/share/schedule/debug/docs/analytics`）を `artifacts.creates` として明記。
- 旧参照 `preload/skillAPI.ts` / `main/ipc/channels.ts` / `packages/shared/src/types/skillXxx.ts` を排除。
- task-9I の `GeneratedDoc.generatedAt` を IPC境界方針に合わせ `Date` → ISO 8601 `string` へ統一。

#### 苦戦箇所と解決策

| 苦戦ポイント | 問題 | 解決策 |
| --- | --- | --- |
| 旧パス混在 | `skillAPI.ts` と `skill-api.ts` が混在し、参照の正本が曖昧化 | 監査条件を固定し、旧パスを0件化してから反映 |
| artifacts 欠落 | taskごとに `modifies/creates` の必須項目が不一致 | 7タスク共通の必須4項目 + task別domain型を先に固定 |
| 型方針ドリフト | task-9I だけ Date型記述が残り IPC方針と衝突 | Dateシリアライズ方針を追記し、型をISO 8601文字列へ統一 |

#### 同種課題の簡潔解決手順（5ステップ）

1. 監査対象を task-9D〜9J に限定してノイズを分離する。  
2. `oldPaths`（参照差分）と `missingArtifacts`（台帳差分）を分けて検出する。  
3. 参照差分を一括修正し、次に artifacts を task単位で補完する。  
4. Date型が残る仕様書は IPC境界方針（ISO 8601 string）へ揃える。  
5. 完了記録・残課題状態・教訓記録を同一コミット相当で同期する。  

---

### タスク: UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 skill:import IPCチャネル名競合の予防的解消（2026-02-24完了）

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| タスクID     | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001                             |
| 完了日       | 2026-02-24                                                       |
| ステータス   | **完了**                                                         |
| タスク種別   | 仕様書修正のみ（`spec_created`）                                 |
| Phase        | Phase 1-13 完了                                                  |
| コード変更   | なし（仕様書修正のみ）                                           |

#### 成果物

| 成果物               | パス/内容                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/`                                                 |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/implementation-guide.md`        |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/documentation-changelog.md`     |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-skill-import-channel-conflict-001/outputs/phase-12/unassigned-task-detection.md`   |

#### 変更理由

- `skill:import` をローカルインポート専用のまま維持し、外部インポート用を `skill:importFromSource` に分離してIPCチャネル名競合を予防
- TASK-9F/TASK-UI-05 仕様書のチャネル表記を統一し、実装前に契約ドリフトを除去
- 仕様書修正のみタスクとして `spec_created` で完了管理し、Phase 10/11 で追加未タスク 0 件を確認

---

### タスク: TASK-UI-00-ATOMS Atoms共通コンポーネント実装（2026-02-23完了）

| 項目       | 内容                                                             |
| ---------- | ---------------------------------------------------------------- |
| タスクID   | TASK-UI-00-ATOMS                                                 |
| 完了日     | 2026-02-23                                                       |
| ステータス | **完了**                                                         |
| Phase      | Phase 1-13 完了                                                  |
| テスト数   | 156（コンポーネント実装対象テスト、全PASS）                      |
| 変更範囲   | Atoms新規5件 + 既存2件拡張                                       |

#### 成果物

| 成果物               | パス/内容                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/task-ui-00-atoms/`                                             |
| 実装ガイド           | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/task-ui-00-atoms/outputs/phase-12/unassigned-task-detection.md` |

#### 変更理由

- Atoms層の基盤部品（StatusIndicator/FilterChip/SkeletonCard/SuggestionBubble/RelativeTime）を新規実装し、Badge/EmptyStateを拡張
- Apple HIG/WCAGとデザイントークン運用を仕様化し、テーマ横断・a11y検証を実施
- Phase 10 MINOR 3件を未タスク化して `docs/30-workflows/unassigned-task/` に配置し、`task-workflow.md` 残課題テーブルへ登録

---

### タスク: UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 SkillImportDialog skill.id→skill.name修正（2026-02-22完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001        |
| 完了日     | 2026-02-22                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了                              |
| テスト数   | 49（SkillImportDialog）+ 3（AgentView統合）、全PASS |

#### 成果物

| 成果物               | パス/内容                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/`                                                  |
| 実装ガイド           | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/outputs/phase-12/implementation-guide.md`          |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/outputs/phase-12/documentation-changelog.md`       |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/outputs/phase-12/unassigned-task-report.md`        |

#### 変更理由

- SkillImportDialogがskill.id（SHA-256ハッシュプレフィックス）をonImportに渡していたが、IPCハンドラ（skill:import）はskill.name（人間可読名）を期待していたため100%インポート失敗
- Renderer層のみの変更（SkillImportDialog + AgentView + テスト）。IPC/Preload/Main/Storeに変更なし
- P44パターンのRenderer側バリエーションとして解決

---

### タスク: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 skill:import 戻り値型不整合修正（2026-02-21完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001         |
| 完了日     | 2026-02-21                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了                              |
| テスト数   | 115（全PASS）+ 59（agentSlice integration、全PASS） |
| カバレッジ | Branch 84.9%（修正対象skill:importハンドラ全10分岐100%カバー） |

#### 成果物

| 成果物               | パス/内容                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/ut-fix-skill-import-return-type-001/`                                           |
| 実装ガイド           | `docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-12/implementation-guide.md`   |
| ドキュメント更新履歴 | `docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-12/documentation-changelog.md`|
| 未タスク検出レポート | `docs/30-workflows/ut-fix-skill-import-return-type-001/outputs/phase-12/unassigned-task-report.md` |

#### 変更理由

- skill:import IPCハンドラが `ImportResult` 型を返していたが、Preload/Renderer側は `ImportedSkill` 型を期待していた（P44パターン）
- 2ステップ変換パターン（importSkills → getSkillByName）で `ImportedSkill` を返すように修正
- P42準拠の3段バリデーション（型チェック → 空文字列 → trim空文字列）を追加
- 引数形式を `{ skillIds: string[] }` → `skillName: string` に統一（P44/P45解決）

### タスク: UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 skill:ハンドラIPCレスポンス形式統一（2026-02-25完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001  |
| 完了日     | 2026-02-25                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了（Phase 13未実施）            |
| テスト数   | 394（Preload 133 + Main 145 + Renderer 116、全PASS） |

#### 成果物

| 成果物               | パス/内容                                                                                                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/`                                            |
| 実装ガイド           | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/implementation-guide.md`   |
| 仕様更新サマリー     | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/spec-update-summary.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/unassigned-task-report.md`  |
| スキルフィードバック | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/outputs/phase-12/skill-feedback-report.md`   |

#### 変更理由

- `skill:execute` の Main 応答が `{ success, data }` ラッパー形式であるのに対し、Preload 側が直接型前提で解釈される箇所を是正した
- `skill:remove` の戻り値契約を `Promise<void>` から `Promise<RemoveResult>` に統一し、Main/Preload/仕様書のドリフトを解消した
- Phase 12 再監査で未タスクリンク参照切れと成果物不足（`spec-update-summary.md` 未出力）を是正した

#### 実装時の苦戦箇所と解決策

| 苦戦箇所 | 課題 | 解決策 |
| --- | --- | --- |
| `safeInvoke` / `safeInvokeUnwrap` の使い分け | `execute` が wrapper 応答、`remove` が直接応答で、Preload側の選択を誤ると実行時に契約崩壊する | Main 応答形式を先に固定し、`execute=unwrap` / `remove=direct` を明文化してテストを更新 |
| Phase 12 実装ガイド要件の不足 | Part 1 の日常例え・Part 2 の型/API/エッジケース記載が薄いと、task-spec要件未達になりやすい | `implementation-guide.md` を再構成し、Part 1 に例え話、Part 2 に型定義/APIシグネチャ/エッジケースを追加 |
| 未タスク監査結果の誤読 | repository 全体監査結果（既存負債）を今回差分の失敗と混同しやすい | ベースラインと今回差分を分離して報告し、今回対象の未タスク2件は個別に配置/フォーマットを確認 |

#### 同種課題の簡潔解決手順（4ステップ）

1. Main の実応答形式を一覧化し、Preload の `safeInvoke` / `safeInvokeUnwrap` を1対1で対応付ける。
2. Part 1/Part 2 要件で `implementation-guide.md` を作成し、日常例え・型/API・エッジケースを必ず記載する。
3. `verify-unassigned-links.js` と `validate-phase-output.js` を実行し、Phase 12 の参照と成果物を機械検証する。
4. `task-workflow.md` と関連仕様書へ「苦戦箇所 + 解決手順」を同時反映し、再発防止知見を残す。

### タスク: TASK-9A-B スキルファイル操作IPCハンドラー実装（2026-02-19完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-9A-B                                   |
| 完了日     | 2026-02-19                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了                              |
| テスト数   | 65（全PASS）                                |
| カバレッジ | Line 91.14% / Branch 93.93% / Function 100% |

#### 成果物

| 成果物               | パス/内容                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/`                                            |
| 実装ガイド           | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴 | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート | `docs/30-workflows/TASK-9A-B-ipc-file-handlers/outputs/phase-12/unassigned-task-report.md`  |

#### 変更理由

- SkillFileManagerのファイル操作をIPC経由でRendererから呼び出し可能にするため、6チャンネルを追加（skill:readFile, skill:writeFile, skill:createFile, skill:deleteFile, skill:listBackups, skill:restoreBackup）
- validateIpcSender + 引数バリデーション + isKnownSkillFileErrorエラーサニタイズによる多層防御を実装
- registerSkillFileHandlers / unregisterSkillFileHandlers によるハンドラ登録/解除パターンを実装

---

### タスク: TASK-FIX-10-1-VITEST-ERROR-HANDLING dangerouslyIgnoreUnhandledErrors設定の解消（2026-02-19完了）

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| タスクID   | TASK-FIX-10-1-VITEST-ERROR-HANDLING              |
| 完了日     | 2026-02-19                                       |
| ステータス | **完了**                                         |
| Phase      | Phase 1-12完了（Phase 13未実施）                 |
| テスト数   | 新規13件 + 回帰10,189件PASS                      |
| 変更規模   | `vitest.config.ts` 1件修正 + テスト2ファイル新規 |

#### 成果物

| 成果物                 | パス/内容                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| ワークフロー一式       | `docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/`                                                     |
| 実装ガイド             | `docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/outputs/phase-12/implementation-guide.md`             |
| 更新履歴               | `docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/outputs/phase-12/documentation-changelog.md`          |
| 未タスク検出           | `docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/outputs/phase-12/unassigned-task-detection.md`        |
| 元タスク指示書（移管） | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/07-task-fix-10-1-vitest-error-handling.md` |

#### 変更理由

- `dangerouslyIgnoreUnhandledErrors: true` による未処理 Promise 拒否の隠蔽を解消し、テスト結果の信頼性を回復
- `@repo/shared` サブパス解決を安定化するため、Vitest alias を18件追加
- 未処理 Promise 拒否の検知退行を防ぐため、設定検証5件 + 非同期エラーハンドリング8件の回帰テストを追加

#### 関連仕様書更新

| 仕様書                  | 更新内容                                                       |
| ----------------------- | -------------------------------------------------------------- |
| quality-requirements.md | 未処理Promise拒否を無視しない運用ルール、alias管理ルールを追加 |
| task-workflow.md        | 本完了タスク記録と未タスク1件を追加                            |

#### 苦戦箇所と解決策

| 苦戦ポイント     | 問題                                                                    | 解決策                                                                                                    |
| ---------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Step 2の要否判定 | 「設定削除のみなので仕様更新不要」と誤判定しやすかった                  | テスト戦略変更（未処理Promise拒否検知ルールの変更）を仕様変更として扱い、`quality-requirements.md` を更新 |
| 未タスク検出範囲 | 変更コードだけを根拠にすると、Phase成果物に記録された将来課題を見落とす | Phase成果物（`outputs/phase-*`）を含めて再監査し、`task-imp-vitest-alias-sync-automation-001` を正式登録  |
| 参照整合の担保   | 未タスク登録後に参照パス不整合が残ると追跡性が落ちる                    | `verify-unassigned-links.js` でリンク整合を検証し、missing 0件を完了条件に含める                          |

---

### タスク: TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 `@repo/shared` モジュール解決エラー修正（2026-02-20完了）

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスクID   | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001                             |
| 完了日     | 2026-02-20                                                           |
| ステータス | **完了**                                                             |
| Phase      | Phase 1-12完了（Phase 13未実施）                                     |
| 変更規模   | +353行（17ファイル）: `tsconfig.json`/`vitest.config.ts`/`package.json` + 回帰テスト3ファイル |
| テスト数   | 224テスト（3スイート: module-resolution 57件 + shared-module-resolution 59件 + vitest-alias-consistency 108件） |
| エラー削減 | typecheck 228エラー → 0エラー                                        |

#### 品質ゲート達成状況

| ゲート項目     | 結果           | 詳細                                          |
| -------------- | -------------- | --------------------------------------------- |
| typecheck      | ✅ PASS        | 228エラー → 0エラー（全サブパス解決）         |
| vitest         | ✅ 224/224 PASS | 3テストスイート全件成功                       |
| shared build   | ✅ 成功        | `pnpm --filter @repo/shared build` 正常完了   |
| lint           | ✅ PASS        | ESLintエラー0件                               |

#### 変更ファイル詳細

| 変更対象 | 変更内容 |
| --- | --- |
| `apps/desktop/tsconfig.json` | +27 paths（`@repo/shared/*` サブパス型解決） |
| `packages/shared/package.json` | +26 typesVersions（TypeScript 4.x/5.x 後方互換） |
| `apps/desktop/vitest.config.ts` | +3 alias（`@repo/shared/agent/*` 系テスト解決） |

#### 成果物

| 成果物                 | パス/内容                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| ワークフロー一式       | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/`                                             |
| 実装ガイド             | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/implementation-guide.md`     |
| ドキュメント更新履歴   | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/documentation-changelog.md`  |
| 未タスク検出レポート   | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/unassigned-task-report.md`   |
| システム仕様更新ログ   | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/system-docs-update-log.md`   |
| スキルフィードバック   | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/skill-feedback-report.md`    |

#### 変更理由

- `@repo/shared` サブパスの型解決エラーを解消するため、`exports`/`paths`/`alias` の整合を再構築
- `apps/desktop` の source 参照時に補助型宣言を取り込むよう `tsconfig` `include` を補強
- 回帰防止として、`shared-module-resolution` / `vitest-alias-consistency` / `module-resolution` の3テストを追加

#### 関連仕様書更新

| 仕様書 | 更新内容 |
| ------ | -------- |
| architecture-monorepo.md | 三層整合（`exports`/`paths`/`alias`）運用ルール追加 |
| quality-requirements.md | サブパス三層整合の品質ゲート追加 |
| development-guidelines.md | サブパス追加時の同期手順追加 |
| lessons-learned.md | 本タスクの苦戦箇所と再発防止策追加 |

---

### タスク: UT-FIX-IPC-RESPONSE-UNWRAP-001 IPC レスポンスラッパー未展開修正（2026-02-14完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-IPC-RESPONSE-UNWRAP-001              |
| 完了日     | 2026-02-14                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了（Phase 13未実施）            |
| テスト数   | 25（新規）+ 既存回帰テストPASS              |
| カバレッジ | Line 92.64% / Branch 91.66% / Function 100% |

#### 成果物

| 成果物                 | パス/内容                                                                                           |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| ワークフロー一式       | `docs/30-workflows/completed-tasks/ipc-response-unwrap/`                                            |
| 実装ガイド             | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/implementation-guide.md`    |
| ドキュメント更新履歴   | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/documentation-changelog.md` |
| 未タスク検出レポート   | `docs/30-workflows/completed-tasks/ipc-response-unwrap/outputs/phase-12/unassigned-task-report.md`  |
| 元タスク指示書（移管） | `docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md`                          |

#### 変更理由

- `skill-api.ts` の `list/getImported/rescan` が `{ success, data }` ラッパーをそのまま返していたため、Renderer で配列前提処理（`forEach`）がクラッシュしていた
- `safeInvokeUnwrap<T>` を導入し、Preload 層でラッパー展開して `T` を直接返す形へ統一
- `import()` はハンドラが直接値返却のため `safeInvoke` 維持とし、ハンドラ仕様に合わせて使い分けを明確化

#### 苦戦箇所と解決策

| 苦戦ポイント             | 問題                                                        | 解決策                                                                             |
| ------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 仕様書参照の誤リンク     | `api-ipc-skill.md` 参照が残り、正本を辿れなかった           | `interfaces-agent-sdk-skill.md` を正本参照に統一し、topic-map再生成で索引を同期    |
| Phase 10 MINORの扱い     | M-1/M-2 を「未タスク化不要」と誤判定しやすかった            | 未タスク2件（UT-FIX-IPC-RESPONSE-UNWRAP-002/003）を正式起票し、task-workflowへ登録 |
| 完了移管時のリンク不整合 | 元タスク指示書を移動後に `unassigned-task` 参照が残るリスク | 参照先を `completed-tasks` 側へ更新し、未タスクリンク検証を実施                    |

---

### タスク: TASK-FIX-14-1-CONSOLE-LOG-MIGRATION Skill系Main Processログのelectron-log移行（2026-02-14完了）

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| タスクID   | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION           |
| 完了日     | 2026-02-14                                    |
| ステータス | **完了**                                      |
| Phase      | Phase 1-12完了（Phase 13は未実施）            |
| テスト数   | 920（既存回帰を含む）                         |
| 変更規模   | 本番コード4ファイル・27箇所、テスト10ファイル |

#### 成果物

| 成果物           | パス/内容                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| ワークフロー一式 | `docs/30-workflows/task-fix-14-1-console-log-migration/`                                                      |
| 元タスク指示書   | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/06c-task-fix-14-1-console-log-migration.md` |
| 未タスク検出     | `docs/30-workflows/task-fix-14-1-console-log-migration/outputs/phase-12/unassigned-task-detection.md`         |

#### 変更理由

- Skill系サービスの本番ログ方式を `electron-log` に統一し、レベル制御とファイル永続化を担保
- `SkillImportManager` の `if (this.debug)` / `NODE_ENV !== "test"` 依存を除去してログ制御を一元化
- Phase 12で残存箇所（`SkillExecutor.ts`）を未タスク `TASK-FIX-14-2` として分離管理

---

### タスク: TASK-FIX-11-1-SDK-TEST-ENABLEMENT SDK統合テスト有効化（2026-02-13完了）

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-FIX-11-1-SDK-TEST-ENABLEMENT            |
| 完了日     | 2026-02-13                                   |
| ステータス | **完了**                                     |
| Phase      | Phase 1-12完了                               |
| テスト数   | TODO有効化17件（3ファイル）+ 回帰テストPASS  |
| カバレッジ | テストケース有効化タスクのため該当範囲でPASS |

#### 成果物

| 成果物               | パス/内容                                                                             |
| -------------------- | ------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/sdk-test-enablement/`                                              |
| 実装ガイド           | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/implementation-guide.md`      |
| 更新履歴             | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `docs/30-workflows/sdk-test-enablement/outputs/phase-12/unassigned-task-detection.md` |

#### 変更理由

- SDK統合時に残存したTODOプレースホルダーを実テスト化し、主要エラーケースの自動検証を有効化
- テスト間モック汚染（P9）を防ぐため、`beforeEach` でデフォルトモック再設定を導入
- 30秒タイムアウト検証を Fake Timers + `Promise.all` で決定論的に統一

#### 関連仕様書更新

| 仕様書                           | 更新内容                                                 |
| -------------------------------- | -------------------------------------------------------- |
| interfaces-agent-sdk-executor.md | 完了タスク追加、SDKテスト有効化パターンを追記            |
| testing-component-patterns.md    | Main Process SDKテスト有効化パターン（Section 10）を追加 |
| task-workflow.md                 | 本完了タスクと変更履歴を追加                             |

---

### タスク: TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION deprecatedプロパティ正式移行（2026-02-13完了）

| 項目       | 内容                  |
| ---------- | --------------------- |
| タスクID   | TASK-FIX-13-1         |
| 完了日     | 2026-02-13            |
| ステータス | **完了**              |
| Phase      | Phase 1-12完了        |
| テスト数   | 1（型定義回帰テスト） |

#### 成果物

| 成果物       | パス/内容                                                                                                             |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| 型定義更新   | `packages/shared/src/types/skill.ts`（`Anchor.name` / `Skill.lastUpdated` 削除）                                      |
| 型回帰テスト | `packages/shared/src/types/__tests__/skill-deprecated-removal.test.ts`                                                |
| 仕様タスク   | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/06b-task-fix-13-1-deprecated-property-migration.md` |

#### 変更理由

- deprecatedプロパティの残存による二重定義状態を解消し、型の正本を単一化
- `anchor.name` 参照を `anchor.source` に統一し、UI側の参照不整合を解消
- `SkillImportConfig.lastUpdated` は既存永続化互換のため維持し、不要なスコープ拡大を抑止

#### 苦戦箇所と解決策

| 苦戦ポイント       | 問題                                                       | 解決策                                                                                         |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 削除対象の境界判定 | `lastUpdated` が複数型に存在し、互換性を壊すリスクがあった | `Skill.lastUpdated` のみ削除し、`SkillImportConfig.lastUpdated` は据え置きを仕様に明記         |
| 参照移行の安全性   | `name` プロパティの機械置換は誤修正の可能性が高かった      | `Anchor` 型スコープで参照箇所を限定し、UIドキュメントの対象行のみ修正                          |
| Phase 12の追記漏れ | コード修正だけでは仕様同期が不足した                       | `interfaces-agent-sdk-skill.md` / `task-workflow.md` / `lessons-learned.md` を同一ターンで更新 |

---

### タスク: UT-FIX-AGENTVIEW-INFINITE-LOOP-001 AgentView無限ループ修正（2026-02-12完了）

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| タスクID   | UT-FIX-AGENTVIEW-INFINITE-LOOP-001                              |
| 完了日     | 2026-02-12                                                      |
| ステータス | **完了**                                                        |
| Phase      | Phase 1-13完了                                                  |
| テスト数   | 53（全PASS）                                                    |
| カバレッジ | Statements 100% / Branches 95.65% / Functions 100% / Lines 100% |

#### 成果物

| 成果物            | パス/内容                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| AgentView修正     | `apps/desktop/src/renderer/views/AgentView/index.tsx`（インラインセレクタ廃止、個別セレクタHook移行）           |
| Storeセレクタ追加 | `apps/desktop/src/renderer/store/index.ts`（AgentView向け15個）                                                 |
| テスト更新        | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx`（再レンダリング安定性含む）            |
| 実装ガイド        | `docs/30-workflows/completed-tasks/UT-FIX-AGENTVIEW-INFINITE-LOOP-001/outputs/phase-12/implementation-guide.md` |

#### 変更理由

- AgentView内のローカル `fetchSkills` + `useCallback` 依存の再生成により、`useEffect` が再トリガーされ続ける構造を解消
- P31対策の長期方針（個別セレクタHook）をAgentViewにも適用して参照安定性を統一
- デバッグログ除去とテスト増強により、回帰検知の確実性を向上

---

### タスク: UT-STORE-HOOKS-TEST-REFACTOR-001 Store Hooks テストリファクタリング（2026-02-12完了）

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| タスクID   | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| 完了日     | 2026-02-12                       |
| ステータス | **完了**                         |
| Phase      | Phase 1-12完了                   |
| テスト数   | 208（全PASS）                    |
| カバレッジ | 全テストPASS                     |

#### 成果物

| 成果物                 | パス/内容                                                                |
| ---------------------- | ------------------------------------------------------------------------ |
| テストリファクタリング | `apps/desktop/src/renderer/store/__tests__/agentSlice.selectors.test.ts` |
| 変更内容               | getState()パターンからrenderHookパターンへ完全移行                       |

#### 変更理由

- agentSlice.selectors.test.tsのテストパターンをgetState()直接呼び出しからrenderHookパターンに統一
- Zustand個別セレクタHookの実際のReact環境での動作を検証するテスト設計に改善
- 全208テストがPASSすることを確認

---

### タスク: UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Store Hooks コンポーネント移行（2026-02-12完了）

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001     |
| 完了日     | 2026-02-12                                 |
| ステータス | **完了**                                   |
| Phase      | Phase 1-12完了                             |
| テスト数   | 71（参照安定性31件＋無限ループ防止40件）   |
| カバレッジ | Line 87.77% / Branch 90% / Function 91.04% |

#### 成果物

| 成果物                   | パス/内容                                                               |
| ------------------------ | ----------------------------------------------------------------------- |
| 個別セレクタHook（30個） | `apps/desktop/src/renderer/store/index.ts`                              |
| LLMSelectorPanel移行     | `apps/desktop/src/renderer/components/llm/LLMSelectorPanel.tsx`         |
| SkillSelector移行        | `apps/desktop/src/renderer/components/skill/SkillSelector.tsx`          |
| SettingsView移行         | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                |
| 参照安定性テスト         | `apps/desktop/src/renderer/store/__tests__/selectors.test.ts`           |
| 無限ループ防止テスト     | `apps/desktop/src/renderer/__tests__/infinite-loop-prevention.test.tsx` |

#### 変更理由

- P31問題（Zustand Store Hooks無限ループ）の根本解決策として個別セレクタパターンを実装
- 合成Hook（`useLLMStore()`等）から個別セレクタ（`useLLMFetchProviders()`等）への移行により、useEffectの依存配列に関数を安全に含められるようになった
- useRefガードパターンを削除し、コードの可読性と保守性を向上

---

### タスク: TASK-9B-I-SDK-FORMAL-INTEGRATION Claude Agent SDK型安全統合（2026-02-12完了）

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | TASK-9B-I-SDK-FORMAL-INTEGRATION           |
| 完了日     | 2026-02-12                                 |
| ステータス | **完了**                                   |
| Phase      | Phase 1-12完了                             |
| テスト数   | 13（SDK型安全テスト新規）+ 既存278件全PASS |
| 未タスク   | 1件（UT-9B-I-001）                         |

#### 成果物

| 成果物               | パス/内容                                                                                    |
| -------------------- | -------------------------------------------------------------------------------------------- |
| SkillExecutor.ts修正 | `apps/desktop/src/main/services/skill/SkillExecutor.ts`（`as any`除去、SDK実型統合）         |
| SDK型安全テスト      | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts`（13テスト） |
| ドキュメント         | `docs/30-workflows/completed-tasks/sdk-formal-integration/`                                  |

#### 変更理由

- `callSDKQuery()` の `as any` を完全除去し、Claude Agent SDK（@anthropic-ai/claude-agent-sdk@0.2.30）の実型に基づく型安全な統合を実現
- SDK Options: `apiKey` を `env: { ANTHROPIC_API_KEY }` に変更（SDK 実型準拠）
- SDK Options: `signal: AbortSignal` を `abortController: AbortController` に変更（SDK 実型準拠）
- SDK Query 戻り値: `conversation.stream()` から `conversation` 直接 AsyncIterable 利用に変更
- SDKQueryOptions ローカル型の permissionMode を SDK 実型に合わせて更新

#### 関連仕様書更新

| 仕様書                           | 更新内容                                                            |
| -------------------------------- | ------------------------------------------------------------------- |
| interfaces-agent-sdk-executor.md | callSDKQuery型安全化仕様追加、SDK Optionsマッピング、完了タスク追加 |
| interfaces-agent-sdk.md          | SDK型安全統合セクション追加、SDKQueryOptions変更記録                |
| task-workflow.md                 | 完了タスク追加、残課題テーブルからTASK-9B-I完了マーク               |

---

### タスク: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION executeSkillのSkillExecutor委譲実装（2026-02-11完了）

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| タスクID   | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION                 |
| 完了日     | 2026-02-11                                            |
| ステータス | **完了**                                              |
| Phase      | Phase 1-12完了                                        |
| テスト数   | 統合テスト7件・ユニットテスト12件（全PASS）           |
| 未タスク   | 3件（UT-FIX-7-1-001, UT-FIX-7-1-002, UT-FIX-7-1-003） |

#### 成果物

| 成果物                | パス/内容                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------- |
| SkillService委譲実装  | `apps/desktop/src/main/services/skill/SkillService.ts`（setSkillExecutor, executeSkill） |
| skillHandlers DI設定  | `apps/desktop/src/main/ipc/skillHandlers.ts`                                             |
| 委譲テスト（IPC）     | `apps/desktop/src/main/ipc/__tests__/skillHandlers.delegate.test.ts`                     |
| 委譲テスト（Service） | `apps/desktop/src/main/services/skill/__tests__/SkillService.delegate.test.ts`           |

#### 変更理由

- SkillService.executeSkill()が直接実行ロジックを持たず、SkillExecutorに委譲するアーキテクチャに変更
- Setter Injectionパターンを採用（BrowserWindow依存による遅延初期化が必要）
- DIパターン使い分け基準を確立（Constructor / Setter / Factory）

#### 関連仕様書更新

| 仕様書                                  | 更新内容                       |
| --------------------------------------- | ------------------------------ |
| architecture-implementation-patterns.md | Setter Injectionパターン追加   |
| interfaces-agent-sdk-executor.md        | SkillService統合セクション追加 |
| arch-electron-services.md               | SkillService API追加           |
| lessons-learned.md                      | 苦戦箇所3件記録                |
| 06-known-pitfalls.md                    | P34, P35追加                   |
| patterns.md                             | 成功パターン2件追加            |

---

### タスク: UT-FIX-5-4 AgentSDKAPI abort() 型定義不一致修正（2026-02-10完了）

| 項目       | 内容           |
| ---------- | -------------- |
| タスクID   | UT-FIX-5-4     |
| 完了日     | 2026-02-10     |
| ステータス | **完了**       |
| Phase      | Phase 1-12完了 |
| テスト数   | 24（新規追加） |
| カバレッジ | 全テストPASS   |

#### 成果物

| 成果物              | パス/内容                                    |
| ------------------- | -------------------------------------------- |
| 型定義修正(shared)  | `packages/shared/src/agent/types.ts` (行237) |
| 型定義修正(preload) | `apps/desktop/src/preload/types.ts` (行1289) |
| 変更内容            | `abort(): void` → `abort(): Promise<void>`   |

#### 変更理由

- P23パターン（API二重定義の型管理）準拠
- 実装（safeInvoke）の戻り値は`Promise<void>`だが型定義は`void`だった
- 2箇所同時更新でTypeScript開発者が`.then()`や`await`を正しく使用可能に

---

### タスク: UT-FIX-5-3 Preload Agent Abort セキュリティ修正（2026-02-10完了）

| 項目       | 内容               |
| ---------- | ------------------ |
| タスクID   | UT-FIX-5-3         |
| 完了日     | 2026-02-10         |
| ステータス | **完了**           |
| Phase      | Phase 1-12完了     |
| テスト数   | 21（全テストPASS） |
| カバレッジ | 全テストPASS       |

#### 成果物

| 成果物      | パス/内容                                                      |
| ----------- | -------------------------------------------------------------- |
| Preload修正 | `apps/desktop/src/preload/index.ts` (行423)                    |
| Main修正    | `apps/desktop/src/main/agent/agent-handler.ts` (行176-178, 63) |
| 変更内容    | `ipcRenderer.send` → `safeInvoke(IPC_CHANNELS.AGENT_ABORT)`    |

#### 変更理由

- 04-electron-security.md IPC セキュリティ原則準拠
- ホワイトリスト検証のバイパスを解消
- 他のAPI（stop, getStatus等）と同一パターンに統一

---

### タスク: TASK-AUTH-SESSION-REFRESH-001 セッション自動リフレッシュ実装（2026-02-06完了）

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | TASK-AUTH-SESSION-REFRESH-001           |
| 完了日     | 2026-02-06                              |
| ステータス | **完了**                                |
| Phase      | Phase 1-12完了                          |
| テスト数   | 26                                      |
| カバレッジ | Stmts 96.15%, Branch 93.10%, Funcs 100% |

#### 成果物

| 成果物                | パス/内容                                                                |
| --------------------- | ------------------------------------------------------------------------ |
| TokenRefreshScheduler | `apps/desktop/src/main/services/tokenRefreshScheduler.ts`                |
| テストケース          | `apps/desktop/src/main/services/__tests__/tokenRefreshScheduler.test.ts` |
| authHandlers.ts更新   | スケジューラー統合、コールバック追加                                     |
| supabaseClient.ts更新 | `autoRefreshToken: false`                                                |
| authSlice.ts更新      | `isRefreshing` フィールド追加                                            |
| auth.ts更新           | `sessionExpiresAt` フィールド追加                                        |

#### 未タスク（TASK-AUTH-SESSION-REFRESH-001実施中に発見）

| タスクID                    | タスク名                         | 優先度 |
| --------------------------- | -------------------------------- | ------ |
| UT-OFFLINE-REFRESH-001      | オフライン時リフレッシュ失敗処理 | 中     |
| UT-AUDIT-001                | 認証イベント監査ログ             | 中     |
| UT-REFRESH-NOTIFICATION-001 | セッションリフレッシュ通知UI     | 低     |

---

### タスク: TASK-7D ChatPanel統合（2026-01-30完了）

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-7D                                     |
| 完了日     | 2026-01-30                                  |
| ステータス | **完了**                                    |
| Phase      | Phase 1-12完了                              |
| テスト数   | 48（ChatPanel: 15, SkillStreamingView: 33） |
| カバレッジ | Line 100%, Branch 93.75%+, Function 100%    |

#### 成果物

| 成果物                 | パス/内容                                                                    |
| ---------------------- | ---------------------------------------------------------------------------- |
| ChatPanel.tsx          | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`（136行）           |
| SkillStreamingView.tsx | `apps/desktop/src/renderer/components/skill/SkillStreamingView.tsx`（251行） |
| index.ts更新           | `apps/desktop/src/renderer/components/skill/index.ts`                        |
| テスト                 | ChatPanel.test.tsx, SkillStreamingView.test.tsx                              |
| ドキュメント           | `docs/30-workflows/TASK-7D-chat-panel-integration/`（33 Phase出力ファイル）  |

#### 未タスク（TASK-7D実施中に発見）

| タスクID                                   | タスク名                          | 優先度 |
| ------------------------------------------ | --------------------------------- | ------ |
| task-imp-skillselector-onimportrequest-001 | SkillSelector onImportRequest改善 | 中     |
| task-imp-chatpanel-new-design-001          | ChatPanel新デザイン改善           | 中     |

---

### タスク: task-specification-creator Phase 12テンプレート強化（2026-01-22完了）

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TSC-PHASE12-IMPROVE-002                      |
| 完了日     | 2026-01-22                                   |
| ステータス | **完了**                                     |
| 対象スキル | `.claude/skills/task-specification-creator/` |
| バージョン | v7.6.0                                       |

#### 改善内容

1. **Phase 12-2セクション強化**
   - `spec-update-workflow.md`への参照リンク追加
   - 2ステップ実行プロセスの明示化（Step 1: 完了記録、Step 2: 仕様更新）
   - 判断基準テーブルをテンプレート内に埋め込み

2. **完了条件チェックリストの明示化**
   - Phase 12-2の3ステップを個別チェック項目として追加
   - 見落とし防止のため`【Phase 12-2 Step 1】`等のプレフィックス付与

3. **フォールバック手順セクション追加**
   - スクリプト不在時の代替手順を明記
   - `generate-documentation-changelog.js`等の手動実行ガイド

#### 成果物

| 成果物                     | パス                                                                      |
| -------------------------- | ------------------------------------------------------------------------- |
| phase-templates.md（更新） | `.claude/skills/task-specification-creator/references/phase-templates.md` |
| SKILL.md（更新）           | `.claude/skills/task-specification-creator/SKILL.md`                      |

---

### タスク: task-specification-creator Phase 12改善（2026-01-22完了）

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TSC-PHASE12-IMPROVE-001                      |
| 完了日     | 2026-01-22                                   |
| ステータス | **完了**                                     |
| 対象スキル | `.claude/skills/task-specification-creator/` |
| バージョン | v7.5.0                                       |

#### 改善内容

1. **Phase 12 Task 2の2ステップ化**
   - Step 1: タスク完了記録（必須 - 全タスク共通）
   - Step 2: システム仕様更新（条件付き）

2. **documentation-changelog.md自動生成スクリプト追加**
   - `scripts/generate-documentation-changelog.js` 新規作成
   - artifacts.jsonとgit diffから自動生成

3. **spec-update-workflow.md明確化**
   - 2種類の更新アクション（完了記録 vs 仕様更新）を明確に分離
   - 判断フローチャートを全体フローに更新

#### 成果物

| 成果物                          | パス                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| SKILL.md（更新）                | `.claude/skills/task-specification-creator/SKILL.md`                                    |
| spec-update-workflow.md（更新） | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          |
| 自動生成スクリプト（新規）      | `.claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js` |

---

### タスク: UT-IPC-CHANNEL-NAMING-AUDIT-001 IPCチャネル命名規則の横断的適用監査（2026-02-25完了）

| 項目       | 内容                                                                 |
| ---------- | -------------------------------------------------------------------- |
| タスクID   | UT-IPC-CHANNEL-NAMING-AUDIT-001                                      |
| 完了日     | 2026-02-25                                                           |
| ステータス | **spec_created**（監査・計画・仕様更新完了、コード実装は後続タスク） |
| Phase      | Phase 1-12完了                                                       |
| 監査結果   | 違反6件を分類（高1/中3/低2）、Skillドメイン重大違反0件               |
| 未タスク   | 0件（UT-IPC-AUTH-HANDLE-DUPLICATE-001 は2026-02-25完了）             |

#### 成果物

| 成果物               | パス/内容                                                                               |
| -------------------- | --------------------------------------------------------------------------------------- |
| ワークフロー一式     | `docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/`                                   |
| 元タスク指示書       | `docs/30-workflows/completed-tasks/task-ipc-channel-naming-audit-001.md`               |
| 監査レポート         | `docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/outputs/phase-5/channel-naming-audit-report.md` |
| リネーム計画         | `docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/outputs/phase-5/channel-rename-plan.md` |
| Phase 12 更新サマリ  | `docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/outputs/phase-12/spec-update-summary.md` |
| 未タスク検出レポート | `docs/30-workflows/completed-tasks/ut-ipc-channel-naming-audit-001/outputs/phase-12/unassigned-task-detection.md` |

#### 変更理由

- `UT-SKILL-IMPORT-CHANNEL-CONFLICT-001` で策定した命名規則を全体監査へ横展開し、P5/P44/P45 の再発リスクを定量化した。
- Skillドメインは即時ブロッカーを解消済み、残課題は `AUTH_*` の重複式整理として未タスクへ分離した。
- Phase 12 Step 1-A/1-C/1-D の漏れ対策として、台帳・教訓・索引・成果物台帳を同一ターンで同期した。

---

### タスク: UT-IPC-AUTH-HANDLE-DUPLICATE-001 AUTH IPC handle重複式の登録一元化（2026-02-25完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | UT-IPC-AUTH-HANDLE-DUPLICATE-001 |
| 完了日 | 2026-02-25 |
| ステータス | **完了** |
| 変更範囲 | `apps/desktop/src/main/ipc/authHandlers.ts`, `apps/desktop/src/main/ipc/index.ts`, `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts` |
| 監査結果 | AUTH重複登録式（5件）を0件化 |

#### 成果物

| 成果物 | パス |
| --- | --- |
| ワークフロー一式 | `docs/30-workflows/completed-tasks/ut-ipc-auth-handle-duplicate-001/` |
| 実装ログ | `docs/30-workflows/completed-tasks/ut-ipc-auth-handle-duplicate-001/outputs/phase-5/implementation-log.md` |
| 品質レポート | `docs/30-workflows/completed-tasks/ut-ipc-auth-handle-duplicate-001/outputs/phase-9/quality-report.md` |

---

## 残課題（未タスク）

以下のタスクは未実施として認識されており、タスク仕様書が作成済み。

| タスクID                                          | タスク名                                                                                                         | 優先度 | 発見元                                                                      | タスク仕様書                                                                                                                                       |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| TASK-9A-C                                         | SkillEditor UI（仕様書作成済み・実装未着手）                                                                     | 高     | TASK-9A-SKILL-EDITOR Phase 1（UI仕様書作成完了）                            | `docs/30-workflows/completed-tasks/TASK-9A-C-skill-editor-ui/` (**spec_created**: Phase 1完了、Phase 2-13未着手)                                   |
| TASK-FIX-14-2-SKILLEXECUTOR-CONSOLE-LOG-MIGRATION | SkillExecutor の console ログを electron-log に移行                                                              | 低     | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION Phase 12（スコープ外項目）              | `docs/30-workflows/completed-tasks/task-fix-14-2-skillexecutor-console-log-migration.md`                                                           |
| ~~UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001~~   | ~~UT-SKILL-IPC-PRELOAD-EXTENSION-001で検出した仕様差分（参照切れ/パス差分/命名差分）の統合是正~~                   | ~~中~~     | **2026-02-25完了** UT-SKILL-IPC-PRELOAD-EXTENSION-001 Phase 10/12（Open Item）                 | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-013-ut-imp-ipc-preload-extension-spec-alignment-001.md`                                                          |
| TASK-3-1-B                                        | SkillExecutor IPC Handler統合                                                                                    | 高     | TASK-3-1-A完了時（blocks）                                                  | `docs/30-workflows/unassigned-task/task-3-1-B-skillexecutor-ipc-integration.md`                                                                    |
| TASK-SKILL-PERF-TEST                              | SkillExecutor パフォーマンステスト                                                                               | 低     | TASK-3-1-A Phase 11推奨事項                                                 | `docs/30-workflows/unassigned-task/task-skillexecutor-performance-testing.md`                                                                      |
| SKILL-E2E-001                                     | スキルインポートE2Eテスト                                                                                        | 中     | Phase 11（手動テスト検証）推奨事項                                          | `docs/30-workflows/unassigned-task/task-skill-import-e2e-testing.md`                                                                               |
| TSC-AUTOMATION-001                                | Phase 12自動化スクリプト拡充                                                                                     | 低     | skill-import-persistence-bugfix実施時                                       | `docs/30-workflows/unassigned-task/task-phase12-automation-enhancement.md`                                                                         |
| UT-008                                            | Chat History UI Components                                                                                       | 中     | Phase 12（UT-006完了後の後続タスク）                                        | `docs/30-workflows/unassigned-task/task-chat-history-ui-components.md`                                                                             |
| UT-009                                            | Chat History Additional Use Cases                                                                                | 中     | Phase 12（api-chat-history.md 未実装Use Cases）                             | `docs/30-workflows/unassigned-task/task-chat-history-additional-usecases.md`                                                                       |
| task-imp-skillselector-onimportrequest-001        | SkillSelector onImportRequest改善                                                                                | 中     | TASK-7D実施中に発見                                                         | `docs/30-workflows/unassigned-task/task-imp-skillselector-onimportrequest-improvements.md`                                                         |
| task-imp-chatpanel-new-design-001                 | ChatPanel新デザイン改善                                                                                          | 中     | TASK-7D実施中に発見                                                         | `docs/30-workflows/unassigned-task/task-imp-chatpanel-new-design-improvements.md`                                                                  |
| task-chatedit-store-integration-001               | chatEditSlice Store統合                                                                                          | 中     | システム仕様書分析（arch-state-management.md）                              | `docs/30-workflows/unassigned-task/task-chatedit-slice-store-integration.md`                                                                       |
| task-rag-largefile-perf-001                       | RAG変換 大容量ファイルパフォーマンス検証                                                                         | 中     | システム仕様書分析（quality-requirements.md）                               | `docs/30-workflows/unassigned-task/task-rag-converter-largefile-performance.md`                                                                    |
| TASK-CHUNK-API-001                                | Chunk Search APIレイヤー実装                                                                                     | 中     | api-internal-chunk-search.md（未実装レイヤー）                              | `docs/30-workflows/unassigned-task/task-imp-chunk-search-api-layers.md`                                                                            |
| TASK-DOM-NESTING-001                              | validateDOMNesting警告修正                                                                                       | 低     | ui-history-integration.md（残課題）                                         | `docs/30-workflows/unassigned-task/task-validate-dom-nesting-bugfix.md`                                                                            |
| UT-RETRY-001                                      | リトライ設定UI                                                                                                   | 低     | TASK-SKILL-RETRY-001 Phase 12                                               | `docs/30-workflows/unassigned-task/task-retry-settings-ui.md`                                                                                      |
| UT-RETRY-002                                      | リトライ履歴永続化                                                                                               | 低     | TASK-SKILL-RETRY-001 Phase 12                                               | `docs/30-workflows/unassigned-task/task-retry-history-persistence.md`                                                                              |
| UT-RETRY-003                                      | サーキットブレーカーパターン導入                                                                                 | 中     | TASK-SKILL-RETRY-001 Phase 11 + error-handling.md                           | `docs/30-workflows/unassigned-task/task-circuit-breaker-pattern.md`                                                                                |
| UT-RETRY-004                                      | リトライイベントRenderer表示                                                                                     | 中     | TASK-SKILL-RETRY-001 Phase 11                                               | `docs/30-workflows/unassigned-task/task-use-skill-execution-retry-events.md`                                                                       |
| UT-RETRY-005                                      | リトライ型定義shared package移行                                                                                 | 低     | TASK-SKILL-RETRY-001 Phase 5                                                | `docs/30-workflows/unassigned-task/task-retry-types-shared-migration.md`                                                                           |
| CONV-DEBT-001                                     | PlainTextConverter実装                                                                                           | 中     | interfaces-converter.md / architecture-file-conversion.md                   | `docs/30-workflows/unassigned-task/task-plaintext-converter.md`                                                                                    |
| UT-VECTOR-001                                     | ベクトル検索フィルター拡張                                                                                       | 低     | rag-vector-search.md 未対応フィルター                                       | `docs/30-workflows/unassigned-task/task-vector-search-advanced-filters.md`                                                                         |
| task-imp-ipc-imp002-channels-001                  | IMP-002チャネル本体実装（settings/permissions/cache）                                                            | 中     | TASK-8C-A Phase 12（IPC統合テスト）                                         | `docs/30-workflows/unassigned-task/task-imp-ipc-imp002-channels.md`                                                                                |
| task-imp-ipc-permission-response-001              | skill:permission:response チャネル実装                                                                           | 低     | TASK-8C-A Phase 12（IPC統合テスト）                                         | `docs/30-workflows/unassigned-task/task-imp-ipc-permission-response.md`                                                                            |
| task-ref-quality-requirements-split-001           | quality-requirements.md仕様書分割                                                                                | 低     | TASK-OPT-CI-TEST-PARALLEL-001 Phase 12（テンプレート準拠確認）              | `docs/30-workflows/unassigned-task/task-ref-quality-requirements-split-001.md`                                                                     |
| task-e2e-permission-waitfortimeout-001            | E2E権限テスト waitForTimeout改善                                                                                 | 低     | TASK-8C-D Phase 10（TQ-M1指摘）                                             | `docs/30-workflows/unassigned-task/task-e2e-permission-waitfortimeout-refactoring.md`                                                              |
| task-e2e-test-readme-documentation-001            | READMEへのE2Eテスト実行方法追加                                                                                  | 低     | TASK-8C-D Phase 9（DOC-M1指摘）                                             | `docs/30-workflows/unassigned-task/task-e2e-test-readme-documentation.md`                                                                          |
| ~~TASK-9B-H~~                                     | ~~SkillCreatorService IPC通信設定~~                                                                              | ~~高~~ | **2026-02-12完了** TASK-9B-H-SKILL-CREATOR-IPC                              | `docs/30-workflows/skill-creator-ipc/`                                                                                                             |
| UI-INTEGRATION-9B                                 | SkillCreator UI統合（TASK-10A連携）                                                                              | 高     | TASK-9B-G Phase 12（UI未実装）                                              | `docs/30-workflows/unassigned-task/task-9b-ui-integration-task10a.md`                                                                              |
| ~~TASK-9B-I~~                                     | ~~Claude Agent SDK本格統合~~                                                                                     | ~~中~~ | ~~TASK-9B-G Phase 3（推奨事項）~~                                           | ~~`docs/30-workflows/unassigned-task/task-9b-i-skill-creator-sdk-integration.md`~~ **2026-02-12完了**                                              |
| TASK-9B-J                                         | ResourceLoaderキャッシュ無効化                                                                                   | 低     | TASK-9B-G Phase 3（推奨事項）                                               | `docs/30-workflows/unassigned-task/task-9b-j-skill-creator-cache-invalidation.md`                                                                  |
| TASK-9B-K                                         | タイムアウト設定の外部化                                                                                         | 低     | TASK-9B-G Phase 3（推奨事項）                                               | `docs/30-workflows/unassigned-task/task-9b-k-skill-creator-timeout-config.md`                                                                      |
| TASK-10A-UI-SKILL-IMPROVE                         | スキル改善UI表示機能                                                                                             | 中     | TASK-9C Phase 11（手動テスト発見）                                          | `docs/30-workflows/unassigned-task/task-10a-ui-skill-improve.md`                                                                                   |
| TASK-10B-IMPROVE-HISTORY                          | 改善履歴の永続化                                                                                                 | 低     | TASK-9C Phase 12（スコープ外候補）                                          | `docs/30-workflows/unassigned-task/task-10b-improve-history.md`                                                                                    |
| TASK-10C-AB-TEST                                  | A/Bテスト実行・結果比較機能                                                                                      | 低     | TASK-9C Phase 12（スコープ外候補）                                          | `docs/30-workflows/unassigned-task/task-10c-ab-test.md`                                                                                            |
| task-imp-phase12-validation-001                   | Phase 12ドキュメント更新自動検証ツール                                                                           | 中     | AUTH-UI-004 Phase 12（ドキュメント更新漏れ）                                | `docs/30-workflows/unassigned-task/task-phase12-doc-validation-tool.md`                                                                            |
| UT-AUTH-001                                       | profileHandlers.test.ts IPCハンドラモック環境修正                                                                | 低     | AUTH-UI-001 Phase 5（テスト環境問題）                                       | `docs/30-workflows/unassigned-task/ut-auth-001-profilehandlers-test-fix.md`                                                                        |
| task-search-scope-folder-001                      | 検索スコープ指定機能                                                                                             | 中     | task-imp-search-ui-001 Phase 12（将来拡張候補）                             | `docs/30-workflows/unassigned-task/task-search-scope-folder.md`                                                                                    |
| task-search-multifile-replace-001                 | マルチファイル一括置換機能                                                                                       | 中     | task-imp-search-ui-001 Phase 12（将来拡張候補）                             | `docs/30-workflows/unassigned-task/task-search-multifile-replace.md`                                                                               |
| UT-ENV-001                                        | CI node-versionの.nvmrc参照化                                                                                    | 低     | ENV-INFRA-001 Phase 3レビュー                                               | `docs/30-workflows/unassigned-task/task-ut-env-001-ci-nvmrc.md`                                                                                    |
| UT-FIX-5-1-001                                    | AgentView型アサーション解消（ImportedSkill→Skill）                                                               | 低     | TASK-FIX-5-1-SKILL-API-UNIFICATION Phase 10（MINOR指摘）                    | `docs/30-workflows/completed-tasks/task-ut-fix-5-1-001-agentview-type-assertion.md`                                                                |
| UT-OFFLINE-REFRESH-001                            | オフライン時リフレッシュ失敗処理                                                                                 | 中     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）                    | `docs/30-workflows/unassigned-task/task-offline-refresh.md`                                                                                        |
| UT-AUDIT-001                                      | 認証イベント監査ログ                                                                                             | 中     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）                    | `docs/30-workflows/unassigned-task/task-auth-audit-logging.md`                                                                                     |
| UT-REFRESH-NOTIFICATION-001                       | セッションリフレッシュ通知UI                                                                                     | 低     | TASK-AUTH-SESSION-REFRESH-001 Phase 12（スコープ外項目）                    | `docs/30-workflows/unassigned-task/task-refresh-notification.md`                                                                                   |
| UT-SEC-001                                        | OAuth プロバイダー自動検出機能（consumeState→validate置換）                                                      | 低     | DEBT-SEC-001 Phase 12（設計乖離検出）                                       | `docs/30-workflows/unassigned-task/task-auth-provider-detection.md`                                                                                |
| task-sec-auth-state-cleanup-001                   | State Map定期クリーンアップ実装                                                                                  | 低     | DEBT-SEC-001 Phase 12（既知制約検出）                                       | `docs/30-workflows/unassigned-task/task-auth-state-cleanup-scheduling.md`                                                                          |
| UT-PROTOCOL-URL-001                               | カスタムプロトコルURLパース標準ユーティリティ整備                                                                | 中     | TASK-AUTH-CALLBACK-001 Phase 12（苦戦箇所検出）                             | `docs/30-workflows/unassigned-task/task-protocol-url-parsing-utility.md`                                                                           |
| UT-FIX-5-2                                        | Preload Dialog API ハードコード削除                                                                              | 中     | TASK-FIX-5-1 Phase 10                                                       | `docs/30-workflows/unassigned-task/task-ut-fix-5-2-preload-dialog-hardcode.md`                                                                     |
| ~~UT-FIX-5-3~~                                    | ~~Preload Agent Abort セキュリティ修正~~                                                                         | ~~高~~ | ~~TASK-FIX-5-1 Phase 10~~                                                   | ~~`docs/30-workflows/completed-tasks/task-ut-fix-5-3-preload-agent-abort.md`~~ **2026-02-10完了**                                                  |
| TASK-FIX-12-2-IPC-HARDCODE-FIX-UPDATER-AGENT      | Updater/AgentHandler IPC チャネル名定数化                                                                        | 低     | TASK-FIX-12-1 Phase 12                                                      | `docs/30-workflows/unassigned-task/task-fix-12-2-ipc-hardcode-fix-updater-agent.md`                                                                |
| TASK-DOC-PHASE12-JUDGMENT-CRITERIA-001            | Phase 12判断基準の明確化と漏れ防止強化                                                                           | 低     | TASK-FIX-6-1-STATE-CENTRALIZATION Phase 12                                  | `docs/30-workflows/unassigned-task/task-doc-phase12-judgment-criteria-improvement.md`                                                              |
| ~~UT-FIX-5-4~~                                    | ~~AgentSDKAPI 型定義不一致修正~~                                                                                 | ~~低~~ | ~~UT-FIX-5-3 Phase 12 アーキテクチャ検証~~                                  | ~~`docs/30-workflows/completed-tasks/UT-FIX-5-4-AGENT-SDK-API-TYPE-MISMATCH/index.md`~~ **2026-02-10完了**                                         |
| ~~UT-STORE-HOOKS-REFACTOR-001~~                   | ~~Store Hooksを個別セレクタベースに再設計~~                                                                      | ~~中~~ | ~~TASK-UT-AUTH-MODE-UI-INTEGRATION タスク仕様書 セクション8~~               | ~~`docs/30-workflows/completed-tasks/UT-STORE-HOOKS-REFACTOR-001/index.md`~~ **2026-02-12完了（UT-STORE-HOOKS-COMPONENT-MIGRATION-001で実施）**    |
| UT-STORE-HOOKS-REFACTOR-002                       | 状態セレクタのJSDoc追加                                                                                          | 低     | UT-STORE-HOOKS-REFACTOR-001 Phase 10最終レビュー                            | `docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor-002-jsdoc.md`                                                                      |
| UT-STORE-HOOKS-REFACTOR-003                       | 合成Hookを使用しているコンポーネントの段階的移行                                                                 | 中     | UT-STORE-HOOKS-REFACTOR-001 Phase 10最終レビュー                            | `docs/30-workflows/completed-tasks/task-ut-store-hooks-refactor-003-migration.md`                                                                  |
| UT-FIX-APP-INITAUTH-CHECK-001                     | App.tsxのinitializeAuth確認                                                                                      | 低     | TASK-UT-AUTH-MODE-UI-INTEGRATION Phase 10 MINOR指摘                         | `docs/30-workflows/completed-tasks/task-ut-fix-app-initauth-check.md`                                                                              |
| UT-FIX-7-1-001                                    | SkillService型アサーション→型ガード改善                                                                          | 低     | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                              | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-001-skillservice-type-guard.md`                                                                 |
| UT-FIX-7-1-002                                    | skillHandlers.ts機能別分割                                                                                       | 低     | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                              | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-002-skillhandlers-split.md`                                                                     |
| UT-FIX-7-1-003                                    | IPCレスポンスパターン統一                                                                                        | 低     | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12                              | `docs/30-workflows/unassigned-task/task-ut-fix-7-1-003-ipc-response-pattern-unification.md`                                                        |
| UT-9B-H-001                                       | IpcResult型の重複定義を@repo/sharedに統一。UT-9B-H-003教訓反映済み（L3型整合性、Prettier干渉リスク）             | 低     | TASK-9B-H-SKILL-CREATOR-IPC Phase 10 m-01                                   | `docs/30-workflows/unassigned-task/task-9b-h-ipcresult-type-unification.md`                                                                        |
| UT-9B-H-002                                       | SkillCreator IPCハンドラーの引数検証をZodスキーマに移行。UT-9B-H-003教訓反映済み（Zodセキュリティ共存設計）      | 低     | TASK-9B-H-SKILL-CREATOR-IPC Phase 10 m-02                                   | `docs/30-workflows/unassigned-task/task-9b-h-zod-schema-migration.md`                                                                              |
| ~~UT-9B-H-003~~                                   | ~~SkillCreator IPCセキュリティ強化（パストラバーサル対策、sanitizeError、schemaNameホワイトリスト）~~            | ~~高~~ | ~~TASK-9B-H-SKILL-CREATOR-IPC 最終品質レビュー~~                            | ~~`docs/30-workflows/completed-tasks/ut-9b-h-003-security-hardening/index.md`~~ **2026-02-12完了（UT-9B-H-003-security-hardeningで実施）** |
| UT-9B-H-004                                       | SkillCreator設計書-実装整合性修正（Zod/型/メソッド名の乖離対応）。UT-9B-H-003教訓反映済み（TDDトレーサビリティ） | 中     | TASK-9B-H-SKILL-CREATOR-IPC 最終品質レビュー                                | `docs/30-workflows/unassigned-task/task-9b-h-design-implementation-alignment.md`                                                                   |
| UT-9B-H-005                                       | Preload API二重公開パターン統一。UT-9B-H-003教訓反映済み（L3横展開評価）                                         | 低     | TASK-9B-H Phase 10 M-02 / Phase 11 D-3                                      | `docs/30-workflows/unassigned-task/task-9b-h-api-dual-publishing-unification.md`                                                                   |
| task-imp-store-hooks-remaining-migration          | 残コンポーネントの個別セレクタHook移行                                                                           | 低     | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12（スコープ外項目）           | `docs/30-workflows/unassigned-task/task-imp-store-hooks-remaining-migration.md`                                                                    |
| task-ref-store-hooks-deprecate-composite          | 合成Store Hookの非推奨化・段階的削除                                                                             | 低     | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12（スコープ外項目）           | `docs/30-workflows/unassigned-task/task-ref-store-hooks-deprecate-composite.md`                                                                    |
| task-imp-phase12-auto-verification                | Phase 12チェックリスト自動検証スクリプト                                                                         | 中     | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 Phase 12（実装苦戦箇所）             | `docs/30-workflows/unassigned-task/task-imp-phase12-auto-verification.md`                                                                          |
| ~~UT-9B-I-001~~                                   | ~~カスタム型宣言ファイルと SDK 実型の共存整理~~                                                                  | ~~低~~ | ~~TASK-9B-I-SDK-FORMAL-INTEGRATION Phase 12（未タスク検出）~~               | ~~`docs/30-workflows/completed-tasks/sdk-formal-integration/outputs/phase-12/ut-9b-i-001-custom-declare-module-cleanup.md`~~ **完了タスクに移動**  |
| UT-TEST-EVENT-STANDARDIZATION-001                 | テストイベントAPI標準化（happy-dom環境fireEvent統一）                                                            | 中     | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 12（P39/P40教訓）                  | `docs/30-workflows/unassigned-task/task-ut-test-event-standardization.md`                                                                          |
| UT-SETTINGSVIEW-INLINE-SELECTOR-001               | SettingsView残存インラインセレクタの個別セレクタ移行                                                             | 低     | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 10（MINOR #2）                     | `docs/30-workflows/unassigned-task/task-ut-settingsview-inline-selector-migration.md`                                                              |
| task-imp-vitest-mock-reset-utility-001            | Vitest モック2段階リセットユーティリティ共通化                                                                   | 中     | TASK-FIX-11-1-SDK-TEST-ENABLEMENT Phase 5（実装苦戦箇所）                   | `docs/30-workflows/unassigned-task/task-imp-vitest-mock-reset-utility-001.md`                                                                      |
| task-ref-vitest-module-mock-audit-001             | Vitest モジュールレベルモック監査・使い分けガイドライン策定                                                      | 低     | TASK-FIX-11-1-SDK-TEST-ENABLEMENT Phase 5（実装苦戦箇所）                   | `docs/30-workflows/unassigned-task/task-ref-vitest-module-mock-audit-001.md`                                                                       |
| task-imp-vitest-alias-sync-automation-001         | Vitest alias 設定と `@repo/shared` エクスポート整合の自動検証                                                    | 中     | TASK-FIX-10-1-VITEST-ERROR-HANDLING Phase 8（スコープ外項目）               | `docs/30-workflows/unassigned-task/task-imp-vitest-alias-sync-automation-001.md`                                                                   |
| ~~UT-FIX-TS-VITEST-TSCONFIG-PATHS-001~~            | ~~Vitest alias と tsconfig paths の同期自動化。vite-tsconfig-pathsプラグイン導入で27個の手動alias削除、6つの双方向チェックCIガード。60テスト全PASS~~ | ~~中~~ | ~~TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 3（MINOR 指摘）~~          | ~~`docs/30-workflows/completed-tasks/task-vitest-tsconfig-paths-sync-automation.md`~~ **2026-02-24完了（実装: `docs/30-workflows/vitest-tsconfig-paths-sync/`）**                                                                  |
| UT-PERF-001                                       | グラフユーティリティ性能ベンチマーク基準再設計                                                                   | 中     | TODO検出: `packages/shared/src/types/rag/graph/__tests__/utils.test.ts:791` | `docs/30-workflows/unassigned-task/task-ut-perf-001-graph-utils-performance-benchmark.md`                                                          |
| UT-TYPE-DATETIME-DOC-001                          | 型日時表現のガイドライン策定とドキュメント化                                                                     | 低     | TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION Phase 12                        | `docs/30-workflows/unassigned-task/task-ut-type-datetime-doc-001-datetime-representation-guide.md`                                                 |
| ~~UT-FIX-IPC-RESPONSE-UNWRAP-001~~                | ~~IPC レスポンスラッパー未展開修正（importedSkills.forEach クラッシュ）~~                                        | ~~高~~ | ~~ランタイムエラー調査（2026-02-13）~~                                      | ~~`docs/30-workflows/completed-tasks/task-ut-fix-ipc-response-unwrap-001.md`~~ **2026-02-14完了**                                                  |
| UT-FIX-IPC-RESPONSE-UNWRAP-002                    | Phase 10仕様書 `import()` 記載整合                                                                               | 低     | UT-FIX-IPC-RESPONSE-UNWRAP-001 Phase 10（MINOR M-1）                        | `docs/30-workflows/unassigned-task/task-ut-fix-ipc-response-unwrap-002-phase10-spec-alignment.md`                                                  |
| UT-FIX-IPC-RESPONSE-UNWRAP-003                    | `safeInvokeUnwrap` 型アサーション削減                                                                            | 低     | UT-FIX-IPC-RESPONSE-UNWRAP-001 Phase 10（MINOR M-2）                        | `docs/30-workflows/unassigned-task/task-ut-fix-ipc-response-unwrap-003-safeinvokeunwrap-type-guard.md`                                             |
| ~~UT-FIX-IPC-HANDLER-DOUBLE-REG-001~~             | ~~IPC ハンドラ二重登録防止修正（activate イベント）~~                                                            | ~~高~~ | ~~ランタイムエラー調査（2026-02-13）~~                                      | ~~`docs/30-workflows/completed-tasks/task-ut-fix-ipc-handler-double-reg-001.md`~~ **2026-02-14完了**                                               |
| task-sec-ipc-lifecycle-audit-001                  | Electron ライフサイクルイベント IPC リスナー管理監査                                                             | 中     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 Phase 12（実装苦戦箇所）                  | `docs/30-workflows/unassigned-task/task-sec-ipc-lifecycle-audit-001.md`                                                                            |
| task-imp-ipc-registration-verify-001              | IPC ハンドラ登録整合性自動検証テスト                                                                             | 中     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 Phase 12（実装苦戦箇所）                  | `docs/30-workflows/unassigned-task/task-imp-ipc-registration-verify-001.md`                                                                        |
| UT-9A-B-001                                       | IPC入力バリデーション標準化                                                                                      | 中     | TASK-9A-B Phase 12（未タスク検出）                                          | `docs/30-workflows/unassigned-task/task-ipc-validation-standardize-improvements.md`                                                |
| UT-9A-B-002                                       | IPCエラーサニタイズ共通ユーティリティ化                                                                          | 中     | TASK-9A-B Phase 12（未タスク検出）                                          | `docs/30-workflows/unassigned-task/task-ipc-error-sanitize-refactoring.md`                                                         |
| UT-9A-B-003                                       | IPCテストhandlerMapモックユーティリティ共通化                                                                    | 低     | TASK-9A-B Phase 12（未タスク検出）                                          | `docs/30-workflows/unassigned-task/task-ipc-test-mock-utils-improvements.md`                                                       |
| ~~UT-FIX-SKILL-IMPORT-INTERFACE-001~~             | ~~skill:import IPCインターフェース不整合修正~~                                                                   | ~~高~~ | ~~開発実行時ランタイムエラー（2026-02-20）~~                                | ~~[00-ut-fix-skill-import-interface-001.md](../../../../docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-import-interface-001.md)~~ **2026-02-21完了**   |
| ~~UT-FIX-SKILL-REMOVE-INTERFACE-001~~             | ~~skill:remove IPCインターフェース不整合修正~~                                                                   | ~~高~~ | ~~UT-FIX-SKILL-IMPORT-INTERFACE-001 水平思考（2026-02-20）~~                | ~~[00-ut-fix-skill-remove-interface-001.md](../../../../docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-ut-fix-skill-remove-interface-001.md)~~ **2026-02-20完了** |
| ~~UT-FIX-SKILL-VALIDATION-P42-001~~               | ~~skillHandlers P42準拠バリデーション横展開~~                                                                      | ~~中~~ | ~~UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時検出（2026-02-20）~~ **完了: 2026-02-24（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001で実施）** | `docs/30-workflows/completed-tasks/skill-validation-consistency/` |
| UT-FIX-SKILL-IPC-ERROR-RESPONSE-001               | skillHandlers IPCバリデーションエラー応答パターン統一                                                             | 中     | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時検出（2026-02-20）                  | `docs/30-workflows/unassigned-task/task-ipc-skill-error-response-unification.md`                                                                   |
| TASK-9A-C-001                                     | SkillCodeEditor シンタックスハイライト機能                                                                        | 中     | TASK-9A-C Phase 1（将来拡張ポイント: language prop）                        | `docs/30-workflows/unassigned-task/task-9a-c-syntax-highlighting.md`                                                                               |
| TASK-9A-C-002                                     | SkillEditor ファイル作成・削除機能（CRUD完全化）                                                                 | 中     | TASK-9A-C Phase 1-2（スコープ外: readFile/writeFileのみ実装）               | `docs/30-workflows/unassigned-task/task-9a-c-file-crud-operations.md`                                                                              |
| TASK-9A-C-003                                     | SkillCodeEditor Monaco/CodeMirror エディタ移行                                                                   | 低     | TASK-9A-C Phase 2（将来拡張ポイント: textarea→高機能エディタ）              | `docs/30-workflows/unassigned-task/task-9a-c-code-editor-migration.md`                                                                             |
| TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001         | @repo/shared ソース構造二重性の統一（types/ と src/types/ の整理）                                               | 中     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 5                            | `docs/30-workflows/unassigned-task/task-refactor-shared-source-structure-consolidation.md`                                          |
| ~~TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001~~       | ~~@repo/shared モジュール解決3層整合CIガード~~                                                                   | ~~高~~ | ~~TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 10 MINOR~~ **完了: 2026-02-22** | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/`                                                                                       |
| ~~UT-FIX-SKILL-IMPORT-RETURN-TYPE-001~~            | ~~skill:import IPCハンドラ戻り値型不整合修正（ImportResult→ImportedSkill変換）~~                                 | ~~高~~ | ~~20フレームワーク多角的分析（2026-02-21）~~ **完了: 2026-02-21**           | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/00-task-ut-fix-skill-import-return-type-001.md`                                   |
| UT-FIX-SKILL-IPC-NAMING-P45-001                   | skillHandlers IPC引数命名統一（skillId → skillName横展開）                                                        | 中     | UT-FIX-SKILL-IMPORT-INTERFACE-001 / UT-FIX-SKILL-REMOVE-INTERFACE-001 実装時検出（2026-02-20） | `docs/30-workflows/unassigned-task/task-ut-fix-skill-ipc-naming-p45-001.md`                                                                        |
| UT-IMP-PHASE11-WORKTREE-PROTOCOL-001              | Phase 11 Worktree環境手動テスト実行プロトコル策定                                                                | 中     | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所（2026-02-21）               | `docs/30-workflows/unassigned-task/task-imp-phase11-worktree-testing-protocol-001.md`                                                              |
| UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001          | IPCハンドラ粒度カバレッジ計測インフラ構築                                                                        | 中     | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所（2026-02-21）               | `docs/30-workflows/unassigned-task/task-imp-ipc-handler-coverage-granular-001.md`                                                                  |
| UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001        | マルチエージェントPhase依存順序ガード                                                                            | 中     | UT-FIX-SKILL-REMOVE-INTERFACE-001 実装苦戦箇所（2026-02-21）               | `docs/30-workflows/unassigned-task/task-imp-multiagent-phase-ordering-guard-001.md`                                                                |
| ~~UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001~~      | ~~skill:ハンドラIPCレスポンス形式統一（{ success, data }ラッパー vs 直接型T混在解消）~~                           | ~~中~~ | ~~UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12（コード調査・2026-02-21）~~ **完了: 2026-02-25** | `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/index.md`                                                                            |
| UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001       | skill IPCレスポンス契約マトリクスと自動整合チェック                                                              | 中     | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12（実装苦戦箇所・2026-02-25） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-skill-ipc-response-contract-guard-001.md`                                           |
| UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001 | Phase 12 実装ガイド必須要件の品質ゲート化（理由先行/日常例え/型API明記の機械検証）                                 | 中     | UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12（実装苦戦箇所・2026-02-25） | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-implementation-guide-quality-gate-001.md`                                   |
| UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001            | skill:get-detail引数名ドリフト修正（P45パターン：skillId→skillName統一）                                        | 低     | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12（コード調査・2026-02-21）      | `docs/30-workflows/unassigned-task/task-skill-getdetail-naming-drift.md`                                                                           |
| ~~UT-FIX-SKILL-VALIDATION-CONSISTENCY-001~~            | ~~skill:ハンドラP42準拠バリデーション形式統一（UT-FIX-SKILL-VALIDATION-P42-001の補完・苦戦箇所付き）~~               | ~~中~~     | ~~UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12（コード調査・2026-02-21）~~ **完了: 2026-02-24**      | `docs/30-workflows/completed-tasks/skill-validation-consistency/`                                                                            |
| UT-IMP-UNASSIGNED-FORMAT-NORMALIZATION-001         | 未タスク指示書フォーマット正規化（9セクション未準拠67件の是正）                                                   | 中     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 監査（2026-02-22）                      | `docs/30-workflows/unassigned-task/task-imp-unassigned-task-format-normalization-001.md`                                                            |
| ~~UT-FIX-SKILL-IMPORT-ID-MISMATCH-001~~           | ~~SkillImportDialog skill.id→skill.name不一致修正（Rendererがハッシュを渡しgetSkillByNameが失敗）~~ | ~~高~~ | ~~ランタイムエラー調査（2026-02-22）~~ **完了: 2026-02-22**                | `docs/30-workflows/completed-tasks/skill-import-id-mismatch-fix/`                                                                                                  |
| UT-TYPE-SKILL-IDENTIFIER-BRANDED-001              | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）                                            | 中     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 実装苦戦箇所（2026-02-22）             | `docs/30-workflows/unassigned-task/task-type-skill-identifier-branded.md`                                                                          |
| UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001         | SkillImportDialog同名コンポーネント解消（コンポーネント命名重複リファクタリング）                                | 低     | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 実装苦戦箇所（2026-02-22）             | `docs/30-workflows/unassigned-task/task-refactor-skill-import-dialog-dedup.md`                                                                     |
| UT-UI-THEME-DYNAMIC-SWITCH-001                     | settingsSlice テーマ動的切替対応（kanagawa-dragon固定 → light/dark/system連動）                                   | 中     | TASK-UI-00-TOKENS Phase 12（未タスク検出・2026-02-22）                      | `docs/30-workflows/unassigned-task/ut-ui-theme-dynamic-switch-001.md`                                                                              |
| UT-UI-TAILWIND-TOKENS-INTEGRATION-001              | Tailwind CSS カスタムプロパティ統合（tokens.css変数をTailwind theme設定に反映）                                   | 低     | TASK-UI-00-TOKENS Phase 12（未タスク検出・2026-02-22）                      | `docs/30-workflows/unassigned-task/ut-ui-tailwind-tokens-integration-001.md`                                                                       |
| UT-FIX-SKILL-IMPORT-ID-MISMATCH-001              | SkillImportDialog skill.id→skill.name不一致修正（Rendererがハッシュを渡しgetSkillByNameが失敗） | 高     | ランタイムエラー調査（2026-02-22）                                          | `docs/30-workflows/unassigned-task/task-ut-fix-skill-import-id-mismatch-001.md`                                                                    |
| UT-UI-ATOMS-PROP-NAMING-001                       | RelativeTime Props命名統一（仕様書updateInterval → 実装refreshInterval）                                         | 低     | TASK-UI-00-ATOMS Phase 10 MINOR M-1（2026-02-23）                          | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-prop-naming.md`                                                                                   |
| UT-UI-ATOMS-TOUCH-TARGET-001                      | SuggestionBubble size="sm" タッチターゲット Apple HIG 44px準拠                                                   | 低     | TASK-UI-00-ATOMS Phase 10 MINOR M-2（2026-02-23）                          | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-touch-target.md`                                                                                  |
| UT-UI-ATOMS-SPEC-CLARIFICATION-001                | SuggestionBubble success-bounceマイクロインタラクション仕様書責務記述明確化                                       | 低     | TASK-UI-00-ATOMS Phase 10 MINOR M-3（2026-02-23）                          | `docs/30-workflows/completed-tasks/unassigned-task/task-ui-atoms-spec-clarification.md`                                                                            |
| TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001       | check-shared-module-sync レポート拡充（修正ガイダンス・サマリー数値・printSummary設計準拠）                       | 低     | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 Phase 10 MINOR（2026-02-22）        | `docs/30-workflows/unassigned-task/task-imp-module-sync-report-enhancement.md`                                                                     |
| ~~UT-IPC-CHANNEL-NAMING-AUDIT-001~~                   | ~~IPCチャネル命名規則の横断的適用監査と統一~~                                                                        | ~~中~~     | ~~UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 Phase 12（未タスク検出・2026-02-24）~~ **完了: 2026-02-25（spec_created）**   | `docs/30-workflows/completed-tasks/task-ipc-channel-naming-audit-001.md`                                                                               |
| ~~UT-IPC-AUTH-HANDLE-DUPLICATE-001~~                  | ~~`AUTH_*` の `ipcMain.handle` 重複式を定数化・登録一元化で解消~~                                                     | ~~中~~     | ~~UT-IPC-CHANNEL-NAMING-AUDIT-001 Phase 12（MINOR M-002・2026-02-25）~~ **完了: 2026-02-25**           | `docs/30-workflows/completed-tasks/task-ipc-auth-handle-duplicate-001.md`                                                                              |
| UT-SPEC-ONLY-TASK-WORKFLOW-001                    | 仕様書修正のみタスクのPhaseテンプレート・grep検証TDD標準化                                                       | 中     | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 Phase 12（未タスク検出・2026-02-24）   | `docs/30-workflows/unassigned-task/task-spec-only-task-workflow-automation-001.md`                                                                                 |
| UT-FIX-SKILL-IPC-ARG-FORM-UNIFICATION-001         | skill:ハンドラIPC引数形式統一（オブジェクト型 vs 直接引数型）                                                    | 低     | UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 Phase 12（苦戦箇所4・2026-02-24）   | [`docs/30-workflows/unassigned-task/task-skill-ipc-arg-form-unification.md`](../../../docs/30-workflows/unassigned-task/task-skill-ipc-arg-form-unification.md) |
| UT-IPC-DATA-FLOW-NULLABLE-CONSISTENCY-001         | SkillUsageSummary.lastUsed nullable整合性修正（Phase 1/2分析 nullable=Yes vs 実仕様 non-nullable差異）            | 低     | UT-IPC-DATA-FLOW-TYPE-GAPS-001 Phase 10 MINOR M-1（2026-02-24）            | `docs/30-workflows/completed-tasks/unassigned-task/task-ipc-data-flow-nullable-consistency-001.md`                                                                |
| UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001         | 未タスク監査の対象スコープ制御とベースライン分離（current/baseline判定）                                         | 中     | UT-IPC-DATA-FLOW-TYPE-GAPS-001 Phase 12 再監査（苦戦箇所・2026-02-24）      | `docs/30-workflows/unassigned-task/task-imp-unassigned-audit-scope-control-001.md`                                                              |
| UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001         | task-9D〜9J 仕様契約ドリフト自動検証CIガード（旧パス/artifacts/Date方針）                                        | 中     | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 実装苦戦箇所（2026-02-25）  | `docs/30-workflows/unassigned-task/task-imp-ipc-preload-spec-sync-ci-guard-001.md`                                                            |
| UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001         | Phase 12 仕様更新リンク同期ガード強化（task-workflow/SKILL/LOGSの3点同期）                                       | 中     | UT-IPC-AUTH-HANDLE-DUPLICATE-001 Phase 12 再確認（苦戦箇所・2026-02-25）    | `docs/30-workflows/unassigned-task/task-imp-aiworkflow-spec-reference-sync-001.md`                                                              |

### 未タスク管理ルール

- 未タスクは `docs/30-workflows/unassigned-task/` に配置
- タスク完了時は取り消し線でマークし、完了タスクセクションに移動
- 優先度「高」のタスクから順に実施

---

## 関連ドキュメント

- [プロジェクト概要](./overview.md)
- [非機能要件](./quality-requirements.md)
- [アーキテクチャ設計](./architecture-overview.md)
- [プラグイン開発手順](./plugin-development.md)
- [task-specification-creator SKILL.md](../../task-specification-creator/SKILL.md)

---

## 変更履歴

| バージョン | 日付           | 変更内容                                                                                                                                                                                                                                                          |
| ---------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.59.0** | **2026-02-25** | **UT-SKILL-IPC-PRELOAD-EXTENSION-001成果物移管反映**: Phase 12完了済みのワークフロー `ut-skill-ipc-preload-extension-001` を `completed-tasks/` へ移動。対応する未タスク指示書 `task-imp-ipc-preload-extension-spec-alignment-001.md` も `completed-tasks/unassigned-task/` へ移管し、参照パスを更新 |
| **1.58.0** | **2026-02-25** | **UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001登録**: task-9D〜9J 仕様契約ドリフトの再発防止を目的に、旧参照パス検出・必須artifacts検証・Date方針検証をCIガード化する未タスクを残課題テーブルへ追加。親タスクの苦戦箇所3件を未タスク指示書 Section 3.5 に反映 |
| **1.57.0** | **2026-02-25** | **UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001完了反映**: task-9D〜9J の仕様差分是正完了を完了タスクセクションへ追加。残課題テーブルの同タスクを完了化（取り消し線 + 完了日）し、完了記録参照を `completed-task/task-013-*` へ更新 |
| **1.56.0** | **2026-02-25** | **UT-SKILL-IPC-PRELOAD-EXTENSION-001完了反映**: 完了タスクセクションに30チャネルIPC/Preload拡張計画（`spec_created`）を追加。残課題テーブルに `UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001` を登録し、参照切れ・パス差分・命名差分の是正タスクを明示 |
| **1.58.0** | **2026-02-25** | **UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001登録**: Phase 12 仕様更新時の参照同期漏れ（baseline/current混同、完了移管後リンク漏れ、通常/fallback片側修正）を再発防止する未タスクを残課題テーブルへ追加。未タスク指示書に苦戦箇所を Section 3.5 として記録 |
| **1.57.0** | **2026-02-25** | **UT-IPC-AUTH-HANDLE-DUPLICATE-001完了反映**: 完了タスクセクションへ実装完了記録を追加し、残課題テーブルの同タスクを完了化（取り消し線 + completed-tasks参照へ更新）。UT-IPC-CHANNEL-NAMING-AUDIT-001 の未タスク件数を0件に更新 |
| **1.56.0** | **2026-02-25** | **UT-IPC-CHANNEL-NAMING-AUDIT-001完了反映 + 未タスク1件登録**: 完了タスクセクションに `spec_created` として追加し、残課題テーブルの参照先を `completed-tasks/task-ipc-channel-naming-audit-001.md` へ更新。Phase 10/11 MINOR を `UT-IPC-AUTH-HANDLE-DUPLICATE-001` として未タスク登録（指示書作成・台帳登録・検証連動） |
| **1.58.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 由来の未タスク2件登録**: `UT-IMP-SKILL-IPC-RESPONSE-CONTRACT-GUARD-001`（skill IPCレスポンス契約マトリクス + 自動整合チェック）と `UT-IMP-PHASE12-IMPLEMENTATION-GUIDE-QUALITY-GATE-001`（Part 1/Part 2 必須要件の品質ゲート化）を残課題テーブルへ追加 |
| **1.57.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 教訓追記**: 完了タスクセクションに「実装時の苦戦箇所と解決策」および「同種課題の簡潔解決手順（4ステップ）」を追加。`safeInvoke/safeInvokeUnwrap` 使い分け・Phase 12 実装ガイド要件不足・未タスク監査のベースライン混同に対する再発防止手順を明文化 |
| **1.56.0** | **2026-02-25** | **UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001完了反映**: 残課題テーブルの同タスクを完了化（取り消し線 + 完了日）し、参照先を `docs/30-workflows/completed-tasks/ut-fix-skill-ipc-response-consistency-001/index.md` に更新。完了タスクセクションへ成果物6件と変更理由を追記 |
| **1.55.1** | **2026-02-24** | **UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001登録**: 未タスク監査の対象スコープ制御（対象監査）とベースライン分離（全体監査）を行う運用改善タスクを残課題テーブルに追加。親タスクの苦戦箇所（全体監査ノイズ、台帳同期負荷、検証タイミング遅延）を Section 3.5 に反映 |
| **1.55.0** | **2026-02-24** | **UT-IPC-DATA-FLOW-TYPE-GAPS-001完了反映**: 完了タスクセクションに仕様書修正のみタスク（6 Gap解消・7仕様書修正・173検証項目ALL PASS）を追加。Phase 10 MINOR M-1（SkillUsageSummary.lastUsed nullable差異）を未タスク UT-IPC-DATA-FLOW-NULLABLE-CONSISTENCY-001 として残課題テーブルに登録。P3準拠3ステップ完了 |
| **1.54.0** | **2026-02-24** | **UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 Phase 12 未タスク2件登録**: UT-IPC-CHANNEL-NAMING-AUDIT-001（IPCチャネル命名規則の横断的適用監査と統一）、UT-SPEC-ONLY-TASK-WORKFLOW-001（仕様書修正のみタスクのPhaseテンプレート・grep検証TDD標準化）をP3準拠で残課題テーブルに追加 |
| **1.53.1** | **2026-02-24** | **UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 参照整合再監査**: 残課題テーブルの完了行参照を `completed-tasks/task-vitest-tsconfig-paths-sync-automation.md` に更新し、実装ワークフロー（`vitest-tsconfig-paths-sync/`）との二重リンクを明記 |
| **1.53.0** | **2026-02-24** | **UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 / TASK-UI-00-ATOMS 完了反映**: 完了タスクセクションに2タスクを追加。UTは仕様書修正のみ（`spec_created`）として記録、UI Atomsは完了成果物と未タスク3件の登録状況を追記。併せて `task-ui-00-atoms` の参照パスを `tasks/completed-task/00-2-atoms-components.md` へ正規化 |
| **1.53.0** | **2026-02-24** | **UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 追補整合**: 残課題 `UT-FIX-SKILL-VALIDATION-P42-001` を完了化し、補完タスク `UT-FIX-SKILL-VALIDATION-CONSISTENCY-001` と状態同期。重複管理による未実施誤読を解消 |
| **1.52.0** | **2026-02-22** | **TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001登録**: TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 Phase 10 MINOR指摘3件（M1: 修正ガイダンス未実装、M2: サマリーエントリ数未表示、M3: printSummaryシグネチャ設計乖離）を統合した未タスクを残課題テーブルに追加。P3準拠で3ステップ完了（指示書・残課題テーブル・quality-requirements.md参照リンク） |
| **1.51.0** | **2026-02-22** | **UT-FIX-SKILL-IMPORT-ID-MISMATCH-001苦戦箇所から未タスク2件登録**: UT-TYPE-SKILL-IDENTIFIER-BRANDED-001（Skill識別子Branded Type導入）、UT-REFACTOR-SKILL-IMPORT-DIALOG-DEDUP-001（SkillImportDialog同名コンポーネント解消）をP3準拠で残課題テーブルに追加。Section 3.5に苦戦箇所（同名コンポーネント混乱、誤解を招くインポート成功ログ、importedSkillIds二重セマンティクス）を記録 |
| **1.50.0** | **2026-02-22** | **UT-FIX-SKILL-IMPORT-ID-MISMATCH-001完了反映**: 残課題テーブルを完了化（取り消し線 + 完了日）。完了タスクセクションに詳細記録追加。Renderer層のみ変更（skill.id→skill.name、IPC/Preload無変更） |
| **1.49.0** | **2026-02-22** | **UT-FIX-SKILL-IMPORT-ID-MISMATCH-001登録**: SkillImportDialog（organisms版）が skill.id（SHA-256ハッシュ）を渡すためskillHandlers.getSkillByName()が失敗するバグの未タスクを残課題テーブルに追加。P44パターンの新規バリエーション |
| **1.48.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-INTERFACE-001完了に伴うファイル移動**: タスク仕様書ディレクトリ `ut-fix-skill-import-interface-001/` を `completed-tasks/` に移動。関連未タスク仕様書4件（UT-FIX-SKILL-VALIDATION-P42-001、UT-FIX-SKILL-IPC-ERROR-RESPONSE-001、UT-FIX-SKILL-IMPORT-RETURN-TYPE-001、UT-FIX-SKILL-IPC-NAMING-P45-001）の参照パスを `unassigned-task/` → `completed-tasks/` に更新 |
| **1.47.0** | **2026-02-21** | **UT-FIX-SKILL-IPC-NAMING-P45-001登録**: skillHandlers IPC引数命名統一タスク（skillId → skillName横展開）を残課題テーブルに追加。P45パターン（IPC引数命名の契約ドリフト）の横展開として、skill:get-detail / skill:execute / SkillService / SkillExecutor / SkillImportManager の引数名修正を定義 |
| **1.46.0** | **2026-02-21** | **UT-FIX-SKILL-REMOVE-INTERFACE-001実装苦戦箇所から未タスク3件登録**: UT-IMP-PHASE11-WORKTREE-PROTOCOL-001（Worktree環境手動テスト実行プロトコル）、UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001（IPCハンドラ粒度カバレッジ計測）、UT-IMP-MULTIAGENT-PHASE-ORDERING-GUARD-001（マルチエージェントPhase依存順序ガード）をP3準拠で残課題テーブルに追加。Section 3.5に苦戦箇所（Phase依存順序違反、Worktree制約、カバレッジスコープ曖昧性）を記録 |
| **1.46.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-INTERFACE-001完了反映**: 残課題テーブルの同タスクを完了（取り消し線 + 完了日）へ更新。参照先を `skill-import-agent-system/tasks/completed-task/` に移管し、実体ファイルと整合化 |
| **1.46.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001完了記録**: 残課題テーブルを取り消し線で完了化。完了タスクセクションに詳細記録（115テスト全PASS、Branch 84.9%、2ステップ変換パターン、P42/P44/P45解決）を追加 |
| **1.45.2** | **2026-02-21** | **未実施タスクの配置是正**: `completed-tasks/unassigned-task/` に誤配置されていた未実施2件（`UT-FIX-TS-VITEST-TSCONFIG-PATHS-001`, `TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001`）を `docs/30-workflows/unassigned-task/` へ移動し、残課題テーブル参照を同期更新 |
| **1.45.1** | **2026-02-21** | **未タスク参照リンク整合を再修正**: `verify-unassigned-links` で検出した未実在リンク4件を実在パスへ更新。`UT-FIX-TS-VITEST-TSCONFIG-PATHS-001` / `TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001` / `TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001` を `completed-tasks/unassigned-task/` へ、`UT-FIX-SKILL-IMPORT-RETURN-TYPE-001` を `skill-import-agent-system/tasks/` へ補正 |
| **1.45.0** | **2026-02-21** | **UT-FIX-SKILL-IMPORT-RETURN-TYPE-001登録**: skill:import IPCハンドラ戻り値型不整合修正タスクを残課題テーブルに追加。20フレームワーク多角的分析で発見されたImportResult→ImportedSkill変換漏れの修正 |
| **1.44.0** | **2026-02-20** | **UT-FIX-SKILL-REMOVE-INTERFACE-001派生未タスク2件登録**: UT-FIX-SKILL-VALIDATION-P42-001（P42バリデーション横展開）、UT-FIX-SKILL-IPC-ERROR-RESPONSE-001（エラー応答パターン統一）を残課題テーブルに追加。実装苦戦箇所（P23/P42/P44/P45）を未タスク指示書に反映 |
| **1.43.0** | **2026-02-20** | **未タスク配置ディレクトリ整合を是正**: 未実施タスク（task-imp-vitest-alias-sync-automation-001 / UT-9A-B-001〜003）の参照先を `docs/30-workflows/unassigned-task/` に統一。完了済み UT-9B-H-003 の参照を `completed-tasks/ut-9b-h-003-security-hardening/index.md` に更新。`verify-unassigned-links.js` で再検証 |
| **1.43.0** | **2026-02-20** | **未タスク2件登録**: TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001（@repo/shared ソース構造二重性統一、中優先度）、TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001（3層整合CIガード、高優先度）をP3準拠で残課題テーブルに追加。architecture-monorepo.mdに参照リンク追加 |
| **1.42.1** | **2026-02-20** | **TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001記録強化**: 完了タスク記録に品質ゲート達成状況テーブル（typecheck 228→0、vitest 224/224 PASS、shared build成功、lint PASS）、変更ファイル詳細（tsconfig +27 paths、package.json +26 typesVersions、vitest.config +3 alias）、変更行数（+353行/17ファイル）、テスト数（224テスト/3スイート）を追記。残課題 UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 の説明を詳細化（背景・提案解決策・スコープ追記） |
| **1.42.0** | **2026-02-20** | **UT-FIX-SKILL-REMOVE-INTERFACE-001完了反映**: 残課題テーブルの同タスクを完了（取り消し線 + 完了日）へ更新。参照先を `skill-import-agent-system/tasks/completed-task/` に変更。UT-FIX-SKILL-IMPORT-INTERFACE-001 の参照先も実ファイルパスへ修正 |
| **1.42.0** | **2026-02-20** | **TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001完了記録追加**: `@repo/shared` モジュール解決修正（`exports`/`paths`/`alias` 整合、補助型宣言取り込み、回帰テスト3ファイル追加）を完了タスクセクションへ反映。残課題に `UT-FIX-TS-VITEST-TSCONFIG-PATHS-001` を登録 |
| **1.41.0** | **2026-02-20** | **UT-FIX-SKILL-REMOVE-INTERFACE-001登録**: skill:remove IPCインターフェース不整合修正タスクを残課題テーブルに追加。UT-FIX-SKILL-IMPORT-INTERFACE-001の優先度を中→高に変更                                                                                         |
| **1.40.0** | **2026-02-20** | **UT-FIX-SKILL-IMPORT-INTERFACE-001登録**: skill:import IPCハンドラ・Preloadインターフェース不整合修正タスクを残課題テーブルに追加                                                                                                                                |
| 1.39.0     | 2026-02-19     | TASK-9A-C 未タスク3件登録（TASK-9A-C-001: シンタックスハイライト、TASK-9A-C-002: ファイルCRUD、TASK-9A-C-003: エディタ移行）。TASK-9A-Cを completed-tasks/ にパス更新。P3防止3ステップ完了                                                                        |
| 1.39.0     | 2026-02-19     | 未タスク3件追加: UT-9A-B-001（IPC入力バリデーション標準化）、UT-9A-B-002（IPCエラーサニタイズ共通化）、UT-9A-B-003（IPCテストhandlerMapモック共通化）。TASK-9A-B Phase 12検出                                                                                     |
| 1.38.0     | 2026-02-19     | TASK-9A-C SkillEditor UI仕様書作成記録追加。残課題テーブルにTASK-9A-Cをspec_created（仕様書作成済み・実装未着手）として登録。仕様書パス: `docs/30-workflows/TASK-9A-C-skill-editor-ui/`                                                                           |
| 1.38.0     | 2026-02-19     | TASK-9A-B完了記録追加。スキルファイル操作IPCハンドラー6チャンネル実装（skill:readFile/writeFile/createFile/deleteFile/listBackups/restoreBackup）、65テスト全PASS、カバレッジ Line 91.14% / Branch 93.93% / Function 100%                                         |
| 1.38.0     | 2026-02-19     | TASK-FIX-10-1-VITEST-ERROR-HANDLING完了記録を追加。dangerouslyIgnoreUnhandledErrors削除・Vitest alias 18件追加・新規テスト13件を反映。残課題に task-imp-vitest-alias-sync-automation-001 を登録。苦戦箇所と解決策（Step 2判定、未タスク検出範囲、参照整合）を追記 |
| 1.37.0     | 2026-02-14     | UT-FIX-IPC-RESPONSE-UNWRAP-001完了記録を追加。残課題テーブルで同タスクを完了マークし、MINOR由来の未タスク2件（UT-FIX-IPC-RESPONSE-UNWRAP-002/003）を登録                                                                                                          |
| 1.37.0     | 2026-02-14     | TASK-FIX-14-1完了記録を追加（本番コード4ファイル27箇所のconsole→electron-log移行）。未タスク TASK-FIX-14-2（SkillExecutor残存4箇所）を残課題テーブルへ登録                                                                                                        |
| 1.33.1     | 2026-02-14     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001 の完了タスク参照パスを `completed-tasks/` に修正。`verify-unassigned-links.js` での参照切れを解消                                                                                                                               |
| 1.33.0     | 2026-02-14     | UT-FIX-IPC-HANDLER-DOUBLE-REG-001完了記録追加。IPC ハンドラ二重登録防止修正（activate イベント）。残課題テーブルから完了タスクに移動                                                                                                                              |
| 1.32.0     | 2026-02-13     | 未タスク2件追加: task-imp-vitest-mock-reset-utility-001（mock 2段階リセットユーティリティ）、task-ref-vitest-module-mock-audit-001（モジュールモック監査・ガイドライン）。TASK-FIX-11-1 実装苦戦箇所から検出                                                      |
| 1.31.0     | 2026-02-13     | TASK-FIX-11-1-SDK-TEST-ENABLEMENT完了記録追加。SDK統合テストTODO有効化17件、Phase 12 Step 1-A/1-D反映、関連仕様書3ファイル更新を記録                                                                                                                              |
| 1.0.0      | 2026-01-20     | 初版作成                                                                                                                                                                                                                                                          |
| 1.1.0      | 2026-01-22     | task-specification-creator Phase 12改善完了記録追加                                                                                                                                                                                                               |
| 1.2.0      | 2026-01-22     | 残課題（未タスク）セクション追加、未タスク2件（E2Eテスト、自動化拡充）登録                                                                                                                                                                                        |
| 1.3.0      | 2026-01-22     | task-specification-creator v7.6.0完了記録追加（Phase 12テンプレート強化）                                                                                                                                                                                         |
| 1.4.0      | 2026-01-22     | 未タスク追加: UT-008 Chat History UI Components, UT-009 Chat History Additional Use Cases                                                                                                                                                                         |
| 1.5.0      | 2026-01-25     | 未タスク追加: TASK-3-1-B (IPC Handler統合), TASK-SKILL-PERF-TEST (パフォーマンステスト)                                                                                                                                                                           |
| 1.7.0      | 2026-01-30     | TASK-7D完了記録追加、未タスク2件（task-imp-skillselector-onimportrequest-001, task-imp-chatpanel-new-design-001）登録                                                                                                                                             |
| 1.8.0      | 2026-01-31     | 未タスク追加: TASK-CHUNK-API-001 (Chunk Search API), TASK-DOM-NESTING-001 (DOM警告修正)                                                                                                                                                                           |
| 1.9.0      | 2026-01-31     | 未タスク9件追加: TASK-SKILL-RETRY-001関連5件（設定UI/履歴永続化/サーキットブレーカー/Rendererイベント/型shared移行）+ システム仕様検出3件（Chunk Search API層/PlainTextConverter/ベクトル検索フィルター）                                                         |
| 1.6.0      | 2026-01-26     | spec-guidelines.md準拠: コードブロックを表形式・文章に変換（成果物配置、フェーズ遷移図、ファイル配置）                                                                                                                                                            |
| 1.10.0     | 2026-02-02     | 未タスク2件追加: task-imp-ipc-imp002-channels-001（IMP-002チャネル実装）、task-imp-ipc-permission-response-001（permission:response実装）。TASK-8C-A Phase 12検出                                                                                                 |
| 1.11.0     | 2026-02-02     | 未タスク追加: task-ref-quality-requirements-split-001（quality-requirements.md仕様書分割）。TASK-OPT-CI-TEST-PARALLEL-001 Phase 12検出                                                                                                                            |
| 1.12.0     | 2026-02-02     | 未タスク2件追加: task-e2e-permission-waitfortimeout-001（waitForTimeout改善）、task-e2e-test-readme-documentation-001（READMEドキュメント）。TASK-8C-D Phase 9/10検出                                                                                             |
| 1.13.0     | 2026-02-03     | 未タスク5件追加: TASK-9B-H（IPC通信設定）、UI-INTEGRATION-9B（UI統合）、TASK-9B-I（SDK統合）、TASK-9B-J（キャッシュ無効化）、TASK-9B-K（タイムアウト外部化）。TASK-9B-G Phase 12検出                                                                              |
| 1.14.0     | 2026-02-03     | 未タスク3件追加: TASK-10A-UI-SKILL-IMPROVE（スキル改善UI）、TASK-10B-IMPROVE-HISTORY（履歴永続化）、TASK-10C-AB-TEST（A/Bテスト）。TASK-9C Phase 11/12検出                                                                                                        |
| 1.17.0     | 2026-02-04     | AUTH-UI-001完了記録追加。UT-AUTH-001タスク仕様書パスを正式な指示書（ut-auth-001-profilehandlers-test-fix.md）に更新                                                                                                                                               |
| 1.16.0     | 2026-02-04     | 未タスク追加: UT-AUTH-001（profileHandlers.test.ts環境修正）。AUTH-UI-001 Phase 5検出                                                                                                                                                                             |
| 1.15.0     | 2026-02-04     | AUTH-UI-004完了: 未タスク1件追加（task-imp-phase12-validation-001）、better-sqlite3タスクv1.1.0更新                                                                                                                                                               |
| 1.16.0     | 2026-02-04     | 未タスク2件追加: task-search-scope-folder-001（検索スコープ指定）、task-search-multifile-replace-001（マルチファイル一括置換）。task-imp-search-ui-001 Phase 12検出                                                                                               |
| 1.18.0     | 2026-02-10     | UT-FIX-5-3/UT-FIX-5-4完了記録追加。残課題テーブルから完了タスクセクションに移動。Agent Abort IPCセキュリティ修正・AgentSDKAPI型定義修正完了                                                                                                                       |
| 1.18.0     | 2026-02-05     | 未タスク追加: UT-ENV-001（CI node-versionの.nvmrc参照化）。ENV-INFRA-001 Phase 3検出                                                                                                                                                                              |
| 1.19.1     | 2026-02-06     | DEBT-SEC-001完了記録追加。UT-SEC-001はDEBT-SEC-002/003の対応範囲に包含と判定（独立未タスク不要）                                                                                                                                                                  |
| 1.19.0     | 2026-02-06     | TASK-AUTH-SESSION-REFRESH-001完了記録追加、未タスク3件追加（UT-OFFLINE-REFRESH-001、UT-AUDIT-001、UT-REFRESH-NOTIFICATION-001）                                                                                                                                   |
| 1.20.0     | 2026-02-06     | 未タスク2件追加: UT-PROTOCOL-URL-001（カスタムプロトコルURLパース標準化）、UT-SEC-001更新（独立指示書作成）。TASK-AUTH-CALLBACK-001 Phase 12苦戦箇所検出                                                                                                          |
| 1.21.0     | 2026-02-09     | 未タスク追加: TASK-FIX-12-2-IPC-HARDCODE-FIX-UPDATER-AGENT（Updater/AgentHandler IPCチャネル名定数化）。TASK-FIX-12-1 Phase 12検出                                                                                                                                |
| 1.22.0     | 2026-02-10     | 未タスク更新: TASK-DOC-PHASE12-JUDGMENT-CRITERIA-001（Phase 12判断基準の明確化と漏れ防止強化）。TASK-FIX-6-1-STATE-CENTRALIZATION Phase 12で発生したP25-P28全インシデントをカバーする包括的な改善タスク                                                           |
| 1.23.0     | 2026-02-10     | 未タスク2件追加: UT-STORE-HOOKS-REFACTOR-001（Store Hooks個別セレクタ再設計）、UT-FIX-APP-INITAUTH-CHECK-001（App.tsx initializeAuth確認）。TASK-UT-AUTH-MODE-UI-INTEGRATION Phase 10/12検出                                                                      |
| 1.24.0     | 2026-02-11     | UT-STORE-HOOKS-REFACTOR-001完了。未タスク2件追加: UT-STORE-HOOKS-REFACTOR-002（JSDoc追加）、UT-STORE-HOOKS-REFACTOR-003（合成Hook移行）。Phase 10最終レビュー検出                                                                                                 |
| 1.25.0     | 2026-02-11     | 未タスク3件追加: UT-FIX-7-1-001（SkillService型ガード改善）、UT-FIX-7-1-002（skillHandlers分割）、UT-FIX-7-1-003（IPCレスポンスパターン統一）。TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION Phase 12検出                                                                 |
| 1.27.0     | 2026-02-12     | TASK-9B-I-SDK-FORMAL-INTEGRATION完了記録追加。残課題テーブルからTASK-9B-Iを完了マーク。SDK型安全統合（as any除去、SDKQueryOptions変更）                                                                                                                           |
| 1.26.0     | 2026-02-12     | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION完了記録を完了タスクセクションに追加。Phase 12仕様書更新漏れ修正                                                                                                                                                             |
| 1.30.2     | 2026-02-12     | UT-9B-H-003完了後処理: 未タスク指示書を `unassigned-task/` から `completed-tasks/unassigned-task/` へ移管し、参照パスを更新                                                                                                                                       |
| 1.30.1     | 2026-02-12     | UT-9B-H-003完了反映: 残課題テーブルの該当行を完了ステータスに更新（取り消し線 + 完了日追記）                                                                                                                                                                      |
| 1.30.0     | 2026-02-12     | UT-9B-H-003完了: SkillCreator IPCセキュリティ強化Phase 1-12完了。validatePath/sanitizeErrorMessage/ALLOWED_SCHEMA_NAMES追加、116テスト全PASS                                                                                                                      |
| 1.30.0     | 2026-02-12     | 未タスク1件追加: UT-9B-I-001（カスタム型宣言ファイルとSDK実型の共存整理）。TASK-9B-I-SDK-FORMAL-INTEGRATION Phase 12検出                                                                                                                                          |
| 1.28.0     | 2026-02-12     | 未タスク2件追加: UT-9B-H-003（IPCセキュリティ強化）、UT-9B-H-004（設計書-実装整合性修正）。TASK-9B-H-SKILL-CREATOR-IPC 最終品質レビュー検出                                                                                                                       |
| 1.27.0     | 2026-02-12     | TASK-9B-H完了記録追加。未タスク2件追加: UT-9B-H-001（IpcResult型統一）、UT-9B-H-002（Zodスキーマ移行）。TASK-9B-H-SKILL-CREATOR-IPC Phase 12検出                                                                                                                  |
| 1.29.0     | 2026-02-12     | 未タスク追加: UT-9B-H-005（Preload API二重公開パターン統一）。TASK-9B-H Phase 10 M-02 / Phase 11 D-3検出                                                                                                                                                          |
| 1.30.0     | 2026-02-12     | UT-FIX-AGENTVIEW-INFINITE-LOOP-001完了記録追加。P31適用範囲をAgentViewまで拡張し、Phase 12成果物リンクを反映                                                                                                                                                      |
| 1.31.0     | 2026-02-12     | 未タスク参照パス整合性を修正。完了済み3件（UT-FIX-5-3/5-4, UT-STORE-HOOKS-REFACTOR-001）の参照先をcompleted-tasksへ更新、未実施3件（UT-STORE-HOOKS-REFACTOR-002/003, UT-FIX-APP-INITAUTH-CHECK-001）のunassigned-task配置を反映                                   |
| 1.32.0     | 2026-02-12     | UT-FIX-AGENTVIEW-INFINITE-LOOP-001を`completed-tasks/`へ移動。関連未タスク4件（UT-FIX-5-1-001, UT-STORE-HOOKS-REFACTOR-002/003, UT-FIX-APP-INITAUTH-CHECK-001）の参照先を`completed-tasks/`へ同期                                                                 |
| 1.33.0     | 2026-02-13     | 未タスク2件追加: UT-TEST-EVENT-STANDARDIZATION-001（テストイベントAPI標準化、P39/P40教訓）、UT-SETTINGSVIEW-INLINE-SELECTOR-001（SettingsViewインラインセレクタ移行）。UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 10/12検出                                         |
| 1.34.0     | 2026-02-13     | TASK-FIX-13-1完了記録追加。deprecated型プロパティ（Anchor.name, Skill.lastUpdated）削除、型回帰テスト追加、関連タスク仕様書への参照を反映                                                                                                                         |
| 1.35.0     | 2026-02-13     | 未タスク追加: UT-PERF-001（グラフユーティリティ性能ベンチマーク基準再設計）。TODO検出結果を未タスク指示書へ登録                                                                                                                                                   |
| 1.36.0     | 2026-02-13     | TASK-FIX-13-1 苦戦箇所と解決策を完了タスクセクションへ追記。削除対象境界・参照置換安全性・Phase 12同期手順を明文化                                                                                                                                                |
