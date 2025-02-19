
import dbConnect from "../utils/dbconnect.js";
import Question from '../models/Question.js';

//const { executionAsyncId } = require('async_hooks');
import fs from 'fs'
import xlsx from 'xlsx'


//import { MongoClient } from 'mongodb'

const uri = 'mongodb://localhost:27017/'; // URI de conexión
const dbName = 'aiquiz'; 
const collectionName = 'questions'; 


// // Carga los datos desde MongoDB
 exports.load = async () => {
    

    // await dbConnect().db(dbName);
    // let datos = await Question;

    // const client = new MongoClient(uri);

    try {
       
        const db = dbConnect().db(dbName);
        const collection = db.collection(collectionName);

        // Obtener datos de la colección
        const data = await collection.find({}).toArray();
        return data; // Devuelve los datos como un array
    } catch (error) {
        console.error('Error al conectar a MongoDB:', error);
        throw error;
    } finally {
        await client.close(); // Cierra la conexión
    }
};


//Listado de preguntas reportadas!!!!!!!!!!!!!!!!!!!1
exports.preguntasreportadas = (metricas) => {
let preguntasreportadas =[];

//encontrar preguntas reportadas y eliminar duplicados
metricas.forEach((fila) =>{
    if (fila.studentReport == true && preguntasreportadas.includes(fila.query)==false){
        preguntasreportadas = [...preguntasreportadas, fila.query]
    }

})
// Escribir las preguntas en un archivo de texto
const fileStream = fs.createWriteStream('PreguntasReportadas.txt');
preguntasreportadas.forEach((pregunta, idx) => {
    fileStream.write(`${idx + 1}. ${pregunta}\n`);
});
fileStream.end();

return preguntasreportadas.length;
}


//Sacar número de preguntas y porcentaje de acierto segun dificultad!!!!!!!!!!!!!!!!!!!!!!
exports.porcentajeaciertopordificultad = (metricas) =>{
let array = [
    {dificultad: "facil", nacierto: 0, npreguntas:0},
    {dificultad: "intermedio", nacierto: 0, npreguntas:0},
    {dificultad: "avanzado", nacierto: 0, npreguntas:0}
    
];

//Datos sin preguntas reportadas
let metricasSINreportadas = metricas.reduce((res, fila) => {
    if(fila.studentReport==false){
        return res = [...res, fila]
    }
    return res
    }, []);





//Sacar numero preguntas y numero acierto
metricasSINreportadas.forEach((fila)=>{
    for (let i = 0; i < array.length; i++) {

        let naciertoanterior = array[i].nacierto
        let npreguntasanterior = array[i].npreguntas

        if (array[i].dificultad === fila.difficulty) {
            if(fila.correctAnswer == true){
                array[i] = { ...array[i], nacierto: naciertoanterior + 1, npreguntas: npreguntasanterior + 1 }; 
            }else{
                array[i] = { ...array[i], npreguntas: npreguntasanterior+1};
            }

          break; // Salimos del bucle después de encontrar y actualizar el objeto
        }
      }
})
      console.log(array);

// Escribir las preguntas en un archivo de texto
const fileStream = fs.createWriteStream('DificultadFrecuenciayAcierto.txt');
array.forEach((objeto, idx) => {
    fileStream.write(`${idx + 1}. dificultad: ${objeto.dificultad}, número preguntas: ${objeto.npreguntas}, porcentaje acierto: ${objeto.nacierto / objeto.npreguntas * 100}} \n`);
});
fileStream.end();

}

//Preguntas mas frecuentes y su porcentaje de acierto!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.pregMasFrecuentesYPorcentajeAcierto = (metricas) =>{

//Datos sin preguntas reportadas
let metricasSINreportadas = metricas.reduce((res, fila) => {
    if(fila.studentReport==false){
        return res = [...res, fila]
    }
    return res
    }, []);

    let preguntas_numeroaciertos = {};

    // Recorremos cada fila para calcular aciertos y apariciones de cada pregunta
    metricasSINreportadas.forEach(row => {
        const query = row.query;
        const correctAnswer = row.correctAnswer;
    
        if (preguntas_numeroaciertos[query]) {
            if (correctAnswer) {
                preguntas_numeroaciertos[query][0] += 1;
            }
            preguntas_numeroaciertos[query][1] += 1;
        } else {
            if (correctAnswer) {
                preguntas_numeroaciertos[query] = [1,1];
            }else{
                preguntas_numeroaciertos[query] = [0,1];
            }
        }
    });
    
    // Filtramos las preguntas más repetidas (respondidas 15 veces o más) y calculamos el porcentaje de aciertos
    let preguntas_mas_repetidas = {};
    for (let pregunta in preguntas_numeroaciertos) {
        const [numAciertos, numTotal] = preguntas_numeroaciertos[pregunta];
        if (numTotal >= 15) {
            preguntas_mas_repetidas[pregunta] = (numAciertos / numTotal) * 100;
        }
    }
    console.log(preguntas_mas_repetidas)


    // Escribir las preguntas en un archivo de texto
    const fileStream = fs.createWriteStream('PreguntasMasFrecuentesyPorcentajeAcierto.txt');
    
    fileStream.write( JSON.stringify(preguntas_mas_repetidas));
    
    fileStream.end();


}

