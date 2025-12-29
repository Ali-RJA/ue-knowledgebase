import type { ContentItem, Topic, Diagram } from '../types/content';

// Topic content items from markdown files
export const topics: Topic[] = [
  {
    id: 'topic-01',
    slug: 'player-character-architecture',
    title: 'Player Character Architecture',
    type: 'topic',
    category: 'architecture',
    tags: ['Character', 'Component', 'GAS', 'Architecture'],
    summary: 'The foundation class that represents the player in the game world — handling physical presence, component composition, and integration with all gameplay systems.',
    content: '', // Will be loaded from file
    sourcePath: '01-player-character-architecture.md',
    relatedItems: ['topic-02', 'topic-10', 'diagram-01'],
  },
  {
    id: 'topic-02',
    slug: 'gameplay-ability-system',
    title: 'Gameplay Ability System',
    type: 'topic',
    category: 'core-systems',
    tags: ['GAS', 'Ability', 'Combat', 'ASC'],
    summary: 'Combat abilities, damage pipeline, and attribute management using Unreal Engine\'s Gameplay Ability System.',
    content: '',
    sourcePath: '02-gameplay-ability-system.md',
    relatedItems: ['topic-01', 'topic-03', 'diagram-02', 'diagram-03'],
  },
  {
    id: 'topic-03',
    slug: 'combat-collision-hit-detection',
    title: 'Combat Collision & Hit Detection',
    type: 'topic',
    category: 'core-systems',
    tags: ['Combat', 'Collision', 'Hit Detection', 'Parry'],
    summary: 'Socket-based weapon tracing, frame interpolation, and parry detection for melee combat.',
    content: '',
    sourcePath: '03-combat-collision-hit-detection.md',
    relatedItems: ['topic-02', 'topic-04', 'collection-01'],
  },
  {
    id: 'topic-04',
    slug: 'animation-blueprint-montage-system',
    title: 'Animation Blueprint & Montage System',
    type: 'topic',
    category: 'core-systems',
    tags: ['Animation', 'Montage', 'State Machine', 'Combat'],
    summary: 'State machines, montage slots, and AnimNotifies for combat animation control.',
    content: '',
    sourcePath: '04-animation-blueprint-montage-system.md',
    relatedItems: ['topic-03', 'diagram-04', 'collection-01'],
  },
  {
    id: 'topic-05',
    slug: 'enhanced-input-buffering',
    title: 'Enhanced Input & Buffering',
    type: 'topic',
    category: 'control',
    tags: ['Input', 'Combat', 'Component'],
    summary: 'Context-based input and combat input buffering system for responsive controls.',
    content: '',
    sourcePath: '05-enhanced-input-buffering.md',
    relatedItems: ['topic-01', 'topic-02'],
  },
  {
    id: 'topic-06',
    slug: 'ai-behavior-tree-perception',
    title: 'AI Behavior Tree & Perception',
    type: 'topic',
    category: 'control',
    tags: ['AI', 'Combat', 'Data-Driven'],
    summary: 'Enemy decision-making and player detection systems.',
    content: '',
    sourcePath: '06-ai-behavior-tree-perception.md',
    relatedItems: ['topic-08'],
  },
  {
    id: 'topic-07',
    slug: 'camera-system',
    title: 'Camera System',
    type: 'topic',
    category: 'control',
    tags: ['Camera', 'Combat'],
    summary: 'Lock-on targeting, combat framing, and camera effects.',
    content: '',
    sourcePath: '07-camera-system.md',
    relatedItems: ['topic-01'],
  },
  {
    id: 'topic-08',
    slug: 'data-driven-design',
    title: 'Data-Driven Design',
    type: 'topic',
    category: 'design',
    tags: ['Data-Driven', 'Data', 'Architecture'],
    summary: 'Asset-based configuration and soft references for scalable game systems.',
    content: '',
    sourcePath: '08-data-driven-design.md',
    relatedItems: ['topic-02', 'diagram-13'],
  },
  {
    id: 'topic-09',
    slug: 'game-framework',
    title: 'Game Framework',
    type: 'topic',
    category: 'architecture',
    tags: ['Framework', 'Architecture'],
    summary: 'Match flow, spawning, and persistent state management.',
    content: '',
    sourcePath: '09-game-framework.md',
    relatedItems: ['topic-01', 'topic-10'],
  },
  {
    id: 'topic-10',
    slug: 'actor-lifecycle-component-pattern',
    title: 'Actor Lifecycle & Component Pattern',
    type: 'topic',
    category: 'architecture',
    tags: ['Lifecycle', 'Component', 'Architecture'],
    summary: 'Initialization order and component patterns for robust actor design.',
    content: '',
    sourcePath: '10-actor-lifecycle-component-pattern.md',
    relatedItems: ['topic-01', 'topic-09'],
  },
];

