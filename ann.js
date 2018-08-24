/* Inputs in main canvas */
let samples = [];
/* Network arhitecture */
let architecture = [2, 1];
let numOfLayers = architecture.length;
/* Contains weights of all neurons */
let weights = [];
/* Number of epoch iterations while learning */
const NUMBER_OF_ITERATIONS = 50000;
/* Eta constant for back propagation algorithm */
const ETA = 0.02;
/* Graphical elements */
let layersLabel = document.getElementById('neurons');
let canvases = [];
let numOfCanvases = 1;
const canWidth = 600;
const canHeight = 600;
/* Start button */
let btnStart = document.getElementById('start');
/* Clear button */
let btnClear = document.getElementById('clear');
let canvasDiv = document.getElementById('canvases');
/* Indicates if network is learning */
let started = false;
/* Example buttons */
let btnEx1 = document.getElementById('ex1');
let btnEx2 = document.getElementById('ex2');

/* Creates canvas for final output and saves it in the first place in canvases[] as [canvas, context] */
createCanvas();

/* Event listener for main canvas representing final output */
canvases[0][0].addEventListener('mousedown', function (e) {
    if (!started) {
        let rect = canvases[0][0].getBoundingClientRect();

        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        let sample;

        canvases[0][1].fillStyle = 'black';

        if (e.button == 0) {
            drawRectangle(canvases[0][1], x, y, 8, 8);

            sample = [x/canWidth, y/canHeight, 0];
        } else if (e.button == 2) {
            drawTriangle(canvases[0][1], x, y);

            sample = [x/canWidth, y/canHeight, 1];
        }

        samples.push(sample);
    }
});

btnStart.addEventListener('click', function () {
    let neurons = layersLabel.value.split(',').map(x => parseInt(x));

    if (!neurons[0]) {
        neurons = [];
    }

    if (neurons.length > 0 && neurons[neurons.length - 1] > 5) {
        alert('Please put a maximum of 5 neurons in last hidden layer');
    } else {
        architecture = [2, ...neurons, 1];
        numOfLayers = architecture.length;
        
        while (canvasDiv.firstChild) {
			canvasDiv.removeChild(canvasDiv.firstChild);
		}
		
		canvasDiv.appendChild(document.createElement('br'));
		canvasDiv.appendChild(canvases[0][0]);

        canvases = [canvases[0]];
        numOfCanvases = 1;

        /* Creates canvas for every neuron in second last layer and saves them in canvases[] as [canvas, context] */
        for (let neuron = 1; neuron <= architecture[numOfLayers - 2]; neuron++) {
            createCanvas();

            numOfCanvases++;
        }

        started = true;

        generateRandomWeights();

        startLearning();

        started = false;
    }
});

btnClear.addEventListener('click', clearCanvases);

btnEx1.addEventListener('click', function () {
    clearCanvases();

    samples = [
        [150/canWidth, 150/canHeight, 0], 
        [150/canWidth, 250/canHeight, 0], 
        [150/canWidth, 450/canHeight, 0], 
        [250/canWidth, 150/canHeight, 0], 
        [450/canWidth, 150/canHeight, 0], 
        [250/canWidth, 350/canHeight, 1], 
        [350/canWidth, 350/canHeight, 1], 
        [350/canWidth, 250/canHeight, 1]
    ]; // For canvas dimensions 600 x 600

    plotSamples();
});

btnEx2.addEventListener('click', function () {
    clearCanvases();

    samples = [
        [100/canWidth, 150/canHeight, 0],
        [200/canWidth, 150/canHeight, 0],
        [300/canWidth, 150/canHeight, 0],
        [400/canWidth, 150/canHeight, 0], 
        [500/canWidth, 150/canHeight, 0], 
        [100/canWidth, 250/canHeight, 0], 
        [300/canWidth, 250/canHeight, 0], 
        [500/canWidth, 250/canHeight, 0], 
        [300/canWidth, 300/canHeight, 0], 
        [100/canWidth, 350/canHeight, 0], 
        [300/canWidth, 350/canHeight, 0], 
        [500/canWidth, 350/canHeight, 0], 
        [100/canWidth, 450/canHeight, 0], 
        [200/canWidth, 450/canHeight, 0], 
        [300/canWidth, 450/canHeight, 0], 
        [400/canWidth, 450/canHeight, 0], 
        [500/canWidth, 450/canHeight, 0], 
        [175/canWidth, 250/canHeight, 1], 
        [225/canWidth, 250/canHeight, 1], 
        [375/canWidth, 250/canHeight, 1], 
        [425/canWidth, 250/canHeight, 1], 
        [175/canWidth, 300/canHeight, 1], 
        [225/canWidth, 300/canHeight, 1], 
        [375/canWidth, 300/canHeight, 1], 
        [425/canWidth, 300/canHeight, 1], 
        [175/canWidth, 350/canHeight, 1], 
        [225/canWidth, 350/canHeight, 1], 
        [375/canWidth, 350/canHeight, 1], 
        [425/canWidth, 350/canHeight, 1], 
    ]; // For canvas dimensions 600 x 600

    plotSamples();
});

