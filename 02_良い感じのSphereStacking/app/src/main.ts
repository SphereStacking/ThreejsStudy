import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Pane } from 'tweakpane';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

/**
 * Canvas と シーンの初期設定
 */
const canvas = document.querySelector<HTMLCanvasElement>('#canvas')
// Sizes はイベントリスナーなどで使用するため早めに定義
const sizes = { width: window.innerWidth, height: window.innerHeight }
const scene = new THREE.Scene()

// OrbitControls のターゲット（原点に固定）
const originalTarget = new THREE.Vector3(0, 0, 0)


/* change fullscreen */
window.addEventListener('dblclick', () =>{
  !document.fullscreenElement
    ? canvas!.requestFullscreen()
    : document.exitFullscreen()
})


/**
 * カーソル関連の設定
 */
const cursor = { x: 0, y: 0 }
let lastMouseMoveTime = performance.now()
// マウス移動時にカーソルの位置を更新
window.addEventListener('mousemove', (event) => {
  cursor.x = - (event.clientX / sizes.width - 0.5)
  cursor.y = (event.clientY / sizes.height - 0.5)
  lastMouseMoveTime = performance.now()
})

/**
 * AxesHelper（デバッグ用）
 */
const axesHelper = new THREE.AxesHelper(2)
axesHelper.visible = false
scene.add(axesHelper)

/**
 * Geometry と Material の定義
 */
const material = new THREE.MeshNormalMaterial()
const sphereGeometry = new THREE.SphereGeometry(0.3, 20, 20)
const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
const dodecahedronGeometry = new THREE.DodecahedronGeometry(0.3, 0)
const octahedronGeometry = new THREE.OctahedronGeometry(0.3, 0)
const tetrahedronGeometry = new THREE.TetrahedronGeometry(0.3, 0)

/**
 * ランダムな位置ベクトルを返す関数
 * （原点から exclusionRadius 未満の位置は除外）
 */
const getRandomPosition = () => {
  const exclusionRadius = 3.0 // テキストの周囲を避けるための内半径
  const maxRadius = 7.0       // ランダム配置する全体の外半径

  // 球面座標を用いて、体積が均一になるように乱数を生成
  const theta = 2 * Math.PI * Math.random()             // 0～2πの角度
  const phi = Math.acos(2 * Math.random() - 1)            // 0～πの角度
  // r^3 が均一分布になるよう半径を決定
  const r = Math.cbrt(
    Math.random() * (Math.pow(maxRadius, 3) - Math.pow(exclusionRadius, 3)) +
    Math.pow(exclusionRadius, 3)
  )

  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  )
}

/**
 * オブジェクト群の作成
 */
const objectCount = 20
// スフィアは回転対象外なので個別に管理
const spheres: THREE.Mesh[] = []
// 回転するオブジェクト（ドーナツ、ボックス、十二面体、八面体、四面体）をまとめる配列
const rotatingMeshes: THREE.Mesh[] = []

