import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  Grid,
  CircularProgress,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { MermaidDiagram } from '../components/content/MermaidDiagram';
import { CodeBlock } from '../components/content/CodeBlock';

// The combat architecture diagram - simplified for readability
const COMBAT_ARCHITECTURE_DIAGRAM = `flowchart TB
    subgraph L0["📁 LAYER 0: ASSET DOMAIN"]
        direction LR
        M["UAnimMontage"] --> NT["Notify Track"]
        NT --> NC["AnimNotify_OpenHitWindow"]
    end

    subgraph L1["🎬 LAYER 1: ANIMATION RUNTIME"]
        direction LR
        AI["UAnimInstance"] --> MI["MontageInstance"]
        MI --> NE["Notify::Execute"]
        NE --> SM["SkeletalMesh→GetOwner"]
    end

    subgraph L2["⏱️ LAYER 2: HIT WINDOW"]
        direction LR
        HW["UHitWindowComponent"] --> DEL["FOnAttackWindow"]
        DEL --> BC["Broadcast"]
    end

    subgraph L3["🎮 LAYER 3: CHARACTER"]
        direction LR
        BP["BeginPlay: Bind"] --> HA["HandleAttackWindow"]
        HA --> QV["QueryVictims"]
    end

    subgraph L4["🌍 LAYER 4: PHYSICS"]
        direction LR
        SW["SweepMultiByChannel"] --> HR["FHitResult[]"]
    end

    subgraph L5["❤️ LAYER 5: HEALTH"]
        direction LR
        HC["UHealthComponent"] --> AD["ApplyDamage"]
        AD --> BD["Broadcast Events"]
    end

    subgraph L6["⚙️ LAYER 6: C++ SYSTEMS"]
        direction LR
        CM["ComboMeter"] ~~~ AG["AggroManager"]
        AG ~~~ AR["ArmorComponent"]
    end

    subgraph L7["🎨 LAYER 7: COSMETICS"]
        direction LR
        VFX["Niagara VFX"] ~~~ SFX["Sound FX"]
        SFX ~~~ UI["Damage Numbers"]
    end

    L0 ==>|"Montage plays"| L1
    L1 ==>|"Notify fires"| L2
    L2 ==>|"Signal sent"| L3
    L3 ==>|"Sweep trace"| L4
    L4 ==>|"Hits found"| L3
    L3 ==>|"Apply damage"| L5
    L5 ==>|"OnDamagedNative"| L6
    L5 ==>|"OnDamagedFX"| L7

    classDef layer0 fill:#2d1b4e,stroke:#9b59b6,stroke-width:2px,color:#fff
    classDef layer1 fill:#1a3a5c,stroke:#3498db,stroke-width:2px,color:#fff
    classDef layer2 fill:#4a3000,stroke:#f39c12,stroke-width:2px,color:#fff
    classDef layer3 fill:#1e4d2b,stroke:#27ae60,stroke-width:2px,color:#fff
    classDef layer4 fill:#3d1f1f,stroke:#e74c3c,stroke-width:2px,color:#fff
    classDef layer5 fill:#4a1942,stroke:#e91e8b,stroke-width:2px,color:#fff
    classDef layer6 fill:#0d3d4a,stroke:#00bcd4,stroke-width:2px,color:#fff
    classDef layer7 fill:#2e4a1e,stroke:#8bc34a,stroke-width:2px,color:#fff

    class L0 layer0
    class L1 layer1
    class L2 layer2
    class L3 layer3
    class L4 layer4
    class L5 layer5
    class L6 layer6
    class L7 layer7`;

