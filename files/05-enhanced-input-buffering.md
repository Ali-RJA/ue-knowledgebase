# Enhanced Input & Input Buffering Architecture
> The modern input system that translates player actions into game commands —
> with buffering that makes combat feel responsive even when timing isn't perfect.

---

## 1. System Overview

The Enhanced Input system solves the problem of mapping physical inputs (keys, buttons, sticks) to gameplay actions in a flexible, context-aware manner. Unlike the legacy input system, Enhanced Input uses asset-based Input Actions and Mapping Contexts that can be swapped at runtime.

Input buffering solves a critical combat responsiveness problem: players often input commands slightly before they become valid (attacking during recovery, dodging during hitstun). Without buffering, these inputs are lost. With buffering, inputs are queued and executed at the first valid opportunity.

For Hattin specifically, the input system must: support context switching (exploration vs combat vs UI), buffer attack and dodge inputs during recovery frames, and integrate with GAS for ability activation. The buffer window is typically 100-200ms, enough to feel responsive without causing unintended actions.

---

## 2. Core Architecture Diagram

### 2.1 Enhanced Input Flow

```mermaid
flowchart TD
    subgraph "Hardware Layer"
        Keyboard["Keyboard"]
        Gamepad["Gamepad"]
        Mouse["Mouse"]
    end
    
    subgraph "Enhanced Input System"
        IMC["Input Mapping Context<br/>(IMC_Combat)"]
        IA["Input Actions<br/>(IA_Attack, IA_Dodge, etc.)"]
        Modifiers["Input Modifiers<br/>(DeadZone, Negate, Scale)"]
        Triggers["Input Triggers<br/>(Pressed, Released, Hold)"]
    end
    
    subgraph "Game Layer"
        EIC["Enhanced Input Component"]
        Buffer["Input Buffer Component"]
        GAS["Ability System"]
    end
    
    Keyboard --> IMC
    Gamepad --> IMC
    Mouse --> IMC
    
    IMC -->|"maps to"| IA
    IA --> Modifiers --> Triggers
    Triggers -->|"fires"| EIC
    EIC -->|"action allowed?"| Buffer
    Buffer -->|"TryActivate"| GAS
    
    style IMC fill:#22543d,stroke:#276749,color:#fff
    style IA fill:#44337a,stroke:#553c9a,color:#fff
    style Buffer fill:#b7791f,stroke:#d69e2e,color:#000
    style GAS fill:#0d4f4f,stroke:#0f5e5e,color:#fff
```

### 2.2 Input Mapping Context Hierarchy

```mermaid
flowchart TD
    subgraph "Context Priority (Higher = First)"
        UI["IMC_UI<br/>Priority: 100<br/>(Blocks all below)"]
        Combat["IMC_Combat<br/>Priority: 50<br/>(Combat actions)"]
        Exploration["IMC_Exploration<br/>Priority: 25<br/>(Default movement)"]
    end
    
    subgraph "Context Switching"
        OpenMenu["Open Menu"] -->|"Add IMC_UI"| UI
        CloseMenu["Close Menu"] -->|"Remove IMC_UI"| Combat
        EnterCombat["Enter Combat"] -->|"Add IMC_Combat"| Combat
        ExitCombat["Exit Combat"] -->|"Remove IMC_Combat"| Exploration
    end
    
    style UI fill:#742a2a,stroke:#9b2c2c,color:#fff
    style Combat fill:#22543d,stroke:#276749,color:#fff
    style Exploration fill:#44337a,stroke:#553c9a,color:#fff
```

### 2.3 Input Buffer Flow

```mermaid
sequenceDiagram
    participant Player as Player Input
    participant EIC as Enhanced Input
    participant Buffer as InputBufferComponent
    participant Combat as CombatComponent
    participant GAS as AbilitySystem
    
    Note over Player,GAS: Player attacks during recovery
    Player->>EIC: Press Attack
    EIC->>Buffer: OnAttackInput()
    Buffer->>Combat: CanAttack()?
    Combat-->>Buffer: false (in recovery)
    Buffer->>Buffer: BufferInput(Attack, 0.15s)
    
    Note over Player,GAS: Recovery ends, buffer checked
    Combat->>Buffer: OnRecoveryEnd()
    Buffer->>Buffer: HasBufferedInput()?
    Buffer-->>Buffer: Yes (Attack)
    Buffer->>GAS: TryActivateAbility(Attack)
    GAS-->>Buffer: Ability Activated
    Buffer->>Buffer: ClearBuffer()
```

---

## 3. Component Specifications

### 3.1 Input Action Assets

