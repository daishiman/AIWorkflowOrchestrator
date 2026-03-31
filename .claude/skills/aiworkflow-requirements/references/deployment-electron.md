# Electron アプリのリリース

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

**親ドキュメント**: [deployment.md](./deployment.md)

## ビルドターゲット

| OS      | 形式                | 配布方法        |
| ------- | ------------------- | --------------- |
| macOS   | `.dmg`, `.zip`      | GitHub Releases |
| Windows | `.exe`, `.msi`      | GitHub Releases |
| Linux   | `.AppImage`, `.deb` | GitHub Releases |

### CI環境での制限事項（2026-01-13追加）

| 環境              | macOS形式 | 備考                                      |
| ----------------- | --------- | ----------------------------------------- |
| ローカル開発      | DMG + ZIP | 全形式利用可能                            |
| GitHub Actions CI | ZIP のみ  | macos-14 runner で hdiutil 使用不可       |
| リリースビルド    | DMG + ZIP | self-hosted runner または手動ビルドで対応 |

**技術的理由**:

- GitHub Actions の macos-14 runner（Apple Silicon）は仮想化環境
- `hdiutil create` コマンドが `Device not configured` エラーで失敗
- 解決策: CI では ZIP のみ生成、DMG はリリース時に別途対応

---

## Native Addon 再構築（postinstall bootstrap）

### 問題と原因

`better-sqlite3` などの native addon（`.node` バイナリ）は `NODE_MODULE_VERSION`（ABI）が一致しないと `dlopen` に失敗する。`pnpm install` 直後は Node.js ABI でコンパイルされた prebuilt バイナリが入るが、Electron は独自 Node.js ランタイムを持つため ABI が異なる。

| 環境                 | ABI バージョン例 |
| -------------------- | ---------------- |
| Node.js 22.x（pnpm） | 127              |
| Electron 39.2.4      | 140              |

### 自動 rebuild（postinstall）

`apps/desktop/package.json` の `postinstall` が `pnpm install` 後に自動実行される:

```json
"rebuild:native": "pnpm rebuild better-sqlite3 && (pnpm rebuild esbuild || true)",
"postinstall": "pnpm rebuild:native"
```

- `better-sqlite3` は必須 rebuild（失敗するとアプリが起動しない）
- `esbuild` は best-effort（workspace 内 version 競合が起きやすいため `|| true` でエラーを無視）

### 手動 recovery

postinstall が何らかの理由でスキップされた場合の手動コマンド:

```bash
pnpm --filter @repo/desktop rebuild:native
```

### 将来の native addon 追加時チェックリスト

- [ ] Electron ABI を要求する addon かどうか確認
- [ ] `apps/desktop/package.json` の `rebuild:native` に対象を追加
- [ ] `pnpm --filter @repo/desktop rebuild:native` で動作確認
- [ ] 必要なら `scripts/setup-native-modules.sh` にも反映

---

## リリースフロー

1. `package.json`のバージョン番号を更新
2. `CHANGELOG.md`を更新
3. ローカルで各OSのビルドをテスト
4. セマンティックバージョニングでタグを作成（例：`v1.2.3`）
5. タグをプッシュ → GitHub Actionsが自動ビルド
6. 各OSの成果物がGitHub Releasesに自動アップロード
7. リリースノートを編集して公開

---

## リリースチェックリスト

- [ ] バージョン番号を更新（`package.json`）
- [ ] `CHANGELOG.md`を更新
- [ ] ローカルでビルドをテスト（各OS）
- [ ] 主要機能の動作確認
- [ ] タグを作成してプッシュ
- [ ] GitHub Actionsの成功を確認
- [ ] リリースノートを編集
- [ ] ユーザーに通知（Discord、X等）

---

## 自動更新（electron-updater）

### 設定項目

| 項目               | 説明                          |
| ------------------ | ----------------------------- |
| 更新サーバー       | GitHub Releasesを使用（無料） |
| チェックタイミング | アプリ起動時に自動チェック    |
| ダウンロード       | バックグラウンドで実行        |
| インストール       | ユーザー確認後に実行          |

### 更新戦略

| 種類         | 対応                           |
| ------------ | ------------------------------ |
| 強制更新     | セキュリティパッチは即座に適用 |
| 任意更新     | 機能追加は次回起動時に促す     |
| スキップ可能 | パッチバージョンのみの場合     |

### ユーザー体験の最適化

- アイドル時に更新を促す（作業中は通知を控える）
- 更新失敗時は手動ダウンロードリンクを提供
- ロールバック機能を実装する

---

## コードサイニング

### 各OSでの必要性

| OS      | 必要性 | 理由                           |
| ------- | ------ | ------------------------------ |
| macOS   | 高     | Gatekeeperの警告を回避するため |
| Windows | 中     | SmartScreen警告を軽減するため  |
| Linux   | 低     | 通常は不要                     |

### macOS コードサイニング要件

- Apple Developer Programアカウント（年間99ドル）
- Developer ID Application証明書
- 公証（Notarization）の実行

### 個人開発者向けの現実的な対応

- **macOS**: 投資対効果が高いため、コードサイニングを推奨
- **Windows**: リリースノートで「詳細情報」→「実行」の手順を案内
- **Linux**: 特別な対応は不要

---

## デプロイチェックリスト

### リリース前の確認事項

**コード品質**

- [ ] すべてのテストが通過
- [ ] 型エラーがない
- [ ] Lintエラーがない
- [ ] セキュリティ脆弱性がない

**機能検証**

- [ ] ステージング環境で動作確認
- [ ] クリティカルパスのテスト
- [ ] パフォーマンステスト
- [ ] モバイルブラウザでの動作確認

**ドキュメント**

- [ ] CHANGELOGを更新
- [ ] READMEを必要に応じて更新
- [ ] APIドキュメントを更新（該当時）

### 本番デプロイ時の注意点

**推奨タイミング**

- 平日10-16時（問題発生時に対応可能）
- トラフィックが比較的低い時間帯

**避けるべきタイミング**

- 金曜日午後（週末に問題持ち越しリスク）
- 祝日前日
- 大規模キャンペーン中

**デプロイ後の対応**

成功時:

- Discord/Slackで完了通知
- リリースノート公開
- 24時間は監視を継続

失敗時:

- 即座にロールバック
- 失敗原因の分析
- 修正後の再デプロイ計画

---

## データベースマイグレーションのロールバック

### 破壊的変更の回避原則

- カラム削除は即座に実行しない（非推奨マーク → 数リリース後に削除）
- テーブル削除は複数ステップで段階的に実施
- インデックス追加は本番適用前に影響をテスト

### ロールバック戦略

| 変更種別     | 推奨アプローチ                           |
| ------------ | ---------------------------------------- |
| カラム追加   | NULL許容またはデフォルト値を設定         |
| カラム名変更 | 新カラム追加 → データ移行 → 旧カラム削除 |
| 型変更       | 新カラム作成 → 段階的移行                |
| テーブル削除 | リネーム → 一定期間保持 → 完全削除       |

### 本番デプロイ前のチェックリスト

- [ ] ステージング環境でマイグレーションをテスト済み
- [ ] ロールバック手順を確認済み
- [ ] バックアップを取得済み
- [ ] 想定実行時間を見積もり済み

---

## 関連ドキュメント

- [デプロイメント概要](./deployment.md)
- [Railwayデプロイ](./deployment-railway.md)
- [GitHub Actions CI/CD](./deployment-gha.md)