// Reference code cards data
const REFERENCE_CARDS = {
  corePatterns: [
    {
      id: 'delegate',
      title: '1. Delegate Declarations',
      filePath: 'HitWindowComponent.h',
      color: '#f39c12',
      code: `// Signal-only (no payload)
DECLARE_MULTICAST_DELEGATE(FOnAttackWindow);

// With parameters (C++ only)
DECLARE_MULTICAST_DELEGATE_TwoParams(
    FOnDamagedNative,
    float, Amount,
    AActor*, Causer
);

// Blueprint-visible
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(
    FOnDamagedFX,
    float, Amount,
    AActor*, Causer
);`,
    },
    {
      id: 'binding',
      title: '2. Binding with Cleanup',
      filePath: 'HeroCharacter.cpp',
      color: '#8bc34a',
      code: `// Store handle for cleanup
FDelegateHandle WindowHandle;

void AHeroCharacter::BeginPlay() {
    Super::BeginPlay();
    
    HitWindow = FindComponentByClass
        <UHitWindowComponent>();
        
    if (HitWindow) {
        WindowHandle = HitWindow->
            OnAttackWindow.AddUObject(
                this,
                &AHeroCharacter::HandleWindow
            );
    }
}

void AHeroCharacter::EndPlay(
    const EEndPlayReason::Type Reason) {
    if (HitWindow) {
        HitWindow->OnAttackWindow
            .Remove(WindowHandle);
    }
    Super::EndPlay(Reason);
}`,
    },
    {
      id: 'notify',
      title: '3. AnimNotify Implementation',
      filePath: 'AnimNotify_OpenHitWindow.h/.cpp',
      color: '#9b59b6',
      code: `// Header
UCLASS()
class UAnimNotify_OpenHitWindow 
    : public UAnimNotify
{
    GENERATED_BODY()
public:
    UPROPERTY(EditAnywhere, Category="Combat")
    float DamageMultiplier = 1.0f;
    
    virtual void Notify(
        USkeletalMeshComponent* MeshComp,
        UAnimSequenceBase* Animation,
        const FAnimNotifyEventReference& Ref
    ) override;
};

// Implementation
void UAnimNotify_OpenHitWindow::Notify(...) {
    Super::Notify(MeshComp, Animation, Ref);
    if (!MeshComp) return;
    
    AActor* Owner = MeshComp->GetOwner();
    if (!Owner) return;
    
    if (auto* HW = Owner->FindComponentByClass
            <UHitWindowComponent>()) {
        HW->OpenWindow();
    }
}`,
    },
    {
      id: 'trace',
      title: '4. Sweep Trace Query',
      filePath: 'HeroCharacter.cpp - QueryVictims()',
      color: '#e74c3c',
      code: `TArray<AActor*> AHeroCharacter::QueryVictims() {
    TArray<AActor*> Victims;
    TArray<FHitResult> OutHits;
    
    FCollisionQueryParams Params;
    Params.AddIgnoredActor(this);
    Params.bTraceComplex = false;
    Params.bReturnPhysicalMaterial = true;
    
    FCollisionShape Shape = 
        FCollisionShape::MakeSphere(AttackRadius);
    
    FVector Start = GetActorLocation() + 
        GetActorForwardVector() * 50.f;
    FVector End = Start + 
        GetActorForwardVector() * 200.f;
    
    bool bHit = GetWorld()->SweepMultiByChannel(
        OutHits, Start, End, FQuat::Identity,
        ECC_GameTraceChannel1, Shape, Params
    );
    
    if (bHit) {
        for (const FHitResult& Hit : OutHits) {
            if (AActor* A = Hit.GetActor())
                Victims.AddUnique(A);
        }
    }
    return Victims;
}`,
    },
  ],
  healthDamage: [
    {
      id: 'health',
      title: '5. Health Component',
      filePath: 'HealthComponent.h/.cpp',
      color: '#e91e8b',
      code: `UCLASS(ClassGroup=(Combat), 
    meta=(BlueprintSpawnableComponent))
class UHealthComponent : public UActorComponent
{
    GENERATED_BODY()
public:
    // Native delegate (C++ only, fast)
    DECLARE_MULTICAST_DELEGATE_TwoParams(
        FOnDamagedNative, float, AActor*);
    FOnDamagedNative OnDamagedNative;
    
    // Dynamic delegate (BP visible)
    DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(
        FOnDamagedFX, float, Amount, 
        AActor*, Causer);
    UPROPERTY(BlueprintAssignable)
    FOnDamagedFX OnDamagedFX;
    
    void ApplyDamage(float Amt, AActor* Src) {
        if (!bCanTakeDamage || Health <= 0.f) 
            return;
        
        Health = FMath::Clamp(
            Health - Amt, 0.f, MaxHealth);
        
        OnDamagedNative.Broadcast(Amt, Src);
        OnDamagedFX.Broadcast(Amt, Src);
        
        if (Health <= 0.f)
            OnDeath.Broadcast();
    }
};`,
    },
    {
      id: 'damagetype',
      title: '6. DamageType System',
      filePath: 'MyDamageTypes.h',
      color: '#ff5722',
      code: `// Custom damage types
UCLASS()
class UFireDamageType : public UDamageType {
    GENERATED_BODY()
};

// Applying typed damage
void DealDamage(AActor* Victim) {
    UGameplayStatics::ApplyDamage(
        Victim,
        35.f,
        GetController(),
        this,  // Damage causer
        UFireDamageType::StaticClass()
    );
}

// Receiving & checking type
void OnTakeAnyDamage(AActor* Damaged, 
    float Damage, const UDamageType* Type,
    AController* Instigator, AActor* Causer) 
{
    if (Type->IsA<UFireDamageType>()) {
        Damage *= FireResistance;
    }
    Health -= Damage;
}`,
    },
  ],
  networkDebug: [
    {
      id: 'server',
      title: '7. Server Authority Pattern',
      filePath: 'HeroCharacter.cpp - Multiplayer',
      color: '#00bcd4',
      code: `void AHeroCharacter::HandleAttackWindow() {
    // ⚠️ CRITICAL: Only server processes damage
    if (!HasAuthority()) return;
    
    for (AActor* Victim : QueryVictims()) {
        if (auto* HC = Victim->FindComponentByClass
                <UHealthComponent>()) {
            // Server applies damage
            HC->ApplyDamage(35.f, this);
            
            // Trigger FX on all clients
            Multicast_PlayHitFX(
                CachedHit.ImpactPoint,
                CachedHit.ImpactNormal.Rotation()
            );
        }
    }
}

// Runs on ALL clients including server
UFUNCTION(NetMulticast, Unreliable)
void Multicast_PlayHitFX(FVector Loc, FRotator Rot);`,
    },
    {
      id: 'replication',
      title: '8. Health Replication',
      filePath: 'HealthComponent.h/.cpp',
      color: '#00bcd4',
      code: `// Header - mark for replication
UPROPERTY(ReplicatedUsing=OnRep_Health)
float Health = 100.f;

UFUNCTION()
void OnRep_Health();

// Source
void UHealthComponent::GetLifetimeReplicatedProps(
    TArray<FLifetimeProperty>& OutProps) const 
{
    Super::GetLifetimeReplicatedProps(OutProps);
    DOREPLIFETIME(UHealthComponent, Health);
}

void UHealthComponent::OnRep_Health() {
    // Called on clients when Health replicates
    OnHealthChanged.Broadcast(Health);
    
    if (Health <= 0.f) {
        PlayDeathAnimation();
    }
}`,
    },
    {
      id: 'debug',
      title: '9. Debug Visualization',
      filePath: 'HeroCharacter.cpp - Debug Helpers',
      color: '#ffd93d',
      code: `#include "DrawDebugHelpers.h"

void AHeroCharacter::DebugDrawAttack() {
#if !UE_BUILD_SHIPPING
    FVector Start = GetActorLocation();
    FVector End = Start + 
        GetActorForwardVector() * 200.f;
    
    // Draw sweep sphere
    DrawDebugSphere(
        GetWorld(), Start, AttackRadius,
        12, FColor::Yellow, false, 0.5f);
    
    // Draw attack direction
    DrawDebugDirectionalArrow(
        GetWorld(), Start, End, 50.f,
        FColor::Red, false, 0.5f, 0, 3.f);
    
    // Draw hit points
    for (const FHitResult& Hit : CachedHits) {
        DrawDebugPoint(
            GetWorld(), Hit.ImpactPoint,
            10.f, FColor::Green, false, 0.5f);
    }
#endif
}`,
    },
    {
      id: 'memory',
      title: '10. Safe Pointer Patterns',
      filePath: 'Various - Memory Safety',
      color: '#bb86fc',
      code: `// ❌ BAD - crashes if Target destroyed
Target->TakeDamage(50.f);

// ✅ GOOD - null check
if (Target) {
    Target->TakeDamage(50.f);
}

// ✅ BETTER - checks PendingKill too
if (IsValid(Target)) {
    Target->TakeDamage(50.f);
}

// ✅ Weak pointer for caching
TWeakObjectPtr<AActor> WeakTarget;
if (WeakTarget.IsValid()) {
    WeakTarget->TakeDamage(50.f);
}

// Timer with weak capture
FTimerDelegate TimerDel;
TimerDel.BindWeakLambda(this, [this]() {
    DoDelayedThing();
});`,
    },
  ],
};

