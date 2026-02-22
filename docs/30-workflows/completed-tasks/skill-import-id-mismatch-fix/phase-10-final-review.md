# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| Phase      | 10                                  |
| Phase名    | 最終レビューゲート                  |
| タスクID   | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 |
| 前提Phase  | Phase 9（品質保証）                 |
| 後続Phase  | Phase 11（手動テスト検証）          |
| ステータス | 未実施                              |
| 作成日     | 2026-02-22                          |
| 機能名     | skill-import-id-mismatch-fix        |

---

## 目的

要件から実装までの一貫性を5つのレビュー観点（要件充足・設計準拠・テスト品質・コード品質・セキュリティ）で最終検証し、Phase 11（手動テスト検証）への進行可否を判定する。

## 背景

本タスクは SkillImportDialog が `skill.id`（SHA-256ハッシュ）を IPC に渡すバグを `skill.name`（人間可読名）に修正するものである。修正箇所は Renderer 層のみだが、データフローが IPC 経由で Main Process の `getSkillByName()` に到達するため、Renderer → Preload → Main の全レイヤーでの整合性を最終確認する。P44/P45 パターン（IPC インターフェース不整合・引数命名ドリフト）の再発防止を重点的に検証する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

- タスク1: 要件充足をレビューして受入基準との一致を確認する
- タスク2: 設計準拠をレビューして変更境界の逸脱がないか確認する
- タスク3: テスト品質をレビューして網羅性と妥当性を確認する
- タスク4: コード品質をレビューして命名・型安全性を確認する
- タスク5: セキュリティとIPC契約をレビューしてP44/P45再発を防止する
- タスク6: レビュー結果を統合して最終判定を確定する

### タスク1: 要件充足レビュー

**目的**: Phase 1 で定義した要件が全て満たされていることを確認する

**実行手順**:

1. `phase-1-requirements.md` を読み込む
2. Phase 1 で定義した受入基準を一つずつ検証する
3. 各受入基準に対して、実装コードまたはテストで充足を確認する

**要件充足マトリクス**:

| 要件 | 内容                                                                 | 検証方法               | 充足 |
| ---- | -------------------------------------------------------------------- | ---------------------- | ---- |
| R1   | SkillImportDialog が `skill.name` を `onImport` に渡すこと           | ソースコード確認       | -    |
| R2   | AgentView が受け取った `skillName` を `importSkillAction` に渡すこと | ソースコード確認       | -    |
| R3   | IPC ハンドラーが `skillName` を `getSkillByName()` に渡すこと        | ソースコード確認       | -    |
| R4   | スキルインポートが正常に完了すること                                 | テスト PASS で確認     | -    |
| R5   | 既存のスキル一覧表示・検索・削除機能に影響がないこと                 | 回帰テスト PASS で確認 | -    |

**期待される成果物**:

- `outputs/phase-10/requirements-review.md`

---

### タスク2: 設計準拠レビュー

**目的**: Phase 2 で策定した設計に沿った実装であることを確認する

**実行手順**:

1. `phase-2-design.md` を読み込む
2. 設計で定めた修正方針（SkillImportDialog 側の変更、`skill.id` → `skill.name`）が遵守されていることを確認する
3. 変更が設計のスコープ内に収まっていること（不要な変更がないこと）を確認する

**設計準拠チェックリスト**:

| チェック項目         | 確認内容                                                                             | 結果 |
| -------------------- | ------------------------------------------------------------------------------------ | ---- |
| 修正箇所の限定       | SkillImportDialog、AgentView、テストファイルの3ファイルのみが変更されていること      | -    |
| IPC ハンドラー未変更 | Main Process 側の skill:import ハンドラーに変更がないこと                            | -    |
| Preload API 未変更   | `skill-api.ts` に変更がないこと                                                      | -    |
| データフロー維持     | SkillImportDialog → AgentView → agentSlice → IPC → Main の流れが設計どおりであること | -    |

