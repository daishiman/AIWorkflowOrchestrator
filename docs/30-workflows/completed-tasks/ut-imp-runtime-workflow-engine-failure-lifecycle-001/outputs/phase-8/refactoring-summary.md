# Refactoring Summary

| 対象                   | 方針                                           |
| ---------------------- | ---------------------------------------------- |
| engine failure helper  | reject / review path の重複削減                |
| transition guard error | stable error code と message を統一            |
| test fixture           | reject path と review path の fixture を共通化 |