//Temas genericos frecuencia y porcentaje de acierto!!!!!!!!!!!!!!!!
exports.temasFrecuenciaYPorcentajedeAcierto = (metricas) =>{

//Datos sin preguntas reportadas
let metricasSINreportadas = metricas.reduce((res, fila) => {
    if(fila.studentReport==false){
        return res = [...res, fila]
    }
    return res
    }, []);

metricasSINreportadas.forEach((fila) => {
    if(fila.language == "JSON y esquema JSON"){
        fila.language = "JSON y JSON Schema";
    }else if (fila.language == 'Marco de agregación de MongoDB'){
        fila.language = 'MongoDB Aggregation Framework';
    }else if (fila.language == 'javascript_cliente'){
        fila.language = 'JavaScript Cliente';
    }else if (fila.language =='javascript'){
        fila.language =  'Lenguaje JavaScript';
    }
})

metricasSINreportadas.forEach((fila) =>{
    let tema = fila.language;
    fila.language = tema.toUpperCase();
})


let temas_numeroaciertos = {};

// Recorremos cada fila para calcular aciertos y apariciones de cada pregunta
metricasSINreportadas.forEach((fila)=> {
    const tema = fila.language;

    if (temas_numeroaciertos[tema]) {
        if (fila.correctAnswer) {
            temas_numeroaciertos[tema][0] += 1;
        }
        temas_numeroaciertos[tema][1] += 1;
    } else {
        if (fila.correctAnswer) {
            temas_numeroaciertos[tema] = [1,1];
        }else{
            temas_numeroaciertos[tema] = [0,1];
        }
    }
});

let arrayfinal = [];

for (let tema in temas_numeroaciertos) {
    arrayfinal.push({tema: tema, npreguntas: temas_numeroaciertos[tema][1], porcentajeacierto: temas_numeroaciertos[tema][0]/temas_numeroaciertos[tema][1]*100 }) 

}
console.log(arrayfinal)

// Escribir las preguntas en un archivo de texto
const fileStream = fs.createWriteStream('TemasFrecuenciayAcierto.txt');
arrayfinal.forEach((objeto, idx) => {
    fileStream.write(`${idx + 1}. tema: ${objeto.tema}, número preguntas: ${objeto.npreguntas}, porcentaje acierto: ${objeto.porcentajeacierto}} \n`);
});
fileStream.end();
}

//Temas frecuencia y porcentaje de acierto GIB !!!!
exports.temasGIB = (metricas)=>{
    
//Datos sin preguntas reportadas
let metricasSINreportadas = metricas.reduce((res, fila) => {
    if(fila.studentReport==false){
        return res = [...res, fila]
    }
    return res
    }, []);

metricasSINreportadas.forEach((fila) => {
    if(fila.language == "JSON y esquema JSON"){
        fila.language = "JSON y JSON Schema";
    }else if (fila.language == 'Marco de agregación de MongoDB'){
        fila.language = 'MongoDB Aggregation Framework';
    }else if (fila.language == 'javascript_cliente'){
        fila.language = 'JavaScript Cliente';
    }else if (fila.language =='javascript'){
        fila.language =  'Lenguaje JavaScript';
    }
})

metricasSINreportadas.forEach((fila) =>{
    let tema = fila.language;
    fila.language = tema.toUpperCase();
})

let metricasGIB = metricasSINreportadas.reduce((res, fila) => {
    if(fila.Degree=="GIB"){
        return res = [...res, fila]
    }
    return res
    }, []);



let temas_numeroaciertos = {};

// Recorremos cada fila para calcular aciertos y apariciones de cada pregunta
metricasGIB.forEach((fila)=> {
    const tema = fila.language;

    if (temas_numeroaciertos[tema]) {
        if (fila.correctAnswer) {
            temas_numeroaciertos[tema][0] += 1;
        }
        temas_numeroaciertos[tema][1] += 1;
    } else {
        if (fila.correctAnswer) {
            temas_numeroaciertos[tema] = [1,1];
        }else{
            temas_numeroaciertos[tema] = [0,1];
        }
    }
});

let arrayfinal = [];

for (let tema in temas_numeroaciertos) {
    arrayfinal.push({tema: tema, npreguntas: temas_numeroaciertos[tema][1], porcentajeacierto: temas_numeroaciertos[tema][0]/temas_numeroaciertos[tema][1]*100 }) 

}
console.log(arrayfinal)

// Escribir las preguntas en un archivo de texto
const fileStream = fs.createWriteStream('TemasGIB.txt');
arrayfinal.forEach((objeto, idx) => {
    fileStream.write(`${idx + 1}. tema: ${objeto.tema}, número preguntas: ${objeto.npreguntas}, porcentaje acierto: ${objeto.porcentajeacierto}} \n`);
});
fileStream.end();
}