// Diagram content items from mermaid files
export const diagrams: Diagram[] = [
  {
    id: 'diagram-01',
    slug: 'gameplay-ability-system-flowchart',
    title: 'Gameplay Ability System Flowchart',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Data-Driven', 'Animation'],
    summary: 'Visual representation of the Gameplay Ability System architecture and data flow.',
    mermaidSource: '',
    sourcePath: 'GameplayAbilitySystemFlowchart.mermaid',
    relatedTopics: ['topic-02', 'topic-08'],
  },
  {
    id: 'diagram-02',
    slug: 'gameplay-ability-flowchart',
    title: 'Gameplay Ability Flowchart',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Ability'],
    summary: 'Detailed flow of gameplay ability activation and execution.',
    mermaidSource: '',
    sourcePath: 'GameplayAbilityFlowchart.mermaid',
    relatedTopics: ['topic-02'],
  },
  {
    id: 'diagram-03',
    slug: 'gameplay-ability-flowchart-2',
    title: 'Gameplay Ability Flowchart 2',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Ability'],
    summary: 'Alternative visualization of gameplay ability flow.',
    mermaidSource: '',
    sourcePath: 'GameplayAbilityFlowchart2.mermaid',
    relatedTopics: ['topic-02'],
  },
  {
    id: 'diagram-04',
    slug: 'animation-system-flowchart',
    title: 'Animation System Flowchart',
    type: 'diagram',
    category: 'core-systems',
    tags: ['Animation', 'Montage', 'State Machine'],
    summary: 'Animation blueprint and montage system architecture.',
    mermaidSource: '',
    sourcePath: 'AnimationSystemFlowchart.mermaid',
    relatedTopics: ['topic-04'],
  },
  {
    id: 'diagram-05',
    slug: 'ability-activation-flowchart',
    title: 'Ability Activation Flowchart',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Ability', 'Animation'],
    summary: 'Flowchart showing ability activation sequence.',
    mermaidSource: '',
    sourcePath: 'AbilityActivationFlowchart.mermaid',
    relatedTopics: ['topic-02', 'topic-04'],
  },
  {
    id: 'diagram-06',
    slug: 'ability-activation-animation-sequence',
    title: 'Ability Activation Animation Sequence',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Animation', 'Combat'],
    summary: 'Sequence diagram of ability activation with animations.',
    mermaidSource: '',
    sourcePath: 'AbilityActivationAnimationSequence.mermaid',
    relatedTopics: ['topic-02', 'topic-04'],
  },
  {
    id: 'diagram-07',
    slug: 'gameplay-effect-flowchart',
    title: 'Gameplay Effect Flowchart',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Combat'],
    summary: 'Gameplay effect application and calculation flow.',
    mermaidSource: '',
    sourcePath: 'GameplayEffectFlowchart.mermaid',
    relatedTopics: ['topic-02'],
  },
  {
    id: 'diagram-08',
    slug: 'gameplay-effect-flowchart-2',
    title: 'Gameplay Effect Flowchart 2',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Combat'],
    summary: 'Alternative gameplay effect flow visualization.',
    mermaidSource: '',
    sourcePath: 'GameplayEffectFlowchart2.mermaid',
    relatedTopics: ['topic-02'],
  },
  {
    id: 'diagram-09',
    slug: 'gameplay-effect-application-flowchart',
    title: 'Gameplay Effect Application Flowchart',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Combat'],
    summary: 'Detailed gameplay effect application process.',
    mermaidSource: '',
    sourcePath: 'GameplayEffectApplicationFlowchart.mermaid',
    relatedTopics: ['topic-02'],
  },
  {
    id: 'diagram-10',
    slug: 'gameplay-effect-application-flowchart-2',
    title: 'Gameplay Effect Application Flowchart 2',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Combat'],
    summary: 'Alternative gameplay effect application flow.',
    mermaidSource: '',
    sourcePath: 'GameplayEffectApplicationFlowchart2.mermaid',
    relatedTopics: ['topic-02'],
  },
  {
    id: 'diagram-11',
    slug: 'gameplay-effect-application-flowchart-3',
    title: 'Gameplay Effect Application Flowchart 3',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Combat'],
    summary: 'Third variation of gameplay effect application flow.',
    mermaidSource: '',
    sourcePath: 'GameplayEffectApplicationFlowchart3.mermaid',
    relatedTopics: ['topic-02'],
  },
  {
    id: 'diagram-12',
    slug: 'gameplay-effect-flowchart-diagram',
    title: 'Gameplay Effect Flowchart Diagram',
    type: 'diagram',
    category: 'core-systems',
    tags: ['GAS', 'Combat'],
    summary: 'Comprehensive gameplay effect diagram.',
    mermaidSource: '',
    sourcePath: 'GameplayEffectFlowchartDiagram.mermaid',
    relatedTopics: ['topic-02'],
  },
  {
    id: 'diagram-13',
    slug: 'weapon-data-asset-flowchart',
    title: 'Weapon Data Asset Flowchart',
    type: 'diagram',
    category: 'design',
    tags: ['Data-Driven', 'Combat', 'Data'],
    summary: 'Data-driven weapon configuration flow.',
    mermaidSource: '',
    sourcePath: 'WeaponDataAssetFlowchart.mermaid',
    relatedTopics: ['topic-08'],
  },
];

