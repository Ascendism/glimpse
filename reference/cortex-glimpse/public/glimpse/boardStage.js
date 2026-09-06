import * as THREE from 'three';
import { createArchiveBoard } from './archiveBoard.js';

export function mountArchiveStage(el) {
  if (!el) return null;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0x07080c, 1);
  renderer.shadowMap.enabled = true;
  el.innerHTML = '';
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080c);
  const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 40);
  camera.position.set(0.05, 0.18, 4.15);
  camera.lookAt(0, 0.08, 0);

  scene.add(new THREE.HemisphereLight(0xffefd0, 0x181410, 1.1));
  const key = new THREE.DirectionalLight(0xffe0a8, 2.2);
  key.position.set(2.2, 3.4, 4.2);
  key.castShadow = true;
  scene.add(key);
  scene.add(new THREE.DirectionalLight(0x88a0ff, 0.35).translateX(-3).translateY(1.4));

  const board = createArchiveBoard({ shadows: true });
  scene.add(board);

  let last = 0;
  let elapsed = 0;
  let running = true;

  function fit() {
    const w = Math.max(1, el.clientWidth || el.parentElement?.clientWidth || 1280);
    const h = Math.max(1, el.clientHeight || el.parentElement?.clientHeight || 720);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function frame(t) {
    if (!running) return;
    const now = t * 0.001;
    const dt = last ? now - last : 0.016;
    last = now;
    elapsed += dt;
    if (board.userData.tick) board.userData.tick(dt, elapsed);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  fit();
  window.addEventListener('resize', fit);
  requestAnimationFrame(frame);

  const api = {
    apply(state) {
      if (board.userData.applyBoard) board.userData.applyBoard(state || {});
    },
    fit,
    board,
    stop() {
      running = false;
    }
  };
  window.__GLIMPSE_BOARD__ = api;
  return api;
}
