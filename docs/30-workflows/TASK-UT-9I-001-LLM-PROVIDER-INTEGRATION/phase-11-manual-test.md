# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 11                                          |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 10 PASS                               |
| 後続Phase  | Phase 12                                    |
| 作成日     | 2026-04-17                                  |
| ステータス | blocked                                     |

## タスク種別判定

**NON_VISUAL タスク**: 本タスクはUI/UX変更なし。Renderer側の新規UIを追加しない。

## 目的

実際の Anthropic API を使用して docs 生成が動作することを手動で確認する。

## 現在の到達状況

- `ANTHROPIC_API_KEY` がこのワークツリーでは未設定のため、実機 Anthropic API 検証は `BLOCKED`
- コード側の型チェックとユニットテストは別途 PASS 済み

## 検証環境セットアップ

```bash
# APIキー設定
# authKeyService が参照する設定済みキーを用意する

# アプリケーション起動
pnpm --filter @repo/desktop dev
```

## 実行タスク

1. `NON_VISUAL` 判定と blocked 理由を記録する
2. 実機検証が可能な場合のみシナリオ 1〜4 を実施する
3. 実行不可の場合は `manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` に blocked 証跡を集約する
4. Phase 12 へ渡す follow-up と視覚証跡不要判断を固定する

## 手動検証シナリオ

### シナリオ 1: 正常生成（AC-1 確認）

**手順**:

1. アプリケーションを起動する
2. 既存スキルを選択し「ドキュメント生成」を実行する
3. Anthropic API からの実レスポンスでドキュメントが生成されることを確認する

**期待結果**: 実際の LLM 生成テキストを含むドキュメントが生成される（`Generated content for:` の疑似テキストではない）

---

### シナリオ 2: APIキー未設定（AC-2 確認）

**手順**:

1. APIキーを未設定にした状態でアプリケーションを起動する
2. ドキュメント生成を試みる
3. エラーメッセージを確認する

**期待結果**: 「APIキーが設定されていません。設定画面でAPIキーを入力してください。」が表示される（英語のエラーではない）

---

### シナリオ 3: LLMDocQueryAdapter stub 排除確認（AC-7 確認）

**手順**:

```bash
grep -rn "Generated content for:" apps/desktop/src/main/services/skill/
```

**期待結果**: 0件（本番コードに疑似テキストが含まれていない）

---

### シナリオ 4: エラー回復可能性の確認（UI 目視確認）

**手順**:

1. `RATE_LIMIT` エラーが発生した場合の UI を確認する
2. `retryable: true` が Renderer に届いた場合の表示（再試行ボタン等）を確認する

**期待結果**: `retryable: true` が IPC で返却され、UI 側が再試行アクションを表示できる状態

---

## 3層評価

| 評価層   | 内容                                      | 結果    |
| -------- | ----------------------------------------- | ------- |
| Semantic | IPC 返却値が仕様通りの errorCode を含むか | BLOCKED |
| Visual   | NON_VISUAL タスクのため N/A（UI変更なし） | N/A     |
| AI UX    | エラーメッセージが日本語で分かりやすいか  | BLOCKED |

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。

## 統合テスト連携

- SubAgent-D が blocked 理由、実行可否、follow-up の記録整合を確認する

## 参照資料

- `phase-10-final-review.md`: Phase 11 着手条件
- `outputs/phase-1/acceptance-criteria.md`: AC-1〜AC-7
- `.claude/skills/task-specification-creator/references/phase-template-phase11.md`: docs-only / NON_VISUAL 基準

## 発見した HIGH 問題の処理

Phase 11 で HIGH 問題が発見された場合は `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/` に指示書を自動生成する。

## 成果物

- `outputs/phase-11/manual-test-result.md`: 手動テスト結果（シナリオ1〜4の確認結果）

## 完了条件

- [ ] シナリオ 1〜4 の全確認が完了している
- [ ] HIGH 問題が存在しないか、存在する場合は `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/` に記録されている
- [x] NON_VISUAL タスクとして `視覚証跡` セクションに N/A が明記されている

## タスク100%実行確認【必須】

- [ ] 検証環境セットアップ完了（APIキー設定確認）
- [ ] シナリオ 1（正常生成）確認完了
- [ ] シナリオ 2（APIキー未設定エラー）確認完了
- [ ] シナリオ 3（LLMDocQueryAdapter stub排除）確認完了
- [ ] シナリオ 4（エラー回復可能性）確認完了
- [ ] 手動テスト結果ログ出力完了

## 次Phase

Phase 12（ドキュメント更新）へ進む。
