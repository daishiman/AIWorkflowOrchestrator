# Phase 13: PR作成

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 13                                |
| 機能名 | DEBT-SEC-001-auth-state-parameter |
| 作成日 | 2026-02-05                        |
| 状態   | 未着手                            |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

**注意: PR作成は必ずユーザーの明示的な許可を得てから実行すること。**

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

---

### 1. ユーザーにローカル動作確認を依頼【必須】

```
以下の動作確認をお願いします:
1. pnpm --filter @repo/desktop dev でアプリを起動
2. Googleログインボタンをクリックして認証を完了
3. DevToolsコンソールでstate検証ログが出力されることを確認
4. 正常にログインが完了することを確認
```

### 2. 変更サマリーの提示と許可確認【必須】

**変更サマリー**:

| カテゴリ       | 変更内容                                                    |
| -------------- | ----------------------------------------------------------- |
| 新規ファイル   | `apps/desktop/src/main/infrastructure/stateManager.ts`      |
| 変更ファイル   | `apps/desktop/src/main/ipc/authHandlers.ts`（state生成）    |
| 変更ファイル   | `apps/desktop/src/main/index.ts`（state検証）               |
| テストファイル | `apps/desktop/src/main/infrastructure/stateManager.test.ts` |
| ドキュメント   | タスク仕様書（Phase 1-13）                                  |
| ドキュメント   | 実装ガイド・品質レポート等の成果物                          |

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# ブランチ作成（既存の場合はスキップ）
git checkout -b fix/debt-sec-001-auth-state-parameter

# 変更をステージング
git add apps/desktop/src/main/infrastructure/stateManager.ts
git add apps/desktop/src/main/infrastructure/stateManager.test.ts
git add apps/desktop/src/main/ipc/authHandlers.ts
git add apps/desktop/src/main/index.ts
git add docs/30-workflows/DEBT-SEC-001-auth-state-parameter/

# コミット
git commit -m "fix(auth): OAuth state parameter検証実装によるCSRF対策 (DEBT-SEC-001)

- StateManagerモジュール新規作成（state生成・検証・有効期限・クリーンアップ）
- authHandlers.tsにstate生成・OAuth URL付与を追加
- index.tsにコールバック受信時のstate検証を追加
- StateManager単体テスト追加

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# プッシュ
git push -u origin fix/debt-sec-001-auth-state-parameter

# PR作成
gh pr create --title "fix(auth): OAuth state parameter検証実装によるCSRF対策 (DEBT-SEC-001)" --body "$(cat <<'EOF'
## Summary
- OAuth認証フローにState parameter検証を実装し、CSRF攻撃を防止
- RFC 6749 Section 10.12準拠のセキュリティベストプラクティスを適用
- StateManagerモジュール（生成・検証・有効期限・ワンタイムユース・クリーンアップ）

## Test plan
- [ ] StateManager単体テスト全件パス
- [ ] TypeScript型チェックエラーゼロ
- [ ] ESLintエラーゼロ
- [ ] Google OAuth手動テスト（正常系）
- [ ] 不正state手動テスト（異常系）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/DEBT-SEC-001-auth-state-parameter/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep DEBT-SEC-001

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): DEBT-SEC-001をcompleted-tasksに移動"
git push
```

## タスク完了

DEBT-SEC-001の全13 Phaseが完了しました。OAuth認証フローにState parameter検証（CSRF対策）が実装され、RFC 6749準拠のセキュリティが確保されます。

---

## 参照資料

| 参照資料     | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |
| 全成果物     | `artifacts.json`                              | 成果物追跡     |

---

## 実行手順

1. ユーザーにローカル動作確認を依頼する
2. 変更サマリーを提示しPR作成の許可を得る
3. PR作成を実行する（`/ai:diff-to-pr` またはフォールバック）
4. CI/CD通過を確認する
5. タスクディレクトリをcompleted-tasksに移動する

---

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |

---

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

---

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] PR情報が outputs/phase-13/ に配置されている
- [ ] タスクディレクトリが `docs/30-workflows/completed-tasks/` に移動されている
- [ ] レビュー準備が完了している
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. ユーザーへのローカル動作確認依頼
3. 変更サマリー提示とPR作成許可取得
4. PR作成（`/ai:diff-to-pr` またはフォールバック）
5. CI/CD通過確認
6. タスクディレクトリのcompleted-tasks移動
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/DEBT-SEC-001-auth-state-parameter --phase 13
```

---

## 次のPhase

なし（ワークフロー完了）
