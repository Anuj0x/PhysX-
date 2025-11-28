# PhysX++


A high-performance, modern C++20 physics simulation library designed for game development, robotics, and computer graphics applications. Features advanced rigid body dynamics, constraint systems, and soft body simulation with a focus on numerical stability and performance.

**Created by [Anuj0x](https://github.com/Anuj0x)** - Expert in AI/ML, Deep Learning, Reinforcement Learning, Computer Vision, and High-Performance Computing.

## Features

- 🚀 **C++20 Modern Design**: Leveraging concepts, modules, coroutines, and constexpr
- 🧮 **Advanced Rigid Body Dynamics**: Stable integration with multiple solvers (PGS, SI, Feathersone)
- 🔗 **Constraint Systems**: Joints, springs, motors, and custom constraints
- 🌊 **Soft Body Simulation**: Mass-spring systems and finite element methods
- ⚡ **High Performance**: SIMD-optimized, multi-threaded, and GPU acceleration support
- 🎯 **Numerical Stability**: Advanced stabilization techniques and adaptive time stepping
- 🔧 **Modular Architecture**: Clean separation of collision detection, integration, and solving
- 📊 **Real-time Profiling**: Built-in performance monitoring and optimization tools
- 🎮 **Game Development Ready**: Easy integration with popular engines

## Installation

### Prerequisites
- C++20 compatible compiler (GCC 10+, Clang 11+, MSVC 2022+)
- CMake 3.20+
- Optional: CUDA toolkit for GPU acceleration

### Build from Source

```bash
git clone https://github.com/Anuj0x/physx-plus-plus.git
cd physx-plus-plus
mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
cmake --build . --config Release
```

### Integration

```cpp
// Include the main header
#include <physx++/physx.hpp>

// Create physics world
auto world = physx::World::create({
    .gravity = {0, -9.81f, 0},
    .solver = physx::SolverType::ProjectedGaussSeidel,
    .timeStep = 1.0f / 60.0f
});

// Add rigid body
auto body = world->createRigidBody({
    .shape = physx::BoxShape({1.0f, 1.0f, 1.0f}),
    .mass = 1.0f,
    .position = {0, 5, 0}
});

// Simulation loop
while (running) {
    world->step();
    // Render bodies...
}
```

## Quick Start

### Rigid Body Simulation

```cpp
#include <physx++/physx.hpp>

int main() {
    // Initialize physics world
    auto world = physx::World::create();

    // Create ground plane
    auto ground = world->createStaticBody({
        .shape = physx::PlaneShape({0, 1, 0}, 0),
        .material = physx::Material{0.5f, 0.3f, 0.6f}
    });

    // Create falling box
    auto box = world->createRigidBody({
        .shape = physx::BoxShape({1, 1, 1}),
        .mass = 1.0f,
        .position = {0, 10, 0},
        .material = physx::Material{0.8f, 0.4f, 0.2f}
    });

    // Run simulation
    for (int i = 0; i < 600; ++i) {  // 10 seconds at 60 FPS
        world->step();
        auto pos = box->getPosition();
        std::cout << "Box position: " << pos.x << ", " << pos.y << ", " << pos.z << std::endl;
    }

    return 0;
}
```

### Soft Body Simulation

```cpp
// Create soft body from mesh
auto softBody = world->createSoftBody({
    .mesh = loadMesh("cloth.obj"),
    .material = physx::SoftMaterial{
        .youngsModulus = 1e6f,
        .poissonRatio = 0.3f,
        .density = 1000.0f
    },
    .solver = physx::SoftSolver::FEM  // Finite Element Method
});

// Add wind force
softBody->addForce(physx::ForceField{
    .type = physx::ForceType::Wind,
    .direction = {1, 0, 0},
    .strength = 100.0f
});
```

### Constraint Systems

```cpp
// Create joint between two bodies
auto joint = world->createJoint({
    .type = physx::JointType::BallAndSocket,
    .bodyA = body1,
    .bodyB = body2,
    .anchor = {0, 5, 0},
    .limits = physx::JointLimits{
        .coneAngle = physx::toRadians(45.0f)
    }
});

// Add motor to joint
joint->addMotor({
    .type = physx::MotorType::Velocity,
    .axis = {0, 1, 0},
    .targetVelocity = 2.0f,
    .maxTorque = 100.0f
});
```

## API Reference

### Core Classes

#### `World`
Main physics simulation container managing bodies, constraints, and time stepping.

#### `RigidBody`
Represents rigid body objects with mass, velocity, and collision shapes.

#### `SoftBody`
Handles deformable objects using mass-spring or finite element methods.

#### `Constraint`
Base class for joints, springs, and other physical connections.

#### `Shape`
Geometric primitives (box, sphere, capsule, mesh) and compound shapes.

### Solver Options

- **Projected Gauss-Seidel (PGS)**: Fast iterative solver, good for games
- **Successive Over-Relaxation (SOR)**: Improved convergence over PGS
- **Featherstone**: Articulated body algorithm for robotic chains
- **Direct LDLT**: Exact solution for small systems

### Collision Detection

- **Broad Phase**: Sweep and prune, multi-box pruning
- **Narrow Phase**: GJK/EPA, SAT algorithms
- **Contact Generation**: Persistent manifold caching
- **CCD**: Continuous collision detection for fast-moving objects

## Performance Features

### Multi-threading
```cpp
world->setThreadCount(std::thread::hardware_concurrency());
```

### SIMD Acceleration
Automatic vectorization for collision detection and constraint solving.

### GPU Acceleration (Optional)
CUDA-based solvers for large-scale simulations.

### Memory Management
Custom allocators and object pooling for reduced allocation overhead.

## Development

### Build System

```bash
# Debug build
cmake .. -DCMAKE_BUILD_TYPE=Debug

# With GPU support
cmake .. -DPHYSX_ENABLE_CUDA=ON

# With tests
cmake .. -DPHYSX_BUILD_TESTS=ON

# With examples
cmake .. -DPHYSX_BUILD_EXAMPLES=ON
```

### Testing

```bash
ctest --output-on-failure
```

### Benchmarks

```bash
# Run performance benchmarks
./bin/physx_benchmark --scenes=1000_bodies,cloth_simulation
```

## Project Structure

```
physx++/
├── include/physx++/        # Public headers
│   ├── core/               # Core physics classes
│   ├── collision/          # Collision detection
│   ├── constraints/        # Joints and constraints
│   ├── softbody/           # Soft body simulation
│   └── utils/              # Utilities and math
├── src/                    # Implementation
├── examples/               # Example applications
├── tests/                  # Unit and integration tests
├── benchmarks/             # Performance benchmarks
├── docs/                   # Documentation
├── CMakeLists.txt
└── conanfile.txt           # Package management
```

## Examples

### Game Physics Integration

```cpp
class PhysicsComponent {
private:
    std::shared_ptr<physx::RigidBody> body;

public:
    void update(float deltaTime) {
        // Sync with game engine transform
        auto transform = getGameTransform();
        body->setTransform(transform);

        // Apply game forces
        body->addForce(getInputForce());

        // Step physics
        world->step(deltaTime);
    }
};
```

### Robotics Simulation

```cpp
// Create robotic arm with constraints
auto arm = createRoboticArm(world);

// Set joint targets
arm->setJointAngles({
    physx::toRadians(30.0f),
    physx::toRadians(-15.0f),
    physx::toRadians(45.0f)
});

// Compute inverse kinematics
auto solution = physx::solveIK(arm, targetPosition);
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow C++ Core Guidelines
- Use clang-format for code formatting
- Write comprehensive unit tests
- Document public APIs with Doxygen

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Citation

If you use PhysX++ in your research or project, please cite:

```bibtex
@software{physx_plus_plus,
  author = {Anuj0x},
  title = {{PhysX++}: High-Performance C++20 Physics Simulation Library},
  url = {https://github.com/Anuj0x/physx-plus-plus},
  year = {2024}
