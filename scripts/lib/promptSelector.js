import inquirer from 'inquirer';
export class PromptSelector {
    static async selectPrompt() {
        console.log('\n🎯 プロンプト選択 - プロジェクトに合った開発アプローチを選んでください\n');
        const teamQuestions = [
            {
                type: 'number',
                name: 'teamSize',
                message: 'このプロジェクトで作業する開発者の人数は？',
                default: 1,
                validate: (input) => input > 0 || 'チーム人数は1人以上を指定してください',
            },
            {
                type: 'list',
                name: 'industry',
                message: 'このプロジェクトの業界・ドメインは？',
                choices: [
                    { name: 'テクノロジー/ソフトウェア', value: 'technology' },
                    { name: '金融/銀行', value: 'finance' },
                    { name: '医療/ヘルスケア', value: 'healthcare' },
                    { name: '教育', value: 'education' },
                    { name: 'EC/小売', value: 'ecommerce' },
                    { name: '行政/公共', value: 'government' },
                    { name: 'エンタメ/メディア', value: 'entertainment' },
                    { name: 'その他', value: 'other' },
                ],
            },
            {
                type: 'list',
                name: 'projectType',
                message: 'プロジェクトのタイプは？',
                choices: [
                    { name: '個人/学習プロジェクト', value: 'personal' },
                    { name: 'オープンソースプロジェクト', value: 'opensource' },
                    { name: 'スタートアップ/MVP', value: 'startup' },
                    { name: 'エンタープライズアプリケーション', value: 'enterprise' },
                    { name: 'クライアント案件', value: 'client' },
                ],
            },
            {
                type: 'list',
                name: 'complianceLevel',
                message: '必要なコンプライアンス・ガバナンスレベルは？',
                choices: [
                    { name: '低 - 最小限のドキュメント、素早い反復', value: 'low' },
                    { name: '中 - 標準的な運用、適度なドキュメント', value: 'medium' },
                    { name: '高 - 厳格なコンプライアンス、包括的なドキュメント', value: 'high' },
                ],
            },
        ];
        const answers = await inquirer.prompt(teamQuestions);
        const team = {
            size: answers.teamSize,
            type: this.getTeamType(answers.teamSize),
            industry: answers.industry,
            complianceLevel: answers.complianceLevel,
        };
        const recommendedPrompt = this.recommendPrompt(team, answers.projectType);
        console.log(`\n💡 推奨プロンプト: ${recommendedPrompt}`);
        console.log(this.getPromptDescription(recommendedPrompt));
        const confirmPrompt = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'useRecommended',
                message: '推奨プロンプトを使用しますか？',
                default: true,
            },
        ]);
        let selectedPrompt = recommendedPrompt;
        if (!confirmPrompt.useRecommended) {
            const manualSelection = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'prompt',
                    message: '他のプロンプトを選択する場合は選んでください:',
                    choices: [
                        {
                            name: '基本開発 - 小規模チーム・シンプルなワークフロー',
                            value: 'basic-development',
                        },
                        {
                            name: 'エンタープライズ開発 - 大規模チーム・コンプライアンス重視',
                            value: 'enterprise-development',
                        },
                        {
                            name: 'オープンソース開発 - コミュニティ主導プロジェクト',
                            value: 'opensource-development',
                        },
                        {
                            name: 'スタートアップ開発 - 高速反復・MVP重視',
                            value: 'startup-development',
                        },
                    ],
                },
            ]);
            selectedPrompt = manualSelection.prompt;
        }
        return { prompt: selectedPrompt, team };
    }
    static getTeamType(size) {
        if (size === 1)
            return 'individual';
        if (size <= 3)
            return 'small';
        if (size <= 10)
            return 'medium';
        return 'large';
    }
    static recommendPrompt(team, projectType) {
        // Enterprise prompt for high compliance or large teams
        if (team.complianceLevel === 'high' || team.size > 10) {
            return 'enterprise-development';
        }
        // Open source prompt for open source projects
        if (projectType === 'opensource') {
            return 'opensource-development';
        }
        // Startup prompt for MVP/startup projects
        if (projectType === 'startup' || projectType === 'personal') {
            return 'startup-development';
        }
        // Default to basic for most other cases
        return 'basic-development';
    }
    static getPromptDescription(prompt) {
        const descriptions = {
            'basic-development': '  → 小規模チーム（1-3名）・シンプルなワークフロー向け',
            'enterprise-development': '  → 大規模チーム・コンプライアンス要件・複雑なガバナンス向け',
            'opensource-development': '  → コミュニティ主導・コントリビューター管理重視',
            'startup-development': '  → 高速反復・MVP開発・短期間での市場投入向け',
        };
        return descriptions[prompt];
    }
}
//# sourceMappingURL=promptSelector.js.map