// Code flow steps data
const CODE_FLOW_STEPS = [
  {
    step: 0,
    title: 'Setup Phase (BeginPlay) - LAYER 3',
    icon: '📦',
    filePath: 'HeroCharacter.h/.cpp',
    color: '#8bc34a',
    code: `// HeroCharacter.h
UCLASS()
class AHeroCharacter : public ACharacter
{
    GENERATED_BODY()
protected:
    virtual void BeginPlay() override;
    void HandleAttackWindow();
    TArray<AActor*> QueryVictims();
private:
    UPROPERTY()
    UHitWindowComponent* HitWindow;
    FDelegateHandle WindowHandle;
};

// HeroCharacter.cpp
void AHeroCharacter::BeginPlay()
{
    Super::BeginPlay();
    HitWindow = FindComponentByClass<UHitWindowComponent>();
    if (HitWindow) {
        WindowHandle = HitWindow->OnAttackWindow.AddUObject(
            this, &AHeroCharacter::HandleAttackWindow);
    }
}

// 💡 Character subscribes to OnAttackWindow delegate
// Now waiting for animation to trigger...`,
  },
  {
    step: 1,
    title: 'Asset Domain - LAYER 0',
    icon: '📁',
    filePath: 'Content/Animations/AM_SwordSlash.uasset',
    color: '#9b59b6',
    code: `// IN THE EDITOR - UAnimMontage Setup

UAnimMontage: AM_SwordSlash
├─ Animation Sequence: Sword_Slash_Anim
├─ Notify Track:
│   └─ [Frame 15] AnimNotify_OpenHitWindow
│       ├─ DamageMultiplier: 1.5
│       ├─ DamageType: USlashDamageType
│       └─ SocketName: "WeaponTip"
└─ Sections: Default, Recovery

// Artist places notify at exact frame sword should hit
// When montage plays, engine fires notify at frame 15`,
  },
  {
    step: 2,
    title: 'Animation Runtime - LAYER 1',
    icon: '🎬',
    filePath: 'Engine Internal',
    color: '#9b59b6',
    code: `// INSIDE UE5 ENGINE TICK (Simplified)
void UAnimInstance::UpdateAnimation(float DeltaTime)
{
    FAnimMontageInstance* MontageInst = GetActiveMontageInstance();
    if (MontageInst) {
        MontageInst->Advance(DeltaTime);
        
        // Check if we passed a notify this frame
        if (MontageInst->Position >= 15.0f && !NotifyFired) {
            UAnimNotify_OpenHitWindow* Notify = /* ... */;
            
            // Call the notify's Notify() method
            Notify->Notify(
                GetSkelMeshComponent(),
                CurrentAnimation,
                NotifyEventRef
            );
            NotifyFired = true;
        }
    }
}

// 💡 Engine detects notify frame → calls YOUR code`,
  },
  {
    step: 3,
    title: 'Notify Fires - LAYER 1 → LAYER 2',
    icon: '🔔',
    filePath: 'AnimNotify_OpenHitWindow.cpp',
    color: '#9b59b6',
    code: `void UAnimNotify_OpenHitWindow::Notify(
    USkeletalMeshComponent* MeshComp,
    UAnimSequenceBase* Animation,
    const FAnimNotifyEventReference& EventReference)
{
    Super::Notify(MeshComp, Animation, EventReference);
    if (!MeshComp) return;
    
    AActor* Owner = MeshComp->GetOwner();
    if (!Owner) return;
    
    if (auto* HW = Owner->FindComponentByClass<UHitWindowComponent>())
    {
        HW->OpenWindow();  // → Next step!
    }
}

// 💡 Notify finds HitWindowComponent → calls OpenWindow()`,
  },
  {
    step: 4,
    title: 'HitWindow Opens & Broadcasts - LAYER 2',
    icon: '⏱️',
    filePath: 'HitWindowComponent.cpp',
    color: '#f39c12',
    code: `// DECLARE the delegate type
DECLARE_MULTICAST_DELEGATE(FOnAttackWindow);

class UHitWindowComponent : public UActorComponent
{
public:
    FOnAttackWindow OnAttackWindow;  // The instance
    
    void OpenWindow() {
        if (bWindowOpen) return;
        bWindowOpen = true;
        
        // 🔥 THIS IS THE KEY LINE!
        // Broadcast notifies ALL subscribers
        OnAttackWindow.Broadcast();
    }
};

// 💡 Broadcast() calls HeroCharacter::HandleAttackWindow()`,
  },
  {
    step: 5,
    title: 'Character Handles Signal - LAYER 3',
    icon: '🎮',
    filePath: 'HeroCharacter.cpp',
    color: '#8bc34a',
    code: `void AHeroCharacter::HandleAttackWindow()
{
    // Server authority for multiplayer
    if (!HasAuthority()) return;
    
    constexpr float Damage = 35.f;
    
    // Query for victims in attack range
    TArray<AActor*> Victims = QueryVictims();
    
    for (AActor* Victim : Victims) {
        if (auto* HC = Victim->FindComponentByClass<UHealthComponent>()) {
            HC->ApplyDamage(Damage, this);
        }
    }
}

// 💡 Character runs trace → applies damage to victims`,
  },
  {
    step: 6,
    title: 'Physics Query - LAYER 4',
    icon: '🌍',
    filePath: 'HeroCharacter.cpp - QueryVictims()',
    color: '#e74c3c',
    code: `TArray<AActor*> AHeroCharacter::QueryVictims()
{
    TArray<FHitResult> OutHits;
    FCollisionQueryParams Params;
    Params.AddIgnoredActor(this);
    
    FCollisionShape Shape = FCollisionShape::MakeSphere(80.f);
    FVector Start = GetActorLocation();
    FVector End = Start + GetActorForwardVector() * 200.f;
    
    GetWorld()->SweepMultiByChannel(
        OutHits, Start, End, FQuat::Identity,
        ECC_GameTraceChannel1, Shape, Params
    );
    
    TArray<AActor*> Results;
    for (auto& Hit : OutHits)
        if (Hit.GetActor()) Results.AddUnique(Hit.GetActor());
    return Results;
}

// 💡 Sweep trace finds actors in attack range`,
  },
  {
    step: 7,
    title: 'State Management - LAYER 5',
    icon: '❤️',
    filePath: 'HealthComponent.cpp',
    color: '#e91e8b',
    code: `void UHealthComponent::ApplyDamage(float Amount, AActor* Causer)
{
    if (!bCanTakeDamage || Health <= 0.f) return;
    
    // Clamp health
    Health = FMath::Clamp(Health - Amount, 0.f, MaxHealth);
    
    // Notify C++ systems (fast)
    OnDamagedNative.Broadcast(Amount, Causer);
    
    // Notify BP systems (for VFX/UI)
    OnDamagedFX.Broadcast(Amount, Causer);
    
    // Check for death
    if (Health <= 0.f)
        OnDeath.Broadcast();
}

// 💡 Health updated → broadcasts to responders`,
  },
  {
    step: 8,
    title: 'Responders React - LAYERS 6 & 7',
    icon: '✨',
    filePath: 'Various Systems',
    color: '#00bcd4',
    code: `// NATIVE RESPONDERS (C++ - Layer 6)
void UHitReactionComponent::OnDamaged(float Amt, AActor* Src) {
    // Calculate knockback, play stagger animation
    ApplyKnockback(Src->GetActorLocation());
}

void UComboComponent::OnDamaged(float Amt, AActor* Src) {
    // Interrupt current combo, reset state
    ResetCombo();
}

// COSMETIC RESPONDERS (BP - Layer 7)
// In Event Graph: OnDamagedFX
// → Spawn Niagara blood effect at impact
// → Play hit sound
// → Spawn floating damage number widget
// → Shake camera if player

// 💡 All systems react independently to damage event`,
  },
];