| Action | Value Type | Trigger | Modifiers |
|--------|-----------|---------|-----------|
| IA_Attack | Bool | Pressed | None |
| IA_HeavyAttack | Bool | Hold (0.3s) | None |
| IA_Dodge | Bool | Pressed | None |
| IA_Parry | Bool | Pressed | None |
| IA_LockOn | Bool | Pressed | None |
| IA_Move | Axis2D | Down | DeadZone(0.2) |
| IA_Look | Axis2D | Down | DeadZone(0.1), Scale |

### 3.2 UHattinInputBufferComponent

**UE Base**: `UActorComponent` | **Your Class**: `UHattinInputBufferComponent`

```cpp
UCLASS(ClassGroup=(Hattin), meta=(BlueprintSpawnableComponent))
class HATTIN_API UHattinInputBufferComponent : public UActorComponent
{
    GENERATED_BODY()
    
public:
    UHattinInputBufferComponent();
    
    UFUNCTION(BlueprintCallable, Category = "Input Buffer")
    void BufferInput(EHattinInputType InputType);
    
    UFUNCTION(BlueprintCallable, Category = "Input Buffer")
    bool HasBufferedInput(EHattinInputType InputType) const;
    
    UFUNCTION(BlueprintCallable, Category = "Input Buffer")
    bool ConsumeBufferedInput(EHattinInputType InputType);
    
    UFUNCTION(BlueprintCallable, Category = "Input Buffer")
    void ClearBuffer();
    
    UFUNCTION(BlueprintCallable, Category = "Input Buffer")
    void OnActionWindowOpen();
    
protected:
    UPROPERTY(EditDefaultsOnly, Category = "Input Buffer")
    float BufferDuration = 0.15f;
    
    UPROPERTY()
    EHattinInputType BufferedInput;
    
    UPROPERTY()
    float BufferExpirationTime;
    
    UPROPERTY()
    bool bHasBufferedInput;
    
    virtual void TickComponent(float DeltaTime, ELevelTick TickType,
        FActorComponentTickFunction* ThisTickFunction) override;
    
private:
    void ExecuteBufferedInput();
    
    UPROPERTY()
    TWeakObjectPtr<AHattinCharacterBase> OwnerCharacter;
};
```

### 3.3 Player Controller Input Setup

```cpp
void AHattinPlayerController::SetupInputComponent()
{
    Super::SetupInputComponent();
    
    UEnhancedInputLocalPlayerSubsystem* Subsystem = 
        ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(GetLocalPlayer());
    
    if (Subsystem)
    {
        Subsystem->ClearAllMappings();
        Subsystem->AddMappingContext(CombatMappingContext, 50);
    }
    
    UEnhancedInputComponent* EIC = Cast<UEnhancedInputComponent>(InputComponent);
    if (EIC)
    {
        EIC->BindAction(IA_Attack, ETriggerEvent::Triggered, this, &ThisClass::OnAttackInput);
        EIC->BindAction(IA_Dodge, ETriggerEvent::Triggered, this, &ThisClass::OnDodgeInput);
        EIC->BindAction(IA_Move, ETriggerEvent::Triggered, this, &ThisClass::OnMoveInput);
        EIC->BindAction(IA_Look, ETriggerEvent::Triggered, this, &ThisClass::OnLookInput);
    }
}

void AHattinPlayerController::OnAttackInput(const FInputActionValue& Value)
{
    if (AHattinPlayerCharacter* Character = GetPawn<AHattinPlayerCharacter>())
    {
        UHattinCombatComponent* Combat = Character->GetCombatComponent();
        UHattinInputBufferComponent* Buffer = Character->GetInputBufferComponent();
        
        if (Combat && Combat->CanStartAttack())
        {
            if (UAbilitySystemComponent* ASC = Character->GetAbilitySystemComponent())
            {
                ASC->TryActivateAbilityByClass(UGA_LightAttack::StaticClass());
            }
        }
        else if (Buffer)
        {
            Buffer->BufferInput(EHattinInputType::Attack);
        }
    }
}
```

---

## 4. External Interfaces

### Inputs From Other Systems

| Source System | What It Provides | Interface Point |
|--------------|------------------|-----------------|
| Hardware | Raw input events | Enhanced Input Subsystem |
| UI System | Context switching | Add/Remove Mapping Context |
| Combat Component | Can-attack state | Buffer decision logic |
| Animation System | Recovery end notification | `OnActionWindowOpen()` |

### Outputs To Other Systems

| Target System | What This Provides | Interface Point |
|--------------|---------------------|-----------------|
| GAS | Ability activation requests | `TryActivateAbilityByClass` |
| Character Movement | Move/Look vectors | Direct CMC input |
| Camera System | Look input | Controller rotation |

---

## 5. Data Flow Diagram

