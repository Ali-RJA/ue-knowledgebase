# Puzzle Tags Implementation Plan

## Overview
Add small, non-distracting puzzle piece tags to C++ code blocks in topics. Tags are clickable and navigate to lego piece documentation.

## Syntax
```markdown
```cpp[lego-slug1,lego-slug2|Display Label]
code here
```
```

## Guidelines for Adding Tags
1. **Only add when DIRECTLY relevant** - The code must explicitly use the pattern
2. **Be surgical** - Don't add tags for commonly used patterns
3. **Prioritize high-impact patterns** - UCLASS, UPROPERTY, FindComponentByClass, etc.
4. **Multiple tags** - Use comma-separated, toggle button appears for >1 tag

## Detailed Mapping by Topic

### 1. 04-animation-blueprint-montage-system.md

#### Section 3.1: UHattinAnimInstance Header
```cpp
UCLASS()  [uclass-generatedbody]
class HATTIN_API UHattinAnimInstance : public UAnimInstance [uclass-generatedbody]
{
    GENERATED_BODY()  [uclass-generatedbody]

    UPROPERTY(BlueprintReadOnly, Category="Locomotion")  [uproperty-reflection]
    float GroundSpeed;

    UPROPERTY(BlueprintReadOnly, Category="Combat")  [uproperty-reflection]
    bool bIsAttacking;

    UPROPERTY()  [uproperty-reflection,tweakobjectptr]
    TWeakObjectPtr<AHattinCharacterBase> OwnerCharacter;

    virtual void NativeThreadSafeUpdateAnimation(float DeltaSeconds) override; [virtual-vs-override]
```

#### Section 3.2: AnimInstance Implementation
```cpp
void UHattinAnimInstance::NativeInitializeAnimation()  [uaniminstance-c-base,beginplay]
{
    Super::NativeInitializeAnimation();  [superfunction]

    if (APawn* Owner = TryGetPawnOwner())  [uproperty-reflection]
    {
        OwnerCharacter = Cast<AHattinCharacterBase>(Owner);  [castt-safe-type-casting]

        if (OwnerCharacter.IsValid())  [tweakobjectptr]
        {
            MovementComponent = OwnerCharacter->GetCharacterMovement();  [getcharactermovement]
            CombatComponent = OwnerCharacter->FindComponentByClass<UHattinCombatComponent>();  [findcomponentbyclass]
        }
    }
}

float UHattinAnimInstance::CalculateMovementDirection() const  [const-correctness]
{
    FMath::Atan2(...)  [fvector-math-basics]
    FMath::RadiansToDegrees(Angle)  [fmathclamp]
    return FMath::Clamp(..., -180.f, 180.f);  [fmathclamp]
}
```

#### Section 3.3: Custom AnimNotifyState
```cpp
UCLASS()  [uclass-generatedbody]
class HATTIN_API UAN_HitWindow : public UAnimNotifyState  [uanimnotifystate-windows]
{
    GENERATED_BODY()  [uclass-generatedbody]

    virtual void NotifyBegin(...) override;  [virtual-vs-override]
}
```

#### Section 3.5: Montage Structure
```cpp
// Slot: DefaultSlot.UpperBody  [montageplay-delegates]
// - Used for: Attacks [uproperty-reflection]
```

#### Section 3.6: Montage Jumping
```cpp
AnimInstance->Montage_JumpToSection(NextComboSection, CurrentMontage);  [montageplay-delegates]
```

### 2. 03-combat-collision-hit-detection.md (to be added later)

### 3. 01-player-character-architecture.md (to be added later)

## Implementation Priority

### Priority 1 (Must Have)
- UCLASS / GENERATED_BODY pairs
- UPROPERTY declarations
- FindComponentByClass calls
- TWeakObjectPtr usage

### Priority 2 (Should Have)
- BeginPlay / Tick / EndPlay
- FMath utilities
- Super::Function calls
- Cast<> operations

### Priority 3 (Nice to Have)
- Virtual/Override keywords
- const correctness
- GetWorld() calls
- Delegate binding

## Design Decisions

### 1. Toggle Mechanism
- Single tag: Always visible, semi-transparent until hover
- Multiple tags: Extension icon button, toggle reveals all tags
- Counter badge shows "+N" when hidden

### 2. Visual Design
- Small puzzle piece icon
- Chip style labels
- Primary color theme
- Hover effects for interactivity

### 3. Navigation
- Click opens lego piece page in new tab
- Consistent with existing puzzle tag implementation
- Router Link for SPA navigation

## Files Modified
1. `src/components/content/CodeBlock.tsx` - Enhanced with puzzle tag support
2. `src/components/content/MarkdownRenderer.tsx` - Parser for lego references
3. `public/content/*.md` - Add lego references to code blocks

## Testing Checklist
- [ ] Single tag displays correctly
- [ ] Multiple tags toggle works
- [ ] Navigation to lego piece page
- [ ] Extension icon visible on hover
- [ ] No visual clutter in code blocks
- [ ] Mobile responsiveness
- [ ] Dark mode compatibility
