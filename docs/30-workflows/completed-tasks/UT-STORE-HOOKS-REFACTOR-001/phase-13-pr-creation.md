# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 13                                |
| Phase名    | PR作成                            |
| 前提Phase  | Phase 12 (ドキュメント更新)       |
| 後続Phase  | -（完了）                         |
| ステータス | pending                           |
| 作成日     | 2026-02-11                        |
| タスクID   | UT-STORE-HOOKS-REFACTOR-001       |
| 機能名     | Zustand Store Hooks無限ループ修正 |

---

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 背景

無限ループ修正は全Phaseが完了した状態で、バグ修正変更を本番ブランチにマージするためのPRを作成する。本タスクはバグ修正であり、機能追加はないため、リグレッションが発生していないことの確認が重要。

---

## 参照資料

| 参照資料         | パス                                          | 内容                   |
| ---------------- | --------------------------------------------- | ---------------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物         |
| 実装ガイド       | `outputs/phase-12/implementation-guide.md`    | 変更内容のドキュメント |
| ドキュメント更新 | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物         |

---

## 成果物

| 成果物 | パス                          | 内容           |
| ------ | ----------------------------- | -------------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL・CI結果 |

---

## 実行手順

## 統合テスト連携【必須】

PR作成前にCI統合テストを確認:

| 確認項目   | 基準                   |
| ---------- | ---------------------- |
| CI全テスト | 全てPASS               |
| カバレッジ | 基準達成               |
| 静的解析   | ESLint/TypeScript警告0 |
| E2Eテスト  | 全シナリオPASS         |

---

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

**ユーザーへの依頼内容**:

````markdown
## ローカル動作確認のお願い

PR作成前に、以下の動作確認をお願いします:

### 確認手順

1. 開発サーバーを起動
   ```bash
   pnpm --filter @repo/desktop dev
   ```
````

2. 以下の動作を確認
   - [ ] 設定画面を開いても無限ループしない（画面が固まらない）
   - [ ] 認証方式を切り替えても無限ループしない
   - [ ] LLM選択画面を開いても無限ループしない
   - [ ] スキル選択・実行が正常に動作する
   - [ ] DevToolsのConsoleにエラーが出ない

3. DevToolsでの確認（任意）
   - Console出力が安定していることを確認（繰り返しログがないこと）
   - React DevToolsでre-render回数が正常であることを確認

### 確認結果

確認完了後、PRを作成してよいかお知らせください。

````

---

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**変更サマリーテンプレート**:

```markdown
## 変更サマリー - UT-STORE-HOOKS-REFACTOR-001

### 概要

Zustand Store Hooksの無限ループ問題（P31）を修正

### 問題の概要

- `useAuthModeStore()` 等の合成Hookが毎回新しいオブジェクトを返す
- その中の関数を `useEffect` の依存配列に含めると無限ループが発生
- 設定画面がぐるぐる回り続ける、LLM/スキル選択が無限実行される症状

### 修正内容

| ファイル                 | 変更内容                                      |
| ------------------------ | --------------------------------------------- |
| 影響コンポーネント       | useRefによる初期化ガードを追加                |
| 依存配列                 | 空配列（[]）に変更                            |
| 06-known-pitfalls.md     | P31の解決策詳細を追記                         |

### 影響範囲

- **機能への影響**: なし（バグ修正のため）
- **パフォーマンス**: 改善（無限ループ解消でCPU負荷軽減）
- **テスト**: 全テストPASS確認済み

### PRを作成してもよろしいですか?
````

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

---

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。

```
/ai:diff-to-pr
```

---

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

---

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

```bash
# 1. 変更をステージング
git add apps/desktop/src/renderer/
git add .claude/rules/06-known-pitfalls.md
git add docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/

# 2. コミット
git commit -m "fix(store): Zustand Store Hooks無限ループ修正

- useRefによる初期化ガードパターンを実装
- useEffectの依存配列を空に変更
- P31の解決策詳細を追記

UT-STORE-HOOKS-REFACTOR-001

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

# 3. ブランチをプッシュ
git push -u origin fix/ut-store-hooks-refactor-001

# 4. PRを作成
gh pr create --title "fix(store): Zustand Store Hooks無限ループ修正" --body "$(cat <<'EOF'
## Summary

- Zustand Store Hooksの無限ループ問題（P31）を修正
- useRefによる初期化ガードパターンを実装
- 設定画面、LLM選択、スキル選択の無限ループを解消

## Test plan

- [ ] 設定画面を開いても無限ループしないことを確認
- [ ] 認証方式切り替えが正常に動作することを確認
- [ ] LLM選択・スキル選択が正常に動作することを確認
- [ ] 全自動テストがPASS
- [ ] 手動テスト全項目がPASS

## Related

- Fixes: P31 Zustand Store Hooks無限ループ
- Task: UT-STORE-HOOKS-REFACTOR-001

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## 成果物確認チェックリスト

