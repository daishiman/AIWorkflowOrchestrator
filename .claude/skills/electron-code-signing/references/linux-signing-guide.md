# Linux Code Signing Guide

## Quick Reference

### 署名は任意

Linux では、コード署名は任意です。主な配布方法：

- **AppImage**: 署名なしでも配布可能
- **Snap**: Snap Store が署名を管理
- **deb/rpm**: GPG 署名可能

### GPG 署名（オプション）

#### GPG キーの生成

```bash
gpg --full-generate-key
# RSA and RSA (default)
# 4096 bits
# Email: your-email@example.com
```

#### AppImage への署名

```bash
# AppImage を署名
gpg --detach-sign --armor MyApp.AppImage

# 検証
gpg --verify MyApp.AppImage.asc MyApp.AppImage
```

### electron-builder 設定

```yaml
linux:
  target:
    - AppImage
    - deb
    - rpm
  category: Utility
```

### deb パッケージの署名

```bash
# パッケージを署名
dpkg-sig --sign builder MyApp.deb

# 検証
dpkg-sig --verify MyApp.deb
```

### rpm パッケージの署名

```bash
# rpm に署名
rpm --addsign MyApp.rpm

# 検証
rpm --checksig MyApp.rpm
```

## Snap Store

Snap Store での配布は、Store 側が自動的に署名を管理します。

```bash
# Snap をビルド
snapcraft

# Snap Store にアップロード
snapcraft upload --release=stable MyApp.snap
```

## 詳細は electron-builder ドキュメントを参照
