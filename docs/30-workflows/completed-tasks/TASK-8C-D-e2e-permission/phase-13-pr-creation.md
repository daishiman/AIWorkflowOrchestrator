# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 13                       |
| Phase名    | PR作成                   |
| 前提Phase  | Phase 12                 |
| 後続Phase  | -                        |
| ステータス | 未実施                   |
| 作成日     | 2026-02-02               |
| 機能名     | TASK-8C-D-e2e-permission |

---

## 目的

E2Eテスト実装の全成果物をまとめ、Pull Request を作成してコードレビューを依頼する。

## 背景

Phase 1〜12 で全ての実装・テスト・ドキュメントが完了した。最後にPRを作成し、メインブランチへのマージ準備を行う。

**重要**: PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 変更内容の確認

**目的**: PRに含める変更内容を最終確認する

**実行手順**:

1. git status で変更ファイルを確認

   ```bash
   git status
   ```

2. 変更ファイル一覧を作成

   | ファイル                                            | 変更種別 | 内容              |
   | --------------------------------------------------- | -------- | ----------------- |
   | `apps/desktop/src/__tests__/skillPermission.e2e.ts` | 新規     | E2Eテストファイル |
   | `docs/30-workflows/.../TASK-8C-D-e2e-permission/`   | 新規     | タスク仕様書      |
   | `.claude/skills/aiworkflow-requirements/...`        | 更新     | システム仕様      |

3. 不要なファイルが含まれていないか確認
   - .env ファイルや認証情報が含まれていないこと
   - 一時ファイル（.tmp/）が含まれていないこと

**期待される成果物**:

- 変更ファイル一覧の確認

---

### タスク2: コミット作成

**目的**: 変更内容をコミットする

**実行手順**:

1. 変更をステージング

   ```bash
   git add apps/desktop/src/__tests__/skillPermission.e2e.ts
   git add docs/30-workflows/skill-import-agent-system/tasks/TASK-8C-D-e2e-permission/
   git add .claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md
   git add .claude/skills/aiworkflow-requirements/LOGS.md
   git add .claude/skills/task-specification-creator/LOGS.md
   ```

2. コミットメッセージ作成

   ```bash
   git commit -m "$(cat <<'EOF'
   test(e2e): 権限ダイアログE2Eテスト実装 (TASK-8C-D)

   - 権限ダイアログの5つの基本テストケースを実装
   - エッジケース・異常系・アクセシビリティテストを追加
   - E2Eテスト仕様書を更新

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   EOF
   )"
   ```

**期待される成果物**:

- コミットが作成されている

---

### タスク3: PR本文作成

**目的**: PRの説明文を作成する

**実行手順**:

1. PR本文テンプレート

   ```markdown
   ## Summary

   - 権限ダイアログのE2Eテスト（TASK-8C-D）を実装
   - 5つの基本テストケース + エッジケース + アクセシビリティテストを追加
   - E2Eテスト仕様書（quality-e2e-testing.md）を更新

   ## Test plan

   - [ ] `pnpm --filter @repo/desktop test:e2e -- skillPermission` で全テストPASS
   - [ ] TypeScript / ESLint エラーなし
   - [ ] ヘッドフルモードで視覚的動作確認

   ## Related

   - 依存タスク: TASK-7D (ChatPanel統合), TASK-8C-E (フィクスチャ)
   - 関連Issue: #XXX (あれば)

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```

**期待される成果物**:

- PR本文が作成されている

---

### タスク4: PR作成（ユーザー許可後）

**目的**: Pull Request を作成する

**⚠️ 重要**: このタスクはユーザーの明示的な許可を得てから実行すること。

**実行手順**:

1. ユーザーに許可を確認

2. 許可を得たらPR作成

   ```bash
   gh pr create --title "test(e2e): 権限ダイアログE2Eテスト実装 (TASK-8C-D)" --body "$(cat <<'EOF'
   ## Summary
   - 権限ダイアログのE2Eテスト（TASK-8C-D）を実装
   - 5つの基本テストケース + エッジケース + アクセシビリティテストを追加
   - E2Eテスト仕様書（quality-e2e-testing.md）を更新

   ## Test plan
   - [ ] `pnpm --filter @repo/desktop test:e2e -- skillPermission` で全テストPASS
   - [ ] TypeScript / ESLint エラーなし
   - [ ] ヘッドフルモードで視覚的動作確認

   ## Related
   - 依存タスク: TASK-7D (ChatPanel統合), TASK-8C-E (フィクスチャ)

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

3. PR URLを記録

**期待される成果物**:

- PR が作成されている（または作成準備完了）

---

### タスク5: CI確認

**目的**: CI/CDパイプラインの実行結果を確認する

**実行手順**:

1. GitHub Actions の実行状況を確認

   ```bash
   gh pr checks
   ```

2. 結果記録

   | チェック項目 | 結果 | 備考 |
   | ------------ | ---- | ---- |
   | TypeScript   | [ ]  |      |
   | ESLint       | [ ]  |      |
   | Unit Tests   | [ ]  |      |
   | E2E Tests    | [ ]  |      |

3. 失敗があれば修正

**期待される成果物**:

- CI チェックが全て PASS

---

## 参照資料

| 参照資料        | パス                   | 内容               |
| --------------- | ---------------------- | ------------------ |
| Phase 12 成果物 | `outputs/phase-12/`    | ドキュメント       |
| コミット規約    | プロジェクト規約に従う | コミットメッセージ |

---

## 成果物

| 成果物   | パス           | 内容         |
| -------- | -------------- | ------------ |
| コミット | Git履歴        | 変更コミット |
| PR       | GitHub         | Pull Request |
| CI結果   | GitHub Actions | チェック結果 |

---

## 完了条件

- [ ] 変更内容が確認されている
- [ ] コミットが作成されている
- [ ] PR本文が作成されている
- [ ] PR が作成されている（ユーザー許可後）
- [ ] CI チェックが全て PASS している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスク1: 変更内容の確認
3. 実行タスク2: コミット作成
4. 実行タスク3: PR本文作成
5. 実行タスク4: PR作成（ユーザー許可後）
6. 実行タスク5: CI確認
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] PR URLをユーザーに報告

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了

PR作成後、以下の作業でタスクを完了とする:

1. PRがマージされる
2. タスク仕様書を `completed-tasks/` に移動（必要に応じて）
3. タスク完了を記録

---

## 注意事項

- **PR作成は自動実行しない**: 必ずユーザーの明示的な許可を得てから実行
- **マージはユーザーが手動実行**: GitHub UI でマージを行う
- **CI失敗時は修正**: 失敗したチェックを修正してから再度確認
