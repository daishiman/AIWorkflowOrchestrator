# カバレッジバッジの追加 - タスク指示書

## メタ情報

| 項目         | 内容                              |
| ------------ | --------------------------------- |
| タスクID     | task-imp-cicd-coverage-001        |
| タスク名     | カバレッジバッジの追加            |
| 分類         | 改善                              |
| 対象機能     | CI/CD、ドキュメント               |
| 優先度       | 低                                |
| 見積もり規模 | 小規模                            |
| ステータス   | 未実施                            |
| 発見元       | Phase 1（スコープ定義）           |
| 発見日       | 2026-01-05                        |
| 関連タスク   | cicd-coverage-integration（完了） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CI/CDカバレッジ閾値統合（cicd-coverage-integration）が完了し、CodecovによるカバレッジレポートがPRごとに生成されるようになった。しかし、README.mdにカバレッジバッジが表示されていないため、プロジェクトの品質状態を一目で確認できない。

### 1.2 問題点・課題

- README.mdを見ただけではカバレッジの現状がわからない
- 外部の人（OSS貢献者、採用候補者など）にプロジェクトの品質をアピールできない
- カバレッジの推移を把握するためにCodecovダッシュボードにアクセスする必要がある

### 1.3 放置した場合の影響

- 直接的な機能影響はない
- プロジェクトの品質可視性が低下
- OSSコミュニティでの信頼性アピールが弱まる

---

## 2. 何を達成するか（What）

### 2.1 目的

README.mdにCodecovカバレッジバッジを追加し、プロジェクトのカバレッジ状態を一目で確認できるようにする。

### 2.2 最終ゴール

- README.mdのタイトル直下にカバレッジバッジが表示されている
- バッジをクリックするとCodecovダッシュボードに遷移する
- バッジはmainブランチのカバレッジを反映している

### 2.3 スコープ

#### 含むもの

- Codecovカバレッジバッジの追加
- バッジのリンク先設定（Codecovダッシュボード）
- README.mdの更新

#### 含まないもの

- 他のバッジ（CI状態、ライセンス等）の追加
- Codecov以外のカバレッジサービスへの対応
- カスタムバッジの作成

### 2.4 成果物

| 成果物    | 内容                     |
| --------- | ------------------------ |
| README.md | カバレッジバッジを追加   |
| (なし)    | 新規ファイルの作成は不要 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Codecov統合が完了していること（cicd-coverage-integration）
- Codecovにリポジトリが登録されていること
- mainブランチでCIが実行済みであること

### 3.2 依存タスク

- cicd-coverage-integration（完了済み）

### 3.3 必要な知識・スキル

- Markdown記法
- Codecovバッジの取得方法

### 3.4 推奨アプローチ

1. Codecovダッシュボードでバッジのマークダウンを取得
2. README.mdのタイトル直下にバッジを追加
3. PRを作成してマージ

---

## 4. 実行手順

### Phase構成

このタスクは単純なため、Phaseなしで直接実装可能。

### 実装手順

#### ステップ1: バッジURL取得

Codecovダッシュボードにアクセスし、Settings → Badge からマークダウンをコピー:

```markdown
[![codecov](https://codecov.io/gh/[owner]/[repo]/branch/main/graph/badge.svg?token=[token])](https://codecov.io/gh/[owner]/[repo])
```

#### ステップ2: README.md更新

タイトル直下にバッジを追加:

```markdown
# AIWorkflowOrchestrator

[![codecov](https://codecov.io/gh/[owner]/[repo]/branch/main/graph/badge.svg?token=[token])](https://codecov.io/gh/[owner]/[repo])

AI開発ワークフロー管理システム
```

#### ステップ3: PR作成

```bash
git checkout -b chore/add-coverage-badge
git add README.md
git commit -m "chore: カバレッジバッジを追加"
git push -u origin chore/add-coverage-badge
gh pr create
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] README.mdにCodecovバッジが表示されている
- [ ] バッジがmainブランチのカバレッジを反映している
- [ ] バッジをクリックするとCodecovダッシュボードに遷移する

### 品質要件

- [ ] マークダウン記法が正しい
- [ ] バッジ画像が正しく表示される

### ドキュメント要件

- [ ] README.mdが更新されている

---

## 6. 検証方法

### テストケース

| No  | テスト内容                        | 期待結果                     |
| --- | --------------------------------- | ---------------------------- |
| 1   | README.mdをブラウザで表示         | バッジが表示される           |
| 2   | バッジをクリック                  | Codecovダッシュボードに遷移  |
| 3   | Codecovでカバレッジ更新後、再表示 | バッジの数値が更新されている |

### 検証手順

1. GitHubリポジトリのREADME.mdを表示
2. バッジが表示されていることを確認
3. バッジをクリックしてCodecovダッシュボードに遷移することを確認

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                              |
| ------------------------ | ------ | -------- | --------------------------------- |
| バッジ画像が表示されない | 低     | 低       | Codecov設定を確認、トークン再取得 |
| カバレッジ数値が古い     | 低     | 中       | CIが完了するまで待機              |

---

## 8. 参照情報

### 関連ドキュメント

- `README.md` - 更新対象
- `codecov.yml` - Codecov設定
- `docs/30-workflows/cicd-coverage-integration/outputs/phase-10/implementation-guide.md` - 実装ガイド

### 参考資料

- [Codecov Badge Documentation](https://docs.codecov.com/docs/status-badges)

---

## 9. 備考

### 発見元の原文

Phase 1スコープ定義（outputs/phase-1/scope-definition.md）より:

```
2.2 将来のタスク候補
- カバレッジバッジの追加（README.mdへのCodecovバッジ表示）
```

### 補足事項

- 優先度は低いため、他の重要タスクの合間に実施推奨
- 実装は5-10分程度で完了する見込み
