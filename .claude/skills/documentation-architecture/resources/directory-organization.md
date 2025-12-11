# ディレクトリ組織化ガイド

## 標準ディレクトリ構造

```
skill-name/
├── SKILL.md                    # メインドキュメント
├── resources/                  # 詳細ドキュメント
│   ├── [topic].md
│   └── [category]/            # サブカテゴリ（必要に応じて）
│       └── [subtopic].md
├── scripts/                    # 実行可能スクリプト
│   └── [purpose].sh
└── templates/                  # 再利用可能テンプレート
    └── [template-name].[ext]
```

## 各ディレクトリの役割

### resources/

**用途**: 詳細な専門知識、トピック別ドキュメント

**配置基準**:

- [ ] Markdownファイル（.md）
- [ ] 500行以内
- [ ] SKILL.mdから参照される

**命名**: `[topic]-[aspect].md`

### scripts/

**用途**: 検証、分析、自動化スクリプト

**配置基準**:

- [ ] 実行可能（chmod +x）
- [ ] shebang付き
- [ ] ヘルプメッセージ付き

**命名**: `[purpose]-[object].sh`

### templates/

**用途**: 再利用可能な設定ファイル、テンプレート

**配置基準**:

- [ ] プレースホルダー付き
- [ ] コメントで説明
- [ ] 即座に使用可能

**命名**: `[template-name]-template.[ext]`

## 配置の判断基準

**SKILL.mdに含める**:

- 概要、ワークフロー、基本的なベストプラクティス

**resources/に配置**:

- 詳細な理論、高度な応用、トラブルシューティング

**scripts/に配置**:

- 検証、分析、自動化が必要な処理

**templates/に配置**:

- ユーザーが再利用するフォーマット