```mermaid
flowchart LR
    subgraph Input["Input Hardware"]
        Keys["Keyboard/Mouse"]
        Pad["Gamepad"]
    end
    
    subgraph Enhanced["Enhanced Input"]
        IMC["Mapping Context"]
        Actions["Input Actions"]
    end
    
    subgraph Buffer["Buffer System"]
        Check["Can Execute?"]
        Queue["Input Queue"]
    end
    
    subgraph Game["Game Systems"]
        GAS["Abilities"]
        Movement["Movement"]
    end
    
    Keys --> IMC --> Actions
    Pad --> IMC
    Actions --> Check
    Check -->|"Yes"| GAS
    Check -->|"No"| Queue
    Queue -->|"Window Opens"| GAS
    Actions --> Movement
    
    style IMC fill:#22543d,stroke:#276749,color:#fff
    style Actions fill:#44337a,stroke:#553c9a,color:#fff
    style Queue fill:#b7791f,stroke:#d69e2e,color:#000
```

---

## 6. Implementation Patterns

### Pattern: Context-Based Input Switching

**Problem**: Different game states need different input mappings

**Solution**: Add/remove Input Mapping Contexts at runtime

```cpp
void AHattinPlayerController::OpenPauseMenu()
{
    if (UEnhancedInputLocalPlayerSubsystem* Subsystem = GetEnhancedInputSubsystem())
    {
        Subsystem->AddMappingContext(UIMappingContext, 100); // Blocks all below
    }
}
```

### Pattern: Buffered Input with Priority

**Problem**: Multiple inputs buffered, which executes first?

**Solution**: Priority system where dodge > parry > attack

```cpp
int32 UHattinInputBufferComponent::GetInputPriority(EHattinInputType InputType) const
{
    switch (InputType)
    {
        case EHattinInputType::Dodge:       return 100; // Highest
        case EHattinInputType::Parry:       return 80;
        case EHattinInputType::HeavyAttack: return 60;
        case EHattinInputType::Attack:      return 40;  // Lowest
        default: return 0;
    }
}
```

### Pattern: Hold vs Tap Detection

**Problem**: Same button for light and heavy attack

**Solution**: Use Hold trigger with threshold (0.3s)

### Anti-Patterns to Avoid

| Anti-Pattern | Problem | Solution |
|-------------|---------|----------|
| **Legacy input system** | Deprecated | Use Enhanced Input |
| **Input logic in Character** | Tight coupling | Handle in Controller |
| **Infinite buffer duration** | Stale inputs | Always expire (150ms) |
| **Buffering all inputs** | Movement buffers | Only buffer combat |

---

## 7. Quick Reference Card

| Concept | UE5 Class | Hattin Asset/Class | Location |
|---------|-----------|-------------------|----------|
| Attack Action | `UInputAction` | `IA_Attack` | `/Content/Hattin/Input/Actions/` |
| Move Action | `UInputAction` | `IA_Move` | `/Content/Hattin/Input/Actions/` |
| Combat Context | `UInputMappingContext` | `IMC_Combat` | `/Content/Hattin/Input/Contexts/` |
| Input Buffer | `UActorComponent` | `UHattinInputBufferComponent` | `/Source/Hattin/Input/` |

**Buffer Settings:** Duration 150ms, Dodge priority 100, Attack priority 40

---

## 8. Connections Map (Compact)

```mermaid
flowchart TD
    subgraph INPUT_SYSTEM["Enhanced Input & Buffer"]
        IMC["Mapping Contexts"]
        Actions["Input Actions"]
        Buffer["Input Buffer"]
    end
    
    HARDWARE[Hardware Input] -.->|"raw"| IMC
    IMC -.->|"maps"| Actions
    Actions -.->|"triggers"| CONTROLLER[Player Controller]
    CONTROLLER -.->|"can execute?"| Buffer
    Buffer -.->|"activate"| GAS[Gameplay Ability System]
    ANIM[Animation System] -.->|"window open"| Buffer
    
    style INPUT_SYSTEM fill:#22543d,stroke:#276749
    style HARDWARE fill:#2d3748,stroke:#4a5568,color:#a0aec0
    style CONTROLLER fill:#2d3748,stroke:#4a5568,color:#a0aec0
    style GAS fill:#2d3748,stroke:#4a5568,color:#a0aec0
    style ANIM fill:#2d3748,stroke:#4a5568,color:#a0aec0
```

---

## Summary

The Enhanced Input & Input Buffering architecture establishes:

1. **Input Actions**: Asset-based actions with typed values and triggers
2. **Mapping Contexts**: Priority-based contexts swapped at runtime
3. **Input Buffer**: Queues inputs during invalid windows (150ms default)
4. **GAS Integration**: Buffered inputs activate abilities
5. **Context Switching**: UI blocks combat, combat blocks exploration

This ensures combat feels responsive even when players input commands slightly early.
