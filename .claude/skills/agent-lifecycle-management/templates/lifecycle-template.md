# ライフサイクル管理テンプレート

このテンプレートは、エージェントのライフサイクル管理を設計するためのものです。

---

## 1. バージョン管理

### セマンティックバージョニング

```yaml
version: MAJOR.MINOR.PATCH
```

| 変更タイプ | バージョン変更 | 例 |
|-----------|--------------|-----|
| 破壊的変更（API互換性なし） | MAJOR | 1.0.0 → 2.0.0 |
| 新機能追加（後方互換性あり） | MINOR | 1.0.0 → 1.1.0 |
| バグ修正（後方互換性あり） | PATCH | 1.0.0 → 1.0.1 |

### ステータス定義

| ステータス | バージョン | 説明 |
|-----------|-----------|------|
| `experimental` | 0.0.x | 実験的、本番使用非推奨 |
| `alpha` | 0.x.x | 開発初期、APIは不安定 |
| `beta` | 0.x.x-beta | 機能完了、安定化中 |
| `rc` | 1.0.0-rc.1 | リリース候補 |
| `stable` | 1.0.0+ | 本番使用可能 |
| `maintenance` | x.x.x | セキュリティ修正のみ |
| `deprecated` | - | 廃止予定 |
| `end-of-life` | - | サポート終了 |

---


## 3. 廃止予定管理

### 廃止通知テンプレート

```markdown
## 廃止予定（Deprecation）

### {{feature-name}}

**ステータス**: 廃止予定
**廃止予定バージョン**: {{deprecation-version}}
**削除予定バージョン**: {{removal-version}}
**削除予定日**: {{removal-date}}

**理由**:
{{deprecation-reason}}

**移行先**:
{{migration-target}}

**移行手順**:
1. {{migration-step-1}}
2. {{migration-step-2}}
3. {{migration-step-3}}
```

### 廃止ポリシー

| フェーズ | タイムライン | アクション |
|---------|------------|----------|
| 通知 | 廃止決定時 | ドキュメントに廃止予定を記載 |
| 警告 | 1バージョン後 | 使用時に警告を表示 |
| 削除 | 2バージョン後 | 機能を完全に削除 |

---

## 4. 移行ガイドテンプレート

```markdown
## v{{old-version}} から v{{new-version}} への移行ガイド

### 概要

このガイドは、v{{old-version}}からv{{new-version}}への
アップグレード手順を説明します。

### 破壊的変更

#### 1. {{breaking-change-1}}

**変更前**:
\`\`\`{{language}}
{{old-code}}
\`\`\`

**変更後**:
\`\`\`{{language}}
{{new-code}}
\`\`\`

**移行手順**:
1. {{step-1}}
2. {{step-2}}

### 新機能

- **{{new-feature-1}}**: {{new-feature-1-description}}
- **{{new-feature-2}}**: {{new-feature-2-description}}

### 非推奨となった機能

- **{{deprecated-1}}**: {{deprecated-1-alternative}}

### 互換性マトリックス

| 依存関係 | 最小バージョン | 推奨バージョン |
|---------|--------------|--------------|
| {{dep-1}} | {{min-version-1}} | {{recommended-version-1}} |
| {{dep-2}} | {{min-version-2}} | {{recommended-version-2}} |
```

---

## 5. 依存関係管理

### 依存関係定義テンプレート

```yaml
dependencies:
  required:
    - name: {{dependency-name}}
      version: ">=1.0.0"
      purpose: {{dependency-purpose}}

  optional:
    - name: {{optional-dep-name}}
      version: ">=2.0.0"
      purpose: {{optional-dep-purpose}}
      when: {{optional-dep-condition}}

  peer:
    - name: {{peer-dep-name}}
      version: "^3.0.0"
      reason: {{peer-dep-reason}}
```

### 依存関係更新ポリシー

| 依存関係タイプ | 更新頻度 | 更新方法 |
|--------------|---------|---------|
| セキュリティ修正 | 即時 | 自動更新 |
| パッチ版 | 週次 | 自動更新 |
| マイナー版 | 月次 | レビュー後更新 |
| メジャー版 | 四半期 | 互換性テスト後更新 |

---

## 6. サポートポリシー

### サポート期間定義

```markdown
## サポートポリシー

### サポート期間

| バージョン | ステータス | 終了予定日 |
|-----------|----------|-----------|
| v{{current}} | Active | - |
| v{{previous}} | Maintenance | {{maintenance-end-date}} |
| v{{old}} | End of Life | {{eol-date}} |

### サポートレベル

| レベル | 対象 | 内容 |
|-------|------|------|
| Active | 最新メジャーバージョン | フル機能開発、バグ修正、セキュリティ修正 |
| Maintenance | 1つ前のメジャーバージョン | セキュリティ修正のみ |
| End of Life | 2つ以上前のバージョン | サポート終了 |
```

---

## 7. リリースプロセス

### リリースチェックリスト

```markdown
## リリースチェックリスト

### 準備
- [ ] すべてのテストが通過
- [ ] ドキュメントが更新済み
- [ ] 変更履歴が記載済み
- [ ] 破壊的変更の移行ガイドが作成済み
- [ ] 依存関係が最新

### レビュー
- [ ] コードレビュー完了
- [ ] セキュリティレビュー完了
- [ ] パフォーマンステスト完了

### リリース
- [ ] バージョン番号を更新
- [ ] タグを作成
- [ ] リリースノートを公開

### 事後
- [ ] 監視アラートを確認
- [ ] ユーザーフィードバックを収集
```

---

## 変数説明

| 変数 | 説明 | 例 |
|------|------|-----|
| `{{version}}` | バージョン番号 | 2.1.0 |
| `{{date}}` | 日付 | 2025-11-27 |
| `{{major}}` | メジャーバージョン | 2 |
| `{{minor}}` | マイナーバージョン | 1 |
| `{{patch}}` | パッチバージョン | 0 |
| `{{deprecation-version}}` | 廃止予定バージョン | 2.0.0 |
| `{{removal-version}}` | 削除予定バージョン | 3.0.0 |
| `{{breaking-change-n}}` | 破壊的変更 | API署名の変更 |
| `{{migration-step-n}}` | 移行手順 | 新APIに置換 |
