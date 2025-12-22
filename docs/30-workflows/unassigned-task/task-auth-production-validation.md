# 本番環境カスタムプロトコル動作検証 - タスク指示書

## メタ情報

| 項目             | 内容                               |
| ---------------- | ---------------------------------- |
| タスクID         | VAL-001                            |
| タスク名         | 本番環境カスタムプロトコル動作検証 |
| 分類             | 改善                               |
| 対象機能         | OAuth認証（Desktop）               |
| 優先度           | 高                                 |
| 見積もり規模     | 小規模                             |
| ステータス       | 未実施                             |
| 発見元           | ユーザー要望（Phase 9）            |
| 発見日           | 2025-12-22                         |
| 発見エージェント | -                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在、OAuth認証は開発環境（`pnpm preview`）でのみ動作確認されています。本番環境（署名済み.appパッケージ）での動作確認が未実施です。

### 1.2 問題点・課題

**検証不足のリスク**:

- カスタムプロトコル（`aiworkflow://`）が本番環境で動作しない可能性
- 署名済みアプリでのプロトコル登録が失敗する可能性
- macOS Gatekeeper、Notarizationの影響で動作しない可能性
- ユーザーに配布後に問題が発覚するリスク

**現在の検証状況**:

- ✅ 開発環境（`pnpm preview`）: 動作確認済み
- ❌ 本番環境（署名済み.app）: 未検証
- ❌ macOS複数バージョンでの検証: 未実施

### 1.3 放置した場合の影響

| 影響領域     | 影響度   | 説明                             |
| ------------ | -------- | -------------------------------- |
| リリース品質 | Critical | 本番環境で動作しない可能性       |
| ユーザー体験 | Critical | ユーザーがログインできない       |
| ブランド信頼 | High     | 動作しないアプリを配布してしまう |
| サポート負荷 | High     | 大量の問い合わせが発生           |

---

## 2. 何を達成するか（What）

### 2.1 目的

署名済み本番ビルド（.appパッケージ）でカスタムプロトコル（`aiworkflow://`）が正常に動作することを検証する。

### 2.2 最終ゴール

- ✅ 本番ビルド作成（electron-builder）
- ✅ コード署名適用
- ✅ カスタムプロトコル動作確認
- ✅ OAuth認証フル検証
- ✅ macOS複数バージョンでの検証

### 2.3 スコープ

#### 含むもの

- 本番ビルド作成（electron-builder）
- コード署名適用
- 本番環境でのOAuth認証テスト
- macOS 14/15での動作確認
- 問題発見時の修正

#### 含まないもの

- Windows/Linux版の検証（将来対応）
- 自動更新機能の検証（将来対応）
- App Store配布（将来対応）

### 2.4 成果物

| 種別         | 成果物                   | 配置先                                                      |
| ------------ | ------------------------ | ----------------------------------------------------------- |
| ビルド       | 署名済み.appパッケージ   | `apps/desktop/dist/mac-arm64/AIWorkflowOrchestrator.app`    |
| ドキュメント | 本番環境検証レポート     | `docs/30-workflows/login-recovery/production-validation.md` |
| ドキュメント | 発見された問題（あれば） | `docs/30-workflows/unassigned-task/`                        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] ログイン機能復旧プロジェクト（T-02-1〜T-09-1）が完了していること
- [ ] 開発環境でOAuth認証が正常に動作していること
- [ ] Apple Developer Program登録済み（コード署名用）
- [ ] コード署名証明書取得済み

### 3.2 依存タスク

**必須（先に完了必須）**:

- T-04-1: AuthGuard実装（完了済み）
- T-06-1: 品質保証（完了済み）
- T-07-1: 最終レビューゲート（完了済み）
- T-08-1: 手動テスト（完了済み）

**同時実施可能なタスク**:

- なし（本番検証は他のタスクと並行不可）

### 3.3 必要な知識・スキル

- electron-builder
- macOSコード署名
- macOS Gatekeeperの仕組み
- LaunchServicesの動作

### 3.4 推奨アプローチ

1. **本番ビルド作成**: electron-builderで.appパッケージを作成
2. **コード署名**: Apple Developer証明書で署名
3. **動作確認**: クリーンなmacOS環境で検証
4. **問題対応**: 発見された問題を修正し、再検証

---

## 4. 実行手順

### Phase構成

```
Phase 1: 本番ビルド作成
  ↓
Phase 2: コード署名適用
  ↓
Phase 3: カスタムプロトコル動作確認
  ↓
Phase 4: OAuth認証フル検証
  ↓
Phase 5: 検証レポート作成
```

---

### Phase 1: 本番ビルド作成

#### 目的

electron-builderで本番用.appパッケージを作成する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
本番ビルドを作成してください。

実行コマンド:
cd apps/desktop
pnpm run build
pnpm run package

確認事項:
- dist/mac-arm64/に.appが生成される
- electron-builder.ymlのprotocolsが正しく設定されている
```

#### 使用エージェント

- **エージェント**: @electron-devops
- **選定理由**: Electronビルド・パッケージングの専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名           | 活用方法                     |
| ------------------ | ---------------------------- |
| electron-packaging | electron-builderによるビルド |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                   | パス                                                     | 内容       |
| ------------------------ | -------------------------------------------------------- | ---------- |
| .appパッケージ（未署名） | `apps/desktop/dist/mac-arm64/AIWorkflowOrchestrator.app` | 本番ビルド |

#### 完了条件

- [ ] ビルド成功
- [ ] .appパッケージ生成確認
- [ ] electron-builder.yml設定確認

---

### Phase 2: コード署名適用

#### 目的

Apple Developer証明書でコード署名を適用する。

#### 実行コマンド

```bash
# 証明書確認
security find-identity -v -p codesigning

