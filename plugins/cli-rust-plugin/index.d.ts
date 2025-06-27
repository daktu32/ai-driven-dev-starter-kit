/**
 * CLI Rust プラグイン
 *
 * Rust を使用した CLI ツールプロジェクトのテンプレートを提供するプラグイン
 */
import { Plugin, PluginMetadata, ProjectTemplate, ScaffoldOptions, ScaffoldResult, PluginContext } from '../../src/plugin/types.js';
/**
 * CLI Rust プラグイン実装
 */
declare class CliRustPlugin implements Plugin {
    readonly metadata: PluginMetadata;
    private context;
    private templatePath;
    initialize(context: PluginContext): Promise<void>;
    cleanup(): Promise<void>;
    getProjectTemplates(): ProjectTemplate[];
    generateScaffold(template: ProjectTemplate, options: ScaffoldOptions, context: PluginContext): Promise<ScaffoldResult>;
    private prepareTemplateVariables;
    private collectGeneratedFiles;
    private applyProjectSpecificConfig;
    private generateCargoToml;
    private generateConfigFiles;
    private generateGithubActions;
    private prepareNextSteps;
    healthCheck(context: PluginContext): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, any>;
    }>;
}
declare const _default: CliRustPlugin;
export default _default;
//# sourceMappingURL=index.d.ts.map