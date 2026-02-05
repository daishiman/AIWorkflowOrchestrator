# 未タスク指示書: CI node-versionの.nvmrc参照化

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | UT-ENV-001                       |
| タスク名     | CI node-versionの.nvmrc参照化    |
| 分類         | DevOps/CI改善                    |
| 対象機能     | GitHub Actions CI                |
| 優先度       | 低                               |
| 見積もり規模 | 極小（1行変更 × ワークフロー数） |
| ステータス   | 未実施                           |
| 発見元       | ENV-INFRA-001 Phase 3レビュー    |
| 発見日       | 2026-02-04                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ENV-INFRA-001（better-sqlite3バージョン不一致修正）の実行中、Node.jsバージョン管理の一貫性に関する課題が発見された。
現在、`.nvmrc`、`package.json engines`、`volta`の三重構造でローカル開発環境のバージョンを管理しているが、**CI環境（GitHub Actions）はハードコードされたバージョン番号**を使用している。

### 1.2 問題点・課題

| 問題                       | 影響                                     |
| -------------------------- | ---------------------------------------- |
| バージョン情報の重複管理   | `.nvmrc`と`ci.yml`の両方を更新する必要   |
| 不整合リスク               | 更新忘れでローカルとCIでバージョン不一致 |
| Single Source of Truth違反 | バージョン情報源が複数存在               |

### 1.3 放置した場合の影響

- 将来のNode.jsバージョン更新時に**CI設定の更新忘れ**が発生するリスク
- ローカル環境とCI環境でNode.jsバージョンが異なると、**再現困難なバグ**の原因となる

---

## 2. 何を達成するか（What）

### 2.1 目的

GitHub Actions CIのNode.jsバージョン指定を`.nvmrc`ファイル参照方式に変更し、Single Source of Truthを実現する。

### 2.2 最終ゴール

全CI/CDワークフローファイルで`node-version`の代わりに`node-version-file: ".nvmrc"`を使用する。

### 2.3 スコープ

#### 含むもの

- `.github/workflows/ci.yml`のnode-version設定変更
- 他の`.github/workflows/*.yml`ファイルの同様の変更
- 変更後のCI動作確認

#### 含まないもの

- `.nvmrc`ファイルの内容変更
- `package.json engines`の変更
- Node.jsバージョン自体のアップグレード

### 2.4 成果物

| 成果物                    | 説明                        |
| ------------------------- | --------------------------- |
| 更新された`*.yml`ファイル | node-version-file形式に変更 |
| CIパイプライン成功ログ    | 変更後の動作確認            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.nvmrc`ファイルがリポジトリルートに存在すること
- `.nvmrc`に有効なNode.jsバージョンが記載されていること

### 3.2 依存タスク

なし（独立して実行可能）

### 3.3 必要な知識

- GitHub Actions基本構文
- `actions/setup-node@v4`のオプション

### 3.4 システム仕様書参照

| 参照ファイル           | 参照セクション            | 理由                         |
| ---------------------- | ------------------------- | ---------------------------- |
| `technology-devops.md` | Node.js バージョン管理    | 三重構造の管理方針を確認     |
| `technology-devops.md` | GitHub Actions CI/CD      | CI設定ガイドラインを確認     |
| `patterns.md`          | NODE_MODULE_VERSION不一致 | 関連する苦戦箇所の教訓を参照 |

### 3.5 関連する苦戦箇所（ENV-INFRA-001からの教訓）

ENV-INFRA-001で発生したNODE_MODULE_VERSION不一致問題から、以下の教訓が得られた：

| 教訓                                   | 本タスクへの適用                 |
| -------------------------------------- | -------------------------------- |
| バージョン管理はSingle Source of Truth | `.nvmrc`を唯一の情報源にする     |
| pnpmストアキャッシュ問題               | CI環境では自動的にクリーンビルド |
| .nvmrc/engines/voltaの三重構造         | CI環境も三重構造に含めて一元管理 |

> **詳細**: `patterns.md` の「ネイティブモジュールNODE_MODULE_VERSION不一致」セクション参照

---

## 4. 実行手順

### Phase構成

極小タスクのため、単一フェーズで完了。

### Phase 1: CI設定変更

#### 目的

全ワークフローファイルのnode-version設定を統一

#### 手順

1. `.github/workflows/`配下の全`.yml`ファイルを検索
2. `node-version: "22"`を`node-version-file: ".nvmrc"`に置換
3. 変更をコミット
4. CIパイプラインの成功を確認

#### 変更例

**Before:**

```yaml
issue_number: 714
- uses: actions/setup-node@v4
  with:
    node-version: "22"
    cache: "pnpm"
```

**After:**

```yaml
- uses: actions/setup-node@v4
  with:
    node-version-file: ".nvmrc"
    cache: "pnpm"
```

#### 完了条件

- [ ] 全ワークフローファイルが`node-version-file`形式に変更されている
- [ ] CIパイプラインが正常に完了している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全`.github/workflows/*.yml`で`node-version-file: ".nvmrc"`を使用
- [ ] ハードコードされた`node-version`が残存していない

### 品質要件

- [ ] CIパイプライン（test/lint/typecheck）が全て成功
- [ ] 既存のCI機能に影響がない

### ドキュメント要件

- [ ] 変更が`technology-devops.md`に反映（必要に応じて）
- [ ] CONTRIBUTING.mdの開発環境セットアップ手順と整合

---

## 6. 検証方法

### テストケース

| テストケース             | 期待結果                            |
| ------------------------ | ----------------------------------- |
| プルリクエスト作成       | CIが正常に実行される                |
| `.nvmrc`変更なしでCI実行 | 正しいNode.jsバージョンが使用される |

### 検証手順

1. 変更を含むプルリクエストを作成
2. CI実行ログで使用されたNode.jsバージョンを確認
3. `.nvmrc`の内容と一致することを確認

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                                     |
| ------------------------ | ------ | -------- | ---------------------------------------- |
| `.nvmrc`ファイル削除     | 高     | 低       | `.nvmrc`が必須であることをドキュメント化 |
| actions/setup-node非対応 | 低     | 極低     | v4以降で対応済み、問題なし               |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                             | 説明                         |
| ------------------------------------------------------------------------ | ---------------------------- |
| `.claude/skills/aiworkflow-requirements/references/technology-devops.md` | Node.js管理・CI/CD仕様       |
| `.claude/skills/task-specification-creator/references/patterns.md`       | 苦戦箇所・成功パターン集     |
| `CONTRIBUTING.md`                                                        | 開発者向けセットアップガイド |

### 参考資料

- [actions/setup-node - node-version-file](https://github.com/actions/setup-node#node-version-file)

---

## 9. 備考

### 発見経緯

ENV-INFRA-001 Phase 3レビューにて、CI設定のNode.jsバージョン管理がローカル環境と異なる方式であることが指摘された。現状でも動作に問題はないが、将来のメンテナンス性向上のため未タスクとして記録。

### 補足事項

- **現状でも動作に問題なし**: `.nvmrc`と同じNode.js 22が設定されている
- **優先度が低い理由**: 機能的な問題は発生していない
- **推奨実行タイミング**: 次回CI/CD関連タスク実行時に併せて対応

### 関連タスク

| タスクID      | タスク名                     | 関係         |
| ------------- | ---------------------------- | ------------ |
| ENV-INFRA-001 | better-sqlite3バージョン修正 | 発見元タスク |
