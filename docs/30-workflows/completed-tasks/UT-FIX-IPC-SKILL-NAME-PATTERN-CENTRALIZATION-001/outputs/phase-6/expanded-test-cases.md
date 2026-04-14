# Phase 6: 拡張テストケース

## 重点ケース

| ID   | 対象                                      | 期待                 |
| ---- | ----------------------------------------- | -------------------- |
| E-01 | `MAX_SKILL_NAME_LENGTH === 64`            | true                 |
| E-02 | 64 文字の kebab-case                      | true                 |
| E-03 | 65 文字の kebab-case                      | false                |
| E-04 | `skill\\..`                               | false                |
| E-05 | `import('@repo/shared/constants')` 失敗時 | dist fallback へ切替 |

## 補足

- 通常系だけでなく、長さ境界とパス汚染を明示的に追加した。
- runtime 依存は package import 優先、fallback ありで扱う。
