export function GraphUtil() { 
}

//Busca los vértices por el tag xml
GraphUtil.prototype.getElementsByTagName = function(graph, modelName, tag) {
  let ret = [];
  var graphModel = graph.getModel();
  var mainCell = graphModel.getCell(modelName);
  var vertices = graphModel.getChildVertices(mainCell);
  var edges = graphModel.getChildEdges(mainCell);
  let encoder = new mxCodec();

  for (var i = 0; i < vertices.length; i++) {
    var vertice = vertices[i]; 
    let result = encoder.encode(vertice);



    var str=vertice.toString();
    var type = vertice.getAttribute("type");
    if (type == tag) {
      ret.push(vertice);
    }
  }
  return ret;
};

GraphUtil.prototype.getElementById = function(graph, modelName, id) {
  var graphModel = graph.getModel();
  var mainCell = graphModel.getCell(modelName);
  var vertices = graphModel.getChildVertices(mainCell);
  var edges = graphModel.getChildEdges(mainCell);

  for (var i = 0; i < vertices.length; i++) {
    var vertice = vertices[i];
    var vid = vertice.getId();
    if (vid == id) {
      return vertice;
    }
  }
  return null;
} 

GraphUtil.prototype.getElementsByType = function(graph, modelName, elementType) {
  let ret = [];
  var graphModel = graph.getModel();
  var mainCell = graphModel.getCell(modelName);
  var vertices = graphModel.getChildVertices(mainCell);
  var edges = graphModel.getChildEdges(mainCell);

  for (var i = 0; i < vertices.length; i++) {
    var vertice = vertices[i];
    var type = vertice.getAttribute("type");
    if (type == elementType) {
      ret.push(vertice);
    }
  }
  return ret;
}

GraphUtil.prototype.getRelationsFromTypes = function(graph, modelName, sourceTypes, targetTypes) {
  var ret = [];
  var graphModel = graph.getModel();
  var mainCell = graphModel.getCell(modelName);
  var vertices = graphModel.getChildVertices(mainCell);
  var edges = graphModel.getChildEdges(mainCell);
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    var source = edge.source;
    var target = edge.target;
    var sourceType = source.getAttribute("type");
    var targetType = target.getAttribute("type");
    if (sourceTypes.includes(sourceType) && targetTypes.includes(targetType)) {
      ret.push(edge);
    }
  }
  return ret;
}

GraphUtil.prototype.getRelationsFromSource = function(graph, modelName, sourceBase, targetTypes) {
  // var graphModel = graph.getModel();
  // var mainCell = graphModel.getCell(modelName);
  // var vertices = graphModel.getChildVertices(mainCell);
  // var edges = graphModel.getChildEdges(mainCell);
  var edges = sourceBase.edges;
  var ret = [];
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    var source = edge.source;
    var target = edge.target;
    if (source == sourceBase && targetTypes.includes(target.getAttribute("type"))) {
      ret.push(edge);
    }
  }
  return ret;
}

GraphUtil.prototype.getRelationsToTarget = function(graph, modelName, targetBase, sourceTypes) {
  var graphModel = graph.getModel();
  var mainCell = graphModel.getCell(modelName);
  var vertices = graphModel.getChildVertices(mainCell);
  var edges = graphModel.getChildEdges(mainCell);
  var ret = [];
  for (var i = 0; i < edges.length; i++) {
    var edge = edges[i];
    var source = edge.source;
    var target = edge.target;
    if (target == targetBase && sourceTypes.includes(source.getAttribute("type"))) {
      ret.push(edge);
    }
  }
  return ret;
}

GraphUtil.prototype.getAvailableElementName = function(graph, modelName, elementType, name, originalId) {
  let ret = [];
  var graphModel = graph.getModel();
  var mainCell = graphModel.getCell(modelName);
  var vertices = graphModel.getChildVertices(mainCell);
  var edges = graphModel.getChildEdges(mainCell);

  var elements = [];
  for (var i = 0; i < vertices.length; i++) {
    var vertice = vertices[i];
    var type = vertice.getAttribute("type");
    if (type == elementType) {
      elements.push(vertice);
    }
  }

  var tmp = name;
  var exist = false;
  for (var i = 0; i < elements.length; i++) {
    var vertice = elements[i];
    var vlabel = vertice.getAttribute("label");
    if (tmp == vlabel) {
      if (vertice.getId()!=originalId) {
        exist = true;
        break;
      }
    }
  }
  if (!exist) { 
    return tmp;
  }

  var n = 1;
  while (true) {
    var tmp = name + "" + n;
    var exist = false;
    for (var i = 0; i < elements.length; i++) {
      var vertice = elements[i];
      var vlabel = vertice.getAttribute("label");
      if (tmp == vlabel) {
        if (vertice.getId()!=originalId) {
          exist = true;
          break;
        }
      }
    }
    if (exist) {
      n++;
    } else {
      return tmp;
    }
  }
}

GraphUtil.prototype.renameElementByType = function(graph, modelName, element) {
  let type = element.getAttribute("type");
  let subtype = element.getAttribute("subtype");
  let alias = element.getAttribute("alias");
  let labelByType = type;
  if (subtype) {
    labelByType = subtype;
  }
  if (alias) {
    labelByType = alias;
  }
  let label = getAvailableElementName(graph, modelName, type, labelByType, element.getId());
  element.setAttribute('label', label);
  graph.refresh();
}

GraphUtil.prototype.createElement = function(graph,prototype, cell, x, y){
  let onCreationAllowed = true;

  // if(cConstraintsIc != ""){
  //     onCreationAllowed = cConstraintsIc(graph);
  // }

  if(onCreationAllowed){
      graph.stopEditing(false); 
      let vertex = graph.getModel().cloneCell(prototype);
      vertex.geometry.x = x;
      vertex.geometry.y = y;

      let newCells = graph.importCells([vertex], 0, 0, cell);
      graph.setSelectionCells(newCells);

      // //execute if there are clons for the current element
      // if(cClonCells != null){
      //     let type = newCells[0].getAttribute("type");
      //     if(cClonCells[type]){ //clon cell in a new model
      //         graph.getModel().prefix="clon"; //cloned cell contains clon prefix
      //         graph.getModel().nextId=graph.getModel().nextId-1;
      //         let vertex2 = graph.getModel().cloneCell(newCells[0]);
      //         let parent2 = graph.getModel().getCell(cClonCells[type]);
      //         graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, "#DCDCDC", [vertex2]); //different background for a cloned cell
      //         graph.importCells([vertex2], 0, 0, parent2);
      //         graph.getModel().prefix = ""; //restart prefix
      //     }
      // }

      return newCells;
  }

}