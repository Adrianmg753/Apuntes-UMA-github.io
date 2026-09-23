# Generador integral de Contenidos Técnicos Reales y PDFs para los 30 recursos de 1º Grado en Ingeniería del Software UMA (Plan 2023)
$ErrorActionPreference = "Stop"

$notesDatabase = @(
    # ---------------- 101: FUNDAMENTOS DE ELECTRONICA ----------------
    @{
        id = "fel-01"; code = "101"; sub = "Fundamentos de Electronica";
        title = "Apuntes Completos de Teoria y Problemas Paso a Paso";
        type = "Apuntes Completos"; uploader = "Doc_Electromaster";
        subHeading = "Teoria Exhaustiva de Diodos, BJT, MOSFET y Amplificadores Operacionales con Demostraciones";
        sections = @(
            @{ title = "1. Modelado de Diodos y Rectificacion"; body = "La ecuacion de Shockley I_D = I_S*(exp(V_D/(n*V_T)) - 1) define el comportamiento no lineal. En diseno practico empleamos el modelo con caida constante V_gamma = 0.7 V. Para rectificadores de onda completa en puente con condensador de filtro C, la tension de rizado pico a pico es V_r = I_dc / (2*f*C)." },
            @{ title = "2. Polarizacion y Recta de Carga de Transistores BJT"; body = "En activa directa se cumple V_BE = 0.7 V, V_CE > 0.2 V y I_C = beta * I_B. Para el analisis por divisor de tension se aplica Thevenin: V_TH = V_CC * R2/(R1+R2) y R_TH = R1||R2. La recta de carga estatica une el punto de corte (V_CE = V_CC, I_C = 0) con saturacion (V_CE = 0.2V, I_C_sat = (V_CC-0.2)/(R_C+R_E))." },
            @{ title = "3. Amplificadores Operacionales en Lazo Cerrado"; body = "Bajo realimentacion negativa ideal, el cortocircuito virtual fija V+ = V- y las corrientes de entrada son nulas I+ = I- = 0. Configuracion inversora: V_out = -(Rf/Rin)*Vin. Configuracion no inversora: V_out = (1 + Rf/R1)*Vin. Seguidor de tension (buffer): V_out = Vin con ganancia unidad e impedancia de entrada infinita." }
        );
        solvedExercise = "PROBLEMA TIPO EXAMEN (Polarizacion BJT):\n" +
                         "Datos: V_CC = 15V, R1 = 68k, R2 = 12k, R_C = 3.3k, R_E = 1.2k, beta = 120.\n" +
                         "1) Thevenin base: V_TH = 15 * (12/80) = 2.25 V; R_TH = 68k || 12k = 10.2 kOhm.\n" +
                         "2) Malla entrada: I_B = (V_TH - 0.7) / (R_TH + (beta+1)*R_E) = (2.25 - 0.7) / (10.2k + 121*1.2k) = 1.55 / 155.4k = 9.97 uA.\n" +
                         "3) Corriente colector: I_C = 120 * 9.97 uA = 1.197 mA; I_E = 1.207 mA.\n" +
                         "4) Tension colector-emisor: V_CE = 15 - (1.197m * 3.3k) - (1.207m * 1.2k) = 15 - 3.95 - 1.45 = 9.60 V.\n" +
                         "Conclusion: V_CE = 9.60 V > 0.2 V, se confirma el estado de ZONA ACTIVA directa.";
        formulas = "I_C = beta * I_B | V_TH = V_CC * R2/(R1+R2) | A_v = -Rf/Rin | V_r = I_dc / (f*C)";
        examAdvice = "Comprueba siempre que V_CE > 0.2V. Si te diera un valor negativo o inferior a 0.2V, el transistor estaria en saturacion y la relacion I_C = beta*I_B ya NO seria valida."
    },
    @{
        id = "fel-02"; code = "101"; sub = "Fundamentos de Electronica";
        title = "Coleccion de Examenes Resueltos Parciales y Convocatorias (2020-2024)";
        type = "Examenes Resueltos"; uploader = "InforUMA_Pro";
        subHeading = "Resolucion Detallada de Parciales de Conmutacion, Zener y Amplificadores de Audio";
        sections = @(
            @{ title = "1. Examen Parcial: Regulador con Diodo Zener"; body = "Enunciado: Disenar un regulador con V_Z = 6.2V, P_Zmax = 0.5W y V_in variable entre 12V y 18V, con carga R_L entre 200 y 1000 Ohm.\nResolucion: I_Lmin = 6.2/1k = 6.2mA; I_Lmax = 6.2/200 = 31mA. Corriente maxima Zener: I_Zmax = 0.5/6.2 = 80.6mA. Se selecciona R_s para asegurar I_Z > 5mA con V_in minima: R_s,max = (12 - 6.2)/(5m + 31m) = 161 Ohm. Escogemos valor normalizado R_s = 150 Ohm y verificamos P_Z a 18V: I_s = (18-6.2)/150 = 78.6mA; I_Z = 78.6m - 6.2m = 72.4mA => P_Z = 72.4m * 6.2 = 0.449W < 0.5W. Correcto." },
            @{ title = "2. Convocatoria Final: Comparador Schmitt Trigger Inversor"; body = "Enunciado: Disenar comparador con V_TH = +2V y V_TL = -2V con AmpOp alimentado a +/- 12V (saturacion +/- 10V).\nResolucion: Umbrales simetricos centrados en 0V. V_TH = V_sat * R1/(R1+R2) => 2 = 10 * R1/(R1+R2) => 2*R1 + 2*R2 = 10*R1 => R2 = 4*R1. Tomando R1 = 10 kOhm, resulta R2 = 40 kOhm (o normalizado 39 kOhm). Histéresis total Delta_V = 4V." }
        );
        solvedExercise = "PROBLEMA PARCIAL BJT PEQUENA SENAL:\n" +
                         "Amplificador en emisor comun con R_C = 2.2k, R_L = 10k, I_CQ = 1.5 mA, beta = 150.\n" +
                         "1) Parametros hibridos: r_pi = beta * V_T / I_CQ = 150 * 26mV / 1.5mA = 2.60 kOhm.\n" +
                         "2) Transconductancia: g_m = I_CQ / V_T = 1.5mA / 26mV = 57.69 mA/V.\n" +
                         "3) Resistencia equivalente de carga: R_L_eq = R_C || R_L = 2.2k || 10k = 1.803 kOhm.\n" +
                         "4) Ganancia de tension: A_v = - g_m * R_L_eq = - 57.69m * 1803 = - 104.0 V/V.\n" +
                         "5) Impedancia de entrada: Z_in = R1 || R2 || r_pi.";
        formulas = "g_m = I_CQ / 26mV | r_pi = beta / g_m | A_v = - g_m * (R_C || R_L) | Delta_V = V_TH - V_TL";
        examAdvice = "En el Schmitt Trigger dibuja siempre las lineas horizontales en +/- V_sat y lazo de flechas en sentido horario para la version inversora."
    },
    @{
        id = "fel-03"; code = "101"; sub = "Fundamentos de Electronica";
        title = "Formulario Oficial Ampliado con Resumen de Configuraciones AmpOp y Diodos";
        type = "Formulario"; uploader = "Apolo_Notes";
        subHeading = "Formulas Maestras, Curvas Tipicas y Tablas de Polarizacion Directa e Inversa";
        sections = @(
            @{ title = "1. Ecuaciones Fundamentales de Semiconductores y Diodos"; body = "• Corriente de Shockley: I_D = I_S * [exp(V_D / (n*V_T)) - 1]\n• Tension termica: V_T = k*T / q = 25.86 mV a 300K (27 °C)\n• Resistencia dinamica del diodo: r_d = n * V_T / I_D\n• Rectificador de media onda: V_dc = V_m / pi; V_ef = V_m / 2\n• Rectificador puente completo: V_dc = 2*V_m / pi; Rizado V_r = I_dc / (2*f*C)" },
            @{ title = "2. Compendio de Amplificadores Operacionales (AmpOp)"; body = "• Inversor: V_o = - (Rf/R1)*Vi | Z_in = R1\n• No inversor: V_o = (1 + Rf/R1)*Vi | Z_in = inf\n• Sumador inversor: V_o = - Rf * Suma(Vi / Ri)\n• Diferencial: V_o = (R2/R1)*(V2 - V1) (si R4/R3 = R2/R1)\n• Derivador ideal: V_o = - Rf * C * (dVi/dt)\n• Integrador ideal: V_o = - (1/(R*C)) * Integral(Vi dt)" }
        );
        solvedExercise = "PROCEDIMIENTO RAPIDO DE RESOLUCION DE CIRCUITOS CON AMPOP:\n" +
                         "Paso 1: Identificar realimentacion negativa (salida conectada al terminal inversor).\n" +
                         "Paso 2: Calcular el potencial en el terminal no inversor V+ (mediante divisor si procede).\n" +
                         "Paso 3: Aplicar principio de cortocircuito virtual: V- = V+.\n" +
                         "Paso 4: Plantear ley de corrientes de Kirchhoff (KCL) en el nudo inversor considerando I- = 0.\n" +
                         "Paso 5: Despejar V_out y verificar que no supera los limites de alimentacion +/- V_sat.";
        formulas = "V_TH = V_sat * R1/(R1+R2) | A_v = 1 + Rf/R1 | r_pi = beta*V_T / I_CQ";
        examAdvice = "El 90% de los fallos en parciales se deben a olvidar que el AmpOp satura si el calculo teorico excede las tensiones de las fuentes (+/- 15V)."
    },

    # ---------------- 102: FUNDAMENTOS FISICOS ----------------
    @{
        id = "ffi-01"; code = "102"; sub = "Fundamentos Fisicos de la Informatica";
        title = "Super-Resumen FFI: Teoria Simplificada y Ejercicios Tipo Examen";
        type = "Apuntes Completos"; uploader = "FisicoInformaticaUMA";
        subHeading = "Campos Electrostaticos, Teorema de Gauss, Magnetismo y Ley de Faraday con Calculo Integral";
        sections = @(
            @{ title = "1. Ley de Coulomb y Campo Electrostatico"; body = "Fuerza entre cargas puntuales: F = (1/(4*pi*eps0)) * |q1*q2|/r^2 en la direccion radial. Para distribuciones continuas: E = (1/(4*pi*eps0)) * Integral(dq / r^2 * u_r). El potencial electrostatico se define respecto al infinito: V(r) = - Integral(E . dl), cumpliendose E = - gradiente(V)." },
            @{ title = "2. Aplicacion Rigurosa del Teorema de Gauss"; body = "Flujo electrico: Phi = Integral_cerrada(E . dA) = Q_enc / eps0. Se eligen superficies gaussianas segun la simetria: esfera de radio r para distribuciones esfericas (dA = 4*pi*r^2), cilindro de radio r y longitud L para hilos o cilindros coaxiales (dA_lat = 2*pi*r*L), y caja cilindrica plana para laminas conductoras o dielectricas infinitas." },
            @{ title = "3. Induccion Electromagnetica y Ley de Faraday-Lenz"; body = "La fuerza electromotriz inducida en un circuito cerrado es igual a la variacion temporal del flujo magnetico con signo negativo: fem = - d(Phi_B) / dt. El signo negativo (Ley de Lenz) establece que la corriente inducida genera un campo magnetico que se OPONE a la causa que lo produce." }
        );
        solvedExercise = "PROBLEMA TIPO EXAMEN (Campo en Cilindro Coaxial con Carga Volumetrica):\n" +
                         "Cilindro macizo infinito de radio R con densidad volumetrica rho(r) = b*r. Hallar E(r) para r < R.\n" +
                         "1) Carga encerrada en cilindro gaussiano de radio r y longitud L:\n" +
                         "   Q_enc = Integral_0^r (rho(r') * 2*pi*r'*L dr') = 2*pi*L*b * Integral_0^r (r'^2 dr') = (2/3) * pi * b * L * r^3.\n" +
                         "2) Flujo a traves de la superficie lateral gaussiana: Phi = E(r) * (2*pi*r*L).\n" +
                         "3) Igualando por Teorema de Gauss: E(r) * (2*pi*r*L) = (2/3 * pi * b * L * r^3) / eps0.\n" +
                         "4) Despejando el campo: E(r) = (b * r^2) / (3 * eps0) en direccion radial u_r.\n" +
                         "Comprobacion: Para r = 0, E = 0 por simetria central. Dimensiones correctas en N/C o V/m.";
        formulas = "Phi = Q_enc / eps0 | fem = - dPhi_B / dt | C = eps * S / d | B = mu0 * I / (2*pi*r)";
        examAdvice = "En problemas de induccion justifica por escrito la direccion de la corriente inducida aplicando la Ley de Lenz antes de operar numericamente."
    },
    @{
        id = "ffi-02"; code = "102"; sub = "Fundamentos Fisicos de la Informatica";
        title = "Recopilatorio de Parciales y Finales Resueltos por Temas";
        type = "Examenes Resueltos"; uploader = "Pablo_IngSoftware";
        subHeading = "Banco de Problemas de Convocatorias Oficiales Desarrollados con Graficas y Justificaciones";
        sections = @(
            @{ title = "1. Problema de Examen: Circuito Transitorio RC con Dos Mallas"; body = "Enunciado: Circuito con generador de 24V, R1 = 4 kOhm, R2 = 6 kOhm y condensador C = 10 uF. Se cierra el interruptor en t = 0. Calcular v_C(t) y el tiempo que tarda en alcanzar el 90% de su carga final.\nResolucion: La tension Thevenin vista por el condensador es V_TH = 24 * (6 / 10) = 14.4 V. La resistencia Thevenin es R_TH = 4k || 6k = 2.4 kOhm. Constante de tiempo: tau = R_TH * C = 2.4k * 10uF = 24 ms. Ecuacion transitoria: v_C(t) = 14.4 * (1 - exp(-t / 24ms)). Al 90%: 0.90 * 14.4 = 14.4 * (1 - exp(-t/tau)) => exp(-t/tau) = 0.10 => t = - tau * ln(0.10) = 24ms * 2.3026 = 55.26 ms." },
            @{ title = "2. Problema de Final: Espira en Movimiento dentro de Campo Magnetico"; body = "Enunciado: Espira rectangular de lados a = 10 cm y b = 20 cm, resistencia R = 2 Ohm, penetra a velocidad v = 5 m/s en zona con B = 0.8 T perpendicular saliente.\nResolucion: Flujo magnetico cuando ha entrado una distancia x: Phi(x) = B * a * x. Variacion temporal: dPhi/dt = B * a * (dx/dt) = B * a * v = 0.8 * 0.10 * 5 = 0.40 V. Fem inducida fem = -0.40 V. Corriente inducida: I = |fem|/R = 0.40 / 2 = 0.20 A (sentido horario para oponerse al aumento de flujo saliente). Fuerza magnetica frenadora: F = I * a * B = 0.20 * 0.10 * 0.8 = 0.016 N hacia la izquierda." }
        );
        solvedExercise = "PROBLEMA ASOCIACION MIXTA DE CONDENSADORES:\n" +
                         "Tres condensadores C1 = 6uF, C2 = 3uF en serie, y el conjunto en paralelo con C3 = 4uF, conectados a 100V.\n" +
                         "1) Capacidad serie C12: 1/C12 = 1/6 + 1/3 = 3/6 => C12 = 2 uF.\n" +
                         "2) Capacidad total equivalente: C_eq = C12 + C3 = 2uF + 4uF = 6 uF.\n" +
                         "3) Carga total suministrada: Q_total = C_eq * V = 6uF * 100V = 600 uC.\n" +
                         "4) Tensiones individuales: V3 = 100 V (Q3 = 400 uC); Q1 = Q2 = Q12 = 200 uC.\n" +
                         "5) Tensiones en C1 y C2: V1 = 200uC / 6uF = 33.33 V; V2 = 200uC / 3uF = 66.67 V (Suma = 100V).\n" +
                         "6) Energia electrostatica total almacenada: U = (1/2)*C_eq*V^2 = 0.5 * 6e-6 * 10000 = 0.030 Julios (30 mJ).";
        formulas = "tau = R * C | v(t) = V_f + (V_0 - V_f)*exp(-t/tau) | F = I * (L x B) | U = (1/2)*C*V^2";
        examAdvice = "En asociaciones mixtas no redondees valores intermedios: guarda las fracciones para que la comprobacion de suma de voltajes en mallas sea exacta."
    },
    @{
        id = "ffi-03"; code = "102"; sub = "Fundamentos Fisicos de la Informatica";
        title = "Chuletario Completo de Fisica con Diagramas de Superficies Gaussianas";
        type = "Formulario"; uploader = "Kike_UMA";
        subHeading = "Tablas de Integrales, Constantes Fisicas, Geometrias Gaussianas y Regla de la Mano Derecha";
        sections = @(
            @{ title = "1. Constantes Fisicas Universales y Unidades SI"; body = "• Permitividad del vacio: eps0 = 8.854187817e-12 F/m (o C^2 / (N*m^2))\n• Permeabilidad del vacio: mu0 = 4*pi * 1e-7 T*m/A = 1.2566e-6 H/m\n• Carga elemental: e = 1.60217663e-19 C | Masa electron: m_e = 9.109e-31 kg\n• Velocidad de la luz: c = 1 / sqrt(eps0 * mu0) = 2.99792458e8 m/s" },
            @{ title = "2. Resumen de Campos y Superficies Gaussianas Canónicas"; body = "• Esfera cargada uniforme (r > R): E = Q / (4*pi*eps0*r^2) | V = Q / (4*pi*eps0*r)\n• Esfera cargada uniforme (r < R): E = (Q*r) / (4*pi*eps0*R^3)\n• Hilo infinito rectilineo: E = lambda / (2*pi*eps0*r) | V(r) - V(r0) = -(lambda/(2*pi*eps0))*ln(r/r0)\n• Plano infinito no conductor: E = sigma / (2*eps0) perpendicular al plano\n• Conductor cargado en equilibrio: E_int = 0; E_ext = sigma / eps0" }
        );
        solvedExercise = "RESUMEN PRACTICO DEL PRODUCTO VECTORIAL (REGLA DE LA MANO DERECHA):\n" +
                         "Para calcular la fuerza de Lorentz F = q * (v x B):\n" +
                         "1) Dedo indice en la direccion y sentido del vector velocidad v.\n" +
                         "2) Dedo corazon orientado hacia las lineas de campo magnetico B.\n" +
                         "3) Dedo pulgar extendido senala el sentido de la fuerza F (si la carga q es positiva).\n" +
                         "IMPORTANTE: Si la particula es un electron (q = -e), el vector fuerza resultante es OPUESTO al pulgar.";
        formulas = "B_solenoide = mu0 * n * I | F = q*(E + v x B) | dB = (mu0/4pi)*(I dl x r)/r^3";
        examAdvice = "Antes de entregar comprueba las unidades: la fuerza se mide en Newtons (N), campo electrico en V/m o N/C, campo magnetico en Teslas (T) y potencial en Voltios (V)."
    },

    # ---------------- 103: INTRODUCCION A LA PROGRAMACION ----------------
    @{
        id = "ip-01"; code = "103"; sub = "Introduccion a la Programacion";
        title = "Guia Definitiva de Algoritmia y Codigo C++ Explicado Linea a Linea";
        type = "Apuntes Completos"; uploader = "CodeMaster_Malaga";
        subHeading = "Programacion Estructurada en C++, Punteros, Modulos, Ficheros y Gestion Segura de Memoria";
        sections = @(
            @{ title = "1. Diseno Modular y Paso de Parametros en C++"; body = "En C++ la distincion entre paso por valor (copia local de la variable) y paso por referencia (&) es critica. Para tipos primitivos pequenos (int, double, char) se usa paso por valor si no se requiere modificar el original. Para estructuras compuestas (structs, vectores) se debe usar paso por referencia constante (const Tipo &obj) para evitar sobrecoste de copia en memoria." },
            @{ title = "2. Manejo de Ficheros de Texto y Binarios"; body = "La libreria <fstream> proporciona ifstream (lectura) y ofstream (escritura). Siempre se comprueba la apertura: if (!archivo.is_open()) { cerr << 'Error' << endl; return; }. En ficheros binarios se usa read y write casteando a char*: archivo.write(reinterpret_cast<const char*>(&registro), sizeof(Registro))." }
        );
        solvedExercise = "CODIGO COMPLETO COMENTADO: Gestion de Estudiantes y Ordenacion por Nota\n" +
                         "#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n" +
                         "struct Alumno {\n    string dni;\n    string nombre;\n    double notaFinal;\n};\n\n" +
                         "// Ordenacion por insercion directa (estable y eficiente para N pequeno)\n" +
                         "void ordenarPorNota(vector<Alumno> &lista) {\n" +
                         "    for (size_t i = 1; i < lista.size(); ++i) {\n" +
                         "        Alumno clave = lista[i];\n" +
                         "        int j = i - 1;\n" +
                         "        while (j >= 0 && lista[j].notaFinal < clave.notaFinal) {\n" +
                         "            lista[j + 1] = lista[j];\n" +
                         "            j--;\n" +
                         "        }\n" +
                         "        lista[j + 1] = clave;\n" +
                         "    }\n" +
                         "}";
        formulas = "Busqueda binaria: O(log N) | Insercion: O(N^2) peor caso, O(N) mejor caso | sizeof(struct)";
        examAdvice = "En el examen de laboratorio en ordenador, no olvides llamar a archivo.close() y liberar cualquier memoria asignada para evitar deducciones de puntos."
    },
    @{
        id = "ip-02"; code = "103"; sub = "Introduccion a la Programacion";
        title = "Pack de Practicas de Laboratorio y Examenes en Ordenador Resueltos";
        type = "Practicas & Examenes"; uploader = "Sara_SW_Eng";
        subHeading = "Soluciones Verificadas con Compilador GCC/Clang de Enunciados Oficiales de la ETSI Informática";
        sections = @(
            @{ title = "1. Ejercicio de Examen: Recorrido en Espiral de Matrices"; body = "Enunciado: Dada una matriz cuadrada N x N, implementar una funcion que imprima sus elementos en espiral en el sentido de las agujas del reloj, partiendo de la posicion (0,0) y controlando indices delimitadores filaInicio, filaFin, colInicio y colFin." },
            @{ title = "2. Ejercicio de Examen: Procesamiento y Filtro de Ficheros CSV"; body = "Enunciado: Leer un archivo 'calificaciones.csv' delimitado por comas con lineas vacias eventuales, calcular la media ponderada de 3 parciales por estudiante e imprimir los alumnos con nota >= 5.0 en 'aprobados.txt'." }
        );
        solvedExercise = "ALGORITMO DE BUSQUEDA BINARIA ITERATIVA ROBUSTA:\n" +
                         "int busquedaBinaria(const vector<int> &v, int objetivo) {\n" +
                         "    int inicio = 0;\n" +
                         "    int fin = v.size() - 1;\n" +
                         "    while (inicio <= fin) {\n" +
                         "        int medio = inicio + (fin - inicio) / 2; // Evita desbordamiento de enteros\n" +
                         "        if (v[medio] == objetivo) return medio; // Elemento encontrado\n" +
                         "        if (v[medio] < objetivo) inicio = medio + 1;\n" +
                         "        else fin = medio - 1;\n" +
                         "    }\n" +
                         "    return -1; // No encontrado\n" +
                         "}";
        formulas = "medio = inicio + (fin - inicio)/2 | Complejidad espacial: O(1) | Complejidad temporal: O(log N)";
        examAdvice = "Usa 'inicio + (fin - inicio) / 2' en lugar de '(inicio + fin) / 2' para demostrar rigor en el manejo de desbordamiento de enteros (integer overflow)."
    },
    @{
        id = "ip-03"; code = "103"; sub = "Introduccion a la Programacion";
        title = "Chuleta Sintactica y Algoritmos Canonicos en C++";
        type = "Formulario"; uploader = "DevUMA";
        subHeading = "Plantillas de Lectura Robusta, Manipuladores de Flujo, Algoritmos de Ordenacion y Structs";
        sections = @(
            @{ title = "1. Plantilla de Lectura Segura de Cadenas tras cin >>"; body = "Cuando se combina 'cin >> variable' con 'getline(cin, cadena)', queda un salto de linea '\\n' pendiente en el buffer. La solucion canonica obligatoria en la UMA es:\ncin >> numero;\ncin.ignore(10000, '\\n'); // Limpia el buffer hasta el siguiente salto de linea\ngetline(cin, texto);" },
            @{ title = "2. Sintaxis de Arrays Multidimensionales y Structs"; body = "Declaracion y paso a funciones:\nconst int MAX_F = 100, MAX_C = 100;\nvoid procesar(int m[][MAX_C], int filas, int cols);\nstruct Fecha { int dia, mes, anio; };\nstruct Empleado { string id; double sueldo; Fecha contratacion; };" }
        );
        solvedExercise = "PLANTILLA BASICA COMPLETA PARA EXAMEN DE LABORATORIO:\n" +
                         "#include <iostream>\n#include <vector>\n#include <string>\n#include <fstream>\n#include <iomanip>\nusing namespace std;\n\n" +
                         "int main() {\n" +
                         "    ios_base::sync_with_stdio(false);\n" +
                         "    cin.tie(NULL);\n" +
                         "    cout << fixed << setprecision(2); // Salida formateada con 2 decimales\n" +
                         "    // Codigo del examen...\n" +
                         "    return 0;\n" +
                         "}";
        formulas = "setprecision(n) | fixed | cin.ignore() | ios::in | ios::out | ios::binary";
        examAdvice = "Guarda el archivo cada 5 minutos en el ordenador del examen y compila frequentemente con 'g++ -Wall -Wextra' para atrapar warnings a tiempo."
    },

    # ---------------- 104: MATEMATICA DISCRETA ----------------
    @{
        id = "md-01"; code = "104"; sub = "Matematica Discreta";
        title = "Manual Completo de Logica, Conjuntos, Relaciones y Grafos";
        type = "Apuntes Completos"; uploader = "Euler_Discreto";
        subHeading = "Demostraciones Formales, Teoria de Conjuntos, Relaciones de Equivalencia y Grafos Planos";
        sections = @(
            @{ title = "1. Logica Proposicional y Metodos de Demostracion"; body = "Tablas de verdad y equivalencias logicas. Un argumento es valido si las premisas implican formalmente la conclusion. Metodos de demostracion: directo, por reduccion al absurdo (asumir not Q y llegar a contradiccion con P), y principio de induccion matematica sobre los numeros naturales." },
            @{ title = "2. Relaciones Binarias: Equivalencia y Orden"; body = "Una relacion R en A es de equivalencia si es Reflexiva (aRa), Simetrica (aRb => bRa) y Transitiva (aRb y bRc => aRc). Las clases de equivalencia [a] forman una particion del conjunto A. Es de orden parcial si es Reflexiva, Antisimétrica (aRb y bRa => a=b) y Transitiva, representable mediante diagrama de Hasse." },
            @{ title = "3. Teoria de Grafos y Arboles"; body = "Teorema del apreton de manos: Suma(grado(v)) = 2*|E|. Un grafo es euleriano si y solo si es conexo y todos sus vertices tienen grado par. Formula de Euler para grafos planos conexos: V - E + R = 2. Un arbol con V vertices tiene exactamente V - 1 aristas." }
        );
        solvedExercise = "PROBLEMA RESUELTO DE DEMOSTRACION POR INDUCCION COMPLETA:\n" +
                         "Demostrar que para todo n >= 1: 1 + 2 + 3 + ... + n = n*(n+1)/2.\n" +
                         "1) Caso Base (n = 1): Lado izquierdo = 1. Lado derecho = 1*(1+1)/2 = 2/2 = 1. Se cumple.\n" +
                         "2) Hipotesis de Induccion (P(k)): Suponemos cierto que 1 + 2 + ... + k = k*(k+1)/2.\n" +
                         "3) Tesis de Induccion (P(k+1)): Demostrar que 1 + 2 + ... + k + (k+1) = (k+1)*((k+1)+1)/2 = (k+1)*(k+2)/2.\n" +
                         "4) Demostracion: Suma_(k+1) = [1 + ... + k] + (k+1) = [k*(k+1)/2] + (k+1) = (k+1) * [k/2 + 1] = (k+1) * [(k+2)/2] = (k+1)*(k+2)/2.\n" +
                         "Q.E.D. Por el principio de induccion matematica, la igualdad es valida para todo n in N.";
        formulas = "V - E + R = 2 | Suma(gr(v)) = 2*|E| | C(n, k) = n! / (k! * (n-k)!) | E = V - 1 (arbol)";
        examAdvice = "En induccion define explícitamente el caso base, la hipotesis de induccion y la tesis antes de operar; de lo contrario el profesor restara puntos de formalismo."
    },
    @{
        id = "md-02"; code = "104"; sub = "Matematica Discreta";
        title = "Problemas Resueltos de Combinatoria, Induccion y Recurrencias";
        type = "Problemas Resueltos"; uploader = "Sofia_Math";
        subHeading = "Ecuaciones en Diferencias Finitas Homogeneas y Algoritmos de Prim y Kruskal";
        sections = @(
            @{ title = "1. Resolucion de Relaciones de Recurrencia Lineales"; body = "Ecuacion caracteristica para an = c1*a_{n-1} + c2*a_{n-2}: r^2 - c1*r - c2 = 0. Si las raices r1 y r2 son reales y distintas, la solucion general es an = A*(r1)^n + B*(r2)^n. Si hay una raiz doble r, an = (A + B*n)*(r)^n. Los coeficientes A y B se despejan aplicando las condiciones iniciales." },
            @{ title = "2. Algoritmos de Arbol Recubridor Minimo (MST)"; body = "Algoritmo de Kruskal: ordenar aristas de menor a mayor peso e irlas anadiendo al arbol evitando ciclos. Algoritmo de Prim: crecer un arbol conexo eligiendo en cada paso la arista de menor peso que conecta un vertice dentro del arbol con uno fuera." }
        );
        solvedExercise = "RESOLUCION DE RECURRENCIA PASO A PASO:\n" +
                         "Enunciado: an = 5*a_{n-1} - 6*a_{n-2} con condiciones iniciales a0 = 1, a1 = 4.\n" +
                         "1) Ecuacion caracteristica: r^2 - 5*r + 6 = 0 => (r - 2)*(r - 3) = 0 => Raices r1 = 2, r2 = 3.\n" +
                         "2) Solucion general: an = A * 2^n + B * 3^n.\n" +
                         "3) Aplicar condiciones iniciales:\n" +
                         "   Para n = 0: a0 = A + B = 1 => B = 1 - A.\n" +
                         "   Para n = 1: a1 = 2*A + 3*B = 4 => 2*A + 3*(1 - A) = 4 => 3 - A = 4 => A = -1.\n" +
                         "   Luego B = 1 - (-1) = 2.\n" +
                         "4) Solucion particular final: an = - 2^n + 2 * 3^n = 2 * 3^n - 2^n.";
        formulas = "an = A*r1^n + B*r2^n | P_n = n! | C(n+k-1, k) (combinaciones con repeticion)";
        examAdvice = "Comprueba tu solucion calculando a2 por la formula general y por la recurrencia directa: a2 = 5*4 - 6*1 = 14; por formula a2 = 2*9 - 4 = 14. Coinciden."
    },
    @{
        id = "md-03"; code = "104"; sub = "Matematica Discreta";
        title = "Formulario de Equivalencias Logicas, Algebra de Boole y Grafos";
        type = "Formulario"; uploader = "LogicUMA";
        subHeading = "Chuletario Oficial con Leyes de De Morgan, Propiedades de Operadores y Teoremas de Grafos";
        sections = @(
            @{ title = "1. Leyes de Equivalencia Logica Fundamentales"; body = "• De Morgan: not(p and q) <=> not p or not q | not(p or q) <=> not p and not q\n• Implicacion: p => q <=> not p or q | Contrareciproco: not q => not p\n• Distributivas: p and (q or r) <=> (p and q) or (p and r)\n• Absorcion: p or (p and q) <=> p | p and (p or q) <=> p" },
            @{ title = "2. Propiedades de Grafos y Cotas"; body = "• En un grafo plano simple conexo con V >= 3: E <= 3*V - 6\n• Si el grafo plano es libre de triangulos (sin ciclos C3): E <= 2*V - 4\n• El grafo completo K5 y el bipartito completo K3,3 son no planos (Teorema de Kuratowski)\n• Grado medio de un grafo: d_prom = 2*E / V" }
        );
        solvedExercise = "CRITERIO DE NO PLANARIDAD DE K5:\n" +
                         "K5 tiene V = 5 vertices y E = 5*4/2 = 10 aristas.\n" +
                         "Si K5 fuera plano, deberia cumplir E <= 3*V - 6 => 10 <= 3*5 - 6 = 9 (FALSO: 10 no es <= 9).\n" +
                         "Conclusion demostrada: K5 no es un grafo plano.";
        formulas = "E <= 3*V - 6 | V - E + R = 2 | Suma(gr(v)) = 2*E";
        examAdvice = "Aprende de memoria la equivalencia de la implicacion (p => q <=> not p or q); aparece en practicamente todas las simplificaciones de examen."
    }
)

Write-Host "Generando estructura ampliada con datos técnicos..."
