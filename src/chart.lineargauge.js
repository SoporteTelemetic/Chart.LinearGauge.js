(function(Chart) {
	"use strict";
	var helpers = Chart.helpers;

	var defaultConfig = {
		position: 'chartArea',
		fullWidth: true,
		display: true,
		range: {
            startValue: -100,
            endValue: 500
        },
        responsive: true,
        font: {
        	fontName: 'Arial',
        	fontSize: 12
        },
        axisWidth: 6,
        axisColor: '#00f',
		ticks: {
			padding: 5,
			callback: function(tick) {
				return tick.tick.toString();
			}
		},
		padding: {
            top: 10,
            bottom: 10,
            left: 0,
            right: 0
        },
	};

	function parseLineHeight(options) {
		return helpers.options.toLineHeight(
			helpers.valueOrDefault(options.lineHeight, 1.2),
			helpers.valueOrDefault(options.fontSize, defaultConfig.font.fontSize));
	}

	var LinearGaugeScale = Chart.Scale.extend({
		
        textDimention: function(val) {
            var width = 0;
            var height = this.options.font.fontSize;
            var str = val + "";
            width = (height / 1.7) * str.length;
            if(val.substr(0, 1) === '-') width -= height/3.5;
            return {
                width: width,
                height: height
            };
        },
        setDimensions: function() {
			this.height = this.maxHeight;
			this.width = this.maxWidth;
			this.xCenter = this.left + Math.round(this.width / 2);
			this.yCenter = this.top + Math.round(this.height / 2);

			this.paddingLeft = 0;
			this.paddingTop = 0;
			this.paddingRight = 0;
			this.paddingBottom = 0;
		},
		labelsFromTicks: function(ticks) {
			var labels = [];
			var i, ilen;

			for (i = 0, ilen = ticks.length; i < ilen; ++i) {
				labels.push(ticks[i].label);
			}

			return labels;
		},
		buildTicks: function() {
			
			var me = this;
			var opts = me.options;
			var tickOpts = opts.ticks;
			var ticks = [];

			//	Prepare values for ticks
            //	Major ticks
            if (typeof(opts.ticks.majorTicks) == 'object' && opts.ticks.majorTicks !== null && opts.ticks.majorTicks.interval > 0) {
                var majTicks = [];
                if (typeof opts.ticks.majorTicks.customValues !== 'undefined' && 
                	typeof opts.ticks.majorTicks.customValues.length !== 'undefined' &&
                	opts.ticks.majorTicks.customValues.length > 0) {
                    majTicks = opts.ticks.majorTicks.customValues;
                } else {
                    var interval = opts.ticks.majorTicks.interval;
                    var numOfMajor = (opts.range.endValue - opts.range.startValue) / interval;
                    for (var i = 0; i < numOfMajor - 1; i++) {
                        majTicks.push(opts.range.startValue + (interval * (i + 1)));
                    }
                }
                this.majTicks = majTicks;
                for(var i in majTicks) ticks.push({type: 'major', tick: majTicks[i]});

                //	Setup default settings
            	tickOpts.majorTicks.interval = tickOpts.majorTicks.interval || 100;
            	tickOpts.majorTicks.customValues = tickOpts.majorTicks.customValues || [];
            	tickOpts.majorTicks.width = tickOpts.majorTicks.width || 6;
            	tickOpts.majorTicks.height = tickOpts.majorTicks.height || 1;
            	tickOpts.majorTicks.offset = tickOpts.majorTicks.offset || 0;
            	tickOpts.majorTicks.color = tickOpts.majorTicks.color || '#fff';

            }

            //	Minor ticks
            if (typeof(opts.ticks.minorTicks) == 'object' && opts.ticks.minorTicks !== null && opts.ticks.minorTicks.interval > 0) {
                var minTicks = [];
                if (typeof opts.ticks.minorTicks.customValues !== 'undefined' && 
                	typeof opts.ticks.minorTicks.customValues.length !== 'undefined' &&
                	opts.ticks.minorTicks.customValues.length > 0) {
                    minTicks = opts.ticks.minorTicks.customValues;
                } else {
                    var interval = opts.ticks.minorTicks.interval;
                    var numOfMinor = (opts.range.endValue - opts.range.startValue) / interval;
                    for (var i = 0; i < numOfMinor - 1; i++) {
                        minTicks.push(opts.range.startValue + (interval * (i + 1)));
                    }
                }
                this.minTicks = minTicks;
                for(var i in minTicks) ticks.push({type: 'minor', tick: minTicks[i]});

                //	Setup default settings
            	tickOpts.minorTicks.interval = tickOpts.minorTicks.interval || 50;
            	tickOpts.minorTicks.customValues = tickOpts.minorTicks.customValues || [];
            	tickOpts.minorTicks.width = tickOpts.minorTicks.width || 4;
            	tickOpts.minorTicks.height = tickOpts.minorTicks.height || 1;
            	tickOpts.minorTicks.offset = tickOpts.minorTicks.offset || -2;
            	tickOpts.minorTicks.color = tickOpts.minorTicks.color || '#fff';
            	
            }

        	return ticks;
		},
		convertTicksToLabels: function(ticks) {
			
			var me = this;
			var opts = me.options;
			var scaleLabelOpts = opts.scaleLabel;

			//	Labels of ticks
			var labelVals = [];
			if(typeof(scaleLabelOpts) == 'object' && scaleLabelOpts !== null && scaleLabelOpts.interval > 0){
				
				if(scaleLabelOpts.customValues.length > 0){
					labelVals = scaleLabelOpts.customValues;
				}
				else{
					var interval = scaleLabelOpts.interval;
					var numOfLabels = ((opts.range.endValue - opts.range.startValue)/interval) + 1;
					for(var i=0; i<numOfLabels; i++){
						labelVals.push(opts.range.startValue + (interval*i));
					}
				}
				this.labelVals = labelVals;
			}

			return labelVals;
		},
		calculateTickRotation: helpers.noop,
		fit: function() {
			var me = this;
			// Reset
			var minSize = me.minSize = {
				width: 0,
				height: 0
			};

			var labels = me.labelsFromTicks(me._ticks);

			var opts = me.options;
			var tickOpts = opts.ticks;
			var scaleLabelOpts = opts.scaleLabel;
			var gridLineOpts = opts.gridLines;
			var display = opts.display;
			var isHorizontal = me.isHorizontal();

			var tickFont = opts.font.fontName;
			var tickMarkLength = opts.gridLines.tickMarkLength;

			//	Horizontal orientation
            if (isHorizontal) {
                this.scalePoint = function(val) {
                    var displayW = this.width - opts.padding.left - opts.padding.right;
                    var rangeH = opts.range.endValue - opts.range.startValue;
                    var factor = displayW / rangeH;
                    return Math.round((val * factor) + opts.padding.left - (opts.range.startValue * factor));
                };
                me.yCenter = this.height / 2; //	center of chart located at the center of canvas
            } else {
                this.scalePoint = function(val) {
                    var displayH = this.height - opts.padding.top - opts.padding.bottom;
                    var rangeH = opts.range.endValue - opts.range.startValue;
                    var factor = displayH / rangeH;
                    return Math.round(this.height - (val * factor - (opts.range.startValue * factor)) - opts.padding.bottom);
                };
                me.xCenter = this.width / 2; //	center of chart located at the center of canvas
            }

            // Width
			if (isHorizontal) {
				// subtract the margins to line up with the chartArea if we are a full width scale
				minSize.width = me.isFullWidth() ? me.maxWidth - me.margins.left - me.margins.right : me.maxWidth;
			} else {
				minSize.width = display && gridLineOpts.drawTicks ? tickMarkLength : 0;
			}

			// height
			if (isHorizontal) {
				minSize.height = display && gridLineOpts.drawTicks ? tickMarkLength : 0;
			} else {
				minSize.height = me.maxHeight; // fill all the height
			}

			// Are we showing a title for the scale?
			if (scaleLabelOpts.display && display) {
				var scaleLabelLineHeight = parseLineHeight(scaleLabelOpts);
				var scaleLabelPadding = helpers.options.toPadding(scaleLabelOpts.padding);
				var deltaHeight = scaleLabelLineHeight + scaleLabelPadding.height;

				if (isHorizontal) {
					minSize.height += deltaHeight;
				} else {
					minSize.width += deltaHeight;
				}
			}

			// Don't bother fitting the ticks if we are not showing them
			if (tickOpts.display && display) {
				var largestTextWidth = helpers.longestText(me.ctx, tickFont.font, labels, me.longestTextCache);
				var tallestLabelHeightInLines = helpers.numberOfLabelLines(labels);
				var lineSpace = opts.font.fontSize * 0.5;
				var tickPadding = me.options.ticks.padding;

				if (isHorizontal) {
					// A horizontal axis is more constrained by the height.
					me.longestLabelWidth = largestTextWidth;

					var angleRadians = helpers.toRadians(me.labelRotation);
					var cosRotation = Math.cos(angleRadians);
					var sinRotation = Math.sin(angleRadians);

					// TODO - improve this calculation
					var labelHeight = (sinRotation * largestTextWidth)
						+ (tickFont.size * tallestLabelHeightInLines)
						+ (lineSpace * (tallestLabelHeightInLines - 1))
						+ lineSpace; // padding

					minSize.height = Math.min(me.maxHeight, minSize.height + labelHeight + tickPadding);

					me.ctx.font = tickFont.font;
					var firstLabelWidth = computeTextSize(me.ctx, labels[0], tickFont.font);
					var lastLabelWidth = computeTextSize(me.ctx, labels[labels.length - 1], tickFont.font);

					// Ensure that our ticks are always inside the canvas. When rotated, ticks are right aligned
					// which means that the right padding is dominated by the font height
					if (me.labelRotation !== 0) {
						me.paddingLeft = opts.position === 'bottom' ? (cosRotation * firstLabelWidth) + 3 : (cosRotation * lineSpace) + 3; // add 3 px to move away from canvas edges
						me.paddingRight = opts.position === 'bottom' ? (cosRotation * lineSpace) + 3 : (cosRotation * lastLabelWidth) + 3;
					} else {
						me.paddingLeft = firstLabelWidth / 2 + 3; // add 3 px to move away from canvas edges
						me.paddingRight = lastLabelWidth / 2 + 3;
					}
				} else {
					// A vertical axis is more constrained by the width. Labels are the
					// dominant factor here, so get that length first and account for padding
					if (tickOpts.mirror) {
						largestTextWidth = 0;
					} else {
						// use lineSpace for consistency with horizontal axis
						// tickPadding is not implemented for horizontal
						largestTextWidth += tickPadding + lineSpace;
					}

					minSize.width = Math.min(me.maxWidth, minSize.width + largestTextWidth);

					me.paddingTop = tickFont.size / 2;
					me.paddingBottom = tickFont.size / 2;
				}
			}

            me.handleMargins();

			me.width = minSize.width;
			me.height = minSize.height;
		}, 
		draw: function() {
			var me = this;
            var ctx = this.ctx;
            var isHorizontal = this.isHorizontal();
            var opts = this.options;
            var tickOpts = opts.ticks;
            ctx.textBaseline = "alphabetic";
            ctx.textAlign = "start";

            //	Horizontal orientation
            if (isHorizontal) {
                //	Draw scale background
                ctx.beginPath();
                ctx.fillStyle = this.axisColor;
                ctx.rect(this.padding.left, this.yCenter - this.axisWidth / 2,
                    this.width - this.padding.left - this.padding.right, this.axisWidth);
                ctx.fill();
                ctx.closePath();

                //	Draw scale color ranges
                if (typeof(this.scaleColorRanges) == 'object' && this.scaleColorRanges.length > 0) {
                    helpers.each(this.scaleColorRanges, function(d, ind) {
                        var width = this.scalePoint(d.end) - this.scalePoint(d.start);
                        var height = this.axisWidth;
                        ctx.beginPath();
                        ctx.fillStyle = d.color;
                        ctx.rect(
                            this.scalePoint(d.start),
                            this.base - (height / 2),
                            width,
                            height
                        );
                        ctx.fill();

                    }, this);
                }

                //	Draw scale minor ticks
                ctx.beginPath();
                if (typeof(this.minorVals) == 'object' && this.minorVals.length > 0) {
                    ctx.fillStyle = this.minorTicks.color;
                    ctx.strokeStyle = this.minorTicks.color;
                    ctx.lineWidth = this.minorTicks.height;
                    for (var v = 0; v < this.minorVals.length; v++) {
                        var val = this.minorVals[v];
                        ctx.moveTo(this.scalePoint(val) - (this.minorTicks.height / 2),
                            this.base - (this.minorTicks.width / 2) + this.minorTicks.offset);
                        ctx.lineTo(this.scalePoint(val) - (this.minorTicks.height / 2), (this.base - (this.minorTicks.width / 2) + this.minorTicks.offset) + this.minorTicks.width);
                        ctx.stroke();
                    }
                }
                ctx.closePath();

                //	Draw scale major ticks
                ctx.beginPath();
                if (typeof(this.majorVals) == 'object' && this.majorVals.length > 0) {
                    ctx.fillStyle = this.majorTicks.color;
                    ctx.strokeStyle = this.majorTicks.color;
                    ctx.lineWidth = this.majorTicks.height;
                    for (var v = 0; v < this.majorVals.length; v++) {
                        var val = this.majorVals[v];
                        ctx.moveTo(this.scalePoint(val) - (this.majorTicks.height / 2),
                            this.base - (this.majorTicks.width / 2) + this.majorTicks.offset);
                        ctx.lineTo(this.scalePoint(val) - (this.majorTicks.height / 2), (this.base - (this.majorTicks.width / 2) + this.majorTicks.offset) + this.majorTicks.width);
                        ctx.stroke();
                    }
                }
                ctx.closePath();

                //	Draw scale labels
                ctx.beginPath();
                if (typeof(this.labelVals) == 'object' && this.labelVals.length > 0) {
                    ctx.fillStyle = this.tickLabels.color;
                    ctx.font = this.font;
                    for (var v = 0; v < this.labelVals.length; v++) {
                        var val = this.labelVals[v];
                        if (this.showLabels) {
                            var text = val + this.tickLabels.units;
                            ctx.fillText(text,
                                this.scalePoint(val) - this.textDimention(text).width / 2,
                                this.base + (this.tickLabels.offset > 0 ? 0 : this.textDimention(text).height) - this.tickLabels.offset
                            );
                        }
                    }
                }
                ctx.closePath();
            } else {
                //	Draw scale background
                ctx.beginPath();
                ctx.fillStyle = opts.axisColor;
                ctx.rect(this.xCenter - opts.axisWidth / 2, opts.padding.top, opts.axisWidth, this.height - opts.padding.top - opts.padding.bottom);
                ctx.fill();
                ctx.closePath();

                //	Draw scale color ranges
                if (typeof(this.scaleColorRanges) == 'object' && this.scaleColorRanges.length > 0) {
                    helpers.each(this.scaleColorRanges, function(d, ind) {
                        var width = this.axisWidth;
                        var height = this.scalePoint(d.start) - this.scalePoint(d.end);
                        ctx.beginPath();
                        ctx.fillStyle = d.color;
                        ctx.rect(
                            this.base - (width / 2),
                            this.scalePoint(d.end),
                            width,
                            height
                        );
                        ctx.fill();

                    }, this);
                }

                //	Draw scale minor ticks
                ctx.beginPath();
                if (typeof(this.minTicks) == 'object' && this.minTicks.length > 0) {
                    ctx.fillStyle = tickOpts.minorTicks.color;
                    ctx.strokeStyle = tickOpts.minorTicks.color;
                    ctx.lineWidth = tickOpts.minorTicks.height;
                    for (var v = 0; v < this.minTicks.length; v++) {
                        var val = this.minTicks[v];
                        ctx.moveTo(this.xCenter - (tickOpts.minorTicks.width / 2) + tickOpts.minorTicks.offset,
                            this.scalePoint(val) - (tickOpts.minorTicks.height / 2));
                        ctx.lineTo((this.xCenter - (tickOpts.minorTicks.width / 2) + tickOpts.minorTicks.offset) + tickOpts.minorTicks.width,
                            this.scalePoint(val) - (tickOpts.minorTicks.height / 2));
                        ctx.stroke();
                    }
                }
                ctx.closePath();

                //	Draw scale major ticks
                ctx.beginPath();
                if (typeof(this.majTicks) == 'object' && this.majTicks.length > 0) {
                    ctx.fillStyle = tickOpts.majorTicks.color;
                    ctx.strokeStyle = tickOpts.majorTicks.color;
                    ctx.lineWidth = tickOpts.majorTicks.height;
                    for (var v = 0; v < this.majTicks.length; v++) {
                        var val = this.majTicks[v];
                        ctx.moveTo(this.xCenter - (tickOpts.majorTicks.width / 2) + tickOpts.majorTicks.offset,
                            this.scalePoint(val) - (tickOpts.majorTicks.height / 2));
                        ctx.lineTo((this.xCenter - (tickOpts.majorTicks.width / 2) + tickOpts.majorTicks.offset) + tickOpts.majorTicks.width,
                            this.scalePoint(val) - (tickOpts.majorTicks.height / 2));
                        ctx.stroke();
                    }
                }
                ctx.closePath();

                //	Draw scale labels
                var labels = me.labelsFromTicks(me._ticks);
                ctx.beginPath();
                if (typeof(labels) == 'object' && labels.length > 0) {
                    ctx.fillStyle = opts.scaleLabel.color;
                    ctx.font = opts.font.fontName;
                    for (var v = 0; v < labels.length; v++) {
                        var val = parseFloat(labels[v]);
                        if (opts.scaleLabel.display) {
                            var text = val + opts.scaleLabel.units;
                            ctx.fillText(text,
                                this.xCenter - (opts.scaleLabel.offset > 0 ? 0 : this.textDimention(text).width) + opts.scaleLabel.offset,
                                this.scalePoint(val) + this.textDimention(text).height / 4
                            );
                        }
                    }
                }
                ctx.closePath();
            }
        }

    });
    Chart.scaleService.registerScaleType('linearGauge', LinearGaugeScale, defaultConfig);
}).call(this, Chart);







