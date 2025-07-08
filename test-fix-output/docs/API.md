# API仕様書

## 概要

test-fixのAPI仕様を定義します。

## 1. [API_TYPE_1] ([PROTOCOL_1])

### エンドポイント
- [CONNECTION_TYPE_1]: [CONNECTION_PATH_1]
- Protocol: [PROTOCOL_DETAIL_1]
- Encoding: [ENCODING_1]

### メッセージフォーマット

#### リクエスト
```json
{
  "[MESSAGE_TYPE_KEY]": {
    "[FIELD_1]": "[VALUE_1]",
    "[FIELD_2]": "[VALUE_2]"
  }
}
```

#### レスポンス
```json
{
  "[SUCCESS_TYPE]": {
    "[DATA_FIELD]": {}
  }
}
// または
{
  "[ERROR_TYPE]": "[ERROR_MESSAGE]"
}
```

## 2. コアメッセージタイプ

### 2.1 [MESSAGE_CATEGORY_1]

#### [MESSAGE_TYPE_1_1]
```json
{ "[MESSAGE_TYPE_1_1]": null }
```
レスポンス:
```json
{ "[RESPONSE_TYPE_1_1]": null }
```

#### [MESSAGE_TYPE_1_2]
```json
{ "[MESSAGE_TYPE_1_2]": null }
```
レスポンス:
```json
{
  "[RESPONSE_TYPE_1_2]": {
    "[STATUS_FIELD_1]": [...],
    "[STATUS_FIELD_2]": [...],
    "[STATUS_FIELD_3]": {...}
  }
}
```

### 2.2 [MESSAGE_CATEGORY_2]

#### [MESSAGE_TYPE_2_1]
```json
{
  "[MESSAGE_TYPE_2_1]": {
    "[PARAM_2_1_1]": "[PARAM_VALUE_2_1_1]",
    "[PARAM_2_1_2]": "[PARAM_VALUE_2_1_2]"
  }
}
```

#### [MESSAGE_TYPE_2_2]
```json
{
  "[MESSAGE_TYPE_2_2]": {
    "[PARAM_2_2_1]": "[PARAM_VALUE_2_2_1]"
  }
}
```

#### [MESSAGE_TYPE_2_3]
```json
{
  "[MESSAGE_TYPE_2_3]": {
    "[PARAM_2_3_1]": "[PARAM_VALUE_2_3_1]"
  }
}
```

### 2.3 [MESSAGE_CATEGORY_3]

#### [MESSAGE_TYPE_3_1]
```json
{
  "[MESSAGE_TYPE_3_1]": {
    "[PARAM_3_1_1]": "[PARAM_VALUE_3_1_1]",
    "[PARAM_3_1_2]": "[PARAM_VALUE_3_1_2]",
    "[PARAM_3_1_3]": ["[PARAM_VALUE_3_1_3]"],
    "[PARAM_3_1_4]": "[PARAM_VALUE_3_1_4]",
    "[PARAM_3_1_5]": {
      "[ENV_VAR_1]": "[ENV_VALUE_1]"
    }
  }
}
```

#### [MESSAGE_TYPE_3_2]
```json
{
  "[MESSAGE_TYPE_3_2]": {
    "[PARAM_3_2_1]": "[PARAM_VALUE_3_2_1]"
  }
}
```

### 2.4 [MESSAGE_CATEGORY_4] ([FEATURE_REF_1])

#### [MESSAGE_TYPE_4_1]
```json
{
  "[MESSAGE_TYPE_4_1]": {
    "[COORD_TYPE_1]": {
      "[COORD_PARAM_1_1]": "[COORD_VALUE_1_1]",
      "[COORD_PARAM_1_2]": "[COORD_VALUE_1_2]",
      "[COORD_PARAM_1_3]": {
        "[TASK_FIELD_1]": "[TASK_VALUE_1]",
        "[TASK_FIELD_2]": "[TASK_VALUE_2]",
        "[TASK_FIELD_3]": []
      }
    }
  }
}
```