// Collections (HTML pages)
export const collections: ContentItem[] = [
  {
    id: 'collection-01',
    slug: 'anim-notify-architecture',
    title: 'AnimNotify Combat Architecture',
    type: 'collection',
    tags: ['Animation', 'Combat', 'Hit Detection', 'Architecture'],
    summary: 'Comprehensive AnimNotify architecture with diagrams and detailed explanations.',
    htmlContent: '',
    sourcePath: 'AnimNotify-FullArchitecture/ue5_combat_architecture_v2.html',
    relatedItems: ['topic-03', 'topic-04'],
  },
  {
    id: 'collection-02',
    slug: 'cpp-lego-pieces',
    title: 'C++ Common Pieces: The Lego Library',
    type: 'collection',
    tags: ['Component', 'Timer', 'Delegates', 'TMap', 'TArray', 'Interfaces'],
    summary: 'Reusable C++ code snippets and patterns for Unreal Engine development.',
    htmlContent: '',
    sourcePath: 'cpp-common-ue-pieces.html',
    relatedItems: [],
  },
];

// Master index combining all content
export const allContent: ContentItem[] = [
  ...topics,
  ...diagrams,
  ...collections,
];

// Utility functions
export const getContentById = (id: string): ContentItem | undefined => {
  return allContent.find(item => item.id === id);
};

export const getContentBySlug = (slug: string): ContentItem | undefined => {
  return allContent.find(item => item.slug === slug);
};

export const getContentByType = (type: string): ContentItem[] => {
  return allContent.filter(item => item.type === type);
};

export const getContentByTag = (tag: string): ContentItem[] => {
  return allContent.filter(item => item.tags.includes(tag));
};

export const getContentByCategory = (category: string): ContentItem[] => {
  return allContent.filter(item =>
    'category' in item && item.category === category
  );
};

export const getRelatedContent = (item: ContentItem, limit: number = 5): ContentItem[] => {
  // First, get explicitly related items
  const explicitRelated = item.relatedItems
    ?.map(id => getContentById(id))
    .filter(Boolean) as ContentItem[] || [];

  // Then, find items with shared tags
  const tagRelated = allContent
    .filter(content =>
      content.id !== item.id &&
      !item.relatedItems?.includes(content.id) &&
      content.tags.some(tag => item.tags.includes(tag))
    )
    .sort((a, b) => {
      // Sort by number of shared tags
      const aShared = a.tags.filter(tag => item.tags.includes(tag)).length;
      const bShared = b.tags.filter(tag => item.tags.includes(tag)).length;
      return bShared - aShared;
    });

  return [...explicitRelated, ...tagRelated].slice(0, limit);
};