(function(Chart) {
	var helpers = Chart.helpers;

	Chart.defaults._set('linearGauge', {
		scale: {
			type: 'linearGauge'
		},
        dataset: {
            value: 0,
            indicator: 'range', // 'range' or 'point' indicator
            shape: 'circle', // for point indicator available options - 'circle', 'rect', 'tringle'
            width: 8,
            height: 5, // for point indicator
            offset: 10, // for range indicator from center of the axis line 
            color: '#51f40b',
            colorRanges: [{
                startpoint: 0,
                breakpoint: 20,
                color: '#6154ab'
            }, {
                startpoint: 20,
                breakpoint: 70,
                color: '#74f40b'
            }, {
                startpoint: 70,
                breakpoint: 100,
                color: '#fd0902'
            }], // for the range, array with breakpoints and colors
            tooltipRanges: [{
                startpoint: 0,
                breakpoint: 20,
                tooltip: 'low'
            }, {
                startpoint: 20,
                breakpoint: 70,
                tooltip: 'normal'
            }, {
                startpoint: 70,
                breakpoint: 100,
                tooltip: 'high'
            }],
            img: '',
            label: ''
        },
        padding: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        multiTooltipTitles: 'Total'
	});

	Chart.controllers.linearGauge = Chart.DatasetController.extend({
		initialize: function() {
			var me = this;
			var meta;

			Chart.DatasetController.prototype.initialize.apply(me, arguments);

			meta = me.getMeta();
			meta.stack = me.getDataset().stack;
			meta.bar = true;
		},

		update: function(reset) {
			var me = this;
			var rects = me.getMeta().data;
			var i, ilen;

			me._ruler = me.getRuler();

			for (i = 0, ilen = rects.length; i < ilen; ++i) {
				me.updateElement(rects[i], i, reset);
			}
		},
	});
}).call(this, Chart);