PRを作成する前に、以下の成果物が揃っていることを確認してください。

### 必須成果物

| #   | 成果物                       | 確認項目                             | 確認 |
| --- | ---------------------------- | ------------------------------------ | ---- |
| 1   | 影響コンポーネント           | useRefガードが追加されている         | [ ]  |
| 2   | 依存配列                     | 空配列（[]）に変更されている         | [ ]  |
| 3   | 06-known-pitfalls.md         | P31の解決策詳細が追記されている      | [ ]  |
| 4   | implementation-guide.md      | Part 1 + Part 2 が作成されている     | [ ]  |
| 5   | unassigned-task-detection.md | 未タスク検出レポートが作成されている | [ ]  |
| 6   | 手動テスト結果               | 全テストケースがPASS                 | [ ]  |

### 実装詳細確認

```typescript
// 修正後のパターンが実装されていることを確認

// 1. useRefによる初期化ガード
const initRef = useRef(false);

useEffect(() => {
  if (!initRef.current) {
    initRef.current = true;
    // 初期化処理
  }
}, []); // 依存配列は空
```

---

## PR準備

### ブランチ名

```
fix/ut-store-hooks-refactor-001
```

### PRタイトル

```
fix(store): Zustand Store Hooks無限ループ修正
```

### PR本文テンプレート

```markdown
## Summary

- Zustand Store Hooksの無限ループ問題（P31）を修正
- useRefによる初期化ガードパターンを実装
- 設定画面、LLM選択、スキル選択の無限ループを解消

## Test plan

- [ ] 設定画面を開いても無限ループしないことを確認
- [ ] 認証方式切り替えが正常に動作することを確認
- [ ] LLM選択・スキル選択が正常に動作することを確認
- [ ] 全自動テストがPASS
- [ ] 手動テスト全項目がPASS

## Related

- Fixes: P31 Zustand Store Hooks無限ループ
- Task: UT-STORE-HOOKS-REFACTOR-001

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## 重要な注意事項

> **PRの作成はユーザーの明示的な許可を得てから実行すること**
>
> PRを作成する前に、必ずユーザーに以下を確認してください:
>
> 1. ローカル動作確認が完了していること
> 2. 変更サマリーの内容が適切であること
> 3. PR作成の許可

---

## PR作成フロー

```
Phase 13: PR作成
    ↓
1. ユーザーにローカル動作確認を依頼【必須】
    ↓
2. 変更サマリーを提示【必須】
    ↓
3. ユーザーの許可を取得【必須】
    ↓
4. /ai:diff-to-pr または手動でPR作成
    ↓
5. CI通過確認
    ↓
6. タスクディレクトリを completed-tasks/ に移動
    ↓
7. artifacts.json の status を "completed" に更新
    ↓
8. 変更をコミット・プッシュ
    ↓
ワークフロー完了
```

---

## タスク完了時の移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/UT-STORE-HOOKS-REFACTOR-001/ \
   docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep UT-STORE-HOOKS

# 3. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): UT-STORE-HOOKS-REFACTOR-001をcompleted-tasksに移動"
git push
```

---

## 完了条件チェックリスト

| #   | 項目                                               | 必須 |
| --- | -------------------------------------------------- | ---- |
| 1   | ユーザーにローカル動作確認を依頼している           | Yes  |
| 2   | 変更サマリーを提示しPR作成の許可を得ている         | Yes  |
| 3   | PRが作成されている                                 | Yes  |
| 4   | CIが全て通過している                               | Yes  |
| 5   | タスクディレクトリが `completed-tasks/` に移動済み | Yes  |
| 6   | `artifacts.json` の `status` が `"completed"`      | Yes  |
| 7   | Phase 12で検出した未タスクが記録済み               | Yes  |
| 8   | **本Phase内の全作業を100%完了**                    | Yes  |

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全作業を100%実行完了
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] タスクディレクトリが移動されている
- [ ] artifacts.jsonが更新されている

---

## 依存関係

- **前提**: Phase 12 が完了していること
- **後続**: なし（タスク完了）

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 13 実行記録

### PR情報

- PR URL: {{URL}}
- CI結果: {{PASS/FAIL}}
- マージ状態: {{Merged/Open}}

### タスク完了

- completed-tasks移動: {{完了/未完了}}
- artifacts.json更新: {{完了/未完了}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 全体振り返り

- 無限ループ修正により、設定画面・LLM選択・スキル選択が安定動作するようになった
- useRefガードパターンは短期解決策として有効
- 長期的には個別セレクタベースへの再設計を検討
```

---

## ワークフロー完了

Phase 13が完了したら、このタスクは完了です。

タスクディレクトリは以下に移動されます:
`docs/30-workflows/completed-tasks/UT-STORE-HOOKS-REFACTOR-001/`
