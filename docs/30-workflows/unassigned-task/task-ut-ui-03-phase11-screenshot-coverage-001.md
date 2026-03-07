# UT-UI-03-PHASE11-SCREENSHOT-COVERAGE-001: Phase 11 スクリーンショット証跡カバレッジ補完

## メタ情報

```yaml
issue_number: 1034
```

## メタ情報

| 項目         | 値                                            |
| ------------ | --------------------------------------------- |
| タスクID     | UT-UI-03-PHASE11-SCREENSHOT-COVERAGE-001      |
| タスク名     | Phase 11 スクリーンショット証跡カバレッジ補完 |
| 親タスクID   | TASK-UI-03-AGENT-VIEW-ENHANCEMENT             |
| 分類         | ドキュメント                                  |
| 対象機能     | Phase 11 手動テスト証跡                       |
| 優先度       | 中                                            |
| 見積もり規模 | 小規模                                        |
| ステータス   | 未実施                                        |
| 発見元       | Phase 11/12 再検証                            |
| 発見日       | 2026-03-07                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-03 の Phase 11 手動テストで実施したテストケースの画面証跡（スクリーンショットまたは NON_VISUAL 根拠）が `manual-test-result.md` に未記載である。`validate-phase11-screenshot-coverage.js` による自動検証で、TC-02 / TC-03 / TC-04 / TC-05 / TC-07 / TC-10 の計6件について証跡行が不足していることが検出された。

### 1.2 問題点

| #   | 問題                 | 詳細                                                                                                                 |
| --- | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | 証跡不備             | 6件のテストケースについて、実施結果を裏付けるスクリーンショットまたは NON_VISUAL 根拠が記載されていない              |
| 2   | 品質保証の信頼性低下 | 証跡がないテストケースは「本当に実施したのか」をレビュアーが客観的に確認できず、品質保証プロセスの信頼性が損なわれる |

### 1.3 放置した場合の影響

- Phase 13 PR 作成時にレビュアーがテスト実施を確認できず、PR マージがブロックされる可能性がある
- `validate-phase11-screenshot-coverage.js` がエラーを返し続けるため、CI/ワークフローの完了判定が FAIL のまま残る
- 後続タスクで同様の証跡漏れが繰り返される（悪習の定着）

### 1.4 TASK-UI-03 実装時の苦戦箇所と教訓

- **一括報告書作成による漏れ**: Phase 11 手動テスト時に全 TC の証跡を逐次記録せず、テスト完了後に一括で報告書を作成したため、一部 TC の証跡記載が漏れた
- **validator のフォーマット厳密性**: `validate-phase11-screenshot-coverage.js` は行フォーマット（`| TC-XX | ...`）を厳密にチェックするため、テーブル行のフォーマット逸脱（列数の不一致、区切り文字の誤り等）も「未記載」として検出される
- **教訓**: Phase 11 では TC ごとにスクリーンショットを撮影し、即座に `manual-test-result.md` に記録する「逐次記録パターン」を推奨する。全 TC 完了後の一括記載は漏れリスクが高い

---

## 2. 何を達成するか（What）

1. 未記載の TC-02 / TC-03 / TC-04 / TC-05 / TC-07 / TC-10 について、`manual-test-result.md` に証跡行を追加する
2. 視覚検証が必要な TC にはスクリーンショットを追補する
3. 非視覚的な TC には `NON_VISUAL:` 形式で検証根拠を記載する
4. `validate-phase11-screenshot-coverage.js` の再実行でエラー 0 件を達成する

---

## 3. どう実装するか（How）

### Step 1: manual-test-result.md に TC 行追加

`docs/30-workflows/agent-view-enhancement/outputs/phase-11/manual-test-result.md` の証跡テーブルに、不足している TC-02 / TC-03 / TC-04 / TC-05 / TC-07 / TC-10 の行を追加する。テーブルフォーマットは既存行に合わせる。

### Step 2: 視覚検証 TC のスクリーンショット追補

視覚的な確認が必要な TC（UI レイアウト、表示内容の検証等）については、アプリを起動してスクリーンショットを撮影し、`docs/30-workflows/agent-view-enhancement/outputs/phase-11/screenshots/` に保存する。ファイル名は `TC-XX-description.png` 形式とする。

### Step 3: 非視覚 TC の NON_VISUAL 根拠記載

純粋にロジックやデータの検証で視覚的な証跡が不要な TC（例: TC-10）については、証跡列に `NON_VISUAL: <検証根拠の説明>` 形式で、テスト実施の根拠を明記する。

### Step 4: validator 再実行で確認

以下のコマンドを実行し、エラー 0 件であることを確認する:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/agent-view-enhancement \
  --allow-non-visual-tc TC-10 --json
```

---

## 4. 影響範囲

| ファイル/ディレクトリ                                                             | 変更内容                                         |
| --------------------------------------------------------------------------------- | ------------------------------------------------ |
| `docs/30-workflows/agent-view-enhancement/outputs/phase-11/manual-test-result.md` | TC 証跡行の追加                                  |
| `docs/30-workflows/agent-view-enhancement/outputs/phase-11/screenshots/`          | スクリーンショット画像の追加（視覚検証 TC のみ） |

---

## 5. 参照資料

- `docs/30-workflows/agent-view-enhancement/outputs/phase-11/manual-test-result.md` - 現在の手動テスト結果
- `.claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js` - 証跡カバレッジ検証スクリプト
- `.claude/skills/task-specification-creator/references/phase-templates.md` - Phase 11 テンプレート
- `docs/30-workflows/agent-view-enhancement/phase-11-manual-test.md` - Phase 11 手動テスト仕様書

---

## 6. 完了条件

- [ ] TC-02 / TC-03 / TC-04 / TC-05 / TC-07 / TC-10 の証跡行が `manual-test-result.md` に記載されている
- [ ] 視覚検証 TC のスクリーンショットが `screenshots/` に保存されている
- [ ] 非視覚 TC に `NON_VISUAL:` 形式の根拠が記載されている
- [ ] `validate-phase11-screenshot-coverage.js` の実行結果がエラー 0 件である
- [ ] テーブルフォーマットが既存行と統一されている
