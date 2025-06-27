import { PromptType, TeamConfig } from './types.js';
export declare class PromptSelector {
    static selectPrompt(): Promise<{
        prompt: PromptType;
        team: TeamConfig;
    }>;
    private static getTeamType;
    private static recommendPrompt;
    private static getPromptDescription;
}
//# sourceMappingURL=promptSelector.d.ts.map