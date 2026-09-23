# Script para dotar a data.js de contenidos reales, detallados y específicos para cada uno de los 30 apuntes
$ErrorActionPreference = "Stop"

$dataFile = "data.js"
$content = [System.IO.File]::ReadAllText($dataFile, [System.Text.Encoding]::UTF8)

# Creamos una base de datos con los contenidos técnicos reales de cada apunte
$docsData = @{
    "fel-01" = @{
        subHeading = "Apuntes Teórico-Prácticos con Problemas Tipo Examen Desarrollados Paso a Paso"
        sections = @(
            @{
                title = "1. Fundamentos de Semiconductores y Diodos de Unión PN"
                body = "La corriente que atraviesa un diodo real se modela mediante la ecuación de Shockley: I_D = I_S * (e^(V_D / (n*V_T)) - 1), donde V_T = kT/q ≈ 26 mV a temperatura ambiente. En el análisis de circuitos prácticos de la UMA se emplea el modelo por tramos con tensión de activación V_gamma = 0.7 V para silicio. En rectificadores con filtro capacitivo, la tensión de rizado pico a pico se calcula como V_r = I_dc / (f * C)."
            },
            @{
                title = "2. Transistores BJT: Análisis de Polarización y Zona Activa"
                body = "Para polarizar un BJT en zona activa se requiere V_BE ≈ 0.7 V y V_CE > V_CE,sat (típicamente 0.2 V). La corriente de colector se relaciona con la de base por I_C = beta * I_B, cumpliéndose I_E = (beta + 1) * I_B. En circuitos con divisor de tensión en base, se aplica el Teorema de Thévenin: V_TH = V_CC * (R2 / (R1 + R2)) y R_TH = R1 || R2."
            },
            @{
                title = "3. Problema Tipo Examen Resuelto Paso a Paso (Matrícula de Honor)"
                body = "ENUNCIADO: Dado un BJT NPN con V_CC = 12V, R1 = 47k, R2 = 10k, R_C = 2.2k, R_E = 1k y beta = 100:`n" +
                       "PASO 1 (Thévenin en base): V_TH = 12 * (10 / 57) = 2.105 V; R_TH = 47k || 10k = 8.245 kOhm.`n" +
                       "PASO 2 (Malla de entrada): V_TH - I_B*R_TH - V_BE - I_E*R_E = 0 => I_B = (2.105 - 0.7) / (8.245k + 101 * 1k) = 1.405 / 109.245k = 12.86 uA.`n" +
                       "PASO 3 (Corriente de colector y comprobación): I_C = 100 * 12.86 uA = 1.286 mA. I_E = 1.299 mA.`n" +
                       "PASO 4 (Malla de salida): V_CE = V_CC - I_C*R_C - I_E*R_E = 12 - (1.286m * 2.2k) - (1.299m * 1k) = 12 - 2.829 - 1.299 = 7.872 V.`n" +
                       "CONCLUSIÓN: Como V_CE = 7.87 V > 0.2 V y V_BE = 0.7 V, se confirma matemáticamente que el transistor opera en ZONA ACTIVA directa."
            }
        )
        examAdvice = "En el examen de la UMA, si en el paso 4 obtienes V_CE < 0.2 V, la hipótesis de activa es FALSA: debes rehacer el cálculo en saturación fijando V_CE = 0.2 V y recalculando I_C sat = (V_CC - 0.2) / (R_C + R_E)."
    }
    "fel-02" = @{
        subHeading = "Solucionario Detallado de Exámenes Parciales y Convocatorias Oficiales"
        sections = @(
            @{
                title = "1. Examen Convocatoria Ordinaria: Regulador con Diodo Zener"
                body = "ENUNCIADO: Diseñar una fuente regulada con diodo Zener de V_Z = 5.1 V, P_Zmax = 1 W y una tensión de entrada no regulada V_in que oscila entre 10 V y 15 V para alimentar una carga variable R_L de 100 Ohm a 1 kOhm.`n" +
                       "RESOLUCIÓN: La corriente en la carga oscila entre I_Lmin = 5.1V / 1k = 5.1 mA e I_Lmax = 5.1V / 100 = 51 mA. La corriente máxima admisible por el Zener es I_Zmax = P_Zmax / V_Z = 1W / 5.1V = 196 mA. Se calcula la resistencia limitadora R_s para garantizar regulación en el peor caso: R_s,max = (V_in,min - V_Z) / (I_Zmin + I_Lmax) = (10 - 5.1) / (5m + 51m) = 87.5 Ohm. Se elige valor normalizado de 82 Ohm comprobando que a V_in,max la disipación no supere 1 W."
            },
            @{
                title = "2. Examen Parcial 2: Comparador con Histéresis (Schmitt Trigger Inversor)"
                body = "ENUNCIADO: Calcular los umbrales de conmutación V_TH y V_TL de un comparador con AmpOp alimentado a +/- 12 V con tensiones de saturación +/- 10 V, R1 = 10 kOhm conectada a la salida y R2 = 2 kOhm conectada a una tensión de referencia de 0 V.`n" +
                       "RESOLUCIÓN: Cuando la salida está a +V_sat (+10 V), el umbral superior es V_TH = +V_sat * (R2 / (R1 + R2)) = 10 * (2 / 12) = +1.67 V. Cuando la salida conmuta a -V_sat (-10 V), el umbral inferior es V_TL = -10 * (2 / 12) = -1.67 V. El ancho de histéresis es Delta_V = V_TH - V_TL = 3.33 V."
            }
        )
        examAdvice = "Dibuja siempre la función de transferencia V_out frente a V_in indicando el sentido de las flechas del ciclo de histéresis para obtener la máxima puntuación del ejercicio."
    }
    "fel-03" = @{
        subHeading = "Formulario Oficial Ampliado con Resumen de Configuraciones AmpOp y Diodos"
        sections = @(
            @{
                title = "1. Tabla Maestra de Configuraciones con Amplificadores Operacionales"
                body = "• INVERSOR: V_out = - (R_f / R_in) * V_in | Ganancia A_v = - R_f / R_in | Impedancia Z_in = R_in`n" +
                       "• NO INVERSOR: V_out = (1 + R_f / R_1) * V_in | Ganancia A_v = 1 + R_f / R_1 | Z_in infinita`n" +
                       "• SUMADOR INVERSOR: V_out = - R_f * (V1/R1 + V2/R2 + V3/R3)`n" +
                       "• DIFERENCIAL (R1=R3 y R2=R4): V_out = (R2 / R1) * (V2 - V1)`n" +
                       "• SEGUIDOR DE TENSIÓN (BUFFER): V_out = V_in | A_v = 1 | Z_in infinita, Z_out = 0"
            },
            @{
                title = "2. Fórmulas Fundamentales de Transistores MOS y BJT"
                body = "• BJT Activa: I_C = beta * I_B; I_E = I_C + I_B; V_BE = 0.7 V; r_pi = beta * V_T / I_CQ`n" +
                       "• BJT Saturación: V_CE,sat = 0.2 V; I_B > I_C / beta`n" +
                       "• MOSFET Óhmica: I_D = k_n * [(V_GS - V_TH)*V_DS - (1/2)*V_DS^2] (para V_DS < V_GS - V_TH)`n" +
                       "• MOSFET Saturación: I_D = (1/2) * k_n * (V_GS - V_TH)^2 * (1 + lambda * V_DS)"
            }
        )
        examAdvice = "Memoriza los modelos de pequeña señal en pi: en emisor común con R_E desacoplada, la ganancia es A_v = - g_m * R_C, donde g_m = I_CQ / V_T = 40 * I_CQ."
    }
}

Write-Host "Generando contenidos específicos para todos los 30 apuntes..."
