A linear gauge chart type extension for Chart.js originally conceptualized by [A. Scott McCulloch, PhD](http://www.tapintu.com) and coded by [Alexander V.](https://www.upwork.com/o/profiles/users/_~01f75d88b019d87523/)

# Options

All options extend any existing default chart.js settings

## Scale

###horizontal: 
	Set scale orientation, false - vertical, true - horizontal
	
###range: 
	Object, set scale range (max and min for the scale). Containe two fields, startValue and endValue.

###font: 
	Object, set font name and size for scale. Containe two fields, fontName and fontSize.
	
###axisWidth: 
	Set width of axes in pixels.
	
###axisColor:
	Set axis color.

###ticks:
	Describe scale ticks. There are two type of ticks, major and minor. For each type it is possible to set particular options. If some of them skipped, this type of ticks will not be displayed.
	
	majorTicks, minorTicks:
		Describe major/minor ticks for scale. Object, contains following fields:

            interval: set interval for ticks repeating according to scale range
            customValues: array, set custom values on scale where tick has to be shown
            width: width in pixels
            height: height in pixels
            offset: offset in pixels from scale center
            color: color
            
###scaleLabel:
	Describe scale labels. Object, contains following fields:

        display: show or hide labels
        interval: set interval for scale labels repeating according to scale range
        customValues: array, set custom values on scale where label has to be shown
        units: mark that will added to each scale label
        offset: offset in pixels from scale center
        color: color

###scaleColorRanges:
	Set particular colors on the part of scale. Array of objects, contains following fields:

        start: start scale range, point from which color range starts, don't set it below or above scale range
        end: stop scale range, point where color range stops, don't set it below or above scale range
        color: color	
	

# Sample Scale Options

```javascript
window.myBar = new Chart(ctx, {
	type: 'linearGauge',
    data: barChartData,
    options: {
        responsive: true,
        animationEasing: "easeInBounce",
        scale: {
        	horizontal: false,
            range: {
                startValue: -100,
        		endValue: 200
            },
            responsive: true,
            font: {
                fontName: 'Arial',
                fontSize: 12
            },
            axisWidth: 5,
            axisColor: '#c5c7cf',
            ticks: {
                majorTicks: {
	                interval: 0,
	                height: 2
	            },
	            minorTicks: {
	                interval: 25,
	                width: 2,
	                offset: -2
	            },
            },
            scaleLabel: {
                display: true,
                interval: 100,
                units: '',
                offset: -22,
                color: '#3fd91e'
            },
            scaleColorRanges: [{
                start: -50,
                end: 30,
                color: '#fe5066'
            }, {
                start: 30,
                end: 130,
                color: '#82e668'
            }, {
                start: 130,
                end: 180,
                color: '#1224fc'
            }],
        },
    	legend: {
            display: false
        }
    }

});
```

# Dataset Options

###data: 
	array, must contain only one value, stacked charts is not support

###pointer: 
	define type of pointer which will used to show data, if not setted, default is 'bar', available pointers: 'bar', 'point', 'text'

###shape: 
	define shape for point pointer: 'triangle', 'circle', 'rect', 'inverted-triangle', 'bowtie', 'diamond'

###text: 
	define text for text pointer

###fontSize: 
	define font size for text pointer

###fontFamily: 
	define font family for text pointer

###img: 
	define img url if you want to use image as pointer (if setted this param, pointer will image, not needed to set pointer param) if you are using image ranges, you have to set this param, this image will used as default

###width: 
	width of pointer

###height: 
	height of pointer

###offset: 
	pointer offset from scale center

###backgroundColor: 
	pointer color

###colorRanges:
	array of objects, set color ranges for pointer which will accepted according to chart data value, object properties:

		startpoint: start pointer range, point from which color range starts, don't set it below or above scale range
        breakpoint: stop pointer range, point where color range stops, don't set it below or above scale range
        color: color

###imageRanges:
	array of objects, set image ranges for pointer which will accepted according to chart data value, object properties:

		startpoint: start image range, point from which image range starts, don't set it below or above scale range
        breakpoint: stop pointer range, point where color range stops, don't set it below or above scale range
        img: image that will shown for current range


# Sample Dataset Options
```javascript
{
    data: [0],
    pointer: 'point',
    shape: 'triangle',
    text: 'Pointer Text',
    fontSize: 21,
    fontFamily: 'Arial',
    img: 'img/hand-pointer.png'
    width: 18,
    height: 25,
    offset: 8,
    backgroundColor: '#1b02f7',
    colorRanges: [{
        startpoint: -150,
        breakpoint: -100,
        color: '#1b02f7'
    }, {
        startpoint: -100,
        breakpoint: -30,
        color: '#8888fb'
    }, {
        startpoint: -30,
        breakpoint: 30,
        color: '#31d801'
    }, {
        startpoint: 30,
        breakpoint: 100,
        color: '#e1e10d'
    }, {
        startpoint: 100,
        breakpoint: 150,
        color: '#d90000'
    }],
    imageRanges: [{
        startpoint: -10,
        breakpoint: 0,
        img: 'img/diamond3.png'
    }, {
        startpoint: 15,
        breakpoint: 25,
        img: 'img/shapes7.png'
    }]
}
```
