# Level 1: Basics

## 概要

GitHub Actions キャッシュの基礎概念を整理する。

## 基本概念

- actions/cache
- キーとrestore-keys
- キャッシュパス
- 10GB制限

## 使用タイミング

- キャッシュ導入の初期段階
- ビルド時間の削減検討時

## 最小手順

1. キャッシュ対象を整理する
2. キー構成を決める
3. パスとrestore-keysを設定する

## テンプレート

- `assets/cache-examples.yaml`

## チェックリスト

- [ ] キャッシュ対象が明確である
- [ ] キー構成が決まっている
- [ ] restore-keys が設定されている
