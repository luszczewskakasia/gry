import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.y = 5;
camera.position.x = 5;
camera.position.z = 5;
camera.lookAt(0, 0, 0);

//renderer
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

//controls
var controls;

controls = new OrbitControls(camera, renderer.domElement)

const distanceToTarget = camera.position.length();
const polarAngle = Math.acos(camera.position.y / distanceToTarget);

controls.minPolarAngle = polarAngle;
controls.maxPolarAngle = polarAngle;


controls.target.set(0, 0, 0);
controls.update();

//lightning
const light = new THREE.AmbientLight( 0x404040,30 );
const pointLight = new THREE.PointLight(0xffffff, 300, 100);
pointLight.position.set(5, 10, 0);
pointLight.castShadow = true;
scene.add(light, pointLight);

//background
const background_geo = new THREE.BoxGeometry(9, 1, 9);
const background_material = new THREE.MeshStandardMaterial({ color: 0xfde456 });
const background_cube = new THREE.Mesh(background_geo, background_material);
background_cube.userData.ground = true;
scene.add(background_cube);

//cube
const c_geometry = new THREE.BoxGeometry( 1, 1, 1 );
const c_material = new THREE.MeshStandardMaterial( { color: 0x4c00b0 } );
const cube = new THREE.Mesh( c_geometry, c_material );
cube.position.set(3,1,-1)
cube.userData.draggable = true;
scene.add( cube );

//sphere
const s_geometry = new THREE.SphereGeometry(1,32,16); 
const s_material = new THREE.MeshStandardMaterial( { color: 0xa000c8} ); 
const sphere = new THREE.Mesh( s_geometry, s_material ); scene.add( sphere );
sphere.position.set(-2,2,3);
scene.add(sphere);



//cylinder
const radiusTop = 1;
const radiusBottom = 1;
const height = 3;
const radialSegments = 64;
const cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);

const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cylinder = new THREE.Mesh(cylinderGeometry, material);
cylinder.position.set(2,2,-3);
cylinder.userData.draggable = true;
cylinder.userData.name = 'cylinder';
scene.add(cylinder);



const raycaster = new THREE.Raycaster();
const click_mouse = new THREE.Vector2();
const move_mouse = new THREE.Vector2();

let draggable = null;
window.addEventListener('click', (event) => {
	if (draggable) {
		draggable.material.emissive.set(0x000000);
		draggable = null;
		return;
	}

    click_mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    click_mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(click_mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject.userData && intersectedObject.userData.draggable) {
            draggable = intersectedObject;
			draggable.material.emissive.set(0xff0000);
        }
    }
});

window.addEventListener('mousemove', event => {
	move_mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	move_mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
	
});

function drag_object() {
	if (draggable) {
		raycaster.setFromCamera(move_mouse, camera);
		const intersects = raycaster.intersectObjects(scene.children);
		
		if (intersects.length > 0) {
			for (let obj of intersects) {
				if (!obj.object.userData.ground) continue;

				draggable.position.x = obj.point.x
				draggable.position.z = obj.point.z

			}
		}
	}
}

var startTime = null;
function bounce(object, starting_position) {
	const animate = (time) => {
		requestAnimationFrame(animate);

		const elapsed = (time - startTime) / 1000;

		object.position.y = starting_position + Math.abs(Math.sin(4 * elapsed));
		
	};
	requestAnimationFrame(animate);
}


function animate() {
	requestAnimationFrame(animate);
	drag_object();
	bounce(sphere, 1)

	renderer.render( scene, camera );

}

animate()