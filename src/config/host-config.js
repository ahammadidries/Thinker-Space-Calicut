import {sceneConfig} from './scene-config.js';

export const hostConfig = {
  modelUrl: `${import.meta.env?.BASE_URL || '/'}models/space-host.glb`,
  position: [1.43,sceneConfig.building.room.floorY,-6.32],
  rotation: -.08,
  shirtColor: '#203e34',
  name: 'Jasim',
  role: 'SPACE HOST',
  prompt: 'Talk to me',
  greetingRadius: 3.2,
  greetingCooldown: 35,
};
