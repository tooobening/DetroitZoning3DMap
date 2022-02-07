require([
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/WebMap",
  "esri/WebScene",
], (MapView, SceneView, WebMap, WebScene) => {
  const switchButton = document.getElementById("switch-btn");

  const appConfig = {
    mapView: null,
    sceneView: null,
    activeView: null,
    container: "viewDiv", // use same container for views
  };

  const initialViewParams = {
    zoom: 12,
    center: [-122.43759993450347, 37.772798684981126],
    container: appConfig.container,
  };
  const webmap = new WebMap({
    portalItem: {
      // autocasts as new PortalItem()
      id: "7ee3c8a93f254753a83ac0195757f137",
    },
  });
  const scene = new WebScene({
    portalItem: {
      // autocasts as new PortalItem()
      id: "c8cf26d7acab4e45afcd5e20080983c1",
    },
  });
  // create 2D view and and set active
  appConfig.mapView = createView(initialViewParams, "2d");
  appConfig.mapView.map = webmap;
  appConfig.activeView = appConfig.mapView;

  // create 3D view, won't initialize until container is set
  initialViewParams.container = null;
  initialViewParams.map = scene;
  appConfig.sceneView = createView(initialViewParams, "3d");

  // switch the view between 2D and 3D each time the button is clicked
  switchButton.addEventListener("click", () => {
    switchView();
  });

  // Switches the view from 2D to 3D and vice versa
  function switchView() {
    const is3D = appConfig.activeView.type === "3d";
    const activeViewpoint = appConfig.activeView.viewpoint.clone();

    // remove the reference to the container for the previous view
    appConfig.activeView.container = null;

    if (is3D) {
      // if the input view is a SceneView, set the viewpoint on the
      // mapView instance. Set the container on the mapView and flag
      // it as the active view
      appConfig.mapView.viewpoint = activeViewpoint;
      appConfig.mapView.container = appConfig.container;
      appConfig.activeView = appConfig.mapView;
      switchButton.value = "3D";
    } else {
      appConfig.sceneView.viewpoint = activeViewpoint;
      appConfig.sceneView.container = appConfig.container;
      appConfig.activeView = appConfig.sceneView;
      switchButton.value = "2D";
    }
  }

  // convenience function for creating either a 2D or 3D view dependant on the type parameter
  function createView(params, type) {
    let view;
    if (type === "2d") {
      view = new MapView(params);
      return view;
    } else {
      view = new SceneView(params);
    }
    return view;
  }
});
