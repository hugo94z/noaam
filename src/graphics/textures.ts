/**
 * Procedural PBR canvas texture generators for realistic rendering in Three.js
 */
import * as THREE from 'three';

export function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Rich meadow base with natural variation
  ctx.fillStyle = '#497e29';
  ctx.fillRect(0, 0, 512, 512);

  // Micro-variation layers
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = Math.random() * 4 + 1;
    const hue = Math.random() > 0.6 ? '#5da132' : Math.random() > 0.3 ? '#3d6c20' : '#6bb83b';
    ctx.fillStyle = hue;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Realistic grass blades
  ctx.strokeStyle = '#6cb736';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 2500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const len = Math.random() * 8 + 4;
    const angle = (Math.random() - 0.5) * 0.8 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

export function createSandTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#d9b46f';
  ctx.fillRect(0, 0, 512, 512);

  // Wind ripples
  ctx.strokeStyle = '#cba05a';
  ctx.lineWidth = 14;
  for (let y = 0; y < 512; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 16) {
      const offset = Math.sin(x * 0.05 + y) * 6;
      ctx.lineTo(x, y + offset);
    }
    ctx.stroke();
  }

  // Grain speckles
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? '#ecd59b' : '#b88d44';
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

export function createSnowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e8f0fa';
  ctx.fillRect(0, 0, 512, 512);

  // Soft crystalline shadow variations
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const rad = Math.random() * 80 + 20;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, 'rgba(215, 230, 250, 0.4)');
    grad.addColorStop(1, 'rgba(235, 245, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ice crystal sparkles
  for (let i = 0; i < 2500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.8 ? '#ffffff' : '#cce0f5';
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

export function createRockTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4a4d52';
  ctx.fillRect(0, 0, 512, 512);

  // Strata and cracks
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const w = Math.random() * 100 + 40;
    const h = Math.random() * 20 + 8;
    ctx.fillStyle = Math.random() > 0.5 ? '#35373b' : '#61656b';
    ctx.fillRect(x, y, w, h);
  }

  ctx.strokeStyle = '#222326';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 80; i++) {
    let x = Math.random() * 512;
    let y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 0; j < 6; j++) {
      x += (Math.random() - 0.5) * 40;
      y += (Math.random() - 0.2) * 30;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 8);
  return texture;
}

export function createVolcanicLavaTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark scorched basalt crust
  ctx.fillStyle = '#1c1514';
  ctx.fillRect(0, 0, 512, 512);

  // Fiery fissures
  ctx.strokeStyle = '#ff3700';
  ctx.lineWidth = 6;
  ctx.shadowColor = '#ff8800';
  ctx.shadowBlur = 12;

  for (let i = 0; i < 18; i++) {
    let x = Math.random() * 512;
    let y = 0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    while (y < 512) {
      x += (Math.random() - 0.5) * 60;
      y += Math.random() * 40 + 20;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Molten hot spots
  ctx.shadowBlur = 0;
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const rad = Math.random() * 25 + 5;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, rad);
    grad.addColorStop(0, '#ffff55');
    grad.addColorStop(0.4, '#ff5500');
    grad.addColorStop(1, 'rgba(30,15,10,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

export function createFinishPlateEmblemTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Outer rim: metallic steel
  ctx.fillStyle = '#e63946';
  ctx.fillRect(0, 0, 512, 512);

  // Concentric rings
  ctx.fillStyle = '#ff4d6d';
  ctx.beginPath();
  ctx.arc(256, 256, 230, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff0f3';
  ctx.beginPath();
  ctx.arc(256, 256, 180, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#c9184a';
  ctx.beginPath();
  ctx.arc(256, 256, 160, 0, Math.PI * 2);
  ctx.fill();

  // Star / Speeder emblem in center
  ctx.fillStyle = '#ffb703';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.beginPath();
  const spikes = 5;
  const outerRadius = 110;
  const innerRadius = 50;
  let rot = (Math.PI / 2) * 3;
  let x = 256;
  let y = 256;
  const step = Math.PI / spikes;

  ctx.moveTo(256, 256 - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = 256 + Math.cos(rot) * outerRadius;
    y = 256 + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = 256 + Math.cos(rot) * innerRadius;
    y = 256 + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(256, 256 - outerRadius);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Speed wings
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FINISH', 256, 420);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
