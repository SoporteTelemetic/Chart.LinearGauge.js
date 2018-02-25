
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
        getColor: function(val) {
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
                        widths.push((cl.breakpoint - this._Scale.options.range.startValue) * 1);//this.scaleValue);
                    else
                        widths.push((cl.breakpoint - opts.colorRanges[i - 1].breakpoint) * 1);//this.scaleValue);
                    colors.push(cl.color);

                }, this);
                this.rangeColorImages = this.generateImage(colors, widths);
            }


            var start = this._Scale.options.range.startValue;

            var k = Math.ceil((val - start) * 1);//this.scaleValue);
            rc = this.rangeColorImages.data[k * 4 + 0];
            gc = this.rangeColorImages.data[k * 4 + 1];
            bc = this.rangeColorImages.data[k * 4 + 2];
            ac = this.rangeColorImages.data[k * 4 + 3];

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
			
			ctx.save();
			ctx.fillStyle = me._model.backgroundColor;
			if (typeof(opts.colorRanges) == 'object' && opts.colorRanges.length > 0) {
                ctx.fillStyle = me.getColor(me._model.head);
            }
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