# 署名適用（electron-builderが自動実行）
pnpm run package

# 署名確認
codesign --verify --deep --strict apps/desktop/dist/mac-arm64/AIWorkflowOrchestrator.app
```

#### 完了条件

- [ ] コード署名適用完了
- [ ] 署名検証成功

---

### Phase 3: カスタムプロトコル動作確認

#### 目的

署名済み.appでカスタムプロトコル（`aiworkflow://`）が正常に動作することを確認する。

#### テストケース

| No  | カテゴリ | テスト項目              | 操作手順                      | 期待結果                       |
| --- | -------- | ----------------------- | ----------------------------- | ------------------------------ |
| 1   | 正常系   | プロトコル登録確認      | .appを起動                    | LaunchServicesに登録される     |
| 2   | 正常系   | コールバックURL動作確認 | ブラウザでaiworkflow://を開く | アプリが起動・フォーカスされる |
| 3   | 正常系   | OAuth認証フロー確認     | Google OAuth認証実行          | 正常にログインできる           |

#### 実行手順

1. 署名済み.appをApplicationsフォルダに配置
2. .appをダブルクリックして起動
3. Googleログインボタンをクリック
4. ブラウザでGoogle認証完了
5. アプリに戻り、ログイン成功を確認

#### 完了条件

- [ ] 全3テストケースがPASS
- [ ] OAuth認証が成功する
- [ ] カスタムプロトコルが動作する

---

### Phase 4: OAuth認証フル検証

#### 目的

本番環境で全OAuthプロバイダー（Google/GitHub/Discord）の認証フローを検証する。

#### テストケース

| No  | カテゴリ | テスト項目        | 操作手順              | 期待結果         |
| --- | -------- | ----------------- | --------------------- | ---------------- |
| 1   | 正常系   | Google OAuth認証  | Google認証フロー実行  | ログイン成功     |
| 2   | 正常系   | GitHub OAuth認証  | GitHub認証フロー実行  | ログイン成功     |
| 3   | 正常系   | Discord OAuth認証 | Discord認証フロー実行 | ログイン成功     |
| 4   | 正常系   | セッション復元    | アプリ再起動          | ログイン状態維持 |
| 5   | 正常系   | ログアウト        | ログアウト実行        | ログイン画面表示 |

#### 完了条件

- [ ] 全5テストケースがPASS
- [ ] 全プロバイダーで認証成功

---

### Phase 5: 検証レポート作成

#### 目的

本番環境検証結果をレポートにまとめる。

#### 成果物

| 成果物               | パス                                                        | 内容           |
| -------------------- | ----------------------------------------------------------- | -------------- |
| 本番環境検証レポート | `docs/30-workflows/login-recovery/production-validation.md` | 検証結果まとめ |

#### 完了条件

- [ ] 検証レポート作成完了
- [ ] 発見された問題を記録（あれば）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 本番ビルド作成完了
- [ ] コード署名適用完了
- [ ] カスタムプロトコル動作確認完了
- [ ] OAuth認証フル検証完了

### 品質要件

- [ ] 全テストケースPASS（計8テストケース）
- [ ] 発見された問題が修正済みまたは記録済み

### ドキュメント要件

- [ ] 検証レポート作成完了

---

## 6. 検証方法

### テストケース

#### 本番環境検証（計8テストケース）

1. プロトコル登録確認
2. コールバックURL動作確認
3. OAuth認証フロー確認
4. Google OAuth認証
5. GitHub OAuth認証
6. Discord OAuth認証
7. セッション復元
8. ログアウト

### 検証手順

```bash
# ビルド
cd apps/desktop
pnpm run build
pnpm run package

# 署名確認
codesign --verify --deep --strict dist/mac-arm64/AIWorkflowOrchestrator.app

# .appをApplicationsフォルダに配置
cp -r dist/mac-arm64/AIWorkflowOrchestrator.app /Applications/

# 起動して検証
open /Applications/AIWorkflowOrchestrator.app
```

---

## 7. リスクと対策

| リスク                           | 影響度   | 発生確率 | 対策                                   | 対応サブタスク |
| -------------------------------- | -------- | -------- | -------------------------------------- | -------------- |
| 署名済みアプリでプロトコル未登録 | Critical | Medium   | Info.plistとelectron-builder.yml確認   | Phase 1        |
| macOS Gatekeeperによるブロック   | Critical | Low      | コード署名とNotarization実施           | Phase 2        |
| LaunchServicesキャッシュ問題     | Medium   | Low      | アプリ初回起動時のキャッシュクリア実装 | Phase 3        |
| 証明書有効期限切れ               | High     | Low      | 証明書有効期限確認                     | Phase 2        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/login-recovery/README.md` - ログイン機能復旧プロジェクト
- `docs/30-workflows/login-recovery/step10-permanent-solution.md` - カスタムプロトコル問題解決
- `docs/00-requirements/12-deployment.md` - デプロイメント
- `apps/desktop/electron-builder.yml` - ビルド設定

### 参考資料

- [Electron Code Signing](https://www.electronjs.org/docs/latest/tutorial/code-signing)
- [Apple Notarization](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [Custom Protocol Registration](https://www.electronjs.org/docs/latest/api/app#appsetasdefaultprotocolclientprotocol-path-args)

---

## 9. 備考

### 補足事項

- 本検証は、実際のリリース前に**必須**で実施すること
- 本番環境で問題が発見された場合は、即座に修正し再検証
- macOS 14/15の両方で検証することを推奨
- Windows/Linux版の検証は別タスクとして実施（将来対応）
- コード署名には Apple Developer Program（年間$99）への登録が必要
- Notarization には時間がかかる（数分〜数時間）ため、余裕を持って実施
