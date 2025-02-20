import Question from '../models/Question.js';
import Student from '../models/Student.js';

import dbConnect from '../utils/dbconnect.js';

import { ABC_Testing_List } from '../constants/abctesting.js';
import modelsJSON from '../../models.json';
import aiquizConfig from '../../aiquiz.config.js';

import path from 'path';
import fs from 'fs';
import chalk from 'chalk';


// console.log("--------------------------------------------------");
// console.log('[modelManager.js] Connecting to database...');
await dbConnect();
// console.log('[modelManager.js] Database connected successfully');
// console.log("--------------------------------------------------");


// Asignar modelo LLM al Alumno
export async function assignAIModel(abcTestingConfig, has_abctesting, existingStudent, studentSubjectData, subjectIndex) {
    try {
        // Leemos los modelos disponibles desde el archivo models.json
        const allModels = await getAvailableModels();
        const modelNames = allModels.map(m => m.name);

        // Buscamos el modelo asignado en caso de existir 
        let assignedModel = studentSubjectData.subjectModel;

        // Buscamos los prompts definidos en el ABCTesting en caso de haberlos
        let arrayPrompts = abcTestingConfig
            ? Object.keys(abcTestingConfig)
                .filter(key => key.startsWith("prompt"))
                .map(key => abcTestingConfig[key].content)
            : [];

        // VALIDAR LOS MODELOS DEFINIDOS EN ABC_Testing_List, por si hay alguno invalido porque haya sido eliminado de models.json o  mal configurado
        if (has_abctesting) {
            // Comprobamos si hay algun modelo en el ABC_Testing_List que no esté en models.json
            const invalidModels = abcTestingConfig.models.filter(model => !modelNames.includes(model));
            if (invalidModels.length > 0) {
                console.log(chalk.bgRedBright.black("--------------------------------------------------------"));
                console.log(chalk.bgRedBright.black(`Modelos inválidos en ABCTesting para ${studentSubjectData.subjectName}: ${invalidModels.join(", ")}. Asegurese de tener este modelo configurado y con el mismo nombre en el archivo models.json.`));
                console.log(chalk.bgRedBright.black("--------------------------------------------------------"));
                has_abctesting = false;
            } else if (abcTestingConfig.models.length > 1 && arrayPrompts.length > 1) {
                // ABCTesting activo y mas de un prompt definido: asignar primer modelo del array en caso de haber varios
                console.log(chalk.bgRedBright.black("-------------------------------------------------------------------------------------------------------------------------------"));
                console.log(chalk.bgRedBright.black("¡Varios modelos definidos en el ABCTesting con varios prompts de estudio!"));
                console.log(chalk.bgRedBright.black("Eliminar prompts adicionales o asignar un unico modelo al ABCTesting, no se puede hacer un estudio con dos variables diferentes"));
                console.log(chalk.bgRedBright.black("-------------------------------------------------------------------------------------------------------------------------------"));
            }
        }


        // Reasignar modelo si:
        // 1. El modelo asignado no está en models.json
        // 2. La asignatura tiene ABCTesting y el modelo asignado no está en los modelos de ABCTesting
        // 3. ABCTesting de la asignatura está desactivado y el estudiante tiene ABCTesting activado en la configuración anterior
        // 4. ABCTesting de la asignatura está activado, hay varios prompts de estudio, hay varios modelos definidos y el modelo asignado no es el primero del array
        // 5. ABCTesting de la asignatura está desactivado y keepmodel es false
        const shouldReassignModel = !modelNames.includes(assignedModel) ||
            (has_abctesting && !abcTestingConfig.models.includes(assignedModel)) ||
            (!has_abctesting && existingStudent.subjects[subjectIndex].ABC_Testing) ||
            (arrayPrompts.length > 1 && abcTestingConfig.models.length > 1 && abcTestingConfig.models[0] !== assignedModel) ||
            (!has_abctesting && aiquizConfig.keepmodel === false);

        if (!shouldReassignModel) {
            // Si el modelo ya asignado al alumno es válido, siendo ABCTesting activo o no, y keepmodel es true
            // Se mantiene el modelo asignado
            console.log("-------------------------------------------------");
            console.log("El modelo ya asignado cumple todos los requisitos");
            if (aiquizConfig.keepmodel == true) {
                console.log("(keepmodel: ", aiquizConfig.keepmodel, ") No se tienen en cuenta el resto de prioridades de asignación de aiquiz.config.js");
            }
            console.log("-------------------------------------------------");

            return assignedModel;

        } else {
            // Si el modelo asignado no es válido, reasignar modelo
            console.log(chalk.bgYellow.black("--------------------------------------------------------------------------------------------------------------"));
            if (assignedModel === "Nuevo estudiante") {
                console.log(chalk.bgYellow.black("El estudiante es nuevo en", studentSubjectData.subjectName, "y no tiene modelo asignado, asignando modelo..."));
            }
            else if (!modelNames.includes(assignedModel)) {
                console.log(chalk.bgYellow.black("Modelo asignado", assignedModel, "no se encuentra en models.json, reasignando modelo..."));
            }
            else if (has_abctesting && !abcTestingConfig.models.includes(assignedModel)) {
                console.log(chalk.bgYellow.black("La asignatura tiene ABCTesting y el modelo asignado al alumno", assignedModel, " no está entre los modelos de ABCTesting, reasignando modelo..."));
            }
            else if (!has_abctesting && existingStudent.subjects[subjectIndex].ABC_Testing) {
                console.log(chalk.bgYellow.black("ABCTesting desactivado y el estudiante tiene ABCTesting activado con modelo", assignedModel, "de la configuración anterior, reasignando modelo..."));
            }
            else if (arrayPrompts.length > 1 && abcTestingConfig.models.length > 1 && abcTestingConfig.models[0] !== assignedModel) {
                console.log(chalk.bgYellow.black("ABCTesting de la asignatura está activado, hay varios prompts de estudio, hay varios modelos definidos y el modelo asignado no es el primero del array. Reasignando modelo..."));
            }
            else if (!has_abctesting && aiquizConfig.keepmodel === false) {
                console.log(chalk.bgYellow.black("ABCTesting de la asignatura está desactivado y propiedad (keepmodel: ", aiquizConfig.keepmodel, "), reasignando modelo..."));
            }
            console.log(chalk.bgYellow.black("--------------------------------------------------------------------------------------------------------------"));

            assignedModel = await getProperModel(modelNames, studentSubjectData.subjectName, has_abctesting);

            // Actualizar el modelo y el estado de ABCTesting del estudiante
            existingStudent.subjects[subjectIndex].subjectModel = assignedModel;
            existingStudent.subjects[subjectIndex].ABC_Testing = has_abctesting;

            // Guardar los cambios en el estudiante
            await existingStudent.save();
        }

        return assignedModel;

    } catch (error) {
        console.error("Error assigning the model:", error);
        throw new Error('Could not assign the model');
    }

};




