# Phase 2 依存整合マトリクス

| 依存元             | 依存先                     | 整合項目                        | 判定                  |
| ------------------ | -------------------------- | ------------------------------- | --------------------- |
| Phase 1 FR-01      | Phase 2 アーキ設計         | Mainでauth-key登録を明記        | OK                    |
| Phase 1 FR-02      | Phase 2 ライフサイクル設計 | unregister/register再実行を明記 | OK                    |
| Phase 1 FR-03      | Phase 2 契約設計           | `exists` 戻り値形状維持         | OK                    |
| Phase 1 FR-04      | Phase 2 テスト戦略         | 二重登録/再登録回帰を含む       | OK                    |
| Preload契約        | Main実装                   | チャネル名一致（AUTH*KEY*\*）   | OK                    |
| Renderer preflight | Main実装                   | exists 呼び出し可能性           | 要実装反映（Phase 5） |

## 未解決依存

- 実装修正未反映（Phase 5で解消予定）
