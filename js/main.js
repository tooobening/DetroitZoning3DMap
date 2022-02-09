require([
  "esri/Map",
  "esri/views/MapView",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend",
  "esri/widgets/Home",
  "esri/widgets/Search",
], (Map, MapView, SceneView, FeatureLayer, Legend, Home, Search) => {
  const switchButton = document.getElementById("switch-btn");

  const renderer2d = {
    type: "simple",
    symbol: {
      type: "simple-fill", // autocasts as new SimpleFillSymbol()
      color: [255, 255, 255, 0.5],
      outline: { width: "0.1px" },
    },
  };
  const renderers3d = {
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
    title: "Zoning",
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
  const layerZoningfor2d = new FeatureLayer({
    url: "https://services2.arcgis.com/HsXtOCMp1Nis1Ogr/arcgis/rest/services/Detroit_Zoning/FeatureServer",
    title: "Zoning",
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

  const map2d = new Map({
    basemap: "streets-vector",
    ground: "world-elevation",
    layers: [layerZoningfor2d, getLayerFootprint("2d")],
  });
  const map3d = new Map({
    basemap: "streets-vector",
    ground: "world-elevation",
    layers: [layerZoning, getLayerFootprint("3d")],
  });

  // create 2D view and and set active
  appConfig.mapView = createView(initialViewParams, "2d");
  appConfig.mapView.map = map2d;
  appConfig.activeView = appConfig.mapView;

  // create 3D view, won't initialize until container is set
  initialViewParams.container = null;
  initialViewParams.map = map3d;
  appConfig.sceneView = createView(initialViewParams, "3d");

  // switch the view between 2D and 3D each time the button is clicked
  switchButton.addEventListener("click", () => {
    switchView();
  });

  // convenience function for creating either a 2D or 3D view dependant on the type parameter
  function createView(params, type) {
    let view;
    if (type === "2d") {
      view = new MapView(params); //{
      //   container: "viewDiv", // References the ID of a DOM element
      //   map: map2d, // References a Map instance
      //   center: [-83.045753, 42.331429],
      // });
      return view;
    } else {
      view = new SceneView(params); //{
      //   container: "viewDiv",
      //   map: map3d,
      //   camera: {
      //     position: [-83.045753, 42.308429, 2000],
      //     tilt: 60,
      //     heading: 20,
      //   },
      // });
    }
    return view;
  }
  // Switches the view from 2D to 3D and vice versa
  function switchView() {
    const is3D = appConfig.activeView.type === "3d";
    const activeViewpoint = appConfig.activeView.viewpoint.clone();
    // remove the reference to the container for the previous view
    appConfig.activeView.container = null;
    //reomve view setting of the widgets
    legend.view = null;
    homeWidget.view = null;
    searchWidget.view = null;
    if (is3D) {
      //now is Scene, will switch to map
      // if the input view is a SceneView, set the viewpoint on the
      // mapView instance. Set the container on the mapView and flag
      // it as the active view
      appConfig.mapView.viewpoint = activeViewpoint;
      appConfig.mapView.container = appConfig.container;
      appConfig.activeView = appConfig.mapView;
      switchButton.value = "3D";
      console.log("3d here");
      updateWidgets();
    } else {
      // now is map , will switch to scene
      appConfig.sceneView.viewpoint = activeViewpoint;
      appConfig.sceneView.container = appConfig.container;
      appConfig.activeView = appConfig.sceneView;
      switchButton.value = "2D";
      console.log("2d here");
      updateWidgets();
    }
  }

  const legend = new Legend({
    view: appConfig.activeView,
  });
  const homeWidget = new Home({
    view: appConfig.activeView,
  });
  const searchWidget = new Search({
    view: appConfig.activeView,
  });
  appConfig.activeView.ui.add(legend, "bottom-right");
  appConfig.activeView.ui.add(searchWidget, "top-right");
  appConfig.activeView.ui.add(homeWidget, "top-left");

  function updateWidgets() {
    legend.view = appConfig.activeView;
    homeWidget.view = appConfig.activeView;
    searchWidget.view = appConfig.activeView;
    appConfig.activeView.ui.add(legend, "bottom-right");
    appConfig.activeView.ui.add(searchWidget, "top-right");
    appConfig.activeView.ui.add(homeWidget, "top-left");
  }

  function getLayerFootprint(type) {
    let layerFootprint;
    if (type == "2d") {
      layerFootprint = new FeatureLayer({
        url: "https://services1.arcgis.com/xUx8EjNc6egUPYWh/arcgis/rest/services/Building_Footprints/FeatureServer",
        renderer: renderer2d,
        elevationInfo: {
          mode: "on-the-ground",
        },
        title: "Flat building footprints", //show on legend
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
        renderer: renderers3d,
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
    return layerFootprint;
  }

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
});
