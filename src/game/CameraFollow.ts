/**
 * 3rd-person dynamic camera with speed FOV kick, orbit, and spring smoothing
 */
import * as THREE from 'three';

export class CameraFollow {
  public camera: THREE.PerspectiveCamera;
  public angleX: number = 0.25; // pitch
  public angleY: number = 0;    // yaw
  public distance: number = 8.5;
  public minDistance: number = 4.0;
  public maxDistance: number = 14.0;

  private currentLookTarget: THREE.Vector3 = new THREE.Vector3();
  private currentCamPos: THREE.Vector3 = new THREE.Vector3(0, 5, 10);
  private shakeIntensity: number = 0;

  constructor(fov: number = 60, aspect: number = 1) {
    this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.1, 1000);
  }

  public addShake(intensity: number) {
    this.shakeIntensity = Math.min(2.5, this.shakeIntensity + intensity);
  }

  public update(
    delta: number,
    targetPos: THREE.Vector3,
    speed: number,
    maxSpeed: number,
    rotation: number
  ) {
    // Decay screen shake
    if (this.shakeIntensity > 0) {
      this.shakeIntensity = Math.max(0, this.shakeIntensity - delta * 4.5);
    }

    // Dynamic FOV kick based on speed ratio
    const speedRatio = Math.min(1.0, speed / maxSpeed);
    const targetFOV = 60 + speedRatio * 18; // 60 -> 78 degrees!
    this.camera.fov += (targetFOV - this.camera.fov) * Math.min(1.0, 8 * delta);
    this.camera.updateProjectionMatrix();

    // Pull camera slightly back at top speed
    const dynamicDist = this.distance + speedRatio * 2.5;

    // Smooth target tracking (focus on player torso/head)
    const targetLook = new THREE.Vector3(targetPos.x, targetPos.y + 1.2, targetPos.z);
    this.currentLookTarget.lerp(targetLook, Math.min(1.0, 12 * delta));

    // Calculate ideal camera position based on orbit angles
    const cosX = Math.cos(this.angleX);
    const sinX = Math.sin(this.angleX);
    const cosY = Math.cos(this.angleY);
    const sinY = Math.sin(this.angleY);

    const offsetX = sinY * cosX * dynamicDist;
    const offsetY = sinX * dynamicDist;
    const offsetZ = cosY * cosX * dynamicDist;

    let targetCamX = this.currentLookTarget.x + offsetX;
    let targetCamY = this.currentLookTarget.y + offsetY;
    let targetCamZ = this.currentLookTarget.z + offsetZ;

    // Apply screen shake
    if (this.shakeIntensity > 0.01) {
      const shakeAmount = this.shakeIntensity * 0.35;
      targetCamX += (Math.random() - 0.5) * shakeAmount;
      targetCamY += (Math.random() - 0.5) * shakeAmount;
      targetCamZ += (Math.random() - 0.5) * shakeAmount;
    }

    // Smooth spring position
    this.currentCamPos.lerp(
      new THREE.Vector3(targetCamX, targetCamY, targetCamZ),
      Math.min(1.0, 14 * delta)
    );

    this.camera.position.copy(this.currentCamPos);
    this.camera.lookAt(this.currentLookTarget);
  }

  public handleOrbit(deltaX: number, deltaY: number) {
    this.angleY -= deltaX * 0.005;
    this.angleX = Math.max(-0.2, Math.min(1.2, this.angleX + deltaY * 0.005));
  }
}