#### [MESSAGE_TYPE_4_2]
```json
{
  "[MESSAGE_TYPE_4_1]": {
    "[COORD_TYPE_2]": {
      "[COORD_PARAM_2_1]": "[COORD_VALUE_2_1]",
      "[COORD_PARAM_2_2]": "[COORD_VALUE_2_2]",
      "[COORD_PARAM_2_3]": {
        "[RESULT_FIELD_1]": "[RESULT_VALUE_1]",
        "[RESULT_FIELD_2]": "[RESULT_VALUE_2]",
        "[RESULT_FIELD_3]": "..."
      }
    }
  }
}
```

### 2.5 [MESSAGE_CATEGORY_5]

#### [MESSAGE_TYPE_5_1]
```json
{
  "[MESSAGE_TYPE_4_1]": {
    "[SYNC_TYPE_1]": {
      "[SYNC_PARAM_1_1]": "[SYNC_VALUE_1_1]",
      "[SYNC_PARAM_1_2]": ["[FILE_1]", "[FILE_2]"]
    }
  }
}
```

## 3. [API_TYPE_2] API

### エンドポイント
- URL: `[WEBSOCKET_URL]`
- Protocol: [WEBSOCKET_PROTOCOL]
- Message Format: [MESSAGE_FORMAT_2]

### メッセージタイプ

#### [WS_MESSAGE_TYPE_1]
```json
{
  "type": "[WS_TYPE_1]",
  "data": {
    "[WS_DATA_1_1]": [WS_VALUE_1_1],
    "[WS_DATA_1_2]": [WS_VALUE_1_2],
    "[WS_DATA_1_3]": [...]
  }
}
```

#### [WS_MESSAGE_TYPE_2]
```json
{
  "type": "[WS_TYPE_2]",
  "data": {
    "[WS_DATA_2_1]": [...],
    "[WS_DATA_2_2]": [...],
    "[WS_DATA_2_3]": [...]
  }
}
```

## 4. [API_TYPE_3] ([INTEGRATION_TARGET])

### 4.1 [API_CATEGORY_3_1]

```[SCRIPT_LANGUAGE_1]
[API_EXAMPLE_3_1_1]

[API_EXAMPLE_3_1_2]

[API_EXAMPLE_3_1_3]
```

### 4.2 [API_CATEGORY_3_2] ([FEATURE_REF_2])

```[SCRIPT_LANGUAGE_1]
[API_EXAMPLE_3_2_1]

[API_EXAMPLE_3_2_2]
```

### 4.3 [API_CATEGORY_3_3]

```[SCRIPT_LANGUAGE_1]
[API_EXAMPLE_3_3_1]

[API_EXAMPLE_3_3_2]
```

## 5. エラーコード

| コード | 説明 |
|-------|------|
| [ERROR_CODE_1] | [ERROR_DESC_1] |
| [ERROR_CODE_2] | [ERROR_DESC_2] |
| [ERROR_CODE_3] | [ERROR_DESC_3] |
| [ERROR_CODE_4] | [ERROR_DESC_4] |
| [ERROR_CODE_5] | [ERROR_DESC_5] |
| [ERROR_CODE_6] | [ERROR_DESC_6] |

## 6. レート制限

- [API_TYPE_1]: [RATE_LIMIT_1]
- [API_TYPE_2]: [RATE_LIMIT_2]
- [MONITORING_TYPE]: [MONITORING_LIMIT]

## 7. セキュリティ

- [SECURITY_MECHANISM_1]: [SECURITY_DESC_1]
- [SECURITY_MECHANISM_2]: [SECURITY_DESC_2]
- [SECURITY_MECHANISM_3]: [SECURITY_DESC_3]

## 8. バージョニング

現在のAPIバージョン: [API_VERSION]

互換性ポリシー:
- [VERSION_POLICY_1]: [VERSION_DESC_1]
- [VERSION_POLICY_2]: [VERSION_DESC_2]

## 9. 使用例

### 9.1 基本的な使用フロー

```bash
# 1. [STEP_1_DESC]
[EXAMPLE_COMMAND_1]

# 2. [STEP_2_DESC]
[EXAMPLE_COMMAND_2]

# 3. [STEP_3_DESC]
[EXAMPLE_COMMAND_3]
```

