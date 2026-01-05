# フラグタイプリファレンス

## Release Toggle

### 目的

機能のリリースをデプロイから分離する。

### 特徴

| 項目           | 値                               |
| -------------- | -------------------------------- |
| 寿命           | 短期（数日〜数週間）             |
| 動的変更       | 高頻度                           |
| 削除タイミング | 100% ロールアウト後 2-4 週間以内 |

### 使用例

```typescript
const releaseFlag: FeatureFlag = {
  name: "new-checkout-flow",
  type: "release",
  defaultValue: false,
  owner: "checkout-team",
  expiresAt: "2026-02-01",
};
```

## Experiment Toggle

### 目的

A/Bテストやマルチバリエントテストを実行する。

### 特徴

| 項目           | 値                     |
| -------------- | ---------------------- |
| 寿命           | 中期（数週間〜数ヶ月） |
| 動的変更       | テスト設計時のみ       |
| 削除タイミング | 実験終了・結論確定後   |

### 使用例

```typescript
const experimentFlag: FeatureFlag = {
  name: "pricing-experiment",
  type: "experiment",
  defaultValue: false,
  owner: "growth-team",
  variants: ["control", "variant_a", "variant_b"],
};
```

## Ops Toggle

### 目的

運用上の制御（パフォーマンス調整、機能無効化）。

### 特徴

| 項目           | 値                       |
| -------------- | ------------------------ |
| 寿命           | 長期（永続的な場合あり） |
| 動的変更       | 緊急時に即座             |
| 削除タイミング | 運用上不要になった時     |

### 使用例

```typescript
const opsFlag: FeatureFlag = {
  name: "enable-caching",
  type: "ops",
  defaultValue: true,
  owner: "platform-team",
  description: "キャッシュ層の有効/無効化",
};
```

## Permission Toggle

### 目的

特定ユーザー/グループへの機能アクセス制御。

### 特徴

| 項目           | 値                 |
| -------------- | ------------------ |
| 寿命           | 長期               |
| 動的変更       | ユーザー権限変更時 |
| 削除タイミング | 機能自体の削除時   |

### 使用例

```typescript
const permissionFlag: FeatureFlag = {
  name: "admin-dashboard",
  type: "permission",
  defaultValue: false,
  owner: "security-team",
  allowedRoles: ["admin", "super-admin"],
};
```

## 選択ガイド

| 質問                                 | 選択肢            |
| ------------------------------------ | ----------------- |
| 機能を段階的にリリースしたい？       | Release Toggle    |
| ユーザー行動をテストしたい？         | Experiment Toggle |
| 運用時に動的に制御したい？           | Ops Toggle        |
| 特定ユーザーにのみ機能を提供したい？ | Permission Toggle |
