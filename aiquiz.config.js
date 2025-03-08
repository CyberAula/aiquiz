/*
    * Give priority to one model or another in case ABCTesting is not active,
    * we can give priority to the lowest cost model or the model with fewer reported failures.
    * 
    * Cost has priority over fewerReported if both are active.
    * 
    * If `keepmodel` is true, the previously assigned model will be kept, even if
    * new priorities (cost or failure reports) are considered.
    * If `keepmodel` is false, the model assignment can change based on the current priorities.
    * 
    * 
    * 
    * urlSurvey: URL to the survey that the student will have to fill out after answering x questions.
    *   studentEmail: student email
    *   subject: subject of the survey
    * 
    * umQuestionsForSurvey: Number of questions that the student must answer to be able to fill out the survey.
    */

const aiquizConfig = {
    costPriority: false,
    fewerReportedPriority: false,
    keepmodel: false,

    urlSurvey: "https://forms.office.com/Pages/ResponsePage.aspx?id=Xaj-aiPDcEK2naT7OSfCVGBhyguLRyZMmcnRYOmI32BUMjlBNTlOWFBRODUxR0MxVTRRRDg0NVgwSC4u&r04d26b54129e4bc0aeb88ae7218f99dc=studentEmail&r207b87f55a3f4e77a053936051f00da2=subject",
    numQuestionsForSurvey: 20,
};

export default aiquizConfig;