//Temas frecuencia y porcentaje de acierto GITST !!!!
exports.temasGITST = (metricas)=>{
    
    //Datos sin preguntas reportadas
    let metricasSINreportadas = metricas.reduce((res, fila) => {
        if(fila.studentReport==false){
            return res = [...res, fila]
        }
        return res
        }, []);
    
    metricasSINreportadas.forEach((fila) => {
        if(fila.language == "JSON y esquema JSON"){
            fila.language = "JSON y JSON Schema";
        }else if (fila.language == 'Marco de agregación de MongoDB'){
            fila.language = 'MongoDB Aggregation Framework';
        }else if (fila.language == 'javascript_cliente'){
            fila.language = 'JavaScript Cliente';
        }else if (fila.language =='javascript'){
            fila.language =  'Lenguaje JavaScript';
        }
    })
    
    metricasSINreportadas.forEach((fila) =>{
        let tema = fila.language;
        fila.language = tema.toUpperCase();
    })
    
    let metricasGITST = metricasSINreportadas.reduce((res, fila) => {
        if(fila.Degree=="GITST"){
            return res = [...res, fila]
        }
        return res
        }, []);
    
    
    
    let temas_numeroaciertos = {};
    
    // Recorremos cada fila para calcular aciertos y apariciones de cada pregunta
    metricasGITST.forEach((fila)=> {
        const tema = fila.language;
    
        if (temas_numeroaciertos[tema]) {
            if (fila.correctAnswer) {
                temas_numeroaciertos[tema][0] += 1;
            }
            temas_numeroaciertos[tema][1] += 1;
        } else {
            if (fila.correctAnswer) {
                temas_numeroaciertos[tema] = [1,1];
            }else{
                temas_numeroaciertos[tema] = [0,1];
            }
        }
    });
    
    let arrayfinal = [];
    
    for (let tema in temas_numeroaciertos) {
        arrayfinal.push({tema: tema, npreguntas: temas_numeroaciertos[tema][1], porcentajeacierto: temas_numeroaciertos[tema][0]/temas_numeroaciertos[tema][1]*100 }) 
    
    }
    console.log(arrayfinal)
    
    // Escribir las preguntas en un archivo de texto
    const fileStream = fs.createWriteStream('TemasGITST.txt');
    arrayfinal.forEach((objeto, idx) => {
        fileStream.write(`${idx + 1}. tema: ${objeto.tema}, número preguntas: ${objeto.npreguntas}, porcentaje acierto: ${objeto.porcentajeacierto}} \n`);
    });
    fileStream.end();
}


//Numero de respuestas a lo largo de los meses
exports.temporal = (metricas)=>{
//Datos sin preguntas reportadas
let metricasSINreportadas = metricas.reduce((res, fila) => {
    if(fila.studentReport==false){
        return res = [...res, fila]
    }
    return res
    }, []);


// Función para calcular el mes a partir del número serializado de Excel
function getMonthFromSerial(serial) {
    const excelEpoch = new Date(1900, 0, 1); //Excel empieza a contar desde 1 de enero de 1900
    const days = serial - 2; // Ajustar desfase de Excel
    const fecha = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);
    return fecha.getMonth() + 1; // Mes (1-12)
}



// Obtener los meses de las fechas
let meses = metricasSINreportadas.map((fila) => {
 return getMonthFromSerial(fila.created_at);
}); 


// Cambiar número de meses por el nombre del mes
let nombreMeses = meses.map(mes => {
    switch (mes) {
        case 3: return 'Marzo';
        case 4: return 'Abril';
        case 5: return 'Mayo';
        case 6: return 'Junio';
        case 7: return 'Julio';
    }
});

// Contar el número de preguntas por mes
const mesesNumeropreguntas = {};
nombreMeses.forEach((mes) => {
    if (mesesNumeropreguntas[mes]) {
        mesesNumeropreguntas[mes]++;
    } else {
        mesesNumeropreguntas[mes] = 1;
    }
});

console.log(mesesNumeropreguntas)


// Escribir en un archivo de texto
const fileStream = fs.createWriteStream('NumeroRespuestasPorMeses.txt');
    
fileStream.write( JSON.stringify(mesesNumeropreguntas));

fileStream.end();

}