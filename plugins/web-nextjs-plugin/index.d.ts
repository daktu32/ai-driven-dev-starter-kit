/**
 * Web Next.js プラグイン
 *
 * Next.js Webアプリケーションプロジェクトのテンプレートを提供するプラグイン
 */
import { Plugin, PluginMetadata, ProjectTemplate, ScaffoldOptions, ScaffoldResult, PluginContext } from '../../src/plugin/types.js';
/**
 * Web Next.js プラグイン実装
 */
declare class WebNextjsPlugin implements Plugin {
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
    private generateConfigFiles;
    private prepareNextSteps;
    healthCheck(context: PluginContext): Promise<{
        healthy: boolean;
        message?: string;
        details?: Record<string, any>;
    }>;
}
declare const _default: WebNextjsPlugin;
export default _default;
//# sourceMappingURL=index.d.ts.map