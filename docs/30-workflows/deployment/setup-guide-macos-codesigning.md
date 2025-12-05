# macOSコード署名 セットアップガイド

## 概要

このドキュメントでは、Electronデスクトップアプリをmacosで配布するために必要なコード署名と公証（Notarization）の設定手順を説明します。

**所要時間**: 約30〜60分（Apple Developer Program加入済みの場合）

**コスト**: $99/年（Apple Developer Program）

---

## このガイドが必要なケース

### 必要な場合 ✅

| シナリオ                  | コード署名 | 公証 (Notarization) |
| ------------------------- | :--------: | :-----------------: |
| 他人にアプリを配布する    |  ✅ 必要   |       ✅ 必要       |
| Mac App Storeで公開する   |  ✅ 必要   |       ✅ 必要       |
| GitHub Releasesで公開する |  ✅ 必要   |       ✅ 必要       |
| 社内チームに配布する      |  ✅ 必要   |       ✅ 必要       |

### 不要な場合 ❌

| シナリオ                        | コード署名 | 公証 (Notarization) |
| ------------------------------- | :--------: | :-----------------: |
| 自分のMacでのみ開発・実行       |  ❌ 不要   |       ❌ 不要       |
| ローカルでのテスト・デバッグ    |  ❌ 不要   |       ❌ 不要       |
| 開発モードでの実行 (`pnpm dev`) |  ❌ 不要   |       ❌ 不要       |

### ローカル開発での署名スキップ方法

自分だけで使用する場合、ビルド時に署名をスキップできます：

```bash
# 署名なしでローカルビルド
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm --filter @repo/desktop package:mac
```

既存のCI設定（`.github/workflows/build-electron.yml`）では、PR/プッシュ時のビルドは署名なしで実行されます。

> **結論**: ローカル開発のみなら、このガイドの設定は不要です。
> 将来、他人に配布する際にこのガイドに戻ってきてください。

---

## 前提条件チェックリスト

- [ ] macOSを使用している
- [ ] Xcodeがインストールされている
- [ ] Apple IDを持っている
- [ ] Apple Developer Programに加入している（$99/年）

### Apple Developer Program未加入の場合

1. https://developer.apple.com/programs/ にアクセス
2. 「Enroll」ボタンをクリック
3. Apple IDでサインイン
4. 個人または組織として登録
5. $99を支払い
6. **承認まで最大48時間待つ**

---

## Step 1: Developer ID Application 証明書の作成

### 1.1 Xcodeを開く

1. Finderを開く
2. 「アプリケーション」フォルダに移動
3. **Xcode** をダブルクリックして起動

### 1.2 Xcodeの設定を開く

1. 画面上部のメニューバーで **Xcode** をクリック
2. ドロップダウンから **Settings...** をクリック（または `Cmd + ,`）

### 1.3 Apple IDを追加（未追加の場合）

1. 設定ウィンドウの上部タブから **Accounts** をクリック
2. 左下の **+** ボタンをクリック
3. **Apple ID** を選択して **Continue** をクリック
4. Apple IDとパスワードを入力して **Sign In**

### 1.4 証明書を作成

1. Accountsタブで、左側のリストからあなたの **Apple ID** を選択
2. 右側に表示される **Team** の中から、Developer Programに登録したチームを選択
3. **Manage Certificates...** ボタンをクリック
4. 左下の **+** ボタンをクリック
5. 表示されるメニューから **Developer ID Application** を選択
6. 証明書が自動的に作成される
7. **Done** をクリック

**確認方法**:
ターミナルを開いて以下を実行：

```bash
security find-identity -v -p codesigning
```

出力に `Developer ID Application: Your Name (XXXXXXXXXX)` が表示されればOK

---

## Step 2: 証明書をエクスポート（.p12ファイル）

### 2.1 キーチェーンアクセスを開く

1. `Cmd + Space` でSpotlightを開く
2. 「キーチェーンアクセス」と入力
3. **キーチェーンアクセス.app** をクリックして起動