const getProperModel = async (modelNames, subjectName, has_abctesting) => {
    let assignedModel;
    const abcTestingConfig = ABC_Testing_List[subjectName];
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
            console.log(chalk.bgRedBright.black("-------------------------------------------------------------------------------------------------------------------------------"));
            console.log(chalk.bgRedBright.black("¡Varios modelos definidos en el ABCTesting con varios prompts de estudio!"));
            console.log(chalk.bgRedBright.black("Asignando primer modelo del array:", assignedModel));
            console.log(chalk.bgRedBright.black("Eliminar prompts adicionales o asignar un unico modelo al ABCTesting, no se puede hacer un estudio con dos variables diferentes"));
            console.log(chalk.bgRedBright.black("-------------------------------------------------------------------------------------------------------------------------------"));

        } else {
            // ABCTesting activo y un único prompt definido o ninguno: asignar modelo equitativo entre los definidos 
            // en el array si hay varios o asignar el unico modelo definido si solo hay uno
            assignedModel = await getEquitableModel(abcTestingConfig.models, subjectName);
            console.log("Asignando modelo equitativo con ABCTesting activo:", assignedModel);
        }

    } else {
        // ABCTesting no activo: asignar modelo teniendo en cuenta la prioridad de asignación de aiquiz.config.js
        if (aiquizConfig.costPriority === true) {
            assignedModel = await getLowerCostModel(subjectName);
            console.log("Asignando modelo con menor coste:", assignedModel);
        } else if (aiquizConfig.fewerReportedPriority === true) {
            assignedModel = await getFewerReportedModel(subjectName);
            console.log("Asignando modelo con menos fallos reportados:", assignedModel);
        } else {
            assignedModel = await getEquitableModel(modelNames, subjectName);
            console.log("Asignando modelo equitativo:", assignedModel);
        }
    }
    return assignedModel;
};

// Obtenemos el modelo más equitativo de una lista de modelos que se pasan como parametro
const getEquitableModel = async (modelNames, subjectName) => {
    const studentCount = await getStudentCountByModel(subjectName);
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
const getLowerCostModel = async (subjectName) => {
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
    return await getEquitableModel(lowestCostModels, subjectName);
};

// Obtenemos el modelo con menos fallos reportados
const getFewerReportedModel = async (subjectName) => {
    const models = await getAvailableModels();
    let fewerReportsModel = null;
    let minReports = Infinity;

    for (const model of models) {
        const reports = await Question.countDocuments({
            subject: subjectName,
            llmModel: model.name,
            studentReport: true
        });
        if (reports < minReports) {
            minReports = reports;
            fewerReportsModel = model.name;
        }
    }
    console.log("Fewer reported model for", subjectName, "is", fewerReportsModel);

    return fewerReportsModel;
};

// Contar estudiantes por cada modelo distinto asignado a una misma asignatura
const getStudentCountByModel = async (subjectName) => {
    const counts = {};
    const students = await Student.find({ "subjects.subjectName": subjectName });

    students.forEach(student => {
        student.subjects.forEach(s => {
            if (s.subjectName === subjectName) {
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