function drawInCanvas(all) {
    let outputsTime = 0;
    let colorTime = 0;
    let drawTime = 0;

    for (let x = 0; x < canWidth; x++) {
        for (let y = 0; y < canHeight; y++) {
            //let outputsStart = performance.now();
            let outputs = evaluate([x/canWidth, y/canHeight]);
            //let outputsEnd = performance.now();
            
            //let colorStart = performance.now();

            let out = outputs[numOfLayers - 1][0];

            if (out > 0.5) {
               canvases[0][1].fillStyle = 'rgb(255, ' + 510 * (1 - out) + ', ' + 510 * (1 - out) + ')';
            } else {
                canvases[0][1].fillStyle = 'rgb(' + 510 * out + ', ' + 510 * out + ', 255)';
            }

            drawRectangle(canvases[0][1], x, y, 1, 1);

            if (all) {
                for (let canvas = 1; canvas < numOfCanvases; canvas++) {
                    out = outputs[numOfLayers - 2][canvas - 1];
    
                    if (out > 0.5) {
                        canvases[canvas][1].fillStyle = 'rgb(255, ' + 510 * (1 - out) + ', ' + 510 * (1 - out) + ')';
                    } else {
                        canvases[canvas][1].fillStyle = 'rgb(' + 510 * out + ', ' + 510 * out + ', 255)';
                    }
    
                    drawRectangle(canvases[canvas][1], x, y, 1, 1);
                }
            }

            //let colorEnd = performance.now();
            
            //let drawStart = performance.now();

            //let drawEnd = performance.now();

            //outputsTime += (outputsEnd - outputsStart) / 1000;
            //colorTime += (colorEnd - colorStart) / 1000;
            //drawTime += (drawEnd - drawStart) / 1000;
        }
    }

    //console.log('Outputs: ' + outputsTime + ' seconds');
    //console.log('Color: ' + colorTime + ' seconds');
    //console.log('Draw: ' + drawTime + ' seconds');

    plotSamples();
}

function evaluate(inputs) {
    let outputs = [];

    outputs.push(inputs);
    
    for (let layer = 2; layer <= numOfLayers; layer++) {
        /* Input on free weight equals 1 */
        outputs[layer - 2].push(1);

        /* Calculate outputs for current layer */
        let matrix = transponseMatrix(
            multiplyMatrixWithFunction(
                weights[layer - 2], 
                transponseMatrix([outputs[layer - 2]]), 
                sigmoid)
        )[0];

        outputs.push(matrix);
    }

    return outputs;
}

function process(sample) {
    let outputs = evaluate(sample.slice(0, sample.length - 1));

    let targetOutput = sample[sample.length - 1];

    let deviations = [];

    let finalOutput = outputs[outputs.length - 1][0];
    let lastDeviation = finalOutput * (1 - finalOutput) * (targetOutput - finalOutput);

    deviations.unshift([lastDeviation]);

    for (let layer = numOfLayers - 1; layer >= 2; layer--) {
        let newDeviations = [];

        for (let neuron = 1; neuron <= architecture[layer - 1]; neuron ++) {
            let deviationSum = 0;

            for (let d = 1; d <= architecture[layer]; d++) {
                deviationSum += weights[layer - 1][d - 1][neuron - 1] * deviations[0][d - 1];
            }

            let currentOutput = outputs[layer - 1][neuron - 1];
            let currentDeviation = currentOutput * (1 - currentOutput) * deviationSum;

            newDeviations.push(currentDeviation);
        }

        deviations.unshift(newDeviations);
    }

    for (let layer = 2; layer <= numOfLayers; layer++) {
        for (let neuron = 1; neuron <= architecture[layer - 1]; neuron++) {
            for (let weight = 1; weight <= architecture[layer - 2]; weight++) {
                weights[layer - 2][neuron - 1][weight - 1] += ETA * outputs[layer - 2][weight - 1] * deviations[layer - 2][neuron - 1];
            }

            weights[layer - 2][neuron - 1][architecture[layer - 2]] += ETA * deviations[layer - 2][neuron - 1];
        }
    }
}