interface RefCardProps {
  title: string;
  filePath: string;
  code: string;
  color: string;
}

const RefCard = ({ title, filePath, code, color }: RefCardProps) => (
  <Paper
    elevation={0}
    sx={{
      bgcolor: 'rgba(0,0,0,0.4)',
      borderRadius: 2,
      borderLeft: 4,
      borderColor: color,
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 20px ${color}30`,
      },
    }}
  >
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Typography variant="subtitle1" sx={{ color, fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', opacity: 0.8 }}>
        📍 {filePath}
      </Typography>
    </Box>
    <Box sx={{ p: 2, flexGrow: 1 }}>
      <CodeBlock code={code} language="cpp" />
    </Box>
  </Paper>
);

interface FlowStepCardProps {
  step: number;
  title: string;
  icon: string;
  filePath: string;
  code: string;
  color: string;
}

const FlowStepCard = ({ step, title, icon, filePath, code, color }: FlowStepCardProps) => (
  <Box sx={{ position: 'relative' }}>
    {/* Step number badge */}
    <Box
      sx={{
        position: 'absolute',
        left: -12,
        top: 16,
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.9rem',
        color: '#fff',
        boxShadow: `0 2px 8px ${color}60`,
        zIndex: 1,
      }}
    >
      {step}
    </Box>
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'rgba(0,0,0,0.4)',
        borderRadius: 2,
        borderLeft: 4,
        borderColor: color,
        overflow: 'hidden',
        ml: 2,
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: `0 4px 20px ${color}20`,
        },
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: `${color}10` }}>
        <Typography variant="h6" sx={{ color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon} {title}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace', opacity: 0.8 }}>
          📍 {filePath}
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <CodeBlock code={code} language="cpp" />
      </Box>
    </Paper>
  </Box>
);

export const AnimNotifyArchitecturePage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3, width: '100%' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        <Link component={RouterLink} to="/collections" color="inherit">
          Collections
        </Link>
        <Typography color="text.primary">AnimNotify Combat Architecture</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h3"
          fontWeight={800}
          sx={{
            background: 'linear-gradient(90deg, #61dafb, #bb86fc, #03dac6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
          }}
        >
          ⚔️ UE5 Combat Architecture Bible
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Ultra-Comprehensive C++ Combat System Reference | With Extended Notes & Networking
        </Typography>
        <Chip
          label="V2.0 - Enhanced with Q&A, Debug, Multiplayer Patterns"
          sx={{
            background: 'linear-gradient(90deg, #f39c12, #e74c3c)',
            color: '#fff',
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Legend */}
      <Paper elevation={0} sx={{ p: 2, mb: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
        <Grid container spacing={2}>
          {[
            { color: '#9b59b6', label: 'Asset Domain', desc: 'Editor-authored data' },
            { color: '#3498db', label: 'Animation Runtime', desc: 'Notify execution' },
            { color: '#f39c12', label: 'Timing Gatekeeper', desc: 'Delegate bridge' },
            { color: '#27ae60', label: 'Actor Coordinator', desc: 'Command center' },
            { color: '#e74c3c', label: 'Physics Query', desc: 'World traces' },
            { color: '#e91e8b', label: 'State Management', desc: 'Health component' },
            { color: '#00bcd4', label: 'Native Responders', desc: 'C++ systems' },
            { color: '#8bc34a', label: 'Cosmetic Responders', desc: 'BP/Art layer' },
          ].map(({ color, label, desc }) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={label}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                <Box sx={{ width: 20, height: 20, borderRadius: 0.5, bgcolor: color, flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600}>{label}</Typography>
                  <Typography variant="caption" color="text.secondary">{desc}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Architecture Diagram */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: '#61dafb' }}>
          🏗️ Architecture Diagram
        </Typography>
        <MermaidDiagram chart={COMBAT_ARCHITECTURE_DIAGRAM} id="combat-architecture-main" />
      </Paper>

      {/* Quick Code Reference - 10 Cards */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 3, color: '#61dafb' }}>
          📚 Quick Code Reference (10 Cards)
        </Typography>

        {/* Core Patterns */}
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
          ━━━ Core Patterns ━━━
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {REFERENCE_CARDS.corePatterns.map((card) => (
            <Grid size={{ xs: 12, md: 6 }} key={card.id}>
              <RefCard {...card} />
            </Grid>
          ))}
        </Grid>

        {/* Health & Damage */}
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
          ━━━ Health & Damage ━━━
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {REFERENCE_CARDS.healthDamage.map((card) => (
            <Grid size={{ xs: 12, md: 6 }} key={card.id}>
              <RefCard {...card} />
            </Grid>
          ))}
        </Grid>

        {/* Networking & Debug */}
        <Typography variant="h6" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
          ━━━ Networking & Debug ━━━
        </Typography>
        <Grid container spacing={3}>
          {REFERENCE_CARDS.networkDebug.map((card) => (
            <Grid size={{ xs: 12, md: 6 }} key={card.id}>
              <RefCard {...card} />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Code Flow in Order */}
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 1, color: '#61dafb' }}>
          🔄 Code Flow in Order - Complete Walkthrough
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Follow this step-by-step guide to see how all pieces connect from animation to damage.
          Each step maps to layers in the diagram above.
        </Typography>

        {/* Flow timeline */}
        <Box sx={{ position: 'relative', pl: 3 }}>
          {/* Vertical connecting line */}
          <Box
            sx={{
              position: 'absolute',
              left: 8,
              top: 24,
              bottom: 24,
              width: 2,
              bgcolor: 'divider',
              borderRadius: 1,
            }}
          />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {CODE_FLOW_STEPS.map((flowStep) => (
              <FlowStepCard key={flowStep.step} {...flowStep} />
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