for (let i = 0; i < objectCount; i++) {
  const scale = Math.random() / 1.2
  const rotationSpeed = { 
    x: (Math.random() - 0.5),
    y: (Math.random() - 0.5),
    z: (Math.random() - 0.5)
  }

  // ドーナツ
  const donut = new THREE.Mesh(donutGeometry, material)
  donut.position.copy(getRandomPosition())
  donut.rotation.x = Math.random() * Math.PI
  donut.rotation.y = Math.random() * Math.PI
  donut.scale.set(scale, scale, scale)
  donut.userData.rotationSpeed = { ...rotationSpeed }

  // ボックス
  const box = new THREE.Mesh(boxGeometry, material)
  box.position.copy(getRandomPosition())
  box.scale.set(scale, scale, scale)
  box.userData.rotationSpeed = { ...rotationSpeed }

  // スフィア（回転対象外）
  const sphere = new THREE.Mesh(sphereGeometry, material)
  sphere.position.copy(getRandomPosition())
  sphere.scale.set(scale, scale, scale)
  spheres.push(sphere)

  // 十二面体
  const dodecahedron = new THREE.Mesh(dodecahedronGeometry, material)
  dodecahedron.position.copy(getRandomPosition())
  dodecahedron.scale.set(scale, scale, scale)
  dodecahedron.userData.rotationSpeed = { ...rotationSpeed }

  // 八面体
  const octahedron = new THREE.Mesh(octahedronGeometry, material)
  octahedron.position.copy(getRandomPosition())
  octahedron.scale.set(scale, scale, scale)
  octahedron.userData.rotationSpeed = { ...rotationSpeed }

  // 四面体
  const tetrahedron = new THREE.Mesh(tetrahedronGeometry, material)
  tetrahedron.position.copy(getRandomPosition())
  tetrahedron.scale.set(scale, scale, scale)
  tetrahedron.userData.rotationSpeed = { ...rotationSpeed }

  // シーンに追加
  scene.add(donut, box, sphere, dodecahedron, octahedron, tetrahedron)

  // 回転するオブジェクトのみをまとめる
  rotatingMeshes.push(donut, box, dodecahedron, octahedron, tetrahedron)
}

/**
 * Text
 */
// フォントを読み込んでテキストを作成
const fontLoader = new FontLoader()
fontLoader.load('/fonts/DotGothic16_Regular.json', (font) => {
  const textGeometry = new TextGeometry('Sphere\nStacking', {
    font: font,
    size: 0.5,
    depth: 0.2,
    curveSegments: 12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 5
  })
  textGeometry.computeBoundingBox()
  console.log(textGeometry.boundingBox)
  textGeometry.center()
  const textMaterial = new THREE.MeshNormalMaterial()
  const textMesh = new THREE.Mesh(textGeometry, textMaterial)
  textMesh.position.set(0, 0, 0) // テキストの位置を設定
  scene.add(textMesh)
})

/**
 * ライトの追加（シーン作成直後に追加）
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(2, 2, 5)
scene.add(directionalLight)

/**
 * Camera の作成
 */
const initCameraPos = new THREE.Vector3(-10, -10, 5)
const finalCameraPos = new THREE.Vector3(0, 0, 5)
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.copy(initCameraPos)
scene.add(camera)

/**
 * OrbitControls の初期設定（初めは無効）
 */
const controls = new OrbitControls(camera, canvas!)
controls.enableDamping = true
controls.enabled = false // 初期はカメラアニメーション中のため無効
controls.target.copy(originalTarget) // ターゲットを原点に固定

/**
 * Renderer の初期設定
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas!
})
renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)

/**
 * ウィンドウリサイズ時の処理
 */
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/** Debug UI の設定 */
const PARAMS = {
  axesHelper: axesHelper.visible
}
const pane = new Pane({
  title: 'Parameters',
  expanded: true
})
pane.addBinding(PARAMS, 'axesHelper').on('change', (event) => {
  axesHelper.visible = event.value
})

/**
 * 背景に + を等間隔で配置するテクスチャ作成
 */
// パターン用キャンバスの生成
const patternCanvas = document.createElement('canvas')
patternCanvas.width = 64  // テクスチャの幅（必要に応じて変更）
patternCanvas.height = 64 // テクスチャの高さ（必要に応じて変更）
const patternContext = patternCanvas.getContext('2d')

if (patternContext) {
  // 画像のスムージングを無効化（描画された文字がはっきり表示される）
  patternContext.imageSmoothingEnabled = false
  // 背景を黒で塗りつぶす
  patternContext.fillStyle = "#000"
  patternContext.fillRect(0, 0, patternCanvas.width, patternCanvas.height)
  // プラス記号を描く（フォントサイズを小さくして調整）
  patternContext.font = "18px sans-serif"
  patternContext.textAlign = "center"
  patternContext.textBaseline = "middle"
  patternContext.fillStyle = "rgba(200, 200, 200, 0.03)"
  patternContext.fillText("+", patternCanvas.width / 2, patternCanvas.height / 2)
}