function throughEpoch() {
    for (let sample of samples) {
        process(sample);
    }
}

function startLearning() {
    console.log('Learning...');

    /* Learning of network with time calculation */
    //let learnStart = performance.now();
    for (let i = 0; i < NUMBER_OF_ITERATIONS; i++) {
        throughEpoch();
    }
    //let learnEnd = performance.now();
    //console.log((learnEnd - learnStart) / 1000 + ' seconds');

    console.log('Drawing...');

    /* Drawing neuron outputs in canvas with time calculation */
    //let drawStart = performance.now();
    //drawInCanvas(false);
    drawInCanvas(true);
    //let drawEnd = performance.now();
    //console.log((drawEnd - drawStart) / 1000 + ' seconds');
    
    console.log('DONE');
}

function generateRandomWeights() {
    weights = [];

    for (let layer = 1; layer < numOfLayers; layer++) {
        let layerWeigths = [];
        let m = architecture[layer - 1];

        for (let neuron = 0; neuron < architecture[layer]; neuron++) {
            let neuronWeigths = [];

            for (let input = 0; input <= m; input++) {
                neuronWeigths.push((Math.random() * 4.8 / m) - 2.4 / m);
            }

            layerWeigths.push(neuronWeigths);
        }

        weights.push(layerWeigths);
    }
}

function plotSamples() {
    /* Color for starting samples */
    for (let canvas = 0; canvas < numOfCanvases; canvas++) {
        canvases[canvas][1].fillStyle = 'black';
    }

    /* Draw samples on every graph */
    for (let sample of samples) {
        let x = sample[0]*canWidth;
        let y = sample[1]*canHeight;
        let category = sample[2];

        for (let canvas = 0; canvas < numOfCanvases; canvas++) {
            if (category == 0) {
                drawRectangle(canvases[canvas][1], x, y, 8, 8);
            } else if (category == 1) {
                drawTriangle(canvases[canvas][1], x, y);
            }
        }
    }
}

function clearCanvases() {
    while (canvasDiv.firstChild) {
		canvasDiv.removeChild(canvasDiv.firstChild);
	}
	
	canvasDiv.appendChild(document.createElement('br'));
	canvasDiv.appendChild(canvases[0][0]);

    canvases = [canvases[0]];
    numOfCanvases = 1;

    canvases[0][1].clearRect(0, 0, canWidth, canHeight);

    samples = [];
}

function createCanvas() {
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

	canvasDiv.appendChild(document.createElement('br'));
    canvasDiv.appendChild(canvas);
    
    canvas.width = canWidth;
    canvas.height = canHeight;
    canvas.oncontextmenu = () => {
        return false;
    }

    canvases.push([canvas, context]);
}


/* -------------------- */
/* Help functions */
/* -------------------- */

function drawRectangle(ctx, x, y, width, height) {
    ctx.fillRect(x, y, width, height);
}

function drawTriangle(ctx, x, y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 5, y + 10);
    ctx.lineTo(x - 5, y + 10);
    ctx.fill();
}

function sigmoid(x) {
    return 1 / (1 + Math.pow(Math.E, -x));
}

function transponseMatrix(A) {
    let result = [];

    const rowsA = A.length;
    const colsA = A[0].length;

    for (let colA = 0; colA < colsA; colA++) {
        let newRow = [];

        for (let rowA = 0; rowA < rowsA; rowA++) {
            newRow.push(A[rowA][colA]);
        }

        result.push(newRow);
    }

    return result;
}

function multiplyMatrixWithFunction(A, B, func) {
    let result = [];

    const rowsA = A.length;
    const colsA = A[0].length;
    const rowsB = B.length;
    const colsB = B[0].length;

    if (colsA != rowsB) {
        console.error('Incorrect matrix dimensions');
    }

    for (let rowA = 0; rowA < rowsA; rowA++) {
        let resRow = [];

        for (let colB = 0; colB < colsB; colB++) {
            let sum = 0;

            for (let colA = 0; colA < colsA; colA++) {
                sum += A[rowA][colA] * B[colA][colB];
            }

            resRow.push(func(sum));
        }

        result.push(resRow);
    }

    return result;
}