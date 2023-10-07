window.onload = function() {
    // Matrices para almacenar las instancias. Configuración inicial
    var fichas = [];
    var casillas = [];
    var tableroJuego = [
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0]
    ];

    // Fórmula para calcular la distancia entre dos puntos
    var distancia = function(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
        }
        // Objeto Ficha. Crearemos 24 instancias de ellos
    function Ficha(elemento, posicion) {
        // cuando existe el salto, el movimiento normal no está permitido
        // como no hay salto en la primera ronda, todas las fichas pueden moverse inicialmente
        this.permitirMover = true;
        // elemento DOM vinculado
        this.elemento = elemento;
        // posicion en el array tableroJuego en formato fila, columna
        this.posicion = posicion;
        // ficha del jugador (1 o 2)
        this.jugador = '';
        // averiguar jugador por id de la ficha
        if (this.elemento.attr("id") < 12)
            this.jugador = 1;
        else
            this.jugador = 2;
        // hacer Reina el objeto Ficha
        this.reina = false;
        this.hacerReina = function() {
                this.elemento.css("backgroundImage", "url('img/reina" + this.jugador + ".png')");
                this.reina = true;
            }
            // mueve la ficha
        this.move = function(casilla) {
            this.elemento.removeClass('seleccionada');
            if (!Tablero.esLugarValidoParaMover(casilla.posicion[0], casilla.posicion[1])) return false;
            // comprobar que la ficha no retroceda si no es reina
            if (this.jugador == 1 && this.reina == false) {
                if (casilla.posicion[0] < this.posicion[0]) return false;
            } else if (this.jugador == 2 && this.reina == false) {
                if (casilla.posicion[0] > this.posicion[0]) return false;
            }
            // quitar la marca del tablero y colocarla en el nuevo lugar
            Tablero.tablero[this.posicion[0]][this.posicion[1]] = 0;
            Tablero.tablero[casilla.posicion[0]][casilla.posicion[1]] = this.jugador;
            this.posicion = [casilla.posicion[0], casilla.posicion[1]];
            // cambiar el css usando el diccionario del Tablero
            this.elemento.css('top', Tablero.diccionario[this.posicion[0]]);
            this.elemento.css('left', Tablero.diccionario[this.posicion[1]]);
            // si la ficha llega al final de la fila en el lado opuesto, hacemos reina (se puede mover en todas las direcciones)
            if (!this.reina && (this.posicion[0] == 0 || this.posicion[0] == 7))
                this.hacerReina();
            return true;
        };

        // comprobar si la ficha puede saltar en cualquier sitio
        this.puedeSaltarCualquierSitio = function() {
            return (this.puedeElOponenteSaltar([this.posicion[0] + 2, this.posicion[1] + 2]) ||
                this.puedeElOponenteSaltar([this.posicion[0] + 2, this.posicion[1] - 2]) ||
                this.puedeElOponenteSaltar([this.posicion[0] - 2, this.posicion[1] + 2]) ||
                this.puedeElOponenteSaltar([this.posicion[0] - 2, this.posicion[1] - 2]))
        };

        // comprobar si un oponente puede saltar a un lugar específico
        this.puedeElOponenteSaltar = function(nuevaPosicion) {
            // encontrar cuál es el desplazamiento
            var dx = nuevaPosicion[1] - this.posicion[1];
            var dy = nuevaPosicion[0] - this.posicion[0];
            // aseguramos de que no vaya hacia atrás si no es una reina
            if (this.jugador == 1 && this.reina == false) {
                if (nuevaPosicion[0] < this.posicion[0]) return false;
            } else if (this.jugador == 2 && this.reina == false) {
                if (nuevaPosicion[0] > this.posicion[0]) return false;
            }
            // debe estar dentro de los límites
            if (nuevaPosicion[0] > 7 || nuevaPosicion[1] > 7 || nuevaPosicion[0] < 0 || nuevaPosicion[1] < 0) return false;
            // casilla central donde se encuentra la ficha para ser conquistada
            var casillaToCheckx = this.posicion[1] + dx / 2;
            var casillaToChecky = this.posicion[0] + dy / 2;
            if (casillaToCheckx > 7 || casillaToChecky > 7 || casillaToCheckx < 0 || casillaToChecky < 0) return false;
            // si hay una ficha ahí y no hay ficha en el espacio de después
            if (!Tablero.esLugarValidoParaMover(casillaToChecky, casillaToCheckx) && Tablero.esLugarValidoParaMover(nuevaPosicion[0], nuevaPosicion[1])) {
                // encontrar que instancia de objeto está allí
                for (let fichaIndex in fichas) {
                    if (fichas[fichaIndex].posicion[0] == casillaToChecky && fichas[fichaIndex].posicion[1] == casillaToCheckx) {
                        if (this.jugador != fichas[fichaIndex].jugador) {
                            // devuelve la ficha posicionada ahí
                            return fichas[fichaIndex];
                        }
                    }
                }
            }
            return false;
        };

        this.oponenteSaltar = function(casilla) {
            var fichaParaEliminar = this.puedeElOponenteSaltar(casilla.posicion);
            // si hay una ficha que eliminar, eliminarla
            if (fichaParaEliminar) {
                fichaParaEliminar.eliminar();
                return true;
            }
            return false;
        };

        this.eliminar = function() {
            // borra y elimina del tablero de juego
            this.elemento.css("display", "none");
            if (this.jugador == 1) {
                $('#jugador2').append("<div class='fichaCapturada'></div>");
                Tablero.puntuacion.jugador2 += 1;
            }
            if (this.jugador == 2) {
                $('#jugador1').append("<div class='fichaCapturada'></div>");
                Tablero.puntuacion.jugador1 += 1;
            }
            Tablero.tablero[this.posicion[0]][this.posicion[1]] = 0;
            // restablece la posición para que no sea recogido por el bucle for en puedeElOponenteSaltar
            this.posicion = [];
            var jugadorWon = Tablero.comprobarSiHayGanador();
            if (jugadorWon) {
                $('#ganador').html("¡Jugador " + jugadorWon + " has ganado la partida!");
            }
        }
    }

    function Casilla(elemento, posicion) {
        this.elemento = elemento;
        this.posicion = posicion;
        // si la casilla está dentro del rango de la ficha
        this.enRango = function(ficha) {
            for (let k of fichas)
                if (k.posicion[0] == this.posicion[0] && k.posicion[1] == this.posicion[1]) return 'incorrecto';
            if (!ficha.reina && ficha.jugador == 1 && this.posicion[0] < ficha.posicion[0]) return 'incorrecto';
            if (!ficha.reina && ficha.jugador == 2 && this.posicion[0] > ficha.posicion[0]) return 'incorrecto';
            if (distancia(this.posicion[0], this.posicion[1], ficha.posicion[0], ficha.posicion[1]) == Math.sqrt(2)) {
                // movimiento normal
                return 'normal';
            } else if (distancia(this.posicion[0], this.posicion[1], ficha.posicion[0], ficha.posicion[1]) == 2 * Math.sqrt(2)) {
                // movimiento de salto
                return 'salto';
            }
        };
    }

    // Objecto Tablero que controla la logística del juego
    var Tablero = {
        tablero: tableroJuego,
        puntuacion: {
            jugador1: 0,
            jugador2: 0
        },
        turnoJugador: 1,
        haySalto: false,
        saltoContinuo: false,
        casillasElemento: $('div.casillas'),
        // diccionario para convertir la posición en Tablero.tablero a unidades de la ventana gráfica
        diccionario: ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"],
        // inicializa el tablero 8x8
        inicializar: function() {
            var contarFichas = 0;
            var contarCasillas = 0;

            for (let row in this.tablero) { // fila
                for (let column in this.tablero[row]) { // columna
                    // coloca las casillas y fichas en el tablero
                    if (row % 2 == 1) {
                        if (column % 2 == 0) {
                            contarCasillas = this.casillaRender(row, column, contarCasillas)
                        }
                    } else {
                        if (column % 2 == 1) {
                            contarCasillas = this.casillaRender(row, column, contarCasillas)
                        }
                    }
                    if (this.tablero[row][column] == 1) {
                        contarFichas = this.dibujarFichasJugador(1, row, column, contarFichas)
                    } else if (this.tablero[row][column] == 2) {
                        contarFichas = this.dibujarFichasJugador(2, row, column, contarFichas)
                    }
                }
            }
            document.getElementById("infomensaje").innerHTML = 'Comienza J1 con fichas rojas';
        },

        casillaRender: function(fila, columna, contarCasillas) {
            this.casillasElemento.append("<div class='casilla' id='casilla" + contarCasillas + "' style='top:" + this.diccionario[fila] + ";left:" + this.diccionario[columna] + ";'></div>");
            casillas[contarCasillas] = new Casilla($("#casilla" + contarCasillas), [parseInt(fila), parseInt(columna)]);
            return contarCasillas + 1
        },

        dibujarFichasJugador: function(numeroJugador, fila, columna, contarFichas) {
            $(`.jugador${numeroJugador}fichas`).append("<div class='ficha' id='" + contarFichas + "' style='top:" + this.diccionario[fila] + ";left:" + this.diccionario[columna] + ";'></div>");
            fichas[contarFichas] = new Ficha($("#" + contarFichas), [parseInt(fila), parseInt(columna)]);
            return contarFichas + 1;
        },

        // comprueba si la ubicacion contiene un objeto
        esLugarValidoParaMover: function(fila, columna) {
            if (fila < 0 || fila > 7 || columna < 0 || columna > 7) return false;
            if (this.tablero[fila][columna] == 0) {
                return true;
            }
            return false;
        },

        // cambia el jugador activo y CSS div.turno
        cambiarTurnoJugador: function() {
            if (this.turnoJugador == 1) {
                this.turnoJugador = 2;
                $('.turno').css("background", "linear-gradient(to right, transparent 50%, #cfa14a 75%)");
            } else {
                this.turnoJugador = 1;
                $('.turno').css("background", "linear-gradient(to right, #cfa14a 25%, transparent 50%)");
            }
            this.comprobarSiHaySalto()
            return;
        },

        // comprobar si ha ganado
        comprobarSiHayGanador: function() {
            if (this.puntuacion.jugador1 == 12) {
                return 1;
            } else if (this.puntuacion.jugador2 == 12) {
                return 2;
            }
            return false;
        },

        // reiniciar el juego, cargar de nuevo el documento
        clear: function() {
            location.reload();
        },

        comprobarSiHaySalto: function() {
            this.haySalto = false
            this.saltoContinuo = false;
            for (let k of fichas) {
                k.permitirMover = false;
                // si hay salto, permitir movimiento solamente las fichas de salto
                if (k.posicion.length != 0 && k.jugador == this.turnoJugador && k.puedeSaltarCualquierSitio()) {
                    this.haySalto = true
                    k.permitirMover = true;
                }
            }
            // si no hay salto todas las fichas pueden moverse
            if (!this.haySalto) {
                for (let k of fichas) k.permitirMover = true;
            }
        },
    }

    // Iinicializamos el tablero
    Tablero.inicializar();

    // EVENTOS

    // Selecciona la ficha al hacer clic si es el turno del jugador
    $('.ficha').on("click", function() {
        var seleccionada;
        var esTurnoJugador = ($(this).parent().attr("class").split(' ')[0] == "jugador" + Tablero.turnoJugador + "fichas");
        // borrar mensaje informativo
        document.getElementById("infomensaje").innerHTML = ' ';

        if (esTurnoJugador) {
            if (!Tablero.saltoContinuo && fichas[$(this).attr("id")].permitirMover) {
                if ($(this).hasClass('seleccionada')) seleccionada = true;
                $('.ficha').each(function(index) {
                    $('.ficha').eq(index).removeClass('seleccionada')
                });
                if (!seleccionada) {
                    $(this).addClass('seleccionada');
                }

            } else {
                // mostrar mensaje informativo
                let existe = "Esta ficha no se puede mover: Hay salto con otra ficha."
                let continuo = "Debe saltar con la misma ficha: Hay salto continuo."
                let message = !Tablero.saltoContinuo ? existe : continuo
                document.getElementById("infomensaje").innerHTML = message;
            }
        }
    });

    // Reestablece el juego cuando se presiona el botón NUEVO JUEGO
    $('#nuevojuego').on("click", function() {
        Tablero.clear();
    });

    $('.logojuego').on("click", function() {
        alert("Juan Francisco Almoril");

    });

    // Mover ficha cuando se hacemos click en casilla
    $('.casilla').on("click", function() {
        // borra mensaje informativo
        document.getElementById("infomensaje").innerHTML = ' ';

        // ver si hay ficha seleccionada
        if ($('.seleccionada').length != 0) {
            // encontrar el objeto de la casilla en el que se ha hecho click
            var casillaID = $(this).attr("id").replace(/casilla/, '');
            var casilla = casillas[casillaID];
            // encontrar la ficha que se está seleccionando
            var ficha = fichas[$('.seleccionada').attr("id")];
            // comprobar si la casilla está en el rango del objeto
            var enRango = casilla.enRango(ficha);
            if (enRango != 'incorrecto') {
                // si el movimiento necesario es un salto, entonces muévelo pero también comprobar si se puede hacer salto doble
                if (enRango == 'salto') {
                    if (ficha.oponenteSaltar(casilla)) {
                        ficha.move(casilla);
                        if (ficha.puedeSaltarCualquierSitio()) {
                            ficha.elemento.addClass('seleccionada');
                            // existe el salto continuo, no está permitido deseleccionar esta ficha o seleccionar otra
                            Tablero.saltoContinuo = true;
                        } else {
                            Tablero.cambiarTurnoJugador()
                        }
                    }
                    // si es normal, entonces mover si no hay saltos disponibles
                } else if (enRango == 'normal' && !Tablero.haySalto) {
                    if (!ficha.puedeSaltarCualquierSitio()) {
                        ficha.move(casilla);
                        Tablero.cambiarTurnoJugador()
                    } else {
                        // mensaje informativo
                        document.getElementById("infomensaje").innerHTML = "¡Debes saltar cuando sea posible!";
                    }
                }
            }
        }
    });
}