// キャンバスからテクスチャを作成し、ラッピング設定
const patternTexture = new THREE.CanvasTexture(patternCanvas)
patternTexture.wrapS = THREE.RepeatWrapping
patternTexture.wrapT = THREE.RepeatWrapping
// テクスチャの繰り返し回数を設定（数値で＋同士の間隔を調整）
patternTexture.repeat.set(20, 20)
patternTexture.magFilter = THREE.NearestFilter
patternTexture.minFilter = THREE.NearestFilter
// シーンの背景に設定
scene.background = patternTexture

/**
 * アニメーション関連設定
 */
// カメラアニメーションパラメータ
const cameraAnimationDuration = 3000 // アニメーション継続時間（ミリ秒）
const cameraAnimationStartTime = performance.now()

/**
 * オブジェクトのアニメーション処理（回転）を統一
 */
const objectAnimate = (delta: number) => {
  rotatingMeshes.forEach(mesh => {
    const rs = mesh.userData.rotationSpeed
    mesh.rotation.x += rs.x * delta
    mesh.rotation.y += rs.y * delta
    mesh.rotation.z += rs.z * delta
  })
}

// easeOutBack イージング関数の定義（カメラの初期移動に使用）
const easeOutBack = (x: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/**
 * カメラアニメーションの更新
 */
const cameraAnimate = (now: number) => {
  const elapsed = now - cameraAnimationStartTime;
  const t0 = Math.min(elapsed / cameraAnimationDuration, 1);
  // Idle状態のカメラ揺らぎ処理を適用する関数
  const applyIdleCameraShake = (
    camera: THREE.PerspectiveCamera,
    originalTarget: THREE.Vector3,
    now: number,
    lastMouseMoveTime: number
  ) => {
    const idleThreshold = 3000; // 3秒
    if (now - lastMouseMoveTime > idleThreshold) {
      const idleTime = now - lastMouseMoveTime - idleThreshold;
      // ゆらぎ（角度方向のオフセット、単位：ラジアン）
      const amplitude = 0.001;
      const frequency = 0.0001;
      const offsetTheta = amplitude * Math.sin(idleTime * frequency * Math.PI * -2);
      const offsetPhi   = amplitude * Math.sin(idleTime * frequency * Math.PI * -1.7);

      // 現在のカメラ位置から originalTarget へのベクトルを算出し、spherical 座標に変換
      const v = camera.position.clone().sub(originalTarget);
      const spherical = new THREE.Spherical().setFromVector3(v);
      // 角度にオフセットを加える
      spherical.theta += offsetTheta;
      spherical.phi   += offsetPhi;
      // spherical 座標から新しいカメラ位置を再構築して適用
      const newPos = new THREE.Vector3().setFromSpherical(spherical).add(originalTarget);
      camera.position.copy(newPos);
    }
  }
  if (t0 < 1) {
    // easeOutBack を適用してより躍動感のある移動を実現
    const t = easeOutBack(t0);
    camera.position.lerpVectors(initCameraPos, finalCameraPos, t);
    camera.lookAt(originalTarget);
  } else {
    // アニメーション完了後は OrbitControls による操作を有効化
    controls.enabled = true;
  }

  // マウス移動がない場合にカメラに軽い揺らぎを加える処理（既存の実装）
  if (controls.enabled) {
    applyIdleCameraShake(camera, originalTarget, now, lastMouseMoveTime);
    camera.lookAt(originalTarget);
  }
}

/**
 * メインアニメーションループ
 */
const clock = new THREE.Clock()
const tick = () => {
  const delta = clock.getDelta()
  const now = performance.now()
  cameraAnimate(now)
  controls.update()
  objectAnimate(delta)
  
  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()



