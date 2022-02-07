require([
  "esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
], (Map, MapView, SceneView, FeatureLayer, Legend) => {
  // Create Map
  const map = new Map({
    basemap: "dark-gray-vector",
    ground: "world-elevation",
  });
  const view2d = new MapView({
    map: map, // References a Map instance
    center: [-83.045753, 42.331429],
    container: "viewDiv", // References the ID of a DOM element
  });
  // Create the SceneView
  const view3d = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      position: [-83.045753, 42.331429, 707],
      tilt: 81,
      heading: 50,
    },
  });
  ///switch from 2d to 3d   const switchButton = document.getElementById("switch-btn");

  const appConfig = {
    mapView: null,
    sceneView: null,
    activeView: null,
    container: "viewDiv", // use same container for views
  };

  const initialViewParams = {
    zoom: 12,
    center: [-83.045753, 42.331429],
    container: appConfig.container,
  };

  const renderer2d = {
    type: "simple", // autocasts as new UniqueValueRenderer()
    defaultLabel: "Other",
    defaultSymbol: "#0080FF80",
  };

  const renderer3d = {
    type: "unique-value", // autocasts as new UniqueValueRenderer()
    defaultSymbol: getSymbol("#0080FF80"),
    defaultLabel: "Other",
    visualVariables: [
      {
        type: "size",
        field: "median_hgt",
      },
    ],
  };

  const layerZoning = new FeatureLayer({
    url: "https://services2.arcgis.com/HsXtOCMp1Nis1Ogr/arcgis/rest/services/Detroit_Zoning/FeatureServer",
    title: "Zoning ",
    popupTemplate: {
      // autocasts as new PopupTemplate()
      title: "{ZONING_REV}",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "ZONING_REV",
              label: "Zoning",
            },
            {
              fieldName: "ZDESCR",
              label: "Description",
            },
          ],
        },
      ],
    },
    outFields: ["ZONING_REV", "ZDESCR"],
  });

  // create 2D view and and set active
  appConfig.mapView = createView(initialViewParams, "2d");
  appConfig.mapView.map = map;
  //   addFootprint(map, "2d");
  //   map.add(layerZoning);
  appConfig.activeView = appConfig.mapView;

  // create 3D view, won't initialize until container is set
  initialViewParams.container = null;
  initialViewParams.map = view3d;
  //   addFootprint(view3d, "3d");
  //   view3d.add(layerZoning);
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
      //map
      appConfig.mapView.map = map;
      map.add(layerZoning);
      createFootprint(map, "2d");
      //switch the valeu of the button
      switchButton.value = "3D";
    } else {
      appConfig.sceneView.viewpoint = activeViewpoint;
      appConfig.sceneView.container = appConfig.container;
      appConfig.activeView = appConfig.sceneView;
      //map
      appConfig.sceneView.map = map;
      createFootprint(map, "3d");
      map.add(layerZoning);
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
  ///

  function addFootprint(mymap, typelayer) {
    let layerFootprint;
    if (typelayer === "2d") {
      layerFootprint = new FeatureLayer({
        url: "https://services1.arcgis.com/xUx8EjNc6egUPYWh/arcgis/rest/services/Building_Footprints/FeatureServer",
        renderer: renderer2d,
        elevationInfo: {
          mode: "on-the-ground",
        },
        title: "Extruded building footprints", //show on legend
        popupTemplate: {
          // autocasts as new PopupTemplate()
          title: "Building {building_id}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "median_hgt",
                  label: "Height (ft)",
                },
                {
                  fieldName: "source",
                  label: "Source",
                },
              ],
            },
          ],
          outFields: ["median_hgt", "source"],
        },
      });
    } else {
      layerFootprint = new FeatureLayer({
        url: "https://services1.arcgis.com/xUx8EjNc6egUPYWh/arcgis/rest/services/Building_Footprints/FeatureServer",
        renderer: renderer3d,
        elevationInfo: {
          mode: "on-the-ground",
        },
        title: "Extruded building footprints", //show on legend
        popupTemplate: {
          // autocasts as new PopupTemplate()
          title: "Building {building_id}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "median_hgt",
                  label: "Height (ft)",
                },
                {
                  fieldName: "source",
                  label: "Source",
                },
              ],
            },
          ],
          outFields: ["median_hgt", "source"],
        },
      });
    }
    mymap.add(layerFootprint);
    return;
  }

  /*****************************************************************
   /*  * Create a function that generates symbols for extruded polygons.
   /* *****************************************************************/

  function getSymbol(color) {
    return {
      type: "polygon-3d", // autocasts as new PolygonSymbol3D()
      symbolLayers: [
        {
          type: "extrude", // autocasts as new ExtrudeSymbol3DLayer()
          material: {
            color: color,
          },
          //   edges: {
          //     type: "none",
          //     color: "#999",
          //     size: 0.5,
          //   },
        },
      ],
    };
  }

  const legend = new Legend({
    view: view3d,
  });

  view3d.ui.add(legend, "bottom-right");
});