### 9.2 [USE_CASE_1] ([FEATURE_REF_1])

```bash
[USE_CASE_1_EXAMPLE]
```

### 9.3 [USE_CASE_2]

```bash
[USE_CASE_2_EXAMPLE]
```

## 10. SDK・ライブラリ

### 10.1 [LANGUAGE_1] SDK

```[LANGUAGE_1]
[SDK_EXAMPLE_1]
```

### 10.2 [LANGUAGE_2] SDK

```[LANGUAGE_2]
[SDK_EXAMPLE_2]
```

### 10.3 [LANGUAGE_3] SDK

```[LANGUAGE_3]
[SDK_EXAMPLE_3]
```

## 11. テスト・デバッグ

### 11.1 API テスト

```bash
# [TEST_TYPE_1]
[TEST_COMMAND_1]

# [TEST_TYPE_2]
[TEST_COMMAND_2]

# [TEST_TYPE_3]
[TEST_COMMAND_3]
```

### 11.2 デバッグモード

```[DEBUG_LANGUAGE]
[DEBUG_EXAMPLE]
```

## 12. パフォーマンス

### 12.1 レスポンス時間目標

| エンドポイント | 目標時間 | 測定条件 |
|---------------|----------|----------|
| [ENDPOINT_1] | < [TARGET_TIME_1] | [CONDITION_1] |
| [ENDPOINT_2] | < [TARGET_TIME_2] | [CONDITION_2] |
| [ENDPOINT_3] | < [TARGET_TIME_3] | [CONDITION_3] |

### 12.2 スループット目標

- [THROUGHPUT_METRIC_1]: [THROUGHPUT_TARGET_1]
- [THROUGHPUT_METRIC_2]: [THROUGHPUT_TARGET_2]
- [THROUGHPUT_METRIC_3]: [THROUGHPUT_TARGET_3]

## 13. 移行ガイド

### 13.1 旧バージョンからの移行

#### [OLD_VERSION] → [NEW_VERSION]

**変更点**:
- [BREAKING_CHANGE_1]
- [BREAKING_CHANGE_2]
- [BREAKING_CHANGE_3]

**移行手順**:
1. [MIGRATION_STEP_1]
2. [MIGRATION_STEP_2]
3. [MIGRATION_STEP_3]

### 13.2 非推奨API

| API | 非推奨バージョン | 削除予定 | 代替API |
|-----|-----------------|----------|---------|
| [DEPRECATED_API_1] | [DEPRECATED_VERSION_1] | [REMOVAL_VERSION_1] | [ALTERNATIVE_API_1] |
| [DEPRECATED_API_2] | [DEPRECATED_VERSION_2] | [REMOVAL_VERSION_2] | [ALTERNATIVE_API_2] |

## 14. トラブルシューティング

### 14.1 よくある問題

#### [PROBLEM_1]
**症状**: [SYMPTOM_1]
**原因**: [CAUSE_1]
**解決方法**: [SOLUTION_1]

#### [PROBLEM_2]
**症状**: [SYMPTOM_2]
**原因**: [CAUSE_2]
**解決方法**: [SOLUTION_2]

#### [PROBLEM_3]
**症状**: [SYMPTOM_3]
**原因**: [CAUSE_3]
**解決方法**: [SOLUTION_3]

### 14.2 ログ確認方法

```bash
[LOG_CHECK_COMMAND_1]
[LOG_CHECK_COMMAND_2]
[LOG_CHECK_COMMAND_3]
```

## 15. 変更履歴

| バージョン | 日付 | 変更内容 | 影響範囲 |
|-----------|------|----------|----------|
| [API_VERSION_1] | 2025-07-08 | 初版作成 | 高 |
| [API_VERSION_2] | 2025-07-08 | 要件詳細化 | 中 |
| [API_VERSION_3] | 2025-07-08 | セキュリティ要件追加 | 高 |

---

**注意**: `[VARIABLE_NAME]`の部分は、プロジェクト固有の内容に置き換えてください。