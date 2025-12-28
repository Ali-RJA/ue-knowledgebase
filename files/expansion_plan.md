# Expansion Plan for UE5 C++ Common Pieces

This plan details the expansion of 70+ "Lego Blocks" into full-page, self-contained explanations. Each page will feature:
1. **Detailed Mermaid Diagram**: Visualizing the flow, hierarchy, or logic.
2. **Expanded Code Example**: Significant, production-ready code including header and source where applicable.
3. **Deep Explanation**: Multiple sections covering use cases, safety rules, and technical nuances.

## 1. Macros & Reflection
*   **UCLASS()**: Expand to show common specifiers (`Blueprintable`, `Abstract`, `Config`). Explain the role of Unreal Header Tool (UHT).
*   **UPROPERTY()**: Create a "Specifier Matrix" in the explanation. Expand code to show varied types (Pointers, Structs, Enums).
*   **UFUNCTION()**: Detail `BlueprintPure` vs `BlueprintCallable`. Show `meta=(Keywords="...")` usage.
*   **BlueprintNativeEvent**: Deep dive into the `_Implementation` pattern and how Super calls work between BP/C++.
*   **BlueprintImplementableEvent**: Focus on the C++ to Designer "Slot" pattern.
*   **UENUM()**: Show bitmask enums and `UMETA` display names.
*   **USTRUCT()**: Detail why `GENERATED_BODY()` is required and how to pass by reference in Blueprints.
*   **Meta Tags**: Group `AllowPrivateAccess`, `BindWidget`, `ExposeOnSpawn`, `DisplayName` into a "Meta Power-User" page.

## 2. Lifecycle & World
*   **BeginPlay()**: Explain the exact moment it fires (after components are initialized). Show proper `Super::` usage.
*   **Tick()**: Deep dive into `DeltaTime` and frame-rate independence. Explain `PrimaryActorTick` configuration.
*   **SpawnActor**: Show both standard and `SpawnActorDeferred` patterns. Explain why deferred is critical for initialization.
*   **FTimerHandle**: Show SetTimer, ClearTimer, and PauseTimer. Explain why they are better than Tick.
*   **EndPlay()**: Detail the `EEndPlayReason` enum. Explain cleanup of delegates and timers.
*   **NewObject**: Explain the difference between Actors and UObjects. Detail the `Outer` parameter.
*   **Destroy()**: Explain the Garbage Collection cycle and `AActor::IsPendingKill()`.

## 3. Components & Hierarchy
*   **CreateDefaultSubobject**: Explain the CDO (Class Default Object) and why this only works in the constructor.
*   **FindComponentByClass**: Explain performance considerations (caching).
*   **GetComponentByTag**: Show how to manage tags effectively.
*   **SetupAttachment**: Detail the difference between `SetupAttachment` (constructor) and `AttachToComponent` (runtime).
*   **GetCharacterMovement()**: Deep dive into `UCharacterMovementComponent` properties like `MaxWalkSpeed`, `JumpZVelocity`, and `BrakingDeceleration`.

## 4. Math & Space
*   **FVector Math**: Show common operations: `Length()`, `Normalize()`, `Distance()`, `Direction()`.
*   **InterpTo**: Explain `FInterpTo`, `VInterpTo`, and `RInterpTo`. Show how they create "Juice".
*   **FRotator**: Explain the Pitch/Yaw/Roll coordinate system in Unreal.
*   **Dot Product**: Visual explanation of "is it in front of me?" logic.
*   **Clamp / MapRange**: Show how to map health percentages to UI bar widths.
*   **FindLookAtRotation**: Show how to make an AI face a player smoothly.

## 5. Physics & Collision
*   **LineTrace**: Deep dive into `FHitResult`. Show how to extract hit location, normal, and actor.
*   **Overlap Events**: Explain `AddDynamic` binding and the parameters of the overlap function.
*   **Sweep**: Explain the difference between a point (trace) and a volume (sweep).
*   **Multi-Trace**: Show how to handle multiple results (e.g., piercing bullets).
*   **Collision Profiles**: Explain `Ignore`, `Overlap`, and `Block`. Show how to define custom channels.
*   **AddForce/Impulse**: Detail the difference (Continuous vs Instant). Explain `VelocityChange` flag.

## 6. Delegates & Events
*   **Dynamic Multicast**: The "Observer Pattern". Show how to declare, broadcast, and bind in BP.
*   **AddDynamic**: Explain why the function MUST be a `UFUNCTION`.
*   **Lambdas (TFunction)**: Show how to use them for quick sorting or async callbacks.
*   **Super calls**: Explain why skipping `Super::` in certain functions (like `BeginPlay`) breaks the engine.

## 7. Data & Containers
*   **TSoftObjectPtr**: The "Lazy Loading" pattern. Show how to load assets without hitching.
*   **TArray/TMap/TSet**: Compare performance and use cases (ordering vs lookup speed).
*   **DataTables**: Show how to define the `FTableRowBase` struct and fetch data.
*   **Data Assets**: Explain why `UPrimaryDataAsset` is the gold standard for data-driven design.
*   **Strings**: Final word on `FString` (manipulation), `FName` (keys), and `FText` (UI).

## 8. Framework
*   **Subsystems**: Explain `GameInstance`, `World`, and `LocalPlayer` subsystems.
*   **Authority**: Networking 101. `HasAuthority()` vs `IsLocallyControlled()`.
*   **PlayerController**: Show how to access the HUD, PlayerCameraManager, and Input.
*   **Enhanced Input**: Detail `InputMappingContext` and `InputAction`.

## 9. C++ Mechanics
*   **Casting**: `Cast<T>` vs `static_cast`. Explain safety and performance.
*   **Smart Pointers**: `TObjectPtr` (UE5 standard), `TWeakObjectPtr` (preventing leaks), `TSharedPtr` (non-UObjects).
*   **Interfaces**: `UINTERFACE` vs `IInteractable`. Show the `Execute_` pattern for BP compatibility.
*   **Const Correctness**: Why it matters for optimization and thread safety.
*   **Virtual/Override**: Preventing "Shadowing" and ensuring proper inheritance.
*   **Asserts**: `check()`, `ensure()`, and `verify()`.

## 10. Implementation Plan
1. **Refactor UI**: Update `cpp-common-ue-pieces.html` to include a full-page "Individual Page" view.
2. **Apply Styles**: Ensure Creme/Black theme is applied to all code blocks.
3. **Data Population**: Systematically expand each entry in the `pieces` array using the research above.
4. **Mermaid Refresh**: Upgrade all simple graphs to detailed flowcharts.