### 2.2 証明書を見つける

1. 左サイドバーの「デフォルトキーチェーン」セクションで **ログイン** をクリック
2. 左サイドバーの「カテゴリ」セクションで **自分の証明書** をクリック
3. メインエリアで **Developer ID Application: あなたの名前 (TEAM_ID)** を探す

### 2.3 証明書をエクスポート

1. 該当の証明書を **右クリック**
2. メニューから **「"Developer ID Application: ..."を書き出す...」** を選択
3. 保存ダイアログが表示される：
   - **名前**: `certificate`（任意）
   - **場所**: デスクトップ（任意）
   - **フォーマット**: 個人情報交換 (.p12) ← **重要: これを選択**
4. **保存** をクリック
5. パスワード設定ダイアログが表示される：
   - **パスワード**: 強力なパスワードを入力（例: `MyStr0ngP@ssw0rd!`）
   - **確認**: 同じパスワードを再入力
   - **このパスワードをメモしておく** ← `CSC_KEY_PASSWORD` として使用
6. **OK** をクリック
7. macOSのログインパスワードを求められたら入力

**結果**: デスクトップに `certificate.p12` ファイルが作成される

---

## Step 3: 証明書をBase64エンコード

### 3.1 ターミナルを開く

1. `Cmd + Space` でSpotlightを開く
2. 「ターミナル」と入力
3. **ターミナル.app** をクリックして起動

### 3.2 Base64エンコードを実行

以下のコマンドを実行（パスは実際の保存場所に合わせる）：

```bash
# デスクトップに保存した場合
base64 -i ~/Desktop/certificate.p12 -o ~/Desktop/certificate_base64.txt
```

### 3.3 エンコード結果を確認

```bash
cat ~/Desktop/certificate_base64.txt
```

**出力例**:

```
MIIKYQIBAzCCCicGCSqGSIb3DQEHAaCCChgEggoUMIIKEDCCBMcGCSqGSIb3DQEHBqCCBLgwggS0AgEAMIIErQYJKoZIhvcNAQcBMBwGCiqGSIb3DQEMAQYwDgQI...（長い文字列）...
```

この出力全体が `CSC_LINK` の値になる

---

## Step 4: App-specific Password の生成

### 4.1 Apple IDサイトにアクセス

1. ブラウザで https://appleid.apple.com を開く
2. **サインイン** をクリック
3. Apple IDとパスワードを入力
4. 2ファクタ認証コードを入力（求められた場合）

### 4.2 アプリ用パスワードを生成

1. サインイン後、左サイドメニューから **サインインとセキュリティ** をクリック
2. **アプリ用パスワード** セクションを見つける
3. **アプリ用パスワードを生成** をクリック（または **+** ボタン）
4. ラベル入力ダイアログが表示される：
   - **ラベル**: `Electron Notarization` と入力
5. **作成** をクリック
6. パスワードが表示される（形式: `xxxx-xxxx-xxxx-xxxx`）
7. **このパスワードをコピーしてメモしておく** ← `APPLE_APP_SPECIFIC_PASSWORD` として使用
8. **完了** をクリック

**注意**: このパスワードは一度しか表示されません。必ずコピーしてください。

---

## Step 5: Team ID の確認

### 5.1 Apple Developerサイトにアクセス

1. ブラウザで https://developer.apple.com を開く
2. 右上の **Account** をクリック
3. Apple IDでサインイン

### 5.2 Team IDを確認

1. サインイン後、左サイドメニューから **Membership details** をクリック
2. **Team ID** の値をメモする（形式: `ABC123XYZ` のような10文字）

この値が `APPLE_TEAM_ID` になる

---

## Step 6: GitHub Secretsに設定

### 6.1 GitHubリポジトリを開く

1. ブラウザで GitHub リポジトリを開く
   - URL例: `https://github.com/your-username/AIWorkflowOrchestrator`

