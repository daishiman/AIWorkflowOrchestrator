# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 13                     |
| Phase名    | PR作成                 |
| 前提Phase  | Phase 12               |
| 後続Phase  | なし（完了）           |
| ステータス | 未実施                 |
| 作成日     | 2026-01-11             |
| 機能名     | スキル管理バックエンド |

---

## 目的

実装内容をPull Requestとして作成し、コードレビューの準備を整える。PR完了後、タスクディレクトリをcompleted-tasksに移動する。

## 背景

ドキュメント更新が完了し、機能実装が完成した。mainブランチへのマージに向けてPRを作成する。

---

## ⚠️ PR作成に関する重要な注意【必須確認】

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項                                     | 理由                                           |
| -------------------------------------------- | ---------------------------------------------- |
| 勝手にPRを作成する                           | レビュー前の変更がリモートに反映されてしまう   |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする                   | 動作確認されていないコードがPRに含まれる       |

---

## タスク完了フロー

```
Phase 1〜12 完了
    ↓
【必須】ローカルでの動作確認
    ↓
【必須】ユーザーにPR作成の許可を確認
    ↓
ユーザー許可後: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
（該当する場合）元の未タスク指示書を削除
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ローカル確認チェックリスト【PR作成前に必須】

**目的**: PR作成前の最終確認を行う

**PR作成前に以下を必ず確認すること:**

| #   | 確認項目                       | コマンド                                     | 結果      |
| --- | ------------------------------ | -------------------------------------------- | --------- |
| 1   | ビルドが成功する               | `pnpm --filter @repo/desktop build`          | PASS/FAIL |
| 2   | 全テストがパスする             | `pnpm --filter @repo/desktop test`           | PASS/FAIL |
| 3   | 型チェックがパスする           | `pnpm --filter @repo/desktop typecheck`      | PASS/FAIL |
| 4   | Lintエラーがない               | `pnpm --filter @repo/desktop lint`           | PASS/FAIL |
| 5   | 実際の動作確認（該当する場合） | `pnpm --filter @repo/desktop dev` で手動確認 | PASS/FAIL |

**実行手順**:

1. 全テストが成功することを確認する:

```bash
pnpm --filter @repo/desktop test
```

2. ビルドが成功することを確認する:

```bash
pnpm --filter @repo/desktop build
```

3. 型チェックが成功することを確認する:

```bash
pnpm --filter @repo/desktop typecheck
```

4. Lintチェックが成功することを確認する:

```bash
pnpm --filter @repo/desktop lint
```

5. **全項目PASSの場合のみ**、タスク2へ進む

**期待される成果物**:

- `outputs/phase-13/final-check.md`

---

### タスク2: コミット整理

**目的**: コミット履歴を整理する（必要に応じて）

**実行手順**:

1. コミット履歴を確認する:

```bash
git log --oneline -20
```

2. 必要に応じてコミットメッセージを確認する:

| コミット  | 内容                     |
| --------- | ------------------------ |
| feat:     | 新機能の追加             |
| fix:      | バグ修正                 |
| test:     | テストの追加・修正       |
| docs:     | ドキュメントの追加・修正 |
| refactor: | リファクタリング         |

3. コミットが適切にカテゴライズされていることを確認する

**期待される成果物**:

- コミット履歴の確認完了

---

### タスク3: PR作成（/ai:diff-to-pr）【ユーザー許可必須】

**目的**: ユーザーの許可を得てからPR作成ワークフローを実行する

**⚠️ 重要**: このタスクは**ユーザーの明示的な許可を得てから**実行すること

**実行手順**:

1. **ユーザーに確認する**:

   ```
   タスク1のローカル確認が全てPASSしました。
   PR作成を実行してもよろしいですか？
   ```

2. **ユーザーの許可を得た後にのみ**、`/ai:diff-to-pr` コマンドを実行する:

```
/ai:diff-to-pr task/agent-003-skill-management-backend
```

3. ワークフローが以下を自動実行する:
   - 差分分析
   - PR本文生成
   - PR作成
   - 補足コメント投稿
   - CI/CD完了確認

4. PR URLを記録する

**期待される成果物**:

- 作成されたPR

---

### タスク4: PR内容確認

**目的**: 作成されたPRの内容を確認する

**実行手順**:

1. PR本文を確認する:

| 確認項目       | チェック |
| -------------- | -------- |
| タイトルが適切 | ✓        |
| 概要が明確     | ✓        |
| 変更点が記載   | ✓        |
| テスト方法記載 | ✓        |

2. 変更ファイルを確認する:

```markdown
## 変更ファイル一覧

