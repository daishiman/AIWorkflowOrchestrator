# レベル2: 実務

## 概要

build/push ワークフロー設計を実務レベルで整理する。
references/・assets/ を活用した設計を前提とする。

## 前提条件

- レベル1 の内容を理解している
- スコープと制約が明確になっている

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: build-push構文、認証、キャッシュ
- 実務指針: 認証とタグ戦略を統一する

### 判断基準と検証観点

- 回避事項: 認証情報の埋め込み
- 検証観点: キャッシュが有効

### リソース運用

- `references/build-push-syntax.md`: 構文ガイド
- `references/registry-auth.md`: 認証ガイド
- `references/requirements-index.md`: 要件整合
- `references/legacy-skill.md`: 旧版差分確認

### テンプレート運用

- `assets/docker-workflow.yaml`: ワークフロー雛形
- `assets/registry-checklist.md`: 認証チェック

### 成果物要件

- 認証とタグ戦略が明記されている

## 実践手順

1. ワークフロー構成を決める
2. 認証チェックリストで検証する
3. キャッシュ方針を記録する

## チェックリスト

- [ ] 認証方針が明確
- [ ] タグ戦略が整理済み
- [ ] キャッシュ方針が明記済み
