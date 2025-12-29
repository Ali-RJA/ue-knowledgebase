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

// The FULL combat architecture diagram - matching the HTML reference
const COMBAT_ARCHITECTURE_DIAGRAM = `flowchart TB
    direction TB

    %% ============================================================
    %% LAYER 0: ASSET DOMAIN
    %% ============================================================
    subgraph LAYER0["📁 LAYER 0: ASSET DOMAIN ━━ Authored in Editor"]
        direction TB
        
        subgraph MONTAGE["UAnimMontage Asset"]
            direction TB
            MONTAGE_DEF["<b>UAnimMontage</b><br/>━━━━━━━━━━━━━<br/>• Composite animation asset<br/>• Contains notify tracks<br/>• Defines sections/slots"]
            
            NOTIFY_TRACK["<b>Notify Track</b><br/>━━━━━━━━━━━━━━━━━━━━<br/>Frame 0 ══════════ Frame N<br/>         ▲ notify fires"]
            
            MONTAGE_DEF --> NOTIFY_TRACK
        end
        
        subgraph NOTIFY_DEF["UAnimNotify Subclass"]
            NOTIFY_CLASS["<b>UAnimNotify_OpenHitWindow</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>UPROPERTY parameters:<br/>• float DamageMultiplier<br/>• TSubclassOf DamageType<br/>• FName SocketName"]
        end
        
        NOTIFY_TRACK -->|"references"| NOTIFY_CLASS
    end

    %% LAYER 0 NOTES
    subgraph LAYER0_NOTES["📝 LAYER 0 NOTES ━━ Animation Assets"]
        direction TB
        L0_QA["<b>❓ Common Questions</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Q: Notify vs NotifyState?<br/>A: Notify = instant frame event<br/>   NotifyState = duration window<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Q: Multiple notifies same frame?<br/>A: YES but order NOT guaranteed<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Q: Branching Point vs Notify?<br/>A: BranchingPoint = frame-perfect<br/>   Notify can slip 1-2 frames"]
        
        L0_CODE["<b>📍 UAnimNotify_OpenHitWindow.h</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>UCLASS<br/>class UAnimNotify_OpenHitWindow<br/>  : public UAnimNotify<br/>{<br/>  UPROPERTY EditAnywhere<br/>  float DamageMultiplier = 1.0f;<br/>  <br/>  virtual void Notify<br/>    USkeletalMeshComponent*,<br/>    UAnimSequenceBase*,<br/>    FAnimNotifyEventReference&<br/>  override;<br/>};"]
        
        L0_WARN["<b>⚠️ Gotchas</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>• Notify NOT replicated by default<br/>• Blended anims may fire 2x<br/>• Root motion can desync notify<br/>• Test with Queued notify track"]
        
        L0_QA ~~~ L0_CODE ~~~ L0_WARN
    end

    %% ============================================================
    %% LAYER 1: ANIMATION RUNTIME
    %% ============================================================
    subgraph LAYER1["🎬 LAYER 1: ANIMATION RUNTIME ━━ Engine Tick"]
        direction TB
        
        subgraph ANIM_INST["UAnimInstance"]
            direction TB
            ANIM_STATE["<b>Animation State Machine</b><br/>━━━━━━━━━━━━━━━━━━━━━<br/>• Processes montage playback<br/>• Detects notify triggers<br/>• Calls Notify virtual method"]
            
            MONTAGE_INST["<b>FAnimMontageInstance</b><br/>━━━━━━━━━━━━━━━━━━━━<br/>float Position<br/>float PlayRate<br/>bool bPlaying<br/>int32 MontageInstanceID"]
            
            ANIM_STATE --> MONTAGE_INST
        end
        
        subgraph NOTIFY_EXEC["Notify Execution"]
            direction TB
            
            NOTIFY_PARAMS["<b>Parameters Received</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>USkeletalMeshComponent* MeshComp<br/>UAnimSequenceBase* Animation<br/>FAnimNotifyEventReference& Ref"]
            
            SKEL_MESH["<b>USkeletalMeshComponent</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Inheritance:<br/>USkeletalMeshComponent<br/> ↳ USkinnedMeshComponent<br/>  ↳ UMeshComponent<br/>   ↳ UPrimitiveComponent<br/>━━━━━━━━━━━━━━━━━━━━<br/>GetOwner → AActor*<br/>GetAnimInstance → UAnimInstance*"]
            
            NOTIFY_PARAMS --> SKEL_MESH
        end
        
        MONTAGE_INST -->|"frame N reached"| NOTIFY_PARAMS
    end

    %% LAYER 1 NOTES
    subgraph LAYER1_NOTES["📝 LAYER 1 NOTES ━━ Runtime Execution"]
        direction TB
        L1_QA["<b>❓ Common Questions</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Q: Get owner Actor from notify?<br/>A: MeshComp→GetOwner<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Q: Notify fires twice - why?<br/>A: Animation blend, looping,<br/>   or notify in SEQ + MONTAGE<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Q: Pass custom data to notify?<br/>A: Use UPROPERTY on notify class"]
        
        L1_CODE["<b>📍 AnimNotify_OpenHitWindow.cpp</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>void UAnimNotify_OpenHitWindow<br/>::Notify MeshComp, Anim, Ref<br/>{<br/>  Super::Notify ...;<br/>  if !MeshComp return;<br/>  <br/>  AActor* Owner = <br/>    MeshComp→GetOwner;<br/>  if !Owner return;<br/>  <br/>  auto* HW = Owner→<br/>    FindComponentByClass<br/>      UHitWindowComponent;<br/>  if HW → HW→OpenWindow;<br/>}"]
        
        L1_LIFECYCLE["<b>🔄 UAnimInstance Lifecycle</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>NativeInitializeAnimation<br/>  ↓ called once on spawn<br/>NativeUpdateAnimation dt<br/>  ↓ called every frame<br/>BlueprintUpdateAnimation<br/>  ↓ BP event graph runs<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>⚠️ Thread Safety: UE5 anim<br/>runs on worker threads!<br/>Use ThreadSafe UPROPERTY"]
        
        L1_QA ~~~ L1_CODE ~~~ L1_LIFECYCLE
    end

    %% ============================================================
    %% DATA FLOW ANNOTATION
    %% ============================================================
    subgraph DATAFLOW1["📨 DATA FLOW: Notify → Component"]
        DATA_NOTE["<b>What Crosses Boundary?</b><br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>1. MeshComp→GetOwner<br/>2. Cast to AHeroCharacter<br/>3. FindComponentByClass<br/>4. Invoke OpenWindow<br/>━━━━━━━━━━━━━━━━━━━━<br/>DATA: None - pure control flow<br/>POINTER: Raw from engine ⚠️"]
    end

    %% DATAFLOW NOTES
    subgraph DATAFLOW_NOTES["📝 DATAFLOW NOTES ━━ Architecture Patterns"]
        direction TB
        DF_PATTERN["<b>🏗️ Signal vs Data Delegates</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>SIGNAL signal-only:<br/>DECLARE_MULTICAST_DELEGATE<br/>  FOnWindowOpened<br/>Broadcast: OnWindowOpened.Broadcast<br/>Handler queries what it needs<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>DATA-CARRYING with payload:<br/>DECLARE_MULTICAST_DELEGATE_TwoParams<br/>  FOnDamageDealt, float, AActor*<br/>Broadcast passes data directly"]
        
        DF_ALT["<b>🔀 Interface Alternative</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>UINTERFACE MinimalAPI<br/>class UDamageable : UInterface {};<br/><br/>class IDamageable {<br/>  virtual void TakeDamage<br/>    float Amt, AActor* Src = 0;<br/>};<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Usage:<br/>if Owner→Implements UDamageable<br/>  IDamageable::Execute_TakeDamage<br/>    Owner, 35.f, this;"]
        
        DF_PATTERN ~~~ DF_ALT
    end

    %% ============================================================
    %% LAYER 2: TIMING GATEKEEPER
    %% ============================================================
    subgraph LAYER2["⏱️ LAYER 2: TIMING GATEKEEPER ━━ Signal Emitter"]
        direction TB
        
        subgraph RATIONALE["💡 DESIGN RATIONALE"]
            WHY_NAME["<b>Why UHitWindowComponent?</b><br/><b>Not USwordComponent?</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Single Responsibility:<br/>• Answers ONE question only<br/>• 'WHEN can damage occur?'<br/>• NOT what weapon or how much<br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>Decoupling:<br/>• Fists, swords, hammers, spells<br/>• ALL reuse same component"]
        end
        
        subgraph HITWINDOW["UHitWindowComponent"]
            direction TB
            
            HW_CLASS["<b>: UActorComponent</b><br/>━━━━━━━━━━━━━━━━━"]
            
            DELEGATE_DECL["<b>Delegate Declaration</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>DECLARE_MULTICAST_DELEGATE<br/>  FOnAttackWindow<br/>━━━━━━━━━━━━━━━━━━━━━<br/>Signature: void<br/>Parameters: NONE"]
            
            DELEGATE_INST["<b>Delegate Instance</b><br/>━━━━━━━━━━━━━━━━━━━<br/>FOnAttackWindow OnAttackWindow<br/>━━━━━━━━━━━━━━━━━━━<br/>Internal: TArray FDelegate<br/> └─ InvocationList"]
            
            OPEN_METHOD["<b>void OpenWindow</b><br/>━━━━━━━━━━━━━━━━━━━━━<br/>UFUNCTION BlueprintCallable<br/>OnAttackWindow.Broadcast<br/>━━━━━━━━━━━━━━━━━━━━━<br/>Order is UNDEFINED ⚠️"]
            
            HW_CLASS --> DELEGATE_DECL
            DELEGATE_DECL --> DELEGATE_INST
            DELEGATE_INST --> OPEN_METHOD
        end
    end

    %% LAYER 2 NOTES
    subgraph LAYER2_NOTES["📝 LAYER 2 NOTES ━━ Delegates Deep Dive"]
        direction TB
        L2_TYPES["<b>📊 Delegate Type Matrix</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Type        │BP?│Speed│UFUNC?<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Static      │ ❌ │ ⚡  │ ❌<br/>StaticMulti │ ❌ │ ⚡  │ ❌<br/>Dynamic     │ ✅ │ 🐢  │ ✅<br/>DynamicMulti│ ✅ │ 🐢  │ ✅<br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>⚡ = ~5-10ns  🐢 = ~50-100ns"]
        
        L2_HANDLE["<b>🔧 FDelegateHandle Cleanup</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// Store handle for cleanup<br/>FDelegateHandle MyHandle;<br/><br/>void BeginPlay {<br/>  MyHandle = Delegate.AddUObject<br/>    this, &ThisClass::Handler;<br/>}<br/><br/>void EndPlay EEndPlayReason {<br/>  Delegate.Remove MyHandle;<br/>  // OR: Delegate.RemoveAll this;<br/>}"]
        
        L2_BIND["<b>🔗 Binding Methods</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>AddUObject: UObject member func<br/>  Stores TWeakObjectPtr internally<br/>  Auto-removes if object destroyed<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>AddRaw: Non-UObject class<br/>  NO safety checks! Manual cleanup!<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>AddLambda: Inline function<br/>  Capture by value or weak ptr!<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>AddDynamic: Dynamic delegate only<br/>  Requires UFUNCTION on handler"]
        
        L2_TYPES ~~~ L2_HANDLE ~~~ L2_BIND
    end

    %% ============================================================
    %% LAYER 3: ACTOR COORDINATOR
    %% ============================================================
    subgraph LAYER3["🎮 LAYER 3: ACTOR COORDINATOR ━━ Command Center"]
        direction TB
        
        subgraph BEGINPLAY["BeginPlay Setup"]
            direction TB
            
            COMP_LOOKUP["<b>Component Discovery</b><br/>━━━━━━━━━━━━━━━━━━━━━━<br/>HitWindow = FindComponentByClass<br/>  UHitWindowComponent<br/>━━━━━━━━━━━━━━━━━━━━<br/>Returns: raw ptr or nullptr<br/>MUST null-check ⚠️"]
            
            BIND_DELEGATE["<b>Delegate Binding</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>HitWindow→OnAttackWindow<br/>  .AddUObject<br/>    this,<br/>    &AHeroCharacter::HandleAttackWindow<br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>Stores TWeakObjectPtr + func ptr"]
            
            COMP_LOOKUP --> BIND_DELEGATE
        end
        
        subgraph HANDLE_ATTACK["HandleAttackWindow"]
            direction TB
            
            DAMAGE_DEF["<b>constexpr float Damage = 35.f</b><br/>━━━━━━━━━━━━━━━━━━━━<br/>Compile-time constant"]
            
            QUERY_VICTIMS["<b>QueryVictims</b><br/>━━━━━━━━━━━━━━━━━━━<br/>Returns TArray AActor*<br/>Uses SweepMultiByChannel"]
            
            LOOP["<b>for AActor* Victim</b><br/>━━━━━━━━━━━━━━━━━━<br/>Range-based iteration"]
            
            DAMAGE_DEF --> QUERY_VICTIMS
            QUERY_VICTIMS --> LOOP
        end
    end

    %% LAYER 3 NOTES
    subgraph LAYER3_NOTES["📝 LAYER 3 NOTES ━━ Character & Networking"]
        direction TB
        L3_NETWORK["<b>🌐 MULTIPLAYER CRITICAL</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>void HandleAttackWindow {<br/>  // ⚠️ ONLY SERVER calculates!<br/>  if !HasAuthority return;<br/>  <br/>  for AActor* Victim : QueryVictims<br/>  {<br/>    // Damage on server only<br/>    // Health replicates to clients<br/>    ApplyDamage Victim, 35.f;<br/>  }<br/>}<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Client traces are COSMETIC only"]
        
        L3_LIFECYCLE["<b>🔄 Init Order</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Constructor<br/>  ↓ components created here<br/>PostInitializeComponents<br/>  ↓ components ready, bind here!<br/>BeginPlay<br/>  ↓ world ready, game started<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>💡 PostInitializeComponents<br/>   is safer than BeginPlay<br/>   for component dependencies"]
        
        L3_ENSURE["<b>✅ Validation Patterns</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// Dev assertion - crash in editor<br/>ensureMsgf HitWindow,<br/>  TEXT Requires HitWindowComponent!;<br/><br/>// Always crash if fails<br/>check HitWindow != nullptr;<br/><br/>// Log and continue<br/>if !HitWindow {<br/>  UE_LOG LogCombat, Error,<br/>    TEXT No HitWindow!;<br/>  return;<br/>}"]
        
        L3_NETWORK ~~~ L3_LIFECYCLE ~~~ L3_ENSURE
    end

    %% ============================================================
    %% LAYER 4: PHYSICS QUERY
    %% ============================================================
    subgraph LAYER4["🌍 LAYER 4: PHYSICS QUERY ━━ World Traces"]
        direction TB
        
        subgraph TRACE_CONFIG["Trace Configuration"]
            COLL_PARAMS["<b>FCollisionQueryParams</b><br/>━━━━━━━━━━━━━━━━━━━━━━<br/>TraceTag: FName debug<br/>bTraceComplex: per-poly<br/>bReturnPhysicalMaterial: true<br/>━━━━━━━━━━━━━━━━━━━━<br/>AddIgnoredActor: self"]
            
            COLL_SHAPE["<b>FCollisionShape</b><br/>━━━━━━━━━━━━━━━━━━<br/>MakeSphere: radius<br/>MakeCapsule: r, hh<br/>MakeBox: half extents"]
            
            COLL_CHANNEL["<b>ECollisionChannel</b><br/>━━━━━━━━━━━━━━━━━━<br/>ECC_Pawn: default<br/>ECC_GameTraceChannel1:<br/>  Custom 'Attack' channel"]
            
            COLL_PARAMS --> COLL_SHAPE --> COLL_CHANNEL
        end
        
        subgraph TRACE_EXEC["Trace Execution"]
            SWEEP_CALL["<b>GetWorld→SweepMultiByChannel</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>TArray FHitResult& OutHits<br/>FVector Start, End<br/>FQuat Rotation<br/>ECollisionChannel Channel<br/>FCollisionShape Shape<br/>FCollisionQueryParams Params<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Returns: bool bHitSomething"]
        end
        
        subgraph HITRESULT["FHitResult ━━ Key Members"]
            direction TB
            
            HR_FLAGS["<b>━━ Flags ━━</b><br/>bBlockingHit: bool<br/>bStartPenetrating: bool"]
            
            HR_VEC["<b>━━ Spatial ━━</b><br/>ImpactPoint: FVector surface<br/>ImpactNormal: FVector dir<br/>Distance: float from start"]
            
            HR_REF["<b>━━ References ━━</b><br/>GetActor → AActor*<br/>GetComponent → UPrimComp*<br/>PhysMaterial → surface type<br/>BoneName → skeletal bone"]
            
            HR_FLAGS ~~~ HR_VEC ~~~ HR_REF
        end
        
        TRACE_EXEC --> HITRESULT
    end

    %% LAYER 4 NOTES
    subgraph LAYER4_NOTES["📝 LAYER 4 NOTES ━━ Traces & Debug"]
        direction TB
        L4_TYPES["<b>📊 Trace Type Decision</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>LINE TRACE ════════════><br/>• Infinitely thin, fast<br/>• Bullets, lasers, hitscan<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>SPHERE SWEEP  ●━━━━━━●<br/>• Radius gives forgiveness<br/>• Melee attacks, pickups<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>CAPSULE SWEEP ╭─╮━━━╭─╮<br/>• Character-shaped<br/>• Large weapons, cleaves"]
        
        L4_DEBUG["<b>🐛 Debug Visualization</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>#if !UE_BUILD_SHIPPING<br/>DrawDebugSphere GetWorld,<br/>  Start, Radius, 12,<br/>  bHit ? FColor::Green<br/>       : FColor::Red,<br/>  false, 0.5f;<br/><br/>DrawDebugLine GetWorld,<br/>  Start, End,<br/>  FColor::Yellow,<br/>  false, 0.5f, 0, 2.f;<br/>#endif<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Console: show collision"]
        
        L4_ASYNC["<b>⚡ Async Traces Performance</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// For heavy queries 100+<br/>FTraceHandle Handle =<br/>  GetWorld→AsyncSweepByChannel<br/>    EAsyncTraceType::Multi,<br/>    Start, End,<br/>    ECC_Attack,<br/>    Shape,<br/>    Params,<br/>    &MyTraceDelegate;<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Results arrive next frame<br/>via FTraceDelegate callback"]
        
        L4_TYPES ~~~ L4_DEBUG ~~~ L4_ASYNC
    end

    %% ============================================================
    %% LAYER 5: STATE MANAGEMENT
    %% ============================================================
    subgraph LAYER5["❤️ LAYER 5: STATE MANAGEMENT ━━ Health Component"]
        direction TB
        
        subgraph HEALTH_PROPS["State Properties"]
            PROPS["<b>UPROPERTY EditAnywhere</b><br/>━━━━━━━━━━━━━━━━━━<br/>float Health<br/>float MaxHealth = 100.f<br/>━━━━━━━━━━━━━━━━━━<br/>UPROPERTY enables:<br/>• GC tracking<br/>• Serialization<br/>• Editor exposure"]
        end
        
        subgraph DUAL_DELEGATES["Dual Delegate System"]
            direction TB
            
            NATIVE_DECL["<b>━━ C++ Systems ━━</b><br/>DECLARE_MULTICAST_DELEGATE_TwoParams<br/>  FOnDamagedNative,<br/>  float Amount,<br/>  AActor* Causer<br/>━━━━━━━━━━━━━━━━━━━━━<br/>Faster, C++ only"]
            
            FX_DECL["<b>━━ Blueprint ━━</b><br/>DECLARE_DYNAMIC_MULTICAST_DELEGATE<br/>  _TwoParams<br/>  FOnDamagedFX,<br/>  float, Amount,<br/>  AActor*, Causer<br/>━━━━━━━━━━━━━━━━━━━━━<br/>Slower, BP-visible"]
            
            NATIVE_DECL ~~~ FX_DECL
        end
        
        subgraph APPLY_DMG["ApplyDamage Method"]
            direction TB
            
            CLAMP["<b>State Mutation</b><br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>Health = FMath::Clamp<br/>  Health - Amount,<br/>  0.f, MaxHealth"]
            
            BC_NATIVE["<b>OnDamagedNative.Broadcast</b>"]
            
            BC_FX["<b>OnDamagedFX.Broadcast</b>"]
            
            DEATH["<b>if Health <= 0.f</b><br/>  OnDeath.Broadcast"]
            
            CLAMP --> BC_NATIVE --> BC_FX --> DEATH
        end
    end

    %% LAYER 5 NOTES
    subgraph LAYER5_NOTES["📝 LAYER 5 NOTES ━━ Damage System"]
        direction TB
        L5_DAMAGETYPE["<b>🎯 UDamageType Integration</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// Custom damage types<br/>UCLASS<br/>class UFireDamageType<br/>  : public UDamageType {};<br/><br/>// Apply with type<br/>UGameplayStatics::ApplyDamage<br/>  Victim, 35.f,<br/>  InstigatorController,<br/>  DamageCauser,<br/>  UFireDamageType::StaticClass;<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Receiver checks type for<br/>resistance/immunity"]
        
        L5_PIPELINE["<b>🔄 Damage Pipeline</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>RAW DAMAGE 35.f<br/>      │<br/>      ▼<br/>┌─ Pre-Modifier ─┐<br/>│ Armor: 0.8x    │<br/>│ Fire Resist    │<br/>└───────┬────────┘<br/>        │ 28.f<br/>        ▼<br/>┌─ Health Comp ─┐<br/>│ Clamp/Apply   │<br/>└───────┬───────┘<br/>        │<br/>        ▼<br/>Broadcast to listeners"]
        
        L5_REPLICATE["<b>🌐 Network Replication</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>UPROPERTY Replicated<br/>float Health;<br/><br/>void GetLifetimeReplicatedProps<br/>  TArray FLifetimeProperty& Out<br/>{<br/>  DOREPLIFETIME ThisClass, Health;<br/>}<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Health syncs server→clients<br/>Damage calc ONLY on server"]
        
        L5_DAMAGETYPE ~~~ L5_PIPELINE ~~~ L5_REPLICATE
    end

    %% ============================================================
    %% LAYER 6: NATIVE RESPONDERS
    %% ============================================================
    subgraph LAYER6["⚙️ LAYER 6: NATIVE RESPONDERS ━━ C++ Systems"]
        direction TB
        
        COMBO["<b>UComboMeterComponent</b><br/>━━━━━━━━━━━━━━━━━━<br/>Tracks consecutive hits<br/>Resets on timer expiry<br/>Multiplies damage/score"]
        
        AGGRO["<b>UAIAggroManager</b><br/>━━━━━━━━━━━━━━━━<br/>Updates threat tables<br/>Influences AI targeting"]
        
        STATS["<b>UAnalyticsSubsystem</b><br/>━━━━━━━━━━━━━━━━━━<br/>Records damage dealt<br/>Tracks damage sources"]
        
        ARMOR["<b>UArmorComponent</b><br/>━━━━━━━━━━━━━━━━<br/>Pre-processes damage<br/>Applies resistances"]
        
        NATIVE_BIND["<b>Binding Pattern</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>HealthComp→OnDamagedNative<br/>  .AddUObject this,<br/>  &UComboMeter::OnDamageDealt"]
    end

    %% LAYER 6 NOTES
    subgraph LAYER6_NOTES["📝 LAYER 6 NOTES ━━ C++ Architecture"]
        direction TB
        L6_SUBSYSTEM["<b>🏗️ Subsystem Pattern Modern</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// Better than singleton managers<br/>UCLASS<br/>class UCombatSubsystem<br/>  : public UGameInstanceSubsystem<br/>{<br/>  // Auto-created with GameInstance<br/>  // Survives level transitions<br/>  // Clean lifecycle management<br/>};<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// Access anywhere:<br/>auto* Combat = GetGameInstance<br/>  →GetSubsystem UCombatSubsystem;"]
        
        L6_ORDER["<b>⚠️ Execution Order Problem</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Multicast delegate order<br/>is NOT guaranteed!<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>If Armor must run BEFORE Combo:<br/>1. Use ordered container<br/>2. Single orchestrator component<br/>3. Chain delegates manually<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// Orchestrator pattern:<br/>void OnDamage float Amt {<br/>  Amt = Armor→Process Amt;<br/>  Combo→Record Amt;<br/>  // Explicit order<br/>}"]
        
        L6_GAS["<b>🆚 GAS Comparison</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>This Architecture:<br/>• Simple, direct, readable<br/>• Good for action games<br/>• You own the code<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>GameplayAbilitySystem:<br/>• More complex, more features<br/>• RPG/MOBA style games<br/>• Built-in prediction/replication<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Consider GAS if you need:<br/>• Cooldowns, costs, tags<br/>• Complex ability interactions"]
        
        L6_SUBSYSTEM ~~~ L6_ORDER ~~~ L6_GAS
    end

    %% ============================================================
    %% LAYER 7: COSMETIC RESPONDERS
    %% ============================================================
    subgraph LAYER7["🎨 LAYER 7: COSMETIC RESPONDERS ━━ BP/Art Layer"]
        direction TB
        
        VFX["<b>BP_BloodVFXSpawner</b><br/>━━━━━━━━━━━━━━━━━━<br/>SpawnSystemAtLocation<br/>Uses ImpactPoint<br/>Scales with damage"]
        
        SFX["<b>BP_HitSoundPlayer</b><br/>━━━━━━━━━━━━━━━━━<br/>Plays sound at location<br/>Based on PhysMaterial"]
        
        SHAKE["<b>BP_CameraShakeManager</b><br/>━━━━━━━━━━━━━━━━━━━━<br/>Player cam shake<br/>Scales with damage"]
        
        DMGNUM["<b>WBP_DamageNumbers</b><br/>━━━━━━━━━━━━━━━━━━<br/>UI widget spawn<br/>World-space position"]
        
        HITREACT["<b>ABP_HitReaction</b><br/>━━━━━━━━━━━━━━━━━━<br/>Hit react montage<br/>Direction-based select"]
        
        BP_BIND["<b>Blueprint Binding</b><br/>━━━━━━━━━━━━━━━━━━━━━<br/>UPROPERTY BlueprintAssignable<br/>enables 'Assign' node"]
    end

    %% LAYER 7 NOTES
    subgraph LAYER7_NOTES["📝 LAYER 7 NOTES ━━ FX & Networking"]
        direction TB
        L7_MULTICAST["<b>🌐 Multicast RPC for FX</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// FX runs on ALL clients<br/>UFUNCTION NetMulticast, Unreliable<br/>void Multicast_PlayHitFX<br/>  FVector Loc, FRotator Rot;<br/><br/>void Multicast_PlayHitFX_Impl<br/>  FVector Loc, FRotator Rot<br/>{<br/>  // Runs everywhere<br/>  UNiagaraFunctionLibrary::<br/>    SpawnSystemAtLocation ...;<br/>  UGameplayStatics::<br/>    PlaySoundAtLocation ...;<br/>}<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Unreliable = OK for cosmetics"]
        
        L7_NIAGARA["<b>✨ Niagara UE5 Pattern</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// Cascade is deprecated!<br/>UNiagaraFunctionLibrary::<br/>  SpawnSystemAtLocation<br/>    GetWorld,<br/>    BloodSplatterSystem,<br/>    ImpactPoint,<br/>    ImpactNormal.Rotation,<br/>    FVector Scale,<br/>    true,  // bAutoDestroy<br/>    true   // bAutoActivate<br/>  ;"]
        
        L7_CONCURRENCY["<b>🔊 Sound Concurrency</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// Prevent sound stacking<br/>USoundConcurrency* Concurrency;<br/><br/>// In asset or code:<br/>MaxCount = 3;<br/>ResolutionRule = StopFarthestThenOldest;<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>Multiple hits won't create<br/>10+ overlapping sounds"]
        
        L7_MULTICAST ~~~ L7_NIAGARA ~~~ L7_CONCURRENCY
    end

    %% ============================================================
    %% MEMORY REFERENCE
    %% ============================================================
    subgraph MEMORY["🧠 MEMORY MANAGEMENT REFERENCE"]
        direction TB
        
        PTR_TYPES["<b>Pointer Types</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>UPROPERTY T*: GC-tracked ✓<br/>TWeakObjectPtr: safe weak ✓<br/>Raw T*: NOT GC-aware ⚠️<br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>if ptr: null check<br/>IsValid ptr: null + pending kill<br/>WeakPtr.IsValid: safe check"]
        
        DEL_SAFETY["<b>Delegate Safety</b><br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>AddUObject stores weak ptr<br/>Auto-removes on destroy<br/>━━━━━━━━━━━━━━━━━━━━━━━<br/>NEVER bind raw ptr ⚠️<br/>NEVER capture raw in lambda ⚠️"]
    end

    %% MEMORY NOTES
    subgraph MEMORY_NOTES["📝 MEMORY NOTES ━━ Pointer Deep Dive"]
        direction TB
        MEM_LAMBDA["<b>🔒 Safe Lambda Capture</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// ❌ DANGEROUS - raw capture<br/>auto Bad = [this] {<br/>  this→DoThing; // may crash!<br/>};<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>// ✅ SAFE - weak capture<br/>TWeakObjectPtr WeakThis this;<br/>auto Good = [WeakThis] {<br/>  if WeakThis.IsValid<br/>    WeakThis→DoThing;<br/>};"]
        
        MEM_DEBUG["<b>🐛 Debug Commands</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━<br/>obj refs ClassName<br/>  Shows reference chains<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>obj list Class=ClassName<br/>  Lists all instances<br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>gc.CollectGarbageEveryFrame 1<br/>  Force GC for testing"]
        
        MEM_LAMBDA ~~~ MEM_DEBUG
    end

    %% ============================================================
    %% CROSS-CUTTING: DEBUGGING
    %% ============================================================
    subgraph DEBUG_SECTION["🐛 DEBUGGING REFERENCE"]
        direction TB
        
        DEBUG_CONSOLE["<b>Console Commands</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>show collision<br/>stat game<br/>stat fps<br/>slomo 0.1<br/>p.VisualizeMovement 1"]
        
        DEBUG_LOG["<b>Logging</b><br/>━━━━━━━━━━━━━━━━━━━━━━━━━<br/>DECLARE_LOG_CATEGORY_EXTERN<br/>  LogCombat, Log, All<br/>━━━━━━━━━━━━━━━━━━━━━<br/>UE_LOG LogCombat, Warning,<br/>  TEXT Hit %s, *Name"]
    end

    %% ============================================================
    %% CONNECTIONS - Main Flow
    %% ============================================================
    LAYER0 ==>|"Montage plays"| LAYER1
    LAYER1 ==>|"Notify called"| DATAFLOW1
    DATAFLOW1 ==>|"OpenWindow"| LAYER2
    LAYER2 ==>|"Broadcast signal"| LAYER3
    LAYER3 ==>|"SweepMulti"| LAYER4
    LAYER4 ==>|"FHitResult array"| LAYER3
    LAYER3 ==>|"ApplyDamage"| LAYER5
    LAYER5 ==>|"OnDamagedNative"| LAYER6
    LAYER5 ==>|"OnDamagedFX"| LAYER7

    %% CONNECTIONS - Notes (dotted)
    LAYER0 -.->|"📝"| LAYER0_NOTES
    LAYER1 -.->|"📝"| LAYER1_NOTES
    DATAFLOW1 -.->|"📝"| DATAFLOW_NOTES
    LAYER2 -.->|"📝"| LAYER2_NOTES
    LAYER3 -.->|"📝"| LAYER3_NOTES
    LAYER4 -.->|"📝"| LAYER4_NOTES
    LAYER5 -.->|"📝"| LAYER5_NOTES
    LAYER6 -.->|"📝"| LAYER6_NOTES
    LAYER7 -.->|"📝"| LAYER7_NOTES
    MEMORY -.->|"📝"| MEMORY_NOTES

    %% ============================================================
    %% STYLES
    %% ============================================================
    classDef layer0 fill:#2d1b4e,stroke:#9b59b6,stroke-width:2px,color:#fff
    classDef layer1 fill:#1a3a5c,stroke:#3498db,stroke-width:2px,color:#fff
    classDef layer2 fill:#4a3000,stroke:#f39c12,stroke-width:3px,color:#fff
    classDef layer3 fill:#1e4d2b,stroke:#27ae60,stroke-width:2px,color:#fff
    classDef layer4 fill:#3d1f1f,stroke:#e74c3c,stroke-width:2px,color:#fff
    classDef layer5 fill:#4a1942,stroke:#e91e8b,stroke-width:2px,color:#fff
    classDef layer6 fill:#0d3d4a,stroke:#00bcd4,stroke-width:3px,color:#fff
    classDef layer7 fill:#2e4a1e,stroke:#8bc34a,stroke-width:3px,color:#fff
    classDef note fill:#3d3d00,stroke:#ffd93d,stroke-width:2px,color:#ffd93d
    classDef dataflow fill:#1a1a2e,stroke:#61dafb,stroke-width:2px,color:#61dafb
    classDef memory fill:#2a1a3a,stroke:#bb86fc,stroke-width:2px,color:#bb86fc
    classDef notes fill:#1a1a1a,stroke:#ff9800,stroke-width:2px,stroke-dasharray:5 5,color:#ff9800
    classDef debug fill:#2a2a00,stroke:#ffd93d,stroke-width:2px,color:#ffd93d

    class LAYER0 layer0
    class LAYER1 layer1
    class LAYER2 layer2
    class LAYER3 layer3
    class LAYER4 layer4
    class LAYER5 layer5
    class LAYER6 layer6
    class LAYER7 layer7
    class DATAFLOW1,RATIONALE note
    class MEMORY memory
    class LAYER0_NOTES,LAYER1_NOTES,LAYER2_NOTES,LAYER3_NOTES,LAYER4_NOTES,LAYER5_NOTES,LAYER6_NOTES,LAYER7_NOTES,DATAFLOW_NOTES,MEMORY_NOTES notes
    class DEBUG_SECTION debug`;

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