**変更ファイル確認コマンド**:

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260221-180017-wt1 && git diff --stat main...HEAD
```

**期待される成果物**:

- `outputs/phase-10/design-review.md`

---

### タスク3: テスト品質レビュー

**目的**: テストが十分な品質であること（カバレッジ、境界値、異常系）を確認する

**実行手順**:

1. `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` を読み込む
2. テストケースの網羅性を確認する
3. Phase 7 のカバレッジ結果を確認する

**テストケース分類確認**:

| テスト分類                     | 確認内容                                                                                          | テストケース有無 |
| ------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------- |
| 正常系: スキル選択・インポート | `skill.name` が `onImport` に渡されることを検証するテスト                                         | -                |
| 正常系: 複数スキル選択         | 複数スキル選択時に全ての `skill.name` が配列で渡されることを検証するテスト                        | -                |
| 正常系: インポート済みスキル   | インポート済みスキルが選択不可であることを検証するテスト                                          | -                |
| 正常系: 検索フィルタリング     | 検索でスキルが絞り込まれることを検証するテスト                                                    | -                |
| 異常系: 空選択                 | 0件選択時にインポートボタンが無効であることを検証するテスト                                       | -                |
| 境界値: スキル名が空文字列     | `skill.name` が空文字列の場合の挙動を検証するテスト（存在する場合）                               | -                |
| 回帰: 既存機能                 | ダイアログの開閉、Escape キーでの閉じ、オーバーレイクリックでの閉じが動作することを検証するテスト | -                |

**カバレッジサマリー**（Phase 7 の結果を転記）:

| 指標              | 最低基準 | 推奨基準 | 実績 | 判定 |
| ----------------- | -------- | -------- | ---- | ---- |
| Line Coverage     | 80%      | 90%      | -    | -    |
| Branch Coverage   | 60%      | 70%      | -    | -    |
| Function Coverage | 80%      | 90%      | -    | -    |

**期待される成果物**:

- `outputs/phase-10/test-quality-review.md`

---

### タスク4: コード品質レビュー

**目的**: 命名規約、型安全性、エラーハンドリングの品質を確認する

**実行手順**:

1. 修正対象3ファイルを読み込む
2. 以下のコード品質チェックリストに基づいて確認する
3. Phase 8 のリファクタリング結果を確認する
4. Phase 9 の品質ゲート結果を確認する

**コード品質チェックリスト**:

| チェック項目             | 確認内容                                                                | 結果 |
| ------------------------ | ----------------------------------------------------------------------- | ---- |
| 命名規約: 変数名         | 変数名が実際の値のセマンティクスと一致しているか（P45 対策）            | -    |
| 命名規約: boolean        | boolean 変数に `is`/`has`/`can`/`should` プレフィックスが使われているか | -    |
| 型安全性: any 不使用     | `any` 型が使われていないか                                              | -    |
| 型安全性: as 最小化      | 型アサーション（`as`）が最小限であるか                                  | -    |
| 型安全性: 型キャスト理由 | `as unknown as Skill[]` に対するコメントまたは未タスク記録があるか      | -    |
| エラーハンドリング       | `handleImport` の catch ブロックがエラーを上位に伝播しているか          | -    |
| 未使用 import            | 未使用の import がないか                                                | -    |
| コメント品質             | コメントが実装と乖離していないか                                        | -    |

**期待される成果物**:

- `outputs/phase-10/code-quality-review.md`

---

### タスク5: セキュリティ・IPC 契約レビュー

**目的**: P44/P45 パターンの再発がないこと、IPC 契約が整合していることを確認する

**実行手順**:

1. SkillImportDialog → AgentView → agentSlice → Preload API → Main Process のデータフローを端から端まで追跡する
2. 各レイヤーで渡される値が「スキル名（`skill.name`）」であることを確認する
3. Main Process ハンドラーの3段バリデーション（P42 準拠）を確認する
4. Phase 9 の IPC 契約レポートを確認する

**データフロー全体確認**:

```
SkillImportDialog
  └─ onImport(Array.from(selectedIds))  ← ここが skill.id から skill.name に修正されたことを確認
      └─ AgentView.handleImport(skillNames)
          └─ for (const skillName of skillNames)
              └─ importSkillAction(skillName)
                  └─ agentSlice.importSkill(skillName)
                      └─ window.electronAPI.skill.importSkill(skillName)
                          └─ safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)
                              └─ ipcMain.handle("skill:import", (event, skillName) => ...)
                                  └─ skillService.importSkills([skillName])
                                      └─ getSkillByName(skillName)  ← skill.name と比較して一致
