import { promises as fs } from "fs";
import dbConnect from "../../utils/dbconnect.js";
import Question from "../../models/Question.js";
import { getSpanishComments } from "../../constants/evaluationComments.js";
import { withAuth } from "../../utils/authMiddleware.js";

await dbConnect();


async function getReports(req) {
  try {
    let filters = { studentReport: false };
    let selectFields = {};



    let searchParams = req.nextUrl.searchParams;



    if (searchParams.get('studentReport')) {
      filters.studentReport = searchParams.get('studentReport');
      selectFields = { query: 1, choices: 1, explanation: 1, answer: 1, id: 1, teacherComments: 1, teacherReport: 1 };
    }

    if (searchParams.get('evaluadas')) {
      filters.teacherReport = { $ne: null };
    }

    if (searchParams.get('motivo')) {
      let reason = searchParams.get('motivo');
      const spanishComments = getSpanishComments();
      if (reason == spanishComments[spanishComments.length - 1]) { // Last item is "Otro"
        filters.teacherComments = {
          $exists: true,
          $ne: null,
          $elemMatch: {
            $nin: spanishComments.slice(0, -1) // Exclude "Otro" from the list
          }
        };

      }
      else {
        filters.teacherComments = { $in: reason };
      }
    }


    if (searchParams.get('NOevaluadas')) {
      filters.teacherReport = { $in: [null, undefined] };
    }

    if (searchParams.get('asignatura')) {
      filters.subject = searchParams.get('asignatura')
    }

    if (searchParams.get('dificultad')) {
      filters.difficulty = searchParams.get('dificultad');
    }

    if (searchParams.get('acierto') === "true") {
      filters.$expr = { $eq: ["$studentAnswer", "$answer"] };
    }

    if (searchParams.get('tema')) {
      filters.topic = searchParams.get('tema');
    }

    if (searchParams.get('subtema')) {
      filters.subTopic = searchParams.get('subtema').toLowerCase();
    }


    if (searchParams.get('temporal') === "true") {
      let month = parseInt(searchParams.get('mes'), 10);
      let year = parseInt(searchParams.get('anio'), 10);
      let day = parseInt(searchParams.get('dia'), 10);
      console.log(day)

      if (!isNaN(day)) {
        filters.$expr = {
          $or: [
            {
              $and: [
                { $eq: [{ $year: { $toDate: "$createdAt" } }, year] },
                { $eq: [{ $month: { $toDate: "$createdAt" } }, month] },
                { $eq: [{ $dayOfMonth: { $toDate: "$createdAt" } }, day] }
              ]
            },
            {
              $and: [
                { $eq: [{ $year: { $toDate: "$created_at" } }, year] },
                { $eq: [{ $month: { $toDate: "$created_at" } }, month] },
                { $eq: [{ $dayOfMonth: { $toDate: "$created_at" } }, day] }
              ]
            }
          ]
        };
      } else {
        filters.$expr = {
          $or: [
            {
              $and: [
                { $eq: [{ $year: { $toDate: "$createdAt" } }, year] },
                { $eq: [{ $month: { $toDate: "$createdAt" } }, month] },
              ]
            },
            {
              $and: [
                { $eq: [{ $year: { $toDate: "$created_at" } }, year] },
                { $eq: [{ $month: { $toDate: "$created_at" } }, month] },
              ]
            }
          ]
        };
      }
    };



    if (searchParams.get('fechaInicio') || searchParams.get('fechaFin')) {


      let startDate = searchParams.get('fechaInicio');
      let endDate = searchParams.get('fechaFin');

      if (startDate === "null") startDate = null;
      if (endDate === "null") endDate = null;

      let dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      filters.$or = [
        { createdAt: dateFilter },
        { created_at: dateFilter },
        // { updated_at: dateFilter },
        // { updatedAt: dateFilter }
      ];
    }



    if (searchParams.get('count') === "true") {
      const count = await Question.countDocuments(filters);
      return Response.json({ count });
    }

    // Pagination
    let page = parseInt(searchParams.get('page'), 0);
    let pageSize = parseInt(searchParams.get('pageSize'), 10);
    let skip = 0;
    let limit = 0;
    let total = undefined;
    if (!isNaN(page) && !isNaN(pageSize) && page > 0 && pageSize > 0) {
      skip = (page - 1) * pageSize;
      limit = pageSize;
      total = await Question.countDocuments(filters);
    }

    let query = Question.find(filters, selectFields);
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }
    const questions = await query;
    if (typeof total === 'number') {
      return Response.json({ preguntas: questions, total });
    } else {
      return Response.json({ preguntas: questions });
    }

  } catch (error) {
    return Response.json({ error: "Error al obtener datos" }, { status: 500 });
  }
}

export const GET = withAuth(getReports, { requireProfessor: true });
