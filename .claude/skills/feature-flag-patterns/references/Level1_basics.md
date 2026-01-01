# Level 1: Feature Flag 基礎概念

## 目的

Feature Flagの基本概念と、なぜそれが必要かを理解する。

---

## Feature Flagとは

Feature Flag（Feature Toggle）は、コードを変更せずに機能のON/OFFを切り替える仕組み。

### 基本構造

```typescript
if (featureFlags.isEnabled("new-checkout-flow")) {
  // 新しいチェックアウトフロー
  return newCheckoutFlow();
} else {
  // 既存のチェックアウトフロー
  return legacyCheckoutFlow();
}
```

---

## なぜFeature Flagが必要か

### 1. デプロイとリリースの分離

| 従来の方法                    | Feature Flag使用時            |
| ----------------------------- | ----------------------------- |
| コードデプロイ = 機能リリース | コードデプロイ ≠ 機能リリース |
| 本番反映まで機能確認不可      | 本番で段階的に検証可能        |
| ロールバックはコード巻き戻し  | フラグOFFで即座に無効化可能   |

### 2. リスク最小化

- **段階的展開**: 1% → 10% → 50% → 100%
- **即座のロールバック**: フラグOFFで機能無効化
- **影響範囲限定**: 特定ユーザー・地域のみで試験

### 3. 継続的デリバリー

- **トランクベース開発**: 機能ブランチ不要
- **頻繁なデプロイ**: 未完成機能もフラグでOFFにしてデプロイ
- **並行開発**: 複数チームが同時に本番環境で開発

---

## 4つのフラグタイプ

Pete Hodgsonによる分類:

### Release Toggle（リリーストグル）

**目的**: 未完成機能の本番デプロイ

**特徴**:

- 短期間（数日〜数週間）
- 完全にリリース後は削除
- 開発チームが管理

**例**:

```typescript
// 新機能開発中
if (flags.isEnabled('release_new_dashboard')) {
  return <NewDashboard />;
}
return <OldDashboard />;
```

### Experiment Toggle（実験トグル）

**目的**: A/Bテスト・多変量テスト

**特徴**:

- 中期間（実験期間＋分析期間）
- データドリブンな意思決定
- プロダクトチームが管理

**例**:

```typescript
// A/Bテスト
const variant = experiments.getVariant('exp_checkout_button_color');
if (variant === 'red') {
  return <RedButton />;
} else {
  return <BlueButton />;
}
```

### Ops Toggle（運用トグル）

**目的**: システム動作の制御

**特徴**:

- 長期間（システムの一部として維持）
- 運用時の柔軟性確保
- 運用チームが管理

**例**:

```typescript
// サーキットブレーカー
if (ops.isEnabled("circuit_breaker_payment_api")) {
  return callPaymentAPI();
} else {
  return useBackupPaymentMethod();
}
```

### Permission Toggle（権限トグル）

**目的**: ユーザー権限・プランによる機能制限

**特徴**:

- 長期間（ビジネスルールとして維持）
- ビジネスモデルの一部
- ビジネスチームが管理

**例**:

```typescript
// プレミアム機能
if (permissions.hasAccess('premium_analytics', user)) {
  return <AdvancedAnalytics />;
} else {
  return <BasicAnalytics />;
}
```

---

## フラグのライフサイクル

### Release Toggleの典型的なライフサイクル

```
1. フラグ作成（デフォルト: OFF）
   ↓
2. 開発環境でON
   ↓
3. ステージング環境でON
   ↓
4. 本番環境で段階的ON（1% → 10% → 50% → 100%）
   ↓
5. 2週間安定運用
   ↓
6. フラグ削除（コードクリーンアップ）
```

**重要**: Release Toggleは必ず削除する。削除しないとテクニカルデットが蓄積する。

---

## 基本的な実装パターン

### Simple Boolean Flag（シンプルなboolean）

```typescript
interface FeatureFlags {
  newCheckoutFlow: boolean;
  darkMode: boolean;
}

const flags: FeatureFlags = {
  newCheckoutFlow: false,
  darkMode: true,
};
```

### Configuration-based（設定ベース）

```json
{
  "features": {
    "new_checkout_flow": {
      "enabled": false,
      "description": "新しいチェックアウトフロー"
    }
  }
}
```

### Service-based（サービスベース）

```typescript
class FeatureFlagService {
  isEnabled(flagName: string): boolean {
    // 外部サービス（LaunchDarkly、Unleash等）から取得
    return this.client.variation(flagName, false);
  }
}
```

---

## 基本的なベストプラクティス

### DO（すべきこと）

| プラクティス               | 理由                         |
| -------------------------- | ---------------------------- |
| デフォルトを安全な状態に   | フラグサービス障害時の保護   |
| フラグに有効期限を設定     | テクニカルデット防止         |
| フラグ名に接頭辞を使用     | タイプ識別（release*, exp*） |
| フラグごとにオーナーを指定 | 責任の明確化                 |

### DON'T（避けるべきこと）

| アンチパターン       | 問題点                |
| -------------------- | --------------------- |
| フラグのネスト       | 組み合わせ爆発（2^n） |
| フラグの無期限保持   | テクニカルデット蓄積  |
| フラグなしでのテスト | 全状態の検証漏れ      |

---

## よくある質問

### Q: いつFeature Flagを使うべきか？

**A**: 以下の場合に使用を検討:

- 大きな機能を段階的にリリースしたい
- A/Bテストでデータドリブンな意思決定をしたい
- 本番環境で機能を試したいが、全ユーザーへの影響は避けたい
- Kill Switchが必要（緊急時の機能無効化）

### Q: Feature Flagのデメリットは？

**A**: 主なデメリット:

- コードの複雑性増加
- テストケースの増加（ON/OFF両方をテスト）
- テクニカルデット（削除されないフラグの蓄積）

**軽減策**: ライフサイクル管理を徹底する

### Q: どのツールを使えば良いか？

**A**: 規模に応じて選択:

| 規模   | 推奨ツール                 |
| ------ | -------------------------- |
| 小規模 | 環境変数、JSON設定ファイル |
| 中規模 | Unleash（オープンソース）  |
| 大規模 | LaunchDarkly、Split.io     |

---

## 次のステップ

Level 1を理解したら、Level 2で実装パターンを学ぶ:

- [Level2_intermediate.md](Level2_intermediate.md)
