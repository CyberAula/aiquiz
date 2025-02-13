import Question from '../models/Question.js';
import Student from '../models/Student.js';

import dbConnect from '../utils/dbconnect.js';

import { ABC_Testing_List } from '../constants/abctesting.js';
import modelsJSON from '../../models.json';
import aiquizConfig from '../../aiquiz.config.js';

import path from 'path';
import fs from 'fs';


// console.log("--------------------------------------------------");
// console.log('[modelManager.js] Connecting to database...');
await dbConnect();
// console.log('[modelManager.js] Database connected successfully');
// console.log("--------------------------------------------------");


// Asignar modelo LLM al Alumno
export async function assignAIModel(abcTestingConfig, has_abctesting, studentEmail, subject) {
    try {
        // Leemos los modelos disponibles desde el archivo models.json
        const allModels = await getAvailableModels();
        const modelNames = allModels.map(m => m.name);

        // Verificamos si el alumno existe y si tiene esa asignatura definida en su subjects
        let existingStudent = await Student.findOne({ studentEmail });
        const existingSubjectInStudent = await existingStudent?.subjects?.find(s => s.subjectName === subject);

        // VALIDAR LOS MODELOS DEFINIDOS EN ABC_Testing_List, por si hay alguno invalido porque haya sido eliminado de models.json o  mal configurado
        if (has_abctesting) {
            // Comprobamos si hay algun modelo en el ABC_Testing_List que no esté en models.json
            const invalidModels = abcTestingConfig.models.filter(model => !modelNames.includes(model));
            if (invalidModels.length > 0) {
                console.log("--------------------------------------------------------");
                console.log(`Modelos inválidos en ABCTesting para ${subject}: ${invalidModels.join(", ")}. Asegurese de tener este modelo configurado y con el mismo nombre en el archivo models.json.`)
                console.log("--------------------------------------------------------");
                has_abctesting = false;
            }
        }


        // Buscamos el índice de la asignatura en la lista de asignaturas del alumno y el modelo asignado en caso de existir 
        let subjectIndex = existingStudent.subjects.findIndex(s => s.subjectName === subject);
        let assignedModel = existingStudent.subjects[subjectIndex].subjectModel;

        // Buscamos los prompts definidos en el ABCTesting en caso de haberlos
        let arrayPrompts = abcTestingConfig
            ? Object.keys(abcTestingConfig)
                .filter(key => key.startsWith("prompt"))
                .map(key => abcTestingConfig[key].content)
            : [];

        // Le reasignamos modelo:
        // si el modelo asignado no está en models.json
        // o la asignatura tiene abtesting y el estudiante tiene otro modelo anterior que no está incluido
        // o abctesting es false y el estudiante tiene true porque está en la configuración anterior
        // o abctesting es true, hay varios prompts de estudio, hay varios modelos definidos y el modelo asignado al alumno no es el primero del array
        if (!modelNames.includes(assignedModel) || (has_abctesting && !abcTestingConfig.models.includes(assignedModel)) || (!has_abctesting && existingStudent.subjects[subjectIndex].ABC_Testing) || (arrayPrompts.length > 1 && abcTestingConfig.models.length > 1 && abcTestingConfig.models[0] !== assignedModel)) {
            console.log("--------------------------------------------------------");
            console.log(`Modelo asignado ${assignedModel} no se encuentra en models.json, no está entre los del abtesting / abtesting desactivado / varios prompts de estudio, hay varios modelos definidos y el modelo asignado al alumno no es el primero del array. Reasignando modelo...`);
            console.log("--------------------------------------------------------");
            assignedModel = await getProperModel(modelNames, subject, has_abctesting);
        } else if (!has_abctesting) {
            // Si el modelo ya asignado es válido,
            console.log("--------------------------------------------------------");
            // comprobamos si ha habido algun cambio en la prioridad de asignación de aiquiz.config.js, si keepmodel es false
            if (aiquizConfig.keepmodel === false) {
                console.log("Reasignando modelo, propiedad (keepmodel: ", aiquizConfig.keepmodel, ")");
                assignedModel = await getProperModel(modelNames, subject, false);
            } else {
                console.log("Se mantiene el modelo asignado (keepmodel: ", aiquizConfig.keepmodel, ") :", assignedModel, ". No se tienen en cuenta el resto de propiedades de aiquiz.config.js.");
            }
            console.log("--------------------------------------------------------");
        }
        
        existingStudent.subjects[subjectIndex].subjectModel = assignedModel;
        existingStudent.subjects[subjectIndex].ABC_Testing = has_abctesting;


        await existingStudent.save();
        return assignedModel;

    } catch (error) {
        console.error("Error assigning the model:", error);
        throw new Error('Could not assign the model');
    }

};




