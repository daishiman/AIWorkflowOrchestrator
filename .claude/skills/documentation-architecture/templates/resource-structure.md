# リソース構造テンプレート

このセクションをSKILL.mdに含めることで、ユーザーがリソースを簡単に発見できます。

## テンプレート

```markdown
## リソース構造

\```
[skill-name]/
├── SKILL.md                    # 本ファイル（概要とワークフロー）
├── resources/
│   ├── [resource-1].md        # [説明]
│   ├── [resource-2].md        # [説明]
│   └── [resource-3].md        # [説明]
├── scripts/
│   └── [script].sh            # [説明] - 実行: `./scripts/[script].sh`
└── templates/
    └── [template].[ext]       # [説明]
\```

### リソース種別

- **[カテゴリ1]** (`resources/[file].md`): [用途と内容]
- **[カテゴリ2]** (`resources/[file].md`): [用途と内容]
- **スクリプト** (`scripts/[file].sh`): [用途] - 実行: `./scripts/[file].sh [args]`
- **テンプレート** (`templates/[file]`): [用途]
```

## 使用方法

1. SKILL.mdの「概要」セクションの後に配置
2. 実際のファイル構成に合わせて更新
3. 各リソースの説明を簡潔に記載
