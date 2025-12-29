import type { ContentItem, Topic, Diagram, LegoPiece } from '../types/content';

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

// Lego Pieces (reusable C++ code snippets)
export const legoPieces: LegoPiece[] = [
  {
    id: 'lego-01',
    slug: 'uclass-generated-body',
    title: 'UCLASS() & GENERATED_BODY()',
    type: 'lego-piece',
    pieceType: 'Macros',
    tags: ['Macros', 'Component', 'Architecture'],
    summary: 'The reflection foundation - gateway to Unreal Engine\'s reflection system.',
    codeSnippet: `// MyActor.h
#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "MyActor.generated.h" // MUST be the last include

UCLASS(Blueprintable, BlueprintType, Category="Hattin|Core")
class MYPROJECT_API AMyActor : public AActor
{
    GENERATED_BODY()
public:
    AMyActor();
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category="Settings")
    float InteractionRange = 200.0f;
};`,
    explanation: 'UCLASS macro tells UHT to parse this class and generate reflection code. GENERATED_BODY() must be at the top of your class body.',
    diagram: `flowchart TD
    H[Header File .h] --> UHT[Unreal Header Tool]
    UHT --> GCH[generated.h File]
    UCLASS --> UHT
    GB[GENERATED_BODY] --> GCH
    UHT --> CDO[Class Default Object]`,
    relatedTopics: ['topic-01', 'topic-10'],
  },
  {
    id: 'lego-02',
    slug: 'uproperty-reflection',
    title: 'UPROPERTY() Reflection',
    type: 'lego-piece',
    pieceType: 'Macros',
    tags: ['Macros', 'Component'],
    summary: 'Connecting C++ to the Editor - expose variables and enable GC tracking.',
    codeSnippet: `// Combat variables exposed to Editor
UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Combat", meta = (ClampMin = "0.0"))
float BaseDamage = 25.0f;

// State variable visible but not editable
UPROPERTY(VisibleInstanceOnly, BlueprintReadOnly, Category = "State")
bool bIsStunned = false;

// Component reference (Must be UPROPERTY for GC safety)
UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
TObjectPtr<UStaticMeshComponent> WeaponMesh;`,
    explanation: 'UPROPERTY exposes variables to the Editor/Blueprints and notifies the Garbage Collector.',
    diagram: `graph TD
    Prop[C++ Variable] --> UProp[UPROPERTY]
    UProp --> Edit[EditAnywhere]
    UProp --> View[VisibleAnywhere]
    UProp --> BP[BlueprintReadWrite]
    UProp --> GC[Garbage Collector]`,
    relatedTopics: ['topic-01'],
  },
  {
    id: 'lego-03',
    slug: 'ufunction-blueprintcallable',
    title: 'UFUNCTION(BlueprintCallable)',
    type: 'lego-piece',
    pieceType: 'Macros',
    tags: ['Macros', 'GAS'],
    summary: 'Exposing logic to Blueprints - call C++ from Blueprint graphs.',
    codeSnippet: `// Standard callable function with execution pins
UFUNCTION(BlueprintCallable, Category = "Abilities")
void PerformMeleeAttack(float PowerMultiplier);

// Pure function (No execution pin, returns data)
UFUNCTION(BlueprintPure, Category = "Abilities")
float GetCurrentStamina() const;

// Console command function
UFUNCTION(Exec)
void Debug_KillAllEnemies();`,
    explanation: 'BlueprintCallable creates nodes with execution pins. BlueprintPure for getters without side effects.',
    diagram: `graph LR
    CPP[C++ Function] --> Reflect[UFUNCTION]
    Reflect --> BP[Blueprint Node]
    BP --> Callable[BlueprintCallable]
    BP --> Pure[BlueprintPure]`,
    relatedTopics: ['topic-02'],
  },
  {
    id: 'lego-04',
    slug: 'blueprint-native-event',
    title: 'BlueprintNativeEvent',
    type: 'lego-piece',
    pieceType: 'Macros',
    tags: ['Macros', 'Delegates'],
    summary: 'Hybrid event pattern - C++ default with Blueprint override capability.',
    codeSnippet: `// --- Header (.h) ---
UFUNCTION(BlueprintNativeEvent, Category = "Interaction")
void OnInteract(AActor* Interactor);

// --- Source (.cpp) ---
void AMyActor::OnInteract_Implementation(AActor* Interactor)
{
    if (Interactor)
    {
        UE_LOG(LogTemp, Log, TEXT("Interacted with: %s"), *Interactor->GetName());
    }
}`,
    explanation: 'Provides default C++ implementation while allowing designers to override or extend in Blueprints.',
    diagram: `graph TD
    Call[C++ Call] --> Native{Has BP Override?}
    Native -- Yes --> BP[Blueprint Event]
    Native -- No --> Impl[_Implementation]`,
    relatedTopics: ['topic-04'],
  },
  {
    id: 'lego-05',
    slug: 'timer-handle',
    title: 'FTimerHandle & Timers',
    type: 'lego-piece',
    pieceType: 'Lifecycle',
    tags: ['Timer', 'Lifecycle'],
    summary: 'Delayed execution and repeating timers for gameplay logic.',
    codeSnippet: `// Member variable to store timer handle
FTimerHandle CooldownTimerHandle;

// Set a one-shot timer (3 second delay)
GetWorldTimerManager().SetTimer(
    CooldownTimerHandle,
    this,
    &AMyActor::OnCooldownComplete,
    3.0f,  // Delay
    false  // Looping?
);

// Clear timer if needed
GetWorldTimerManager().ClearTimer(CooldownTimerHandle);`,
    explanation: 'Timers execute functions after a delay. Store FTimerHandle to cancel or check status.',
    diagram: `flowchart LR
    Set[SetTimer] --> Wait[Delay]
    Wait --> Execute[Callback]
    Clear[ClearTimer] -.-> Wait`,
    relatedTopics: ['topic-10'],
  },
  {
    id: 'lego-06',
    slug: 'delegate-binding',
    title: 'Delegate Binding Patterns',
    type: 'lego-piece',
    pieceType: 'Events',
    tags: ['Delegates', 'Component'],
    summary: 'Event subscription patterns - bind functions to delegates.',
    codeSnippet: `// Declare a delegate type
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnHealthChanged, float, NewHealth);

// Member delegate
UPROPERTY(BlueprintAssignable, Category = "Events")
FOnHealthChanged OnHealthChanged;

// Broadcast the event
OnHealthChanged.Broadcast(CurrentHealth);

// Binding to component events
BoxComponent->OnComponentBeginOverlap.AddDynamic(this, &AMyActor::OnOverlapBegin);`,
    explanation: 'Delegates enable decoupled communication. Use DYNAMIC for Blueprint compatibility.',
    diagram: `graph TD
    Delegate[Delegate] --> Bind[AddDynamic]
    Delegate --> Broadcast[Broadcast]
    Bind --> Handler[Callback Function]`,
    relatedTopics: ['topic-03', 'topic-04'],
  },
  {
    id: 'lego-07',
    slug: 'line-trace',
    title: 'Line Trace (Raycast)',
    type: 'lego-piece',
    pieceType: 'Physics',
    tags: ['Collision', 'Combat', 'Hit Detection'],
    summary: 'Raycast for hit detection, visibility checks, and targeting.',
    codeSnippet: `FHitResult HitResult;
FVector Start = GetActorLocation();
FVector End = Start + GetActorForwardVector() * TraceDistance;

FCollisionQueryParams Params;
Params.AddIgnoredActor(this);

bool bHit = GetWorld()->LineTraceSingleByChannel(
    HitResult,
    Start,
    End,
    ECC_Visibility,
    Params
);

if (bHit)
{
    AActor* HitActor = HitResult.GetActor();
}`,
    explanation: 'Line traces cast a ray and return the first hit. Use collision channels for filtering.',
    diagram: `flowchart LR
    Start[Start Point] --> Ray[Ray]
    Ray --> Hit{Hit?}
    Hit -- Yes --> Result[HitResult]
    Hit -- No --> Miss[No Hit]`,
    relatedTopics: ['topic-03'],
  },
  {
    id: 'lego-08',
    slug: 'sphere-overlap',
    title: 'Sphere Overlap Query',
    type: 'lego-piece',
    pieceType: 'Physics',
    tags: ['Collision', 'Combat'],
    summary: 'Find all actors within a radius for area effects and detection.',
    codeSnippet: `TArray<FOverlapResult> Overlaps;
FCollisionShape SphereShape = FCollisionShape::MakeSphere(500.0f);

bool bHasOverlaps = GetWorld()->OverlapMultiByChannel(
    Overlaps,
    GetActorLocation(),
    FQuat::Identity,
    ECC_Pawn,
    SphereShape
);

for (const FOverlapResult& Overlap : Overlaps)
{
    if (AActor* Actor = Overlap.GetActor())
    {
        // Process overlapping actor
    }
}`,
    explanation: 'Overlap queries find all actors in a shape. Useful for area damage, AI perception.',
    diagram: `flowchart TD
    Center[Center Point] --> Sphere[Sphere Shape]
    Sphere --> Query[Overlap Query]
    Query --> Results[Array of Actors]`,
    relatedTopics: ['topic-03', 'topic-06'],
  },
  {
    id: 'lego-09',
    slug: 'spawn-actor',
    title: 'Spawn Actor Pattern',
    type: 'lego-piece',
    pieceType: 'Lifecycle',
    tags: ['Lifecycle', 'Framework'],
    summary: 'Dynamically spawn actors at runtime with proper initialization.',
    codeSnippet: `// Spawn with transform
FActorSpawnParameters SpawnParams;
SpawnParams.Owner = this;
SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AdjustIfPossibleButAlwaysSpawn;

AProjectile* Projectile = GetWorld()->SpawnActor<AProjectile>(
    ProjectileClass,
    SpawnLocation,
    SpawnRotation,
    SpawnParams
);`,
    explanation: 'SpawnActor creates new actors at runtime. Use SpawnParams for ownership and collision handling.',
    diagram: `flowchart TD
    Class[Actor Class] --> Spawn[SpawnActor]
    Transform[Location/Rotation] --> Spawn
    Params[SpawnParams] --> Spawn
    Spawn --> Instance[New Actor]`,
    relatedTopics: ['topic-09', 'topic-10'],
  },
  {
    id: 'lego-10',
    slug: 'play-montage',
    title: 'Play Animation Montage',
    type: 'lego-piece',
    pieceType: 'Animation',
    tags: ['Animation', 'Montage', 'Combat'],
    summary: 'Trigger animation montages for attacks, abilities, and reactions.',
    codeSnippet: `// Get the animation instance
UAnimInstance* AnimInstance = GetMesh()->GetAnimInstance();
if (AnimInstance && AttackMontage)
{
    // Play montage and get duration
    float Duration = AnimInstance->Montage_Play(AttackMontage, PlayRate);
    
    // Optionally jump to a specific section
    AnimInstance->Montage_JumpToSection(FName("Combo2"), AttackMontage);
}`,
    explanation: 'Montages provide interruptible, section-based animations. Use for combat moves.',
    diagram: `flowchart LR
    Montage[Montage Asset] --> Play[Montage_Play]
    Play --> Sections[Sections]
    Sections --> Notifies[AnimNotifies]`,
    relatedTopics: ['topic-04'],
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
  ...legoPieces,
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
