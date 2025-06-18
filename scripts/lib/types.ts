export interface ProjectConfig {
  projectName: string;
  description: string;
  repositoryUrl: string;
  prompt: PromptType;
  techStack: TechStackConfig;
  team: TeamConfig;
  customizations: Record<string, string | number | boolean>;
}

export interface TeamConfig {
  size: number;
  type: 'individual' | 'small' | 'medium' | 'large';
  industry: string;
  complianceLevel: 'low' | 'medium' | 'high';
}

export interface TechStackConfig {
  frontend: string;
  backend: string;
  database: string;
  infrastructure: string;
  deployment: string;
  monitoring: string;
}

export type PromptType =
  | 'basic-development'
  | 'enterprise-development'
  | 'opensource-development'
  | 'startup-development';

export interface SetupOptions {
  dryRun: boolean;
  skipPromptSelection: boolean;
  prompt?: PromptType;
  verbose: boolean;
}

export interface FileTemplate {
  path: string;
  content: string;
  placeholders: string[];
}

export interface TemplateMapping {
  [key: string]: string | number | boolean;
}