### 新規追加

- `apps/desktop/src/main/services/skill/SkillScanner.ts`
- `apps/desktop/src/main/services/skill/SkillParser.ts`
- `apps/desktop/src/main/services/skill/SkillImportManager.ts`
- `apps/desktop/src/main/services/skill/SkillService.ts`
- `apps/desktop/src/main/services/skill/index.ts`
- `apps/desktop/src/main/services/skill/__tests__/*.test.ts`
- `packages/shared/src/types/agent.ts`（更新）

### IPC関連

- `apps/desktop/src/main/ipc/agentHandlers.ts`
- `apps/desktop/src/preload/preload.ts`（更新）
```

3. CI/CDステータスを確認する:

| チェック項目 | ステータス |
| ------------ | ---------- |
| Build        | PASS       |
| Test         | PASS       |
| Lint         | PASS       |
| TypeCheck    | PASS       |

**期待される成果物**:

- `outputs/phase-13/pr-review.md`

---

### タスク5: レビュー依頼

**目的**: コードレビューを依頼する

**実行手順**:

1. レビュアーを設定する（該当する場合）

2. レビューポイントをコメントする:

```markdown
## レビューポイント

### 重点確認箇所

1. **セキュリティ**: パストラバーサル防止、IPC sender検証
2. **型定義**: Skill, Anchor型の設計
3. **永続化**: electron-storeの使用方法
4. **テスト**: カバレッジと品質

### 設計判断

- SKILL.md解析はフロントマター + マークダウンセクション方式を採用
- キャッシュはメモリ内で管理（永続化はimport状態のみ）
- IPC経由での直接呼び出しを許可（セキュリティ検証済み）
```

**期待される成果物**:

- レビュー依頼完了

---

### タスク6: タスク完了報告

**目的**: タスクの完了を報告する

**実行手順**:

1. 完了報告を作成する:

```markdown
## タスク完了報告

### タスクID: AGENT-003

### タスク名: スキル管理バックエンド

### 完了日: YYYY-MM-DD

### PR: #XXX

### 成果物

#### 実装

| コンポーネント     | ファイル                                                     |
| ------------------ | ------------------------------------------------------------ |
| SkillScanner       | `apps/desktop/src/main/services/skill/SkillScanner.ts`       |
| SkillParser        | `apps/desktop/src/main/services/skill/SkillParser.ts`        |
| SkillImportManager | `apps/desktop/src/main/services/skill/SkillImportManager.ts` |
| SkillService       | `apps/desktop/src/main/services/skill/SkillService.ts`       |
| IPC Handlers       | `apps/desktop/src/main/ipc/agentHandlers.ts`                 |

#### テスト

| テストファイル             | カバレッジ |
| -------------------------- | ---------- |
| SkillScanner.test.ts       | XX%        |
| SkillParser.test.ts        | XX%        |
| SkillImportManager.test.ts | XX%        |
| SkillService.test.ts       | XX%        |
| integration.test.ts        | N/A        |

#### ドキュメント

