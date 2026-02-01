# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 11                                   |
| Phase名    | 手動テスト検証                       |
| 前提Phase  | Phase 10（最終レビューゲート）       |
| 後続Phase  | Phase 12（ドキュメント更新）         |
| ステータス | 未実施                               |
| 作成日     | 2026-01-31                           |
| 機能名     | TASK-8C-E: E2Eテストフィクスチャ作成 |

---

## 目的

自動テストだけでは検証できない観点を手動で検証する。フィクスチャファイルの内容が人間の目で見て適切であること、E2E テストのシナリオに十分な情報を持っていることを確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: フィクスチャ内容の目視確認

**目的**: フィクスチャの内容が読みやすく、テスト目的に適しているか確認する

**実行手順**:

1. 各フィクスチャファイルを順番に開いて読む：

| ファイル                          | 確認観点                                                 |
| --------------------------------- | -------------------------------------------------------- |
| test-skill/SKILL.md               | YAML Frontmatter が正しい形式か、body が意味のある内容か |
| test-skill/agents/test-agent.md   | 見出しが正しいか、内容がエージェントの説明として適切か   |
| test-skill/references/test-ref.md | 見出しが正しいか、参照資料として適切な内容か             |
| another-skill/SKILL.md            | 最小構成として必要十分な内容か                           |
| invalid-skill/README.md           | 無効スキルの目的が明示されているか                       |

2. 問題があれば修正する

**期待される成果物**:

- 目視確認チェックリスト

---

### タスク2: SkillScanner での実際のパース確認

**目的**: SkillScanner で実際にフィクスチャをスキャンし、結果を確認する

**実行手順**:

1. テスト内で SkillScanner を使用してフィクスチャディレクトリをスキャンする
2. 出力された `ScannedSkillMetadata[]` の内容を確認する：
   - test-skill: name, description, allowedTools, agents, references が正しいか
   - another-skill: name, description, allowedTools が正しく、agents/references が空か
   - invalid-skill: 結果に含まれていないか
3. 結果を `outputs/phase-11/manual-test-result.md` に記録する

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

### タスク3: 後続 E2E テストとの互換性確認

**目的**: TASK-8C-B/C/D で使用する際に問題がないことを確認する

**実行手順**:

1. TASK-8C-B（スキル選択）: test-skill と another-skill がリスト表示に必要な情報（name, description）を持っているか確認する
2. TASK-8C-C（インポート実行）: test-skill がインポート対象として十分な情報（agents, references）を持っているか確認する
3. TASK-8C-D（パーミッション）: test-skill の allowed-tools が許可/拒否テストに使えるか確認する
4. スコープ外の発見事項や改善提案があれば `outputs/phase-11/discovered-issues.md` に記録する

**期待される成果物**:

- 互換性確認結果（`outputs/phase-11/manual-test-result.md` に含む）

---

## 参照資料

| 参照資料     | パス                                                                                | 内容         |
| ------------ | ----------------------------------------------------------------------------------- | ------------ |
| フィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skills/`                                   | フィクスチャ |
| TASK-8C-B    | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-b-e2e-selection.md`      | E2E要件      |
| TASK-8C-C    | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-c-e2e-import-execute.md` | E2E要件      |
| TASK-8C-D    | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-d-e2e-permission.md`     | E2E要件      |

---

## 成果物

| 成果物           | パス                                     | 内容         |
| ---------------- | ---------------------------------------- | ------------ |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md` | 検証結果     |
| 発見事項レポート | `outputs/phase-11/discovered-issues.md`  | 発見した課題 |

---

## 多角的チェック観点

| 観点           | 確認内容                                                          |
| -------------- | ----------------------------------------------------------------- |
| テスタビリティ | フィクスチャが E2E テストの各シナリオで使用可能か                 |
| 保守性         | フィクスチャの変更が後続テストに与える影響が予測可能か            |
| データ整合性   | YAML Frontmatter の値と SkillScanner のパース結果が一致しているか |

---

## 完了条件

- [ ] 全フィクスチャファイルの目視確認が完了している
- [ ] SkillScanner でのパース結果が期待通りである
- [ ] 後続 E2E テスト（TASK-8C-B/C/D）との互換性が確認されている
- [ ] 手動テスト結果が outputs/phase-11/ に配置されている
- [ ] 発見事項レポート（discovered-issues.md）が出力されている（0件でも出力必須）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-12-documentation.md`
