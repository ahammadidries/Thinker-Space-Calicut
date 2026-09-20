export const avatarConfig = {
  enabled: true,
  apiUrl: 'https://app-api.tinkerhub.org/checkin/active?space_id=2',
  modelUrl: `${import.meta.env?.BASE_URL ?? '/'}models/office-avatar.glb`,
  pollIntervalMs: 20_000,
  requestTimeoutMs: 12_000,
  radius: .21,
  walkSpeed: .78,
  navCellSize: .28,
  seatedSeconds: [120,240],
  maxWalkSeconds: 12,
  maxWanderDistance: 3,
  shirtColors: ['#3A7D6A','#4285F4','#E67E22','#8E6BBE','#D65A5A','#2E9E9E','#C58A3A','#6574CD'],
};
