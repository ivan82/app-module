var App = function(){
	this.modules = [];
};

App.prototype = {
	module: function(name, element){
		var module;
		var moduleIndex = this.moduleIndex(name);
		if(moduleIndex === -1){
			module = new Module(name, element);
			this.modules.push(module);
		}else{
			module = modules[moduleIndex];
		}
		module.init();
		return module;
	},

	moduleExists: function(moduleName){
		return this.modules(moduleName) !== -1;
	},

	moduleIndex: function(moduleName){
		for (var i = this.modules.length - 1; i >= 0; i--) {
			if(this.modules[i].name === moduleName){
				return i;
			}
		}
		return -1;
	}
};

var Module = function(name, element){
	this.name = name;
	this.element = element;
	this.controllers = [];
	this.includes = [];
};

Module.prototype = {
	init: function(){
		if(!this.element){ this.element = this.findModuleElement(); }
	},

	controller: function(name, func, element, targetElement){
		var controller;
		var controllerIndex = this.controllerIndex(name);
		if(controllerIndex === -1){
			controller = new Controller(name, func, element, targetElement, this);
			this.controllers.push(controller);
		}else{
			controller = this.controllers[controllerIndex];
		}
		controller.init();
		return controller;
	},

	include: function(url, data, post){
		if(Ninja.prototype.isArray(url)){
			for (var i = 0, len = url.length; i < len; i++){
				this.addInclude(url[i], data, post);
			}
		}else{
			this.addInclude(url, data, post);
		}
	},

	addInclude: function(url, data, post){
		var include = new NinjaAjax(url, data);
		include.type = post ? 'POST' : 'GET';
		this.includes.push(include);
		return include;
	},


	loadIncludes: function(){
		for(var i = 0, len = this.includes.length; i < len; i++){
			this.includes[i].send();
		}
	},

	findModuleElement: function(moduleName){
		if(!moduleName){ moduleName = this.name; }
		return Ninja.prototype.findData('module', moduleName, document, true)[0];
	},

	controllerExists: function(controllerName){
		return this.controllerIndex(controllerName) !== -1;
	},

	controllerIndex: function(controllerName){
		for (var i = this.controllers.length - 1; i >= 0; i--) {
			if(this.controllers[i].name === controllerName){
				return i;
			}
		}
		return -1;
	}
};

var Controller = function(name, func, element, targetElement, parentModule){
	this.name = name;
	this.element = element;
	this.targetElement = targetElement;
	this.parentModule = parentModule;
	this.func = func;
	this.scope = {};
};

Controller.prototype = {
	init: function(){
		if(!this.element){ this.element = this.findControllerElement(); }
		if(!this.targetElement){ this.targetElement = this.element; }
		if(this.func){ this.func(this.scope, this.element); }
		var renderedValues = ninjaTemplate.compile(this.scope, this.element.innerHTML);
		this.targetElement.innerHTML = renderedValues;
	},

	findControllerElement: function(controllerName){
		if(!controllerName){ controllerName = this.name; }
		return Ninja.prototype.findData('controller', controllerName, this.parentModule.element, true)[0];
	}
};