| ドキュメント             | パス                                       |
| ------------------------ | ------------------------------------------ |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md` |
| APIリファレンス          | `outputs/phase-12/api-reference.md`        |
| SKILL.mdフォーマット仕様 | `outputs/phase-12/skill-md-format.md`      |
| トラブルシューティング   | `outputs/phase-12/troubleshooting.md`      |

### 品質指標

| 指標              | 値  |
| ----------------- | --- |
| Line Coverage     | XX% |
| Branch Coverage   | XX% |
| Function Coverage | XX% |
| テスト数          | XX  |
| ESLintエラー      | 0   |
| 型エラー          | 0   |

### 次のステップ

- [ ] PRレビュー完了
- [ ] mainブランチへマージ
- [ ] フロントエンド統合（AGENT-004）
```

2. artifacts.jsonを最終更新する

**期待される成果物**:

- `outputs/phase-13/completion-report.md`
- 更新された`artifacts.json`

---

### タスク7: タスクディレクトリ移動【CI通過後】

**目的**: PR作成・CI通過後、タスクディレクトリをcompleted-tasksに移動する

**実行手順**:

1. CI/CDが全て通過していることを確認する

2. タスクディレクトリをcompleted-tasksに移動する:

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/agent-003-skill-management-backend/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep agent-003
```

3. 元の未タスク指示書を削除する（該当する場合）:

```bash
# 元の未タスク指示書が存在する場合は削除
rm -f docs/30-workflows/unassigned-task/task-agent-03-skill-management-backend.md
```

4. 変更をコミットする:

```bash
git add docs/30-workflows/
git commit -m "docs(workflows): agent-003-skill-management-backendをcompleted-tasksに移動"
git push
```

**期待される成果物**:

- `docs/30-workflows/completed-tasks/agent-003-skill-management-backend/` にタスクディレクトリが移動済み

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                    | 内容       |
| -------------- | --------------------------------------- | ---------- |
| PRワークフロー | `.claude/skills/ai:diff-to-pr/SKILL.md` | PR作成手順 |

---

## 成果物

| 成果物     | パス                                    | 内容             |
| ---------- | --------------------------------------- | ---------------- |
| 最終確認   | `outputs/phase-13/final-check.md`       | 最終チェック結果 |
| PRレビュー | `outputs/phase-13/pr-review.md`         | PR内容確認       |
| 完了報告   | `outputs/phase-13/completion-report.md` | タスク完了報告   |

---

## 完了条件

- [ ] 全テスト・ビルド・型チェック・Lintが成功している
- [ ] コミット履歴が整理されている
- [ ] **ユーザーにPR作成の許可を確認済み**
- [ ] PRが作成されている
- [ ] PR内容が確認されている
- [ ] CI/CDが成功している
- [ ] レビュー依頼が完了している
- [ ] タスク完了報告が作成されている
- [ ] **タスクディレクトリが `completed-tasks/` に移動済み**
- [ ] **（該当時）元の未タスク指示書が削除済み**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.json を更新

---

## ワークフロー完了

### 最終チェックリスト

- [ ] Phase 1-13 全て完了
- [ ] 全テストがPASS
- [ ] 全ドキュメントが作成済み
- [ ] ユーザーの許可を得てPRを作成済み
- [ ] CI/CDがPASS
- [ ] artifacts.jsonが最新
- [ ] タスクディレクトリが `completed-tasks/` に移動済み

### ワークフロー完了判定

| 判定     | 条件           | アクション                   |
| -------- | -------------- | ---------------------------- |
| COMPLETE | 全条件を満たす | タスク完了、mainへマージ待ち |
| PENDING  | PRレビュー待ち | レビュー対応後、再確認       |
| BLOCKED  | CI/CD失敗等    | 原因特定・修正後、再実行     |

---

## 依存関係

- **前提**: Phase 12（ドキュメント更新）が完了していること
- **後続**: なし（タスク完了）

---

## タスク完了後

PRがマージされた後、以下のタスクに進むことができます:

- **AGENT-004**: スキル管理フロントエンド
- **関連タスク**: スキルUI統合