```

**セキュリティチェックリスト**:

| チェック項目       | 確認内容                                                                                                | 結果 |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ---- |
| P44 再発確認       | skill:import ハンドラーの引数形式と Preload 呼び出しが一致しているか                                    | -    |
| P45 再発確認       | 全レイヤーの引数名が `skillName`（スキル名）を示すセマンティクスか                                      | -    |
| P42 バリデーション | Main Process で `typeof skillName !== "string" \|\| skillName.trim() === ""` チェックが実装されているか | -    |
| チャンネル定数     | `IPC_CHANNELS.SKILL_IMPORT` 定数が使用されていること（ハードコード文字列でないこと）                    | -    |
| 送信元検証         | `validateIpcSender` が呼び出されていること                                                              | -    |

**期待される成果物**:

- `outputs/phase-10/security-ipc-review.md`

---

### タスク6: 最終判定

**目的**: タスク1〜5の結果を統合し、最終判定（PASS/MINOR/MAJOR/CRITICAL）を決定する

**実行手順**:

1. タスク1〜5の結果を統合する
2. 指摘事項を重要度別に分類する
3. 判定結果を決定する
4. MINOR 判定の場合は未タスク仕様書を作成する

**判定基準**:

| 判定     | 条件                                     | 次のアクション                                      |
| -------- | ---------------------------------------- | --------------------------------------------------- |
| PASS     | 全レビュー観点で問題なし                 | Phase 11 へ進行                                     |
| MINOR    | 軽微な指摘あり（機能に影響なし）         | 未タスク仕様書に変換後、Phase 11 へ（**省略不可**） |
| MAJOR    | 重大な問題あり（セキュリティ・機能影響） | 影響範囲に応じて Phase 1-5 へ戻る                   |
| CRITICAL | 致命的な問題あり（データ漏洩リスク）     | Phase 1 へ戻り要件再確認                            |

**MINOR 判定時の未タスク化手順**（省略不可）:

1. 指摘内容を `docs/30-workflows/skill-import-id-mismatch-fix/tasks/unassigned-task/` に指示書として作成する
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**戻り先決定基準**:

| 問題の種類                       | 戻り先                      |
| -------------------------------- | --------------------------- |
| 要件の不足・誤り                 | Phase 1（要件定義）         |
| 設計の問題（データフロー不整合） | Phase 2（設計）             |
| テスト不足                       | Phase 4（テスト作成）       |
| 実装の問題（ロジックエラー）     | Phase 5（実装）             |
| コード品質の問題                 | Phase 8（リファクタリング） |

**レビュー結果サマリー**:

| レビュー観点              | 結果 | 指摘事項 |
| ------------------------- | ---- | -------- |
| 1. 要件充足               | -    | -        |
| 2. 設計準拠               | -    | -        |
| 3. テスト品質             | -    | -        |
| 4. コード品質             | -    | -        |
| 5. セキュリティ・IPC 契約 | -    | -        |
| **最終判定**              | -    | -        |

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

---

## 参照資料

| 参照資料               | パス                                                                                                    | 内容                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------- |
| SkillImportDialog 実装 | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/index.tsx`                            | 修正対象コンポーネント  |
| AgentView 実装         | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                   | 修正対象ビュー          |
| テストファイル         | `apps/desktop/src/renderer/components/organisms/SkillImportDialog/__tests__/SkillImportDialog.test.tsx` | テストコード            |
| Preload API            | `apps/desktop/src/preload/skill-api.ts`                                                                 | Preload API 実装        |
| IPC ハンドラー         | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                            | Main Process ハンドラー |
| Phase 1 要件定義       | `phase-1-requirements.md`                                                                               | 要件                    |
| Phase 2 設計           | `phase-2-design.md`                                                                                     | 設計                    |
| Phase 5 実装結果       | `phase-5-implementation.md`                                                                             | 実装完了内容            |
| Phase 7 カバレッジ     | `outputs/phase-7/`                                                                                      | カバレッジ結果          |
| Phase 9 品質ゲート     | `outputs/phase-9/quality-gate-result.md`                                                                | 品質検証結果            |
| Lintレポート           | `outputs/phase-9/lint-report.md`                                                                        | Phase 9 成果物          |
| 型チェックレポート     | `outputs/phase-9/typecheck-report.md`                                                                   | Phase 9 成果物          |
| テスト実行レポート     | `outputs/phase-9/test-report.md`                                                                        | Phase 9 成果物          |
| IPC契約整合性レポート  | `outputs/phase-9/ipc-contract-report.md`                                                                | Phase 9 成果物          |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                        |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------- |
| スキルインターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | skill:import チャンネル契約 |
| 状態管理仕様               | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | agentSlice 設計             |
| IPC契約チェックリスト      | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | IPC引数の整合性確認手順     |
| 既知の落とし穴             | `.claude/rules/06-known-pitfalls.md`                                              | P39, P40, P44, P45          |
| 開発ガイドライン           | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`     | コーディング規約            |
| 品質要件                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 品質基準                    |

---

## 成果物

| 成果物                     | パス                                      | 内容                                  |
| -------------------------- | ----------------------------------------- | ------------------------------------- |
| 要件充足レビュー           | `outputs/phase-10/requirements-review.md` | 要件充足の検証結果                    |
| 設計準拠レビュー           | `outputs/phase-10/design-review.md`       | 設計準拠の検証結果                    |
| テスト品質レビュー         | `outputs/phase-10/test-quality-review.md` | テスト品質の検証結果                  |
| コード品質レビュー         | `outputs/phase-10/code-quality-review.md` | コード品質の検証結果                  |
| セキュリティ・IPC レビュー | `outputs/phase-10/security-ipc-review.md` | セキュリティ・IPC 契約の検証結果      |
| 最終判定                   | `outputs/phase-10/final-review-result.md` | 判定結果（PASS/MINOR/MAJOR/CRITICAL） |

---

## 統合テスト連携【必須】

| 確認項目       | 基準                                                                                              |
| -------------- | ------------------------------------------------------------------------------------------------- |
| Phase 1/2 接続 | 要件と設計の一致                                                                                  |
| Phase 5 接続   | 実装結果の検証                                                                                    |
| Phase 7 接続   | カバレッジ基準の達成                                                                              |
| Phase 9 接続   | 品質ゲート全項目 PASS                                                                             |
| データフロー   | SkillImportDialog(skill.name) → AgentView → agentSlice → IPC → getSkillByName(skillName) の一貫性 |

---

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React 実装の場合         | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer 連携の場合    | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

---

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施（タスク1〜6）
3. 統合テスト連携の確認
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json 更新方針が明記されている
- [ ] Phase 末端で完了を明記している

---

## 完了条件

- [ ] 要件充足レビューで Phase 1 の全要件が充足されていること
- [ ] 設計準拠レビューで変更が設計スコープ内であること
- [ ] テスト品質レビューでカバレッジ基準を達成していること
- [ ] コード品質レビューで命名規約・型安全性が確保されていること
- [ ] セキュリティ・IPC 契約レビューで P44/P45 パターンの再発がないこと
- [ ] 最終判定が PASS または MINOR であること
- [ ] MINOR 判定の場合は未タスク仕様書が3ステップ全完了で作成されていること
- [ ] **本 Phase 内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（6ファイル）が全て生成されていることを確認
- [ ] 判定結果が PASS/MINOR であることを確認

---

## 依存関係

- **前提**: Phase 9 が完了していること
- **後続**: Phase 11（手動テスト検証）へ進む（PASS/MINOR の場合）

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-id-mismatch-fix/phase-11-manual-test.md`
