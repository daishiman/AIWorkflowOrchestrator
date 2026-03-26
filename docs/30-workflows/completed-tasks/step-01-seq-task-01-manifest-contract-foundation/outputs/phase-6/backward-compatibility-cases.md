# Backward Compatibility Cases

| ケース              | 判定                                                    |
| ------------------- | ------------------------------------------------------- |
| `schemaVersion = 1` | accept                                                  |
| `schemaVersion = 2` | reject                                                  |
| field deprecation   | 初回 foundation では未導入。unknown field として reject |

## 判断

初回 foundation は薄い contract を優先し、後方互換レイヤーを持たない。
