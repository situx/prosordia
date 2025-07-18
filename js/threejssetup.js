
function toggleFullScreen2(){
    toggleFullScreen("threejs",true)
}

function toggleFullScreen(elementid,threejs=false) {
  if (!document.fullscreenElement) {
    document.getElementById(elementid).requestFullscreen();
    if(threejs){
        var elem = document.getElementById(elementid);
        var sceneWidth = window.innerWidth;
        var sceneHeight = elem.offsetHeight;
        camera.aspect = sceneWidth / sceneHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( sceneWidth, sceneHeight );
    }
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

function addRotationControls(box,geometryF,objects){
    geometryF.close();

    const rotationFolder = geometryF.addFolder("Rotation");
    rotationFolder.add(objects.rotation, 'x', 0, Math.PI).name("X").onChange(
    function(){
        yourVar = this.getValue();
        scene.traverse(function(obj){
            if(obj.type === 'Mesh'){
                obj.rotation.x = yourVar;
            }});
    });
    rotationFolder.add(objects.rotation, 'y', 0, Math.PI).name("Y").onChange(
    function(){
        yourVar = this.getValue();
        scene.traverse(function(obj){
            if(obj.type === 'Mesh'){
                obj.rotation.y = yourVar;
            }});
    });
    rotationFolder.add(objects.rotation, 'z', 0, Math.PI).name("Z").onChange(
    function(){
        yourVar = this.getValue();
        scene.traverse(function(obj){
            if(obj.type === 'Mesh'){
                obj.rotation.z = yourVar;
            }});
    });

    const scaleFolder = geometryF.addFolder("Scale");
    scaleFolder.add(objects.scale, 'x', 0, 2).name("X").onChange(
    function(){
        yourVar = this.getValue();
        scene.traverse(function(obj){
            if(obj.type === 'Mesh'){
                obj.scale.x = yourVar;
            }});
    });
    scaleFolder.add(objects.scale, 'y', 0, 2).name("Y").onChange(
    function(){
        yourVar = this.getValue();
        scene.traverse(function(obj){
            if(obj.type === 'Mesh'){
                obj.scale.y = yourVar;
            }});
    });
    scaleFolder.add(objects.scale, 'z', 0, 2).name("Z").onChange(
    function(){
        yourVar = this.getValue();
        scene.traverse(function(obj){
            if(obj.type === 'Mesh'){
                obj.scale.z = yourVar;
            }});
    });
}

function fitCameraToSelection(camera, controls, selection, fitOffset = 1.2) {
  size = new THREE.Vector3();
  center = new THREE.Vector3();
  box = new THREE.Box3();
  box.makeEmpty();
  for(const object of selection) {
    box.expandByObject(object);
  }

  box.getSize(size);
  box.getCenter(center );

  const maxSize = Math.max(size.x, size.y, size.z);
  const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
  const fitWidthDistance = fitHeightDistance / camera.aspect;
  const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

  const direction = controls.target.clone()
    .sub(camera.position)
    .normalize()
    .multiplyScalar(distance);

  controls.maxDistance = distance * 10;
  controls.target.copy(center);

  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();

  camera.position.copy(controls.target).sub(direction);

  controls.update();
}

let camera, scene, renderer,controls,axesHelper,box,center,size;

function initThreeJS(domelement,url){
	console.log("Loading: "+url)
	const objects=new THREE.Group();
	height=500
    width=480
	scene = new THREE.Scene();
	const gui = new lil.GUI({autoPlace: false})
	//gui.domElement.id="gui"
    $("#threejsnav").append($(gui.domElement))
	const geometryFolder = gui.addFolder("Mesh");
	geometryFolder.open();
	const lightingFolder = geometryFolder.addFolder("Lighting");
	const geometryF = geometryFolder.addFolder("Geometry");
	geometryF.open();
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( width, height);
	document.getElementById(domelement).appendChild( renderer.domElement );
	var loader = new THREE.PLYLoader();
	loader.load(url, function(object){
		const material = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			flatShading: true,
			//vertexColors: THREE.VertexColors,
			wireframe: false
		});
		const mesh = new THREE.Mesh(object, material);
		objects.add(mesh);
		scene.add(objects);
		addRotationControls(object,geometryF,objects)
		if(objects.children.length>0){
			camera.lookAt( objects.children[0].position );
		}
		fitCameraToSelection(camera, controls, objects.children)
	});
	camera = new THREE.PerspectiveCamera(90,width / height, 0.1, 2000 );
    scene.add(new THREE.AmbientLight(0x222222));
    var light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(20, 20, 0);
    scene.add(light);
	lightingFolder.add(light.position, "x").min(-5).max(5).step(0.01).name("X Position")
	lightingFolder.add(light.position, "y").min(-5).max(5).step(0.01).name("Y Position")
	lightingFolder.add(light.position, "z").min(-5).max(5).step(0.01).name("Z Position")
	axesHelper = new THREE.AxesHelper( Math.max(1000, 1000, 1000) );
    scene.add( axesHelper );
	controls = new THREE.OrbitControls( camera, renderer.domElement );
    //controls.target.set( centervec.x,centervec.y,centervec.z );
    controls.target.set( 0,0,0 );
    camera.position.x= 0
    camera.position.y= 0
    camera.position.z = 150;
    controls.maxDistance= Math.max(1000, 1000, 1000)
    controls.update();
	const updateCamera = () => {
		camera.updateProjectionMatrix();
	}
	const cameraFolder = geometryFolder.addFolder("Camera");
	cameraFolder.add(camera, 'fov', 1, 180).name('Zoom').onChange(updateCamera);
    cameraFolder.add(camera.position, 'x').min(-500).max(500).step(5).name("X Position").onChange(updateCamera);
    cameraFolder.add(camera.position, 'y').min(-500).max(500).step(5).name("Y Position").onChange(updateCamera);
    cameraFolder.add(camera.position, 'z').min(-500).max(500).step(5).name("Z Position").onChange(updateCamera);
    gui.add(objects, 'visible').name('Meshes')
    //gui.add(annotations, 'visible').name('Annotations')
    gui.add(axesHelper, 'visible').name('Axis Helper')
    gui.add({"FullScreen":toggleFullScreen2}, 'FullScreen')
    document.addEventListener("fullscreenchange",function(){
        if(document.fullscreenElement){
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize( width, height );
        }
    })
	animate()
}

function animate() {
    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
}