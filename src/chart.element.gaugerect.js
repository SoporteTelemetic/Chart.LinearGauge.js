
(function(Chart) {
	
	var helpers = Chart.helpers;

	var globalDefaults = Chart.defaults.global;
	
	Chart.defaults._set('global', {
		elements: {
			gaugerect: {
				backgroundColor: '#0fa',
				borderWidth: 3,
				borderColor: globalDefaults.defaultColor,
				borderCapStyle: 'butt',
				fill: true, // do we fill in the area between the line and its base axis
				width: 6,
				height: 6,
				shape: 'rect',
				pointer: 'bar',
			}
		}
	});

	Chart.elements.Gaugerect = Chart.elements.Rectangle.extend({

		rangeColorImage: null,

        generateImage: function(colors, widths) {
            var width = 0;
            for (var i = 0; i < widths.length; i++)
                width += widths[i];
            var canvas = document.createElement('canvas'),
                c = canvas.getContext('2d');
            //document.body.appendChild(canvas);
            canvas.width = width;
            canvas.height = 1;
            var gw2 = widths[0];
            var grd = c.createLinearGradient(0, 0, width, 0);
            grd.addColorStop(0, colors[0]);
            for (var k = 0; k < colors.length; k++) {
                if ((k + 1) < colors.length) {
                    gw2 += widths[k + 1] / 2;
                    grd.addColorStop(gw2 / width, colors[k + 1]);
                } else grd.addColorStop(1, colors[k]);
                c.closePath();
                if ((k + 1) < colors.length)
                    gw2 += widths[k + 1] / 2;
            }
            c.fillStyle = grd;
            c.fillRect(0, 0, width, 20);
            var imgd = c.getImageData(0, 0, canvas.width, 1);
            return imgd;
        },
        getColor: function(val, scale) {
            var out = 0;
            var rc = 0;
            var gc = 0;
            var bc = 0;
            var ac = 1;
            var opts = this.getMeOptions();
            //	If image data did not filled yet
            if (this.rangeColorImage === null) {
                var colors = [];
                var widths = [];
                //colors.push(startColor);
                helpers.each(opts.colorRanges, function(cl, i) {
                    if (i === 0)
                        widths.push((cl.breakpoint - this._Scale.options.range.startValue) * scale);//this.scaleValue);
                    else
                        widths.push((cl.breakpoint - opts.colorRanges[i - 1].breakpoint) * scale);//this.scaleValue);
                    colors.push(cl.color);

                }, this);
                this.rangeColorImage = this.generateImage(colors, widths);
            }


            var start = this._Scale.options.range.startValue;

            var k = Math.ceil((val - start) * scale);//this.scaleValue);
            rc = this.rangeColorImage.data[k * 4 + 0];
            gc = this.rangeColorImage.data[k * 4 + 1];
            bc = this.rangeColorImage.data[k * 4 + 2];
            ac = this.rangeColorImage.data[k * 4 + 3];

            return 'RGBA(' + rc + ', ' + gc + ', ' + bc + ', ' + ac + ')';
        },

        getMeOptions: function() {
        	var me = this;
        	var i = me._datasetIndex;
        	var opts = me._chart.config.data.datasets[i];
        	return opts;
        },

		draw: function() {
			var me = this;
			var vm = me._view;
			var ctx = me._chart.ctx;
			var opts = me.getMeOptions();
			var horizontal = me._model.horizontal;
			var defaults = me._chart.options.elements.gaugerect;
			
			ctx.save();
			ctx.fillStyle = me._model.backgroundColor;
			if (typeof(opts.colorRanges) == 'object' && opts.colorRanges.length > 0) {
                ctx.fillStyle = me.getColor(me._model.value, me._model.scaleValue);
            }
            
            opts.pointer = opts.pointer ? opts.pointer : defaults.pointer;

            if (typeof opts.img !== 'undefined' && opts.img !== null) {
                var imbuffer = new Image();
                imbuffer.src = opts.img;
                var width = opts.width ? opts.width : defaults.width;
                var height = opts.height ? opts.height : defaults.height;
                if (horizontal) {
                    var x = vm.head - width / 2;
                    var y = vm.y + height / 2;
                } else {
                    var x = vm.x - width / 2;
                    var y = vm.y - height / 2;
                }
                //this.x = x + this.width / 2;
                //this.y = y + this.height / 2;
                //this.rightX = this.leftX + this.width;
                //this.rightY = this.leftY + this.height;
                ctx.beginPath();
                ctx.drawImage(imbuffer, 0, 0, imbuffer.width, imbuffer.height, x, y, width, height);
                ctx.restore();
                return;
            }

            if(typeof opts.pointer === 'undefined' || opts.pointer === 'bar'){
                // Stroke Line
                ctx.beginPath();
                
                ctx.rect(
                    vm.x,
                    vm.y,
                    vm.width,
                    vm.height
                );
                
                ctx.fill();
                ctx.restore();
            }
            
            if (opts.pointer === 'point') {
            	
            	var shape = opts.shape ? opts.shape : defaults.shape;
            	var width = opts.width ? opts.width : defaults.width;
            	var height = opts.height ? opts.height : defaults.height;
            	
                if (shape == 'circle') {
                	
                	if (horizontal) {
                        var x = vm.head;
                    	var y = vm.y;
                    } else {
                        var x = vm.x;
                    	var y = vm.y;
                    }
                	/*
                    this.leftX = x - this.height / 2;
                    this.rightX = x + this.height / 2;
                    this.leftY = y - this.height / 2;
                    this.rightY = y + this.height / 2;
                    ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
                    */
                    
                    var r = width / 2;
                    var sAngle = 0;
                    var eAngle = Math.PI * 2;
                    var counterclockwise = false;
                    ctx.beginPath();
                    ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
                    ctx.fill();
            		ctx.restore();
                }
                if (shape == 'rect') {
                	if (horizontal) {
                        var x = vm.head - width / 2;
                    	var y = vm.y - height / 2;
                    } else {
                        var x = vm.x - width / 2;
                    	var y = vm.y - height / 2;
                    }
                	/*
                    this.x = x + this.width / 2;
                    this.y = y + this.height / 2;
                    this.rightX = this.leftX + this.width;
                    this.rightY = this.leftY + this.height;
                    */
                    
                    ctx.beginPath();
                    ctx.rect(x, y, width, height);
                    ctx.fill();
            		ctx.restore();
                }
                if (shape == 'triangle') {
                	
                    if (horizontal) {
                        var x1 = vm.head,
                            y1 = vm.y + height/2,
                            x2 = x1 - width/2,
                            y2 = y1 - height,
                            x3 = x2 + width,
                            y3 = y2;
                    } else {
                        var x1 = vm.x - width/2 + width,
                            y1 = vm.y,
                            x2 = x1 + width,
                            y2 = y1 - height / 2,
                            x3 = x2,
                            y3 = y2 + height;
                    }
					/*
                    this.x = this.leftX + this.width / 2;
                    this.y = this.leftY + this.height / 2;
                    this.rightX = this.leftX + this.width;
                    this.rightY = this.leftY + this.height;
                    */
					ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineTo(x3, y3);
                    ctx.fill();
            		ctx.restore();
                }
                if (shape == 'inverted-triangle') {
                    
                    if (horizontal) {
                        var x1 = vm.head,
                            y1 = vm.y - height/2,
                            x2 = x1 - width/2,
                            y2 = y1 + height,
                            x3 = x2 + width,
                            y3 = y2;
                    } else {
                        var x1 = vm.x + width/2 + width,
                            y1 = vm.y,
                            x2 = x1 - width,
                            y2 = y1 - height / 2,
                            x3 = x2,
                            y3 = y2 + height;
                    }
					/*
                    this.x = this.leftX + this.width / 2;
                    this.y = this.leftY + this.height / 2;
                    this.rightX = this.leftX + this.width;
                    this.rightY = this.leftY + this.height;
                    */
					ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineTo(x3, y3);
                    ctx.fill();
            		ctx.restore();
                }
                if (shape == 'bowtie') {
                    if (horizontal) {
                        
                        var x1 = vm.head,
                            y1 = vm.y + width,
                            x2 = x1 - height/2,
                            y2 = y1 - width/2,
                            x3 = x2 + height,
                            y3 = y2;

                        var x11 = vm.head,
                            y11 = vm.y + width,
                            x21 = x11 - height/2,
                            y21 = y11 + width/2,
                            x31 = x21 + height,
                            y31 = y21;
                    } else {
                        
                        var x1 = vm.x,
                            y1 = vm.y,
                            x2 = x1 + width/2,
                            y2 = y1 - height / 2,
                            x3 = x2,
                            y3 = y2 + height;

                       	var x11 = vm.x,
                            y11 = vm.y,
                            x21 = x11 - width/2,
                            y21 = y11 - height / 2,
                            x31 = x21,
                            y31 = y21 + height;
                    }
					/*
                    this.x = this.leftX + this.width / 2;
                    this.y = this.leftY + this.height / 2;
                    this.rightX = this.leftX + this.width;
                    this.rightY = this.leftY + this.height;
					*/
					ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineTo(x3, y3);
                    ctx.closePath();
                    ctx.fill();
                    ctx.beginPath();
                    ctx.lineTo(x11, y11);
                    ctx.lineTo(x21, y21);
                    ctx.lineTo(x31, y31);
                    ctx.fill();
            		ctx.restore();
                }
                if (shape == 'diamond') {
                    if (horizontal) {
                        
                        var x1 = vm.head,
                            y1 = vm.y - width/2 + width,
                            x2 = x1 - height/2,
                            y2 = y1 + width/2 + 0.5,
                            x3 = x2 + height,
                            y3 = y2;

                        var x11 = vm.head,
                            y11 = vm.y + width/2 + width,
                            x21 = x11 - height/2,
                            y21 = y11 - width/2,
                            x31 = x21 + height,
                            y31 = y21;
                    } else {
                        
                        var x1 = vm.x - width/2,
                            y1 = vm.y,
                            x2 = x1 + width/2 + 0.5,
                            y2 = y1 - height / 2,
                            x3 = x2,
                            y3 = y2 + height;

                       	var x11 = vm.x + width/2,
                            y11 = vm.y,
                            x21 = x11 - width/2,
                            y21 = y11 - height / 2,
                            x31 = x21,
                            y31 = y21 + height;
                    }
					/*
                    this.x = this.leftX + this.width / 2;
                    this.y = this.leftY + this.height / 2;
                    this.rightX = this.leftX + this.width;
                    this.rightY = this.leftY + this.height;
					*/
					ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.lineTo(x3, y3);
                    ctx.closePath();
                    ctx.fill();
                    ctx.beginPath();
                    ctx.lineTo(x11, y11);
                    ctx.lineTo(x21, y21);
                    ctx.lineTo(x31, y31);
                    ctx.fill();
            		ctx.restore();
                }
            	
            	
            }
			
		},
        
        tooltipPosition: function() {
        	var me = this;
			var vm = this._view;
			return {
				x: vm.x + (me._model.horizontal ? 0 : vm.width/2),
				y: vm.y
			};
		}
        
	});
	
}).call(this, Chart);