const getProperModel = async (modelNames, subject, has_abctesting) => {
    let assignedModel;
    const abcTestingConfig = ABC_Testing_List[subject];
    if (has_abctesting) {
        // Buscamos los prompts definidos en el ABCTesting en caso de haberlos
        let arrayPrompts = abcTestingConfig
            ? Object.keys(abcTestingConfig)
                .filter(key => key.startsWith("prompt"))
                .map(key => abcTestingConfig[key].content)
            : [];

        // ABCTesting activo y mas de un prompt definido: asignar primer modelo del array en caso de haber varios
        if (abcTestingConfig.models.length > 1 && arrayPrompts.length > 1) {
            assignedModel = abcTestingConfig.models[0];
            console.log("---------------------------------------------");
            console.log("¡Varios modelos definidos en el ABCTesting con varios prompts de estudio!");
            console.log("Asignando primer modelo del array:", assignedModel);
            console.log("Eliminar prompts adicionales o asignar un unico modelo al ABCTesting, no se puede hacer un estudio con dos variables diferentes");
            console.log("---------------------------------------------");

        } else {
            // ABCTesting activo y un único prompt definido o ninguno: asignar modelo equitativo entre los definidos 
            // en el array si hay varios o asignar el unico modelo definido si solo hay uno
            assignedModel = await getEquitableModel(abcTestingConfig.models, subject);
            console.log("Asignando modelo equitativo con ABCTesting activo:", assignedModel);
        }

    } else {
        // ABCTesting no activo: asignar modelo teniendo en cuenta la prioridad de asignación de aiquiz.config.js
        if (aiquizConfig.costPriority === true) {
            assignedModel = await getLowerCostModel(subject);
            console.log("Asignando modelo con menor coste:", assignedModel);
        } else if (aiquizConfig.fewerReportedPriority === true) {
            assignedModel = await getFewerReportedModel(subject);
            console.log("Asignando modelo con menos fallos reportados:", assignedModel);
        } else {
            assignedModel = await getEquitableModel(modelNames, subject);
            console.log("Asignando modelo equitativo:", assignedModel);
        }
    }
    return assignedModel;
};

// Obtenemos el modelo más equitativo de una lista de modelos que se pasan como parametro
const getEquitableModel = async (modelNames, subject) => {
    const studentCount = await getStudentCountByModel(subject);
    let selectedModel = modelNames[0];

    for (const model of modelNames) {
        const modelStudentCount = studentCount[model] || 0;
        if (modelStudentCount < (studentCount[selectedModel] || 0)) {
            selectedModel = model;
        }
    }

    return selectedModel;
};

// Obtenemos el modelo con menor coste y en caso de varios modelos
// del mismo coste repartimos los alumnos entre los modelos de manera equitativa
const getLowerCostModel = async (subject) => {
    // Obtener todos los modelos disponibles desde models.json
    const models = modelsJSON.models;

    let lowestTokenPrice = Infinity;
    let lowestCostModels = [];

    // Encontrar los modelos con el menor precio de token
    models.forEach((model) => {
        if (model.tokenPrice < lowestTokenPrice) {
            lowestTokenPrice = model.tokenPrice;
            lowestCostModels = [model.name];
        } else if (model.tokenPrice === lowestTokenPrice) {
            lowestCostModels.push(model.name);
        }
    });

    // Si solo hay un modelo con el menor precio, devolverlo directamente
    if (lowestCostModels.length === 1) {
        return lowestCostModels[0];
    }

    // Si hay varios modelos con el mismo costo, elegir el más equitativo
    return await getEquitableModel(lowestCostModels, subject);
};

// Obtenemos el modelo con menos fallos reportados
const getFewerReportedModel = async (subject) => {
    const models = await getAvailableModels();
    let fewerReportsModel = null;
    let minReports = Infinity;

    for (const model of models) {
        const reports = await Question.countDocuments({
            subject,
            llmModel: model.name,
            studentReport: true
        });
        if (reports < minReports) {
            minReports = reports;
            fewerReportsModel = model.name;
        }
    }
    console.log("Fewer reported model for", subject, "is", fewerReportsModel);

    return fewerReportsModel;
};

// Contar estudiantes por cada modelo distinto asignado a una misma asignatura
const getStudentCountByModel = async (subject) => {
    const counts = {};
    const students = await Student.find({ "subjects.subjectName": subject });

    students.forEach(student => {
        student.subjects.forEach(s => {
            if (s.subjectName === subject) {
                counts[s.subjectModel] = (counts[s.subjectModel] || 0) + 1;
            }
        });
    });
    return counts;
};

// Obtener los modelos disponibles desde models.json
const getAvailableModels = async () => {
    try {
        const modelsPath = path.resolve('models.json');
        const modelsData = fs.readFileSync(modelsPath, 'utf-8');
        const parsedModels = JSON.parse(modelsData);

        return parsedModels.models;
    } catch (error) {
        console.error("Error reading or parsing models.json:", error);
        return [];
    }
};


