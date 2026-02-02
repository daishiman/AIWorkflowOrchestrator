# topic-map.md 自動再生成フック - タスク指示書

## メタ情報

```yaml
issue_number: 655
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | task-imp-topic-map-auto-regeneration-001                   |
| タスク名     | topic-map.md 自動再生成フック                              |
| 分類         | 改善                                                       |
| 対象機能     | aiworkflow-requirements インデックス管理                   |
| 優先度       | 低                                                         |
| 見積もり規模 | 小規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | TASK-8A Phase 12 システム仕様書更新（topic-map再生成漏れ） |
| 発見日       | 2026-02-02                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

aiworkflow-requirementsスキルのtopic-map.mdは、136個の仕様書ファイルのトピック分類と行番号を管理するインデックスファイル。`node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` で再生成される。Phase 12のシステム仕様書更新時に毎回手動で再生成する必要があるが、TASK-8AやTASK-8C-Gなど複数のタスクで再生成漏れが発生した。

### 1.2 問題点・課題

- Phase 12実行時にtopic-map.md再生成を忘れる事象が繰り返し発生している
- spec-update-workflow.mdにStep 1-Dとして明記したが、手動実行のため見落とされやすい
- topic-map.mdの行番号がずれると、キーワード検索時に不正確な参照先を返す
- task-specification-creatorのcommonErrorsにも「topic-map.md再生成漏れ」が記録されている

### 1.3 放置した場合の影響

- 仕様書を更新するたびにtopic-map.mdとの不整合が蓄積
- aiworkflow-requirementsスキルのキーワード検索精度が低下
- Phase 12実行時の手動チェック項目が増え、人為的ミスが続く

---

## 2. 何を達成するか（What）

### 2.1 目的

aiworkflow-requirements/references/ 配下の仕様書ファイルが変更された場合に、topic-map.mdを自動再生成する仕組みを構築する。

### 2.2 最終ゴール

- 仕様書ファイル（references/\*.md）が編集された後、topic-map.mdが自動的に最新状態に更新される
- Phase 12での手動再生成が不要になる

### 2.3 スコープ

#### 含むもの

- Claude Code Hook（PostToolUse）としての自動再生成トリガー設定
- 対象ファイルパターンのフィルタリング（`.claude/skills/aiworkflow-requirements/references/**/*.md` のみ）
- 再生成スクリプトの実行（既存の `generate-index.js` を再利用）

#### 含まないもの

- generate-index.jsスクリプト自体の改修
- keywords.jsonの自動再生成（topic-map.mdのみ対象）
- Git pre-commitフックとしての実装（Claude Code Hook限定）

### 2.4 成果物

| 成果物                      | 説明                                   |
| --------------------------- | -------------------------------------- |
| Claude Code Hook設定        | PostToolUse hook for auto-regeneration |
| hook実行スクリプト          | topic-map再生成トリガースクリプト      |
| spec-update-workflow.md更新 | Step 1-Dの自動化完了を反映             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Claude Code Hooksシステムが動作している
- `generate-index.js` が正常に実行可能（node環境）

### 3.2 依存タスク

- なし（既存のgenerate-index.jsを再利用）

### 3.3 必要な知識

- Claude Code Hooks設定（`.claude/settings.json` の hook設定パターン）
- generate-index.jsの実行条件と引数

### 3.4 推奨アプローチ

1. `.claude/hooks/` ディレクトリに `auto-regenerate-topic-map.sh` スクリプトを作成
2. PostToolUse（Edit/Write）フックとして登録
3. 変更されたファイルが `references/**/*.md` パターンに一致する場合のみ実行
4. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行
5. 既存のauto-format.shやauto-lint.shと同様のパターンで実装

---

## 4. 実行手順

### Phase構成

小規模改善のため、Phase 2（設計）→ Phase 5（実装）→ Phase 11（手動テスト）の最小構成を推奨。

### Phase 2: 設計

#### 目的

Hook設定パターンの確認とトリガー条件の設計。

#### 手順

1. 既存のClaude Code Hooks設定（`.claude/settings.json`）を確認
2. auto-format.sh等の既存フックの実装パターンを参考にする
3. ファイルパスフィルタリングの条件を決定

#### 成果物

Hook設計書（フィルタリング条件、実行タイミング）

#### 完了条件

Hook設定の具体的な実装方針が決定

### Phase 5: 実装

#### 目的

自動再生成フックの実装と登録。

#### 手順

1. `auto-regenerate-topic-map.sh` スクリプト作成
2. `.claude/settings.json` にフック登録
3. 動作確認（references/\*.mdを編集後にtopic-map.mdが更新されること）

#### 成果物

フックスクリプト、設定ファイル更新

#### 完了条件

references/\*.md編集後にtopic-map.mdが自動更新される

### Phase 11: 手動テスト

#### 目的

実際のワークフローでの動作確認。

#### 手順

1. aiworkflow-requirements/references/ 内のファイルを編集
2. topic-map.mdが自動再生成されることを確認
3. 無関係なファイル（apps/等）の編集時にはトリガーされないことを確認

#### 成果物

手動テスト結果レポート

#### 完了条件

正常系・異常系の動作確認完了

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] references/\*.md編集後にtopic-map.mdが自動再生成される
- [ ] 無関係なファイル編集時にはトリガーされない
- [ ] 再生成結果が手動実行時と同一

### 品質要件

- [ ] フック実行時間が5秒以内
- [ ] エラー時にフック全体がブロックされない（タイムアウト設定）
- [ ] 既存フック（auto-format, auto-lint等）と干渉しない

### ドキュメント要件

- [ ] spec-update-workflow.mdのStep 1-Dが「自動化済み」に更新
- [ ] CLAUDE.mdのフック一覧に追記

---

## 6. 検証方法

### テストケース

| テスト                   | 期待結果                     |
| ------------------------ | ---------------------------- |
| references/下のmd編集後  | topic-map.mdが再生成される   |
| apps/下のファイル編集後  | topic-map.mdは再生成されない |
| SKILL.md編集後           | topic-map.mdは再生成されない |
| 同時に複数ファイル編集後 | 1回だけ再生成される          |

### 検証手順

1. `quality-requirements.md` に空行を追加
2. topic-map.mdのタイムスタンプが更新されていることを確認
3. `apps/desktop/src/main/index.ts` を編集
4. topic-map.mdのタイムスタンプが変わらないことを確認

---

## 7. リスクと対策

| リスク                                | 影響度 | 発生確率 | 対策                                           |
| ------------------------------------- | ------ | -------- | ---------------------------------------------- |
| 再生成スクリプトの実行時間が長くなる  | 中     | 低       | タイムアウト設定（10秒）、バックグラウンド実行 |
| 他のPostToolUseフックとの競合         | 中     | 低       | 実行順序の明示的制御、独立性確保               |
| generate-index.jsがエラーを返す       | 低     | 低       | エラーハンドリングで他フック実行を妨げない設計 |
| CLAUDE_SKIP_HEAVY_HOOKSで無効化される | 低     | 中       | 専用のスキップ環境変数を用意                   |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`: 再生成スクリプト
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`: Step 1-D（手動実行手順）
- `.claude/hooks/auto-format.sh`: 既存フック実装パターン参照
- `CLAUDE.md`: フック一覧（追記対象）

### 参考資料

- Claude Code Hooks公式ドキュメント
- task-specification-creator EVALS.json: commonErrors「topic-map.md再生成漏れ」

---

## 9. 備考

### 発見経緯

TASK-8AのPhase 12実行時、topic-map.md再生成が手動ステップとして漏れた。spec-update-workflow.mdにStep 1-Dとして明記し、patterns.mdに「topic-map.md再生成漏れ」を失敗パターンとして記録した。しかし手動実行である限り再発リスクが残るため、自動化による根本解決を提案。

### 補足事項

- keywords.jsonもgenerate-index.jsで同時に再生成されるため、topic-map.mdと同時に最新化される
- CLAUDE_SKIP_HEAVY_HOOKSが設定されている場合のスキップ判定は、このフックが軽量（5秒以内）のため不要の可能性がある。実装時に判断する。
