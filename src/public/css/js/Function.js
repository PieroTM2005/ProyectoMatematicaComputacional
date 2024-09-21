
var canvas = document.getElementById("mapa");

var ctx = canvas.getContext("2d");
var coordenadas = {};
var grafo = {};

function sizeCanvas(size = 800) {
    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = "#ffffff"; // Color de fondo
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Rellenar el canvas
    drawGrid();
}

function drawGrid(size = 800) {
    ctx.strokeStyle = "#F5F5F5";
    ctx.lineWidth = 1;

    for (var x = 0; x <= size; x += 6) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
    }

    for (var y = 0; y <= size; y += 6) {
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
    }

    ctx.stroke();
}

function emptyCanvas() {
    sizeCanvas();
    drawGrid();
}

function drawVertex(x, y, r = 7, nameOfVertex, size = 800) {
    console.log(`Dibujando vértice: ${nameOfVertex} en (${x}, ${y})`);
    let escala = Math.round(size / 100);
    let xPixel = x * escala;
    let yPixel = y * escala;

    if (ctx) {
        ctx.fillStyle = "#FF0000"; // Color del vértice (rojo)
        ctx.beginPath();
        ctx.arc(xPixel, size - yPixel, r, 0, 2 * Math.PI);
        ctx.fill();

        // Dibujar el nombre del vértice
        ctx.textAlign = "center";
        ctx.font = "10pt Verdana";
        ctx.fillStyle = "#FFFFFF"; // Color del texto (blanco)
        ctx.fillText(nameOfVertex, xPixel, size - yPixel + 15); // Ajustar posición del texto
    }
}

function drawEdge(x1, y1, x2, y2, peso, isShortestPath = false) {
    ctx.strokeStyle = isShortestPath ? "#FF0000" : "#000000";
    ctx.lineWidth = isShortestPath ? 3 : 1;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (peso) {
        ctx.fillStyle = "#000000";
        ctx.font = "10pt Verdana";
        let midX = (x1 + x2) / 2;
        let midY = (y1 + y2) / 2;
        ctx.fillText(peso, midX, midY);
    }
}

function clearFormData() {
    document.querySelectorAll("input[type='text'], input[type='number']").forEach(input => input.value = "");
}

function fillSelects() {
    const nodos = Object.keys(grafo);
    const selects = [document.getElementById("initialV"), document.getElementById("finalV"), document.getElementById("initialVC"), document.getElementById("finalVC")];

    selects.forEach(select => {
        select.innerHTML = '<option value="">...</option>';
        nodos.forEach(nodo => {
            const option = document.createElement("option");
            option.value = nodo;
            option.textContent = nodo;
            select.appendChild(option);
        });
    });
}

function clearInformation() {
    document.getElementById("positionX").value = '';
    document.getElementById("positionY").value = '';
    document.getElementById("nameVertice").value = '';
}

document.addEventListener("DOMContentLoaded", () => {
    clearInformation();
    sizeCanvas();
    drawGrid();

    document.getElementById("btnCrearV").addEventListener("click", (e) => {
        e.preventDefault();
        let x = parseInt(document.getElementById("positionX").value);
        let y = parseInt(document.getElementById("positionY").value);
        let nameV = document.getElementById("nameVertice").value;

        if (x >= 0 && y >= 0 && x <= 100 && y <= 100 && nameV) {
            coordenadas[nameV] = [x, y];
            grafo[nameV] = {};

            // Dibuja el vértice en el canvas
            drawVertex(x, y, 7, nameV, 800); // Cambia 800 por el tamaño del canvas que uses

            fillSelects();
            clearFormData();
            document.getElementById("positionX").focus();
        } else {
            alert("Por favor introduce los datos.");
        }
    });

    document.getElementById("btnCrearE").addEventListener("click", (e) => {
        e.preventDefault();
        let initialV = document.getElementById("initialV").value;
        let finalV = document.getElementById("finalV").value;

        if (initialV && finalV && initialV !== finalV) {
            let x1 = coordenadas[initialV][0];
            let y1 = coordenadas[initialV][1];
            let x2 = coordenadas[finalV][0];
            let y2 = coordenadas[finalV][1];
            let peso = Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));

            grafo[initialV][finalV] = peso;
            grafo[finalV][initialV] = peso;
            drawEdge(x1, y1, x2, y2, peso);
            clearFormData();
        } else {
            alert("Por favor introduce los datos.");
        }
    });

    document.getElementById("btnCalcRoute").addEventListener("click", (e) => {
        e.preventDefault();
        let initialV = document.getElementById("initialVC").value;
        let finalV = document.getElementById("finalVC").value;

        if (initialV && finalV && initialV !== finalV) {
            let dks = dijkstra(grafo, initialV, finalV);
            let distance = dks["distancia"];
            let route = dks["ruta"];

            for (let i = 0; i < route.length; i++) {
                if (i < route.length - 1) {
                    drawEdge(
                        coordenadas[route[i]][0],
                        coordenadas[route[i]][1],
                        coordenadas[route[i + 1]][0],
                        coordenadas[route[i + 1]][1],
                        null,
                        800, // Cambia a 800 si ese es el tamaño del canvas
                        true
                    );
                }
            }
            document.getElementById("distance").innerHTML = `<strong>Peso total:</strong> ${distance}<br><strong>Ruta:</strong> (${route})`;
            document.getElementById("distance").style.display = 'block';
        } else {
            alert("¡Ya estás en tu destino!");
        }
    });
});

const dijkstra = (grafo, nodoInicial, nodoFinal) => {
    let pesos = {};
    pesos[nodoFinal] = Infinity;
    pesos = Object.assign(pesos, grafo[nodoInicial]);

    const nodosPadre = { nodoFinal: null };

    for (let nodoHijo in grafo[nodoInicial]) {
        nodosPadre[nodoHijo] = nodoInicial;
    }

    const procesados = [];
    let nodo = nodoPesoMenor(pesos, procesados);

    while (nodo) {
        let peso = pesos[nodo];
        let nodosHijo = grafo[nodo];

        for (let n in nodosHijo) {
            if (n === nodoInicial) continue;
            let nuevoPeso = peso + nodosHijo[n];

            if (!pesos[n] || pesos[n] > nuevoPeso) {
                pesos[n] = nuevoPeso;
                nodosPadre[n] = nodo;
            }
        }

        procesados.push(nodo);
        nodo = nodoPesoMenor(pesos, procesados);
    }

    let rutaOptima = [nodoFinal];
    let nodoPadre = nodosPadre[nodoFinal];

    while (nodoPadre) {
        rutaOptima.push(nodoPadre);
        nodoPadre = nodosPadre[nodoPadre];
    }

    rutaOptima.reverse();

    return { distancia: pesos[nodoFinal], ruta: rutaOptima };
};

const nodoPesoMenor = (pesos, procesados) => {
    return Object.keys(pesos).reduce((pesoMenor, nodo) => {
        if (procesados.includes(nodo)) return pesoMenor;
        return (pesoMenor === null || pesos[nodo] < pesos[pesoMenor]) ? nodo : pesoMenor;
    }, null);
};
