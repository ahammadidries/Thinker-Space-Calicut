# Office avatar

Original procedural model authored for TinkerSpace from the supplied style reference. No third-party models, textures, personal names or API records are embedded.

- `office-avatar.glb`: self-contained glTF 2.0 binary; metres, Y up, +Z forward.
- 4,464 triangles; 19-bone humanoid hierarchy; seven skinned meshes/PBR materials.
- `AvatarShirt` is the only material to clone and recolor per person.
- Clips: `Idle`, `Walk`, `Sit`, `SittingIdle`, `GetUp`.
- Standing hip height: 0.97 m. Sitting hip height: 0.56 m; fits a 0.46 m chair seat.
- `Walk` is in-place; application code translates the root at approximately 0.78 m/s.
- `Sit` and `GetUp` last 1 second and should play once; the others loop.
- Nameplates belong to the application and are not part of this asset.

Use `SkeletonUtils.clone` for each instance and a separate `AnimationMixer`. Geometry and unchanged materials may be shared. The manifest supplies exact counts and material/mesh names. Source and reproducible exporter: `src/avatars/createOfficeAvatar.js` and `tools/export-avatar.mjs` in the project root.

# Space Host

`space-host.glb` is a separate original character informed by the supplied likeness photographs. Stylized geometry retains the reference's short curly black hair, warm brown skin, dark brows, face proportions and light facial hair. No source photographs, names, labels or personal records are embedded. The UI nameplate is created by `SpaceHost.js` at runtime.

- Approximately 1.78 m tall, metres, +Y up, +Z forward; feet on Y = 0.
- 18,424 triangles, 19 bones, 12 named PBR materials, UVs, no texture files.
- Skin includes vertex-tinted stubble; hair has separate `HostHair` and `HostCurl` materials.
- `HostShirt` only controls the button-up shirt/collar/cuffs. Skin, hair, trousers and sneakers do not change with it.
- All nine clips load through `GLTFLoader` and `AnimationMixer`. `Idle` and `Breathing` loop; gestures can use `LoopOnce` with a fade back to `Idle`. The root and feet remain fixed. `TurnLeft`/`TurnRight` are planted-foot upper-body turns.
- Additional clips: `Greeting`, `Talking`, `HeadTurn`, `LookAtVisitor`, `HandGesture`.
- The runtime adds damped, clamped visitor-facing head rotation after mixer updates. No walking, seating or check-in dependency.

```js
import { AnimationMixer } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gltf = await new GLTFLoader().loadAsync('/models/space-host.glb');
scene.add(gltf.scene);
gltf.scene.traverse(mesh => {
  if (mesh.isMesh && mesh.material.name === 'HostShirt') {
    mesh.material.color.set('#203e34');
  }
});
const mixer = new AnimationMixer(gltf.scene);
mixer.clipAction(gltf.animations.find(clip => clip.name === 'Idle')).play();
// Call mixer.update(deltaSeconds) each rendered frame.
```

When cloning the host, clone the shirt material before independently recoloring instances. In this application the single host exposes `setShirtColor(color)`; placement, initial color and the runtime name `Jasim` are editable in `src/config/host-config.js`. Conversational answers and links live in `src/host/host-knowledge.js`. The name stays outside the GLB. The dev console can use `__twin.host.setShirtColor('#203e34')`.

Reproducible source: `src/host/createSpaceHost.js`; export: `node tools/export-host.mjs`. `space-host.manifest.json` records exact mesh, triangle, material and clip counts. Reference photos are appearance guides, not a metric face scan; likeness remains a stylized interpretation.
