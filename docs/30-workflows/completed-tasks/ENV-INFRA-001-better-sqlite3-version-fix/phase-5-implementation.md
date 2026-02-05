# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 5                                        |
| 機能名 | ENV-INFRA-001-better-sqlite3-version-fix |
| 作成日 | 2026-02-04                               |

---

## 目的

better-sqlite3を再ビルドし、Node.jsバージョン管理の仕組みを実装する。

---

## 実行タスク

### Task 1: better-sqlite3再ビルド

**実行コマンド**:

| ステップ | コマンド                                                            | 目的                     |
| -------- | ------------------------------------------------------------------- | ------------------------ |
| 1        | `node -v`                                                           | 現在のバージョン確認     |
| 2        | `pnpm rebuild better-sqlite3`                                       | better-sqlite3を再ビルド |
| 3        | `pnpm --filter @repo/shared test workflow-repository.test.ts --run` | 動作確認                 |

### Task 2: .nvmrcファイル作成

**ファイルパス**: プロジェクトルート/.nvmrc

**ファイル内容**:

```
v22.0.0
```

**注意**: 現在の環境で使用されているNode.jsバージョンを確認し、適切なバージョンを設定すること。

### Task 3: package.json engines設定

**追加内容（ルートpackage.json）**:

```json
{
  "engines": {
    "node": ">=22.0.0 <23.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

### Task 4: バージョンチェックスクリプト作成

**ファイルパス**: `.husky/hooks/check-node-version.sh`

**実装内容**:

| ステップ | 処理内容                           |
| -------- | ---------------------------------- |
| 1        | .nvmrcが存在するか確認             |
| 2        | .nvmrcからバージョンを読み取る     |
| 3        | 現在のNode.jsバージョンを取得      |
| 4        | バージョンを比較                   |
| 5        | 不一致の場合、警告を表示してexit 1 |
| 6        | 一致の場合、成功メッセージを表示   |

### Task 5: GitHub Actions更新確認

**確認対象**: `.github/workflows/*.yml`

**確認項目**:

| 項目                   | 期待値                                                    |
| ---------------------- | --------------------------------------------------------- |
| actions/setup-node設定 | node-version-file: ".nvmrc" または node-version: "22.0.0" |
| pnpmキャッシュ         | cache: "pnpm"                                             |

---

## 参照資料

| 資料名       | パス                                     | 説明          |
| ------------ | ---------------------------------------- | ------------- |
| 設計書       | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |
| テスト仕様書 | `outputs/phase-4/test-specification.md`  | Phase 4成果物 |

---

## 統合テスト連携【必須】

| 実装項目               | 検証方法                                  |
| ---------------------- | ----------------------------------------- |
| better-sqlite3再ビルド | workflow-repository.test.ts実行           |
| .nvmrc                 | `nvm use`コマンドで自動切替確認           |
| package.json engines   | 異なるNode.jsバージョンでpnpm install実行 |

---

## 成果物

| 成果物                | パス                               | 説明                         |
| --------------------- | ---------------------------------- | ---------------------------- |
| .nvmrc                | プロジェクトルート/.nvmrc          | Node.jsバージョン指定        |
| package.json（更新）  | プロジェクトルート/package.json    | enginesフィールド追加        |
| check-node-version.sh | .husky/hooks/check-node-version.sh | バージョンチェックスクリプト |
| better-sqlite3        | node_modules/better-sqlite3/       | 再ビルドされたモジュール     |

---

## 完了条件

- [ ] better-sqlite3が現在のNode.jsバージョンで再ビルドされた
- [ ] workflow-repository.test.tsの10個のテストがすべて成功
- [ ] .nvmrcファイルが作成されている
- [ ] package.json enginesフィールドが設定されている
- [ ] バージョンチェックスクリプトが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test workflow-repository.test.ts --run

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ENV-INFRA-001-better-sqlite3-version-fix --phase 5
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

| タスク                                   | 結果            | 備考     |
| ---------------------------------------- | --------------- | -------- |
| Task 1: better-sqlite3再ビルド           | {{完了/未完了}} | {{備考}} |
| Task 2: .nvmrcファイル作成               | {{完了/未完了}} | {{備考}} |
| Task 3: package.json engines設定         | {{完了/未完了}} | {{備考}} |
| Task 4: バージョンチェックスクリプト作成 | {{完了/未完了}} | {{備考}} |
| Task 5: GitHub Actions更新確認           | {{完了/未完了}} | {{備考}} |

### 発見事項

- 良かった点: {{GOOD_POINTS}}
- 問題点: {{ISSUES}}
- 改善提案: {{IMPROVEMENTS}}

### 次Phaseへの引き継ぎ事項

- {{HANDOVER_ITEMS}}
```

---

## 次のPhase

Phase 6: テスト拡充