### 6.2 Settingsを開く

1. リポジトリページ上部のタブから **Settings** をクリック
   - （タブが見えない場合は「...」をクリックして展開）

### 6.3 Secrets設定ページを開く

1. 左サイドバーの「Security」セクションで **Secrets and variables** をクリック
2. 展開されたメニューから **Actions** をクリック

### 6.4 シークレットを追加

以下の5つのシークレットを順番に追加します：

#### シークレット1: CSC_LINK

1. **New repository secret** ボタンをクリック
2. 入力フォームに以下を入力：
   - **Name**: `CSC_LINK`
   - **Secret**: Step 3で生成したBase64文字列（`certificate_base64.txt`の内容全体）
3. **Add secret** をクリック

#### シークレット2: CSC_KEY_PASSWORD

1. **New repository secret** ボタンをクリック
2. 入力フォームに以下を入力：
   - **Name**: `CSC_KEY_PASSWORD`
   - **Secret**: Step 2.3で設定した証明書のパスワード
3. **Add secret** をクリック

#### シークレット3: APPLE_ID

1. **New repository secret** ボタンをクリック
2. 入力フォームに以下を入力：
   - **Name**: `APPLE_ID`
   - **Secret**: あなたのApple ID（メールアドレス形式）
3. **Add secret** をクリック

#### シークレット4: APPLE_APP_SPECIFIC_PASSWORD

1. **New repository secret** ボタンをクリック
2. 入力フォームに以下を入力：
   - **Name**: `APPLE_APP_SPECIFIC_PASSWORD`
   - **Secret**: Step 4で生成したApp-specific password（`xxxx-xxxx-xxxx-xxxx`形式）
3. **Add secret** をクリック

#### シークレット5: APPLE_TEAM_ID

1. **New repository secret** ボタンをクリック
2. 入力フォームに以下を入力：
   - **Name**: `APPLE_TEAM_ID`
   - **Secret**: Step 5で確認したTeam ID
3. **Add secret** をクリック

### 6.5 設定確認

Secrets一覧に以下の5つが表示されていればOK：

- `CSC_LINK`
- `CSC_KEY_PASSWORD`
- `APPLE_ID`
- `APPLE_APP_SPECIFIC_PASSWORD`
- `APPLE_TEAM_ID`

---

## Step 7: クリーンアップ（セキュリティ）

ローカルに残っている機密ファイルを削除：

```bash
# 証明書ファイルを安全に削除
rm ~/Desktop/certificate.p12
rm ~/Desktop/certificate_base64.txt

# ゴミ箱を空にする（オプション）
```

---

## 設定完了チェックリスト

- [ ] Developer ID Application証明書を作成した
- [ ] 証明書を.p12ファイルとしてエクスポートした
- [ ] 証明書をBase64エンコードした
- [ ] App-specific passwordを生成した
- [ ] Team IDを確認した
- [ ] GitHub Secretsに5つのシークレットを追加した
- [ ] ローカルの機密ファイルを削除した

---

## 次のステップ

macOSコード署名の設定が完了しました。

次は以下のドキュメントに進んでください：

- **Windowsコード署名**: `setup-guide-windows-codesigning.md`（オプション）
- **リリース手順**: `setup-guide-release-process.md`

---

## トラブルシューティング

### 「証明書が見つからない」

```bash
# キーチェーン内の証明書を確認
security find-identity -v -p codesigning
```

何も表示されない場合は、Step 1からやり直してください。

### 「Notarizationに失敗した」

1. App-specific passwordが正しいか確認
2. Team IDが正しいか確認
3. 証明書が「Developer ID Application」タイプか確認

### 「Base64エンコードが失敗した」

```bash
# ファイルパスを確認
ls -la ~/Desktop/certificate.p12

# ファイルが存在する場合、再度実行
base64 -i ~/Desktop/certificate.p12 | tr -d '\n' > ~/Desktop/certificate_base64.txt
```
