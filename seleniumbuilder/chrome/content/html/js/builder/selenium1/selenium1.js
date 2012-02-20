builder.selenium1.StepType = function(name, baseFunction) {
  dump(name);
  dump("      =      ");
  dump(baseFunction);
  this.name = name;
  this.baseFunction = baseFunction;
  try {
    this.params = get_parameters(baseFunction);
  } catch (e) {
    dump(e);
    dump(name);
  }
};

builder.selenium1.StepType.prototype = {
  /** @return The type's name. */
  getName: function() { return this.name; },
  /** @return List of parameter names. */
  getParamNames: function() { return this.params; },
  /** @return Whether the given parameter is a "locator" or "string". */
  getParamType: function(paramName) {
    return paramName.toLowerCase().indexOf("locator") == -1 ? "string" : "locator";
  }
};

/**
 * Given any Javascript first-order-function returns the names of the parameters that it
 * expects.
 *
 * NOTE: This is slightly hacky, but seems to work in opera/ie6/chrome/firefox.
 * It should probably be in some library rather than hidden in here.
 */
function get_parameters(function_object) {
  // Use toString to get the function's definition, e.g "function (a, b) { return a + b; }".
  var definition = function_object.toString();
  // Use a regexp to extract the parameter list: e.g spec[1] now contains "a, v".
  var param_list = /\((.*)\)/.exec(definition);
  // If spec[1] is empty or only composed of spaces, there are no params.
  if (!(param_list && param_list[1].replace(/(^ *| *$)/g, ''))) {
    return [];
  }

  // Trim argument names.
  var params = param_list[1].split(",");
  var output = [];
  for (var i = 0; i < params.length; i++) {
    output.push(params[i].replace(/(^ *| *$)/g, ''));
  }

  return output;
}

builder.selenium1.stepTypes = {};
builder.selenium1.categories = [];

// Now mangle this into the stepTypes and categories structures.
for (var catIndex = 0; catIndex < builder.selenium1.__methodRegistry.length; catIndex++) {
  var reg_cat = builder.selenium1.__methodRegistry[catIndex];
  for (var subCatIndex = 0; subCatIndex < reg_cat.categories.length; subCatIndex++) {
    var reg_subcat = reg_cat.categories[subCatIndex];
    var catcat = [reg_subcat.name, []];
    builder.selenium1.categories.push(catcat);
    for (var methodIndex = 0; methodIndex < reg_subcat.contents.length; methodIndex++) {
      var baseName = reg_subcat.contents[methodIndex];
      var variants = [ function(n) { return n; } ];
      if (reg_cat.variants) {
        variants = reg_cat.variants;
      }
      for (var v = 0; v < variants.length; v++) {
        var variant = variants[v];
        var step = new builder.selenium1.StepType(variant(baseName), Selenium.prototype[baseName]);
        builder.selenium1.stepTypes[baseName] = step;
        catcat[1].push(step);
      }
    }
  }
}