/**
 * High quality 3D Character Model for Noam with rigged parts & procedural animation blending
 */
import * as THREE from 'three';
import { PlayerActionState } from '../types';

export class NoamCharacter {
  public group: THREE.Group;
  
  // Body parts
  public torso: THREE.Mesh;
  public head: THREE.Group;
  public leftArm: THREE.Group;
  public rightArm: THREE.Group;
  public leftLeg: THREE.Group;
  public rightLeg: THREE.Group;
  public leftFoot: THREE.Mesh;
  public rightFoot: THREE.Mesh;
  public scarfGroup: THREE.Group;
  public scarfSegments: THREE.Mesh[] = [];
  public soleGlowLeft: THREE.Mesh;
  public soleGlowRight: THREE.Mesh;
  public punchEffect: THREE.Mesh;
  public hoverRing: THREE.Mesh;

  private animTime: number = 0;
  private punchAnimTime: number = 0;

  constructor() {
    this.group = new THREE.Group();

    // Materials with PBR quality
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xffccaa,
      roughness: 0.6,
      metalness: 0.05,
    });

    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x221a14,
      roughness: 0.8,
    });

    const headbandMat = new THREE.MeshStandardMaterial({
      color: 0xe63946,
      roughness: 0.4,
      metalness: 0.2,
    });

    const jerseyMat = new THREE.MeshStandardMaterial({
      color: 0x1d3557,
      roughness: 0.5,
    });

    const shortsMat = new THREE.MeshStandardMaterial({
      color: 0x457b9d,
      roughness: 0.5,
    });

    const shoeMat = new THREE.MeshStandardMaterial({
      color: 0xf1faee,
      roughness: 0.3,
    });

    const shoeAccentMat = new THREE.MeshStandardMaterial({
      color: 0xe63946,
      roughness: 0.3,
    });

    const soleGlowMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      transparent: true,
      opacity: 0.0,
    });

    // Torso (athletic build)
    const torsoGeo = new THREE.BoxGeometry(0.55, 0.65, 0.35);
    this.torso = new THREE.Mesh(torsoGeo, jerseyMat);
    this.torso.position.y = 1.0;
    this.torso.castShadow = true;
    this.group.add(this.torso);

    // Jersey stripe
    const stripeGeo = new THREE.BoxGeometry(0.56, 0.12, 0.36);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffb703 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    this.torso.add(stripe);

    // Head
    this.head = new THREE.Group();
    this.head.position.set(0, 0.5, 0);

    const faceGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const face = new THREE.Mesh(faceGeo, skinMat);
    face.castShadow = true;
    this.head.add(face);

    // Hair
    const hairGeo = new THREE.ConeGeometry(0.28, 0.35, 8);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 0.16, -0.05);
    hair.rotation.x = -0.3;
    this.head.add(hair);

    // Extra hair spikes
    for (let i = 0; i < 4; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.12, 0.25, 6);
      const spike = new THREE.Mesh(spikeGeo, hairMat);
      spike.position.set((i - 1.5) * 0.1, 0.22, (Math.random() - 0.5) * 0.1);
      spike.rotation.z = (i - 1.5) * -0.25;
      this.head.add(spike);
    }

    // Headband
    const bandGeo = new THREE.TorusGeometry(0.25, 0.04, 8, 20);
    const headband = new THREE.Mesh(bandGeo, headbandMat);
    headband.rotation.x = Math.PI / 2;
    headband.position.y = 0.08;
    this.head.add(headband);

    // Expressive stylized anime eyes with glint
    const eyeGeo = new THREE.SphereGeometry(0.048, 12, 12);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e });
    const glintGeo = new THREE.SphereGeometry(0.016, 6, 6);
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(0.09, 0.04, 0.22);
    const leftGlint = new THREE.Mesh(glintGeo, glintMat);
    leftGlint.position.set(0.015, 0.015, 0.04);
    leftEye.add(leftGlint);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(-0.09, 0.04, 0.22);
    const rightGlint = new THREE.Mesh(glintGeo, glintMat);
    rightGlint.position.set(0.015, 0.015, 0.04);
    rightEye.add(rightGlint);

    this.head.add(leftEye, rightEye);

    // Determined runner smile / expression
    const mouthGeo = new THREE.TorusGeometry(0.045, 0.012, 6, 12, Math.PI);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x8b3a3a });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, -0.08, 0.23);
    mouth.rotation.x = Math.PI / 2;
    mouth.rotation.z = Math.PI;
    this.head.add(mouth);

    this.torso.add(this.head);

    // Flowing Scarf / Ribbon that streams backwards when running
    this.scarfGroup = new THREE.Group();
    this.scarfGroup.position.set(0, 0.38, -0.2);
    for (let i = 0; i < 4; i++) {
      const segGeo = new THREE.BoxGeometry(0.16 - i * 0.02, 0.05, 0.25);
      const seg = new THREE.Mesh(segGeo, headbandMat);
      seg.position.set(0, -i * 0.04, -i * 0.22);
      this.scarfGroup.add(seg);
      this.scarfSegments.push(seg);
    }
    this.torso.add(this.scarfGroup);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.07, 0.065, 0.5, 8);
    armGeo.translate(0, -0.25, 0);

    const handGeo = new THREE.SphereGeometry(0.09, 8, 8);

    // Left Arm
    this.leftArm = new THREE.Group();
    this.leftArm.position.set(0.35, 0.25, 0);
    const lArmMesh = new THREE.Mesh(armGeo, skinMat);
    const lHand = new THREE.Mesh(handGeo, headbandMat); // Red gloves
    lHand.position.set(0, -0.5, 0);
    this.leftArm.add(lArmMesh, lHand);
    this.torso.add(this.leftArm);

    // Right Arm
    this.rightArm = new THREE.Group();
    this.rightArm.position.set(-0.35, 0.25, 0);
    const rArmMesh = new THREE.Mesh(armGeo, skinMat);
    const rHand = new THREE.Mesh(handGeo, headbandMat);
    rHand.position.set(0, -0.5, 0);
    this.rightArm.add(rArmMesh, rHand);
    this.torso.add(this.rightArm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.55, 8);
    legGeo.translate(0, -0.275, 0);

    const footGeo = new THREE.BoxGeometry(0.18, 0.12, 0.32);
    const soleGlowGeo = new THREE.BoxGeometry(0.2, 0.04, 0.34);

    // Left Leg
    this.leftLeg = new THREE.Group();
    this.leftLeg.position.set(0.18, -0.32, 0);
    const lLegMesh = new THREE.Mesh(legGeo, shortsMat);
    this.leftFoot = new THREE.Mesh(footGeo, shoeMat);
    this.leftFoot.position.set(0, -0.55, 0.06);

    // Shoe accent stripe
    const lStripe = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.04, 0.2), shoeAccentMat);
    this.leftFoot.add(lStripe);

    this.soleGlowLeft = new THREE.Mesh(soleGlowGeo, soleGlowMat);
    this.soleGlowLeft.position.set(0, -0.05, 0);
    this.leftFoot.add(this.soleGlowLeft);

    this.leftLeg.add(lLegMesh, this.leftFoot);
    this.torso.add(this.leftLeg);

    // Right Leg
    this.rightLeg = new THREE.Group();
    this.rightLeg.position.set(-0.18, -0.32, 0);
    const rLegMesh = new THREE.Mesh(legGeo, shortsMat);
    this.rightFoot = new THREE.Mesh(footGeo, shoeMat);
    this.rightFoot.position.set(0, -0.55, 0.06);

    const rStripe = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.04, 0.2), shoeAccentMat);
    this.rightFoot.add(rStripe);

    this.soleGlowRight = new THREE.Mesh(soleGlowGeo, soleGlowMat);
    this.soleGlowRight.position.set(0, -0.05, 0);
    this.rightFoot.add(this.soleGlowRight);

    this.rightLeg.add(rLegMesh, this.rightFoot);
    this.torso.add(this.rightLeg);

    // Hover Ring (visible during flutter)
    const hoverGeo = new THREE.RingGeometry(0.3, 0.7, 16);
    const hoverMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
    });
    this.hoverRing = new THREE.Mesh(hoverGeo, hoverMat);
    this.hoverRing.rotation.x = Math.PI / 2;
    this.hoverRing.position.y = -0.9;
    this.torso.add(this.hoverRing);

    // Punch Slash Effect Mesh
    const punchSlashGeo = new THREE.TorusGeometry(0.5, 0.08, 8, 16, Math.PI);
    const punchMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
    });
    this.punchEffect = new THREE.Mesh(punchSlashGeo, punchMat);
    this.punchEffect.position.set(0, 0, 0.6);
    this.punchEffect.rotation.x = Math.PI / 2;
    this.torso.add(this.punchEffect);
  }

  public updateAnimation(
    delta: number,
    state: PlayerActionState,
    speed: number,
    maxSpeed: number,
    isGrounded: boolean
  ) {
    this.animTime += delta;
    const speedRatio = Math.min(1.0, speed / maxSpeed);

    // Glowing soles scale with speed
    const glowOpacity = isGrounded && speed > 2 ? Math.min(0.85, (speed / maxSpeed) * 0.9) : 0;
    (this.soleGlowLeft.material as THREE.MeshBasicMaterial).opacity = glowOpacity;
    (this.soleGlowRight.material as THREE.MeshBasicMaterial).opacity = glowOpacity;

    // Flutter ring display
    (this.hoverRing.material as THREE.MeshBasicMaterial).opacity =
      state === 'fluttering' ? 0.6 + Math.sin(this.animTime * 30) * 0.2 : 0;
    if (state === 'fluttering') {
      this.hoverRing.rotation.z += delta * 15;
    }

    // Scarf waving
    const scarfSpeed = Math.max(8, speed * 2);
    this.scarfSegments.forEach((seg, i) => {
      seg.rotation.x = Math.sin(this.animTime * scarfSpeed + i * 0.8) * 0.25 - speedRatio * 0.5;
      seg.rotation.y = Math.cos(this.animTime * (scarfSpeed * 0.6) + i * 0.6) * 0.15;
    });

    // Reset base rotations & limb offsets
    this.torso.rotation.set(0, 0, 0);
    this.head.rotation.set(0, 0, 0);

    if (state === 'punching') {
      // Plays strictly ONCE across 0.28 seconds
      this.punchAnimTime += delta / 0.28;
      const t = Math.min(1.0, this.punchAnimTime);

      // Stylized glowing slash wave
      const arcPower = Math.sin(t * Math.PI);
      (this.punchEffect.material as THREE.MeshBasicMaterial).opacity = Math.max(0, arcPower * 0.95);
      this.punchEffect.scale.set(0.8 + t * 0.9, 0.8 + t * 0.9, 1);
      this.punchEffect.rotation.z = -0.5 + t * 1.6;

      // Snappy forward punch thrust & recovery
      const punchSnap = t < 0.45 ? Math.sin((t / 0.45) * (Math.PI / 2)) : Math.cos(((t - 0.45) / 0.55) * (Math.PI / 2));
      this.rightArm.rotation.x = -Math.PI / 2 - punchSnap * 0.75;
      this.rightArm.rotation.y = punchSnap * 0.25;
      this.leftArm.rotation.x = 0.35;
      this.leftArm.rotation.z = 0.25;
      this.torso.rotation.y = -0.4 + t * 0.55;

      // Keep t capped at 1.0 so it never loops indefinitely!
      return;
    } else {
      this.punchAnimTime = 0;
      (this.punchEffect.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    if (state === 'crouching') {
      this.torso.position.y = 0.55;
      this.leftLeg.rotation.x = -1.2;
      this.rightLeg.rotation.x = -1.2;
      this.leftArm.rotation.x = -0.4;
      this.rightArm.rotation.x = -0.4;
      return;
    } else {
      this.torso.position.y = 1.0;
    }

    if (state === 'backflipping') {
      // Rotation handled externally via player group rotation
      this.leftLeg.rotation.x = -0.4;
      this.rightLeg.rotation.x = -0.4;
      this.leftArm.rotation.x = -2.2;
      this.rightArm.rotation.x = -2.2;
      return;
    }

    if (state === 'groundPounding') {
      this.torso.rotation.x = 0.3;
      this.leftLeg.rotation.x = 0.6;
      this.rightLeg.rotation.x = 0.6;
      this.leftArm.rotation.x = -2.8;
      this.rightArm.rotation.x = -2.8;
      return;
    }

    if (state === 'fluttering') {
      // Rapid flutter kicks like Yoshi / Pac-Man!
      const flutterFreq = 36;
      const legFlutter = Math.sin(this.animTime * flutterFreq) * 0.7;
      this.leftLeg.rotation.x = legFlutter;
      this.rightLeg.rotation.x = -legFlutter;
      this.leftArm.rotation.z = 1.2 + Math.sin(this.animTime * flutterFreq) * 0.2;
      this.rightArm.rotation.z = -1.2 - Math.sin(this.animTime * flutterFreq) * 0.2;
      return;
    }

    if (!isGrounded) {
      if (state === 'tripleJump') {
        // Full somersault acrobatics
        this.leftArm.rotation.x = -1.5;
        this.rightArm.rotation.x = -1.5;
        this.leftLeg.rotation.x = -0.6;
        this.rightLeg.rotation.x = -0.6;
      } else {
        // Air posture
        this.leftLeg.rotation.x = -0.3;
        this.rightLeg.rotation.x = 0.4;
        this.leftArm.rotation.x = -1.2;
        this.rightArm.rotation.x = 0.6;
      }
      return;
    }

    // Grounded: Running or Idle
    if (speed < 0.5) {
      // Idle breathing
      const breath = Math.sin(this.animTime * 3) * 0.05;
      this.torso.position.y = 1.0 + breath;
      this.leftArm.rotation.set(0.1, 0, 0.1);
      this.rightArm.rotation.set(0.1, 0, -0.1);
      this.leftLeg.rotation.set(0, 0, 0.05);
      this.rightLeg.rotation.set(0, 0, -0.05);
    } else {
      // Run / Sprint cycle
      const runFreq = 8 + speedRatio * 16;
      const legAngle = Math.sin(this.animTime * runFreq) * (0.6 + speedRatio * 0.5);

      this.leftLeg.rotation.x = legAngle;
      this.rightLeg.rotation.x = -legAngle;

      this.leftArm.rotation.x = -legAngle * 0.9;
      this.rightArm.rotation.x = legAngle * 0.9;

      // Forward lean increases with speed
      const lean = speedRatio * 0.45;
      this.torso.rotation.x = lean;
      this.head.rotation.x = -lean * 0.7; // Keep gaze forward
    }
  }
}
