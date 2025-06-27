/**
 * MCP Server プラグイン
 *
 * Model Context Protocol (MCP) サーバープロジェクトのテンプレートを提供するプラグイン
 */
import { Plugin, PluginMetadata, ProjectTemplate, ScaffoldOptions, ScaffoldResult, PluginContext, ConfigOption } from '../../src/plugin/types.js';
/**
 * MCP Server プラグイン実装
 */
declare class McpServerPlugin implements Plugin {
    readonly metadata: PluginMetadata;
    private context;
    private templatePath;
    initialize(context: PluginContext): Promise<void>;
    cleanup(): Promise<void>;
    getProjectTemplates(): ProjectTemplate[];
    generateScaffold(template: ProjectTemplate, options: ScaffoldOptions, context: PluginContext): Promise<ScaffoldResult>;
    /**
     * テンプレート変数の準備
     */
    private prepareTemplateVariables;
    /**
     * 生成されたファイルの収集
     */
    private collectGeneratedFiles;
    /**
     * プロジェクト固有の設定適用
     */
    private applyProjectSpecificConfig;
    /**
     * 次のステップ情報の準備
     */
    private prepareNextSteps;
    getConfigSchema(): ConfigOption[];
    healthCheck(context: PluginContext): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, any>;
    }>;
}
declare const _default: McpServerPlugin;
export default _default;
//# sourceMappingURL=index.d.ts.map